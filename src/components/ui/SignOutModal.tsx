"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, X } from "lucide-react";
import Image from "next/image";

interface SignOutModalProps {
    isOpen: boolean;
    onCancel: () => void;
    onConfirm: () => void;
    loading: boolean;
}

export default function SignOutModal({ isOpen, onCancel, onConfirm, loading }: SignOutModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={!loading ? onCancel : undefined}
                        className="fixed inset-0 bg-black/50 backdrop-blur-md z-[100]"
                    />

                    {/* Modal */}
                    <motion.div
                        key="modal"
                        initial={{ opacity: 0, scale: 0.88, y: 24 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 16 }}
                        transition={{ type: "spring", stiffness: 340, damping: 26 }}
                        className="fixed inset-0 z-[101] flex items-center justify-center px-4"
                    >
                        <div className="w-full max-w-sm bg-white overflow-hidden shadow-2xl shadow-brand-green/20"
                            style={{ borderRadius: '24px' }}>

                            {/* ── Hero band ── */}
                            <div className="relative bg-brand-green pt-10 pb-14 px-8 flex flex-col items-center text-center overflow-hidden">
                                {/* subtle rings */}
                                <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
                                <div className="absolute -bottom-14 -left-8 w-56 h-56 rounded-full bg-white/5 pointer-events-none" />

                                {/* Logo */}
                                <div className="relative w-14 h-14 mb-5 z-10">
                                    <Image src="/zakat logo.png" alt="ZakatAid" fill className="object-contain" />
                                </div>

                                {/* Headline */}
                                <h2 className="text-white font-black text-2xl tracking-tight z-10"
                                    style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.04em' }}>
                                    Leaving so soon?
                                </h2>
                                <p className="text-white/60 text-sm mt-2 leading-relaxed z-10 max-w-[220px]">
                                    You'll need to sign back in to access your ZakatAid dashboard.
                                </p>
                            </div>

                            {/* ── Icon bridge ── */}
                            <div className="relative flex justify-center" style={{ marginTop: '-28px' }}>
                                <div className="w-14 h-14 rounded-full bg-brand-orange flex items-center justify-center shadow-xl shadow-brand-orange/30 border-4 border-white z-10">
                                    <LogOut size={22} className="text-white" />
                                </div>
                            </div>

                            {/* ── Actions ── */}
                            <div className="px-7 pt-6 pb-8 flex flex-col gap-3">
                                <button
                                    onClick={onConfirm}
                                    disabled={loading}
                                    id="signout-confirm-btn"
                                    className="w-full text-white font-black py-4 uppercase text-xs tracking-widest shadow-lg transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    style={{
                                        borderRadius: '14px',
                                        background: 'linear-gradient(135deg, #005C46 0%, #007a5e 100%)',
                                        boxShadow: '0 8px 24px -6px rgba(0,92,70,0.35)',
                                    }}
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                            </svg>
                                            Signing out…
                                        </>
                                    ) : (
                                        <><LogOut size={15} /> Yes, Sign Me Out</>
                                    )}
                                </button>

                                <button
                                    onClick={onCancel}
                                    disabled={loading}
                                    id="signout-cancel-btn"
                                    className="w-full font-black py-3.5 uppercase text-xs tracking-widest transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 border border-gray-100 text-slate-400 hover:bg-gray-50 hover:text-brand-green"
                                    style={{ borderRadius: '14px' }}
                                >
                                    <X size={14} /> Stay on Dashboard
                                </button>
                            </div>

                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
