"use client";

import React, { useState, useMemo } from "react";
import { Coins, Briefcase, Wallet, Landmark, Info, ArrowRight, Save, Loader2, CheckCircle } from "lucide-react";
import Link from "next/link";
import { zakatApi, ApiError } from "@/lib/api";

const currencies = [
    { code: "GHS", name: "Ghanaian Cedi", symbol: "GH₵", nisab: 12450 },
    { code: "NGN", name: "Nigerian Naira", symbol: "₦", nisab: 1560000 },
    { code: "USD", name: "US Dollar", symbol: "$", nisab: 1150 },
] as const;

const assetClasses = [
    { id: "cash", label: "Cash & Savings", icon: Wallet, placeholder: "0.00" },
    { id: "gold", label: "Gold & Silver", icon: Coins, placeholder: "0.00" },
    { id: "business", label: "Business Assets", icon: Briefcase, placeholder: "0.00" },
    { id: "investments", label: "Investments", icon: Landmark, placeholder: "0.00" },
];

export default function CalculatorCard() {
    const [selectedCurrency, setSelectedCurrency] = useState<typeof currencies[number]>(currencies[0]);
    const [values, setValues] = useState<Record<string, number>>({
        cash: 0, gold: 0, business: 0, investments: 0,
    });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState("");

    const handleInputChange = (id: string, val: string) => {
        const num = parseFloat(val) || 0;
        setValues(prev => ({ ...prev, [id]: num }));
        setSaved(false);
    };

    const totalAssets = useMemo(() => Object.values(values).reduce((a, b) => a + b, 0), [values]);
    const isAboveNisab = totalAssets >= selectedCurrency.nisab;
    const zakatDue = isAboveNisab ? totalAssets * 0.025 : 0;

    const handleQuickSave = async () => {
        if (totalAssets === 0) return;
        setSaving(true); setError(""); setSaved(false);
        try {
            await zakatApi.create({
                assets: {
                    cash: values.cash,
                    stocks: values.investments,
                    businessInventory: values.business,
                    goldGrams: 0,
                },
                currency: selectedCurrency.code,
                label: `Quick Calc – ${new Date().toLocaleDateString()}`,
                zakatYear: new Date().getFullYear().toString(),
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            setError(err instanceof ApiError ? err.message : "Save failed.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-white rounded-none p-6 shadow-sm border border-gray-50 flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg md:text-xl font-heading font-bold text-foreground">Quick Calculator</h2>
                <div className="flex bg-light-gray p-1 rounded-none">
                    {currencies.map((curr) => (
                        <button key={curr.code} onClick={() => setSelectedCurrency(curr)}
                            className={`px-3 py-1 rounded-none text-[10px] font-black tracking-widest transition-all ${selectedCurrency.code === curr.code
                                ? "bg-brand-green text-white shadow-sm"
                                : "text-slate-text hover:text-brand-green"
                                }`}>
                            {curr.code}
                        </button>
                    ))}
                </div>
            </div>

            {/* Inputs */}
            <div className="space-y-3 flex-1">
                {assetClasses.map((asset) => (
                    <div key={asset.id} className="group">
                        <label className="text-[9px] md:text-[10px] font-black text-slate-text uppercase tracking-widest mb-1 block flex items-center gap-1">
                            {asset.label}
                            <Info size={10} className="text-gray-300 group-hover:text-brand-green transition-colors cursor-help" />
                        </label>
                        <div className="relative">
                            <div className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-green transition-colors">
                                <asset.icon size={16} />
                            </div>
                            <input
                                type="number" min="0"
                                placeholder={asset.placeholder}
                                value={values[asset.id] || ""}
                                onChange={(e) => handleInputChange(asset.id, e.target.value)}
                                className="w-full bg-light-gray/50 border-2 border-transparent focus:border-brand-green/20 focus:bg-white rounded-none py-2.5 md:py-3 pl-10 md:pl-12 pr-14 md:pr-16 font-black text-sm text-foreground outline-none transition-all"
                            />
                            <div className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-[9px] md:text-[10px] font-black text-brand-green tracking-widest">
                                {selectedCurrency.code}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Error */}
            {error && <p className="text-red-500 text-xs mt-3 font-medium">{error}</p>}

            {/* Footer */}
            <div className="mt-6 pt-5 border-t border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase text-slate-text tracking-widest">Est. Zakat</span>
                        <span className={`text-xl font-black font-heading ${zakatDue > 0 ? "text-brand-green" : "text-slate-text"}`}>
                            {selectedCurrency.symbol}{zakatDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>

                    <div className="flex gap-2">
                        {/* Quick save */}
                        <button onClick={handleQuickSave} disabled={saving || totalAssets === 0}
                            title="Save this quick calculation"
                            className={`px-3 py-2 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed ${saved
                                ? "bg-brand-green/10 text-brand-green"
                                : "bg-light-gray text-slate-text hover:bg-brand-green/10 hover:text-brand-green"
                                }`}>
                            {saving
                                ? <Loader2 size={13} className="animate-spin" />
                                : saved
                                    ? <CheckCircle size={13} />
                                    : <Save size={13} />
                            }
                            {saved ? "Saved!" : "Save"}
                        </button>

                        {/* Full calculator link */}
                        <Link href="/dashboard/calculator"
                            className="bg-brand-green text-white hover:bg-brand-green-light px-4 py-2 font-black text-[9px] uppercase tracking-widest transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-brand-green/10">
                            Full Calculator <ArrowRight size={12} />
                        </Link>
                    </div>
                </div>

                {!isAboveNisab && totalAssets > 0 && (
                    <p className="text-[10px] text-slate-text font-medium bg-brand-orange/5 border border-brand-orange/20 px-3 py-2">
                        ⚠️ Below Nisab ({selectedCurrency.symbol}{selectedCurrency.nisab.toLocaleString()}) — no Zakat due, but Sadaqah is always welcome.
                    </p>
                )}
            </div>
        </div>
    );
}
