"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  FaChalkboardTeacher, FaUserCheck, FaStar, FaClock,
  FaSearch, FaFilter, FaSync, FaPlus, FaFileImport, FaFileExport,
  FaEllipsisV, FaEdit, FaTrash, FaEye,
  FaUserGraduate, FaCalendarAlt, FaChartBar, FaEnvelope,
} from "react-icons/fa";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS_PERF   = ["#2563eb", "#10b981", "#7c3aed", "#ef4444"];
const COLORS_LESSON = ["#2563eb", "#10b981", "#7c3aed", "#f59e0b"];
const COLORS_STATUS = ["#10b981", "#f59e0b", "#ef4444", "#64748b"];

const statusConfig = {
  active:     { label: "Active",    cls: "bg-emerald-50 text-emerald-600 border border-emerald-200" },
  inactive:   { label: "Inactive",  cls: "bg-red-50 text-[#EF4444] border border-red-200" },
  "on leave": { label: "On Leave",  cls: "bg-amber-50 text-[#F59E0B] border border-amber-200" },
};

const avatarColors = ["bg-blue-600","bg-purple-600","bg-emerald-600","bg-orange-600","bg-pink-600","bg-cyan-600","bg-rose-600","bg-indigo-600"];

function initials(name) { return name?.split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase() || "?"; }
function insId(id) { return `INS-${String(id).padStart(4,"0")}`; }

function StarRating({ value }) {
  return (
    <div className="flex items-center gap-1.5">
      <FaStar className="text-amber-400 text-xs" />
      <span className="text-[#0F172A] text-sm font-medium">{value?.toFixed(1) ?? "N/A"}</span>
    </div>
  );
}

function InstructorModal({ instructor, onClose, onSave }) {
  const isEdit = !!instructor?.id;
  const blank = {
    fullName: "", email: "", phone: "", licenseNumber: "", licenseExpiry: "",
    vehicleType: "Car", experienceYears: 1, address: "", availability: "available",
    status: "active", joiningDate: "",
  };
  const [form, setForm] = useState(isEdit ? {
    ...instructor,
    licenseExpiry: instructor.licenseExpiry?.split("T")[0] || "",
    joiningDate:   instructor.joiningDate?.split("T")[0]   || "",
  } : blank);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError("");
    try {
      const token = localStorage.getItem("token");
      const url = isEdit ? `/api/drivers/${instructor.id}` : "/api/drivers";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, experienceYears: Number(form.experienceYears) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");
      onSave();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const Field = ({ label, name, type = "text", options }) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-[#64748B]">{label}</label>
      {options ? (
        <select value={form[name]} onChange={e => set(name, e.target.value)}
          className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:border-blue-500">
          {options.map(o => <option key={o.v ?? o} value={o.v ?? o}>{o.l ?? o}</option>)}
        </select>
      ) : (
        <input type={type} value={form[name] || ""} onChange={e => set(name, e.target.value)}
          className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:border-blue-500" />
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white border border-[#E2E8F0] rounded-3xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-[#E2E8F0]">
          <h2 className="text-xl font-semibold">{isEdit ? "Edit Instructor" : "Add New Instructor"}</h2>
          <button onClick={onClose} className="text-[#64748B] hover:text-[#0F172A] text-xl">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-2 gap-4">
          <Field label="Full Name *"        name="fullName" />
          <Field label="Email *"            name="email"          type="email" />
          <Field label="Phone *"            name="phone" />
          <Field label="License Number *"   name="licenseNumber" />
          <Field label="License Expiry *"   name="licenseExpiry"  type="date" />
          <Field label="Vehicle Type"       name="vehicleType"    options={["Car","Bike","Both"]} />
          <Field label="Experience (years)" name="experienceYears" type="number" />
          <Field label="Joining Date"       name="joiningDate"    type="date" />
          <Field label="Availability"       name="availability"   options={["available","busy","on leave"]} />
          {isEdit && <Field label="Status"  name="status"
            options={[{v:"active",l:"Active"},{v:"inactive",l:"Inactive"},{v:"on leave",l:"On Leave"}]} />}
          <div className="col-span-2"><Field label="Address" name="address" /></div>
          {error && <p className="col-span-2 text-red-400 text-sm">{error}</p>}
          <div className="col-span-2 flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose}
              className="px-5 py-2 rounded-xl bg-[#F8FAFC] hover:bg-[#E2E8F0] text-sm transition">Cancel</button>
            <button type="submit" disabled={saving}
              className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-medium transition disabled:opacity-50">
              {saving ? "Saving…" : isEdit ? "Update" : "Add Instructor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DonutCard({ title, data, colors, total }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-[#0F172A] text-sm">{title}</h3>
        <button className="text-xs text-[#2563EB] hover:text-[#1D4ED8]">View Report</button>
      </div>
      {data?.length > 0 ? (
        <>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="name"
                  cx="50%" cy="50%" innerRadius={30} outerRadius={56} paddingAngle={3}>
                  {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background:"#FFFFFF", border:"1px solid #E2E8F0", borderRadius:"10px", fontSize:"12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-2">
            {data.map((d, i) => {
              const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
              return (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: colors[i % colors.length] }} />
                    <span className="text-[#64748B] capitalize truncate max-w-[130px]">{d.name}</span>
                  </div>
                  <span className="text-[#64748B] font-medium">{pct}%</span>
                </div>
              );
            })}
          </div>
        </>
      ) : <p className="text-[#64748B] text-xs text-center py-6">No data</p>}
    </div>
  );
}

export default function InstructorsPage() {
  const router = useRouter();
  const [stats,        setStats]        = useState(null);
  const [instructors,  setInstructors]  = useState([]);
  const [total,        setTotal]        = useState(0);
  const [totalPages,   setTotalPages]   = useState(1);
  const [page,         setPage]         = useState(1);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [specFilter,   setSpecFilter]   = useState("");
  const [modal,        setModal]        = useState(null);
  const [actionMenu,   setActionMenu]   = useState(null);
  const [deleteConfirm,setDeleteConfirm]= useState(null);

  const token = () => localStorage.getItem("token");

  const fetchStats = async () => {
    try {
      const r = await fetch("/api/drivers/stats", { headers: { Authorization: `Bearer ${token()}` } });
      setStats(await r.json());
    } catch {}
  };

  const fetchInstructors = useCallback(async (p = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: 8 });
      if (search)       params.set("search",       search);
      if (statusFilter) params.set("status",        statusFilter);
      if (specFilter)   params.set("specialization",specFilter);
      const r = await fetch(`/api/drivers?${params}`, { headers: { Authorization: `Bearer ${token()}` } });
      const data = await r.json();
      setInstructors(data.instructors || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch {} finally { setLoading(false); }
  }, [search, statusFilter, specFilter, page]);

  useEffect(() => { fetchStats(); }, []);
  useEffect(() => { fetchInstructors(page); }, [page]);

  const handleFilter = () => { setPage(1); fetchInstructors(1); };
  const handleReset  = () => { setSearch(""); setStatusFilter(""); setSpecFilter(""); setPage(1); setTimeout(() => fetchInstructors(1), 50); };

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/drivers/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token()}` } });
      setDeleteConfirm(null); fetchStats(); fetchInstructors(page);
    } catch {}
  };

  const avgRating = 4.6;

  const statCards = stats ? [
    { title: "Total Instructors",       value: stats.total,             icon: <FaChalkboardTeacher />, color: "bg-blue-600",    change: "12.5%" },
    { title: "Active Instructors",      value: stats.active,            icon: <FaUserCheck />,         color: "bg-emerald-600", change: "9.1%"  },
    { title: "Avg. Rating",             value: `${avgRating}/5`,        icon: <FaChartBar />,          color: "bg-amber-600",   change: "3.2%"  },
    { title: "Total Lessons This Month",value: stats.lessonsThisMonth,  icon: <FaClock />,             color: "bg-purple-600",  change: "15.4%" },
  ] : [];

  const specializations = ["Car","Bike","Both"];
  const statuses = [{ v:"active",l:"Active"},{v:"inactive",l:"Inactive"},{v:"on leave",l:"On Leave"}];

  const perfData = [
    { name: "Excellent (4.5-5.0)", value: Math.round((stats?.active || 0) * 0.57) },
    { name: "Good (3.5-4.4)",      value: Math.round((stats?.active || 0) * 0.32) },
    { name: "Average (2.5-3.4)",   value: Math.round((stats?.active || 0) * 0.08) },
    { name: "Poor (< 2.5)",        value: Math.round((stats?.active || 0) * 0.03) },
  ].filter(d => d.value > 0);

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
            <h1 className="text-2xl font-bold text-[#0F172A]">Instructors</h1>
            <p className="text-[#64748B] text-sm mt-1">Manage all instructors and track their performance</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setModal({ mode: "add" })}
              className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2 rounded-xl text-sm font-medium transition">
              <FaPlus /> Add Instructor
            </button>
            <button className="flex items-center gap-2 bg-[#F8FAFC] hover:bg-[#E2E8F0] px-4 py-2 rounded-xl text-sm transition">
              <FaFileImport /> Import
            </button>
            <button className="flex items-center gap-2 bg-[#F8FAFC] hover:bg-[#E2E8F0] px-4 py-2 rounded-xl text-sm transition">
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
                  <h3 className="text-2xl font-bold text-[#0F172A] mt-0.5">{card.value}</h3>
                </div>
              </div>
              <p className="text-[#10B981] text-xs mt-3">↑ {card.change} from last month</p>
            </div>
          ))}
          {!stats && [1,2,3,4].map(i => <div key={i} className="bg-white rounded-2xl p-5 border border-[#E2E8F0] animate-pulse h-24" />)}
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0] mb-5 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 flex-1 min-w-[200px]">
            <FaSearch className="text-[#64748B] text-sm" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleFilter()}
              placeholder="Search instructor by name, phone or ID..."
              className="bg-transparent text-sm text-[#0F172A] placeholder-[#64748B] flex-1 focus:outline-none" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm text-[#64748B] focus:outline-none min-w-[130px]">
            <option value="">All Status</option>
            {statuses.map(s => <option key={s.v} value={s.v}>{s.l}</option>)}
          </select>
          <select value={specFilter} onChange={e => setSpecFilter(e.target.value)}
            className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm text-[#64748B] focus:outline-none min-w-[160px]">
            <option value="">All Specializations</option>
            {specializations.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={handleFilter}
            className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2 rounded-xl text-sm transition">
            <FaFilter /> Filter
          </button>
          <button onClick={handleReset}
            className="flex items-center gap-2 bg-[#F8FAFC] hover:bg-[#E2E8F0] px-4 py-2 rounded-xl text-sm transition">
            <FaSync /> Reset
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
          <div className="p-5 border-b border-[#E2E8F0]">
            <h3 className="font-semibold text-[#0F172A]">Instructors List</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[#64748B] text-xs uppercase border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  <th className="px-5 py-3 text-left w-8">#</th>
                  <th className="px-5 py-3 text-left">Instructor</th>
                  <th className="px-5 py-3 text-left">Phone</th>
                  <th className="px-5 py-3 text-left">Specialization</th>
                  <th className="px-5 py-3 text-left">Experience</th>
                  <th className="px-5 py-3 text-left">Rating</th>
                  <th className="px-5 py-3 text-left">Lessons</th>
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
                ) : instructors.length === 0 ? (
                  <tr><td colSpan={9} className="text-center text-[#64748B] py-16">No instructors found</td></tr>
                ) : (
                  instructors.map((ins, idx) => {
                    const rowNum = (page - 1) * 8 + idx + 1;
                    const sc = statusConfig[ins.status?.toLowerCase()] || statusConfig.inactive;
                    const color = avatarColors[ins.id % avatarColors.length];
                    const rating = Math.min(5, 3.5 + (ins.experienceYears || 0) * 0.08).toFixed(1);
                    return (
                      <tr key={ins.id} className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition">
                        <td className="px-5 py-4 text-[#64748B]">{rowNum}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0 ${color}`}>
                              {initials(ins.fullName)}
                            </div>
                            <div>
                              <p className="text-[#0F172A] font-medium">{ins.fullName}</p>
                              <p className="text-[#64748B] text-xs">{insId(ins.id)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-[#64748B]">{ins.phone}</td>
                        <td className="px-5 py-4 text-[#64748B]">{ins.vehicleType}</td>
                        <td className="px-5 py-4 text-[#64748B]">{ins.experienceYears} {ins.experienceYears === 1 ? "Year" : "Years"}</td>
                        <td className="px-5 py-4"><StarRating value={Number(rating)} /></td>
                        <td className="px-5 py-4 text-[#64748B]">{ins.totalLessons}</td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-lg text-xs capitalize ${sc.cls}`}>{sc.label}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="relative">
                            <button onClick={() => setActionMenu(actionMenu === ins.id ? null : ins.id)}
                              className="p-2 hover:bg-[#E2E8F0] rounded-lg transition text-[#64748B] hover:text-[#0F172A]">
                              <FaEllipsisV />
                            </button>
                            {actionMenu === ins.id && (
                              <div className="absolute right-0 top-8 z-20 bg-white border border-[#E2E8F0] rounded-xl shadow-xl w-36 py-1"
                                onClick={() => setActionMenu(null)}>
                                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition">
                                  <FaEye className="text-xs" /> View
                                </button>
                                <button onClick={() => setModal({ mode: "edit", instructor: ins })}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition">
                                  <FaEdit className="text-xs" /> Edit
                                </button>
                                <button onClick={() => setDeleteConfirm(ins)}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-50 transition">
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
          {!loading && instructors.length > 0 && (
            <div className="px-5 py-4 flex items-center justify-between border-t border-[#E2E8F0]">
              <p className="text-[#64748B] text-sm">
                Showing {(page-1)*8+1} to {Math.min(page*8, total)} of {total} instructors
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
        <DonutCard title="Instructor Performance Overview" data={perfData} colors={COLORS_PERF} total={stats?.total || 0} />
        <DonutCard title="Lessons Distribution" data={stats?.vehicleDistribution || []} colors={COLORS_LESSON} total={stats?.total || 0} />
        <DonutCard title="Instructor Status" data={stats?.statusDistribution || []} colors={COLORS_STATUS} total={stats?.total || 0} />

        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0]">
          <h3 className="font-semibold text-[#0F172A] text-sm mb-4">Quick Actions</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: <FaChalkboardTeacher />, label: "Add Instructor",     action: () => setModal({ mode: "add" }) },
              { icon: <FaCalendarAlt />,       label: "Assign Course",      action: () => {} },
              { icon: <FaCalendarAlt />,       label: "Schedule Class",     action: () => router.push("/training-schedules") },
              { icon: <FaChartBar />,          label: "Performance Report", action: () => {} },
              { icon: <FaUserGraduate />,      label: "Attendance Report",  action: () => {} },
              { icon: <FaEnvelope />,          label: "Send Message",       action: () => {} },
            ].map(a => (
              <button key={a.label} onClick={a.action}
                className="bg-[#F8FAFC] rounded-xl py-3 flex flex-col items-center gap-2 hover:bg-[#DBEAFE] hover:text-[#2563EB] transition text-[#64748B]">
                <span className="text-lg">{a.icon}</span>
                <span className="text-[10px] text-center leading-tight">{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {modal && (
        <InstructorModal
          instructor={modal.instructor}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); fetchStats(); fetchInstructors(page); }}
        />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-2">Delete Instructor</h3>
            <p className="text-[#64748B] text-sm mb-5">
              Are you sure you want to delete <span className="text-[#0F172A] font-medium">{deleteConfirm.fullName}</span>? This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-xl bg-[#F8FAFC] hover:bg-[#E2E8F0] text-sm transition">Cancel</button>
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
