"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiMail, FiLock, FiEye, FiEyeOff, FiUsers, FiCalendar, FiCreditCard } from "react-icons/fi";
import { FaCar } from "react-icons/fa";
import { BsShieldFillCheck } from "react-icons/bs";

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
    "w-full h-11 bg-white border border-[#E2E8F0] rounded-xl text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 outline-none transition";

  return (
    <div className="h-screen overflow-hidden bg-[#EDF2F9] flex items-center justify-center p-3 md:p-4">
      <div className="w-full max-w-[1150px] h-full max-h-[780px] bg-white rounded-[24px] shadow-[0_20px_60px_rgba(15,23,42,.08)] overflow-hidden flex">

        {/* ================= LEFT PANEL ================= */}
        <div className="hidden lg:flex w-[55%] flex-col bg-gradient-to-b from-[#E9F1FB] via-[#F2F7FD] to-[#EAF1FA] relative px-8 pt-6 pb-4 overflow-hidden">

          {/* Animated Logo */}
          <div className="relative z-10">
            <AnimatedLogo />
          </div>

          {/* Heading */}
          <h1 className="relative z-10 text-[30px] leading-tight font-extrabold text-[#0F172A] mt-4 logo-fade-up" style={{ animationDelay: ".25s" }}>
            Smart Driving Institute
            <br />
            Management System
          </h1>
          <p className="relative z-10 text-[#475569] text-[14px] leading-relaxed mt-2.5 max-w-sm logo-fade-up" style={{ animationDelay: ".4s" }}>
            Manage students, instructors, vehicles, classes and payments
            efficiently from a single powerful dashboard.
          </p>

          {/* Illustration — fills the band width; only empty sky gets cropped */}
          <div className="flex-1 min-h-0 relative -mx-8 mt-1">
            <img
              src="/login-hero.png"
              alt=""
              className="absolute inset-0 w-full h-full object-cover object-bottom pointer-events-none select-none [mask-image:linear-gradient(to_bottom,transparent_0%,black_14%,black_88%,rgba(0,0,0,.35)_97%,transparent_100%)]"
            />
          </div>

          {/* Feature cards — minimal overlap so the road under the car stays visible */}
          <div className="relative z-10 -mt-3 mx-2 bg-white rounded-2xl shadow-[0_10px_40px_rgba(15,23,42,.12)] grid grid-cols-4 divide-x divide-[#EDF2F7]">
            <Feature icon={<FiUsers size={22} />} tint="bg-[#EFF6FF] text-[#2563EB]" label={"Student\nManagement"} />
            <Feature icon={<FiCalendar size={22} />} tint="bg-[#ECFDF5] text-[#10B981]" label={"Class\nScheduling"} />
            <Feature icon={<FiCreditCard size={22} />} tint="bg-[#F5F3FF] text-[#8B5CF6]" label={"Payment\nTracking"} />
            <Feature icon={<FaCar size={22} />} tint="bg-[#FFF7ED] text-[#F59E0B]" label={"Vehicle\nManagement"} />
          </div>

          {/* Bottom note */}
          <div className="relative z-10 flex items-center justify-center gap-2 mt-4 text-[#334155] text-[13px] font-medium">
            <BsShieldFillCheck className="text-[#2563EB]" size={17} />
            <span>Secure. Reliable. Built for Driving Institutes.</span>
          </div>
        </div>

        {/* ================= RIGHT PANEL ================= */}
        <div className="flex-1 flex items-center justify-center bg-white p-5 md:p-8 overflow-y-auto">
          <div className="w-full max-w-[420px] bg-white border border-[#EBF0F6] rounded-2xl shadow-[0_8px_30px_rgba(15,23,42,.06)] p-7 md:p-8">

            <h2 className="text-[26px] font-extrabold text-[#0F172A]">
              Welcome Back <span className="inline-block origin-bottom-right wave">👋</span>
            </h2>
            <p className="text-[#64748B] text-[14px] mt-1.5 mb-6">
              Login to manage your driving institute operations.
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              {/* EMAIL */}
              <div>
                <label className="text-[#0F172A] text-[13.5px] font-semibold block mb-1.5">Email Address</label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]" size={19} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                    className={`${inputBase} pl-12 pr-4`}
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <label className="text-[#0F172A] text-[13.5px] font-semibold block mb-1.5">Password</label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]" size={19} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    className={`${inputBase} pl-12 pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A]"
                  >
                    {showPassword ? <FiEyeOff size={19} /> : <FiEye size={19} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center text-[13px] pt-0.5">
                <label className="text-[#0F172A] font-medium flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" className="w-[18px] h-[18px] rounded border-[#CBD5E1] accent-[#2563EB]" />
                  Remember me
                </label>
                <button type="button" className="text-[#2563EB] font-medium hover:text-[#1D4ED8]">
                  Forgot Password?
                </button>
              </div>

              {error && (
                <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-[46px] rounded-xl text-white font-semibold text-[15px] bg-[#2563EB] hover:bg-[#1D4ED8] transition-all shadow-[0_6px_18px_rgba(37,99,235,.35)] disabled:opacity-60"
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </form>

            <div className="h-px bg-[#E8EDF4] mt-7 mb-5" />

            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#EAF1FB] flex items-center justify-center">
                <BsShieldFillCheck className="text-[#2563EB]" size={17} />
              </div>
              <div className="text-[#64748B] text-[13px] leading-snug">
                © 2026 DriveEase
                <br />
                Version 1.0
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= ANIMATIONS ================= */}
      <style>{`
        @keyframes logoDraw {
          from { stroke-dashoffset: 210; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes logoFloat {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-3px); }
        }
        @keyframes speedLine {
          0%   { transform: translateX(-14px); opacity: 0; }
          35%  { opacity: 1; }
          100% { transform: translateX(10px); opacity: 0; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes wave {
          0%, 60%, 100% { transform: rotate(0deg); }
          10%, 30%      { transform: rotate(16deg); }
          20%, 40%      { transform: rotate(-8deg); }
        }
        .logo-swoosh {
          stroke-dasharray: 210;
          animation: logoDraw 1.4s ease-out forwards;
        }
        .logo-car-group { animation: logoFloat 3s ease-in-out infinite; }
        .speed-line   { animation: speedLine 1.6s ease-in-out infinite; }
        .speed-line-2 { animation-delay: .25s; }
        .speed-line-3 { animation-delay: .5s; }
        .logo-fade-up {
          opacity: 0;
          animation: fadeUp .9s ease forwards;
        }
        .wave { animation: wave 2.4s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

/* ───────────────────────── Animated Logo ───────────────────────── */
function AnimatedLogo() {
  return (
    <div>
      <div className="flex items-center gap-3">
      {/* Icon */}
      <svg width="56" height="56" viewBox="0 0 100 100" fill="none" aria-hidden="true">
        {/* Swoosh arc */}
        <path
          className="logo-swoosh"
          d="M36 9 C68 9, 89 28, 89 52 C89 71, 77 85, 60 90"
          stroke="#2563EB"
          strokeWidth="11"
          strokeLinecap="round"
        />
        {/* Speed lines */}
        <rect className="speed-line"   x="4" y="38" width="26" height="5.5" rx="2.75" fill="#2563EB" />
        <rect className="speed-line speed-line-2" x="1" y="50" width="20" height="5.5" rx="2.75" fill="#2563EB" />
        <rect className="speed-line speed-line-3" x="7" y="62" width="13" height="5.5" rx="2.75" fill="#2563EB" />
        {/* Car (front view) */}
        <g className="logo-car-group">
          <path d="M36 56 C36 46, 42 40, 52 40 C62 40, 68 46, 68 56 Z" fill="#1E3A8A" />
          <path d="M40 54 C41 47.5, 45 44, 52 44 C59 44, 63 47.5, 64 54 Z" fill="#DBEAFE" />
          <rect x="31" y="55" width="42" height="17" rx="6" fill="#1E3A8A" />
          <rect x="36" y="60" width="9" height="4" rx="2" fill="#FDE68A" />
          <rect x="59" y="60" width="9" height="4" rx="2" fill="#FDE68A" />
          <rect x="47" y="61" width="10" height="2.5" rx="1.25" fill="#93C5FD" />
        </g>
        {/* Road hump */}
        <path d="M10 95 Q52 70 94 95 L10 95 Z" fill="#1E3A8A" />
        <path d="M48 84 L51 78 L53 78 L56 84 Z" fill="#fff" opacity=".85" />
      </svg>

      {/* Wordmark */}
      <div className="logo-fade-up text-[27px] font-extrabold leading-none tracking-tight" style={{ animationDelay: ".15s" }}>
        <span className="text-[#0F172A]">Drive</span>
        <span className="text-[#2563EB]">Ease</span>
      </div>
      </div>
      {/* Tagline under the full logo row */}
      <div className="logo-fade-up text-[9.5px] font-semibold tracking-[.2em] text-[#64748B] mt-1" style={{ animationDelay: ".3s" }}>
        SMART DRIVING INSTITUTE MANAGEMENT
      </div>
    </div>
  );
}

/* ───────────────────────── Feature card ───────────────────────── */
function Feature({ icon, tint, label }) {
  const [line1, line2] = label.split("\n");
  return (
    <div className="flex flex-col items-center text-center py-3.5 px-2">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tint}`}>{icon}</div>
      <p className="text-[#0F172A] text-[12px] font-semibold leading-snug mt-2">
        {line1}
        <br />
        {line2}
      </p>
    </div>
  );
}

/* ───────────────────────── Hero illustration (unused fallback — image replaced it) ───────────────────────── */
// eslint-disable-next-line no-unused-vars
function HeroIllustration() {
  return (
    <svg viewBox="0 0 640 400" className="w-full h-full" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
      <defs>
        <linearGradient id="glassGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9CC3EE" />
          <stop offset="100%" stopColor="#C9DFF5" />
        </linearGradient>
        <linearGradient id="carGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
        <linearGradient id="signGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>

      {/* Clouds */}
      <g fill="#FFFFFF" opacity=".9">
        <g transform="translate(470,42)">
          <ellipse cx="0" cy="12" rx="34" ry="14" />
          <ellipse cx="26" cy="6" rx="26" ry="13" />
          <ellipse cx="-24" cy="6" rx="20" ry="11" />
        </g>
        <g transform="translate(560,118)">
          <ellipse cx="0" cy="8" rx="26" ry="11" />
          <ellipse cx="20" cy="3" rx="18" ry="9" />
        </g>
        <g transform="translate(80,60)" opacity=".7">
          <ellipse cx="0" cy="8" rx="24" ry="10" />
          <ellipse cx="18" cy="3" rx="16" ry="8" />
        </g>
      </g>

      {/* Birds */}
      <g stroke="#94A3B8" strokeWidth="2" fill="none" strokeLinecap="round">
        <path d="M508 88 q5 -6 10 0 q5 -6 10 0" />
        <path d="M548 72 q4 -5 8 0 q4 -5 8 0" />
        <path d="M532 106 q4 -5 8 0 q4 -5 8 0" />
      </g>

      {/* City skyline */}
      <g fill="#D8E4F3">
        <rect x="0" y="180" width="46" height="100" />
        <rect x="50" y="150" width="38" height="130" />
        <rect x="92" y="195" width="50" height="85" />
        <rect x="146" y="165" width="34" height="115" />
        <rect x="184" y="200" width="44" height="80" />
        <rect x="232" y="155" width="40" height="125" />
        <rect x="276" y="185" width="48" height="95" />
        <rect x="600" y="170" width="40" height="110" />
      </g>

      {/* ── Driving school building ── */}
      <g>
        <rect x="345" y="168" width="250" height="112" rx="4" fill="#E8EEF6" />
        <rect x="345" y="168" width="250" height="10" fill="#CBD9EA" />
        {/* Glass panels */}
        <g fill="url(#glassGrad)">
          <rect x="358" y="188" width="52" height="92" rx="3" />
          <rect x="418" y="188" width="52" height="92" rx="3" />
          <rect x="478" y="188" width="52" height="60" rx="3" />
          <rect x="538" y="188" width="46" height="60" rx="3" />
        </g>
        {/* Glass mullions */}
        <g stroke="#FFFFFF" strokeWidth="2.5" opacity=".8">
          <line x1="384" y1="188" x2="384" y2="280" />
          <line x1="444" y1="188" x2="444" y2="280" />
          <line x1="504" y1="188" x2="504" y2="248" />
          <line x1="561" y1="188" x2="561" y2="248" />
          <line x1="358" y1="222" x2="584" y2="222" />
        </g>
        {/* Entrance */}
        <rect x="487" y="252" width="88" height="28" rx="3" fill="#B9CFE7" />
        <rect x="516" y="256" width="30" height="24" fill="#7FA8D6" />
        {/* DRIVING SCHOOL sign */}
        <g>
          <polygon points="400,130 582,148 582,176 400,158" fill="url(#signGrad)" />
          <polygon points="400,130 400,158 386,154 386,126" fill="#1E40AF" />
          <text x="491" y="161" fill="#fff" fontSize="19" fontWeight="700" fontFamily="Arial, sans-serif" textAnchor="middle" transform="rotate(5.6 491 161)">
            DRIVING SCHOOL
          </text>
        </g>
      </g>

      {/* Ground strip */}
      <rect x="0" y="278" width="640" height="122" fill="#EAF2EA" />

      {/* Trees */}
      <Tree x={318} y={282} s={1} />
      <Tree x={612} y={278} s={1.08} />

      {/* Bushes */}
      <g fill="#7CB66A">
        <ellipse cx="360" cy="284" rx="20" ry="10" />
        <ellipse cx="585" cy="286" rx="22" ry="10" />
        <ellipse cx="455" cy="285" rx="16" ry="8" fill="#92C97F" />
      </g>

      {/* ── Road ── */}
      <path
        d="M0 400 L640 400 L640 352 C520 318, 450 296, 408 282 C388 276, 368 274, 348 280 C260 304, 120 348, 0 372 Z"
        fill="#454D5C"
      />
      {/* Yellow edge line */}
      <path d="M640 348 C520 314, 452 292, 410 278" stroke="#F4C530" strokeWidth="6" fill="none" />
      {/* White edge line (left) */}
      <path d="M0 376 C130 350, 268 308, 352 284" stroke="#E7EBF1" strokeWidth="5" fill="none" opacity=".9" />
      {/* Center dashes */}
      <path
        d="M70 400 C160 366, 280 322, 378 290"
        stroke="#FFFFFF"
        strokeWidth="6"
        strokeDasharray="30 24"
        strokeLinecap="round"
        fill="none"
      />

      {/* ── Car (rear view) ── */}
      <g transform="translate(115,242)">
        <ellipse cx="80" cy="142" rx="92" ry="12" fill="#1F2937" opacity=".25" />
        {/* Roof sign */}
        <rect x="49" y="-6" width="62" height="20" rx="5" fill="#fff" stroke="#D7DEE8" />
        <text x="80" y="8" fill="#1E3A8A" fontSize="10.5" fontWeight="700" fontFamily="Arial, sans-serif" textAnchor="middle">
          DRIVE SAFE
        </text>
        <rect x="62" y="14" width="4" height="7" fill="#94A3B8" />
        <rect x="94" y="14" width="4" height="7" fill="#94A3B8" />
        {/* Cabin */}
        <path d="M38 74 C40 44, 52 22, 80 22 C108 22, 120 44, 122 74 Z" fill="url(#carGrad)" />
        <path d="M46 68 C49 46, 58 31, 80 31 C102 31, 111 46, 114 68 L46 68 Z" fill="#0F1B33" />
        <path d="M50 65 C53 47, 61 34, 80 34 C99 34, 107 47, 110 65 Z" fill="#1E3A5C" />
        {/* Body */}
        <rect x="14" y="72" width="132" height="56" rx="14" fill="url(#carGrad)" />
        {/* Trunk line */}
        <line x1="26" y1="92" x2="134" y2="92" stroke="#1E40AF" strokeWidth="2.5" opacity=".7" />
        {/* Tail lights */}
        <rect x="22" y="98" width="24" height="10" rx="5" fill="#F8FAFC" />
        <rect x="114" y="98" width="24" height="10" rx="5" fill="#F8FAFC" />
        {/* License plate */}
        <rect x="62" y="102" width="36" height="16" rx="3" fill="#fff" stroke="#CBD5E1" />
        {/* Bumper */}
        <rect x="20" y="118" width="120" height="8" rx="4" fill="#1E40AF" />
        {/* Wheels */}
        <rect x="20" y="126" width="22" height="14" rx="6" fill="#111827" />
        <rect x="118" y="126" width="22" height="14" rx="6" fill="#111827" />
      </g>
    </svg>
  );
}

function Tree({ x, y, s }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <rect x="-4" y="-18" width="8" height="22" rx="3" fill="#8B5E3C" />
      <circle cx="0" cy="-34" r="20" fill="#4E9F4A" />
      <circle cx="-13" cy="-24" r="14" fill="#5CAF56" />
      <circle cx="13" cy="-24" r="14" fill="#5CAF56" />
      <circle cx="0" cy="-46" r="13" fill="#6BBF63" />
    </g>
  );
}
