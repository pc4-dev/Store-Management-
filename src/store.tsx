import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { collection, getDocs, doc, setDoc, onSnapshot, getDoc, deleteDoc } from "firebase/firestore";
import { db, auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  InventoryItem,
  Vendor,
  PurchaseOrder,
  CatalogueEntry,
  MaterialPlan,
  GRN,
  Inward,
  Outward,
  ReturnItem,
  WriteOff,
  StockCheckRecord,
  ImportLog,
  Role,
} from "./types";

interface AppState {
  user: { uid: string; email: string; name: string; role: Role } | null;
  setUser: (user: { uid: string; email: string; name: string; role: Role } | null) => void;
  role: Role | null;
  setRole: (role: Role | null) => void;
  logout: () => Promise<void>;
  logActivity: (action: string, details?: any) => Promise<void>;
  inventory: InventoryItem[];
  setInventory: (value: React.SetStateAction<InventoryItem[]>) => void;
  catalogue: CatalogueEntry[];
  setCatalogue: (value: React.SetStateAction<CatalogueEntry[]>) => void;
  vendors: Vendor[];
  setVendors: (value: React.SetStateAction<Vendor[]>) => void;
  pos: PurchaseOrder[];
  setPos: (value: React.SetStateAction<PurchaseOrder[]>) => void;
  plans: MaterialPlan[];
  setPlans: (value: React.SetStateAction<MaterialPlan[]>) => void;
  grns: GRN[];
  setGrns: (value: React.SetStateAction<GRN[]>) => void;
  inwards: Inward[];
  setInwards: (value: React.SetStateAction<Inward[]>) => void;
  outwards: Outward[];
  setOutwards: (value: React.SetStateAction<Outward[]>) => void;
  returns: ReturnItem[];
  setReturns: (value: React.SetStateAction<ReturnItem[]>) => void;
  writeOffs: WriteOff[];
  setWriteOffs: (value: React.SetStateAction<WriteOff[]>) => void;
  stockCheckRecords: StockCheckRecord[];
  setStockCheckRecords: (value: React.SetStateAction<StockCheckRecord[]>) => void;
  importLogs: ImportLog[];
  setImportLogs: (value: React.SetStateAction<ImportLog[]>) => void;
  settings: {
    poThreshold: number;
    minQuotesLow: number;
    minQuotesHigh: number;
  };
  setSettings: (
    value: React.SetStateAction<{
      poThreshold: number;
      minQuotesLow: number;
      minQuotesHigh: number;
    }>
  ) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{ uid: string; email: string; name: string; role: Role } | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [inventory, setInventoryState] = useState<InventoryItem[]>([]);
  const [catalogue, setCatalogueState] = useState<CatalogueEntry[]>([]);
  const [vendors, setVendorsState] = useState<Vendor[]>([]);
  const [pos, setPosState] = useState<PurchaseOrder[]>([]);
  const [plans, setPlansState] = useState<MaterialPlan[]>([]);
  const [grns, setGrnsState] = useState<GRN[]>([]);
  const [inwards, setInwardsState] = useState<Inward[]>([]);
  const [outwards, setOutwardsState] = useState<Outward[]>([]);
  const [returns, setReturnsState] = useState<ReturnItem[]>([]);
  const [writeOffs, setWriteOffsState] = useState<WriteOff[]>([]);
  const [stockCheckRecords, setStockCheckRecordsState] = useState<StockCheckRecord[]>([]);
  const [importLogs, setImportLogsState] = useState<ImportLog[]>([]);
  const [settings, setSettingsState] = useState({
    poThreshold: 25000,
    minQuotesLow: 2,
    minQuotesHigh: 3,
  });

  const isFirebaseConfigured = !!import.meta.env.VITE_FIREBASE_API_KEY;

  useEffect(() => {
    if (!isFirebaseConfigured) {
      console.warn("Firebase configuration missing. Data will not be saved permanently.");
      return;
    }

    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const rawRole = (userData.role || "").toString().trim();
          const normalizedRole =
            ({
              "super admin": "Super Admin",
              director: "Director",
              agm: "AGM",
              "project manager": "Project Manager",
              "store incharge": "Store Incharge",
            }[rawRole.toLowerCase()] || rawRole) as Role;

          setRole(normalizedRole);
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || "",
            name: userData.name || "User",
            role: normalizedRole,
          });
        }
      } else {
        setUser(null);
        setRole(null);
      }
    });

    if (!db) {
      console.warn("Firestore DB not initialized. Cloud sync disabled.");
      return;
    }

    // Real-time listener for Inventory from Firestore
    const unsubInventory = onSnapshot(collection(db, "inventory"), (snapshot) => {
      const items = snapshot.docs.map(doc => doc.data() as InventoryItem);
      setInventoryState(items);
    }, (error) => {
      console.error("Firestore inventory listener failed:", error);
    });

    // Real-time listener for Catalogue from Firestore
    const unsubCatalogue = onSnapshot(collection(db, "catalogue"), (snapshot) => {
      const items = snapshot.docs.map(doc => doc.data() as CatalogueEntry);
      setCatalogueState(items);
    }, (error) => {
      console.warn("Firestore catalogue listener failed:", error);
    });

    // Real-time listener for Vendors from Firestore
    const unsubVendors = onSnapshot(collection(db, "vendors"), (snapshot) => {
      const items = snapshot.docs.map(doc => doc.data() as Vendor);
      setVendorsState(items);
    }, (error) => {
      console.warn("Firestore vendors listener failed:", error);
    });

    // Real-time listener for POs from Firestore
    const unsubPos = onSnapshot(collection(db, "pos"), (snapshot) => {
      const items = snapshot.docs.map(doc => doc.data() as PurchaseOrder);
      setPosState(items);
    });

    // Real-time listener for Plans from Firestore
    const unsubPlans = onSnapshot(collection(db, "plans"), (snapshot) => {
      const items = snapshot.docs.map(doc => doc.data() as MaterialPlan);
      setPlansState(items);
    });

    // Real-time listener for GRNs from Firestore
    const unsubGrns = onSnapshot(collection(db, "grns"), (snapshot) => {
      const items = snapshot.docs.map(doc => doc.data() as GRN);
      setGrnsState(items);
    });

    // Real-time listener for Inwards from Firestore
    const unsubInwards = onSnapshot(collection(db, "inwards"), (snapshot) => {
      const items = snapshot.docs.map(doc => doc.data() as Inward);
      setInwardsState(items);
    });

    // Real-time listener for Outwards from Firestore
    const unsubOutwards = onSnapshot(collection(db, "outwards"), (snapshot) => {
      const items = snapshot.docs.map(doc => doc.data() as Outward);
      setOutwardsState(items);
    });

    // Real-time listener for Returns from Firestore
    const unsubReturns = onSnapshot(collection(db, "returns"), (snapshot) => {
      const items = snapshot.docs.map(doc => doc.data() as ReturnItem);
      setReturnsState(items);
    });

    // Real-time listener for WriteOffs from Firestore
    const unsubWriteOffs = onSnapshot(collection(db, "writeoffs"), (snapshot) => {
      const items = snapshot.docs.map(doc => doc.data() as WriteOff);
      setWriteOffsState(items);
    });

    // Real-time listener for StockCheckRecords from Firestore
    const unsubStockChecks = onSnapshot(collection(db, "stock_checks"), (snapshot) => {
      const items = snapshot.docs.map(doc => doc.data() as StockCheckRecord);
      setStockCheckRecordsState(items);
    });

    // Real-time listener for ImportLogs from Firestore
    const unsubImportLogs = onSnapshot(collection(db, "import_logs"), (snapshot) => {
      const items = snapshot.docs.map(doc => doc.data() as ImportLog);
      setImportLogsState(items);
    });

    // Real-time listener for Settings from Firestore
    const unsubSettings = onSnapshot(doc(db, "settings", "global"), (snapshot) => {
      if (snapshot.exists()) {
        setSettingsState(snapshot.data() as any);
      }
    });

    return () => {
      unsubInventory();
      unsubCatalogue();
      unsubVendors();
      unsubPos();
      unsubPlans();
      unsubGrns();
      unsubInwards();
      unsubOutwards();
      unsubReturns();
      unsubWriteOffs();
      unsubStockChecks();
      unsubImportLogs();
      unsubSettings();
      unsubAuth();
    };
  }, []);

  const createFirestoreSetter = <T,>(
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    collectionName: string,
    idField: keyof T = "id" as keyof T
  ) => {
    return (value: React.SetStateAction<T[]>) => {
      setter((prev) => {
        const next = typeof value === "function" ? (value as any)(prev) : value;
        
        // Side effect: Sync changes to Firestore
        if (db && isFirebaseConfigured) {
          const prevMap = new Map<string, T>(prev.map(i => [String(i[idField]), i]));
          const nextMap = new Map<string, T>(next.map(i => [String(i[idField]), i]));

          // Sync new or changed items
          next.forEach(async (item) => {
            const id = String(item[idField]);
            // Replace slashes with underscores for Firestore document ID to prevent subcollection creation
            const safeDocId = id.replace(/\//g, "_");
            const prevItem = prevMap.get(id);
            if (!prevItem || JSON.stringify(prevItem) !== JSON.stringify(item)) {
              try {
                await setDoc(doc(db, collectionName, safeDocId), item as any);
                console.log(`Synced ${id} to ${collectionName} as ${safeDocId}`);
              } catch (err) {
                console.error(`Error saving ${id} to ${collectionName}:`, err);
              }
            }
          });

          // Sync deletions
          prevMap.forEach(async (_, id) => {
            if (!nextMap.has(id)) {
              const safeDocId = id.replace(/\//g, "_");
              try {
                await deleteDoc(doc(db, collectionName, safeDocId));
                console.log(`Deleted ${id} from ${collectionName} as ${safeDocId}`);
              } catch (err) {
                console.error(`Error deleting ${id} from ${collectionName}:`, err);
              }
            }
          });
        }

        return next;
      });
    };
  };

  const setInventory = createFirestoreSetter(setInventoryState, "inventory", "sku");
  const setCatalogue = createFirestoreSetter(setCatalogueState, "catalogue", "sku");
  const setVendors = createFirestoreSetter(setVendorsState, "vendors", "id");
  const setPos = createFirestoreSetter(setPosState, "pos");
  const setPlans = createFirestoreSetter(setPlansState, "plans");
  const setGrns = createFirestoreSetter(setGrnsState, "grns");
  const setInwards = createFirestoreSetter(setInwardsState, "inwards");
  const setOutwards = createFirestoreSetter(setOutwardsState, "outwards");
  const setReturns = createFirestoreSetter(setReturnsState, "returns");
  const setWriteOffs = createFirestoreSetter(setWriteOffsState, "writeoffs");
  const setStockCheckRecords = createFirestoreSetter(setStockCheckRecordsState, "stock_checks");
  const setImportLogs = createFirestoreSetter(setImportLogsState, "import_logs", "importId");

  const setSettings = (value: React.SetStateAction<typeof settings>) => {
    setSettingsState((prev) => {
      const next = typeof value === "function" ? (value as any)(prev) : value;
      
      // Sync to Firestore
      setDoc(doc(db, "settings", "global"), next).catch(e => console.error("Settings sync failed:", e));

      return next;
    });
  };

  const logout = async () => {
    try {
      if (user) await logActivity("Logout", { email: user.email });
      await auth.signOut();
      setUser(null);
      setRole(null);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const logActivity = async (action: string, details: any = {}) => {
    if (!user) return;
    try {
      await setDoc(doc(collection(db, "activity_logs")), {
        userId: user.uid,
        userName: user.name,
        userRole: user.role,
        action,
        details,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Failed to log activity:", err);
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        role,
        setRole,
        logout,
        logActivity,
        inventory,
        setInventory,
        catalogue,
        setCatalogue,
        vendors,
        setVendors,
        pos,
        setPos,
        plans,
        setPlans,
        grns,
        setGrns,
        inwards,
        setInwards,
        outwards,
        setOutwards,
        returns,
        setReturns,
        writeOffs,
        setWriteOffs,
        stockCheckRecords,
        setStockCheckRecords,
        importLogs,
        setImportLogs,
        settings,
        setSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppStore must be used within AppProvider");
  return context;
};
