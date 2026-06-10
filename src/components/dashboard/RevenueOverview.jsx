"use client";

import { useEffect, useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { FaMoneyBillWave } from "react-icons/fa";

const COLORS = ["#2563eb", "#7c3aed", "#10b981", "#f59e0b", "#ef4444"];

export default function RevenueOverview() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/revenue-overview")
      .then(r => r.json()).then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  const fmt = n => n >= 1000 ? `₹${(n / 1000).toFixed(1)}k` : `₹${n || 0}`;

  return (
    <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0] h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FaMoneyBillWave className="text-[#10B981] text-sm" />
          <h3 className="text-sm font-semibold text-[#0F172A]">Revenue</h3>
        </div>
        <span className="bg-[#F8FAFC] rounded-lg px-2.5 py-1 text-[10px] text-[#64748B] border border-[#E2E8F0]">This Month</span>
      </div>

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="w-5 h-5 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex gap-4 items-center flex-1">
          <div className="w-24 shrink-0">
            <CircularProgressbar
              value={data?.collectionRate || 0}
              text={fmt(data?.total)}
              styles={buildStyles({
                textSize: "13px",
                textColor: "#0F172A",
                pathColor: "#2563EB",
                trailColor: "#E2E8F0",
              })}
            />
          </div>
          <div className="space-y-2 flex-1">
            {data?.breakdown?.length > 0 ? (
              data.breakdown.map((item, i) => (
                <div key={item.method} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-[#64748B] text-xs capitalize">{item.method}</span>
                  </div>
                  <span className="text-[#0F172A] font-medium text-xs">₹{item.amount.toLocaleString("en-IN")}</span>
                </div>
              ))
            ) : (
              <p className="text-[#64748B] text-xs">No payments this month</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
