import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000", // Sesuaikan dengan backend
  withCredentials: true, // Pastikan cookies dikirim jika pakai session
});

export default API;