import React from 'react';
import { Instagram, Twitter, Facebook, Youtube, Heart, Mail, Phone, MapPin } from 'lucide-react';
import Image from 'next/image';

const Footer = () => {
    return (
        <footer className="bg-[#003D2E] pt-20 pb-10 px-6 relative overflow-hidden">
            {/* Subtle top glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-brand-orange/40 to-transparent"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">

                    {/* Brand Column */}
                    <div className="col-span-1">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="relative w-10 h-10">
                                <Image
                                    src="/zakat logo.png"
                                    alt="Zakat Smart Logo"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <span className="font-bold text-2xl tracking-tight text-white">
                                Zakat<span className="text-brand-orange">Smart</span>
                            </span>
                        </div>
                        <p className="text-white/50 text-sm font-medium leading-relaxed mb-8">
                            Empowering the Ummah through certified technology-driven giving and radical local transparency.
                        </p>
                        <div className="flex gap-3">
                            {[Facebook, Twitter, Instagram, Youtube].map((Icon, idx) => (
                                <div key={idx} className="w-9 h-9 bg-white/10 hover:bg-brand-orange transition-all rounded-full flex items-center justify-center text-white/60 hover:text-white cursor-pointer">
                                    <Icon size={16} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-xs text-white/40">Quick Links</h4>
                        <ul className="space-y-4 text-white/60 text-sm font-medium">
                            <li><a href="#" className="hover:text-brand-orange hover:pl-2 transition-all duration-200 block">About Us</a></li>
                            <li><a href="#trust" className="hover:text-brand-orange hover:pl-2 transition-all duration-200 block">Security & Trust</a></li>
                            <li><a href="#faq" className="hover:text-brand-orange hover:pl-2 transition-all duration-200 block">Support Center</a></li>
                            <li><a href="#" className="hover:text-brand-orange hover:pl-2 transition-all duration-200 block">Our Impact</a></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-xs text-white/40">Contact Us</h4>
                        <ul className="space-y-4 text-white/60 text-sm font-medium">
                            <li className="flex items-center gap-3">
                                <Mail size={14} className="text-brand-orange shrink-0" />
                                <span>info@zakatsmart.org</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone size={14} className="text-brand-orange shrink-0" />
                                <span>0531878243</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <MapPin size={14} className="text-brand-orange shrink-0 mt-0.5" />
                                <span>Accra, Ghana, West Africa</span>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-xs text-white/40">Newsletter</h4>
                        <p className="text-white/50 text-sm font-medium mb-6 leading-relaxed">
                            Stay updated with our local impact reports and insights.
                        </p>
                        <div className="relative">
                            <input
                                type="email"
                                placeholder="Your email address"
                                className="w-full bg-white/10 border border-white/10 rounded-full px-5 py-3 text-white text-sm focus:outline-none focus:border-brand-orange/60 transition-all placeholder:text-white/30"
                            />
                            <button className="absolute right-1.5 top-1.5 bottom-1.5 bg-brand-orange text-white px-5 rounded-full text-xs font-bold hover:bg-brand-orange-hover transition-all active:scale-95">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between pt-10 border-t border-white/10 gap-6">
                    <p className="text-white/30 text-xs font-medium">
                        © 2026 Zakat Smart. All rights reserved. Built for the global Ummah.
                    </p>
                    <div className="flex items-center gap-2 text-white/30 text-xs font-medium">
                        Built with <Heart size={11} className="text-brand-orange animate-pulse" /> by the Zakat Smart Tech Team
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

