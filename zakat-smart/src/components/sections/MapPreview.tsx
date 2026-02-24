'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Info } from 'lucide-react';

const MapPreview = () => {
    const locations = [
        { id: 1, x: '35%', y: '25%', name: 'Central Mosque Accra' },
        { id: 2, x: '55%', y: '50%', name: 'Islamic Center Lagos' },
        { id: 3, x: '45%', y: '65%', name: 'Local Alms House' },
        { id: 4, x: '25%', y: '45%', name: 'Community Center Kumasi' },
    ];

    return (
        <div className="w-full h-full min-h-[400px] bg-[#F9FAF7] rounded-3xl relative overflow-hidden group" id="map">
            {/* Minimalist Grid Pattern */}
            <div className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(#primary-midnight 1px, transparent 1px), linear-gradient(90deg, #primary-midnight 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}>
            </div>

            {/* Dynamic Markers */}
            <div className="absolute inset-0">
                {locations.map((loc) => (
                    <motion.div
                        key={loc.id}
                        initial={{ scale: 0, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        transition={{
                            type: 'spring',
                            stiffness: 260,
                            damping: 20,
                            delay: loc.id * 0.1
                        }}
                        style={{ left: loc.x, top: loc.y }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group/marker"
                    >
                        <div className="relative">
                            {/* Pulse Effect */}
                            <div className="absolute -inset-4 bg-[#B5E1A1]/30 rounded-full scale-0 group-hover/marker:scale-100 transition-transform duration-500"></div>

                            <div className="bg-white border-2 border-[#B5E1A1] p-1.5 rounded-full shadow-xl transition-all duration-300 group-hover/marker:bg-[#B5E1A1] group-hover/marker:scale-110">
                                <MapPin size={18} className="text-primary-midnight" />
                            </div>

                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-primary-midnight text-white px-4 py-2 rounded-xl shadow-2xl whitespace-nowrap opacity-0 translate-y-2 group-hover/marker:opacity-100 group-hover/marker:translate-y-0 transition-all duration-300 pointer-events-none z-50">
                                <span className="text-[11px] font-black uppercase tracking-widest">{loc.name}</span>
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-primary-midnight"></div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Premium Dashboard UI Overlays */}
            <div className="absolute top-6 left-6 z-20">
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    className="p-1 rounded-2xl bg-white shadow-2xl border border-primary-midnight/5 flex flex-col gap-1"
                >
                    <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#B5E1A1] text-primary-midnight shadow-lg shadow-[#B5E1A1]/20 group/nav">
                        <Navigation size={18} className="group-hover/nav:rotate-45 transition-transform" />
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-xl text-primary-midnight/40 hover:text-primary-midnight transition-colors">
                        <Info size={18} />
                    </button>
                </motion.div>
            </div>

            <div className="absolute bottom-6 left-6 z-20">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    className="bg-primary-midnight/90 backdrop-blur-xl p-5 rounded-[1.8rem] shadow-2xl border border-white/5 max-w-[240px]"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-3 h-3 bg-[#B5E1A1] rounded-full animate-pulse shadow-[0_0_12px_rgba(181,225,161,0.5)]"></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#B5E1A1]">Live Node Status</span>
                    </div>
                    <p className="text-[12px] font-medium text-white/50 leading-relaxed italic">
                        "Your Zakat, your neighborhood. Discover verified local verified mosques in 10ms."
                    </p>
                </motion.div>
            </div>

            {/* Decorative Vignette */}
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.02)]"></div>
        </div>
    );
};

export default MapPreview;
