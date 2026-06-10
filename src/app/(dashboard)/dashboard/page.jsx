"use client";

import { useEffect, useState } from "react";
import {
  FaUsers, FaChalkboardTeacher, FaCar, FaCalendarCheck, FaMoneyBillWave,
} from "react-icons/fa";
import EnrollmentChart   from "@/components/dashboard/EnrollmentChart";
import TodaySchedule     from "@/components/dashboard/TodaySchedule";
import RevenueOverview   from "@/components/dashboard/RevenueOverview";
import RecentEnrollments from "@/components/dashboard/RecentEnrollments";
import QuickActions      from "@/components/dashboard/QuickActions";

const STAT_CARDS = (d) => [
  { title: "Total Students",   value: d.totalStudents  || 0,           icon: <FaUsers />,            color: "bg-blue-600",    change: "+12.5%" },
  { title: "Instructors",      value: d.totalDrivers   || 0,           icon: <FaChalkboardTeacher />, color: "bg-purple-600",  change: "+4.3%"  },
  { title: "Active Vehicles",  value: d.totalVehicles  || 0,           icon: <FaCar />,              color: "bg-emerald-600", change: "+2.1%"  },
  { title: "Today's Classes",  value: d.totalSchedules || 0,           icon: <FaCalendarCheck />,    color: "bg-orange-600",  change: "scheduled" },
  { title: "Total Revenue",    value: `₹${(d.totalRevenue||0).toLocaleString("en-IN")}`, icon: <FaMoneyBillWave />, color: "bg-pink-600", change: "+8.7%" },
];

function StatCard({ title, value, icon, color, change }) {
  const isPositive = change.startsWith("+");
  return (
    <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0] hover:border-[#2563EB]/30 hover:shadow-md transition-all group">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm text-white ${color}`}>
          {icon}
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-lg ${isPositive ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-[#2563EB]"}`}>
          {change}
        </span>
      </div>
      <p className="text-[#64748B] text-xs mb-1">{title}</p>
      <h3 className="text-xl font-bold text-[#0F172A]">{value}</h3>
    </div>
  );
}

export default function DashboardHome() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then(r => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#0F172A]">Dashboard</h1>
        <p className="text-[#64748B] text-xs mt-0.5">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-5 gap-4">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-[#E2E8F0] animate-pulse h-24" />
            ))
          : data
            ? STAT_CARDS(data).map(c => <StatCard key={c.title} {...c} />)
            : null
        }
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-7">
          <EnrollmentChart />
        </div>
        <div className="col-span-5">
          <TodaySchedule />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-4">
          <RevenueOverview />
        </div>
        <div className="col-span-4">
          <RecentEnrollments />
        </div>
        <div className="col-span-4">
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
