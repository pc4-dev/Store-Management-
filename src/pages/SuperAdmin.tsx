import React, { useState, useEffect } from "react";
import { useAppStore } from "../store";
import { PageHeader, Card, Btn, StatusBadge, Field, SField, Modal } from "../components/ui";
import { ShieldAlert, Settings, Users, FileText, Plus, UserPlus, Key, Trash2, Package, BookOpen, ShoppingCart, Database } from "lucide-react";
import { fmtCur } from "../utils";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export const SuperAdmin = () => {
  const { pos, setPos, settings, setSettings, inventory, vendors, catalogue, setInventory, setCatalogue, setVendors } = useAppStore();
  const [tab, setTab] = useState("overview");
  const [users, setUsers] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [userModal, setUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "Store Incharge",
  });

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const userList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(userList);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "form_submissions"));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSubmissions(data);
    } catch (err) {
      console.error("Error fetching submissions:", err);
    }
  };

  useEffect(() => {
    if (tab === "users") {
      fetchUsers();
    }
    if (tab === "data") {
      fetchSubmissions();
    }
  }, [tab]);

  const handleCreateUser = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      const data = await response.json();
      if (data.success) {
        alert("User created successfully!");
        setUserModal(false);
        setNewUser({ name: "", email: "", password: "", role: "Store Incharge" });
        fetchUsers();
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  const handleSeedData = async () => {
    if (!confirm("This will add sample records to your database. Continue?")) return;
    setLoading(true);
    try {
      const sampleCatalogue = [
        { sku: "SKU001", itemName: "Cement Grade A", category: "Building Material", unit: "Bags", minStock: 50 },
        { sku: "SKU002", itemName: "Steel Rod 12mm", category: "Hardware", unit: "Tons", minStock: 5 },
      ];
      const sampleInventory = [
        { sku: "SKU001", itemName: "Cement Grade A", liveStock: 120, condition: "Good", location: "Warehouse A", lastUpdated: new Date().toISOString() },
        { sku: "SKU002", itemName: "Steel Rod 12mm", liveStock: 2, condition: "Good", location: "Site B", lastUpdated: new Date().toISOString() },
      ];
      const sampleVendors = [
        { id: "V001", name: "UltraTech Cement", contact: "9876543210", category: "Building Material", rating: 4.5 },
      ];
      const samplePOs = [
        { id: "PO-2024-001", project: "Garden City Phase 1", vendor: "UltraTech Cement", totalValue: 45000, status: "Pending L1", createdAt: new Date().toISOString() },
      ];

      setCatalogue((prev) => sampleCatalogue as any);
      setInventory((prev) => sampleInventory as any);
      setVendors((prev) => sampleVendors as any);
      setPos((prev) => samplePOs as any);

      alert("Sample data seeded successfully! Check your dashboard now.");
    } catch (err) {
      console.error(err);
      alert("Failed to seed data");
    } finally {
      setLoading(false);
    }
  };

  const totalValue = pos.reduce((sum, p) => sum + p.totalValue, 0);
  const pendingPOs = pos.filter((p) =>
    ["Pending L1", "Pending L2"].includes(p.status),
  );

  const handleForceApprove = (id: string) => {
    setPos((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status: "Approved",
              approvalL1: "Approved",
              approvalL2: "Approved",
            }
          : p,
      ),
    );
  };

  const handleBlock = (id: string) => {
    setPos((prev) => prev.map((p) => (p.id === id ? { ...p, status: "Blocked" } : p)));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Super Admin Panel"
        sub="System configuration and overrides"
        actions={
          <Btn label="Seed Sample Data" icon={Plus} outline onClick={handleSeedData} disabled={loading} />
        }
      />

      <div className="flex gap-2 border-b border-[#E8ECF0] mb-6">
        {[
          { id: "overview", label: "Overview", icon: FileText },
          { id: "overrides", label: "Override Approvals", icon: ShieldAlert },
          { id: "settings", label: "System Settings", icon: Settings },
          { id: "users", label: "User & Role Mgmt", icon: Users },
          { id: "data", label: "System Data", icon: Database },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-3 text-[13px] font-bold uppercase tracking-wider transition-colors border-b-2 ${tab === t.id ? "border-[#6D28D9] text-[#6D28D9]" : "border-transparent text-[#6B7280] hover:text-[#1A1A2E]"}`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 bg-gradient-to-br from-[#6D28D9] to-[#4C1D95] text-white border-none shadow-xl shadow-purple-900/20">
              <h3 className="text-[13px] font-bold uppercase tracking-wider text-purple-200 mb-2">
                Total PO Value (All Projects)
              </h3>
              <p className="text-4xl font-extrabold">{fmtCur(totalValue)}</p>
            </Card>

            <Card className="p-6">
              <h3 className="text-[13px] font-bold uppercase tracking-wider text-[#6B7280] mb-2">
                Pending Approvals
              </h3>
              <p className="text-4xl font-extrabold text-[#1A1A2E]">
                {pendingPOs.length}
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-[13px] font-bold uppercase tracking-wider text-[#6B7280] mb-2">
                Auto-Approve Threshold
              </h3>
              <p className="text-4xl font-extrabold text-[#1A1A2E]">
                {fmtCur(settings.poThreshold)}
              </p>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total SKUs" value={inventory.length} icon={Package} color="blue" />
            <StatCard label="Catalogue Items" value={catalogue.length} icon={BookOpen} color="green" />
            <StatCard label="Registered Vendors" value={vendors.length} icon={Users} color="purple" />
            <StatCard label="Total POs" value={pos.length} icon={ShoppingCart} color="orange" />
          </div>
        </div>
      )}

      {tab === "overrides" && (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-[#E8ECF0]">
                  <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                    PO No.
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                    Project
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
                      {po.project}
                    </td>
                    <td className="px-4 py-3 text-[13px] font-bold text-right">
                      {fmtCur(po.totalValue)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={po.status} />
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      {po.status !== "Approved" && po.status !== "Blocked" && (
                        <>
                          <Btn
                            label="Force Approve"
                            small
                            color="purple"
                            onClick={() => handleForceApprove(po.id)}
                          />
                          <Btn
                            label="Block"
                            small
                            color="red"
                            outline
                            onClick={() => handleBlock(po.id)}
                          />
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === "settings" && (
        <Card className="p-6 max-w-2xl">
          <h3 className="text-[16px] font-bold text-[#1A1A2E] mb-6">
            System Configuration
          </h3>
          <div className="space-y-4">
            <Field
              label="PO Auto-Approve Threshold (₹)"
              type="number"
              value={settings.poThreshold}
              onChange={(e: any) =>
                setSettings({
                  ...settings,
                  poThreshold: Number(e.target.value),
                })
              }
            />
            <Field
              label="Min Vendor Quotes (Low Value)"
              type="number"
              value={settings.minQuotesLow}
              onChange={(e: any) =>
                setSettings({
                  ...settings,
                  minQuotesLow: Number(e.target.value),
                })
              }
            />
            <Field
              label="Min Vendor Quotes (High Value)"
              type="number"
              value={settings.minQuotesHigh}
              onChange={(e: any) =>
                setSettings({
                  ...settings,
                  minQuotesHigh: Number(e.target.value),
                })
              }
            />
            <div className="pt-4">
              <Btn label="Save Settings" color="purple" />
            </div>
          </div>
        </Card>
      )}

      {tab === "users" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-[16px] font-bold text-[#1A1A2E]">User Management</h3>
            <Btn label="Create User" icon={UserPlus} color="purple" onClick={() => setUserModal(true)} />
          </div>

          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-[#E8ECF0]">
                    <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Role</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8ECF0]">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 text-[13px] font-medium text-[#1A1A2E]">{u.name}</td>
                      <td className="px-4 py-3 text-[13px] text-[#6B7280]">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${u.role === "Super Admin" ? "bg-purple-100 text-purple-700" : "bg-orange-100 text-orange-700"}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button className="text-[#6B7280] hover:text-[#6D28D9] transition-colors" title="Reset Password">
                          <Key className="w-4 h-4" />
                        </button>
                        <button className="text-[#6B7280] hover:text-red-600 transition-colors" title="Delete User">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {userModal && (
            <Modal title="Create New User" onClose={() => setUserModal(false)}>
              <div className="space-y-4">
                <Field
                  label="Full Name"
                  value={newUser.name}
                  onChange={(e: any) => setNewUser({ ...newUser, name: e.target.value })}
                  required
                />
                <Field
                  label="Email Address"
                  type="email"
                  value={newUser.email}
                  onChange={(e: any) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                />
                <Field
                  label="Password"
                  type="password"
                  value={newUser.password}
                  onChange={(e: any) => setNewUser({ ...newUser, password: e.target.value })}
                  required
                />
                <SField
                  label="System Role"
                  value={newUser.role}
                  onChange={(e: any) => setNewUser({ ...newUser, role: e.target.value })}
                  options={[
                    "Super Admin",
                    "Director",
                    "AGM",
                    "Project Manager",
                    "Store Incharge",
                  ]}
                  required
                />
                <div className="flex justify-end gap-2 mt-6">
                  <Btn label="Cancel" outline onClick={() => setUserModal(false)} />
                  <Btn label="Create User" color="purple" onClick={handleCreateUser} disabled={loading} />
                </div>
              </div>
            </Modal>
          )}
        </div>
      )}

      {tab === "data" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "Inventory", coll: "inventory", id: "SKU", count: inventory.length },
              { name: "Catalogue", coll: "catalogue", id: "SKU", count: catalogue.length },
              { name: "Vendors", coll: "vendors", id: "ID", count: vendors.length },
              { name: "Purchase Orders", coll: "pos", id: "ID", count: pos.length },
              { name: "Form Submissions", coll: "form_submissions", id: "ID", count: submissions.length },
            ].map((item) => (
              <Card key={item.coll} className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-sm font-bold text-[#1A1A2E]">{item.name}</h2>
                  <span className="text-[11px] font-bold text-[#6D28D9] bg-purple-50 px-2 py-0.5 rounded-full">
                    {item.count} Records
                  </span>
                </div>
                <p className="text-[12px] text-[#6B7280] mb-2">
                  Collection: <code>{item.coll}</code> <br/>
                  Key: <code>{item.id}</code>
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-green-600 font-bold uppercase tracking-wider">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Real-time Sync Active
                </div>
              </Card>
            ))}
          </div>

          <Card className="overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E8ECF0] flex justify-between items-center">
              <h2 className="text-lg font-bold text-[#1A1A2E]">Recent Form Submissions</h2>
              <Btn label="Refresh" icon={Plus} small outline onClick={fetchSubmissions} />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-[#E8ECF0]">
                    <th className="px-6 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Message</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8ECF0]">
                  {submissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-[13px] font-medium text-[#1A1A2E]">{sub.name}</td>
                      <td className="px-6 py-4 text-[13px] text-[#6B7280]">{sub.email}</td>
                      <td className="px-6 py-4 text-[13px] text-[#6B7280] max-w-xs truncate">{sub.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color }: any) => {
  const colors: any = {
    blue: "text-blue-600 bg-blue-50",
    green: "text-green-600 bg-green-50",
    purple: "text-purple-600 bg-purple-50",
    orange: "text-orange-600 bg-orange-50",
  };

  return (
    <Card className="p-4 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h3 className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">{label}</h3>
        <p className="text-xl font-extrabold text-[#1A1A2E]">{value}</p>
      </div>
    </Card>
  );
};
