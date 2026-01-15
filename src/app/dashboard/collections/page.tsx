"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import {
  Collection,
  MandatoryCollection,
  Levy,
  CollectionsResponse,
  BankAccount,
} from "@/types/collection";
import {
  Calendar,
  CreditCard,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  Loader2,
  X,
  Plus,
  Coins,
  Landmark,
  ChevronLeft,
  ChevronRight,
  Filter,
  Power,
  Search,
  ListFilter,
} from "lucide-react";

const PAGE_SIZES = [10, 25, 50, 100];

// --- Types ---
type Tab = "mandatoryCollection" | "levy";

// --- Main Page Component ---
export default function CollectionsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("mandatoryCollection");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isActive, setIsActive] = useState("true");
  const [search, setSearch] = useState("");
  const [selectedCollection, setSelectedCollection] =
    useState<Collection | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<
    string | null
  >(null);

  const endpoint =
    activeTab === "mandatoryCollection" ? "/mandatory-collections" : "/levies";
  const queryKey = [activeTab, page, limit, isActive];

  // Debounce search not needed for client-side filtering of small pages, but good for large lists.
  // However, referencing UsersPage, let's filter client-side on the current page data.
  // Note: This only filters the CURRENT PAGE.

  const { data, isLoading, error } = useQuery<CollectionsResponse>({
    queryKey,
    queryFn: async () => {
      const response = await api.get(
        `${endpoint}?page=${page}&limit=${limit}&isActive=${isActive}`
      );
      return response.data;
    },
  });

  const filteredData =
    data?.data.filter((item) => {
      if (!search) return true;
      const query = search.toLowerCase();
      const name =
        activeTab === "mandatoryCollection"
          ? (item as MandatoryCollection).mandatoryCollectionName
          : (item as Levy).levyName;

      return (
        name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
      );
    }) || [];

  const queryClient = useQueryClient();

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`${endpoint}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      setDeleteConfirmationId(null);
    },
  });

  // Activate Mutation
  const activateMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`${endpoint}/${id}`, { isActive: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const handleEdit = (collection: Collection) => {
    setSelectedCollection(collection);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Collections & Levies</h1>
        <p className="text-slate-400 mt-2">
          Manage diocesan collections and levies.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-900/50 p-1 rounded-xl w-fit border border-slate-800">
        <button
          onClick={() => {
            setActiveTab("mandatoryCollection");
            setPage(1);
          }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "mandatoryCollection"
              ? "bg-blue-600 text-white shadow-lg"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          Mandatory Collections
        </button>
        <button
          onClick={() => {
            setActiveTab("levy");
            setPage(1);
          }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "levy"
              ? "bg-blue-600 text-white shadow-lg"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          Levies
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-500"
          />
        </div>

        {/* Active Filter */}
        <div className="flex gap-4 w-full md:w-auto">
          {/* Status Filter */}
          <div className="relative w-full md:w-48">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <select
              value={isActive}
              onChange={(e) => {
                setIsActive(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-8 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer text-sm"
            >
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </select>
          </div>

          {/* Page Size Filter */}
          <div className="relative w-32">
            <ListFilter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="w-full pl-10 pr-8 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer text-sm"
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size} per page
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-24 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/50 rounded-2xl p-6 text-center text-red-500">
            Failed to load data. Please try again.
          </div>
        ) : filteredData.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
            <Coins className="h-12 w-12 mx-auto mb-4 text-slate-600" />
            <p>
              No active{" "}
              {activeTab === "mandatoryCollection" ? "collections" : "levies"}{" "}
              found.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredData.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors group"
              >
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="space-y-4 flex-1">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-white">
                          {activeTab === "mandatoryCollection"
                            ? (item as MandatoryCollection)
                                .mandatoryCollectionName
                            : (item as Levy).levyName}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium border uppercase ${
                            item.isActive
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                              : "bg-slate-500/10 text-slate-500 border-slate-500/30"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <p className="text-slate-400 mt-1">{item.description}</p>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-slate-300">
                      <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-800">
                        <Calendar className="h-4 w-4 text-slate-500" />
                        <span>
                          Due: {new Date(item.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-800">
                        <Landmark className="h-4 w-4 text-slate-500" />
                        <span>
                          {item.bankAccount?.bankName} -{" "}
                          {item.bankAccount?.accountNumber}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex md:flex-col items-center justify-center gap-3 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6 min-w-[140px]">
                    {deleteConfirmationId === item.id ? (
                      <div className="flex items-center gap-2 bg-red-500/10 p-2 rounded-lg border border-red-500/30 animate-in fade-in zoom-in duration-200">
                        <p className="text-xs text-red-500 font-medium">
                          Confirm?
                        </p>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmationId(null)}
                          className="p-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-md transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(item)}
                          className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                        >
                          <Edit className="h-4 w-4" /> Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirmationId(item.id)}
                          className="w-full py-2 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm font-medium border border-transparent hover:border-red-500/30"
                        >
                          <Trash2 className="h-4 w-4" /> Delete
                        </button>
                      </>
                    )}

                    {/* Activation Button for Inactive Items */}
                    {!item.isActive && (
                      <button
                        onClick={() => activateMutation.mutate(item.id)}
                        disabled={activateMutation.isPending}
                        className="w-full py-2 px-4 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm font-medium border border-transparent hover:border-emerald-500/30"
                        title="Activate Collection"
                      >
                        {activateMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Power className="h-4 w-4" />
                        )}
                        Activate
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !error && data && data.data.length > 0 && (
          <Pagination
            meta={data.meta}
            page={page}
            onPageChange={(p) => {
              setPage(p);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        )}
      </div>

      {isEditModalOpen && selectedCollection && (
        <EditCollectionModal
          collection={selectedCollection}
          type={activeTab}
          endpoint={endpoint}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey });
            setIsEditModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

// --- Pagination Component ---
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
        Showing {meta.from} to {meta.to} of {meta.total}{" "}
        {meta.total === 1 ? "item" : "items"}
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

// --- Edit Modal Component ---
function EditCollectionModal({
  collection,
  type,
  endpoint,
  onClose,
  onSuccess,
}: {
  collection: Collection;
  type: Tab;
  endpoint: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  // Determine name field dynamically
  const nameKey =
    type === "mandatoryCollection" ? "mandatoryCollectionName" : "levyName";
  const initialName =
    type === "mandatoryCollection"
      ? (collection as MandatoryCollection).mandatoryCollectionName
      : (collection as Levy).levyName;

  const [formData, setFormData] = useState({
    [nameKey]: initialName,
    description: collection.description,
    dueDate: collection.dueDate.split("T")[0],
    bankAccountId: collection.bankAccountId,
  });

  // Fetch Bank Accounts
  const { data: bankAccountsData, isLoading: isLoadingBanks } = useQuery<{
    data: BankAccount[];
  }>({
    queryKey: ["bank-accounts"],
    queryFn: async () => {
      const response = await api.get("/bank-accounts?page=1&limit=100");
      return response.data;
    },
  });

  const [error, setError] = useState("");
  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      await api.patch(`${endpoint}/${collection.id}`, data);
    },
    onSuccess,
    onError: (err: any) =>
      setError(err.response?.data?.message || "Failed to update"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">
            Edit {type === "mandatoryCollection" ? "Collection" : "Levy"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs text-slate-500 mb-1.5 uppercase font-semibold tracking-wider">
              Name
            </label>
            <input
              type="text"
              value={formData[nameKey]}
              onChange={(e) =>
                setFormData({ ...formData, [nameKey]: e.target.value })
              }
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1.5 uppercase font-semibold tracking-wider">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1.5 uppercase font-semibold tracking-wider">
              Due Date
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) =>
                setFormData({ ...formData, dueDate: e.target.value })
              }
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Bank Account Selection */}
          <div>
            <label className="block text-xs text-slate-500 mb-1.5 uppercase font-semibold tracking-wider">
              Bank Account
            </label>
            {isLoadingBanks ? (
              <div className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-500 animate-pulse">
                Loading accounts...
              </div>
            ) : (
              <div className="relative">
                <select
                  value={formData.bankAccountId}
                  onChange={(e) =>
                    setFormData({ ...formData, bankAccountId: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                  required
                >
                  <option value="" disabled>
                    Select a bank account
                  </option>
                  {bankAccountsData?.data.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.bankName} - {account.accountNumber}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <ChevronRight className="h-4 w-4 rotate-90" />
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-500">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors"
              disabled={updateMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              {updateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
