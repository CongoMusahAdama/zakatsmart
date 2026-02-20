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
                    {/* Spinning Logo Container */}
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{
                            scale: 1,
                            opacity: 1,
                            rotate: 360
                        }}
                        transition={{
                            scale: { duration: 0.5 },
                            opacity: { duration: 0.5 },
                            rotate: {
                                duration: 4,
                                ease: "linear",
                                repeat: Infinity
                            }
                        }}
                        className="relative w-32 h-32 mb-10"
                    >
                        <Image
                            src="/zakat logo.png"
                            alt="Zakat Smart Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </motion.div>

                    {/* Greeting Text */}
                    <div className="flex flex-col items-center gap-2">
                        <motion.h2
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                            className="text-white font-bold text-2xl tracking-tight"
                        >
                            Assalamu Alaikum
                        </motion.h2>
                        <motion.span
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.6 }}
                            className="text-brand-orange font-arabic text-xl"
                        >
                            السلام عليكم
                        </motion.span>
                    </div>

                    {/* Progress Bar */}
                    <div className="absolute bottom-12 w-32 h-1 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: "0%" }}
                            transition={{ duration: 2.5, ease: "linear" }}
                            className="w-full h-full bg-brand-orange"
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SplashScreen;
