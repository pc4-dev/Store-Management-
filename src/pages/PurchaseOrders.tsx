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
import {
  Plus,
  Search,
  Printer,
  MessageCircle,
  AlertTriangle,
  Download,
  X,
} from "lucide-react";
import { PurchaseOrder, POLineItem } from "../types";
import { fmtCur, genId, todayStr, exportToCSV } from "../utils";
import { PROJECTS, WORK_TYPES } from "../data";

export const PurchaseOrders = () => {
  const { pos, setPos, role, inventory, vendors, settings } = useAppStore();
  const [modal, setModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [viewModal, setViewModal] = useState<PurchaseOrder | null>(null);
  const [editingPO, setEditingPO] = useState<PurchaseOrder | null>(null);
  const [printingPO, setPrintingPO] = useState<PurchaseOrder | null>(null);
  const [poToDelete, setPoToDelete] = useState<string | null>(null);
  const [newPO, setNewPO] = useState<Partial<PurchaseOrder>>({
    project: "",
    phase: "",
    workType: "",
    milestone: "",
    vendor: "",
    items: [],
    justification: "",
  });
  const [searchItem, setSearchItem] = useState("");

  const handleCreate = () => {
    const totalValue =
      newPO.items?.reduce((sum, item) => sum + item.totalWithGST, 0) || 0;
    const isAutoApproved = totalValue <= settings.poThreshold;

    const po: PurchaseOrder = {
      id: genId("PO", pos.length),
      project: newPO.project!,
      phase: newPO.phase!,
      workType: newPO.workType!,
      milestone: newPO.milestone!,
      vendor: newPO.vendor!,
      items: newPO.items!,
      totalValue,
      status: isAutoApproved ? "Approved" : "Pending L1",
      approvalL1: isAutoApproved ? "Approved" : "Pending",
      approvalL2: isAutoApproved ? "Approved" : "Pending",
      justification: newPO.justification,
      createdBy: role!,
      date: todayStr(),
    };

    setPos((prev) => [po, ...prev]);
    setModal(false);
    setNewPO({
      project: "",
      phase: "",
      workType: "",
      milestone: "",
      vendor: "",
      items: [],
      justification: "",
    });
  };

  const handleUpdate = () => {
    if (!editingPO) return;
    const totalValue =
      editingPO.items?.reduce((sum, item) => sum + item.totalWithGST, 0) || 0;
    const isAutoApproved = totalValue <= settings.poThreshold;

    setPos((prev) =>
      prev.map((p) =>
        p.id === editingPO.id
          ? {
              ...editingPO,
              totalValue,
              status: isAutoApproved ? "Approved" : "Pending L1",
              approvalL1: isAutoApproved ? "Approved" : "Pending",
              approvalL2: isAutoApproved ? "Approved" : "Pending",
            }
          : p,
      ),
    );
    setEditModal(false);
    setEditingPO(null);
  };

  const handleApproveL1 = (id: string) => {
    setPos((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, approvalL1: "Approved", status: "Pending L2" }
          : p,
      ),
    );
  };

  const handleApproveL2 = (id: string) => {
    setPos((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, approvalL2: "Approved", status: "Approved" } : p,
      ),
    );
  };

  const handleCancel = (id: string) => {
    setPos((prev) => prev.map((p) => (p.id === id ? { ...p, status: "Blocked" } : p)));
  };

  const handlePrint = (po: PurchaseOrder) => {
    setPrintingPO(po);
    setTimeout(() => {
      window.print();
      setPrintingPO(null);
    }, 500);
  };

  const addItem = (invItem: any, isEdit = false) => {
    const item: POLineItem = {
      sku: invItem.sku,
      name: invItem.name,
      qty: 1,
      unit: invItem.unit,
      rate: 0,
      gstPct: 18,
      total: 0,
      totalWithGST: 0,
    };
    if (isEdit && editingPO) {
      setEditingPO({ ...editingPO, items: [...(editingPO.items || []), item] });
    } else {
      setNewPO({ ...newPO, items: [...(newPO.items || []), item] });
    }
    setSearchItem("");
  };

  const updateItem = (index: number, field: string, value: number, isEdit = false) => {
    if (isEdit && editingPO) {
      const items = [...(editingPO.items || [])];
      const item = { ...items[index], [field]: value };
      item.total = item.qty * item.rate;
      item.totalWithGST = item.total * (1 + item.gstPct / 100);
      items[index] = item;
      setEditingPO({ ...editingPO, items });
    } else {
      const items = [...(newPO.items || [])];
      const item = { ...items[index], [field]: value };
      item.total = item.qty * item.rate;
      item.totalWithGST = item.total * (1 + item.gstPct / 100);
      items[index] = item;
      setNewPO({ ...newPO, items });
    }
  };

  const removeItem = (index: number, isEdit = false) => {
    if (isEdit && editingPO) {
      const items = [...(editingPO.items || [])];
      items.splice(index, 1);
      setEditingPO({ ...editingPO, items });
    } else {
      const items = [...(newPO.items || [])];
      items.splice(index, 1);
      setNewPO({ ...newPO, items });
    }
  };

  const hasReusable = newPO.items?.some((i) => {
    const inv = inventory.find((inv) => inv.sku === i.sku);
    return (
      inv &&
      ["Good", "Needs Repair"].includes(inv.condition) &&
      inv.liveStock > 0
    );
  });

  return (
    <div className="space-y-6">
      <div className="no-print space-y-6">
        <PageHeader
          title="Purchase Orders"
          sub="Manage and approve POs"
          actions={
            <div className="flex items-center gap-2">
              <Btn
                label="Export CSV"
                icon={Download}
                outline
                onClick={() => exportToCSV(pos, "PurchaseOrders")}
              />
              {(role === "Project Manager" || role === "Super Admin") && (
                <Btn
                  label="Create PO"
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
                    PO No.
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider text-right">
                    Value
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8ECF0]">
                {pos.map((po) => (
                  <tr
                    key={po.id}
                    className="hover:bg-gray-50/50 cursor-pointer"
                    onClick={() => setViewModal(po)}
                  >
                    <td className="px-4 py-3 text-[13px] font-medium text-[#1A1A2E]">
                      {po.id}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-[#6B7280]">
                      {po.date}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-[#6B7280]">
                      {po.project}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-[#6B7280]">
                      {po.vendor}
                    </td>
                    <td className="px-4 py-3 text-[13px] font-bold text-right">
                      {fmtCur(po.totalValue)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={po.status} />
                    </td>
                    <td className="px-4 py-3 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                      {(role === "AGM" || role === "Super Admin") && po.status === "Pending L1" && (
                        <Btn
                          label="Approve L1"
                          small
                          color="green"
                          onClick={() => handleApproveL1(po.id)}
                        />
                      )}
                      {(role === "Director" || role === "Super Admin") && po.status === "Pending L2" && (
                        <Btn
                          label="Approve L2"
                          small
                          color="green"
                          onClick={() => handleApproveL2(po.id)}
                        />
                      )}
                      {(role === "Director" || role === "Super Admin") && po.status === "Approved" && (
                        <Btn
                          label="Cancel"
                          small
                          color="red"
                          outline
                          onClick={() => handleCancel(po.id)}
                        />
                      )}
                      {(role === "Super Admin" || role === "Project Manager") && (
                        <>
                          <Btn
                            label="Edit"
                            small
                            outline
                            onClick={() => {
                              setEditingPO(po);
                              setEditModal(true);
                            }}
                          />
                          <Btn
                            label="Delete"
                            color="red"
                            small
                            outline
                            onClick={() => setPoToDelete(po.id)}
                          />
                        </>
                      )}
                      <Btn
                        icon={Printer}
                        small
                        outline
                        onClick={() => handlePrint(po)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {modal && (
        <Modal
          title="Create Purchase Order"
          wide
          onClose={() => setModal(false)}
        >
          <div className="grid grid-cols-2 gap-4 mb-6">
            <SField
              label="Project"
              value={newPO.project}
              onChange={(e: any) =>
                setNewPO({ ...newPO, project: e.target.value })
              }
              options={PROJECTS}
              required
            />
            <Field
              label="Phase/Block"
              value={newPO.phase}
              onChange={(e: any) =>
                setNewPO({ ...newPO, phase: e.target.value })
              }
              required
            />
            <SField
              label="Work Type"
              value={newPO.workType}
              onChange={(e: any) =>
                setNewPO({ ...newPO, workType: e.target.value })
              }
              options={WORK_TYPES}
              required
            />
            <Field
              label="Milestone"
              value={newPO.milestone}
              onChange={(e: any) =>
                setNewPO({ ...newPO, milestone: e.target.value })
              }
              required
            />
            <SField
              label="Vendor"
              value={newPO.vendor}
              onChange={(e: any) =>
                setNewPO({ ...newPO, vendor: e.target.value })
              }
              options={vendors.map((v) => v.name)}
              required
            />
          </div>

          <div className="mb-6">
            <h3 className="text-[13px] font-bold text-[#1A1A2E] mb-3">
              Line Items
            </h3>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search inventory to add items..."
                value={searchItem}
                onChange={(e) => setSearchItem(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-[#E8ECF0] rounded-lg text-[13px] focus:outline-none focus:border-[#F97316]"
              />
              {searchItem && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-[#E8ECF0] rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {inventory
                    .filter((i) =>
                      i.name?.toLowerCase().includes(searchItem.toLowerCase()),
                    )
                    .map((i) => (
                      <div
                        key={i.sku}
                        onClick={() => addItem(i)}
                        className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-[13px]"
                      >
                        {i.name} ({i.sku}) - Stock: {i.liveStock}
                      </div>
                    ))}
                </div>
              )}
            </div>

            {newPO.items && newPO.items.length > 0 && (
              <table className="w-full text-left border-collapse mb-4">
                <thead>
                  <tr className="bg-gray-50 border-b border-[#E8ECF0]">
                    <th className="px-2 py-2 text-[11px] font-bold text-[#6B7280] uppercase">
                      Item
                    </th>
                    <th className="px-2 py-2 text-[11px] font-bold text-[#6B7280] uppercase w-20">
                      Qty
                    </th>
                    <th className="px-2 py-2 text-[11px] font-bold text-[#6B7280] uppercase w-24">
                      Rate
                    </th>
                    <th className="px-2 py-2 text-[11px] font-bold text-[#6B7280] uppercase w-20">
                      GST %
                    </th>
                    <th className="px-2 py-2 text-[11px] font-bold text-[#6B7280] uppercase text-right">
                      Total
                    </th>
                    <th className="px-2 py-2 text-[11px] font-bold text-[#6B7280] uppercase text-right w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8ECF0]">
                  {newPO.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-2 py-2 text-[13px]">{item.name}</td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          value={item.qty}
                          onChange={(e) =>
                            updateItem(idx, "qty", Number(e.target.value))
                          }
                          className="w-full px-2 py-1 border rounded text-[13px]"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          value={item.rate}
                          onChange={(e) =>
                            updateItem(idx, "rate", Number(e.target.value))
                          }
                          className="w-full px-2 py-1 border rounded text-[13px]"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <select
                          value={item.gstPct}
                          onChange={(e) =>
                            updateItem(idx, "gstPct", Number(e.target.value))
                          }
                          className="w-full px-2 py-1 border rounded text-[13px]"
                        >
                          <option value={5}>5%</option>
                          <option value={12}>12%</option>
                          <option value={18}>18%</option>
                          <option value={28}>28%</option>
                        </select>
                      </td>
                      <td className="px-2 py-2 text-[13px] font-bold text-right">
                        {fmtCur(item.totalWithGST)}
                      </td>
                      <td className="px-2 py-2 text-right">
                        <button
                          onClick={() => removeItem(idx)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {hasReusable && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                <div className="flex items-start gap-2 text-blue-800">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="text-[13px] font-bold">
                      Reusable Stock Available
                    </p>
                    <p className="text-[13px] mt-1">
                      Some items in this PO have reusable stock available.
                      Please provide justification for ordering new stock.
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <Field
                    label="Justification"
                    value={newPO.justification}
                    onChange={(e: any) =>
                      setNewPO({ ...newPO, justification: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-[#E8ECF0]">
            <Btn label="Cancel" outline onClick={() => setModal(false)} />
            <Btn
              label="Create PO"
              onClick={handleCreate}
              disabled={
                !newPO.project ||
                !newPO.vendor ||
                newPO.items?.length === 0 ||
                (hasReusable && !newPO.justification)
              }
            />
          </div>
        </Modal>
      )}

      {editModal && editingPO && (
        <Modal
          title={`Edit Purchase Order: ${editingPO.id}`}
          wide
          onClose={() => {
            setEditModal(false);
            setEditingPO(null);
          }}
        >
          <div className="grid grid-cols-2 gap-4 mb-6">
            <SField
              label="Project"
              value={editingPO.project}
              onChange={(e: any) =>
                setEditingPO({ ...editingPO, project: e.target.value })
              }
              options={PROJECTS}
              required
            />
            <Field
              label="Phase/Block"
              value={editingPO.phase}
              onChange={(e: any) =>
                setEditingPO({ ...editingPO, phase: e.target.value })
              }
              required
            />
            <SField
              label="Work Type"
              value={editingPO.workType}
              onChange={(e: any) =>
                setEditingPO({ ...editingPO, workType: e.target.value })
              }
              options={WORK_TYPES}
              required
            />
            <Field
              label="Milestone"
              value={editingPO.milestone}
              onChange={(e: any) =>
                setEditingPO({ ...editingPO, milestone: e.target.value })
              }
              required
            />
            <SField
              label="Vendor"
              value={editingPO.vendor}
              onChange={(e: any) =>
                setEditingPO({ ...editingPO, vendor: e.target.value })
              }
              options={vendors.map((v) => v.name)}
              required
            />
          </div>

          <div className="mb-6">
            <h3 className="text-[13px] font-bold text-[#1A1A2E] mb-3">
              Line Items
            </h3>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search inventory to add items..."
                value={searchItem}
                onChange={(e) => setSearchItem(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-[#E8ECF0] rounded-lg text-[13px] focus:outline-none focus:border-[#F97316]"
              />
              {searchItem && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-[#E8ECF0] rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {inventory
                    .filter((i) =>
                      i.name?.toLowerCase().includes(searchItem.toLowerCase()),
                    )
                    .map((i) => (
                      <div
                        key={i.sku}
                        onClick={() => addItem(i, true)}
                        className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-[13px]"
                      >
                        {i.name} ({i.sku}) - Stock: {i.liveStock}
                      </div>
                    ))}
                </div>
              )}
            </div>

            {editingPO.items && editingPO.items.length > 0 && (
              <table className="w-full text-left border-collapse mb-4">
                <thead>
                  <tr className="bg-gray-50 border-b border-[#E8ECF0]">
                    <th className="px-2 py-2 text-[11px] font-bold text-[#6B7280] uppercase">
                      Item
                    </th>
                    <th className="px-2 py-2 text-[11px] font-bold text-[#6B7280] uppercase w-20">
                      Qty
                    </th>
                    <th className="px-2 py-2 text-[11px] font-bold text-[#6B7280] uppercase w-24">
                      Rate
                    </th>
                    <th className="px-2 py-2 text-[11px] font-bold text-[#6B7280] uppercase w-20">
                      GST %
                    </th>
                    <th className="px-2 py-2 text-[11px] font-bold text-[#6B7280] uppercase text-right">
                      Total
                    </th>
                    <th className="px-2 py-2 text-[11px] font-bold text-[#6B7280] uppercase text-right w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8ECF0]">
                  {editingPO.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-2 py-2 text-[13px]">{item.name}</td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          value={item.qty}
                          onChange={(e) =>
                            updateItem(idx, "qty", Number(e.target.value), true)
                          }
                          className="w-full px-2 py-1 border rounded text-[13px]"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          value={item.rate}
                          onChange={(e) =>
                            updateItem(idx, "rate", Number(e.target.value), true)
                          }
                          className="w-full px-2 py-1 border rounded text-[13px]"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <select
                          value={item.gstPct}
                          onChange={(e) =>
                            updateItem(
                              idx,
                              "gstPct",
                              Number(e.target.value),
                              true,
                            )
                          }
                          className="w-full px-2 py-1 border rounded text-[13px]"
                        >
                          <option value={5}>5%</option>
                          <option value={12}>12%</option>
                          <option value={18}>18%</option>
                          <option value={28}>28%</option>
                        </select>
                      </td>
                      <td className="px-2 py-2 text-[13px] font-bold text-right">
                        {fmtCur(item.totalWithGST)}
                      </td>
                      <td className="px-2 py-2 text-right">
                        <button
                          onClick={() => removeItem(idx, true)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-[#E8ECF0]">
            <Btn
              label="Cancel"
              outline
              onClick={() => {
                setEditModal(false);
                setEditingPO(null);
              }}
            />
            <Btn
              label="Update PO"
              onClick={handleUpdate}
              disabled={
                !editingPO.project ||
                !editingPO.vendor ||
                editingPO.items?.length === 0
              }
            />
          </div>
        </Modal>
      )}

      {viewModal && (
        <Modal
          title={`Purchase Order: ${viewModal.id}`}
          wide
          onClose={() => setViewModal(null)}
        >
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div>
              <p className="text-[10px] font-bold text-[#9CA3AF] uppercase mb-1">
                Project Details
              </p>
              <p className="text-[14px] font-bold text-[#1A1A2E]">
                {viewModal.project}
              </p>
              <p className="text-[12px] text-[#6B7280]">{viewModal.phase}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#9CA3AF] uppercase mb-1">
                Vendor
              </p>
              <p className="text-[14px] font-bold text-[#1A1A2E]">
                {viewModal.vendor}
              </p>
              <p className="text-[12px] text-[#6B7280]">{viewModal.date}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#9CA3AF] uppercase mb-1">
                Status
              </p>
              <div className="flex items-center gap-2">
                <StatusBadge status={viewModal.status} />
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-[13px] font-bold text-[#1A1A2E] mb-3">
              Items Ordered
            </h3>
            <div className="border border-[#E8ECF0] rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-[#E8ECF0]">
                    <th className="px-4 py-2 text-[11px] font-bold text-[#6B7280] uppercase">
                      Item
                    </th>
                    <th className="px-4 py-2 text-[11px] font-bold text-[#6B7280] uppercase text-right">
                      Qty
                    </th>
                    <th className="px-4 py-2 text-[11px] font-bold text-[#6B7280] uppercase text-right">
                      Rate
                    </th>
                    <th className="px-4 py-2 text-[11px] font-bold text-[#6B7280] uppercase text-right">
                      GST
                    </th>
                    <th className="px-4 py-2 text-[11px] font-bold text-[#6B7280] uppercase text-right">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8ECF0]">
                  {viewModal.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2">
                        <p className="text-[13px] font-medium text-[#1A1A2E]">
                          {item.name}
                        </p>
                        <p className="text-[11px] text-[#6B7280] font-mono">
                          {item.sku}
                        </p>
                      </td>
                      <td className="px-4 py-2 text-[13px] text-right">
                        {item.qty} {item.unit}
                      </td>
                      <td className="px-4 py-2 text-[13px] text-right">
                        {fmtCur(item.rate)}
                      </td>
                      <td className="px-4 py-2 text-[13px] text-right">
                        {item.gstPct}%
                      </td>
                      <td className="px-4 py-2 text-[13px] font-bold text-right text-[#1A1A2E]">
                        {fmtCur(item.totalWithGST)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50">
                    <td
                      colSpan={4}
                      className="px-4 py-3 text-[13px] font-bold text-[#1A1A2E] text-right"
                    >
                      Grand Total (Inc. GST)
                    </td>
                    <td className="px-4 py-3 text-[15px] font-extrabold text-[#F97316] text-right">
                      {fmtCur(viewModal.totalValue)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {viewModal.justification && (
            <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-[#E8ECF0]">
              <p className="text-[10px] font-bold text-[#9CA3AF] uppercase mb-1">
                Justification
              </p>
              <p className="text-[13px] text-[#1A1A2E]">
                {viewModal.justification}
              </p>
            </div>
          )}

          <div className="flex justify-between items-center pt-6 border-t border-[#E8ECF0]">
            <div className="flex gap-2">
              <Btn
                label="Print PO"
                icon={Printer}
                outline
                onClick={() => handlePrint(viewModal)}
              />
              <Btn label="Share" icon={MessageCircle} outline />
            </div>
            <Btn label="Close" onClick={() => setViewModal(null)} />
          </div>
        </Modal>
      )}

      {poToDelete && (
        <Modal
          title="Confirm Delete"
          onClose={() => setPoToDelete(null)}
        >
          <div className="p-4">
            <p className="text-[14px] text-gray-600 mb-6">
              Are you sure you want to delete Purchase Order{" "}
              <span className="font-bold text-[#1A1A2E]">{poToDelete}</span>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Btn
                label="Cancel"
                outline
                onClick={() => setPoToDelete(null)}
              />
              <Btn
                label="Delete PO"
                color="red"
                onClick={() => {
                  setPos((prev) => prev.filter((p) => p.id !== poToDelete));
                  setPoToDelete(null);
                }}
              />
            </div>
          </div>
        </Modal>
      )}

      {/* Printable PO View */}
      {printingPO && (
        <div className="print-only p-10 bg-white min-h-screen text-[#1A1A2E] w-full">
          <div className="flex justify-between items-start mb-10 border-b-2 border-[#1A1A2E] pb-6">
            <div>
              <h1 className="text-3xl font-bold uppercase tracking-tighter mb-1">
                Purchase Order
              </h1>
              <p className="text-[14px] font-medium text-[#6B7280]">
                #{printingPO.id}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold">Garden City</p>
              <p className="text-[12px] text-[#6B7280]">
                Real Estate Development & Management
              </p>
              <p className="text-[12px] text-[#6B7280]">
                Date: {printingPO.date}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12 mb-10">
            <div>
              <h3 className="text-[11px] font-bold text-[#9CA3AF] uppercase mb-2 tracking-widest">
                Vendor Details
              </h3>
              <p className="text-[16px] font-bold">{printingPO.vendor}</p>
            </div>
            <div>
              <h3 className="text-[11px] font-bold text-[#9CA3AF] uppercase mb-2 tracking-widest">
                Project Details
              </h3>
              <p className="text-[16px] font-bold">{printingPO.project}</p>
              <p className="text-[14px] text-[#6B7280]">{printingPO.phase}</p>
              <p className="text-[14px] text-[#6B7280]">
                Work: {printingPO.workType}
              </p>
            </div>
          </div>

          <table className="w-full mb-10 border-collapse">
            <thead>
              <tr className="border-b-2 border-[#1A1A2E]">
                <th className="py-3 text-left text-[11px] font-bold uppercase tracking-wider">
                  Item Description
                </th>
                <th className="py-3 text-right text-[11px] font-bold uppercase tracking-wider">
                  Qty
                </th>
                <th className="py-3 text-right text-[11px] font-bold uppercase tracking-wider">
                  Rate
                </th>
                <th className="py-3 text-right text-[11px] font-bold uppercase tracking-wider">
                  GST
                </th>
                <th className="py-3 text-right text-[11px] font-bold uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {printingPO.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-4">
                    <p className="font-bold text-[14px]">{item.name}</p>
                    <p className="text-[11px] text-[#6B7280] font-mono">
                      {item.sku}
                    </p>
                  </td>
                  <td className="py-4 text-right text-[14px]">
                    {item.qty} {item.unit}
                  </td>
                  <td className="py-4 text-right text-[14px]">
                    {fmtCur(item.rate)}
                  </td>
                  <td className="py-4 text-right text-[14px]">
                    {item.gstPct}%
                  </td>
                  <td className="py-4 text-right font-bold text-[14px]">
                    {fmtCur(item.totalWithGST)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-[#1A1A2E]">
                <td
                  colSpan={4}
                  className="py-4 text-right font-bold uppercase tracking-wider"
                >
                  Grand Total
                </td>
                <td className="py-4 text-right font-bold text-xl">
                  {fmtCur(printingPO.totalValue)}
                </td>
              </tr>
            </tfoot>
          </table>

          <div className="grid grid-cols-2 gap-12 mt-20">
            <div className="border-t border-gray-300 pt-4">
              <p className="text-[11px] font-bold text-[#9CA3AF] uppercase mb-8 tracking-widest">
                Authorized Signatory
              </p>
              <div className="h-12"></div>
              <p className="text-[13px] font-bold">For Garden City</p>
            </div>
            <div className="border-t border-gray-300 pt-4">
              <p className="text-[11px] font-bold text-[#9CA3AF] uppercase mb-8 tracking-widest">
                Vendor Acknowledgment
              </p>
              <div className="h-12"></div>
              <p className="text-[13px] font-bold">Signature & Stamp</p>
            </div>
          </div>

          <div className="mt-20 text-center text-[10px] text-[#9CA3AF] uppercase tracking-[0.2em]">
            This is a computer generated document. No signature required for
            digital approval.
          </div>
        </div>
      )}
    </div>
  );
};
