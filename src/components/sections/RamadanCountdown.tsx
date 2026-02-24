'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Moon, ArrowRight, X } from 'lucide-react';

const RamadanCountdown = () => {
    const [isVisible, setIsVisible] = useState(true);

    const [timeLeft, setTimeLeft] = useState({
        days: 27,
        hours: 14,
        minutes: 42,
        seconds: 0
    });

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
                if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
                if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
                if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
                return prev;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    if (!isVisible) return null;

    return (
        <div className="relative z-[100] w-full bg-brand-green py-3 overflow-hidden">
            {/* Decorative glow */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/2 left-20 -translate-y-1/2 w-40 h-8 bg-brand-orange/30 rounded-full blur-[40px]"></div>
                <div className="absolute top-1/2 right-40 -translate-y-1/2 w-48 h-8 bg-white/10 rounded-full blur-[40px]"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-white/15 rounded-full flex items-center justify-center">
                        <Moon className="text-brand-orange w-4 h-4 fill-brand-orange/40" />
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-brand-orange uppercase tracking-widest">Ramadan Kareem</span>
                        <span className="text-white/30 text-xs hidden sm:inline">·</span>
                        <p className="text-sm font-medium text-white hidden sm:block">
                            Day <span className="text-brand-orange font-bold">3 of 30</span> <span className="text-white/40 mx-2">|</span> <span className="text-brand-orange font-bold">{timeLeft.days} Days</span> Remaining
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {/* Countdown */}
                    <div className="hidden lg:flex items-center gap-5">
                        {[
                            { label: 'Days', value: timeLeft.days },
                            { label: 'Hrs', value: timeLeft.hours },
                            { label: 'Min', value: timeLeft.minutes },
                            { label: 'Sec', value: timeLeft.seconds }
                        ].map((item, i) => (
                            <div key={item.label} className="flex flex-col items-center">
                                <div className="text-base font-black text-white tabular-nums leading-none mb-0.5">
                                    {String(item.value).padStart(2, '0')}
                                </div>
                                <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider">{item.label}</span>
                            </div>
                        ))}
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-5 py-2 bg-brand-orange hover:bg-brand-orange-hover rounded-md text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-md transition-colors"
                    >
                        Give Now
                        <ArrowRight size={13} />
                    </motion.button>

                    <button
                        onClick={() => setIsVisible(false)}
                        className="text-white/30 hover:text-white transition-colors"
                    >
                        <X size={15} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RamadanCountdown;

