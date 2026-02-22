"use client";

import React from "react";
import { CheckCircle2, AlertCircle, Heart } from "lucide-react";

interface LiveSummaryProps {
    symbol: string;
    totalAssets: number;
    totalDeductions: number;
    zakatableAmount: number;
    zakatDue: number;
    isAboveNisab: boolean;
    nisab: number;
    className?: string;
}

export default function LiveSummary({
    symbol,
    totalAssets,
    totalDeductions,
    zakatableAmount,
    zakatDue,
    isAboveNisab,
    nisab,
    className
}: LiveSummaryProps) {
    return (
        <div className={`bg-white border-2 border-brand-green/20 rounded-none shadow-xl shadow-brand-green/5 overflow-hidden ${className}`}>
            <div className="bg-brand-green px-6 py-4">
                <h3 className="text-white font-black uppercase tracking-widest text-sm text-center">Your Live Summary</h3>
            </div>

            <div className="p-6 space-y-6">
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-text font-medium">Total Assets</span>
                        <span className="font-black text-foreground">{symbol}{totalAssets.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-text font-medium">Total Deductions</span>
                        <span className="font-black text-brand-red">-{symbol}{totalDeductions.toLocaleString()}</span>
                    </div>
                    <div className="pt-3 border-t border-dashed border-gray-200 flex justify-between items-center">
                        <span className="text-sm font-black uppercase text-foreground">Zakatable Amount</span>
                        <span className="text-xl font-black text-brand-green">{symbol}{zakatableAmount.toLocaleString()}</span>
                    </div>
                </div>

                {isAboveNisab ? (
                    <div className="bg-brand-green/5 p-4 border border-brand-green/20 rounded-none text-center">
                        <p className="text-[10px] font-black uppercase text-brand-green tracking-widest mb-1">Zakat Due (2.5%)</p>
                        <h4 className="text-3xl font-black text-brand-green">{symbol}{zakatDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h4>
                    </div>
                ) : (
                    <div className="bg-brand-orange/5 p-4 border border-brand-orange/20 rounded-none">
                        <div className="flex gap-3 items-start">
                            <AlertCircle className="text-brand-orange shrink-0" size={18} />
                            <p className="text-xs text-slate-text leading-relaxed font-medium">
                                You haven't reached the <strong>Nisab threshold</strong> yet ({symbol}{nisab.toLocaleString()}). No Zakat is due at this time.
                            </p>
                        </div>
                        <button className="w-full mt-4 bg-brand-orange text-white py-2.5 rounded-none font-black text-xs uppercase tracking-widest hover:bg-brand-orange-hover transition-all flex items-center justify-center gap-2 active:scale-95">
                            <Heart size={14} /> Fulfill Sadaqah
                        </button>
                    </div>
                )}

                {isAboveNisab && (
                    <button className="w-full bg-brand-green text-white py-4 rounded-none font-black text-sm uppercase tracking-widest hover:bg-brand-green-light transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-green/30 active:scale-95 group">
                        Fulfill Now <CheckCircle2 size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                )}

                <div className="pt-2 text-[10px] text-center text-slate-text leading-relaxed font-medium uppercase tracking-tight">
                    This calculation is an estimate. <br />Consult with a scholar for complex cases.
                </div>
            </div>
        </div>
    );
}
