"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

export default function OverviewHeader() {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4 md:mb-8">
            <div className="flex flex-col gap-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3">
                    <span className="text-brand-green font-arabic text-xl md:text-2xl" dir="rtl">السَّلَامُ عَلَيْكُمْ</span>
                    <h2 className="text-lg md:text-xl font-bold text-slate-text">Assalamu Alaikum, Congo</h2>
                </div>
                <p className="text-sm md:text-base text-slate-text mt-1 font-medium">Peace be upon you. Here is your Zakat summary for today.</p>
            </div>

            <Link
                href="/dashboard/calculator"
                className="flex items-center justify-center gap-2 bg-brand-green text-white px-8 py-3.5 md:py-3 rounded-none font-black text-xs md:text-sm uppercase tracking-widest shadow-lg shadow-brand-green/20 hover:bg-brand-green-light transition-all active:scale-95 group w-full md:w-auto"
            >
                <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                <span>Calculate Zakat</span>
            </Link>
        </div>
    );
}
