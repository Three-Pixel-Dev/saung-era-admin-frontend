import { useState, useEffect } from "react";
import {
  Search,
  Download,
  RefreshCw,
  Loader2,
  MoreHorizontal,
  Ban,
  Unlock,
  Mail,
  Phone,
  User as UserIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
// Assuming you create these hooks based on the API provided
import {
  useCustomers,
  useBlockCustomer,
  useUnblockCustomer,
} from "@/hooks/useCustomers";
import { User } from "@/types/user";

export function Customers() {
  const [searchQuery, setSearchQuery] = useState("");
  // API uses 0-index, UI uses 1-index. We manage 1-index state and subtract 1 for API calls.
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // Based on your curl example

  // Action States
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionType, setActionType] = useState<"block" | "unblock" | null>(
    null
  );

  // Hooks
  const { data, isLoading, error, refetch } = useCustomers({
    page: currentPage - 1, // Convert to 0-index for API
    size: pageSize,
    keyword: searchQuery,
  });

  const blockMutation = useBlockCustomer();
  const unblockMutation = useUnblockCustomer();

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Handle Actions
  const openActionDialog = (user: User, type: "block" | "unblock") => {
    setSelectedUser(user);
    setActionType(type);
    setAlertDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedUser || !actionType) return;

    try {
      if (actionType === "block") {
        await blockMutation.mutateAsync(selectedUser.id);
      } else {
        await unblockMutation.mutateAsync(selectedUser.id);
      }
      // Refetch data to ensure UI is in sync
      refetch();
      setAlertDialogOpen(false);
      setSelectedUser(null);
      setActionType(null);
    } catch (error) {
      console.error(`Failed to ${actionType} user:`, error);
    }
  };

  // Pagination Logic (Adapted for Server-Side)
  const totalPages = data?.totalPages || 0;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage <= 3) {
        for (let i = 2; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="p-8">
      {/* Alert Dialog for Block/Unblock */}
      <AlertDialog open={alertDialogOpen} onOpenChange={setAlertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === "block" ? "Block User" : "Unblock User"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {actionType}{" "}
              <strong>{selectedUser?.name}</strong>?
              {actionType === "block"
                ? " They will lose access to the platform."
                : " They will regain access to the platform."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedUser(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              className={
                actionType === "block"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : "bg-green-600 hover:bg-green-700"
              }
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Breadcrumbs */}
      <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <span>🏠</span>
        <span>/</span>
        <span>Admin</span>
        <span>/</span>
        <span className="text-gray-900">Customers</span>
      </div>

      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Customers</h1>
          <p className="text-gray-600">
            Manage registered users and their account status.
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filter Card */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative w-full sm:w-[300px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                placeholder="Search by name, email..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 flex-1 justify-end">
              <Button variant="outline" size="icon" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registered Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input type="checkbox" className="rounded" />
                </TableHead>
                <TableHead>CUSTOMER</TableHead>
                <TableHead>USERNAME</TableHead>
                <TableHead>PHONE</TableHead>
                <TableHead className="text-right">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    <p className="mt-2 text-sm text-gray-500">
                      Loading customers...
                    </p>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <p className="text-sm text-destructive">
                      Error loading customers. Please try again.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refetch()}
                      className="mt-2"
                    >
                      Retry
                    </Button>
                  </TableCell>
                </TableRow>
              ) : !data?.content || data.content.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <p className="text-sm text-gray-500">No customers found</p>
                  </TableCell>
                </TableRow>
              ) : (
                data.content.map((user: User) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <input type="checkbox" className="rounded" />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-lg">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {user.name}
                          </p>
                          <div className="flex items-center text-sm text-gray-500">
                            <Mail className="mr-1 h-3 w-3" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                        @{user.username}
                      </span>
                    </TableCell>
                    <TableCell>
                      {user.phoneNumber ? (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="mr-2 h-3 w-3" />
                          {user.phoneNumber}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4 text-gray-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => openActionDialog(user, "unblock")}
                          >
                            <Unlock className="mr-2 h-4 w-4 text-green-600" />
                            Unblock Access
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => openActionDialog(user, "block")}
                            className="text-destructive focus:text-destructive"
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            Block Access
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination Footer */}
          {data && data.totalPages > 0 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing page {currentPage} of {totalPages} ({data.totalElements}{" "}
                total)
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                {getPageNumbers().map((page, index) => {
                  if (page === "...") {
                    return (
                      <span
                        key={`ellipsis-${index}`}
                        className="px-2 text-gray-500"
                      >
                        ...
                      </span>
                    );
                  }
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page as number)}
                    >
                      {page}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
