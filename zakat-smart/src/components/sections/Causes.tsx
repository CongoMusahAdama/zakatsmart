'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

const steps = [
    {
        number: "01",
        title: "Calculate Your Zakat",
        desc: "Input your assets and get an instant, accurate calculation based on live West African rates and scholar-verified logic.",
        color: "text-brand-green",
        bgColor: "bg-brand-green/10",
        dotColor: "bg-brand-green"
    },
    {
        number: "02",
        title: "Verify & Connect",
        desc: "Connect with vetted local mosques and charities verified by our team on the ground to ensure your impact is felt where it's needed most.",
        color: "text-brand-orange",
        bgColor: "bg-brand-orange/10",
        dotColor: "bg-brand-orange"
    },
    {
        number: "03",
        title: "Securely Donate",
        desc: "Securely fulfill your obligation in your local currency and track your giving journey through your personal impact dashboard.",
        color: "text-brand-green",
        bgColor: "bg-brand-green/10",
        dotColor: "bg-brand-green"
    }
];

const HowItWorks = () => {
    return (
        <section className="py-32 bg-white overflow-hidden relative" id="how-it-works">
            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8">

                    {/* Left Side: Header */}
                    <div className="lg:col-span-4 flex flex-col justify-center items-center lg:items-start text-center lg:text-left">
                        <motion.span
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-brand-orange font-bold text-xs uppercase tracking-[0.3em] mb-4 block"
                        >
                            Straightforward Giving
                        </motion.span>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-5xl font-black text-[#1a1a1a] leading-[1.1] mb-2"
                        >
                            A Transparent Path <br />
                            <span className="text-brand-green">To Local Impact.</span>
                        </motion.h2>
                        <div className="text-sm md:text-base font-arabic text-brand-green/40 mb-6 font-medium w-full text-left tracking-wide">
                            مسار شفاف للأثر المحلي
                        </div>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="text-gray-500 text-base leading-relaxed mb-10 max-w-sm font-medium"
                        >
                            Give your Zakat with absolute certainty. Our verified three-step process bridges the gap between your spiritual obligation and real community transformation across West Africa.
                        </motion.p>

                        <motion.button
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="bg-brand-orange hover:bg-brand-orange-hover text-white px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 group flex items-center gap-2"
                        >
                            Get Started
                            <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </motion.button>
                    </div>

                    {/* Right Side: Process Flow */}
                    <div className="lg:col-span-8 relative">
                        {/* Wavy Path SVG (Desktop Only) */}
                        <div className="hidden lg:block absolute top-[25%] left-0 w-full h-1/2 -z-10 opacity-30">
                            <svg width="100%" height="100%" viewBox="0 0 800 200" fill="none" preserveAspectRatio="none">
                                <motion.path
                                    d="M0 100 C 150 250, 250 -50, 400 100 C 550 250, 650 -50, 800 100"
                                    stroke="#D1D5DB"
                                    strokeWidth="2"
                                    strokeDasharray="8 8"
                                    initial={{ pathLength: 0 }}
                                    whileInView={{ pathLength: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 2, ease: "easeInOut" }}
                                />
                                {/* Wavy line with brand colors */}
                                <motion.path
                                    d="M0 100 C 150 250, 250 -50, 400 100 C 550 250, 650 -50, 800 100"
                                    stroke="url(#gradient)"
                                    strokeWidth="3"
                                    initial={{ pathLength: 0 }}
                                    whileInView={{ pathLength: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 2, ease: "easeInOut" }}
                                />
                                <defs>
                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#7ede56" />
                                        <stop offset="50%" stopColor="#F59E0B" />
                                        <stop offset="100%" stopColor="#7ede56" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-4 h-full">
                            {steps.map((step, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: 0.2 * idx }}
                                    className={`relative flex flex-col items-center text-center px-4 ${idx === 1 ? 'lg:translate-y-24' : ''
                                        }`}
                                >
                                    {/* Large Background Number */}
                                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-[180px] font-black text-gray-400/10 leading-none select-none -z-10">
                                        {idx + 1}
                                    </div>

                                    {/* Indicator Circle */}
                                    <div className={`w-6 h-6 rounded-full ${step.dotColor} border-4 border-white shadow-xl mb-8 lg:mb-12 relative z-20`}>
                                        <div className={`absolute inset-0 rounded-full ${step.dotColor} animate-ping opacity-25`}></div>
                                    </div>

                                    <h3 className="text-xl font-black text-[#1a1a1a] mb-4 tracking-tight">
                                        {step.title}
                                    </h3>
                                    <p className="text-gray-500 text-sm leading-relaxed font-medium">
                                        {step.desc}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
