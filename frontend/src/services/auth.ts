import { api } from "./api";

export interface User {
  id: number;
  username: string;
  email: string;
}

export const login = async (username: string, password: string): Promise<User> => {
  const response = await api.post("/login", { username, password });
  return response.data;
};

export const logout = async (): Promise<void> => {
  await api.post("/logout");
};

export const getSession = async (): Promise<User | null> => {
  try {
    const response = await api.get("/me");
    return response.data;
  } catch (error) {
    return null;
  }
};