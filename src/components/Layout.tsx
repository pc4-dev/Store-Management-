import React, { useState } from "react";
import { useAppStore } from "../store";
import {
  LayoutDashboard,
  ShieldAlert,
  BookOpen,
  Users,
  Package,
  ClipboardList,
  FileText,
  ShoppingCart,
  ArrowDownToLine,
  ArrowUpFromLine,
  Undo2,
  Trash2,
  CheckSquare,
  Archive,
  LogOut,
  Menu,
  Database,
  AlertTriangle,
} from "lucide-react";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { role, logout, user } = useAppStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      id: "dashboard",
      roles: [
        "Super Admin",
        "Director",
        "AGM",
        "Project Manager",
        "Store Incharge",
        "Audit",
      ],
    },
    {
      label: "Super Admin",
      icon: ShieldAlert,
      id: "superadmin",
      roles: ["Super Admin"],
    },
    {
      label: "Catalogue",
      icon: BookOpen,
      id: "catalogue",
      roles: [
        "Super Admin",
        "Director",
        "AGM",
        "Project Manager",
        "Store Incharge",
        "Audit",
      ],
    },
    {
      label: "Vendors",
      icon: Users,
      id: "vendors",
      roles: [
        "Super Admin",
        "Director",
        "AGM",
        "Project Manager",
        "Store Incharge",
      ],
    },
    {
      label: "Inventory",
      icon: Package,
      id: "inventory",
      roles: [
        "Super Admin",
        "Director",
        "AGM",
        "Project Manager",
        "Store Incharge",
        "Audit",
      ],
    },
    {
      label: "Smart Import",
      icon: FileText,
      id: "inventory-import",
      roles: ["Super Admin", "Director", "AGM"],
    },
    {
      label: "Material Plan",
      icon: ClipboardList,
      id: "planning",
      roles: [
        "Super Admin",
        "Director",
        "AGM",
        "Project Manager",
        "Store Incharge",
      ],
    },
    {
      label: "Purchase Orders",
      icon: ShoppingCart,
      id: "pos",
      roles: [
        "Super Admin",
        "Director",
        "AGM",
        "Project Manager",
        "Store Incharge",
      ],
    },
    {
      label: "GRN",
      icon: ArrowDownToLine,
      id: "grn",
      roles: [
        "Super Admin",
        "Director",
        "AGM",
        "Project Manager",
        "Store Incharge",
      ],
    },
    {
      label: "Inward",
      icon: ArrowDownToLine,
      id: "inward",
      roles: [
        "Super Admin",
        "Director",
        "AGM",
        "Project Manager",
        "Store Incharge",
      ],
    },
    {
      label: "Inward Import",
      icon: FileText,
      id: "inward-import",
      roles: ["Super Admin", "Store Incharge"],
    },
    {
      label: "Outward",
      icon: ArrowUpFromLine,
      id: "outward",
      roles: [
        "Super Admin",
        "Director",
        "AGM",
        "Project Manager",
        "Store Incharge",
      ],
    },
    {
      label: "Outward Import",
      icon: FileText,
      id: "outward-import",
      roles: ["Super Admin", "Store Incharge"],
    },
    {
      label: "Returns",
      icon: Undo2,
      id: "returns",
      roles: [
        "Super Admin",
        "Director",
        "AGM",
        "Project Manager",
        "Store Incharge",
      ],
    },
    {
      label: "Write-offs",
      icon: Trash2,
      id: "writeoffs",
      roles: [
        "Super Admin",
        "Director",
        "AGM",
        "Project Manager",
        "Store Incharge",
      ],
    },
    {
      label: "Stock Check",
      icon: CheckSquare,
      id: "stockcheck",
      roles: [
        "Super Admin",
        "Director",
        "AGM",
        "Project Manager",
        "Store Incharge",
        "Audit",
      ],
    },
    {
      label: "Stock Reports",
      icon: FileText,
      id: "stockcheck-reports",
      roles: [
        "Super Admin",
        "Director",
        "AGM",
        "Project Manager",
        "Store Incharge",
        "Audit",
      ],
    },
    {
      label: "Archive",
      icon: Archive,
      id: "archive",
      roles: [
        "Super Admin",
        "Director",
        "AGM",
        "Project Manager",
        "Store Incharge",
        "Audit",
      ],
    },
    {
      label: "Firebase Data",
      icon: Database,
      id: "firebase",
      roles: ["Super Admin"],
    },
  ];

  const visibleNav = navItems.filter((item) => {
    if (!role) return false;
    const normalizedCurrentRole = role.toString().trim().toLowerCase();
    return item.roles.some(
      (r) => (r || "").toString().trim().toLowerCase() === normalizedCurrentRole,
    );
  });

  return (
    <div className="flex h-screen bg-[#F8F9FB] font-sans text-[#1A1A2E] overflow-hidden">
      {/* Sidebar - Desktop */}
      <div
        className={`hidden md:flex ${collapsed ? "w-16" : "w-[230px]"} bg-[#1A1A2E] text-white transition-all duration-300 flex-col shrink-0 no-print`}
      >
        <div className="h-14 flex items-center px-4 border-b border-white/10 shrink-0">
          <div className="w-8 h-8 bg-[#F97316] rounded flex items-center justify-center font-bold text-lg shrink-0">
            N
          </div>
          {!collapsed && (
            <span className="ml-3 font-bold truncate">Garden City</span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          {visibleNav.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="flex items-center px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-white border-l-2 border-transparent hover:border-[#F97316] transition-colors"
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && (
                <span className="ml-3 text-[13px] font-medium truncate">
                  {item.label}
                </span>
              )}
            </a>
          ))}
        </div>

        <div className="p-4 border-t border-white/10 shrink-0">
          <button
            onClick={logout}
            className="flex items-center w-full text-gray-400 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && (
              <span className="ml-3 text-[13px] font-medium">Sign Out</span>
            )}
          </button>
        </div>
      </div>

      {/* Sidebar - Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[260px] bg-[#1A1A2E] text-white flex flex-col shadow-2xl animate-in slide-in-from-left duration-300">
            <div className="h-14 flex items-center justify-between px-4 border-b border-white/10">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-[#F97316] rounded flex items-center justify-center font-bold text-lg">
                  N
                </div>
                <span className="ml-3 font-bold">Garden City</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-gray-400 hover:text-white"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
              {visibleNav.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-white border-l-2 border-transparent hover:border-[#F97316] transition-colors"
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  <span className="ml-3 text-[14px] font-medium">
                    {item.label}
                  </span>
                </a>
              ))}
            </div>
            <div className="p-4 border-t border-white/10">
              <button
                onClick={logout}
                className="flex items-center w-full text-gray-400 hover:text-white transition-colors"
              >
                <LogOut className="w-5 h-5 shrink-0" />
                <span className="ml-3 text-[14px] font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 bg-white border-b border-[#E8ECF0] flex items-center justify-between px-4 shrink-0 no-print">
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:block p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-[12px] md:text-[13px] text-[#6B7280] truncate max-w-[150px] sm:max-w-none">
              Garden City /{" "}
              <span className="text-[#1A1A2E] font-medium">Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-[13px] font-bold text-[#1A1A2E]">
                {user?.name || role}
              </div>
              <div className="text-[11px] text-[#6B7280]">{role}</div>
            </div>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${role === "Super Admin" ? "bg-gradient-to-br from-[#6D28D9] to-[#4C1D95]" : "bg-[#F97316]"}`}
            >
              {(user?.name || role)?.charAt(0)}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {!import.meta.env.VITE_FIREBASE_API_KEY && (
            <div className="mb-6 p-4 bg-orange-50 border-l-4 border-orange-400 text-orange-700 flex items-start gap-3 rounded-r-lg shadow-sm no-print">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-[13px]">Firebase Not Configured</p>
                <p className="text-[12px] mt-1 opacity-90">
                  Data is currently being saved to local memory only. To enable permanent cloud storage, please configure your Firebase environment variables in the Settings menu.
                </p>
              </div>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
};
