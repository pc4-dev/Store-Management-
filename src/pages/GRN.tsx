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
import { Plus, Printer, Download } from "lucide-react";
import { GRN, GRNItem, Inward } from "../types";
import { genId, todayStr, exportToCSV } from "../utils";

export const GRNPage = () => {
  const {
    grns,
    setGrns,
    pos,
    inventory,
    setInventory,
    inwards,
    setInwards,
    role,
  } = useAppStore();
  const [modal, setModal] = useState(false);
  const [newGRN, setNewGRN] = useState<Partial<GRN>>({
    poId: "",
    challan: "",
    mrNo: "",
    docType: "Challan",
    items: [],
  });

  const approvedPOs = pos.filter((p) => p.status === "Approved");

  const handlePOSelect = (poId: string) => {
    const po = pos.find((p) => p.id === poId);
    if (!po) return;

    const items: GRNItem[] = po.items.map((i) => ({
      sku: i.sku,
      name: i.name,
      ordered: i.qty,
      received: i.qty,
      variance: 0,
    }));

    setNewGRN({
      ...newGRN,
      poId,
      project: po.project,
      vendor: po.vendor,
      items,
    });
  };

  const updateItem = (index: number, received: number) => {
    const items = [...(newGRN.items || [])];
    const item = { ...items[index], received };
    item.variance = item.received - item.ordered;
    items[index] = item;
    setNewGRN({ ...newGRN, items });
  };

  const handleCreate = () => {
    const grnId = genId("GRN", grns.length);
    const grn: GRN = {
      id: grnId,
      poId: newGRN.poId!,
      project: newGRN.project!,
      vendor: newGRN.vendor!,
      date: todayStr(),
      challan: newGRN.challan!,
      mrNo: newGRN.mrNo!,
      docType: newGRN.docType as any,
      items: newGRN.items!,
      status: "Confirmed",
    };

    // Update inventory and create inward entries
    const newInwards: Inward[] = [];

    setInventory((prev) => {
      const updated = [...prev];
      grn.items.forEach((item) => {
        const idx = updated.findIndex((i) => i.sku === item.sku);
        if (idx >= 0) {
          updated[idx] = {
            ...updated[idx],
            liveStock: updated[idx].liveStock + item.received,
          };
        }
        
        newInwards.push({
          id: `INW-${Date.now()}-${item.sku}`,
          sku: item.sku,
          name: item.name,
          qty: item.received,
          unit: updated[idx]?.unit || "NOS",
          receivingDate: grn.date,
          challanNo: grn.challan,
          mrNo: grn.mrNo,
          supplier: grn.vendor,
          inType: grn.docType as any,
          sentToOffice: "",
          currentStock: updated[idx]?.liveStock || 0,
          type: "GRN",
          grnRef: grn.id,
        });
      });
      return updated;
    });

    setInwards((prev) => [...newInwards, ...prev]);
    setGrns((prev) => [grn, ...prev]);
    setModal(false);
    setNewGRN({
      poId: "",
      challan: "",
      mrNo: "",
      docType: "Challan",
      items: [],
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Goods Receipt Note (GRN)"
        sub="Receive materials against approved POs"
        actions={
          <div className="flex items-center gap-2">
            <Btn
              label="Export CSV"
              icon={Download}
              outline
              onClick={() => exportToCSV(grns, "GRN")}
            />
            {(role === "Store Incharge" || role === "Super Admin") && (
              <Btn
                label="Create GRN"
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
                  GRN No.
                </th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                  PO Ref
                </th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                  Vendor
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
              {grns.map((grn) => (
                <tr key={grn.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 text-[13px] font-medium text-[#1A1A2E]">
                    {grn.id}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-[#6B7280]">
                    {grn.date}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-[#6B7280]">
                    {grn.poId}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-[#6B7280]">
                    {grn.vendor}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={grn.status} />
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    {role === "Super Admin" && (
                      <Btn
                        label="Delete"
                        color="red"
                        small
                        outline
                        onClick={() => {
                          if (confirm(`Delete GRN ${grn.id}?`)) {
                            setGrns((prev) => prev.filter(g => g.id !== grn.id));
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
              {grns.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-gray-500 text-[13px]"
                  >
                    No GRNs created yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {modal && (
        <Modal title="Create GRN" wide onClose={() => setModal(false)}>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <SField
              label="Select Approved PO"
              value={newGRN.poId}
              onChange={(e: any) => handlePOSelect(e.target.value)}
              options={approvedPOs.map((p) => ({
                value: p.id,
                label: `${p.id} - ${p.vendor}`,
              }))}
              required
            />
            <SField
              label="Document Type"
              value={newGRN.docType}
              onChange={(e: any) =>
                setNewGRN({ ...newGRN, docType: e.target.value })
              }
              options={[
                "Challan",
                "Invoice",
                "Bilty",
                "Gate Pass",
                "Without Challan",
                "Without Gate Pass",
              ]}
              required
            />
            <Field
              label="Challan / Invoice No."
              value={newGRN.challan}
              onChange={(e: any) =>
                setNewGRN({ ...newGRN, challan: e.target.value })
              }
              required
            />
            <Field
              label="Material Receipt (MR) No."
              value={newGRN.mrNo}
              onChange={(e: any) =>
                setNewGRN({ ...newGRN, mrNo: e.target.value })
              }
              required
            />
          </div>

          {newGRN.items && newGRN.items.length > 0 && (
            <div className="mb-6">
              <h3 className="text-[13px] font-bold text-[#1A1A2E] mb-3">
                Receipt Items
              </h3>
              <table className="w-full text-left border-collapse mb-4">
                <thead>
                  <tr className="bg-gray-50 border-b border-[#E8ECF0]">
                    <th className="px-2 py-2 text-[11px] font-bold text-[#6B7280] uppercase">
                      Item
                    </th>
                    <th className="px-2 py-2 text-[11px] font-bold text-[#6B7280] uppercase text-right w-24">
                      Ordered
                    </th>
                    <th className="px-2 py-2 text-[11px] font-bold text-[#6B7280] uppercase text-right w-24">
                      Received
                    </th>
                    <th className="px-2 py-2 text-[11px] font-bold text-[#6B7280] uppercase text-right w-24">
                      Variance
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8ECF0]">
                  {newGRN.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-2 py-2 text-[13px]">{item.name}</td>
                      <td className="px-2 py-2 text-[13px] font-medium text-right">
                        {item.ordered}
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          value={item.received}
                          onChange={(e) =>
                            updateItem(idx, Number(e.target.value))
                          }
                          className="w-full px-2 py-1 border rounded text-[13px] text-right"
                        />
                      </td>
                      <td
                        className={`px-2 py-2 text-[13px] font-bold text-right ${item.variance > 0 ? "text-blue-500" : item.variance < 0 ? "text-red-500" : "text-gray-500"}`}
                      >
                        {item.variance > 0
                          ? `+${item.variance}`
                          : item.variance}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t border-[#E8ECF0]">
            <Btn label="Cancel" outline onClick={() => setModal(false)} />
            <Btn
              label="Confirm GRN"
              onClick={handleCreate}
              disabled={!newGRN.poId || !newGRN.challan || !newGRN.mrNo}
              color="green"
            />
          </div>
        </Modal>
      )}
    </div>
  );
};
