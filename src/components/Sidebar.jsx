"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FaHome,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaCar,
  FaMoneyBill,
  FaChartBar,
  FaCog,
  FaBars,
  FaCalendarAlt,
  FaBookOpen,
  FaBell,
  FaEnvelope,
  FaChevronDown,
  FaHistory,
  FaSignOutAlt,
} from "react-icons/fa";

import { useState, useEffect } from "react";

const menu = [
  {
    icon: <FaHome />,
    title: "Dashboard",
    path: "/dashboard",
  },
  {
    icon: <FaUserGraduate />,
    title: "Students",
    path: "/students",
  },
  {
    icon: <FaChalkboardTeacher />,
    title: "Instructors",
    path: "/instructors",
  },
  {
    icon: <FaBookOpen />,
    title: "Courses",
    path: "/courses",
  },
  {
    icon: <FaCar />,
    title: "Vehicles",
    path: "/vehicles",
  },
  {
    icon: <FaCalendarAlt />,
    title: "Schedule",
    path: "/training-schedules",
  },
  {
    icon: <FaMoneyBill />,
    title: "Payments",
    path: "/payments",
  },
  {
    icon: <FaChartBar />,
    title: "Reports",
    path: "/reports",
  },
  {
    icon: <FaEnvelope />,
    title: "Messages",
    path: "/messages",
    badgeKey: "messages",
  },
  {
    icon: <FaBell />,
    title: "Notifications",
    path: "/notifications",
    badgeKey: "notifications",
  },
  {
    icon: <FaCog />,
    title: "Settings",
    path: "/settings",
  },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const pathname = usePathname();
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [counts, setCounts] = useState({ messages: 0, notifications: 0 });

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;
    const hdr = { Authorization: `Bearer ${token}` };

    const loadCounts = async () => {
      try {
        const [m, n] = await Promise.all([
          fetch("/api/messages/stats", { headers: hdr }).then((r) => r.json()),
          fetch("/api/notifications/stats", { headers: hdr }).then((r) => r.json()),
        ]);
        setCounts({
          messages: m?.unread || 0,
          notifications: n?.unread || 0,
        });
      } catch {}
    };

    loadCounts();
    // Refresh counts when navigating between pages and every 60s
    const interval = setInterval(loadCounts, 60000);
    return () => clearInterval(interval);
  }, [pathname]);

  const handleActivityLog = () => {
    router.push("/activity-log");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    document.cookie = "token=; path=/; max-age=0";
    router.push("/login");
  };

  return (
    <aside
      className={`bg-white border-r border-[#E2E8F0] shadow-xl flex flex-col h-screen sticky top-0 transition-all duration-300 ease-in-out
        ${collapsed ? "w-[64px]" : "w-[220px]"}
      `}
    >
      {/* HEADER */}
      <div
        className={`border-b  border-[#E2E8F0] px-3 py-3
          ${
            collapsed
              ? "flex justify-center"
              : "flex items-center justify-between"
          }
        `}
      >
        {!collapsed && (
          <div>
            <h1 className="text-2xl font-extrabold leading-none">
              <span className="text-[#0F172A]">Drive</span>
              <span className="text-[#2563EB]">Ease</span>
            </h1>

            <p className="text-[10px] text-[#64748B] mt-1">
              Driving School Management
            </p>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className=" text-[#64748B] hover:text-[#2563EB] transition-all text-lg"
        >
          <FaBars />
        </button>
      </div>

      {/* MENU */}

      <nav className="flex-1 overflow-y-auto px-2 py-2">
        <div className="space-y-1">
          {menu.map((item) => {
            const isActive =
              pathname === item.path || pathname.startsWith(item.path + "/");
            const badge = item.badgeKey ? counts[item.badgeKey] : 0;

            return (
              <Link
                key={item.title}
                href={item.path}
                title={collapsed ? item.title : ""}
                className={`relative flex items-center h-11 rounded-xl transition-all duration-300
                  ${collapsed ? "justify-center" : "px-2.5 gap-2.5"}

                  ${
                    isActive
                      ? "bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white shadow-md"
                      : "text-[#64748B] hover:bg-[#EFF6FF] hover:text-[#2563EB] hover:translate-x-1"
                  }
                `}
              >
                {isActive && (
                  <div className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-full bg-[#10B981]" />
                )}

                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0
                    ${isActive ? "bg-white/20" : "bg-[#F1F5F9]"}
                  `}
                >
                  {item.icon}
                </div>

                {!collapsed && (
                  <>
                    <span className="flex-1 text-sm font-medium truncate">
                      {item.title}
                    </span>

                    {badge > 0 && (
                      <span className="bg-[#EF4444] text-white text-[10px] px-1.5 py-0.5 rounded-full font-semibold">
                        {badge > 99 ? "99+" : badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* FOOTER */}

      <div className="border-t border-[#E2E8F0] p-2 space-y-2">
        <div
          className={`bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-2
            ${collapsed ? "flex justify-center" : "flex items-center gap-2"}
          `}
        >
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#3B82F6] text-white flex items-center justify-center font-bold">
              A
            </div>

            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#22C55E] border border-white"></div>
          </div>

          {!collapsed && (
            <div className="overflow-hidden flex-1 relative">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#0F172A] truncate">
                    Zaiba Mirisha
                  </p>

                  <p className="text-[10px] text-[#64748B]">Administrator</p>

                  <p className="text-[10px] text-[#22C55E] mt-1">● Online</p>
                </div>

                {/* Dropdown Button */}

                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="p-1.5 rounded-lg text-[#64748B] hover:bg-[#E2E8F0] hover:text-[#2563EB] transition-all"
                >
                  <FaChevronDown
                    className={`transition-transform duration-200 ${
                      showProfileMenu ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>

              {/* Dropdown Menu */}

              {showProfileMenu && (
                <div className="absolute right-0 top-14 w-40 bg-white border border-[#E2E8F0] rounded-xl shadow-xl overflow-hidden z-50">
                  <button
                    onClick={handleActivityLog}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#64748B] hover:bg-[#EFF6FF] hover:text-[#2563EB] transition-all"
                  >
                    <FaHistory />
                    <span>Activity Log</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#64748B] hover:bg-red-50 hover:text-[#EF4444] transition-all"
                  >
                    <FaSignOutAlt />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
