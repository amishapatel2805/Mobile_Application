const BASE_URL = "https://jacaranda03.ifn666.com/assessment02";

export async function apiRequest(
  endpoint,
  method = "GET",
  body = null,
  token = null
) {
  try {
    const headers = {
      "Content-Type": "application/json",
    };

    // Add token if available
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const options = {
      method,
      headers,
    };

    // Add body for POST, PUT, DELETE
    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(
      `${BASE_URL}${endpoint}`,
      options
    );

    // Try parsing response safely
    let responseData = null;

    try {
      responseData = await response.json();
    } catch {
      responseData = null;
    }

    // Handle API errors
    if (!response.ok) {
      return {
        success: false,
        message:
          responseData?.message ||
          "Something went wrong.",
      };
    }

    // Success response
    return {
      success: true,
      data: responseData,
    };
  } catch (error) {
    // Network/server failure handling
    console.error("API Error:", error);

    return {
      success: false,
      message:
        "Server is currently unavailable. Please check your connection.",
    };
  }
}