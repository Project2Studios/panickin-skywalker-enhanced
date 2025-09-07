import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { DataTable, Column } from "../ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  FolderTree,
  Package,
  Image as ImageIcon
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  displayOrder: number;
  productCount: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Mock data - replace with actual API call
const mockCategories: Category[] = [
  {
    id: "1",
    name: "T-Shirts",
    slug: "t-shirts",
    description: "Comfortable and stylish band t-shirts",
    imageUrl: "/images/categories/tshirts.jpg",
    displayOrder: 1,
    productCount: 15,
    active: true,
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-15T14:30:00Z",
  },
  {
    id: "2",
    name: "Hoodies",
    slug: "hoodies",
    description: "Cozy hoodies perfect for any anxious superhero",
    displayOrder: 2,
    productCount: 8,
    active: true,
    createdAt: "2024-01-05T09:00:00Z",
    updatedAt: "2024-01-18T11:15:00Z",
  },
  {
    id: "3",
    name: "Accessories",
    slug: "accessories",
    description: "Pins, stickers, and other band merchandise",
    displayOrder: 3,
    productCount: 23,
    active: true,
    createdAt: "2024-01-10T16:00:00Z",
    updatedAt: "2024-01-20T09:45:00Z",
  },
];

export function CategoryList() {
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);

  // Mock query - replace with actual API call
  const { data: categories, isLoading } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: () => Promise.resolve({
      categories: mockCategories,
      total: mockCategories.length,
    }),
  });

  const columns: Column<Category>[] = [
    {
      key: "name",
      label: "Category",
      sortable: true,
      render: (_, category) => (
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded border bg-muted flex items-center justify-center overflow-hidden">
            {category.imageUrl ? (
              <img 
                src={category.imageUrl} 
                alt={category.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <FolderTree className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          <div>
            <div className="font-medium">{category.name}</div>
            <div className="text-sm text-muted-foreground">/{category.slug}</div>
          </div>
        </div>
      ),
    },
    {
      key: "description",
      label: "Description",
      render: (value) => (
        <div className="max-w-xs">
          <p className="text-sm text-muted-foreground truncate">
            {value || "No description"}
          </p>
        </div>
      ),
    },
    {
      key: "productCount",
      label: "Products",
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-1">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span>{value} products</span>
        </div>
      ),
    },
    {
      key: "displayOrder",
      label: "Order",
      sortable: true,
      render: (value) => (
        <Badge variant="outline">#{value}</Badge>
      ),
    },
    {
      key: "active",
      label: "Status",
      render: (value) => (
        <Badge variant={value ? "default" : "secondary"}>
          {value ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "updatedAt",
      label: "Last Updated",
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: "actions",
      label: "",
      width: "w-12",
      render: (_, category) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/admin/categories/${category.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/admin/categories/${category.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Category
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive"
              onClick={() => setDeleteCategoryId(category.id)}
              disabled={category.productCount > 0}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Category
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const handleBulkDelete = (categories: Category[]) => {
    console.log("Bulk delete categories:", categories);
    // Implement bulk delete logic
  };

  const handleDeleteCategory = () => {
    console.log("Delete category:", deleteCategoryId);
    // Implement delete logic
    setDeleteCategoryId(null);
  };

  const bulkActions = [
    {
      label: "Delete Selected",
      onClick: handleBulkDelete,
      variant: "destructive" as const,
    },
    {
      label: "Mark as Inactive",
      onClick: (categories: Category[]) => {
        console.log("Mark as inactive:", categories);
      },
      variant: "outline" as const,
    },
  ];

  const totalProducts = categories?.categories.reduce((sum, cat) => sum + cat.productCount, 0) || 0;
  const activeCategories = categories?.categories.filter(cat => cat.active).length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">
            Organize your products with categories
          </p>
        </div>
        <Link href="/admin/categories/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FolderTree className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Total Categories</p>
                <p className="text-2xl font-bold">{categories?.total || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FolderTree className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Active Categories</p>
                <p className="text-2xl font-bold">{activeCategories}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">{totalProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Avg. Products</p>
                <p className="text-2xl font-bold">
                  {categories?.total ? Math.round(totalProducts / categories.total) : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Table */}
      <Card>
        <CardContent className="p-6">
          <DataTable
            data={categories?.categories || []}
            columns={columns}
            loading={isLoading}
            selectable
            onSelectionChange={setSelectedCategories}
            actions={bulkActions}
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteCategoryId !== null} onOpenChange={() => setDeleteCategoryId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this category? This action cannot be undone.
              Make sure to move or delete all products in this category first.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteCategory}
            >
              Delete Category
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}