import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { signupApi } from "../api/authApi";
import {
  FiUserPlus,
  FiLock,
  FiShield,
  FiUser,
  FiMail,
  FiKey,
  FiCheckCircle,
} from "react-icons/fi";
import { HiShieldCheck } from "react-icons/hi2";

export default function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      toast.error("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      await signupApi({ name, email, password });
      toast.success("Account created successfully");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0B0F14] font-['Outfit']">

      {/* LEFT SECTION */}
      <div className="hidden md:flex w-1/2 flex-col justify-center items-center relative overflow-hidden border-r border-slate-800 bg-gradient-to-br from-[#111827] to-[#0B0F14] px-12">

        {/* Spinning Coin Shield */}
        <div className="mb-6 perspective-1000">
          <div className="w-20 h-20 rounded-full border border-emerald-500/30 flex items-center justify-center animate-coinSpin [transform-style:preserve-3d]">
            <HiShieldCheck className="text-emerald-400 text-5xl" />
          </div>
        </div>

        {/* PNG Logo */}
        <img
          src="/image.png"
          alt="BugOut Logo"
          className="h-12 object-contain mb-4"
        />

        <p className="mt-4 text-center text-slate-400 leading-relaxed max-w-sm">
          Join thousands of teams collaborating in the most secure workspace built for privacy.
        </p>

        <div className="flex gap-4 mt-10 justify-center">
          <div className="px-6 py-5 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-md text-center">
            <h3 className="text-2xl font-black text-emerald-500">256-bit</h3>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
              AES Encryption
            </p>
          </div>
          <div className="px-6 py-5 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-md text-center">
            <h3 className="text-2xl font-black text-emerald-500">Zero</h3>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
              Data Storage
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 lg:p-16 overflow-y-auto">
        <div className="w-full max-w-md py-12">

          <div className="mb-10 text-center md:text-left">
            <h2 className="text-4xl font-bold text-white tracking-tight mb-3">
              Create account
            </h2>
            <p className="text-slate-400">
              Start collaborating securely in minutes.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSignup}>

            {/* FULL NAME */}
            <div className="group">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                Full Name
              </label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder:text-slate-600 outline-none focus:border-emerald-500/50 transition-all"
                />
              </div>
            </div>

            {/* EMAIL */}
            <div className="group">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder:text-slate-600 outline-none focus:border-emerald-500/50 transition-all"
                />
              </div>
            </div>

            {/* PASSWORD GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="group">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Password
                </label>
                <div className="relative">
                  <FiKey className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl pl-11 pr-4 py-3.5 text-white outline-none focus:border-emerald-500/50 transition-all"
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Confirm
                </label>
                <div className="relative">
                  <FiCheckCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl pl-11 pr-4 py-3.5 text-white outline-none focus:border-emerald-500/50 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* RULES */}
            <div className="rounded-2xl p-4 bg-slate-900/80 border border-slate-800 text-[11px] text-slate-500 grid grid-cols-2 gap-2">
              <p className="flex items-center gap-1.5"><FiShield className="text-emerald-500/50" /> 8+ Characters</p>
              <p className="flex items-center gap-1.5"><FiShield className="text-emerald-500/50" /> One Number</p>
              <p className="flex items-center gap-1.5"><FiShield className="text-emerald-500/50" /> One Uppercase</p>
              <p className="flex items-center gap-1.5"><FiShield className="text-emerald-500/50" /> Match Verified</p>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-900/20 transition-all active:scale-95"
            >
              Create Account
              <FiUserPlus size={20} />
            </button>
          </form>

          <div className="mt-8 text-center text-slate-500 text-sm">
            Already have an account?
            <button
              className="text-emerald-500 font-bold hover:text-emerald-400 ml-1"
              onClick={() => navigate("/login")}
            >
              Sign In
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}