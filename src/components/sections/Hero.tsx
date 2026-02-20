'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

const Hero = () => {
    return (
        <section className="relative h-screen flex items-center justify-start pt-32 pb-20 overflow-hidden">
            {/* Background Image Layer */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/image.png"
                    alt="Zakat Aid Community"
                    fill
                    className="object-cover object-center select-none pointer-events-none"
                    priority
                />

                {/* Overlay to ensure text readability */}
                <div className="absolute inset-0 bg-black/40 z-10"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent z-10"></div>
            </div>

            <div className="container mx-auto px-6 z-20 relative text-white">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="max-w-2xl flex flex-col items-center lg:items-start text-center lg:text-left mx-auto lg:mx-0"
                >
                    <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold leading-[1.2] mb-6 md:mb-8 tracking-tight">
                        Calculate Your Zakat.<br />
                        <span className="text-brand-orange">Give With Confidence.</span>
                    </h1>

                    <p className="text-white/90 text-sm sm:text-base md:text-lg font-medium mb-16 md:mb-20 leading-relaxed max-w-lg">
                        A simple, trusted platform that helps you calculate zakat accurately and connect with verified local charities and mosques across West Africa — all in your local currency.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                        <a
                            href="https://docs.google.com/forms/d/e/1FAIpQLSc_-0wNEMvGI_KdOs08IfaVOgaI4g3CfOaIGSn-tZKR3scnfw/viewform?usp=publish-editor"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto bg-brand-orange hover:bg-brand-orange-hover text-white px-8 py-3.5 rounded-md font-bold text-xs md:text-sm uppercase tracking-[0.2em] transition-all shadow-2xl active:scale-95 flex items-center justify-center text-center"
                        >
                            Join Waitlist
                        </a>
                        <a
                            href="#features"
                            className="w-full sm:w-auto bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 px-8 py-3.5 rounded-md font-bold text-xs md:text-sm uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center justify-center"
                        >
                            Learn More
                        </a>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
