"use client";

import { useEffect, useState } from "react";
import {
  FaBuilding, FaUserShield, FaSlidersH, FaBell,
  FaSave, FaSpinner, FaCheckCircle, FaExclamationCircle,
} from "react-icons/fa";

const TABS = [
  { id: "profile",       label: "School Profile",   icon: <FaBuilding /> },
  { id: "account",       label: "Account & Security", icon: <FaUserShield /> },
  { id: "system",        label: "System Preferences", icon: <FaSlidersH /> },
  { id: "notifications", label: "Notifications",    icon: <FaBell /> },
];

const inputCls =
  "bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:border-[#2563EB] w-full";

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-[#64748B]">{label}</label>
      {children}
    </div>
  );
}

function Toggle({ label, desc, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[#E2E8F0] last:border-0">
      <div>
        <p className="text-sm font-medium text-[#0F172A]">{label}</p>
        {desc && <p className="text-xs text-[#64748B] mt-0.5">{desc}</p>}
      </div>
      <button type="button" onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors ${checked ? "bg-[#2563EB]" : "bg-[#CBD5E1]"}`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${checked ? "translate-x-5" : ""}`} />
      </button>
    </div>
  );
}

function useSettings(endpoint) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = () => localStorage.getItem("token");

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(endpoint, { headers: { Authorization: `Bearer ${token()}` } });
      setData(await r.json());
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);
  return { data, setData, loading, reload: load };
}

function Banner({ msg }) {
  if (!msg) return null;
  const ok = msg.type === "ok";
  return (
    <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm mb-4 ${ok ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
      {ok ? <FaCheckCircle /> : <FaExclamationCircle />} {msg.text}
    </div>
  );
}

function SaveButton({ saving }) {
  return (
    <button type="submit" disabled={saving}
      className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-5 py-2 rounded-xl text-sm font-medium transition disabled:opacity-50">
      {saving ? <FaSpinner className="animate-spin" /> : <FaSave />} {saving ? "Saving…" : "Save Changes"}
    </button>
  );
}

/* ─── School Profile ──────────────────────────────────────────────────────── */
function ProfileTab() {
  const { data, setData, loading } = useSettings("/api/settings/profile");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const set = (k, v) => setData(d => ({ ...d, [k]: v }));

  const save = async (e) => {
    e.preventDefault(); setSaving(true); setMsg(null);
    try {
      const r = await fetch("/api/settings/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify(data),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message || "Failed");
      setData(d); setMsg({ type: "ok", text: "School profile updated." });
    } catch (err) { setMsg({ type: "err", text: err.message }); }
    finally { setSaving(false); }
  };

  if (loading || !data) return <SkeletonForm />;

  return (
    <form onSubmit={save}>
      <Banner msg={msg} />
      <div className="grid grid-cols-2 gap-4">
        <Field label="School Name"><input className={inputCls} value={data.schoolName || ""} onChange={e => set("schoolName", e.target.value)} /></Field>
        <Field label="Tagline"><input className={inputCls} value={data.tagline || ""} onChange={e => set("tagline", e.target.value)} /></Field>
        <Field label="Email"><input type="email" className={inputCls} value={data.email || ""} onChange={e => set("email", e.target.value)} /></Field>
        <Field label="Phone"><input className={inputCls} value={data.phone || ""} onChange={e => set("phone", e.target.value)} /></Field>
        <Field label="Alternate Phone"><input className={inputCls} value={data.alternatePhone || ""} onChange={e => set("alternatePhone", e.target.value)} /></Field>
        <Field label="Website"><input className={inputCls} value={data.website || ""} onChange={e => set("website", e.target.value)} /></Field>
        <Field label="Registration No."><input className={inputCls} value={data.registrationNumber || ""} onChange={e => set("registrationNumber", e.target.value)} /></Field>
        <Field label="Established Year"><input type="number" className={inputCls} value={data.establishedYear || ""} onChange={e => set("establishedYear", e.target.value)} /></Field>
        <div className="col-span-2"><Field label="Logo URL"><input className={inputCls} value={data.logoUrl || ""} onChange={e => set("logoUrl", e.target.value)} /></Field></div>
        <div className="col-span-2"><Field label="Address"><input className={inputCls} value={data.addressLine || ""} onChange={e => set("addressLine", e.target.value)} /></Field></div>
        <Field label="City"><input className={inputCls} value={data.city || ""} onChange={e => set("city", e.target.value)} /></Field>
        <Field label="State"><input className={inputCls} value={data.state || ""} onChange={e => set("state", e.target.value)} /></Field>
        <Field label="Pincode"><input className={inputCls} value={data.pincode || ""} onChange={e => set("pincode", e.target.value)} /></Field>
        <Field label="Country"><input className={inputCls} value={data.country || ""} onChange={e => set("country", e.target.value)} /></Field>
        <Field label="Currency"><input className={inputCls} value={data.currency || ""} onChange={e => set("currency", e.target.value)} /></Field>
        <Field label="Currency Symbol"><input className={inputCls} value={data.currencySymbol || ""} onChange={e => set("currencySymbol", e.target.value)} /></Field>
        <Field label="Timezone"><input className={inputCls} value={data.timezone || ""} onChange={e => set("timezone", e.target.value)} /></Field>
        <Field label="Working Days"><input className={inputCls} value={data.workingDays || ""} onChange={e => set("workingDays", e.target.value)} /></Field>
        <Field label="Working Hours Start"><input type="time" className={inputCls} value={data.workingHoursStart || ""} onChange={e => set("workingHoursStart", e.target.value)} /></Field>
        <Field label="Working Hours End"><input type="time" className={inputCls} value={data.workingHoursEnd || ""} onChange={e => set("workingHoursEnd", e.target.value)} /></Field>
      </div>
      <div className="flex justify-end mt-6"><SaveButton saving={saving} /></div>
    </form>
  );
}

/* ─── Account & Security ──────────────────────────────────────────────────── */
function AccountTab() {
  const { data, setData, loading } = useSettings("/api/settings/account");
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const set = (k, v) => setData(d => ({ ...d, [k]: v }));

  const save = async (e) => {
    e.preventDefault(); setSaving(true); setMsg(null);
    try {
      if (pw.newPassword && pw.newPassword !== pw.confirm) {
        throw new Error("New passwords do not match");
      }
      const payload = {
        name: data.name, email: data.email, phone: data.phone, avatarUrl: data.avatarUrl,
      };
      if (pw.newPassword) { payload.currentPassword = pw.currentPassword; payload.newPassword = pw.newPassword; }
      const r = await fetch("/api/settings/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify(payload),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message || "Failed");
      setData(d); setPw({ currentPassword: "", newPassword: "", confirm: "" });
      // keep localStorage user fresh
      try {
        const u = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem("user", JSON.stringify({ ...u, name: d.name, email: d.email }));
      } catch {}
      setMsg({ type: "ok", text: "Account updated." });
    } catch (err) { setMsg({ type: "err", text: err.message }); }
    finally { setSaving(false); }
  };

  if (loading || !data) return <SkeletonForm />;

  return (
    <form onSubmit={save}>
      <Banner msg={msg} />
      <h3 className="text-sm font-semibold text-[#0F172A] mb-3">Profile Information</h3>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Field label="Full Name"><input className={inputCls} value={data.name || ""} onChange={e => set("name", e.target.value)} /></Field>
        <Field label="Email"><input type="email" className={inputCls} value={data.email || ""} onChange={e => set("email", e.target.value)} /></Field>
        <Field label="Phone"><input className={inputCls} value={data.phone || ""} onChange={e => set("phone", e.target.value)} /></Field>
        <Field label="Role"><input className={inputCls} value={data.role || ""} disabled /></Field>
        <div className="col-span-2"><Field label="Avatar URL"><input className={inputCls} value={data.avatarUrl || ""} onChange={e => set("avatarUrl", e.target.value)} /></Field></div>
      </div>

      <h3 className="text-sm font-semibold text-[#0F172A] mb-3">Change Password</h3>
      <div className="grid grid-cols-3 gap-4">
        <Field label="Current Password"><input type="password" className={inputCls} value={pw.currentPassword} onChange={e => setPw(p => ({ ...p, currentPassword: e.target.value }))} /></Field>
        <Field label="New Password"><input type="password" className={inputCls} value={pw.newPassword} onChange={e => setPw(p => ({ ...p, newPassword: e.target.value }))} /></Field>
        <Field label="Confirm New Password"><input type="password" className={inputCls} value={pw.confirm} onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))} /></Field>
      </div>
      <p className="text-xs text-[#64748B] mt-2">Leave password fields blank to keep your current password.</p>
      <div className="flex justify-end mt-6"><SaveButton saving={saving} /></div>
    </form>
  );
}

/* ─── System Preferences ──────────────────────────────────────────────────── */
function SystemTab() {
  const { data, setData, loading } = useSettings("/api/settings/system");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const set = (k, v) => setData(d => ({ ...d, [k]: v }));

  const save = async (e) => {
    e.preventDefault(); setSaving(true); setMsg(null);
    try {
      const r = await fetch("/api/settings/system", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify(data),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message || "Failed");
      setData(d); setMsg({ type: "ok", text: "System preferences updated." });
    } catch (err) { setMsg({ type: "err", text: err.message }); }
    finally { setSaving(false); }
  };

  if (loading || !data) return <SkeletonForm />;

  return (
    <form onSubmit={save}>
      <Banner msg={msg} />
      <div className="grid grid-cols-2 gap-4">
        <Field label="Default Course Fee (₹)"><input type="number" className={inputCls} value={data.defaultCourseFee ?? ""} onChange={e => set("defaultCourseFee", e.target.value)} /></Field>
        <Field label="Default Session Length (mins)"><input type="number" className={inputCls} value={data.defaultSessionMins ?? ""} onChange={e => set("defaultSessionMins", e.target.value)} /></Field>
        <Field label="Max Students Per Batch"><input type="number" className={inputCls} value={data.maxStudentsPerBatch ?? ""} onChange={e => set("maxStudentsPerBatch", e.target.value)} /></Field>
        <Field label="Payment Reminder (days before)"><input type="number" className={inputCls} value={data.paymentReminderDays ?? ""} onChange={e => set("paymentReminderDays", e.target.value)} /></Field>
        <Field label="Late Fee Percentage (%)"><input type="number" className={inputCls} value={data.lateFeePercentage ?? ""} onChange={e => set("lateFeePercentage", e.target.value)} /></Field>
        <Field label="Invoice Prefix"><input className={inputCls} value={data.invoicePrefix || ""} onChange={e => set("invoicePrefix", e.target.value)} /></Field>
        <Field label="Date Format">
          <select className={inputCls} value={data.dateFormat || ""} onChange={e => set("dateFormat", e.target.value)}>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </Field>
      </div>
      <div className="mt-5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4">
        <Toggle label="Auto-assign Instructor" desc="Automatically assign an available instructor when scheduling." checked={!!data.autoAssignInstructor} onChange={v => set("autoAssignInstructor", v)} />
        <Toggle label="Enable Late Fees" desc="Apply late fees to overdue payment balances." checked={!!data.lateFeeEnabled} onChange={v => set("lateFeeEnabled", v)} />
        <Toggle label="Maintenance Mode" desc="Temporarily restrict access to the system." checked={!!data.maintenanceMode} onChange={v => set("maintenanceMode", v)} />
      </div>
      <div className="flex justify-end mt-6"><SaveButton saving={saving} /></div>
    </form>
  );
}

/* ─── Notifications ───────────────────────────────────────────────────────── */
function NotificationsTab() {
  const { data, setData, loading } = useSettings("/api/settings/notifications");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const set = (k, v) => setData(d => ({ ...d, [k]: v }));

  const save = async (e) => {
    e.preventDefault(); setSaving(true); setMsg(null);
    try {
      const r = await fetch("/api/settings/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify(data),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message || "Failed");
      setData(d); setMsg({ type: "ok", text: "Notification settings updated." });
    } catch (err) { setMsg({ type: "err", text: err.message }); }
    finally { setSaving(false); }
  };

  if (loading || !data) return <SkeletonForm />;

  return (
    <form onSubmit={save}>
      <Banner msg={msg} />
      <h3 className="text-sm font-semibold text-[#0F172A] mb-1">Channels</h3>
      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 mb-6">
        <Toggle label="Email Notifications" checked={!!data.emailEnabled} onChange={v => set("emailEnabled", v)} />
        <Toggle label="SMS Notifications" checked={!!data.smsEnabled} onChange={v => set("smsEnabled", v)} />
        <Toggle label="In-App Notifications" checked={!!data.inAppEnabled} onChange={v => set("inAppEnabled", v)} />
      </div>
      <h3 className="text-sm font-semibold text-[#0F172A] mb-1">Events</h3>
      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4">
        <Toggle label="Payment Due Alerts" desc="Notify when a student has an outstanding balance." checked={!!data.paymentDueAlert} onChange={v => set("paymentDueAlert", v)} />
        <Toggle label="Schedule Reminders" desc="Remind about upcoming training sessions." checked={!!data.scheduleReminder} onChange={v => set("scheduleReminder", v)} />
        <Toggle label="New Enrollment Alerts" desc="Notify when a new student enrolls." checked={!!data.newEnrollmentAlert} onChange={v => set("newEnrollmentAlert", v)} />
        <Toggle label="License Expiry Alerts" desc="Warn when an instructor licence is about to expire." checked={!!data.licenseExpiryAlert} onChange={v => set("licenseExpiryAlert", v)} />
        <Toggle label="Vehicle Service Alerts" desc="Notify about insurance, RC or pollution expiry." checked={!!data.vehicleServiceAlert} onChange={v => set("vehicleServiceAlert", v)} />
        <Toggle label="Daily Summary" desc="Receive a daily activity summary." checked={!!data.dailySummary} onChange={v => set("dailySummary", v)} />
      </div>
      <div className="flex justify-end mt-6"><SaveButton saving={saving} /></div>
    </form>
  );
}

function SkeletonForm() {
  return (
    <div className="grid grid-cols-2 gap-4 animate-pulse">
      {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-12 bg-[#F8FAFC] rounded-xl" />)}
    </div>
  );
}

export default function SettingsPage() {
  const [tab, setTab] = useState("profile");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0F172A]">Settings</h1>
        <p className="text-[#64748B] text-sm mt-1">Manage your school profile, account, system and notification preferences</p>
      </div>

      <div className="flex gap-6">
        <div className="w-60 shrink-0">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-2 space-y-1 sticky top-6">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition
                  ${tab === t.id ? "bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white shadow-md" : "text-[#64748B] hover:bg-[#EFF6FF] hover:text-[#2563EB]"}`}>
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${tab === t.id ? "bg-white/20" : "bg-[#F1F5F9]"}`}>{t.icon}</span>
                <span className="font-medium text-left">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
            {tab === "profile" && <ProfileTab />}
            {tab === "account" && <AccountTab />}
            {tab === "system" && <SystemTab />}
            {tab === "notifications" && <NotificationsTab />}
          </div>
        </div>
      </div>
    </div>
  );
}
