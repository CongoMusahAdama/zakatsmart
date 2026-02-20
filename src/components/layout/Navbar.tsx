'use client';

import React, { useState, useEffect } from 'react';
import { Menu, X, Mail, Phone, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'CALCULATE', href: '#calculate' },
        { name: 'ABOUT', href: '#about' },
        { name: 'HOW IT WORKS', href: '#how-it-works' },
        { name: 'TRUSTED CHARITIES', href: '#map' },
        { name: 'FAQ', href: '#faq' },
    ];

    return (
        <header className="relative w-full">
            {/* Top Info Bar - Visible only when scrolled or on mobile */}
            <div className={cn(
                "bg-brand-green text-white py-2 px-4 md:px-6 hidden md:block transition-all duration-500",
                isScrolled ? "opacity-100" : "opacity-0"
            )}>
                <div className="container mx-auto flex justify-between items-center text-xs font-medium">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <Mail size={14} className="text-brand-orange" />
                            <span>info@zakatsmart.org</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Phone size={14} className="text-brand-orange" />
                            <span>0531878243</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Facebook size={14} className="hover:text-brand-orange cursor-pointer" />
                        <Twitter size={14} className="hover:text-brand-orange cursor-pointer" />
                        <Instagram size={14} className="hover:text-brand-orange cursor-pointer" />
                        <Youtube size={14} className="hover:text-brand-orange cursor-pointer" />
                    </div>
                </div>
            </div>

            {/* Main Navbar */}
            <nav className={cn(
                "transition-all duration-500",
                isScrolled
                    ? "bg-white border-b border-gray-100 shadow-sm py-0"
                    : "bg-transparent py-4"
            )}>
                <div className="container mx-auto px-4 md:px-6 h-20 md:h-24 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10">
                            <Image
                                src="/zakat logo.png"
                                alt="Zakat Smart Logo"
                                fill
                                className="object-contain"
                            />
                        </div>
                        <span className={cn(
                            "font-bold text-2xl tracking-tight transition-colors duration-500",
                            isScrolled ? "text-[#1a1a1a]" : "text-white"
                        )}>
                            Zakat<span className="text-brand-green">Smart</span>
                        </span>
                    </div>

                    {/* Navigation - Center */}
                    <div className="hidden lg:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className={cn(
                                    "text-sm font-bold transition-all duration-500 tracking-wide hover:text-brand-green",
                                    isScrolled ? "text-[#1a1a1a]" : "text-white hover:text-brand-orange"
                                )}
                            >
                                {link.name}
                            </a>
                        ))}
                    </div>

                    {/* Right Side Tools */}
                    <div className="flex items-center gap-4">
                        <a
                            href="https://docs.google.com/forms/d/e/1FAIpQLSc_-0wNEMvGI_KdOs08IfaVOgaI4g3CfOaIGSn-tZKR3scnfw/viewform?usp=publish-editor"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-brand-orange hover:bg-brand-orange-hover text-white px-8 py-3 rounded-md font-bold text-xs uppercase transition-all hidden sm:block tracking-widest shadow-md active:scale-95"
                        >
                            Join Waitlist
                        </a>

                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className={cn(
                                "lg:hidden p-2 transition-colors duration-500",
                                isScrolled ? "text-[#1a1a1a]" : "text-white"
                            )}
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-xl p-6"
                    >
                        <div className="flex flex-col gap-4">
                            {navLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-lg font-bold text-[#1a1a1a] hover:text-brand-green py-2"
                                >
                                    {link.name}
                                </a>
                            ))}
                            <a
                                href="https://docs.google.com/forms/d/e/1FAIpQLSc_-0wNEMvGI_KdOs08IfaVOgaI4g3CfOaIGSn-tZKR3scnfw/viewform?usp=publish-editor"
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="bg-brand-orange text-white w-full py-4 rounded-md font-bold text-xs uppercase tracking-widest mt-4 flex items-center justify-center"
                            >
                                Join Waitlist
                            </a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Navbar;
