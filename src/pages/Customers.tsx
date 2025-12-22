import React, { useState, useEffect, useMemo } from "react";
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
  Calendar,   
  Award,     
  Ticket,   
  ShieldCheck,
  Download,
  MoreHorizontal
} from "lucide-react";
import { User, UserStatus } from "@/types/user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDebounce } from "@/hooks/useDebounce";
import { useThrottle } from "@/hooks/useThrottle";
// Import your custom hooks
import {
  useCustomers,
  useCustomer,
  useBlockCustomer,
  useUnblockCustomer,
} from "@/hooks/useCustomers";

// --- Utility Hook for Search Debouncing ---


// --- Types ---
interface ConfirmDialogState {
  open: boolean;
  type: "block" | "unblock" | null;
  user: User | null;
}

type FilterStatus = "ALL" | UserStatus;

export default function Customers() {
  // UI State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const isFirstRender = React.useRef(true);
  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(0);
  const itemsPerPage = 10;
  const throttledFilter = useThrottle(filterStatus, 800);
  const [isRefetching, setIsRefetching] = useState(false);

  const handleThrottledRefetch = async () => {
  if (isListFetching || isRefetching) return;
  setIsRefetching(true);
  await refetchList();
  setTimeout(() => setIsRefetching(false), 1000); 
};

  // --- API Integrations ---
  const {
    data: customerData,
    isLoading: isListLoading,
    isFetching: isListFetching,
    refetch: refetchList,
  } = useCustomers({
    page: currentPage,
    size: itemsPerPage,
    keyword: debouncedSearch,
    status: filterStatus === "ALL" ? undefined : throttledFilter,
  });

  const users = customerData?.content || [];
  const totalResults = customerData?.totalElements || 0;
  const totalPages = customerData?.totalPages || 1;

  const { data: selectedUserDetails, isLoading: isDetailLoading } =
    useCustomer(selectedUserId);

  const blockMutation = useBlockCustomer();
  const unblockMutation = useUnblockCustomer();

  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    open: false,
    type: null,
    user: null,
  });

  useEffect(() => {
    if (isFirstRender.current) {
    isFirstRender.current = false;
    return;
  }
  setCurrentPage(0);
  }, [debouncedSearch, filterStatus]);

  const handleUserClick = (user: User) => {
    setSelectedUserId(user.id);
  };

  const handleActionClick = (
    e: React.MouseEvent | undefined,
    user: User,
    type: "block" | "unblock"
  ) => {
    e?.stopPropagation();
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

  const isMutationPending = blockMutation.isPending || unblockMutation.isPending;

  return (
    <div className="p-8 font-sans text-gray-900 relative">
      {/* --- Breadcrumbs (Categories Theme) --- */}
      <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <span>🏠</span>
        <span>/</span>
        <span>Management</span>
        <span>/</span>
        <span className="text-gray-900">Customers</span>
      </div>

      <div className={`transition-all duration-300 ${selectedUserId ? "mr-[400px]" : ""}`}>
        {/* Header Section (Categories Theme) */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Customers</h1>
            <p className="text-gray-600">Manage user access and view account details.</p>
          </div>
        </div>

        {/* Search & Filters Card (Categories Style) */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="relative w-full sm:w-[350px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search customers..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 flex-1 justify-end">
                <span className="text-sm font-medium text-gray-700 whitespace-nowrap uppercase tracking-wider">Filter By:</span>
                
                {/* Status Selection (Categories Select Style) */}
                <div className="relative">
                  <Button
                    variant="outline"
                    className="min-w-[160px] justify-between"
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                  >
                    Status: {filterStatus === "ALL" ? "All" : filterStatus.charAt(0) + filterStatus.slice(1).toLowerCase()}
                    <Filter className="ml-2 h-3.5 w-3.5 text-gray-400" />
                  </Button>

                  {isFilterOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20">
                      {(["ALL", "ACTIVE", "BLOCKED"] as FilterStatus[]).map((status) => (
                        <button
                          key={status}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                            filterStatus === status ? "text-blue-600 font-medium" : "text-gray-700"
                          }`}
                          onClick={() => {
                            setFilterStatus(status);
                            setIsFilterOpen(false);
                          }}
                        >
                          {status === "ALL" ? "All Users" : status.charAt(0) + status.slice(1).toLowerCase()}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <Button variant="outline" size="icon" onClick={handleThrottledRefetch} disabled={isListFetching}>
                  <RefreshCw className={`h-4 w-4 ${isListFetching ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table Card */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Registry</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50/50 text-gray-500 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[11px]">Customer</th>
                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[11px]">Status</th>
                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[11px]">Phone</th>
                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[11px]">Joined</th>
                    <th className="px-6 py-4 text-right font-semibold uppercase tracking-wider text-[11px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isListLoading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-500" />
                        <p className="mt-2 text-sm text-gray-500">Loading customers...</p>
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                         No customers found matching your criteria.
                      </td>
                    </tr>
                  ) : (
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
                            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600 group-hover:bg-white shadow-sm border border-gray-100">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-gray-900">{user.name}</div>
                              <div className="text-gray-500 text-xs">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                             <div className={`h-2 w-2 rounded-full ${user.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`} />
                             <Badge variant={user.status === "ACTIVE" ? "success" : "destructive"}>
                               {user.status === "ACTIVE" ? "Active" : "Blocked"}
                             </Badge>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600 font-medium">{user.phoneNumber}</td>
                        <td className="px-6 py-4 text-gray-500">
                          {user.createdAt ? user.createdAt.slice(0, 10) : "N/A"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4 text-gray-400" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleUserClick(user)}>
                                <UserIcon className="mr-2 h-4 w-4" /> View Details
                              </DropdownMenuItem>
                              {user.status === "ACTIVE" ? (
                                <DropdownMenuItem 
                                  className="text-red-600 focus:text-red-600"
                                  onClick={() => handleActionClick(undefined, user, "block")}
                                >
                                  <Ban className="mr-2 h-4 w-4" /> Block User
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem 
                                  className="text-green-600 focus:text-green-600"
                                  onClick={() => handleActionClick(undefined, user, "unblock")}
                                >
                                  <Unlock className="mr-2 h-4 w-4" /> Unblock User
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer (Categories Logic) */}
            {!isListLoading && users.length > 0 && (
              <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-semibold">{totalResults === 0 ? 0 : currentPage * itemsPerPage + 1}</span> to{" "}
                  <span className="font-semibold">{Math.min((currentPage + 1) * itemsPerPage, totalResults)}</span> of {totalResults} results
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(0, p - 5))}
                    disabled={currentPage < 5 || isListFetching}
                  >
                    Previous
                  </Button>
                  
                  {/* Reuse the logic for page number rendering from Categories */}
                  {(() => {
                    const startPage = Math.floor(currentPage / 5) * 5 + 1;
                    const endPage = Math.min(startPage + 4, totalPages);
                    const pages = [];
                    for (let i = startPage; i <= endPage; i++) {pages.push(i)}
                    return pages.map((pNum) => (
                      <Button
                        key={pNum}
                        variant={currentPage === pNum-1 ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pNum-1)}
                        className="h-8 w-8 p-0"
                      >
                        {pNum}
                      </Button>
                    ));
                  })()}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages-1, p + 5))}
                    disabled={Math.floor(currentPage / 5) === Math.floor((totalPages - 1) / 5 ) || isListFetching}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* --- Side Panel (Slide Over) --- */}
      <div className={`fixed inset-y-0 right-0 w-[400px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out border-l border-gray-200 z-30 ${selectedUserId ? "translate-x-0" : "translate-x-full"}`}>
         {/* ... (Existing Slide-over Panel Content remains unchanged) ... */}
         {selectedUserDetails && !isDetailLoading ? (
          <div className="h-full flex flex-col">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <Button variant="ghost" size="icon" onClick={() => setSelectedUserId(null)}><X className="h-5 w-5" /></Button>
                <Badge variant={selectedUserDetails.status === "ACTIVE" ? "success" : "destructive"}>
                  {selectedUserDetails.status === "ACTIVE" ? "Active Account" : "Account Blocked"}
                </Badge>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 flex items-center justify-center text-2xl font-bold text-gray-700 mb-4 shadow-sm">
                  {selectedUserDetails.name.charAt(0)}
                </div>
                <h2 className="text-xl font-bold text-gray-900">{selectedUserDetails.name}</h2>
                <p className="text-gray-500 text-sm">{selectedUserDetails.email}</p>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
               <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Personal Details</h3>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50 border border-gray-100">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-700">{selectedUserDetails.phoneNumber || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50 border border-gray-100">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-700">{selectedUserDetails.address || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50 border border-gray-100">
                    <UserIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-700">@{selectedUserDetails.username}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-400 leading-none">Date of Birth</span>
                      <span className="text-sm font-medium text-gray-700">
                        {selectedUserDetails.dateOfBirth || "N/A"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50 border border-gray-100">
                    <ShieldCheck className={`h-4 w-4 ${selectedUserDetails.kyc === "VERIFIED" ? "text-green-500" : "text-gray-400"}`} />
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-400 leading-none uppercase font-bold">KYC Status</span>
                      <span className={`text-sm font-bold ${selectedUserDetails.kyc === "VERIFIED" ? "text-green-600" : "text-gray-600"}`}>
                        {selectedUserDetails.kyc || "PENDING"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Account Activity
                </h3>
                {/* 2x2 Grid for Stats */}
                <div className="grid grid-cols-2 gap-3">
                  
                  {/* Total Orders */}
                  <div className="p-4 border border-gray-100 rounded-xl bg-white shadow-sm flex flex-col items-center justify-center text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {selectedUserDetails.totalOrders ?? 0}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Total Orders</div>
                  </div>

                  {/* Loyalty Points (New) */}
                  <div className="p-4 border border-gray-100 rounded-xl bg-white shadow-sm flex flex-col items-center justify-center text-center">
                    <div className="text-2xl font-bold text-amber-500 flex items-center gap-1">
                      <Award className="h-5 w-5" />
                      {selectedUserDetails.points ?? 0}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Loyalty Points</div>
                  </div>

                  {/* Joined Date */}
                  <div className="p-4 border border-gray-100 rounded-xl bg-white shadow-sm flex flex-col items-center justify-center text-center overflow-hidden">
                    <div className="text-sm font-bold text-gray-900">
                      {selectedUserDetails.createdAt
                        ? selectedUserDetails.createdAt.slice(0, 10)
                        : "N/A"}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Joined Date</div>
                  </div>
                  
                  {/* Referral Code (New) */}
                  <div className="p-4 border border-gray-100 rounded-xl bg-white shadow-sm flex flex-col items-center justify-center text-center overflow-hidden">
                    <div className="text-sm font-bold text-blue-600 flex items-center gap-1">
                      <Ticket className="h-4 w-4" />
                      {selectedUserDetails.referralCode || "-"}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Referral Code</div>
                  </div>
                </div>
              </div>
              </div>
          
              
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50/30">
              <Button
                variant={selectedUserDetails.status === "ACTIVE" ? "destructive" : "default"}
                className={`w-full ${selectedUserDetails.status !== "ACTIVE" ? "bg-green-600 hover:bg-green-700 text-white" : ""}`}
                onClick={() => setConfirmDialog({ open: true, type: selectedUserDetails.status === "ACTIVE" ? "block" : "unblock", user: selectedUserDetails })}
              >
                {selectedUserDetails.status === "ACTIVE" ? <Ban className="mr-2 h-4 w-4" /> : <Unlock className="mr-2 h-4 w-4" />}
                {selectedUserDetails.status === "ACTIVE" ? "Block Customer" : "Unblock Customer"}
              </Button>
            </div>
          </div>
          
        ) : (
           <div className="h-full flex flex-col items-center justify-center text-gray-400">
             <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
           </div>
        )}
      </div>

      {/* --- Confirmation Dialog Overlay (Existing logic kept) --- */}
      {confirmDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !isMutationPending && setConfirmDialog({ ...confirmDialog, open: false })} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-100">
             <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-full ${confirmDialog.type === "block" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                   {confirmDialog.type === "block" ? <ShieldAlert className="h-6 w-6" /> : <Unlock className="h-6 w-6" />}
                </div>
                <h3 className="text-xl font-bold text-gray-900">{confirmDialog.type === "block" ? "Block Access?" : "Restore Access?"}</h3>
             </div>
             <p className="text-gray-500 mb-6">Are you sure you want to {confirmDialog.type} <strong>{confirmDialog.user?.name}</strong>?</p>
             <div className="flex gap-3 justify-end">
                <Button variant="ghost" onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}>Cancel</Button>
                <Button variant={confirmDialog.type === "block" ? "destructive" : "default"} onClick={confirmAction} disabled={isMutationPending}>
                   {isMutationPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Confirm
                </Button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}