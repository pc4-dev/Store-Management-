import React, { useState } from "react";
import { useAppStore } from "../store";
import { PageHeader, Card, Btn, SField } from "../components/ui";
import { CheckSquare, AlertTriangle, RefreshCw } from "lucide-react";
import { CATEGORIES } from "../data";

export const StockCheck = () => {
  const { inventory, setInventory, role } = useAppStore();
  const [category, setCategory] = useState("");
  const [counts, setCounts] = useState<Record<string, number>>({});

  const filtered = category
    ? inventory.filter((i) => i.category === category)
    : [];

  const handleAdjust = (sku: string, physicalCount: number) => {
    const updatedInventory = [...inventory];
    const invIdx = updatedInventory.findIndex((i) => i.sku === sku);
    if (invIdx >= 0) {
      updatedInventory[invIdx] = {
        ...updatedInventory[invIdx],
        liveStock: physicalCount,
      };
      setInventory(updatedInventory);

      // Clear count after adjustment
      const newCounts = { ...counts };
      delete newCounts[sku];
      setCounts(newCounts);

      alert(`Stock adjusted to ${physicalCount} for ${sku}`);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Physical Stock Check"
        sub="Audit warehouse inventory against system records"
      />

      <Card className="p-4 mb-6">
        <div className="max-w-md">
          <SField
            label="Select Category to Audit"
            value={category}
            onChange={(e: any) => setCategory(e.target.value)}
            options={CATEGORIES}
          />
        </div>
      </Card>

      {category && (
        <Card className="p-0 overflow-hidden">
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
                  <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider text-right">
                    System Stock
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider text-right">
                    Physical Count
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider text-right">
                    Variance
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8ECF0]">
                {filtered.map((item) => {
                  const count =
                    counts[item.sku] !== undefined ? counts[item.sku] : "";
                  const variance =
                    count !== "" ? Number(count) - item.liveStock : 0;

                  return (
                    <tr key={item.sku} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 text-[13px] font-mono text-[#6B7280]">
                        {item.sku}
                      </td>
                      <td className="px-4 py-3 text-[13px] font-medium text-[#1A1A2E]">
                        {item.name}
                      </td>
                      <td className="px-4 py-3 text-[13px] font-bold text-right">
                        {item.liveStock} {item.unit}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <input
                          type="number"
                          value={count}
                          onChange={(e) =>
                            setCounts({
                              ...counts,
                              [item.sku]:
                                e.target.value === ""
                                  ? ""
                                  : Number(e.target.value),
                            })
                          }
                          className="w-24 px-2 py-1 border rounded text-[13px] text-right"
                          placeholder="Count"
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        {count !== "" && (
                          <span
                            className={`text-[13px] font-bold ${variance > 0 ? "text-blue-500" : variance < 0 ? "text-red-500" : "text-green-500"}`}
                          >
                            {variance > 0 ? `+${variance}` : variance}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {count !== "" &&
                          variance !== 0 &&
                          role === "Store Incharge" && (
                            <Btn
                              label="Adjust"
                              small
                              outline
                              onClick={() =>
                                handleAdjust(item.sku, Number(count))
                              }
                            />
                          )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
