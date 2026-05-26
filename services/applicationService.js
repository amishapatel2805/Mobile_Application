import { apiRequest } from "./api";

export async function fetchApplications(token) {
  return await apiRequest(
    "/api/applications",
    "GET",
    null,
    token
  );
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