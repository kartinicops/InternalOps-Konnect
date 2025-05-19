import axios from "axios"

const API = axios.create({
  baseURL: process.env.API_URL || "http://103.150.100.184",
  withCredentials: true, // opsional, kalau kamu pakai cookie login
})

// Interceptor untuk nambahin Authorization header secara otomatis
API.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("auth_token")
  if (token) {
    config.headers.Authorization = token
  }
  return config
})

export default API