import { apiRequest } from "./api";

export async function fetchCompanies(token) {
  return await apiRequest("/api/companies", "GET", null, token);
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