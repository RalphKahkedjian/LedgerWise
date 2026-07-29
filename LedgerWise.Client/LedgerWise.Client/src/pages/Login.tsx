import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";

export default function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  async function HandleLogin(e: React.FormEvent) {
    e.preventDefault();

    try {
      const result = await login({
        email,
        password
      });

      localStorage.setItem("token", result.token);
      navigate("/dashboard");
    } catch {
      alert("Invalid email or password");
    }
  }

  return (
  <div className="min-h-screen flex items-center justify-center bg-slate-100">

    <div className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-md">

      <h1 className="text-4xl font-bold text-center text-blue-600">
        LedgerWise
      </h1>

      <p className="text-center text-gray-500 mt-2 mb-8">
        Sign in to your account
      </p>

      <form onSubmit={HandleLogin} className="space-y-5">

        <input
          className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-3 font-semibold transition"
        >
          Login
        </button>

      </form>

      <p className="text-center mt-6 text-gray-500">

        Don't have an account?

        <a
          href="/register"
          className="text-blue-600 font-semibold ml-1"
        >
          Register
        </a>

      </p>

    </div>

  </div>
);
}