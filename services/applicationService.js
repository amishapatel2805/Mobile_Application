import { apiRequest } from "./api";

export async function fetchApplications(
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

  return await apiRequest(`/api/applications?${query}`, "GET", null, token);
}

export async function createApplication(application, token) {
  return await apiRequest(
    "/api/applications",
    "POST",
    application,
    token
  );
}

export async function updateApplication(id, application, token) {
  return await apiRequest(
    `/api/applications/${id}`,
    "PUT",
    application,
    token
  );
}

export async function deleteApplication(id, token) {
  return await apiRequest(
    `/api/applications/${id}`,
    "DELETE",
    null,
    token
  );
}