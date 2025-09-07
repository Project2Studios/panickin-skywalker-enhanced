import { useLocation } from "wouter";
import { Sidebar } from "./admin-sidebar";
import { AdminHeader } from "./admin-header";
import { Breadcrumb } from "../ui/breadcrumb";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <AdminHeader />
        <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
          <div className="flex items-center justify-between">
            <Breadcrumb />
          </div>
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}