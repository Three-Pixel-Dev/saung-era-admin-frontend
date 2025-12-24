import { useState, useRef, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useCreateProduct, useUpdateProduct, useProduct } from "@/hooks/userProducts";
import { useCategories } from "@/hooks/useCategories";
import { ProductRequest } from "@/types/product";
import { log } from "console";

export function CreateProduct() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const { data: categoriesData, isLoading: isCategoriesLoading } = useCategories({ size: 10000 });

  const { data: productData, isLoading: isProductLoading } = useProduct(id ? parseInt(id) : null);
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [weight, setWeight] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Active"); 
  const [isTaxable, setIsTaxable] = useState(false);
  const [allowBackorder, setAllowBackorder] = useState(false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);

  const [errors, setErrors] = useState<{
    name?: string;
    sku?: string;
    price?: string;
    category?: string;
  }>({});

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const categoriesList = Array.isArray(categoriesData) 
    ? categoriesData 
    : (categoriesData as any)?.content || [];

  useEffect(() => {
    if (productData) {
      setName(productData.name || "");
      setSku(productData.sku || "");
      setPrice(productData.price?.toString() || "");
      setQuantity(productData.quantity?.toString() || "0");
      setWeight(productData.weight?.toString() || "");
      setShortDesc(productData.shortDescription || "");
      setDescription(productData.description || "");
      setStatus(productData.status || "Active");
      setIsTaxable(productData.isTaxable || false);
      setAllowBackorder(productData.allowBackorder || false);
      
      if (productData.categories && productData.categories.length > 0) {
        const uniqueIds = new Set(productData.categories.map((cat: any) => cat.id));
        setSelectedCategoryIds(Array.from(uniqueIds));
      }
    }
  }, [productData]);

  
  const getDescendantIds = (parentId: number, allCats: any[]): number[] => {
    let ids: number[] = [];
   
    const children = allCats.filter(c => (c.parentCategory?.id === parentId) || (c.parentId === parentId));
    
    children.forEach(child => {
        ids.push(child.id);
        ids = [...ids, ...getDescendantIds(child.id, allCats)];
    });
    return ids;
  };


  const toggleCategory = (catId: number) => {
   
    const descendants = getDescendantIds(catId, categoriesList);
    const targetIds = [catId, ...descendants];

    setSelectedCategoryIds(prev => {
      const isCurrentlySelected = prev.includes(catId);
      let newSelection;

      if (isCurrentlySelected) {
      
        newSelection = prev.filter(id => !targetIds.includes(id));
      } else {
       
        const toAdd = targetIds.filter(id => !prev.includes(id));
        newSelection = [...prev, ...toAdd];
      }

      if (newSelection.length > 0 && errors.category) {
        setErrors(prevErr => ({ ...prevErr, category: undefined }));
      }
      return newSelection;
    });
  };

  const handleMutationError = (error: any) => {

    const errorMessage = "This SKU is already taken. Please choose another.";
    
    if (error.status===400) {
       setErrors(prev => ({ 
           ...prev, 
           sku: "This SKU is already taken. Please choose another." 
       }));
    } else {
       alert(`Error: ${errorMessage}`);
    }
  };
  
  const handleSave = () => {
    const newErrors: typeof errors = {};
    let isValid = true;

    if (!name.trim()) { newErrors.name = "Product Name is required"; isValid = false; }
    if (!sku.trim()) { newErrors.sku = "SKU is required"; isValid = false; }
    if (!price || parseFloat(price) <= 0) { newErrors.price = "Price is required > 0"; isValid = false; }
    if (selectedCategoryIds.length === 0) { newErrors.category = "Select at least one category"; isValid = false; }

    setErrors(newErrors);
    if (!isValid) return;

    const payload: ProductRequest = {
      name, sku,
      quantity: parseInt(quantity) || 0,
      price: parseFloat(price) || 0,
      description, shortDescription: shortDesc,
      weight: parseFloat(weight) || 0,
      isTaxable, allowBackorder,
      categoryIds: selectedCategoryIds,
      tags: "", 
      status: status, 
      countryId: 1,
    };

    if (isEditMode && id) {
      updateProductMutation.mutate({ id: parseInt(id), data: payload }, {
        onSuccess: () => navigate("/products"),
        onError: handleMutationError 
      });
    } else {
      createProductMutation.mutate(payload, {
        onSuccess: () => navigate("/products"),
        onError: handleMutationError 
      });
    }
  };

  const handleInputChange = (setter: any, field: keyof typeof errors, value: string) => {
    setter(value);
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const renderCategoryTree = (categories: any[], parentId: number | null = null, level = 0) => {
    const nodes = categories.filter((cat: any) => {
        if (parentId === null) return !cat.parentCategory && !cat.parentId;
        return (cat.parentCategory?.id === parentId) || (cat.parentId === parentId);
    });
    if (nodes.length === 0) return null;
    return nodes.map((node: any) => (
      <div key={node.id} style={{ marginLeft: level * 24 + 'px' }} className="mt-1">
         <div className="flex items-center space-x-2 hover:bg-gray-50 p-1 rounded font-medium">
              <input 
                  type="checkbox" 
                  id={`cat-${node.id}`}
                  checked={selectedCategoryIds.includes(node.id)}
                  onChange={() => toggleCategory(node.id)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
              />
              <label htmlFor={`cat-${node.id}`} className={`cursor-pointer w-full select-none ${level > 0 ? 'text-gray-600 text-sm' : 'text-gray-900'}`}>{node.name}</label>
         </div>
         {renderCategoryTree(categories, node.id, level + 1)}
      </div>
    ));
  };

  if (isEditMode && isProductLoading) return <div className="p-8">Loading product data...</div>;

  return (
    <div className="p-8 max-w-[1600px] mx-auto bg-gray-50/50 min-h-screen">
       <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/products")}><ChevronLeft className="h-5 w-5 text-gray-500" /></Button>
            <h1 className="text-2xl font-bold tracking-tight">{isEditMode ? "Edit Product" : "Create Product"}</h1>
        </div>
        <div className="flex items-center gap-4">
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSave} disabled={createProductMutation.isPending || updateProductMutation.isPending}>
                {(createProductMutation.isPending || updateProductMutation.isPending) ? "Saving..." : isEditMode ? "Update Product" : "Save Product"}
            </Button>
        </div>
       </div>

       <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
            <Card className="border-none shadow-sm">
                <CardHeader><CardTitle className="text-lg font-semibold">General Information</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="productName" className={errors.name ? "text-destructive" : ""}>Product Name *</Label>
                        <Input id="productName" value={name} onChange={(e) => handleInputChange(setName, 'name', e.target.value)} className={`bg-gray-50/50 ${errors.name ? "border-destructive focus-visible:ring-destructive" : ""}`} />
                        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="shortDesc">Short Description</Label>
                        <Input id="shortDesc" value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} className="bg-gray-50/50" />
                    </div>
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <textarea ref={textareaRef} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-4 min-h-[160px] border rounded-md bg-white outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" placeholder="Enter product description..." />
                    </div>
                </CardContent>
            </Card>
        </div>

        <div className="space-y-8">
            <Card className="border-none shadow-sm">
                <CardHeader><CardTitle className="text-lg font-semibold">Pricing</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="basePrice" className={errors.price ? "text-destructive" : ""}>Base Price *</Label>
                        <Input id="basePrice" type="number" value={price} onChange={(e) => handleInputChange(setPrice, 'price', e.target.value)} className={`bg-gray-50/50 ${errors.price ? "border-destructive focus-visible:ring-destructive" : ""}`} />
                        {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                        <input type="checkbox" id="tax" checked={isTaxable} onChange={(e) => setIsTaxable(e.target.checked)} className="h-4 w-4" />
                        <Label htmlFor="tax">Charge tax on this product</Label>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
                <CardHeader><CardTitle className="text-lg font-semibold">Inventory</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="sku" className={errors.sku ? "text-destructive" : ""}>SKU *</Label>
                        <Input id="sku" value={sku} onChange={(e) => handleInputChange(setSku, 'sku', e.target.value)} className={`bg-gray-50/50 ${errors.sku ? "border-destructive focus-visible:ring-destructive" : ""}`} />
                        
                        {errors.sku && (
                            <p className="text-sm text-destructive mt-1 font-medium flex items-center gap-1">
                                ⚠️ {errors.sku}
                            </p>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="quantity">Quantity</Label>
                            <Input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="bg-gray-50/50" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="weight">Weight (kg)</Label>
                            <Input id="weight" type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="bg-gray-50/50" />
                        </div>
                    </div>
                </CardContent>
            </Card>

             <Card className="border-none shadow-sm">
                <CardHeader><CardTitle className="text-lg font-semibold">Categorization</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label className={errors.category ? "text-destructive" : ""}>Categories * (Multi-select)</Label>
                        <div className={`border rounded-md p-3 max-h-[300px] overflow-y-auto bg-white space-y-2 ${errors.category ? "border-destructive" : ""}`}>
                            {isCategoriesLoading && <p className="text-sm text-gray-500">Loading categories...</p>}
                            {!isCategoriesLoading && categoriesList.length === 0 && <p className="text-sm text-gray-500">No categories found.</p>}
                            {!isCategoriesLoading && renderCategoryTree(categoriesList)}
                        </div>
                        {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
                        <p className="text-xs text-gray-500">Selected: {selectedCategoryIds.length} categories</p>
                    </div>
                </CardContent>
            </Card>
        </div>
       </div>
    </div>
  );
}
