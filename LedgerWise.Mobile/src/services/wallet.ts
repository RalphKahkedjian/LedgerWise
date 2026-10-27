import { api } from "./api";

export type Wallet = {
  id: number;
  userId: number;
  balance: number
}

export type WalletTransaction = {
  id: number;
  amount: number;
  type: string;
  createdAt: string;
  counterpartyUserId: number | null;
  counterpartyName: string | null;
  counterpartyEmail: string | null;
}

export async function getWallet(): Promise<Wallet> {
  const response = await api.get<Wallet>("/wallet");
  return response.data;
}

export async function getTransactions(): Promise<WalletTransaction[]> {
  const response = await api.get<WalletTransaction[]>("/Wallet/transactions");
  return response.data;
}

export async function deposit(amount: number) {
  const response = await api.post("/Wallet/deposit", {
    amount
  });
  return response.data;
}

export async function withdraw(amount: number) {
  const response = await api.post("/Wallet/withdraw", {
    amount,
  });
  return response.data;
}

export async function transfer(receiverEmail: string, amount: number) {
  const response = await api.post("/Wallet/transfer", {
    receiverEmail,
    amount
  });

  return response.data;
}