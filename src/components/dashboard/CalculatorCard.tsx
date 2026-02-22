"use client";

import React, { useState, useMemo } from "react";
import { Coins, Briefcase, Wallet, Landmark, Info, Heart, ArrowRight } from "lucide-react";
import Link from "next/link";

const currencies = [
    { code: "GHS", name: "Ghanaian Cedi", symbol: "GH₵", nisab: 12450 },
    { code: "NGN", name: "Nigerian Naira", symbol: "₦", nisab: 1560000 },
    { code: "USD", name: "US Dollar", symbol: "$", nisab: 1150 },
];

const assetClasses = [
    { id: "cash", label: "Cash & Savings", icon: Wallet, placeholder: "0.00" },
    { id: "gold", label: "Gold & Silver", icon: Coins, placeholder: "0.00" },
    { id: "business", label: "Business Assets", icon: Briefcase, placeholder: "0.00" },
    { id: "investments", label: "Investments", icon: Landmark, placeholder: "0.00" },
];

export default function CalculatorCard() {
    const [selectedCurrency, setSelectedCurrency] = useState(currencies[0]);
    const [values, setValues] = useState<Record<string, number>>({
        cash: 0,
        gold: 0,
        business: 0,
        investments: 0,
    });

    const handleInputChange = (id: string, val: string) => {
        const num = parseFloat(val) || 0;
        setValues(prev => ({ ...prev, [id]: num }));
    };

    const totalAssets = useMemo(() => {
        return Object.values(values).reduce((acc, curr) => acc + curr, 0);
    }, [values]);

    const isAboveNisab = totalAssets >= selectedCurrency.nisab;
    const zakatDue = isAboveNisab ? totalAssets * 0.025 : 0;

    return (
        <div className="bg-white rounded-none p-6 shadow-sm border border-gray-50 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg md:text-xl font-heading font-bold text-foreground">Quick Calculator</h2>
                <div className="flex bg-light-gray p-1 rounded-none">
                    {currencies.slice(0, 3).map((curr) => (
                        <button
                            key={curr.code}
                            onClick={() => setSelectedCurrency(curr)}
                            className={`px-3 py-1 rounded-none text-[10px] font-black tracking-widest transition-all ${selectedCurrency.code === curr.code
                                ? "bg-brand-green text-white shadow-sm"
                                : "text-slate-text hover:text-brand-green"
                                }`}
                        >
                            {curr.code}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-3 md:space-y-4 flex-1">
                <div className="grid grid-cols-1 md:gap-4 gap-3">
                    {assetClasses.map((asset) => (
                        <div key={asset.id} className="group">
                            <label className="text-[9px] md:text-[10px] font-black text-slate-text uppercase tracking-widest mb-1 md:mb-1.5 block flex items-center gap-1">
                                {asset.label}
                                <Info size={10} className="text-gray-300 md:w-3 md:h-3 group-hover:text-brand-green transition-colors cursor-help" />
                            </label>
                            <div className="relative">
                                <div className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-green transition-colors">
                                    <asset.icon size={16} className="md:w-[18px] md:h-[18px]" />
                                </div>
                                <input
                                    type="number"
                                    placeholder={asset.placeholder}
                                    value={values[asset.id] || ""}
                                    onChange={(e) => handleInputChange(asset.id, e.target.value)}
                                    className="w-full bg-light-gray/50 border-2 border-transparent focus:border-brand-green/20 focus:bg-white rounded-none py-2.5 md:py-3 pl-10 md:pl-12 pr-14 md:pr-16 font-black text-sm md:text-base text-foreground outline-none transition-all"
                                />
                                <div className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-[9px] md:text-[10px] font-black text-brand-green tracking-widest">
                                    {selectedCurrency.code}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase text-slate-text tracking-widest">Est. Zakat</span>
                    <span className={`text-xl font-black font-heading ${zakatDue > 0 ? "text-brand-green" : "text-slate-text"}`}>
                        {selectedCurrency.symbol}{zakatDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                </div>
                <Link
                    href="/dashboard/calculator"
                    className="bg-brand-green text-white hover:bg-brand-green-light px-4 py-2 rounded-none font-black text-[9px] uppercase tracking-widest transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-brand-green/10"
                >
                    Step-by-Step Calculator <ArrowRight size={12} />
                </Link>
            </div>
        </div>
    );
}
