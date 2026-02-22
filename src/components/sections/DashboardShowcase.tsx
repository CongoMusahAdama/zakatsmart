'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const DashboardShowcase = () => {
    const desktopScreens = [
        {
            title: "Smart Overview",
            description: "A comprehensive view of your Zakat health and impact at a glance.",
            image: "/maindashboard.png"
        },
        {
            title: "Advanced Calculator",
            description: "Precise calculation tools for every asset class with real-time conversion.",
            image: "/zakatdashboard.png"
        }
    ];

    const mobileScreens = [
        {
            title: "Instant Access",
            description: "Calculate and track your giving on the go with our mobile-first design.",
            image: "/mobileview.png"
        },
        {
            title: "Premium Experience",
            description: "Seamless transitions and a beautiful splash screen for every visit.",
            image: "/splash.png"
        }
    ];

    return (
        <section className="py-24 bg-off-white overflow-hidden" id="dashboard-experience">
            <div className="container mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-black text-brand-green uppercase tracking-tight mb-6 font-outfit"
                    >
                        The Digital Dashboard <span className="text-brand-orange">Experience</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-text text-lg font-medium"
                    >
                        Experience a premium, high-fidelity interface designed to make Zakat management effortless across all your devices.
                    </motion.p>
                </div>

                {/* Desktop/Laptop Views */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-24">
                    {desktopScreens.map((screen, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.2 }}
                            className="flex flex-col gap-6"
                        >
                            {/* Laptop Mockup */}
                            <div className="relative group">
                                <div className="bg-gray-800 rounded-t-xl p-2 md:p-3 shadow-2xl border-x-4 border-t-4 border-gray-700">
                                    <div className="bg-white rounded-lg overflow-hidden aspect-[16/10] relative border border-gray-200">
                                        <Image
                                            src={screen.image}
                                            alt={screen.title}
                                            fill
                                            className="object-cover object-top"
                                        />
                                    </div>
                                </div>
                                <div className="bg-gradient-to-b from-gray-700 to-gray-900 h-3 md:h-4 w-full rounded-b-xl shadow-xl"></div>
                                <div className="mx-auto w-1/4 h-1 bg-gray-600 rounded-b-full shadow-inner"></div>
                            </div>
                            <div className="text-center md:text-left">
                                <h3 className="text-2xl font-black text-brand-green uppercase tracking-tight mb-2">{screen.title}</h3>
                                <p className="text-slate-text font-medium">{screen.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Mobile Views */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    {mobileScreens.map((screen, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: idx === 0 ? -30 : 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 }}
                            className={`flex flex-col md:flex-row items-center gap-10 ${idx % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}
                        >
                            {/* Phone Mockup */}
                            <div className="shrink-0 relative">
                                <div className="w-[280px] h-[580px] bg-black rounded-[50px] p-4 shadow-2xl relative border-[6px] border-gray-800 outline outline-2 outline-gray-700">
                                    {/* Dynamic Island */}
                                    <div className="absolute top-8 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-20"></div>

                                    {/* Screen Content */}
                                    <div className="bg-white w-full h-full rounded-[38px] overflow-hidden relative border border-gray-200">
                                        <Image
                                            src={screen.image}
                                            alt={screen.title}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>

                                    {/* Buttons */}
                                    <div className="absolute top-24 -left-2 w-1.5 h-12 bg-gray-800 rounded-l-md"></div>
                                    <div className="absolute top-40 -left-2 w-1.5 h-16 bg-gray-800 rounded-l-md"></div>
                                    <div className="absolute top-40 -right-2 w-1.5 h-20 bg-gray-800 rounded-r-md"></div>
                                </div>

                                {/* Floating Glow */}
                                <div className="absolute -inset-4 bg-brand-green/20 blur-3xl -z-10 rounded-full"></div>
                            </div>

                            <div className="text-center md:text-left max-w-sm">
                                <div className="inline-block px-4 py-1.5 bg-brand-orange/10 rounded-full mb-4">
                                    <span className="text-brand-orange text-xs font-black uppercase tracking-widest">Mobile App Experience</span>
                                </div>
                                <h3 className="text-3xl font-black text-brand-green uppercase tracking-tight mb-4 leading-tight">{screen.title}</h3>
                                <p className="text-slate-text text-lg font-medium mb-6">
                                    {screen.description}
                                </p>
                                <ul className="space-y-3">
                                    {[
                                        "Responsive Layout",
                                        "Native Performance",
                                        "Islamic Aesthetics"
                                    ].map((feat, fIdx) => (
                                        <li key={fIdx} className="flex items-center gap-3 text-brand-green font-bold">
                                            <div className="w-5 h-5 rounded-full bg-brand-green/10 flex items-center justify-center">
                                                <div className="w-2 h-2 rounded-full bg-brand-orange" />
                                            </div>
                                            {feat}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default DashboardShowcase;
