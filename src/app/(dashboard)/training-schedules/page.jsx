"use client";

import { useEffect, useState, useCallback } from "react";
import {
  FaCalendarAlt, FaCalendarCheck, FaCalendarDay, FaCheckCircle,
  FaSearch, FaFilter, FaSync, FaPlus, FaFileExport,
  FaEllipsisV, FaEdit, FaTrash, FaEye, FaClock, FaCar, FaUserGraduate, FaChalkboardTeacher,
} from "react-icons/fa";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS_STATUS = ["#2563eb", "#10b981", "#ef4444", "#f59e0b"];
const COLORS_TYPE = ["#2563eb", "#7c3aed", "#06b6d4", "#f59e0b", "#10b981"];

const SESSION_TYPES = ["Practical", "Theory", "Test Preparation", "Mock Test", "Highway Driving"];

const statusConfig = {
  scheduled: { label: "Scheduled", cls: "bg-blue-50 text-[#2563EB] border border-blue-200" },
  completed: { label: "Completed", cls: "bg-emerald-50 text-emerald-600 border border-emerald-200" },
  cancelled: { label: "Cancelled", cls: "bg-red-50 text-[#EF4444] border border-red-200" },
  pending:   { label: "Pending",   cls: "bg-amber-50 text-amber-600 border border-amber-200" },
};

const avatarColors = ["bg-blue-600","bg-purple-600","bg-emerald-600","bg-orange-600","bg-pink-600","bg-cyan-600"];

function schId(id) { return `SCH-${String(id).padStart(3,"0")}`; }
function initials(name) { return name?.split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase() || "?"; }
function fmtDate(d) { return d ? new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }) : "—"; }

function DonutCard({ title, data, colors, total }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-[#0F172A] text-sm">{title}</h3>
      </div>
      {data?.length > 0 ? (
        <div className="flex items-center gap-3">
          <div className="w-20 h-20 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={25} outerRadius={38} paddingAngle={2}>
                  {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background:"#FFFFFF", border:"1px solid #E2E8F0", borderRadius:"10px", fontSize:"11px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-1.5">
            {data.map((d, i) => {
              const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
              return (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: colors[i % colors.length] }} />
                    <span className="text-[#64748B] truncate max-w-[110px] capitalize">{d.name}</span>
                  </div>
                  <span className="text-[#0F172A] font-medium ml-1">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="text-[#64748B] text-xs text-center py-6">No data</p>
      )}
    </div>
  );
}

function ScheduleModal({ schedule, students, drivers, vehicles, onClose, onSave }) {
  const isEdit = !!schedule?.id;
  const blank = {
    studentId: "", driverId: "", vehicleId: "",
    trainingDate: "", startTime: "", endTime: "",
    sessionType: "Practical", status: "scheduled", remarks: "",
  };
  const [form, setForm] = useState(
    isEdit
      ? {
          studentId: schedule.studentId, driverId: schedule.driverId, vehicleId: schedule.vehicleId,
          trainingDate: schedule.trainingDate ? schedule.trainingDate.slice(0, 10) : "",
          startTime: schedule.startTime, endTime: schedule.endTime,
          sessionType: schedule.sessionType, status: schedule.status, remarks: schedule.remarks || "",
        }
      : blank
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError("");
    try {
      const token = localStorage.getItem("token");
      const url = isEdit ? `/api/training-schedules/${schedule.id}` : "/api/training-schedules";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");
      onSave();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const cls = "bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:border-[#2563EB]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white border border-[#E2E8F0] rounded-3xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-[#E2E8F0]">
          <h2 className="text-xl font-semibold text-[#0F172A]">{isEdit ? "Edit Schedule" : "Add New Schedule"}</h2>
          <button onClick={onClose} className="text-[#64748B] hover:text-[#0F172A] text-xl">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#64748B]">Student *</label>
            <select value={form.studentId} onChange={e => set("studentId", e.target.value)} className={cls} required>
              <option value="">Select student</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#64748B]">Instructor *</label>
            <select value={form.driverId} onChange={e => set("driverId", e.target.value)} className={cls} required>
              <option value="">Select instructor</option>
              {drivers.map(d => <option key={d.id} value={d.id}>{d.fullName}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#64748B]">Vehicle *</label>
            <select value={form.vehicleId} onChange={e => set("vehicleId", e.target.value)} className={cls} required>
              <option value="">Select vehicle</option>
              {vehicles.map(v => <option key={v.id} value={v.id}>{v.vehicleName} ({v.vehicleNumber})</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#64748B]">Session Type</label>
            <select value={form.sessionType} onChange={e => set("sessionType", e.target.value)} className={cls}>
              {SESSION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#64748B]">Training Date *</label>
            <input type="date" value={form.trainingDate} onChange={e => set("trainingDate", e.target.value)} className={cls} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#64748B]">Start *</label>
              <input type="time" value={form.startTime} onChange={e => set("startTime", e.target.value)} className={cls} required />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#64748B]">End *</label>
              <input type="time" value={form.endTime} onChange={e => set("endTime", e.target.value)} className={cls} required />
            </div>
          </div>
          {isEdit && (
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#64748B]">Status</label>
              <select value={form.status} onChange={e => set("status", e.target.value)} className={cls}>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          )}
          <div className="col-span-2 flex flex-col gap-1">
            <label className="text-xs text-[#64748B]">Remarks</label>
            <textarea value={form.remarks} onChange={e => set("remarks", e.target.value)} rows={2}
              className={`${cls} resize-none`} />
          </div>
          {error && <p className="col-span-2 text-red-500 text-sm">{error}</p>}
          <div className="col-span-2 flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose}
              className="px-5 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#E2E8F0] text-[#0F172A] text-sm transition">Cancel</button>
            <button type="submit" disabled={saving}
              className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-medium transition disabled:opacity-50">
              {saving ? "Saving…" : isEdit ? "Update" : "Add Schedule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SchedulesPage() {
  const [stats, setStats] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [students, setStudents] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [modal, setModal] = useState(null);
  const [actionMenu, setActionMenu] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const token = () => localStorage.getItem("token");
  const authHdr = () => ({ Authorization: `Bearer ${token()}` });

  const fetchStats = async () => {
    try { const r = await fetch("/api/training-schedules/stats", { headers: authHdr() }); setStats(await r.json()); } catch {}
  };

  const fetchLookups = async () => {
    try {
      const [s, d, v] = await Promise.all([
        fetch("/api/students?limit=200", { headers: authHdr() }).then(r => r.json()),
        fetch("/api/drivers?limit=200", { headers: authHdr() }).then(r => r.json()),
        fetch("/api/vehicles", { headers: authHdr() }).then(r => r.json()),
      ]);
      setStudents(s.students || []);
      setDrivers(d.instructors || []);
      setVehicles(Array.isArray(v) ? v : v.vehicles || []);
    } catch {}
  };

  const fetchSchedules = useCallback(async (p = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: 8 });
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      if (typeFilter) params.set("sessionType", typeFilter);
      if (dateFilter) params.set("date", dateFilter);
      const r = await fetch(`/api/training-schedules?${params}`, { headers: authHdr() });
      const d = await r.json();
      setSchedules(d.schedules || []);
      setTotal(d.total || 0);
      setTotalPages(d.totalPages || 1);
    } catch {} finally { setLoading(false); }
  }, [search, statusFilter, typeFilter, dateFilter, page]);

  useEffect(() => { fetchStats(); fetchLookups(); }, []);
  useEffect(() => { fetchSchedules(page); }, [page]);

  // Open the Add modal automatically when arriving via a Quick Action (?new=1)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("new") === "1") {
      setModal({ mode: "add" });
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  const handleFilter = () => { setPage(1); fetchSchedules(1); };
  const handleReset = () => {
    setSearch(""); setStatusFilter(""); setTypeFilter(""); setDateFilter(""); setPage(1);
    setTimeout(() => fetchSchedules(1), 50);
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/training-schedules/${id}`, { method: "DELETE", headers: authHdr() });
      setDeleteConfirm(null); fetchStats(); fetchSchedules(page);
    } catch {}
  };

  const statCards = stats ? [
    { title: "Total Sessions",  value: stats.total,          icon: <FaCalendarAlt />,   color: "bg-blue-600" },
    { title: "Scheduled",       value: stats.scheduled,      icon: <FaCalendarCheck />, color: "bg-purple-600" },
    { title: "Today's Sessions",value: stats.today,          icon: <FaCalendarDay />,   color: "bg-amber-600" },
    { title: "Completion Rate", value: `${stats.completionRate}%`, icon: <FaCheckCircle />, color: "bg-emerald-600" },
  ] : [];

  const pageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) { for (let i = 1; i <= totalPages; i++) pages.push(i); }
    else {
      pages.push(1);
      if (page > 3) pages.push("...");
      for (let i = Math.max(2, page-1); i <= Math.min(totalPages-1, page+1); i++) pages.push(i);
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">Schedule</h1>
            <p className="text-[#64748B] text-sm mt-1">Manage training sessions, instructors and vehicles</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setModal({ mode: "add" })}
              className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2 rounded-xl text-sm font-medium transition">
              <FaPlus /> Add Schedule
            </button>
            <button className="flex items-center gap-2 bg-[#F8FAFC] hover:bg-[#E2E8F0] px-4 py-2 rounded-xl text-sm transition text-[#0F172A]">
              <FaFileExport /> Export
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {statCards.map(card => (
            <div key={card.title} className="bg-white rounded-2xl p-5 border border-[#E2E8F0]">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl text-white ${card.color}`}>{card.icon}</div>
                <div>
                  <p className="text-[#64748B] text-xs">{card.title}</p>
                  <h3 className="text-2xl font-bold text-[#0F172A] mt-0.5">{card.value ?? "—"}</h3>
                </div>
              </div>
            </div>
          ))}
          {!stats && [1,2,3,4].map(i => <div key={i} className="bg-white rounded-2xl p-5 border border-[#E2E8F0] animate-pulse h-24" />)}
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0] mb-5 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 flex-1 min-w-[180px]">
            <FaSearch className="text-[#64748B] text-sm" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleFilter()}
              placeholder="Search by student, instructor or vehicle..."
              className="bg-transparent text-sm text-[#0F172A] placeholder-[#64748B] flex-1 focus:outline-none" />
          </div>
          <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
            className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm text-[#64748B] focus:outline-none" />
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm text-[#64748B] focus:outline-none min-w-[140px]">
            <option value="">All Types</option>
            {SESSION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm text-[#64748B] focus:outline-none min-w-[130px]">
            <option value="">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="pending">Pending</option>
          </select>
          <button onClick={handleFilter}
            className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2 rounded-xl text-sm transition">
            <FaFilter /> Filter
          </button>
          <button onClick={handleReset}
            className="flex items-center gap-2 bg-[#F8FAFC] hover:bg-[#E2E8F0] text-[#0F172A] px-4 py-2 rounded-xl text-sm transition">
            <FaSync /> Reset
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
          <div className="p-5 border-b border-[#E2E8F0]">
            <h3 className="font-semibold text-[#0F172A]">Training Schedules</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F8FAFC] text-[#64748B] text-xs uppercase border-b border-[#E2E8F0]">
                  <th className="px-5 py-3 text-left w-8">#</th>
                  <th className="px-5 py-3 text-left">Student</th>
                  <th className="px-5 py-3 text-left">Instructor</th>
                  <th className="px-5 py-3 text-left">Vehicle</th>
                  <th className="px-5 py-3 text-left">Date</th>
                  <th className="px-5 py-3 text-left">Time</th>
                  <th className="px-5 py-3 text-left">Type</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b border-[#E2E8F0] animate-pulse">
                      {Array.from({ length: 9 }).map((_, j) => (
                        <td key={j} className="px-5 py-4"><div className="h-4 bg-[#F8FAFC] rounded-lg" /></td>
                      ))}
                    </tr>
                  ))
                ) : schedules.length === 0 ? (
                  <tr><td colSpan={9} className="text-center text-[#64748B] py-16">No schedules found</td></tr>
                ) : (
                  schedules.map((s, idx) => {
                    const rowNum = (page - 1) * 8 + idx + 1;
                    const sc = statusConfig[s.status?.toLowerCase()] || statusConfig.scheduled;
                    return (
                      <tr key={s.id} className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition">
                        <td className="px-5 py-4 text-[#64748B]">{rowNum}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white ${avatarColors[s.studentId % avatarColors.length]}`}>
                              {initials(s.student?.fullName)}
                            </div>
                            <div>
                              <p className="text-[#0F172A] font-medium">{s.student?.fullName || "—"}</p>
                              <p className="text-[#64748B] text-xs">{schId(s.id)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-[#64748B]">{s.driver?.fullName || "—"}</td>
                        <td className="px-5 py-4 text-[#64748B]">
                          <div className="flex items-center gap-1.5"><FaCar className="text-xs" /> {s.vehicle?.vehicleNumber || "—"}</div>
                        </td>
                        <td className="px-5 py-4 text-[#64748B]">{fmtDate(s.trainingDate)}</td>
                        <td className="px-5 py-4 text-[#64748B]">
                          <div className="flex items-center gap-1.5"><FaClock className="text-xs" /> {s.startTime}–{s.endTime}</div>
                        </td>
                        <td className="px-5 py-4 text-[#64748B]">{s.sessionType}</td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-lg text-xs capitalize ${sc.cls}`}>{sc.label}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="relative">
                            <button onClick={() => setActionMenu(actionMenu === s.id ? null : s.id)}
                              className="p-2 hover:bg-[#E2E8F0] rounded-lg transition text-[#64748B] hover:text-[#0F172A]">
                              <FaEllipsisV />
                            </button>
                            {actionMenu === s.id && (
                              <div className="absolute right-0 top-8 z-20 bg-white border border-[#E2E8F0] rounded-xl shadow-xl w-36 py-1" onClick={() => setActionMenu(null)}>
                                <button onClick={() => setModal({ mode: "edit", schedule: s })}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition">
                                  <FaEdit className="text-xs" /> Edit
                                </button>
                                <button onClick={() => setDeleteConfirm(s)}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#EF4444] hover:bg-red-50 transition">
                                  <FaTrash className="text-xs" /> Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {!loading && schedules.length > 0 && (
            <div className="px-5 py-4 flex items-center justify-between border-t border-[#E2E8F0]">
              <p className="text-[#64748B] text-sm">
                Showing {(page-1)*8+1} to {Math.min(page*8, total)} of {total} sessions
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
                  className="px-3 py-1.5 rounded-lg text-sm text-[#64748B] hover:bg-[#F8FAFC] disabled:opacity-30 transition">‹</button>
                {pageNumbers().map((p, i) =>
                  p === "..." ? (
                    <span key={`e${i}`} className="px-2 text-[#64748B]">…</span>
                  ) : (
                    <button key={p} onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-sm transition ${page===p ? "bg-[#2563EB] text-white" : "text-[#64748B] hover:bg-[#F8FAFC]"}`}>
                      {p}
                    </button>
                  )
                )}
                <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages}
                  className="px-3 py-1.5 rounded-lg text-sm text-[#64748B] hover:bg-[#F8FAFC] disabled:opacity-30 transition">›</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="w-72 shrink-0 flex flex-col gap-5">
        <DonutCard title="Session Status" data={stats?.statusDistribution || []} colors={COLORS_STATUS} total={stats?.total || 0} />
        <DonutCard title="Session Types" data={stats?.typeDistribution || []} colors={COLORS_TYPE} total={stats?.total || 0} />
        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0]">
          <h3 className="font-semibold text-[#0F172A] text-sm mb-4">Overview</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[#64748B]"><FaCheckCircle className="text-emerald-500" /> Completed</span>
              <span className="font-medium text-[#0F172A]">{stats?.completed ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[#64748B]"><FaCalendarCheck className="text-blue-500" /> This Week</span>
              <span className="font-medium text-[#0F172A]">{stats?.thisWeek ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[#64748B]"><FaTrash className="text-red-500" /> Cancelled</span>
              <span className="font-medium text-[#0F172A]">{stats?.cancelled ?? "—"}</span>
            </div>
          </div>
        </div>
      </div>

      {modal && (
        <ScheduleModal
          schedule={modal.schedule}
          students={students}
          drivers={drivers}
          vehicles={vehicles}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); fetchStats(); fetchSchedules(page); }}
        />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-[#0F172A] mb-2">Delete Schedule</h3>
            <p className="text-[#64748B] text-sm mb-5">
              Delete the session for <span className="text-[#0F172A] font-medium">{deleteConfirm.student?.fullName}</span> on {fmtDate(deleteConfirm.trainingDate)}? This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#E2E8F0] text-[#0F172A] text-sm transition">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm.id)}
                className="px-4 py-2 rounded-xl bg-[#EF4444] hover:bg-red-600 text-white text-sm font-medium transition">Delete</button>
            </div>
          </div>
        </div>
      )}

      {actionMenu && <div className="fixed inset-0 z-10" onClick={() => setActionMenu(null)} />}
    </div>
  );
}
