"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaBell, FaSearch } from "react-icons/fa";

const PAGE_TITLES = {
  "/dashboard":          "Dashboard",
  "/students":           "Students",
  "/instructors":        "Instructors",
  "/courses":            "Courses",
  "/vehicles":           "Vehicles",
  "/training-schedules": "Classes & Schedule",
  "/payments":           "Payments",
  "/reports":            "Reports",
  "/messages":           "Messages",
  "/notifications":      "Notifications",
  "/settings":           "Settings",
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const title = Object.entries(PAGE_TITLES).find(([k]) => pathname.startsWith(k))?.[1] || "DriveEase";

  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;
    const hdr = { Authorization: `Bearer ${token}` };

    const loadUnread = async () => {
      try {
        const r = await fetch("/api/notifications/stats", { headers: hdr });
        const d = await r.json();
        setUnread(d?.unread || 0);
      } catch {}
    };

    loadUnread();
    const interval = setInterval(loadUnread, 60000);
    return () => clearInterval(interval);
  }, [pathname]);

  const today  = new Date();
  const dateStr = today.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const dayStr  = today.toLocaleDateString("en-IN", { weekday: "short" });

  return (
    <div className="flex justify-between items-center px-5 py-3 border-b border-[#E2E8F0] bg-white sticky top-0 z-10">
      <div>
        <h1 className="text-base font-bold text-[#0F172A]">{title}</h1>
        <p className="text-[#64748B] text-xs">{dayStr}, {dateStr}</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] text-xs" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl h-8 w-48 pl-8 pr-3 text-xs outline-none text-[#0F172A] placeholder-[#64748B] focus:border-[#2563EB] transition"
          />
        </div>

        <button
          onClick={() => router.push("/notifications")}
          title="Notifications"
          className="relative w-8 h-8 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-[#DBEAFE] transition"
        >
          <FaBell className="text-sm" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#2563EB] text-[9px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center font-bold text-white">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </button>

        <div className="w-8 h-8 rounded-xl bg-[#2563EB] flex items-center justify-center text-sm font-bold text-white">
          A
        </div>
      </div>
    </div>
  );
}
