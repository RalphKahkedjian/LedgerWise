import { useEffect, useState } from "react";
import {
  deposit,
  getTransactions,
  getWallet,
  transfer,
  withdraw,
} from "../services/walletService";
import { getUser } from "../services/userService";
import type { UserLookupResponse } from "../types/userLookupResponse";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {

  const navigate = useNavigate()

  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);

  const [depositAmount, setDepositAmount] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState(0);

  const [receiverID, setReceiverID] = useState(0);
  const [transferAmount, setTransferAmount] = useState(0);
  const [receiver, setReceiver] = useState<UserLookupResponse | null>(null);

  function logout() {
    localStorage.removeItem("token");
    navigate("/login")
  }

  async function loadReceiver(id: number) {
    try {
      const response = await getUser(id);
      setReceiver(response);
    } catch (error) {
      console.error(error);
      setReceiver(null);
    }
  }

  async function handleDeposit() {
    try {
      await deposit(depositAmount);

      alert("Deposit successful");

      setDepositAmount(0);

      await loadData();
    } catch (error) {
      console.error(error);
      alert("Deposit failed");
    }
  }

  async function handleWithdrawal() {
    try {
      await withdraw(withdrawAmount);

      alert("Withdraw successful");

      setWithdrawAmount(0);

      await loadData();
    } catch (error) {
      console.error(error);
      alert("Withdraw failed");
    }
  }

  async function handleTransfer(receiverUserId: number, amount: number) {
    try {
      await transfer(receiverUserId, amount);

      alert("Transfer successful");

      setReceiver(null);
      setReceiverID(0);
      setTransferAmount(0);

      await loadData();
    } catch (error) {
      console.error(error);
      alert("Transfer failed");
    }
  }

  async function loadData() {
    try {
      const wallet = await getWallet();
      setBalance(wallet.balance);

      const txs = await getTransactions();
      setTransactions(txs);
    } catch (error) {
      console.error("Error while fetching dashboard data", error);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
  <div className="min-h-screen bg-slate-100 p-10">

    <div className="max-w-7xl mx-auto">

      <div className="flex justify-between items-center mb-8">

        <div>
          <h1 className="text-4xl font-bold">
            LedgerWise
          </h1>

          <p className="text-gray-500">
            Personal Finance Dashboard
          </p>
        </div>

        <button
          className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg"
          onClick={logout}
        >
          Logout
        </button>

      </div>

      <div className="grid md:grid-cols-3 gap-6">

        <div className="bg-white rounded-xl shadow p-6">

          <h2 className="text-gray-500">
            Wallet Balance
          </h2>

          <h1 className="text-5xl font-bold mt-3">
            ${balance}
          </h1>

        </div>

        <div className="bg-white rounded-xl shadow p-6">

          <h2 className="text-gray-500">
            Total Transactions
          </h2>

          <h1 className="text-5xl font-bold mt-3">
            {transactions.length}
          </h1>

        </div>

        <div className="bg-white rounded-xl shadow p-6">

          <h2 className="text-gray-500">
            Recipient
          </h2>

          {receiver ? (
            <>
              <p className="font-semibold mt-3">
                {receiver.name}
              </p>

              <p className="text-gray-500">
                {receiver.email}
              </p>
            </>
          ) : (
            <p className="text-gray-400 mt-3">
              No recipient selected
            </p>
          )}

        </div>

      </div>
      <div className="grid md:grid-cols-3 gap-6 mt-8">

  {/* Deposit */}
  <div className="bg-white rounded-xl shadow p-6">

    <h2 className="text-xl font-semibold mb-4">
      Deposit
    </h2>

    <input
      className="w-full border rounded-lg p-3"
      type="number"
      value={depositAmount}
      onChange={(e) => setDepositAmount(Number(e.target.value))}
      placeholder="Amount"
    />

    <button
      onClick={handleDeposit}
      className="mt-4 w-full bg-green-600 text-white rounded-lg p-3 hover:bg-green-700"
    >
      Deposit
    </button>

  </div>

  {/* Withdraw */}
  <div className="bg-white rounded-xl shadow p-6">

    <h2 className="text-xl font-semibold mb-4">
      Withdraw
    </h2>

    <input
      className="w-full border rounded-lg p-3"
      type="number"
      value={withdrawAmount}
      onChange={(e) => setWithdrawAmount(Number(e.target.value))}
      placeholder="Amount"
    />

    <button
      onClick={handleWithdrawal}
      className="mt-4 w-full bg-orange-500 text-white rounded-lg p-3 hover:bg-orange-600"
    >
      Withdraw
    </button>

  </div>

  {/* Transfer */}
  <div className="bg-white rounded-xl shadow p-6">

    <h2 className="text-xl font-semibold mb-4">
      Transfer
    </h2>

    <input
      className="w-full border rounded-lg p-3 mb-3"
      type="number"
      placeholder="Receiver ID"
      value={receiverID}
      onChange={async (e) => {
        const id = Number(e.target.value);

        setReceiverID(id);

        if (id > 0)
          await loadReceiver(id);
        else
          setReceiver(null);
      }}
    />

    <input
      className="w-full border rounded-lg p-3"
      type="number"
      placeholder="Amount"
      value={transferAmount}
      onChange={(e) => setTransferAmount(Number(e.target.value))}
    />

    {receiver && (
      <div className="mt-3 rounded-lg bg-gray-100 p-3">
        <p className="font-semibold">{receiver.name}</p>
        <p className="text-sm text-gray-500">{receiver.email}</p>
      </div>
    )}

    <button
      onClick={() => handleTransfer(receiverID, transferAmount)}
      className="mt-4 w-full bg-blue-600 text-white rounded-lg p-3 hover:bg-blue-700"
    >
      Transfer
    </button>

  </div>

</div>
<div className="bg-white rounded-xl shadow p-6 mt-8">

  <h2 className="text-2xl font-bold mb-5">
    Recent Transactions
  </h2>

  <table className="w-full">

    <thead className="border-b">

      <tr>

        <th className="text-left py-3">Type</th>
        <th className="text-left py-3">Amount</th>
        <th className="text-left py-3">Date</th>

      </tr>

    </thead>

<tbody>

  {transactions.length === 0 ? (

    <tr>
      <td
        colSpan={3}
        className="text-center py-8 text-gray-400"
      >
        No transactions yet.
      </td>
    </tr>

  ) : (

    transactions.map((t: any) => (

      <tr
        key={t.id}
        className="border-b hover:bg-gray-50 transition"
      >

        <td className="py-4">

          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold
            ${
              t.type === "Deposit"
                ? "bg-green-100 text-green-700"

                : t.type === "Withdraw"
                ? "bg-red-100 text-red-700"

                : t.type === "Transfer Out"
                ? "bg-orange-100 text-orange-700"

                : "bg-blue-100 text-blue-700"
            }`}
          >
            {t.type}
          </span>

        </td>

        <td className="py-4 font-semibold">
          ${Number(t.amount).toFixed(2)}
        </td>

        <td className="py-4 text-gray-500">
          {new Date(t.createdAt).toLocaleString()}
        </td>

      </tr>

    ))

  )}

</tbody>

  </table>

</div>
    </div>

  </div>
);
}