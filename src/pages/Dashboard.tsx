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
} from "lucide-react";
import { fmtCur } from "../utils";

export const Dashboard = () => {
  const { inventory, pos, writeOffs, catalogue } = useAppStore();

  const totalSKUs = inventory.length;
  const inStock = inventory.filter((i) => i.liveStock > 0).length;
  const reusable = inventory.filter(
    (i) => ["Good", "Needs Repair"].includes(i.condition) && i.liveStock > 0,
  ).length;
  const pendingPOs = pos.filter((p) =>
    ["Pending L1", "Pending L2"].includes(p.status),
  ).length;

  const lowStockCount = inventory.filter((i) => {
    const cat = catalogue.find((c) => c.sku === i.sku);
    return cat && i.liveStock <= cat.minStock;
  }).length;

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-0 overflow-hidden">
            <div className="p-4 border-b border-[#E8ECF0] bg-gray-50/50">
              <h3 className="text-[14px] font-bold text-[#1A1A2E]">
                Recent Purchase Orders
              </h3>
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
        </div>
      </div>
    </div>
  );
};
