'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator as CalcIcon, DollarSign, ArrowRight, CheckCircle } from 'lucide-react';
import { ScrollReveal } from '../ui/ScrollReveal';

const Calculator = () => {
    const [wealth, setWealth] = useState('');
    const [result, setResult] = useState<number | null>(null);
    const [currency, setCurrency] = useState('GHS');

    const currencies = [
        { code: 'GHS', symbol: 'GH₵' },
        { code: 'NGN', symbol: '₦' },
        { code: 'KES', symbol: 'KSh' },
        { code: 'USD', symbol: '$' },
    ];

    const handleCalculate = (e: React.FormEvent) => {
        e.preventDefault();
        const val = parseFloat(wealth);
        if (!isNaN(val)) {
            setResult(val * 0.025);
        }
    };

    return (
        <section className="py-32 bg-white relative overflow-hidden" id="calculator">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col lg:flex-row gap-20 items-center">

                    {/* Left side: Content */}
                    <div className="lg:w-1/3 flex flex-col gap-10">
                        <ScrollReveal direction="right">
                            <div className="relative">
                                {/* Vertical Section ID */}
                                <div className="absolute -left-16 top-0 hidden xl:flex flex-col items-center">
                                    <div className="w-6 h-12 bg-primary-midnight rounded-full flex items-center justify-center">
                                        <span className="text-[10px] font-black text-white transform -rotate-90">01</span>
                                    </div>
                                    <div className="w-px h-12 bg-primary-midnight/10 mt-2"></div>
                                </div>

                                <div className="flex flex-col gap-4 pl-4 xl:pl-0">
                                    <h2 className="text-6xl md:text-7xl font-black text-primary-midnight tracking-tight uppercase font-heading leading-none">
                                        Precision <br />Calculation
                                    </h2>
                                    <p className="text-2xl font-bold text-primary-midnight/20 font-heading italic" dir="rtl">
                                        حساب دقيق
                                    </p>
                                </div>
                            </div>
                        </ScrollReveal>

                        <ScrollReveal direction="right" delay={0.2}>
                            <p className="text-slate-text/60 text-lg font-medium leading-relaxed max-w-sm">
                                Instant, certified Zakat results based on current market rates and regional Nisab thresholds.
                            </p>
                        </ScrollReveal>

                        <ScrollReveal direction="right" delay={0.3}>
                            <div className="flex flex-col gap-3">
                                {[
                                    'Gold/Silver Rates',
                                    'Local Currency',
                                    'Nisab Awareness'
                                ].map((tag) => (
                                    <div key={tag} className="group cursor-default flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary-midnight/10 group-hover:bg-brand-gold transition-colors"></div>
                                        <span className="px-4 py-2 bg-[#F9FAF7] rounded-full text-[10px] font-black uppercase tracking-widest text-primary-midnight/40 border border-primary-midnight/5 shadow-sm group-hover:text-primary-midnight group-hover:border-brand-gold/30 transition-all">
                                            {tag}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </ScrollReveal>
                    </div>

                    {/* Right side: Calculator Card */}
                    <div className="lg:w-2/3 w-full relative">
                        {/* Decorative background glow */}
                        <div className="absolute -inset-10 bg-brand-gold/5 blur-[100px] rounded-full opacity-50"></div>

                        <ScrollReveal direction="left">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                className="bg-[#1A1A1A] rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] border border-white/5 p-10 relative overflow-hidden"
                            >
                                {/* Subtle Glow */}
                                <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-gold/10 rounded-full blur-[80px]"></div>

                                <div className="relative z-10">
                                    <div className="flex items-center gap-4 mb-10">
                                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                                            <CalcIcon className="text-brand-gold w-6 h-6" />
                                        </div>
                                        <div className="flex flex-col">
                                            <h3 className="font-bold text-xl text-white font-heading uppercase tracking-tight">Quick Calculator</h3>
                                        </div>
                                    </div>

                                    <form onSubmit={handleCalculate} className="space-y-8">
                                        <div>
                                            <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4 text-center md:text-left font-heading">
                                                Zakatable Wealth
                                            </label>
                                            <div className="relative group">
                                                <div className="absolute left-1 top-1 bottom-1 flex items-center">
                                                    <select
                                                        className="h-full bg-white/5 hover:bg-white/10 border-none text-brand-gold font-black text-xs px-4 rounded-2xl focus:ring-0 cursor-pointer transition-colors font-heading appearance-none"
                                                        value={currency}
                                                        onChange={(e) => setCurrency(e.target.value)}
                                                    >
                                                        {currencies.map(c => <option key={c.code} value={c.code} className="bg-primary-midnight text-white">{c.code}</option>)}
                                                    </select>
                                                </div>
                                                <input
                                                    type="number"
                                                    value={wealth}
                                                    onChange={(e) => setWealth(e.target.value)}
                                                    placeholder="0.00"
                                                    className="w-full pl-24 pr-6 py-6 bg-white/5 border border-white/5 focus:border-brand-gold/50 rounded-2xl outline-none transition-all font-black text-2xl text-white placeholder:text-white/10 font-heading"
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            className="w-full bg-brand-gold py-6 rounded-2xl text-white font-black flex items-center justify-center gap-3 hover:brightness-110 transition-all shadow-xl shadow-brand-gold/20 font-heading uppercase tracking-[0.2em] text-[10px]"
                                        >
                                            Calculate Your Due
                                            <ArrowRight size={16} />
                                        </button>
                                    </form>

                                    <AnimatePresence>
                                        {result !== null && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                className="mt-10 pt-10 border-t border-white/5"
                                            >
                                                <div className="text-center">
                                                    <p className="text-[10px] font-black text-white/30 mb-4 uppercase tracking-[0.3em] font-heading">Estimated Zakat Due (2.5%)</p>
                                                    <div className="inline-flex flex-col items-center">
                                                        <h4 className="text-5xl font-black text-white mb-6 font-heading flex items-baseline gap-2">
                                                            <span className="text-xl text-brand-gold">{currencies.find(c => c.code === currency)?.symbol}</span>
                                                            {result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </h4>
                                                        <div className="flex items-center gap-3 px-5 py-2.5 bg-[#B5E1A1]/10 rounded-full border border-[#B5E1A1]/20">
                                                            <CheckCircle size={14} className="text-[#B5E1A1]" />
                                                            <span className="text-[10px] font-black text-[#B5E1A1] uppercase tracking-widest font-heading">Scholar Verified Threshold</span>
                                                        </div>
                                                    </div>

                                                    <button className="w-full mt-10 text-white/40 hover:text-white font-black text-[10px] uppercase tracking-[0.3em] font-heading transition-colors flex items-center justify-center gap-2">
                                                        View Detailed Breakdown
                                                        <div className="w-1 h-1 rounded-full bg-brand-gold"></div>
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        </ScrollReveal>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Calculator;
