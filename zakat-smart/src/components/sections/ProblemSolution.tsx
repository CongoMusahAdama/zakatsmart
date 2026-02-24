'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    AlertCircle,
    CheckCircle2,
    Calculator,
    ShieldCheck,
    MapPin,
    History,
    Globe,
    XCircle
} from 'lucide-react';

const problemPoints = [
    {
        id: 1,
        title: "Calculation Confusion",
        desc: "Uncertainty about how to calculate zakat accurately using current gold/silver rates.",
    },
    {
        id: 2,
        title: "Trust & Verification",
        desc: "Difficulty finding verified local charities or mosques that ensure your funds are used correctly.",
    },
    {
        id: 3,
        title: "Opaque Channels",
        desc: "Lack of transparency in how donations are processed and where they actually go.",
    }
];

const solutionPoints = [
    {
        id: 1,
        icon: <Calculator size={24} />,
        title: "Automatic Precision",
        desc: "Real-time rates and guided tools calculate your exact zakat in seconds.",
        color: "brand-green"
    },
    {
        id: 2,
        icon: <ShieldCheck size={24} />,
        title: "Verified Networks",
        desc: "Only Vetted West African charities and mosques are listed on our platform.",
        color: "brand-orange"
    },
    {
        id: 3,
        icon: <Globe size={24} />,
        title: "Local Impact",
        desc: "Donate in your local currency directly to communities you care about.",
        color: "brand-green"
    }
];

const ProblemSolution = () => {
    return (
        <section className="py-32 bg-white overflow-hidden relative" id="challenge">
            {/* Subtle background decoration */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-50/50 -z-10 skew-x-6 transform origin-top-right"></div>

            <div className="container mx-auto px-4 md:px-6">

                {/* Header Container */}
                <div className="max-w-3xl mb-24 text-center lg:text-left mx-auto lg:mx-0">
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-brand-orange font-bold text-xs uppercase tracking-[0.3em] mb-4 block"
                    >
                        Bridging the Gap
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-black text-[#1a1a1a] leading-[1.1] mb-2 uppercase"
                    >
                        The Challenge <br />
                        <span className="text-brand-green">And Solution.</span>
                    </motion.h2>
                    <div className="text-sm md:text-base font-arabic text-brand-green/40 mb-8 font-medium text-left tracking-wide">
                        التحدي والحل
                    </div>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-500 text-lg md:text-xl leading-relaxed max-w-2xl"
                    >
                        Fulfilling your spiritual obligation shouldn&apos;t be complicated. We&apos;ve pinpointed the hurdles and built the fast track to impactful giving.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 items-start">

                    {/* The Path of Frustration (Problems) - 5 Columns */}
                    <div className="lg:col-span-5 flex flex-col gap-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-[2px] bg-red-400"></div>
                            <span className="text-red-500 font-bold text-xs uppercase tracking-widest">Common Challenges</span>
                        </div>

                        {problemPoints.map((point, idx) => (
                            <motion.div
                                key={point.id}
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="group relative bg-white p-8 rounded-3xl border border-gray-100 hover:border-red-100 transition-all duration-500 hover:shadow-2xl hover:shadow-red-500/5"
                            >
                                <div className="flex gap-5">
                                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 shrink-0 group-hover:scale-110 transition-transform">
                                        <XCircle size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[#1a1a1a] mb-2 text-lg">{point.title}</h4>
                                        <p className="text-gray-500 text-sm leading-relaxed">{point.desc}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* The Bridge (Visual Separator) - 2 Columns */}
                    <div className="hidden lg:flex lg:col-span-2 h-full flex-col items-center justify-center py-10">
                        <div className="w-[1px] h-full bg-gradient-to-b from-transparent via-gray-200 to-transparent relative">
                            <motion.div
                                animate={{ top: ["0%", "100%"] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                className="absolute w-3 h-3 -left-[5px] bg-brand-green rounded-full blur-[2px]"
                            />
                        </div>
                    </div>

                    {/* The Path of Peace (Solutions) - 5 Columns */}
                    <div className="lg:col-span-5 flex flex-col gap-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-[2px] bg-brand-green"></div>
                            <span className="text-brand-green font-bold text-xs uppercase tracking-widest">The Zakat Smart Way</span>
                        </div>

                        {solutionPoints.map((point, idx) => (
                            <motion.div
                                key={point.id}
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 + 0.3 }}
                                className="group relative bg-[#FBFDFB] p-8 rounded-3xl border border-emerald-50 hover:border-brand-green/20 transition-all duration-500 hover:shadow-2xl hover:shadow-brand-green/10"
                            >
                                <div className="flex gap-5">
                                    <div className={`w-12 h-12 rounded-2xl ${point.color === 'brand-green' ? 'bg-emerald-50 text-brand-green' : 'bg-orange-50 text-brand-orange'} flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all`}>
                                        {point.icon}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[#1a1a1a] mb-2 text-lg">{point.title}</h4>
                                        <p className="text-gray-500 text-sm leading-relaxed">{point.desc}</p>
                                    </div>
                                </div>
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <CheckCircle2 size={16} className="text-brand-green" />
                                </div>
                            </motion.div>
                        ))}
                    </div>

                </div>

            </div>
        </section>
    );
};

export default ProblemSolution;
