import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DataTable, Column } from "../ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Package,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Edit,
  RefreshCw,
  Download
} from "lucide-react";

interface InventoryItem {
  id: string;
  productName: string;
  variantName: string;
  sku: string;
  available: number;
  reserved: number;
  lowStockThreshold: number;
  lastRestocked: string;
  totalSold: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

// Mock data - replace with actual API call
const mockInventory: InventoryItem[] = [
  {
    id: "1",
    productName: "Anxious Superhero Tee",
    variantName: "Medium - Black",
    sku: "AST-M-BLK",
    available: 15,
    reserved: 3,
    lowStockThreshold: 10,
    lastRestocked: "2024-01-15T10:00:00Z",
    totalSold: 85,
    status: 'in_stock',
  },
  {
    id: "2",
    productName: "Anxious Superhero Tee",
    variantName: "Large - White",
    sku: "AST-L-WHT",
    available: 3,
    reserved: 1,
    lowStockThreshold: 10,
    lastRestocked: "2024-01-10T14:30:00Z",
    totalSold: 92,
    status: 'low_stock',
  },
  {
    id: "3",
    productName: "Panic Attack Hoodie",
    variantName: "Small - Gray",
    sku: "PAH-S-GRY",
    available: 0,
    reserved: 2,
    lowStockThreshold: 5,
    lastRestocked: "2023-12-20T09:15:00Z",
    totalSold: 45,
    status: 'out_of_stock',
  },
];

export function InventoryOverview() {
  const [selectedItems, setSelectedItems] = useState<InventoryItem[]>([]);
  const [updateInventoryItem, setUpdateInventoryItem] = useState<InventoryItem | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Mock query - replace with actual API call
  const { data: inventory, isLoading } = useQuery({
    queryKey: ["admin", "inventory", page, pageSize],
    queryFn: () => Promise.resolve({
      items: mockInventory,
      total: mockInventory.length,
    }),
  });

  const columns: Column<InventoryItem>[] = [
    {
      key: "productName",
      label: "Product",
      sortable: true,
      render: (_, item) => (
        <div className="space-y-1">
          <div className="font-medium">{item.productName}</div>
          <div className="text-sm text-muted-foreground">{item.variantName}</div>
          <div className="text-xs text-muted-foreground">SKU: {item.sku}</div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (_, item) => {
        const statusConfig = {
          in_stock: { variant: "default" as const, label: "In Stock" },
          low_stock: { variant: "secondary" as const, label: "Low Stock" },
          out_of_stock: { variant: "destructive" as const, label: "Out of Stock" },
        };
        const config = statusConfig[item.status];
        return (
          <Badge variant={config.variant}>
            {config.label}
          </Badge>
        );
      },
    },
    {
      key: "available",
      label: "Available",
      sortable: true,
      render: (value, item) => (
        <div className="space-y-1">
          <div className="font-medium">{value} available</div>
          <div className="text-sm text-muted-foreground">{item.reserved} reserved</div>
        </div>
      ),
    },
    {
      key: "lowStockThreshold",
      label: "Threshold",
      sortable: true,
      render: (value) => (
        <span className="text-muted-foreground">{value} min</span>
      ),
    },
    {
      key: "totalSold",
      label: "Sold",
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-1">
          <TrendingUp className="h-4 w-4 text-green-500" />
          <span>{value}</span>
        </div>
      ),
    },
    {
      key: "lastRestocked",
      label: "Last Restocked",
      sortable: true,
      render: (value) => (
        <div className="text-sm">
          {new Date(value).toLocaleDateString()}
        </div>
      ),
    },
    {
      key: "actions",
      label: "",
      width: "w-12",
      render: (_, item) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setUpdateInventoryItem(item)}
        >
          <Edit className="h-4 w-4 mr-2" />
          Update
        </Button>
      ),
    },
  ];

  const handleBulkRestock = (items: InventoryItem[]) => {
    console.log("Bulk restock items:", items);
    // Implement bulk restock logic
  };

  const bulkActions = [
    {
      label: "Bulk Restock",
      onClick: handleBulkRestock,
      variant: "outline" as const,
    },
    {
      label: "Update Thresholds",
      onClick: (items: InventoryItem[]) => {
        console.log("Update thresholds:", items);
      },
      variant: "outline" as const,
    },
  ];

  // Calculate stats
  const inStockItems = inventory?.items.filter(item => item.status === 'in_stock').length || 0;
  const lowStockItems = inventory?.items.filter(item => item.status === 'low_stock').length || 0;
  const outOfStockItems = inventory?.items.filter(item => item.status === 'out_of_stock').length || 0;
  const totalValue = inventory?.items.reduce((sum, item) => sum + (item.available * 25), 0) || 0; // Mock pricing

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">
            Manage stock levels and inventory alerts
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync Inventory
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-4 w-4 text-green-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">In Stock</p>
                <p className="text-2xl font-bold text-green-600">{inStockItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-600">{lowStockItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingDown className="h-4 w-4 text-red-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">{outOfStockItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Inventory Value</p>
                <p className="text-2xl font-bold">${totalValue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardContent className="p-6">
          <DataTable
            data={inventory?.items || []}
            columns={columns}
            loading={isLoading}
            selectable
            onSelectionChange={setSelectedItems}
            actions={bulkActions}
            pagination={{
              page,
              pageSize,
              total: inventory?.total || 0,
              onPageChange: setPage,
              onPageSizeChange: setPageSize,
            }}
          />
        </CardContent>
      </Card>

      {/* Update Inventory Dialog */}
      <UpdateInventoryDialog
        item={updateInventoryItem}
        onClose={() => setUpdateInventoryItem(null)}
      />
    </div>
  );
}

// Update Inventory Dialog Component
function UpdateInventoryDialog({
  item,
  onClose,
}: {
  item: InventoryItem | null;
  onClose: () => void;
}) {
  const [available, setAvailable] = useState(item?.available || 0);
  const [reserved, setReserved] = useState(item?.reserved || 0);
  const [threshold, setThreshold] = useState(item?.lowStockThreshold || 0);
  const [notes, setNotes] = useState("");

  const handleSubmit = () => {
    if (!item) return;
    
    console.log("Update inventory:", {
      itemId: item.id,
      available,
      reserved,
      threshold,
      notes,
    });
    
    // Implement inventory update logic
    onClose();
  };

  if (!item) return null;

  return (
    <Dialog open={!!item} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Inventory</DialogTitle>
          <DialogDescription>
            Update stock levels for {item.productName} - {item.variantName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Available Stock</label>
              <Input
                type="number"
                value={available}
                onChange={(e) => setAvailable(parseInt(e.target.value) || 0)}
                min="0"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Reserved Stock</label>
              <Input
                type="number"
                value={reserved}
                onChange={(e) => setReserved(parseInt(e.target.value) || 0)}
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Low Stock Threshold</label>
            <Input
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(parseInt(e.target.value) || 0)}
              min="0"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Restocking notes, supplier info, etc..."
              className="w-full p-3 border rounded-md resize-none"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Update Inventory
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}