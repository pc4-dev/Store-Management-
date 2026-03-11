import React from "react";
import { X } from "lucide-react";

export const Card = ({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`bg-white rounded-xl border border-[#E8ECF0] shadow-[0_1px_4px_rgba(0,0,0,0.08)] ${className}`}
    {...props}
  >
    {children}
  </div>
);

export const Badge = ({
  text,
  color = "blue",
}: {
  text: string;
  color?: "green" | "red" | "blue" | "yellow" | "purple" | "gray";
}) => {
  const colors = {
    green: "bg-[#ECFDF5] text-[#10B981]",
    red: "bg-[#FEF2F2] text-[#EF4444]",
    blue: "bg-[#EFF6FF] text-[#3B82F6]",
    yellow: "bg-[#FFFBEB] text-[#F59E0B]",
    purple: "bg-[#F5F3FF] text-[#8B5CF6]",
    gray: "bg-gray-100 text-gray-600",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${colors[color]}`}
    >
      {text}
    </span>
  );
};

export const StatusBadge = ({ status }: { status: string }) => {
  let color: "green" | "red" | "blue" | "yellow" | "purple" | "gray" = "gray";
  if (["Approved", "Active", "Confirmed", "Good", "New"].includes(status))
    color = "green";
  else if (
    ["Pending L1", "Pending L2", "Pending", "Partial", "Needs Repair"].includes(
      status,
    )
  )
    color = "yellow";
  else if (["Blocked", "Damaged", "Rejected"].includes(status)) color = "red";
  else if (["Open"].includes(status)) color = "blue";
  else if (["PO Raised", "Draft"].includes(status)) color = "purple";

  return <Badge text={status} color={color} />;
};

export const Btn = ({
  label,
  onClick,
  color = "primary",
  icon: Icon,
  outline,
  small,
  disabled,
}: any) => {
  const base =
    "inline-flex items-center justify-center font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const size = small ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm";

  let colors = "";
  if (outline) {
    colors = "border border-gray-300 text-gray-700 hover:bg-gray-50";
  } else if (color === "primary") {
    colors = "bg-[#F97316] text-white hover:bg-[#ea580c]";
  } else if (color === "purple") {
    colors = "bg-[#8B5CF6] text-white hover:bg-[#7c3aed]";
  } else if (color === "red") {
    colors = "bg-[#EF4444] text-white hover:bg-[#dc2626]";
  } else if (color === "green") {
    colors = "bg-[#10B981] text-white hover:bg-[#059669]";
  } else {
    colors = "bg-gray-800 text-white hover:bg-gray-900";
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${size} ${colors}`}
    >
      {Icon && <Icon className={`w-4 h-4 ${label ? "mr-2" : ""}`} />}
      {label}
    </button>
  );
};

export const Field = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  disabled,
  required,
}: any) => (
  <div className="mb-4">
    <label className="block text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full px-3 py-2 border border-[#E8ECF0] rounded-lg text-[13px] focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] disabled:bg-gray-50 disabled:text-gray-500"
    />
  </div>
);

export const SField = ({
  label,
  value,
  onChange,
  options,
  disabled,
  required,
}: any) => (
  <div className="mb-4">
    <label className="block text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="w-full px-3 py-2 border border-[#E8ECF0] rounded-lg text-[13px] focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] disabled:bg-gray-50 disabled:text-gray-500 bg-white"
    >
      <option value="">Select...</option>
      {options.map((opt: any) => (
        <option key={opt.value || opt} value={opt.value || opt}>
          {opt.label || opt}
        </option>
      ))}
    </select>
  </div>
);

export const Modal = ({ title, onClose, wide, children }: any) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A2E]/60 backdrop-blur-sm">
    <div
      className={`bg-white rounded-xl shadow-2xl w-full max-h-[90vh] flex flex-col ${wide ? "max-w-4xl" : "max-w-xl"}`}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8ECF0]">
        <h2 className="text-lg font-bold text-[#1A1A2E]">{title}</h2>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-6 overflow-y-auto">{children}</div>
    </div>
  </div>
);

export const PageHeader = ({ title, sub, actions }: any) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
    <div>
      <h1 className="text-[22px] font-extrabold text-[#1A1A2E]">{title}</h1>
      {sub && <p className="text-[13px] text-[#6B7280] mt-1">{sub}</p>}
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </div>
);

export const KPICard = ({
  label,
  value,
  sub,
  color = "blue",
  icon: Icon,
}: any) => {
  const colors = {
    orange: "bg-[#FFF7ED] text-[#F97316]",
    blue: "bg-[#EFF6FF] text-[#3B82F6]",
    green: "bg-[#ECFDF5] text-[#10B981]",
    purple: "bg-[#F5F3FF] text-[#8B5CF6]",
    red: "bg-[#FEF2F2] text-[#EF4444]",
  };

  return (
    <Card className="p-5 flex items-start gap-4">
      <div className={`p-3 rounded-xl ${colors[color as keyof typeof colors]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
          {label}
        </p>
        <p className="text-2xl font-extrabold text-[#1A1A2E] mt-1">{value}</p>
        {sub && <p className="text-[11px] text-[#9CA3AF] mt-1">{sub}</p>}
      </div>
    </Card>
  );
};
