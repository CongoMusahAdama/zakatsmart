'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const SplashScreen = () => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Show splash for 2.5 seconds
        const timer = setTimeout(() => {
            setIsVisible(false);
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{
                        opacity: 0,
                        transition: { duration: 0.8, ease: "easeInOut" }
                    }}
                    className="fixed inset-0 z-[200] bg-brand-green flex flex-col items-center justify-center lg:hidden"
                >
                    {/* Centered Content Container */}
                    <div className="flex flex-col items-center justify-center gap-12 w-full px-6">
                        {/* Logo Container with soft glow */}
                        <div className="relative">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="relative w-48 h-48 z-10"
                            >
                                <Image
                                    src="/zakat logo.png"
                                    alt="Zakat Smart Logo"
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </motion.div>
                            {/* Subtle Pulse Glow */}
                            <motion.div
                                animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute inset-0 bg-white/20 blur-3xl rounded-full -z-0"
                            />
                        </div>

                        {/* Greeting Text - Perfectly Centered */}
                        <div className="flex flex-col items-center text-center gap-4">
                            <motion.h2
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5, duration: 0.8 }}
                                className="text-white font-black text-3xl md:text-4xl tracking-tight font-outfit uppercase"
                            >
                                Assalamu Alaikum
                            </motion.h2>
                            <motion.span
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.7, duration: 0.8 }}
                                className="text-brand-orange font-arabic text-3xl"
                                dir="rtl"
                            >
                                السلام عليكم
                            </motion.span>
                        </div>
                    </div>

                    {/* Progress Bar - Moved slightly up from edge */}
                    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: "0%" }}
                            transition={{ duration: 2.5, ease: "linear" }}
                            className="w-full h-full bg-brand-orange shadow-[0_0_8px_rgba(247,163,0,0.5)]"
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SplashScreen;
