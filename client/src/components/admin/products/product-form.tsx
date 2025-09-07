import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { 
  Upload, 
  X, 
  Plus, 
  Save, 
  Eye,
  Image as ImageIcon,
  Trash2
} from "lucide-react";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  basePrice: z.number().min(0, "Price must be positive"),
  salePrice: z.number().optional(),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
  tags: z.string().optional(),
});

interface Variant {
  id?: string;
  name: string;
  sku: string;
  attributes: Record<string, string>;
  priceAdjustment: number;
  inventory: {
    available: number;
    reserved: number;
  };
}

interface ProductImage {
  id?: string;
  imageUrl: string;
  altText: string;
  displayOrder: number;
}

interface ProductFormProps {
  product?: any;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

const mockCategories = [
  { id: "1", name: "T-Shirts", slug: "t-shirts" },
  { id: "2", name: "Hoodies", slug: "hoodies" },
  { id: "3", name: "Accessories", slug: "accessories" },
];

export function ProductForm({ product, onSubmit, isLoading = false }: ProductFormProps) {
  const [variants, setVariants] = useState<Variant[]>(product?.variants || []);
  const [images, setImages] = useState<ProductImage[]>(product?.images || []);
  const [showVariantDialog, setShowVariantDialog] = useState(false);
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);

  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || "",
      slug: product?.slug || "",
      description: product?.description || "",
      categoryId: product?.categoryId || "",
      basePrice: product?.basePrice || 0,
      salePrice: product?.salePrice || undefined,
      featured: product?.featured || false,
      active: product?.active ?? true,
      tags: product?.tags?.join(", ") || "",
    },
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .trim();
  };

  const handleNameChange = (name: string) => {
    form.setValue("name", name);
    if (!form.getValues("slug")) {
      form.setValue("slug", generateSlug(name));
    }
  };

  const handleAddVariant = (variant: Variant) => {
    if (editingVariant) {
      setVariants(variants.map(v => 
        v === editingVariant ? variant : v
      ));
      setEditingVariant(null);
    } else {
      setVariants([...variants, variant]);
    }
    setShowVariantDialog(false);
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    // Mock implementation - in real app, upload to cloud storage
    Array.from(files).forEach((file, index) => {
      const url = URL.createObjectURL(file);
      const newImage: ProductImage = {
        imageUrl: url,
        altText: `${form.getValues("name")} image ${images.length + index + 1}`,
        displayOrder: images.length + index,
      };
      setImages(prev => [...prev, newImage]);
    });
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = (data: any) => {
    const formData = {
      ...data,
      variants,
      images,
      tags: data.tags ? data.tags.split(",").map((tag: string) => tag.trim()) : [],
    };
    onSubmit(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {product ? "Edit Product" : "Add Product"}
          </h1>
          <p className="text-muted-foreground">
            {product ? "Update product information" : "Create a new product for your store"}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" disabled={isLoading}>
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button 
            type="submit" 
            form="product-form"
            isLoading={isLoading}
            loadingText="Saving..."
          >
            <Save className="mr-2 h-4 w-4" />
            {product ? "Update Product" : "Create Product"}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form id="product-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="space-y-6 lg:col-span-2">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                          <Input 
                            {...field}
                            onChange={(e) => handleNameChange(e.target.value)}
                            placeholder="Anxious Superhero Tee"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="anxious-superhero-tee" />
                        </FormControl>
                        <FormDescription>
                          URL-friendly version of the name. Auto-generated from name.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field}
                            placeholder="Product description..."
                            className="min-h-32"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags</FormLabel>
                        <FormControl>
                          <Input 
                            {...field}
                            placeholder="anxiety, superhero, comfort"
                          />
                        </FormControl>
                        <FormDescription>
                          Comma-separated tags for better search and organization.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Images */}
              <Card>
                <CardHeader>
                  <CardTitle>Product Images</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {images.map((image, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square border rounded-lg overflow-hidden bg-muted">
                            <img 
                              src={image.imageUrl}
                              alt={image.altText}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemoveImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                          {index === 0 && (
                            <Badge className="absolute bottom-2 left-2">Primary</Badge>
                          )}
                        </div>
                      ))}
                      <div className="aspect-square border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center bg-muted/50 hover:bg-muted transition-colors">
                        <label className="cursor-pointer flex flex-col items-center space-y-2">
                          <Upload className="h-8 w-8 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Upload Image</span>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Variants */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Product Variants
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setShowVariantDialog(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Variant
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {variants.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground">No variants added yet.</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Add variants for different sizes, colors, or other options.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {variants.map((variant, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium">{variant.name}</h4>
                              <Badge variant="outline">SKU: {variant.sku}</Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {Object.entries(variant.attributes).map(([key, value]) => (
                                <span key={key} className="mr-4">
                                  {key}: {value}
                                </span>
                              ))}
                            </div>
                            <div className="text-sm">
                              Price adjustment: ${variant.priceAdjustment} | 
                              Stock: {variant.inventory.available}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingVariant(variant);
                                setShowVariantDialog(true);
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRemoveVariant(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Pricing */}
              <Card>
                <CardHeader>
                  <CardTitle>Pricing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="basePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Base Price</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                            <Input 
                              {...field}
                              type="number"
                              step="0.01"
                              className="pl-6"
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="salePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sale Price (Optional)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                            <Input 
                              {...field}
                              type="number"
                              step="0.01"
                              className="pl-6"
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Leave empty if not on sale.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Category & Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Category & Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {mockCategories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  <FormField
                    control={form.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Featured Product</FormLabel>
                          <FormDescription>
                            Show this product prominently on the homepage.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Active</FormLabel>
                          <FormDescription>
                            Make this product visible to customers.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>

      {/* Variant Dialog */}
      <VariantDialog
        open={showVariantDialog}
        onOpenChange={setShowVariantDialog}
        variant={editingVariant}
        onSubmit={handleAddVariant}
        basePrice={form.watch("basePrice")}
      />
    </div>
  );
}

// Variant Dialog Component
function VariantDialog({
  open,
  onOpenChange,
  variant,
  onSubmit,
  basePrice,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant?: Variant | null;
  onSubmit: (variant: Variant) => void;
  basePrice: number;
}) {
  const [formData, setFormData] = useState<Variant>({
    name: "",
    sku: "",
    attributes: {},
    priceAdjustment: 0,
    inventory: { available: 0, reserved: 0 },
    ...variant,
  });

  const handleSubmit = () => {
    onSubmit(formData);
    setFormData({
      name: "",
      sku: "",
      attributes: {},
      priceAdjustment: 0,
      inventory: { available: 0, reserved: 0 },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{variant ? "Edit Variant" : "Add Variant"}</DialogTitle>
          <DialogDescription>
            Create a variant with different attributes like size, color, etc.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Variant Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Medium - Black"
            />
          </div>

          <div>
            <label className="text-sm font-medium">SKU</label>
            <Input
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              placeholder="e.g., AST-M-BLK"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Size</label>
              <Input
                value={formData.attributes.size || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  attributes: { ...formData.attributes, size: e.target.value }
                })}
                placeholder="Medium"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Color</label>
              <Input
                value={formData.attributes.color || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  attributes: { ...formData.attributes, color: e.target.value }
                })}
                placeholder="Black"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Price Adjustment</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  step="0.01"
                  className="pl-6"
                  value={formData.priceAdjustment}
                  onChange={(e) => setFormData({
                    ...formData,
                    priceAdjustment: parseFloat(e.target.value) || 0
                  })}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Final price: ${(basePrice + formData.priceAdjustment).toFixed(2)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Stock Quantity</label>
              <Input
                type="number"
                value={formData.inventory.available}
                onChange={(e) => setFormData({
                  ...formData,
                  inventory: { 
                    ...formData.inventory, 
                    available: parseInt(e.target.value) || 0 
                  }
                })}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {variant ? "Update Variant" : "Add Variant"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}