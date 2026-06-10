import React from "react";
import { UserCheck, Settings, Layers, Trash2, Plus } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "../../atoms/Button";
import Input from "../../atoms/Input";
import SettingsSubNav from "../SettingsSubNav";
import SubNavLayout from "@/components/templates/SubNavLayout";

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
    <SubNavLayout
      mobileNav={
        <SettingsSubNav
          activeSettingsTab={activeSettingsTab}
          setActiveSettingsTab={setActiveSettingsTab}
          isAdmin={isAdmin}
          isMobile={true}
        />
      }
    >
      {/* Right column (Active workspace) */}
      <div className="flex-1">
          {activeSettingsTab === "profile" && (
            <Card>
              <form onSubmit={onUpdateProfile} className="flex flex-col h-full">
                {/* Header */}
                <div className="px-6 py-5 border-b border-zinc-800/60">
                  <h3 className="text-sm font-semibold text-text-primary">Profile Information</h3>
                  <p className="text-xs text-zinc-500 mt-1">Update your account name, email address, and security password.</p>
                </div>

                {/* Body */}
                <div className="flex-1">
                  {/* Row 1: Full Name */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-6 py-6 border-b border-zinc-800/40 items-start">
                    <div className="md:col-span-1 flex flex-col gap-1">
                      <span className="text-xs font-semibold text-text-primary">Full Name</span>
                      <span className="text-[11px] text-zinc-500">Your profile display name.</span>
                    </div>
                    <div className="md:col-span-2">
                      <Input
                        type="text"
                        required
                        placeholder="Your Name"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        className="max-w-md w-full"
                      />
                    </div>
                  </div>

                  {/* Row 2: Email Address */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-6 py-6 border-b border-zinc-800/40 items-start">
                    <div className="md:col-span-1 flex flex-col gap-1">
                      <span className="text-xs font-semibold text-text-primary">Email Address</span>
                      <span className="text-[11px] text-zinc-500">The email address associated with your account.</span>
                    </div>
                    <div className="md:col-span-2">
                      <Input
                        type="email"
                        required
                        placeholder="yourname@domain.com"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        className="max-w-md w-full"
                      />
                    </div>
                  </div>

                  {/* Row 3: Security Password */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-6 py-6 items-start">
                    <div className="md:col-span-1 flex flex-col gap-1">
                      <span className="text-xs font-semibold text-text-primary">Change Password</span>
                      <span className="text-[11px] text-zinc-500">Provide a new password to secure your account. Leave blank to keep current.</span>
                    </div>
                    <div className="md:col-span-2">
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={profileForm.password}
                        onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                        className="max-w-md w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-zinc-900/10 border-t border-zinc-800 px-6 py-4 flex justify-between items-center">
                  <p className="text-[11px] text-zinc-500">Please make sure to enter valid information.</p>
                  <Button type="submit">
                    Save Profile Changes
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {activeSettingsTab === "branding" && isAdmin && (
            <Card>
              <form onSubmit={onUpdateBranding} className="flex flex-col h-full">
                {/* Header */}
                <div className="px-6 py-5 border-b border-zinc-800/60">
                  <h3 className="text-sm font-semibold text-text-primary">Tenant Branding</h3>
                  <p className="text-xs text-zinc-500 mt-1">Configure your organization's display settings, colors, and layout.</p>
                </div>

                {/* Body */}
                <div className="flex-1">
                  {/* Row 1: Display Name */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-6 py-6 border-b border-zinc-800/40 items-start">
                    <div className="md:col-span-1 flex flex-col gap-1">
                      <span className="text-xs font-semibold text-text-primary">Organization Name</span>
                      <span className="text-[11px] text-zinc-500">The public name of your bar or establishment.</span>
                    </div>
                    <div className="md:col-span-2">
                      <Input
                        type="text"
                        placeholder="e.g. Gatto Bar"
                        value={brandingForm.displayName}
                        onChange={(e) =>
                          setBrandingForm({ ...brandingForm, displayName: e.target.value })
                        }
                        className="max-w-md w-full"
                      />
                    </div>
                  </div>

                  {/* Row 2: Logo URL */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-6 py-6 border-b border-zinc-800/40 items-start">
                    <div className="md:col-span-1 flex flex-col gap-1">
                      <span className="text-xs font-semibold text-text-primary">Logo URL</span>
                      <span className="text-[11px] text-zinc-500">Direct URL to your bar's logo image. Recommended size 1:1 ratio.</span>
                    </div>
                    <div className="md:col-span-2">
                      <Input
                        type="text"
                        placeholder="e.g. https://domain.com/logo.png"
                        value={brandingForm.logoUrl}
                        onChange={(e) => setBrandingForm({ ...brandingForm, logoUrl: e.target.value })}
                        className="max-w-md w-full"
                      />
                    </div>
                  </div>

                  {/* Row 3: Primary Theme Color */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-6 py-6 border-b border-zinc-800/40 items-start">
                    <div className="md:col-span-1 flex flex-col gap-1">
                      <span className="text-xs font-semibold text-text-primary">Primary Theme Color</span>
                      <span className="text-[11px] text-zinc-500">Accent color used for active states, highlights, and primary buttons.</span>
                    </div>
                    <div className="md:col-span-2">
                      <div className="flex gap-3 items-center max-w-md w-full">
                        <input
                          type="color"
                          value={brandingForm.primaryColor}
                          onChange={(e) =>
                            setBrandingForm({ ...brandingForm, primaryColor: e.target.value })
                          }
                          className="w-10 h-10 rounded-xl border border-zinc-800 cursor-pointer bg-transparent shrink-0"
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
                  </div>

                  {/* Row 4: Available Taps Count */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-6 py-6 items-start">
                    <div className="md:col-span-1 flex flex-col gap-1">
                      <span className="text-xs font-semibold text-text-primary">Beer Taps Count</span>
                      <span className="text-[11px] text-zinc-500">Number of active, configurable taps in the system. Minimum 3, maximum 12.</span>
                    </div>
                    <div className="md:col-span-2">
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
                        className="max-w-md w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-zinc-900/10 border-t border-zinc-800 px-6 py-4 flex justify-between items-center">
                  <p className="text-[11px] text-zinc-500">Branding will update instantly across the entire interface.</p>
                  <Button type="submit">
                    Apply Branding
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {activeSettingsTab === "categories" && isAdmin && (
            <Card>
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="px-6 py-5 border-b border-zinc-800/60">
                  <h3 className="text-sm font-semibold text-text-primary">Menu Categories</h3>
                  <p className="text-xs text-zinc-500 mt-1">Manage food and beverage categories for menu classification and stock filters.</p>
                </div>

                {/* Body */}
                <div className="flex-1">
                  {/* Row 1: Add New Category */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-6 py-6 border-b border-zinc-800/40 items-start">
                    <div className="md:col-span-1 flex flex-col gap-1">
                      <span className="text-xs font-semibold text-text-primary">Add New Category</span>
                      <span className="text-[11px] text-zinc-500">Create a new category for your inventory items.</span>
                    </div>
                    <div className="md:col-span-2">
                      <form onSubmit={onCreateCategory} className="flex gap-2 max-w-md w-full">
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
                    </div>
                  </div>

                  {/* Row 2: Registered Categories */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-6 py-6 items-start">
                    <div className="md:col-span-1 flex flex-col gap-1">
                      <span className="text-xs font-semibold text-text-primary">Registered Categories</span>
                      <span className="text-[11px] text-zinc-500">All currently configured categories. Removing a category does not delete its items.</span>
                    </div>
                    <div className="md:col-span-2">
                      <div className="space-y-2 max-h-72 overflow-y-auto pr-1 max-w-md w-full">
                        {localData.categories.length === 0 ? (
                          <p className="text-xs text-zinc-500 italic py-3 text-center bg-zinc-950/20 border border-zinc-900 rounded-xl">
                            No categories registered.
                          </p>
                        ) : (
                          localData.categories.map((cat) => (
                            <div
                              key={cat.id}
                              className="flex justify-between items-center p-3 bg-zinc-950/30 rounded-xl border border-zinc-850 hover:border-zinc-800 transition-all"
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
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeSettingsTab === "permissions" && isAdmin && (
            <Card>
              <form onSubmit={onUpdateRolePermissions} className="flex flex-col h-full">
                {/* Header */}
                <div className="px-6 py-5 border-b border-zinc-800/60">
                  <h3 className="text-sm font-semibold text-text-primary">Access Control Policies</h3>
                  <p className="text-xs text-zinc-500 mt-1">Configure role permissions and access settings for staff and cashier members.</p>
                </div>

                {/* Body */}
                <div className="flex-1">
                  {/* Row 1: Staff Stock Adjustment */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-6 py-6 border-b border-zinc-800/40 items-start">
                    <div className="md:col-span-2 flex flex-col gap-1">
                      <span className="text-xs font-semibold text-text-primary">Staff Stock Adjustment</span>
                      <span className="text-[11px] text-zinc-500">Allow staff members to perform rapid stock adjustments (+1/-1) in the inventory panel.</span>
                    </div>
                    <div className="md:col-span-1 flex md:justify-end">
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
                        <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary peer-checked:after:bg-white"></div>
                      </label>
                    </div>
                  </div>

                  {/* Row 2: Cashier Keg Management */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-6 py-6 border-b border-zinc-800/40 items-start">
                    <div className="md:col-span-2 flex flex-col gap-1">
                      <span className="text-xs font-semibold text-text-primary">Cashier Keg Management</span>
                      <span className="text-[11px] text-zinc-500">Allow cashiers to connect, disconnect, edit, or configure beer kegs on active taps.</span>
                    </div>
                    <div className="md:col-span-1 flex md:justify-end">
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
                        <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary peer-checked:after:bg-white"></div>
                      </label>
                    </div>
                  </div>

                  {/* Row 3: Kitchen View Sales */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-6 py-6 items-start">
                    <div className="md:col-span-2 flex flex-col gap-1">
                      <span className="text-xs font-semibold text-text-primary">Kitchen View Sales</span>
                      <span className="text-[11px] text-zinc-500">Allow kitchen staff to view sales history, overview metrics, and financial dashboard tabs.</span>
                    </div>
                    <div className="md:col-span-1 flex md:justify-end">
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
                        <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary peer-checked:after:bg-white"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-zinc-900/10 border-t border-zinc-800 px-6 py-4 flex justify-between items-center">
                  <p className="text-[11px] text-zinc-500">Changes apply immediately to all active user sessions.</p>
                  <Button type="submit">
                    Save Policies
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>
    </SubNavLayout>
  );
}
