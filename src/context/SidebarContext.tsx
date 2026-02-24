"use client";

import React, { createContext, useContext, useState } from "react";

interface SidebarContextType {
    isCollapsed: boolean;
    toggleSidebar: () => void;
    isMobileMenuOpen: boolean;
    toggleMobileMenu: () => void;
    setIsMobileMenuOpen: (val: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleSidebar = () => setIsCollapsed(prev => !prev);
    const toggleMobileMenu = () => setIsMobileMenuOpen(prev => !prev);

    return (
        <SidebarContext.Provider value={{
            isCollapsed,
            toggleSidebar,
            isMobileMenuOpen,
            toggleMobileMenu,
            setIsMobileMenuOpen
        }}>
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error("useSidebar must be used within a SidebarProvider");
    }
    return context;
}
