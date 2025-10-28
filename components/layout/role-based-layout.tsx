"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  ClipboardCheck,
  Settings,
  LogOut,
  Wrench,
  DollarSign,
  Bell,
  Map,
  Home,
  Calendar,
  CreditCard,
  MessageSquare,
  Menu,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { resolveClientRole } from "@/lib/auth";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [userRole, setUserRole] = useState<'manager' | 'renter' | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const role = resolveClientRole();
    setUserRole(role);
  }, []);

  const managerNavItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/properties", icon: Building2, label: "Properties" },
    { href: "/dashboard/tenants", icon: Users, label: "Tenants" },
    { href: "/dashboard/leases", icon: FileText, label: "Leases" },
    { href: "/dashboard/invoices", icon: DollarSign, label: "Invoices" },
    { href: "/dashboard/inspections", icon: ClipboardCheck, label: "Inspections" },
    { href: "/dashboard/work-orders", icon: Wrench, label: "Work Orders" },
    { href: "/dashboard/reports", icon: Map, label: "Reports" },
    { href: "/dashboard/settings", icon: Settings, label: "Settings" },
  ];

  const renterNavItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "My Dashboard" },
    { href: "/dashboard/my-lease", icon: FileText, label: "My Lease" },
    { href: "/dashboard/payments", icon: DollarSign, label: "Payments" },
    { href: "/dashboard/maintenance", icon: Wrench, label: "Maintenance" },
    { href: "/dashboard/messages", icon: MessageSquare, label: "Messages" },
    { href: "/dashboard/settings", icon: Settings, label: "Settings" },
  ];

  const navItems = (userRole ?? 'renter') === 'manager' ? managerNavItems : renterNavItems;

  const handleLogout = async () => {
    // For now, simply redirect to login
    router.push("/login");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {/* Desktop Sidebar */}
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Building2 className="h-6 w-6" />
              <span className="">RentFlow</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${
                    pathname === item.href ? "bg-muted text-primary" : ""
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
              <Button
                onClick={handleLogout}
                className="mt-4 flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                variant="ghost"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={closeMobileMenu} />
          <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg">
            <div className="flex h-14 items-center justify-between border-b px-4">
              <Link href="/" className="flex items-center gap-2 font-semibold" onClick={closeMobileMenu}>
                <Building2 className="h-6 w-6" />
                <span>RentFlow</span>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeMobileMenu}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <nav className="flex-1 px-2 py-4">
              <div className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      pathname === item.href 
                        ? "bg-primary text-primary-foreground" 
                        : "text-muted-foreground hover:text-primary hover:bg-muted"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                ))}
                <Button
                  onClick={() => {
                    closeMobileMenu();
                    handleLogout();
                  }}
                  className="mt-4 w-full justify-start gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-muted"
                  variant="ghost"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </nav>
          </div>
        </div>
      )}

      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={toggleMobileMenu}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="w-full flex-1">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold">
                {userRole === 'manager' ? 'Property Management' : 'My Rental'}
              </h1>
              <div className="text-sm text-muted-foreground hidden sm:block">
                {userRole === 'manager' ? 'Manager Dashboard' : 'Tenant Portal'}
              </div>
            </div>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {userRole ? children : null}
        </main>
      </div>
    </div>
  );
}
