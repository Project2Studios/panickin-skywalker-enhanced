import { useLocation } from "wouter";
import { ProductForm } from "@/components/admin/products/product-form";

export default function AdminProductNewPage() {
  const [, navigate] = useLocation();

  const handleSubmit = (data: any) => {
    console.log("Create product:", data);
    // Implement product creation logic here
    // After successful creation, navigate to product list
    // navigate("/admin/products");
  };

  return (
    <ProductForm
      onSubmit={handleSubmit}
      isLoading={false}
    />
  );
}