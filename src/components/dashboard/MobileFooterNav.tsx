"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Calculator,
    MapPin,
    History,
    Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    { name: "Home", icon: LayoutDashboard, href: "/dashboard" },
    { name: "Map", icon: MapPin, href: "/dashboard/map" },
    { name: "Calculate", icon: Calculator, href: "/dashboard/calculator", isMain: true },
    { name: "Impact", icon: History, href: "/dashboard/impact" },
    { name: "Settings", icon: Settings, href: "/dashboard/settings" },
];

export default function MobileFooterNav() {
    const pathname = usePathname();

    return (
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
            </div>
        </div>
    );
}
