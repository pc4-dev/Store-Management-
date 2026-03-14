import React, { useState } from "react";
import { useAppStore } from "../store";
import { PageHeader, Card, Btn, Modal, Field, SField } from "../components/ui";
import { Plus, Printer, Search, AlertTriangle, Download, FileText } from "lucide-react";
import { Outward } from "../types";
import { genId, todayStr, exportToCSV } from "../utils";

export const OutwardPage = () => {
  const { outwards, setOutwards, inventory, setInventory, role } =
    useAppStore();
  const [modal, setModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [editingOutward, setEditingOutward] = useState<Outward | null>(null);
  const [outwardToDelete, setOutwardToDelete] = useState<Outward | null>(null);
  const [newOutward, setNewOutward] = useState<Partial<Outward>>({
    sku: "",
    name: "",
    qty: "" as any,
    unit: "",
    location: "",
    handoverTo: "",
  });
  const [searchItem, setSearchItem] = useState("");

  const handleCreate = () => {
    console.log("Attempting to create Outward:", newOutward);
    if (!newOutward.sku || !newOutward.qty || !newOutward.location || !newOutward.handoverTo) {
      console.warn("Outward form validation failed", newOutward);
      return;
    }

    const invIdx = inventory.findIndex((i) => i.sku === newOutward.sku);
    const qtyToIssue = Number(newOutward.qty);

    if (invIdx === -1 || inventory[invIdx].liveStock < qtyToIssue) {
      alert(`Insufficient stock! Available: ${invIdx >= 0 ? inventory[invIdx].liveStock : 0}`);
      return;
    }

    const outward: Outward = {
      id: genId("MIS", outwards.length),
      sku: newOutward.sku!,
      name: newOutward.name!,
      qty: qtyToIssue,
      unit: newOutward.unit!,
      date: todayStr(),
      location: newOutward.location!,
      handoverTo: newOutward.handoverTo!,
    };

    setInventory((prev) => {
      const updated = [...prev];
      const idx = updated.findIndex((i) => i.sku === outward.sku);
      if (idx >= 0) {
        updated[idx] = {
          ...updated[idx],
          liveStock: updated[idx].liveStock - outward.qty,
        };
      }
      return updated;
    });

    setOutwards((prev) => [outward, ...prev]);
    setModal(false);
    setNewOutward({
      sku: "",
      name: "",
      qty: 0,
      unit: "",
      location: "",
      handoverTo: "",
    });
  };

  const handleUpdate = () => {
    if (!editingOutward) return;
    setOutwards((prev) =>
      prev.map((o) => (o.id === editingOutward.id ? editingOutward : o)),
    );
    setEditModal(false);
    setEditingOutward(null);
  };

  const handleDelete = () => {
    if (!outwardToDelete) return;
    setOutwards((prev) => prev.filter((o) => o.id !== outwardToDelete.id));
    setDeleteModal(false);
    setOutwardToDelete(null);
  };

  const selectItem = (item: any, isEdit = false) => {
    if (isEdit && editingOutward) {
      setEditingOutward({
        ...editingOutward,
        sku: item.sku,
        name: item.name,
        unit: item.unit,
      });
    } else {
      setNewOutward({
        ...newOutward,
        sku: item.sku,
        name: item.name,
        unit: item.unit,
      });
    }
    setSearchItem("");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Outward & Material Issue"
        sub="Issue materials to site locations"
        actions={
          <div className="flex items-center gap-2">
            <Btn
              label="Export CSV"
              icon={Download}
              outline
              onClick={() => exportToCSV(outwards, "Outwards")}
            />
            {(role === "Store Incharge" || role === "Super Admin") && (
              <>
                <Btn
                  label="Smart Import"
                  icon={FileText}
                  outline
                  onClick={() => (window.location.hash = "outward-import")}
                />
                <Btn
                  label="Issue Material"
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
                  MIS No.
                </th>
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
                  Location
                </th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                  Handover To
                </th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8ECF0]">
              {outwards.map((out) => (
                <tr key={out.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 text-[13px] font-medium text-[#1A1A2E]">
                    {out.id}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-[#6B7280]">
                    {out.date}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-[#1A1A2E]">
                    {out.name}{" "}
                    <span className="text-[11px] text-[#6B7280] block font-mono">
                      {out.sku}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[13px] font-bold text-right text-[#EF4444]">
                    - {out.qty} {out.unit}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-[#6B7280]">
                    {out.location}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-[#6B7280]">
                    {out.handoverTo}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    {role === "Super Admin" && (
                      <>
                        <Btn
                          label="Edit"
                          small
                          outline
                          onClick={() => {
                            setEditingOutward(out);
                            setEditModal(true);
                          }}
                        />
                        <Btn
                          label="Delete"
                          color="red"
                          small
                          outline
                          onClick={() => {
                            setOutwardToDelete(out);
                            setDeleteModal(true);
                          }}
                        />
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {outwards.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-gray-500 text-[13px]"
                  >
                    No materials issued yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {modal && (
        <Modal title="Issue Material (MIS)" onClose={() => setModal(false)}>
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
                    .filter(
                      (i) =>
                        i.name
                          ?.toLowerCase()
                          .includes(searchItem.toLowerCase()) &&
                        i.liveStock > 0,
                    )
                    .map((i) => (
                      <div
                        key={i.sku}
                        onClick={() => selectItem(i)}
                        className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-[13px] flex justify-between"
                      >
                        <span>
                          {i.name} ({i.sku})
                        </span>
                        <span className="font-bold text-[#10B981]">
                          {i.liveStock} {i.unit}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {newOutward.sku && (
              <div className="p-3 bg-gray-50 border border-[#E8ECF0] rounded-lg mb-4">
                <p className="text-[11px] font-bold text-[#6B7280] uppercase">
                  Selected Item
                </p>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-[13px] font-medium text-[#1A1A2E]">
                    {newOutward.name}
                  </p>
                  <p className="text-[13px] font-bold text-[#10B981]">
                    Available:{" "}
                    {inventory.find((i) => i.sku === newOutward.sku)?.liveStock}{" "}
                    {newOutward.unit}
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Quantity to Issue"
                type="number"
                value={newOutward.qty}
                onChange={(e: any) =>
                  setNewOutward({ ...newOutward, qty: e.target.value })
                }
                required
              />
              <SField
                label="Location"
                value={newOutward.location}
                onChange={(e: any) =>
                  setNewOutward({ ...newOutward, location: e.target.value })
                }
                options={[
                  "Villa No.",
                  "Club House",
                  "Plant",
                  "G+10",
                  "Main Gate",
                  "Other",
                ]}
                required
              />
            </div>
            <Field
              label="Handover To (Name/Phone)"
              value={newOutward.handoverTo}
              onChange={(e: any) =>
                setNewOutward({ ...newOutward, handoverTo: e.target.value })
              }
              required
            />

            <div className="flex justify-end gap-2 mt-6">
              <Btn label="Cancel" outline onClick={() => setModal(false)} />
              <Btn
                label="Generate MIS"
                onClick={handleCreate}
                disabled={
                  !newOutward.sku ||
                  !newOutward.qty ||
                  Number(newOutward.qty) <= 0 ||
                  !newOutward.location ||
                  !newOutward.handoverTo
                }
              />
            </div>
          </div>
        </Modal>
      )}

      {editModal && editingOutward && (
        <Modal title="Edit Outward Transaction (MIS)" onClose={() => setEditModal(false)}>
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
                    .filter(
                      (i) =>
                        i.name
                          ?.toLowerCase()
                          .includes(searchItem.toLowerCase()) &&
                        i.liveStock > 0,
                    )
                    .map((i) => (
                      <div
                        key={i.sku}
                        onClick={() => selectItem(i, true)}
                        className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-[13px] flex justify-between"
                      >
                        <span>
                          {i.name} ({i.sku})
                        </span>
                        <span className="font-bold text-[#10B981]">
                          {i.liveStock} {i.unit}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="p-3 bg-gray-50 border border-[#E8ECF0] rounded-lg mb-4">
              <p className="text-[11px] font-bold text-[#6B7280] uppercase">
                Selected Item
              </p>
              <div className="flex justify-between items-center mt-1">
                <p className="text-[13px] font-medium text-[#1A1A2E]">
                  {editingOutward.name}
                </p>
                <p className="text-[13px] font-bold text-[#10B981]">
                  Available:{" "}
                  {inventory.find((i) => i.sku === editingOutward.sku)?.liveStock}{" "}
                  {editingOutward.unit}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Quantity to Issue"
                type="number"
                value={editingOutward.qty}
                onChange={(e: any) =>
                  setEditingOutward({ ...editingOutward, qty: Number(e.target.value) })
                }
                required
              />
              <SField
                label="Location"
                value={editingOutward.location}
                onChange={(e: any) =>
                  setEditingOutward({ ...editingOutward, location: e.target.value })
                }
                options={[
                  "Villa No.",
                  "Club House",
                  "Plant",
                  "G+10",
                  "Main Gate",
                  "Other",
                ]}
                required
              />
            </div>
            <Field
              label="Handover To (Name/Phone)"
              value={editingOutward.handoverTo}
              onChange={(e: any) =>
                setEditingOutward({ ...editingOutward, handoverTo: e.target.value })
              }
              required
            />

            <div className="flex justify-end gap-2 mt-6">
              <Btn label="Cancel" outline onClick={() => setEditModal(false)} />
              <Btn
                label="Update MIS"
                onClick={handleUpdate}
                disabled={
                  !editingOutward.sku ||
                  !editingOutward.qty ||
                  Number(editingOutward.qty) <= 0 ||
                  !editingOutward.location ||
                  !editingOutward.handoverTo
                }
              />
            </div>
          </div>
        </Modal>
      )}

      {deleteModal && outwardToDelete && (
        <Modal title="Confirm Delete" onClose={() => setDeleteModal(false)}>
          <div className="p-4">
            <p className="text-[14px] text-gray-600 mb-6">
              Are you sure you want to delete outward transaction{" "}
              <span className="font-bold text-[#1A1A2E]">{outwardToDelete.id}</span>?
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
