'use client';

import React from 'react';
import Image from 'next/image';
import { Quote } from 'lucide-react';
import { motion } from 'framer-motion';

const testimonials = [
    {
        quote: "They are the best agents for non profit activities. I love their work so much, thanks a lot for they help me when it's needed.",
        author: "Elizabeth Jane",
        role: "Founder of CORE",
        avatar: "https://i.pravatar.cc/150?img=32"
    },
    {
        quote: "They are the best agents for non profit activities. I love their work so much, thanks a lot for they help me when it's needed.",
        author: "Dilan Manset",
        role: "UI/UX Designer",
        avatar: "https://i.pravatar.cc/150?img=12"
    },
    {
        quote: "They are the best agents for non profit activities. I love their work so much, thanks a lot for they help me when it's needed.",
        author: "Albert Flores",
        role: "Business Manager",
        avatar: "https://i.pravatar.cc/150?img=54"
    }
];

const Testimonials = () => {
    return (
        <section className="py-24 bg-[#FAF9F6]">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-8 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-16 h-16 bg-brand-orange/5 flex items-center justify-center rounded-bl-3xl">
                                <Quote size={24} className="text-brand-orange opacity-40" />
                            </div>

                            <p className="text-gray-500 text-sm leading-relaxed relative z-10 italic">
                                "{t.quote}"
                            </p>

                            <div className="flex items-center gap-4 border-t border-gray-50 pt-6">
                                <div className="relative w-12 h-12 rounded-full overflow-hidden grayscale hover:grayscale-0 transition-all cursor-pointer">
                                    <Image
                                        src={t.avatar}
                                        alt={t.author}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-[#1a1a1a] text-sm">{t.author}</span>
                                    <span className="text-gray-400 text-xs font-medium">{t.role}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
