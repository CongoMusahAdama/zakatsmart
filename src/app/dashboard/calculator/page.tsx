"use client";

import React, { useState, useMemo } from "react";
import {
    Coins,
    Wallet,
    Smartphone,
    Gem,
    TrendingUp,
    Briefcase,
    Home,
    ArrowRight,
    Info,
    CheckCircle2,
    AlertCircle,
    ChevronDown,
    ChevronUp,
    Scale
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import LiveSummary from "@/components/dashboard/LiveSummary";

type Currency = {
    code: string;
    symbol: string;
    nisab: number;
    goldPrice: number;
    silverPrice: number;
};

const currencies: Currency[] = [
    { code: "GHS", symbol: "₵", nisab: 12450.00, goldPrice: 420.50, silverPrice: 5.20 },
    { code: "NGN", symbol: "₦", nisab: 1560000.00, goldPrice: 52000.00, silverPrice: 650.00 },
    { code: "USD", symbol: "$", nisab: 1150.00, goldPrice: 68.50, silverPrice: 0.85 },
];

export default function ZakatCalculatorPage() {
    const [currentCurrency, setCurrentCurrency] = useState<Currency>(currencies[0]);
    const [activeStep, setActiveStep] = useState(1);
    const [expandedAccordion, setExpandedAccordion] = useState<string | null>("cash");
    const [showGuide, setShowGuide] = useState(false);

    // Asset States
    const [assets, setAssets] = useState({
        cash: 0,
        momo: 0,
        bank: 0,
        goldGrams: 0,
        silverGrams: 0,
        stocks: 0,
        businessInventory: 0,
        tradeGoods: 0,
        debts: 0,
    });

    const assetCategories = [
        {
            id: "cash",
            title: "Cash & Savings",
            icon: Wallet,
            fields: [
                { key: "cash", label: "Physical Cash", icon: Coins },
                { key: "momo", label: "Mobile Money (MoMo)", icon: Smartphone },
                { key: "bank", label: "Savings/Current Accounts", icon: Home },
            ]
        },
        {
            id: "gold",
            title: "Gold & Jewelry",
            icon: Gem,
            fields: [
                { key: "goldGrams", label: "Gold Weight (Grams)", icon: Scale, unit: "g" },
                { key: "silverGrams", label: "Silver Weight (Grams)", icon: Scale, unit: "g" },
            ]
        },
        {
            id: "business",
            title: "Business Assets",
            icon: Briefcase,
            fields: [
                { key: "businessInventory", label: "Total Inventory Value", icon: TrendingUp },
                { key: "tradeGoods", label: "Tradeable Goods", icon: TrendingUp },
            ]
        },
        {
            id: "debts",
            title: "Debts & Deductions",
            icon: AlertCircle,
            isDeduction: true,
            fields: [
                { key: "debts", label: "Immediate Debts/Bills", icon: AlertCircle },
            ]
        }
    ];

    const totalAssets = useMemo(() => {
        const cashTotal = assets.cash + assets.momo + assets.bank;
        const goldTotal = (assets.goldGrams * currentCurrency.goldPrice) + (assets.silverGrams * currentCurrency.silverPrice);
        const businessTotal = assets.businessInventory + assets.tradeGoods;
        const stockTotal = assets.stocks;
        return cashTotal + goldTotal + businessTotal + stockTotal;
    }, [assets, currentCurrency]);

    const zakatableAmount = Math.max(0, totalAssets - assets.debts);
    const isAboveNisab = zakatableAmount >= currentCurrency.nisab;
    const zakatDue = isAboveNisab ? zakatableAmount * 0.025 : 0;

    const progress = (activeStep / 5) * 100;

    const handleInputChange = (key: string, value: string) => {
        const numValue = parseFloat(value) || 0;
        setAssets(prev => ({ ...prev, [key]: numValue }));
    };

    return (
        <div className="w-full flex flex-col gap-8 pb-20 mt-0 relative">
            {/* Guide Toggle Overlay */}
            <AnimatePresence>
                {showGuide && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 md:p-6"
                        onClick={() => setShowGuide(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white max-w-2xl w-full p-6 pb-10 md:p-8 rounded-none shadow-2xl relative max-h-[90vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setShowGuide(false)}
                                className="absolute top-4 right-4 text-slate-text hover:text-brand-green z-10 p-2"
                            >
                                <AlertCircle size={24} className="rotate-45" />
                            </button>

                            <div className="text-center mb-6 md:mb-8 mt-4">
                                <div className="w-12 h-12 md:w-16 md:h-16 bg-brand-green/10 text-brand-green flex items-center justify-center rounded-none mx-auto mb-4">
                                    <Info size={28} className="md:w-8 md:h-8" />
                                </div>
                                <h2 className="text-xl md:text-2xl font-black text-foreground uppercase tracking-tight">How to Calculate Your Zakat</h2>
                                <p className="text-slate-text mt-2 font-medium text-sm md:text-base">A quick breakdown of the process.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 md:gap-y-6 mb-8">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-7 h-7 md:w-8 md:h-8 bg-brand-green text-white flex items-center justify-center rounded-none font-black text-xs md:text-sm shrink-0">1</div>
                                        <h4 className="font-bold text-foreground uppercase text-[10px] md:text-xs tracking-wider">Add Your Total Wealth</h4>
                                    </div>
                                    <p className="text-xs text-slate-text leading-relaxed pl-10 md:pl-0">Include assets you have owned for one lunar year: <strong>Cash</strong>, <strong>Gold/Silver</strong>, and <strong>Business goods</strong>.</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-7 h-7 md:w-8 md:h-8 bg-brand-green text-white flex items-center justify-center rounded-none font-black text-xs md:text-sm shrink-0">2</div>
                                        <h4 className="font-bold text-foreground uppercase text-[10px] md:text-xs tracking-wider">Subtract What You Owe</h4>
                                    </div>
                                    <p className="text-xs text-slate-text leading-relaxed pl-10 md:pl-0">Deduct your <strong>Immediate Debts</strong> and short-term obligations from your total wealth.</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-7 h-7 md:w-8 md:h-8 bg-brand-green text-white flex items-center justify-center rounded-none font-black text-xs md:text-sm shrink-0">3</div>
                                        <h4 className="font-bold text-foreground uppercase text-[10px] md:text-xs tracking-wider">Check Nisab Threshold</h4>
                                    </div>
                                    <p className="text-xs text-slate-text leading-relaxed pl-10 md:pl-0">If your remaining wealth is above the <strong>Nisab</strong> (minimum required), Zakat is due on your assets.</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-7 h-7 md:w-8 md:h-8 bg-brand-green text-white flex items-center justify-center rounded-none font-black text-xs md:text-sm shrink-0">4</div>
                                        <h4 className="font-bold text-foreground uppercase text-[10px] md:text-xs tracking-wider">Pay 2.5%</h4>
                                    </div>
                                    <p className="text-xs text-slate-text leading-relaxed pl-10 md:pl-0">Your Zakat is <strong>2.5%</strong> of eligible wealth. The calculator applies this automatically.</p>
                                </div>
                            </div>

                            <div className="bg-light-gray p-4 border-l-4 border-brand-orange mb-8">
                                <p className="text-[10px] md:text-[11px] text-slate-text leading-relaxed">
                                    <strong className="text-brand-orange uppercase tracking-tighter mr-1">💡 Note:</strong>
                                    Zakat is an obligation on qualifying wealth. Assets not reaching Nisab can still be given as <strong>Sadaqah</strong>.
                                </p>
                            </div>

                            <button
                                onClick={() => setShowGuide(false)}
                                className="w-full bg-brand-green text-white py-3 md:py-4 rounded-none font-black text-sm uppercase tracking-widest hover:bg-brand-green-light transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-green/20"
                            >
                                Got it, let's calculate! <ArrowRight size={18} />
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Greeting & Header */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-2 md:gap-3">
                    <span className="text-brand-green font-arabic text-xl md:text-2xl" dir="rtl">السَّلَامُ عَلَيْكُمْ</span>
                    <h2 className="text-lg md:text-xl font-bold text-slate-text">Assalamu Alaikum, Congo</h2>
                </div>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4">
                            <h1 className="text-3xl md:text-4xl font-heading font-black text-foreground uppercase tracking-tight leading-none">Smart Zakat Calculator</h1>
                            <button
                                onClick={() => setShowGuide(true)}
                                className="bg-brand-orange text-white px-3 py-1.5 rounded-none text-[10px] font-black uppercase tracking-widest hover:bg-brand-orange-hover transition-all flex items-center gap-1.5 active:scale-95 shadow-lg shadow-brand-orange/20 w-fit whitespace-nowrap"
                            >
                                <Info size={14} /> Step by Step Guide
                            </button>
                        </div>
                        <p className="text-slate-text text-base md:text-lg leading-tight font-medium max-w-2xl">A guided journey to fulfill your spiritual obligation with precision.</p>
                    </div>

                    <div className="flex bg-white shadow-sm border border-gray-100 p-1 rounded-none h-fit w-fit self-start md:self-end">
                        {currencies.map((curr) => (
                            <button
                                key={curr.code}
                                onClick={() => setCurrentCurrency(curr)}
                                className={cn(
                                    "px-4 md:px-6 py-2 text-sm font-black transition-all rounded-none",
                                    currentCurrency.code === curr.code
                                        ? "bg-brand-green text-white shadow-lg shadow-brand-green/20"
                                        : "text-slate-text hover:bg-light-gray"
                                )}
                            >
                                {curr.code}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-12 gap-8 items-start">
                {/* Left Column (Metric Cards & Inputs) */}
                <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
                    {/* Market Summary Cards */}
                    <div className="grid grid-cols-3 gap-2 md:gap-6">
                        {/* Nisab Card */}
                        <div className="relative overflow-hidden bg-brand-green rounded-none p-3 md:p-6 text-white shadow-lg shadow-brand-green/20 group">
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-2 md:mb-4">
                                    <div className="p-1 md:p-2 bg-white/20 backdrop-blur-md rounded-none">
                                        <TrendingUp size={16} className="text-white md:w-5 md:h-5" />
                                    </div>
                                    <span className="text-[7px] md:text-[10px] font-black tracking-widest bg-white/20 backdrop-blur-md px-1.5 py-0.5 md:py-1 rounded-none uppercase whitespace-nowrap">Nisab</span>
                                </div>
                                <p className="text-[7px] md:text-[10px] font-bold text-white/70 uppercase tracking-widest mb-0.5">Threshold</p>
                                <h3 className="text-sm md:text-3xl font-black font-heading tracking-tight leading-none truncate">{currentCurrency.symbol}{currentCurrency.nisab.toLocaleString()}</h3>
                                <p className="text-[7px] md:text-[10px] text-white/50 mt-1 font-medium hidden sm:block">Minimum wealth</p>
                            </div>
                            <TrendingUp size={60} className="absolute -bottom-2 -right-2 text-white/10 -rotate-12 transition-transform group-hover:scale-110 duration-500 md:w-[100px] md:h-[100px]" />
                        </div>

                        {/* Gold Price Card */}
                        <div className="relative overflow-hidden bg-[#B8860B] rounded-none p-3 md:p-6 text-white shadow-lg shadow-[#B8860B]/20 group">
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-2 md:mb-4">
                                    <div className="p-1 md:p-2 bg-white/20 backdrop-blur-md rounded-none">
                                        <Gem size={16} className="text-white md:w-5 md:h-5" />
                                    </div>
                                    <span className="text-[7px] md:text-[10px] font-black tracking-widest bg-white/20 backdrop-blur-md px-1.5 py-0.5 md:py-1 rounded-none uppercase whitespace-nowrap">Gold</span>
                                </div>
                                <p className="text-[7px] md:text-[10px] font-bold text-white/70 uppercase tracking-widest mb-0.5">24K Price</p>
                                <h3 className="text-sm md:text-3xl font-black font-heading tracking-tight leading-none truncate">{currentCurrency.symbol}{currentCurrency.goldPrice}/g</h3>
                                <p className="text-[7px] md:text-[10px] text-white/50 mt-1 font-medium hidden sm:block">Real-time</p>
                            </div>
                            <Gem size={60} className="absolute -bottom-2 -right-2 text-white/10 -rotate-12 transition-transform group-hover:scale-110 duration-500 md:w-[100px] md:h-[100px]" />
                        </div>

                        {/* Silver Price Card */}
                        <div className="relative overflow-hidden bg-[#708090] rounded-none p-3 md:p-6 text-white shadow-lg shadow-[#708090]/20 group">
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-2 md:mb-4">
                                    <div className="p-1 md:p-2 bg-white/20 backdrop-blur-md rounded-none">
                                        <Scale size={16} className="text-white md:w-5 md:h-5" />
                                    </div>
                                    <span className="text-[7px] md:text-[10px] font-black tracking-widest bg-white/20 backdrop-blur-md px-1.5 py-0.5 md:py-1 rounded-none uppercase whitespace-nowrap">Silver</span>
                                </div>
                                <p className="text-[7px] md:text-[10px] font-bold text-white/70 uppercase tracking-widest mb-0.5">Market</p>
                                <h3 className="text-sm md:text-3xl font-black font-heading tracking-tight leading-none truncate">{currentCurrency.symbol}{currentCurrency.silverPrice}/g</h3>
                                <p className="text-[7px] md:text-[10px] text-white/50 mt-1 font-medium hidden sm:block">Real-time</p>
                            </div>
                            <Scale size={60} className="absolute -bottom-2 -right-2 text-white/10 -rotate-12 transition-transform group-hover:scale-110 duration-500 md:w-[100px] md:h-[100px]" />
                        </div>
                    </div>

                    {/* Progress Indicator */}
                    <div className="bg-white p-6 border border-gray-100 rounded-none shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-black uppercase tracking-widest text-brand-green">Calculation Progress</span>
                            <span className="text-xs font-bold text-slate-text">{Math.round(progress)}% Complete</span>
                        </div>
                        <div className="w-full h-2 bg-light-gray rounded-none overflow-hidden">
                            <motion.div
                                className="h-full bg-brand-green"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                    </div>

                    {/* Step Content / Accordion */}
                    <div className="flex flex-col gap-4">
                        {assetCategories.map((category) => {
                            const isExpanded = expandedAccordion === category.id;
                            const categoryTotal = category.fields.reduce((acc, field) => {
                                if (field.key === "goldGrams") return acc + (assets.goldGrams * currentCurrency.goldPrice);
                                if (field.key === "silverGrams") return acc + (assets.silverGrams * currentCurrency.silverPrice);
                                return acc + (assets[field.key as keyof typeof assets] || 0);
                            }, 0);

                            return (
                                <React.Fragment key={category.id}>
                                    <div
                                        className={cn(
                                            "bg-white border border-gray-100 rounded-none shadow-sm transition-all",
                                            isExpanded ? "ring-2 ring-brand-green/10 border-brand-green/20" : "hover:border-gray-200"
                                        )}
                                    >
                                        <button
                                            onClick={() => setExpandedAccordion(isExpanded ? null : category.id)}
                                            className="w-full flex items-center justify-between p-6 text-left"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "w-12 h-12 flex items-center justify-center rounded-none transition-all",
                                                    isExpanded ? "bg-brand-green text-white" : "bg-light-gray text-slate-text"
                                                )}>
                                                    <category.icon size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg text-foreground">{category.title}</h3>
                                                    <p className="text-xs text-slate-text font-medium">{category.fields.length} items to track</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                {categoryTotal > 0 && !isExpanded && (
                                                    <div className="text-right hidden sm:block">
                                                        <p className="text-[10px] uppercase font-black text-slate-text">Sub-total</p>
                                                        <p className="text-sm font-bold text-brand-green">{currentCurrency.symbol}{categoryTotal.toLocaleString()}</p>
                                                    </div>
                                                )}
                                                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                            </div>
                                        </button>

                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="p-6 pt-0 border-t border-gray-50 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {category.fields.map((field) => (
                                                            <div key={field.key} className="relative group">
                                                                <label className="text-xs font-bold text-slate-text uppercase tracking-widest mb-1.5 block ml-1">{field.label}</label>
                                                                <div className="relative">
                                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-text transition-colors group-focus-within:text-brand-green">
                                                                        <field.icon size={18} />
                                                                    </div>
                                                                    <input
                                                                        type="number"
                                                                        value={assets[field.key as keyof typeof assets] || ""}
                                                                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                                                                        placeholder="0.00"
                                                                        className="w-full bg-light-gray/50 border-2 border-transparent focus:border-brand-green focus:bg-white rounded-none py-3.5 pl-12 pr-12 text-foreground font-black outline-none transition-all"
                                                                    />
                                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-brand-green uppercase">
                                                                        {'unit' in field ? field.unit : currentCurrency.code}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Mobile Summary - Inserted after Cash & Savings */}
                                    {category.id === "cash" && (
                                        <div className="lg:hidden mt-4">
                                            <LiveSummary
                                                symbol={currentCurrency.symbol}
                                                totalAssets={totalAssets}
                                                totalDeductions={assets.debts}
                                                zakatableAmount={zakatableAmount}
                                                zakatDue={zakatDue}
                                                isAboveNisab={isAboveNisab}
                                                nisab={currentCurrency.nisab}
                                            />
                                        </div>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>

                    {/* Guidance / FAQ Tip */}
                    <div className="bg-white p-6 border border-gray-100 rounded-none shadow-sm flex gap-4 items-start">
                        <div className="w-10 h-10 bg-brand-orange/10 text-brand-orange flex items-center justify-center shrink-0 rounded-none">
                            <Info size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-foreground mb-1">Scholar Tip: Personal assets vs Business assets</h4>
                            <p className="text-sm text-slate-text">Only inventory for trade is zakatable. Equipment, computers, and furniture used to run the business (fixed assets) are not included in the calculation.</p>
                        </div>
                    </div>
                </div>

                {/* Right Column (Live Summary Sidebar - Desktop Only) */}
                <div className="col-span-12 lg:col-span-4 lg:sticky lg:top-24 space-y-6 hidden lg:block">
                    <LiveSummary
                        symbol={currentCurrency.symbol}
                        totalAssets={totalAssets}
                        totalDeductions={assets.debts}
                        zakatableAmount={zakatableAmount}
                        zakatDue={zakatDue}
                        isAboveNisab={isAboveNisab}
                        nisab={currentCurrency.nisab}
                    />

                    {/* Quick Support */}
                    <div className="bg-light-gray p-5 rounded-none border border-gray-200">
                        <h4 className="font-bold text-sm text-foreground mb-1">Need help calculating?</h4>
                        <p className="text-xs text-slate-text leading-relaxed mb-4">Our spiritual advisors are available for a live chat to guide you.</p>
                        <button className="text-brand-green text-xs font-black uppercase tracking-widest hover:underline flex items-center gap-2">
                            Chat with an Advisor <ArrowRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
