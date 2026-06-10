"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  FaHome, FaUserGraduate, FaChalkboardTeacher, FaCar,
  FaMoneyBill, FaChartBar, FaCog, FaBars, FaCalendarAlt,
  FaBookOpen, FaBell, FaEnvelope, FaSignOutAlt,
} from "react-icons/fa";

const menu = [
  { icon: <FaHome />,              title: "Dashboard",          path: "/dashboard" },
  { icon: <FaUserGraduate />,      title: "Students",           path: "/students" },
  { icon: <FaChalkboardTeacher />, title: "Instructors",        path: "/instructors" },
  { icon: <FaBookOpen />,          title: "Courses",            path: "/courses" },
  { icon: <FaCar />,               title: "Vehicles",           path: "/vehicles" },
  { icon: <FaCalendarAlt />,       title: "Classes & Schedule", path: "/training-schedules" },
  { icon: <FaMoneyBill />,         title: "Payments",           path: "/payments" },
  { icon: <FaChartBar />,          title: "Reports",            path: "/reports" },
  { icon: <FaEnvelope />,          title: "Messages",           path: "/messages" },
  { icon: <FaBell />,              title: "Notifications",      path: "/notifications" },
  { icon: <FaCog />,               title: "Settings",           path: "/settings" },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    document.cookie = "token=; path=/; max-age=0";
    router.push("/login");
  };

  return (
    <aside
      className={`
        bg-white border-r border-[#E2E8F0] flex flex-col
        transition-all duration-300 ease-in-out h-screen sticky top-0
        ${collapsed ? "w-[64px]" : "w-[220px]"}
      `}
    >
      {/* Logo */}
      <div className={`flex items-center border-b border-[#E2E8F0] h-12 px-3 ${collapsed ? "justify-center" : "justify-between"}`}>
        <div className={`overflow-hidden transition-all duration-300 ${collapsed ? "w-0 opacity-0" : "w-auto opacity-100"}`}>
          <span className="text-base font-extrabold whitespace-nowrap">
            <span className="text-[#0F172A]">Drive</span><span className="text-[#2563EB]">Ease</span>
          </span>
        </div>
        <button onClick={() => setCollapsed(!collapsed)}
          className="text-[#64748B] hover:text-[#0F172A] text-base transition-colors flex-shrink-0 p-1">
          <FaBars />
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {menu.map((item) => {
          const isActive = pathname === item.path || pathname.startsWith(item.path + "/");
          return (
            <Link key={item.title} href={item.path} title={collapsed ? item.title : ""}
              className={`
                w-full flex items-center px-2.5 py-2 rounded-xl
                transition-all duration-150 text-sm
                ${collapsed ? "justify-center" : "gap-3"}
                ${isActive
                  ? "bg-[#2563EB] text-white"
                  : "text-[#64748B] hover:bg-[#DBEAFE] hover:text-[#2563EB]"}
              `}>
              <span className="text-base flex-shrink-0">{item.icon}</span>
              {!collapsed && <span className="whitespace-nowrap font-medium truncate">{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-2 border-t border-[#E2E8F0] space-y-1">
        <button onClick={handleLogout} title={collapsed ? "Logout" : ""}
          className={`w-full flex items-center px-2.5 py-2 rounded-xl text-[#64748B] hover:text-[#EF4444] hover:bg-red-50 transition-all text-sm ${collapsed ? "justify-center" : "gap-3"}`}>
          <span className="text-base flex-shrink-0"><FaSignOutAlt /></span>
          {!collapsed && <span className="font-medium">Logout</span>}
        </button>

        <div className={`flex items-center px-2.5 py-2 rounded-xl bg-[#F8FAFC] ${collapsed ? "justify-center" : "gap-2.5"}`}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#2563EB] text-white text-xs font-bold flex-shrink-0">A</div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-[#0F172A] truncate">Admin User</p>
              <p className="text-[10px] text-[#64748B] truncate">Administrator</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
