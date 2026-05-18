import { apiRequest } from "./api";

// Fetch all companies
export async function fetchCompanies(token) {
  return await apiRequest(
    "/api/companies",
    "GET",
    null,
    token
  );
}