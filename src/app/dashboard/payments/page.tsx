"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import {
  PaymentsResponse,
  Payment,
  PaymentStatus,
  PayableType,
} from "@/types/payment";
import {
  Filter,
  ChevronLeft,
  ChevronRight,
  FileText,
  Calendar,
  DollarSign,
  Clock,
  Eye,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  CreditCard,
  User as UserIcon,
  Building2,
} from "lucide-react";

// --- Constants ---

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
];

const PAYABLE_TYPES: { value: string; label: string }[] = [
  { value: "all", label: "All Types" },
  { value: "report", label: "Report" },
  { value: "levy", label: "Levy" },
  { value: "mandatoryCollection", label: "Mandatory Collection" },
];

const PAGE_SIZES = [10, 25, 50, 100];

// --- Helper Functions ---

function getStartOfYear(): string {
  const now = new Date();
  return new Date(now.getFullYear(), 0, 1).toISOString().split("T")[0];
}

function getEndOfYear(): string {
  const now = new Date();
  return new Date(now.getFullYear(), 11, 31).toISOString().split("T")[0];
}

// --- Main Page Component ---

export default function PaymentsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState("all");
  const [payableType, setPayableType] = useState("all");
  const [startDate, setStartDate] = useState(getStartOfYear());
  const [endDate, setEndDate] = useState(getEndOfYear());

  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  // Fetch payments with filters
  const { data, isLoading, error } = useQuery<PaymentsResponse>({
    queryKey: [
      "payments",
      page,
      limit,
      status,
      payableType,
      startDate,
      endDate,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (status !== "all") params.append("status", status);
      if (payableType !== "all") params.append("payableType", payableType);

      // Note: Backend endpoint for date filtering wasn't explicitly requested but kept for future use if needed,
      // or we can remove these if the backend doesn't support them yet.
      // Based on previous patterns, we include them.
      if (startDate)
        params.append("startDate", new Date(startDate).toISOString());
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        params.append("endDate", end.toISOString());
      }

      const response = await api.get(`/payments?${params.toString()}`);
      return response.data;
    },
  });

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Payments</h1>
        <p className="text-slate-400 mt-2">
          Monitor transactions and payment allocations.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Status Filter */}
          <div className="flex-1 relative">
            <label className="block text-xs text-slate-500 mb-2">Status</label>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-12 pr-8 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Payable Type Filter */}
          <div className="flex-1 relative">
            <label className="block text-xs text-slate-500 mb-2">
              Payable Type
            </label>
            <div className="relative">
              <FileText className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <select
                value={payableType}
                onChange={(e) => {
                  setPayableType(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-12 pr-8 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
              >
                {PAYABLE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Limit Filter */}
          <div className="w-full md:w-32 relative">
            <label className="block text-xs text-slate-500 mb-2">
              Page Size
            </label>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && <LoadingSkeleton />}

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-2xl p-6 text-center">
          <p className="text-red-500 font-medium">Failed to load payments.</p>
          <p className="text-slate-400 text-sm mt-2">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
        </div>
      )}

      {/* Data Table */}
      {!isLoading && !error && data?.data && data.data.length > 0 && (
        <>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-800/50 border-b border-slate-700">
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">
                      Payer
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">
                      Type / Ref
                    </th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-slate-300">
                      Amount
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">
                      Status
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
                  {data.data.map((payment) => (
                    <PaymentRow
                      key={payment.id}
                      payment={payment}
                      onView={() => setSelectedPayment(payment)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <Pagination
            meta={data.meta}
            page={page}
            onPageChange={handlePageChange}
          />
        </>
      )}

      {/* Empty State */}
      {!isLoading && !error && (!data?.data || data.data.length === 0) && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <div className="bg-slate-800/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="h-10 w-10 text-slate-600" />
          </div>
          <p className="text-slate-500 font-medium">No payments found</p>
        </div>
      )}

      {/* Details/Confirm Modal */}
      {selectedPayment && (
        <PaymentDetailsModal
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
        />
      )}
    </div>
  );
}

// --- Sub-Components ---

function PaymentRow({
  payment,
  onView,
}: {
  payment: Payment;
  onView: () => void;
}) {
  const statusColors: Record<PaymentStatus, string> = {
    confirmed:
      "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30",
    pending: "bg-amber-500/10 text-amber-500 border border-amber-500/30",
  };

  // Derive primary allocation info for display
  const primaryAllocation = payment.allocations?.[0];
  const description = primaryAllocation?.payableEntityName || "Payment";
  const typeLabel = primaryAllocation?.payableType || "General";

  return (
    <tr className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
      {/* Payer */}
      <td className="px-6 py-4">
        <div>
          <p className="font-medium text-white">
            {payment.payer?.parishName || payment.payer?.name || "Unknown"}
          </p>
          {payment.payer?.deanery && (
            <p className="text-xs text-slate-500">{payment.payer.deanery}</p>
          )}
        </div>
      </td>

      {/* Type / Ref */}
      <td className="px-6 py-4">
        <div>
          <p className="text-sm text-slate-200 font-medium">{description}</p>
          <span className="text-xs text-slate-500 uppercase tracking-wider">
            {typeLabel}
          </span>
        </div>
      </td>

      {/* Amount */}
      <td className="px-6 py-4 text-right">
        <span className="font-medium text-slate-200">
          ₦{Number(payment.amount).toLocaleString()}
        </span>
      </td>

      {/* Status */}
      <td className="px-6 py-4">
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
            statusColors[payment.status] || "text-slate-500"
          }`}
        >
          {payment.status}
        </span>
      </td>

      {/* Date */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <Clock className="h-3.5 w-3.5" />
          <span>{new Date(payment.createdAt).toLocaleDateString()}</span>
        </div>
      </td>

      {/* Actions */}
      <td className="text-right px-6 py-4">
        <button
          onClick={onView}
          className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-blue-400 transition-colors"
          title="View Details"
        >
          <Eye className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}

function PaymentDetailsModal({
  payment,
  onClose,
}: {
  payment: Payment;
  onClose: () => void;
}) {
  const [confirmError, setConfirmError] = useState("");
  const [confirmSuccess, setConfirmSuccess] = useState(false);
  const [comment, setComment] = useState("");
  const queryClient = useQueryClient();

  // Fetch full details
  const { data: fullPayment, isLoading } = useQuery<Payment>({
    queryKey: ["payment", payment.id],
    queryFn: async () => {
      const res = await api.get(`/payments/${payment.id}`);
      return res.data;
    },
    initialData: payment,
  });

  const confirmMutation = useMutation({
    mutationFn: async () => {
      const res = await api.patch(`/payments/${payment.id}/confirm`, {
        status: "confirmed",
        comment: comment || undefined,
      });
      return res.data;
    },
    onSuccess: () => {
      setConfirmSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["payment", payment.id] });
      setTimeout(onClose, 2000);
    },
    onError: (err: any) => {
      setConfirmError(
        err.response?.data?.message || "Failed to confirm payment"
      );
    },
  });

  if (isLoading) return null; // Or a tailored loader inside modal

  const activePayment = fullPayment || payment;
  const isPending = activePayment.status === "pending";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-500" />
            Payment Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Success/Error Alerts */}
          {confirmSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 p-4 rounded-xl flex items-center gap-3">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">
                Payment confirmed successfully!
              </span>
            </div>
          )}

          {confirmError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl flex items-center gap-3">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">{confirmError}</span>
            </div>
          )}

          {/* Receipt Image */}
          {activePayment.receiptUrl && (
            <div className="w-full h-48 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activePayment.receiptUrl}
                alt="Receipt"
                className="w-full h-full object-contain"
              />
              <a
                href={activePayment.receiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium gap-2"
              >
                <Eye className="h-5 w-5" /> View Full Receipt
              </a>
            </div>
          )}

          {/* Key Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Payer Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                Payer Information
              </h3>
              <div className="bg-slate-800/50 rounded-xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-slate-500 mt-0.5" />
                  <div>
                    <p className="text-white font-medium">
                      {activePayment.payer?.parishName}
                    </p>
                    <p className="text-sm text-slate-400">
                      {activePayment.payer?.deanery}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <UserIcon className="h-5 w-5 text-slate-500 mt-0.5" />
                  <div>
                    <p className="text-white font-medium">
                      {activePayment.payer?.name}
                    </p>
                    <p className="text-sm text-slate-400">
                      {activePayment.payer?.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                Transaction Info
              </h3>
              <div className="bg-slate-800/50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Status</span>
                  <span
                    className={`capitalize font-medium ${
                      activePayment.status === "confirmed"
                        ? "text-emerald-400"
                        : "text-amber-400"
                    }`}
                  >
                    {activePayment.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Amount</span>
                  <span className="font-bold text-white text-lg">
                    ₦{Number(activePayment.amount).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Date</span>
                  <span className="text-white">
                    {new Date(activePayment.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Allocations */}
          {activePayment.allocations &&
            activePayment.allocations.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                  Payment Allocations
                </h3>
                <div className="bg-slate-800/30 rounded-xl border border-slate-800 overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-800 text-slate-400">
                      <tr>
                        <th className="px-4 py-2 font-medium">Type</th>
                        <th className="px-4 py-2 font-medium">Entity Name</th>
                        <th className="px-4 py-2 font-medium text-right">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {activePayment.allocations.map((alloc, index) => (
                        <tr key={alloc.id || index}>
                          <td className="px-4 py-3 capitalize text-slate-300">
                            {alloc.payableType}
                          </td>
                          <td className="px-4 py-3 text-white font-medium">
                            {alloc.payableEntityName}
                          </td>
                          <td className="px-4 py-3 text-right text-emerald-400">
                            ₦{Number(alloc.amount).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          {/* Confirmation Info (if confirmed) */}
          {activePayment.status === "confirmed" &&
            activePayment.confirmedBy && (
              <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-4 text-sm">
                <p className="text-emerald-500 font-medium mb-1">
                  Confirmation Details
                </p>
                <p className="text-slate-400">
                  Confirmed by{" "}
                  <span className="text-white">
                    {activePayment.confirmedBy.name}
                  </span>{" "}
                  on{" "}
                  {activePayment.createdAt
                    ? new Date(activePayment.createdAt).toLocaleDateString()
                    : "-"}
                </p>
                {activePayment.comment && (
                  <p className="text-slate-400 mt-2 italic">
                    "{activePayment.comment}"
                  </p>
                )}
              </div>
            )}

          {/* Comment for Confirmation (Pending Only) */}
          {isPending && (
            <div className="space-y-2">
              <label
                htmlFor="comment"
                className="block text-sm font-medium text-slate-400"
              >
                Confirmation Comment (Optional)
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a note about this payment confirmation..."
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-none"
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-800 bg-slate-900 sticky bottom-0 z-10 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors"
          >
            Close
          </button>

          {isPending && (
            <button
              onClick={() => confirmMutation.mutate()}
              disabled={confirmMutation.isPending || confirmSuccess}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              {confirmMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Confirm Payment
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
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
  );
}

function Pagination({
  meta,
  page,
  onPageChange,
}: {
  meta: any;
  page: number;
  onPageChange: (p: number) => void;
}) {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <div className="text-sm text-slate-400">
        Showing {meta.from} to {meta.to} of {meta.total} payments
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!meta.hasPrev}
          className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">
          {page}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!meta.hasNext}
          className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
