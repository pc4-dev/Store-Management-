import React, { useState, useRef } from "react";
import { useAppStore } from "../store";
import { PageHeader, Card, Btn, Modal, Field, SField } from "../components/ui";
import { Upload, FileText, Check, AlertCircle, Trash2, Plus, Save, Loader2, Search } from "lucide-react";
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { GoogleGenAI, Type } from "@google/genai";
import { genId, todayStr } from "../utils";
import { safeJsonParse } from "../utils/jsonUtils";
import { Inward, ImportLog } from "../types";

// PDF.js worker setup
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

interface ExtractedInward {
  sku: string;
  name: string;
  qty: number;
  unit: string;
  supplier: string;
  challanNo: string;
  mrNo: string;
  receivingDate: string;
  inType: string;
  sentToOffice: string;
  currentStock: number;
  error?: string;
}

export const InwardImport = () => {
  const { inwards, setInwards, inventory, setInventory, vendors, user, role, setImportLogs, logActivity } = useAppStore();
  const [file, setFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedItems, setExtractedItems] = useState<ExtractedInward[]>([]);
  const [step, setStep] = useState(1); // 1: Upload, 2: Preview
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canImport = role === "Store Incharge" || role === "Super Admin";

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(" ");
      fullText += pageText + "\n";
    }
    return fullText;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;
    if (uploadedFile.type !== "application/pdf") {
      alert("Please upload a PDF file.");
      return;
    }
    setFile(uploadedFile);
    setIsExtracting(true);

    try {
      const text = await extractTextFromPDF(uploadedFile);
      
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Extract inward material transactions from the following text extracted from a PDF. 
        The table structure might include: Item Name, SKU/Code, Quantity, Unit, Supplier/Vendor, Challan/Invoice No, MR No, Receiving Date, In Type, Current Stock/Balance.
        
        For any string field (SKU, Name, Unit, Supplier, Challan No, MR No, In Type, Sent Office) if the data is not available in the PDF, use "NA".
        For "In Type", choose one of: "Challan", "Bilty", "Invoice", "Without Challan", "Gate Pass", "Without Gate Pass" or "NA".
        For "Receiving Date", extract the date of receiving or document date (YYYY-MM-DD). If not found, use the current date.
        For "Current Stock", look for any "Current Stock", "Stock", or "Balance" column in the PDF. If not found, use 0.
        
        Return a JSON array of objects with these fields:
        - sku (string)
        - name (string)
        - qty (number)
        - unit (string)
        - supplier (string)
        - challanNo (string)
        - mrNo (string)
        - receivingDate (string, YYYY-MM-DD)
        - inType (string)
        - sentToOffice (string)
        - currentStock (number)

        Text:
        ${text}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                sku: { type: Type.STRING },
                name: { type: Type.STRING },
                qty: { type: Type.NUMBER },
                unit: { type: Type.STRING },
                supplier: { type: Type.STRING },
                challanNo: { type: Type.STRING },
                mrNo: { type: Type.STRING },
                receivingDate: { type: Type.STRING },
                inType: { type: Type.STRING },
                sentToOffice: { type: Type.STRING },
                currentStock: { type: Type.NUMBER },
              },
              required: ["sku", "name", "qty", "supplier", "challanNo", "mrNo", "receivingDate", "inType"],
            },
          },
        },
      });

      const items = safeJsonParse(response.text, []);
      
      // Validate items
      const validatedItems = items.map((item: any) => {
        return {
          ...item,
          currentStock: item.currentStock || 0,
          error: (!item.sku || !item.name || isNaN(item.qty) || !item.supplier || !item.challanNo || !item.mrNo || !item.receivingDate || !item.inType) ? "Missing required fields" : undefined
        };
      });

      setExtractedItems(validatedItems);
      setStep(2);
    } catch (error) {
      console.error("Extraction error:", error);
      alert("Failed to extract data from PDF. Please try again or check the file format.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleEditItem = (index: number, field: keyof ExtractedInward, value: any) => {
    const updated = [...extractedItems];
    updated[index] = { ...updated[index], [field]: value };
    
    // Re-validate
    const item = updated[index];
    updated[index].error = (!item.sku || !item.name || isNaN(item.qty) || !item.supplier || !item.challanNo || !item.mrNo || !item.receivingDate || !item.inType) ? "Missing required fields" : undefined;
    
    setExtractedItems(updated);
  };

  const handleDeleteItem = (index: number) => {
    setExtractedItems(extractedItems.filter((_, i) => i !== index));
  };

  const handleAddItem = () => {
    setExtractedItems([
      ...extractedItems,
      {
        sku: "",
        name: "",
        qty: 0,
        unit: "NOS",
        supplier: "",
        challanNo: "",
        mrNo: "",
        receivingDate: todayStr(),
        inType: "Challan",
        sentToOffice: "",
        currentStock: 0,
        error: "Missing required fields"
      }
    ]);
  };

  const handleImport = async () => {
    if (extractedItems.some(i => i.error)) {
      alert("Please fix all errors before importing.");
      return;
    }

    const newInwards: Inward[] = [];
    const newInventory = [...inventory];
    let importedCount = 0;

    for (const item of extractedItems) {
      const invIdx = newInventory.findIndex(i => i.sku === item.sku);
      
      if (invIdx === -1) {
        const create = confirm(`SKU ${item.sku} (${item.name}) not found in inventory. Skip this item?`);
        if (create) continue;
      }

      const inward: Inward = {
        id: genId("INW", inwards.length + newInwards.length),
        sku: item.sku || "NA",
        name: item.name || "NA",
        qty: item.qty,
        unit: item.unit || "NA",
        receivingDate: item.receivingDate || todayStr(),
        challanNo: item.challanNo || "NA",
        mrNo: item.mrNo || "NA",
        supplier: item.supplier || "NA",
        inType: (item.inType || "NA") as any,
        sentToOffice: item.sentToOffice || "NA",
        currentStock: item.currentStock || 0,
        type: "Manual",
      };

      if (invIdx >= 0) {
        newInventory[invIdx] = {
          ...newInventory[invIdx],
          liveStock: (item.currentStock || 0) + item.qty,
        };
      }

      newInwards.push(inward);
      importedCount++;
    }

    setInventory(newInventory);
    setInwards([...newInwards, ...inwards]);

    const log: ImportLog = {
      importId: genId("IMP-INW", Date.now()),
      fileName: file?.name || "Unknown",
      importedBy: user?.name || "Unknown",
      totalItems: importedCount,
      importDate: todayStr()
    };
    setImportLogs(prev => [log, ...prev]);
    
    await logActivity("Inward PDF Import", { 
      fileName: file?.name, 
      importedItems: importedCount 
    });

    alert(`Import Complete!\nProcessed ${importedCount} transactions.`);
    setStep(1);
    setFile(null);
    setExtractedItems([]);
  };

  if (!canImport) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold">Access Denied</h2>
        <p className="text-gray-600">Only Store Incharge or Admin can import inward PDFs.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Smart Inward Import" 
        sub="Extract material receipt data from PDF challans or invoices"
      />

      {step === 1 && (
        <Card className="p-12 border-dashed border-2 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
            <Upload className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="text-lg font-bold mb-2">Upload Inward PDF</h3>
          <p className="text-gray-500 mb-6 max-w-md">
            Upload a PDF challan or invoice. Our AI will extract the items, quantities, and supplier info.
          </p>
          <input
            type="file"
            accept=".pdf"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <Btn 
            label={isExtracting ? "Extracting Data..." : "Select PDF File"} 
            icon={isExtracting ? Loader2 : FileText}
            onClick={() => fileInputRef.current?.click()}
            disabled={isExtracting}
            color="green"
            className={isExtracting ? "animate-pulse" : ""}
          />
        </Card>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              <span className="font-medium text-gray-700">
                Extracted {extractedItems.length} transactions from {file?.name}
              </span>
            </div>
            <div className="flex gap-2">
              <Btn label="Add Row" icon={Plus} outline onClick={handleAddItem} />
              <Btn label="Cancel" outline onClick={() => { setStep(1); setExtractedItems([]); }} />
              <Btn label="Import Inwards" icon={Save} onClick={handleImport} color="green" />
            </div>
          </div>

          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-[#E8ECF0]">
                    <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">SKU Code</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Item Name</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider text-right">Qty</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider text-right">Stock</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Supplier</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Challan/MR</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">In Type</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Sent Office</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8ECF0]">
                  {extractedItems.map((item, idx) => (
                    <tr key={idx} className={`hover:bg-gray-50/50 ${item.error ? "bg-red-50" : ""}`}>
                      <td className="px-2 py-2">
                        <input
                          type="text"
                          value={item.sku}
                          onChange={(e) => handleEditItem(idx, "sku", e.target.value)}
                          className={`w-full px-2 py-1 border rounded text-[13px] ${item.error && !item.sku ? "border-red-500" : "border-gray-200"}`}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleEditItem(idx, "name", e.target.value)}
                          className={`w-full px-2 py-1 border rounded text-[13px] ${item.error && !item.name ? "border-red-500" : "border-gray-200"}`}
                        />
                      </td>
                      <td className="px-2 py-2 text-right">
                        <input
                          type="number"
                          value={item.qty}
                          onChange={(e) => handleEditItem(idx, "qty", Number(e.target.value))}
                          className={`w-20 px-2 py-1 border rounded text-[13px] text-right ${item.error && isNaN(item.qty) ? "border-red-500" : "border-gray-200"}`}
                        />
                      </td>
                      <td className="px-2 py-2 text-right">
                        <input
                          type="number"
                          value={item.currentStock}
                          onChange={(e) => handleEditItem(idx, "currentStock", Number(e.target.value))}
                          className="w-20 px-2 py-1 border border-gray-200 rounded text-[13px] text-right"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="text"
                          value={item.unit}
                          onChange={(e) => handleEditItem(idx, "unit", e.target.value)}
                          className="w-full px-2 py-1 border border-gray-200 rounded text-[13px]"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <select
                          value={item.supplier}
                          onChange={(e) => handleEditItem(idx, "supplier", e.target.value)}
                          className={`w-full px-2 py-1 border rounded text-[13px] ${item.error && !item.supplier ? "border-red-500" : "border-gray-200"}`}
                        >
                          <option value="">Select Supplier</option>
                          {vendors.map(v => <option key={v.id} value={v.name}>{v.name}</option>)}
                        </select>
                      </td>
                      <td className="px-2 py-2">
                        <div className="space-y-1">
                          <input
                            type="text"
                            value={item.challanNo}
                            onChange={(e) => handleEditItem(idx, "challanNo", e.target.value)}
                            placeholder="Challan"
                            className={`w-full px-2 py-1 border rounded text-[13px] ${item.error && !item.challanNo ? "border-red-500" : "border-gray-200"}`}
                          />
                          <input
                            type="text"
                            value={item.mrNo}
                            onChange={(e) => handleEditItem(idx, "mrNo", e.target.value)}
                            placeholder="MR No"
                            className={`w-full px-2 py-1 border rounded text-[13px] ${item.error && !item.mrNo ? "border-red-500" : "border-gray-200"}`}
                          />
                        </div>
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="date"
                          value={item.receivingDate}
                          onChange={(e) => handleEditItem(idx, "receivingDate", e.target.value)}
                          className={`w-full px-2 py-1 border rounded text-[13px] ${item.error && !item.receivingDate ? "border-red-500" : "border-gray-200"}`}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <select
                          value={item.inType}
                          onChange={(e) => handleEditItem(idx, "inType", e.target.value)}
                          className={`w-full px-2 py-1 border rounded text-[13px] ${item.error && !item.inType ? "border-red-500" : "border-gray-200"}`}
                        >
                          <option value="Challan">Challan</option>
                          <option value="Bilty">Bilty</option>
                          <option value="Invoice">Invoice</option>
                          <option value="Without Challan">Without Challan</option>
                          <option value="Gate Pass">Gate Pass</option>
                          <option value="Without Gate Pass">Without Gate Pass</option>
                        </select>
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="text"
                          value={item.sentToOffice}
                          onChange={(e) => handleEditItem(idx, "sentToOffice", e.target.value)}
                          className="w-full px-2 py-1 border border-gray-200 rounded text-[13px]"
                        />
                      </td>
                      <td className="px-2 py-2 text-right">
                        <button 
                          onClick={() => handleDeleteItem(idx)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
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
