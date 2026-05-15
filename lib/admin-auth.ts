export async function hashAdminPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password + "cargaya_admin_v1");
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function getExpectedToken(): Promise<string> {
  return hashAdminPassword(process.env.ADMIN_PASSWORD ?? "");
}
