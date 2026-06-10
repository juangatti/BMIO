import React from "react";

interface SubNavLayoutProps {
  mobileNav: React.ReactNode;
  children: React.ReactNode;
}

export default function SubNavLayout({ mobileNav, children }: SubNavLayoutProps) {
  return (
    <div className="space-y-6 animate-fadeIn w-full flex flex-col h-full">
      {/* Mobile Sub-Navigation (visible on mobile only) */}
      <div className="block md:hidden w-full">
        {mobileNav}
      </div>

      {/* Main Workspace content */}
      <div className="flex-1 w-full flex flex-col h-full">
        {children}
      </div>
    </div>
  );
}
