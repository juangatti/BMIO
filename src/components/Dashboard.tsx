"use client";

import React, { useState, useTransition } from "react";
import { 
  Beer, 
  Box, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  PlusCircle, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Layers, 
  Plus, 
  Trash2,
  Settings,
  UserCheck,
  LayoutDashboard,
  BarChart3,
  FileText,
  CalendarRange,
  Clock,
  Users
} from "lucide-react";
import Alert from "@/components/ui/Alert";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import StatCard from "@/components/ui/StatCard";

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
  logoutUser,
  addUser,
  toggleUserActive,
  updateUserProfile,
  updateTenantBranding,
  updateRolePermissions,
  addCategory,
  deleteCategory,
  addExpense,
  deleteExpense
} from "@/db/actions";

const getLedColorClass = (current: number, capacity: number) => {
  const pct = (current / capacity) * 100;
  if (pct >= 50) return "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]";
  if (pct >= 15) return "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]";
  return "bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse";
};

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
  const [activeTab, setActiveTab] = useState<"overview" | "taps" | "inventory" | "reservations" | "prebatches" | "schedules" | "staff" | "settings" | "financials" | "expenses">("overview");
  const [activeSettingsTab, setActiveSettingsTab] = useState<"profile" | "branding" | "categories" | "permissions">("profile");
  const [isPending, startTransition] = useTransition();
  const [localData, setLocalData] = useState(initialData);

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

  // Chart Interactive Hovers
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; label: string; revenue: number; expense: number } | null>(null);
  const [hoveredSlice, setHoveredSlice] = useState<{ category: string; amount: number; percentage: number; color: string } | null>(null);

  const activeConfig = localData.barConfigs?.[0];
  const allowStaffStockAdjust = activeConfig?.allowStaffStockAdjust ?? false;
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

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "staff" as "admin" | "cashier" | "kitchen" | "staff"
  });

  // Forms states
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
    price: 0
  });
  const [newRes, setNewRes] = useState({
    customerName: "",
    pax: 2,
    tableNumber: "",
    reservationDate: "",
    notes: ""
  });
  const [newKeg, setNewKeg] = useState({
    name: "",
    capacity: 50,
    currentVolume: 50
  });
  const [newPrebatch, setNewPrebatch] = useState({
    name: "",
    categoryId: "",
    initialQuantityMl: 1000,
    productionDate: "",
    expirationDate: "",
    batchId: ""
  });
  const [newSchedule, setNewSchedule] = useState({
    userId: "",
    workDate: "",
    startTime: "18:00",
    endTime: "02:00",
    notes: ""
  });

  // Pouring simulation state
  const [pouringLiters, setPouringLiters] = useState<number>(0.5);

  const navigationItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "taps", label: "Beer Taps", icon: Beer },
    { id: "inventory", label: "Inventory", icon: Box },
    { id: "financials", label: "Financials", icon: BarChart3 },
    { id: "expenses", label: "Expenses", icon: FileText },
    { id: "reservations", label: "Reservations", icon: CalendarRange },
    { id: "prebatches", label: "Prebatches", icon: Layers },
    { id: "schedules", label: "Schedules", icon: Clock },
    ...(currentUser?.role === "admin" ? [{ id: "staff", label: "Staff", icon: Users }] : []),
    { id: "settings", label: "Settings", icon: Settings },
  ] as const;

  const formatBreadcrumb = (tab: string) => {
    const map: Record<string, string> = {
      overview: "Overview",
      taps: "Beer Taps",
      inventory: "Inventory",
      financials: "Financials",
      expenses: "Expenses",
      reservations: "Reservations",
      prebatches: "Prebatches",
      schedules: "Schedules",
      staff: "Staff",
      settings: "Settings",
    };
    return map[tab] || tab;
  };

  // Refresh helper
  const refreshData = async () => {
    // Because server actions use revalidatePath, reloading next page updates server values.
    // However, to keep it fast, we can also refresh client-side or trigger window location reload.
    window.location.reload();
  };

  const handlePour = async (kegId: string) => {
    startTransition(async () => {
      const res = await pourBeer(kegId, pouringLiters);
      if (res.success) {
        // Record as a simulated sale (e.g. 5 USD per pint)
        const priceCents = Math.round(pouringLiters * 1000); // simulated price
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
        price: Math.round(Number(newStockItem.price) * 100) // to cents
      });
      if (res.success) {
        setShowAddStockModal(false);
        setNewStockItem({ name: "", categoryId: "", quantity: 0, unit: "units", minStock: 0, price: 0 });
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

  const handleAddReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRes.customerName || !newRes.tableNumber || !newRes.reservationDate) return;
    startTransition(async () => {
      const res = await addReservation({
        tenantId,
        customerName: newRes.customerName,
        pax: Number(newRes.pax),
        tableNumber: newRes.tableNumber,
        reservationDate: new Date(newRes.reservationDate),
        notes: newRes.notes
      });
      if (res.success) {
        setShowAddReservationModal(false);
        setNewRes({ customerName: "", pax: 2, tableNumber: "", reservationDate: "", notes: "" });
        await refreshData();
      }
    });
  };

  const handleReservationStatus = async (resId: string, status: "pending" | "confirmed" | "cancelled") => {
    startTransition(async () => {
      const res = await updateReservationStatus(resId, status);
      if (res.success) await refreshData();
    });
  };

  const handleAddPrebatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrebatch.name || !newPrebatch.initialQuantityMl || !newPrebatch.productionDate) return;
    startTransition(async () => {
      const res = await addPrebatch({
        tenantId,
        categoryId: newPrebatch.categoryId || null,
        name: newPrebatch.name,
        productionDate: new Date(newPrebatch.productionDate),
        expirationDate: newPrebatch.expirationDate ? new Date(newPrebatch.expirationDate) : null,
        initialQuantityMl: Number(newPrebatch.initialQuantityMl),
        batchId: newPrebatch.batchId
      });
      if (res.success) {
        setShowAddPrebatchModal(false);
        setNewPrebatch({ name: "", categoryId: "", initialQuantityMl: 1000, productionDate: "", expirationDate: "", batchId: "" });
        await refreshData();
      }
    });
  };

  const handleConsumePrebatch = async (prebatchId: string, amountMl: number) => {
    startTransition(async () => {
      const res = await consumePrebatch(prebatchId, amountMl);
      if (res.success) await refreshData();
    });
  };

  const handleDeletePrebatch = async (prebatchId: string) => {
    startTransition(async () => {
      const res = await deletePrebatch(prebatchId);
      if (res.success) await refreshData();
    });
  };

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchedule.userId || !newSchedule.workDate || !newSchedule.startTime || !newSchedule.endTime) return;
    startTransition(async () => {
      const res = await addSchedule({
        tenantId,
        userId: newSchedule.userId,
        workDate: new Date(newSchedule.workDate + "T12:00:00"), // keep time normalized to noon
        startTime: newSchedule.startTime,
        endTime: newSchedule.endTime,
        notes: newSchedule.notes
      });
      if (res.success) {
        setShowAddScheduleModal(false);
        setNewSchedule({ userId: "", workDate: "", startTime: "18:00", endTime: "02:00", notes: "" });
        await refreshData();
      }
    });
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    startTransition(async () => {
      const res = await deleteSchedule(scheduleId);
      if (res.success) await refreshData();
    });
  };

  const handleUpdateConfig = async (configId: string, openingTime: string, kitchenCloseTime: string, barCloseTime: string) => {
    startTransition(async () => {
      const res = await updateBarConfig(configId, { openingTime, kitchenCloseTime, barCloseTime });
      if (res.success) await refreshData();
    });
  };

  // Computations
  const stockAlerts = localData.stockItems.filter(item => item.quantity <= item.minStock);
  const totalSalesCents = localData.sales.reduce((acc, sale) => acc + sale.amount, 0);
  const totalSalesUSD = (totalSalesCents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });

  const tapCount = localData.tenant?.tapCount ?? 8;
  const activeTaps = Array.from({ length: tapCount }, (_, i) => {
    const tapNum = i + 1;
    const activeKeg = localData.kegs.find(k => k.status === "tapped" && k.tapNumber === tapNum);
    return { tapNum, keg: activeKeg };
  });

  const storedKegs = localData.kegs.filter(k => k.status === "stored");
  const otherKegs = localData.kegs.filter(k => k.status !== "tapped" && k.status !== "stored");

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password) return;
    startTransition(async () => {
      const res = await addUser({
        tenantId,
        name: newUser.name,
        email: newUser.email,
        passwordHash: newUser.password,
        role: newUser.role
      });
      if (res.success) {
        setShowAddUserModal(false);
        setNewUser({ name: "", email: "", password: "", role: "staff" });
        await refreshData();
      }
    });
  };

  const handleToggleUser = async (userId: string, isActive: boolean) => {
    startTransition(async () => {
      const res = await toggleUserActive(userId, isActive);
      if (res.success) await refreshData();
    });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.id) return;
    startTransition(async () => {
      const res = await updateUserProfile(currentUser.id, {
        name: profileForm.name,
        email: profileForm.email,
        passwordHash: profileForm.password || currentUser.passwordHash || "hashed_password",
      });
      if (res.success) {
        alert("Profile updated successfully!");
        await refreshData();
      } else {
        alert(res.error || "Failed to update profile");
      }
    });
  };

  const handleUpdateBranding = async (e: React.FormEvent) => {
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

  const handleUpdateRolePermissions = async (e: React.FormEvent) => {
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

  const handleCreateCategory = async (e: React.FormEvent) => {
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

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category? All items in this category will be affected.")) return;
    startTransition(async () => {
      const res = await deleteCategory(categoryId);
      if (res.success) {
        await refreshData();
      } else {
        alert(res.error || "Failed to delete category");
      }
    });
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.amount || !newExpense.category || !newExpense.description) return;
    startTransition(async () => {
      const res = await addExpense(tenantId, currentUser?.id || "", {
        amount: Math.round(Number(newExpense.amount) * 100), // convert to cents
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

  const handleDeleteExpense = async (expenseId: string) => {
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

  return (
    <div 
      className="flex min-h-screen bg-zinc-950 text-text-primary"
      style={{
        // @ts-ignore
        "--color-primary": localData.tenant?.primaryColor || "#f59e0b"
      }}
    >
      {/* Sidebar (Left Navigation Column) */}
      <aside className="w-16 hover:w-64 bg-zinc-950 border-r border-zinc-900/60 flex flex-col shrink-0 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group fixed md:sticky top-0 bottom-0 h-screen select-none z-40">
        {/* Top Section: App Brand */}
        <div className="h-14 border-b border-zinc-900/60 flex items-center px-4 md:px-6 gap-3 shrink-0">
          {localData.tenant?.logoUrl ? (
            <img src={localData.tenant.logoUrl} alt="Logo" className="w-6 h-6 object-contain rounded-lg shrink-0" />
          ) : (
            <div className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-primary/10 border border-primary/20 text-primary shrink-0">
              <Beer className="w-3.5 h-3.5" />
            </div>
          )}
          <div className="hidden group-hover:flex flex-col min-w-0 flex-1 truncate">
            <div className="flex items-center gap-1.5 truncate">
              <span className="font-display font-bold text-sm tracking-wider truncate text-primary">
                {localData.tenant?.displayName || localData.tenant?.name || "Bar Manager IO"}
              </span>
              <span className="text-[8px] font-mono text-zinc-500 border border-zinc-800 bg-zinc-900/40 px-1 rounded uppercase shrink-0">
                v1.0
              </span>
            </div>
          </div>
        </div>

        {/* Middle Section: Navigation Items */}
        <nav className="flex-1 py-4 overflow-y-auto px-2 md:px-3 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as typeof activeTab)}
                className={`w-full flex items-center justify-start gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 relative group ${
                  isActive
                    ? "bg-zinc-900 text-primary border border-zinc-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40 border border-transparent"
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-primary animate-pulse" />
                )}
                <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? "text-primary" : "text-zinc-500 group-hover:text-zinc-400"}`} />
                <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 delay-100 truncate whitespace-nowrap hidden group-hover:inline">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Outer Container */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-hidden">
        {/* Topbar Header (Right Top) */}
        <header className="h-14 border-b border-zinc-900/60 bg-zinc-950/40 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30 shrink-0">
          {/* Left side: Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
            <span className="hover:text-zinc-200 transition-colors">Dashboard</span>
            <span className="text-zinc-600">/</span>
            <span className="text-primary font-semibold font-mono tracking-wide uppercase">{formatBreadcrumb(activeTab)}</span>
          </div>

          {/* Right side: Logout & User Profile */}
          <div className="flex items-center gap-3">
            {/* Subtle Logout button */}
            <button
              onClick={async () => {
                await logoutUser();
                window.location.reload();
              }}
              className="text-[10px] bg-zinc-900 hover:bg-zinc-800 hover:text-rose-400 text-zinc-400 border border-zinc-800 hover:border-rose-500/20 px-2.5 py-1 rounded-lg font-bold uppercase transition-all duration-300 cursor-pointer"
            >
              Logout
            </button>

            {/* Vertical border line separator */}
            <div className="w-[1px] h-5 bg-zinc-900" />

            {/* User profile */}
            <div 
              onClick={() => { setActiveTab("settings"); setActiveSettingsTab("profile"); }}
              className="flex items-center gap-2 hover:bg-zinc-900 px-2 py-1 rounded-lg cursor-pointer transition-colors group"
              title="Go to Settings"
            >
              <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors shrink-0">
                <span className="text-[11px] font-bold font-mono">{(currentUser?.name || "U").substring(0, 1).toUpperCase()}</span>
              </div>
              <div className="hidden sm:block text-left min-w-0">
                <p className="text-xs font-semibold text-zinc-200 group-hover:text-primary transition-colors truncate max-w-[100px]">{currentUser?.name || "User"}</p>
                <p className="text-[9px] text-zinc-500 font-mono leading-none capitalize">{currentUser?.role || "Staff"}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Loading Overlay */}
        {isPending && (
          <div className="fixed inset-0 bg-secondary-dark/60 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-surface border border-secondary p-6 rounded-lg flex items-center gap-3">
              <Spinner />
              <span className="text-xs uppercase tracking-widest text-text-secondary">Syncing with Supabase...</span>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto px-6 py-8 sm:px-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Tab 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-fadeIn">
            {stockAlerts.length > 0 && (
              <Alert message={`Attention: ${stockAlerts.length} stock items are below critical limits! Synchronize with suppliers immediately.`} />
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard 
                label="Registered Stock Items" 
                value={localData.stockItems.length.toString()} 
                unit="items" 
                icon={Box} 
              />
              <StatCard 
                label="Active Beer Taps" 
                value={localData.kegs.filter(k => k.status === "tapped").length.toString()} 
                unit={`/ ${tapCount} active`} 
                icon={Beer} 
              />
              {!(currentUser?.role === 'kitchen' && !allowKitchenViewSales) ? (
                <StatCard 
                  label="Today's Sales Cashflow" 
                  value={totalSalesUSD} 
                  unit="USD" 
                  icon={DollarSign} 
                />
              ) : (
                <StatCard 
                  label="Today's Sales Cashflow" 
                  value="[HIDDEN]" 
                  unit="Restricted" 
                  icon={DollarSign} 
                />
              )}
              <StatCard 
                label="Active Reservations" 
                value={localData.reservations.filter(r => r.status === "confirmed").length.toString()} 
                unit="booked" 
                icon={Calendar} 
              />
            </div>

            {/* Split layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left col: Active Taps Quick View */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <div className="p-6">
                    <h2 className="text-lg font-display text-text-primary mb-4 flex items-center gap-2">
                      <Beer className="text-primary w-5 h-5" /> Taps & Keg Status
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {activeTaps.map(({ tapNum, keg }) => (
                        <div key={tapNum} className="bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800/40 flex flex-col justify-between h-44 relative overflow-hidden group hover:border-zinc-800 transition-all duration-300">
                          {/* Beer Tap head */}
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xl font-mono font-bold text-zinc-600">#{tapNum}</span>
                            <span className={`h-2.5 w-2.5 rounded-full ${keg ? 'bg-amber-500 animate-pulse shadow-[0_0_8px_var(--color-primary)]' : 'bg-zinc-800'}`} />
                          </div>
                          {keg ? (
                            <div className="flex flex-1 items-center gap-3">
                              {/* Metallic Cylinder visualizer */}
                              <div className="relative w-10 h-24 bg-zinc-900 border border-zinc-800/60 rounded-md overflow-hidden shadow-inner flex-shrink-0">
                                <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/20 via-transparent to-zinc-950/60 z-20 pointer-events-none" />
                                <div className="absolute inset-y-0 left-2 w-[1px] bg-white/15 z-20 pointer-events-none" />
                                <div 
                                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 transition-all duration-500"
                                  style={{ height: `${(keg.currentVolume / keg.capacity) * 100}%` }}
                                >
                                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-black/30" />
                                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-amber-400/80 rounded-[50%] -translate-y-[2px] shadow-[0_1px_3px_rgba(251,191,36,0.5)]" />
                                </div>
                                <div className="absolute top-0 left-0 right-0 h-2 bg-zinc-800 border-b border-zinc-950/40 rounded-[50%] z-10 shadow-inner" />
                                <div className="absolute inset-y-1.5 right-1 flex flex-col justify-between text-[6px] font-mono text-zinc-600 z-10 leading-none">
                                  <span>-</span>
                                  <span>-</span>
                                  <span>-</span>
                                  <span>-</span>
                                  <span>-</span>
                                </div>
                              </div>

                              <div className="min-w-0 flex-1 flex flex-col justify-between h-full py-1">
                                <div>
                                  <div className="flex items-center gap-1.5 mb-0.5">
                                    <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${getLedColorClass(keg.currentVolume, keg.capacity)}`} />
                                    <p className="text-xs font-semibold truncate text-text-primary" title={keg.name}>{keg.name}</p>
                                  </div>
                                  <p className="text-[10px] text-text-secondary font-mono">{keg.currentVolume.toFixed(1)}L / {keg.capacity}L</p>
                                </div>
                                <span className="text-[9px] font-mono text-zinc-500 bg-zinc-900/50 border border-zinc-800/40 px-1.5 py-0.5 rounded w-max">
                                  {((keg.currentVolume / keg.capacity) * 100).toFixed(0)}%
                                </span>
                              </div>
                            </div>
                          ) : (
                            <p className="text-[9px] font-mono uppercase tracking-wider text-zinc-600 text-center my-auto">Empty Tap</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>

              {/* Right col: Stock Alerts & Fast Reservations */}
              <div className="space-y-6">
                <Card>
                  <div className="p-6">
                    <h2 className="text-lg font-display text-text-primary mb-4 flex items-center gap-2">
                      <AlertTriangle className="text-accent w-5 h-5" /> Stock Warnings
                    </h2>
                    {stockAlerts.length === 0 ? (
                      <p className="text-xs text-text-muted uppercase tracking-wider text-center py-4">All stock levels normal</p>
                    ) : (
                      <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                        {stockAlerts.map(item => (
                          <div key={item.id} className="flex justify-between items-center p-2 rounded bg-secondary-dark border border-secondary">
                            <div>
                              <p className="text-xs font-semibold text-text-primary">{item.name}</p>
                              <p className="text-[10px] text-accent font-mono">Min: {item.minStock} {item.unit}</p>
                            </div>
                            <span className="text-xs bg-accent/10 text-accent border border-accent/20 px-2 py-1 rounded font-mono">
                              {item.quantity} {item.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>

                <Card>
                  <div className="p-6">
                    <h2 className="text-lg font-display text-text-primary mb-4 flex items-center gap-2">
                      <Calendar className="text-primary w-5 h-5" /> Pending Bookings
                    </h2>
                    {localData.reservations.filter(r => r.status === "pending").length === 0 ? (
                      <p className="text-xs text-text-muted uppercase tracking-wider text-center py-4">No pending reservations</p>
                    ) : (
                      <div className="space-y-3">
                        {localData.reservations.filter(r => r.status === "pending").map(r => (
                          <div key={r.id} className="p-3 bg-secondary-dark rounded border border-secondary flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                              <p className="text-xs font-semibold text-text-primary">{r.customerName}</p>
                              <span className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1.5 py-0.5 rounded font-mono uppercase">Pending</span>
                            </div>
                            <div className="flex justify-between items-center mt-2 text-[10px] text-text-secondary">
                              <span>Pax: {r.pax} | {r.tableNumber}</span>
                              <div className="flex gap-2">
                                <button onClick={() => handleReservationStatus(r.id, "confirmed")} className="text-emerald-400 hover:text-emerald-300">Confirm</button>
                                <button onClick={() => handleReservationStatus(r.id, "cancelled")} className="text-rose-400 hover:text-rose-300">Cancel</button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: BEER TAPS */}
        {activeTab === "taps" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Top control bar */}
            <div className="bg-surface p-4 rounded border border-secondary flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <span className="text-xs uppercase tracking-wider text-text-secondary">Simulate Pour Amount:</span>
                <div className="flex items-center gap-2">
                  <input 
                    type="range" 
                    min="0.1" 
                    max="2.0" 
                    step="0.1" 
                    value={pouringLiters} 
                    onChange={(e) => setPouringLiters(parseFloat(e.target.value))}
                    className="w-32 accent-primary"
                  />
                  <span className="text-xs font-mono font-bold text-primary">{pouringLiters.toFixed(1)} Liters</span>
                </div>
              </div>
              {!(currentUser?.role === "cashier" && !allowCashierKegManage) && (
                <button 
                  onClick={() => setShowAddKegModal(true)}
                  className="bg-primary hover:bg-primary-dark text-secondary-dark px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 active:scale-[0.98] ease-[cubic-bezier(0.32,0.72,0,1)] flex items-center gap-2 shadow-md hover:shadow-primary/10 border border-primary/20"
                >
                  Register New Keg
                  <span className="inline-flex items-center justify-center rounded-full bg-secondary-dark/10 p-0.5 ml-1">
                    <span className="inline-flex items-center justify-center rounded-full bg-secondary-dark/15 p-0.5">
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    </span>
                  </span>
                </button>
              )}
            </div>

            {/* Layout Taps & Stock */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Taps board */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <div className="p-6">
                    <h2 className="text-lg font-display text-text-primary mb-4 uppercase">Connected Taps (1-{tapCount})</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activeTaps.map(({ tapNum, keg }) => (
                        <div key={tapNum} className="bg-zinc-950/50 p-5 rounded-2xl border border-zinc-800/40 flex flex-col justify-between relative overflow-hidden group hover:border-zinc-800 transition-all duration-300">
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-sm font-mono font-bold text-zinc-400">TAP {tapNum}</span>
                            {keg ? (
                              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded uppercase font-mono">Active</span>
                            ) : (
                              <span className="text-[10px] bg-zinc-900 text-zinc-500 px-2 py-0.5 rounded uppercase font-mono">Idle</span>
                            )}
                          </div>

                          {keg ? (
                            <div className="space-y-4">
                              <div className="flex items-center gap-4">
                                {/* Metallic Cylinder visualizer */}
                                <div className="relative w-12 h-28 bg-zinc-900 border border-zinc-800/60 rounded-lg overflow-hidden shadow-inner flex-shrink-0">
                                  <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/20 via-transparent to-zinc-950/60 z-20 pointer-events-none" />
                                  <div className="absolute inset-y-0 left-2 w-[1px] bg-white/15 z-20 pointer-events-none" />
                                  <div 
                                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 transition-all duration-500"
                                    style={{ height: `${(keg.currentVolume / keg.capacity) * 100}%` }}
                                  >
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-black/30" />
                                    <div className="absolute top-0 left-0 right-0 h-2 bg-amber-400/80 rounded-[50%] -translate-y-1 shadow-[0_1px_3px_rgba(251,191,36,0.5)]" />
                                  </div>
                                  <div className="absolute top-0 left-0 right-0 h-2.5 bg-zinc-800 border-b border-zinc-950/40 rounded-[50%] z-10 shadow-inner" />
                                  <div className="absolute inset-y-2 right-1.5 flex flex-col justify-between text-[6px] font-mono text-zinc-500 z-10 leading-none">
                                    <span>100</span>
                                    <span>75</span>
                                    <span>50</span>
                                    <span>25</span>
                                    <span>0</span>
                                  </div>
                                </div>

                                <div className="flex-1 min-w-0 py-1">
                                  <div className="flex items-center gap-1.5 mb-1.5">
                                    <span className={`h-2 w-2 rounded-full shrink-0 ${getLedColorClass(keg.currentVolume, keg.capacity)}`} />
                                    <h3 className="text-sm font-semibold truncate text-text-primary" title={keg.name}>{keg.name}</h3>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-[10px] text-text-secondary font-mono">{keg.currentVolume.toFixed(1)}L / {keg.capacity}L remaining</p>
                                    <span className="inline-block text-[9px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded shadow-sm">
                                      {((keg.currentVolume / keg.capacity) * 100).toFixed(0)}% Fill
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <button 
                                  onClick={() => handlePour(keg.id)}
                                  disabled={keg.currentVolume <= 0 || (currentUser?.role === "cashier" && !allowCashierKegManage)}
                                  className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-800 disabled:text-zinc-600 text-secondary-dark py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 active:scale-[0.98] ease-[cubic-bezier(0.32,0.72,0,1)]"
                                >
                                  Pour {pouringLiters}L
                                </button>
                                {!(currentUser?.role === "cashier" && !allowCashierKegManage) && (
                                  <>
                                    <button 
                                      onClick={() => handleUntapping(keg.id)}
                                      className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-750 text-text-primary px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 active:scale-[0.98] ease-[cubic-bezier(0.32,0.72,0,1)]"
                                    >
                                      Untap
                                    </button>
                                    <button 
                                      onClick={() => handleEmpty(keg.id)}
                                      className="border border-rose-500/30 hover:bg-rose-500/10 text-rose-400 px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 active:scale-[0.98] ease-[cubic-bezier(0.32,0.72,0,1)]"
                                    >
                                      Empty
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="py-4 text-center">
                              <p className="text-xs text-text-muted italic mb-3">No keg active on this tap</p>
                              {storedKegs.length > 0 ? (
                                <div className="flex flex-col gap-1.5 items-center">
                                  <span className="text-[10px] text-text-secondary uppercase">Tap Available Stored:</span>
                                  <div className="flex flex-wrap gap-1 justify-center max-w-full">
                                    {storedKegs.map(sk => (
                                      <button 
                                        key={sk.id}
                                        onClick={() => handleTapping(sk.id, tapNum)}
                                        disabled={currentUser?.role === "cashier" && !allowCashierKegManage}
                                        className="text-[10px] bg-secondary hover:bg-secondary-light border border-secondary-light/30 px-2 py-1 rounded text-text-primary transition-colors truncate max-w-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        Tap {sk.name}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <p className="text-[10px] text-rose-400 uppercase">No stored kegs available. Register or import some!</p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>

              {/* Warehouse Stored Kegs */}
              <div className="space-y-6">
                <Card>
                  <div className="p-6">
                    <h2 className="text-lg font-display text-text-primary mb-4 uppercase">Kegs Warehouse</h2>
                    <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-secondary pb-1 mb-2">Stored / Sealed</h3>
                    {storedKegs.length === 0 ? (
                      <p className="text-xs text-text-muted italic py-3">No kegs stored in warehouse</p>
                    ) : (
                      <div className="space-y-2 mb-6">
                        {storedKegs.map(k => (
                          <div key={k.id} className="flex justify-between items-center p-2.5 bg-secondary-dark rounded border border-secondary">
                            <div>
                              <p className="text-xs font-semibold text-text-primary">{k.name}</p>
                              <p className="text-[10px] text-text-muted font-mono">{k.capacity}L capacity</p>
                            </div>
                            <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded font-mono uppercase">Stored</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-secondary pb-1 mb-2">Other States</h3>
                    {otherKegs.length === 0 ? (
                      <p className="text-xs text-text-muted italic py-3">No other active kegs</p>
                    ) : (
                      <div className="space-y-2">
                        {otherKegs.map(k => (
                          <div key={k.id} className="flex justify-between items-center p-2.5 bg-secondary-dark rounded border border-secondary">
                            <div>
                              <p className="text-xs font-semibold text-text-primary">{k.name}</p>
                              <p className="text-[10px] text-text-muted font-mono">{k.status.toUpperCase()}</p>
                            </div>
                            <div className="flex gap-2 items-center">
                              <span className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase ${k.status === 'empty' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'}`}>
                                {k.status}
                              </span>
                              {k.status === 'empty' && !(currentUser?.role === 'cashier' && !allowCashierKegManage) && (
                                <button 
                                  onClick={() => handleReturn(k.id)}
                                  className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold"
                                >
                                  Return
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: INVENTORY */}
        {activeTab === "inventory" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Top action bar */}
            <div className="bg-surface p-4 rounded border border-secondary flex justify-between items-center">
              <span className="text-xs uppercase tracking-wider text-text-secondary">Stock Inventory List</span>
              <button 
                onClick={() => setShowAddStockModal(true)}
                className="bg-primary hover:bg-primary-dark text-secondary-dark px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 active:scale-[0.98] ease-[cubic-bezier(0.32,0.72,0,1)] flex items-center gap-2 shadow-md hover:shadow-primary/10 border border-primary/20"
              >
                Add Item
                <span className="inline-flex items-center justify-center rounded-full bg-secondary-dark/10 p-0.5 ml-1">
                  <span className="inline-flex items-center justify-center rounded-full bg-secondary-dark/15 p-0.5">
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </span>
                </span>
              </button>
            </div>

            {/* Inventory table */}
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-secondary bg-secondary-dark text-[10px] text-text-secondary uppercase tracking-wider">
                      <th className="p-4">Item Name</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Stock Level</th>
                      <th className="p-4">Unit</th>
                      <th className="p-4">Price</th>
                      {!(currentUser?.role === 'staff' && !allowStaffStockAdjust) && <th className="p-4 text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary">
                    {localData.stockItems.map(item => {
                      const category = localData.categories.find(c => c.id === item.categoryId);
                      const isLow = item.quantity <= item.minStock;
                      return (
                        <tr key={item.id} className="hover:bg-secondary-dark transition-colors">
                          <td className="p-4">
                            <span className="text-xs font-semibold text-text-primary block">{item.name}</span>
                            {isLow && (
                              <span className="inline-flex items-center gap-1 text-[8px] uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1 rounded mt-0.5">
                                <AlertTriangle className="w-2.5 h-2.5" /> Low Stock
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-xs text-text-secondary">{category?.name || "Uncategorized"}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-mono font-semibold ${isLow ? 'text-rose-400' : 'text-text-primary'}`}>{item.quantity}</span>
                              <span className="text-[10px] text-text-muted">/ min {item.minStock}</span>
                            </div>
                          </td>
                          <td className="p-4 text-xs text-text-muted uppercase font-mono">{item.unit}</td>
                          <td className="p-4 text-xs text-text-primary font-mono">${(item.price / 100).toFixed(2)}</td>
                          {!(currentUser?.role === 'staff' && !allowStaffStockAdjust) && (
                            <td className="p-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button 
                                  onClick={() => handleAdjustStock(item.id, item.quantity + 1)}
                                  className="text-[10px] bg-secondary hover:bg-secondary-light px-2.5 py-1 rounded text-text-primary transition-colors font-mono"
                                >
                                  +1
                                </button>
                                <button 
                                  onClick={() => handleAdjustStock(item.id, Math.max(0, item.quantity - 1))}
                                  className="text-[10px] bg-secondary hover:bg-secondary-light px-2.5 py-1 rounded text-text-primary transition-colors font-mono"
                                >
                                  -1
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Stock Movement Log */}
            <Card>
              <div className="p-6 border-b border-secondary">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-text-primary">Stock Movement Log</h3>
                <p className="text-[10px] text-text-secondary mt-1 uppercase">History of stock changes, pours, and manual adjustments</p>
              </div>
              <div className="overflow-x-auto max-h-[350px] overflow-y-auto">
                {(!localData.stockMovements || localData.stockMovements.length === 0) ? (
                  <p className="text-xs text-text-secondary p-8 text-center uppercase tracking-wider">No movements logged yet.</p>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-secondary bg-secondary-dark text-[10px] text-text-secondary uppercase tracking-wider">
                        <th className="p-4">Item Name</th>
                        <th className="p-4">Type</th>
                        <th className="p-4">Quantity Change</th>
                        <th className="p-4">Reason</th>
                        <th className="p-4">User</th>
                        <th className="p-4">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary">
                      {[...localData.stockMovements].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(movement => {
                        const item = localData.stockItems.find(si => si.id === movement.stockItemId);
                        const user = localData.users.find(u => u.id === movement.userId);
                        
                        let typeColor = "bg-blue-500/10 text-blue-400 border border-blue-500/20";
                        if (movement.type === "in") typeColor = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
                        if (movement.type === "out") typeColor = "bg-rose-500/10 text-rose-400 border border-rose-500/20";

                        const formatQty = (qty: number, type: string) => {
                          if (type === "out") return `-${qty}`;
                          if (type === "in") return `+${qty}`;
                          return qty >= 0 ? `+${qty}` : `${qty}`;
                        };

                        return (
                          <tr key={movement.id} className="hover:bg-secondary-dark/50 transition-colors">
                            <td className="p-4 text-xs font-semibold text-text-primary">{item?.name || "Deleted Item"}</td>
                            <td className="p-4">
                              <span className={`text-[9px] px-2 py-0.5 rounded font-mono uppercase ${typeColor}`}>
                                {movement.type}
                              </span>
                            </td>
                            <td className="p-4 text-xs font-mono font-bold text-text-primary">
                              {formatQty(movement.quantity, movement.type)} {item?.unit || ""}
                            </td>
                            <td className="p-4 text-xs text-text-secondary">{movement.reason}</td>
                            <td className="p-4 text-xs text-text-secondary">{user?.name || "System"}</td>
                            <td className="p-4 text-xs text-text-muted font-mono">{new Date(movement.createdAt).toLocaleString()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Tab: FINANCIALS */}
        {activeTab === "financials" && (() => {
          const totalRevenueCents = localData.sales.reduce((sum, s) => sum + s.amount, 0);
          const totalExpensesCents = (localData.expenses || []).reduce((sum, e) => sum + e.amount, 0);
          const netMarginPct = totalRevenueCents > 0 ? ((totalRevenueCents - totalExpensesCents) / totalRevenueCents) * 100 : 0;
          const stockValuationCents = localData.stockItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);

          // SVG Line Chart calculations
          const salesByDate: { [key: string]: number } = {};
          const expensesByDate: { [key: string]: number } = {};

          localData.sales.forEach(sale => {
            const dateStr = new Date(sale.createdAt).toISOString().split("T")[0];
            salesByDate[dateStr] = (salesByDate[dateStr] || 0) + sale.amount;
          });

          (localData.expenses || []).forEach(exp => {
            const dateStr = new Date(exp.createdAt).toISOString().split("T")[0];
            expensesByDate[dateStr] = (expensesByDate[dateStr] || 0) + exp.amount;
          });

          const allDates = Array.from(new Set([...Object.keys(salesByDate), ...Object.keys(expensesByDate)]))
            .sort()
            .slice(-7);

          const chartDates = allDates.length > 0 ? allDates : Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d.toISOString().split("T")[0];
          });

          const chartData = chartDates.map(date => ({
            date,
            revenue: (salesByDate[date] || 0) / 100,
            expense: (expensesByDate[date] || 0) / 100,
          }));

          const maxVal = Math.max(...chartData.map(d => Math.max(d.revenue, d.expense)), 50);
          const width = 500;
          const height = 200;
          const padding = 40;

          const getPoints = (key: "revenue" | "expense") => {
            return chartData.map((d, i) => {
              const x = padding + (i * (width - 2 * padding) / (chartData.length - 1 || 1));
              const y = height - padding - (d[key] * (height - 2 * padding) / maxVal);
              return { x, y, val: d[key], date: d.date, rawRevenue: d.revenue, rawExpense: d.expense };
            });
          };

          const revenuePoints = getPoints("revenue");
          const expensePoints = getPoints("expense");

          const getPathD = (points: typeof revenuePoints) => {
            if (points.length === 0) return "";
            return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
          };

          const getAreaPathD = (points: typeof revenuePoints) => {
            if (points.length === 0) return "";
            const linePath = getPathD(points);
            const first = points[0];
            const last = points[points.length - 1];
            return `${linePath} L ${last.x} ${height - padding} L ${first.x} ${height - padding} Z`;
          };

          const revPath = getPathD(revenuePoints);
          const revArea = getAreaPathD(revenuePoints);
          const expPath = getPathD(expensePoints);
          const expArea = getAreaPathD(expensePoints);

          // SVG Donut calculations
          const expensesByCategory: { [key: string]: number } = {};
          (localData.expenses || []).forEach(exp => {
            expensesByCategory[exp.category] = (expensesByCategory[exp.category] || 0) + exp.amount;
          });
          const totalExpCents = Object.values(expensesByCategory).reduce((a, b) => a + b, 0);
          
          const colorsList = ["#f59e0b", "#3b82f6", "#10b981", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#6b7280"];
          const donutData = Object.entries(expensesByCategory).map(([category, amount], idx) => ({
            category,
            amount: amount / 100,
            percentage: totalExpCents > 0 ? (amount / totalExpCents) * 100 : 0,
            color: colorsList[idx % colorsList.length]
          }));

          let cumulativeAngle = 0;

          const getDonutPath = (startAngle: number, endAngle: number, radius: number, innerRadius: number, cx: number, cy: number) => {
            const rad = Math.PI / 180;
            const s = startAngle - 90;
            const e = endAngle - 90;
            
            const x1 = cx + radius * Math.cos(s * rad);
            const y1 = cy + radius * Math.sin(s * rad);
            const x2 = cx + radius * Math.cos(e * rad);
            const y2 = cy + radius * Math.sin(e * rad);
            
            const ix1 = cx + innerRadius * Math.cos(s * rad);
            const iy1 = cy + innerRadius * Math.sin(s * rad);
            const ix2 = cx + innerRadius * Math.cos(e * rad);
            const iy2 = cy + innerRadius * Math.sin(e * rad);
            
            const angleDiff = endAngle - startAngle;
            const largeArc = angleDiff > 180 ? 1 : 0;
            
            if (angleDiff >= 360) {
              return `M ${cx} ${cy - radius} A ${radius} ${radius} 0 1 0 ${cx} ${cy + radius} A ${radius} ${radius} 0 1 0 ${cx} ${cy - radius} M ${cx} ${cy - innerRadius} A ${innerRadius} ${innerRadius} 0 1 1 ${cx} ${cy + innerRadius} A ${innerRadius} ${innerRadius} 0 1 1 ${cx} ${cy - innerRadius} Z`;
            }
            
            return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix1} ${iy1} Z`;
          };

          return (
            <div className="space-y-6 animate-fadeIn">
              {/* Bento Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <div className="p-4 flex flex-col justify-between h-32">
                    <span className="text-[10px] uppercase tracking-wider text-text-secondary">Total Revenue</span>
                    <div>
                      <h3 className="text-2xl font-mono font-bold text-primary">${(totalRevenueCents / 100).toFixed(2)}</h3>
                      <p className="text-[9px] text-emerald-400 mt-1 uppercase flex items-center gap-1">
                        &uarr; Inbound Cashflow
                      </p>
                    </div>
                  </div>
                </Card>
                
                <Card>
                  <div className="p-4 flex flex-col justify-between h-32">
                    <span className="text-[10px] uppercase tracking-wider text-text-secondary">Total Expenses</span>
                    <div>
                      <h3 className="text-2xl font-mono font-bold text-rose-400">${(totalExpensesCents / 100).toFixed(2)}</h3>
                      <p className="text-[9px] text-text-secondary mt-1 uppercase">
                        Operating costs logged
                      </p>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="p-4 flex flex-col justify-between h-32">
                    <span className="text-[10px] uppercase tracking-wider text-text-secondary">Net Margin</span>
                    <div>
                      <h3 className={`text-2xl font-mono font-bold ${netMarginPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {netMarginPct.toFixed(1)}%
                      </h3>
                      <p className="text-[9px] text-text-secondary mt-1 uppercase">
                        Profitability ratio
                      </p>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="p-4 flex flex-col justify-between h-32">
                    <span className="text-[10px] uppercase tracking-wider text-text-secondary">Stock Valuation</span>
                    <div>
                      <h3 className="text-2xl font-mono font-bold text-text-primary">${(stockValuationCents / 100).toFixed(2)}</h3>
                      <p className="text-[9px] text-text-secondary mt-1 uppercase">
                        Asset worth in inventory
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue vs Expenses Area Chart */}
                <div className="lg:col-span-2 relative">
                  <Card>
                    <div className="p-6 border-b border-secondary">
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-text-primary">Revenue vs Expenses</h3>
                      <p className="text-[10px] text-text-secondary mt-1 uppercase">7-Day financial balance graph</p>
                    </div>
                    
                    <div className="p-6 relative">
                      {/* Tooltip */}
                      {hoveredPoint && (
                        <div 
                          className="absolute bg-zinc-950/85 backdrop-blur-md border border-zinc-800/60 p-3 rounded-xl shadow-2xl text-xs z-20 pointer-events-none transition-all duration-300 ease-out border-t-zinc-700/30"
                          style={{ left: `${hoveredPoint.x}px`, top: `${hoveredPoint.y - 75}px`, transform: 'translateX(-50%)' }}
                        >
                          <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider mb-1.5">{hoveredPoint.label}</p>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-primary">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_4px_rgba(245,158,11,0.6)]" />
                              <span className="font-semibold text-[10px]">Rev:</span>
                              <span className="font-mono font-bold text-zinc-100">${hoveredPoint.revenue.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-rose-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_4px_rgba(239,68,68,0.6)]" />
                              <span className="font-semibold text-[10px]">Exp:</span>
                              <span className="font-mono font-bold text-zinc-100">${hoveredPoint.expense.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
                        {/* Grid Lines */}
                        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                          const y = padding + ratio * (height - 2 * padding);
                          const val = maxVal * (1 - ratio);
                          return (
                            <g key={index}>
                              <line 
                                x1={padding} 
                                y1={y} 
                                x2={width - padding} 
                                y2={y} 
                                className="stroke-zinc-800/40" 
                                strokeWidth={0.5} 
                                strokeDasharray="4 4"
                              />
                              <text 
                                x={padding - 8} 
                                y={y + 3} 
                                className="fill-text-muted text-[8px] font-mono text-right"
                                style={{ textAnchor: "end" }}
                              >
                                ${val.toFixed(0)}
                              </text>
                            </g>
                          );
                        })}

                        {/* X Axis Labels */}
                        {chartData.map((d, i) => {
                          const x = padding + (i * (width - 2 * padding) / (chartData.length - 1 || 1));
                          const dateLabel = new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                          return (
                            <text 
                              key={i} 
                              x={x} 
                              y={height - padding + 15} 
                              className="fill-text-muted text-[8px] font-mono"
                              style={{ textAnchor: "middle" }}
                            >
                              {dateLabel}
                            </text>
                          );
                        })}

                        {/* Shaded Areas */}
                        {revArea && (
                          <path 
                            d={revArea} 
                            fill="url(#revGrad)" 
                          />
                        )}
                        {expArea && (
                          <path 
                            d={expArea} 
                            fill="url(#expGrad)" 
                          />
                        )}

                        {/* Lines */}
                        {revPath && (
                          <path 
                            d={revPath} 
                            fill="none" 
                            stroke="var(--color-primary)" 
                            strokeWidth={2} 
                          />
                        )}
                        {expPath && (
                          <path 
                            d={expPath} 
                            fill="none" 
                            stroke="#ef4444" 
                            strokeWidth={2} 
                          />
                        )}

                        {/* Interactive Hover Circles */}
                        {revenuePoints.map((p, i) => (
                          <g key={i}>
                            <circle 
                              cx={p.x} 
                              cy={p.y} 
                              r={4} 
                              className="fill-zinc-950 stroke-primary stroke-2 cursor-pointer hover:r-6 transition-all duration-200"
                              onMouseEnter={() => setHoveredPoint({ x: p.x, y: p.y, label: p.date, revenue: p.rawRevenue, expense: p.rawExpense })}
                              onMouseLeave={() => setHoveredPoint(null)}
                            />
                            <circle 
                              cx={expensePoints[i].x} 
                              cy={expensePoints[i].y} 
                              r={4} 
                              className="fill-zinc-950 stroke-rose-500 stroke-2 cursor-pointer hover:r-6 transition-all duration-200"
                              onMouseEnter={() => setHoveredPoint({ x: expensePoints[i].x, y: expensePoints[i].y, label: p.date, revenue: p.rawRevenue, expense: p.rawExpense })}
                              onMouseLeave={() => setHoveredPoint(null)}
                            />
                          </g>
                        ))}

                        {/* Definitions */}
                        <defs>
                          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.2} />
                            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ef4444" stopOpacity={0.2} />
                            <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                      </svg>

                      {/* Chart Legend */}
                      <div className="flex justify-center gap-6 mt-4">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-primary/20 border border-primary"></span>
                          <span className="text-[10px] uppercase font-bold text-text-secondary">Revenue</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500"></span>
                          <span className="text-[10px] uppercase font-bold text-text-secondary">Expenses</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Expenses by Category Donut Chart */}
                <div className="relative">
                  <Card>
                    <div className="flex flex-col justify-between min-h-[340px]">
                      <div className="p-6 border-b border-secondary">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-text-primary">Expenses by Category</h3>
                        <p className="text-[10px] text-text-secondary mt-1 uppercase">Breakdown of operational spend</p>
                      </div>
                      
                      <div className="p-6 flex flex-col items-center justify-center flex-1">
                        {donutData.length === 0 ? (
                          <p className="text-xs text-text-secondary uppercase p-8">No expenses logged yet</p>
                        ) : (
                          <div className="relative w-48 h-48">
                            <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
                              {donutData.map((slice, i) => {
                                const angle = (slice.percentage / 100) * 360;
                                const startAngle = cumulativeAngle;
                                const endAngle = cumulativeAngle + angle;
                                cumulativeAngle = endAngle;

                                return (
                                  <path 
                                    key={i}
                                    d={getDonutPath(startAngle, endAngle, 70, 45, 100, 100)}
                                    fill={slice.color}
                                    className="cursor-pointer hover:opacity-85 transition-opacity"
                                    onMouseEnter={() => setHoveredSlice({ category: slice.category, amount: slice.amount, percentage: slice.percentage, color: slice.color })}
                                    onMouseLeave={() => setHoveredSlice(null)}
                                  />
                                );
                              })}
                            </svg>

                            {/* Center Content */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                              {hoveredSlice ? (
                                <>
                                  <span className="text-[9px] uppercase tracking-wider text-text-secondary truncate max-w-[90px]" style={{ color: hoveredSlice.color }}>
                                    {hoveredSlice.category}
                                  </span>
                                  <span className="text-base font-bold font-mono text-text-primary mt-0.5">
                                    ${hoveredSlice.amount.toFixed(2)}
                                  </span>
                                  <span className="text-[9px] font-mono text-text-muted mt-0.5">
                                    {hoveredSlice.percentage.toFixed(1)}%
                                  </span>
                                </>
                              ) : (
                                <>
                                  <span className="text-[9px] uppercase tracking-wider text-text-secondary">
                                    Total Spent
                                  </span>
                                  <span className="text-lg font-bold font-mono text-text-primary mt-0.5">
                                    ${(totalExpensesCents / 100).toFixed(2)}
                                  </span>
                                  <span className="text-[8px] text-text-muted mt-0.5 uppercase tracking-widest">
                                    All categories
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Legend list */}
                      {donutData.length > 0 && (
                        <div className="p-6 pt-0 max-h-[140px] overflow-y-auto border-t border-secondary">
                          <div className="grid grid-cols-2 gap-2 pt-4">
                            {donutData.map((slice, i) => (
                              <div key={i} className="flex items-center gap-2 truncate">
                                <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: slice.color }}></span>
                                <span className="text-[10px] text-text-secondary truncate">{slice.category}</span>
                                <span className="text-[9px] font-mono text-text-muted ml-auto">({slice.percentage.toFixed(0)}%)</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Tab: EXPENSES */}
        {activeTab === "expenses" && (() => {
          // Filter expenses
          const filteredExpenses = (localData.expenses || []).filter(exp => {
            const matchesSearch = 
              exp.supplierName?.toLowerCase().includes(expenseSearch.toLowerCase()) ||
              exp.description?.toLowerCase().includes(expenseSearch.toLowerCase()) ||
              exp.invoiceNumber?.toLowerCase().includes(expenseSearch.toLowerCase());
            
            const matchesCategory = expenseCatFilter === "All" || exp.category === expenseCatFilter;
            const matchesStatus = expenseStatusFilter === "All" || exp.status === expenseStatusFilter;

            return matchesSearch && matchesCategory && matchesStatus;
          });

          // Unique categories of expenses
          const categoriesList = Array.from(new Set((localData.expenses || []).map(e => e.category)));

          return (
            <div className="space-y-6 animate-fadeIn">
              {/* Actions & Filters Bar */}
              <div className="bg-surface p-4 rounded border border-secondary flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
                <div className="flex flex-wrap items-center gap-3 flex-1">
                  {/* Search */}
                  <input 
                    type="text" 
                    placeholder="Search supplier, description, invoice..." 
                    value={expenseSearch} 
                    onChange={e => setExpenseSearch(e.target.value)}
                    className="bg-zinc-900/50 border border-zinc-800 focus:border-primary/50 text-text-primary rounded-xl p-2 text-xs focus:ring-1 focus:ring-primary/20 outline-none transition-all duration-300 flex-1 min-w-[200px]"
                  />
                  {/* Category Filter */}
                  <select 
                    value={expenseCatFilter} 
                    onChange={e => setExpenseCatFilter(e.target.value)}
                    className="bg-zinc-900/50 border border-zinc-800 focus:border-primary/50 text-text-primary rounded-xl p-2 text-xs focus:ring-1 focus:ring-primary/20 outline-none transition-all duration-300 min-w-[120px]"
                  >
                    <option value="All">All Categories</option>
                    {categoriesList.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {/* Status Filter */}
                  <select 
                    value={expenseStatusFilter} 
                    onChange={e => setExpenseStatusFilter(e.target.value)}
                    className="bg-zinc-900/50 border border-zinc-800 focus:border-primary/50 text-text-primary rounded-xl p-2 text-xs focus:ring-1 focus:ring-primary/20 outline-none transition-all duration-300 min-w-[120px]"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
                <button 
                  onClick={() => setShowAddExpenseModal(true)}
                  className="bg-primary hover:bg-primary-dark text-secondary-dark px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 active:scale-[0.98] ease-[cubic-bezier(0.32,0.72,0,1)] flex items-center gap-2 shrink-0 justify-center shadow-md hover:shadow-primary/10 border border-primary/20"
                >
                  Log Expense
                  <span className="inline-flex items-center justify-center rounded-full bg-secondary-dark/10 p-0.5 ml-1">
                    <span className="inline-flex items-center justify-center rounded-full bg-secondary-dark/15 p-0.5">
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    </span>
                  </span>
                </button>
              </div>

              {/* Invoices Ledger Table */}
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-secondary bg-secondary-dark text-[10px] text-text-secondary uppercase tracking-wider">
                        <th className="p-4">Supplier Name</th>
                        <th className="p-4">Invoice #</th>
                        <th className="p-4">Date</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Description</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Amount</th>
                        {currentUser?.role === 'admin' && <th className="p-4 text-right">Actions</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary">
                      {filteredExpenses.length === 0 ? (
                        <tr>
                          <td colSpan={currentUser?.role === 'admin' ? 8 : 7} className="p-8 text-center text-xs text-text-secondary uppercase tracking-wider">
                            No matching expenses found.
                          </td>
                        </tr>
                      ) : (
                        filteredExpenses.map(exp => (
                          <tr key={exp.id} className="hover:bg-secondary-dark transition-colors">
                            <td className="p-4 text-xs font-semibold text-text-primary">{exp.supplierName || "-"}</td>
                            <td className="p-4 text-xs text-text-secondary font-mono">{exp.invoiceNumber || "-"}</td>
                            <td className="p-4 text-xs text-text-muted">{new Date(exp.createdAt).toLocaleDateString()}</td>
                            <td className="p-4">
                              <span className="text-[9px] uppercase bg-secondary px-2 py-0.5 rounded font-bold text-text-secondary border border-secondary-light/30">
                                {exp.category}
                              </span>
                            </td>
                            <td className="p-4 text-xs text-text-secondary max-w-xs truncate">{exp.description}</td>
                            <td className="p-4">
                              <span className={`text-[9px] px-2 py-0.5 rounded font-mono uppercase ${exp.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                                {exp.status}
                              </span>
                            </td>
                            <td className="p-4 text-xs font-mono font-bold text-text-primary">${(exp.amount / 100).toFixed(2)}</td>
                            {currentUser?.role === 'admin' && (
                              <td className="p-4 text-right">
                                <button 
                                  onClick={() => handleDeleteExpense(exp.id)}
                                  className="text-text-muted hover:text-rose-400 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4 inline" />
                                </button>
                              </td>
                            )}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          );
        })()}

        {/* Tab 4: RESERVATIONS */}
        {activeTab === "reservations" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Top Action Bar */}
            <div className="bg-surface p-4 rounded border border-secondary flex justify-between items-center">
              <span className="text-xs uppercase tracking-wider text-text-secondary">Customer Bookings List</span>
              <button 
                onClick={() => setShowAddReservationModal(true)}
                className="bg-primary hover:bg-primary-dark text-secondary-dark px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 active:scale-[0.98] ease-[cubic-bezier(0.32,0.72,0,1)] flex items-center gap-2 shadow-md hover:shadow-primary/10 border border-primary/20"
              >
                New Booking
                <span className="inline-flex items-center justify-center rounded-full bg-secondary-dark/10 p-0.5 ml-1">
                  <span className="inline-flex items-center justify-center rounded-full bg-secondary-dark/15 p-0.5">
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </span>
                </span>
              </button>
            </div>

            {/* Bookings List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {localData.reservations.map(res => (
                <div key={res.id} className="bg-surface p-4 rounded border border-secondary flex flex-col justify-between h-44 relative group hover:border-primary/50 transition-all duration-300">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-sm font-semibold text-text-primary truncate max-w-[70%]">{res.customerName}</h3>
                      <span className={`text-[9px] px-2 py-0.5 rounded font-mono uppercase ${
                        res.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        res.status === 'cancelled' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                        'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {res.status}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-text-secondary">
                      <p><span className="text-text-muted">Table:</span> <span className="font-semibold text-text-primary">{res.tableNumber}</span></p>
                      <p><span className="text-text-muted">Guests:</span> <span className="font-semibold text-text-primary">{res.pax} pax</span></p>
                      <p><span className="text-text-muted">Date:</span> <span className="font-semibold text-primary">{new Date(res.reservationDate).toLocaleString()}</span></p>
                      {res.notes && <p className="text-[10px] text-text-muted italic truncate mt-1">"{res.notes}"</p>}
                    </div>
                  </div>

                  <div className="flex gap-2 border-t border-secondary pt-3 mt-3">
                    {res.status !== "confirmed" && (
                      <button 
                        onClick={() => handleReservationStatus(res.id, "confirmed")}
                        className="flex-1 text-[10px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 py-1 rounded font-semibold uppercase tracking-wider transition-colors"
                      >
                        Confirm
                      </button>
                    )}
                    {res.status !== "cancelled" && (
                      <button 
                        onClick={() => handleReservationStatus(res.id, "cancelled")}
                        className="flex-1 text-[10px] bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 py-1 rounded font-semibold uppercase tracking-wider transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: PREBATCHES */}
        {activeTab === "prebatches" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Top Action Bar */}
            <div className="bg-surface p-4 rounded border border-secondary flex justify-between items-center">
              <span className="text-xs uppercase tracking-wider text-text-secondary">Internal Prebatches / Custom Mixes</span>
              <button 
                onClick={() => setShowAddPrebatchModal(true)}
                className="bg-primary hover:bg-primary-dark text-secondary-dark px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 active:scale-[0.98] ease-[cubic-bezier(0.32,0.72,0,1)] flex items-center gap-2 shadow-md hover:shadow-primary/10 border border-primary/20"
              >
                Prep New Batch
                <span className="inline-flex items-center justify-center rounded-full bg-secondary-dark/10 p-0.5 ml-1">
                  <span className="inline-flex items-center justify-center rounded-full bg-secondary-dark/15 p-0.5">
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </span>
                </span>
              </button>
            </div>

            {/* List of Prebatches */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {localData.prebatches.map(pb => {
                // Calculate expiration state
                const now = new Date();
                const exp = pb.expirationDate ? new Date(pb.expirationDate) : null;
                const prod = new Date(pb.productionDate);
                
                let state: "expired" | "warning" | "fresh" = "fresh";
                if (exp && now >= exp) {
                  state = "expired";
                } else if (exp) {
                  const diffTime = exp.getTime() - now.getTime();
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  if (diffDays <= 3) state = "warning";
                }

                return (
                  <div key={pb.id} className="bg-surface p-4 rounded border border-secondary flex flex-col justify-between h-52 relative group hover:border-primary/50 transition-all duration-300">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-sm font-semibold text-text-primary truncate max-w-[70%]">{pb.name}</h3>
                        <span className={`text-[9px] px-2 py-0.5 rounded font-mono uppercase ${
                          state === 'expired' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse' :
                          state === 'warning' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                          'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {state}
                        </span>
                      </div>

                      <div className="space-y-1 text-xs text-text-secondary">
                        <p><span className="text-text-muted">Batch ID:</span> <span className="font-semibold text-text-primary font-mono">{pb.batchId || "N/A"}</span></p>
                        <p><span className="text-text-muted">Prepped:</span> <span className="font-semibold text-text-primary">{prod.toLocaleDateString()}</span></p>
                        <p><span className="text-text-muted">Expires:</span> <span className="font-semibold text-primary">{exp ? exp.toLocaleDateString() : "Never"}</span></p>
                        
                        <div className="mt-3">
                          <div className="flex justify-between text-[10px] text-text-secondary mb-1">
                            <span>Volume: {pb.currentQuantityMl}ml / {pb.initialQuantityMl}ml</span>
                            <span>{((pb.currentQuantityMl / pb.initialQuantityMl) * 100).toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                state === 'expired' ? 'bg-rose-500' :
                                state === 'warning' ? 'bg-amber-500' :
                                'bg-emerald-500'
                              }`} 
                              style={{ width: `${(pb.currentQuantityMl / pb.initialQuantityMl) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 border-t border-secondary pt-3 mt-3">
                      <button 
                        onClick={() => handleConsumePrebatch(pb.id, 250)}
                        disabled={pb.currentQuantityMl <= 0}
                        className="flex-1 text-[10px] bg-secondary hover:bg-secondary-light disabled:opacity-40 disabled:hover:bg-secondary py-1 rounded font-semibold uppercase tracking-wider transition-colors"
                      >
                        Use 250ml
                      </button>
                      <button 
                        onClick={() => handleDeletePrebatch(pb.id)}
                        className="text-[10px] border border-rose-500/30 hover:bg-rose-500/10 text-rose-400 px-3 py-1 rounded font-semibold uppercase tracking-wider transition-colors"
                      >
                        Discard
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 6: SCHEDULES */}
        {activeTab === "schedules" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Top Action Bar */}
            <div className="bg-surface p-4 rounded border border-secondary flex justify-between items-center">
              <span className="text-xs uppercase tracking-wider text-text-secondary">Work Schedules & Staff Shifts</span>
              <button 
                onClick={() => setShowAddScheduleModal(true)}
                className="bg-primary hover:bg-primary-dark text-secondary-dark px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 active:scale-[0.98] ease-[cubic-bezier(0.32,0.72,0,1)] flex items-center gap-2 shadow-md hover:shadow-primary/10 border border-primary/20"
              >
                Add Shift
                <span className="inline-flex items-center justify-center rounded-full bg-secondary-dark/10 p-0.5 ml-1">
                  <span className="inline-flex items-center justify-center rounded-full bg-secondary-dark/15 p-0.5">
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </span>
                </span>
              </button>
            </div>

            {/* Split layout: Shifts on Left, Bar configs on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left col: Shifts */}
              <div className="lg:col-span-2 space-y-6">
                {/* Today's Shifts Board */}
                <Card>
                  <div className="p-6">
                    <h2 className="text-lg font-display text-text-primary mb-4 flex items-center gap-2">
                      <UserCheck className="text-primary w-5 h-5" /> Today's Shifts Board
                    </h2>
                    {(() => {
                      const todayStr = new Date().toDateString();
                      const todayShifts = localData.schedules.filter(s => new Date(s.workDate).toDateString() === todayStr);
                      if (todayShifts.length === 0) {
                        return <p className="text-xs text-text-muted italic py-4">No staff scheduled for today.</p>;
                      }
                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {todayShifts.map(s => {
                            const u = localData.users.find(usr => usr.id === s.userId);
                            return (
                              <div key={s.id} className="bg-secondary-dark p-4 rounded border border-secondary flex flex-col justify-between p-4 relative">
                                <div>
                                  <div className="flex justify-between items-start mb-2">
                                    <div>
                                      <p className="text-sm font-semibold text-text-primary">{u?.name || "Unknown User"}</p>
                                      <span className="text-[10px] bg-secondary-light text-text-secondary px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                                        {u?.role || "Staff"}
                                      </span>
                                    </div>
                                    <button 
                                      onClick={() => handleDeleteSchedule(s.id)}
                                      className="text-text-muted hover:text-rose-400 transition-colors"
                                      title="Delete Shift"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                  <div className="text-xs text-text-secondary space-y-1 mt-2">
                                    <p><span className="text-text-muted">Hours:</span> <span className="font-semibold text-primary">{s.startTime} - {s.endTime}</span></p>
                                    {s.notes && <p className="text-[10px] text-text-muted italic">"{s.notes}"</p>}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                </Card>

                {/* Weekly/Upcoming Schedules List */}
                <Card>
                  <div className="p-6">
                    <h2 className="text-lg font-display text-text-primary mb-4">All Scheduled Shifts</h2>
                    {localData.schedules.length === 0 ? (
                      <p className="text-xs text-text-muted italic py-4">No scheduled shifts found.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-secondary bg-secondary-dark text-[10px] text-text-secondary uppercase tracking-wider">
                              <th className="p-3">Staff</th>
                              <th className="p-3">Role</th>
                              <th className="p-3">Date</th>
                              <th className="p-3">Hours</th>
                              <th className="p-3">Notes</th>
                              <th className="p-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-secondary">
                            {localData.schedules
                              .sort((a, b) => new Date(a.workDate).getTime() - new Date(b.workDate).getTime())
                              .map(s => {
                                const u = localData.users.find(usr => usr.id === s.userId);
                                return (
                                  <tr key={s.id} className="hover:bg-secondary-dark transition-colors">
                                    <td className="p-3 text-xs font-semibold text-text-primary">{u?.name || "Unknown"}</td>
                                    <td className="p-3 text-xs text-text-secondary uppercase font-mono">{u?.role || "Staff"}</td>
                                    <td className="p-3 text-xs text-text-primary">{new Date(s.workDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</td>
                                    <td className="p-3 text-xs text-primary font-mono">{s.startTime} - {s.endTime}</td>
                                    <td className="p-3 text-xs text-text-muted max-w-xs truncate">{s.notes || "-"}</td>
                                    <td className="p-3 text-right">
                                      <button 
                                        onClick={() => handleDeleteSchedule(s.id)}
                                        className="text-text-muted hover:text-rose-400 transition-colors"
                                      >
                                        <Trash2 className="w-4 h-4 inline" />
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* Right col: Bar Configurations */}
              <div className="space-y-6">
                <Card>
                  <div className="p-6">
                    <h2 className="text-lg font-display text-text-primary mb-4 flex items-center gap-2">
                      <Settings className="text-primary w-5 h-5" /> Bar Config Panel
                    </h2>
                    <p className="text-[10px] text-text-secondary uppercase tracking-wider mb-4">Daily Operation Schedule</p>
                    
                    <div className="space-y-4">
                      {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((dayName, index) => {
                        const config = localData.barConfigs.find(c => c.dayOfWeek === index);
                        if (!config) return null;
                        return (
                          <div key={config.id} className="p-3 bg-secondary-dark rounded border border-secondary space-y-2">
                            <div className="flex justify-between items-center border-b border-secondary pb-1">
                              <span className="text-xs font-semibold text-text-primary">{dayName}</span>
                              <span className="text-[10px] text-text-muted">Day #{index}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <label className="block text-[8px] uppercase text-text-muted mb-0.5">Opens</label>
                                <input 
                                  type="text" 
                                  defaultValue={config.openingTime}
                                  onBlur={(e) => handleUpdateConfig(config.id, e.target.value, config.kitchenCloseTime, config.barCloseTime)}
                                  className="w-full bg-secondary border border-secondary text-text-primary rounded p-1 text-[11px] font-mono focus:border-primary outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-[8px] uppercase text-text-muted mb-0.5">Kitchen</label>
                                <input 
                                  type="text" 
                                  defaultValue={config.kitchenCloseTime}
                                  onBlur={(e) => handleUpdateConfig(config.id, config.openingTime, e.target.value, config.barCloseTime)}
                                  className="w-full bg-secondary border border-secondary text-text-primary rounded p-1 text-[11px] font-mono focus:border-primary outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-[8px] uppercase text-text-muted mb-0.5">Bar Close</label>
                                <input 
                                  type="text" 
                                  defaultValue={config.barCloseTime}
                                  onBlur={(e) => handleUpdateConfig(config.id, config.openingTime, config.kitchenCloseTime, e.target.value)}
                                  className="w-full bg-secondary border border-secondary text-text-primary rounded p-1 text-[11px] font-mono focus:border-primary outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}
      </main>
      </div>

      {/* MODAL 5: ADD WORK SCHEDULE */}
      {showAddScheduleModal && (
        <div className="fixed inset-0 bg-secondary-dark/70 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-surface border border-secondary rounded-lg w-full max-w-md p-6 relative animate-fadeIn">
            <h2 className="text-lg font-display text-text-primary mb-4 uppercase">Add Staff Shift</h2>
            <form onSubmit={handleAddSchedule} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase text-text-secondary mb-1">Staff Member</label>
                <select 
                  required
                  value={newSchedule.userId} 
                  onChange={e => setNewSchedule({...newSchedule, userId: e.target.value})}
                  className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-primary/50 text-text-primary rounded-xl p-2 text-xs focus:ring-1 focus:ring-primary/20 outline-none transition-all duration-300"
                >
                  <option value="">Select Staff</option>
                  {localData.users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-text-secondary mb-1">Work Date</label>
                <input 
                  type="date" 
                  required
                  value={newSchedule.workDate} 
                  onChange={e => setNewSchedule({...newSchedule, workDate: e.target.value})}
                  className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-primary/50 text-text-primary rounded-xl p-2 text-xs focus:ring-1 focus:ring-primary/20 outline-none transition-all duration-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase text-text-secondary mb-1">Start Time</label>
                  <input 
                    type="text" 
                    required
                    value={newSchedule.startTime} 
                    onChange={e => setNewSchedule({...newSchedule, startTime: e.target.value})}
                    className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-primary/50 text-text-primary rounded-xl p-2 text-xs focus:ring-1 focus:ring-primary/20 outline-none transition-all duration-300 font-mono"
                    placeholder="18:00"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-text-secondary mb-1">End Time</label>
                  <input 
                    type="text" 
                    required
                    value={newSchedule.endTime} 
                    onChange={e => setNewSchedule({...newSchedule, endTime: e.target.value})}
                    className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-primary/50 text-text-primary rounded-xl p-2 text-xs focus:ring-1 focus:ring-primary/20 outline-none transition-all duration-300 font-mono"
                    placeholder="02:00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-text-secondary mb-1">Notes</label>
                <textarea 
                  value={newSchedule.notes} 
                  onChange={e => setNewSchedule({...newSchedule, notes: e.target.value})}
                  className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-primary/50 text-text-primary rounded-xl p-2 text-xs focus:ring-1 focus:ring-primary/20 outline-none transition-all duration-300 h-20"
                  placeholder="Specific tasks, counter assignment, etc."
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-secondary">
                <button 
                  type="button" 
                  onClick={() => setShowAddScheduleModal(false)}
                  className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-750 text-text-primary px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 active:scale-[0.98] ease-[cubic-bezier(0.32,0.72,0,1)]"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-primary hover:bg-primary-dark text-secondary-dark px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 active:scale-[0.98] ease-[cubic-bezier(0.32,0.72,0,1)] shadow-md hover:shadow-primary/10 border border-primary/20"
                >
                  Save Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD STOCK ITEM */}
      {showAddStockModal && (
        <div className="fixed inset-0 bg-secondary-dark/70 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-surface border border-secondary rounded-lg w-full max-w-md p-6 relative animate-fadeIn">
            <h2 className="text-lg font-display text-text-primary mb-4 uppercase">Add Inventory Item</h2>
            <form onSubmit={handleAddStock} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase text-text-secondary mb-1">Item Name</label>
                <input 
                  type="text" 
                  required
                  value={newStockItem.name} 
                  onChange={e => setNewStockItem({...newStockItem, name: e.target.value})}
                  className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-primary/50 text-text-primary rounded-xl p-2 text-xs focus:ring-1 focus:ring-primary/20 outline-none transition-all duration-300"
                  placeholder="e.g. Gin Beefeater 750ml"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-text-secondary mb-1">Category</label>
                <select 
                  required
                  value={newStockItem.categoryId} 
                  onChange={e => setNewStockItem({...newStockItem, categoryId: e.target.value})}
                  className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-primary/50 text-text-primary rounded-xl p-2 text-xs focus:ring-1 focus:ring-primary/20 outline-none transition-all duration-300"
                >
                  <option value="">Select Category</option>
                  {localData.categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase text-text-secondary mb-1">Initial Quantity</label>
                  <input 
                    type="number" 
                    step="any"
                    value={newStockItem.quantity} 
                    onChange={e => setNewStockItem({...newStockItem, quantity: Number(e.target.value)})}
                    className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-primary/50 text-text-primary rounded-xl p-2 text-xs focus:ring-1 focus:ring-primary/20 outline-none transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-text-secondary mb-1">Unit</label>
                  <input 
                    type="text" 
                    required
                    value={newStockItem.unit} 
                    onChange={e => setNewStockItem({...newStockItem, unit: e.target.value})}
                    className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-primary/50 text-text-primary rounded-xl p-2 text-xs focus:ring-1 focus:ring-primary/20 outline-none transition-all duration-300"
                    placeholder="units, bottles, cans, etc."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase text-text-secondary mb-1">Min Stock Alert</label>
                  <input 
                    type="number" 
                    step="any"
                    value={newStockItem.minStock} 
                    onChange={e => setNewStockItem({...newStockItem, minStock: Number(e.target.value)})}
                    className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-primary/50 text-text-primary rounded-xl p-2 text-xs focus:ring-1 focus:ring-primary/20 outline-none transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-text-secondary mb-1">Price (USD)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={newStockItem.price} 
                    onChange={e => setNewStockItem({...newStockItem, price: Number(e.target.value)})}
                    className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-primary/50 text-text-primary rounded-xl p-2 text-xs focus:ring-1 focus:ring-primary/20 outline-none transition-all duration-300"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-secondary">
                <button 
                  type="button" 
                  onClick={() => setShowAddStockModal(false)}
                  className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-750 text-text-primary px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 active:scale-[0.98] ease-[cubic-bezier(0.32,0.72,0,1)]"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-primary hover:bg-primary-dark text-secondary-dark px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 active:scale-[0.98] ease-[cubic-bezier(0.32,0.72,0,1)] shadow-md hover:shadow-primary/10 border border-primary/20"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: NEW RESERVATION */}
      {showAddReservationModal && (
        <div className="fixed inset-0 bg-secondary-dark/70 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-surface border border-secondary rounded-lg w-full max-w-md p-6 relative animate-fadeIn">
            <h2 className="text-lg font-display text-text-primary mb-4 uppercase">New Reservation</h2>
            <form onSubmit={handleAddReservation} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase text-text-secondary mb-1">Customer Name</label>
                <input 
                  type="text" 
                  required
                  value={newRes.customerName} 
                  onChange={e => setNewRes({...newRes, customerName: e.target.value})}
                  className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-primary/50 text-text-primary rounded-xl p-2 text-xs focus:ring-1 focus:ring-primary/20 outline-none transition-all duration-300"
                  placeholder="Carlos Gardel"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase text-text-secondary mb-1">Guests (Pax)</label>
                  <input 
                    type="number" 
                    min="1"
                    required
                    value={newRes.pax} 
                    onChange={e => setNewRes({...newRes, pax: Number(e.target.value)})}
                    className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-primary/50 text-text-primary rounded-xl p-2 text-xs focus:ring-1 focus:ring-primary/20 outline-none transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-text-secondary mb-1">Table Number</label>
                  <input 
                    type="text" 
                    required
                    value={newRes.tableNumber} 
                    onChange={e => setNewRes({...newRes, tableNumber: e.target.value})}
                    className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-primary/50 text-text-primary rounded-xl p-2 text-xs focus:ring-1 focus:ring-primary/20 outline-none transition-all duration-300"
                    placeholder="Table 14"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-text-secondary mb-1">Reservation Date & Time</label>
                <input 
                  type="datetime-local" 
                  required
                  value={newRes.reservationDate} 
                  onChange={e => setNewRes({...newRes, reservationDate: e.target.value})}
                  className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-primary/50 text-text-primary rounded-xl p-2 text-xs focus:ring-1 focus:ring-primary/20 outline-none transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-text-secondary mb-1">Notes</label>
                <textarea 
                  value={newRes.notes} 
                  onChange={e => setNewRes({...newRes, notes: e.target.value})}
                  className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-primary/50 text-text-primary rounded-xl p-2 text-xs focus:ring-1 focus:ring-primary/20 outline-none transition-all duration-300 h-20"
                  placeholder="Prefers quiet zone, allergy notifications..."
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-secondary">
                <button 
                  type="button" 
                  onClick={() => setShowAddReservationModal(false)}
                  className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-750 text-text-primary px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 active:scale-[0.98] ease-[cubic-bezier(0.32,0.72,0,1)]"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-primary hover:bg-primary-dark text-secondary-dark px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 active:scale-[0.98] ease-[cubic-bezier(0.32,0.72,0,1)] shadow-md hover:shadow-primary/10 border border-primary/20"
                >
                  Create Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: NEW KEG */}
      {showAddKegModal && (
        <div className="fixed inset-0 bg-secondary-dark/70 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-surface border border-secondary rounded-lg w-full max-w-md p-6 relative animate-fadeIn">
            <h2 className="text-lg font-display text-text-primary mb-4 uppercase">Register New Beer Keg</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!newKeg.name) return;
              startTransition(async () => {
                const res = await addKeg({
                  tenantId,
                  name: newKeg.name,
                  capacity: Number(newKeg.capacity),
                  currentVolume: Number(newKeg.currentVolume)
                });
                if (res.success) {
                  setShowAddKegModal(false);
                  setNewKeg({ name: "", capacity: 50, currentVolume: 50 });
                  await refreshData();
                }
              });
            }} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase text-text-secondary mb-1">Beer Style / Name</label>
                <input 
                  type="text" 
                  required
                  value={newKeg.name} 
                  onChange={e => setNewKeg({...newKeg, name: e.target.value})}
                  className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-primary/50 text-text-primary rounded-xl p-2 text-xs focus:ring-1 focus:ring-primary/20 outline-none transition-all duration-300"
                  placeholder="e.g. Irish Stout"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase text-text-secondary mb-1">Total Capacity (L)</label>
                  <input 
                    type="number" 
                    required
                    value={newKeg.capacity} 
                    onChange={e => setNewKeg({...newKeg, capacity: Number(e.target.value), currentVolume: Number(e.target.value)})}
                    className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-primary/50 text-text-primary rounded-xl p-2 text-xs focus:ring-1 focus:ring-primary/20 outline-none transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-text-secondary mb-1">Current Volume (L)</label>
                  <input 
                    type="number" 
                    required
                    value={newKeg.currentVolume} 
                    onChange={e => setNewKeg({...newKeg, currentVolume: Number(e.target.value)})}
                    className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-primary/50 text-text-primary rounded-xl p-2 text-xs focus:ring-1 focus:ring-primary/20 outline-none transition-all duration-300"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-secondary">
                <button 
                  type="button" 
                  onClick={() => setShowAddKegModal(false)}
                  className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-750 text-text-primary px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 active:scale-[0.98] ease-[cubic-bezier(0.32,0.72,0,1)]"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-primary hover:bg-primary-dark text-secondary-dark px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 active:scale-[0.98] ease-[cubic-bezier(0.32,0.72,0,1)] shadow-md hover:shadow-primary/10 border border-primary/20"
                >
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL 4: ADD PREBATCH */}
      {showAddPrebatchModal && (
        <div className="fixed inset-0 bg-secondary-dark/70 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-surface border border-secondary rounded-lg w-full max-w-md p-6 relative animate-fadeIn">
            <h2 className="text-lg font-display text-text-primary mb-4 uppercase">Prep New Prebatch</h2>
            <form onSubmit={handleAddPrebatch} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase text-text-secondary mb-1">Prebatch Name</label>
                <input 
                  type="text" 
                  required
                  value={newPrebatch.name} 
                  onChange={e => setNewPrebatch({...newPrebatch, name: e.target.value})}
                  className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-primary/50 text-text-primary rounded-xl p-2 text-xs focus:ring-1 focus:ring-primary/20 outline-none transition-all duration-300"
                  placeholder="e.g. Negroni Mix 10L"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-text-secondary mb-1">Category</label>
                <select 
                  value={newPrebatch.categoryId} 
                  onChange={e => setNewPrebatch({...newPrebatch, categoryId: e.target.value})}
                  className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-primary/50 text-text-primary rounded-xl p-2 text-xs focus:ring-1 focus:ring-primary/20 outline-none transition-all duration-300"
                >
                  <option value="">No Category</option>
                  {localData.categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase text-text-secondary mb-1">Quantity (ml)</label>
                  <input 
                    type="number" 
                    required
                    value={newPrebatch.initialQuantityMl} 
                    onChange={e => setNewPrebatch({...newPrebatch, initialQuantityMl: Number(e.target.value)})}
                    className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-primary/50 text-text-primary rounded-xl p-2 text-xs focus:ring-1 focus:ring-primary/20 outline-none transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-text-secondary mb-1">Batch ID / Tag</label>
                  <input 
                    type="text" 
                    value={newPrebatch.batchId} 
                    onChange={e => setNewPrebatch({...newPrebatch, batchId: e.target.value})}
                    className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-primary/50 text-text-primary rounded-xl p-2 text-xs focus:ring-1 focus:ring-primary/20 outline-none transition-all duration-300"
                    placeholder="NEG-042"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase text-text-secondary mb-1">Prep Date</label>
                  <input 
                    type="datetime-local" 
                    required
                    value={newPrebatch.productionDate} 
                    onChange={e => setNewPrebatch({...newPrebatch, productionDate: e.target.value})}
                    className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-primary/50 text-text-primary rounded-xl p-2 text-xs focus:ring-1 focus:ring-primary/20 outline-none transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-text-secondary mb-1">Expiration Date</label>
                  <input 
                    type="datetime-local" 
                    value={newPrebatch.expirationDate} 
                    onChange={e => setNewPrebatch({...newPrebatch, expirationDate: e.target.value})}
                    className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-primary/50 text-text-primary rounded-xl p-2 text-xs focus:ring-1 focus:ring-primary/20 outline-none transition-all duration-300"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-secondary">
                <button 
                  type="button" 
                  onClick={() => setShowAddPrebatchModal(false)}
                  className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-750 text-text-primary px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 active:scale-[0.98] ease-[cubic-bezier(0.32,0.72,0,1)]"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-primary hover:bg-primary-dark text-secondary-dark px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 active:scale-[0.98] ease-[cubic-bezier(0.32,0.72,0,1)] shadow-md hover:shadow-primary/10 border border-primary/20"
                >
                  Create Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab 7: STAFF MANAGEMENT */}
      {activeTab === "staff" && currentUser?.role === "admin" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800/40 flex justify-between items-center">
            <span className="text-xs uppercase tracking-wider text-text-secondary">Staff Member Accounts</span>
            <button 
              onClick={() => setShowAddUserModal(true)}
              className="bg-primary hover:bg-primary-dark text-secondary-dark px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 active:scale-[0.98] ease-[cubic-bezier(0.32,0.72,0,1)] shadow-md hover:shadow-primary/10 border border-primary/20 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Staff Member
            </button>
          </div>

          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800/40 bg-zinc-950/50 text-[10px] text-text-secondary uppercase tracking-wider">
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {localData.users.map(u => (
                    <tr key={u.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="p-4 text-xs font-semibold text-text-primary">{u.name}</td>
                      <td className="p-4 text-xs text-text-secondary font-mono">{u.email}</td>
                      <td className="p-4">
                        <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase ${u.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                          {u.isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => handleToggleUser(u.id, !u.isActive)}
                          disabled={u.id === currentUser?.id}
                          className="text-[10px] disabled:opacity-50 disabled:cursor-not-allowed bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-3 py-1 rounded-lg text-text-primary transition-colors cursor-pointer"
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
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

      {/* Tab 8: SETTINGS */}
      {activeTab === "settings" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Two-column layout */}
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Left column (Sub-sidebar menu) */}
            <div className="w-full lg:w-56 flex flex-row lg:flex-col gap-1 bg-zinc-950/40 p-2 rounded-2xl border border-zinc-900/60 shrink-0">
              <button
                onClick={() => setActiveSettingsTab("profile")}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 truncate ${
                  activeSettingsTab === "profile"
                    ? "bg-zinc-900 text-primary border border-zinc-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40 border border-transparent"
                }`}
              >
                <UserCheck className="w-4 h-4 shrink-0" />
                <span>My Profile</span>
              </button>

              {currentUser?.role === "admin" && (
                <>
                  <button
                    onClick={() => setActiveSettingsTab("branding")}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 truncate ${
                      activeSettingsTab === "branding"
                        ? "bg-zinc-900 text-primary border border-zinc-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40 border border-transparent"
                    }`}
                  >
                    <Settings className="w-4 h-4 shrink-0" />
                    <span>Brand Customization</span>
                  </button>

                  <button
                    onClick={() => setActiveSettingsTab("categories")}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 truncate ${
                      activeSettingsTab === "categories"
                        ? "bg-zinc-900 text-primary border border-zinc-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40 border border-transparent"
                    }`}
                  >
                    <Layers className="w-4 h-4 shrink-0" />
                    <span>Menu Categories</span>
                  </button>

                  <button
                    onClick={() => setActiveSettingsTab("permissions")}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 truncate ${
                      activeSettingsTab === "permissions"
                        ? "bg-zinc-900 text-primary border border-zinc-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40 border border-transparent"
                    }`}
                  >
                    <UserCheck className="w-4 h-4 shrink-0" />
                    <span>Permission Policies</span>
                  </button>
                </>
              )}
            </div>

            {/* Right column (Active workspace) */}
            <div className="flex-1">
              {activeSettingsTab === "profile" && (
                <Card>
                  <div className="p-6">
                    <h2 className="text-lg font-display text-text-primary mb-4 uppercase flex items-center gap-2">
                      <UserCheck className="text-primary w-5 h-5" /> My Profile
                    </h2>
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                      <div>
                        <label className="block text-[10px] uppercase text-text-secondary mb-1">Full Name</label>
                        <input 
                          type="text"
                          required
                          placeholder="Your Name"
                          value={profileForm.name}
                          onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                          className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-primary/50 text-text-primary rounded-xl p-2 text-xs focus:ring-1 focus:ring-primary/20 outline-none transition-all duration-300"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase text-text-secondary mb-1">Email Address</label>
                        <input 
                          type="email"
                          required
                          placeholder="yourname@domain.com"
                          value={profileForm.email}
                          onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                          className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-primary/50 text-text-primary rounded-xl p-2 text-xs focus:ring-1 focus:ring-primary/20 outline-none transition-all duration-300"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase text-text-secondary mb-1">New Password (leave blank to keep current)</label>
                        <input 
                          type="password"
                          placeholder="••••••••"
                          value={profileForm.password}
                          onChange={e => setProfileForm({ ...profileForm, password: e.target.value })}
                          className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-primary/50 text-text-primary rounded-xl p-2 text-xs focus:ring-1 focus:ring-primary/20 outline-none transition-all duration-300"
                        />
                      </div>

                      <div className="pt-2">
                        <button 
                          type="submit"
                          className="bg-primary hover:bg-primary-dark text-secondary-dark px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 active:scale-[0.98] ease-[cubic-bezier(0.32,0.72,0,1)] shadow-md hover:shadow-primary/10 border border-primary/20"
                        >
                          Save Profile Changes
                        </button>
                      </div>
                    </form>
                  </div>
                </Card>
              )}

              {activeSettingsTab === "branding" && currentUser?.role === "admin" && (
                <Card>
                  <div className="p-6">
                    <h2 className="text-lg font-display text-text-primary mb-4 uppercase flex items-center gap-2">
                      <Settings className="text-primary w-5 h-5" /> Brand Customization
                    </h2>
                    <form onSubmit={handleUpdateBranding} className="space-y-4">
                      <div>
                        <label className="block text-[10px] uppercase text-text-secondary mb-1">Display Name</label>
                        <input 
                          type="text"
                          placeholder="e.g. Gatto Bar"
                          value={brandingForm.displayName}
                          onChange={e => setBrandingForm({ ...brandingForm, displayName: e.target.value })}
                          className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-primary/50 text-text-primary rounded-xl p-2 text-xs focus:ring-1 focus:ring-primary/20 outline-none transition-all duration-300"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase text-text-secondary mb-1">Logo URL</label>
                        <input 
                          type="text"
                          placeholder="e.g. https://domain.com/logo.png"
                          value={brandingForm.logoUrl}
                          onChange={e => setBrandingForm({ ...brandingForm, logoUrl: e.target.value })}
                          className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-primary/50 text-text-primary rounded-xl p-2 text-xs focus:ring-1 focus:ring-primary/20 outline-none transition-all duration-300"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase text-text-secondary mb-1">Primary Theme Color</label>
                        <div className="flex gap-3 items-center">
                          <input 
                            type="color"
                            value={brandingForm.primaryColor}
                            onChange={e => setBrandingForm({ ...brandingForm, primaryColor: e.target.value })}
                            className="w-8 h-8 rounded border border-zinc-850 cursor-pointer bg-transparent"
                          />
                          <input 
                            type="text"
                            pattern="^#[0-9A-Fa-f]{6}$"
                            placeholder="#f59e0b"
                            value={brandingForm.primaryColor}
                            onChange={e => setBrandingForm({ ...brandingForm, primaryColor: e.target.value })}
                            className="flex-1 bg-zinc-900/50 border border-zinc-800 focus:border-primary/50 text-text-primary rounded-xl p-2 text-xs focus:ring-1 focus:ring-primary/20 outline-none transition-all duration-300 font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase text-text-secondary mb-1">Available Taps Count</label>
                        <input 
                          type="number"
                          min="3"
                          max="12"
                          required
                          value={brandingForm.tapCount}
                          onChange={e => setBrandingForm({ ...brandingForm, tapCount: parseInt(e.target.value) || 8 })}
                          className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-primary/50 text-text-primary rounded-xl p-2 text-xs focus:ring-1 focus:ring-primary/20 outline-none transition-all duration-300"
                        />
                      </div>

                      <div className="pt-2">
                        <button 
                          type="submit"
                          className="bg-primary hover:bg-primary-dark text-secondary-dark px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 active:scale-[0.98] ease-[cubic-bezier(0.32,0.72,0,1)] shadow-md hover:shadow-primary/10 border border-primary/20"
                        >
                          Apply Branding
                        </button>
                      </div>
                    </form>
                  </div>
                </Card>
              )}

              {activeSettingsTab === "categories" && currentUser?.role === "admin" && (
                <Card>
                  <div className="p-6">
                    <h2 className="text-lg font-display text-text-primary mb-4 uppercase flex items-center gap-2">
                      <Layers className="text-primary w-5 h-5" /> Menu Categories
                    </h2>
                    <form onSubmit={handleCreateCategory} className="flex gap-2 mb-4">
                      <input 
                        type="text"
                        required
                        placeholder="Category Name (e.g. Craft Beer, Cocktails)"
                        value={newCategoryName}
                        onChange={e => setNewCategoryName(e.target.value)}
                        className="flex-1 bg-zinc-900/50 border border-zinc-800 focus:border-primary/50 text-text-primary rounded-xl p-2 text-xs focus:ring-1 focus:ring-primary/20 outline-none transition-all duration-300"
                      />
                      <button 
                        type="submit"
                        className="bg-primary hover:bg-primary-dark text-secondary-dark px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 active:scale-[0.98] ease-[cubic-bezier(0.32,0.72,0,1)] shadow-md hover:shadow-primary/10 border border-primary/20 flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" /> Add
                      </button>
                    </form>

                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {localData.categories.length === 0 ? (
                        <p className="text-xs text-text-muted italic py-3 text-center">No categories registered.</p>
                      ) : (
                        localData.categories.map(cat => (
                          <div key={cat.id} className="flex justify-between items-center p-2.5 bg-zinc-950/50 rounded-xl border border-zinc-900 hover:border-zinc-800 transition-all">
                            <span className="text-xs text-text-primary font-semibold">{cat.name}</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(cat.id)}
                              className="text-rose-400 hover:text-rose-300 transition-colors p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </Card>
              )}

              {activeSettingsTab === "permissions" && currentUser?.role === "admin" && (
                <Card>
                  <div className="p-6">
                    <h2 className="text-lg font-display text-text-primary mb-4 uppercase flex items-center gap-2">
                      <UserCheck className="text-primary w-5 h-5" /> Permission Policies
                    </h2>
                    <form onSubmit={handleUpdateRolePermissions} className="space-y-5">
                      <div className="flex items-center justify-between p-3 bg-zinc-950/50 rounded-xl border border-zinc-900">
                        <div>
                          <p className="text-xs font-semibold text-text-primary">Staff Stock Adjustment</p>
                          <p className="text-[10px] text-text-secondary">Allow staff members to adjust stock quantities (+1/-1)</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox"
                            checked={permissionsForm.allowStaffStockAdjust}
                            onChange={e => setPermissionsForm({ ...permissionsForm, allowStaffStockAdjust: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-zinc-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-zinc-950/50 rounded-xl border border-zinc-900">
                        <div>
                          <p className="text-xs font-semibold text-text-primary">Cashier Keg Management</p>
                          <p className="text-[10px] text-text-secondary">Allow cashiers to pour, tap, untap, and register kegs</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox"
                            checked={permissionsForm.allowCashierKegManage}
                            onChange={e => setPermissionsForm({ ...permissionsForm, allowCashierKegManage: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-zinc-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-zinc-950/50 rounded-xl border border-zinc-900">
                        <div>
                          <p className="text-xs font-semibold text-text-primary">Kitchen View Sales</p>
                          <p className="text-[10px] text-text-secondary">Allow kitchen staff to view sales figures and metrics</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox"
                            checked={permissionsForm.allowKitchenViewSales}
                            onChange={e => setPermissionsForm({ ...permissionsForm, allowKitchenViewSales: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-zinc-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>

                      <div className="pt-2">
                        <button 
                          type="submit"
                          className="bg-primary hover:bg-primary-dark text-secondary-dark px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 active:scale-[0.98] ease-[cubic-bezier(0.32,0.72,0,1)] shadow-md hover:shadow-primary/10 border border-primary/20"
                        >
                          Save Policies
                        </button>
                      </div>
                    </form>
                  </div>
                </Card>
              )}
            </div>

          </div>
        </div>
      )}

      {/* MODAL 6: ADD USER */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-secondary-dark/70 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-surface border border-secondary rounded-lg w-full max-w-md p-6 relative animate-fadeIn">
            <h2 className="text-lg font-display text-text-primary mb-4 uppercase">Add Staff Member</h2>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase text-text-secondary mb-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="Sofia Bartender"
                  value={newUser.name} 
                  onChange={e => setNewUser({...newUser, name: e.target.value})}
                  className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-primary/50 text-text-primary rounded-xl p-2 text-xs focus:ring-1 focus:ring-primary/20 outline-none transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-text-secondary mb-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  placeholder="sofia@gattobar.com"
                  value={newUser.email} 
                  onChange={e => setNewUser({...newUser, email: e.target.value})}
                  className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-primary/50 text-text-primary rounded-xl p-2 text-xs focus:ring-1 focus:ring-primary/20 outline-none transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-text-secondary mb-1">Password</label>
                <input 
                  type="password" 
                  required
                  placeholder="password"
                  value={newUser.password} 
                  onChange={e => setNewUser({...newUser, password: e.target.value})}
                  className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-primary/50 text-text-primary rounded-xl p-2 text-xs focus:ring-1 focus:ring-primary/20 outline-none transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-text-secondary mb-1">Role</label>
                <select 
                  value={newUser.role} 
                  onChange={e => setNewUser({...newUser, role: e.target.value as any})}
                  className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-primary/50 text-text-primary rounded-xl p-2 text-xs focus:ring-1 focus:ring-primary/20 outline-none transition-all duration-300"
                >
                  <option value="staff">Staff / Bartender</option>
                  <option value="cashier">Cashier / Caja</option>
                  <option value="kitchen">Kitchen / Kitchen Staff</option>
                  <option value="admin">Admin / Supervisor</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-secondary">
                <button 
                  type="button" 
                  onClick={() => setShowAddUserModal(false)}
                  className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-750 text-text-primary px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 active:scale-[0.98] ease-[cubic-bezier(0.32,0.72,0,1)]"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-primary hover:bg-primary-dark text-secondary-dark px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 active:scale-[0.98] ease-[cubic-bezier(0.32,0.72,0,1)] shadow-md hover:shadow-primary/10 border border-primary/20"
                >
                  Add Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 7: LOG EXPENSE */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 bg-secondary-dark/70 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-surface border border-secondary rounded-lg w-full max-w-md p-6 relative animate-fadeIn">
            <h2 className="text-lg font-display text-text-primary mb-4 uppercase">Log Bar Expense</h2>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase text-text-secondary mb-1 font-semibold text-primary">Amount (USD)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    placeholder="25.50"
                    value={newExpense.amount} 
                    onChange={e => setNewExpense({...newExpense, amount: e.target.value})}
                    className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-primary/50 text-text-primary rounded-xl p-2 text-xs focus:ring-1 focus:ring-primary/20 outline-none transition-all duration-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase text-text-secondary mb-1 font-semibold text-primary">Category</label>
                  <select 
                    value={newExpense.category} 
                    onChange={e => setNewExpense({...newExpense, category: e.target.value})}
                    className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-primary/50 text-text-primary rounded-xl p-2 text-xs focus:ring-1 focus:ring-primary/20 outline-none transition-all duration-300"
                  >
                    <option value="Inventory">Inventory</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Rent">Rent</option>
                    <option value="Staff">Staff / Salaries</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-text-secondary mb-1">Supplier Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Heineken Distributor"
                  value={newExpense.supplierName} 
                  onChange={e => setNewExpense({...newExpense, supplierName: e.target.value})}
                  className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-primary/50 text-text-primary rounded-xl p-2 text-xs focus:ring-1 focus:ring-primary/20 outline-none transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-text-secondary mb-1">Description / Notes</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Purchase of 5 craft beer kegs"
                  value={newExpense.description} 
                  onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                  className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-primary/50 text-text-primary rounded-xl p-2 text-xs focus:ring-1 focus:ring-primary/20 outline-none transition-all duration-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase text-text-secondary mb-1">Invoice Number</label>
                  <input 
                    type="text" 
                    placeholder="INV-2026-001"
                    value={newExpense.invoiceNumber} 
                    onChange={e => setNewExpense({...newExpense, invoiceNumber: e.target.value})}
                    className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-primary/50 text-text-primary rounded-xl p-2 text-xs focus:ring-1 focus:ring-primary/20 outline-none transition-all duration-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase text-text-secondary mb-1 font-semibold text-primary">Status</label>
                  <select 
                    value={newExpense.status} 
                    onChange={e => setNewExpense({...newExpense, status: e.target.value})}
                    className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-primary/50 text-text-primary rounded-xl p-2 text-xs focus:ring-1 focus:ring-primary/20 outline-none transition-all duration-300"
                  >
                    <option value="Pending">Pending / Unpaid</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-text-secondary mb-1">Due Date</label>
                <input 
                  type="date" 
                  value={newExpense.dueDate} 
                  onChange={e => setNewExpense({...newExpense, dueDate: e.target.value})}
                  className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-primary/50 text-text-primary rounded-xl p-2 text-xs focus:ring-1 focus:ring-primary/20 outline-none transition-all duration-300 font-mono"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-secondary">
                <button 
                  type="button" 
                  onClick={() => setShowAddExpenseModal(false)}
                  className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-750 text-text-primary px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 active:scale-[0.98] ease-[cubic-bezier(0.32,0.72,0,1)]"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-primary hover:bg-primary-dark text-secondary-dark px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 active:scale-[0.98] ease-[cubic-bezier(0.32,0.72,0,1)] shadow-md hover:shadow-primary/10 border border-primary/20"
                >
                  Log Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
