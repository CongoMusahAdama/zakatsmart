"use client";

import React, { useEffect, useState, useCallback } from "react";
import { CheckCircle2, Clock, ArrowUpRight, BarChart3, TrendingUp, Loader2, RefreshCw, BookOpen } from "lucide-react";
import { useSearch } from "@/context/SearchContext";
import { zakatApi, ZakatCalculation, ZakatSummary } from "@/lib/api";
import Link from "next/link";

// ── helpers ───────────────────────────────────────────────────────────────────
function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 2) return "just now";
    if (mins < 60) return `${mins} min ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(iso).toLocaleDateString();
}

const SYMBOLS: Record<string, string> = { GHS: "₵", NGN: "₦", USD: "$" };

// ── component ─────────────────────────────────────────────────────────────────
export default function ImpactTracker() {
    const { searchQuery } = useSearch();

    const [calcs, setCalcs] = useState<ZakatCalculation[]>([]);
    const [summary, setSummary] = useState<ZakatSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        setLoading(true); setError("");
        try {
            const [listRes, sumRes] = await Promise.all([
                zakatApi.list(1, 20),
                zakatApi.summary(),
            ]);
            setCalcs(listRes.data.calculations);
            setSummary(sumRes.data);
        } catch {
            setError("Could not load your calculations. Please try again.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    // ── filter by search ───────────────────────────────────────────────────────
    const filtered = calcs.filter(c =>
        c.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.currency.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.zakatYear.includes(searchQuery) ||
        (c.isPaid ? "paid" : "unpaid").includes(searchQuery.toLowerCase())
    );

    // ── stat cards from real data ──────────────────────────────────────────────
    const sym = SYMBOLS[calcs[0]?.currency ?? "GHS"] ?? "₵";

    const statCards = [
        {
            label: "Total Zakat Due",
            value: summary ? `${sym}${summary.totalZakatDue.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : "—",
            sub: "Lifetime",
            Icon: TrendingUp,
            bg: "bg-brand-green",
            shadow: "shadow-brand-green/20",
        },
        {
            label: "Zakat Paid",
            value: summary ? `${sym}${summary.totalZakatPaid.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : "—",
            sub: "Fulfilled",
            Icon: CheckCircle2,
            bg: "bg-blue-600",
            shadow: "shadow-blue-600/20",
        },
        {
            label: "Outstanding",
            value: summary ? `${sym}${summary.outstandingZakat.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : "—",
            sub: summary?.outstandingZakat === 0 ? "All cleared 🎉" : "Still to pay",
            Icon: Clock,
            bg: summary?.outstandingZakat === 0 ? "bg-brand-green" : "bg-brand-orange",
            shadow: summary?.outstandingZakat === 0 ? "shadow-brand-green/20" : "shadow-brand-orange/20",
        },
        {
            label: "Calculations",
            value: summary ? `${summary.totalCalculations}` : "—",
            sub: "Saved records",
            Icon: ArrowUpRight,
            bg: "bg-[#6366f1]",
            shadow: "shadow-[#6366f1]/20",
        },
    ];

    return (
        <div className="bg-white rounded-none p-6 shadow-sm border border-gray-50 flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-lg md:text-xl font-heading font-bold text-foreground">Transparency Tracker</h2>
                    <p className="text-[10px] md:text-xs text-slate-text mt-1">Your real Zakat calculation history</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={load} disabled={loading}
                        className="p-2 rounded-lg bg-light-gray text-slate-text hover:text-brand-green transition-all active:scale-95 disabled:opacity-50">
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                    </button>
                    <button className="p-2 rounded-lg bg-light-gray text-slate-text hover:text-brand-green transition-all active:scale-95">
                        <BarChart3 size={18} />
                    </button>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4 mb-8">
                {statCards.map(({ label, value, sub, Icon, bg, shadow }) => (
                    <div key={label} className={`relative overflow-hidden ${bg} rounded-none p-4 md:p-5 text-white shadow-lg ${shadow} group`}>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-3 md:mb-4">
                                <div className="p-1.5 md:p-2 bg-white/20 backdrop-blur-md rounded-none">
                                    <Icon size={16} className="text-white md:w-5 md:h-5" />
                                </div>
                            </div>
                            <p className="text-[9px] md:text-[10px] font-bold text-white/70 uppercase tracking-widest mb-0.5">{label}</p>
                            <h3 className="text-base md:text-2xl font-black font-heading tracking-tight leading-none text-white truncate">
                                {loading ? <span className="opacity-50 text-sm">…</span> : value}
                            </h3>
                            <p className="text-[9px] md:text-[10px] text-white/50 mt-1 font-medium hidden sm:block">{sub}</p>
                        </div>
                        <Icon size={70} className="absolute -bottom-2 -right-2 text-white/10 -rotate-12 transition-transform group-hover:scale-110 duration-500 md:w-[100px] md:h-[100px]" />
                    </div>
                ))}
            </div>

            {/* Activity List */}
            <div className="space-y-4 flex-1">
                <h3 className="text-sm font-bold text-slate-text uppercase tracking-wider flex items-center justify-between">
                    Your Calculations
                    <span className="text-[10px] text-brand-green bg-brand-green/10 px-2 py-0.5 rounded-full lowercase">
                        {calcs.length} saved
                    </span>
                </h3>

                {error && (
                    <div className="py-6 text-center">
                        <p className="text-red-400 text-sm mb-3">{error}</p>
                        <button onClick={load} className="text-brand-green text-xs font-black uppercase tracking-widest hover:underline">
                            Retry
                        </button>
                    </div>
                )}

                {loading && !error && (
                    <div className="flex justify-center items-center py-16">
                        <Loader2 size={28} className="animate-spin text-brand-green" />
                    </div>
                )}

                {!loading && !error && filtered.length === 0 && (
                    <div className="py-12 text-center flex flex-col items-center gap-3">
                        <BookOpen size={36} className="text-gray-200" />
                        {searchQuery ? (
                            <p className="text-slate-text text-sm">No results for "<strong>{searchQuery}</strong>"</p>
                        ) : (
                            <>
                                <p className="text-slate-text text-sm font-medium">No calculations saved yet.</p>
                                <Link href="/dashboard/calculator"
                                    className="bg-brand-green text-white text-xs font-black uppercase tracking-widest px-5 py-2.5 hover:bg-brand-green-hover transition-all active:scale-95">
                                    Start Your First Calculation
                                </Link>
                            </>
                        )}
                    </div>
                )}

                {!loading && !error && filtered.length > 0 && (
                    <div className="relative space-y-4 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-100 before:to-transparent">
                        {filtered.map((calc) => {
                            const s = SYMBOLS[calc.currency] ?? "₵";
                            return (
                                <div key={calc._id} className="relative flex items-center gap-4 group">
                                    {/* Avatar dot */}
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm z-10 transition-transform group-hover:scale-110 shrink-0 ${calc.isPaid ? "bg-brand-green text-white" : "bg-brand-orange text-white"
                                        }`}>
                                        {calc.isPaid ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                                    </div>

                                    {/* Card */}
                                    <div className="flex-1 bg-light-gray/30 p-4 rounded-2xl group-hover:bg-light-gray/60 transition-colors border border-transparent group-hover:border-gray-100">
                                        <div className="flex items-start justify-between mb-1 gap-2">
                                            <p className="text-xs font-bold text-foreground truncate">{calc.label}</p>
                                            <span className="text-[10px] font-medium text-slate-text shrink-0">{timeAgo(calc.createdAt)}</span>
                                        </div>
                                        <div className="flex items-center justify-between gap-2">
                                            <p className={`text-sm font-bold ${calc.isAboveNisab ? "text-brand-green" : "text-slate-text"}`}>
                                                {calc.isAboveNisab
                                                    ? `${s}${calc.zakatDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} due`
                                                    : "Below Nisab"}
                                            </p>
                                            <div className="flex items-center gap-1.5 flex-wrap justify-end">
                                                <span className="text-[9px] font-black uppercase tracking-widest bg-gray-100 text-slate-text px-1.5 py-0.5">
                                                    {calc.currency} · {calc.zakatYear}
                                                </span>
                                                <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 ${calc.isPaid
                                                        ? "bg-brand-green/10 text-brand-green"
                                                        : "bg-brand-orange/10 text-brand-orange"
                                                    }`}>
                                                    {calc.isPaid ? "✓ Paid" : "Unpaid"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Footer CTA */}
            <Link href="/dashboard/calculator"
                className="mt-8 w-full py-4 text-sm font-bold text-slate-text hover:text-brand-green transition-all active:scale-[0.99] flex items-center justify-center gap-2 border border-transparent hover:border-gray-100">
                Open Full Calculator <ArrowUpRight size={16} />
            </Link>
        </div>
    );
}
