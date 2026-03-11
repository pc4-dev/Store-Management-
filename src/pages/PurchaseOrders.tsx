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
} from "lucide-react";
import { PurchaseOrder, POLineItem } from "../types";
import { fmtCur, genId, todayStr } from "../utils";
import { PROJECTS, WORK_TYPES } from "../data";

export const PurchaseOrders = () => {
  const { pos, setPos, role, inventory, vendors, settings } = useAppStore();
  const [modal, setModal] = useState(false);
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

    setPos([po, ...pos]);
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

  const handleApproveL1 = (id: string) => {
    setPos(
      pos.map((p) =>
        p.id === id
          ? { ...p, approvalL1: "Approved", status: "Pending L2" }
          : p,
      ),
    );
  };

  const handleApproveL2 = (id: string) => {
    setPos(
      pos.map((p) =>
        p.id === id ? { ...p, approvalL2: "Approved", status: "Approved" } : p,
      ),
    );
  };

  const handleCancel = (id: string) => {
    setPos(pos.map((p) => (p.id === id ? { ...p, status: "Blocked" } : p)));
  };

  const addItem = (invItem: any) => {
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
    setNewPO({ ...newPO, items: [...(newPO.items || []), item] });
    setSearchItem("");
  };

  const updateItem = (index: number, field: string, value: number) => {
    const items = [...(newPO.items || [])];
    const item = { ...items[index], [field]: value };
    item.total = item.qty * item.rate;
    item.totalWithGST = item.total * (1 + item.gstPct / 100);
    items[index] = item;
    setNewPO({ ...newPO, items });
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
      <PageHeader
        title="Purchase Orders"
        sub="Manage and approve POs"
        actions={
          role === "Project Manager" && (
            <Btn label="Create PO" icon={Plus} onClick={() => setModal(true)} />
          )
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
                <tr key={po.id} className="hover:bg-gray-50/50">
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
                  <td className="px-4 py-3 text-right space-x-2">
                    {role === "AGM" && po.status === "Pending L1" && (
                      <Btn
                        label="Approve L1"
                        small
                        color="green"
                        onClick={() => handleApproveL1(po.id)}
                      />
                    )}
                    {role === "Director" && po.status === "Pending L2" && (
                      <Btn
                        label="Approve L2"
                        small
                        color="green"
                        onClick={() => handleApproveL2(po.id)}
                      />
                    )}
                    {role === "Director" && po.status === "Approved" && (
                      <Btn
                        label="Cancel"
                        small
                        color="red"
                        outline
                        onClick={() => handleCancel(po.id)}
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
            </tbody>
          </table>
        </div>
      </Card>

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
    </div>
  );
};
