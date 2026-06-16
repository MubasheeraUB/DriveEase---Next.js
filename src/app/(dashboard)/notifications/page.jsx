"use client";

import { useEffect, useState, useCallback } from "react";
import {
  FaBell, FaBellSlash, FaCheckDouble, FaCalendarDay, FaSearch, FaFilter,
  FaSync, FaPlus, FaTrash, FaCheck, FaInfoCircle, FaCheckCircle,
  FaExclamationTriangle, FaTimesCircle, FaMoneyBill, FaCalendarAlt,
  FaUserGraduate, FaIdCard, FaCar, FaCog,
} from "react-icons/fa";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#7c3aed", "#06b6d4"];

const TYPES = ["info", "success", "warning", "error"];
const CATEGORIES = ["system", "payment", "schedule", "enrollment", "license", "vehicle"];

const typeConfig = {
  info:    { icon: <FaInfoCircle />,          ring: "bg-blue-50 text-blue-600",       dot: "#2563eb" },
  success: { icon: <FaCheckCircle />,         ring: "bg-emerald-50 text-emerald-600", dot: "#10b981" },
  warning: { icon: <FaExclamationTriangle />, ring: "bg-amber-50 text-amber-600",     dot: "#f59e0b" },
  error:   { icon: <FaTimesCircle />,         ring: "bg-red-50 text-[#EF4444]",        dot: "#ef4444" },
};

const categoryIcon = {
  system:     <FaCog />,
  payment:    <FaMoneyBill />,
  schedule:   <FaCalendarAlt />,
  enrollment: <FaUserGraduate />,
  license:    <FaIdCard />,
  vehicle:    <FaCar />,
};

function timeAgo(d) {
  if (!d) return "—";
  const diff = (Date.now() - new Date(d).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

function DonutCard({ title, data, total }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0]">
      <h3 className="font-semibold text-[#0F172A] text-sm mb-3">{title}</h3>
      {data?.length > 0 ? (
        <div className="flex items-center gap-3">
          <div className="w-20 h-20 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={25} outerRadius={38} paddingAngle={2}>
                  {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
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
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-[#64748B] truncate max-w-[100px] capitalize">{d.name}</span>
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

function NotificationModal({ onClose, onSave }) {
  const [form, setForm] = useState({ title: "", body: "", type: "info", category: "system", link: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/notifications", {
        method: "POST",
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
      <div className="bg-white border border-[#E2E8F0] rounded-3xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-[#E2E8F0]">
          <h2 className="text-xl font-semibold text-[#0F172A]">New Notification</h2>
          <button onClick={onClose} className="text-[#64748B] hover:text-[#0F172A] text-xl">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-2 gap-4">
          <div className="col-span-2 flex flex-col gap-1">
            <label className="text-xs text-[#64748B]">Title *</label>
            <input value={form.title} onChange={e => set("title", e.target.value)} className={cls} required />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#64748B]">Type</label>
            <select value={form.type} onChange={e => set("type", e.target.value)} className={`${cls} capitalize`}>
              {TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#64748B]">Category</label>
            <select value={form.category} onChange={e => set("category", e.target.value)} className={`${cls} capitalize`}>
              {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
            </select>
          </div>
          <div className="col-span-2 flex flex-col gap-1">
            <label className="text-xs text-[#64748B]">Message *</label>
            <textarea value={form.body} onChange={e => set("body", e.target.value)} rows={3} className={`${cls} resize-none`} required />
          </div>
          <div className="col-span-2 flex flex-col gap-1">
            <label className="text-xs text-[#64748B]">Link (optional)</label>
            <input value={form.link} onChange={e => set("link", e.target.value)} placeholder="/payments" className={cls} />
          </div>
          {error && <p className="col-span-2 text-red-500 text-sm">{error}</p>}
          <div className="col-span-2 flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose}
              className="px-5 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#E2E8F0] text-[#0F172A] text-sm transition">Cancel</button>
            <button type="submit" disabled={saving}
              className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-medium transition disabled:opacity-50">
              {saving ? "Saving…" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const [stats, setStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const token = () => localStorage.getItem("token");
  const authHdr = () => ({ Authorization: `Bearer ${token()}` });

  const fetchStats = async () => {
    try { const r = await fetch("/api/notifications/stats", { headers: authHdr() }); setStats(await r.json()); } catch {}
  };

  const fetchNotifications = useCallback(async (p = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: 8 });
      if (search) params.set("search", search);
      if (typeFilter) params.set("type", typeFilter);
      if (statusFilter) params.set("status", statusFilter);
      const r = await fetch(`/api/notifications?${params}`, { headers: authHdr() });
      const d = await r.json();
      setNotifications(d.notifications || []);
      setTotal(d.total || 0);
      setTotalPages(d.totalPages || 1);
    } catch {} finally { setLoading(false); }
  }, [search, typeFilter, statusFilter, page]);

  useEffect(() => { fetchStats(); }, []);
  useEffect(() => { fetchNotifications(page); }, [page]);

  const handleFilter = () => { setPage(1); fetchNotifications(1); };
  const handleReset = () => {
    setSearch(""); setTypeFilter(""); setStatusFilter(""); setPage(1);
    setTimeout(() => fetchNotifications(1), 50);
  };

  const patchNotification = async (id, data) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHdr() },
        body: JSON.stringify(data),
      });
      fetchStats(); fetchNotifications(page);
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHdr() },
        body: JSON.stringify({ action: "markAllRead" }),
      });
      fetchStats(); fetchNotifications(page);
    } catch {}
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: "DELETE", headers: authHdr() });
      setDeleteConfirm(null); fetchStats(); fetchNotifications(page);
    } catch {}
  };

  const statCards = stats ? [
    { title: "Total",  value: stats.total,  icon: <FaBell />,        color: "bg-blue-600" },
    { title: "Unread", value: stats.unread, icon: <FaBellSlash />,   color: "bg-amber-600" },
    { title: "Read",   value: stats.read,   icon: <FaCheckDouble />, color: "bg-emerald-600" },
    { title: "Today",  value: stats.today,  icon: <FaCalendarDay />, color: "bg-purple-600" },
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
            <h1 className="text-2xl font-bold text-[#0F172A]">Notifications</h1>
            <p className="text-[#64748B] text-sm mt-1">System alerts for payments, schedules, licenses and more</p>
          </div>
          <div className="flex gap-3">
            <button onClick={markAllRead}
              className="flex items-center gap-2 bg-[#F8FAFC] hover:bg-[#E2E8F0] text-[#0F172A] px-4 py-2 rounded-xl text-sm transition">
              <FaCheckDouble /> Mark all read
            </button>
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2 rounded-xl text-sm font-medium transition">
              <FaPlus /> New Notification
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
                  <h3 className="text-xl font-bold text-[#0F172A] mt-0.5">{card.value ?? "—"}</h3>
                </div>
              </div>
            </div>
          ))}
          {!stats && [1,2,3,4].map(i => <div key={i} className="bg-white rounded-2xl p-5 border border-[#E2E8F0] animate-pulse h-24" />)}
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0] mb-5 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 flex-1 min-w-[200px]">
            <FaSearch className="text-[#64748B] text-sm" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleFilter()}
              placeholder="Search notifications..."
              className="bg-transparent text-sm text-[#0F172A] placeholder-[#64748B] flex-1 focus:outline-none" />
          </div>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm text-[#64748B] focus:outline-none min-w-[130px] capitalize">
            <option value="">All Types</option>
            {TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm text-[#64748B] focus:outline-none min-w-[130px]">
            <option value="">All Status</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
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
            <h3 className="font-semibold text-[#0F172A]">All Notifications</h3>
          </div>
          <div>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-[#E2E8F0] animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-[#F8FAFC]" />
                  <div className="flex-1 h-4 bg-[#F8FAFC] rounded-lg" />
                </div>
              ))
            ) : notifications.length === 0 ? (
              <p className="text-center text-[#64748B] py-16">No notifications found</p>
            ) : (
              notifications.map((n) => {
                const tc = typeConfig[n.type] || typeConfig.info;
                return (
                  <div key={n.id}
                    className={`flex items-start gap-4 px-5 py-4 border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition ${n.isRead ? "" : "bg-[#EFF6FF]/40"}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base shrink-0 ${tc.ring}`}>
                      {categoryIcon[n.category] || tc.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`truncate ${n.isRead ? "text-[#64748B]" : "text-[#0F172A] font-semibold"}`}>{n.title}</p>
                        {!n.isRead && <span className="w-2 h-2 rounded-full bg-[#2563EB] shrink-0" />}
                      </div>
                      <p className="text-sm text-[#64748B]">{n.body}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-[#94A3B8] capitalize">{n.category}</span>
                        <span className="text-[#CBD5E1]">•</span>
                        <span className="text-xs text-[#94A3B8]">{timeAgo(n.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {!n.isRead && (
                        <button onClick={() => patchNotification(n.id, { isRead: true })} title="Mark read"
                          className="p-2 hover:bg-[#E2E8F0] rounded-lg transition text-[#64748B] hover:text-emerald-600">
                          <FaCheck className="text-xs" />
                        </button>
                      )}
                      <button onClick={() => setDeleteConfirm(n)} title="Delete"
                        className="p-2 hover:bg-red-50 rounded-lg transition text-[#64748B] hover:text-[#EF4444]">
                        <FaTrash className="text-xs" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {!loading && notifications.length > 0 && (
            <div className="px-5 py-4 flex items-center justify-between border-t border-[#E2E8F0]">
              <p className="text-[#64748B] text-sm">
                Showing {(page-1)*8+1} to {Math.min(page*8, total)} of {total} notifications
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
        <DonutCard title="By Type" data={stats?.typeDistribution || []} total={stats?.total || 0} />
        <DonutCard title="By Category" data={stats?.categoryDistribution || []} total={stats?.total || 0} />
        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0]">
          <h3 className="font-semibold text-[#0F172A] text-sm mb-4">Summary</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[#64748B]">Total</span>
              <span className="font-medium text-[#0F172A]">{stats?.total ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#64748B]">Unread</span>
              <span className="font-medium text-amber-600">{stats?.unread ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#64748B]">Today</span>
              <span className="font-medium text-purple-600">{stats?.today ?? "—"}</span>
            </div>
          </div>
        </div>
      </div>

      {showCreate && (
        <NotificationModal onClose={() => setShowCreate(false)} onSave={() => { setShowCreate(false); fetchStats(); fetchNotifications(page); }} />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-[#0F172A] mb-2">Delete Notification</h3>
            <p className="text-[#64748B] text-sm mb-5">
              Delete <span className="text-[#0F172A] font-medium">{deleteConfirm.title}</span>? This cannot be undone.
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
    </div>
  );
}
