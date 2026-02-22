"use client";

import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";
import MobileFooterNav from "@/components/dashboard/MobileFooterNav";
import { SearchProvider } from "@/context/SearchContext";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <SearchProvider>
                <DashboardLayoutContent>{children}</DashboardLayoutContent>
            </SearchProvider>
        </SidebarProvider>
    );
}

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
    const { isCollapsed } = useSidebar();

    return (
        <div className="min-h-screen bg-off-white flex">
            <Sidebar />
            <main className={cn(
                "flex-1 flex flex-col transition-all duration-300 ease-in-out",
                isCollapsed ? "lg:ml-20" : "lg:ml-64"
            )}>
                <TopBar />
                <div className="p-4 md:p-6 lg:p-10 flex-1 pb-32 lg:pb-10">
                    {children}
                </div>
            </main>
            <MobileFooterNav />
        </div>
    );
}
