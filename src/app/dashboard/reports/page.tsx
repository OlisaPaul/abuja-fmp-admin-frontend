"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { ReportsResponse, Report, ReportStatus } from "@/types/report";
import { UsersResponse, User } from "@/types/user";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  FileText,
  Calendar,
  Building2,
  TrendingUp,
  DollarSign,
  Clock,
  Edit,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const STATUSES: { value: string; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "paid", label: "Paid" },
  { value: "unpaid", label: "Unpaid" },
  { value: "submitted", label: "Submitted" },
  { value: "unsubmitted", label: "Unsubmitted" },
  { value: "processing", label: "Processing" },
  { value: "overdue", label: "Overdue" },
  { value: "draft", label: "Draft" },
];

const PAGE_SIZES = [10, 25, 50, 100];

// Helper to format date for input
function formatDateForInput(date: Date): string {
  return date.toISOString().split("T")[0];
}

// Helper to get start of year
function getStartOfYear(): string {
  const now = new Date();
  return formatDateForInput(new Date(now.getFullYear(), 0, 1));
}

// Helper to get end of year
function getEndOfYear(): string {
  const now = new Date();
  return formatDateForInput(new Date(now.getFullYear(), 11, 31));
}

export default function ReportsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState("all");
  const [parishId, setParishId] = useState("all");
  const [startDate, setStartDate] = useState(getStartOfYear());
  const [endDate, setEndDate] = useState(getEndOfYear());
  const [searchQuery, setSearchQuery] = useState("");
  const [editingReport, setEditingReport] = useState<Report | null>(null);

  // Fetch parishes for the dropdown
  const { data: parishesData } = useQuery<UsersResponse>({
    queryKey: ["parishes"],
    queryFn: async () => {
      const response = await api.get("/auth/users?role=parish&limit=1000");
      return response.data;
    },
  });

  // Fetch reports with filters
  const { data, isLoading, error } = useQuery<ReportsResponse>({
    queryKey: ["reports", page, limit, status, parishId, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (startDate) {
        params.append("startDate", new Date(startDate).toISOString());
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        params.append("endDate", end.toISOString());
      }
      if (status !== "all") {
        params.append("status", status);
      }
      if (parishId !== "all") {
        params.append("parishId", parishId);
      }

      const response = await api.get(`/reports?${params.toString()}`);
      return response.data;
    },
  });

  // Client-side search filtering
  const filteredReports = useMemo(() => {
    if (!data?.data) return [];
    if (!searchQuery.trim()) return data.data;

    const query = searchQuery.toLowerCase();
    return data.data.filter(
      (report) =>
        report.parish?.name?.toLowerCase().includes(query) ||
        report.parish?.parishName?.toLowerCase().includes(query) ||
        report.parish?.email?.toLowerCase().includes(query)
    );
  }, [data?.data, searchQuery]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    setPage(1);
  };

  const handleParishChange = (newParishId: string) => {
    setParishId(newParishId);
    setPage(1);
  };

  const handleDateChange = (type: "start" | "end", value: string) => {
    if (type === "start") {
      setStartDate(value);
    } else {
      setEndDate(value);
    }
    setPage(1);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-slate-400 mt-2">
          View and verify parish financial submissions.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        {/* First Row: Search and Status */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by parish name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="pl-12 pr-8 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer min-w-[180px]"
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Page Size */}
          <div className="relative">
            <select
              value={limit}
              onChange={(e) => handleLimitChange(Number(e.target.value))}
              className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer min-w-[120px]"
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size} per page
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Second Row: Date Range and Parish */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Start Date */}
          <div className="flex-1">
            <label className="block text-xs text-slate-500 mb-2">
              Start Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleDateChange("start", e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* End Date */}
          <div className="flex-1">
            <label className="block text-xs text-slate-500 mb-2">
              End Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => handleDateChange("end", e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Parish Filter */}
          <div className="flex-1">
            <label className="block text-xs text-slate-500 mb-2">Parish</label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <select
                value={parishId}
                onChange={(e) => handleParishChange(e.target.value)}
                className="w-full pl-12 pr-8 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
              >
                <option value="all">All Parishes</option>
                {parishesData?.data?.map((parish) => (
                  <option key={parish.id} value={parish.id}>
                    {parish.parishName || parish.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="animate-pulse">
            <div className="h-14 bg-slate-800 border-b border-slate-700" />
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-16 bg-slate-900 border-b border-slate-800 flex items-center px-6 gap-4"
              >
                <div className="h-4 bg-slate-800 rounded w-1/4" />
                <div className="h-4 bg-slate-800 rounded w-1/6" />
                <div className="h-4 bg-slate-800 rounded w-1/6" />
                <div className="h-4 bg-slate-800 rounded w-1/6" />
                <div className="h-4 bg-slate-800 rounded w-1/6" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-2xl p-6 text-center">
          <p className="text-red-500 font-medium">
            Failed to load reports. Please try again.
          </p>
          <p className="text-slate-400 text-sm mt-2">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
        </div>
      )}

      {/* Reports Table */}
      {!isLoading && !error && filteredReports.length > 0 && (
        <>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-800/50 border-b border-slate-700">
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">
                      Parish
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">
                      Period
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">
                      Status
                    </th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-slate-300">
                      Required
                    </th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-slate-300">
                      Paid
                    </th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-slate-300">
                      Compliance
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">
                      Date
                    </th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-slate-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((report) => (
                    <ReportRow
                      key={report.id}
                      report={report}
                      onEdit={(r) => setEditingReport(r)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {data?.meta && (
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="text-sm text-slate-400">
                Showing {data.meta.from} to {data.meta.to} of {data.meta.total}{" "}
                reports
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={!data.meta.hasPrev}
                  className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-2">
                  {[...Array(Math.min(5, data.meta.totalPages))].map((_, i) => {
                    let pageNum;
                    if (data.meta.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= data.meta.totalPages - 2) {
                      pageNum = data.meta.totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          page === pageNum
                            ? "bg-blue-600 text-white"
                            : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={!data.meta.hasNext}
                  className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredReports.length === 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <div className="bg-slate-800/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-10 w-10 text-slate-600" />
          </div>
          <p className="text-slate-500 font-medium">No reports found</p>
          <p className="text-slate-600 text-sm mt-2">
            {searchQuery
              ? "Try adjusting your search or filters"
              : "No reports match the selected criteria"}
          </p>
        </div>
      )}
      {/* Edit Report Modal */}
      {editingReport && (
        <EditReportModal
          report={editingReport}
          onClose={() => setEditingReport(null)}
        />
      )}
    </div>
  );
}

function ReportRow({
  report,
  onEdit,
}: {
  report: Report;
  onEdit: (report: Report) => void;
}) {
  const statusColors: Record<ReportStatus, string> = {
    paid: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
    unpaid: "bg-red-500/10 text-red-500 border-red-500/30",
    overdue: "bg-red-500/10 text-red-500 border-red-500/30",
    submitted: "bg-blue-500/10 text-blue-500 border-blue-500/30",
    unsubmitted: "bg-slate-500/10 text-slate-500 border-slate-500/30",
    processing: "bg-amber-500/10 text-amber-500 border-amber-500/30",
    draft: "bg-purple-500/10 text-purple-500 border-purple-500/30",
  };

  const statusColor = statusColors[report.status] || statusColors.unsubmitted;

  const canEdit = ["draft", "submitted", "overdue"].includes(report.status);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <tr className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
      {/* Parish */}
      <td className="px-6 py-4">
        <div>
          <p className="font-medium text-white">
            {report.parish?.parishName ||
              report.parish?.name ||
              "Unknown Parish"}
          </p>
          {report.parish?.diocese && (
            <p className="text-xs text-slate-500 mt-1">
              {report.parish.diocese}
              {report.parish.deanery && ` • ${report.parish.deanery}`}
            </p>
          )}
        </div>
      </td>

      {/* Period */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2 text-slate-300">
          <Clock className="h-4 w-4 text-slate-500" />
          <span>
            {report.month && report.year
              ? `${monthNames[report.month - 1]} ${report.year}`
              : new Date(report.createdAt).toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                })}
          </span>
        </div>
      </td>

      {/* Status */}
      <td className="px-6 py-4">
        <span
          className={`px-3 py-1 text-xs font-medium rounded-full border capitalize ${statusColor}`}
        >
          {report.status}
        </span>
      </td>

      {/* Required Amount */}
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2 text-slate-300">
          <DollarSign className="h-4 w-4 text-slate-500" />
          <span>₦{report.requiredPaymentAmount?.toLocaleString() || "0"}</span>
        </div>
      </td>

      {/* Paid Amount */}
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2 text-slate-300">
          <span className={report.paidAmount > 0 ? "text-emerald-400" : ""}>
            ₦{report.paidAmount?.toLocaleString() || "0"}
          </span>
        </div>
      </td>

      {/* Compliance */}
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <TrendingUp className="h-4 w-4 text-slate-500" />
          <span
            className={`font-medium ${
              (report.compliance ?? 0) >= 100
                ? "text-emerald-400"
                : (report.compliance ?? 0) >= 50
                ? "text-amber-400"
                : "text-red-400"
            }`}
          >
            {report.compliance?.toFixed(1) || "0"}%
          </span>
        </div>
      </td>

      {/* Date */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <Calendar className="h-4 w-4" />
          <span>{new Date(report.createdAt).toLocaleDateString()}</span>
        </div>
      </td>

      {/* Actions */}
      <td className="px-6 py-4 text-right">
        <button
          onClick={() => onEdit(report)}
          disabled={!canEdit}
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed group"
          title={canEdit ? "Edit report" : "Editing disabled for this status"}
        >
          <Edit
            className={`h-4 w-4 ${
              canEdit
                ? "text-slate-400 group-hover:text-blue-500"
                : "text-slate-600"
            }`}
          />
        </button>
      </td>
    </tr>
  );
}

import { useMutation, useQueryClient } from "@tanstack/react-query";

function EditReportModal({
  report,
  onClose,
}: {
  report: Report;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    status: report.status,
    balanceCarriedOver: report.balanceCarriedOver || 0,
    balanceBroughtForward: report.balanceBroughtForward || 0,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await api.put(`/reports/${report.id}`, data);
      return response.data;
    },
    onSuccess: () => {
      setSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      setTimeout(() => {
        onClose();
      }, 1500);
    },
    onError: (err) => {
      const error = err as { response?: { data?: { message?: string } } };
      setError(
        error.response?.data?.message ||
          "Failed to update report. Please try again."
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    updateMutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Edit Report</h2>
          <button
            onClick={onClose}
            disabled={updateMutation.isPending}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {/* Success State */}
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/50 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              <p className="font-medium text-emerald-500">
                Report updated successfully!
              </p>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="bg-slate-800/50 rounded-xl p-4 mb-6 space-y-2">
          <div>
            <p className="text-xs text-slate-500">Parish</p>
            <p className="text-sm font-medium text-white">
              {report.parish?.parishName || report.parish?.name}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Period</p>
            <p className="text-sm font-medium text-white">
              {report.month && report.year
                ? `${report.month}/${report.year}`
                : new Date(report.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as ReportStatus,
                })
              }
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              {STATUSES.filter((s) => s.value !== "all").map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Balance Carried Over (₦)
            </label>
            <input
              type="number"
              value={formData.balanceCarriedOver}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  balanceCarriedOver: Number(e.target.value),
                })
              }
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Balance Brought Forward (₦)
            </label>
            <input
              type="number"
              value={formData.balanceBroughtForward}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  balanceBroughtForward: Number(e.target.value),
                })
              }
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 mt-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={updateMutation.isPending}
              className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
