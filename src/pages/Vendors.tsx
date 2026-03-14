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
import { Plus, Download } from "lucide-react";
import { Vendor } from "../types";
import { exportToCSV } from "../utils";

export const Vendors = () => {
  const { vendors, setVendors, role } = useAppStore();
  const [modal, setModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null);
  const [newVendor, setNewVendor] = useState<Partial<Vendor>>({
    name: "",
    contact: "",
    phone: "",
    category: "",
    gst: "",
    status: "Active",
  });

  const canEdit = ["Super Admin", "Director", "AGM"].includes(role || "");

  const handleCreate = () => {
    const vendor: Vendor = {
      id: `V${String(vendors.length + 1).padStart(3, "0")}`,
      name: newVendor.name!,
      contact: newVendor.contact!,
      phone: newVendor.phone!,
      category: newVendor.category!,
      gst: newVendor.gst!,
      status: newVendor.status as "Active" | "Inactive",
    };
    setVendors((prev) => [vendor, ...prev]);
    setModal(false);
    setNewVendor({
      name: "",
      contact: "",
      phone: "",
      category: "",
      gst: "",
      status: "Active",
    });
  };

  const handleUpdate = () => {
    if (!editingVendor) return;
    setVendors((prev) =>
      prev.map((v) => (v.id === editingVendor.id ? editingVendor : v)),
    );
    setEditModal(false);
    setEditingVendor(null);
  };

  const handleDelete = () => {
    if (!vendorToDelete) return;
    setVendors((prev) => prev.filter((v) => v.id !== vendorToDelete.id));
    setDeleteModal(false);
    setVendorToDelete(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendor Database"
        sub="Manage suppliers and contractors"
        actions={
          <div className="flex items-center gap-2">
            <Btn
              label="Export CSV"
              icon={Download}
              outline
              onClick={() => exportToCSV(vendors, "Vendors")}
            />
            {canEdit && (
              <Btn
                label="Add Vendor"
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
                  ID
                </th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                  GST
                </th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                  Status
                </th>
                {role === "Super Admin" && (
                  <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider text-right">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8ECF0]">
              {vendors.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 text-[13px] font-mono text-[#6B7280]">
                    {v.id}
                  </td>
                  <td className="px-4 py-3 text-[13px] font-medium text-[#1A1A2E]">
                    {v.name}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-[#6B7280]">
                    {v.contact}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-[#6B7280]">
                    {v.phone}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-[#6B7280]">
                    {v.category}
                  </td>
                  <td className="px-4 py-3 text-[13px] font-mono text-[#6B7280]">
                    {v.gst}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={v.status} />
                  </td>
                  {role === "Super Admin" && (
                    <td className="px-4 py-3 text-right space-x-2">
                      <Btn
                        label="Edit"
                        small
                        outline
                        onClick={() => {
                          setEditingVendor(v);
                          setEditModal(true);
                        }}
                      />
                      <Btn
                        label="Delete"
                        color="red"
                        small
                        outline
                        onClick={() => {
                          setVendorToDelete(v);
                          setDeleteModal(true);
                        }}
                      />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {modal && (
        <Modal title="Add Vendor" onClose={() => setModal(false)}>
          <div className="space-y-4">
            <Field
              label="Company Name"
              value={newVendor.name}
              onChange={(e: any) =>
                setNewVendor({ ...newVendor, name: e.target.value })
              }
              required
            />
            <Field
              label="Contact Person"
              value={newVendor.contact}
              onChange={(e: any) =>
                setNewVendor({ ...newVendor, contact: e.target.value })
              }
              required
            />
            <Field
              label="Phone Number"
              value={newVendor.phone}
              onChange={(e: any) =>
                setNewVendor({ ...newVendor, phone: e.target.value })
              }
              required
            />
            <SField
              label="Category"
              value={newVendor.category}
              onChange={(e: any) =>
                setNewVendor({ ...newVendor, category: e.target.value })
              }
              options={[
                "Construction",
                "Electrical",
                "Plumbing",
                "Hardware",
                "Oil",
                "Miscellaneous",
              ]}
              required
            />
            <Field
              label="GST Number"
              value={newVendor.gst}
              onChange={(e: any) =>
                setNewVendor({ ...newVendor, gst: e.target.value })
              }
            />
            <SField
              label="Status"
              value={newVendor.status}
              onChange={(e: any) =>
                setNewVendor({ ...newVendor, status: e.target.value })
              }
              options={["Active", "Inactive"]}
              required
            />
            <div className="flex justify-end gap-2 mt-6">
              <Btn label="Cancel" outline onClick={() => setModal(false)} />
              <Btn
                label="Save Vendor"
                onClick={handleCreate}
                disabled={
                  !newVendor.name || !newVendor.phone || !newVendor.category
                }
              />
            </div>
          </div>
        </Modal>
      )}

      {editModal && editingVendor && (
        <Modal title="Edit Vendor" onClose={() => setEditModal(false)}>
          <div className="space-y-4">
            <Field
              label="Company Name"
              value={editingVendor.name}
              onChange={(e: any) =>
                setEditingVendor({ ...editingVendor, name: e.target.value })
              }
              required
            />
            <Field
              label="Contact Person"
              value={editingVendor.contact}
              onChange={(e: any) =>
                setEditingVendor({ ...editingVendor, contact: e.target.value })
              }
              required
            />
            <Field
              label="Phone Number"
              value={editingVendor.phone}
              onChange={(e: any) =>
                setEditingVendor({ ...editingVendor, phone: e.target.value })
              }
              required
            />
            <SField
              label="Category"
              value={editingVendor.category}
              onChange={(e: any) =>
                setEditingVendor({ ...editingVendor, category: e.target.value })
              }
              options={[
                "Construction",
                "Electrical",
                "Plumbing",
                "Hardware",
                "Oil",
                "Miscellaneous",
              ]}
              required
            />
            <Field
              label="GST Number"
              value={editingVendor.gst}
              onChange={(e: any) =>
                setEditingVendor({ ...editingVendor, gst: e.target.value })
              }
            />
            <SField
              label="Status"
              value={editingVendor.status}
              onChange={(e: any) =>
                setEditingVendor({
                  ...editingVendor,
                  status: e.target.value as "Active" | "Inactive",
                })
              }
              options={["Active", "Inactive"]}
              required
            />
            <div className="flex justify-end gap-2 mt-6">
              <Btn
                label="Cancel"
                outline
                onClick={() => setEditModal(false)}
              />
              <Btn
                label="Update Vendor"
                onClick={handleUpdate}
                disabled={
                  !editingVendor.name ||
                  !editingVendor.phone ||
                  !editingVendor.category
                }
              />
            </div>
          </div>
        </Modal>
      )}

      {deleteModal && vendorToDelete && (
        <Modal title="Confirm Delete" onClose={() => setDeleteModal(false)}>
          <div className="p-4">
            <p className="text-[14px] text-gray-600 mb-6">
              Are you sure you want to delete vendor{" "}
              <span className="font-bold text-[#1A1A2E]">
                {vendorToDelete.name}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Btn
                label="Cancel"
                outline
                onClick={() => setDeleteModal(false)}
              />
              <Btn label="Delete Vendor" color="red" onClick={handleDelete} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
