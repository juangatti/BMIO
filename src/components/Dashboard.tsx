"use client";

import React, { useState, useTransition } from "react";
import { Plus, AlertTriangle } from "lucide-react";
import Spinner from "@/components/ui/Spinner";

// Server Actions
import {
  pourBeer,
  updateKegStatus,
  addStockItem,
  adjustStockItemQuantity,
  addReservation,
  updateReservationStatus,
  addSale,
  addKeg,
  addPrebatch,
  consumePrebatch,
  deletePrebatch,
  addSchedule,
  deleteSchedule,
  updateBarConfig,
  addUser,
  toggleUserActive,
  updateUserProfile,
  updateTenantBranding,
  updateRolePermissions,
  addCategory,
  deleteCategory,
  addExpense,
  deleteExpense,
  bulkImportStock,
  updateStockItem,
} from "@/db/actions";

// Atoms & Molecules
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";

// Organisms & Tabs
import Sidebar from "@/components/organisms/Sidebar";
import Topbar from "@/components/organisms/Topbar";
import BulkImportModal from "@/components/organisms/BulkImportModal";
import OverviewTab from "@/components/organisms/tabs/OverviewTab";
import TapsTab from "@/components/organisms/tabs/TapsTab";
import InventoryTab from "@/components/organisms/tabs/InventoryTab";
import FinancialsTab from "@/components/organisms/tabs/FinancialsTab";
import ExpensesTab from "@/components/organisms/tabs/ExpensesTab";
import ReservationsTab from "@/components/organisms/tabs/ReservationsTab";
import PrebatchesTab from "@/components/organisms/tabs/PrebatchesTab";
import SchedulesTab from "@/components/organisms/tabs/SchedulesTab";
import StaffTab from "@/components/organisms/tabs/StaffTab";
import SettingsTab from "@/components/organisms/tabs/SettingsTab";

// Template Shell
import DashboardShell from "@/components/templates/DashboardShell";

interface DashboardProps {
  initialData: {
    tenant: any;
    categories: any[];
    stockItems: any[];
    kegs: any[];
    reservations: any[];
    sales: any[];
    prebatches: any[];
    schedules: any[];
    barConfigs: any[];
    users: any[];
    expenses: any[];
    stockMovements: any[];
  };
  tenantId: string;
  currentUser?: any;
}

export default function Dashboard({ initialData, tenantId, currentUser }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "taps"
    | "inventory"
    | "reservations"
    | "prebatches"
    | "schedules"
    | "staff"
    | "settings"
    | "financials"
    | "expenses"
  >("overview");

  const [activeSettingsTab, setActiveSettingsTab] = useState<
    "profile" | "branding" | "categories" | "permissions"
  >("profile");

  const [isPending, startTransition] = useTransition();
  const [localData] = useState(initialData);

  // Expenses & Financials states
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [newExpense, setNewExpense] = useState({
    amount: "",
    category: "Inventory",
    description: "",
    invoiceNumber: "",
    supplierName: "",
    status: "Pending",
    dueDate: "",
  });
  const [expenseSearch, setExpenseSearch] = useState("");
  const [expenseCatFilter, setExpenseCatFilter] = useState("All");
  const [expenseStatusFilter, setExpenseStatusFilter] = useState("All");

  // Inventory states
  const [isModifyingInventory, setIsModifyingInventory] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);

  // Stock movements states
  const [movementSearch, setMovementSearch] = useState("");
  const [movementTypeFilter, setMovementTypeFilter] = useState("All");

  // Inventory sub-navigation and detail sheets states
  const [activeInventorySubTab, setActiveInventorySubTab] = useState<
    "stock" | "files" | "recipes" | "products" | "detail" | "movements"
  >("files");
  const [selectedIngredientId, setSelectedIngredientId] = useState<string | null>(null);
  const [inventorySearchQuery, setInventorySearchQuery] = useState("");
  const [isEditingIngredientDetail, setIsEditingIngredientDetail] = useState(false);
  const [detailForm, setDetailForm] = useState({
    name: "",
    categoryId: "",
    quantity: 0,
    unit: "units",
    price: 0,
    minStock: 0,
  });
  const [showUnsavedPrompt, setShowUnsavedPrompt] = useState(false);
  const [pendingSubTabSwitch, setPendingSubTabSwitch] = useState<
    "stock" | "files" | "recipes" | "products" | "detail" | "movements" | null
  >(null);
  const [showSaveConfirmModal, setShowSaveConfirmModal] = useState(false);

  const activeConfig = localData.barConfigs?.[0];
  const allowStaffStockAdjust = activeConfig?.allowStaffStockAdjust ?? false;
  const canAdjustStock = !(currentUser?.role === "staff" && !allowStaffStockAdjust);
  const allowCashierKegManage = activeConfig?.allowCashierKegManage ?? false;
  const allowKitchenViewSales = activeConfig?.allowKitchenViewSales ?? false;

  // Profile settings state
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    password: "",
  });

  // Branding settings state
  const [brandingForm, setBrandingForm] = useState({
    displayName: localData.tenant?.displayName || "",
    logoUrl: localData.tenant?.logoUrl || "",
    primaryColor: localData.tenant?.primaryColor || "#f59e0b",
    tapCount: localData.tenant?.tapCount ?? 8,
  });

  // New category state
  const [newCategoryName, setNewCategoryName] = useState("");

  // Permissions state
  const [permissionsForm, setPermissionsForm] = useState({
    allowStaffStockAdjust: activeConfig?.allowStaffStockAdjust ?? false,
    allowCashierKegManage: activeConfig?.allowCashierKegManage ?? false,
    allowKitchenViewSales: activeConfig?.allowKitchenViewSales ?? false,
  });

  // Modal display states
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "staff" as "admin" | "cashier" | "kitchen" | "staff",
  });

  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [showAddReservationModal, setShowAddReservationModal] = useState(false);
  const [showAddKegModal, setShowAddKegModal] = useState(false);
  const [showAddPrebatchModal, setShowAddPrebatchModal] = useState(false);
  const [showAddScheduleModal, setShowAddScheduleModal] = useState(false);

  const [newStockItem, setNewStockItem] = useState({
    name: "",
    categoryId: "",
    quantity: 0,
    unit: "units",
    minStock: 0,
    price: 0,
  });
  const [newRes, setNewRes] = useState({
    customerName: "",
    pax: 2,
    tableNumber: "",
    reservationDate: "",
    notes: "",
  });
  const [newKeg, setNewKeg] = useState({
    name: "",
    capacity: 50,
    currentVolume: 50,
  });
  const [newPrebatch, setNewPrebatch] = useState({
    name: "",
    categoryId: "",
    initialQuantityMl: 1000,
    productionDate: "",
    expirationDate: "",
    batchId: "",
  });
  const [newSchedule, setNewSchedule] = useState({
    userId: "",
    workDate: "",
    startTime: "18:00",
    endTime: "02:00",
    notes: "",
  });

  // Pouring simulation state
  const [pouringLiters, setPouringLiters] = useState<number>(0.5);

  const refreshData = async () => {
    window.location.reload();
  };

  const handlePour = async (kegId: string) => {
    startTransition(async () => {
      const res = await pourBeer(kegId, pouringLiters);
      if (res.success) {
        const priceCents = Math.round(pouringLiters * 1000);
        await addSale(tenantId, priceCents, `Simulated beer pour: ${pouringLiters}L`);
        await refreshData();
      }
    });
  };

  const handleTapping = async (kegId: string, tapNumber: number) => {
    startTransition(async () => {
      const res = await updateKegStatus(kegId, "tapped", tapNumber);
      if (res.success) await refreshData();
    });
  };

  const handleUntapping = async (kegId: string) => {
    startTransition(async () => {
      const res = await updateKegStatus(kegId, "stored", null);
      if (res.success) await refreshData();
    });
  };

  const handleEmpty = async (kegId: string) => {
    startTransition(async () => {
      const res = await updateKegStatus(kegId, "empty", null);
      if (res.success) await refreshData();
    });
  };

  const handleReturn = async (kegId: string) => {
    startTransition(async () => {
      const res = await updateKegStatus(kegId, "returned", null);
      if (res.success) await refreshData();
    });
  };

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStockItem.name || !newStockItem.categoryId) return;
    startTransition(async () => {
      const res = await addStockItem({
        tenantId,
        categoryId: newStockItem.categoryId,
        name: newStockItem.name,
        quantity: Number(newStockItem.quantity),
        unit: newStockItem.unit,
        minStock: Number(newStockItem.minStock),
        price: Math.round(Number(newStockItem.price) * 100),
      });
      if (res.success) {
        setShowAddStockModal(false);
        setNewStockItem({
          name: "",
          categoryId: "",
          quantity: 0,
          unit: "units",
          minStock: 0,
          price: 0,
        });
        await refreshData();
      }
    });
  };

  const handleAdjustStock = async (itemId: string, newQty: number) => {
    startTransition(async () => {
      const res = await adjustStockItemQuantity(itemId, newQty, currentUser?.id);
      if (res.success) await refreshData();
    });
  };

  const handleConfirmBulkImport = async (validItems: any[]) => {
    const res = await bulkImportStock(
      tenantId,
      currentUser?.id,
      validItems.map((item) => ({
        name: item.name,
        categoryName: item.categoryName,
        quantity: item.quantity,
        unit: item.unit,
        price: item.price,
        minStock: item.minStock,
      }))
    );
    if (res.success) {
      startTransition(async () => {
        await refreshData();
      });
    }
    return res;
  };

  const handleOpenIngredientDetail = (item: any) => {
    setSelectedIngredientId(item.id);
    setDetailForm({
      name: item.name,
      categoryId: item.categoryId,
      quantity: item.quantity,
      unit: item.unit,
      price: item.price / 100,
      minStock: item.minStock,
    });
    setIsEditingIngredientDetail(false);
    setActiveInventorySubTab("detail");
  };

  const isFormDirty = () => {
    const selectedItem = localData.stockItems.find((si) => si.id === selectedIngredientId);
    if (!selectedItem) return false;
    return (
      detailForm.name !== selectedItem.name ||
      detailForm.categoryId !== selectedItem.categoryId ||
      detailForm.quantity !== selectedItem.quantity ||
      detailForm.unit !== selectedItem.unit ||
      Math.round(Number(detailForm.price) * 100) !== selectedItem.price ||
      detailForm.minStock !== selectedItem.minStock
    );
  };

  const handleSubTabSwitch = (
    targetTab: "stock" | "files" | "recipes" | "products" | "detail" | "movements"
  ) => {
    if (activeInventorySubTab === "detail" && isEditingIngredientDetail && isFormDirty()) {
      setPendingSubTabSwitch(targetTab);
      setShowUnsavedPrompt(true);
    } else {
      setActiveInventorySubTab(targetTab);
      setIsEditingIngredientDetail(false);
      if (targetTab !== "detail") {
        setSelectedIngredientId(null);
      }
    }
  };

  const handleSaveIngredientDetail = async () => {
    if (!selectedIngredientId) return;
    startTransition(async () => {
      const res = await updateStockItem(
        selectedIngredientId,
        {
          name: detailForm.name,
          categoryId: detailForm.categoryId,
          quantity: Number(detailForm.quantity),
          unit: detailForm.unit,
          price: Math.round(Number(detailForm.price) * 100),
          minStock: Number(detailForm.minStock),
        },
        currentUser?.id
      );

      if (res.success) {
        await refreshData();
        setIsEditingIngredientDetail(false);
        setShowSaveConfirmModal(false);
        if (pendingSubTabSwitch) {
          setActiveInventorySubTab(pendingSubTabSwitch);
          setSelectedIngredientId(null);
          setPendingSubTabSwitch(null);
        }
      } else {
        alert(res.error || "Failed to update item");
      }
    });
  };

  const handleDiscardChanges = () => {
    setShowUnsavedPrompt(false);
    setIsEditingIngredientDetail(false);
    if (pendingSubTabSwitch) {
      setActiveInventorySubTab(pendingSubTabSwitch);
      if (pendingSubTabSwitch !== "detail") {
        setSelectedIngredientId(null);
      }
      setPendingSubTabSwitch(null);
    }
  };

  const handleCancelSwitch = () => {
    setShowUnsavedPrompt(false);
    setPendingSubTabSwitch(null);
  };

  const handleAddReservationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRes.customerName || !newRes.tableNumber || !newRes.reservationDate) return;
    startTransition(async () => {
      const res = await addReservation({
        tenantId,
        customerName: newRes.customerName,
        pax: Number(newRes.pax),
        tableNumber: newRes.tableNumber,
        reservationDate: new Date(newRes.reservationDate),
        notes: newRes.notes,
      });
      if (res.success) {
        setShowAddReservationModal(false);
        setNewRes({ customerName: "", pax: 2, tableNumber: "", reservationDate: "", notes: "" });
        await refreshData();
      }
    });
  };

  const handleReservationStatusUpdate = async (
    resId: string,
    status: "pending" | "confirmed" | "cancelled"
  ) => {
    startTransition(async () => {
      const res = await updateReservationStatus(resId, status);
      if (res.success) await refreshData();
    });
  };

  const handleAddPrebatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrebatch.name || !newPrebatch.initialQuantityMl || !newPrebatch.productionDate) return;
    startTransition(async () => {
      const res = await addPrebatch({
        tenantId,
        categoryId: newPrebatch.categoryId || null,
        name: newPrebatch.name,
        productionDate: new Date(newPrebatch.productionDate),
        expirationDate: newPrebatch.expirationDate
          ? new Date(newPrebatch.expirationDate)
          : null,
        initialQuantityMl: Number(newPrebatch.initialQuantityMl),
        batchId: newPrebatch.batchId,
      });
      if (res.success) {
        setShowAddPrebatchModal(false);
        setNewPrebatch({
          name: "",
          categoryId: "",
          initialQuantityMl: 1000,
          productionDate: "",
          expirationDate: "",
          batchId: "",
        });
        await refreshData();
      }
    });
  };

  const handleConsumePrebatchClick = async (prebatchId: string, amountMl: number) => {
    startTransition(async () => {
      const res = await consumePrebatch(prebatchId, amountMl);
      if (res.success) await refreshData();
    });
  };

  const handleDeletePrebatchClick = async (prebatchId: string) => {
    startTransition(async () => {
      const res = await deletePrebatch(prebatchId);
      if (res.success) await refreshData();
    });
  };

  const handleAddScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newSchedule.userId ||
      !newSchedule.workDate ||
      !newSchedule.startTime ||
      !newSchedule.endTime
    )
      return;
    startTransition(async () => {
      const res = await addSchedule({
        tenantId,
        userId: newSchedule.userId,
        workDate: new Date(newSchedule.workDate + "T12:00:00"),
        startTime: newSchedule.startTime,
        endTime: newSchedule.endTime,
        notes: newSchedule.notes,
      });
      if (res.success) {
        setShowAddScheduleModal(false);
        setNewSchedule({ userId: "", workDate: "", startTime: "18:00", endTime: "02:00", notes: "" });
        await refreshData();
      }
    });
  };

  const handleDeleteScheduleClick = async (scheduleId: string) => {
    startTransition(async () => {
      const res = await deleteSchedule(scheduleId);
      if (res.success) await refreshData();
    });
  };

  const handleUpdateConfigClick = async (
    configId: string,
    openingTime: string,
    kitchenCloseTime: string,
    barCloseTime: string
  ) => {
    startTransition(async () => {
      const res = await updateBarConfig(configId, { openingTime, kitchenCloseTime, barCloseTime });
      if (res.success) await refreshData();
    });
  };

  const stockAlerts = localData.stockItems.filter((item) => item.quantity <= item.minStock);
  const totalSalesCents = localData.sales.reduce((acc, sale) => acc + sale.amount, 0);
  const totalSalesUSD = (totalSalesCents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  const tapCount = localData.tenant?.tapCount ?? 8;
  const activeTaps = Array.from({ length: tapCount }, (_, i) => {
    const tapNum = i + 1;
    const activeKeg = localData.kegs.find((k) => k.status === "tapped" && k.tapNumber === tapNum);
    return { tapNum, keg: activeKeg };
  });

  const storedKegs = localData.kegs.filter((k) => k.status === "stored");
  const otherKegs = localData.kegs.filter((k) => k.status !== "tapped" && k.status !== "stored");

  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password) return;
    startTransition(async () => {
      const res = await addUser({
        tenantId,
        name: newUser.name,
        email: newUser.email,
        passwordHash: newUser.password,
        role: newUser.role,
      });
      if (res.success) {
        setShowAddUserModal(false);
        setNewUser({ name: "", email: "", password: "", role: "staff" });
        await refreshData();
      }
    });
  };

  const handleToggleUserClick = async (userId: string, isActive: boolean) => {
    startTransition(async () => {
      const res = await toggleUserActive(userId, isActive);
      if (res.success) await refreshData();
    });
  };

  const handleUpdateProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.id) return;
    startTransition(async () => {
      const res = await updateUserProfile(currentUser.id, {
        name: profileForm.name,
        email: profileForm.email,
        passwordHash:
          profileForm.password || currentUser.passwordHash || "hashed_password",
      });
      if (res.success) {
        alert("Profile updated successfully!");
        await refreshData();
      } else {
        alert(res.error || "Failed to update profile");
      }
    });
  };

  const handleUpdateBrandingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateTenantBranding(tenantId, {
        displayName: brandingForm.displayName || null,
        logoUrl: brandingForm.logoUrl || null,
        primaryColor: brandingForm.primaryColor,
        tapCount: brandingForm.tapCount,
      });
      if (res.success) {
        alert("Branding updated successfully!");
        await refreshData();
      } else {
        alert(res.error || "Failed to update branding");
      }
    });
  };

  const handleUpdateRolePermissionsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const configId = localData.barConfigs?.[0]?.id;
    if (!configId) {
      alert("No configuration found to update permissions");
      return;
    }
    startTransition(async () => {
      const res = await updateRolePermissions(configId, {
        allowStaffStockAdjust: permissionsForm.allowStaffStockAdjust,
        allowCashierKegManage: permissionsForm.allowCashierKegManage,
        allowKitchenViewSales: permissionsForm.allowKitchenViewSales,
      });
      if (res.success) {
        alert("Permissions updated successfully!");
        await refreshData();
      } else {
        alert(res.error || "Failed to update permissions");
      }
    });
  };

  const handleCreateCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    startTransition(async () => {
      const res = await addCategory(tenantId, newCategoryName.trim());
      if (res.success) {
        setNewCategoryName("");
        await refreshData();
      } else {
        alert(res.error || "Failed to add category");
      }
    });
  };

  const handleDeleteCategoryClick = async (categoryId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this category? All items in this category will be affected."
      )
    )
      return;
    startTransition(async () => {
      const res = await deleteCategory(categoryId);
      if (res.success) {
        await refreshData();
      } else {
        alert(res.error || "Failed to delete category");
      }
    });
  };

  const handleAddExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.amount || !newExpense.category || !newExpense.description) return;
    startTransition(async () => {
      const res = await addExpense(tenantId, currentUser?.id || "", {
        amount: Math.round(Number(newExpense.amount) * 100),
        category: newExpense.category,
        description: newExpense.description,
        invoiceNumber: newExpense.invoiceNumber || undefined,
        supplierName: newExpense.supplierName || undefined,
        status: newExpense.status,
        dueDate: newExpense.dueDate || undefined,
      });
      if (res.success) {
        setShowAddExpenseModal(false);
        setNewExpense({
          amount: "",
          category: "Inventory",
          description: "",
          invoiceNumber: "",
          supplierName: "",
          status: "Pending",
          dueDate: "",
        });
        await refreshData();
      } else {
        alert(res.error || "Failed to add expense");
      }
    });
  };

  const handleDeleteExpenseClick = async (expenseId: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    startTransition(async () => {
      const res = await deleteExpense(expenseId);
      if (res.success) {
        await refreshData();
      } else {
        alert(res.error || "Failed to delete expense");
      }
    });
  };

  const handleConfirmKegAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeg.name || !newKeg.capacity) return;
    startTransition(async () => {
      const res = await addKeg({
        tenantId,
        name: newKeg.name,
        capacity: Number(newKeg.capacity),
        currentVolume: Number(newKeg.currentVolume),
      });
      if (res.success) {
        setShowAddKegModal(false);
        setNewKeg({ name: "", capacity: 50, currentVolume: 50 });
        await refreshData();
      }
    });
  };

  return (
    <>
      {isPending && (
        <div className="fixed inset-0 bg-zinc-950/70 z-50 flex items-center justify-center pointer-events-none select-none">
          <Spinner />
        </div>
      )}

      <DashboardShell
        sidebar={
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            tenantName={localData.tenant?.displayName || localData.tenant?.name || "Bar Manager IO"}
            role={currentUser?.role}
            logoUrl={localData.tenant?.logoUrl}
          />
        }
        topbar={
          <Topbar
            activeTab={activeTab}
            userName={currentUser?.name || "Staff User"}
            userRole={currentUser?.role || "Staff"}
            onProfileClick={() => {
              setActiveTab("settings");
              setActiveSettingsTab("profile");
            }}
          />
        }
        primaryColor={localData.tenant?.primaryColor}
      >
        {activeTab === "overview" && (
          <OverviewTab
            stockAlerts={stockAlerts}
            localData={localData}
            tapCount={tapCount}
            currentUser={currentUser}
            allowKitchenViewSales={allowKitchenViewSales}
            totalSalesUSD={totalSalesUSD}
            activeTaps={activeTaps}
            handleReservationStatus={handleReservationStatusUpdate}
          />
        )}

        {activeTab === "taps" && (
          <TapsTab
            activeTaps={activeTaps}
            storedKegs={storedKegs}
            otherKegs={otherKegs}
            pouringLiters={pouringLiters}
            setPouringLiters={setPouringLiters}
            currentUser={currentUser}
            allowCashierKegManage={allowCashierKegManage}
            tapCount={tapCount}
            onOpenAddKegModal={() => setShowAddKegModal(true)}
            onPour={handlePour}
            onUntap={handleUntapping}
            onEmpty={handleEmpty}
            onTap={handleTapping}
            onReturn={handleReturn}
          />
        )}

        {activeTab === "inventory" && (
          <InventoryTab
            localData={localData}
            activeInventorySubTab={activeInventorySubTab}
            handleSubTabSwitch={handleSubTabSwitch}
            selectedIngredientId={selectedIngredientId}
            isEditingIngredientDetail={isEditingIngredientDetail}
            setIsEditingIngredientDetail={setIsEditingIngredientDetail}
            detailForm={detailForm}
            setDetailForm={setDetailForm}
            onSaveIngredient={() => setShowSaveConfirmModal(true)}
            onCancelIngredient={() => {
              if (isFormDirty()) {
                setPendingSubTabSwitch(null);
                setShowUnsavedPrompt(true);
              } else {
                setIsEditingIngredientDetail(false);
              }
            }}
            isFormDirty={isFormDirty}
            inventorySearchQuery={inventorySearchQuery}
            setInventorySearchQuery={setInventorySearchQuery}
            isModifyingInventory={isModifyingInventory}
            setIsModifyingInventory={setIsModifyingInventory}
            canAdjustStock={canAdjustStock}
            onAdjustStock={handleAdjustStock}
            onOpenAddStockModal={() => setShowAddStockModal(true)}
            onOpenBulkImportModal={() => setShowBulkImportModal(true)}
            movementSearch={movementSearch}
            setMovementSearch={setMovementSearch}
            movementTypeFilter={movementTypeFilter}
            setMovementTypeFilter={setMovementTypeFilter}
            handleOpenIngredientDetail={handleOpenIngredientDetail}
          />
        )}

        {activeTab === "financials" && (
          <FinancialsTab
            sales={localData.sales}
            expenses={localData.expenses}
            stockItems={localData.stockItems}
          />
        )}

        {activeTab === "expenses" && (
          <ExpensesTab
            expenses={localData.expenses}
            currentUser={currentUser}
            expenseSearch={expenseSearch}
            setExpenseSearch={setExpenseSearch}
            expenseCatFilter={expenseCatFilter}
            setExpenseCatFilter={setExpenseCatFilter}
            expenseStatusFilter={expenseStatusFilter}
            setExpenseStatusFilter={setExpenseStatusFilter}
            onOpenAddModal={() => setShowAddExpenseModal(true)}
            onDeleteExpense={handleDeleteExpenseClick}
          />
        )}

        {activeTab === "reservations" && (
          <ReservationsTab
            reservations={localData.reservations}
            onOpenAddModal={() => setShowAddReservationModal(true)}
            handleReservationStatus={handleReservationStatusUpdate}
          />
        )}

        {activeTab === "prebatches" && (
          <PrebatchesTab
            prebatches={localData.prebatches}
            onOpenAddModal={() => setShowAddPrebatchModal(true)}
            onConsume={handleConsumePrebatchClick}
            onDelete={handleDeletePrebatchClick}
          />
        )}

        {activeTab === "schedules" && (
          <SchedulesTab
            localData={localData}
            onOpenAddModal={() => setShowAddScheduleModal(true)}
            onDeleteSchedule={handleDeleteScheduleClick}
            onUpdateConfig={handleUpdateConfigClick}
          />
        )}

        {activeTab === "staff" && currentUser?.role === "admin" && (
          <StaffTab
            users={localData.users}
            currentUser={currentUser}
            onOpenAddModal={() => setShowAddUserModal(true)}
            onToggleUserActive={handleToggleUserClick}
          />
        )}

        {activeTab === "settings" && (
          <SettingsTab
            currentUser={currentUser}
            localData={localData}
            activeSettingsTab={activeSettingsTab}
            setActiveSettingsTab={setActiveSettingsTab}
            profileForm={profileForm}
            setProfileForm={setProfileForm}
            brandingForm={brandingForm}
            setBrandingForm={setBrandingForm}
            permissionsForm={permissionsForm}
            setPermissionsForm={setPermissionsForm}
            newCategoryName={newCategoryName}
            setNewCategoryName={setNewCategoryName}
            onUpdateProfile={handleUpdateProfileSubmit}
            onUpdateBranding={handleUpdateBrandingSubmit}
            onUpdateRolePermissions={handleUpdateRolePermissionsSubmit}
            onCreateCategory={handleCreateCategorySubmit}
            onDeleteCategory={handleDeleteCategoryClick}
          />
        )}
      </DashboardShell>

      {/* OVERLAY MODAL: EXCEL/SPREADSHEET BULK IMPORT */}
      <BulkImportModal
        isOpen={showBulkImportModal}
        onClose={() => setShowBulkImportModal(false)}
        stockItems={localData.stockItems}
        onConfirmImport={handleConfirmBulkImport}
      />

      {/* OVERLAY MODAL: UNSAVED CHANGES WARNING */}
      {showUnsavedPrompt && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-rose-500/20 rounded-3xl p-6 w-full max-w-md shadow-2xl relative select-none">
            <div className="flex items-center gap-3 mb-4 text-rose-400">
              <AlertTriangle className="w-6 h-6 stroke-[1.5] animate-pulse" />
              <h3 className="text-sm font-bold uppercase tracking-widest">Unsaved Profile Changes</h3>
            </div>
            <p className="text-xs text-text-secondary uppercase mb-6 leading-relaxed font-medium">
              You have modified this ingredient's file attributes. If you proceed, these changes will
              be permanently lost.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={handleCancelSwitch}>
                Stay on File
              </Button>
              <button
                onClick={handleDiscardChanges}
                className="bg-rose-500 hover:bg-rose-600 text-zinc-950 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 active:scale-[0.98] cursor-pointer"
              >
                Discard Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY MODAL: SAVE CHANGES CONFIRMATION */}
      {showSaveConfirmModal && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative select-none">
            <h3 className="text-sm font-bold uppercase tracking-widest text-text-primary mb-2">
              Save Ingredient File changes
            </h3>
            <p className="text-xs text-text-secondary uppercase mb-6 leading-relaxed font-medium">
              Are you sure you want to write these modifications to the database? Existing fields
              will be permanently overwritten.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setShowSaveConfirmModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveIngredientDetail}>
                Confirm Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD STOCK ITEM */}
      {showAddStockModal && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md p-6 relative animate-fadeIn select-none">
            <h2 className="text-sm font-bold uppercase tracking-widest text-text-primary mb-4">
              Add New Stock Item
            </h2>
            <form onSubmit={handleAddStock} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase text-text-secondary mb-1">
                  Item Name
                </label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. Lime Juice"
                  value={newStockItem.name}
                  onChange={(e) => setNewStockItem({ ...newStockItem, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-text-secondary mb-1">
                  Category
                </label>
                <Select
                  required
                  value={newStockItem.categoryId}
                  onChange={(e) => setNewStockItem({ ...newStockItem, categoryId: e.target.value })}
                >
                  <option value="">Select Category</option>
                  {localData.categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase text-text-secondary mb-1">
                    Initial Quantity
                  </label>
                  <Input
                    type="number"
                    step="any"
                    required
                    placeholder="0"
                    value={newStockItem.quantity || ""}
                    onChange={(e) =>
                      setNewStockItem({ ...newStockItem, quantity: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-text-secondary mb-1">Unit</label>
                  <Input
                    type="text"
                    required
                    placeholder="e.g. Liters, cans"
                    value={newStockItem.unit}
                    onChange={(e) => setNewStockItem({ ...newStockItem, unit: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase text-text-secondary mb-1">
                    Unit Cost (USD)
                  </label>
                  <Input
                    type="number"
                    step="any"
                    required
                    placeholder="0.00"
                    value={newStockItem.price || ""}
                    onChange={(e) =>
                      setNewStockItem({ ...newStockItem, price: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-text-secondary mb-1">
                    Min Stock Alert
                  </label>
                  <Input
                    type="number"
                    step="any"
                    required
                    placeholder="0"
                    value={newStockItem.minStock || ""}
                    onChange={(e) =>
                      setNewStockItem({ ...newStockItem, minStock: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button variant="secondary" type="button" onClick={() => setShowAddStockModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save Item
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: REGISTER NEW KEG */}
      {showAddKegModal && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md p-6 relative animate-fadeIn select-none">
            <h2 className="text-sm font-bold uppercase tracking-widest text-text-primary mb-4">
              Register New Keg
            </h2>
            <form onSubmit={handleConfirmKegAdd} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase text-text-secondary mb-1">
                  Keg Label/Name (Matches Stock Item)
                </label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. Patagonia Amber Lager"
                  value={newKeg.name}
                  onChange={(e) => setNewKeg({ ...newKeg, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase text-text-secondary mb-1">
                    Total Capacity (Liters)
                  </label>
                  <Input
                    type="number"
                    required
                    placeholder="50"
                    value={newKeg.capacity}
                    onChange={(e) =>
                      setNewKeg({
                        ...newKeg,
                        capacity: parseFloat(e.target.value) || 0,
                        currentVolume: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-text-secondary mb-1">
                    Current Volume (Liters)
                  </label>
                  <Input
                    type="number"
                    required
                    placeholder="50"
                    value={newKeg.currentVolume}
                    onChange={(e) =>
                      setNewKeg({ ...newKeg, currentVolume: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button variant="secondary" type="button" onClick={() => setShowAddKegModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Register Keg
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: LOG EXPENSE */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md p-6 relative animate-fadeIn select-none">
            <h2 className="text-sm font-bold uppercase tracking-widest text-text-primary mb-4">
              Log Operating Expense
            </h2>
            <form onSubmit={handleAddExpenseSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase text-text-secondary mb-1">
                    Supplier Name
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Heineken Dist."
                    value={newExpense.supplierName}
                    onChange={(e) =>
                      setNewExpense({ ...newExpense, supplierName: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-text-secondary mb-1">
                    Invoice Number
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. INV-99012"
                    value={newExpense.invoiceNumber}
                    onChange={(e) =>
                      setNewExpense({ ...newExpense, invoiceNumber: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase text-text-secondary mb-1">
                    Amount (USD)
                  </label>
                  <Input
                    type="number"
                    step="any"
                    required
                    placeholder="0.00"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-text-secondary mb-1">
                    Category
                  </label>
                  <Select
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                  >
                    <option value="Inventory">Inventory</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Rent">Rent</option>
                    <option value="Payroll">Payroll</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Tax">Tax</option>
                    <option value="Other">Other</option>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase text-text-secondary mb-1">
                    Status
                  </label>
                  <Select
                    value={newExpense.status}
                    onChange={(e) => setNewExpense({ ...newExpense, status: e.target.value })}
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-text-secondary mb-1">
                    Due Date
                  </label>
                  <Input
                    type="date"
                    value={newExpense.dueDate}
                    onChange={(e) => setNewExpense({ ...newExpense, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-text-secondary mb-1">
                  Description / Details
                </label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. Purchase of 4 Patagonia Amber Lager Kegs"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button variant="secondary" type="button" onClick={() => setShowAddExpenseModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Log Expense
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: NEW RESERVATION BOOKING */}
      {showAddReservationModal && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md p-6 relative animate-fadeIn select-none">
            <h2 className="text-sm font-bold uppercase tracking-widest text-text-primary mb-4">
              Add New Reservation
            </h2>
            <form onSubmit={handleAddReservationSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase text-text-secondary mb-1">
                  Customer Name
                </label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. Carlos Gomez"
                  value={newRes.customerName}
                  onChange={(e) => setNewRes({ ...newRes, customerName: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase text-text-secondary mb-1">
                    Number of Guests (Pax)
                  </label>
                  <Input
                    type="number"
                    required
                    min="1"
                    value={newRes.pax}
                    onChange={(e) =>
                      setNewRes({ ...newRes, pax: parseInt(e.target.value) || 2 })
                    }
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-text-secondary mb-1">
                    Table Assignation
                  </label>
                  <Input
                    type="text"
                    required
                    placeholder="e.g. Table 12, Bar"
                    value={newRes.tableNumber}
                    onChange={(e) => setNewRes({ ...newRes, tableNumber: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-text-secondary mb-1">
                  Reservation Date & Time
                </label>
                <Input
                  type="datetime-local"
                  required
                  value={newRes.reservationDate}
                  onChange={(e) => setNewRes({ ...newRes, reservationDate: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-text-secondary mb-1">
                  Additional Notes
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Celebrating birthday, gluten free options"
                  value={newRes.notes}
                  onChange={(e) => setNewRes({ ...newRes, notes: e.target.value })}
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button variant="secondary" type="button" onClick={() => setShowAddReservationModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save Reservation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: ADD PREBATCH */}
      {showAddPrebatchModal && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md p-6 relative animate-fadeIn select-none">
            <h2 className="text-sm font-bold uppercase tracking-widest text-text-primary mb-4">
              Prep New Beverage Batch
            </h2>
            <form onSubmit={handleAddPrebatchSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase text-text-secondary mb-1">
                  Batch Name / Mix
                </label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. Pre-Batched Margarita Base"
                  value={newPrebatch.name}
                  onChange={(e) => setNewPrebatch({ ...newPrebatch, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase text-text-secondary mb-1">
                    Initial Vol (ml)
                  </label>
                  <Input
                    type="number"
                    required
                    placeholder="3000"
                    value={newPrebatch.initialQuantityMl || ""}
                    onChange={(e) =>
                      setNewPrebatch({
                        ...newPrebatch,
                        initialQuantityMl: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-text-secondary mb-1">
                    Batch Label / ID
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. BATCH-A04"
                    value={newPrebatch.batchId}
                    onChange={(e) => setNewPrebatch({ ...newPrebatch, batchId: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase text-text-secondary mb-1">
                    Production Date
                  </label>
                  <Input
                    type="date"
                    required
                    value={newPrebatch.productionDate}
                    onChange={(e) =>
                      setNewPrebatch({ ...newPrebatch, productionDate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-text-secondary mb-1">
                    Expiration Date
                  </label>
                  <Input
                    type="date"
                    value={newPrebatch.expirationDate}
                    onChange={(e) =>
                      setNewPrebatch({ ...newPrebatch, expirationDate: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button variant="secondary" type="button" onClick={() => setShowAddPrebatchModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save Batch
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: ADD WORK SCHEDULE SHIFT */}
      {showAddScheduleModal && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md p-6 relative animate-fadeIn select-none">
            <h2 className="text-sm font-bold uppercase tracking-widest text-text-primary mb-4">
              Add Staff Shift
            </h2>
            <form onSubmit={handleAddScheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase text-text-secondary mb-1">
                  Staff Member
                </label>
                <Select
                  required
                  value={newSchedule.userId}
                  onChange={(e) => setNewSchedule({ ...newSchedule, userId: e.target.value })}
                >
                  <option value="">Select Staff</option>
                  {localData.users.map((usr) => (
                    <option key={usr.id} value={usr.id}>
                      {usr.name} ({usr.role})
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-text-secondary mb-1">
                  Shift Work Date
                </label>
                <Input
                  type="date"
                  required
                  value={newSchedule.workDate}
                  onChange={(e) => setNewSchedule({ ...newSchedule, workDate: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase text-text-secondary mb-1">
                    Start Time
                  </label>
                  <Input
                    type="time"
                    required
                    value={newSchedule.startTime}
                    onChange={(e) => setNewSchedule({ ...newSchedule, startTime: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-text-secondary mb-1">
                    End Time
                  </label>
                  <Input
                    type="time"
                    required
                    value={newSchedule.endTime}
                    onChange={(e) => setNewSchedule({ ...newSchedule, endTime: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-text-secondary mb-1">
                  Additional Notes
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Main bartender, closing checklist"
                  value={newSchedule.notes}
                  onChange={(e) => setNewSchedule({ ...newSchedule, notes: e.target.value })}
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button variant="secondary" type="button" onClick={() => setShowAddScheduleModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save Shift
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 7: ADD USER */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md p-6 relative animate-fadeIn select-none">
            <h2 className="text-sm font-bold uppercase tracking-widest text-text-primary mb-4">
              Add Staff Member Account
            </h2>
            <form onSubmit={handleAddUserSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase text-text-secondary mb-1">
                  Full Name
                </label>
                <Input
                  type="text"
                  required
                  placeholder="Staff Name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-text-secondary mb-1">
                  Email Address
                </label>
                <Input
                  type="email"
                  required
                  placeholder="staffname@domain.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-text-secondary mb-1">
                  Default Password
                </label>
                <Input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-text-secondary mb-1">
                  System Role
                </label>
                <Select
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({
                      ...newUser,
                      role: e.target.value as "admin" | "cashier" | "kitchen" | "staff",
                    })
                  }
                >
                  <option value="staff">Staff (Standard)</option>
                  <option value="kitchen">Kitchen View Only</option>
                  <option value="cashier">Cashier Ledger Only</option>
                  <option value="admin">System Admin</option>
                </Select>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button variant="secondary" type="button" onClick={() => setShowAddUserModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save Account
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
