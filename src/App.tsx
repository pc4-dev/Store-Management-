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
import { Archive } from "./pages/Archive";
import { InwardPage } from "./pages/Inward";
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
        return role === "Super Admin" ? <SuperAdmin /> : <Dashboard />;
      case "catalogue":
        return <Catalogue />;
      case "vendors":
        return <Vendors />;
      case "inventory":
        return <Inventory />;
      case "planning":
        return <MaterialPlanning />;
      case "pos":
        return <PurchaseOrders />;
      case "grn":
        return <GRNPage />;
      case "inward":
        return <InwardPage />;
      case "outward":
        return <OutwardPage />;
      case "returns":
        return <Returns />;
      case "writeoffs":
        return <WriteOffPage />;
      case "stockcheck":
        return <StockCheck />;
      case "archive":
        return <Archive />;
      case "firebase":
        return <FirebaseForm />;
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
