import { apiRequest } from "./api";

export async function fetchInterviews(token) {
  return await apiRequest(
    "/api/interviews",
    "GET",
    null,
    token
  );
}

export async function createInterview(interview, token) {
  return await apiRequest(
    "/api/interviews",
    "POST",
    interview,
    token
  );
}

export async function updateInterview(id, interview, token) {
  return await apiRequest(
    `/api/interviews/${id}`,
    "PUT",
    interview,
    token
  );
}

export async function deleteInterview(id, token) {
  return await apiRequest(
    `/api/interviews/${id}`,
    "DELETE",
    null,
    token
  );
}