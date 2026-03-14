import React, { useEffect, useState } from "react";
import { AppProvider, useAppStore } from "./store";
import { Layout } from "./components/Layout";
import { LoginPage } from "./components/Auth/LoginPage";
import { Dashboard } from "./pages/Dashboard";
import { Inventory } from "./pages/Inventory";
import { PurchaseOrders } from "./pages/PurchaseOrders";
import { MaterialPlanning } from "./pages/MaterialPlanning";
import { GRNPage } from "./pages/GRN";
import { Vendors } from "./pages/Vendors";
import { Catalogue } from "./pages/Catalogue";
import { SuperAdmin } from "./pages/SuperAdmin";
import { OutwardPage } from "./pages/Outward";
import { Returns } from "./pages/Returns";
import { WriteOffPage } from "./pages/WriteOff";
import { StockCheck } from "./pages/StockCheck";
import { StockCheckReports } from "./pages/StockCheckReports";
import { Archive } from "./pages/Archive";
import { InwardPage } from "./pages/Inward";
import { InventoryImport } from "./pages/InventoryImport";
import { InwardImport } from "./pages/InwardImport";
import { OutwardImport } from "./pages/OutwardImport";
import { FirebaseForm } from "./pages/FirebaseForm";

const AppContent = () => {
  const { role } = useAppStore();
  const [hash, setHash] = useState(
    window.location.hash.replace("#", "") || "dashboard",
  );

  useEffect(() => {
    const handleHashChange = () => {
      setHash(window.location.hash.replace("#", "") || "dashboard");
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  if (!role) {
    return <LoginPage />;
  }

  const renderPage = () => {
    switch (hash) {
      case "dashboard":
        return <Dashboard />;
      case "superadmin":
        return (role || "").toString().trim().toLowerCase() === "super admin" ? (
          <SuperAdmin />
        ) : (
          <Dashboard />
        );
      case "catalogue":
        return <Catalogue />;
      case "vendors":
        return <Vendors />;
      case "inventory":
        return <Inventory />;
      case "inventory-import":
        return <InventoryImport />;
      case "planning":
        return <MaterialPlanning />;
      case "pos":
        return <PurchaseOrders />;
      case "grn":
        return <GRNPage />;
      case "inward":
        return <InwardPage />;
      case "inward-import":
        return <InwardImport />;
      case "outward":
        return <OutwardPage />;
      case "outward-import":
        return <OutwardImport />;
      case "returns":
        return <Returns />;
      case "writeoffs":
        return <WriteOffPage />;
      case "stockcheck":
        return <StockCheck />;
      case "stockcheck-reports":
        return <StockCheckReports />;
      case "archive":
        return <Archive />;
      case "firebase":
        return (role || "").toString().trim().toLowerCase() === "super admin" ? (
          <FirebaseForm />
        ) : (
          <Dashboard />
        );
      default:
        return <Dashboard />;
    }
  };

  return <Layout>{renderPage()}</Layout>;
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
