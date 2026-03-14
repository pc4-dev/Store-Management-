import React, { useState, useRef } from "react";
import { useAppStore } from "../store";
import { PageHeader, Card, Btn, Modal, Field, SField } from "../components/ui";
import { Upload, FileText, Check, AlertCircle, Trash2, Plus, Save, Loader2 } from "lucide-react";
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { GoogleGenAI, Type } from "@google/genai";
import { genId, todayStr } from "../utils";
import { safeJsonParse } from "../utils/jsonUtils";
import { InventoryItem, ImportLog } from "../types";

// PDF.js worker setup
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

interface ExtractedItem {
  skuCode: string;
  itemName: string;
  category: string;
  subCategory: string;
  unit: string;
  openingStock: number;
  condition: string;
  remarks: string;
  error?: string;
}

export const InventoryImport = () => {
  const { inventory, setInventory, user, role, setImportLogs, logActivity } = useAppStore();
  const [file, setFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedItems, setExtractedItems] = useState<ExtractedItem[]>([]);
  const [step, setStep] = useState(1); // 1: Upload, 2: Preview
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canImport = role === "Super Admin" || role === "Director" || role === "AGM";

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
        contents: `Extract inventory items from the following text extracted from a PDF. 
        The table structure is likely: Sr No | Item Name | SKU Code | Category | Unit | Total Avl | Remarks.
        
        Return a JSON array of objects with these fields:
        - skuCode (string)
        - itemName (string)
        - category (string)
        - subCategory (string, default "NA")
        - unit (string)
        - openingStock (number)
        - condition (string, default "NA")
        - remarks (string)

        Text:
        ${text}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                skuCode: { type: Type.STRING },
                itemName: { type: Type.STRING },
                category: { type: Type.STRING },
                subCategory: { type: Type.STRING },
                unit: { type: Type.STRING },
                openingStock: { type: Type.NUMBER },
                condition: { type: Type.STRING },
                remarks: { type: Type.STRING },
              },
              required: ["skuCode", "itemName", "category", "unit", "openingStock"],
            },
          },
        },
      });

      const items = safeJsonParse(response.text, []);
      
      // Validate items
      const validatedItems = items.map((item: any) => {
        const validConditions = ["New", "Good", "Needs Repair", "Damaged", "NA"];
        return {
          ...item,
          subCategory: item.subCategory || "NA",
          condition: validConditions.includes(item.condition) ? item.condition : "NA",
          remarks: item.remarks || "",
          error: (!item.skuCode || !item.itemName || isNaN(item.openingStock)) ? "Missing required fields" : undefined
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

  const handleEditItem = (index: number, field: keyof ExtractedItem, value: any) => {
    const updated = [...extractedItems];
    updated[index] = { ...updated[index], [field]: value };
    
    // Re-validate
    const item = updated[index];
    updated[index].error = (!item.skuCode || !item.itemName || isNaN(item.openingStock)) ? "Missing required fields" : undefined;
    
    setExtractedItems(updated);
  };

  const handleDeleteItem = (index: number) => {
    setExtractedItems(extractedItems.filter((_, i) => i !== index));
  };

  const handleAddItem = () => {
    setExtractedItems([
      ...extractedItems,
      {
        skuCode: "",
        itemName: "",
        category: "",
        subCategory: "NA",
        unit: "NOS",
        openingStock: 0,
        condition: "NA",
        remarks: "",
        error: "Missing required fields"
      }
    ]);
  };

  const handleImport = async () => {
    if (extractedItems.some(i => i.error)) {
      alert("Please fix all errors before importing.");
      return;
    }

    let updatedCount = 0;
    let skippedCount = 0;
    let newCount = 0;

    const newInventory = [...inventory];
    
    for (const item of extractedItems) {
      const existingIdx = newInventory.findIndex(i => i.sku === item.skuCode);
      
      if (existingIdx >= 0) {
        const choice = confirm(`SKU ${item.skuCode} (${item.itemName}) already exists. Update stock? (Cancel to skip)`);
        if (choice) {
          newInventory[existingIdx] = {
            ...newInventory[existingIdx],
            liveStock: newInventory[existingIdx].liveStock + item.openingStock,
            lastAdjustmentReason: "PDF Import Update",
            lastAdjustedBy: user?.name,
            lastAdjustmentDate: todayStr()
          };
          updatedCount++;
        } else {
          skippedCount++;
        }
      } else {
        newInventory.push({
          sku: item.skuCode,
          name: item.itemName,
          category: item.category,
          subCategory: item.subCategory,
          unit: item.unit,
          openingStock: item.openingStock,
          liveStock: item.openingStock,
          condition: item.condition as any,
          lastAdjustmentReason: "Initial PDF Import",
          lastAdjustedBy: user?.name,
          lastAdjustmentDate: todayStr()
        });
        newCount++;
      }
    }

    setInventory(newInventory);

    const log: ImportLog = {
      importId: genId("IMP", Date.now()),
      fileName: file?.name || "Unknown",
      importedBy: user?.name || "Unknown",
      totalItems: extractedItems.length,
      importDate: todayStr()
    };
    setImportLogs(prev => [log, ...prev]);
    
    await logActivity("Inventory PDF Import", { 
      fileName: file?.name, 
      newItems: newCount, 
      updatedItems: updatedCount, 
      skipped: skippedCount 
    });

    alert(`Import Complete!\nNew Items: ${newCount}\nUpdated: ${updatedCount}\nSkipped: ${skippedCount}`);
    setStep(1);
    setFile(null);
    setExtractedItems([]);
  };

  if (!canImport) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold">Access Denied</h2>
        <p className="text-gray-600">Only Admin or Inventory Managers can import inventory PDFs.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Smart PDF Import" 
        sub="Automatically convert inventory PDF tables into system entries"
      />

      {step === 1 && (
        <Card className="p-12 border-dashed border-2 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <Upload className="w-8 h-8 text-blue-500" />
          </div>
          <h3 className="text-lg font-bold mb-2">Upload Inventory PDF</h3>
          <p className="text-gray-500 mb-6 max-w-md">
            Upload a PDF containing a table of inventory items. Our AI will extract the data for you to review.
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
            className={isExtracting ? "animate-pulse" : ""}
          />
          {isExtracting && (
            <p className="mt-4 text-sm text-blue-600 font-medium">
              Analyzing PDF structure and extracting items...
            </p>
          )}
        </Card>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              <span className="font-medium text-gray-700">
                Extracted {extractedItems.length} items from {file?.name}
              </span>
            </div>
            <div className="flex gap-2">
              <Btn label="Add Row" icon={Plus} outline onClick={handleAddItem} />
              <Btn label="Cancel" outline onClick={() => { setStep(1); setExtractedItems([]); }} />
              <Btn label="Import Inventory" icon={Save} onClick={handleImport} />
            </div>
          </div>

          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-[#E8ECF0]">
                    <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">SKU Code</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Item Name</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Sub Category</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Unit</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider text-right">Stock</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Condition</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Remarks</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8ECF0]">
                  {extractedItems.map((item, idx) => (
                    <tr key={idx} className={`hover:bg-gray-50/50 ${item.error ? "bg-red-50" : ""}`}>
                      <td className="px-2 py-2">
                        <input
                          type="text"
                          value={item.skuCode}
                          onChange={(e) => handleEditItem(idx, "skuCode", e.target.value)}
                          className={`w-full px-2 py-1 border rounded text-[13px] ${item.error && !item.skuCode ? "border-red-500" : "border-gray-200"}`}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="text"
                          value={item.itemName}
                          onChange={(e) => handleEditItem(idx, "itemName", e.target.value)}
                          className={`w-full px-2 py-1 border rounded text-[13px] ${item.error && !item.itemName ? "border-red-500" : "border-gray-200"}`}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="text"
                          value={item.category}
                          onChange={(e) => handleEditItem(idx, "category", e.target.value)}
                          className="w-full px-2 py-1 border border-gray-200 rounded text-[13px]"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="text"
                          value={item.subCategory}
                          onChange={(e) => handleEditItem(idx, "subCategory", e.target.value)}
                          className="w-full px-2 py-1 border border-gray-200 rounded text-[13px]"
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
                      <td className="px-2 py-2 text-right">
                        <input
                          type="number"
                          value={item.openingStock}
                          onChange={(e) => handleEditItem(idx, "openingStock", Number(e.target.value))}
                          className={`w-20 px-2 py-1 border rounded text-[13px] text-right ${item.error && isNaN(item.openingStock) ? "border-red-500" : "border-gray-200"}`}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <select
                          value={item.condition}
                          onChange={(e) => handleEditItem(idx, "condition", e.target.value)}
                          className="w-full px-2 py-1 border border-gray-200 rounded text-[13px]"
                        >
                          <option value="New">New</option>
                          <option value="Good">Good</option>
                          <option value="Needs Repair">Needs Repair</option>
                          <option value="Damaged">Damaged</option>
                          <option value="NA">NA</option>
                        </select>
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="text"
                          value={item.remarks}
                          onChange={(e) => handleEditItem(idx, "remarks", e.target.value)}
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
          
          {extractedItems.some(i => i.error) && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Some rows have missing required fields (SKU, Name, or Stock). Please correct them before importing.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
