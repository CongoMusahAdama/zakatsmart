'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, HelpCircle, MessageCircle, Mail, Phone } from 'lucide-react';
import { ScrollReveal } from '../ui/ScrollReveal';
import { cn } from '@/lib/utils';

const faqs = [
    {
        q: "What is the correct Niyyah (intention) for automated Zakat?",
        a: "The Niyyah should be formed at the moment you authorize the payment. Our platform provides a short prompt during the checkout process to help you focus your intention before the transaction is processed."
    },
    {
        q: "How do you verify local mosques and charities?",
        a: "Every organization on our 'Local Giving Map' undergoes a rigorous 3-step verification process: legal registration check, board member screening, and on-site field verification by our regional ambassadors."
    },
    {
        q: "Is my financial data kept private?",
        a: "Absolutely. We use bank-grade encryption and never store your full payment details on our servers. You also have the 'Anonymous' option to hide your identity from the recipient organization."
    },
    {
        q: "Can I use local West African currencies like GHS or NGN?",
        a: "Yes! Our Smart Calculator automatically fetches the latest market rates and Nisab thresholds for GH₵, ₦, and other regional currencies to ensure your contribution is accurate."
    }
];

const FAQ = () => {
    const [activeIndex, setActiveIndex] = useState<number | null>(0);

    return (
        <section className="py-32 bg-[#F9FAF7] relative overflow-hidden" id="faq">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-brand-green/5 blur-[120px] -z-10 rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-1/3 h-full bg-brand-orange/5 blur-[120px] -z-10 rounded-full"></div>

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">

                    {/* Left Side: Header & Contact Info */}
                    <div className="lg:col-span-5 flex flex-col pt-4">
                        <ScrollReveal direction="left">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-green/10 rounded-full mb-8 border border-brand-green/20">
                                <HelpCircle size={14} className="text-brand-green" />
                                <span className="text-[11px] font-black uppercase tracking-[0.25em] text-brand-green">Common Questions</span>
                            </div>

                            <h2 className="text-4xl md:text-6xl font-black text-[#1a1a1a] leading-tight mb-2">
                                Answers for the <br />
                                <span className="text-brand-green">Faithful Giver.</span>
                            </h2>
                            <div className="text-sm md:text-base font-arabic text-brand-green/40 mb-8 font-medium tracking-wide">
                                إجابات للمعطي المخلص
                            </div>

                            <p className="text-gray-500 text-lg leading-relaxed mb-12 max-w-md font-medium">
                                Everything you need to know about navigating your charitable journey with Zakat Smart. Clear, concise, and scholar-approved.
                            </p>

                            {/* Contact Card */}
                            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-brand-green/5 border border-gray-100 flex flex-col gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-brand-orange/10 flex items-center justify-center text-brand-orange">
                                        <MessageCircle size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[#1a1a1a]">Still have questions?</h4>
                                        <p className="text-xs text-gray-400 font-semibold tracking-wider uppercase">We're here to help</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <a href="mailto:support@zakatsmart.org" className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-brand-green/10 transition-colors group">
                                        <Mail size={18} className="text-brand-green transition-transform group-hover:scale-110" />
                                        <span className="font-bold text-[#1a1a1a] text-sm">support@zakatsmart.org</span>
                                    </a>
                                    <a href="tel:0531878243" className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-brand-orange/10 transition-colors group">
                                        <Phone size={18} className="text-brand-orange transition-transform group-hover:scale-110" />
                                        <span className="font-bold text-[#1a1a1a] text-sm">0531878243</span>
                                    </a>
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>

                    {/* Right Side: Accordion */}
                    <div className="lg:col-span-7 flex flex-col gap-4">
                        {faqs.map((faq, idx) => (
                            <ScrollReveal key={idx} direction="up" delay={idx * 0.1}>
                                <motion.div
                                    className={cn(
                                        "group rounded-[2rem] border transition-all duration-500 overflow-hidden",
                                        activeIndex === idx
                                            ? "border-brand-green/20 bg-white shadow-2xl shadow-brand-green/10"
                                            : "border-gray-200/60 bg-white/50 hover:border-brand-green/30"
                                    )}
                                >
                                    <button
                                        onClick={() => setActiveIndex(activeIndex === idx ? null : idx)}
                                        className="w-full text-left p-8 md:p-10 flex items-center justify-between gap-6"
                                    >
                                        <span className={cn(
                                            "font-black text-xl md:text-2xl tracking-tight transition-all duration-500",
                                            activeIndex === idx ? "text-brand-green" : "text-[#1a1a1a]"
                                        )}>
                                            {faq.q}
                                        </span>
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shrink-0",
                                            activeIndex === idx
                                                ? "bg-brand-green text-white rotate-180"
                                                : "bg-gray-100 text-[#1a1a1a] group-hover:bg-brand-green/10"
                                        )}>
                                            {activeIndex === idx ? <Minus size={22} strokeWidth={3} /> : <Plus size={22} strokeWidth={3} />}
                                        </div>
                                    </button>

                                    <AnimatePresence>
                                        {activeIndex === idx && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                            >
                                                <div className="px-8 md:px-10 pb-10">
                                                    <div className="h-[2px] w-12 bg-brand-orange mb-8 opacity-50"></div>
                                                    <p className="text-gray-500 text-lg md:text-xl leading-relaxed font-medium">
                                                        {faq.a}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            </ScrollReveal>
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
};

export default FAQ;

