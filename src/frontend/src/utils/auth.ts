export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export interface AuthState {
  userId: string;
  role: string;
}

export function getAuthState(): AuthState | null {
  try {
    const raw = localStorage.getItem("auth");
    if (!raw) return null;
    return JSON.parse(raw) as AuthState;
  } catch {
    return null;
  }
}

export function setAuthState(state: AuthState): void {
  localStorage.setItem("auth", JSON.stringify(state));
}

export function clearAuthState(): void {
  localStorage.removeItem("auth");
}

export function isAdmin(): boolean {
  const auth = getAuthState();
  return auth?.role === "admin";
}
