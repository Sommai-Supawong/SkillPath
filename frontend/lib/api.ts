import { auth } from '@/lib/firebase/client';

const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
const API_URL = configuredApiUrl ? `${configuredApiUrl.replace(/\/+$/, "")}/api` : "";

export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  try {
    if (!API_URL) throw new ApiError("SkillPath API URL is not configured.", 0);
    const request = async (forceRefresh: boolean) => {
      const headers = new Headers(options?.headers);
      if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
      if (typeof window !== "undefined" && auth.currentUser) {
        headers.set("Authorization", `Bearer ${await auth.currentUser.getIdToken(forceRefresh)}`);
      }
      return fetch(`${API_URL}/${path.replace(/^\/+/, "")}`, { ...options, headers, cache: "no-store" });
    };

    let response = await request(false);
    // Retry a rejected cached ID token once with a freshly issued token.
    if (response.status === 401 && typeof window !== "undefined" && auth.currentUser) {
      response = await request(true);
    }
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      const detail = typeof body.detail === "string" ? body.detail : "The request could not be completed.";
      throw new ApiError(detail, response.status);
    }
    if (response.status === 204) return undefined as T;
    return response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof Error && "code" in error && String(error.code).startsWith("auth/")) {
      throw new ApiError("Your sign-in has expired. Please sign in again.", 401);
    }
    throw new ApiError("Unable to reach the SkillPath API. Check that the backend is running.", 0);
  }
}

export const storeSession = (profileId: number, careerId: number) => {
  localStorage.removeItem("skillpath_roadmap_id");
  sessionStorage.removeItem("skillpath_recent_progress");
  localStorage.setItem("skillpath_profile_id", String(profileId));
  localStorage.setItem("skillpath_career_id", String(careerId));
};

export const getSession = () => ({
  profileId: Number(localStorage.getItem("skillpath_profile_id")) || 0,
  careerId: Number(localStorage.getItem("skillpath_career_id")) || 0,
  roadmapId: Number(localStorage.getItem("skillpath_roadmap_id")) || 0,
});
