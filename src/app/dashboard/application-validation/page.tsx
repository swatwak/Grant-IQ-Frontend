"use client";

import { useEffect, useState } from "react";

type ApiApplicationStatus = string;

type ApiApplication = {
  id: number;
  application_id: string;
  full_name: string | null;
  application_status: ApiApplicationStatus;
  current_step: number;
  submitted_at: string | null;
  updated_at: string;
};

type ApiResponse = {
  success: boolean;
  message: string;
  data: ApiApplication[];
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

function statusStyles(status: ApiApplicationStatus) {
  const normalized = status.toLowerCase();

  if (normalized === "draft" || normalized === "pending") {
    return "bg-amber-500/15 text-amber-300 border border-amber-400/40";
  }

  if (normalized === "under_review" || normalized === "under review") {
    return "bg-sky-500/15 text-sky-300 border border-sky-400/40";
  }

  if (normalized === "approved") {
    return "bg-emerald-500/15 text-emerald-300 border border-emerald-400/40";
  }

  if (normalized === "rejected") {
    return "bg-rose-500/15 text-rose-300 border border-rose-400/40";
  }

  return "bg-slate-500/15 text-slate-200 border border-slate-400/40";
}

function formatDate(value: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ApplicationValidationPage() {
  const [applications, setApplications] = useState<ApiApplication[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | ApiApplicationStatus>(
    "all",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    async function loadApplications() {
      setIsLoading(true);
      setError(null);

      try {
        const token =
          typeof window !== "undefined"
            ? window.localStorage.getItem("grantiq_token")
            : null;

        const response = await fetch(
          `${API_BASE_URL}/api/grantor/applications`,
          {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          },
        );

        if (!response.ok) {
          const data = (await response.json().catch(() => ({}))) as
            | Partial<ApiResponse>
            | undefined;
          throw new Error(
            (data && data.message) ||
              "Unable to load applications. Please try again.",
          );
        }

        const data = (await response.json()) as ApiResponse;

        if (!data.success) {
          throw new Error(data.message || "Unable to load applications.");
        }

        setApplications(data.data || []);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Something went wrong.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    }

    void loadApplications();
  }, []);

  const filteredAndSortedApplications = applications
    .filter((application) => {
      const normalizedStatus = application.application_status.toLowerCase();
      const normalizedFilter = statusFilter.toLowerCase();

      if (normalizedFilter !== "all" && normalizedStatus !== normalizedFilter) {
        return false;
      }

      if (!searchQuery.trim()) return true;

      const query = searchQuery.trim().toLowerCase();
      const name = (application.full_name || "").toLowerCase();
      const appId = (application.application_id || "").toLowerCase();

      return name.includes(query) || appId.includes(query);
    })
    .sort((a, b) => {
      const aDate = a.submitted_at ? new Date(a.submitted_at) : null;
      const bDate = b.submitted_at ? new Date(b.submitted_at) : null;

      if (!aDate && !bDate) return 0;
      if (!aDate) return 1;
      if (!bDate) return -1;

      return sortOrder === "asc"
        ? aDate.getTime() - bDate.getTime()
        : bDate.getTime() - aDate.getTime();
    });
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-white">
            Application Validation
          </h1>
          <p className="text-sm text-violet-100/80 mt-1 max-w-xl">
            Review and validate incoming scholarship applications before moving
            them to scrutiny and recommendation stages.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end text-xs text-slate-200">
            <span>Step 1 of 3</span>
            <span className="text-slate-400">Validation → Scrutiny → Recommendation</span>
          </div>
          <div className="h-10 rounded-full bg-slate-950/60 border border-slate-700/80 px-4 flex items-center gap-2 text-xs text-slate-100">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-pink-500/30 text-[11px]">
              1
            </span>
            <span>Validation Stage</span>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-slate-950/40 border border-white/10 backdrop-blur-xl shadow-xl shadow-purple-900/40 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="h-8 w-8 rounded-xl bg-pink-500/20 text-pink-300 flex items-center justify-center text-base">
              🔍
            </span>
            <div>
              <p className="text-sm font-medium text-white">
                Validation Queue
              </p>
              <p className="text-xs text-slate-300">
                {isLoading
                  ? "Loading applications..."
                  : `${filteredAndSortedApplications.length} applications in queue`}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-xs text-slate-200 w-full sm:w-auto">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by applicant name or application ID"
                className="w-full rounded-full bg-slate-900/70 border border-slate-700/80 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-slate-400">Status</span>
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as "all" | ApiApplicationStatus)
                }
                className="rounded-full bg-slate-900/70 border border-slate-700/80 px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="all">All</option>
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {error ? (
            <div className="px-5 py-6 text-sm text-rose-200">
              {error}
            </div>
          ) : applications.length === 0 && !isLoading ? (
            <div className="px-5 py-6 text-sm text-slate-200">
              No applications found yet. Once students start submitting, they
              will appear here for validation.
            </div>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-slate-950/70 text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3 font-medium">Applicant Name</th>
                  <th className="px-5 py-3 font-medium">Application ID</th>
                  <th className="px-5 py-3 font-medium">Current Step</th>
                  <th className="px-5 py-3 font-medium">Application Status</th>
                  <th className="px-5 py-3 font-medium">
                    <button
                      type="button"
                      onClick={() =>
                        setSortOrder((prev) =>
                          prev === "asc" ? "desc" : "asc",
                        )
                      }
                      className="inline-flex items-center gap-1 text-xs font-medium text-slate-300 hover:text-white"
                    >
                      Submitted At
                      <span className="text-[10px]">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedApplications.map((application, index) => (
                  <tr
                    key={application.id}
                    className={`border-t border-slate-800/80 ${
                      index % 2 === 0 ? "bg-slate-950/40" : "bg-slate-950/20"
                    }`}
                  >
                    <td className="px-5 py-3 text-slate-100">
                      {application.full_name || "—"}
                    </td>
                    <td className="px-5 py-3 text-slate-200 font-mono text-[13px]">
                      {application.application_id}
                    </td>
                    <td className="px-5 py-3 text-slate-200 text-xs">
                      Step {application.current_step}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium ${statusStyles(
                          application.application_status,
                        )}`}
                      >
                        {application.application_status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-300 text-xs">
                      {application.submitted_at
                        ? formatDate(application.submitted_at)
                        : "Not submitted"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

