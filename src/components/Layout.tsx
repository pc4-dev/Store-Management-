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
} from "lucide-react";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { role, setRole } = useAppStore();
  const [collapsed, setCollapsed] = useState(false);

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
      ],
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
      ],
    },
    {
      label: "Firebase Data",
      icon: Database,
      id: "firebase",
      roles: [
        "Super Admin",
        "Director",
        "AGM",
        "Project Manager",
        "Store Incharge",
      ],
    },
  ];

  const visibleNav = navItems.filter((item) => item.roles.includes(role || ""));

  return (
    <div className="flex h-screen bg-[#F8F9FB] font-sans text-[#1A1A2E]">
      {/* Sidebar */}
      <div
        className={`${collapsed ? "w-16" : "w-[230px]"} bg-[#1A1A2E] text-white transition-all duration-300 flex flex-col shrink-0`}
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
            onClick={() => setRole(null)}
            className="flex items-center w-full text-gray-400 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && (
              <span className="ml-3 text-[13px] font-medium">Sign Out</span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b border-[#E8ECF0] flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-[13px] text-[#6B7280]">
              Garden City /{" "}
              <span className="text-[#1A1A2E] font-medium">Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-[13px] font-bold text-[#1A1A2E]">{role}</div>
            </div>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${role === "Super Admin" ? "bg-gradient-to-br from-[#6D28D9] to-[#4C1D95]" : "bg-[#F97316]"}`}
            >
              {role?.charAt(0)}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
};
