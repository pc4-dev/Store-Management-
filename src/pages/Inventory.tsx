import React, { useState } from "react";
import { useAppStore } from "../store";
import {
  PageHeader,
  Card,
  StatusBadge,
  Btn,
  Modal,
  SField,
  Field,
} from "../components/ui";
import { Tag, Search, AlertTriangle, Plus } from "lucide-react";
import { InventoryItem } from "../types";
import { CATEGORIES, UNITS } from "../data";

export const Inventory = () => {
  const { inventory, setInventory, catalogue, role, setWriteOffs, writeOffs } =
    useAppStore();
  const [search, setSearch] = useState("");
  const [tagModal, setTagModal] = useState<InventoryItem | null>(null);
  const [adjustModal, setAdjustModal] = useState<InventoryItem | null>(null);
  const [addModal, setAddModal] = useState(false);
  const [tagData, setTagData] = useState({
    condition: "New",
    sourceSite: "",
    lastProject: "",
  });

  const [adjustData, setAdjustData] = useState({
    newStock: 0,
    reason: "",
    adjustedBy: role || "",
    date: new Date().toISOString().split("T")[0],
  });

  const [newItem, setNewItem] = useState<InventoryItem>({
    sku: "",
    name: "",
    category: "",
    subCategory: "",
    unit: "NOS",
    openingStock: 0,
    liveStock: 0,
    condition: "New",
  });

  const filtered = inventory.filter(
    (i) =>
      i.name?.toLowerCase().includes(search.toLowerCase()) ||
      i.sku?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleTag = () => {
    if (!tagModal) return;

    setInventory((prev) =>
      prev.map((i) =>
        i.sku === tagModal.sku ? ({ ...i, ...tagData } as InventoryItem) : i,
      ),
    );

    if (tagData.condition === "Damaged") {
      setWriteOffs([
        ...writeOffs,
        {
          id: `WO-2026-${String(writeOffs.length + 1).padStart(3, "0")}`,
          sku: tagModal.sku,
          name: tagModal.name,
          qty: tagModal.liveStock,
          unit: tagModal.unit,
          reason: "Auto-created from condition tagging",
          requestedBy: role || "System",
          date: new Date().toISOString().split("T")[0],
          status: "Pending",
        },
      ]);
      alert("Write-off request auto-created for damaged items.");
    }

    setTagModal(null);
  };

  const handleAdjust = () => {
    if (!adjustModal) return;

    setInventory((prev) =>
      prev.map((i) =>
        i.sku === adjustModal.sku
          ? ({
              ...i,
              liveStock: adjustData.newStock,
              lastAdjustmentReason: adjustData.reason,
              lastAdjustedBy: adjustData.adjustedBy,
              lastAdjustmentDate: adjustData.date,
            } as InventoryItem)
          : i,
      ),
    );

    setAdjustModal(null);
    setAdjustData({
      newStock: 0,
      reason: "",
      adjustedBy: role || "",
      date: new Date().toISOString().split("T")[0],
    });
  };

  const handleAdd = () => {
    if (!newItem.sku || !newItem.name) return;
    setInventory((prev) => [...prev, { ...newItem, liveStock: newItem.openingStock }]);
    setAddModal(false);
    setNewItem({
      sku: "",
      name: "",
      category: "",
      subCategory: "",
      unit: "NOS",
      openingStock: 0,
      liveStock: 0,
      condition: "New",
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        sub="Live stock and condition tracking"
        actions={
          (role === "Store Incharge" || role === "Super Admin") && (
            <Btn
              label="Add Item"
              icon={Plus}
              onClick={() => setAddModal(true)}
            />
          )
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {["New", "Good", "Needs Repair", "Damaged"].map((cond) => (
          <Card key={cond} className="p-4 flex items-center justify-between">
            <span className="text-[13px] font-bold text-[#6B7280] uppercase">
              {cond}
            </span>
            <span className="text-xl font-extrabold text-[#1A1A2E]">
              {inventory.filter((i) => i.condition === cond).length}
            </span>
          </Card>
        ))}
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-[#E8ECF0] bg-white flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by SKU or Item Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-10 py-2 border border-[#E8ECF0] rounded-lg text-[13px] focus:outline-none focus:border-[#F97316]"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <Plus className="w-4 h-4 rotate-45" />
              </button>
            )}
          </div>
          <div className="text-[12px] text-[#6B7280]">
            Showing {filtered.length} of {inventory.length} items
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
                  Live Stock
                </th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                  Condition
                </th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8ECF0]">
              {filtered.map((item) => {
                const cat = catalogue.find((c) => c.sku === item.sku);
                const isLow = cat && item.liveStock <= cat.minStock;

                return (
                  <tr key={item.sku} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-[13px] font-mono text-[#6B7280]">
                      {item.sku}
                    </td>
                    <td className="px-4 py-3 text-[13px] font-medium text-[#1A1A2E]">
                      <div className="flex items-center gap-2">
                        {item.name}
                        {isLow && (
                          <AlertTriangle
                            className="w-4 h-4 text-[#F97316]"
                            title="Below minimum stock"
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-[#6B7280]">
                      {item.category} / {item.subCategory}
                    </td>
                    <td className="px-4 py-3 text-[13px] font-bold text-right">
                      <span
                        className={
                          item.liveStock === 0
                            ? "text-[#EF4444]"
                            : item.liveStock < 10
                              ? "text-[#F59E0B]"
                              : "text-[#10B981]"
                        }
                      >
                        {item.liveStock} {item.unit}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={item.condition} />
                    </td>
                    <td className="px-4 py-3">
                      {(role === "Store Incharge" || role === "Super Admin") && (
                        <div className="flex items-center gap-2">
                          <Btn
                            label="Tag"
                            icon={Tag}
                            small
                            outline
                            onClick={() => {
                              setTagModal(item);
                              setTagData({
                                condition: item.condition,
                                sourceSite: item.sourceSite || "",
                                lastProject: item.lastProject || "",
                              });
                            }}
                          />
                          <Btn
                            label="Adjust"
                            icon={Plus}
                            small
                            outline
                            onClick={() => {
                              setAdjustModal(item);
                              setAdjustData({
                                newStock: item.liveStock,
                                reason: "",
                                adjustedBy: role || "",
                                date: new Date().toISOString().split("T")[0],
                              });
                            }}
                          />
                          {role === "Super Admin" && (
                            <Btn
                              label="Delete"
                              color="red"
                              small
                              outline
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete ${item.name}?`)) {
                                  setInventory(inventory.filter(i => i.sku !== item.sku));
                                }
                              }}
                            />
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {tagModal && (
        <Modal
          title={`Tag Item: ${tagModal.name}`}
          onClose={() => setTagModal(null)}
        >
          <div className="space-y-4">
            <SField
              label="Condition"
              value={tagData.condition}
              onChange={(e: any) =>
                setTagData({ ...tagData, condition: e.target.value })
              }
              options={["New", "Good", "Needs Repair", "Damaged"]}
            />
            {tagData.condition === "Damaged" && (
              <div className="p-3 bg-red-50 text-red-700 text-[13px] rounded-lg border border-red-200 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                Tagging as Damaged will auto-create a write-off request for
                AGM/Director approval.
              </div>
            )}
            <Field
              label="Source Site (Optional)"
              value={tagData.sourceSite}
              onChange={(e: any) =>
                setTagData({ ...tagData, sourceSite: e.target.value })
              }
            />
            <Field
              label="Last Project (Optional)"
              value={tagData.lastProject}
              onChange={(e: any) =>
                setTagData({ ...tagData, lastProject: e.target.value })
              }
            />
            <div className="flex justify-end gap-2 mt-6">
              <Btn label="Cancel" outline onClick={() => setTagModal(null)} />
              <Btn label="Save Tags" onClick={handleTag} />
            </div>
          </div>
        </Modal>
      )}

      {adjustModal && (
        <Modal
          title={`Stock Adjustment: ${adjustModal.name}`}
          onClose={() => setAdjustModal(null)}
        >
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 text-blue-700 text-[13px] rounded-lg border border-blue-200">
              Current Stock: <strong>{adjustModal.liveStock} {adjustModal.unit}</strong>
            </div>
            <Field
              label="New Stock Level"
              type="number"
              value={adjustData.newStock}
              onChange={(e: any) =>
                setAdjustData({ ...adjustData, newStock: Number(e.target.value) })
              }
              required
            />
            <Field
              label="Reason for Adjustment"
              value={adjustData.reason}
              onChange={(e: any) =>
                setAdjustData({ ...adjustData, reason: e.target.value })
              }
              placeholder="e.g. Physical count correction"
              required
            />
            <Field
              label="Adjusted By"
              value={adjustData.adjustedBy}
              onChange={(e: any) =>
                setAdjustData({ ...adjustData, adjustedBy: e.target.value })
              }
              required
            />
            <Field
              label="Adjustment Date"
              type="date"
              value={adjustData.date}
              onChange={(e: any) =>
                setAdjustData({ ...adjustData, date: e.target.value })
              }
              required
            />
            <div className="flex justify-end gap-2 mt-6">
              <Btn label="Cancel" outline onClick={() => setAdjustModal(null)} />
              <Btn label="Confirm Adjustment" onClick={handleAdjust} />
            </div>
          </div>
        </Modal>
      )}

      {addModal && (
        <Modal title="Add New Inventory Item" onClose={() => setAddModal(false)}>
          <div className="space-y-4">
            <Field
              label="SKU Code"
              value={newItem.sku}
              onChange={(e: any) =>
                setNewItem({ ...newItem, sku: e.target.value })
              }
              placeholder="e.g. Ele/Mod/0001"
              required
            />
            <Field
              label="Item Name"
              value={newItem.name}
              onChange={(e: any) =>
                setNewItem({ ...newItem, name: e.target.value })
              }
              placeholder="e.g. 3 Module Box"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <SField
                label="Category"
                value={newItem.category}
                onChange={(e: any) =>
                  setNewItem({ ...newItem, category: e.target.value })
                }
                options={CATEGORIES}
                required
              />
              <Field
                label="Sub-Category"
                value={newItem.subCategory}
                onChange={(e: any) =>
                  setNewItem({ ...newItem, subCategory: e.target.value })
                }
                placeholder="e.g. Module"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <SField
                label="Unit"
                value={newItem.unit}
                onChange={(e: any) =>
                  setNewItem({ ...newItem, unit: e.target.value })
                }
                options={UNITS}
                required
              />
              <Field
                label="Opening Stock"
                type="number"
                value={newItem.openingStock}
                onChange={(e: any) =>
                  setNewItem({ ...newItem, openingStock: Number(e.target.value) })
                }
                required
              />
            </div>
            <SField
              label="Condition"
              value={newItem.condition}
              onChange={(e: any) =>
                setNewItem({ ...newItem, condition: e.target.value as any })
              }
              options={["New", "Good", "Needs Repair", "Damaged"]}
              required
            />
            <div className="flex justify-end gap-2 mt-6">
              <Btn label="Cancel" outline onClick={() => setAddModal(false)} />
              <Btn label="Add Item" onClick={handleAdd} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
