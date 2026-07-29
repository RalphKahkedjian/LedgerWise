import api from '../api/api';

export interface LoginRequest {
  email: String,
  password: String
}

export interface RegisterRequest {
  name: String,
  email: String,
  password: string
}

export const login = async (request : LoginRequest) => {
  const response = await api.post("/auth/login", request);
  return response.data;
}

export const register = async (request: RegisterRequest) => {
  const response = await api.post("/auth/register", request);
  return response.data;
}