"use client";

import React, { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import {
    MapPin, Navigation, CheckCircle2, ShieldCheck,
    Phone, Globe, Heart, Lock, Unlock, ArrowRight,
    X, CreditCard, Info, Filter, LocateFixed,
    Utensils, BookOpen, Stethoscope, BadgeCheck,
    Mail, Home, List, Search, SlidersHorizontal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

/* ─── Dynamic Map ────────────────────────────────────────────── */
const InteractiveMap = dynamic(
    () => import("@/components/dashboard/InteractiveMap"),
    {
        ssr: false,
        loading: () => (
            <div className="h-full w-full bg-brand-green/5 animate-pulse flex items-center justify-center">
                <span className="text-xs font-black uppercase tracking-widest text-slate-text">
                    Loading Live Map…
                </span>
            </div>
        ),
    }
);

/* ─── Data ───────────────────────────────────────────────────── */
type OrgCategory = "Food Support" | "Education" | "Health" | "Community";
type GivingType = "Zakat" | "Sadaqah";

interface Org {
    id: number;
    name: string;
    description: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    distance: string;
    verified: boolean;
    category: OrgCategory;
    givingTypes: GivingType[];
    accepts: string[];
    supports: string[];
}

const ALL_ORGS: Org[] = [
    {
        id: 1,
        name: "Central Mosque Accra",
        description: "The oldest mosque in Accra, serving as a major Zakat collection and distribution hub for Greater Accra.",
        address: "Kanda Highway, Accra, Ghana",
        phone: "+233 30 266 1234",
        email: "info@centralmosqueaccra.org",
        website: "centralmosqueaccra.org",
        distance: "0.8 km",
        verified: true,
        category: "Community",
        givingTypes: ["Zakat", "Sadaqah"],
        accepts: ["Zakat al-Mal", "Zakat al-Fitr", "Sadaqah"],
        supports: ["Food Aid", "Education", "Healthcare"],
    },
    {
        id: 2,
        name: "Al-Barakah Charity",
        description: "A grassroots charity focused on vulnerable families — food baskets, school fees, and medical assistance.",
        address: "Ring Road Central, Accra, Ghana",
        phone: "+233 24 512 8800",
        email: "give@albarakah.org.gh",
        website: "albarakah.org.gh",
        distance: "1.2 km",
        verified: true,
        category: "Food Support",
        givingTypes: ["Zakat", "Sadaqah"],
        accepts: ["Zakat al-Mal", "Zakat al-Fitr"],
        supports: ["Family Aid", "Orphan Support", "Ramadan Packs"],
    },
    {
        id: 3,
        name: "Madina Community Center",
        description: "Community hub running Quran classes, outreach programs, and a weekly food drive.",
        address: "Madina Zongo, Accra, Ghana",
        phone: "+233 50 333 7712",
        email: "hello@madinacenter.gh",
        website: "madinacenter.gh",
        distance: "2.5 km",
        verified: false,
        category: "Education",
        givingTypes: ["Sadaqah"],
        accepts: ["Sadaqah"],
        supports: ["Education", "Food Drive"],
    },
    {
        id: 4,
        name: "Nima Health Outreach",
        description: "Free and subsidised medical care and health screening for underserved communities in Nima.",
        address: "Nima Road, Accra, Ghana",
        phone: "+233 27 811 4400",
        email: "care@nimahealthgh.org",
        website: "nimahealthgh.org",
        distance: "3.1 km",
        verified: true,
        category: "Health",
        givingTypes: ["Sadaqah"],
        accepts: ["Sadaqah"],
        supports: ["Healthcare", "Medication Aid"],
    },
];

const CATEGORY_ICONS: Record<OrgCategory, React.ElementType> = {
    "Food Support": Utensils,
    "Education": BookOpen,
    "Health": Stethoscope,
    "Community": Home,
};

const CATEGORY_COLORS: Record<OrgCategory, string> = {
    "Food Support": "bg-amber-50 text-amber-700 border-amber-200",
    "Education": "bg-blue-50 text-blue-700 border-blue-200",
    "Health": "bg-rose-50 text-rose-700 border-rose-200",
    "Community": "bg-brand-green/10 text-brand-green border-brand-green/20",
};

const QUICK_AMOUNTS = [10, 20, 50, 100, 200];

type TabId = "centers" | "filters" | "details";

/* ─── Page ───────────────────────────────────────────────────── */
export default function MapPage() {
    /* Filter state */
    const [verifiedOnly, setVerifiedOnly] = useState(false);
    const [activeCategories, setActiveCategories] = useState<OrgCategory[]>([]);
    const [activeGiving, setActiveGiving] = useState<GivingType[]>([]);

    /* UI state */
    const [activeTab, setActiveTab] = useState<TabId>("centers");
    const [selectedOrg, setSelectedOrg] = useState<Org | null>(null);

    /* Donation modal */
    const [donateTarget, setDonateTarget] = useState<Org | null>(null);
    const [donateStep, setDonateStep] = useState<"form" | "confirm" | "success">("form");
    const [amount, setAmount] = useState("");
    const [givingIntent, setGivingIntent] = useState<GivingType>("Zakat");
    const [anonymous, setAnonymous] = useState(false);

    /* Search */
    const [searchQuery, setSearchQuery] = useState("");

    const filtered = useMemo(() => ALL_ORGS.filter(o => {
        if (verifiedOnly && !o.verified) return false;
        if (activeCategories.length > 0 && !activeCategories.includes(o.category)) return false;
        if (activeGiving.length > 0 && !activeGiving.some(g => o.givingTypes.includes(g))) return false;
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            if (!o.name.toLowerCase().includes(q) &&
                !o.description.toLowerCase().includes(q) &&
                !o.category.toLowerCase().includes(q) &&
                !o.address.toLowerCase().includes(q)) return false;
        }
        return true;
    }), [verifiedOnly, activeCategories, activeGiving, searchQuery]);

    const activeFilterCount = (verifiedOnly ? 1 : 0) + activeCategories.length + activeGiving.length;

    const toggleCategory = (cat: OrgCategory) =>
        setActiveCategories(p => p.includes(cat) ? p.filter(c => c !== cat) : [...p, cat]);

    const toggleGiving = (g: GivingType) =>
        setActiveGiving(p => p.includes(g) ? p.filter(x => x !== g) : [...p, g]);

    const openDonate = (org: Org) => {
        setDonateTarget(org);
        setDonateStep("form");
        setAmount("");
        setAnonymous(false);
        setGivingIntent(org.givingTypes.includes("Zakat") ? "Zakat" : "Sadaqah");
    };

    const closeModal = () => { setDonateTarget(null); setDonateStep("form"); };

    const selectOrg = (org: Org) => {
        setSelectedOrg(org);
        setActiveTab("details");
    };

    const tabs: { id: TabId; label: string; icon: React.ElementType; count?: number }[] = [
        { id: "centers", label: "Centers", icon: List, count: filtered.length },
        { id: "filters", label: "Filters", icon: SlidersHorizontal, count: activeFilterCount || undefined },
        { id: "details", label: "Details", icon: MapPin, count: selectedOrg ? 1 : undefined },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="w-full flex flex-col gap-6 pb-36 lg:pb-10"
        >
            {/* ══ Hero ════════════════════════════════════════════════ */}
            <div className="relative overflow-hidden bg-brand-green text-white p-5 md:p-10 shadow-lg shadow-brand-green/20">
                <div className="absolute -top-10 -right-10 w-56 h-56 bg-white/5 rounded-full pointer-events-none" />
                <div className="absolute -bottom-16 -left-8 w-72 h-72 bg-white/5 rounded-full pointer-events-none" />
                <MapPin size={100} className="absolute -right-4 -bottom-4 text-white/5 pointer-events-none hidden sm:block" />
                <div className="relative z-10 flex flex-col gap-2.5">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="text-brand-orange font-arabic text-xl" dir="rtl">زكاة</span>
                        <span className="text-white/60 text-xs font-medium uppercase tracking-widest">Local Giving Zone</span>
                    </div>
                    <h1 className="text-2xl md:text-4xl font-heading font-black uppercase tracking-tight leading-none">
                        Local Giving Map
                    </h1>
                    <p className="text-white/70 text-xs md:text-base font-medium max-w-xl leading-relaxed">
                        Discover curated, Shariah-verified mosques and charities near you.
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-0.5">
                        {[
                            { icon: CheckCircle2, label: "Shariah-Verified" },
                            { icon: Navigation, label: "Geolocation" },
                            { icon: Lock, label: "Anonymous" },
                        ].map(({ icon: Icon, label }) => (
                            <div key={label} className="flex items-center gap-1 bg-white/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider">
                                <Icon size={10} className="text-brand-orange" /> {label}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ══ Map + Tabs Side-by-Side ══════════════════════════════ */}
            <div className="flex flex-col lg:flex-row gap-0 bg-white border border-gray-100 shadow-sm overflow-hidden lg:h-[880px]">

                {/* Map column */}
                <div className="lg:w-[55%] lg:h-full flex flex-col border-b lg:border-b-0 lg:border-r border-gray-100">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
                        <div>
                            <h2 className="font-black text-sm uppercase tracking-widest text-foreground">Live Zone Map</h2>
                            <p className="text-[11px] text-slate-text mt-0.5 font-medium">
                                Accra Metropolitan Area · {filtered.length} center{filtered.length !== 1 ? "s" : ""}
                            </p>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-brand-green uppercase tracking-wider">
                            <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
                            Live
                        </div>
                    </div>
                    <div className="h-[300px] sm:h-[460px] md:h-[800px] lg:h-full w-full">
                        <InteractiveMap />
                    </div>
                </div>

                {/* Tabs column */}
                <div className="lg:w-[45%] lg:h-full flex flex-col overflow-hidden">

                    {/* Tab Bar */}
                    <div className="flex items-stretch border-b border-gray-100">
                        {tabs.map(tab => {
                            const isActive = activeTab === tab.id;
                            const Icon = tab.icon;
                            const disabled = tab.id === "details" && !selectedOrg;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => !disabled && setActiveTab(tab.id)}
                                    disabled={disabled}
                                    className={cn(
                                        "relative flex flex-1 items-center justify-center gap-1.5 py-3 px-2 text-[10px] font-black uppercase tracking-widest transition-all",
                                        isActive
                                            ? "text-white"
                                            : disabled
                                                ? "text-gray-300 cursor-not-allowed"
                                                : "text-slate-text hover:text-brand-green hover:bg-gray-50"
                                    )}
                                >
                                    {/* Active fill */}
                                    {isActive && (
                                        <motion.div
                                            layoutId="mapTabIndicator"
                                            className="absolute inset-0 bg-brand-orange shadow-lg shadow-brand-orange/20"
                                            initial={false}
                                            transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                                        />
                                    )}
                                    <Icon size={13} className="relative z-10 shrink-0" />
                                    <span className="relative z-10 text-[10px]">{tab.label}</span>
                                    {tab.count !== undefined && tab.count > 0 && (
                                        <span className={cn(
                                            "relative z-10 text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full shrink-0",
                                            isActive ? "bg-white/25 text-white" : "bg-brand-green text-white"
                                        )}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* ── Always-visible Search Bar ── */}
                    <div className="px-4 py-3 border-b border-gray-100 shrink-0">
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-text pointer-events-none" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search centers, categories, areas…"
                                className="w-full bg-gray-50 border border-gray-200 focus:border-brand-green focus:ring-1 focus:ring-brand-green/20 rounded-xl py-2 pl-9 pr-8 text-sm text-foreground placeholder:text-slate-text/60 outline-none transition-all"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-text hover:text-foreground transition-colors"
                                >
                                    <X size={13} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-y-auto">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 8 }}
                                transition={{ duration: 0.2 }}
                            >
                                {activeTab === "centers" && (
                                    <div>
                                        {filtered.length === 0 ? (
                                            <div className="py-12 text-center px-4">
                                                <Search size={28} className="text-gray-200 mx-auto mb-3" />
                                                <p className="text-sm text-slate-text font-medium">
                                                    {searchQuery ? `No results for "${searchQuery}"` : "No centers match your filters."}
                                                </p>
                                                <button
                                                    onClick={() => { setVerifiedOnly(false); setActiveCategories([]); setActiveGiving([]); setSearchQuery(""); }}
                                                    className="text-brand-green text-xs font-black mt-2 uppercase tracking-widest hover:underline"
                                                >Clear All</button>
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-gray-50">
                                                {filtered.map(org => {
                                                    const Icon = CATEGORY_ICONS[org.category];
                                                    const isSelected = selectedOrg?.id === org.id;
                                                    return (
                                                        <button
                                                            key={org.id}
                                                            onClick={() => selectOrg(org)}
                                                            className={cn(
                                                                "w-full text-left flex items-center gap-3 px-4 py-3.5 transition-all group",
                                                                isSelected ? "bg-brand-green/5" : "hover:bg-gray-50"
                                                            )}
                                                        >
                                                            <div className={cn(
                                                                "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all",
                                                                isSelected
                                                                    ? "bg-brand-green text-white shadow-md shadow-brand-green/20"
                                                                    : "bg-brand-green/5 text-brand-green group-hover:bg-brand-green group-hover:text-white"
                                                            )}>
                                                                <Icon size={16} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-1.5 min-w-0">
                                                                    <p className="text-sm font-bold text-foreground truncate">{org.name}</p>
                                                                    {org.verified && <BadgeCheck size={13} className="text-brand-green shrink-0" />}
                                                                </div>
                                                                <p className="text-[10px] text-slate-text mt-0.5 leading-snug line-clamp-1">{org.description}</p>
                                                                <div className="flex items-center gap-1.5 mt-1">
                                                                    <span className={cn("text-[9px] font-bold border px-1.5 py-0.5 rounded-full", CATEGORY_COLORS[org.category])}>
                                                                        {org.category}
                                                                    </span>
                                                                    <span className="text-[10px] text-slate-text font-medium">📍 {org.distance}</span>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={e => { e.stopPropagation(); openDonate(org); }}
                                                                className="shrink-0 bg-brand-orange text-white p-2 sm:px-3 sm:py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-brand-orange-hover active:scale-95 transition-all flex items-center gap-1"
                                                            >
                                                                <Heart size={11} />
                                                                <span className="hidden sm:inline">Give</span>
                                                            </button>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ── Tab: Filters ── */}
                                {activeTab === "filters" && (
                                    <div className="flex flex-col h-full">

                                        {/* ── Location row ── */}
                                        <div className="px-4 pt-4 pb-3 border-b border-gray-50">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-text mb-2">📍 Location</p>
                                            <div className="flex items-center gap-2 bg-brand-green/5 border border-brand-green/15 px-3 py-2 rounded-xl">
                                                <LocateFixed size={13} className="text-brand-green shrink-0" />
                                                <span className="text-sm font-bold text-foreground flex-1">Accra, Ghana</span>
                                                <span className="text-[9px] font-black text-brand-green bg-brand-green/10 px-2 py-0.5 rounded-full uppercase tracking-wider">Auto-detected</span>
                                            </div>
                                        </div>

                                        {/* ── Category chips ── */}
                                        <div className="px-4 pt-4 pb-3 border-b border-gray-50">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-text mb-3">Category</p>
                                            <div className="grid grid-cols-2 gap-2">
                                                {(["Food Support", "Education", "Health", "Community"] as OrgCategory[]).map(cat => {
                                                    const Icon = CATEGORY_ICONS[cat];
                                                    const active = activeCategories.includes(cat);
                                                    const count = ALL_ORGS.filter(o => o.category === cat).length;
                                                    return (
                                                        <button
                                                            key={cat}
                                                            onClick={() => toggleCategory(cat)}
                                                            className={cn(
                                                                "flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all group",
                                                                active
                                                                    ? "bg-brand-green text-white border-brand-green shadow-sm shadow-brand-green/20"
                                                                    : "bg-white text-foreground border-gray-200 hover:border-brand-green/40 hover:bg-brand-green/5"
                                                            )}
                                                        >
                                                            <div className={cn(
                                                                "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all",
                                                                active ? "bg-white/20" : "bg-brand-green/5 group-hover:bg-brand-green/10"
                                                            )}>
                                                                <Icon size={13} className={active ? "text-white" : "text-brand-green"} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className={cn("text-xs font-black leading-tight", active ? "text-white" : "text-foreground")}>{cat}</p>
                                                                <p className={cn("text-[10px] font-medium", active ? "text-white/70" : "text-slate-text")}>{count} center{count !== 1 ? "s" : ""}</p>
                                                            </div>
                                                            {active && (
                                                                <div className="w-4 h-4 rounded-full bg-white/25 flex items-center justify-center shrink-0">
                                                                    <CheckCircle2 size={10} className="text-white" />
                                                                </div>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* ── Giving type ── */}
                                        <div className="px-4 pt-4 pb-3 border-b border-gray-50">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-text mb-3">Giving Type</p>
                                            <div className="flex gap-2">
                                                {(["Zakat", "Sadaqah"] as GivingType[]).map(g => (
                                                    <button
                                                        key={g}
                                                        onClick={() => toggleGiving(g)}
                                                        className={cn(
                                                            "flex-1 py-2.5 rounded-xl text-sm font-black border transition-all flex items-center justify-center gap-1.5",
                                                            activeGiving.includes(g)
                                                                ? "bg-brand-orange text-white border-brand-orange shadow-sm"
                                                                : "bg-white text-slate-text border-gray-200 hover:border-brand-orange/50 hover:text-brand-orange"
                                                        )}
                                                    >
                                                        {activeGiving.includes(g) && <CheckCircle2 size={13} />}
                                                        {g === "Zakat" ? "Zakat" : "Sadaqah"}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* ── Verified only toggle ── */}
                                        <div className="px-4 pt-4 pb-3 border-b border-gray-50">
                                            <button
                                                onClick={() => setVerifiedOnly(!verifiedOnly)}
                                                className={cn(
                                                    "w-full flex items-center gap-3 p-3 rounded-xl border transition-all",
                                                    verifiedOnly
                                                        ? "bg-brand-green/5 border-brand-green/30"
                                                        : "bg-gray-50 border-gray-100 hover:border-brand-green/20"
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all",
                                                    verifiedOnly ? "bg-brand-green text-white" : "bg-gray-100 text-slate-text"
                                                )}>
                                                    <BadgeCheck size={16} />
                                                </div>
                                                <div className="flex-1 text-left">
                                                    <p className="text-sm font-black text-foreground">Verified Centers Only</p>
                                                    <p className="text-[10px] text-slate-text">Show only Shariah-approved centers</p>
                                                </div>
                                                {/* Toggle pill */}
                                                <div className={cn(
                                                    "w-11 h-6 rounded-full transition-all relative shrink-0",
                                                    verifiedOnly ? "bg-brand-green" : "bg-gray-300"
                                                )}>
                                                    <span className={cn(
                                                        "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all",
                                                        verifiedOnly ? "left-[22px]" : "left-0.5"
                                                    )} />
                                                </div>
                                            </button>
                                        </div>

                                        {/* ── Active filter summary ── */}
                                        {activeFilterCount > 0 && (
                                            <div className="px-4 py-2.5 bg-brand-orange/5 border-b border-brand-orange/15 flex items-center gap-2 flex-wrap">
                                                <span className="text-[10px] font-black text-brand-orange uppercase tracking-wider">Active:</span>
                                                {verifiedOnly && (
                                                    <span className="flex items-center gap-1 bg-brand-green/10 text-brand-green text-[9px] font-black px-2 py-0.5 rounded-full">
                                                        <BadgeCheck size={9} /> Verified
                                                    </span>
                                                )}
                                                {activeCategories.map(c => (
                                                    <span key={c} className="flex items-center gap-1 bg-gray-100 text-foreground text-[9px] font-bold px-2 py-0.5 rounded-full">
                                                        {c}
                                                        <button onClick={() => toggleCategory(c)} className="hover:text-brand-orange"><X size={8} /></button>
                                                    </span>
                                                ))}
                                                {activeGiving.map(g => (
                                                    <span key={g} className="flex items-center gap-1 bg-brand-orange/10 text-brand-orange text-[9px] font-bold px-2 py-0.5 rounded-full">
                                                        {g}
                                                        <button onClick={() => toggleGiving(g)} className="hover:opacity-60"><X size={8} /></button>
                                                    </span>
                                                ))}
                                                <button
                                                    onClick={() => { setVerifiedOnly(false); setActiveCategories([]); setActiveGiving([]); }}
                                                    className="ml-auto text-[9px] font-black text-brand-orange hover:underline uppercase tracking-wider"
                                                >Clear all</button>
                                            </div>
                                        )}

                                        {/* ── Sticky CTA ── */}
                                        <div className="p-4 mt-auto border-t border-gray-100 shrink-0">
                                            <button
                                                onClick={() => setActiveTab("centers")}
                                                className="w-full bg-brand-green text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-green-light transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-green/15 active:scale-[0.99]"
                                            >
                                                <List size={14} />
                                                View {filtered.length} Result{filtered.length !== 1 ? "s" : ""}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* ── Tab: Details ── */}
                                {activeTab === "details" && selectedOrg && (
                                    <div className="p-5 flex flex-col gap-5">
                                        {/* Org Header */}
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-brand-green/10 text-brand-green rounded-xl flex items-center justify-center shrink-0">
                                                {React.createElement(CATEGORY_ICONS[selectedOrg.category], { size: 22 })}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="font-heading font-black text-lg uppercase tracking-tight leading-tight text-foreground">{selectedOrg.name}</h3>
                                                    {selectedOrg.verified && (
                                                        <span className="flex items-center gap-1 bg-brand-green/10 text-brand-green text-[10px] font-black px-2 py-0.5 rounded-full">
                                                            <BadgeCheck size={11} /> Verified
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-slate-text mt-0.5">📍 {selectedOrg.distance} · {selectedOrg.address}</p>
                                            </div>
                                            <button
                                                onClick={() => { setSelectedOrg(null); setActiveTab("centers"); }}
                                                className="p-1.5 hover:bg-gray-100 rounded-full transition-all shrink-0"
                                            >
                                                <X size={16} className="text-slate-text" />
                                            </button>
                                        </div>

                                        <p className="text-sm text-slate-text leading-relaxed">{selectedOrg.description}</p>

                                        {/* Contact */}
                                        <div className="grid grid-cols-1 gap-2">
                                            <a href={`tel:${selectedOrg.phone}`} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 hover:bg-brand-green/5 transition-colors group">
                                                <Phone size={14} className="text-brand-green shrink-0" />
                                                <span className="text-xs font-bold text-foreground truncate group-hover:text-brand-green">{selectedOrg.phone}</span>
                                            </a>
                                            <a href={`mailto:${selectedOrg.email}`} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 hover:bg-brand-green/5 transition-colors group">
                                                <Mail size={14} className="text-brand-green shrink-0" />
                                                <span className="text-xs font-bold text-foreground truncate group-hover:text-brand-green">{selectedOrg.email}</span>
                                            </a>
                                            <a href={`https://${selectedOrg.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 hover:bg-brand-green/5 transition-colors group">
                                                <Globe size={14} className="text-brand-green shrink-0" />
                                                <span className="text-xs font-bold text-foreground truncate group-hover:text-brand-green">{selectedOrg.website}</span>
                                            </a>
                                        </div>

                                        {/* Accepts + Supports */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-text mb-1.5">Accepts</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {selectedOrg.accepts.map(a => (
                                                        <span key={a} className="text-[9px] font-bold text-brand-green border border-brand-green/20 px-1.5 py-0.5 rounded-full bg-brand-green/5">{a}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-text mb-1.5">Supports</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {selectedOrg.supports.map(s => (
                                                        <span key={s} className="text-[9px] font-medium text-slate-text bg-gray-100 px-1.5 py-0.5 rounded-full">{s}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Trust message */}
                                        {selectedOrg.verified && (
                                            <div className="flex items-center gap-3 bg-brand-green/5 border border-brand-green/15 rounded-xl p-3">
                                                <ShieldCheck size={18} className="text-brand-green shrink-0" />
                                                <p className="text-[11px] text-brand-green font-bold leading-snug">
                                                    Verified by the Zakat Smart community review board. Your donation is in trusted hands.
                                                </p>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="grid grid-cols-3 gap-2">
                                            <button
                                                onClick={() => openDonate(selectedOrg)}
                                                className="col-span-1 bg-brand-orange text-white py-3 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-1.5 rounded-xl hover:bg-brand-orange-hover active:scale-[0.98] transition-all shadow-lg shadow-brand-orange/20"
                                            >
                                                <Heart size={14} /> Donate
                                            </button>
                                            <a
                                                href={`https://maps.google.com/?q=${encodeURIComponent(selectedOrg.address)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="col-span-1 bg-brand-green text-white py-3 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-1.5 rounded-xl hover:bg-brand-green-light active:scale-[0.98] transition-all shadow-lg shadow-brand-green/20"
                                            >
                                                <Navigation size={14} /> Directions
                                            </a>
                                            <a
                                                href={`tel:${selectedOrg.phone}`}
                                                className="col-span-1 bg-white border border-gray-200 text-foreground py-3 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-1.5 rounded-xl hover:border-brand-green hover:text-brand-green active:scale-[0.98] transition-all"
                                            >
                                                <Phone size={14} /> Call
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {/* Details tab but no org selected */}
                                {activeTab === "details" && !selectedOrg && (
                                    <div className="py-12 text-center px-6">
                                        <MapPin size={32} className="text-gray-200 mx-auto mb-3" />
                                        <p className="text-sm text-slate-text font-medium">Select a center from the list to view details.</p>
                                        <button onClick={() => setActiveTab("centers")} className="text-brand-green text-xs font-black mt-2 uppercase tracking-widest hover:underline">View Centers</button>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>{/* end scroll wrapper */}
                </div>{/* end tabs column */}
            </div>{/* end side-by-side flex */}

            {/* ── Info Banner ── */}
            <div className="bg-brand-orange/5 border border-brand-orange/20 rounded-2xl p-5 flex gap-4 items-start">
                <div className="w-10 h-10 bg-brand-orange/10 text-brand-orange rounded-xl flex items-center justify-center shrink-0">
                    <ShieldCheck size={20} />
                </div>
                <div>
                    <h4 className="font-black text-foreground text-sm mb-1 uppercase tracking-tight">How Zakat Zones Work</h4>
                    <p className="text-[12px] text-slate-text leading-relaxed">
                        Every center on this map is reviewed by our Shariah board. Only <strong>Verified</strong> centres accept Zakat al-Mal. <strong>New</strong> centres accept Sadaqah only while under review.
                    </p>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════
                DONATION MODAL
            ══════════════════════════════════════════════════════ */}
            <AnimatePresence>
                {donateTarget && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4"
                        onClick={closeModal}
                    >
                        <motion.div
                            initial={{ y: 80, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 80, opacity: 0 }}
                            transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                            className="bg-white w-full sm:max-w-md flex flex-col shadow-2xl rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Modal header */}
                            <div className="bg-brand-green text-white p-5 flex items-start justify-between rounded-t-3xl shrink-0">
                                <div>
                                    <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-0.5">Donate to</p>
                                    <h3 className="font-heading font-black text-xl uppercase tracking-tight">{donateTarget.name}</h3>
                                    {donateTarget.verified && (
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <BadgeCheck size={12} className="text-brand-orange" />
                                            <span className="text-[10px] text-white/70 font-bold uppercase tracking-wider">Verified · {donateTarget.category}</span>
                                        </div>
                                    )}
                                </div>
                                <button onClick={closeModal} className="p-1.5 hover:bg-white/10 rounded-full transition-all shrink-0 ml-4">
                                    <X size={18} />
                                </button>
                            </div>

                            {donateStep === "form" && (
                                <div className="p-5 flex flex-col gap-5">
                                    {/* Amount */}
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-text mb-2">Amount (GHS)</p>
                                        <div className="grid grid-cols-5 gap-1.5 mb-3">
                                            {QUICK_AMOUNTS.map(a => (
                                                <button
                                                    key={a}
                                                    onClick={() => setAmount(String(a))}
                                                    className={cn(
                                                        "py-2 rounded-xl text-xs font-black border transition-all",
                                                        amount === String(a)
                                                            ? "bg-brand-orange text-white border-brand-orange shadow-sm"
                                                            : "border-gray-200 text-slate-text hover:border-brand-orange hover:text-brand-orange"
                                                    )}
                                                >₵{a}</button>
                                            ))}
                                        </div>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-black text-brand-green">₵</span>
                                            <input
                                                type="number"
                                                value={amount}
                                                onChange={e => setAmount(e.target.value)}
                                                placeholder="0.00"
                                                className="w-full bg-gray-50 border-2 border-transparent focus:border-brand-green rounded-xl py-3.5 pl-10 pr-4 font-black text-foreground outline-none transition-all text-xl"
                                            />
                                        </div>
                                    </div>

                                    {/* Giving type */}
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-text mb-2">Giving Type</p>
                                        <div className="flex gap-2">
                                            {(donateTarget.givingTypes as GivingType[]).map(g => (
                                                <button
                                                    key={g}
                                                    onClick={() => setGivingIntent(g)}
                                                    className={cn(
                                                        "flex-1 py-3 rounded-xl text-sm font-black border transition-all",
                                                        givingIntent === g
                                                            ? "bg-brand-green text-white border-brand-green shadow-sm"
                                                            : "bg-white text-slate-text border-gray-200 hover:border-brand-green/40"
                                                    )}
                                                >
                                                    {g === "Zakat" ? "Pay Zakat" : "Give Sadaqah"}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Anonymous toggle */}
                                    <div className="flex items-center justify-between p-4 bg-brand-green/5 border border-brand-green/10 rounded-2xl">
                                        <div className="flex items-start gap-3">
                                            <div className="w-9 h-9 bg-brand-green/10 text-brand-green rounded-xl flex items-center justify-center shrink-0">
                                                {anonymous ? <Lock size={16} /> : <Unlock size={16} />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-foreground">Donate Anonymously</p>
                                                <p className="text-[11px] text-slate-text mt-0.5">{anonymous ? "Only Allah knows your identity." : "Your name is shared with the center."}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setAnonymous(!anonymous)}
                                            className={cn("w-12 h-6 rounded-full transition-all relative shrink-0", anonymous ? "bg-brand-green" : "bg-gray-200")}
                                        >
                                            <span className={cn("absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all", anonymous ? "left-[26px]" : "left-0.5")} />
                                        </button>
                                    </div>

                                    {/* Flutterwave */}
                                    <div className="flex items-center gap-2 justify-center">
                                        <CreditCard size={13} className="text-slate-text" />
                                        <span className="text-[11px] text-slate-text">Payments processed securely via <strong>Flutterwave</strong></span>
                                    </div>

                                    <button
                                        disabled={!amount || Number(amount) <= 0}
                                        onClick={() => setDonateStep("confirm")}
                                        className="w-full bg-brand-green text-white py-4 font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 rounded-2xl hover:bg-brand-green-light active:scale-[0.99] transition-all shadow-lg shadow-brand-green/20 disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        Pay Securely <ArrowRight size={16} />
                                    </button>
                                </div>
                            )}

                            {donateStep === "confirm" && (
                                <div className="p-5 flex flex-col gap-5">
                                    <div className="bg-gray-50 rounded-2xl p-5 flex flex-col gap-3">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-text">Review Your Donation</p>
                                        {[
                                            { label: "To", value: donateTarget.name },
                                            { label: "Amount", value: `₵${Number(amount).toLocaleString()} GHS` },
                                            { label: "Type", value: givingIntent === "Zakat" ? "Pay Zakat" : "Give Sadaqah" },
                                            { label: "Identity", value: anonymous ? "Anonymous" : "Congo Musah" },
                                            { label: "Via", value: "Flutterwave" },
                                        ].map(({ label, value }) => (
                                            <div key={label} className="flex justify-between items-center border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                                                <span className="text-sm font-bold text-slate-text">{label}</span>
                                                <span className={cn("text-sm font-black", label === "Amount" ? "text-brand-green text-lg" : "text-foreground")}>{value}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex items-start gap-2 bg-brand-orange/5 border border-brand-orange/20 rounded-xl p-3">
                                        <Info size={12} className="text-brand-orange shrink-0 mt-0.5" />
                                        <p className="text-[11px] text-slate-text leading-relaxed">
                                            By confirming, you authorise Flutterwave to process this payment. A receipt will be saved to your Transparency Tracker.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setDonateStep("success")}
                                        className="w-full bg-brand-orange text-white py-4 font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 rounded-2xl hover:bg-brand-orange-hover active:scale-[0.99] transition-all shadow-lg shadow-brand-orange/20"
                                    >
                                        <Heart size={16} /> Confirm Donation
                                    </button>
                                    <button onClick={() => setDonateStep("form")} className="text-slate-text text-xs font-black uppercase tracking-widest hover:text-brand-green text-center">← Edit Amount</button>
                                </div>
                            )}

                            {donateStep === "success" && (
                                <div className="p-8 flex flex-col items-center text-center gap-5">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", bounce: 0.45, delay: 0.1 }}
                                        className="w-20 h-20 bg-brand-green rounded-full text-white flex items-center justify-center shadow-xl shadow-brand-green/30"
                                    >
                                        <CheckCircle2 size={40} />
                                    </motion.div>
                                    <div>
                                        <h3 className="text-2xl font-heading font-black uppercase tracking-tight text-foreground mb-1">JazakAllah Khayran</h3>
                                        <p className="text-slate-text text-sm leading-relaxed">
                                            Your {givingIntent} of <strong>₵{Number(amount).toLocaleString()}</strong> to <strong>{donateTarget.name}</strong> was processed.
                                            {anonymous && " Your identity was kept anonymous."}
                                        </p>
                                    </div>
                                    <div className="w-full bg-brand-green/5 border border-brand-green/15 rounded-xl p-4">
                                        <p className="text-[11px] text-slate-text leading-relaxed">
                                            A receipt has been saved to your <strong>Transparency Tracker</strong>. You can track the impact of this donation from your dashboard.
                                        </p>
                                    </div>
                                    <button onClick={closeModal} className="w-full bg-brand-green text-white py-3 font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-brand-green-light active:scale-[0.99] transition-all">
                                        Done
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
