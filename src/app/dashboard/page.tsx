"use client";

import React, { useState } from "react";
import OverviewHeader from "@/components/dashboard/OverviewHeader";
import CalculatorCard from "@/components/dashboard/CalculatorCard";
import GivingMap from "@/components/dashboard/GivingMap";
import ImpactTracker from "@/components/dashboard/ImpactTracker";
import { motion, AnimatePresence } from "framer-motion";
import { History, Calculator, MapPin, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
};

type TabId = "impact" | "calculator" | "map";

interface Tab {
    id: TabId;
    label: string;
    icon: React.ElementType;
}

const tabs: Tab[] = [
    { id: "impact", label: "Transparency Tracker", icon: History },
    { id: "calculator", label: "Quick Calculator", icon: Calculator },
    { id: "map", label: "Local Giving Map", icon: MapPin },
];

export default function DashboardPage() {
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

            {/* Refined Sticky Tabs Navigation */}
            <motion.div
                variants={item}
                className="sticky top-16 z-20 bg-brand-green/95 backdrop-blur-md -mx-4 md:-mx-6 lg:-mx-10 py-1 shadow-lg shadow-brand-green/10 flex justify-center"
            >
                <div className="w-full overflow-x-auto no-scrollbar scroll-smooth">
                    <div className="flex items-center gap-1 p-2 min-w-max mx-auto px-4">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "flex items-center gap-2 px-6 py-2.5 rounded-none text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap relative shrink-0",
                                        isActive
                                            ? "text-brand-green scale-105"
                                            : "text-white/80 hover:text-white"
                                    )}
                                >
                                    <Icon size={16} className="relative z-10" />
                                    <span className="relative z-10">{tab.label}</span>
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTabBackground"
                                            className="absolute inset-0 bg-brand-orange shadow-lg shadow-brand-orange/20"
                                            initial={false}
                                            transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </motion.div>

            {/* Tab Content */}
            <motion.div variants={item} className="min-h-[600px]">
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
