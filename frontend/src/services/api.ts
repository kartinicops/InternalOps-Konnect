import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Interceptor untuk menyertakan CSRF token
API.interceptors.request.use(async (config) => {
  const csrfToken = document.cookie.split("; ").find(row => row.startsWith("csrftoken="))?.split("=")[1];
  if (csrfToken) {
    config.headers["X-CSRFToken"] = csrfToken;
  }
  return config;
});

export default API;