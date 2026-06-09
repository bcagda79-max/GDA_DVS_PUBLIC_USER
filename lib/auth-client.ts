export async function getCurrentUser() {
  try {
    const response = await fetch("/api/auth/me");
    if (!response.ok) return null;
    const json = await response.json();
    return json?.user ?? null;
  } catch {
    return null;
  }
}
