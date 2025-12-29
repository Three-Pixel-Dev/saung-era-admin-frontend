import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Search, Plus, Download, MoreHorizontal, Edit, Trash2, RefreshCw, Loader2, RotateCcw, Eye, XCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useProducts, useUpdateProduct, useProduct } from "@/hooks/userProducts";
import { useCategories } from "@/hooks/useCategories";
import { ProductResponse, ProductRequest } from "@/types/product";
import { productApi } from "@/api/productApi";

export function Products() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get("page") || "0");
  const [pageSize] = useState(10); 
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<ProductResponse | null>(null);

  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [productToRestore, setProductToRestore] = useState<ProductResponse | null>(null);

  const [hardDeleteDialogOpen, setHardDeleteDialogOpen] = useState(false);
  const [productToHardDelete, setProductToHardDelete] = useState<ProductResponse | null>(null);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  const { data, isLoading, isError, refetch, isRefetching } = useProducts({ 
    page, 
    size: pageSize,
    keyword: keyword || undefined,
    status: statusFilter === "ALL" ? undefined : statusFilter, 
    categoryId: categoryFilter === "ALL" ? undefined : categoryFilter
  });

  const { data: fullProductToDelete } = useProduct(productToDelete?.id || null);
  const { data: fullProductToRestore } = useProduct(productToRestore?.id || null);

  const { data: categoriesData } = useCategories({ size: 1000 });
  const categoriesList = Array.isArray(categoriesData) ? categoriesData : (categoriesData as any)?.content || [];
  const updateMutation = useUpdateProduct();
  
  const products = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;

  const getLowestPriceVariantInfo = (product: ProductResponse) => {
    if (!product.productCodeValues || product.productCodeValues.length === 0) {
        return { price: 0, quantity: 0 };
    }
    const sortedVariants = [...product.productCodeValues].sort((a, b) => a.price - b.price);
    const cheapestVariant = sortedVariants[0];
    
    return {
        price: cheapestVariant.price,
        quantity: cheapestVariant.quantity
    };
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams(prev => { prev.set("page", newPage.toString()); return prev; });
  };

  const handleFilterChange = (key: string, value: string) => {
    setSearchParams(prev => { prev.set("page", "0"); return prev; });
    if (key === "keyword") setKeyword(value);
    if (key === "status") setStatusFilter(value);
    if (key === "category") setCategoryFilter(value);
  };

  const handleRefresh = () => {
    setKeyword("");
    setStatusFilter("ALL");
    setCategoryFilter("ALL");
    setSearchParams(prev => {
        prev.delete("page");
        return prev;
    });
    refetch();
  };

  const handleDeleteClick = (product: ProductResponse) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleRestoreClick = (product: ProductResponse) => {
    setProductToRestore(product);
    setRestoreDialogOpen(true);
  };

  const handleHardDeleteClick = (product: ProductResponse) => {
    setProductToHardDelete(product);
    setHardDeleteDialogOpen(true);
  };

  const createPayload = (product: ProductResponse, newStatus: string): ProductRequest => {
     return {
        name: product.name,
        description: product.description,
        shortDescription: product.shortDescription,
        longDescription: product.longDescription,
        status: newStatus,
        tags: product.tags || "",
        isTaxable: product.isTaxable || false,
        allowBackorder: product.allowBackorder || false,
        discountType: product.discountType,
        discountAmount: product.discountAmount,
        weight: product.weight,
        countryId: product.countryId || 1,
        categoryIds: product.categories?.map(c => c.id) || [],
        productCodeValues: product.productCodeValues || []
     };
  };

  const handleDeleteConfirm = () => {
    if (fullProductToDelete) {
      const payload = createPayload(fullProductToDelete, "Inactive");
      updateMutation.mutate({ id: fullProductToDelete.id, data: payload }, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setProductToDelete(null);
          refetch(); 
        },
        onError: (error: any) => alert("Failed to deactivate: " + error.message)
      });
    }
  };

  const handleRestoreConfirm = () => {
    if (fullProductToRestore) {
      const payload = createPayload(fullProductToRestore, "Active");
      updateMutation.mutate({ id: fullProductToRestore.id, data: payload }, {
        onSuccess: () => {
          setRestoreDialogOpen(false);
          setProductToRestore(null);
          refetch(); 
        },
        onError: (error: any) => alert("Failed to restore: " + error.message)
      });
    }
  };

  // Hard Delete Logic - Cleaned up
 const handleHardDeleteConfirm = async () => {
    if (productToHardDelete) {
        try {
            await productApi.hardDelete(productToHardDelete.id);
            setHardDeleteDialogOpen(false);
            setProductToHardDelete(null);
            setSuccessDialogOpen(true);
            refetch();
        } catch (error) {
          console.error("Hard delete error:", error);
          setHardDeleteDialogOpen(false);
            setProductToHardDelete(null);
            setSuccessDialogOpen(true);
            refetch();
          
        }
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    const currentPage = page + 1;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage <= 3) {
        for (let i = 2; i <= 4; i++) pages.push(i);
        pages.push("..."); pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push("..."); for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push("..."); for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("..."); pages.push(totalPages);
      }
    }
    return pages;
  };

  const getStatusBadge = (product: ProductResponse, quantity: number) => {
    if (product.status === 'Inactive') return <Badge variant="secondary" className="bg-gray-200 text-gray-600">Inactive</Badge>;
    if (quantity === 0) return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Out of Stock</Badge>;
    if (quantity > 0 && quantity <= 10) return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Low Stock</Badge>;
    return <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200">Active</Badge>;
  };

  return (
    <div className="p-8">
      {/* Soft Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Product</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to deactivate "{productToDelete?.name}"?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProductToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={!fullProductToDelete || updateMutation.isPending}>
              {updateMutation.isPending ? "Deactivating..." : "Deactivate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restore Dialog */}
      <AlertDialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore Product</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to activate "{productToRestore?.name}" again?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProductToRestore(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestoreConfirm} className="bg-green-600 hover:bg-green-700 text-white" disabled={!fullProductToRestore || updateMutation.isPending}>
              {updateMutation.isPending ? "Restoring..." : "Restore"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Hard Delete Dialog */}
      <AlertDialog open={hardDeleteDialogOpen} onOpenChange={setHardDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">Permanently Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete "{productToHardDelete?.name}" and all associated data from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProductToHardDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleHardDeleteConfirm} className="bg-red-600 hover:bg-red-700 text-white">
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Success Dialog */}
      <AlertDialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <AlertDialogContent className="max-w-[400px]">
          <div className="flex flex-col items-center justify-center py-4">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <AlertDialogTitle className="text-xl mb-2">Deleted Successfully!</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
                The product has been permanently deleted from the system.
            </AlertDialogDescription>
          </div>
          <AlertDialogFooter className="sm:justify-center">
            <AlertDialogAction onClick={() => setSuccessDialogOpen(false)} className="bg-green-600 hover:bg-green-700 min-w-[120px]">
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <span>🏠</span><span>/</span><span>Catalog</span><span>/</span><span className="text-gray-900">Products</span>
      </div>

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Products</h1>
          <p className="text-gray-600">Manage your product catalog, inventory, and pricing.</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export</Button>
          <Link to="/products/new">
            <Button className="bg-blue-600 hover:bg-blue-700"><Plus className="mr-2 h-4 w-4" /> Add Product</Button>
          </Link>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative w-full sm:w-[300px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input type="search" placeholder="Search products..." className="pl-10" value={keyword} onChange={(e) => handleFilterChange("keyword", e.target.value)} />
            </div>

            <div className="flex items-center gap-2 flex-1 justify-end">
                <span className="text-sm font-medium text-gray-700 whitespace-nowrap hidden md:block">FILTER BY:</span>
                
                <Select value={categoryFilter} onValueChange={(val) => handleFilterChange("category", val)}>
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Category: All</SelectItem>
                        {categoriesList.map((cat: any) => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>
                                {cat.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={(val) => handleFilterChange("status", val)}>
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Status: All</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="Low Stock">Low Stock</SelectItem>
                        <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                    </SelectContent>
                </Select>

                <Button variant="outline" size="icon" onClick={handleRefresh} title="Reset Filters & Refresh">
                    <RefreshCw className={`h-4 w-4 ${isLoading || isRefetching ? 'animate-spin' : ''}`} />
                </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Product List</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"><input type="checkbox" className="rounded" /></TableHead>
                <TableHead>PRODUCT</TableHead>
                <TableHead>CATEGORY</TableHead>
                <TableHead>STOCK</TableHead>
                <TableHead>PRICE</TableHead>
                <TableHead>STATUS</TableHead>
                <TableHead className="text-right">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && <TableRow><TableCell colSpan={7} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-600" /><p>Loading products...</p></TableCell></TableRow>}
              {!isLoading && !isError && products.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-500">No products found</TableCell></TableRow>}
              
              {!isLoading && products.map((product: ProductResponse) => {
                const { price, quantity } = getLowestPriceVariantInfo(product);
                
                return (
                  <TableRow key={product.id} className="hover:bg-gray-50/50">
                    <TableCell><input type="checkbox" className="rounded" /></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center text-xl">📦</div>
                        <div>
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-xs text-gray-500">{product.productCodeValues?.length || 0} variants</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{product.categories?.map(c => c.name).join(", ") || "-"}</TableCell>
                    <TableCell>
                        <span className="text-sm font-medium text-gray-700">{quantity} units</span>
                    </TableCell>
                    <TableCell className="font-medium text-blue-600">${price.toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(product, quantity)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4 text-gray-400" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => navigate(`/products/${product.id}`)}>
                                  <Eye className="mr-2 h-4 w-4" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigate(`/products/${product.id}/edit`)}>
                                  <Edit className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              {product.status === 'Inactive' ? (
                                  <>
                                    <DropdownMenuItem onClick={() => handleRestoreClick(product)} className="text-green-600 focus:text-green-600">
                                        <RotateCcw className="mr-2 h-4 w-4" /> Restore
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleHardDeleteClick(product)} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                                        <XCircle className="mr-2 h-4 w-4" /> Delete Permanently
                                    </DropdownMenuItem>
                                  </>
                              ) : (
                                  <DropdownMenuItem onClick={() => handleDeleteClick(product)} className="text-destructive focus:text-destructive">
                                      <Trash2 className="mr-2 h-4 w-4" /> Deactivate
                                  </DropdownMenuItem>
                              )}
                          </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {!isLoading && products.length > 0 && (
            <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-gray-600">Showing {(page * pageSize) + 1} to {Math.min((page + 1) * pageSize, totalElements)} of {totalElements} results</p>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handlePageChange(Math.max(0, page - 1))} disabled={page === 0}>Previous</Button>
                    {getPageNumbers().map((pNum, index) => {
                        if (pNum === "...") return <span key={`ellipsis-${index}`} className="px-2 text-gray-500">...</span>;
                        const isCurrent = (page + 1) === pNum;
                        return (<Button key={pNum} variant={isCurrent ? "default" : "outline"} size="sm" onClick={() => handlePageChange((pNum as number) - 1)} >{pNum}</Button>);
                    })}
                    <Button variant="outline" size="sm" onClick={() => handlePageChange(Math.min(totalPages - 1, page + 1))} disabled={(page + 1) >= totalPages}>Next</Button>
                </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}