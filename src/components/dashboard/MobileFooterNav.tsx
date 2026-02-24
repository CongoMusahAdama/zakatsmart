"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Calculator,
    MapPin,
    History,
    LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import SignOutModal from "@/components/ui/SignOutModal";
import Swal from "sweetalert2";
import { userStorage } from "@/lib/api";

const navItems = [
    { name: "Home", icon: LayoutDashboard, href: "/dashboard" },
    { name: "Map", icon: MapPin, href: "/dashboard/map" },
    { name: "Calculate", icon: Calculator, href: "/dashboard/calculator", isMain: true },
    { name: "Impact", icon: History, href: "/dashboard/impact" },
];

export default function MobileFooterNav() {
    const pathname = usePathname();
    const router = useRouter();
    const [showSignOutModal, setShowSignOutModal] = useState(false);
    const [signingOut, setSigningOut] = useState(false);

    const handleSignOut = async () => {
        setSigningOut(true);
        const user = userStorage.get();
        const firstName = user?.fullName?.split(' ')[0] || 'Friend';

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
            <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm">
                <div className="bg-white/80 backdrop-blur-lg border border-white/20 shadow-2xl rounded-3xl p-2 flex items-center justify-between">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;

                        if (item.isMain) {
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="relative -top-6"
                                >
                                    <div className={cn(
                                        "w-16 h-16 rounded-full flex items-center justify-center shadow-2xl ring-4 ring-white transition-all active:scale-90",
                                        isActive
                                            ? "bg-brand-orange text-white"
                                            : "bg-brand-green text-white"
                                    )}>
                                        <item.icon size={28} />
                                    </div>
                                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-tighter text-brand-green whitespace-nowrap">
                                        {item.name}
                                    </span>
                                </Link>
                            );
                        }

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all active:scale-90",
                                    isActive ? "bg-brand-green/10 text-brand-green" : "text-slate-text hover:text-brand-green"
                                )}
                            >
                                <item.icon size={20} className={isActive ? "stroke-3" : ""} />
                                <span className={cn(
                                    "text-[9px] font-bold mt-1",
                                    isActive ? "text-brand-green" : "text-slate-text"
                                )}>
                                    {item.name}
                                </span>
                            </Link>
                        );
                    })}

                    {/* Sign Out button */}
                    <button
                        onClick={() => setShowSignOutModal(true)}
                        className="flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all active:scale-90 text-red-400 hover:text-red-500 hover:bg-red-50"
                    >
                        <LogOut size={20} />
                        <span className="text-[9px] font-bold mt-1">Sign Out</span>
                    </button>
                </div>
            </div>

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
