import { useState, useEffect } from "react";
import { z } from "zod";
import { CategoryResponse } from "@/types/category";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

interface CategoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: CategoryFormData) => void;
  parentCategories?: Array<{ id: string; name: string }>;
  editingCategory?: CategoryResponse | null;
}

export interface CategoryFormData {
  name: string;
  description?: string;
  parentId: string;
}

const categoryFormSchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(255, "Category name must be less than 255 characters")
    .trim(),
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional(),
  parentId: z.string(),
});

export function CategoryForm({
  open,
  onOpenChange,
  onSubmit,
  parentCategories = [],
  editingCategory,
}: CategoryFormProps) {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    description: "",
    parentId: "none",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CategoryFormData, string>>>({});

  useEffect(() => {
    if (editingCategory && open) {
      setFormData({
        name: editingCategory.name || "",
        description: editingCategory.description || "",
        parentId: editingCategory.parentId?.toString() || "none",
      });
    } else if (!editingCategory && open) {
      setFormData({
        name: "",
        description: "",
        parentId: "none",
      });
    }
  }, [editingCategory, open]);

  const clearFieldError = (field: keyof CategoryFormData) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleNameChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      name: value,
    }));
    clearFieldError("name");
  };

  const handleDescriptionChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      description: value,
    }));
    clearFieldError("description");
  };

  const validate = (): boolean => {
    try {
      categoryFormSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof CategoryFormData, string>> = {};
        error.issues.forEach((issue) => {
          if (issue.path[0]) {
            newErrors[issue.path[0] as keyof CategoryFormData] = issue.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const submitData: CategoryFormData = {
      name: formData.name.trim(),
      description: formData.description?.trim() || undefined,
      parentId: formData.parentId === "none" ? "" : formData.parentId,
    };

    onSubmit?.(submitData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      name: "",
      description: "",
      parentId: "none",
    });
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingCategory ? "Edit Category" : "Create New Category"}
          </DialogTitle>
          <DialogDescription>
            {editingCategory
              ? "Update category information."
              : "Add a new category to organize your products."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                Category Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g. Men's Clothing"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                placeholder="e.g. This category contains all men's clothing items"
                value={formData.description || ""}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                rows={3}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="parent">Parent Category</Label>
              <Select
                id="parent"
                value={formData.parentId}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, parentId: e.target.value }))
                }
              >
                <option value="none">None (Top Level)</option>
                {parentCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </div>

          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">
              {editingCategory ? "Update Category" : "Save Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

