import { useState, useEffect } from "react";
import { Plus, Loader2, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCodeValues, useCreateCodeValue, useUpdateCodeValue, useDeleteCodeValue } from "@/hooks/useCodes";
import { CodeValueDto, CodeValueRequest } from "@/types/code";

const COLOR_CODE_ID = 1;
const SIZE_CODE_ID = 2;
const ITEMS_PER_PAGE = 5;

interface ConfigurationFormData {
  name: string;
  description: string;
}

interface ConfigurationSectionProps {
  title: string;
  codeId: number;
}

function ConfigurationSection({
  title,
  codeId,
}: ConfigurationSectionProps) {
  const isColorSection = codeId === COLOR_CODE_ID;
  const [formData, setFormData] = useState<ConfigurationFormData>({
    name: "",
    description: "",
  });
  const [colorValue, setColorValue] = useState("#000000");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CodeValueDto | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<CodeValueDto | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const { data: values = [], isLoading, error } = useCodeValues(codeId);
  const createMutation = useCreateCodeValue();
  const updateMutation = useUpdateCodeValue();
  const deleteMutation = useDeleteCodeValue();

  const totalPages = Math.ceil(values.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedValues = values.slice(startIndex, endIndex);

  useEffect(() => {
    if (editingItem && isFormOpen) {
      setFormData({
        name: editingItem.name || "",
        description: editingItem.description || "",
      });
      if (isColorSection) {
        const hexValue = editingItem.description || "#000000";
        const normalizedHex = hexValue.startsWith("#") ? hexValue : `#${hexValue}`;
        setColorValue(normalizedHex.toUpperCase());
      }
    } else if (!editingItem && isFormOpen) {
      setFormData({ name: "", description: "" });
      if (isColorSection) {
        setColorValue("#000000");
      }
    }
  }, [editingItem, isFormOpen, isColorSection]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nameToSave = formData.name.trim();
    
    if (!nameToSave) {
      return;
    }

    let descriptionToSave = formData.description.trim();
    
    if (isColorSection) {
      let hexValue = colorValue.trim();
      if (!hexValue.startsWith("#")) {
        hexValue = `#${hexValue}`;
      }
      hexValue = hexValue.toUpperCase();
      if (hexValue.length === 7 && /^#[0-9A-F]{6}$/i.test(hexValue)) {
        descriptionToSave = hexValue;
      } else {
        alert("Please enter a valid hex color value (e.g., #FF0000)");
        return;
      }
    }

    try {
      if (editingItem) {
        await updateMutation.mutateAsync({
          id: editingItem.id,
          data: {
            codeId,
            name: nameToSave,
            description: descriptionToSave || undefined,
          },
        });
      } else {
        await createMutation.mutateAsync({
          codeId,
          name: nameToSave,
          description: descriptionToSave || undefined,
        });
      }
      setIsFormOpen(false);
      setEditingItem(null);
      setFormData({ name: "", description: "" });
      if (isColorSection) {
        setColorValue("#000000");
      }
    } catch (error) {
      console.error("Failed to save:", error);
    }
  };

  const handleEdit = (item: CodeValueDto) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (item: CodeValueDto) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (itemToDelete) {
      try {
        await deleteMutation.mutateAsync({
          id: itemToDelete.id,
          codeId,
        });
        setDeleteDialogOpen(false);
        setItemToDelete(null);
      } catch (error) {
        console.error("Failed to delete:", error);
      }
    }
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingItem(null);
    setFormData({ name: "", description: "" });
    if (isColorSection) {
      setColorValue("#000000");
    }
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (e.target.type === "text") {
      if (!value.startsWith("#")) {
        value = `#${value}`;
      }
      if (/^#[0-9A-Fa-f]{0,6}$/i.test(value)) {
        const normalizedValue = value.toUpperCase();
        setColorValue(normalizedValue);
        setFormData((prev) => ({
          ...prev,
          description: normalizedValue.length === 7 ? normalizedValue : prev.description,
        }));
      }
    } else {
      const normalizedValue = value.toUpperCase();
      setColorValue(normalizedValue);
      setFormData((prev) => ({
        ...prev,
        description: normalizedValue,
      }));
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(0);

      if (currentPage <= 2) {
        for (let i = 1; i <= 3; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages - 1);
      } else if (currentPage >= totalPages - 3) {
        pages.push("...");
        for (let i = totalPages - 4; i < totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages - 1);
      }
    }

    return pages;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <Button onClick={handleAddNew} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Dialog open={isFormOpen} onOpenChange={handleFormClose}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? `Edit ${title}` : `Add New ${title}`}
              </DialogTitle>
              <DialogDescription>
                {editingItem
                  ? `Update ${title.toLowerCase()} information.`
                  : `Add a new ${title.toLowerCase()} value.`}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">
                    Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder={isColorSection ? "e.g., Blue, Red, Green" : "name"}
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    required
                  />
                </div>

                {isColorSection && (
                  <div className="grid gap-2">
                    <Label htmlFor="color">
                      Color <span className="text-destructive">*</span>
                    </Label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        id="color"
                        value={colorValue}
                        onChange={handleColorChange}
                        className="h-12 w-20 cursor-pointer rounded border border-input"
                        required
                      />
                      <Input
                        type="text"
                        value={colorValue}
                        onChange={handleColorChange}
                        placeholder="#000000"
                        pattern="^#[0-9A-Fa-f]{6}$"
                        className="flex-1 font-mono"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Select a color or enter a hex value (e.g., #FF0000). The hex code will be saved in the description field.
                    </p>
                  </div>
                )}

                {!isColorSection && (
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      placeholder="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                    />
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleFormClose}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingItem ? "Update" : "Save"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {title}</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{itemToDelete?.name}"? This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setItemToDelete(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="ml-2 text-sm text-gray-500">Loading...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-sm text-destructive">
              Error loading {title.toLowerCase()}. Please try again.
            </p>
          </div>
        ) : values.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">No {title.toLowerCase()} found</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>NAME</TableHead>
                  <TableHead>DESCRIPTION</TableHead>
                  <TableHead className="text-right">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedValues.map((item) => {
                  let hexColor = item.description || "";
                  if (isColorSection) {
                    if (hexColor && !hexColor.startsWith("#")) {
                      hexColor = `#${hexColor}`;
                    }
                  }
                  const isHexColor = isColorSection && hexColor && /^#[0-9A-Fa-f]{6}$/i.test(hexColor);
                  const displayHex = isHexColor ? hexColor.toUpperCase() : "";
                  
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {isColorSection && isHexColor ? (
                          <div className="flex items-center gap-3">
                            <div
                              className="h-8 w-8 rounded border-2 border-gray-300 shadow-sm"
                              style={{ backgroundColor: hexColor }}
                              title={displayHex}
                            />
                            <span>{item.name}</span>
                          </div>
                        ) : (
                          item.name
                        )}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {isColorSection && isHexColor ? (
                          <span className="font-mono">{displayHex}</span>
                        ) : (
                          item.description || "-"
                        )}
                      </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={deleteMutation.isPending}
                          >
                            <MoreHorizontal className="h-4 w-4 text-gray-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(item)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(item)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {values.length > 0 && totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing {startIndex + 1} to {Math.min(endIndex, values.length)} of{" "}
                  {values.length} results
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                    disabled={currentPage === 0}
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
                        {(page as number) + 1}
                      </Button>
                    );
                  })}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
                    }
                    disabled={currentPage >= totalPages - 1}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function Configurations() {
  return (
    <div className="p-8">
      <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <span>🏠</span>
        <span>/</span>
        <span>Settings</span>
        <span>/</span>
        <span className="text-gray-900">Configurations</span>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Configurations</h1>
        <p className="text-gray-600">
          Manage your product configurations for colors and sizes.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ConfigurationSection
          title="Color"
          codeId={COLOR_CODE_ID}
        />
        <ConfigurationSection
          title="Size"
          codeId={SIZE_CODE_ID}
        />
      </div>
    </div>
  );
}

