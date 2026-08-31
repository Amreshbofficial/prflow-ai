const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  // Demo token setup (in a real app, this comes from localStorage/context)
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
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
};

export const outreachApi = {
  generate: (data: any) => fetchAPI("/outreach/generate", { method: "POST", body: JSON.stringify(data) }),
};

export const researchApi = {
  generate: (leadId: string | number) => fetchAPI(`/leads/${leadId}/research`, { method: "POST" }),
};
