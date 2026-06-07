import React from "react";
import { UserCheck, Settings, Layers, Trash2, Plus } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "../../atoms/Button";
import Input from "../../atoms/Input";

interface SettingsTabProps {
  currentUser: any;
  localData: {
    categories: any[];
  };
  activeSettingsTab: "profile" | "branding" | "categories" | "permissions";
  setActiveSettingsTab: (tab: "profile" | "branding" | "categories" | "permissions") => void;
  profileForm: {
    name: string;
    email: string;
    password: string;
  };
  setProfileForm: (form: any) => void;
  brandingForm: {
    displayName: string;
    logoUrl: string;
    primaryColor: string;
    tapCount: number;
  };
  setBrandingForm: (form: any) => void;
  permissionsForm: {
    allowStaffStockAdjust: boolean;
    allowCashierKegManage: boolean;
    allowKitchenViewSales: boolean;
  };
  setPermissionsForm: (form: any) => void;
  newCategoryName: string;
  setNewCategoryName: (name: string) => void;
  onUpdateProfile: (e: React.FormEvent) => void;
  onUpdateBranding: (e: React.FormEvent) => void;
  onUpdateRolePermissions: (e: React.FormEvent) => void;
  onCreateCategory: (e: React.FormEvent) => void;
  onDeleteCategory: (id: string) => void;
}

export default function SettingsTab({
  currentUser,
  localData,
  activeSettingsTab,
  setActiveSettingsTab,
  profileForm,
  setProfileForm,
  brandingForm,
  setBrandingForm,
  permissionsForm,
  setPermissionsForm,
  newCategoryName,
  setNewCategoryName,
  onUpdateProfile,
  onUpdateBranding,
  onUpdateRolePermissions,
  onCreateCategory,
  onDeleteCategory,
}: SettingsTabProps) {
  const isAdmin = currentUser?.role === "admin";

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Two-column layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left column (Sub-sidebar menu) */}
        <div className="w-full lg:w-56 flex flex-row lg:flex-col gap-1 bg-zinc-950/40 p-2 rounded-2xl border border-zinc-900/60 shrink-0 select-none">
          <button
            onClick={() => setActiveSettingsTab("profile")}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 truncate cursor-pointer ${
              activeSettingsTab === "profile"
                ? "bg-zinc-900 text-primary border border-zinc-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40 border border-transparent"
            }`}
          >
            <UserCheck className="w-4 h-4 shrink-0" />
            <span>My Profile</span>
          </button>

          {isAdmin && (
            <>
              <button
                onClick={() => setActiveSettingsTab("branding")}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 truncate cursor-pointer ${
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
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 truncate cursor-pointer ${
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
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 truncate cursor-pointer ${
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
                <form onSubmit={onUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase text-text-secondary mb-1">
                      Full Name
                    </label>
                    <Input
                      type="text"
                      required
                      placeholder="Your Name"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase text-text-secondary mb-1">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      required
                      placeholder="yourname@domain.com"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase text-text-secondary mb-1">
                      New Password (leave blank to keep current)
                    </label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={profileForm.password}
                      onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                    />
                  </div>

                  <div className="pt-2">
                    <Button type="submit">
                      Save Profile Changes
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          )}

          {activeSettingsTab === "branding" && isAdmin && (
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-display text-text-primary mb-4 uppercase flex items-center gap-2">
                  <Settings className="text-primary w-5 h-5" /> Brand Customization
                </h2>
                <form onSubmit={onUpdateBranding} className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase text-text-secondary mb-1">
                      Display Name
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. Gatto Bar"
                      value={brandingForm.displayName}
                      onChange={(e) =>
                        setBrandingForm({ ...brandingForm, displayName: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase text-text-secondary mb-1">
                      Logo URL
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. https://domain.com/logo.png"
                      value={brandingForm.logoUrl}
                      onChange={(e) => setBrandingForm({ ...brandingForm, logoUrl: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase text-text-secondary mb-1">
                      Primary Theme Color
                    </label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="color"
                        value={brandingForm.primaryColor}
                        onChange={(e) =>
                          setBrandingForm({ ...brandingForm, primaryColor: e.target.value })
                        }
                        className="w-8 h-8 rounded border border-zinc-800 cursor-pointer bg-transparent"
                      />
                      <Input
                        type="text"
                        pattern="^#[0-9A-Fa-f]{6}$"
                        placeholder="#f59e0b"
                        value={brandingForm.primaryColor}
                        onChange={(e) =>
                          setBrandingForm({ ...brandingForm, primaryColor: e.target.value })
                        }
                        className="font-mono flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase text-text-secondary mb-1">
                      Available Taps Count
                    </label>
                    <Input
                      type="number"
                      min="3"
                      max="12"
                      required
                      value={brandingForm.tapCount}
                      onChange={(e) =>
                        setBrandingForm({
                          ...brandingForm,
                          tapCount: parseInt(e.target.value) || 8,
                        })
                      }
                    />
                  </div>

                  <div className="pt-2">
                    <Button type="submit">
                      Apply Branding
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          )}

          {activeSettingsTab === "categories" && isAdmin && (
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-display text-text-primary mb-4 uppercase flex items-center gap-2">
                  <Layers className="text-primary w-5 h-5" /> Menu Categories
                </h2>
                <form onSubmit={onCreateCategory} className="flex gap-2 mb-4">
                  <Input
                    type="text"
                    required
                    placeholder="Category Name (e.g. Craft Beer, Cocktails)"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                  />
                  <Button type="submit" className="flex items-center gap-1 shrink-0">
                    <Plus className="w-4 h-4" /> Add
                  </Button>
                </form>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {localData.categories.length === 0 ? (
                    <p className="text-xs text-text-muted italic py-3 text-center">
                      No categories registered.
                    </p>
                  ) : (
                    localData.categories.map((cat) => (
                      <div
                        key={cat.id}
                        className="flex justify-between items-center p-2.5 bg-zinc-950/50 rounded-xl border border-zinc-900 hover:border-zinc-800 transition-all"
                      >
                        <span className="text-xs text-text-primary font-semibold">{cat.name}</span>
                        <button
                          type="button"
                          onClick={() => onDeleteCategory(cat.id)}
                          className="text-rose-400 hover:text-rose-300 transition-colors p-1 cursor-pointer"
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

          {activeSettingsTab === "permissions" && isAdmin && (
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-display text-text-primary mb-4 uppercase flex items-center gap-2">
                  <UserCheck className="text-primary w-5 h-5" /> Permission Policies
                </h2>
                <form onSubmit={onUpdateRolePermissions} className="space-y-5">
                  <div className="flex items-center justify-between p-3 bg-zinc-950/50 rounded-xl border border-zinc-900">
                    <div>
                      <p className="text-xs font-semibold text-text-primary">
                        Staff Stock Adjustment
                      </p>
                      <p className="text-[10px] text-text-secondary">
                        Allow staff members to adjust stock quantities (+1/-1)
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={permissionsForm.allowStaffStockAdjust}
                        onChange={(e) =>
                          setPermissionsForm({
                            ...permissionsForm,
                            allowStaffStockAdjust: e.target.checked,
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-zinc-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-zinc-950/50 rounded-xl border border-zinc-900">
                    <div>
                      <p className="text-xs font-semibold text-text-primary">
                        Cashier Keg Management
                      </p>
                      <p className="text-[10px] text-text-secondary">
                        Allow cashiers to pour, tap, untap, and register kegs
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={permissionsForm.allowCashierKegManage}
                        onChange={(e) =>
                          setPermissionsForm({
                            ...permissionsForm,
                            allowCashierKegManage: e.target.checked,
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-zinc-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-zinc-950/50 rounded-xl border border-zinc-900">
                    <div>
                      <p className="text-xs font-semibold text-text-primary">Kitchen View Sales</p>
                      <p className="text-[10px] text-text-secondary">
                        Allow kitchen staff to view sales figures and metrics
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={permissionsForm.allowKitchenViewSales}
                        onChange={(e) =>
                          setPermissionsForm({
                            ...permissionsForm,
                            allowKitchenViewSales: e.target.checked,
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-zinc-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="pt-2">
                    <Button type="submit">
                      Save Policies
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
