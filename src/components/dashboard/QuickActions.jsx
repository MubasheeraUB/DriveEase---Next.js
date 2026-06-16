"use client";

import { useRouter } from "next/navigation";
import { FaUserPlus, FaCar, FaCalendarAlt, FaChartBar, FaChalkboardTeacher, FaMoneyBillWave } from "react-icons/fa";

export default function QuickActions() {
  const router = useRouter();

  const actions = [
    { icon: <FaUserPlus />,          title: "Add Student",    color: "text-[#2563EB]",  onClick: () => router.push("/students?new=1") },
    { icon: <FaChalkboardTeacher />, title: "Add Instructor", color: "text-purple-600",  onClick: () => router.push("/instructors?new=1") },
    { icon: <FaCar />,               title: "Add Vehicle",    color: "text-[#10B981]",  onClick: () => router.push("/vehicles?new=1") },
    { icon: <FaCalendarAlt />,       title: "Schedule",       color: "text-[#F59E0B]",  onClick: () => router.push("/training-schedules?new=1") },
    { icon: <FaMoneyBillWave />,     title: "Record Payment", color: "text-pink-500",   onClick: () => router.push("/payments?new=1") },
    { icon: <FaChartBar />,          title: "Reports",        color: "text-cyan-500",   onClick: () => router.push("/reports") },
  ];

  return (
    <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0] h-full flex flex-col">
      <h3 className="text-sm font-semibold text-[#0F172A] mb-3">Quick Actions</h3>
      <div className="grid grid-cols-3 gap-2 flex-1">
        {actions.map(a => (
          <button key={a.title} onClick={a.onClick}
            className="bg-[#F8FAFC] rounded-xl flex flex-col justify-center items-center gap-1.5 py-3 hover:bg-[#DBEAFE] hover:border-[#2563EB]/20 border border-[#E2E8F0] transition group">
            <span className={`text-base ${a.color} group-hover:scale-110 transition-transform`}>{a.icon}</span>
            <span className="text-[10px] text-[#64748B] group-hover:text-[#2563EB] text-center leading-tight">{a.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
