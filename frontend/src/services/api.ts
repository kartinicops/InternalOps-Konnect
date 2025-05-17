import axios from "axios";

const API = axios.create({
  baseURL: "http://103.150.100.184", // Sesuaikan dengan backend
  withCredentials: true, // Pastikan cookies dikirim jika pakai session
});

export default API;