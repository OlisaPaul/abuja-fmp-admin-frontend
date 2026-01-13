"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { UsersResponse, User } from "@/types/user";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Users as UsersIcon,
  Mail,
  MapPin,
  Calendar,
  TrendingUp,
  Wallet,
  Link as LinkIcon,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Edit,
  MoreVertical,
  Trash2,
} from "lucide-react";

const ROLES = ["all", "parish", "admin", "diocese", "deanery"];
const PAGE_SIZES = [10, 25, 50, 100];

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [role, setRole] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [linkingUser, setLinkingUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [hardDeletingUser, setHardDeletingUser] = useState<User | null>(null);

  // Fetch users with React Query
  const { data, isLoading, error } = useQuery<UsersResponse>({
    queryKey: ["users", page, limit, role],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (role !== "all") {
        params.append("role", role);
      }

      const response = await api.get(`/auth/users?${params.toString()}`);
      return response.data;
    },
  });

  // Client-side search filtering
  const filteredUsers = useMemo(() => {
    if (!data?.data) return [];
    if (!searchQuery.trim()) return data.data;

    const query = searchQuery.toLowerCase();
    return data.data.filter(
      (user) =>
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.parishName?.toLowerCase().includes(query)
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

  const handleRoleChange = (newRole: string) => {
    setRole(newRole);
    setPage(1);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-slate-400 mt-2">
          Manage platform users, roles, and permissions.
        </p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, or parish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Role Filter */}
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <select
            value={role}
            onChange={(e) => handleRoleChange(e.target.value)}
            className="pl-12 pr-8 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer min-w-[180px]"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r === "all"
                  ? "All Roles"
                  : r.charAt(0).toUpperCase() + r.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Page Size */}
        <div className="relative">
          <select
            value={limit}
            onChange={(e) => handleLimitChange(Number(e.target.value))}
            className="px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer min-w-[120px]"
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size} per page
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 animate-pulse"
            >
              <div className="h-6 bg-slate-800 rounded w-1/2 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                <div className="h-4 bg-slate-800 rounded w-2/3"></div>
                <div className="h-4 bg-slate-800 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-2xl p-6 text-center">
          <p className="text-red-500 font-medium">
            Failed to load users. Please try again.
          </p>
          <p className="text-slate-400 text-sm mt-2">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
        </div>
      )}

      {/* Users Grid */}
      {!isLoading && !error && filteredUsers.length > 0 && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredUsers.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onLinkWallet={(user) => setLinkingUser(user)}
                onEdit={(user) => setEditingUser(user)}
                onHardDelete={(user) => setHardDeletingUser(user)}
              />
            ))}
          </div>

          {/* Pagination */}
          {data?.meta && (
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="text-sm text-slate-400">
                Showing {data.meta.from} to {data.meta.to} of {data.meta.total}{" "}
                users
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
      {!isLoading && !error && filteredUsers.length === 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <div className="bg-slate-800/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <UsersIcon className="h-10 w-10 text-slate-600" />
          </div>
          <p className="text-slate-500 font-medium">No users found</p>
          <p className="text-slate-600 text-sm mt-2">
            {searchQuery
              ? "Try adjusting your search or filters"
              : "No users match the selected criteria"}
          </p>
        </div>
      )}

      {/* Link Wallet Modal */}
      {linkingUser && (
        <LinkWalletModal
          user={linkingUser}
          onClose={() => setLinkingUser(null)}
        />
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
        />
      )}

      {/* Hard Delete Modal */}
      {hardDeletingUser && (
        <HardDeleteModal
          user={hardDeletingUser}
          onClose={() => setHardDeletingUser(null)}
        />
      )}
    </div>
  );
}

function UserCard({
  user,
  onLinkWallet,
  onEdit,
  onHardDelete,
}: {
  user: User;
  onLinkWallet: (user: User) => void;
  onEdit: (user: User) => void;
  onHardDelete: (user: User) => void;
}) {
  const statusColors = {
    linked: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
    not_linked: "bg-slate-500/10 text-slate-500 border-slate-500/30",
    pending: "bg-amber-500/10 text-amber-500 border-amber-500/30",
  };

  const statusColor =
    statusColors[user.externalWalletStatus as keyof typeof statusColors] ||
    statusColors.not_linked;

  const canLinkWallet =
    user.role === "parish" && user.externalWalletStatus === "not_linked";

  const [creatingAccount, setCreatingAccount] = useState(false);
  const [accountError, setAccountError] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const queryClient = useQueryClient();

  const canCreateAccount =
    user.role === "parish" &&
    user.externalWalletStatus === "active" &&
    !user.hasAccountNumber;

  const createAccountMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await api.post(
        `/wallet/dynamic-account?userId=${userId}`
      );
      return response.data;
    },
    onSuccess: () => {
      setCreatingAccount(false);
      setAccountError("");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err: any) => {
      setCreatingAccount(false);
      setAccountError(
        err.response?.data?.message || "Failed to create account"
      );
      setTimeout(() => setAccountError(""), 5000);
    },
  });

  const handleCreateAccount = () => {
    setCreatingAccount(true);
    setAccountError("");
    createAccountMutation.mutate(user.id);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white">{user.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-3 py-1 bg-blue-500/10 text-blue-500 text-xs font-medium rounded-full border border-blue-500/30">
              {user.role}
            </span>
            {user.category && (
              <span className="px-3 py-1 bg-purple-500/10 text-purple-500 text-xs font-medium rounded-full border border-purple-500/30">
                Category {user.category}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(user)}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            title="Edit user"
          >
            <Edit className="h-4 w-4 text-slate-400 hover:text-white" />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              title="More options"
            >
              <MoreVertical className="h-4 w-4 text-slate-400 hover:text-white" />
            </button>
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-lg z-10">
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    onHardDelete(user);
                  }}
                  className="w-full px-4 py-3 text-left text-red-400 hover:bg-slate-700 rounded-xl flex items-center gap-2 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Permanently Delete
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Mail className="h-4 w-4" />
          <span>{user.email}</span>
        </div>

        {user.parishName && (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <UsersIcon className="h-4 w-4" />
            <span>
              {user.parishName} {user.acronym && `(${user.acronym})`}
            </span>
          </div>
        )}

        {(user.diocese || user.deanery || user.lga) && (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <MapPin className="h-4 w-4" />
            <span>
              {[user.diocese, user.deanery, user.lga]
                .filter(Boolean)
                .join(" • ")}
            </span>
          </div>
        )}
      </div>

      {/* Stats */}
      {user.stats && (
        <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-slate-800/50 rounded-xl">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <TrendingUp className="h-3 w-3" />
              <span>Compliance</span>
            </div>
            <p className="text-sm font-bold text-white">
              {user.stats.averageCompliance.toFixed(1)}%
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <Wallet className="h-3 w-3" />
              <span>Avg Payment</span>
            </div>
            <p className="text-sm font-bold text-white">
              ₦{user.stats.averageRequiredPaymentAmount.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="space-y-3">
        {/* Error Message */}
        {accountError && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-400">{accountError}</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Calendar className="h-3 w-3" />
            <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 text-xs font-medium rounded-full border ${statusColor}`}
            >
              {user.externalWalletStatus.replace("_", " ")}
            </span>
            {canCreateAccount && (
              <button
                onClick={handleCreateAccount}
                disabled={creatingAccount}
                className="flex items-center gap-2 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-full transition-colors disabled:opacity-50"
              >
                {creatingAccount ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Wallet className="h-3 w-3" />
                    Create Account
                  </>
                )}
              </button>
            )}
            {canLinkWallet && (
              <button
                onClick={() => onLinkWallet(user)}
                className="flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-full transition-colors"
              >
                <LinkIcon className="h-3 w-3" />
                Link Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function LinkWalletModal({
  user,
  onClose,
}: {
  user: User;
  onClose: () => void;
}) {
  const [cpayPid, setCpayPid] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const queryClient = useQueryClient();

  const linkMutation = useMutation({
    mutationFn: async (data: { cpay_pid: string; fmp_pid: string }) => {
      const response = await api.post("/wallet/admin/link-external", data);
      return response.data;
    },
    onSuccess: () => {
      setSuccess(true);
      // Invalidate users query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setTimeout(() => {
        onClose();
      }, 2000);
    },
    onError: (err: any) => {
      setError(
        err.response?.data?.message ||
          "Failed to link wallet. Please try again."
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!cpayPid.trim()) {
      setError("Please enter a CPay PID");
      return;
    }

    linkMutation.mutate({
      cpay_pid: cpayPid.trim(),
      fmp_pid: user.id,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Link External Wallet</h2>
          <button
            onClick={onClose}
            disabled={linkMutation.isPending}
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
              <div>
                <p className="font-medium text-emerald-500">
                  Wallet Linked Successfully!
                </p>
                <p className="text-sm text-emerald-400 mt-1">
                  The external wallet has been linked to this parish.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* User Info */}
        {!success && (
          <>
            <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-slate-500">Parish User</p>
                  <p className="font-medium text-white">{user.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Email</p>
                  <p className="text-sm text-slate-300">{user.email}</p>
                </div>
                {user.parishName && (
                  <div>
                    <p className="text-xs text-slate-500">Parish</p>
                    <p className="text-sm text-slate-300">
                      {user.parishName} {user.acronym && `(${user.acronym})`}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="cpay_pid"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  CPay PID <span className="text-red-500">*</span>
                </label>
                <input
                  id="cpay_pid"
                  type="text"
                  value={cpayPid}
                  onChange={(e) => setCpayPid(e.target.value)}
                  placeholder="P-123456"
                  disabled={linkMutation.isPending}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Enter the CPay Parish ID to link this user's wallet
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={linkMutation.isPending}
                  className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={linkMutation.isPending || !cpayPid.trim()}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {linkMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Linking...
                    </>
                  ) : (
                    "Link Wallet"
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function EditUserModal({ user, onClose }: { user: User; onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: user.name || "",
    parishName: user.parishName || "",
    diocese: user.diocese || "",
    lga: user.lga || "",
    address: user.address || "",
    acronym: user.acronym || "",
    town: user.town || "",
    deanery: user.deanery || "",
    category: user.category || "",
    phone: user.phone || "",
    alternativeEmail: user.alternativeEmail || "",
    alternativePhone: user.alternativePhone || "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await api.put(`/auth/users/${user.id}`, data);
      return response.data;
    },
    onSuccess: () => {
      setSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setTimeout(() => {
        onClose();
      }, 2000);
    },
    onError: (err: any) => {
      setError(
        err.response?.data?.message ||
          "Failed to update user. Please try again."
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await api.delete(`/auth/users/${user.id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      onClose();
    },
    onError: (err: any) => {
      setError(
        err.response?.data?.message ||
          "Failed to delete user. Please try again."
      );
      setShowDeleteConfirm(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    updateMutation.mutate(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] overflow-y-auto">
      <div className="flex min-h-full items-start justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl w-full my-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Edit User Profile</h2>
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
                <div>
                  <p className="font-medium text-emerald-500">
                    Profile Updated Successfully!
                  </p>
                  <p className="text-sm text-emerald-400 mt-1">
                    The user profile has been updated.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          {!success && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-4">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-slate-300 mb-2"
                    >
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={updateMutation.isPending}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-slate-300 mb-2"
                    >
                      Phone
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={updateMutation.isPending}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>

              {/* Parish Information */}
              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-4">
                  Parish Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="parishName"
                      className="block text-sm font-medium text-slate-300 mb-2"
                    >
                      Parish Name
                    </label>
                    <input
                      id="parishName"
                      name="parishName"
                      type="text"
                      value={formData.parishName}
                      onChange={handleChange}
                      disabled={updateMutation.isPending}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="acronym"
                      className="block text-sm font-medium text-slate-300 mb-2"
                    >
                      Acronym
                    </label>
                    <input
                      id="acronym"
                      name="acronym"
                      type="text"
                      value={formData.acronym}
                      onChange={handleChange}
                      disabled={updateMutation.isPending}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="category"
                      className="block text-sm font-medium text-slate-300 mb-2"
                    >
                      Category
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      disabled={updateMutation.isPending}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    >
                      <option value="">Select Category</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-4">
                  Location Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="diocese"
                      className="block text-sm font-medium text-slate-300 mb-2"
                    >
                      Diocese
                    </label>
                    <input
                      id="diocese"
                      name="diocese"
                      type="text"
                      value={formData.diocese}
                      onChange={handleChange}
                      disabled={updateMutation.isPending}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="deanery"
                      className="block text-sm font-medium text-slate-300 mb-2"
                    >
                      Deanery
                    </label>
                    <input
                      id="deanery"
                      name="deanery"
                      type="text"
                      value={formData.deanery}
                      onChange={handleChange}
                      disabled={updateMutation.isPending}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="lga"
                      className="block text-sm font-medium text-slate-300 mb-2"
                    >
                      LGA
                    </label>
                    <input
                      id="lga"
                      name="lga"
                      type="text"
                      value={formData.lga}
                      onChange={handleChange}
                      disabled={updateMutation.isPending}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="town"
                      className="block text-sm font-medium text-slate-300 mb-2"
                    >
                      Town
                    </label>
                    <input
                      id="town"
                      name="town"
                      type="text"
                      value={formData.town}
                      onChange={handleChange}
                      disabled={updateMutation.isPending}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label
                      htmlFor="address"
                      className="block text-sm font-medium text-slate-300 mb-2"
                    >
                      Address
                    </label>
                    <input
                      id="address"
                      name="address"
                      type="text"
                      value={formData.address}
                      onChange={handleChange}
                      disabled={updateMutation.isPending}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>

              {/* Alternative Contact */}
              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-4">
                  Alternative Contact
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="alternativeEmail"
                      className="block text-sm font-medium text-slate-300 mb-2"
                    >
                      Alternative Email
                    </label>
                    <input
                      id="alternativeEmail"
                      name="alternativeEmail"
                      type="email"
                      value={formData.alternativeEmail}
                      onChange={handleChange}
                      disabled={updateMutation.isPending}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="alternativePhone"
                      className="block text-sm font-medium text-slate-300 mb-2"
                    >
                      Alternative Phone
                    </label>
                    <input
                      id="alternativePhone"
                      name="alternativePhone"
                      type="tel"
                      value={formData.alternativePhone}
                      onChange={handleChange}
                      disabled={updateMutation.isPending}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between gap-3 pt-2">
                {/* Delete Button - Left Side */}
                {!showDeleteConfirm && (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={updateMutation.isPending}
                    className="px-4 py-3 bg-red-600/10 hover:bg-red-600/20 text-red-500 font-medium rounded-xl transition-colors disabled:opacity-50 border border-red-600/30"
                  >
                    Delete User
                  </button>
                )}

                {showDeleteConfirm && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">
                      Are you sure?
                    </span>
                    <button
                      type="button"
                      onClick={() => deleteMutation.mutate()}
                      disabled={deleteMutation.isPending}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1"
                    >
                      {deleteMutation.isPending ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        "Yes, Delete"
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={deleteMutation.isPending}
                      className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {/* Update/Cancel Buttons - Right Side */}
                <div className="flex gap-3 ml-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={
                      updateMutation.isPending || deleteMutation.isPending
                    }
                    className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      updateMutation.isPending || deleteMutation.isPending
                    }
                    className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {updateMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Profile"
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function HardDeleteModal({
  user,
  onClose,
}: {
  user: User;
  onClose: () => void;
}) {
  const [emailInput, setEmailInput] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await api.delete("/auth/users/hard-delete", {
        data: { email },
      });
      return response.data;
    },
    onSuccess: () => {
      setSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setTimeout(() => {
        onClose();
      }, 2000);
    },
    onError: (err: any) => {
      setError(
        err.response?.data?.message ||
          "Failed to delete user. Please try again."
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (emailInput.trim() !== user.email) {
      setError(
        "Email does not match. Please type the exact email address to confirm."
      );
      return;
    }

    deleteMutation.mutate(emailInput.trim());
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-red-900/50 rounded-2xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-red-500">
            Permanently Delete User
          </h2>
          <button
            onClick={onClose}
            disabled={deleteMutation.isPending}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/50 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="font-medium text-emerald-500">
                  User Deleted Successfully!
                </p>
                <p className="text-sm text-emerald-400 mt-1">
                  The user has been permanently removed.
                </p>
              </div>
            </div>
          </div>
        )}

        {!success && (
          <>
            <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-500">
                    Warning: This action cannot be undone!
                  </p>
                  <p className="text-sm text-red-400 mt-2">
                    This will permanently delete the user and all associated
                    data.
                  </p>
                  <div className="mt-3 p-3 bg-slate-800/50 rounded-lg">
                    <p className="text-xs text-slate-500">User to delete:</p>
                    <p className="font-medium text-white">{user.name}</p>
                    <p className="text-sm text-slate-300">{user.email}</p>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email_confirm"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  Type the user's email to confirm{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  id="email_confirm"
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder={user.email}
                  disabled={deleteMutation.isPending}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:opacity-50"
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={deleteMutation.isPending}
                  className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    deleteMutation.isPending || emailInput.trim() !== user.email
                  }
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleteMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Permanently Delete
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
