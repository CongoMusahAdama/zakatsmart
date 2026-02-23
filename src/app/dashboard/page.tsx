"use client";

import React, { useState } from "react";
import OverviewHeader from "@/components/dashboard/OverviewHeader";
import CalculatorCard from "@/components/dashboard/CalculatorCard";
import GivingMap from "@/components/dashboard/GivingMap";
import ImpactTracker from "@/components/dashboard/ImpactTracker";
import { motion, AnimatePresence } from "framer-motion";
import { History, Calculator, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
    },
};

const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
};


type TabId = "impact" | "calculator" | "map";

interface Tab {
    id: TabId;
    label: string;
    shortLabel: string;
    icon: React.ElementType;
}

export default function DashboardPage() {
    // ⚠️ Defined inside the component so lucide forwardRef icons never appear
    // at module scope where Next.js RSC serialization would choke on them.
    const tabs: Tab[] = [
        { id: "impact", label: "Transparency Tracker", shortLabel: "Tracker", icon: History },
        { id: "calculator", label: "Quick Calculator", shortLabel: "Calculator", icon: Calculator },
        { id: "map", label: "Local Giving Map", shortLabel: "Map", icon: MapPin },
    ];

    const [activeTab, setActiveTab] = useState<TabId>("impact");

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-6"
        >
            {/* Overview Section */}
            <motion.div variants={item}>
                <OverviewHeader />
            </motion.div>

            {/* Tab Navigation — fits mobile without overflow */}
            <motion.div variants={item} className="w-full">
                <div className="flex items-stretch bg-white border border-gray-100 shadow-sm rounded-none overflow-hidden">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "relative flex flex-1 flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-3 sm:py-2.5 px-2 sm:px-4 text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all",
                                    isActive
                                        ? "text-white"
                                        : "text-slate-text hover:text-brand-green hover:bg-gray-50"
                                )}
                            >
                                {/* Animated active indicator — bottom border on mobile, bg on desktop */}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTabIndicator"
                                        className="absolute inset-0 bg-brand-orange shadow-lg shadow-brand-orange/20"
                                        initial={false}
                                        transition={{ type: "spring", bounce: 0.15, duration: 0.45 }}
                                    />
                                )}
                                <Icon
                                    size={18}
                                    className={cn(
                                        "relative z-10 shrink-0 transition-colors",
                                        isActive ? "text-white" : "text-slate-text"
                                    )}
                                />
                                {/* Short label on mobile, full label on sm+ */}
                                <span className="relative z-10 leading-tight text-center sm:hidden">
                                    {tab.shortLabel}
                                </span>
                                <span className="relative z-10 leading-tight hidden sm:block">
                                    {tab.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </motion.div>

            {/* Tab Content */}
            <motion.div variants={item} className="min-h-[500px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === "impact" && <ImpactTracker />}
                        {activeTab === "calculator" && <CalculatorCard />}
                        {activeTab === "map" && <GivingMap />}
                    </motion.div>
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
}
