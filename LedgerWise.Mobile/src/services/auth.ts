import { api } from "./api";
import * as SecureStore from "expo-secure-store"

type LoginResponse = {
  token: string,
}

export async function login(
  email: string,
  password: string
) {
  const response = await api.post<LoginResponse>(
    "/Auth/login",
    {
      email,
      password
    }
  );

  const token = response.data.token;

  if (!token) {
    throw new Error("No authentication token received");
  }

  await SecureStore.setItemAsync("auth_token", token);

  return token;
}