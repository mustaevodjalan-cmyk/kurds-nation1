import type { Strings } from "@/lib/i18n";

export function FeatureList({ features }: { features: Strings["features"] }) {
  return (
    <ul className="grid overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-white/10 rtl:lg:divide-x-reverse">
      {features.map(([heading, body]) => (
        <li
          key={heading}
          className="border-white/10 p-6 [&:not(:first-child)]:border-t sm:[&:nth-child(2)]:border-t-0 lg:[&:not(:first-child)]:border-t-0"
        >
          <h2 className="text-lg font-semibold">{heading}</h2>
          <p className="mt-1 text-sm text-slate-400">{body}</p>
        </li>
      ))}
    </ul>
  );
}
