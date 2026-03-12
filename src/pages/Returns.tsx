import React, { useState } from "react";
import { useAppStore } from "../store";
import {
  PageHeader,
  Card,
  StatusBadge,
  Btn,
  Modal,
  Field,
  SField,
} from "../components/ui";
import { Plus, Printer, Search, AlertTriangle, Download } from "lucide-react";
import { ReturnItem, WriteOff } from "../types";
import { genId, todayStr, exportToCSV } from "../utils";

export const Returns = () => {
  const {
    returns,
    setReturns,
    inventory,
    setInventory,
    writeOffs,
    setWriteOffs,
    role,
  } = useAppStore();
  const [modal, setModal] = useState(false);
  const [newReturn, setNewReturn] = useState<Partial<ReturnItem>>({
    sku: "",
    name: "",
    qty: 0,
    unit: "",
    type: "From Site",
    condition: "Good",
    sourceSite: "",
    remarks: "",
    handoverFrom: "",
  });
  const [searchItem, setSearchItem] = useState("");

  const handleCreate = () => {
    const ret: ReturnItem = {
      id: genId("RC", returns.length),
      sku: newReturn.sku!,
      name: newReturn.name!,
      qty: Number(newReturn.qty!),
      unit: newReturn.unit!,
      date: todayStr(),
      type: newReturn.type as "From Site" | "To Supplier",
      condition: newReturn.condition as any,
      sourceSite: newReturn.sourceSite,
      remarks: newReturn.remarks,
      handoverFrom: newReturn.handoverFrom,
    };

    if (ret.type === "From Site") {
      const updatedInventory = [...inventory];
      const invIdx = updatedInventory.findIndex((i) => i.sku === ret.sku);

      if (invIdx >= 0) {
        updatedInventory[invIdx] = {
          ...updatedInventory[invIdx],
          liveStock: updatedInventory[invIdx].liveStock + ret.qty,
          condition: ret.condition,
        };
        setInventory(updatedInventory);
      }

      if (ret.condition === "Damaged") {
        const wo: WriteOff = {
          id: genId("WO", writeOffs.length),
          sku: ret.sku,
          name: ret.name,
          qty: ret.qty,
          unit: ret.unit,
          reason: `Auto-created from Return Challan ${ret.id}`,
          requestedBy: role || "System",
          date: todayStr(),
          status: "Pending",
        };
        setWriteOffs([wo, ...writeOffs]);
        alert(
          "Item marked as Damaged. Write-off request auto-created for approval.",
        );
      }
    }

    setReturns([ret, ...returns]);
    setModal(false);
    setNewReturn({
      sku: "",
      name: "",
      qty: 0,
      unit: "",
      type: "From Site",
      condition: "Good",
      sourceSite: "",
      remarks: "",
      handoverFrom: "",
    });
  };

  const selectItem = (item: any) => {
    setNewReturn({
      ...newReturn,
      sku: item.sku,
      name: item.name,
      unit: item.unit,
    });
    setSearchItem("");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Returns & Challans"
        sub="Manage material returns from site or to suppliers"
        actions={
          <div className="flex items-center gap-2">
            <Btn
              label="Export CSV"
              icon={Download}
              outline
              onClick={() => exportToCSV(returns, "Returns")}
            />
            {(role === "Store Incharge" || role === "Super Admin") && (
              <Btn
                label="New Return"
                icon={Plus}
                onClick={() => setModal(true)}
              />
            )}
          </div>
        }
      />

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-[#E8ECF0]">
                <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                  RC No.
                </th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                  Item
                </th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider text-right">
                  Qty
                </th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                  Condition
                </th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8ECF0]">
              {returns.map((ret) => (
                <tr key={ret.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 text-[13px] font-medium text-[#1A1A2E]">
                    {ret.id}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-[#6B7280]">
                    {ret.date}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[11px] font-bold px-2 py-1 rounded-full ${ret.type === "From Site" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}`}
                    >
                      {ret.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-[#1A1A2E]">
                    {ret.name}{" "}
                    <span className="text-[11px] text-[#6B7280] block font-mono">
                      {ret.sku}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[13px] font-bold text-right text-[#10B981]">
                    +{ret.qty} {ret.unit}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={ret.condition} />
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    {role === "Super Admin" && (
                      <Btn
                        label="Delete"
                        color="red"
                        small
                        outline
                        onClick={() => {
                          if (confirm(`Delete return challan ${ret.id}?`)) {
                            setReturns(returns.filter(r => r.id !== ret.id));
                          }
                        }}
                      />
                    )}
                    <Btn
                      icon={Printer}
                      small
                      outline
                      onClick={() => window.print()}
                    />
                  </td>
                </tr>
              ))}
              {returns.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-gray-500 text-[13px]"
                  >
                    No returns recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {modal && (
        <Modal title="Material Return Challan" onClose={() => setModal(false)}>
          <div className="space-y-4">
            <SField
              label="Return Type"
              value={newReturn.type}
              onChange={(e: any) =>
                setNewReturn({ ...newReturn, type: e.target.value })
              }
              options={["From Site", "To Supplier"]}
              required
            />

            <div className="relative mb-4">
              <label className="block text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">
                Select Item *
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search inventory..."
                  value={searchItem}
                  onChange={(e) => setSearchItem(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-[#E8ECF0] rounded-lg text-[13px] focus:outline-none focus:border-[#F97316]"
                />
              </div>
              {searchItem && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-[#E8ECF0] rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {inventory
                    .filter((i) =>
                      i.name?.toLowerCase().includes(searchItem.toLowerCase()),
                    )
                    .map((i) => (
                      <div
                        key={i.sku}
                        onClick={() => selectItem(i)}
                        className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-[13px]"
                      >
                        {i.name} ({i.sku})
                      </div>
                    ))}
                </div>
              )}
            </div>

            {newReturn.sku && (
              <div className="p-3 bg-gray-50 border border-[#E8ECF0] rounded-lg mb-4">
                <p className="text-[11px] font-bold text-[#6B7280] uppercase">
                  Selected Item
                </p>
                <p className="text-[13px] font-medium text-[#1A1A2E] mt-1">
                  {newReturn.name} ({newReturn.sku})
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Quantity Returned"
                type="number"
                value={newReturn.qty}
                onChange={(e: any) =>
                  setNewReturn({ ...newReturn, qty: e.target.value })
                }
                required
              />
              <SField
                label="Condition"
                value={newReturn.condition}
                onChange={(e: any) =>
                  setNewReturn({ ...newReturn, condition: e.target.value })
                }
                options={["New", "Good", "Needs Repair", "Damaged"]}
                required
              />
            </div>

            {newReturn.condition === "Damaged" &&
              newReturn.type === "From Site" && (
                <div className="p-3 bg-red-50 text-red-700 text-[13px] rounded-lg border border-red-200 flex items-start gap-2 mb-4">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  This will auto-create a write-off request for AGM/Director
                  approval.
                </div>
              )}

            <Field
              label="Source Site / Location"
              value={newReturn.sourceSite}
              onChange={(e: any) =>
                setNewReturn({ ...newReturn, sourceSite: e.target.value })
              }
              required={newReturn.type === "From Site"}
            />
            <Field
              label="Handover From (Name/Phone)"
              value={newReturn.handoverFrom}
              onChange={(e: any) =>
                setNewReturn({ ...newReturn, handoverFrom: e.target.value })
              }
            />
            <Field
              label="Remarks"
              value={newReturn.remarks}
              onChange={(e: any) =>
                setNewReturn({ ...newReturn, remarks: e.target.value })
              }
            />

            <div className="flex justify-end gap-2 mt-6">
              <Btn label="Cancel" outline onClick={() => setModal(false)} />
              <Btn
                label="Generate Return Challan"
                onClick={handleCreate}
                disabled={
                  !newReturn.sku ||
                  !newReturn.qty ||
                  (newReturn.type === "From Site" && !newReturn.sourceSite)
                }
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
