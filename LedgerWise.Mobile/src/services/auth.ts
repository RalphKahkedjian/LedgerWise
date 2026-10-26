import { api } from "./api";
import * as SecureStore from "expo-secure-store"
import {jwtDecode} from "jwt-decode"

type UserClaims = {
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"?: string;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"?: string;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"?: string;
  exp?: number;
};

type LoginResponse = {
  token: string,
}

type RegisterRequest = {
  name: string,
  email: string,
  password: string
}

type JwtPayload = {
  exp?: number
}

export async function hasValidSession(): Promise<boolean> {
  const token = await getStoredToken();

  if (!token) {
    return false;
  }

  try {
    const decoded = jwtDecode<JwtPayload>(token);

    if (!decoded.exp || decoded.exp * 1000 <= Date.now()) {
      await logout();
      return false;
    }

    return true;
  } catch {
    await logout();
    return false;
  }
}

export async function getCurrentUser() {
  const token = await getStoredToken();

  if (!token) return null;

  try {
    const decoded = jwtDecode<UserClaims>(token);
    const name = decoded[
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
    ];

    console.log("JWT name:", JSON.stringify(name));

    if (!decoded.exp || decoded.exp * 1000 <= Date.now()) {
      return null;
    }

    return {
      id: decoded[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
      ],
      name: decoded[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
      ],
      email: decoded[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
      ],
    };
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
}


export async function register(data: RegisterRequest) {
  const response = await api.post<string>("/Auth/register", data);
  return response.data;
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

export async function getStoredToken(): Promise<string | null> {
  return await SecureStore.getItemAsync("auth_token");
}

export async function logout(): Promise<void> {
  await SecureStore.deleteItemAsync("auth_token");
}