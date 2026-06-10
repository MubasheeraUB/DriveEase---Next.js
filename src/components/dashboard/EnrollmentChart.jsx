"use client";

import { useEffect, useState } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from "recharts";

export default function EnrollmentChart() {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/enrollment-chart")
      .then(r => r.json()).then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0] h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-[#0F172A]">Student Enrollment</h3>
          <p className="text-[10px] text-[#64748B] mt-0.5">Last 6 months</p>
        </div>
        <span className="bg-[#F8FAFC] rounded-lg px-2.5 py-1 text-[10px] text-[#64748B] border border-[#E2E8F0]">6 Months</span>
      </div>
      <div className="flex-1 min-h-[160px]">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="w-6 h-6 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <XAxis dataKey="month" stroke="#E2E8F0" tick={{ fontSize: 10, fill: "#64748B" }} />
              <Tooltip
                contentStyle={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "10px", fontSize: "11px" }}
                labelStyle={{ color: "#0F172A" }}
              />
              <Area dataKey="students" stroke="#2563EB" fill="#2563EB" fillOpacity={0.1} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
