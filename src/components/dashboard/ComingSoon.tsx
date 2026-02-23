"use client";

import React from "react";
import { Hammer, ArrowLeft, History, Settings, type LucideIcon } from "lucide-react";

// ⚠️ Icon is resolved INSIDE the client component — never passed as a prop
// from a Server Component (which would crash RSC serialization).
const ICON_MAP: Record<string, LucideIcon> = {
    history: History,
    settings: Settings,
    hammer: Hammer,
};

interface ComingSoonProps {
    title: string;
    subtitle?: string;
    arabicLabel?: string;
    /** Plain string key — resolved to a Lucide icon inside this Client Component */
    iconName?: keyof typeof ICON_MAP;
}

export default function ComingSoon({
    title,
    subtitle = "We're building this module to deliver the best Zakat experience. Please check back soon!",
    arabicLabel = "قريباً",
    iconName = "hammer",
}: ComingSoonProps) {
    const Icon = ICON_MAP[iconName] ?? Hammer;

    return (
        <div className="flex flex-col gap-8 pb-20">
            {/* ── Branded Hero Banner ── */}
            <div className="relative overflow-hidden bg-brand-green text-white p-6 md:p-10 shadow-lg shadow-brand-green/20">
                {/* Decorative shapes */}
                <div className="absolute -top-10 -right-10 w-56 h-56 bg-white/5 rounded-full pointer-events-none" />
                <div className="absolute -bottom-16 -left-8 w-72 h-72 bg-white/5 rounded-full pointer-events-none" />
                <Icon size={130} className="absolute -right-4 -bottom-6 text-white/5 pointer-events-none" />

                <div className="relative z-10 flex flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="text-brand-orange font-arabic text-xl" dir="rtl">
                            {arabicLabel}
                        </span>
                        <span className="text-white/60 text-sm font-medium uppercase tracking-widest">
                            Coming Soon
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-heading font-black uppercase tracking-tight leading-none">
                        {title}
                    </h1>
                    <p className="text-white/70 text-sm md:text-base font-medium max-w-xl">
                        {subtitle}
                    </p>
                </div>
            </div>

            {/* ── Body Card ── */}
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-white border border-gray-100 shadow-sm">
                <div className="w-20 h-20 bg-brand-green/10 flex items-center justify-center text-brand-green mb-6 animate-pulse">
                    <Icon size={36} />
                </div>
                <h2 className="text-xl font-heading font-black text-foreground uppercase tracking-tight mb-3">
                    Under Construction
                </h2>
                <p className="text-slate-text text-sm max-w-sm leading-relaxed mb-8">
                    {subtitle}
                </p>
                <button
                    onClick={() => window.history.back()}
                    className="flex items-center gap-2 bg-brand-green text-white px-6 py-3 font-black text-xs uppercase tracking-widest hover:bg-brand-green-light active:scale-95 transition-all shadow-lg shadow-brand-green/10"
                >
                    <ArrowLeft size={14} /> Go Back to Overview
                </button>
            </div>
        </div>
    );
}
