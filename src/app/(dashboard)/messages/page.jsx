"use client";

import { useEffect, useState, useCallback } from "react";
import {
  FaEnvelope, FaEnvelopeOpen, FaStar, FaInbox, FaSearch, FaFilter,
  FaSync, FaPlus, FaEllipsisV, FaTrash, FaArchive, FaRegStar,
} from "react-icons/fa";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#7c3aed", "#06b6d4"];

const CATEGORIES = ["general", "inquiry", "complaint", "feedback", "support"];

const categoryConfig = {
  general:   { label: "General",   cls: "bg-blue-50 text-blue-600 border border-blue-200" },
  inquiry:   { label: "Inquiry",   cls: "bg-cyan-50 text-cyan-600 border border-cyan-200" },
  complaint: { label: "Complaint", cls: "bg-red-50 text-[#EF4444] border border-red-200" },
  feedback:  { label: "Feedback",  cls: "bg-emerald-50 text-emerald-600 border border-emerald-200" },
  support:   { label: "Support",   cls: "bg-purple-50 text-purple-600 border border-purple-200" },
};

const priorityConfig = {
  high:   "bg-red-50 text-[#EF4444] border border-red-200",
  normal: "bg-slate-50 text-[#64748B] border border-slate-200",
  low:    "bg-slate-50 text-[#94A3B8] border border-slate-200",
};

const avatarColors = ["bg-blue-600","bg-purple-600","bg-emerald-600","bg-orange-600","bg-pink-600","bg-cyan-600"];

function initials(name) { return name?.split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase() || "?"; }
function fmtDate(d) { return d ? new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }) : "—"; }

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

function MessageModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    senderName: "", senderEmail: "", senderPhone: "",
    subject: "", body: "", category: "general", priority: "normal",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/messages", {
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
      <div className="bg-white border border-[#E2E8F0] rounded-3xl w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-[#E2E8F0]">
          <h2 className="text-xl font-semibold text-[#0F172A]">New Message</h2>
          <button onClick={onClose} className="text-[#64748B] hover:text-[#0F172A] text-xl">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#64748B]">Sender Name *</label>
            <input value={form.senderName} onChange={e => set("senderName", e.target.value)} className={cls} required />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#64748B]">Phone</label>
            <input value={form.senderPhone} onChange={e => set("senderPhone", e.target.value)} className={cls} />
          </div>
          <div className="col-span-2 flex flex-col gap-1">
            <label className="text-xs text-[#64748B]">Email</label>
            <input type="email" value={form.senderEmail} onChange={e => set("senderEmail", e.target.value)} className={cls} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#64748B]">Category</label>
            <select value={form.category} onChange={e => set("category", e.target.value)} className={cls}>
              {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#64748B]">Priority</label>
            <select value={form.priority} onChange={e => set("priority", e.target.value)} className={cls}>
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="col-span-2 flex flex-col gap-1">
            <label className="text-xs text-[#64748B]">Subject *</label>
            <input value={form.subject} onChange={e => set("subject", e.target.value)} className={cls} required />
          </div>
          <div className="col-span-2 flex flex-col gap-1">
            <label className="text-xs text-[#64748B]">Message *</label>
            <textarea value={form.body} onChange={e => set("body", e.target.value)} rows={4} className={`${cls} resize-none`} required />
          </div>
          {error && <p className="col-span-2 text-red-500 text-sm">{error}</p>}
          <div className="col-span-2 flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose}
              className="px-5 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#E2E8F0] text-[#0F172A] text-sm transition">Cancel</button>
            <button type="submit" disabled={saving}
              className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-medium transition disabled:opacity-50">
              {saving ? "Saving…" : "Send"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ViewModal({ message, onClose }) {
  const cc = categoryConfig[message.category] || categoryConfig.general;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white border border-[#E2E8F0] rounded-3xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between p-6 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-semibold text-white ${avatarColors[message.id % avatarColors.length]}`}>
              {initials(message.senderName)}
            </div>
            <div>
              <p className="font-semibold text-[#0F172A]">{message.senderName}</p>
              <p className="text-xs text-[#64748B]">{message.senderEmail || message.senderPhone || ""}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#64748B] hover:text-[#0F172A] text-xl">✕</button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-lg text-xs capitalize ${cc.cls}`}>{cc.label}</span>
            <span className="text-xs text-[#64748B]">{fmtDate(message.createdAt)}</span>
          </div>
          <h3 className="text-lg font-semibold text-[#0F172A]">{message.subject}</h3>
          <p className="text-sm text-[#475569] whitespace-pre-wrap leading-relaxed">{message.body}</p>
        </div>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  const [stats, setStats] = useState(null);
  const [messages, setMessages] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCompose, setShowCompose] = useState(false);
  const [viewMsg, setViewMsg] = useState(null);
  const [actionMenu, setActionMenu] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const token = () => localStorage.getItem("token");
  const authHdr = () => ({ Authorization: `Bearer ${token()}` });

  const fetchStats = async () => {
    try { const r = await fetch("/api/messages/stats", { headers: authHdr() }); setStats(await r.json()); } catch {}
  };

  const fetchMessages = useCallback(async (p = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: 8 });
      if (search) params.set("search", search);
      if (categoryFilter) params.set("category", categoryFilter);
      if (statusFilter) params.set("status", statusFilter);
      const r = await fetch(`/api/messages?${params}`, { headers: authHdr() });
      const d = await r.json();
      setMessages(d.messages || []);
      setTotal(d.total || 0);
      setTotalPages(d.totalPages || 1);
    } catch {} finally { setLoading(false); }
  }, [search, categoryFilter, statusFilter, page]);

  useEffect(() => { fetchStats(); }, []);
  useEffect(() => { fetchMessages(page); }, [page]);

  const handleFilter = () => { setPage(1); fetchMessages(1); };
  const handleReset = () => {
    setSearch(""); setCategoryFilter(""); setStatusFilter(""); setPage(1);
    setTimeout(() => fetchMessages(1), 50);
  };

  const patchMessage = async (id, data) => {
    try {
      await fetch(`/api/messages/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHdr() },
        body: JSON.stringify(data),
      });
      fetchStats(); fetchMessages(page);
    } catch {}
  };

  const openMessage = (m) => {
    setViewMsg(m);
    if (!m.isRead) patchMessage(m.id, { isRead: true });
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/messages/${id}`, { method: "DELETE", headers: authHdr() });
      setDeleteConfirm(null); fetchStats(); fetchMessages(page);
    } catch {}
  };

  const statCards = stats ? [
    { title: "Total Messages", value: stats.total,    icon: <FaInbox />,        color: "bg-blue-600" },
    { title: "Unread",         value: stats.unread,   icon: <FaEnvelope />,     color: "bg-amber-600" },
    { title: "Read",           value: stats.read,     icon: <FaEnvelopeOpen />, color: "bg-emerald-600" },
    { title: "Starred",        value: stats.starred,  icon: <FaStar />,         color: "bg-purple-600" },
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
            <h1 className="text-2xl font-bold text-[#0F172A]">Messages</h1>
            <p className="text-[#64748B] text-sm mt-1">Inbox of inquiries, feedback and support requests</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowCompose(true)}
              className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2 rounded-xl text-sm font-medium transition">
              <FaPlus /> New Message
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
              placeholder="Search by sender, subject or content..."
              className="bg-transparent text-sm text-[#0F172A] placeholder-[#64748B] flex-1 focus:outline-none" />
          </div>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
            className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm text-[#64748B] focus:outline-none min-w-[140px] capitalize">
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm text-[#64748B] focus:outline-none min-w-[130px]">
            <option value="">All Status</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
            <option value="archived">Archived</option>
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
            <h3 className="font-semibold text-[#0F172A]">Inbox</h3>
          </div>
          <div>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-[#E2E8F0] animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-[#F8FAFC]" />
                  <div className="flex-1 h-4 bg-[#F8FAFC] rounded-lg" />
                </div>
              ))
            ) : messages.length === 0 ? (
              <p className="text-center text-[#64748B] py-16">No messages found</p>
            ) : (
              messages.map((m) => {
                const cc = categoryConfig[m.category] || categoryConfig.general;
                return (
                  <div key={m.id}
                    className={`flex items-center gap-4 px-5 py-4 border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition cursor-pointer ${m.isRead ? "" : "bg-[#EFF6FF]/40"}`}
                    onClick={() => openMessage(m)}>
                    <button onClick={(e) => { e.stopPropagation(); patchMessage(m.id, { isStarred: !m.isStarred }); }}
                      className={`text-base ${m.isStarred ? "text-amber-400" : "text-[#CBD5E1] hover:text-amber-400"}`}>
                      {m.isStarred ? <FaStar /> : <FaRegStar />}
                    </button>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0 ${avatarColors[m.id % avatarColors.length]}`}>
                      {initials(m.senderName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`truncate ${m.isRead ? "text-[#64748B]" : "text-[#0F172A] font-semibold"}`}>{m.senderName}</p>
                        {!m.isRead && <span className="w-2 h-2 rounded-full bg-[#2563EB] shrink-0" />}
                      </div>
                      <p className={`text-sm truncate ${m.isRead ? "text-[#94A3B8]" : "text-[#0F172A]"}`}>{m.subject}</p>
                      <p className="text-xs text-[#94A3B8] truncate">{m.body}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className={`px-2.5 py-1 rounded-lg text-xs capitalize ${cc.cls}`}>{cc.label}</span>
                      <span className="text-xs text-[#94A3B8]">{fmtDate(m.createdAt)}</span>
                    </div>
                    <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => setActionMenu(actionMenu === m.id ? null : m.id)}
                        className="p-2 hover:bg-[#E2E8F0] rounded-lg transition text-[#64748B] hover:text-[#0F172A]">
                        <FaEllipsisV />
                      </button>
                      {actionMenu === m.id && (
                        <div className="absolute right-0 top-8 z-20 bg-white border border-[#E2E8F0] rounded-xl shadow-xl w-40 py-1" onClick={() => setActionMenu(null)}>
                          <button onClick={() => patchMessage(m.id, { isRead: !m.isRead })}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition">
                            {m.isRead ? <FaEnvelope className="text-xs" /> : <FaEnvelopeOpen className="text-xs" />}
                            {m.isRead ? "Mark unread" : "Mark read"}
                          </button>
                          <button onClick={() => patchMessage(m.id, { isArchived: true })}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition">
                            <FaArchive className="text-xs" /> Archive
                          </button>
                          <button onClick={() => setDeleteConfirm(m)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#EF4444] hover:bg-red-50 transition">
                            <FaTrash className="text-xs" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {!loading && messages.length > 0 && (
            <div className="px-5 py-4 flex items-center justify-between border-t border-[#E2E8F0]">
              <p className="text-[#64748B] text-sm">
                Showing {(page-1)*8+1} to {Math.min(page*8, total)} of {total} messages
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
              <span className="text-[#64748B]">Starred</span>
              <span className="font-medium text-purple-600">{stats?.starred ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#64748B]">Archived</span>
              <span className="font-medium text-[#0F172A]">{stats?.archived ?? "—"}</span>
            </div>
          </div>
        </div>
      </div>

      {showCompose && (
        <MessageModal onClose={() => setShowCompose(false)} onSave={() => { setShowCompose(false); fetchStats(); fetchMessages(page); }} />
      )}

      {viewMsg && <ViewModal message={viewMsg} onClose={() => setViewMsg(null)} />}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-[#0F172A] mb-2">Delete Message</h3>
            <p className="text-[#64748B] text-sm mb-5">
              Delete message <span className="text-[#0F172A] font-medium">{deleteConfirm.subject}</span> from {deleteConfirm.senderName}? This cannot be undone.
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
