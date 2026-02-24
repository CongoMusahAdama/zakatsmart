"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Calculator,
    MapPin,
    History,
    Settings,
    ChevronLeft,
    ChevronRight,
    LogOut
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/context/SidebarContext";
import SignOutModal from "@/components/ui/SignOutModal";
import Swal from "sweetalert2";
import { userStorage } from "@/lib/api";

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
    const router = useRouter();
    const [showSignOutModal, setShowSignOutModal] = useState(false);
    const [signingOut, setSigningOut] = useState(false);

    const handleSignOut = async () => {
        setSigningOut(true);
        const user = userStorage.get();
        const firstName = user?.fullName?.split(' ')[0] || 'Friend';

        // Clear tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('authUser');
        sessionStorage.clear();

        await Swal.fire({
            html: `
              <div style="font-family:'Inter',sans-serif;text-align:center;padding:0">
                <div style="background:linear-gradient(135deg,#005C46 0%,#007a5e 100%);margin:-1px -1px 0;padding:28px 24px 36px;position:relative;overflow:hidden">
                  <div style="position:absolute;top:-20px;right:-20px;width:110px;height:110px;background:rgba(255,255,255,0.05);border-radius:50%"></div>
                  <div style="position:absolute;bottom:-28px;left:-10px;width:90px;height:90px;background:rgba(255,255,255,0.05);border-radius:50%"></div>
                  <img src="/zakat logo.png" width="48" height="48" style="object-fit:contain;margin-bottom:10px;position:relative;z-index:1" />
                  <div style="color:rgba(255,255,255,0.6);font-size:11px;font-weight:700;letter-spacing:0.25em;text-transform:uppercase;position:relative;z-index:1">ZakatAid</div>
                </div>
                <div style="margin-top:-22px;display:flex;justify-content:center;margin-bottom:14px">
                  <div style="width:44px;height:44px;border-radius:50%;background:#F7A300;border:4px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 20px rgba(247,163,0,0.35);font-size:20px">👋</div>
                </div>
                <div style="padding:0 24px 8px">
                  <p style="color:rgba(0,92,70,0.6);font-size:11px;font-weight:800;letter-spacing:0.25em;text-transform:uppercase;margin:0 0 6px">See you soon</p>
                  <h2 style="margin:0 0 6px;font-family:'Outfit',sans-serif;font-size:1.5rem;font-weight:900;color:#111;letter-spacing:-0.04em;line-height:1.1">Goodbye, ${firstName}!</h2>
                  <p style="color:#aaa;font-size:12px;margin:0">You've been signed out safely.</p>
                </div>
                <div style="margin:14px 24px 4px;padding:12px 16px;background:#F0F7F5;border-radius:12px">
                  <p style="margin:0;color:#005C46;font-size:15px;direction:rtl;font-weight:600">مَعَ السَّلَامَة</p>
                  <p style="margin:4px 0 0;color:#888;font-size:11px;font-weight:500">Go with peace</p>
                </div>
              </div>`,
            timer: 2200,
            timerProgressBar: true,
            showConfirmButton: false,
            background: '#ffffff',
            padding: 0,
            customClass: {
                popup: 'swal-zakat-popup',
                timerProgressBar: 'swal-zakat-bar',
            },
        });

        router.push('/');
    };

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
                    <button
                        onClick={() => setShowSignOutModal(true)}
                        className={cn(
                            "flex items-center gap-3 px-3 py-3 w-full rounded-none transition-all duration-200 text-slate-text hover:bg-red-50 hover:text-red-500 group active:scale-95",
                            isCollapsed ? "justify-center" : ""
                        )}
                    >
                        <LogOut size={22} />
                        {!isCollapsed && <span className="font-medium">Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* Sign-out confirmation modal */}
            <SignOutModal
                isOpen={showSignOutModal}
                onCancel={() => setShowSignOutModal(false)}
                onConfirm={handleSignOut}
                loading={signingOut}
            />
        </>
    );
}
