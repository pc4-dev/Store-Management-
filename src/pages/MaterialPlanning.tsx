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
import { Plus, Search, AlertTriangle } from "lucide-react";
import { MaterialPlan, PlanLineItem } from "../types";
import { genId, todayStr } from "../utils";
import { PROJECTS, WORK_TYPES } from "../data";

export const MaterialPlanning = () => {
  const { plans, setPlans, role, inventory } = useAppStore();
  const [modal, setModal] = useState(false);
  const [newPlan, setNewPlan] = useState<Partial<MaterialPlan>>({
    project: "",
    milestone: "",
    workType: "",
    items: [],
  });
  const [searchItem, setSearchItem] = useState("");

  const handleCreate = () => {
    const plan: MaterialPlan = {
      id: genId("MP", plans.length),
      project: newPlan.project!,
      milestone: newPlan.milestone!,
      workType: newPlan.workType!,
      date: todayStr(),
      status: "Open",
      items: newPlan.items!,
    };
    setPlans([plan, ...plans]);
    setModal(false);
    setNewPlan({ project: "", milestone: "", workType: "", items: [] });
  };

  const addItem = (invItem: any) => {
    const reusable = inventory
      .filter(
        (i) =>
          i.sku === invItem.sku &&
          ["Good", "Needs Repair"].includes(i.condition),
      )
      .reduce((sum, i) => sum + i.liveStock, 0);

    const item: PlanLineItem = {
      sku: invItem.sku,
      name: invItem.name,
      required: 1,
      unit: invItem.unit,
      available: invItem.liveStock,
      reusable,
      shortage: Math.max(0, 1 - invItem.liveStock),
      priority: "Medium",
      delivery: todayStr(),
      activity: "",
    };
    setNewPlan({ ...newPlan, items: [...(newPlan.items || []), item] });
    setSearchItem("");
  };

  const updateItem = (index: number, field: string, value: any) => {
    const items = [...(newPlan.items || [])];
    const item = { ...items[index], [field]: value };
    if (field === "required") {
      item.shortage = Math.max(0, item.required - item.available);
    }
    items[index] = item;
    setNewPlan({ ...newPlan, items });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Material Planning"
        sub="Plan materials for upcoming project milestones"
        actions={
          role === "Project Manager" && (
            <Btn label="New Plan" icon={Plus} onClick={() => setModal(true)} />
          )
        }
      />

      <div className="space-y-4">
        {plans.map((plan) => (
          <Card key={plan.id} className="p-0 overflow-hidden">
            <div className="p-4 border-b border-[#E8ECF0] bg-gray-50 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-[14px] font-bold text-[#1A1A2E]">
                    {plan.id}
                  </h3>
                  <StatusBadge status={plan.status} />
                </div>
                <p className="text-[13px] text-[#6B7280]">
                  {plan.project} • {plan.workType} • {plan.milestone}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-bold text-[#6B7280] uppercase">
                  Date
                </p>
                <p className="text-[13px] font-medium text-[#1A1A2E]">
                  {plan.date}
                </p>
              </div>
            </div>
            <div className="p-4 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E8ECF0]">
                    <th className="px-2 py-2 text-[11px] font-bold text-[#6B7280] uppercase">
                      Item
                    </th>
                    <th className="px-2 py-2 text-[11px] font-bold text-[#6B7280] uppercase text-right">
                      Required
                    </th>
                    <th className="px-2 py-2 text-[11px] font-bold text-[#6B7280] uppercase text-right">
                      Available
                    </th>
                    <th className="px-2 py-2 text-[11px] font-bold text-[#6B7280] uppercase text-right">
                      Shortage
                    </th>
                    <th className="px-2 py-2 text-[11px] font-bold text-[#6B7280] uppercase">
                      Priority
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8ECF0]">
                  {plan.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-2 py-2 text-[13px]">{item.name}</td>
                      <td className="px-2 py-2 text-[13px] font-medium text-right">
                        {item.required} {item.unit}
                      </td>
                      <td className="px-2 py-2 text-[13px] text-right">
                        {item.available}
                        {item.reusable > 0 && (
                          <span
                            className="ml-1 text-blue-500"
                            title="Includes reusable stock"
                          >
                            ({item.reusable} R)
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-2 text-[13px] font-bold text-right text-[#EF4444]">
                        {item.shortage > 0 ? item.shortage : "-"}
                      </td>
                      <td className="px-2 py-2 text-[13px]">{item.priority}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ))}
        {plans.length === 0 && (
          <div className="text-center py-12 text-gray-500 text-[13px]">
            No material plans created yet.
          </div>
        )}
      </div>

      {modal && (
        <Modal
          title="Create Material Plan"
          wide
          onClose={() => setModal(false)}
        >
          <div className="grid grid-cols-3 gap-4 mb-6">
            <SField
              label="Project"
              value={newPlan.project}
              onChange={(e: any) =>
                setNewPlan({ ...newPlan, project: e.target.value })
              }
              options={PROJECTS}
              required
            />
            <Field
              label="Milestone"
              value={newPlan.milestone}
              onChange={(e: any) =>
                setNewPlan({ ...newPlan, milestone: e.target.value })
              }
              required
            />
            <SField
              label="Work Type"
              value={newPlan.workType}
              onChange={(e: any) =>
                setNewPlan({ ...newPlan, workType: e.target.value })
              }
              options={WORK_TYPES}
              required
            />
          </div>

          <div className="mb-6">
            <h3 className="text-[13px] font-bold text-[#1A1A2E] mb-3">
              Plan Items
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
                      i.name.toLowerCase().includes(searchItem.toLowerCase()),
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

            {newPlan.items && newPlan.items.length > 0 && (
              <table className="w-full text-left border-collapse mb-4">
                <thead>
                  <tr className="bg-gray-50 border-b border-[#E8ECF0]">
                    <th className="px-2 py-2 text-[11px] font-bold text-[#6B7280] uppercase">
                      Item
                    </th>
                    <th className="px-2 py-2 text-[11px] font-bold text-[#6B7280] uppercase w-24">
                      Required
                    </th>
                    <th className="px-2 py-2 text-[11px] font-bold text-[#6B7280] uppercase w-24">
                      Priority
                    </th>
                    <th className="px-2 py-2 text-[11px] font-bold text-[#6B7280] uppercase">
                      Activity
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8ECF0]">
                  {newPlan.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-2 py-2 text-[13px]">
                        {item.name}
                        {item.reusable > 0 && (
                          <div className="text-[11px] text-blue-600 flex items-center gap-1 mt-1">
                            <AlertTriangle className="w-3 h-3" />{" "}
                            {item.reusable} reusable in stock
                          </div>
                        )}
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          value={item.required}
                          onChange={(e) =>
                            updateItem(idx, "required", Number(e.target.value))
                          }
                          className="w-full px-2 py-1 border rounded text-[13px]"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <select
                          value={item.priority}
                          onChange={(e) =>
                            updateItem(idx, "priority", e.target.value)
                          }
                          className="w-full px-2 py-1 border rounded text-[13px]"
                        >
                          <option value="High">High</option>
                          <option value="Medium">Medium</option>
                          <option value="Low">Low</option>
                        </select>
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="text"
                          value={item.activity}
                          onChange={(e) =>
                            updateItem(idx, "activity", e.target.value)
                          }
                          placeholder="e.g. Slab casting"
                          className="w-full px-2 py-1 border rounded text-[13px]"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-[#E8ECF0]">
            <Btn label="Cancel" outline onClick={() => setModal(false)} />
            <Btn
              label="Create Plan"
              onClick={handleCreate}
              disabled={!newPlan.project || newPlan.items?.length === 0}
            />
          </div>
        </Modal>
      )}
    </div>
  );
};
