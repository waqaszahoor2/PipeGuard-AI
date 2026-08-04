"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  FileCheck,
  FileText,
  Filter,
  Plus,
  Printer,
  ShieldCheck,
  UserCheck,
  Users,
  Wrench,
  X
} from "lucide-react";
import { useMemo, useState } from "react";
import { SAMPLE_PIPELINES } from "@/lib/pipesData";

export interface InspectionRecord {
  id: string;
  pipe_id: string;
  location: string;
  zone: string;
  technician_name: string;
  inspection_date: string;
  status:
    | "Draft"
    | "Submitted"
    | "Under Review"
    | "Inspection Required"
    | "Confirmed Issue"
    | "No Issue Found"
    | "Repair Scheduled"
    | "Resolved";
  findings: string;
  evidence_summary: string;
  admin_notes?: string;
}

const INITIAL_RECORDS: InspectionRecord[] = [
  {
    id: "INS-2026-001",
    pipe_id: "PIPE-CAL-1001",
    location: "14th St & 8th Ave SW, Calgary",
    zone: "DOWNTOWN",
    technician_name: "Tech #402 (M. Vance)",
    inspection_date: "2026-07-28",
    status: "Confirmed Issue",
    findings: "Acoustic sensor confirmed 14 Hz ground vibration anomaly consistent with circumferential fracture.",
    evidence_summary: "Acoustic log file & ground surface moisture reading 88%.",
    admin_notes: "Repair work order WO-9042 issued for immediate excavation."
  },
  {
    id: "INS-2026-002",
    pipe_id: "PIPE-CAL-1006",
    location: "Ogden Rd & 50th Ave SE, Calgary",
    zone: "OGDEN",
    technician_name: "Tech #118 (S. Chen)",
    inspection_date: "2026-07-30",
    status: "Repair Scheduled",
    findings: "External pipe wall graphitization observed along 4.2 meter segment.",
    evidence_summary: "Visual inspection photo & ultrasonic wall thickness scan (3.2 mm remaining).",
    admin_notes: "Sleeve repair scheduled for Aug 08."
  },
  {
    id: "INS-2026-003",
    pipe_id: "PIPE-CAL-1003",
    location: "Macleod Trail & 58th Ave SE, Calgary",
    zone: "GLENMORE",
    technician_name: "Tech #205 (J. Miller)",
    inspection_date: "2026-08-01",
    status: "Submitted",
    findings: "Pressure drop of 0.7 bar observed during peak morning flow.",
    evidence_summary: "Telemetry pressure logger export.",
    admin_notes: ""
  },
  {
    id: "INS-2026-004",
    pipe_id: "PIPE-CAL-1002",
    location: "Bow Trail & Crowchild Trail SW, Calgary",
    zone: "BROADCAST HILL",
    technician_name: "Tech #402 (M. Vance)",
    inspection_date: "2026-08-02",
    status: "No Issue Found",
    findings: "Routine CCTV camera sweep completed. Joint seal intact, no corrosion or root intrusion.",
    evidence_summary: "CCTV video log #4491.",
    admin_notes: "Closed by Lead Engineer."
  }
];

export default function InspectionRecordsPage() {
  const [roleMode, setRoleMode] = useState<"Public" | "Technician" | "Admin">("Public");
  const [records, setRecords] = useState<InspectionRecord[]>(INITIAL_RECORDS);
  const [statusFilter, setStatusFilter] = useState("");
  const [zoneFilter, setZoneFilter] = useState("");
  
  // New Record Form State (Technician Mode)
  const [showForm, setShowForm] = useState(false);
  const [newPipeId, setNewPipeId] = useState(SAMPLE_PIPELINES[0]?.pipe_id ?? "");
  const [newTechName, setNewTechName] = useState("Technician #304");
  const [newStatus, setNewStatus] = useState<InspectionRecord["status"]>("Submitted");
  const [newFindings, setNewFindings] = useState("");
  const [newEvidence, setNewEvidence] = useState("");

  const zones = useMemo(() => Array.from(new Set(records.map((r) => r.zone))).sort(), [records]);

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchStatus = !statusFilter || r.status === statusFilter;
      const matchZone = !zoneFilter || r.zone === zoneFilter;
      return matchStatus && matchZone;
    });
  }, [records, statusFilter, zoneFilter]);

  const handleCreateRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const targetPipe = SAMPLE_PIPELINES.find((p) => p.pipe_id === newPipeId);
    
    const record: InspectionRecord = {
      id: `INS-2026-${String(records.length + 1).padStart(3, "0")}`,
      pipe_id: newPipeId,
      location: targetPipe?.location ?? "Unknown Location",
      zone: targetPipe?.zone ?? "DOWNTOWN",
      technician_name: newTechName,
      inspection_date: new Date().toISOString().split("T")[0],
      status: newStatus,
      findings: newFindings || "Field inspection notes pending full review.",
      evidence_summary: newEvidence || "Telemetry log attachment #2026",
      admin_notes: ""
    };

    setRecords([record, ...records]);
    setShowForm(false);
    setNewFindings("");
    setNewEvidence("");
  };

  const handleAdminApprove = (id: string, newStatus: InspectionRecord["status"]) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: newStatus,
              admin_notes: `Reviewed and approved by Administrator on ${new Date().toISOString().split("T")[0]}`
            }
          : r
      )
    );
  };

  const exportCSV = () => {
    const headers = ["Inspection ID", "Pipe ID", "Location", "Zone", "Technician", "Date", "Status", "Findings", "Evidence", "Admin Notes"];
    const rows = filteredRecords.map((r) => [
      `"${r.id}"`,
      `"${r.pipe_id}"`,
      `"${r.location}"`,
      `"${r.zone}"`,
      `"${r.technician_name}"`,
      `"${r.inspection_date}"`,
      `"${r.status}"`,
      `"${r.findings.replace(/"/g, '""')}"`,
      `"${r.evidence_summary.replace(/"/g, '""')}"`,
      `"${(r.admin_notes || "").replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `pipeguard_inspections_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 print:py-0">
      {/* Header & Role Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Field Inspection Workflows
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Technician field observations, approval queues, and maintenance verification records.
          </p>
        </div>

        {/* Role Selector Buttons */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Active Role Mode:</span>
          <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800">
            <button
              onClick={() => setRoleMode("Public")}
              className={`rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${
                roleMode === "Public"
                  ? "bg-white text-blue-600 shadow dark:bg-slate-700 dark:text-cyan-300"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              Public Visitor
            </button>
            <button
              onClick={() => setRoleMode("Technician")}
              className={`rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${
                roleMode === "Technician"
                  ? "bg-white text-blue-600 shadow dark:bg-slate-700 dark:text-cyan-300"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              Technician (Demo Auth)
            </button>
            <button
              onClick={() => setRoleMode("Admin")}
              className={`rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${
                roleMode === "Admin"
                  ? "bg-white text-blue-600 shadow dark:bg-slate-700 dark:text-cyan-300"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              Administrator (Demo Auth)
            </button>
          </div>
        </div>
      </div>

      {/* Role Context Bar */}
      <section className="card p-4 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold">
            {roleMode === "Public" && (
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <Users className="h-4 w-4 text-blue-600 dark:text-cyan-300" /> Public Mode: View inspection logs and export CSV summaries.
              </span>
            )}
            {roleMode === "Technician" && (
              <span className="flex items-center gap-1.5 text-blue-600 dark:text-cyan-300 font-extrabold">
                <UserCheck className="h-4 w-4" /> Technician Mode: Create & submit new field observation records.
              </span>
            )}
            {roleMode === "Admin" && (
              <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-extrabold">
                <ShieldCheck className="h-4 w-4" /> Administrator Mode: Review submitted reports and update repair status.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {roleMode === "Technician" && (
              <button
                onClick={() => setShowForm(!showForm)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" /> Log New Inspection
              </button>
            )}
            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <Download className="h-3.5 w-3.5" /> CSV
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <Printer className="h-3.5 w-3.5" /> Print
            </button>
          </div>
        </div>
      </section>

      {/* Technician New Record Form */}
      {showForm && roleMode === "Technician" && (
        <form onSubmit={handleCreateRecord} className="card p-6 space-y-4 border-blue-300 dark:border-blue-900">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-700">
            <h3 className="text-base font-black text-slate-900 dark:text-white">Submit Field Observation Report</h3>
            <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="label">Target Pipeline ID</label>
              <select className="input" value={newPipeId} onChange={(e) => setNewPipeId(e.target.value)}>
                {SAMPLE_PIPELINES.map((p) => (
                  <option key={p.pipe_id} value={p.pipe_id}>
                    {p.pipe_id} - {p.zone} ({p.location})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Inspector / Technician Name</label>
              <input
                type="text"
                className="input"
                value={newTechName}
                onChange={(e) => setNewTechName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="label">Initial Status</label>
              <select
                className="input"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as InspectionRecord["status"])}
              >
                <option value="Draft">Draft</option>
                <option value="Submitted">Submitted</option>
                <option value="Confirmed Issue">Confirmed Issue</option>
                <option value="No Issue Found">No Issue Found</option>
              </select>
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="label">Field Observation Findings & Acoustic Readings</label>
              <textarea
                rows={3}
                className="input"
                placeholder="Detail physical inspection, pipe joint condition, ground moisture, acoustic frequency readings..."
                value={newFindings}
                onChange={(e) => setNewFindings(e.target.value)}
                required
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="label">Evidence Summary & Log References</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. CCTV Video #402, Ultrasonic scan data file #88"
                value={newEvidence}
                onChange={(e) => setNewEvidence(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow hover:bg-blue-700"
            >
              Submit Report
            </button>
          </div>
        </form>
      )}

      {/* Filter Bar */}
      <section className="card p-4 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700 dark:text-slate-300">
            <Filter className="h-4 w-4 text-blue-600 dark:text-cyan-300" /> Filter Records:
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              className="input py-1.5 text-xs"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Confirmed Issue">Confirmed Issue</option>
              <option value="Repair Scheduled">Repair Scheduled</option>
              <option value="No Issue Found">No Issue Found</option>
              <option value="Resolved">Resolved</option>
            </select>

            <select
              className="input py-1.5 text-xs"
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
            >
              <option value="">All Zones</option>
              {zones.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>

            {(statusFilter || zoneFilter) && (
              <button
                onClick={() => {
                  setStatusFilter("");
                  setZoneFilter("");
                }}
                className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline dark:text-cyan-300"
              >
                <X className="h-3.5 w-3.5" /> Clear
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Inspection Records List */}
      <div className="space-y-4">
        {filteredRecords.map((record) => (
          <article key={record.id} className="card p-6 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-black text-blue-600 dark:text-cyan-300">
                    {record.id}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-500">{record.pipe_id}</span>
                  <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">{record.zone}</span>
                </div>
                <h3 className="mt-1 text-base font-extrabold text-slate-900 dark:text-white">
                  {record.location}
                </h3>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-lg px-3 py-1 text-xs font-black ${
                    record.status === "Confirmed Issue"
                      ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200"
                      : record.status === "Repair Scheduled"
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200"
                      : record.status === "No Issue Found" || record.status === "Resolved"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                      : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200"
                  }`}
                >
                  {record.status}
                </span>
              </div>
            </div>

            <div className="grid gap-3 text-xs leading-relaxed sm:grid-cols-2 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
              <div>
                <strong className="text-slate-500">Technician:</strong> {record.technician_name}
              </div>
              <div>
                <strong className="text-slate-500">Date Logged:</strong> {record.inspection_date}
              </div>
              <div className="sm:col-span-2">
                <strong className="text-slate-500">Observation Findings:</strong>
                <p className="mt-0.5 text-slate-800 dark:text-slate-200">{record.findings}</p>
              </div>
              <div className="sm:col-span-2">
                <strong className="text-slate-500">Evidence Attachments:</strong>
                <p className="mt-0.5 font-mono text-slate-700 dark:text-slate-300">{record.evidence_summary}</p>
              </div>
              {record.admin_notes && (
                <div className="sm:col-span-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-amber-700 dark:text-amber-300">
                  <strong>Admin Action Note:</strong> {record.admin_notes}
                </div>
              )}
            </div>

            {/* Admin Controls in Admin Role Mode */}
            {roleMode === "Admin" && record.status === "Submitted" && (
              <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-500">Admin Review Action:</span>
                <button
                  onClick={() => handleAdminApprove(record.id, "Confirmed Issue")}
                  className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700"
                >
                  Confirm Issue
                </button>
                <button
                  onClick={() => handleAdminApprove(record.id, "No Issue Found")}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                >
                  No Issue Found
                </button>
                <button
                  onClick={() => handleAdminApprove(record.id, "Repair Scheduled")}
                  className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-700"
                >
                  Schedule Repair
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
