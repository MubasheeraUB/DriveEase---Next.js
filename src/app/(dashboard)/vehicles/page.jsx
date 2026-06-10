"use client";

import { useEffect, useState, useCallback } from "react";
import {
  FaCar, FaCheckCircle, FaTools, FaExclamationTriangle,
  FaSearch, FaFilter, FaSync, FaPlus, FaEllipsisV, FaEdit, FaTrash, FaEye,
} from "react-icons/fa";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS_TYPE   = ["#2563eb","#10b981","#7c3aed","#f59e0b","#ef4444"];
const COLORS_FUEL   = ["#2563eb","#10b981","#f59e0b","#7c3aed"];
const COLORS_STATUS = ["#10b981","#ef4444","#f59e0b"];

const VEHICLE_TYPES = ["Car","Bike","Bus","Van","Truck"];
const FUEL_TYPES    = ["Petrol","Diesel","CNG","Electric"];

const statusConfig = {
  active:      { label: "Active",      cls: "bg-emerald-50 text-emerald-600 border border-emerald-200" },
  inactive:    { label: "Inactive",    cls: "bg-red-50 text-[#EF4444] border border-red-200" },
  maintenance: { label: "Maintenance", cls: "bg-amber-50 text-[#F59E0B] border border-amber-200" },
};
const availConfig = {
  available: "bg-emerald-50 text-emerald-600 border border-emerald-200",
  busy:      "bg-orange-50 text-[#F59E0B] border border-orange-200",
};

function vehId(id) { return `VEH-${String(id).padStart(4,"0")}`; }
function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" });
}
function isExpiringSoon(d) {
  if (!d) return false;
  const diff = new Date(d) - new Date();
  return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
}
function isExpired(d) { return d && new Date(d) < new Date(); }

const typeIconColor = { Car:"bg-blue-600", Bike:"bg-purple-600", Bus:"bg-emerald-600", Van:"bg-orange-600", Truck:"bg-red-600" };

function DonutCard({ title, data, colors }) {
  const total = data?.reduce((s,d)=>s+d.value,0) || 0;
  return (
    <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0]">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-[#0F172A]">{title}</h3>
      </div>
      {data?.length > 0 ? (
        <>
          <div className="h-24">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={22} outerRadius={40} paddingAngle={2}>
                  {data.map((_,i)=><Cell key={i} fill={colors[i%colors.length]}/>)}
                </Pie>
                <Tooltip contentStyle={{background:"#FFFFFF",border:"1px solid #E2E8F0",borderRadius:"8px",fontSize:"11px"}}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1 mt-1">
            {data.map((d,i)=>(
              <div key={d.name} className="flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{background:colors[i%colors.length]}}/>
                  <span className="text-[#64748B] capitalize">{d.name}</span>
                </div>
                <span className="text-[#0F172A] font-medium">{total>0?Math.round(d.value/total*100):0}%</span>
              </div>
            ))}
          </div>
        </>
      ) : <p className="text-[#64748B] text-[10px] text-center py-4">No data</p>}
    </div>
  );
}

function VehicleModal({ vehicle, onClose, onSave }) {
  const isEdit = !!vehicle?.id;
  const blank = {
    vehicleName:"", vehicleNumber:"", vehicleType:"Car", brand:"", model:"",
    fuelType:"Petrol", registrationDate:"", insuranceExpiry:"", rcExpiry:"",
    pollutionExpiry:"", seatingCapacity:4, status:"active", availability:"available",
  };
  const [form, setForm] = useState(isEdit ? {
    ...vehicle,
    registrationDate: vehicle.registrationDate?.split("T")[0] || "",
    insuranceExpiry:  vehicle.insuranceExpiry?.split("T")[0]  || "",
    rcExpiry:         vehicle.rcExpiry?.split("T")[0]         || "",
    pollutionExpiry:  vehicle.pollutionExpiry?.split("T")[0]  || "",
  } : blank);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError("");
    try {
      const token = localStorage.getItem("token");
      const url = isEdit ? `/api/vehicles/${vehicle.id}` : "/api/vehicles";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify({ ...form, seatingCapacity: Number(form.seatingCapacity) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");
      onSave();
    } catch(err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const F = ({ label, name, type="text", options }) => (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] text-[#64748B] uppercase tracking-wide">{label}</label>
      {options ? (
        <select value={form[name]} onChange={e=>set(name,e.target.value)}
          className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:border-blue-500">
          {options.map(o=><option key={o.v??o} value={o.v??o}>{o.l??o}</option>)}
        </select>
      ) : (
        <input type={type} value={form[name]||""} onChange={e=>set(name,e.target.value)}
          className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:border-blue-500"/>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white border border-[#E2E8F0] rounded-3xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-[#E2E8F0]">
          <h2 className="text-base font-bold">{isEdit ? "Edit Vehicle" : "Add New Vehicle"}</h2>
          <button onClick={onClose} className="text-[#64748B] hover:text-[#0F172A]">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 grid grid-cols-2 gap-3">
          <F label="Vehicle Name *"    name="vehicleName"/>
          <F label="Vehicle Number *"  name="vehicleNumber"/>
          <F label="Type"              name="vehicleType"   options={VEHICLE_TYPES}/>
          <F label="Fuel Type"         name="fuelType"      options={FUEL_TYPES}/>
          <F label="Brand *"           name="brand"/>
          <F label="Model *"           name="model"/>
          <F label="Seating Capacity"  name="seatingCapacity" type="number"/>
          <F label="Registration Date" name="registrationDate" type="date"/>
          <F label="Insurance Expiry"  name="insuranceExpiry"  type="date"/>
          <F label="RC Expiry"         name="rcExpiry"         type="date"/>
          <F label="Pollution Expiry"  name="pollutionExpiry"  type="date"/>
          {isEdit && <F label="Availability" name="availability" options={["available","busy"]}/>}
          {isEdit && <F label="Status" name="status" options={[
            {v:"active",l:"Active"},{v:"inactive",l:"Inactive"},{v:"maintenance",l:"Maintenance"}
          ]}/>}
          {error && <p className="col-span-2 text-red-400 text-sm">{error}</p>}
          <div className="col-span-2 flex gap-3 justify-end pt-1">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#E2E8F0] text-[#0F172A] text-sm transition">Cancel</button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-sm font-medium transition disabled:opacity-50">
              {saving ? "Saving…" : isEdit ? "Update" : "Add Vehicle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function VehiclesPage() {
  const [stats,        setStats]        = useState(null);
  const [vehicles,     setVehicles]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [typeFilter,   setTypeFilter]   = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modal,        setModal]        = useState(null);
  const [actionMenu,   setActionMenu]   = useState(null);
  const [deleteConfirm,setDeleteConfirm]= useState(null);
  const [page,         setPage]         = useState(1);
  const LIMIT = 8;

  const token = () => localStorage.getItem("token");

  const fetchStats = async () => {
    try {
      const r = await fetch("/api/vehicles/stats", { headers:{ Authorization:`Bearer ${token()}` }});
      setStats(await r.json());
    } catch {}
  };

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/vehicles", { headers:{ Authorization:`Bearer ${token()}` }});
      const data = await r.json();
      setVehicles(Array.isArray(data) ? data : []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchStats(); fetchVehicles(); }, []);

  const filtered = vehicles.filter(v => {
    const q = search.toLowerCase();
    const matchSearch = !search || v.vehicleName?.toLowerCase().includes(q) || v.vehicleNumber?.toLowerCase().includes(q) || v.brand?.toLowerCase().includes(q);
    const matchType   = !typeFilter   || v.vehicleType === typeFilter;
    const matchStatus = !statusFilter || v.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / LIMIT);
  const paged = filtered.slice((page-1)*LIMIT, page*LIMIT);

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/vehicles/${id}`, { method:"DELETE", headers:{ Authorization:`Bearer ${token()}` }});
      setDeleteConfirm(null); fetchStats(); fetchVehicles();
    } catch {}
  };

  const statCards = stats ? [
    { title:"Total Vehicles",    value:stats.total,     icon:<FaCar/>,                color:"bg-blue-600",    sub:"Fleet size" },
    { title:"Active",            value:stats.active,    icon:<FaCheckCircle/>,        color:"bg-emerald-600", sub:"In service" },
    { title:"Available Now",     value:stats.available, icon:<FaCar/>,                color:"bg-purple-600",  sub:"Ready to assign" },
    { title:"Expiring Soon",     value:stats.expiringInsurance + stats.expiringRc, icon:<FaExclamationTriangle/>, color:"bg-amber-600", sub:"Docs in 30 days" },
  ] : [];

  return (
    <div className="flex gap-5">
      {/* ── Main ── */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-[#0F172A]">Vehicles</h1>
            <p className="text-[#64748B] text-xs mt-0.5">Manage fleet, documents and availability</p>
          </div>
          <button onClick={() => setModal({ mode:"add" })}
            className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] px-3 py-2 rounded-xl text-sm font-medium transition">
            <FaPlus className="text-xs"/> Add Vehicle
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {statCards.map(c => (
            <div key={c.title} className="bg-white rounded-2xl p-4 border border-[#E2E8F0]">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm text-white ${c.color}`}>{c.icon}</div>
                <div>
                  <p className="text-[#64748B] text-[10px]">{c.title}</p>
                  <h3 className="text-xl font-bold text-[#0F172A]">{c.value}</h3>
                </div>
              </div>
              <p className="text-[#64748B] text-[10px] mt-2">{c.sub}</p>
            </div>
          ))}
          {!stats && [1,2,3,4].map(i=><div key={i} className="bg-white rounded-2xl p-4 border border-[#E2E8F0] animate-pulse h-20"/>)}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-3 border border-[#E2E8F0] mb-4 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 flex-1 min-w-[180px]">
            <FaSearch className="text-[#64748B] text-xs"/>
            <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}
              placeholder="Search by name, number or brand..."
              className="bg-transparent text-sm text-[#0F172A] placeholder-[#64748B] flex-1 focus:outline-none"/>
          </div>
          <select value={typeFilter} onChange={e=>{setTypeFilter(e.target.value);setPage(1);}}
            className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm text-[#64748B] focus:outline-none">
            <option value="">All Types</option>
            {VEHICLE_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
          </select>
          <select value={statusFilter} onChange={e=>{setStatusFilter(e.target.value);setPage(1);}}
            className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm text-[#64748B] focus:outline-none">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="maintenance">Maintenance</option>
          </select>
          <button onClick={()=>{setSearch("");setTypeFilter("");setStatusFilter("");setPage(1);}}
            className="flex items-center gap-1.5 bg-[#F8FAFC] hover:bg-[#E2E8F0] px-3 py-2 rounded-xl text-sm transition text-[#64748B]">
            <FaSync className="text-xs"/> Reset
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
          <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#0F172A]">Vehicle Fleet</h3>
            <span className="text-[#64748B] text-xs">{filtered.length} vehicles</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[#64748B] text-[10px] uppercase border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Vehicle</th>
                  <th className="px-4 py-3 text-left">Type / Fuel</th>
                  <th className="px-4 py-3 text-left">Insurance</th>
                  <th className="px-4 py-3 text-left">RC Expiry</th>
                  <th className="px-4 py-3 text-left">Seats</th>
                  <th className="px-4 py-3 text-left">Avail.</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({length:6}).map((_,i)=>(
                    <tr key={i} className="border-b border-[#E2E8F0] animate-pulse">
                      {Array.from({length:9}).map((_,j)=>(
                        <td key={j} className="px-4 py-3"><div className="h-3.5 bg-[#F8FAFC] rounded"/></td>
                      ))}
                    </tr>
                  ))
                ) : paged.length === 0 ? (
                  <tr><td colSpan={9} className="text-center text-[#64748B] py-12 text-sm">No vehicles found</td></tr>
                ) : (
                  paged.map((v, idx) => {
                    const rowNum = (page-1)*LIMIT + idx + 1;
                    const sc = statusConfig[v.status] || statusConfig.inactive;
                    const ac = availConfig[v.availability] || availConfig.busy;
                    const iconColor = typeIconColor[v.vehicleType] || "bg-slate-600";
                    const insExpiring = isExpiringSoon(v.insuranceExpiry);
                    const insExpired  = isExpired(v.insuranceExpiry);
                    const rcExpiring  = isExpiringSoon(v.rcExpiry);
                    const rcExpired   = isExpired(v.rcExpiry);
                    return (
                      <tr key={v.id} className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition">
                        <td className="px-4 py-3 text-[#64748B] text-xs">{rowNum}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white flex-shrink-0 ${iconColor}`}>
                              <FaCar className="text-xs"/>
                            </div>
                            <div>
                              <p className="text-[#0F172A] text-xs font-medium">{v.vehicleName}</p>
                              <p className="text-[#64748B] text-[10px]">{v.vehicleNumber} · {vehId(v.id)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-[#64748B] text-xs">{v.vehicleType}</p>
                          <p className="text-[#64748B] text-[10px]">{v.fuelType}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs ${insExpired ? "text-[#EF4444]" : insExpiring ? "text-[#F59E0B]" : "text-[#64748B]"}`}>
                            {fmtDate(v.insuranceExpiry)}
                            {insExpired && " ⚠"}
                            {insExpiring && !insExpired && " ⏰"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs ${rcExpired ? "text-[#EF4444]" : rcExpiring ? "text-[#F59E0B]" : "text-[#64748B]"}`}>
                            {fmtDate(v.rcExpiry)}
                            {rcExpired && " ⚠"}
                            {rcExpiring && !rcExpired && " ⏰"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#64748B] text-xs">{v.seatingCapacity}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] capitalize border ${ac}`}>{v.availability}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] capitalize ${sc.cls}`}>{sc.label}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="relative">
                            <button onClick={()=>setActionMenu(actionMenu===v.id?null:v.id)}
                              className="p-1.5 hover:bg-[#E2E8F0] rounded-lg transition text-[#64748B] hover:text-[#0F172A]">
                              <FaEllipsisV className="text-xs"/>
                            </button>
                            {actionMenu === v.id && (
                              <div className="absolute right-0 top-7 z-20 bg-white border border-[#E2E8F0] rounded-xl shadow-xl w-32 py-1"
                                onClick={()=>setActionMenu(null)}>
                                <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#64748B] hover:bg-[#F8FAFC]">
                                  <FaEye className="text-[10px]"/> View
                                </button>
                                <button onClick={()=>setModal({mode:"edit",vehicle:v})}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#64748B] hover:bg-[#F8FAFC]">
                                  <FaEdit className="text-[10px]"/> Edit
                                </button>
                                <button onClick={()=>setDeleteConfirm(v)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#EF4444] hover:bg-red-50">
                                  <FaTrash className="text-[10px]"/> Delete
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
          {!loading && filtered.length > LIMIT && (
            <div className="px-4 py-3 flex items-center justify-between border-t border-[#E2E8F0]">
              <p className="text-[#64748B] text-xs">Showing {(page-1)*LIMIT+1}–{Math.min(page*LIMIT,filtered.length)} of {filtered.length}</p>
              <div className="flex items-center gap-1">
                <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
                  className="px-2.5 py-1 rounded-lg text-xs text-[#64748B] hover:bg-[#F8FAFC] disabled:opacity-30">‹</button>
                {Array.from({length:totalPages},(_,i)=>i+1).map(p=>(
                  <button key={p} onClick={()=>setPage(p)}
                    className={`w-7 h-7 rounded-lg text-xs transition ${page===p?"bg-[#2563EB] text-white":"text-[#64748B] hover:bg-[#F8FAFC]"}`}>{p}</button>
                ))}
                <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}
                  className="px-2.5 py-1 rounded-lg text-xs text-[#64748B] hover:bg-[#F8FAFC] disabled:opacity-30">›</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Sidebar ── */}
      <div className="w-64 shrink-0 flex flex-col gap-4">
        <DonutCard title="By Vehicle Type" data={stats?.typeDistribution}   colors={COLORS_TYPE}/>
        <DonutCard title="By Fuel Type"    data={stats?.fuelDistribution}   colors={COLORS_FUEL}/>
        <DonutCard title="By Status"       data={stats?.statusDistribution} colors={COLORS_STATUS}/>

        {/* Expiry Alerts */}
        {stats && (stats.expiringInsurance > 0 || stats.expiringRc > 0 || stats.expiringPollution > 0) && (
          <div className="bg-white rounded-2xl p-4 border border-amber-200">
            <div className="flex items-center gap-2 mb-3">
              <FaExclamationTriangle className="text-[#F59E0B] text-sm"/>
              <h3 className="text-xs font-semibold text-[#F59E0B]">Expiry Alerts (30 days)</h3>
            </div>
            <div className="space-y-2">
              {stats.expiringInsurance > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-[#64748B]">Insurance</span>
                  <span className="text-[#F59E0B] font-medium">{stats.expiringInsurance} vehicles</span>
                </div>
              )}
              {stats.expiringRc > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-[#64748B]">RC</span>
                  <span className="text-[#F59E0B] font-medium">{stats.expiringRc} vehicles</span>
                </div>
              )}
              {stats.expiringPollution > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-[#64748B]">Pollution</span>
                  <span className="text-[#F59E0B] font-medium">{stats.expiringPollution} vehicles</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {modal && (
        <VehicleModal vehicle={modal.vehicle} onClose={()=>setModal(null)}
          onSave={()=>{ setModal(null); fetchStats(); fetchVehicles(); }}/>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 w-full max-w-sm mx-4">
            <h3 className="text-base font-semibold mb-2">Delete Vehicle</h3>
            <p className="text-[#64748B] text-sm mb-4">
              Delete <span className="text-[#0F172A] font-medium">{deleteConfirm.vehicleName}</span> ({deleteConfirm.vehicleNumber})?
            </p>
            <div className="flex gap-2 justify-end">
              <button onClick={()=>setDeleteConfirm(null)}
                className="px-4 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#E2E8F0] text-[#0F172A] text-sm transition">Cancel</button>
              <button onClick={()=>handleDelete(deleteConfirm.id)}
                className="px-4 py-2 rounded-xl bg-[#EF4444] hover:bg-red-600 text-sm font-medium transition">Delete</button>
            </div>
          </div>
        </div>
      )}

      {actionMenu && <div className="fixed inset-0 z-10" onClick={()=>setActionMenu(null)}/>}
    </div>
  );
}
