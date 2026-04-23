export const ADMIN_COOKIE_NAME = "admin_session";
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

const MESSAGE = "admin-session";

export async function createAdminToken(secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(MESSAGE));
  return Array.from(new Uint8Array(sig), (b) =>
    b.toString(16).padStart(2, "0")
  ).join("");
}

export async function verifyAdminToken(
  token: string,
  secret: string
): Promise<boolean> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  try {
    const matches = token.match(/.{2}/g);
    if (!matches || matches.length !== 32) return false;
    const sigBuffer = new Uint8Array(matches.map((h) => parseInt(h, 16)));
    return await crypto.subtle.verify(
      "HMAC",
      key,
      sigBuffer,
      enc.encode(MESSAGE)
    );
  } catch {
    return false;
  }
}
