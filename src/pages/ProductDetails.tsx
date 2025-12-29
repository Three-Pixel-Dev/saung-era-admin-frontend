import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Edit, Calendar, Tag, Package, Globe, RotateCcw, Trash2, Image as ImageIcon, XCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useProduct, useUpdateProduct } from "@/hooks/userProducts";
import { codeApi } from "@/api/codeApi";
import { productApi } from "@/api/productApi";
import { ProductRequest } from "@/types/product";


export function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: product, isLoading, isError, refetch } = useProduct(Number(id));
  const updateMutation = useUpdateProduct();
  const [colorsMap, setColorsMap] = useState<Record<string, string>>({});

  // Dialog States
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [hardDeleteDialogOpen, setHardDeleteDialogOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  useEffect(() => {
    const fetchColors = async () => {
        try {
            const response = await codeApi.getAll();
            const codes = Array.isArray(response) ? response : (response as any).data || [];
            const colorCode = codes.find((c: any) => c.name.toLowerCase() === 'color');
            if (colorCode) {
                const colorRes = await codeApi.getValuesByCodeId(colorCode.id);
                const colorValues = Array.isArray(colorRes) ? colorRes : (colorRes as any).data || [];
                const map: Record<string, string> = {};
                colorValues.forEach((c: any) => {
                    map[c.id] = c.description || c.name;
                });
                setColorsMap(map);
            }
        } catch (e) { console.error("Error fetching colors", e); }
    };
    fetchColors();
  }, []);

  if (isLoading) return <div className="p-8 flex justify-center items-center h-96"><div className="animate-spin text-blue-600 text-4xl">Loading...</div></div>;
  if (isError || !product) return <div className="p-8 text-red-500 text-center">Failed to load product details.</div>;

  const totalStock = product.productCodeValues?.reduce((acc, curr) => acc + curr.quantity, 0) || 0;
  const prices = product.productCodeValues?.map(v => v.price) || [0];
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
  const priceDisplay = minPrice === maxPrice ? `$${minPrice.toFixed(2)}` : `$${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`;

  const createPayload = (newStatus: string): ProductRequest => ({
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
  });

  const handleDeactivateConfirm = () => {
      updateMutation.mutate({ id: product.id, data: createPayload("Inactive") }, {
          onSuccess: () => {
              setDeleteDialogOpen(false);
              refetch();
          },
          onError: (error: any) => alert("Failed to deactivate: " + error.message)
      });
  };

  const handleRestoreConfirm = () => {
      updateMutation.mutate({ id: product.id, data: createPayload("Active") }, {
          onSuccess: () => {
              setRestoreDialogOpen(false);
              refetch();
          },
          onError: (error: any) => alert("Failed to restore: " + error.message)
      });
  };

  // Hard Delete Handler
  const handleHardDeleteConfirm = async () => {
      try {
          await productApi.hardDelete(product.id);
          setHardDeleteDialogOpen(false);
          setSuccessDialogOpen(true); 
      } catch (error) {
          console.error("Hard delete error:", error);
        //   alert("Failed to permanently delete product.");
      }
  };

  const handleSuccessAck = () => {
      setSuccessDialogOpen(false);
      navigate("/products");
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Deactivate Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Product</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to deactivate "{product.name}"?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeactivateConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={updateMutation.isPending}>
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
            <AlertDialogDescription>Are you sure you want to activate "{product.name}" again?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestoreConfirm} className="bg-green-600 hover:bg-green-700 text-white" disabled={updateMutation.isPending}>
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
                This action cannot be undone. This will permanently delete "{product.name}" and all associated data from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
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
                The product has been permanently deleted. You will be redirected to the product list.
            </AlertDialogDescription>
          </div>
          <AlertDialogFooter className="sm:justify-center">
            <AlertDialogAction onClick={handleSuccessAck} className="bg-green-600 hover:bg-green-700 min-w-[120px]">
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="mb-6">
        <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-blue-600 mb-2" onClick={() => navigate("/products")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
        </Button>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    {product.name}
                    <Badge variant={product.status === 'Active' ? 'default' : 'secondary'} className={product.status === 'Active' ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-200 text-gray-700'}>
                        {product.status}
                    </Badge>
                </h1>
                <p className="text-gray-500 mt-1">Product ID: #{product.id}</p>
            </div>
            <div className="flex gap-2">
                {product.status === 'Inactive' ? (
                     <>
                        <Button onClick={() => setRestoreDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
                            <RotateCcw className="mr-2 h-4 w-4" /> Restore
                        </Button>
                        <Button variant="outline" onClick={() => setHardDeleteDialogOpen(true)} className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">
                            <XCircle className="mr-2 h-4 w-4" /> Delete Permanently
                        </Button>
                     </>
                ) : (
                     <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Deactivate
                     </Button>
                )}
                <Button onClick={() => navigate(`/products/${product.id}/edit`)} className="bg-blue-600 hover:bg-blue-700">
                    <Edit className="mr-2 h-4 w-4" /> Edit Product
                </Button>
            </div>
        </div>
      </div>
    
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card components remain same ... */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center border-2 border-dashed border-gray-300">
                <div className="text-center text-gray-400">
                    <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Image Slider Placeholder</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>General Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                         <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-1">Short Description</h3>
                            <p className="text-gray-900">{product.shortDescription || "-"}</p>
                         </div>
                         <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-1">Weight</h3>
                             <p className="text-gray-900">{product.weight ? `${product.weight} kg` : "-"}</p>
                         </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
                        <p className="text-gray-900 leading-relaxed">{product.description || "No description provided."}</p>
                    </div>
                    {product.longDescription && (
                         <div className="pt-2">
                            <h3 className="text-sm font-medium text-gray-500 mb-2">Detailed Description</h3>
                            <div className="text-gray-900 text-sm whitespace-pre-line leading-relaxed">
                                {product.longDescription}
                            </div>
                        </div>
                    )}
                    
                    <Separator className="my-4" />

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                            <Tag className="h-5 w-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-gray-500">Categories</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {product.categories && product.categories.length > 0 ? (
                                        product.categories.map(cat => (
                                            <Badge key={cat.id} variant="outline" className="text-gray-600">{cat.name}</Badge>
                                        ))
                                    ) : <span className="text-sm text-gray-400">No category</span>}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Globe className="h-5 w-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-gray-500">Tags</p>
                                <p className="text-sm text-gray-900 mt-1">{product.tags || "-"}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Product Variants & Inventory</CardTitle>
                    <CardDescription>Manage prices and stock levels for each variant.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Color</TableHead>
                                <TableHead>Size</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead>SKU</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {product.productCodeValues?.map((variant, index) => {
                                const colorHex = colorsMap[variant.colorId];
                                return (
                                <TableRow key={index} className="hover:bg-gray-50">
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            {colorHex ? (
                                                <div className="h-5 w-5 rounded-full border shadow-sm" style={{ backgroundColor: colorHex }} title={`Color ID: ${variant.colorId}`} />
                                            ) : (
                                                <span className="text-xs text-gray-500">ID: {variant.colorId}</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell><Badge variant="outline">Size: {variant.sizeId}</Badge></TableCell>
                                    <TableCell className="text-blue-600 font-medium">${variant.price.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <span className={variant.quantity < 10 ? "text-red-600 font-medium flex items-center gap-1" : "text-green-600 font-medium"}>
                                            {variant.quantity} units
                                            {variant.quantity < 10 && <Badge variant="destructive" className="text-[10px] h-4 px-1">Low</Badge>}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-gray-500 text-sm">C{index + 1}-{variant.colorId}-{variant.sizeId}</TableCell>
                                </TableRow>
                            )})}
                            {(!product.productCodeValues || product.productCodeValues.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-gray-500 py-6">No variants configured.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>

        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Inventory Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Total Stock</span>
                        <span className="text-lg font-bold">{totalStock}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Price Range</span>
                        <span className="text-lg font-bold text-blue-600">{priceDisplay}</span>
                    </div>
                    <Separator />
                    <div className="pt-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Taxable</p>
                                <p className="font-medium">{product.isTaxable ? "Yes" : "No"}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Backorder</p>
                                <p className="font-medium">{product.allowBackorder ? "Allowed" : "Not Allowed"}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Country ID</p>
                                <p className="font-medium">{product.countryId}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gray-50 border-dashed border-2">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-3 text-gray-500 mb-2">
                        <Calendar className="h-4 w-4" />
                        <span className="text-xs font-medium uppercase tracking-wide">Timestamps</span>
                    </div>
                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Created:</span>
                            <span className="text-gray-900">{product.createdAt ? new Date(product.createdAt).toLocaleDateString() : "-"}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Updated:</span>
                            <span className="text-gray-900">{product.updatedAt ? new Date(product.updatedAt).toLocaleDateString() : "-"}</span>
                        </div>
                    </div>

                    <Separator className="my-3 bg-gray-200" />

                    <div className="flex items-center gap-3 text-gray-500 mb-2">
                        <Package className="h-4 w-4" />
                        <span className="text-xs font-medium uppercase tracking-wide">Promotion</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                        {product.discountType ? (
                            <span className="flex items-center gap-2">
                                <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200">
                                    {product.discountType}
                                </Badge>
                                <span>{product.discountAmount} Off</span>
                            </span>
                        ) : "No active discount"}
                    </p>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}