import React from "react";
import { useAppStore } from "../store";
import { PageHeader, Card, StatusBadge, Btn } from "../components/ui";
import { Check, X, Download } from "lucide-react";
import { exportToCSV } from "../utils";

export const WriteOffPage = () => {
  const { writeOffs, setWriteOffs, inventory, setInventory, role } =
    useAppStore();

  const handleApprove = (id: string) => {
    const wo = writeOffs.find((w) => w.id === id);
    if (!wo) return;

    // Deduct from live stock permanently
    const updatedInventory = [...inventory];
    const invIdx = updatedInventory.findIndex((i) => i.sku === wo.sku);
    if (invIdx >= 0) {
      updatedInventory[invIdx] = {
        ...updatedInventory[invIdx],
        liveStock: Math.max(0, updatedInventory[invIdx].liveStock - wo.qty),
      };
      setInventory(updatedInventory);
    }

    setWriteOffs(
      writeOffs.map((w) => (w.id === id ? { ...w, status: "Approved" } : w)),
    );
  };

  const handleReject = (id: string) => {
    // Does not deduct stock, item remains in inventory (should be re-tagged)
    setWriteOffs(
      writeOffs.map((w) => (w.id === id ? { ...w, status: "Rejected" } : w)),
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Write-off Approvals"
        sub="Review and approve damaged or lost inventory write-offs"
        actions={
          <Btn
            label="Export CSV"
            icon={Download}
            outline
            onClick={() => exportToCSV(writeOffs, "WriteOffs")}
          />
        }
      />

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-[#E8ECF0]">
                <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                  Ref No.
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
                  Reason
                </th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                  Requested By
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
              {writeOffs.map((wo) => (
                <tr key={wo.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 text-[13px] font-medium text-[#1A1A2E]">
                    {wo.id}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-[#6B7280]">
                    {wo.date}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-[#1A1A2E]">
                    {wo.name}{" "}
                    <span className="text-[11px] text-[#6B7280] block font-mono">
                      {wo.sku}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[13px] font-bold text-right text-[#EF4444]">
                    {wo.qty} {wo.unit}
                  </td>
                  <td
                    className="px-4 py-3 text-[13px] text-[#6B7280] max-w-xs truncate"
                    title={wo.reason}
                  >
                    {wo.reason}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-[#6B7280]">
                    {wo.requestedBy}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={wo.status} />
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    {["AGM", "Director", "Super Admin"].includes(role || "") &&
                      wo.status === "Pending" && (
                        <>
                          <Btn
                            icon={Check}
                            small
                            color="green"
                            onClick={() => handleApprove(wo.id)}
                          />
                          <Btn
                            icon={X}
                            small
                            color="red"
                            outline
                            onClick={() => handleReject(wo.id)}
                          />
                        </>
                      )}
                    {role === "Super Admin" && (
                      <Btn
                        label="Delete"
                        color="red"
                        small
                        outline
                        onClick={() => {
                          if (confirm(`Delete write-off request ${wo.id}?`)) {
                            setWriteOffs(writeOffs.filter(w => w.id !== wo.id));
                          }
                        }}
                      />
                    )}
                  </td>
                </tr>
              ))}
              {writeOffs.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-gray-500 text-[13px]"
                  >
                    No write-off requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
