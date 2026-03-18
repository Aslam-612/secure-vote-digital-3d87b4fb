const BASE_URL = "http://localhost:8080/api";

const apiCall = async (
  endpoint: string,
  method: string = "GET",
  body: any = null,
  token: string | null = null
) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    const cleanToken = token.replace("Bearer ", "").trim();
    headers["Authorization"] = `Bearer ${cleanToken}`;
  }

  const config: RequestInit = { method, headers };
  if (body) config.body = JSON.stringify(body);

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    if (!response.ok) {
      console.error(`API Error ${response.status} for ${endpoint}`);
    }
    return response.json();
  } catch (error) {
    console.error(`Network error for ${endpoint}:`, error);
    throw error;
  }
};

// AUTH
export const sendOtp = (aadhar: string) =>
  apiCall("/auth/send-otp", "POST", { aadhar });
export const verifyOtp = (aadhar: string, otp: string) =>
  apiCall("/auth/verify-otp", "POST", { aadhar, otp });

// VOTING
export const getElections = () =>
  apiCall("/voting/elections");
export const getCandidates = (electionId: number) =>
  apiCall(`/voting/elections/${electionId}/candidates`);
export const castVote = (electionId: number, candidateId: number, token: string) =>
  apiCall("/voting/cast", "POST", { electionId, candidateId }, token);

// ADMIN
export const adminLogin = (username: string, password: string) =>
  apiCall("/admin/login", "POST", { username, password });
export const getDashboard = (token: string) =>
  apiCall("/admin/dashboard", "GET", null, token);
export const getVoters = (token: string) =>
  apiCall("/admin/voters", "GET", null, token);
export const addVoter = (voter: any, token: string) =>
  apiCall("/admin/voters", "POST", voter, token);
export const deleteVoter = (id: number, token: string) =>
  apiCall(`/admin/voters/${id}`, "DELETE", null, token);
export const getAdminElections = (token: string) =>
  apiCall("/admin/elections", "GET", null, token);
export const addElection = (election: any, token: string) =>
  apiCall("/admin/elections", "POST", election, token);
export const updateElectionStatus = (id: number, status: string, token: string) =>
  apiCall(`/admin/elections/${id}/status`, "PUT", { status }, token);
export const deleteElection = (id: number, token: string) =>
  apiCall(`/admin/elections/${id}`, "DELETE", null, token);
export const getAdminCandidates = (token: string) =>
  apiCall("/admin/candidates", "GET", null, token);
export const addCandidate = (candidate: any, token: string) =>
  apiCall("/admin/candidates", "POST", candidate, token);
export const deleteCandidate = (id: number, token: string) =>
  apiCall(`/admin/candidates/${id}`, "DELETE", null, token);
export const getResults = (electionId: number, token: string) =>
  apiCall(`/admin/results/${electionId}`, "GET", null, token);

// CSV Upload
export const uploadVotersCsv = async (file: File, token: string) => {
  const formData = new FormData();
  formData.append("file", file);
  const cleanToken = token.replace("Bearer ", "").trim();
  const response = await fetch(`${BASE_URL}/admin/voters/upload-csv`, {
    method: "POST",
    headers: { Authorization: `Bearer ${cleanToken}` },
    body: formData,
  });
  return response.json();
};

export const updateCandidate = (id: number, candidate: any, token: string) =>
  apiCall(`/admin/candidates/${id}`, "PUT", candidate, token);

export const updateElection = (id: number, election: any, token: string) =>
  apiCall(`/admin/elections/${id}`, "PUT", election, token);