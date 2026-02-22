"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Calculator,
    MapPin,
    History,
    Settings,
    Menu,
    X,
    ChevronLeft,
    ChevronRight,
    LogOut
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";

import { useSidebar } from "@/context/SidebarContext";

const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { name: "Smart Calculator", icon: Calculator, href: "/dashboard/calculator" },
    { name: "Local Giving Map", icon: MapPin, href: "/dashboard/map" },
    { name: "Impact Tracker", icon: History, href: "/dashboard/impact" },
    { name: "Settings", icon: Settings, href: "/dashboard/settings" },
];

export default function Sidebar() {
    const { isCollapsed, toggleSidebar, isMobileMenuOpen, setIsMobileMenuOpen } = useSidebar();
    const pathname = usePathname();

    return (
        <>
            {/* Mobile Toggle Button - Hidden in favor of Bottom Nav */}
            {/* <div className="lg:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={toggleMobileMenu}
                    className="p-2 bg-white rounded-lg shadow-md text-brand-green"
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div> */}

            {/* Backdrop for mobile */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar Container */}
            <aside
                className={cn(
                    "fixed top-0 left-0 h-screen bg-white border-r border-gray-100 z-40 transition-all duration-300 ease-in-out flex flex-col",
                    isCollapsed ? "w-20" : "w-64",
                    isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                {/* Logo Section */}
                <div className="p-6 flex items-center justify-between">
                    {!isCollapsed && (
                        <Link href="/dashboard" className="flex items-center gap-2">
                            <div className="relative w-10 h-10 shrink-0">
                                <Image
                                    src="/zakat logo.png"
                                    alt="Zakat Smart Logo"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <span className="font-heading font-bold text-xl text-brand-green">Zakat Smart</span>
                        </Link>
                    )}
                    {isCollapsed && (
                        <div className="relative w-10 h-10 mx-auto shrink-0">
                            <Image
                                src="/zakat logo.png"
                                alt="Zakat Smart Logo"
                                fill
                                className="object-contain"
                            />
                        </div>
                    )}
                    <button
                        onClick={toggleSidebar}
                        className="hidden lg:flex items-center justify-center w-6 h-6 rounded-full bg-light-gray text-slate-text hover:text-brand-green transition-colors absolute -right-3 top-7 border border-gray-100"
                    >
                        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 px-4 mt-6 space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-3 rounded-none transition-all duration-200 group text-slate-text active:scale-98",
                                    isActive
                                        ? "bg-brand-green text-white shadow-lg shadow-brand-green/20"
                                        : "hover:bg-brand-green/5 hover:text-brand-green"
                                )}
                            >
                                <item.icon size={22} className={cn(
                                    "flex-shrink-0",
                                    isActive ? "text-white" : "text-slate-text group-hover:text-brand-green"
                                )} />
                                {!isCollapsed && (
                                    <span className="font-medium">{item.name}</span>
                                )}
                                {isCollapsed && !isMobileMenuOpen && (
                                    <div className="absolute left-16 bg-brand-green text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                                        {item.name}
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Section */}
                <div className="p-4 border-t border-gray-50 mb-4">
                    <button className={cn(
                        "flex items-center gap-3 px-3 py-3 w-full rounded-none transition-all duration-200 text-slate-text hover:bg-brand-red/5 hover:text-brand-red group active:scale-95",
                        isCollapsed ? "justify-center" : ""
                    )}>
                        <LogOut size={22} />
                        {!isCollapsed && <span className="font-medium">Sign Out</span>}
                    </button>
                </div>
            </aside>
        </>
    );
}
