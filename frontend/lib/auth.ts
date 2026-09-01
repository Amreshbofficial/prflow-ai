import { queryClient } from "@/components/providers";

export const setToken = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
    // Also set a cookie so Next.js middleware can read it
    document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax`;
  }
};

export const getToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

export const clearToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    document.cookie = "token=; path=/; max-age=0";
    // Clear all React Query cached data so the next user sees fresh data
    queryClient.clear();
  }
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};
