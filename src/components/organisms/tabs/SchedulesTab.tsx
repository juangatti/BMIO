import React from "react";
import { Plus, UserCheck, Trash2, Settings } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "../../atoms/Button";

interface SchedulesTabProps {
  localData: {
    schedules: any[];
    users: any[];
    barConfigs: any[];
  };
  onOpenAddModal: () => void;
  onDeleteSchedule: (id: string) => void;
  onUpdateConfig: (id: string, opening: string, kitchen: string, bar: string) => void;
}

export default function SchedulesTab({
  localData,
  onOpenAddModal,
  onDeleteSchedule,
  onUpdateConfig,
}: SchedulesTabProps) {
  const todayStr = new Date().toDateString();
  const todayShifts = localData.schedules.filter(
    (s) => new Date(s.workDate).toDateString() === todayStr
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Action Bar */}
      <div className="bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800/60 flex justify-between items-center">
        <span className="text-xs uppercase tracking-wider text-text-secondary font-semibold">
          Work Schedules & Staff Shifts
        </span>
        <Button onClick={onOpenAddModal}>
          Add Shift
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
        </Button>
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
              {todayShifts.length === 0 ? (
                <p className="text-xs text-text-muted italic py-4">
                  No staff scheduled for today.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {todayShifts.map((s) => {
                    const u = localData.users.find((usr) => usr.id === s.userId);
                    return (
                      <div
                        key={s.id}
                        className="bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800/40 flex flex-col justify-between relative"
                      >
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="text-sm font-semibold text-text-primary">
                                {u?.name || "Unknown User"}
                              </p>
                              <span className="text-[10px] bg-zinc-900 text-text-secondary px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                                {u?.role || "Staff"}
                              </span>
                            </div>
                            <button
                              onClick={() => onDeleteSchedule(s.id)}
                              className="text-text-muted hover:text-rose-400 transition-colors cursor-pointer"
                              title="Delete Shift"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="text-xs text-text-secondary space-y-1 mt-2">
                            <p>
                              <span className="text-text-muted">Hours:</span>{" "}
                              <span className="font-semibold text-primary">
                                {s.startTime} - {s.endTime}
                              </span>
                            </p>
                            {s.notes && (
                              <p className="text-[10px] text-text-muted italic">"{s.notes}"</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>

          {/* Weekly/Upcoming Schedules List */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-display text-text-primary mb-4">
                All Scheduled Shifts
              </h2>
              {localData.schedules.length === 0 ? (
                <p className="text-xs text-text-muted italic py-4">No scheduled shifts found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-800 bg-zinc-900/40 text-[10px] text-text-secondary uppercase tracking-wider">
                        <th className="p-3">Staff</th>
                        <th className="p-3">Role</th>
                        <th className="p-3">Date</th>
                        <th className="p-3">Hours</th>
                        <th className="p-3">Notes</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900">
                      {[...localData.schedules]
                        .sort((a, b) => new Date(a.workDate).getTime() - new Date(b.workDate).getTime())
                        .map((s) => {
                          const u = localData.users.find((usr) => usr.id === s.userId);
                          return (
                            <tr key={s.id} className="hover:bg-zinc-900/20 transition-colors">
                              <td className="p-3 text-xs font-semibold text-text-primary">
                                {u?.name || "Unknown"}
                              </td>
                              <td className="p-3 text-xs text-text-secondary uppercase font-mono">
                                {u?.role || "Staff"}
                              </td>
                              <td className="p-3 text-xs text-text-primary">
                                {new Date(s.workDate).toLocaleDateString(undefined, {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </td>
                              <td className="p-3 text-xs text-primary font-mono">
                                {s.startTime} - {s.endTime}
                              </td>
                              <td className="p-3 text-xs text-text-muted max-w-xs truncate">
                                {s.notes || "-"}
                              </td>
                              <td className="p-3 text-right">
                                <button
                                  onClick={() => onDeleteSchedule(s.id)}
                                  className="text-text-muted hover:text-rose-400 transition-colors cursor-pointer"
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
              <p className="text-[10px] text-text-secondary uppercase tracking-wider mb-4">
                Daily Operation Schedule
              </p>

              <div className="space-y-4">
                {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(
                  (dayName, index) => {
                    const config = localData.barConfigs.find((c) => c.dayOfWeek === index);
                    if (!config) return null;
                    return (
                      <div
                        key={config.id}
                        className="p-3 bg-zinc-950/50 rounded-2xl border border-zinc-800/40 space-y-2"
                      >
                        <div className="flex justify-between items-center border-b border-zinc-900 pb-1">
                          <span className="text-xs font-semibold text-text-primary">{dayName}</span>
                          <span className="text-[10px] text-text-muted">Day #{index}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[8px] uppercase text-text-muted mb-0.5">
                              Opens
                            </label>
                            <input
                              type="text"
                              defaultValue={config.openingTime}
                              onBlur={(e) =>
                                onUpdateConfig(
                                  config.id,
                                  e.target.value,
                                  config.kitchenCloseTime,
                                  config.barCloseTime
                                )
                              }
                              className="w-full bg-zinc-900 border border-zinc-800 text-text-primary rounded p-1 text-[11px] font-mono focus:border-primary outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] uppercase text-text-muted mb-0.5">
                              Kitchen
                            </label>
                            <input
                              type="text"
                              defaultValue={config.kitchenCloseTime}
                              onBlur={(e) =>
                                onUpdateConfig(
                                  config.id,
                                  config.openingTime,
                                  e.target.value,
                                  config.barCloseTime
                                )
                              }
                              className="w-full bg-zinc-900 border border-zinc-800 text-text-primary rounded p-1 text-[11px] font-mono focus:border-primary outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] uppercase text-text-muted mb-0.5">
                              Bar Close
                            </label>
                            <input
                              type="text"
                              defaultValue={config.barCloseTime}
                              onBlur={(e) =>
                                onUpdateConfig(
                                  config.id,
                                  config.openingTime,
                                  config.kitchenCloseTime,
                                  e.target.value
                                )
                              }
                              className="w-full bg-zinc-900 border border-zinc-800 text-text-primary rounded p-1 text-[11px] font-mono focus:border-primary outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
