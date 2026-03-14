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
import { Plus, Search, Image as ImageIcon, Check, Download } from "lucide-react";
import { CatalogueEntry } from "../types";
import { exportToCSV } from "../utils";

export const Catalogue = () => {
  const { catalogue, setCatalogue, inventory, role } = useAppStore();
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [newEntry, setNewEntry] = useState<Partial<CatalogueEntry>>({
    sku: "",
    brand: "",
    specs: "",
    location: "",
    minStock: 0,
    image: "",
    status: "Draft",
  });

  const filtered = catalogue.filter((c) => {
    const inv = inventory.find((i) => i.sku === c.sku);
    return (
      inv?.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.sku?.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleCreate = () => {
    const entry: CatalogueEntry = {
      sku: newEntry.sku!,
      brand: newEntry.brand!,
      specs: newEntry.specs!,
      location: newEntry.location!,
      minStock: Number(newEntry.minStock),
      image: newEntry.image || "",
      status: "Draft",
    };
    setCatalogue((prev) => [entry, ...prev]);
    setModal(false);
    setNewEntry({
      sku: "",
      brand: "",
      specs: "",
      location: "",
      minStock: 0,
      image: "",
      status: "Draft",
    });
  };

  const handleApprove = (sku: string) => {
    setCatalogue((prev) =>
      prev.map((c) => (c.sku === sku ? { ...c, status: "Approved" } : c)),
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewEntry({ ...newEntry, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Product Catalogue"
        sub="Detailed product specifications and images"
        actions={
          <div className="flex items-center gap-2">
            <Btn
              label="Export CSV"
              icon={Download}
              outline
              onClick={() => exportToCSV(catalogue, "Catalogue")}
            />
            <Btn label="Add Entry" icon={Plus} onClick={() => setModal(true)} />
          </div>
        }
      />

      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search catalogue..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-[#E8ECF0] rounded-lg text-[13px] focus:outline-none focus:border-[#F97316]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map((cat) => {
          const inv = inventory.find((i) => i.sku === cat.sku);
          if (!inv) return null;

          return (
            <Card key={cat.sku} className="overflow-hidden flex flex-col">
              <div className="h-48 bg-gray-100 flex items-center justify-center relative border-b border-[#E8ECF0]">
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={inv.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-12 h-12 text-gray-300" />
                )}
                <div className="absolute top-3 right-3">
                  <StatusBadge status={cat.status} />
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-[14px] font-bold text-[#1A1A2E] leading-tight">
                    {inv.name}
                  </h3>
                  <span className="text-[11px] font-mono text-[#6B7280] bg-gray-100 px-1.5 py-0.5 rounded shrink-0">
                    {cat.sku}
                  </span>
                </div>
                <p className="text-[13px] text-[#6B7280] mb-4 flex-1">
                  {cat.specs}
                </p>

                <div className="grid grid-cols-2 gap-2 mb-4 pt-4 border-t border-[#E8ECF0]">
                  <div>
                    <p className="text-[10px] font-bold text-[#9CA3AF] uppercase">
                      Brand
                    </p>
                    <p className="text-[13px] font-medium text-[#1A1A2E] truncate">
                      {cat.brand}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#9CA3AF] uppercase">
                      Location
                    </p>
                    <p className="text-[13px] font-medium text-[#1A1A2E] truncate">
                      {cat.location}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#9CA3AF] uppercase">
                      Live Stock
                    </p>
                    <p
                      className={`text-[13px] font-bold ${inv.liveStock <= cat.minStock ? "text-[#EF4444]" : "text-[#10B981]"}`}
                    >
                      {inv.liveStock} {inv.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#9CA3AF] uppercase">
                      Min Stock
                    </p>
                    <p className="text-[13px] font-medium text-[#1A1A2E]">
                      {cat.minStock} {inv.unit}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 mt-auto">
                  {role === "Super Admin" && cat.status === "Draft" && (
                    <Btn
                      label="Approve"
                      icon={Check}
                      color="green"
                      small
                      onClick={() => handleApprove(cat.sku)}
                      className="flex-1"
                    />
                  )}
                  {role === "Super Admin" && (
                    <Btn
                      label="Delete"
                      color="red"
                      small
                      outline
                      onClick={() => {
                        if (confirm(`Delete catalogue entry for ${inv.name}?`)) {
                          setCatalogue((prev) => prev.filter(c => c.sku !== cat.sku));
                        }
                      }}
                      className={cat.status === "Draft" ? "" : "w-full"}
                    />
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {modal && (
        <Modal title="Add Catalogue Entry" onClose={() => setModal(false)}>
          <div className="space-y-4">
            <SField
              label="Select Item"
              value={newEntry.sku}
              onChange={(e: any) =>
                setNewEntry({ ...newEntry, sku: e.target.value })
              }
              options={inventory
                .filter((i) => !catalogue.find((c) => c.sku === i.sku))
                .map((i) => ({ value: i.sku, label: `${i.name} (${i.sku})` }))}
              required
            />
            <Field
              label="Brand"
              value={newEntry.brand}
              onChange={(e: any) =>
                setNewEntry({ ...newEntry, brand: e.target.value })
              }
              required
            />
            <div className="mb-4">
              <label className="block text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">
                Specifications
              </label>
              <textarea
                value={newEntry.specs}
                onChange={(e) =>
                  setNewEntry({ ...newEntry, specs: e.target.value })
                }
                className="w-full px-3 py-2 border border-[#E8ECF0] rounded-lg text-[13px] focus:outline-none focus:border-[#F97316]"
                rows={3}
              />
            </div>
            <Field
              label="Storage Location"
              value={newEntry.location}
              onChange={(e: any) =>
                setNewEntry({ ...newEntry, location: e.target.value })
              }
              required
            />
            <Field
              label="Minimum Stock Level (Reorder Point)"
              type="number"
              value={newEntry.minStock}
              onChange={(e: any) =>
                setNewEntry({ ...newEntry, minStock: e.target.value })
              }
              required
            />

            <div className="mb-4">
              <label className="block text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">
                Product Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full text-[13px]"
              />
              {newEntry.image && (
                <div className="mt-2 h-32 w-32 rounded-lg overflow-hidden border border-[#E8ECF0]">
                  <img
                    src={newEntry.image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Btn label="Cancel" outline onClick={() => setModal(false)} />
              <Btn
                label="Save as Draft"
                onClick={handleCreate}
                disabled={
                  !newEntry.sku || !newEntry.brand || !newEntry.location
                }
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
