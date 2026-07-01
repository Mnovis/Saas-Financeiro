"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarAberta, setSidebarAberta] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar aberta={sidebarAberta} fechar={() => setSidebarAberta(false)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar onAbrirSidebar={() => setSidebarAberta(true)} />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
