import { apiRequest } from "./api";

// Login user
export async function login(email, password) {
  return await apiRequest(
    "/api/auth/login",
    "POST",
    {
      email,
      password,
    }
  );
}

// Register user
export async function register(
  name,
  email,
  password
) {
  return await apiRequest(
    "/api/auth/register",
    "POST",
    {
      name,
      email,
      password,
    }
  );
}