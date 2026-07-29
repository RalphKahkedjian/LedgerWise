import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../services/authService";

export default function Register() {

  const navigate = useNavigate();

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  async function handleRegister (e:React.FormEvent) {

    e.preventDefault()

    try {
      const result = await register({
        name,
        email,
        password
      });

      localStorage.setItem("token", result.token);
      navigate('/dashboard')
    } catch {
      alert("An error occurred, please try again");
    }
  }

  return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">

      <div className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-md">

      <h1 className="text-4xl font-bold text-center text-blue-600">
        LedgerWise
      </h1>

      <p className="text-center text-gray-500 mt-2 mb-8">
        Create your account
      </p>

      <form onSubmit={handleRegister} className="space-y-5">

      <input
        className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
        placeholder="Full Name"
        value={name}
        onChange={(e)=>setName(e.target.value)}
      />

      <input
      className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
      placeholder="Email"
      value={email}
      onChange={(e)=>setEmail(e.target.value)}
      />

      <input
      className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
      type="password"
      placeholder="Password"
      value={password}
      onChange={(e)=>setPassword(e.target.value)}
      />

      <button
      className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-3 font-semibold"
      >
      Create Account
      </button>

      </form>

      <p className="text-center mt-6 text-gray-500">

      Already have an account?

      <a
      href="/login"
      className="text-blue-600 font-semibold ml-1"
      >
      Login
      </a>

      </p>

      </div>

      </div>
      );
}