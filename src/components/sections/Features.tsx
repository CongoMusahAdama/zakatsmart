'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    Calculator,
    MapPin,
    BarChart3,
    ShieldCheck,
    Lock,
    CheckCircle2,
    ArrowUpRight,
    Sparkles
} from 'lucide-react';
import Image from 'next/image';

const features = [
    {
        id: "calculate",
        title: "Smart Calculator",
        highlight: "Precise & Local",
        desc: "Precision support for West African local currencies (GHS, NGN, etc.) using real-time market data and scholar-verified logic. Calculate your Zakat obligations with absolute certainty across any asset class.",
        image: "/zakatcalculate.png",
        icon: <Calculator className="text-brand-green" size={28} />,
        delay: 0.1
    },
    {
        id: "map",
        title: "Verified Map",
        highlight: "Community Hub",
        desc: "A visual 'Local Giving Map' designed to help you discover and connect with verified mosques and charities in your immediate vicinity. See exactly where your impact is being felt in real-time.",
        image: "/mosque.png",
        icon: <MapPin className="text-brand-orange" size={28} />,
        delay: 0.2
    },
    {
        id: "track",
        title: "Transparency Tracker",
        highlight: "Verifiable Impact",
        desc: "A dedicated dashboard snippet that tracks your giving journey, providing a clear history and visual reports of your personal impact. Stay connected to the communities you support through transparent reporting.",
        image: "/tracker.png",
        icon: <BarChart3 className="text-brand-green" size={28} />,
        delay: 0.3
    }
];

const trustItems = [
    { icon: <Lock size={18} />, label: "SSL Secured" },
    { icon: <CheckCircle2 size={18} />, label: "Verified Charities Only" },
    { icon: <ShieldCheck size={18} />, label: "100% Anonymous" }
];

const FeaturesGrid = () => {
    return (
        <section className="py-32 bg-[#F9FAF7] relative overflow-hidden" id="features">
            {/* Background decorative elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-green/5 blur-[120px] rounded-full"></div>
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-brand-orange/5 blur-[120px] rounded-full"></div>

            <div className="container mx-auto px-4 md:px-6 relative z-10">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-32 text-center md:text-left">
                    <div className="max-w-2xl mx-auto md:mx-0">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-green/10 text-brand-green text-xs font-bold uppercase tracking-widest mb-6"
                        >
                            <Sparkles size={14} />
                            Platform Highlights
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="text-4xl md:text-6xl font-black text-[#1a1a1a] leading-tight mb-2"
                        >
                            Empowering Your <br />
                            <span className="text-brand-green">Charitable Journey.</span>
                        </motion.h2>
                        <div className="text-sm md:text-base font-arabic text-brand-green/40 font-medium text-center md:text-left mb-6 tracking-wide">
                            تمكين رحلتك الخيرية
                        </div>
                    </div>
                </div>

                {/* Alternating Features Section */}
                <div className="flex flex-col gap-24 lg:gap-40 mb-32">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            id={feature.id}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8 }}
                            className={`flex flex-col lg:items-center gap-12 lg:gap-24 ${idx % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                                }`}
                        >
                            {/* Visual Side */}
                            <div className="flex-1 group">
                                <div className="relative rounded-[3rem] overflow-hidden shadow-2xl shadow-brand-green/10 bg-white p-4">
                                    <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden">
                                        <Image
                                            src={feature.image}
                                            alt={feature.title}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    </div>

                                    {/* Floating Icon Holder */}
                                    <div className="absolute top-10 left-10 w-16 h-16 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-xl group-hover:rotate-6 transition-transform duration-500">
                                        {feature.icon}
                                    </div>
                                </div>
                            </div>

                            {/* Content Side */}
                            <div className="flex-1 max-w-xl">
                                <span className="text-brand-orange text-sm font-black uppercase tracking-[0.2em] mb-4 block">
                                    {feature.highlight}
                                </span>
                                <h3 className="text-3xl md:text-5xl font-black text-[#1a1a1a] mb-6 tracking-tight leading-tight">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-500 text-lg md:text-xl leading-relaxed font-medium mb-10">
                                    {feature.desc}
                                </p>

                                <div className="flex items-center gap-6">
                                    <button className="bg-[#1a1a1a] hover:bg-black text-white px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 group/btn flex items-center gap-2">
                                        Get Started
                                        <ArrowUpRight size={18} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                                    </button>
                                    <div className="h-[2px] w-12 bg-gray-200"></div>
                                    <span className="text-brand-green font-bold text-xs uppercase tracking-widest">Explore More</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Trust Footer */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-white rounded-[4rem] p-1.5 shadow-2xl shadow-brand-green/5 border border-gray-100"
                >
                    <div className="bg-brand-green rounded-[3.8rem] py-14 px-10 flex flex-col lg:flex-row items-center justify-between gap-12 shadow-xl shadow-brand-green/20">
                        <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-3">
                            <span className="text-white/60 text-[11px] font-black uppercase tracking-[0.4em] mb-1">Security Standards</span>
                            <h4 className="text-white font-black text-3xl md:text-4xl tracking-tight leading-none">Built For Absolute Trust.</h4>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
                            {trustItems.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-5 text-white bg-white/10 border border-white/20 px-8 py-5 rounded-[2rem] hover:bg-white/20 hover:border-white transition-all duration-300 group">
                                    <div className="text-brand-orange group-hover:scale-110 transition-transform">
                                        {item.icon}
                                    </div>
                                    <span className="font-extrabold text-sm uppercase tracking-widest leading-none whitespace-nowrap">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

            </div>
        </section>
    );
};

export default FeaturesGrid;
