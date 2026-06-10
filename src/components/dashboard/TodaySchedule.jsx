"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaCalendarAlt } from "react-icons/fa";

const statusColors = {
  scheduled: "bg-blue-50 text-[#2563EB] border-blue-200",
  completed:  "bg-emerald-50 text-emerald-600 border-emerald-200",
  cancelled:  "bg-red-50 text-[#EF4444] border-red-200",
  ongoing:    "bg-orange-50 text-[#F59E0B] border-orange-200",
};

export default function TodaySchedule() {
  const [schedules, setSchedules] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/dashboard/today-schedule")
      .then(r => r.json()).then(d => setSchedules(Array.isArray(d) ? d : []))
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0] h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FaCalendarAlt className="text-[#2563EB] text-sm" />
          <h3 className="text-sm font-semibold text-[#0F172A]">Today's Schedule</h3>
        </div>
        <button onClick={() => router.push("/training-schedules")}
          className="text-[10px] text-[#2563EB] hover:text-[#1D4ED8] transition">View All →</button>
      </div>

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="w-5 h-5 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : schedules.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-[#64748B]">
          <FaCalendarAlt className="text-2xl mb-2" />
          <p className="text-xs">No classes today</p>
        </div>
      ) : (
        <div className="space-y-2.5 overflow-y-auto flex-1">
          {schedules.map(item => (
            <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#F8FAFC] transition">
              <div className="text-[#2563EB] font-semibold text-xs w-14 shrink-0">{item.startTime}</div>
              <div className="flex-1 min-w-0">
                <p className="text-[#0F172A] text-xs font-medium truncate">{item.sessionType}</p>
                <p className="text-[#64748B] text-[10px] truncate">{item.student?.fullName} · {item.driver?.fullName}</p>
              </div>
              <span className={`border px-2 py-0.5 rounded-md text-[9px] font-medium capitalize ${statusColors[item.status] || statusColors.scheduled}`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
