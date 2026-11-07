/*
# $ROJ balance, passport rank, and daily lore quiz

1. Citizens
- `balance_roj` (integer, default 100): community token balance; every new citizen starts with 100.
- `rank` (text): 'novice' or 'history_keeper'.
- `last_quiz_on` (date): the last day the citizen answered the daily quiz.
- These columns are NOT granted to anon or authenticated. Clients read them only via citizen_dashboard and change them only via answer_daily_quiz, both keyed by the secret owner token.

2. Quiz
- `quiz_questions` holds the questions and the correct option index. No client role can read it directly.
- Today's question is chosen deterministically from the calendar date, so every citizen gets the same question on a given day.

3. Functions (SECURITY DEFINER, gated by owner token)
- citizen_dashboard(p_owner_token): returns balance, rank, and today's question without the answer.
- answer_daily_quiz(p_owner_token, p_question_id, p_choice): one answer per citizen per day. A correct answer adds 10 $ROJ and sets rank to history_keeper.
*/

ALTER TABLE public.citizens
  ADD COLUMN IF NOT EXISTS balance_roj integer NOT NULL DEFAULT 100 CHECK (balance_roj >= 0),
  ADD COLUMN IF NOT EXISTS rank text NOT NULL DEFAULT 'novice' CHECK (rank IN ('novice', 'history_keeper')),
  ADD COLUMN IF NOT EXISTS last_quiz_on date;

CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id integer PRIMARY KEY,
  prompt text NOT NULL,
  options text[] NOT NULL CHECK (array_length(options, 1) = 3),
  correct_index smallint NOT NULL CHECK (correct_index BETWEEN 0 AND 2)
);

ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.quiz_questions FROM anon, authenticated;

INSERT INTO public.quiz_questions (id, prompt, options, correct_index) VALUES
  (1, 'В каком веке жил знаменитый курдский поэт и философ Ахмед Хани?', ARRAY['В 15 веке', 'В 17 веке', 'В 19 веке'], 1),
  (2, 'Какой курдский полководец отвоевал Иерусалим в 1187 году?', ARRAY['Салах ад-Дин Аюбид', 'Мехмед II', 'Надир-шах'], 0),
  (3, 'Как называется весенний праздник обновления, который курды отмечают 21 марта?', ARRAY['Ид аль-Адха', 'Ньоруз', 'Сиро'], 1)
ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.todays_quiz_id()
RETURNS integer
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT id FROM public.quiz_questions
  ORDER BY id
  OFFSET (current_date - date '2026-01-01') % (SELECT count(*) FROM public.quiz_questions)
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.citizen_dashboard(p_owner_token uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  c public.citizens%ROWTYPE;
  q public.quiz_questions%ROWTYPE;
BEGIN
  SELECT * INTO c FROM public.citizens WHERE owner_token = p_owner_token;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  SELECT * INTO q FROM public.quiz_questions WHERE id = public.todays_quiz_id();
  RETURN jsonb_build_object(
    'balance', c.balance_roj,
    'rank', c.rank,
    'answeredToday', c.last_quiz_on = current_date,
    'question', jsonb_build_object('id', q.id, 'prompt', q.prompt, 'options', to_jsonb(q.options))
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.answer_daily_quiz(p_owner_token uuid, p_question_id integer, p_choice smallint)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  c public.citizens%ROWTYPE;
  q public.quiz_questions%ROWTYPE;
  is_correct boolean;
BEGIN
  SELECT * INTO c FROM public.citizens WHERE owner_token = p_owner_token FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'citizen not found';
  END IF;
  IF c.last_quiz_on = current_date THEN
    RAISE EXCEPTION 'quiz already answered today';
  END IF;
  IF p_question_id IS DISTINCT FROM public.todays_quiz_id() THEN
    RAISE EXCEPTION 'question is not today''s quiz';
  END IF;
  SELECT * INTO q FROM public.quiz_questions WHERE id = p_question_id;
  is_correct := p_choice = q.correct_index;
  UPDATE public.citizens
  SET last_quiz_on = current_date,
      balance_roj = balance_roj + CASE WHEN is_correct THEN 10 ELSE 0 END,
      rank = CASE WHEN is_correct THEN 'history_keeper' ELSE rank END
  WHERE id = c.id
  RETURNING * INTO c;
  RETURN jsonb_build_object(
    'correct', is_correct,
    'correctIndex', q.correct_index,
    'balance', c.balance_roj,
    'rank', c.rank
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.todays_quiz_id() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.citizen_dashboard(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.answer_daily_quiz(uuid, integer, smallint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.citizen_dashboard(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.answer_daily_quiz(uuid, integer, smallint) TO anon, authenticated;
