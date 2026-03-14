export type Role =
  | "Super Admin"
  | "Director"
  | "AGM"
  | "Project Manager"
  | "Store Incharge"
  | "Audit";

export interface InventoryItem {
  sku: string;
  name: string;
  category: string;
  subCategory: string;
  unit: string;
  openingStock: number;
  liveStock: number;
  condition: "New" | "Good" | "Needs Repair" | "Damaged" | "NA";
  sourceSite?: string;
  lastProject?: string;
  lastAdjustmentReason?: string;
  lastAdjustedBy?: string;
  lastAdjustmentDate?: string;
}

export interface CatalogueEntry {
  sku: string;
  brand: string;
  specs: string;
  location: string;
  minStock: number;
  image: string;
  status: "Draft" | "Approved";
}

export interface Vendor {
  id: string;
  name: string;
  contact: string;
  phone: string;
  category: string;
  gst: string;
  status: "Active" | "Inactive";
}

export interface POLineItem {
  sku: string;
  name: string;
  qty: number;
  unit: string;
  rate: number;
  gstPct: number;
  total: number;
  totalWithGST: number;
}

export interface PurchaseOrder {
  id: string;
  project: string;
  phase: string;
  workType: string;
  milestone: string;
  vendor: string;
  items: POLineItem[];
  totalValue: number;
  status: "Approved" | "Pending L1" | "Pending L2" | "Blocked" | "Draft";
  approvalL1: "N/A" | "Pending" | "Approved";
  approvalL2: "N/A" | "Pending" | "Approved";
  justification?: string;
  createdBy: string;
  date: string;
}

export interface PlanLineItem {
  sku: string;
  name: string;
  required: number;
  unit: string;
  available: number;
  reusable: number;
  shortage: number;
  priority: "High" | "Medium" | "Low";
  delivery: string;
  activity: string;
}

export interface MaterialPlan {
  id: string;
  project: string;
  milestone: string;
  workType: string;
  date: string;
  status: "Open" | "PO Raised" | "Fulfilled";
  items: PlanLineItem[];
}

export interface GRNItem {
  sku: string;
  name: string;
  ordered: number;
  received: number;
  variance: number;
}

export interface GRN {
  id: string;
  poId: string;
  project: string;
  vendor: string;
  date: string;
  challan: string;
  mrNo: string;
  docType:
    | "Challan"
    | "Invoice"
    | "Bilty"
    | "Gate Pass"
    | "Without Challan"
    | "Without Gate Pass";
  items: GRNItem[];
  status: "Draft" | "Confirmed";
}

export interface Inward {
  id: string;
  sku: string;
  name: string;
  qty: number;
  unit: string;
  receivingDate: string;
  challanNo: string;
  mrNo: string;
  supplier: string;
  inType:
    | "Challan"
    | "Bilty"
    | "Invoice"
    | "Without Challan"
    | "Gate Pass"
    | "Without Gate Pass";
  sentToOffice: string;
  currentStock: number;
  type: "GRN" | "Manual";
  grnRef?: string;
}

export interface Outward {
  id: string;
  sku: string;
  name: string;
  qty: number;
  unit: string;
  date: string;
  location: string;
  handoverTo: string;
}

export interface ReturnItem {
  id: string;
  sku: string;
  name: string;
  qty: number;
  unit: string;
  date: string;
  type: "Outward Return (From Site)" | "Inward Return (To Supplier)";
  condition: "New" | "Good" | "Needs Repair" | "Damaged" | "NA";
  sourceSite?: string;
  remarks?: string;
  handoverFrom?: string;
}

export interface WriteOff {
  id: string;
  sku: string;
  name: string;
  qty: number;
  unit: string;
  reason: string;
  requestedBy: string;
  date: string;
  status: "Pending" | "Approved" | "Rejected";
}

export interface StockCheckRecord {
  id: string;
  date: string;
  checkedBy: string;
  category: string;
  items: {
    sku: string;
    name: string;
    systemQty: number;
    physicalQty: number;
    variance: number;
    remark?: string;
  }[];
}

export interface ImportLog {
  importId: string;
  fileName: string;
  importedBy: string;
  totalItems: number;
  importDate: string;
}
