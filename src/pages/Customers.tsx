import React, { useState, useEffect } from "react";
import {
  Search,
  RefreshCw,
  Loader2,
  Ban,
  Unlock,
  Phone,
  User as UserIcon,
  Filter,
  X,
  MapPin,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { User, UserStatus } from "@/types/user";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Import your custom hooks
import {
  useCustomers,
  useCustomer,
  useBlockCustomer,
  useUnblockCustomer,
} from "@/hooks/useCustomers";

// --- Utility Hook for Search Debouncing ---
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// --- Types ---

interface ConfirmDialogState {
  open: boolean;
  type: "block" | "unblock" | null;
  user: User | null;
}

type FilterStatus = "ALL" | UserStatus;

// --- Main Application Component ---

export default function Customers() {
  // UI State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  // Default to "ALL" so the UI knows to show "All Users"
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // --- API Integrations ---

  // 1. Fetch List
  const {
    data: customerData, // Renamed to avoid conflict with UserResponse type
    isLoading: isListLoading,
    isFetching: isListFetching,
    refetch: refetchList,
  } = useCustomers({
    page: currentPage,
    size: itemsPerPage,
    keyword: debouncedSearch,
    // THE FIX: If "ALL", send undefined. Otherwise, send the status string.
    status: filterStatus === "ALL" ? undefined : filterStatus,
  });

  // Derived data from API response
  // Accessing .content and .totalElements (assuming Spring Boot Pageable response structure)
  const users = customerData?.content || [];
  const totalResults = customerData?.totalElements || 0;
  const totalPages = customerData?.totalPages || 1;

  // 2. Fetch Single Detail (for Side Panel)
  const { data: selectedUserDetails, isLoading: isDetailLoading } =
    useCustomer(selectedUserId);

  // 3. Mutations
  const blockMutation = useBlockCustomer();
  const unblockMutation = useUnblockCustomer();

  // Dialog State
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    open: false,
    type: null,
    user: null,
  });

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [debouncedSearch, filterStatus]);

  // Handlers
  const handleUserClick = (user: User) => {
    setSelectedUserId(user.id);
  };

  const handleActionClick = (
    e: React.MouseEvent,
    user: User,
    type: "block" | "unblock"
  ) => {
    e.stopPropagation(); // Prevent row click
    setConfirmDialog({ open: true, type, user });
  };

  const confirmAction = async () => {
    const { user, type } = confirmDialog;
    if (!user || !type) return;

    try {
      if (type === "block") {
        await blockMutation.mutateAsync(user.id);
      } else {
        await unblockMutation.mutateAsync(user.id);
      }
      setConfirmDialog({ open: false, type: null, user: null });
    } catch (error) {
      console.error("Failed to update user status", error);
    }
  };

  const isMutationPending =
    blockMutation.isPending || unblockMutation.isPending;

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 font-sans text-gray-900 relative overflow-hidden">
      {/* --- Main Content Area --- */}
      <div
        className={`transition-all duration-300 ${
          selectedUserId ? "mr-[400px]" : ""
        }`}
      >
        {/* Header Section */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Customers
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage user access and view account details.
              </p>
            </div>
          </div>

          {/* Filters & Search Bar */}
          <Card className="p-1">
            <div className="flex flex-col sm:flex-row items-center gap-2 p-2">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search customers..."
                  className="w-full pl-9 pr-4 py-2 text-sm border-none focus:ring-0 focus:outline-none bg-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 border-l border-gray-200 pl-2">
                {/* Filter Dropdown */}
                <div className="relative">
                  <Button
                    variant={filterStatus === "ALL" ? "ghost" : "secondary"}
                    size="sm"
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className={
                      filterStatus !== "ALL"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : ""
                    }
                  >
                    <Filter className="mr-2 h-3.5 w-3.5" />
                    {filterStatus === "ALL"
                      ? "Filter"
                      : filterStatus === "ACTIVE"
                      ? "Active Users"
                      : "Blocked Users"}
                  </Button>

                  {isFilterOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20 animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase">
                        Status
                      </div>
                      {/* Fixed map to use "ALL" instead of "" to match state */}
                      {(["ALL", "ACTIVE", "BLOCKED"] as FilterStatus[]).map(
                        (status) => (
                          <button
                            key={status}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                              filterStatus === status
                                ? "text-blue-600 bg-blue-50"
                                : "text-gray-700"
                            }`}
                            onClick={() => {
                              setFilterStatus(status);
                              setIsFilterOpen(false);
                            }}
                          >
                            {status === "ALL"
                              ? "All Users"
                              : status.charAt(0) +
                                status.slice(1).toLowerCase()}
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>

                {isFilterOpen && (
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsFilterOpen(false)}
                  />
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => refetchList()}
                >
                  <RefreshCw
                    className={`h-4 w-4 ${
                      isListFetching ? "animate-spin" : ""
                    }`}
                  />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Users Table */}
        <Card className="overflow-hidden flex flex-col min-h-[400px]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50/50 text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Phone</th>
                  <th className="px-6 py-4 font-medium">Joined</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isListLoading ? (
                  // Loading State
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex justify-center items-center gap-2 text-gray-500">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span>Loading customers...</span>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  // Empty State
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                          <Search className="h-6 w-6 text-gray-400" />
                        </div>
                        <p className="font-medium text-gray-900">
                          No users found
                        </p>
                        <p className="text-sm">
                          Try adjusting your filters or search.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  // Data Mapping
                  users.map((user) => (
                    <tr
                      key={user.id}
                      onClick={() => handleUserClick(user)}
                      className={`group cursor-pointer transition-colors hover:bg-gray-50 ${
                        selectedUserId === user.id ? "bg-blue-50/50" : ""
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                            ${
                              selectedUserId === user.id
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-600 group-hover:bg-white group-hover:shadow-sm"
                            }`}
                          >
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {user.name}
                            </div>
                            <div className="text-gray-500 text-xs">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {user.status === "ACTIVE" ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <Badge variant="destructive">Blocked</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {user.phoneNumber}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {/* Safe check for createdAt */}
                        {user.createdAt ? user.createdAt.slice(0, 10) : "N/A"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {user.status === "ACTIVE" ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={(e) =>
                                handleActionClick(e, user, "block")
                              }
                              title="Block User"
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={(e) =>
                                handleActionClick(e, user, "unblock")
                              }
                              title="Unblock User"
                            >
                              <Unlock className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {!isListLoading && users.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/30 mt-auto">
              <p className="text-xs text-gray-500">
                Showing{" "}
                <span className="font-medium">
                  {(currentPage - 1) * itemsPerPage + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, totalResults)}
                </span>{" "}
                of <span className="font-medium">{totalResults}</span> results
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 5))}
                  disabled={currentPage === 1}
                  className="h-8 px-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="ml-1">Prev</span>
                </Button>
                <div className="flex items-center gap-1">
                  {(() => {
                    const startPage = Math.floor((currentPage - 1) / 5) * 5 + 1;
                    const endPage = Math.min(startPage + 4, totalPages);
                    const pages = [];
                    for (let i = startPage; i <= endPage; i++) pages.push(i);

                    return pages.map((pNum) => (
                      <button
                        key={pNum}
                        onClick={() => setCurrentPage(pNum)}
                        className={`h-8 w-8 text-xs rounded-md transition-colors ${
                          currentPage === pNum
                            ? "bg-black text-white"
                            : "hover:bg-gray-100 text-gray-600"
                        }`}
                      >
                        {pNum}
                      </button>
                    ));
                  })()}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 5))
                  }
                  disabled={currentPage >= totalPages}
                  className="h-8 px-2"
                >
                  <span className="mr-1">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* --- Detailed Side Panel (Slide Over) --- */}
      <div
        className={`fixed inset-y-0 right-0 w-[400px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out border-l border-gray-200 z-30 ${
          selectedUserId ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {selectedUserDetails && !isDetailLoading ? (
          <div className="h-full flex flex-col">
            {/* Panel Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedUserId(null)}
                >
                  <X className="h-5 w-5" />
                </Button>
                {selectedUserDetails.status === "ACTIVE" ? (
                  <Badge variant="success">Active Account</Badge>
                ) : (
                  <Badge variant="destructive">Account Blocked</Badge>
                )}
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-2xl font-semibold text-gray-700 mb-4 shadow-inner">
                  {selectedUserDetails.name.charAt(0)}
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedUserDetails.name}
                </h2>
                <p className="text-gray-500">{selectedUserDetails.email}</p>
              </div>
            </div>

            {/* Panel Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Info Grid */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">
                      {selectedUserDetails.phoneNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">
                      {selectedUserDetails.address || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                    <UserIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">
                      @{selectedUserDetails.username}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Account Stats
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 border border-gray-100 rounded-xl text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {selectedUserDetails.totalOrders}
                    </div>
                    <div className="text-xs text-gray-500">Total Orders</div>
                  </div>
                  <div className="p-4 border border-gray-100 rounded-xl text-center">
                    <div className="text-sm font-bold text-gray-900">
                      {selectedUserDetails.createdAt
                        ? selectedUserDetails.createdAt.slice(0, 10)
                        : "N/A"}
                    </div>
                    <div className="text-xs text-gray-500">Joined Date</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Panel Footer (Actions) */}
            <div className="p-6 border-t border-gray-100 bg-gray-50/50">
              {selectedUserDetails.status === "ACTIVE" ? (
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-red-50 text-red-800 rounded-lg text-sm mb-4">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <p>
                      Blocking this user will immediately revoke their access to
                      the platform and API keys.
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() =>
                      setConfirmDialog({
                        open: true,
                        type: "block",
                        user: selectedUserDetails,
                      })
                    }
                  >
                    <Ban className="mr-2 h-4 w-4" />
                    Block Customer
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-green-50 text-green-800 rounded-lg text-sm mb-4">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <p>
                      Unblocking will restore full access. The user may need to
                      reset their password.
                    </p>
                  </div>
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    onClick={() =>
                      setConfirmDialog({
                        open: true,
                        type: "unblock",
                        user: selectedUserDetails,
                      })
                    }
                  >
                    <Unlock className="mr-2 h-4 w-4" />
                    Unblock Customer
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute -top-12 -right-12"
                onClick={() => setSelectedUserId(null)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="text-sm">Loading user details...</span>
          </div>
        )}
      </div>

      {/* --- Confirmation Dialog (Overlay) --- */}
      {confirmDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => {
              if (!isMutationPending) {
                setConfirmDialog({ ...confirmDialog, open: false });
              }
            }}
          />
          <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 mb-4">
              <div
                className={`p-3 rounded-full ${
                  confirmDialog.type === "block"
                    ? "bg-red-100 text-red-600"
                    : "bg-green-100 text-green-600"
                }`}
              >
                {confirmDialog.type === "block" ? (
                  <ShieldAlert className="h-6 w-6" />
                ) : (
                  <Unlock className="h-6 w-6" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {confirmDialog.type === "block"
                    ? "Block User Access?"
                    : "Restore User Access?"}
                </h3>
                <p className="text-sm text-gray-500">
                  You are about to modify{" "}
                  <strong>{confirmDialog.user?.name}</strong>.
                </p>
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-6 bg-gray-50 p-3 rounded-lg border border-gray-100">
              {confirmDialog.type === "block"
                ? "They will not be able to log in or make purchases until you unblock them."
                : "They will regain access to all features immediately."}
            </p>

            <div className="flex items-center justify-end gap-3">
              <Button
                variant="secondary"
                disabled={isMutationPending}
                onClick={() =>
                  setConfirmDialog({ ...confirmDialog, open: false })
                }
              >
                Cancel
              </Button>
              <Button
                className={
                  confirmDialog.type === "unblock"
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : ""
                }
                disabled={isMutationPending}
                onClick={confirmAction}
              >
                {isMutationPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {confirmDialog.type === "block"
                  ? "Yes, Block User"
                  : "Yes, Unblock User"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
