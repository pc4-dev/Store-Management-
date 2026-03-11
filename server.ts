import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("store.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS inventory (
    sku TEXT PRIMARY KEY,
    name TEXT,
    category TEXT,
    subCategory TEXT,
    unit TEXT,
    openingStock INTEGER,
    liveStock INTEGER,
    condition TEXT,
    sourceSite TEXT,
    lastProject TEXT
  );

  CREATE TABLE IF NOT EXISTS catalogue (
    sku TEXT PRIMARY KEY,
    brand TEXT,
    specs TEXT,
    location TEXT,
    minStock INTEGER,
    image TEXT,
    status TEXT
  );

  CREATE TABLE IF NOT EXISTS vendors (
    id TEXT PRIMARY KEY,
    name TEXT,
    contact TEXT,
    phone TEXT,
    category TEXT,
    gst TEXT,
    status TEXT
  );

  CREATE TABLE IF NOT EXISTS purchase_orders (
    id TEXT PRIMARY KEY,
    project TEXT,
    phase TEXT,
    workType TEXT,
    milestone TEXT,
    vendor TEXT,
    items TEXT,
    totalValue REAL,
    status TEXT,
    approvalL1 TEXT,
    approvalL2 TEXT,
    justification TEXT,
    createdBy TEXT,
    date TEXT
  );

  CREATE TABLE IF NOT EXISTS material_plans (
    id TEXT PRIMARY KEY,
    project TEXT,
    milestone TEXT,
    workType TEXT,
    date TEXT,
    status TEXT,
    items TEXT
  );

  CREATE TABLE IF NOT EXISTS grns (
    id TEXT PRIMARY KEY,
    poId TEXT,
    project TEXT,
    vendor TEXT,
    date TEXT,
    challan TEXT,
    mrNo TEXT,
    docType TEXT,
    items TEXT,
    status TEXT
  );

  CREATE TABLE IF NOT EXISTS inwards (
    id TEXT PRIMARY KEY,
    sku TEXT,
    name TEXT,
    qty INTEGER,
    unit TEXT,
    date TEXT,
    challanNo TEXT,
    mrNo TEXT,
    supplier TEXT,
    type TEXT,
    grnRef TEXT
  );

  CREATE TABLE IF NOT EXISTS outwards (
    id TEXT PRIMARY KEY,
    sku TEXT,
    name TEXT,
    qty INTEGER,
    unit TEXT,
    date TEXT,
    location TEXT,
    handoverTo TEXT
  );

  CREATE TABLE IF NOT EXISTS returns (
    id TEXT PRIMARY KEY,
    sku TEXT,
    name TEXT,
    qty INTEGER,
    unit TEXT,
    date TEXT,
    type TEXT,
    condition TEXT,
    sourceSite TEXT,
    remarks TEXT,
    handoverFrom TEXT
  );

  CREATE TABLE IF NOT EXISTS write_offs (
    id TEXT PRIMARY KEY,
    sku TEXT,
    name TEXT,
    qty INTEGER,
    unit TEXT,
    reason TEXT,
    requestedBy TEXT,
    date TEXT,
    status TEXT
  );

  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    poThreshold INTEGER,
    minQuotesLow INTEGER,
    minQuotesHigh INTEGER
  );
`);

// Seed initial data if empty
const inventoryCount = db.prepare("SELECT COUNT(*) as count FROM inventory").get() as any;
if (inventoryCount.count === 0) {
  const { SEED_INVENTORY, SEED_CATALOGUE, SEED_VENDORS, SEED_POS } = await import("./src/data.js");
  
  const insertInventory = db.prepare("INSERT INTO inventory (sku, name, category, subCategory, unit, openingStock, liveStock, condition) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
  SEED_INVENTORY.forEach((i: any) => insertInventory.run(i.sku, i.name, i.category, i.subCategory, i.unit, i.openingStock, i.liveStock, i.condition));

  const insertCatalogue = db.prepare("INSERT INTO catalogue (sku, brand, specs, location, minStock, image, status) VALUES (?, ?, ?, ?, ?, ?, ?)");
  SEED_CATALOGUE.forEach((c: any) => insertCatalogue.run(c.sku, c.brand, c.specs, c.location, c.minStock, c.image, c.status));

  const insertVendor = db.prepare("INSERT INTO vendors (id, name, contact, phone, category, gst, status) VALUES (?, ?, ?, ?, ?, ?, ?)");
  SEED_VENDORS.forEach((v: any) => insertVendor.run(v.id, v.name, v.contact, v.phone, v.category, v.gst, v.status));

  const insertPO = db.prepare("INSERT INTO purchase_orders (id, project, phase, workType, milestone, vendor, items, totalValue, status, approvalL1, approvalL2, createdBy, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
  SEED_POS.forEach((p: any) => insertPO.run(p.id, p.project, p.phase, p.workType, p.milestone, p.vendor, JSON.stringify(p.items), p.totalValue, p.status, p.approvalL1, p.approvalL2, p.createdBy, p.date));

  db.prepare("INSERT INTO settings (id, poThreshold, minQuotesLow, minQuotesHigh) VALUES (1, 25000, 2, 3)").run();
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Routes
  app.get("/api/inventory", (req, res) => {
    const rows = db.prepare("SELECT * FROM inventory").all();
    res.json(rows);
  });

  app.post("/api/inventory", (req, res) => {
    const { sku, name, category, subCategory, unit, openingStock, liveStock, condition, sourceSite, lastProject } = req.body;
    db.prepare(`
      INSERT OR REPLACE INTO inventory (sku, name, category, subCategory, unit, openingStock, liveStock, condition, sourceSite, lastProject)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(sku, name, category, subCategory, unit, openingStock, liveStock, condition, sourceSite, lastProject);
    res.json({ success: true });
  });

  app.get("/api/catalogue", (req, res) => {
    const rows = db.prepare("SELECT * FROM catalogue").all();
    res.json(rows);
  });

  app.post("/api/catalogue", (req, res) => {
    const { sku, brand, specs, location, minStock, image, status } = req.body;
    db.prepare(`
      INSERT OR REPLACE INTO catalogue (sku, brand, specs, location, minStock, image, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(sku, brand, specs, location, minStock, image, status);
    res.json({ success: true });
  });

  app.get("/api/vendors", (req, res) => {
    const rows = db.prepare("SELECT * FROM vendors").all();
    res.json(rows);
  });

  app.post("/api/vendors", (req, res) => {
    const { id, name, contact, phone, category, gst, status } = req.body;
    db.prepare(`
      INSERT OR REPLACE INTO vendors (id, name, contact, phone, category, gst, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, contact, phone, category, gst, status);
    res.json({ success: true });
  });

  app.get("/api/pos", (req, res) => {
    const rows = db.prepare("SELECT * FROM purchase_orders").all();
    res.json(rows.map((r: any) => ({ ...r, items: JSON.parse(r.items) })));
  });

  app.post("/api/pos", (req, res) => {
    const { id, project, phase, workType, milestone, vendor, items, totalValue, status, approvalL1, approvalL2, justification, createdBy, date } = req.body;
    db.prepare(`
      INSERT OR REPLACE INTO purchase_orders (id, project, phase, workType, milestone, vendor, items, totalValue, status, approvalL1, approvalL2, justification, createdBy, date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, project, phase, workType, milestone, vendor, JSON.stringify(items), totalValue, status, approvalL1, approvalL2, justification, createdBy, date);
    res.json({ success: true });
  });

  app.get("/api/plans", (req, res) => {
    const rows = db.prepare("SELECT * FROM material_plans").all();
    res.json(rows.map((r: any) => ({ ...r, items: JSON.parse(r.items) })));
  });

  app.post("/api/plans", (req, res) => {
    const { id, project, milestone, workType, date, status, items } = req.body;
    db.prepare(`
      INSERT OR REPLACE INTO material_plans (id, project, milestone, workType, date, status, items)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, project, milestone, workType, date, status, JSON.stringify(items));
    res.json({ success: true });
  });

  app.get("/api/grns", (req, res) => {
    const rows = db.prepare("SELECT * FROM grns").all();
    res.json(rows.map((r: any) => ({ ...r, items: JSON.parse(r.items) })));
  });

  app.post("/api/grns", (req, res) => {
    const { id, poId, project, vendor, date, challan, mrNo, docType, items, status } = req.body;
    db.prepare(`
      INSERT OR REPLACE INTO grns (id, poId, project, vendor, date, challan, mrNo, docType, items, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, poId, project, vendor, date, challan, mrNo, docType, JSON.stringify(items), status);
    res.json({ success: true });
  });

  app.get("/api/inwards", (req, res) => {
    const rows = db.prepare("SELECT * FROM inwards").all();
    res.json(rows);
  });

  app.post("/api/inwards", (req, res) => {
    const { id, sku, name, qty, unit, date, challanNo, mrNo, supplier, type, grnRef } = req.body;
    db.prepare(`
      INSERT OR REPLACE INTO inwards (id, sku, name, qty, unit, date, challanNo, mrNo, supplier, type, grnRef)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, sku, name, qty, unit, date, challanNo, mrNo, supplier, type, grnRef);
    res.json({ success: true });
  });

  app.get("/api/outwards", (req, res) => {
    const rows = db.prepare("SELECT * FROM outwards").all();
    res.json(rows);
  });

  app.post("/api/outwards", (req, res) => {
    const { id, sku, name, qty, unit, date, location, handoverTo } = req.body;
    db.prepare(`
      INSERT OR REPLACE INTO outwards (id, sku, name, qty, unit, date, location, handoverTo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, sku, name, qty, unit, date, location, handoverTo);
    res.json({ success: true });
  });

  app.get("/api/returns", (req, res) => {
    const rows = db.prepare("SELECT * FROM returns").all();
    res.json(rows);
  });

  app.post("/api/returns", (req, res) => {
    const { id, sku, name, qty, unit, date, type, condition, sourceSite, remarks, handoverFrom } = req.body;
    db.prepare(`
      INSERT OR REPLACE INTO returns (id, sku, name, qty, unit, date, type, condition, sourceSite, remarks, handoverFrom)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, sku, name, qty, unit, date, type, condition, sourceSite, remarks, handoverFrom);
    res.json({ success: true });
  });

  app.get("/api/writeoffs", (req, res) => {
    const rows = db.prepare("SELECT * FROM write_offs").all();
    res.json(rows);
  });

  app.post("/api/writeoffs", (req, res) => {
    const { id, sku, name, qty, unit, reason, requestedBy, date, status } = req.body;
    db.prepare(`
      INSERT OR REPLACE INTO write_offs (id, sku, name, qty, unit, reason, requestedBy, date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, sku, name, qty, unit, reason, requestedBy, date, status);
    res.json({ success: true });
  });

  app.get("/api/settings", (req, res) => {
    const row = db.prepare("SELECT * FROM settings WHERE id = 1").get();
    res.json(row);
  });

  app.post("/api/settings", (req, res) => {
    const { poThreshold, minQuotesLow, minQuotesHigh } = req.body;
    db.prepare(`
      UPDATE settings SET poThreshold = ?, minQuotesLow = ?, minQuotesHigh = ? WHERE id = 1
    `).run(poThreshold, minQuotesLow, minQuotesHigh);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
