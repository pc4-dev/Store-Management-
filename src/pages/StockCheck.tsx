import React, { useState } from "react";
import { useAppStore } from "../store";
import { PageHeader, Card, Btn, SField } from "../components/ui";
import { CheckSquare, AlertTriangle, RefreshCw, Download, Save } from "lucide-react";
import { CATEGORIES } from "../data";
import { exportToCSV, genId, todayStr } from "../utils";
import { StockCheckRecord } from "../types";

export const StockCheck = () => {
  const { inventory, setInventory, role, setStockCheckRecords, user } = useAppStore();
  const [category, setCategory] = useState("");
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filtered = category
    ? inventory.filter((i) => i.category === category)
    : [];

  const handleSubmitAudit = () => {
    if (!category) return;
    
    const auditItems = filtered.map(item => {
      const physicalQty = counts[item.sku] !== undefined ? Number(counts[item.sku]) : item.liveStock;
      return {
        sku: item.sku,
        name: item.name,
        systemQty: item.liveStock,
        physicalQty,
        variance: physicalQty - item.liveStock,
        remark: remarks[item.sku] || ""
      };
    });

    const record: StockCheckRecord = {
      id: genId("SC", Date.now()),
      date: todayStr(),
      checkedBy: user?.name || "Unknown",
      category,
      items: auditItems
    };

    setStockCheckRecords(prev => [record, ...prev]);
    
    setCounts({});
    setRemarks({});
    alert("Audit report saved successfully. Inventory levels remain unchanged.");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Physical Stock Check"
        sub="Audit warehouse inventory against system records"
        actions={
          <div className="flex gap-2">
            <Btn
              label="Export CSV"
              icon={Download}
              outline
              onClick={() => exportToCSV(inventory, "StockAudit")}
            />
            {category && (
              <Btn
                label="Submit Audit"
                icon={Save}
                onClick={handleSubmitAudit}
              />
            )}
          </div>
        }
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
                  <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8ECF0]">
                {filtered.map((item) => {
                  const count =
                    counts[item.sku] !== undefined ? counts[item.sku] : "";
                  const variance =
                    count !== "" ? Number(count) - item.liveStock : 0;
                  const hasInput = count !== "";

                  return (
                    <tr 
                      key={item.sku} 
                      className={`hover:bg-gray-50/50 transition-colors ${
                        hasInput 
                          ? variance !== 0 
                            ? "bg-red-50" 
                            : "bg-green-50" 
                          : ""
                      }`}
                    >
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
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={remarks[item.sku] || ""}
                          onChange={(e) =>
                            setRemarks({
                              ...remarks,
                              [item.sku]: e.target.value,
                            })
                          }
                          className="w-full px-2 py-1 border rounded text-[13px]"
                          placeholder="Add remark..."
                        />
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
