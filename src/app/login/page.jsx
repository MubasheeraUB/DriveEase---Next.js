"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiUsers, FiCalendar, FiBarChart2,
  FiMail, FiLock, FiEye, FiEyeOff,
} from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { FaApple, FaFacebookF } from "react-icons/fa";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // Store token in both localStorage and cookie for middleware
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify({ id: data.id, name: data.name, email: data.email }));

      // Set cookie for middleware auth
      document.cookie = `token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}`;

      router.push("/dashboard");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    "w-full h-14 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-[#0F172A] placeholder:text-[#64748B] focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 outline-none";
  const iconBase = "absolute left-5 top-1/2 -translate-y-1/2 text-[#64748B] text-xl";

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex overflow-hidden">

      {/* ── LEFT SIDE ── */}
      <div className="hidden lg:flex w-1/2 bg-[#0F172A] relative items-center justify-center overflow-hidden">
        <div className="absolute w-[500px] h-[500px] bg-[#2563EB] opacity-20 blur-3xl rounded-full animate-pulse" />

        <div className="relative z-10 flex flex-col items-center text-center px-9">
          <div className="relative flex items-center justify-center mb-8">
            <div className="absolute w-80 h-80 bg-[#2563EB] opacity-30 blur-3xl rounded-full animate-pulse" />
            <div className="absolute w-72 h-72 border-[10px] border-[#2563EB]/30 border-t-[#2563EB] rounded-full animate-spin" style={{ animationDuration: "8s" }} />
            <div className="relative z-10 bg-white/10 backdrop-blur-xl p-4 rounded-[28px] border border-white/10">
              <div className="w-[200px] h-[80px] flex items-center justify-center">
                <span className="text-5xl font-extrabold tracking-tight">
                  <span className="text-white">Drive</span>
                  <span className="text-[#2563EB]">Ease</span>
                </span>
              </div>
            </div>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight mb-4">
            <span className="text-white">Drive</span>
            <span className="text-[#2563EB]">Ease</span>
          </h1>

          <p className="text-[#94A3B8] text-lg max-w-md leading-relaxed">
            Smart Driving Institute Management Software for handling students, schedules, instructors, payments, and learner progress efficiently.
          </p>

          <div className="flex justify-center gap-8 mt-12">
            <Feature icon={<FiUsers size={28} />} label="Students" />
            <Feature icon={<FiCalendar size={28} />} label="Schedule" />
            <Feature icon={<FiBarChart2 size={28} />} label="Progress" />
          </div>
        </div>
      </div>

      {/* ── RIGHT SIDE ── */}
      <div className="flex-1 flex items-center justify-center p-2 md:p-4 relative">
        <div className="absolute top-20 right-20 w-72 h-72 bg-[#2563EB]/5 blur-[120px] rounded-full" />

        <div className="w-full max-w-lg rounded-[32px] bg-white border border-[#E2E8F0] shadow-[0_4px_40px_rgba(37,99,235,.08)] p-4 md:p-6 relative z-10">

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-[#0F172A] mb-3">Welcome Back 👋</h2>
            <p className="text-[#64748B]">Login to manage your driving institute operations.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* EMAIL */}
            <div>
              <label className="text-[#0F172A] text-sm block mb-2">Email Address</label>
              <div className="relative">
                <FiMail className={iconBase} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  className={`${inputBase} pl-14 pr-4`}
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label className="text-[#0F172A] text-sm block mb-2">Password</label>
              <div className="relative">
                <FiLock className={iconBase} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  className={`${inputBase} pl-14 pr-14`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-[#64748B]"
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center text-sm">
              <label className="text-[#64748B] flex items-center gap-2">
                <input type="checkbox" /> Remember me
              </label>
              <button type="button" className="text-[#2563EB] hover:text-[#1D4ED8]">
                Forgot Password?
              </button>
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-2xl text-white font-semibold text-lg bg-[#2563EB] hover:bg-[#1D4ED8] transition-all shadow-[0_4px_20px_rgba(37,99,235,.3)] disabled:opacity-60"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <Divider />

          <div className="grid grid-cols-3 gap-4">
            <SocialBtn icon={<FcGoogle size={24} />} />
            <SocialBtn icon={<FaApple size={22} />} />
            <SocialBtn icon={<FaFacebookF size={22} />} />
          </div>

          <div className="text-center mt-8">
            <span className="text-[#64748B]">Don&apos;t have an account?</span>
            <button className="ml-2 text-[#2563EB] font-semibold">Sign Up</button>
          </div>

          <div className="text-center mt-8 text-[#64748B] text-sm">
            © 2026 DriveEase — Smart Driving Institute Management
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, label }) {
  return (
    <div className="text-center">
      <div className="w-16 h-14 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center text-blue-400 mx-auto">
        {icon}
      </div>
      <p className="text-white mt-3">{label}</p>
    </div>
  );
}

function SocialBtn({ icon }) {
  return (
    <button className="h-14 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-[#E2E8F0] flex justify-center items-center transition">
      {icon}
    </button>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-4 my-8">
      <div className="flex-1 h-px bg-[#E2E8F0]" />
      <span className="text-[#64748B] text-sm">or continue with</span>
      <div className="flex-1 h-px bg-[#E2E8F0]" />
    </div>
  );
}
