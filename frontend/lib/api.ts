const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...options?.headers },
      cache: "no-store",
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      const detail = typeof body.detail === "string" ? body.detail : "The request could not be completed.";
      throw new ApiError(detail, response.status);
    }
    return response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Unable to reach the SkillPath API. Check that the backend is running.", 0);
  }
}

export const storeSession = (profileId: number, careerId: number) => {
  localStorage.setItem("skillpath_profile_id", String(profileId));
  localStorage.setItem("skillpath_career_id", String(careerId));
};

export const getSession = () => ({
  profileId: Number(localStorage.getItem("skillpath_profile_id")) || 0,
  careerId: Number(localStorage.getItem("skillpath_career_id")) || 0,
  roadmapId: Number(localStorage.getItem("skillpath_roadmap_id")) || 0,
});
