import { apiRequest } from "./api";

export async function fetchInterviews(
  token,
  page = 1,
  search = "",
  sort = "newest",
  limit = 100
) {
  const query = new URLSearchParams({
    search,
    sort,
    page: page.toString(),
    limit: limit.toString(),
  }).toString();

  return await apiRequest(`/api/interviews?${query}`, "GET", null, token);
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