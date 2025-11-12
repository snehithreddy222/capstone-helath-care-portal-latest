// src/pages/patient/TestResults.jsx
import React, { useMemo, useState } from "react";
import { FiDownload, FiSearch } from "react-icons/fi";
import { format } from "date-fns";
import http from "../../services/http";

const MOCK_RESULTS = [
  { id: "r1", name: "Comprehensive Metabolic Panel", date: new Date(2023, 9, 20), status: "available", attachmentKey: "john-smith-lab-report.pdf" },
  { id: "r2", name: "Lipid Panel", date: new Date(2023, 9, 20), status: "available", attachmentKey: "john-smith-lab-report.pdf" },
  { id: "r3", name: "Thyroid Panel (TSH)", date: new Date(2023, 8, 15), status: "available", attachmentKey: "john-smith-lab-report.pdf" },
  { id: "r4", name: "Complete Blood Count (CBC)", date: new Date(2023, 7, 1), status: "archived", attachmentKey: "john-smith-lab-report.pdf" },
  { id: "r5", name: "Urinalysis", date: new Date(2023, 6, 22), status: "archived", attachmentKey: "john-smith-lab-report.pdf" },
];

function StatusPill({ status }) {
  const isAvailable = status === "available";
  return (
    <span
      className={[
        "inline-flex items-center px-2.5 h-7 rounded-full text-xs font-medium border",
        isAvailable ? "bg-green-50 text-green-700 border-green-200" : "bg-sky-50 text-sky-700 border-sky-200",
      ].join(" ")}
    >
      {isAvailable ? "Available" : "Archived"}
    </span>
  );
}

export default function TestResults() {
  const [query, setQuery] = useState("");
  const [downloadingId, setDownloadingId] = useState(null);

  const rows = useMemo(() => {
    if (!query.trim()) return MOCK_RESULTS;
    const q = query.toLowerCase();
    return MOCK_RESULTS.filter((r) => r.name.toLowerCase().includes(q));
  }, [query]);

  async function handleDownload(row) {
    if (!row?.attachmentKey) return;
    try {
      setDownloadingId(row.id);
      const key = encodeURIComponent(row.attachmentKey);
      const filename = encodeURIComponent(`${row.name}.pdf`);
      // Ask backend for a SAS URL that forces attachment
      const { data } = await http.get(
        `/files/sas?mode=url&disposition=attachment&key=${key}&filename=${filename}`
      );
      const url = data?.url || data?.data?.url;
      if (!url) throw new Error("No SAS url returned");

      // Programmatic download
      const a = document.createElement("a");
      a.href = url;
      a.download = `${row.name}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      console.error("download failed", e);
      alert("Unable to download file. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <div className="px-6 pb-10 mx-auto max-w-7xl">
      <div className="mt-6">
        <h1 className="text-[32px] font-bold tracking-tight">Test Results</h1>
        <p className="text-gray-600">Review your recent and past laboratory results.</p>
      </div>

      <div className="mt-6">
        <div className="search-pill max-w-lg">
          <FiSearch className="text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search test results..."
            className="search-input"
          />
        </div>
      </div>

      <div className="card-soft mt-6 p-0 overflow-hidden">
        <div className="grid grid-cols-12 px-6 py-3 text-xs font-semibold text-gray-500 tracking-wider border-b border-gray-200/70">
          <div className="col-span-6">TEST NAME</div>
          <div className="col-span-2">DATE</div>
          <div className="col-span-2">STATUS</div>
          <div className="col-span-2 text-right">ACTIONS</div>
        </div>

        {rows.map((r, idx) => (
          <div
            key={r.id}
            className={[
              "grid grid-cols-12 items-center px-6 py-4 text-[15px]",
              "border-b border-gray-200/70",
              "hover:bg-gray-50/70 transition-colors",
              idx === rows.length - 1 ? "border-b-0" : "",
            ].join(" ")}
          >
            <div className="col-span-6 text-gray-900">{r.name}</div>
            <div className="col-span-2 text-gray-700">{format(r.date, "MMM dd, yyyy")}</div>
            <div className="col-span-2">
              <StatusPill status={r.status} />
            </div>
            <div className="col-span-2 flex items-center justify-end gap-4">
              <button className="text-sky-700 hover:text-sky-800 text-sm font-medium">View Details</button>
              <button
                className="p-2 rounded-md hover:bg-gray-100"
                title="Download"
                onClick={() => handleDownload(r)}
                disabled={downloadingId === r.id}
              >
                <FiDownload className="text-gray-600" />
              </button>
            </div>
          </div>
        ))}

        {rows.length === 0 && (
          <div className="px-6 py-12 text-center text-gray-500">No results found.</div>
        )}
      </div>
    </div>
  );
}
