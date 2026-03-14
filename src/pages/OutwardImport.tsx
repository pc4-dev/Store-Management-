import React, { useState, useRef } from "react";
import { useAppStore } from "../store";
import { PageHeader, Card, Btn, Modal, Field, SField } from "../components/ui";
import { Upload, FileText, Check, AlertCircle, Trash2, Plus, Save, Loader2 } from "lucide-react";
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { GoogleGenAI, Type } from "@google/genai";
import { genId, todayStr } from "../utils";
import { safeJsonParse } from "../utils/jsonUtils";
import { Outward, ImportLog } from "../types";

// PDF.js worker setup
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

interface ExtractedOutward {
  sku: string;
  name: string;
  qty: number;
  unit: string;
  location: string;
  handoverTo: string;
  error?: string;
}

export const OutwardImport = () => {
  const { outwards, setOutwards, inventory, setInventory, user, role, setImportLogs, logActivity } = useAppStore();
  const [file, setFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedItems, setExtractedItems] = useState<ExtractedOutward[]>([]);
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
        contents: `Extract outward material issue transactions from the following text extracted from a PDF. 
        The table structure might include: Item Name, SKU/Code, Quantity, Unit, Location/Site, Handover To/Receiver.
        
        Return a JSON array of objects with these fields:
        - sku (string)
        - name (string)
        - qty (number)
        - unit (string)
        - location (string)
        - handoverTo (string)

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
                location: { type: Type.STRING },
                handoverTo: { type: Type.STRING },
              },
              required: ["sku", "name", "qty", "location", "handoverTo"],
            },
          },
        },
      });

      const items = safeJsonParse(response.text, []);
      
      // Validate items
      const validatedItems = items.map((item: any) => ({
        ...item,
        error: (!item.sku || !item.name || isNaN(item.qty) || !item.location || !item.handoverTo) ? "Missing required fields" : undefined
      }));

      setExtractedItems(validatedItems);
      setStep(2);
    } catch (error) {
      console.error("Extraction error:", error);
      alert("Failed to extract data from PDF. Please try again or check the file format.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleEditItem = (index: number, field: keyof ExtractedOutward, value: any) => {
    const updated = [...extractedItems];
    updated[index] = { ...updated[index], [field]: value };
    
    // Re-validate
    const item = updated[index];
    updated[index].error = (!item.sku || !item.name || isNaN(item.qty) || !item.location || !item.handoverTo) ? "Missing required fields" : undefined;
    
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
        location: "",
        handoverTo: "",
        error: "Missing required fields"
      }
    ]);
  };

  const handleImport = async () => {
    if (extractedItems.some(i => i.error)) {
      alert("Please fix all errors before importing.");
      return;
    }

    const newOutwards: Outward[] = [];
    const newInventory = [...inventory];
    let importedCount = 0;
    let insufficientStockCount = 0;

    for (const item of extractedItems) {
      const invIdx = newInventory.findIndex(i => i.sku === item.sku);
      
      if (invIdx === -1) {
        alert(`SKU ${item.sku} not found in inventory. Skipping.`);
        continue;
      }

      if (newInventory[invIdx].liveStock < item.qty) {
        alert(`Insufficient stock for SKU ${item.sku}. Available: ${newInventory[invIdx].liveStock}, Requested: ${item.qty}. Skipping.`);
        insufficientStockCount++;
        continue;
      }

      const outward: Outward = {
        id: genId("MIS", outwards.length + newOutwards.length),
        sku: item.sku,
        name: item.name,
        qty: item.qty,
        unit: item.unit,
        date: todayStr(),
        location: item.location,
        handoverTo: item.handoverTo,
      };

      newInventory[invIdx] = {
        ...newInventory[invIdx],
        liveStock: newInventory[invIdx].liveStock - item.qty,
      };

      newOutwards.push(outward);
      importedCount++;
    }

    setInventory(newInventory);
    setOutwards([...newOutwards, ...outwards]);

    const log: ImportLog = {
      importId: genId("IMP-OUT", Date.now()),
      fileName: file?.name || "Unknown",
      importedBy: user?.name || "Unknown",
      totalItems: importedCount,
      importDate: todayStr()
    };
    setImportLogs(prev => [log, ...prev]);
    
    await logActivity("Outward PDF Import", { 
      fileName: file?.name, 
      importedItems: importedCount,
      insufficientStock: insufficientStockCount
    });

    alert(`Import Complete!\nProcessed ${importedCount} transactions.\nSkipped ${insufficientStockCount} due to insufficient stock.`);
    setStep(1);
    setFile(null);
    setExtractedItems([]);
  };

  if (!canImport) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold">Access Denied</h2>
        <p className="text-gray-600">Only Store Incharge or Admin can import outward PDFs.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Smart Outward Import" 
        sub="Extract material issue data from PDF issue notes or requisitions"
      />

      {step === 1 && (
        <Card className="p-12 border-dashed border-2 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4">
            <Upload className="w-8 h-8 text-orange-500" />
          </div>
          <h3 className="text-lg font-bold mb-2">Upload Outward PDF</h3>
          <p className="text-gray-500 mb-6 max-w-md">
            Upload a PDF issue note or requisition. Our AI will extract the items, quantities, and site locations.
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
            color="orange"
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
              <Btn label="Import Outwards" icon={Save} onClick={handleImport} color="orange" />
            </div>
          </div>

          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-[#E8ECF0]">
                    <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">SKU</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Item Name</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider text-right">Qty</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Unit</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Location</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Handover To</th>
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
                          value={item.location}
                          onChange={(e) => handleEditItem(idx, "location", e.target.value)}
                          className={`w-full px-2 py-1 border rounded text-[13px] ${item.error && !item.location ? "border-red-500" : "border-gray-200"}`}
                        >
                          <option value="">Select Location</option>
                          {["Villa No.", "Club House", "Plant", "G+10", "Main Gate", "Other"].map(loc => <option key={loc} value={loc}>{loc}</option>)}
                        </select>
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="text"
                          value={item.handoverTo}
                          onChange={(e) => handleEditItem(idx, "handoverTo", e.target.value)}
                          className={`w-full px-2 py-1 border rounded text-[13px] ${item.error && !item.handoverTo ? "border-red-500" : "border-gray-200"}`}
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
