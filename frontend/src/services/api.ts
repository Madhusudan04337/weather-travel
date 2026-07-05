import axios from "axios";

// In local: VITE_API_URL is unset, falls back to localhost
// In production (Render): set VITE_API_URL in environment dashboard
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// We can add interceptors here later if we need authentication tokens or error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Optionally format or log errors centrally
    return Promise.reject(error);
  }
);
