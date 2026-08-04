"use client";

import { ClipboardCheck, LockKeyhole, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch, readCookie } from "@/lib/api";

type Inspection = {
  id: number;
  pipeline_id: string;
  technician: string;
  inspection_date: string;
  inspection_type: string;
  confirmed_leak: string;
  repair_required: boolean;
  repair_status: string;
  notes?: string | null;
};

const demo: Inspection[] = [
  { id: -1, pipeline_id: "demo-zone-4", technician: "Demo Technician", inspection_date: "2026-08-03", inspection_type: "acoustic", confirmed_leak: "not_determined", repair_required: false, repair_status: "inspection_required", notes: "Demonstration record. AI alert remains unconfirmed." }
];

export default function InspectionRecordsPage() {
  const [records, setRecords] = useState<Inspection[]>(demo);
  const [message, setMessage] = useState("Showing a safe demonstration record.");
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({
    pipeline_id: "demo-zone-4",
    inspection_date: new Date().toISOString().slice(0, 10),
    inspection_type: "acoustic",
    confirmed_leak: "not_determined",
    repair_required: false,
    repair_status: "inspection_required",
    notes: ""
  });

  async function load() {
    try {
      const data = await apiFetch<Inspection[]>("/api/v1/inspections");
      if (data.length) { setRecords(data); setMessage("Loaded records from the configured database."); }
    } catch {
      setMessage("API unavailable or database empty. Showing a safe demonstration record.");
    }
  }
  useEffect(() => { load(); }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const csrf = readCookie("pipeguard_csrf");
    if (!csrf) { setMessage("Technician login is required before creating an inspection."); return; }
    try {
      await apiFetch("/api/v1/inspections", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": csrf },
        body: JSON.stringify({ ...form, technician: "resolved from session" })
      });
      setMessage("Inspection record created.");
      setFormOpen(false);
      await load();
    } catch {
      setMessage("The record could not be created. Confirm login, CSRF cookie and backend availability.");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Inspection Records</h2><p className="mt-1 text-sm text-slate-500">Keep AI warnings, technician observations, confirmed findings and repair decisions separate.</p></div>
        <button onClick={() => setFormOpen((value) => !value)} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-600 px-4 font-bold text-white"><Plus className="h-4 w-4" />New Inspection</button>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm dark:border-orange-900 dark:bg-orange-950/30">
        <LockKeyhole className="h-5 w-5 shrink-0" /><div><strong>Technician-only changes.</strong> Public users can review demonstration records. Login is required to create or edit findings.</div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900">{message}</div>

      {formOpen && (
        <form onSubmit={submit} className="card p-5">
          <h3 className="text-xl font-extrabold">Create Inspection Record</h3>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label><span className="label">Pipeline ID</span><input className="input mt-1" value={form.pipeline_id} onChange={(e) => setForm({ ...form, pipeline_id: e.target.value })} required /></label>
            <label><span className="label">Inspection date</span><input className="input mt-1" type="date" value={form.inspection_date} onChange={(e) => setForm({ ...form, inspection_date: e.target.value })} required /></label>
            <label><span className="label">Inspection type</span><select className="input mt-1" value={form.inspection_type} onChange={(e) => setForm({ ...form, inspection_type: e.target.value })}><option value="camera">Camera inspection</option><option value="acoustic">Acoustic test</option><option value="ultrasonic">Ultrasonic inspection</option><option value="electromagnetic">Electromagnetic inspection</option><option value="general_visual">General visual inspection</option></select></label>
            <label><span className="label">Confirmed leak</span><select className="input mt-1" value={form.confirmed_leak} onChange={(e) => setForm({ ...form, confirmed_leak: e.target.value })}><option value="not_determined">Not determined</option><option value="yes">Yes</option><option value="no">No</option></select></label>
            <label><span className="label">Repair status</span><select className="input mt-1" value={form.repair_status} onChange={(e) => setForm({ ...form, repair_status: e.target.value })}><option value="not_reviewed">Not reviewed</option><option value="inspection_required">Inspection required</option><option value="repair_scheduled">Repair scheduled</option><option value="repair_in_progress">Repair in progress</option><option value="repaired">Repaired</option><option value="monitoring">Monitoring</option><option value="closed">Closed</option></select></label>
            <label className="flex min-h-11 items-center gap-3 pt-6"><input type="checkbox" checked={form.repair_required} onChange={(e) => setForm({ ...form, repair_required: e.target.checked })} />Repair required</label>
            <label className="md:col-span-2"><span className="label">Notes</span><textarea className="input mt-1 min-h-28" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></label>
          </div>
          <button className="mt-5 min-h-12 rounded-xl bg-blue-600 px-5 font-extrabold text-white">Save Inspection</button>
        </form>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {records.map((record) => (
          <article key={record.id} className="card p-5">
            <div className="flex items-start justify-between gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/40"><ClipboardCheck /></span>
              {record.id < 0 && <span className="badge-demo">DEMO DATA</span>}
            </div>
            <h3 className="mt-4 text-lg font-extrabold">{record.pipeline_id}</h3>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div><dt className="label">Type</dt><dd className="mt-1 font-bold">{record.inspection_type}</dd></div>
              <div><dt className="label">Date</dt><dd className="mt-1 font-bold">{record.inspection_date}</dd></div>
              <div><dt className="label">Confirmed leak</dt><dd className="mt-1 font-bold">{record.confirmed_leak.replace("_", " ")}</dd></div>
              <div><dt className="label">Repair status</dt><dd className="mt-1 font-bold">{record.repair_status.replaceAll("_", " ")}</dd></div>
            </dl>
            {record.notes && <p className="mt-4 text-sm leading-6 text-slate-500">{record.notes}</p>}
          </article>
        ))}
      </section>
    </div>
  );
}
