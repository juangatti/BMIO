import React from "react";
import { Plus } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "../../atoms/Button";
import StatusBadge from "../../molecules/StatusBadge";

interface StaffTabProps {
  users: any[];
  currentUser: any;
  onOpenAddModal: () => void;
  onToggleUserActive: (userId: string, active: boolean) => void;
}

export default function StaffTab({
  users,
  currentUser,
  onOpenAddModal,
  onToggleUserActive,
}: StaffTabProps) {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800/40 flex justify-between items-center">
        <span className="text-xs uppercase tracking-wider text-text-secondary font-semibold">
          Staff Member Accounts
        </span>
        <Button onClick={onOpenAddModal}>
          <Plus className="w-4 h-4" /> Add Staff Member
        </Button>
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
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="p-4 text-xs font-semibold text-text-primary">{u.name}</td>
                  <td className="p-4 text-xs text-text-secondary font-mono">{u.email}</td>
                  <td className="p-4 text-[10px]">
                    <span className="bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-[10px]">
                    <StatusBadge status={u.isActive ? "success" : "danger"} />
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => onToggleUserActive(u.id, !u.isActive)}
                      disabled={u.id === currentUser?.id}
                      className="text-[10px] disabled:opacity-50 disabled:cursor-not-allowed bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-3 py-1 rounded-lg text-text-primary transition-colors cursor-pointer"
                    >
                      {u.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
