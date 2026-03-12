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
import { Plus } from "lucide-react";
import { Vendor } from "../types";

export const Vendors = () => {
  const { vendors, setVendors, role } = useAppStore();
  const [modal, setModal] = useState(false);
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
    setVendors([vendor, ...vendors]);
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendor Database"
        sub="Manage suppliers and contractors"
        actions={
          canEdit && (
            <Btn
              label="Add Vendor"
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
                    <td className="px-4 py-3 text-right">
                      <Btn
                        label="Delete"
                        color="red"
                        small
                        outline
                        onClick={() => {
                          if (confirm(`Delete vendor ${v.name}?`)) {
                            setVendors(vendors.filter(vendor => vendor.id !== v.id));
                          }
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
    </div>
  );
};
