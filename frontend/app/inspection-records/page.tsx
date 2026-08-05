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
import { usePipelineData } from "@/providers/PipelineDataProvider";

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
    location: "14th St & 8th Ave SW, Calgary Downtown",
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
    pipe_id: "PIPE-CAL-1016",
    location: "Crowchild Trail & 24th Ave NW, Calgary",
    zone: "NOSE HILL",
    technician_name: "Tech #304 (D. Ross)",
    inspection_date: "2026-08-01",
    status: "Submitted",
    findings: "Severe pressure drop (1.8 bar below baseline) with high frequency hydro-acoustic noise.",
    evidence_summary: "Hydro-phone telemetry log export #8841.",
    admin_notes: "Under technical review by Municipal Water Engineer."
  },
  {
    id: "INS-2026-004",
    pipe_id: "PIPE-CAL-1019",
    location: "5th Ave SW & 2nd St SW, Calgary Downtown",
    zone: "DOWNTOWN",
    technician_name: "Tech #402 (M. Vance)",
    inspection_date: "2026-08-02",
    status: "Confirmed Issue",
    findings: "Cast iron corrosion pit measuring 45mm diameter with active micro-seepage.",
    evidence_summary: "CCTV inspection log & ground conductivity measurement.",
    admin_notes: "Clamping collar approved for temporary stabilization."
  },
  {
    id: "INS-2026-005",
    pipe_id: "PIPE-CAL-1029",
    location: "Glenmore Trail & Elbow Dr SW, Calgary",
    zone: "GLENMORE",
    technician_name: "Tech #205 (J. Miller)",
    inspection_date: "2026-08-03",
    status: "Repair Scheduled",
    findings: "Joint displacement caused by frost heave; structural integrity rating degraded to 25%.",
    evidence_summary: "Ground penetrating radar log & joint gap calliper reading (18mm).",
    admin_notes: "Joint seal repair scheduled."
  },
  {
    id: "INS-2026-006",
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
  const { records: loadedPipes } = usePipelineData();
  const [roleMode, setRoleMode] = useState<"Public" | "Technician" | "Admin">("Public");
  const [records, setRecords] = useState<InspectionRecord[]>(INITIAL_RECORDS);
  const [statusFilter, setStatusFilter] = useState("");
  const [zoneFilter, setZoneFilter] = useState("");
  
  // New Record Form State (Technician Mode)
  const [showForm, setShowForm] = useState(false);
  const [newPipeId, setNewPipeId] = useState(loadedPipes[0]?.pipe_id || loadedPipes[0]?.id || "PIPE-CAL-1001");
  const [newTechName, setNewTechName] = useState("Technician #304");
  const [newStatus, setNewStatus] = useState<InspectionRecord["status"]>("Submitted");
  const [newFindings, setNewFindings] = useState("");
  const [newEvidence, setNewEvidence] = useState("");

  const activePipesList = loadedPipes.length > 0 ? loadedPipes : [];

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
    const targetPipe = activePipesList.find((p) => p.pipe_id === newPipeId || p.id === newPipeId);
    
    const record: InspectionRecord = {
      id: `INS-2026-${String(records.length + 1).padStart(3, "0")}`,
      pipe_id: newPipeId,
      location: targetPipe?.location ?? "Calgary Network Location",
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
      {/* Prominent Synthetic Demo Disclaimer Banner */}
      <section
        aria-labelledby="synthetic-inspection-heading"
        className="rounded-2xl border border-blue-300 bg-blue-500/10 p-4 text-blue-950 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-200 print:hidden"
      >
        <div className="flex items-start gap-3">
          <FileText className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-cyan-300" />
          <div className="space-y-1 text-xs leading-relaxed font-semibold">
            <h3
              id="synthetic-inspection-heading"
              className="text-sm font-black text-blue-950 dark:text-blue-100"
            >
              Synthetic Demonstration Inspection Workflows
            </h3>
            <p className="text-xs text-blue-900 dark:text-blue-200">
              All field inspection records, acoustic sensor readings, evidence references, and work-order notes displayed here are synthetic research fixtures—not official municipal utility findings.
            </p>
          </div>
        </div>
      </section>

      {/* Header & Role Switcher */}
      <div className="space-y-3 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
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
            <label htmlFor="role-mode-selector" className="text-xs font-bold text-slate-500">
              Active Role Mode:
            </label>
            <div id="role-mode-selector" className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800">
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
                Technician Demo
              </button>
              <button
                onClick={() => setRoleMode("Admin")}
                className={`rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${
                  roleMode === "Admin"
                    ? "bg-white text-blue-600 shadow dark:bg-slate-700 dark:text-cyan-300"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                Administrator Demo
              </button>
            </div>
          </div>
        </div>

        {/* Security Disclaimer Note */}
        <p role="note" className="text-xs text-slate-500 dark:text-slate-400">
          Simulated demonstration role — no real authentication or persistent privileges. Role changes affect only local demonstration interface states.
        </p>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 card p-4 print:hidden">
        <div className="flex items-center gap-2">
          <span className="badge-demo">ROLE: {roleMode.toUpperCase()}</span>
          {roleMode === "Technician" && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" /> Log New Inspection Report
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <Download className="h-3.5 w-3.5 text-blue-600 dark:text-cyan-300" /> Export CSV ({filteredRecords.length})
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <Printer className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" /> Print Summary
          </button>
        </div>
      </div>

      {/* Technician New Report Form Modal/Accordion */}
      {showForm && roleMode === "Technician" && (
        <form onSubmit={handleCreateRecord} className="card p-6 space-y-4 border-2 border-blue-500/30 print:hidden">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-700">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Submit Field Inspection Report
            </h3>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="label">Target Pipeline ID</label>
              <select className="input" value={newPipeId} onChange={(e) => setNewPipeId(e.target.value)}>
                {activePipesList.map((p) => {
                  const id = p.pipe_id || p.id;
                  return (
                    <option key={id} value={id}>
                      {id} - {p.zone} ({p.location})
                    </option>
                  );
                })}
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
              aria-label="Filter by Status"
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
              aria-label="Filter by Zone"
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
                  <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-extrabold text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-cyan-300">
                    Synthetic Demo Record
                  </span>
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
                <span className="text-slate-500 font-bold">Technician / Inspector:</span>{" "}
                <span className="font-bold text-slate-900 dark:text-white">{record.technician_name}</span>
              </div>
              <div>
                <span className="text-slate-500 font-bold">Inspection Date:</span>{" "}
                <span className="font-mono text-slate-900 dark:text-white">{record.inspection_date}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-500 font-bold block mb-1">Observation & Acoustic Findings:</span>
                <p className="text-slate-700 dark:text-slate-300">{record.findings}</p>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-500 font-bold block mb-1">Evidence Reference:</span>
                <p className="font-mono text-blue-600 dark:text-cyan-300">{record.evidence_summary}</p>
              </div>
              {record.admin_notes && (
                <div className="sm:col-span-2 border-t border-slate-200 pt-2 dark:border-slate-700">
                  <span className="text-slate-500 font-bold block mb-1">Administrator Review Notes:</span>
                  <p className="text-slate-800 dark:text-slate-200 italic">{record.admin_notes}</p>
                </div>
              )}
            </div>

            {/* Role Action Controls */}
            {roleMode === "Admin" && record.status === "Submitted" && (
              <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700 print:hidden">
                <button
                  onClick={() => handleAdminApprove(record.id, "Confirmed Issue")}
                  className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700"
                >
                  Confirm Issue
                </button>
                <button
                  onClick={() => handleAdminApprove(record.id, "Repair Scheduled")}
                  className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-700"
                >
                  Approve Repair Schedule
                </button>
                <button
                  onClick={() => handleAdminApprove(record.id, "No Issue Found")}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                >
                  Close (No Issue)
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
