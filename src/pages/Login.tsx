import React from "react";
import { useAppStore } from "../store";
import {
  ShieldAlert,
  Briefcase,
  Users,
  ClipboardList,
  Package,
} from "lucide-react";
import { Role } from "../types";

export const Login = () => {
  const { setRole } = useAppStore();

  const roles: { role: Role; icon: any; desc: string; color: string }[] = [
    {
      role: "Director",
      icon: Briefcase,
      desc: "L2 approval, cancel/edit POs",
      color: "hover:border-[#F97316] hover:shadow-[#F97316]/20",
    },
    {
      role: "AGM",
      icon: Users,
      desc: "L1 approval, vendor selection",
      color: "hover:border-[#8B5CF6] hover:shadow-[#8B5CF6]/20",
    },
    {
      role: "Project Manager",
      icon: ClipboardList,
      desc: "Material planning, RFQ, PO creation",
      color: "hover:border-[#3B82F6] hover:shadow-[#3B82F6]/20",
    },
    {
      role: "Store Incharge",
      icon: Package,
      desc: "GRN, inward, outward, returns",
      color: "hover:border-[#10B981] hover:shadow-[#10B981]/20",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1A2E] via-[#16213E] to-[#0F3460] flex flex-col items-center justify-center p-6">
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-[#F97316] rounded-2xl flex items-center justify-center font-bold text-4xl text-white mx-auto mb-6 shadow-lg shadow-[#F97316]/20">
          N
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Neoteric Properties
        </h1>
        <p className="text-[#9CA3AF] mt-2 text-lg">Garden City Portal</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl w-full mb-6">
        {roles.map((r) => (
          <button
            key={r.role}
            onClick={() => {
              setRole(r.role);
              window.location.hash = "dashboard";
            }}
            className={`bg-white/5 border border-white/10 rounded-2xl p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:bg-white/10 hover:shadow-xl ${r.color} group`}
          >
            <r.icon className="w-8 h-8 text-gray-400 group-hover:text-white mb-4 transition-colors" />
            <h3 className="text-lg font-bold text-white mb-2">{r.role}</h3>
            <p className="text-[13px] text-gray-400 leading-relaxed">
              {r.desc}
            </p>
          </button>
        ))}
      </div>

      <button
        onClick={() => {
          setRole("Super Admin");
          window.location.hash = "superadmin";
        }}
        className="max-w-md w-full bg-gradient-to-br from-[#6D28D9] to-[#4C1D95] border border-purple-500/30 rounded-2xl p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/20 group relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4">
          <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
            SA
          </span>
        </div>
        <ShieldAlert className="w-8 h-8 text-purple-200 group-hover:text-white mb-4 transition-colors" />
        <h3 className="text-lg font-bold text-white mb-2">Super Admin</h3>
        <p className="text-[13px] text-purple-200 leading-relaxed">
          Full system control. Owns settings, overrides, user management.
        </p>
      </button>
    </div>
  );
};
