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

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    console.log("API URL:", `${BASE_URL}${endpoint}`);
    console.log("TOKEN SENT:", token ? "YES" : "NO");

    const options = {
      method,
      headers,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, options);

    let responseData = null;

    try {
      responseData = await response.json();
    } catch {
      responseData = null;
    }

    if (!response.ok) {
      console.log("API ERROR RESPONSE:", response.status, responseData);

      return {
        success: false,
        message:
          responseData?.message ||
          `Request failed with status ${response.status}`,
      };
    }

    return {
      success: true,
      data: responseData,
    };
  } catch (error) {
    console.error("API Error:", error);

    return {
      success: false,
      message:
        "Server is currently unavailable. Please check your connection.",
    };
  }
}