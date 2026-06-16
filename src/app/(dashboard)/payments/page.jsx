"use client";

import { useEffect, useState, useCallback } from "react";
import {
  FaMoneyBillWave, FaWallet, FaHourglassHalf, FaPercentage,
  FaSearch, FaFilter, FaSync, FaPlus, FaFileExport,
  FaEllipsisV, FaEdit, FaTrash, FaFileInvoiceDollar,
} from "react-icons/fa";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS_STATUS = ["#10b981", "#f59e0b", "#ef4444", "#64748b"];
const COLORS_METHOD = ["#2563eb", "#10b981", "#7c3aed", "#f59e0b", "#06b6d4", "#ef4444"];

const METHODS = ["Cash", "UPI", "Card", "Bank Transfer", "Cheque"];

const statusConfig = {
  paid:    { label: "Paid",    cls: "bg-emerald-50 text-emerald-600 border border-emerald-200" },
  partial: { label: "Partial", cls: "bg-amber-50 text-amber-600 border border-amber-200" },
  pending: { label: "Pending", cls: "bg-red-50 text-[#EF4444] border border-red-200" },
};

const avatarColors = ["bg-blue-600","bg-purple-600","bg-emerald-600","bg-orange-600","bg-pink-600","bg-cyan-600"];

function initials(name) { return name?.split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase() || "?"; }
function fmtDate(d) { return d ? new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }) : "—"; }
function rupee(n) { return `₹${Number(n || 0).toLocaleString("en-IN")}`; }

function DonutCard({ title, data, colors, total, money }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0]">
      <h3 className="font-semibold text-[#0F172A] text-sm mb-3">{title}</h3>
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
                    <span className="text-[#64748B] truncate max-w-[100px] capitalize">{d.name}</span>
                  </div>
                  <span className="text-[#0F172A] font-medium ml-1">{money ? rupee(d.value) : `${pct}%`}</span>
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

function PaymentModal({ payment, students, onClose, onSave }) {
  const isEdit = !!payment?.id;
  const blank = {
    studentId: "", totalAmount: "", paidAmount: "",
    paymentDate: new Date().toISOString().slice(0, 10),
    paymentMethod: "Cash", remarks: "",
  };
  const [form, setForm] = useState(
    isEdit
      ? {
          studentId: payment.studentId,
          totalAmount: payment.totalAmount,
          paidAmount: payment.paidAmount,
          paymentDate: payment.paymentDate ? payment.paymentDate.slice(0, 10) : "",
          paymentMethod: payment.paymentMethod,
          remarks: payment.remarks || "",
        }
      : blank
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const balance = (parseFloat(form.totalAmount) || 0) - (parseFloat(form.paidAmount) || 0);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError("");
    try {
      const token = localStorage.getItem("token");
      const url = isEdit ? `/api/payments/${payment.id}` : "/api/payments";
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
      <div className="bg-white border border-[#E2E8F0] rounded-3xl w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-[#E2E8F0]">
          <h2 className="text-xl font-semibold text-[#0F172A]">{isEdit ? "Edit Payment" : "Record Payment"}</h2>
          <button onClick={onClose} className="text-[#64748B] hover:text-[#0F172A] text-xl">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-2 gap-4">
          <div className="col-span-2 flex flex-col gap-1">
            <label className="text-xs text-[#64748B]">Student *</label>
            <select value={form.studentId} onChange={e => set("studentId", e.target.value)} className={cls} disabled={isEdit} required>
              <option value="">Select student</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.fullName}{s.phone ? ` — ${s.phone}` : ""}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#64748B]">Total Amount (₹) *</label>
            <input type="number" min="0" step="0.01" value={form.totalAmount} onChange={e => set("totalAmount", e.target.value)} className={cls} required />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#64748B]">Paid Amount (₹) *</label>
            <input type="number" min="0" step="0.01" value={form.paidAmount} onChange={e => set("paidAmount", e.target.value)} className={cls} required />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#64748B]">Payment Date *</label>
            <input type="date" value={form.paymentDate} onChange={e => set("paymentDate", e.target.value)} className={cls} required />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#64748B]">Method *</label>
            <select value={form.paymentMethod} onChange={e => set("paymentMethod", e.target.value)} className={cls}>
              {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="col-span-2 flex items-center justify-between bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3">
            <span className="text-sm text-[#64748B]">Balance Due</span>
            <span className={`text-sm font-semibold ${balance > 0 ? "text-[#EF4444]" : "text-emerald-600"}`}>{rupee(balance)}</span>
          </div>
          <div className="col-span-2 flex flex-col gap-1">
            <label className="text-xs text-[#64748B]">Remarks</label>
            <textarea value={form.remarks} onChange={e => set("remarks", e.target.value)} rows={2} className={`${cls} resize-none`} />
          </div>
          {error && <p className="col-span-2 text-red-500 text-sm">{error}</p>}
          <div className="col-span-2 flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose}
              className="px-5 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#E2E8F0] text-[#0F172A] text-sm transition">Cancel</button>
            <button type="submit" disabled={saving}
              className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-medium transition disabled:opacity-50">
              {saving ? "Saving…" : isEdit ? "Update" : "Record Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PaymentsPage() {
  const [stats, setStats] = useState(null);
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [modal, setModal] = useState(null);
  const [actionMenu, setActionMenu] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const token = () => localStorage.getItem("token");
  const authHdr = () => ({ Authorization: `Bearer ${token()}` });

  const fetchStats = async () => {
    try { const r = await fetch("/api/payments/stats", { headers: authHdr() }); setStats(await r.json()); } catch {}
  };

  const fetchStudents = async () => {
    try {
      const r = await fetch("/api/students?limit=200", { headers: authHdr() });
      const d = await r.json();
      setStudents(d.students || []);
    } catch {}
  };

  const fetchPayments = useCallback(async (p = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: 8 });
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      if (methodFilter) params.set("method", methodFilter);
      const r = await fetch(`/api/payments?${params}`, { headers: authHdr() });
      const d = await r.json();
      setPayments(d.payments || []);
      setTotal(d.total || 0);
      setTotalPages(d.totalPages || 1);
    } catch {} finally { setLoading(false); }
  }, [search, statusFilter, methodFilter, page]);

  useEffect(() => { fetchStats(); fetchStudents(); }, []);
  useEffect(() => { fetchPayments(page); }, [page]);

  // Open the Record Payment modal automatically when arriving via a Quick Action (?new=1)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("new") === "1") {
      setModal({ mode: "add" });
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  const handleFilter = () => { setPage(1); fetchPayments(1); };
  const handleReset = () => {
    setSearch(""); setStatusFilter(""); setMethodFilter(""); setPage(1);
    setTimeout(() => fetchPayments(1), 50);
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/payments/${id}`, { method: "DELETE", headers: authHdr() });
      setDeleteConfirm(null); fetchStats(); fetchPayments(page);
    } catch {}
  };

  const statCards = stats ? [
    { title: "Total Collected",   value: rupee(stats.totalCollected),   icon: <FaMoneyBillWave />, color: "bg-emerald-600" },
    { title: "Collected (Month)", value: rupee(stats.collectedThisMonth),icon: <FaWallet />,        color: "bg-blue-600" },
    { title: "Pending Balance",   value: rupee(stats.pendingBalance),    icon: <FaHourglassHalf />, color: "bg-amber-600" },
    { title: "Collection Rate",   value: `${stats.collectionRate}%`,     icon: <FaPercentage />,    color: "bg-purple-600" },
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
            <h1 className="text-2xl font-bold text-[#0F172A]">Payments</h1>
            <p className="text-[#64748B] text-sm mt-1">Track fees, collections and outstanding balances</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setModal({ mode: "add" })}
              className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2 rounded-xl text-sm font-medium transition">
              <FaPlus /> Record Payment
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
              placeholder="Search by student, phone or invoice..."
              className="bg-transparent text-sm text-[#0F172A] placeholder-[#64748B] flex-1 focus:outline-none" />
          </div>
          <select value={methodFilter} onChange={e => setMethodFilter(e.target.value)}
            className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm text-[#64748B] focus:outline-none min-w-[140px]">
            <option value="">All Methods</option>
            {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm text-[#64748B] focus:outline-none min-w-[130px]">
            <option value="">All Status</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
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
            <h3 className="font-semibold text-[#0F172A]">Payment Records</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F8FAFC] text-[#64748B] text-xs uppercase border-b border-[#E2E8F0]">
                  <th className="px-5 py-3 text-left w-8">#</th>
                  <th className="px-5 py-3 text-left">Invoice</th>
                  <th className="px-5 py-3 text-left">Student</th>
                  <th className="px-5 py-3 text-left">Total</th>
                  <th className="px-5 py-3 text-left">Paid</th>
                  <th className="px-5 py-3 text-left">Balance</th>
                  <th className="px-5 py-3 text-left">Method</th>
                  <th className="px-5 py-3 text-left">Date</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b border-[#E2E8F0] animate-pulse">
                      {Array.from({ length: 10 }).map((_, j) => (
                        <td key={j} className="px-5 py-4"><div className="h-4 bg-[#F8FAFC] rounded-lg" /></td>
                      ))}
                    </tr>
                  ))
                ) : payments.length === 0 ? (
                  <tr><td colSpan={10} className="text-center text-[#64748B] py-16">No payments found</td></tr>
                ) : (
                  payments.map((p, idx) => {
                    const rowNum = (page - 1) * 8 + idx + 1;
                    const sc = statusConfig[p.paymentStatus?.toLowerCase()] || statusConfig.pending;
                    return (
                      <tr key={p.id} className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition">
                        <td className="px-5 py-4 text-[#64748B]">{rowNum}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 text-[#2563EB] font-medium text-xs">
                            <FaFileInvoiceDollar /> {p.invoiceNumber || "—"}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white ${avatarColors[p.studentId % avatarColors.length]}`}>
                              {initials(p.student?.fullName)}
                            </div>
                            <div>
                              <p className="text-[#0F172A] font-medium">{p.student?.fullName || "—"}</p>
                              <p className="text-[#64748B] text-xs">{p.student?.phone || ""}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-[#64748B]">{rupee(p.totalAmount)}</td>
                        <td className="px-5 py-4 text-emerald-600 font-medium">{rupee(p.paidAmount)}</td>
                        <td className={`px-5 py-4 font-medium ${p.balanceAmount > 0 ? "text-[#EF4444]" : "text-[#64748B]"}`}>{rupee(p.balanceAmount)}</td>
                        <td className="px-5 py-4 text-[#64748B]">{p.paymentMethod}</td>
                        <td className="px-5 py-4 text-[#64748B]">{fmtDate(p.paymentDate)}</td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-lg text-xs capitalize ${sc.cls}`}>{sc.label}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="relative">
                            <button onClick={() => setActionMenu(actionMenu === p.id ? null : p.id)}
                              className="p-2 hover:bg-[#E2E8F0] rounded-lg transition text-[#64748B] hover:text-[#0F172A]">
                              <FaEllipsisV />
                            </button>
                            {actionMenu === p.id && (
                              <div className="absolute right-0 top-8 z-20 bg-white border border-[#E2E8F0] rounded-xl shadow-xl w-36 py-1" onClick={() => setActionMenu(null)}>
                                <button onClick={() => setModal({ mode: "edit", payment: p })}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition">
                                  <FaEdit className="text-xs" /> Edit
                                </button>
                                <button onClick={() => setDeleteConfirm(p)}
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
          {!loading && payments.length > 0 && (
            <div className="px-5 py-4 flex items-center justify-between border-t border-[#E2E8F0]">
              <p className="text-[#64748B] text-sm">
                Showing {(page-1)*8+1} to {Math.min(page*8, total)} of {total} payments
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
        <DonutCard title="Payment Status" data={stats?.statusDistribution || []} colors={COLORS_STATUS} total={stats?.transactions || 0} />
        <DonutCard title="Collected by Method" data={stats?.methodDistribution || []} colors={COLORS_METHOD} money />
        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0]">
          <h3 className="font-semibold text-[#0F172A] text-sm mb-4">Summary</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[#64748B]">Total Billed</span>
              <span className="font-medium text-[#0F172A]">{stats ? rupee(stats.totalBilled) : "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#64748B]">Transactions</span>
              <span className="font-medium text-[#0F172A]">{stats?.transactions ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#64748B]">Fully Paid</span>
              <span className="font-medium text-emerald-600">{stats?.fullyPaid ?? "—"}</span>
            </div>
          </div>
        </div>
      </div>

      {modal && (
        <PaymentModal
          payment={modal.payment}
          students={students}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); fetchStats(); fetchPayments(page); }}
        />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-[#0F172A] mb-2">Delete Payment</h3>
            <p className="text-[#64748B] text-sm mb-5">
              Delete payment <span className="text-[#0F172A] font-medium">{deleteConfirm.invoiceNumber || ""}</span> for {deleteConfirm.student?.fullName}? This cannot be undone.
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
