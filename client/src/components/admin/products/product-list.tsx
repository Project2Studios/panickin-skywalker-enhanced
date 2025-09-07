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
  Package,
  DollarSign
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  category: {
    name: string;
    slug: string;
  };
  basePrice: number;
  salePrice?: number;
  totalStock: number;
  variants: number;
  images: number;
  featured: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Mock data - replace with actual API call
const mockProducts: Product[] = [
  {
    id: "1",
    name: "Anxious Superhero Tee",
    slug: "anxious-superhero-tee",
    category: { name: "T-Shirts", slug: "t-shirts" },
    basePrice: 24.99,
    salePrice: 19.99,
    totalStock: 45,
    variants: 6,
    images: 3,
    featured: true,
    active: true,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-20T14:30:00Z",
  },
  {
    id: "2",
    name: "Panic Attack Hoodie",
    slug: "panic-attack-hoodie",
    category: { name: "Hoodies", slug: "hoodies" },
    basePrice: 49.99,
    totalStock: 12,
    variants: 4,
    images: 5,
    featured: false,
    active: true,
    createdAt: "2024-01-10T09:00:00Z",
    updatedAt: "2024-01-18T11:15:00Z",
  },
];

export function ProductList() {
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Mock query - replace with actual API call
  const { data: products, isLoading } = useQuery({
    queryKey: ["admin", "products", page, pageSize],
    queryFn: () => Promise.resolve({
      products: mockProducts,
      total: mockProducts.length,
    }),
  });

  const columns: Column<Product>[] = [
    {
      key: "name",
      label: "Product",
      sortable: true,
      render: (_, product) => (
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded border bg-muted flex items-center justify-center">
            <Package className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <div className="font-medium">{product.name}</div>
            <div className="text-sm text-muted-foreground">{product.category.name}</div>
          </div>
        </div>
      ),
    },
    {
      key: "basePrice",
      label: "Price",
      sortable: true,
      render: (_, product) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-1">
            {product.salePrice ? (
              <>
                <span className="font-medium text-green-600">${product.salePrice}</span>
                <span className="text-sm text-muted-foreground line-through">${product.basePrice}</span>
              </>
            ) : (
              <span className="font-medium">${product.basePrice}</span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "totalStock",
      label: "Stock",
      sortable: true,
      render: (value) => (
        <Badge variant={value > 10 ? "default" : value > 0 ? "secondary" : "destructive"}>
          {value} in stock
        </Badge>
      ),
    },
    {
      key: "variants",
      label: "Variants",
      sortable: true,
      render: (value) => (
        <span className="text-muted-foreground">{value} variants</span>
      ),
    },
    {
      key: "featured",
      label: "Status",
      render: (_, product) => (
        <div className="space-x-1">
          {product.featured && (
            <Badge variant="secondary">Featured</Badge>
          )}
          <Badge variant={product.active ? "default" : "secondary"}>
            {product.active ? "Active" : "Inactive"}
          </Badge>
        </div>
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
      render: (_, product) => (
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
              <Link href={`/admin/products/${product.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/admin/products/${product.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Product
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive"
              onClick={() => setDeleteProductId(product.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Product
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const handleBulkDelete = (products: Product[]) => {
    console.log("Bulk delete products:", products);
    // Implement bulk delete logic
  };

  const handleDeleteProduct = () => {
    console.log("Delete product:", deleteProductId);
    // Implement delete logic
    setDeleteProductId(null);
  };

  const bulkActions = [
    {
      label: "Delete Selected",
      onClick: handleBulkDelete,
      variant: "destructive" as const,
    },
    {
      label: "Mark as Featured",
      onClick: (products: Product[]) => {
        console.log("Mark as featured:", products);
      },
      variant: "outline" as const,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Manage your product catalog and inventory
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">{products?.total || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Avg. Price</p>
                <p className="text-2xl font-bold">$37.49</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-bold text-orange-600">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card>
        <CardContent className="p-6">
          <DataTable
            data={products?.products || []}
            columns={columns}
            loading={isLoading}
            selectable
            onSelectionChange={setSelectedProducts}
            actions={bulkActions}
            pagination={{
              page,
              pageSize,
              total: products?.total || 0,
              onPageChange: setPage,
              onPageSizeChange: setPageSize,
            }}
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteProductId !== null} onOpenChange={() => setDeleteProductId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
              All associated variants and inventory will also be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteProduct}
            >
              Delete Product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}