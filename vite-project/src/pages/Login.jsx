import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { loginApi } from "../api/authApi";
import { FiLogIn, FiLock } from "react-icons/fi";
import { HiShieldCheck } from "react-icons/hi2";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await loginApi({ email, password });
      toast.success("Login successful");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0B0F14]">
      
      {/* LEFT SECTION */}
      <div className="hidden md:flex w-1/2 flex-col justify-center items-center border-r border-slate-800 bg-gradient-to-br from-[#111827] to-[#0B0F14] px-12">

        {/* Spinning Coin Shield */}
        <div className="mb-6 perspective-1000">
          <div className="w-20 h-20 rounded-full border border-emerald-500/30 flex items-center justify-center animate-coinSpin [transform-style:preserve-3d]">
            <HiShieldCheck className="text-emerald-400 text-5xl" />
          </div>
        </div>

        {/* Logo */}
        <img
          src="/image.png"
          alt="BugOut Logo"
          className="h-12 object-contain mb-4"
        />

        <p className="mt-4 text-center max-w-md text-slate-400 leading-relaxed">
          Secure, encrypted collaboration rooms for teams who value privacy
        </p>

        <div className="mt-10 space-y-4 w-full max-w-sm">
          <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-[#111827] border border-slate-800">
            <span className="text-emerald-400 text-xl">🔒</span>
            <p className="text-sm text-white">End-to-end encryption</p>
          </div>

          <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-[#111827] border border-slate-800">
            <span className="text-emerald-400 text-xl">🛡️</span>
            <p className="text-sm text-white">Zero-knowledge architecture</p>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="w-full md:w-1/2 flex bg-[#0B0F14]">
        <div className="w-[85%] max-w-md mx-auto flex flex-col justify-center">

          <h2 className="text-3xl font-bold text-white">
            Welcome back
          </h2>

          <p className="mt-1 text-slate-400 text-sm">
            Sign in to access your secure rooms
          </p>

          {/* FORM */}
          <form className="mt-8 flex flex-col gap-5" onSubmit={handleLogin}>

            {/* EMAIL */}
            <div>
              <label className="text-sm text-slate-400">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1 w-full rounded-xl px-4 py-2 text-sm bg-[#111827] border border-slate-800 text-white focus:border-emerald-500 focus:outline-none transition"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="text-sm text-slate-400">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="mt-1 w-full rounded-xl px-4 py-2 text-sm bg-[#111827] border border-slate-800 text-white focus:border-emerald-500 focus:outline-none transition"
              />
            </div>

            {/* SIGN IN BUTTON */}
            <button
              type="submit"
              className="flex items-center justify-center gap-2 py-3 rounded-lg font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/20 transition-all active:scale-95"
            >
              Sign In
              <FiLogIn size={18} />
            </button>
          </form>

          {/* BOTTOM */}
          <div className="mt-6 text-center">
            <span className="inline-flex items-center gap-2 text-sm px-4 py-1.5 rounded-full text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
              <FiLock size={14} />
              E2E Encrypted
            </span>

            <p className="mt-4 text-sm text-slate-400">
              Don't have an account?
              <span
                className="font-medium cursor-pointer ml-1 text-emerald-400 hover:text-emerald-300"
                onClick={() => navigate("/signup")}
              >
                Sign up
              </span>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}