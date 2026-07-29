import api from "../api/api";

export async function getUser(id : Number) {
  const response = await api.get(`/user/${id}`)
  return response.data
}