"use client";

import Link from "next/link";
import { Plus, LayoutDashboard } from "lucide-react";

export default function OverviewHeader() {
    return (
        <div className="relative overflow-hidden bg-brand-green text-white p-6 md:p-10 shadow-lg shadow-brand-green/20">
            {/* Decorative shapes */}
            <div className="absolute -top-10 -right-10 w-56 h-56 bg-white/5 rounded-full pointer-events-none" />
            <div className="absolute -bottom-16 -left-8 w-72 h-72 bg-white/5 rounded-full pointer-events-none" />
            <LayoutDashboard size={130} className="absolute -right-4 -bottom-6 text-white/5 pointer-events-none" />

            <div className="relative z-10 flex flex-col gap-3">
                {/* Greeting */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="text-brand-orange font-arabic text-xl" dir="rtl">
                        السَّلَامُ عَلَيْكُمْ
                    </span>
                    <span className="text-white/60 text-sm font-medium">Assalamu Alaikum, Congo</span>
                </div>

                {/* Title + CTA */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-heading font-black uppercase tracking-tight leading-none">
                            My Dashboard
                        </h1>
                        <p className="text-white/70 text-sm md:text-base font-medium mt-1">
                            Peace be upon you. Here is your Zakat summary for today.
                        </p>
                    </div>

                    <Link
                        href="/dashboard/calculator"
                        className="flex items-center justify-center gap-2 bg-white text-brand-green px-6 py-3 font-black text-xs uppercase tracking-widest shadow-lg hover:bg-brand-orange hover:text-white transition-all active:scale-95 group w-full sm:w-auto shrink-0"
                    >
                        <Plus size={16} className="group-hover:rotate-90 transition-transform duration-200" />
                        Calculate Zakat
                    </Link>
                </div>
            </div>
        </div>
    );
}
