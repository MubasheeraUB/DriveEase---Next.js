"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaUserGraduate } from "react-icons/fa";

const avatarColors = ["bg-blue-600","bg-purple-600","bg-emerald-600","bg-orange-600","bg-pink-600"];

export default function RecentEnrollments() {
  const [students, setStudents] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/dashboard/recent-enrollments")
      .then(r => r.json()).then(d => setStudents(d))
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  const initials = n => n?.split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase() || "?";
  const fmtDate  = d => new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"short" });

  return (
    <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0] h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FaUserGraduate className="text-[#2563EB] text-sm" />
          <h3 className="text-sm font-semibold text-[#0F172A]">Recent Enrollments</h3>
        </div>
        <button onClick={() => router.push("/students")}
          className="text-[10px] text-[#2563EB] hover:text-[#1D4ED8] transition">View All →</button>
      </div>
      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="w-5 h-5 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : students.length === 0 ? (
        <p className="text-[#64748B] text-xs text-center py-6">No enrollments yet</p>
      ) : (
        <div className="space-y-2.5 flex-1">
          {students.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#F8FAFC] transition">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold text-white flex-shrink-0 ${avatarColors[i % avatarColors.length]}`}>
                {initials(s.fullName)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#0F172A] text-xs font-medium truncate">{s.fullName}</p>
                <p className="text-[#64748B] text-[10px]">{fmtDate(s.joiningDate)}</p>
              </div>
              <span className="bg-blue-50 text-[#2563EB] border border-blue-200 px-2 py-0.5 rounded-md text-[9px] font-medium whitespace-nowrap">
                {s.coursePackage}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
