import { useLocation } from "wouter";
import { ChevronRight, Home } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

const routeNames: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/products": "Products",
  "/admin/products/new": "New Product",
  "/admin/categories": "Categories", 
  "/admin/categories/new": "New Category",
  "/admin/orders": "Orders",
  "/admin/inventory": "Inventory",
  "/admin/analytics": "Analytics",
  "/admin/customers": "Customers",
  "/admin/settings": "Settings",
};

export function Breadcrumb() {
  const [location] = useLocation();
  
  const pathSegments = location.split('/').filter(Boolean);
  const breadcrumbs = [];
  
  // Build breadcrumb path
  let currentPath = '';
  for (const segment of pathSegments) {
    currentPath += `/${segment}`;
    const name = routeNames[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1);
    breadcrumbs.push({ name, path: currentPath });
  }

  return (
    <nav className="flex items-center space-x-2 text-sm">
      <Link href="/admin" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
        <Home className="h-4 w-4" />
      </Link>
      
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.path} className="flex items-center space-x-2">
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          {index === breadcrumbs.length - 1 ? (
            <span className="font-medium text-foreground">{crumb.name}</span>
          ) : (
            <Link 
              href={crumb.path}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {crumb.name}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}