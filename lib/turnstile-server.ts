import "server-only";

/** true — перевірку пройдено (або Turnstile не налаштовано). */
export async function verifyTurnstile(token: string | undefined, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, response: token, ...(ip !== "local" && { remoteip: ip }) }),
    });
    const data = (await res.json()) as { success: boolean; hostname?: string; "error-codes"?: string[] };
    if (!data.success) console.warn("[turnstile] failed", data["error-codes"]);
    return data.success;
  } catch (e) {
    // Збій на боці Cloudflare не повинен блокувати людей — пропускаємо, логуємо.
    console.error("[turnstile] siteverify unavailable", e);
    return true;
  }
}
