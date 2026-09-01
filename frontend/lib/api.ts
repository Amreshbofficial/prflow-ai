import { getToken, clearToken } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  
  const headers: any = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  if (options.body instanceof FormData) {
    delete headers["Content-Type"];
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearToken();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    
    let errorMsg = "An error occurred";
    try {
      const errorData = await response.json();
      errorMsg = errorData.detail || errorMsg;
    } catch (e) {
      // Ignored
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const leadsApi = {
  getLeads: () => fetchAPI("/leads"),
  getLead: (id: string | number) => fetchAPI(`/leads/${id}`),
  createLead: (data: any) => fetchAPI("/leads", { method: "POST", body: JSON.stringify(data) }),
  updateLead: (id: string | number, data: any) => fetchAPI(`/leads/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string | number) => fetchAPI(`/leads/${id}`, { method: "DELETE" }),
  importLeads: (formData: FormData) => fetchAPI("/leads/import", {
    method: "POST",
    body: formData,
    headers: {},
  }),
};

export const outreachApi = {
  getOutreachMessages: () => fetchAPI("/outreach"),
  getOutreach: (id: string | number) => fetchAPI(`/outreach/${id}`),
  generate: (data: any) => fetchAPI("/outreach/generate", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string | number, data: any) => fetchAPI(`/outreach/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  send: (id: string | number) => fetchAPI(`/outreach/${id}/send`, { method: "POST" }),
};

export const researchApi = {
  generate: (leadId: string | number) => fetchAPI(`/leads/${leadId}/research`, { method: "POST" }),
};

export const analyticsApi = {
  getDashboardStats: () => fetchAPI("/analytics/dashboard"),
};

export const followupsApi = {
  getFollowups: () => fetchAPI("/followups"),
  create: (data: any) => fetchAPI("/followups", { method: "POST", body: JSON.stringify(data) }),
  complete: (id: string | number) => fetchAPI(`/followups/${id}/complete`, { method: "PATCH" }),
  snooze: (id: string | number, newDueAt: string) => fetchAPI(`/followups/${id}/snooze`, { method: "PATCH", body: JSON.stringify({ new_due_at: newDueAt }) }),
  delete: (id: string | number) => fetchAPI(`/followups/${id}`, { method: "DELETE" }),
};

export const usersApi = {
  getProfile: () => fetchAPI("/users/me"),
  updateProfile: (data: any) => fetchAPI("/users/me", { method: "PATCH", body: JSON.stringify(data) }),
  changePassword: (data: { current_password: string; new_password: string }) => fetchAPI("/users/me/change-password", { method: "POST", body: JSON.stringify(data) }),
};

export const authApi = {
  login: (data: any) => fetchAPI("/auth/login", { 
    method: "POST", 
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(data).toString(),
  }),
  register: (data: { name: string; email: string; password: string }) => fetchAPI("/auth/register", { 
    method: "POST", 
    body: JSON.stringify(data),
  }),
};
