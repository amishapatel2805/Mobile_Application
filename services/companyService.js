import { apiRequest } from "./api";

export async function fetchCompanies(
  token,
  page = 1,
  search = "",
  sort = "newest",
  limit = 5
) {
  const query = new URLSearchParams({
    search,
    sort,
    page: page.toString(),
    limit: limit.toString(),
  }).toString();

  return await apiRequest(`/api/companies?${query}`, "GET", null, token);
}

export async function createCompany(company, token) {
  return await apiRequest("/api/companies", "POST", company, token);
}

export async function updateCompany(id, company, token) {
  return await apiRequest(`/api/companies/${id}`, "PUT", company, token);
}

export async function deleteCompany(id, token) {
  return await apiRequest(`/api/companies/${id}`, "DELETE", null, token);
}