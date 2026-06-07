import React, { useState } from "react";
import Button from "../atoms/Button";
import Textarea from "../atoms/Textarea";

interface ParsedItem {
  name: string;
  categoryName: string;
  quantity: number;
  unit: string;
  price: number;
  priceUSD: number;
  minStock: number;
  status: "create" | "update" | "invalid";
  error?: string;
}

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  stockItems: any[];
  onConfirmImport: (validItems: any[]) => Promise<{ success: boolean; error?: string }>;
}

export default function BulkImportModal({
  isOpen,
  onClose,
  stockItems,
  onConfirmImport,
}: BulkImportModalProps) {
  const [bulkInput, setBulkInput] = useState("");
  const [parsedImportItems, setParsedImportItems] = useState<ParsedItem[]>([]);
  const [importError, setImportError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleParseBulkInput = () => {
    setImportError(null);
    if (!bulkInput.trim()) {
      setImportError("Please paste some data to import.");
      setParsedImportItems([]);
      return;
    }

    const lines = bulkInput.split(/\r?\n/);
    const parsed: ParsedItem[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      let cols = line.split("\t");
      if (cols.length < 2) {
        cols = line.split(",");
      }

      const cleanCols = cols.map((c) => c.trim().replace(/^["']|["']$/g, ""));
      const firstCol = cleanCols[0].toLowerCase();

      // Skip header line if detected
      if (
        i === 0 &&
        (firstCol === "name" ||
          firstCol === "item" ||
          firstCol === "item name" ||
          firstCol === "nombre" ||
          firstCol === "product" ||
          firstCol === "producto" ||
          firstCol === "item_name")
      ) {
        continue;
      }

      const name = cleanCols[0] || "";
      const categoryName = cleanCols[1] || "Uncategorized";
      const quantityStr = cleanCols[2] || "0";
      const unit = cleanCols[3] || "units";
      const priceStr = cleanCols[4] || "0";
      const minStockStr = cleanCols[5] || "0";

      if (!name) {
        parsed.push({
          name: `Row ${i + 1}`,
          categoryName,
          quantity: 0,
          unit,
          price: 0,
          priceUSD: 0,
          minStock: 0,
          status: "invalid",
          error: "Missing item name",
        });
        continue;
      }

      const quantity = parseFloat(quantityStr);
      const priceUSD = parseFloat(priceStr.replace(/[^0-9.-]/g, "")); // strip $ etc
      const priceCents = Math.round(priceUSD * 100);
      const minStock = parseFloat(minStockStr);

      if (isNaN(quantity) || quantity < 0) {
        parsed.push({
          name,
          categoryName,
          quantity: 0,
          unit,
          price: 0,
          priceUSD: 0,
          minStock: 0,
          status: "invalid",
          error: `Invalid quantity: "${quantityStr}"`,
        });
        continue;
      }

      if (isNaN(priceUSD) || priceUSD < 0) {
        parsed.push({
          name,
          categoryName,
          quantity,
          unit,
          price: 0,
          priceUSD: 0,
          minStock: 0,
          status: "invalid",
          error: `Invalid price: "${priceStr}"`,
        });
        continue;
      }

      if (isNaN(minStock) || minStock < 0) {
        parsed.push({
          name,
          categoryName,
          quantity,
          unit,
          price: priceCents,
          priceUSD,
          minStock: 0,
          status: "invalid",
          error: `Invalid minimum stock: "${minStockStr}"`,
        });
        continue;
      }

      const exists = stockItems.some((si) => si.name.toLowerCase() === name.toLowerCase());

      parsed.push({
        name,
        categoryName,
        quantity,
        unit,
        price: priceCents,
        priceUSD,
        minStock,
        status: exists ? "update" : "create",
      });
    }

    if (parsed.length === 0) {
      setImportError("No valid rows could be parsed. Check your format.");
    }

    setParsedImportItems(parsed);
  };

  const handleConfirmImport = async () => {
    const validItems = parsedImportItems.filter((item) => item.status !== "invalid");
    if (validItems.length === 0) {
      setImportError("No valid items to import.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await onConfirmImport(validItems);
      if (result.success) {
        setBulkInput("");
        setParsedImportItems([]);
        onClose();
      } else {
        setImportError(result.error || "Failed to import items.");
      }
    } catch (e: any) {
      setImportError(e.message || "Failed to import items.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetModal = () => {
    setBulkInput("");
    setParsedImportItems([]);
    setImportError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl relative">
        <h2 className="text-sm font-bold uppercase tracking-widest text-text-primary mb-4">
          Excel / Spreadsheet Bulk Importer
        </h2>

        {importError && (
          <div className="mb-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl px-4 py-2 text-xs font-mono uppercase tracking-wide">
            {importError}
          </div>
        )}

        {parsedImportItems.length === 0 ? (
          /* Paste Screen */
          <div className="flex-1 flex flex-col space-y-4 overflow-y-auto min-h-0">
            <div className="bg-zinc-950/50 border border-zinc-800/40 rounded-xl p-3.5 text-[10px] text-text-secondary uppercase space-y-1">
              <p className="font-bold text-text-primary">Instructions:</p>
              <p>1. Copy columns from your spreadsheet. The expected order is:</p>
              <p className="text-primary font-mono font-bold mt-1">
                Name | Category | Quantity | Unit | Price (USD) | Min Stock
              </p>
              <p className="mt-2 text-zinc-500">
                Note: Headers are automatically skipped if they contain "name" or similar keywords in the first column.
              </p>
            </div>

            <div className="flex-1 flex flex-col min-h-0">
              <label className="block text-[10px] uppercase text-text-secondary mb-1">
                Paste Spreadsheet Rows Here
              </label>
              <Textarea
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                placeholder={`IPA Beer Can\tBeers\t24\tcans\t3.50\t6`}
                className="flex-1 min-h-[200px] w-full text-xs font-mono resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={resetModal}>
                Cancel
              </Button>
              <Button onClick={handleParseBulkInput}>
                Parse Data
              </Button>
            </div>
          </div>
        ) : (
          /* Preview Screen */
          <div className="flex-1 flex flex-col space-y-4 min-h-0">
            <div className="flex justify-between items-center bg-zinc-950/30 p-2.5 rounded-xl border border-zinc-800/40 text-[10px] uppercase text-text-secondary">
              <span>
                Total Parsed: <strong>{parsedImportItems.length} items</strong>
              </span>
              <span className="flex gap-3">
                <span className="text-emerald-400">
                  Creates: <strong>{parsedImportItems.filter((i) => i.status === "create").length}</strong>
                </span>
                <span className="text-blue-400">
                  Updates: <strong>{parsedImportItems.filter((i) => i.status === "update").length}</strong>
                </span>
                {parsedImportItems.some((i) => i.status === "invalid") && (
                  <span className="text-rose-400">
                    Errors: <strong>{parsedImportItems.filter((i) => i.status === "invalid").length}</strong>
                  </span>
                )}
              </span>
            </div>

            <div className="flex-1 overflow-auto border border-zinc-800/40 rounded-xl bg-zinc-950/20">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/60 text-[9px] text-text-secondary uppercase tracking-wider sticky top-0">
                    <th className="p-3">Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Qty</th>
                    <th className="p-3">Unit</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Min Stock</th>
                    <th className="p-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 text-xs">
                  {parsedImportItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-zinc-900/40">
                      <td className="p-3 font-semibold text-text-primary">
                        <span>{item.name}</span>
                        {item.error && (
                          <span className="block text-[8px] text-rose-400 font-mono lowercase">
                            {item.error}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-text-secondary">{item.categoryName}</td>
                      <td className="p-3 font-mono">{item.quantity}</td>
                      <td className="p-3 text-text-muted font-mono uppercase text-[9px]">
                        {item.unit}
                      </td>
                      <td className="p-3 font-mono">${item.priceUSD.toFixed(2)}</td>
                      <td className="p-3 text-text-muted font-mono">{item.minStock}</td>
                      <td className="p-3 text-right text-[10px]">
                        {item.status === "create" && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase font-bold font-mono tracking-wider">
                            Create
                          </span>
                        )}
                        {item.status === "update" && (
                          <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase font-bold font-mono tracking-wider">
                            Update
                          </span>
                        )}
                        {item.status === "invalid" && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase font-bold font-mono tracking-wider">
                            Invalid
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setParsedImportItems([]);
                  setImportError(null);
                }}
              >
                Back to Edit
              </Button>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={resetModal}>
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmImport}
                  disabled={parsedImportItems.every((i) => i.status === "invalid") || isSubmitting}
                >
                  {isSubmitting ? "Importing..." : "Confirm & Import"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
