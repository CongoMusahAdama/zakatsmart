'use client';

import React from 'react';
import Image from 'next/image';
import { Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ScrollReveal } from '../ui/ScrollReveal';

const triptychImages = [
    {
        src: "/reading.png",
        alt: "Student reading",
        className: "flex-1 relative rounded-full overflow-hidden",
        style: { height: '80%', marginTop: '10%' },
        initial: { opacity: 0, y: 20 },
    },
    {
        src: "/mosque.png",
        alt: "Community gathering",
        className: "flex-1 relative rounded-full overflow-hidden",
        style: { height: '100%' },
        initial: { opacity: 0, y: -20 },
    },
    {
        src: "/female.png",
        alt: "Female empowerment",
        className: "flex-1 relative rounded-full overflow-hidden",
        style: { height: '80%', marginTop: '10%' },
        initial: { opacity: 0, y: 20 },
    },
];

const Intro = () => {
    return (
        <section className="py-24 bg-white overflow-hidden" id="about">
            <div className="max-w-7xl mx-auto px-6 md:px-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    {/* Left Side: Masked Image Triptych */}
                    <div className="relative h-[500px] flex items-center justify-center">
                        <div className="relative w-full h-full flex gap-4">
                            {triptychImages.map((img, i) => (
                                <motion.div
                                    key={i}
                                    initial={img.initial}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: i * 0.15 }}
                                    className={img.className}
                                    style={img.style}
                                >
                                    <Image
                                        src={img.src}
                                        alt={img.alt}
                                        fill
                                        className="object-cover hover:scale-110 transition-transform duration-700"
                                    />
                                </motion.div>
                            ))}
                        </div>

                        {/* Floating stat badge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.65 }}
                            className="absolute -bottom-4 right-4 bg-brand-green text-white rounded-2xl px-5 py-4 shadow-xl z-10"
                        >
                            <div className="text-2xl font-black leading-none">250K+</div>
                            <div className="text-xs font-semibold text-white/70 mt-1">Lives Impacted</div>
                        </motion.div>
                    </div>

                    {/* Right Side: Content */}
                    <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-6">
                        <ScrollReveal direction="right">
                            <span className="text-brand-orange font-bold text-sm tracking-widest uppercase mb-4 block">
                                Welcome To Zakat Smart
                            </span>
                        </ScrollReveal>

                        <ScrollReveal direction="right" delay={0.1}>
                            <h2 className="text-4xl md:text-5xl font-extrabold text-[#1a1a1a] leading-tight mb-2">
                                You&apos;re the Hope of Others
                            </h2>
                            <div className="text-sm md:text-base font-arabic text-brand-green/40 mb-6 font-medium w-full text-left tracking-wide">
                                أنت أمل الآخرين
                            </div>
                        </ScrollReveal>

                        <ScrollReveal direction="right" delay={0.2}>
                            <p className="text-gray-500 text-sm md:text-base leading-relaxed mb-8 font-medium">
                                This Ramadan, give with certainty and trust. Calculate your zakat correctly, connect with verified local charities across West Africa, and donate securely — all in one simple platform built for our communities.
                            </p>
                        </ScrollReveal>

                        <ScrollReveal direction="right" delay={0.3}>
                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8">
                                <a
                                    href="https://docs.google.com/forms/d/e/1FAIpQLSc_-0wNEMvGI_KdOs08IfaVOgaI4g3CfOaIGSn-tZKR3scnfw/viewform?usp=publish-editor"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-brand-orange hover:bg-brand-orange-hover text-white px-8 py-4 rounded-md font-bold text-xs uppercase tracking-widest transition-all shadow-md active:scale-95 flex items-center justify-center"
                                >
                                    Join Waitlist
                                </a>

                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-brand-orange">
                                        <Phone size={20} fill="currentColor" />
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-gray-400 text-xs font-semibold">Call Us:</span>
                                        <span className="text-[#1a1a1a] font-bold">0531878243</span>
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

export default Intro;
