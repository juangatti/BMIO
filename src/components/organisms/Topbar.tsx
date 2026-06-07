import React from "react";
import Breadcrumb from "../molecules/Breadcrumb";
import { logoutUser } from "@/db/actions";

interface TopbarProps {
  activeTab: string;
  userName: string;
  userRole: string;
  onProfileClick: () => void;
}

export default function Topbar({
  activeTab,
  userName,
  userRole,
  onProfileClick,
}: TopbarProps) {
  return (
    <header className="h-16 border-b border-zinc-900/60 bg-zinc-950/40 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30 shrink-0">
      {/* Left side: Breadcrumbs */}
      <Breadcrumb activeTab={activeTab} />

      {/* Right side: Logout & User Profile */}
      <div className="flex items-center gap-3">
        {/* Subtle Logout button */}
        <button
          onClick={async () => {
            await logoutUser();
            window.location.reload();
          }}
          className="text-[11px] bg-zinc-900 hover:bg-zinc-800 hover:text-rose-400 text-zinc-400 border border-zinc-800 hover:border-rose-500/20 px-3.5 py-1.5 rounded-lg font-bold uppercase transition-all duration-300 cursor-pointer"
        >
          Logout
        </button>

        {/* Vertical border line separator */}
        <div className="w-[1px] h-6 bg-zinc-900" />

        {/* User profile */}
        <div
          onClick={onProfileClick}
          className="flex items-center gap-2 hover:bg-zinc-900 px-2 py-1 rounded-lg cursor-pointer transition-colors group"
        >
          <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center font-display font-bold text-xs text-primary group-hover:border-primary/40 transition-colors">
            {userName ? userName.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-semibold text-zinc-200 group-hover:text-primary transition-colors leading-none">
              {userName}
            </span>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest leading-none mt-1 font-mono">
              {userRole}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
