"use client";

import { useEffect, useState } from "react";
import {
  FaUsers, FaChalkboardTeacher, FaCar, FaBook,
  FaMoneyBillWave, FaCalendarCheck, FaSync, FaDownload,
} from "react-icons/fa";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend,
} from "recharts";

const PIE_COLORS   = ["#2563eb","#10b981","#ef4444","#f59e0b","#7c3aed","#06b6d4"];
const BAR_COLORS   = ["#2563eb","#10b981","#7c3aed","#f59e0b","#ef4444"];

function SummaryCard({ title, value, sub, icon, color, trend }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0]">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs text-white ${color}`}>{icon}</div>
        {trend !== undefined && (
          <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-lg">+{trend}%</span>
        )}
      </div>
      <h3 className="text-lg font-bold text-[#0F172A]">{value}</h3>
      <p className="text-[#64748B] text-[10px] mt-0.5">{title}</p>
      {sub && <p className="text-[#64748B] text-[10px] mt-1">{sub}</p>}
    </div>
  );
}

function ChartCard({ title, sub, children, action }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0] flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-[#0F172A]">{title}</h3>
          {sub && <p className="text-[10px] text-[#64748B] mt-0.5">{sub}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs shadow-xl">
      <p className="text-[#64748B] mb-1">{label}</p>
      {payload.map((p,i)=>(
        <p key={i} style={{color:p.color}} className="font-medium">
          {p.name}: {typeof p.value === "number" && p.name?.toLowerCase().includes("revenue")
            ? `₹${p.value.toLocaleString("en-IN")}` : p.value}
        </p>
      ))}
    </div>
  );
};

export default function ReportsPage() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState("overview");

  const token = () => localStorage.getItem("token");

  const fetchData = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/reports/stats", { headers:{ Authorization:`Bearer ${token()}` }});
      setData(await r.json());
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const s = data?.summary;
  const fmt = n => n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : n >= 1000 ? `₹${(n/1000).toFixed(1)}k` : `₹${n||0}`;

  const tabs = [
    { id:"overview",  label:"Overview"  },
    { id:"students",  label:"Students"  },
    { id:"revenue",   label:"Revenue"   },
    { id:"courses",   label:"Courses"   },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#0F172A]">Reports & Analytics</h1>
          <p className="text-[#64748B] text-xs mt-0.5">Live data across all modules</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData}
            className="flex items-center gap-1.5 bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#E2E8F0] px-3 py-2 rounded-xl text-xs transition text-[#64748B]">
            <FaSync className="text-[10px]"/> Refresh
          </button>
          <button className="flex items-center gap-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] px-3 py-2 rounded-xl text-xs transition text-white">
            <FaDownload className="text-[10px]"/> Export
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#F8FAFC] rounded-xl p-1 w-fit">
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition ${
              tab===t.id ? "bg-blue-600 text-white" : "text-[#64748B] hover:text-[#0F172A]"
            }`}>{t.label}</button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {tab === "overview" && (
        <>
          {/* KPI Grid */}
          <div className="grid grid-cols-6 gap-3">
            <SummaryCard title="Total Students"      value={s?.totalStudents}      icon={<FaUsers/>}              color="bg-blue-600"    trend={12}/>
            <SummaryCard title="Active Instructors"  value={s?.activeInstructors}  icon={<FaChalkboardTeacher/>}  color="bg-purple-600"  trend={4}/>
            <SummaryCard title="Active Vehicles"     value={s?.activeVehicles}     icon={<FaCar/>}                color="bg-emerald-600" trend={2}/>
            <SummaryCard title="Active Courses"      value={s?.activeCourses}      icon={<FaBook/>}               color="bg-amber-600"/>
            <SummaryCard title="Total Revenue"       value={fmt(s?.totalRevenue)}  icon={<FaMoneyBillWave/>}      color="bg-pink-600"    trend={8}/>
            <SummaryCard title="Class Completion"    value={`${s?.completionRate}%`} icon={<FaCalendarCheck/>}    color="bg-cyan-600"    sub={`${s?.completedSchedules}/${s?.totalSchedules} sessions`}/>
          </div>

          {/* Two charts */}
          <div className="grid grid-cols-2 gap-4">
            <ChartCard title="Student Enrollment Trend" sub="Last 6 months"
              action={<span className="bg-blue-50 text-[#2563EB] text-[10px] px-2 py-0.5 rounded-lg">Monthly</span>}>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data?.enrollmentTrend} margin={{top:4,right:4,left:-20,bottom:0}}>
                    <XAxis dataKey="month" tick={{fontSize:9,fill:"#64748b"}} stroke="#E2E8F0"/>
                    <YAxis tick={{fontSize:9,fill:"#64748b"}} stroke="#E2E8F0"/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Area dataKey="count" name="Students" stroke="#2563eb" fill="#2563eb" fillOpacity={0.15} strokeWidth={2}/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <ChartCard title="Revenue Trend" sub="Last 6 months"
              action={<span className="bg-emerald-50 text-emerald-600 text-[10px] px-2 py-0.5 rounded-lg">Monthly</span>}>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data?.revenueTrend} margin={{top:4,right:4,left:-10,bottom:0}}>
                    <XAxis dataKey="month" tick={{fontSize:9,fill:"#64748b"}} stroke="#E2E8F0"/>
                    <YAxis tick={{fontSize:9,fill:"#64748b"}} stroke="#E2E8F0" tickFormatter={v=>v>=1000?`${v/1000}k`:v}/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Area dataKey="amount" name="Revenue" stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeWidth={2}/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>

          {/* Revenue summary cards */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label:"Total Billed",     value:fmt(s?.totalBilled),      color:"text-[#2563EB]",    bg:"bg-blue-50" },
              { label:"Total Collected",  value:fmt(s?.totalRevenue),     color:"text-emerald-600", bg:"bg-emerald-50" },
              { label:"Pending Balance",  value:fmt(s?.pendingBalance),   color:"text-[#EF4444]",     bg:"bg-red-50" },
            ].map(c=>(
              <div key={c.label} className={`${c.bg} rounded-2xl p-4 border border-[#E2E8F0]`}>
                <p className="text-[#64748B] text-xs mb-1">{c.label}</p>
                <h3 className={`text-2xl font-bold ${c.color}`}>{c.value}</h3>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── STUDENTS TAB ── */}
      {tab === "students" && (
        <div className="grid grid-cols-2 gap-4">
          <ChartCard title="Student Status Breakdown" sub="All enrolled students">
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data?.studentStatusBreakdown} dataKey="value" nameKey="name"
                    cx="50%" cy="50%" outerRadius={80} paddingAngle={3} label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`}
                    labelLine={false}>
                    {data?.studentStatusBreakdown?.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
                  </Pie>
                  <Tooltip contentStyle={{background:"#FFFFFF",border:"1px solid #E2E8F0",borderRadius:"10px",fontSize:"11px"}}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-around mt-2">
              {data?.studentStatusBreakdown?.map((d,i)=>(
                <div key={d.name} className="flex items-center gap-1.5 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full" style={{background:PIE_COLORS[i%PIE_COLORS.length]}}/>
                  <span className="text-[#64748B] capitalize">{d.name}: </span>
                  <span className="text-[#0F172A] font-medium">{d.value}</span>
                </div>
              ))}
            </div>
          </ChartCard>

          <ChartCard title="Monthly Enrollment" sub="New students per month">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.enrollmentTrend} margin={{top:4,right:4,left:-20,bottom:0}}>
                  <XAxis dataKey="month" tick={{fontSize:9,fill:"#64748b"}} stroke="#E2E8F0"/>
                  <YAxis tick={{fontSize:9,fill:"#64748b"}} stroke="#E2E8F0"/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Bar dataKey="count" name="Students" fill="#2563eb" radius={[4,4,0,0]}>
                    {data?.enrollmentTrend?.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Student metrics */}
          <div className="col-span-2 grid grid-cols-4 gap-3">
            {[
              { label:"Total Students",       value:s?.totalStudents,       color:"bg-blue-600" },
              { label:"Active",               value:s?.activeStudents,      color:"bg-emerald-600" },
              { label:"Inactive",             value:(s?.totalStudents||0)-(s?.activeStudents||0), color:"bg-red-600" },
              { label:"New This Month",       value:s?.newStudentsThisMonth, color:"bg-purple-600" },
            ].map(c=>(
              <div key={c.label} className="bg-white rounded-2xl p-4 border border-[#E2E8F0]">
                <div className={`w-8 h-1.5 rounded-full mb-3 ${c.color}`}/>
                <h3 className="text-2xl font-bold text-[#0F172A]">{c.value}</h3>
                <p className="text-[#64748B] text-xs mt-1">{c.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── REVENUE TAB ── */}
      {tab === "revenue" && (
        <div className="grid grid-cols-2 gap-4">
          <ChartCard title="Revenue by Payment Method" sub="All time">
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data?.paymentMethodBreakdown} dataKey="amount" nameKey="method"
                    cx="50%" cy="50%" outerRadius={80} paddingAngle={3}>
                    {data?.paymentMethodBreakdown?.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
                  </Pie>
                  <Tooltip contentStyle={{background:"#FFFFFF",border:"1px solid #E2E8F0",borderRadius:"10px",fontSize:"11px"}}
                    formatter={v=>`₹${Number(v).toLocaleString("en-IN")}`}/>
                  <Legend iconSize={10} wrapperStyle={{fontSize:"10px"}}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {data?.paymentMethodBreakdown?.map((d,i)=>(
                <div key={d.method} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{background:PIE_COLORS[i%PIE_COLORS.length]}}/>
                    <span className="text-[#64748B] capitalize">{d.method}</span>
                  </div>
                  <span className="text-[#0F172A] font-medium">₹{d.amount.toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>
          </ChartCard>

          <ChartCard title="Monthly Revenue" sub="Last 6 months">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.revenueTrend} margin={{top:4,right:4,left:-10,bottom:0}}>
                  <XAxis dataKey="month" tick={{fontSize:9,fill:"#64748b"}} stroke="#E2E8F0"/>
                  <YAxis tick={{fontSize:9,fill:"#64748b"}} stroke="#E2E8F0" tickFormatter={v=>v>=1000?`${v/1000}k`:v}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Bar dataKey="amount" name="Revenue" fill="#10b981" radius={[4,4,0,0]}>
                    {data?.revenueTrend?.map((_,i)=><Cell key={i} fill={i%2===0?"#2563eb":"#10b981"}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <div className="col-span-2 grid grid-cols-3 gap-3">
            {[
              { label:"Total Billed",     value:fmt(s?.totalBilled),    sub:"Across all students",   color:"text-[#2563EB]",   bg:"bg-blue-50" },
              { label:"Total Collected",  value:fmt(s?.totalRevenue),   sub:"Payments received",     color:"text-emerald-600", bg:"bg-emerald-50" },
              { label:"Pending Balance",  value:fmt(s?.pendingBalance), sub:"Yet to be collected",   color:"text-[#EF4444]",   bg:"bg-red-50" },
            ].map(c=>(
              <div key={c.label} className={`${c.bg} rounded-2xl p-5 border border-[#E2E8F0]`}>
                <p className="text-[#64748B] text-xs mb-2">{c.label}</p>
                <h3 className={`text-3xl font-bold ${c.color}`}>{c.value}</h3>
                <p className="text-[#64748B] text-[10px] mt-2">{c.sub}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── COURSES TAB ── */}
      {tab === "courses" && (
        <div className="grid grid-cols-2 gap-4">
          <ChartCard title="Top Courses by Enrollment" sub="Most popular courses">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.topCourses} layout="vertical" margin={{top:4,right:16,left:4,bottom:0}}>
                  <XAxis type="number" tick={{fontSize:9,fill:"#64748b"}} stroke="#E2E8F0"/>
                  <YAxis type="category" dataKey="name" width={100} tick={{fontSize:9,fill:"#94a3b8"}} stroke="#E2E8F0"/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Bar dataKey="enrollments" name="Enrollments" fill="#7c3aed" radius={[0,4,4,0]}>
                    {data?.topCourses?.map((_,i)=><Cell key={i} fill={BAR_COLORS[i%BAR_COLORS.length]}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Course Summary">
            <div className="space-y-3 mt-2">
              {data?.topCourses?.map((c,i)=>(
                <div key={c.name} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold text-white"
                    style={{background:BAR_COLORS[i%BAR_COLORS.length]}}>
                    {i+1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-[#0F172A] font-medium truncate">{c.name}</p>
                      <span className="text-xs text-[#64748B] ml-2 shrink-0">{c.enrollments}</span>
                    </div>
                    <div className="h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all"
                        style={{width:`${Math.min(100,((c.enrollments||0)/(data?.summary?.totalStudents||1))*100)}%`,background:BAR_COLORS[i%BAR_COLORS.length]}}/>
                    </div>
                    <p className="text-[10px] text-[#64748B] mt-0.5 capitalize">{c.category}</p>
                  </div>
                </div>
              ))}
              {(!data?.topCourses || data.topCourses.length === 0) && (
                <p className="text-[#64748B] text-xs text-center py-8">No course data yet</p>
              )}
            </div>
          </ChartCard>

          <div className="col-span-2 grid grid-cols-4 gap-3">
            {[
              { label:"Total Courses",     value:s?.totalCourses,     color:"bg-blue-600" },
              { label:"Active",            value:s?.activeCourses,    color:"bg-emerald-600" },
              { label:"Total Instructors", value:s?.totalInstructors, color:"bg-purple-600" },
              { label:"Total Schedules",   value:s?.totalSchedules,   color:"bg-orange-600" },
            ].map(c=>(
              <div key={c.label} className="bg-white rounded-2xl p-4 border border-[#E2E8F0]">
                <div className={`w-8 h-1.5 rounded-full mb-3 ${c.color}`}/>
                <h3 className="text-2xl font-bold text-[#0F172A]">{c.value}</h3>
                <p className="text-[#64748B] text-xs mt-1">{c.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
