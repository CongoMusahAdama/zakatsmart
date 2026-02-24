'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ScrollReveal } from '../ui/ScrollReveal';

const partners = [
    { name: 'Dilads', logo: '/dilads.png' },
    { name: 'AgriLync', logo: '/agrilync.jpg' },
];

const Partners = () => {
    return (
        <section className="py-12 bg-white border-y border-gray-50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 mb-8 text-center flex flex-col items-center">
                <ScrollReveal direction="up">
                    <span className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em]">Our Trusted Partners</span>
                    <div
                        className="text-sm md:text-base font-arabic text-brand-green/30 mt-2 tracking-wide font-medium"
                    >
                        شركاؤنا الموثوقون
                    </div>
                </ScrollReveal>
            </div>

            <div className="max-w-4xl mx-auto px-6">
                <div className="flex items-center justify-center gap-8 sm:gap-16 md:gap-32">
                    {partners.map((partner, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.2 }}
                            className="relative w-40 h-20 md:w-56 md:h-28 flex items-center justify-center filter-none opacity-100"
                        >
                            <Image
                                src={partner.logo}
                                alt={partner.name}
                                fill
                                className="object-contain"
                            />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Partners;
