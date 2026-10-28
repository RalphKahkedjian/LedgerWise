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

export type PendingTransfer = {
  id: number;
  amount: number;
  status: "Pending" | "Accepted" | "Rejected";
  createdAt: string;
  respondedAt: string | null;

  senderName?: string;
  senderEmail?: string;

  receiverName?: string;
  receiverEmail?: string;
};

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

// Get transfers received by the logged-in user
export async function getIncomingTransfers(): Promise<PendingTransfer[]> {
  const response = await api.get<PendingTransfer[]>(
    "/Wallet/transfers/incoming"
  );

  return response.data;
}

export async function getOutgoingTransfers(): Promise<PendingTransfer[]> {
  const response = await api.get<PendingTransfer[]>(
    "/Wallet/transfers/outgoing"
  );

  return response.data;
}

export async function acceptTransfer(transferId: number) {
  const response = await api.post(
    `/Wallet/transfers/${transferId}/accept`
  );

  return response.data;
}

export async function rejectTransfer(transferId: number) {
  const response = await api.post(
    `/Wallet/transfers/${transferId}/reject`
  );

  return response.data;
}