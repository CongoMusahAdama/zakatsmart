'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollReveal } from '../ui/ScrollReveal';

const ComparisonSlider = () => {
    const [active, setActive] = useState<'old' | 'smart'>('smart');

    const content = {
        old: {
            title: 'The Old Manual Way',
            points: [
                'Complicated spreadsheet math errors',
                'Vague understanding of Zakat rules',
                'Donating to unknown organizations',
                'Zero tracking of your impact history',
                'Privacy concerns with public records',
            ],
            color: 'bg-slate-100',
            icon: <XCircle className="text-rose-500 w-5 h-5" />,
            tag: 'Frustrating & Uncertain'
        },
        smart: {
            title: 'The Zakat Smart Way',
            points: [
                'Instant, certified calculations',
                'Scholar-verified Nisab thresholds',
                'Direct giving to local verified mosques',
                'Full transparency dashboard',
                'Military-grade privacy & anonymity',
            ],
            color: 'bg-primary-midnight',
            icon: <CheckCircle2 className="text-[#B5E1A1] w-5 h-5" />,
            tag: 'Peace of Mind'
        }
    };

    return (
        <section className="py-32 bg-[#F9FAF7] relative overflow-hidden" id="comparison">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col lg:flex-row-reverse gap-20 items-center">

                    {/* Right side: Content */}
                    <div className="lg:w-1/3 flex flex-col gap-10">
                        <ScrollReveal direction="left">
                            <div className="relative">
                                {/* Vertical Section ID */}
                                <div className="absolute -left-16 top-0 hidden xl:flex flex-col items-center">
                                    <div className="w-6 h-12 bg-primary-midnight rounded-full flex items-center justify-center">
                                        <span className="text-[10px] font-black text-white transform -rotate-90">02</span>
                                    </div>
                                    <div className="w-px h-12 bg-primary-midnight/10 mt-2"></div>
                                </div>

                                <div className="flex flex-col gap-4 pl-4 xl:pl-0">
                                    <h2 className="text-6xl md:text-7xl font-black text-primary-midnight tracking-tight uppercase font-heading leading-none">
                                        Smart <br />Comparison
                                    </h2>
                                    <p className="text-2xl font-bold text-primary-midnight/20 font-heading italic" dir="rtl">
                                        مقارنة ذكية
                                    </p>
                                </div>
                            </div>
                        </ScrollReveal>

                        <ScrollReveal direction="left" delay={0.2}>
                            <p className="text-slate-text/60 text-lg font-medium leading-relaxed max-w-sm">
                                Visualize the difference between fragmented manual giving and the streamlined Zakat Smart experience.
                            </p>
                        </ScrollReveal>

                        <ScrollReveal direction="left" delay={0.3}>
                            <div className="flex flex-col gap-3">
                                {[
                                    'Radical Clarity',
                                    'Verified Channels',
                                    'Impact First'
                                ].map((tag) => (
                                    <div key={tag} className="group cursor-default flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary-midnight/10 group-hover:bg-[#B5E1A1] transition-colors"></div>
                                        <span className="px-4 py-2 bg-white rounded-full text-[10px] font-black uppercase tracking-widest text-primary-midnight/40 border border-primary-midnight/5 shadow-sm group-hover:text-primary-midnight group-hover:border-[#B5E1A1]/30 transition-all">
                                            {tag}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </ScrollReveal>
                    </div>

                    {/* Left side: Slider UI */}
                    <div className="lg:w-2/3 w-full">
                        <ScrollReveal direction="right">
                            <div className="relative max-w-5xl mx-auto">
                                {/* Premium Toggle Switch */}
                                <div className="flex justify-center mb-16 px-4">
                                    <div className="bg-white/50 backdrop-blur-md p-1.5 rounded-full flex items-center border border-white shadow-xl">
                                        <motion.button
                                            onClick={() => setActive('old')}
                                            className={cn(
                                                "relative px-8 py-3.5 rounded-full text-[10px] font-black transition-all font-heading uppercase tracking-widest z-10",
                                                active === 'old' ? "text-white" : "text-slate-text/50 hover:text-slate-text"
                                            )}
                                        >
                                            {active === 'old' && (
                                                <motion.div
                                                    layoutId="toggle"
                                                    className="absolute inset-0 bg-primary-midnight rounded-full z-[-1]"
                                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                                />
                                            )}
                                            Old Way
                                        </motion.button>
                                        <motion.button
                                            onClick={() => setActive('smart')}
                                            className={cn(
                                                "relative px-8 py-3.5 rounded-full text-[10px] font-black transition-all font-heading uppercase tracking-widest z-10",
                                                active === 'smart' ? "text-white" : "text-slate-text/50 hover:text-brand-gold"
                                            )}
                                        >
                                            {active === 'smart' && (
                                                <motion.div
                                                    layoutId="toggle"
                                                    className="absolute inset-0 bg-brand-gold rounded-full z-[-1]"
                                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                                />
                                            )}
                                            Smart Way
                                        </motion.button>
                                    </div>
                                </div>

                                {/* Card Layout */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-stretch min-h-[580px]">
                                    {/* Dynamic Card */}
                                    <div className="order-2 md:order-1 flex">
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={active}
                                                initial={{ opacity: 0, scale: 0.98, x: active === 'smart' ? 20 : -20 }}
                                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                                exit={{ opacity: 0, scale: 1.02, x: active === 'smart' ? -20 : 20 }}
                                                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                                className={cn(
                                                    "flex-1 p-12 rounded-[3rem] flex flex-col justify-center relative overflow-hidden",
                                                    active === 'smart' ? "bg-primary-midnight text-white shadow-2xl shadow-primary-midnight/20" : "bg-white border border-slate-100 shadow-xl"
                                                )}
                                            >
                                                {active === 'smart' && (
                                                    <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
                                                        <div className="w-40 h-40 bg-[#B5E1A1] rounded-full blur-[100px]" />
                                                    </div>
                                                )}

                                                <span className={cn(
                                                    "inline-flex w-fit px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] mb-8 font-heading",
                                                    active === 'smart' ? "bg-brand-gold/20 text-brand-gold" : "bg-slate-100 text-slate-400"
                                                )}>
                                                    {content[active].tag}
                                                </span>

                                                <h3 className={cn(
                                                    "text-3xl font-black mb-10 font-heading uppercase tracking-tight",
                                                    active === 'smart' ? "text-white" : "text-primary-midnight"
                                                )}>
                                                    {content[active].title}
                                                </h3>

                                                <ul className="space-y-6">
                                                    {content[active].points.map((point, i) => (
                                                        <motion.li
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: i * 0.1 }}
                                                            key={i}
                                                            className={cn(
                                                                "flex items-start gap-4 font-medium text-sm leading-relaxed",
                                                                active === 'smart' ? "text-white/60" : "text-slate-text"
                                                            )}
                                                        >
                                                            <div className="mt-1">{content[active].icon}</div>
                                                            {point}
                                                        </motion.li>
                                                    ))}
                                                </ul>
                                            </motion.div>
                                        </AnimatePresence>
                                    </div>

                                    {/* Premium Illustration */}
                                    <div className="order-1 md:order-2 flex">
                                        <div className="flex-1 rounded-[3rem] bg-[#F9FAF7] border border-white shadow-inner flex items-center justify-center p-12 relative overflow-hidden">
                                            <AnimatePresence mode="wait">
                                                {active === 'smart' ? (
                                                    <motion.div
                                                        key="smart-ui"
                                                        initial={{ opacity: 0, y: 30 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -30 }}
                                                        className="relative w-full"
                                                    >
                                                        {/* Mock Dashboard UI */}
                                                        <div className="bg-white rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] p-8 border border-slate-100">
                                                            <div className="flex items-center justify-between mb-8">
                                                                <div className="flex gap-2">
                                                                    <div className="w-3 h-3 rounded-full bg-slate-100"></div>
                                                                    <div className="w-3 h-3 rounded-full bg-slate-100"></div>
                                                                    <div className="w-3 h-3 rounded-full bg-slate-100"></div>
                                                                </div>
                                                                <div className="w-10 h-10 bg-[#B5E1A1] rounded-xl flex items-center justify-center">
                                                                    <CheckCircle2 size={20} className="text-primary-midnight" />
                                                                </div>
                                                            </div>

                                                            <div className="space-y-6">
                                                                <div className="h-14 w-full bg-[#F9FAF7] rounded-[1.25rem] border border-slate-50 flex items-center px-5">
                                                                    <div className="w-6 h-6 rounded-full bg-brand-gold/20 mr-4"></div>
                                                                    <div className="h-2.5 w-1/3 bg-slate-200 rounded"></div>
                                                                    <div className="ml-auto h-2.5 w-12 bg-slate-200 rounded"></div>
                                                                </div>
                                                                <div className="h-14 w-full bg-[#F9FAF7] rounded-[1.25rem] border border-slate-50 flex items-center px-5">
                                                                    <div className="w-6 h-6 rounded-full bg-[#B5E1A1]/20 mr-4"></div>
                                                                    <div className="h-2.5 w-1/2 bg-slate-200 rounded"></div>
                                                                    <div className="ml-auto h-2.5 w-16 bg-slate-200 rounded"></div>
                                                                </div>

                                                                <div className="pt-4">
                                                                    <motion.div
                                                                        animate={{ scale: [1, 1.02, 1] }}
                                                                        transition={{ duration: 3, repeat: Infinity }}
                                                                        className="h-24 w-full bg-primary-midnight rounded-[1.5rem] flex flex-col items-center justify-center p-4"
                                                                    >
                                                                        <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em] mb-2 font-heading">Secure Connection</span>
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="w-1.5 h-1.5 rounded-full bg-[#B5E1A1] animate-pulse"></div>
                                                                            <span className="text-sm font-black text-white font-heading">LIVE IMPACT TRACKING</span>
                                                                        </div>
                                                                    </motion.div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ) : (
                                                    <motion.div
                                                        key="old-ui"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        className="flex flex-col items-center opacity-30"
                                                    >
                                                        <div className="text-7xl font-black text-primary-midnight font-heading mb-4">?</div>
                                                        <p className="font-black text-[10px] text-primary-midnight uppercase tracking-widest font-heading">Manual Fragmentation</p>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ComparisonSlider;
