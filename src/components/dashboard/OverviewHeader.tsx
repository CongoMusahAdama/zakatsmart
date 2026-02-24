"use client";

import Link from "next/link";
import { Plus, LayoutDashboard, TrendingUp, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { userStorage, zakatApi, ZakatSummary } from "@/lib/api";

const fmt = (n: number, sym: string) =>
    `${sym}${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function OverviewHeader() {
    const [firstName, setFirstName] = useState("Friend");
    const [summary, setSummary] = useState<ZakatSummary | null>(null);
    const [loading, setLoading] = useState(true);
    // Use last calc's currency symbol if available, else default
    const symbol = "₵"; // GHS default — matches most users

    useEffect(() => {
        const user = userStorage.get();
        if (user?.fullName) setFirstName(user.fullName.split(" ")[0]);

        zakatApi.summary()
            .then(res => setSummary(res.data))
            .catch(() => setSummary(null))
            .finally(() => setLoading(false));
    }, []);

    const statCards = summary
        ? [
            {
                label: "Total Zakat Due",
                val: fmt(summary.totalZakatDue, symbol),
                sub: `${summary.totalCalculations} calculation${summary.totalCalculations !== 1 ? "s" : ""}`,
                Icon: TrendingUp,
                color: "bg-white/10",
            },
            {
                label: "Zakat Paid",
                val: fmt(summary.totalZakatPaid, symbol),
                sub: "Fulfilled so far",
                Icon: CheckCircle,
                color: "bg-white/10",
                green: true,
            },
            {
                label: "Outstanding",
                val: fmt(summary.outstandingZakat, symbol),
                sub: summary.outstandingZakat > 0 ? "Still to pay" : "All cleared 🎉",
                Icon: AlertCircle,
                color: "bg-white/10",
                orange: summary.outstandingZakat > 0,
            },
        ]
        : null;

    return (
        <div className="relative overflow-hidden bg-brand-green text-white p-6 md:p-10 shadow-lg shadow-brand-green/20">
            {/* Decorative */}
            <div className="absolute -top-10 -right-10 w-56 h-56 bg-white/5 rounded-full pointer-events-none" />
            <div className="absolute -bottom-16 -left-8 w-72 h-72 bg-white/5 rounded-full pointer-events-none" />
            <LayoutDashboard size={130} className="absolute -right-4 -bottom-6 text-white/5 pointer-events-none" />

            <div className="relative z-10 flex flex-col gap-4">
                {/* Greeting */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="text-brand-orange font-arabic text-xl" dir="rtl">السَّلَامُ عَلَيْكُمْ</span>
                    <span className="text-white/60 text-sm font-medium">Assalamu Alaikum, {firstName}</span>
                </div>

                {/* Title + CTA */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-heading font-black uppercase tracking-tight leading-none">My Dashboard</h1>
                        <p className="text-white/70 text-sm md:text-base font-medium mt-1">Peace be upon you. Here is your Zakat summary for today.</p>
                    </div>
                    <Link
                        href="/dashboard/calculator"
                        className="flex items-center justify-center gap-2 bg-white text-brand-green px-6 py-3 font-black text-xs uppercase tracking-widest shadow-lg hover:bg-brand-orange hover:text-white transition-all active:scale-95 group w-full sm:w-auto shrink-0"
                    >
                        <Plus size={16} className="group-hover:rotate-90 transition-transform duration-200" />
                        Calculate Zakat
                    </Link>
                </div>

                {/* Live stats row */}
                {loading ? (
                    <div className="flex items-center gap-2 text-white/50 text-xs mt-1">
                        <Loader2 size={14} className="animate-spin" /> Loading your Zakat summary…
                    </div>
                ) : statCards ? (
                    <div className="grid grid-cols-3 gap-2 md:gap-4 mt-1">
                        {statCards.map(({ label, val, sub, Icon, orange, green }) => (
                            <div key={label} className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-none p-3 md:p-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <Icon size={14} className={orange ? "text-brand-orange" : green ? "text-brand-orange" : "text-white/60"} />
                                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white/60 truncate">{label}</span>
                                </div>
                                <p className={`text-sm md:text-xl font-black tracking-tight ${orange ? "text-brand-orange" : "text-white"}`}>{val}</p>
                                <p className="text-[9px] text-white/40 mt-0.5 font-medium">{sub}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-white/40 text-xs mt-1">No calculations yet — start below!</p>
                )}
            </div>
        </div>
    );
}
