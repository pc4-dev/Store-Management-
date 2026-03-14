import React from "react";
import { useAppStore } from "../store";
import { PageHeader, KPICard, Card, StatusBadge } from "../components/ui";
import {
  Package,
  RefreshCw,
  ShoppingCart,
  AlertTriangle,
  FileText,
  CheckSquare,
  Database,
  Cloud,
  ShieldCheck,
  UserPlus,
  ClipboardList,
  ArrowDownToLine,
  ArrowUpFromLine,
  Undo2,
  Trash2,
  BarChart3,
  Search,
  Users,
  Archive,
} from "lucide-react";
import { fmtCur } from "../utils";
import { db } from "../firebase";

import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";

export const Dashboard = () => {
  const { inventory, pos, writeOffs, catalogue, role, logActivity } = useAppStore();
  const [isOnline, setIsOnline] = React.useState(true);
  const [activities, setActivities] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (!db) return;
    // Simple check for online status
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", handleStatus);
    window.addEventListener("offline", handleStatus);

    // Fetch recent activities
    const unsubActivities = onSnapshot(
      query(collection(db, "activity_logs"), orderBy("timestamp", "desc"), limit(5)),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setActivities(data);
      }
    );

    return () => {
      window.removeEventListener("online", handleStatus);
      window.removeEventListener("offline", handleStatus);
      unsubActivities();
    };
  }, []);

  const totalSKUs = inventory.length;
  const inStock = inventory.filter((i) => i.liveStock > 0).length;
  const reusable = inventory.filter(
    (i) => ["Good", "Needs Repair"].includes(i.condition) && i.liveStock > 0,
  ).length;
  const pendingPOs = pos.filter((p) =>
    ["Pending L1", "Pending L2"].includes(p.status),
  ).length;

  const lowStockItems = inventory.filter((i) => {
    const cat = catalogue.find((c) => c.sku === i.sku);
    return cat && i.liveStock <= cat.minStock;
  });
  const lowStockCount = lowStockItems.length;

  const conditionSummary = [
    { label: "Good", count: inventory.filter(i => i.condition === "Good").length, color: "bg-green-500" },
    { label: "Needs Repair", count: inventory.filter(i => i.condition === "Needs Repair").length, color: "bg-yellow-500" },
    { label: "Damaged", count: inventory.filter(i => i.condition === "Damaged").length, color: "bg-red-500" },
    { label: "Scrap", count: inventory.filter(i => i.condition === "Scrap").length, color: "bg-gray-500" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        sub="Overview of Garden City store operations"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Total SKUs"
          value={totalSKUs}
          icon={Package}
          color="blue"
        />
        <KPICard
          label="In Stock"
          value={inStock}
          icon={CheckSquare}
          color="green"
        />
        <KPICard
          label="Reusable Stock"
          value={reusable}
          icon={RefreshCw}
          color="purple"
        />
        <KPICard
          label="Pending POs"
          value={pendingPOs}
          icon={ShoppingCart}
          color="orange"
        />
      </div>

      <div className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E8ECF0] rounded-lg w-fit">
        <div className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
        <span className="text-[12px] font-bold text-[#1A1A2E] flex items-center gap-1">
          <Database className="w-3 h-3" />
          Firebase Real-time Sync: {isOnline ? "Connected" : "Offline"}
        </span>
        <span className="text-[11px] text-[#6B7280] ml-2">
          (All forms save to cloud automatically)
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {role === "Super Admin" && (
          <>
            <QuickAction icon={UserPlus} label="Create Users" href="#superadmin" color="purple" />
            <QuickAction icon={ShieldCheck} label="Manage Roles" href="#superadmin" color="purple" />
            <QuickAction icon={ShoppingCart} label="Edit/Delete PO" href="#pos" color="purple" />
            <QuickAction icon={Package} label="Edit Inventory" href="#inventory" color="purple" />
            <QuickAction icon={Database} label="System Settings" href="#superadmin" color="purple" />
          </>
        )}
        {role === "Director" && (
          <>
            <QuickAction icon={ShieldCheck} label="L2 Approval" href="#pos" color="indigo" />
            <QuickAction icon={BarChart3} label="View Reports" href="#dashboard" color="indigo" />
            <QuickAction icon={Users} label="Vendor Performance" href="#vendors" color="indigo" />
          </>
        )}
        {role === "AGM" && (
          <>
            <QuickAction icon={ShieldCheck} label="L1 Approval" href="#pos" color="blue" />
            <QuickAction icon={Search} label="Vendor Selection" href="#vendors" color="blue" />
            <QuickAction icon={FileText} label="PR Review" href="#pos" color="blue" />
          </>
        )}
        {role === "Project Manager" && (
          <>
            <QuickAction icon={ClipboardList} label="Material Planning" href="#planning" color="orange" />
            <QuickAction icon={FileText} label="RFQ Creation" href="#pos" color="orange" />
            <QuickAction icon={ShoppingCart} label="PO Creation" href="#pos" color="orange" />
            <QuickAction icon={Package} label="Project Inventory" href="#inventory" color="orange" />
          </>
        )}
        {role === "Store Incharge" && (
          <>
            <QuickAction icon={ArrowDownToLine} label="GRN Entry" href="#grn" color="green" />
            <QuickAction icon={ArrowDownToLine} label="Material Inward" href="#inward" color="green" />
            <QuickAction icon={ArrowUpFromLine} label="Material Outward" href="#outward" color="green" />
            <QuickAction icon={Undo2} label="Returns Mgmt" href="#returns" color="green" />
            <QuickAction icon={CheckSquare} label="Stock Tracking" href="#stockcheck" color="green" />
          </>
        )}
        {role === "Audit" && (
          <>
            <QuickAction icon={Package} label="View Inventory" href="#inventory" color="blue" />
            <QuickAction icon={CheckSquare} label="Stock Check" href="#stockcheck" color="blue" />
            <QuickAction icon={FileText} label="Stock Reports" href="#stockcheck-reports" color="blue" />
            <QuickAction icon={Archive} label="View Archive" href="#archive" color="blue" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-0 overflow-hidden">
            <div className="p-4 border-b border-[#E8ECF0] bg-gray-50/50 flex justify-between items-center">
              <h3 className="text-[14px] font-bold text-[#1A1A2E]">
                Recent Purchase Orders
              </h3>
              <a href="#pos" className="text-[11px] font-bold text-[#F97316] uppercase hover:underline">View All</a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-[#E8ECF0]">
                    <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                      PO No.
                    </th>
                    <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8ECF0]">
                  {pos
                    .slice(-4)
                    .reverse()
                    .map((po) => (
                      <tr
                        key={po.id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-4 py-3 text-[13px] font-medium text-[#1A1A2E]">
                          {po.id}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-[#6B7280]">
                          {po.project}
                        </td>
                        <td className="px-4 py-3 text-[13px] font-medium text-[#1A1A2E]">
                          {fmtCur(po.totalValue)}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={po.status} />
                        </td>
                      </tr>
                    ))}
                  {pos.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-8 text-center text-gray-500 text-[13px]"
                      >
                        No purchase orders found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="p-0 overflow-hidden">
            <div className="p-4 border-b border-[#E8ECF0] bg-gray-50/50 flex justify-between items-center">
              <h3 className="text-[14px] font-bold text-[#1A1A2E]">
                Low Stock Items
              </h3>
              <a href="#inventory" className="text-[11px] font-bold text-[#F97316] uppercase hover:underline">Manage Stock</a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-[#E8ECF0]">
                    <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">SKU</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Item Name</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Current</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Min</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8ECF0]">
                  {lowStockItems.slice(0, 5).map((item) => {
                    const cat = catalogue.find(c => c.sku === item.sku);
                    return (
                      <tr key={item.sku} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 text-[13px] font-medium text-[#1A1A2E]">{item.sku}</td>
                        <td className="px-4 py-3 text-[13px] text-[#6B7280]">{item.itemName}</td>
                        <td className="px-4 py-3 text-[13px] font-bold text-red-600">{item.liveStock}</td>
                        <td className="px-4 py-3 text-[13px] text-[#6B7280]">{cat?.minStock || 0}</td>
                      </tr>
                    );
                  })}
                  {lowStockItems.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-500 text-[13px]">
                        All items are above minimum stock levels.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-4 border-l-4 border-l-[#EF4444]">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[#EF4444] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-[13px] font-bold text-[#1A1A2E]">
                  Low Stock Alerts
                </h4>
                <p className="text-[13px] text-[#6B7280] mt-1">
                  {lowStockCount} items are below their minimum reorder level.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-l-4 border-l-[#F59E0B]">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-[#F59E0B] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-[13px] font-bold text-[#1A1A2E]">
                  Pending Write-offs
                </h4>
                <p className="text-[13px] text-[#6B7280] mt-1">
                  {writeOffs.filter((w) => w.status === "Pending").length}{" "}
                  requests awaiting approval.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-0 overflow-hidden">
            <div className="p-4 border-b border-[#E8ECF0] bg-gray-50/50">
              <h3 className="text-[14px] font-bold text-[#1A1A2E]">
                Inventory by Condition
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {conditionSummary.map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-[12px]">
                    <span className="text-[#6B7280]">{item.label}</span>
                    <span className="font-bold text-[#1A1A2E]">{item.count}</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${item.color}`} 
                      style={{ width: `${inventory.length ? (item.count / inventory.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-0 overflow-hidden">
            <div className="p-4 border-b border-[#E8ECF0] bg-gray-50/50">
              <h3 className="text-[14px] font-bold text-[#1A1A2E]">
                Recent Activity
              </h3>
            </div>
            <div className="p-4 space-y-4">
              {activities.map((act) => (
                <div key={act.id} className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <Database className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-[#1A1A2E]">{act.action}</p>
                    <p className="text-[11px] text-[#6B7280]">{act.userName} ({act.userRole})</p>
                    <p className="text-[10px] text-[#9CA3AF] mt-0.5">
                      {new Date(act.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
              {activities.length === 0 && (
                <p className="text-center text-gray-500 text-[12px] py-4">No recent activity</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const QuickAction = ({ icon: Icon, label, href, color }: any) => {
  const colors: any = {
    purple: "bg-purple-50 text-purple-600 border-purple-100 hover:bg-purple-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100",
    green: "bg-green-50 text-green-600 border-green-100 hover:bg-green-100",
  };

  return (
    <a
      href={href}
      className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all group ${colors[color] || "bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100"}`}
    >
      <Icon className="w-6 h-6 group-hover:scale-110 transition-transform" />
      <span className="text-[11px] font-bold uppercase tracking-wider text-center">
        {label}
      </span>
    </a>
  );
};
