"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  FaBook, FaUserGraduate, FaUsers, FaDollarSign,
  FaSearch, FaFilter, FaSync, FaPlus, FaFileImport, FaFileExport,
  FaEllipsisV, FaEdit, FaTrash, FaEye,
  FaChalkboardTeacher, FaLayerGroup, FaCalendarAlt, FaChartBar, FaTags,
} from "react-icons/fa";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS_ENROLL = ["#2563eb", "#10b981", "#7c3aed", "#f59e0b", "#ef4444"];
const COLORS_STATUS = ["#10b981", "#ef4444", "#f59e0b", "#64748b"];
const COLORS_CAT    = ["#2563eb", "#10b981", "#7c3aed", "#f59e0b", "#ef4444", "#06b6d4"];

const CATEGORIES = ["Beginner", "Intermediate", "Advanced", "Skill Based", "Professional"];

const statusConfig = {
  active:   { label: "Active",   cls: "bg-emerald-50 text-emerald-600 border border-emerald-200" },
  inactive: { label: "Inactive", cls: "bg-red-50 text-[#EF4444] border border-red-200" },
  draft:    { label: "Draft",    cls: "bg-slate-100 text-[#64748B] border border-slate-200" },
};

const courseIconColors = {
  "Beginner":     "from-blue-600 to-blue-800",
  "Intermediate": "from-emerald-600 to-emerald-800",
  "Advanced":     "from-purple-600 to-purple-800",
  "Skill Based":  "from-amber-600 to-amber-800",
  "Professional": "from-rose-600 to-rose-800",
};

const avatarColors = ["bg-blue-600","bg-purple-600","bg-emerald-600","bg-orange-600","bg-pink-600","bg-cyan-600"];

function crsId(id) { return `CRS-${String(id).padStart(3,"0")}`; }
function initials(name) { return name?.split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase() || "?"; }

function DonutCard({ title, data, colors, total }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-[#0F172A] text-sm">{title}</h3>
        <button className="text-xs text-[#2563EB] hover:text-[#1D4ED8]">View Report</button>
      </div>
      {data?.length > 0 ? (
        <>
          <div className="flex items-center gap-3">
            <div className="w-20 h-20 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data} dataKey="value" nameKey="name"
                    cx="50%" cy="50%" innerRadius={25} outerRadius={38} paddingAngle={2}>
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
        </>
      ) : (
        <p className="text-[#64748B] text-xs text-center py-6">No data</p>
      )}
    </div>
  );
}

function CourseModal({ course, instructors, onClose, onSave }) {
  const isEdit = !!course?.id;
  const blank = {
    name: "", code: "", category: "Beginner", driverId: "",
    duration: "", fee: "", status: "active", description: "", imageUrl: "",
  };
  const [form, setForm] = useState(isEdit ? { ...course, driverId: course.driverId || "" } : blank);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError("");
    try {
      const token = localStorage.getItem("token");
      const url = isEdit ? `/api/courses/${course.id}` : "/api/courses";
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

  const Field = ({ label, name, type = "text", options }) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-[#64748B]">{label}</label>
      {options ? (
        <select value={form[name]} onChange={e => set(name, e.target.value)}
          className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:border-[#2563EB]">
          {options.map(o => <option key={o.v ?? o} value={o.v ?? o}>{o.l ?? o}</option>)}
        </select>
      ) : (
        <input type={type} value={form[name] || ""} onChange={e => set(name, e.target.value)}
          className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:border-[#2563EB]" />
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white border border-[#E2E8F0] rounded-3xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-[#E2E8F0]">
          <h2 className="text-xl font-semibold text-[#0F172A]">{isEdit ? "Edit Course" : "Add New Course"}</h2>
          <button onClick={onClose} className="text-[#64748B] hover:text-[#0F172A] text-xl">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-2 gap-4">
          <Field label="Course Name *"         name="name" />
          <Field label="Course Code *"         name="code" />
          <Field label="Category"              name="category" options={CATEGORIES} />
          <Field label="Assigned Instructor"   name="driverId" options={[
            { v: "", l: "None" },
            ...instructors.map(d => ({ v: d.id, l: d.fullName }))
          ]} />
          <Field label="Duration (e.g. 20 Hours)" name="duration" />
          <Field label="Fee (₹) *"             name="fee" type="number" />
          {isEdit && <Field label="Enrollments" name="enrollments" type="number" />}
          {isEdit && <Field label="Status" name="status" options={[
            {v:"active",l:"Active"},{v:"inactive",l:"Inactive"},{v:"draft",l:"Draft"}
          ]} />}
          <div className="col-span-2"><Field label="Image URL" name="imageUrl" /></div>
          <div className="col-span-2 flex flex-col gap-1">
            <label className="text-xs text-[#64748B]">Description</label>
            <textarea value={form.description || ""} onChange={e => set("description", e.target.value)} rows={3}
              className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:border-[#2563EB] resize-none" />
          </div>
          {error && <p className="col-span-2 text-red-400 text-sm">{error}</p>}
          <div className="col-span-2 flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose}
              className="px-5 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#E2E8F0] text-[#0F172A] text-sm transition">Cancel</button>
            <button type="submit" disabled={saving}
              className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-medium transition disabled:opacity-50">
              {saving ? "Saving…" : isEdit ? "Update" : "Add Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CoursesPage() {
  const router = useRouter();
  const [stats,        setStats]        = useState(null);
  const [courses,      setCourses]      = useState([]);
  const [instructors,  setInstructors]  = useState([]);
  const [total,        setTotal]        = useState(0);
  const [totalPages,   setTotalPages]   = useState(1);
  const [page,         setPage]         = useState(1);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [catFilter,    setCatFilter]    = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modal,        setModal]        = useState(null);
  const [actionMenu,   setActionMenu]   = useState(null);
  const [deleteConfirm,setDeleteConfirm]= useState(null);

  const token = () => localStorage.getItem("token");

  const fetchStats = async () => {
    try {
      const r = await fetch("/api/courses/stats", { headers: { Authorization: `Bearer ${token()}` } });
      setStats(await r.json());
    } catch {}
  };

  const fetchInstructors = async () => {
    try {
      const r = await fetch("/api/drivers?limit=100", { headers: { Authorization: `Bearer ${token()}` } });
      const d = await r.json();
      setInstructors(d.instructors || []);
    } catch {}
  };

  const fetchCourses = useCallback(async (p = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: 8 });
      if (search)       params.set("search",   search);
      if (catFilter)    params.set("category", catFilter);
      if (statusFilter) params.set("status",   statusFilter);
      const r = await fetch(`/api/courses?${params}`, { headers: { Authorization: `Bearer ${token()}` } });
      const d = await r.json();
      setCourses(d.courses || []);
      setTotal(d.total || 0);
      setTotalPages(d.totalPages || 1);
    } catch {} finally { setLoading(false); }
  }, [search, catFilter, statusFilter, page]);

  useEffect(() => { fetchStats(); fetchInstructors(); }, []);
  useEffect(() => { fetchCourses(page); }, [page]);

  const handleFilter = () => { setPage(1); fetchCourses(1); };
  const handleReset  = () => {
    setSearch(""); setCatFilter(""); setStatusFilter(""); setPage(1);
    setTimeout(() => fetchCourses(1), 50);
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/courses/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token()}` } });
      setDeleteConfirm(null); fetchStats(); fetchCourses(page);
    } catch {}
  };

  const statCards = stats ? [
    { title: "Total Courses",      value: stats.total,                                      icon: <FaBook />,         color: "bg-blue-600",    change: "12.5%" },
    { title: "Active Courses",     value: stats.active,                                     icon: <FaUserGraduate />, color: "bg-emerald-600", change: "11.1%" },
    { title: "Total Enrollments",  value: stats.totalEnrollments?.toLocaleString("en-IN"),  icon: <FaUsers />,        color: "bg-amber-600",   change: "15.3%" },
    { title: "Avg. Course Fee",    value: `₹ ${stats.avgFee?.toLocaleString("en-IN")}`,     icon: <FaDollarSign />,   color: "bg-purple-600",  change: "6.8%"  },
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
            <h1 className="text-2xl font-bold text-[#0F172A]">Courses</h1>
            <p className="text-[#64748B] text-sm mt-1">Manage all courses, curriculum and pricing</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setModal({ mode: "add" })}
              className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2 rounded-xl text-sm font-medium transition">
              <FaPlus /> Add Course
            </button>
            <button className="flex items-center gap-2 bg-[#F8FAFC] hover:bg-[#E2E8F0] px-4 py-2 rounded-xl text-sm transition text-[#0F172A]">
              <FaFileImport /> Import
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
              placeholder="Search course by name or code..."
              className="bg-transparent text-sm text-[#0F172A] placeholder-[#64748B] flex-1 focus:outline-none" />
          </div>
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
            className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm text-[#64748B] focus:outline-none min-w-[150px]">
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm text-[#64748B] focus:outline-none min-w-[130px]">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
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
            <h3 className="font-semibold text-[#0F172A]">Courses List</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F8FAFC] text-[#64748B] text-xs uppercase border-b border-[#E2E8F0]">
                  <th className="px-5 py-3 text-left w-8">#</th>
                  <th className="px-5 py-3 text-left">Course</th>
                  <th className="px-5 py-3 text-left">Category</th>
                  <th className="px-5 py-3 text-left">Instructor</th>
                  <th className="px-5 py-3 text-left">Duration</th>
                  <th className="px-5 py-3 text-left">Fee</th>
                  <th className="px-5 py-3 text-left">Enrollments</th>
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
                ) : courses.length === 0 ? (
                  <tr><td colSpan={9} className="text-center text-[#64748B] py-16">No courses found</td></tr>
                ) : (
                  courses.map((c, idx) => {
                    const rowNum = (page - 1) * 8 + idx + 1;
                    const sc     = statusConfig[c.status?.toLowerCase()] || statusConfig.draft;
                    const grad   = courseIconColors[c.category] || "from-slate-600 to-slate-800";
                    return (
                      <tr key={c.id} className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition">
                        <td className="px-5 py-4 text-[#64748B]">{rowNum}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {c.imageUrl ? (
                              <img src={c.imageUrl} alt={c.name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                            ) : (
                              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center text-white flex-shrink-0`}>
                                <FaBook className="text-sm" />
                              </div>
                            )}
                            <div>
                              <p className="text-[#0F172A] font-medium">{c.name}</p>
                              <p className="text-[#64748B] text-xs">{crsId(c.id)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-[#64748B]">{c.category}</td>
                        <td className="px-5 py-4">
                          {c.driver ? (
                            <div className="flex items-center gap-2">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white ${avatarColors[c.driverId % avatarColors.length]}`}>
                                {initials(c.driver.fullName)}
                              </div>
                              <span className="text-[#64748B] text-xs">{c.driver.fullName}</span>
                            </div>
                          ) : (
                            <span className="text-[#64748B] text-xs">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-[#64748B]">{c.duration}</td>
                        <td className="px-5 py-4 text-[#64748B]">₹{c.fee?.toLocaleString("en-IN")}</td>
                        <td className="px-5 py-4 text-[#64748B]">{c.enrollments}</td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-lg text-xs capitalize ${sc.cls}`}>{sc.label}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="relative">
                            <button onClick={() => setActionMenu(actionMenu === c.id ? null : c.id)}
                              className="p-2 hover:bg-[#E2E8F0] rounded-lg transition text-[#64748B] hover:text-[#0F172A]">
                              <FaEllipsisV />
                            </button>
                            {actionMenu === c.id && (
                              <div className="absolute right-0 top-8 z-20 bg-white border border-[#E2E8F0] rounded-xl shadow-xl w-36 py-1"
                                onClick={() => setActionMenu(null)}>
                                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition">
                                  <FaEye className="text-xs" /> View
                                </button>
                                <button onClick={() => setModal({ mode: "edit", course: c })}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition">
                                  <FaEdit className="text-xs" /> Edit
                                </button>
                                <button onClick={() => setDeleteConfirm(c)}
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
          {!loading && courses.length > 0 && (
            <div className="px-5 py-4 flex items-center justify-between border-t border-[#E2E8F0]">
              <p className="text-[#64748B] text-sm">
                Showing {(page-1)*8+1} to {Math.min(page*8, total)} of {total} courses
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
        <DonutCard
          title="Enrollment Overview"
          data={stats?.enrollmentDistribution || []}
          colors={COLORS_ENROLL}
          total={stats?.totalEnrollments || 0}
        />
        <DonutCard
          title="Course Status"
          data={stats?.statusDistribution || []}
          colors={COLORS_STATUS}
          total={stats?.total || 0}
        />
        <DonutCard
          title="Category Distribution"
          data={stats?.categoryDistribution || []}
          colors={COLORS_CAT}
          total={stats?.total || 0}
        />

        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0]">
          <h3 className="font-semibold text-[#0F172A] text-sm mb-4">Quick Actions</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: <FaPlus />,              label: "Add Course",      action: () => setModal({ mode: "add" }) },
              { icon: <FaLayerGroup />,         label: "Add Category",    action: () => {} },
              { icon: <FaTags />,              label: "Manage Pricing",  action: () => {} },
              { icon: <FaChalkboardTeacher />, label: "Assign Instructor",action: () => {} },
              { icon: <FaChartBar />,          label: "View Reports",    action: () => {} },
              { icon: <FaCalendarAlt />,       label: "Schedule Class",  action: () => router.push("/training-schedules") },
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
        <CourseModal
          course={modal.course}
          instructors={instructors}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); fetchStats(); fetchCourses(page); }}
        />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-[#0F172A] mb-2">Delete Course</h3>
            <p className="text-[#64748B] text-sm mb-5">
              Are you sure you want to delete <span className="text-[#0F172A] font-medium">{deleteConfirm.name}</span>? This cannot be undone.
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
