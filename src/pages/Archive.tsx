import React, { useState } from "react";
import { useAppStore } from "../store";
import { PageHeader, Card, StatusBadge } from "../components/ui";
import { Search, AlertTriangle } from "lucide-react";

export const Archive = () => {
  const { inventory } = useAppStore();
  const [search, setSearch] = useState("");

  const filtered = inventory.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.sku.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Historical Archive"
        sub="Read-only view of original Excel data (Mar 2023 onwards)"
      />

      <Card className="p-4 border-l-4 border-l-[#3B82F6] bg-blue-50 mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[#3B82F6] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-[13px] font-bold text-[#1A1A2E]">
              Historical Data
            </h4>
            <p className="text-[13px] text-[#6B7280] mt-1">
              This data is imported from the legacy system. It is unverified and
              cannot be edited. Use for reference during physical stock
              verification.
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-[#E8ECF0] bg-white flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search historical records..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-[#E8ECF0] rounded-lg text-[13px] focus:outline-none focus:border-[#F97316]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-[#E8ECF0]">
                <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                  Item Name
                </th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider text-right">
                  Opening Stock
                </th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8ECF0]">
              {filtered.map((item) => (
                <tr key={item.sku} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 text-[13px] font-mono text-[#6B7280]">
                    {item.sku}
                  </td>
                  <td className="px-4 py-3 text-[13px] font-medium text-[#1A1A2E]">
                    {item.name}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-[#6B7280]">
                    {item.category} / {item.subCategory}
                  </td>
                  <td className="px-4 py-3 text-[13px] font-bold text-right">
                    <span
                      className={
                        item.openingStock < 0
                          ? "text-[#EF4444]"
                          : "text-[#6B7280]"
                      }
                    >
                      {item.openingStock} {item.unit}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status="Archive" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
