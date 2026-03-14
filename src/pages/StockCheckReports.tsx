import React, { useState } from "react";
import { useAppStore } from "../store";
import { PageHeader, Card, Btn, Modal, SField } from "../components/ui";
import { ClipboardList, Download, Eye, Calendar, Edit2, Trash2 } from "lucide-react";
import { exportToCSV } from "../utils";
import { StockCheckRecord } from "../types";

export const StockCheckReports = () => {
  const { stockCheckRecords, setStockCheckRecords, role } = useAppStore();
  const [selectedRecord, setSelectedRecord] = useState<StockCheckRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<StockCheckRecord | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<StockCheckRecord | null>(null);
  const [filterDate, setFilterDate] = useState("");
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  const filteredRecords = filterDate
    ? stockCheckRecords.filter(r => r.date === filterDate)
    : stockCheckRecords;

  const handleDelete = () => {
    if (!recordToDelete) return;
    setStockCheckRecords(prev => prev.filter(r => r.id !== recordToDelete.id));
    setDeleteModal(false);
    setRecordToDelete(null);
  };

  const handleUpdate = () => {
    if (!editingRecord) return;
    setStockCheckRecords(prev => prev.map(r => r.id === editingRecord.id ? editingRecord : r));
    setEditModal(false);
    setEditingRecord(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock Check Reports"
        sub="View and export historical physical stock audit records"
        actions={
          <div className="flex gap-2">
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Btn
              label="Export All"
              icon={Download}
              outline
              onClick={() => exportToCSV(stockCheckRecords, "AllStockChecks")}
            />
          </div>
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
                  Category
                </th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                  Checked By
                </th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider text-right">
                  Items
                </th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider text-right">
                  Variances
                </th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8ECF0]">
              {filteredRecords.map((record) => {
                const variances = record.items.filter(i => i.variance !== 0).length;
                return (
                  <tr key={record.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-[13px] text-[#6B7280]">
                      {record.date}
                    </td>
                    <td className="px-4 py-3 text-[13px] font-medium text-[#1A1A2E]">
                      {record.category}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-[#6B7280]">
                      {record.checkedBy}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-right">
                      {record.items.length}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-right font-bold">
                      <span className={variances > 0 ? "text-red-500" : "text-green-500"}>
                        {variances}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <Btn
                        label="View"
                        icon={Eye}
                        small
                        outline
                        onClick={() => setSelectedRecord(record)}
                      />
                      {role === "Super Admin" && (
                        <>
                          <Btn
                            label="Edit"
                            icon={Edit2}
                            small
                            outline
                            onClick={() => {
                              setEditingRecord(record);
                              setEditModal(true);
                            }}
                          />
                          <Btn
                            label="Delete"
                            icon={Trash2}
                            small
                            outline
                            color="red"
                            onClick={() => {
                              setRecordToDelete(record);
                              setDeleteModal(true);
                            }}
                          />
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500 text-[13px]">
                    No stock check records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {selectedRecord && (
        <Modal
          title={`Audit Report: ${selectedRecord.category} (${selectedRecord.date})`}
          onClose={() => setSelectedRecord(null)}
          maxWidth="max-w-4xl"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-[10px] font-bold text-[#9CA3AF] uppercase mb-1">Date</p>
                <p className="text-[13px] font-bold text-[#1A1A2E]">{selectedRecord.date}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-[10px] font-bold text-[#9CA3AF] uppercase mb-1">Category</p>
                <p className="text-[13px] font-bold text-[#1A1A2E]">{selectedRecord.category}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-[10px] font-bold text-[#9CA3AF] uppercase mb-1">Checked By</p>
                <p className="text-[13px] font-bold text-[#1A1A2E]">{selectedRecord.checkedBy}</p>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-3 py-2 text-[11px] font-bold text-[#6B7280] uppercase">SKU</th>
                    <th className="px-3 py-2 text-[11px] font-bold text-[#6B7280] uppercase">Item</th>
                    <th className="px-3 py-2 text-[11px] font-bold text-[#6B7280] uppercase text-right">System</th>
                    <th className="px-3 py-2 text-[11px] font-bold text-[#6B7280] uppercase text-right">Physical</th>
                    <th className="px-3 py-2 text-[11px] font-bold text-[#6B7280] uppercase text-right">Variance</th>
                    <th className="px-3 py-2 text-[11px] font-bold text-[#6B7280] uppercase">Remark</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {selectedRecord.items.map((item) => (
                    <tr 
                      key={item.sku} 
                      className={item.variance !== 0 ? "bg-red-50/50" : "bg-green-50/50"}
                    >
                      <td className="px-3 py-2 text-[12px] font-mono text-[#6B7280]">{item.sku}</td>
                      <td className="px-3 py-2 text-[12px] font-medium text-[#1A1A2E]">{item.name}</td>
                      <td className="px-3 py-2 text-[12px] text-right">{item.systemQty}</td>
                      <td className="px-3 py-2 text-[12px] text-right font-bold">{item.physicalQty}</td>
                      <td className="px-3 py-2 text-[12px] text-right">
                        <span className={`font-bold ${item.variance > 0 ? "text-blue-500" : item.variance < 0 ? "text-red-500" : "text-green-500"}`}>
                          {item.variance > 0 ? `+${item.variance}` : item.variance}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-[12px] text-[#6B7280] italic">
                        {item.remark || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-2">
              <Btn
                label="Export CSV"
                icon={Download}
                outline
                onClick={() => exportToCSV(selectedRecord.items, `StockCheck_${selectedRecord.category}_${selectedRecord.date}`)}
              />
              <Btn label="Close" onClick={() => setSelectedRecord(null)} />
            </div>
          </div>
        </Modal>
      )}

      {editModal && editingRecord && (
        <Modal title="Edit Stock Check Report" onClose={() => setEditModal(false)}>
          <div className="space-y-4">
            <SField
              label="Date"
              type="date"
              value={editingRecord.date}
              onChange={(e: any) => setEditingRecord({ ...editingRecord, date: e.target.value })}
            />
            <SField
              label="Checked By"
              value={editingRecord.checkedBy}
              onChange={(e: any) => setEditingRecord({ ...editingRecord, checkedBy: e.target.value })}
            />
            <div className="flex justify-end gap-2 mt-6">
              <Btn label="Cancel" outline onClick={() => setEditModal(false)} />
              <Btn label="Save Changes" onClick={handleUpdate} />
            </div>
          </div>
        </Modal>
      )}

      {deleteModal && recordToDelete && (
        <Modal title="Confirm Delete" onClose={() => setDeleteModal(false)}>
          <div className="space-y-4">
            <p className="text-[13px] text-[#6B7280]">
              Are you sure you want to delete the stock check report for{" "}
              <span className="font-bold text-[#1A1A2E]">{recordToDelete.category}</span> on{" "}
              <span className="font-bold text-[#1A1A2E]">{recordToDelete.date}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 mt-6">
              <Btn label="Cancel" outline onClick={() => setDeleteModal(false)} />
              <Btn label="Delete Report" color="red" onClick={handleDelete} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
