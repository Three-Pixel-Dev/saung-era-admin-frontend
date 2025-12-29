import { useState, useEffect } from "react";
import { ChevronLeft, Plus, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateProduct, useUpdateProduct, useProduct } from "@/hooks/userProducts";
import { useCategories } from "@/hooks/useCategories";
import { ProductRequest, ProductCodeValueRequest } from "@/types/product";
import { codeApi } from "@/api/codeApi";

type ConfigRow = {
  id: string;
  color: string;
  size: string;
  price: string;
  quantity: string;
};

type OptionType = {
  value: string;
  label: string;
  name: string;
  description?: string;
};

export function CreateProduct() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const { data: categoriesData, isLoading: isCategoriesLoading } = useCategories({ size: 1000 });
  const { data: productData, isLoading: isProductLoading } = useProduct(id ? parseInt(id) : null);
  
  const [name, setName] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [weight, setWeight] = useState("");
  const [tags, setTags] = useState("");
  const [isTaxable, setIsTaxable] = useState(true);
  const [discountType, setDiscountType] = useState("PERCENTAGE");
  const [discountAmount, setDiscountAmount] = useState("");
  const [countryId, setCountryId] = useState("1");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  
  const [colorsList, setColorsList] = useState<OptionType[]>([]);
  const [sizesList, setSizesList] = useState<OptionType[]>([]);

  const [configurations, setConfigurations] = useState<ConfigRow[]>([
    { id: '1', color: '', size: '', price: '', quantity: '100' }
  ]);

  const [errors, setErrors] = useState<{
    name?: string;
    category?: string;
    config?: string;
  }>({});

  const categoriesList = Array.isArray(categoriesData) 
    ? categoriesData 
    : (categoriesData as any)?.content || [];

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await codeApi.getAll();
        const codes = Array.isArray(response) ? response : (response as any).data || [];
        
        const colorCode = codes.find((c: any) => c.name.toLowerCase() === 'color');
        const sizeCode = codes.find((c: any) => c.name.toLowerCase() === 'size');

        if (colorCode) {
          const colorRes = await codeApi.getValuesByCodeId(colorCode.id);
          const colorValues = Array.isArray(colorRes) ? colorRes : (colorRes as any).data || [];
          setColorsList(colorValues.map((c: any) => ({
            value: c.id.toString(),
            label: c.name,
            name: c.name,
            description: c.description
          })));
        }

        if (sizeCode) {
          const sizeRes = await codeApi.getValuesByCodeId(sizeCode.id);
          const sizeValues = Array.isArray(sizeRes) ? sizeRes : (sizeRes as any).data || [];
          setSizesList(sizeValues.map((c: any) => ({
            value: c.id.toString(),
            label: `${c.name} - ${c.description || ''}`, 
            name: c.name,
            description: c.description
          })));
        }
      } catch (error) {
        console.error("Failed to fetch configuration options:", error);
      }
    };
    fetchOptions();
  }, []);

  // --- LOAD EXISTING DATA FOR EDIT ---
  useEffect(() => {
    if (productData) {
      setName(productData.name || "");
      setShortDesc(productData.shortDescription || "");
      setLongDescription(productData.longDescription || "");
      setWeight(productData.weight?.toString() || "");
      setTags(productData.tags || "");
      setIsTaxable(productData.isTaxable ?? true);
      setDiscountType(productData.discountType || "PERCENTAGE");
      setDiscountAmount(productData.discountAmount?.toString() || "");
      setCountryId(productData.countryId?.toString() || "1");
      
      if (productData.categories && productData.categories.length > 0) {
        const uniqueIds = new Set(productData.categories.map((cat: any) => cat.id));
        setSelectedCategoryIds(Array.from(uniqueIds));
      }

      // Load Existing Configurations
      if (productData.productCodeValues && productData.productCodeValues.length > 0) {
        const loadedConfigs = productData.productCodeValues.map((pcv: any) => ({
             id: crypto.randomUUID(),
             color: pcv.colorId.toString(),
             size: pcv.sizeId.toString(),
             price: pcv.price.toString(),
             quantity: pcv.quantity.toString()
        }));
        setConfigurations(loadedConfigs);
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

  const addConfiguration = () => {
    setConfigurations([
      ...configurations,
      { id: crypto.randomUUID(), color: '', size: '', price: '', quantity: '100' }
    ]);
  };

  const removeConfiguration = (id: string) => {
    if (configurations.length > 1) {
      setConfigurations(configurations.filter(c => c.id !== id));
    }
  };

  const updateConfiguration = (id: string, field: keyof ConfigRow, value: any) => {
    setConfigurations(configurations.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  };
const handleSave = () => {
    const newErrors: typeof errors = {};
    let isValid = true;

    if (!name.trim()) { newErrors.name = "Required"; isValid = false; }
    if (selectedCategoryIds.length === 0) { newErrors.category = "Required"; isValid = false; }
    
    // Config Validation
    const invalidConfig = configurations.some(c => 
        !c.price || parseFloat(c.price) <= 0 || !c.color || !c.size
    );
    if (invalidConfig) {
        newErrors.config = "All configurations must have a Color, a Size, and a valid Price.";
        isValid = false;
    }

    const variantSet = new Set();
    const hasDuplicateVariant = configurations.some(c => {
        const key = `${c.color}-${c.size}`;
        if (variantSet.has(key)) return true;
        variantSet.add(key);
        return false;
    });

    if (hasDuplicateVariant) {
        newErrors.config = "Duplicate variants (Same Color & Size) are not allowed.";
        isValid = false;
    }

    setErrors(newErrors);
    if (!isValid) return;

    const productCodeValues: ProductCodeValueRequest[] = configurations.map(config => ({
        colorId: parseInt(config.color),
        sizeId: parseInt(config.size),
        price: parseFloat(config.price),
        quantity: parseInt(config.quantity) || 0
    }));
    
    const payload: ProductRequest = {
      name,
      shortDescription: shortDesc,
      longDescription,
      status: "Active",
      tags,
      isTaxable,
      discountType,
      discountAmount: discountAmount ? parseFloat(discountAmount) : 0,
      weight: parseFloat(weight) || 0,
      countryId: parseInt(countryId) || 1,
      categoryIds: selectedCategoryIds,
      productCodeValues: productCodeValues,
      allowBackorder: false
    };

    if (isEditMode && id) {
      updateProductMutation.mutate({ id: parseInt(id), data: payload }, { 
        onSuccess: () => navigate("/products"),
        onError: () => alert("Failed to update product") 
      });
    } else {
      createProductMutation.mutate(payload, { 
        onSuccess: () => navigate("/products"),
        onError: () => alert("Failed to create product")
      });
    }
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
                  type="checkbox" id={`cat-${node.id}`}
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

  if (isEditMode && isProductLoading) return <div className="p-8">Loading...</div>;

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
                        <Input id="productName" value={name} onChange={(e) => setName(e.target.value)} className={errors.name ? "border-destructive" : ""} />
                        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Short Description</Label>
                            <Input value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} placeholder="Brief summary" />
                        </div>
                        <div className="space-y-2">
                            <Label>Tags</Label>
                            <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Modern, Cotton, etc." />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Long Description (Detailed)</Label>
                        <textarea value={longDescription} onChange={(e) => setLongDescription(e.target.value)} className="w-full p-4 min-h-[120px] border rounded-md bg-white" placeholder="Extensive product details and story..." />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
                <div className="flex items-center justify-between p-6 pb-2">
                     <CardTitle className="text-lg font-semibold">Product Variants (Color & Size)</CardTitle>
                     <Button onClick={addConfiguration} variant="outline" size="sm" className="gap-2">
                        <Plus className="h-4 w-4" /> Add Variant
                     </Button>
                </div>
                <CardContent className="space-y-6">
                    {errors.config && <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">{errors.config}</p>}
                    
                    {configurations.map((config, index) => (
                        <div key={config.id} className="relative bg-white p-4 rounded-lg border shadow-sm">
                            {index > 0 && <div className="absolute top-0 left-0 w-full h-[1px] bg-gray-100 -mt-3" />}
                            <Button 
                                variant="ghost" size="icon" 
                                className="absolute top-2 right-2 text-red-500 hover:bg-red-50"
                                onClick={() => removeConfiguration(config.id)}
                                disabled={configurations.length === 1}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>

                            <h4 className="text-sm font-medium text-gray-900 mb-4 bg-gray-100 inline-block px-2 py-1 rounded">
                                Variant #{index + 1}
                            </h4>
                            
                            <div className="grid grid-cols-2 gap-6 mb-4">
                                <div className="space-y-2">
                                    <Label>Color</Label>
                                    <Select value={config.color} onValueChange={(val) => updateConfiguration(config.id, 'color', val)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a color" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {colorsList.map((c) => (
                                                <SelectItem key={c.value} value={c.value}>
                                                    <div className="flex items-center gap-2">
                                                        <div 
                                                            className="w-4 h-4 rounded-full border border-gray-300 shadow-sm"
                                                            style={{ backgroundColor: c.description || '#fff' }} 
                                                        />
                                                        <span>{c.name}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Size</Label>
                                    <Select value={config.size} onValueChange={(val) => updateConfiguration(config.id, 'size', val)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a size" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sizesList.map((s) => (
                                                <SelectItem key={s.value} value={s.value}>
                                                    {s.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4"> 
                                <div className="space-y-2">
                                    <Label>Price *</Label>
                                    <Input type="number" placeholder="0.00" value={config.price} onChange={(e) => updateConfiguration(config.id, 'price', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Quantity</Label>
                                    <Input type="number" placeholder="100" value={config.quantity} onChange={(e) => updateConfiguration(config.id, 'quantity', e.target.value)} />
                                </div>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>

        <div className="space-y-8">
            <Card className="border-none shadow-sm">
                <CardHeader><CardTitle className="text-lg font-semibold">Settings</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Weight (kg)</Label>
                            <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Country ID</Label>
                            <Input type="number" value={countryId} onChange={(e) => setCountryId(e.target.value)} />
                        </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t">
                         <Label>Discount</Label>
                         <div className="flex gap-2">
                             <Select value={discountType} onValueChange={setDiscountType}>
                                <SelectTrigger className="w-[130px]">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PERCENTAGE">Percent %</SelectItem>
                                    <SelectItem value="AMOUNT">Fixed Amount</SelectItem>
                                </SelectContent>
                            </Select>
                            <Input type="number" placeholder="Amount" value={discountAmount} onChange={(e) => setDiscountAmount(e.target.value)} />
                         </div>
                    </div>

                    <div className="space-y-3 pt-2">
                        <div className="flex items-center gap-2">
                            <input type="checkbox" id="tax" checked={isTaxable} onChange={(e) => setIsTaxable(e.target.checked)} className="h-4 w-4" />
                            <Label htmlFor="tax">Taxable Product</Label>
                        </div>
                    </div>
                </CardContent>
            </Card>

             <Card className="border-none shadow-sm">
                <CardHeader><CardTitle className="text-lg font-semibold">Categorization</CardTitle></CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Label className={errors.category ? "text-destructive" : ""}>Categories *</Label>
                        <div className={`border rounded-md p-3 max-h-[300px] overflow-y-auto bg-white space-y-2 ${errors.category ? "border-destructive" : ""}`}>
                            {isCategoriesLoading && <p className="text-sm text-gray-500">Loading categories...</p>}
                            {!isCategoriesLoading && categoriesList.length === 0 && <p className="text-sm text-gray-500">No categories found.</p>}
                            {!isCategoriesLoading && renderCategoryTree(categoriesList)}
                        </div>
                        {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
                    </div>
                </CardContent>
            </Card>
        </div>
       </div>
    </div>
  );
}
