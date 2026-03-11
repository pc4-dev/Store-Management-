import React, { useState } from "react";
import { useAppStore } from "../store";
import { PageHeader, Card, Btn, Modal, Field, SField } from "../components/ui";
import { Plus, Search } from "lucide-react";
import { Inward } from "../types";
import { genId, todayStr } from "../utils";

export const InwardPage = () => {
  const { inwards, setInwards, inventory, setInventory, vendors, role } =
    useAppStore();
  const [modal, setModal] = useState(false);
  const [newInward, setNewInward] = useState<Partial<Inward>>({
    sku: "",
    name: "",
    qty: "" as any,
    unit: "",
    challanNo: "",
    mrNo: "",
    supplier: "",
    type: "Manual",
  });
  const [searchItem, setSearchItem] = useState("");

  const handleCreate = () => {
    console.log("Attempting to create Inward:", newInward);
    if (!newInward.sku || !newInward.qty || !newInward.supplier || !newInward.challanNo || !newInward.mrNo) {
      console.warn("Inward form validation failed", newInward);
      return;
    }

    const inward: Inward = {
      id: genId("INW", inwards.length),
      sku: newInward.sku!,
      name: newInward.name!,
      qty: Number(newInward.qty!),
      unit: newInward.unit!,
      date: todayStr(),
      challanNo: newInward.challanNo!,
      mrNo: newInward.mrNo!,
      supplier: newInward.supplier!,
      type: "Manual",
    };

    const updatedInventory = [...inventory];
    const invIdx = updatedInventory.findIndex((i) => i.sku === inward.sku);
    if (invIdx >= 0) {
      updatedInventory[invIdx] = {
        ...updatedInventory[invIdx],
        liveStock: updatedInventory[invIdx].liveStock + inward.qty,
      };
      setInventory(updatedInventory);
    }

    setInwards([inward, ...inwards]);
    setModal(false);
    setNewInward({
      sku: "",
      name: "",
      qty: 0,
      unit: "",
      challanNo: "",
      mrNo: "",
      supplier: "",
      type: "Manual",
    });
  };

  const selectItem = (item: any) => {
    setNewInward({
      ...newInward,
      sku: item.sku,
      name: item.name,
      unit: item.unit,
    });
    setSearchItem("");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inward Transactions"
        sub="Record of all materials received"
        actions={
          role === "Store Incharge" && (
            <Btn
              label="Manual Inward"
              icon={Plus}
              onClick={() => setModal(true)}
            />
          )
        }
      />

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-[#E8ECF0]">
                <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                  Item
                </th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider text-right">
                  Qty
                </th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                  Challan / MR
                </th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                  Type
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8ECF0]">
              {inwards.map((inw) => (
                <tr key={inw.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 text-[13px] text-[#6B7280]">
                    {inw.date}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-[#1A1A2E]">
                    {inw.name}{" "}
                    <span className="text-[11px] text-[#6B7280] block font-mono">
                      {inw.sku}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[13px] font-bold text-right text-[#10B981]">
                    +{inw.qty} {inw.unit}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-[#6B7280]">
                    {inw.supplier}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-[#6B7280]">
                    {inw.challanNo} / {inw.mrNo}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[11px] font-bold px-2 py-1 rounded-full ${inw.type === "GRN" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-700"}`}
                    >
                      {inw.type}
                    </span>
                  </td>
                </tr>
              ))}
              {inwards.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-gray-500 text-[13px]"
                  >
                    No inward transactions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {modal && (
        <Modal title="Manual Inward" onClose={() => setModal(false)}>
          <div className="space-y-4">
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

            {newInward.sku && (
              <div className="p-3 bg-gray-50 border border-[#E8ECF0] rounded-lg mb-4">
                <p className="text-[11px] font-bold text-[#6B7280] uppercase">
                  Selected Item
                </p>
                <p className="text-[13px] font-medium text-[#1A1A2E] mt-1">
                  {newInward.name} ({newInward.sku})
                </p>
              </div>
            )}

            <Field
              label="Quantity Received"
              type="number"
              value={newInward.qty}
              onChange={(e: any) =>
                setNewInward({ ...newInward, qty: e.target.value })
              }
              required
            />
            <SField
              label="Supplier"
              value={newInward.supplier}
              onChange={(e: any) =>
                setNewInward({ ...newInward, supplier: e.target.value })
              }
              options={vendors.map((v) => v.name)}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Challan / Invoice No."
                value={newInward.challanNo}
                onChange={(e: any) =>
                  setNewInward({ ...newInward, challanNo: e.target.value })
                }
                required
              />
              <Field
                label="Material Receipt (MR) No."
                value={newInward.mrNo}
                onChange={(e: any) =>
                  setNewInward({ ...newInward, mrNo: e.target.value })
                }
                required
              />
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Btn label="Cancel" outline onClick={() => setModal(false)} />
              <Btn
                label="Confirm Inward"
                onClick={handleCreate}
                disabled={
                  !newInward.sku ||
                  !newInward.qty ||
                  Number(newInward.qty) <= 0 ||
                  !newInward.supplier ||
                  !newInward.challanNo ||
                  !newInward.mrNo
                }
                color="green"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
