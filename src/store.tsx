import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { collection, getDocs, doc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";
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
  Role,
} from "./types";

interface AppState {
  role: Role | null;
  setRole: (role: Role | null) => void;
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
  const [settings, setSettingsState] = useState({
    poThreshold: 25000,
    minQuotesLow: 2,
    minQuotesHigh: 3,
  });

  useEffect(() => {
    if (!db) {
      console.warn("Firestore DB not initialized. Cloud sync disabled.");
      return;
    }

    // Real-time listener for Inventory from Firestore
    const unsubInventory = onSnapshot(collection(db, "inventory"), (snapshot) => {
      if (snapshot.metadata.hasPendingWrites) return;
      const items = snapshot.docs.map(doc => doc.data() as InventoryItem);
      setInventoryState(items);
    }, (error) => {
      console.error("Firestore inventory listener failed:", error);
    });

    // Real-time listener for Catalogue from Firestore
    const unsubCatalogue = onSnapshot(collection(db, "catalogue"), (snapshot) => {
      if (snapshot.metadata.hasPendingWrites) return;
      const items = snapshot.docs.map(doc => doc.data() as CatalogueEntry);
      setCatalogueState(items);
    }, (error) => {
      console.warn("Firestore catalogue listener failed:", error);
    });

    // Real-time listener for Vendors from Firestore
    const unsubVendors = onSnapshot(collection(db, "vendors"), (snapshot) => {
      if (snapshot.metadata.hasPendingWrites) return;
      const items = snapshot.docs.map(doc => doc.data() as Vendor);
      setVendorsState(items);
    }, (error) => {
      console.warn("Firestore vendors listener failed:", error);
    });

    // Real-time listener for POs from Firestore
    const unsubPos = onSnapshot(collection(db, "pos"), (snapshot) => {
      if (snapshot.metadata.hasPendingWrites) return;
      const items = snapshot.docs.map(doc => doc.data() as PurchaseOrder);
      setPosState(items);
    });

    // Real-time listener for Plans from Firestore
    const unsubPlans = onSnapshot(collection(db, "plans"), (snapshot) => {
      if (snapshot.metadata.hasPendingWrites) return;
      const items = snapshot.docs.map(doc => doc.data() as MaterialPlan);
      setPlansState(items);
    });

    // Real-time listener for GRNs from Firestore
    const unsubGrns = onSnapshot(collection(db, "grns"), (snapshot) => {
      if (snapshot.metadata.hasPendingWrites) return;
      const items = snapshot.docs.map(doc => doc.data() as GRN);
      setGrnsState(items);
    });

    // Real-time listener for Inwards from Firestore
    const unsubInwards = onSnapshot(collection(db, "inwards"), (snapshot) => {
      if (snapshot.metadata.hasPendingWrites) return;
      const items = snapshot.docs.map(doc => doc.data() as Inward);
      setInwardsState(items);
    });

    // Real-time listener for Outwards from Firestore
    const unsubOutwards = onSnapshot(collection(db, "outwards"), (snapshot) => {
      if (snapshot.metadata.hasPendingWrites) return;
      const items = snapshot.docs.map(doc => doc.data() as Outward);
      setOutwardsState(items);
    });

    // Real-time listener for Returns from Firestore
    const unsubReturns = onSnapshot(collection(db, "returns"), (snapshot) => {
      if (snapshot.metadata.hasPendingWrites) return;
      const items = snapshot.docs.map(doc => doc.data() as ReturnItem);
      setReturnsState(items);
    });

    // Real-time listener for WriteOffs from Firestore
    const unsubWriteOffs = onSnapshot(collection(db, "writeoffs"), (snapshot) => {
      if (snapshot.metadata.hasPendingWrites) return;
      const items = snapshot.docs.map(doc => doc.data() as WriteOff);
      setWriteOffsState(items);
    });

    // Real-time listener for Settings from Firestore
    const unsubSettings = onSnapshot(doc(db, "settings", "global"), (snapshot) => {
      if (snapshot.exists()) {
        setSettingsState(snapshot.data() as any);
      }
    });

    const fetchData = async () => {
      // Skip local API if we're likely on Vercel (no custom backend)
      const isVercel = window.location.hostname.includes("vercel.app");
      if (isVercel) {
        console.log("Vercel detected. Skipping local API and relying on Firestore.");
        return;
      }

      try {
        console.log("Fetching initial data from local API...");
        const endpoints = [
          "/api/inventory", "/api/catalogue", "/api/vendors", "/api/pos",
          "/api/plans", "/api/grns", "/api/inwards", "/api/outwards",
          "/api/returns", "/api/writeoffs", "/api/settings"
        ];

        const results = await Promise.all(
          endpoints.map(url => 
            fetch(url)
              .then(async r => {
                const contentType = r.headers.get("content-type");
                if (r.ok && contentType && contentType.includes("application/json")) {
                  return r.json();
                }
                return [];
              })
              .catch(err => {
                console.warn(`Failed to fetch from ${url}:`, err);
                return [];
              })
          )
        );

        const [inv, cat, ven, po, pln, grn, inw, out, ret, wo, set] = results;
        
        if (inv.length) setInventoryState(inv);
        if (cat.length) setCatalogueState(cat);
        if (ven.length) setVendorsState(ven);
        if (po.length) setPosState(po);
        if (pln.length) setPlansState(pln);
        if (grn.length) setGrnsState(grn);
        if (inw.length) setInwardsState(inw);
        if (out.length) setOutwardsState(out);
        if (ret.length) setReturnsState(ret);
        if (wo.length) setWriteOffsState(wo);
        if (set && !Array.isArray(set)) setSettingsState(set);
        
        console.log("Initial API fetch completed. Syncing to Firestore...");
        
        // One-time seed to Firestore if we have local data and Firestore might be empty
        // This only runs in AI Studio (isVercel is false)
        const seedToFirestore = async () => {
          try {
            const sync = async (col: string, data: any[], idKey: string) => {
              for (const item of data) {
                await setDoc(doc(db, col, String(item[idKey])), item);
              }
            };
            if (inv.length) await sync("inventory", inv, "sku");
            if (cat.length) await sync("catalogue", cat, "sku");
            if (ven.length) await sync("vendors", ven, "id");
            if (po.length) await sync("pos", po, "id");
            if (pln.length) await sync("plans", pln, "id");
            if (grn.length) await sync("grns", grn, "id");
            if (inw.length) await sync("inwards", inw, "id");
            if (out.length) await sync("outwards", out, "id");
            if (ret.length) await sync("returns", ret, "id");
            if (wo.length) await sync("writeoffs", wo, "id");
            if (set && !Array.isArray(set)) await setDoc(doc(db, "settings", "global"), set);
            console.log("Firestore seeding completed.");
          } catch (e) {
            console.error("Firestore seeding failed:", e);
          }
        };
        seedToFirestore();
      } catch (err) {
        console.error("Critical failure in fetchData:", err);
      }
    };
    fetchData();
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
      unsubSettings();
    };
  }, []);

  const wrapSetter = <T,>(
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    endpoint: string,
    idField: keyof T = "id" as keyof T
  ) => {
    return (value: React.SetStateAction<T[]>) => {
      setter((prev) => {
        const next = typeof value === "function" ? (value as any)(prev) : value;
        
        // Only sync to local API if not on Vercel
        if (!window.location.hostname.includes("vercel.app")) {
          next.forEach((item: T) => {
            fetch(endpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(item),
            }).catch(() => {});
          });
        }
        return next;
      });
    };
  };

  const setInventory = (value: React.SetStateAction<InventoryItem[]>) => {
    setInventoryState((prev) => {
      const next = typeof value === "function" ? (value as any)(prev) : value;
      
      // Side effect: Sync only new or changed items to Firestore
      Promise.resolve().then(() => {
        const prevMap = new Map(prev.map(i => [i.sku, i]));
        const changedOrNew = next.filter(item => {
          const prevItem = prevMap.get(item.sku);
          return !prevItem || JSON.stringify(prevItem) !== JSON.stringify(item);
        });

        changedOrNew.forEach(async (item) => {
          try {
            await setDoc(doc(db, "inventory", item.sku), item);
            if (!window.location.hostname.includes("vercel.app")) {
              fetch("/api/inventory", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(item),
              }).catch(() => {});
            }
          } catch (err) {
            console.error("Error saving to Firestore:", err);
          }
        });
      });

      return next;
    });
  };

  const setCatalogue = (value: React.SetStateAction<CatalogueEntry[]>) => {
    setCatalogueState((prev) => {
      const next = typeof value === "function" ? (value as any)(prev) : value;
      
      Promise.resolve().then(() => {
        const prevMap = new Map(prev.map(i => [i.sku, i]));
        const changedOrNew = next.filter(item => {
          const prevItem = prevMap.get(item.sku);
          return !prevItem || JSON.stringify(prevItem) !== JSON.stringify(item);
        });

        changedOrNew.forEach(async (item) => {
          try {
            await setDoc(doc(db, "catalogue", item.sku), item);
            if (!window.location.hostname.includes("vercel.app")) {
              fetch("/api/catalogue", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(item),
              }).catch(() => {});
            }
          } catch (err) {
            console.error("Error saving catalogue to Firestore:", err);
          }
        });
      });

      return next;
    });
  };

  const setVendors = (value: React.SetStateAction<Vendor[]>) => {
    setVendorsState((prev) => {
      const next = typeof value === "function" ? (value as any)(prev) : value;
      
      Promise.resolve().then(() => {
        const prevMap = new Map(prev.map(i => [i.id, i]));
        const changedOrNew = next.filter(item => {
          const prevItem = prevMap.get(item.id);
          return !prevItem || JSON.stringify(prevItem) !== JSON.stringify(item);
        });

        changedOrNew.forEach(async (item) => {
          try {
            await setDoc(doc(db, "vendors", item.id), item);
            if (!window.location.hostname.includes("vercel.app")) {
              fetch("/api/vendors", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(item),
              }).catch(() => {});
            }
          } catch (err) {
            console.error("Error saving vendor to Firestore:", err);
          }
        });
      });

      return next;
    });
  };

  const createFirestoreSetter = <T,>(
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    collectionName: string,
    endpoint: string,
    idField: keyof T = "id" as keyof T
  ) => {
    return (value: React.SetStateAction<T[]>) => {
      setter((prev) => {
        const next = typeof value === "function" ? (value as any)(prev) : value;
        
        // Side effect: Sync only new or changed items
        Promise.resolve().then(() => {
          const prevMap = new Map(prev.map(i => [String(i[idField]), i]));
          const changedOrNew = next.filter(item => {
            const id = String(item[idField]);
            const prevItem = prevMap.get(id);
            // Deep comparison via stringify to detect changes in items array etc.
            return !prevItem || JSON.stringify(prevItem) !== JSON.stringify(item);
          });

          if (changedOrNew.length > 0) {
            console.log(`Syncing ${changedOrNew.length} items to ${collectionName}...`);
          }

          changedOrNew.forEach(async (item: T) => {
            try {
              const id = String(item[idField]);
              await setDoc(doc(db, collectionName, id), item as any);
              
              // Also sync to local API if not on Vercel
              if (!window.location.hostname.includes("vercel.app")) {
                fetch(endpoint, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(item),
                }).catch(() => {});
              }
            } catch (err) {
              console.error(`Error saving ${collectionName} to Firestore:`, err);
            }
          });
        });

        return next;
      });
    };
  };

  const setPos = createFirestoreSetter(setPosState, "pos", "/api/pos");
  const setPlans = createFirestoreSetter(setPlansState, "plans", "/api/plans");
  const setGrns = createFirestoreSetter(setGrnsState, "grns", "/api/grns");
  const setInwards = createFirestoreSetter(setInwardsState, "inwards", "/api/inwards");
  const setOutwards = createFirestoreSetter(setOutwardsState, "outwards", "/api/outwards");
  const setReturns = createFirestoreSetter(setReturnsState, "returns", "/api/returns");
  const setWriteOffs = createFirestoreSetter(setWriteOffsState, "writeoffs", "/api/writeoffs");

  const setSettings = (value: React.SetStateAction<typeof settings>) => {
    setSettingsState((prev) => {
      const next = typeof value === "function" ? (value as any)(prev) : value;
      
      // Sync to Firestore
      setDoc(doc(db, "settings", "global"), next).catch(e => console.error("Settings sync failed:", e));

      if (!window.location.hostname.includes("vercel.app")) {
        fetch("/api/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(next),
        }).catch(() => {});
      }
      return next;
    });
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
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
