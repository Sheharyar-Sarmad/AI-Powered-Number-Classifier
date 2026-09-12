"use client";

import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load persisted state on mount
  useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed");
    if (stored === "true") setIsCollapsed(true);
  }, []);

  // Persist on change
  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", String(isCollapsed));
  }, [isCollapsed]);

  return (
    <div className="relative min-h-screen text-neutral-100">
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      <main
        className={`relative z-10 min-w-0 transition-[padding-left] duration-300 ease-out ${
          isCollapsed ? "lg:pl-[5rem]" : "lg:pl-[18rem]"
        }`}
      >
        {children}
      </main>
    </div>
  );
}