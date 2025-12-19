import { Search, Download, Plus, RefreshCw, Filter } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const categories = [
  {
    name: "Electronics",
    description: "Includes gadgets & devices",
    slug: "/electronics",
    parent: "-",
    products: "1,240",
    status: "Active",
    statusColor: "success",
    icon: "💻",
  },
  {
    name: "Footwear",
    description: "Shoes, Sandals, & Boots",
    slug: "/footwear",
    parent: "Fashion",
    products: "854",
    status: "Active",
    statusColor: "success",
    icon: "👟",
  },
  {
    name: "Winter Collection",
    description: "Seasonal Items",
    slug: "/winter-coll",
    parent: "Seasonal",
    products: "0",
    status: "Draft",
    statusColor: "secondary",
    icon: "👔",
  },
  {
    name: "Running Gear",
    description: "Sports & Outdoors",
    slug: "/running",
    parent: "Sports",
    products: "12",
    status: "Active",
    statusColor: "success",
    icon: "🏃",
  },
  {
    name: "Home Appliances",
    description: "Kitchen & Living",
    slug: "/appliances",
    parent: "Home",
    products: "340",
    status: "Archived",
    statusColor: "warning",
    icon: "❄️",
  },
];

export function Categories() {
  return (
    <div className="p-8">
      {/* Breadcrumbs */}
      <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <span>🏠</span>
        <span>/</span>
        <span>Catalog</span>
        <span>/</span>
        <span className="text-gray-900">Categories</span>
      </div>

      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Categories</h1>
          <p className="text-gray-600">Manage your product categories and sub-categories.</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative w-full sm:w-[300px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                placeholder="Search categories..."
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2 flex-1 justify-end">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">FILTER BY:</span>
              <Select defaultValue="all" className="w-[140px]">
                <option value="all">Status: All</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </Select>
              <Select defaultValue="main" className="w-[140px]">
                <option value="main">Type: Main</option>
                <option value="sub">Sub-category</option>
              </Select>
              <Button variant="outline" size="icon">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input type="checkbox" className="rounded" />
                </TableHead>
                <TableHead>CATEGORY</TableHead>
                <TableHead>SLUG</TableHead>
                <TableHead>PARENT</TableHead>
                <TableHead>PRODUCTS</TableHead>
                <TableHead>STATUS</TableHead>
                <TableHead>ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.name}>
                  <TableCell>
                    <input type="checkbox" className="rounded" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{category.icon}</div>
                      <div>
                        <p className="font-medium">{category.name}</p>
                        <p className="text-sm text-gray-500">{category.description}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">{category.slug}</TableCell>
                  <TableCell>
                    {category.parent !== "-" ? (
                      <span className="text-blue-600 hover:underline cursor-pointer">
                        {category.parent}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{category.products}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          category.statusColor === "success"
                            ? "bg-green-500"
                            : category.statusColor === "secondary"
                            ? "bg-gray-400"
                            : "bg-orange-500"
                        }`}
                      />
                      <Badge
                        variant={
                          category.statusColor === "success"
                            ? "success"
                            : category.statusColor === "secondary"
                            ? "secondary"
                            : "warning"
                        }
                      >
                        {category.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon">
                      <span className="text-gray-400">⋯</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing 1 to 5 of 42 results
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">Previous</Button>
              <Button variant="default" size="sm">1</Button>
              <Button variant="outline" size="sm">2</Button>
              <Button variant="outline" size="sm">3</Button>
              <span className="px-2">...</span>
              <Button variant="outline" size="sm">8</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

