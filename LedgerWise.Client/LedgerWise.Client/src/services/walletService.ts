import api from "../api/api";

export async function getWallet() {
  const response = await api.get('/wallet');
  return response.data;
}

export async function getTransactions() {
  const response = await api.get('/wallet/transactions');
  return response.data;
}

export async function deposit(amount: Number) {
  const response = await api.post('/wallet/deposit', {
    amount
  });
  return response.data;
}

export async function withdraw(amount: Number) {
  const response = await api.post('/wallet/withdraw', {
    amount
  });
  return response.data;
}

export async function transfer(receiverUserId: number, amount: number) {
  const response = await api.post('/wallet/transfer', {
    receiverUserId, amount
  });
  return response.data;
}