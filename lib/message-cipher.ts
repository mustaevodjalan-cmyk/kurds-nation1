const LOBBY_PASSPHRASE = "nn-lobby-v1";
const LOBBY_SALT = "nn-network-nation";
const KEY_ITERATIONS = 150_000;

let lobbyKeyPromise: Promise<CryptoKey> | null = null;

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/* Shared lobby key: the database only ever holds ciphertext, but every app build carries this passphrase. */
function lobbyKey(): Promise<CryptoKey> {
  if (!lobbyKeyPromise) {
    lobbyKeyPromise = (async () => {
      const encoder = new TextEncoder();
      const material = await crypto.subtle.importKey("raw", encoder.encode(LOBBY_PASSPHRASE), "PBKDF2", false, [
        "deriveKey",
      ]);
      return crypto.subtle.deriveKey(
        { name: "PBKDF2", salt: encoder.encode(LOBBY_SALT), iterations: KEY_ITERATIONS, hash: "SHA-256" },
        material,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"],
      );
    })();
  }
  return lobbyKeyPromise;
}

export async function sealLobbyText(plaintext: string): Promise<{ cipher: string; iv: string }> {
  const key = await lobbyKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(plaintext),
  );
  return { cipher: toBase64(new Uint8Array(encrypted)), iv: toBase64(iv) };
}

export async function openLobbyText(cipher: string, iv: string): Promise<string | null> {
  try {
    const key = await lobbyKey();
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: fromBase64(iv) },
      key,
      fromBase64(cipher),
    );
    return new TextDecoder().decode(decrypted);
  } catch {
    return null;
  }
}
