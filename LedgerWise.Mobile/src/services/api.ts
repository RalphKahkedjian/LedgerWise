import axios from "axios";

export const api = axios.create({
  baseURL: "http://192.168.0.102:5000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});