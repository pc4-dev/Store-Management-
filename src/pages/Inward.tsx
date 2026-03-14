import React, { useState } from "react";
import { useAppStore } from "../store";
import { PageHeader, Card, Btn, Modal, Field, SField } from "../components/ui";
import { Plus, Search, Download, FileText } from "lucide-react";
import { Inward } from "../types";
import { genId, todayStr, exportToCSV } from "../utils";

export const InwardPage = () => {
  const { inwards, setInwards, inventory, setInventory, vendors, role } =
    useAppStore();
  const [modal, setModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [editingInward, setEditingInward] = useState<Inward | null>(null);
  const [inwardToDelete, setInwardToDelete] = useState<Inward | null>(null);
  const [newInward, setNewInward] = useState<Partial<Inward>>({
    sku: "",
    name: "",
    qty: "" as any,
    unit: "",
    challanNo: "",
    mrNo: "",
    supplier: "",
    inType: "Challan",
    sentToOffice: "",
    currentStock: 0,
    type: "Manual",
  });
  const [searchItem, setSearchItem] = useState("");

  const handleCreate = () => {
    console.log("Attempting to create Inward:", newInward);
    if (!newInward.sku || !newInward.qty || !newInward.supplier || !newInward.challanNo || !newInward.mrNo || !newInward.inType) {
      console.warn("Inward form validation failed", newInward);
      return;
    }

    const inward: Inward = {
      id: genId("INW", inwards.length),
      sku: newInward.sku!,
      name: newInward.name!,
      qty: Number(newInward.qty!),
      unit: newInward.unit!,
      receivingDate: todayStr(),
      challanNo: newInward.challanNo!,
      mrNo: newInward.mrNo!,
      supplier: newInward.supplier!,
      inType: newInward.inType as any,
      sentToOffice: newInward.sentToOffice || "No",
      currentStock: newInward.currentStock || 0,
      type: "Manual",
    };

    setInventory((prev) => {
      const updated = [...prev];
      const idx = updated.findIndex((i) => i.sku === inward.sku);
      if (idx >= 0) {
        updated[idx] = {
          ...updated[idx],
          liveStock: updated[idx].liveStock + inward.qty,
        };
      }
      return updated;
    });

    setInwards((prev) => [inward, ...prev]);
    setModal(false);
    setNewInward({
      sku: "",
      name: "",
      qty: 0,
      unit: "",
      challanNo: "",
      mrNo: "",
      supplier: "",
      inType: "Challan",
      sentToOffice: "",
      currentStock: 0,
      type: "Manual",
    });
  };

  const handleUpdate = () => {
    if (!editingInward) return;
    setInwards((prev) =>
      prev.map((i) => (i.id === editingInward.id ? editingInward : i)),
    );
    setEditModal(false);
    setEditingInward(null);
  };

  const handleDelete = () => {
    if (!inwardToDelete) return;
    setInwards((prev) => prev.filter((i) => i.id !== inwardToDelete.id));
    setDeleteModal(false);
    setInwardToDelete(null);
  };

  const selectItem = (item: any, isEdit = false) => {
    if (isEdit && editingInward) {
      setEditingInward({
        ...editingInward,
        sku: item.sku,
        name: item.name,
        unit: item.unit,
        currentStock: item.liveStock,
      });
    } else {
      setNewInward({
        ...newInward,
        sku: item.sku,
        name: item.name,
        unit: item.unit,
        currentStock: item.liveStock,
      });
    }
    setSearchItem("");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inward Transactions"
        sub="Record of all materials received"
        actions={
          <div className="flex items-center gap-2">
            <Btn
              label="Export CSV"
              icon={Download}
              outline
              onClick={() => exportToCSV(inwards, "Inwards")}
            />
            {(role === "Store Incharge" || role === "Super Admin") && (
              <>
                <Btn
                  label="Smart Import"
                  icon={FileText}
                  outline
                  onClick={() => (window.location.hash = "inward-import")}
                />
                <Btn
                  label="Manual Inward"
                  icon={Plus}
                  onClick={() => setModal(true)}
                />
              </>
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
                  Receiving Date
                </th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                  SKU Code
                </th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                  Item
                </th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider text-right">
                  Current Stock
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
                  In Type
                </th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                  Sent to Office
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8ECF0]">
              {inwards.map((inw) => (
                <tr key={inw.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 text-[13px] text-[#6B7280]">
                    {inw.receivingDate}
                  </td>
                  <td className="px-4 py-3 text-[13px] font-mono text-[#6B7280]">
                    {inw.sku || "NA"}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-[#1A1A2E]">
                    {inw.name || "NA"}
                  </td>
                  <td className="px-4 py-3 text-[13px] font-medium text-right text-[#6B7280]">
                    {inw.currentStock} {inw.unit || "NA"}
                  </td>
                  <td className="px-4 py-3 text-[13px] font-bold text-right text-[#10B981]">
                    +{inw.qty} {inw.unit || "NA"}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-[#6B7280]">
                    {inw.supplier || "NA"}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-[#6B7280]">
                    {inw.challanNo || "NA"} / {inw.mrNo || "NA"}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-[#6B7280]">
                    {inw.inType || "NA"}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-[#6B7280]">
                    {inw.sentToOffice || "NA"}
                  </td>
                  {role === "Super Admin" && (
                    <td className="px-4 py-3 text-right space-x-2">
                      <Btn
                        label="Edit"
                        small
                        outline
                        onClick={() => {
                          setEditingInward(inw);
                          setEditModal(true);
                        }}
                      />
                      <Btn
                        label="Delete"
                        color="red"
                        small
                        outline
                        onClick={() => {
                          setInwardToDelete(inw);
                          setDeleteModal(true);
                        }}
                      />
                    </td>
                  )}
                </tr>
              ))}
              {inwards.length === 0 && (
                <tr>
                  <td
                    colSpan={10}
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

            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Current Stock"
                type="number"
                value={newInward.currentStock}
                disabled
              />
              <Field
                label="Quantity Received"
                type="number"
                value={newInward.qty}
                onChange={(e: any) =>
                  setNewInward({ ...newInward, qty: e.target.value })
                }
                required
              />
            </div>
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

            <div className="grid grid-cols-2 gap-4">
              <SField
                label="In Type"
                value={newInward.inType}
                onChange={(e: any) =>
                  setNewInward({ ...newInward, inType: e.target.value })
                }
                options={[
                  "Challan",
                  "Bilty",
                  "Invoice",
                  "Without Challan",
                  "Gate Pass",
                  "Without Gate Pass",
                ]}
                required
              />
              <Field
                label="Sent Challan/Invoice Office"
                value={newInward.sentToOffice}
                onChange={(e: any) =>
                  setNewInward({ ...newInward, sentToOffice: e.target.value })
                }
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

      {editModal && editingInward && (
        <Modal title="Edit Inward Transaction" onClose={() => setEditModal(false)}>
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
                        onClick={() => selectItem(i, true)}
                        className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-[13px]"
                      >
                        {i.name} ({i.sku})
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="p-3 bg-gray-50 border border-[#E8ECF0] rounded-lg mb-4">
              <p className="text-[11px] font-bold text-[#6B7280] uppercase">
                Selected Item
              </p>
              <p className="text-[13px] font-medium text-[#1A1A2E] mt-1">
                {editingInward.name} ({editingInward.sku})
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Current Stock"
                type="number"
                value={editingInward.currentStock}
                disabled
              />
              <Field
                label="Quantity Received"
                type="number"
                value={editingInward.qty}
                onChange={(e: any) =>
                  setEditingInward({ ...editingInward, qty: Number(e.target.value) })
                }
                required
              />
            </div>
            <SField
              label="Supplier"
              value={editingInward.supplier}
              onChange={(e: any) =>
                setEditingInward({ ...editingInward, supplier: e.target.value })
              }
              options={vendors.map((v) => v.name)}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Challan / Invoice No."
                value={editingInward.challanNo}
                onChange={(e: any) =>
                  setEditingInward({ ...editingInward, challanNo: e.target.value })
                }
                required
              />
              <Field
                label="Material Receipt (MR) No."
                value={editingInward.mrNo}
                onChange={(e: any) =>
                  setEditingInward({ ...editingInward, mrNo: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <SField
                label="In Type"
                value={editingInward.inType}
                onChange={(e: any) =>
                  setEditingInward({ ...editingInward, inType: e.target.value })
                }
                options={[
                  "Challan",
                  "Bilty",
                  "Invoice",
                  "Without Challan",
                  "Gate Pass",
                  "Without Gate Pass",
                ]}
                required
              />
              <Field
                label="Sent Challan/Invoice Office"
                value={editingInward.sentToOffice}
                onChange={(e: any) =>
                  setEditingInward({ ...editingInward, sentToOffice: e.target.value })
                }
              />
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Btn label="Cancel" outline onClick={() => setEditModal(false)} />
              <Btn
                label="Update Inward"
                onClick={handleUpdate}
                disabled={
                  !editingInward.sku ||
                  !editingInward.qty ||
                  Number(editingInward.qty) <= 0 ||
                  !editingInward.supplier ||
                  !editingInward.challanNo ||
                  !editingInward.mrNo
                }
                color="green"
              />
            </div>
          </div>
        </Modal>
      )}

      {deleteModal && inwardToDelete && (
        <Modal title="Confirm Delete" onClose={() => setDeleteModal(false)}>
          <div className="p-4">
            <p className="text-[14px] text-gray-600 mb-6">
              Are you sure you want to delete inward transaction{" "}
              <span className="font-bold text-[#1A1A2E]">{inwardToDelete.id}</span>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Btn
                label="Cancel"
                outline
                onClick={() => setDeleteModal(false)}
              />
              <Btn label="Delete Transaction" color="red" onClick={handleDelete} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
