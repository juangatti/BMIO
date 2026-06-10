import React from "react";
import { FileText, Beer, Box, History } from "lucide-react";
import StockTable from "../StockTable";
import MovementsTable from "../MovementsTable";
import IngredientDetailCard from "../IngredientDetailCard";
import ActiveAuditTable from "../ActiveAuditTable";
import Button from "../../atoms/Button";
import { AlertTriangle } from "lucide-react";
import InventorySubNav from "../InventorySubNav";
import SubNavLayout from "@/components/templates/SubNavLayout";

interface InventoryTabProps {
  localData: {
    stockItems: any[];
    categories: any[];
    stockMovements: any[];
    users: any[];
  };
  activeInventorySubTab: "stock" | "files" | "recipes" | "products" | "detail" | "movements";
  handleSubTabSwitch: (subTab: any) => void;
  selectedIngredientId: string | null;
  isEditingIngredientDetail: boolean;
  setIsEditingIngredientDetail: (editing: boolean) => void;
  detailForm: {
    name: string;
    categoryId: string;
    quantity: number;
    unit: string;
    price: number;
    minStock: number;
  };
  setDetailForm: (form: any) => void;
  onSaveIngredient: () => void;
  onCancelIngredient: () => void;
  isFormDirty: () => boolean;
  inventorySearchQuery: string;
  setInventorySearchQuery: (query: string) => void;
  isModifyingInventory: boolean;
  setIsModifyingInventory: (modifying: boolean) => void;
  canAdjustStock: boolean;
  onAdjustStock: (itemId: string, newQty: number) => void;
  onOpenAddStockModal: () => void;
  onOpenBulkImportModal: () => void;
  movementSearch: string;
  setMovementSearch: (search: string) => void;
  movementTypeFilter: string;
  setMovementTypeFilter: (filter: string) => void;
  handleOpenIngredientDetail: (item: any) => void;
  activeAudit?: any;
  auditItems?: any[];
  onStartAudit?: () => void;
  onSaveAudit?: (counts: any[]) => void;
  onCancelAudit?: () => void;
  onFinalizeAudit?: () => void;
}

export default function InventoryTab({
  localData,
  activeInventorySubTab,
  handleSubTabSwitch,
  selectedIngredientId,
  isEditingIngredientDetail,
  setIsEditingIngredientDetail,
  detailForm,
  setDetailForm,
  onSaveIngredient,
  onCancelIngredient,
  isFormDirty,
  inventorySearchQuery,
  setInventorySearchQuery,
  isModifyingInventory,
  setIsModifyingInventory,
  canAdjustStock,
  onAdjustStock,
  onOpenAddStockModal,
  onOpenBulkImportModal,
  movementSearch,
  setMovementSearch,
  movementTypeFilter,
  setMovementTypeFilter,
  handleOpenIngredientDetail,
  activeAudit,
  auditItems,
  onStartAudit,
  onSaveAudit,
  onCancelAudit,
  onFinalizeAudit,
}: InventoryTabProps) {
  // Filter stock items by query
  const filteredStockItems = localData.stockItems.filter((item) => {
    const category = localData.categories.find((c) => c.id === item.categoryId);
    return (
      item.name.toLowerCase().includes(inventorySearchQuery.toLowerCase()) ||
      (category ? category.name.toLowerCase().includes(inventorySearchQuery.toLowerCase()) : false)
    );
  });

  return (
    <SubNavLayout
      mobileNav={
        <InventorySubNav
          activeSubTab={activeInventorySubTab}
          onSubTabSwitch={handleSubTabSwitch}
          isMobile={true}
        />
      }
    >
      {/* Inventory Workspace Card */}
      <div className="flex-1 w-full bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 flex flex-col">
        {/* OPTION 1: INGREDIENTS FILES GRID */}
        {activeInventorySubTab === "files" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Search and Top Bar */}
            <div className="pb-5 border-b border-zinc-800/60 flex flex-col md:flex-row gap-4 justify-between items-center">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-text-primary">
                  Ingredients Profiling (Fichas)
                </h3>
                <p className="text-[10px] text-text-secondary mt-0.5 uppercase font-medium">
                  Detailed ingredient properties, unit metrics, and costs
                </p>
              </div>
              <input
                type="text"
                placeholder="Search ingredients..."
                value={inventorySearchQuery}
                onChange={(e) => setInventorySearchQuery(e.target.value)}
                className="bg-zinc-900/50 border border-zinc-800 focus:border-primary/50 text-text-primary rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-primary/20 outline-none transition-all duration-300 w-full md:w-64"
              />
            </div>

            {/* Grid layout */}
            {filteredStockItems.length === 0 ? (
              <p className="text-xs text-text-secondary p-8 text-center uppercase tracking-wider bg-zinc-900/20 rounded-2xl border border-zinc-800/40">
                No ingredients found.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStockItems.map((item) => {
                  const category = localData.categories.find((c) => c.id === item.categoryId);
                  const isLow = item.quantity <= item.minStock;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleOpenIngredientDetail(item)}
                      className="group bg-zinc-900/40 border border-zinc-800/40 hover:border-zinc-700/60 rounded-2xl p-4 transition-all duration-300 hover:bg-zinc-900/80 cursor-pointer select-none flex flex-col justify-between space-y-4"
                    >
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-xs font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-1">
                            {item.name}
                          </span>
                          <span className="text-[8px] font-bold uppercase tracking-wider font-mono bg-zinc-950 border border-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">
                            {category?.name || "Uncategorized"}
                          </span>
                        </div>
                        <p className="text-[9px] text-text-muted font-mono mt-1 uppercase">
                          ID: {item.id.substring(0, 8)}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-900/60">
                        <div>
                          <span className="block text-[8px] uppercase text-text-muted">
                            Stock Level
                          </span>
                          <span
                            className={`text-xs font-mono font-bold ${
                              isLow ? "text-rose-400" : "text-text-primary"
                            }`}
                          >
                            {item.quantity} {item.unit}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[8px] uppercase text-text-muted">
                            Unit Cost
                          </span>
                          <span className="text-xs font-mono font-bold text-text-primary">
                            ${(item.price / 100).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* OPTION 2: INGREDIENT DETAIL FILE */}
        {activeInventorySubTab === "detail" && (() => {
          const item = localData.stockItems.find((si) => si.id === selectedIngredientId);
          if (!item) {
            return (
              <div className="p-8 text-center py-12">
                <p className="text-xs text-text-secondary uppercase">No ingredient selected</p>
                <button
                  onClick={() => handleSubTabSwitch("files")}
                  className="mt-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-text-primary px-4 py-2 rounded-xl text-xs uppercase font-bold transition-all duration-300 cursor-pointer"
                >
                  Back to Ingredients
                </button>
              </div>
            );
          }

          return (
            <IngredientDetailCard
              item={item}
              categories={localData.categories}
              isEditing={isEditingIngredientDetail}
              setIsEditing={setIsEditingIngredientDetail}
              detailForm={detailForm}
              setDetailForm={setDetailForm}
              onSave={onSaveIngredient}
              onCancel={onCancelIngredient}
              onBackToIngredients={() => handleSubTabSwitch("files")}
              isFormDirty={isFormDirty}
            />
          );
        })()}

        {/* OPTION 3: PRODUCTS SECTIONS LIST */}
        {activeInventorySubTab === "products" && (
          <div className="space-y-6 animate-fadeIn py-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 border border-primary/20 text-primary mb-4">
              <Beer className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">
              Products Inventory (Fichas de Productos)
            </h3>
            <p className="text-xs text-text-secondary mt-1 uppercase max-w-md mx-auto">
              Manage bottled products, beer taps, batch prebatches, and ready-to-sell retail menu
              products.
            </p>
            <div className="mt-6 border border-zinc-800 bg-zinc-950/40 rounded-xl p-4 max-w-lg mx-auto text-left">
              <span className="block text-[10px] uppercase font-bold text-text-muted mb-2">
                Connected Sales Menu (Mock Preview)
              </span>
              <ul className="space-y-2 text-xs">
                <li className="flex justify-between items-center border-b border-zinc-900 pb-1.5">
                  <span className="font-semibold">Craft Honey Beer Pint</span>
                  <span className="text-emerald-400 font-mono text-[10px]">$6.50 USD</span>
                </li>
                <li className="flex justify-between items-center border-b border-zinc-900 pb-1.5">
                  <span className="font-semibold">Gin & Tonic Premium</span>
                  <span className="text-emerald-400 font-mono text-[10px]">$8.00 USD</span>
                </li>
                <li className="flex justify-between items-center pb-1.5">
                  <span className="font-semibold">House Sangria Pitcher</span>
                  <span className="text-emerald-400 font-mono text-[10px]">$18.00 USD</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* OPTION 4: STOCK INVENTORY SHEET */}
        {activeInventorySubTab === "stock" && (
          <>
            {activeAudit && auditItems && onSaveAudit && onCancelAudit && onFinalizeAudit ? (
              <ActiveAuditTable
                stockItems={localData.stockItems}
                auditItems={auditItems}
                categories={localData.categories}
                onSaveProgress={onSaveAudit}
                onCancelAudit={onCancelAudit}
                onFinalizeAudit={onFinalizeAudit}
              />
            ) : (
              <div className="space-y-4">
                <div className="flex justify-end mb-4">
                  <Button variant="primary" onClick={onStartAudit} className="animate-pulse">
                    <AlertTriangle className="w-4 h-4 mr-2" /> Start Stock Control
                  </Button>
                </div>
                <StockTable
                  stockItems={filteredStockItems}
                  categories={localData.categories}
                  isModifying={isModifyingInventory}
                  setIsModifying={setIsModifyingInventory}
                  canAdjustStock={canAdjustStock}
                  onOpenDetail={handleOpenIngredientDetail}
                  onAdjustStock={onAdjustStock}
                  onOpenAddModal={onOpenAddStockModal}
                  onOpenImportModal={onOpenBulkImportModal}
                  searchQuery={inventorySearchQuery}
                  setSearchQuery={setInventorySearchQuery}
                />
              </div>
            )}
          </>
        )}

        {/* OPTION 5: STOCK MOVEMENTS (STOCK LOGS) */}
        {activeInventorySubTab === "movements" && (
          <MovementsTable
            stockMovements={localData.stockMovements}
            stockItems={localData.stockItems}
            users={localData.users}
            searchQuery={movementSearch}
            setSearchQuery={setMovementSearch}
            typeFilter={movementTypeFilter}
            setTypeFilter={setMovementTypeFilter}
          />
        )}
      </div>
    </SubNavLayout>
  );
}
