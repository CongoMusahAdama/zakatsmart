'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader2, KeyRound, ShieldCheck } from 'lucide-react';
import { authApi, ApiError } from '@/lib/api';
import Swal from 'sweetalert2';

// ── Inner component (needs useSearchParams inside Suspense) ───────────────────
function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token') ?? '';

    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [showCf, setShowCf] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [tokenBad, setTokenBad] = useState(false);

    useEffect(() => {
        if (!token) setTokenBad(true);
    }, [token]);

    // ── password strength ──────────────────────────────────────────────────────
    const strength = (() => {
        let s = 0;
        if (password.length >= 8) s++;
        if (/[A-Z]/.test(password)) s++;
        if (/[0-9]/.test(password)) s++;
        if (/[^A-Za-z0-9]/.test(password)) s++;
        return s; // 0-4
    })();
    const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
    const strengthColor = ['', '#ef4444', '#f59e0b', '#3b82f6', '#005C46'][strength];

    // ── submit ─────────────────────────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < 8) {
            setError('Password must be at least 8 characters.'); return;
        }
        if (password !== confirm) {
            setError('Passwords do not match.'); return;
        }

        setLoading(true);
        try {
            await authApi.resetPassword(token, password);

            await Swal.fire({
                html: `
                  <div style="font-family:'Inter',sans-serif;text-align:center;padding:0">
                    <div style="background:linear-gradient(135deg,#005C46 0%,#007a5e 100%);margin:-1px -1px 0;padding:28px 24px 36px;position:relative;overflow:hidden">
                      <div style="position:absolute;top:-20px;right:-20px;width:110px;height:110px;background:rgba(255,255,255,0.05);border-radius:50%"></div>
                      <img src="/zakat logo.png" width="48" height="48" style="object-fit:contain;margin-bottom:10px;position:relative;z-index:1" />
                      <div style="color:rgba(255,255,255,0.6);font-size:11px;font-weight:700;letter-spacing:0.25em;text-transform:uppercase;position:relative;z-index:1">ZakatAid</div>
                    </div>
                    <div style="margin-top:-22px;display:flex;justify-content:center;margin-bottom:14px">
                      <div style="width:44px;height:44px;border-radius:50%;background:#F7A300;border:4px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 20px rgba(247,163,0,0.35);font-size:20px">🔐</div>
                    </div>
                    <div style="padding:0 24px 8px">
                      <p style="color:rgba(0,92,70,0.6);font-size:11px;font-weight:800;letter-spacing:0.25em;text-transform:uppercase;margin:0 0 6px">Success</p>
                      <h2 style="margin:0 0 6px;font-family:'Outfit',sans-serif;font-size:1.5rem;font-weight:900;color:#111;letter-spacing:-0.04em;line-height:1.1">Password Reset!</h2>
                      <p style="color:#aaa;font-size:12px;margin:0">You can now sign in with your new password.</p>
                    </div>
                    <div style="margin:14px 24px 4px;padding:12px 16px;background:#F0F7F5;border-radius:12px">
                      <p style="margin:0;color:#005C46;font-size:15px;direction:rtl;font-weight:600">الْحَمْدُ لِلَّه</p>
                      <p style="margin:4px 0 0;color:#888;font-size:11px;font-weight:500">All praise be to Allah</p>
                    </div>
                  </div>`,
                timer: 2800,
                timerProgressBar: true,
                showConfirmButton: false,
                background: '#ffffff',
                padding: 0,
                customClass: {
                    popup: 'swal-zakat-popup',
                    timerProgressBar: 'swal-zakat-bar',
                },
            });

            router.push('/auth');
        } catch (err) {
            setError(err instanceof ApiError ? err.message : 'Reset failed. The link may have expired.');
        } finally {
            setLoading(false);
        }
    };

    // ── bad / missing token state ──────────────────────────────────────────────
    if (tokenBad) {
        return (
            <div className="text-center max-w-sm">
                <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5">
                    <AlertCircle size={28} className="text-red-400" />
                </div>
                <h1 className="text-2xl font-black text-[#111] mb-2 uppercase tracking-tight">Invalid Link</h1>
                <p className="text-gray-400 text-sm mb-8">
                    This password reset link is missing or invalid. Please request a new one.
                </p>
                <button
                    onClick={() => router.push('/auth')}
                    className="bg-brand-green text-white font-black py-4 px-8 rounded-2xl uppercase text-xs tracking-widest hover:bg-brand-green-hover transition-all active:scale-95"
                >
                    Back to Sign In
                </button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md">
            {/* Header */}
            <div className="mb-10 text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-brand-green/10 flex items-center justify-center mb-5">
                    <ShieldCheck size={28} className="text-brand-green" />
                </div>
                <h1 className="text-3xl font-black text-[#111] mb-2 uppercase tracking-tight">New Password</h1>
                <p className="text-gray-400 text-sm font-medium max-w-[260px]">
                    Choose a strong password to secure your ZakatAid account.
                </p>
            </div>

            {/* Error banner */}
            {error && (
                <div className="mb-6 bg-red-50 border border-red-100 rounded-xl p-3 flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle size={15} className="shrink-0" /> {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* New password */}
                <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1 block mb-1.5">
                        New Password
                    </label>
                    <div className="relative group">
                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-brand-green transition-colors" size={16} />
                        <input
                            type={showPw ? 'text' : 'password'}
                            id="new-password"
                            placeholder="At least 8 characters"
                            value={password}
                            onChange={e => { setPassword(e.target.value); setError(''); }}
                            className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-[1.125rem] pl-14 pr-12 text-sm font-semibold outline-none focus:ring-4 focus:ring-brand-green/5 focus:border-brand-green/20 transition-all"
                        />
                        <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300">
                            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>

                    {/* Strength bar */}
                    {password && (
                        <div className="mt-2 px-1">
                            <div className="flex gap-1 mb-1">
                                {[1, 2, 3, 4].map(n => (
                                    <div key={n} className="h-1 flex-1 rounded-full transition-all" style={{ background: n <= strength ? strengthColor : '#e5e7eb' }} />
                                ))}
                            </div>
                            <p className="text-[10px] font-bold" style={{ color: strengthColor }}>{strengthLabel}</p>
                        </div>
                    )}
                </div>

                {/* Confirm password */}
                <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1 block mb-1.5">
                        Confirm Password
                    </label>
                    <div className="relative group">
                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-brand-green transition-colors" size={16} />
                        <input
                            type={showCf ? 'text' : 'password'}
                            id="confirm-password"
                            placeholder="Repeat new password"
                            value={confirm}
                            onChange={e => { setConfirm(e.target.value); setError(''); }}
                            className={`w-full bg-gray-50/50 border rounded-2xl py-[1.125rem] pl-14 pr-12 text-sm font-semibold outline-none focus:ring-4 focus:ring-brand-green/5 transition-all ${confirm && confirm !== password ? 'border-red-200 focus:border-red-300' :
                                    confirm && confirm === password ? 'border-brand-green/30 focus:border-brand-green/40' :
                                        'border-gray-100 focus:border-brand-green/20'
                                }`}
                        />
                        <button type="button" onClick={() => setShowCf(!showCf)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300">
                            {showCf ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        {confirm && confirm === password && (
                            <CheckCircle size={16} className="absolute right-10 top-1/2 -translate-y-1/2 text-brand-green" />
                        )}
                    </div>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-brand-green text-white font-black py-[1.125rem] rounded-2xl shadow-xl shadow-brand-green/10 uppercase text-xs tracking-widest mt-2 hover:bg-brand-green-hover transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading
                        ? <><Loader2 size={16} className="animate-spin" /> Resetting…</>
                        : <><KeyRound size={14} /> Reset My Password</>
                    }
                </button>
            </form>
        </div>
    );
}

// ── Page wrapper ─────────────────────────────────────────────────────────────
export default function ResetPasswordPage() {
    return (
        <main className="min-h-screen bg-[#F0F7F6] flex flex-col font-body">
            {/* Top bar */}
            <header className="flex items-center gap-3 px-8 py-5 bg-white border-b border-gray-100">
                <div className="relative w-9 h-9">
                    <Image src="/zakat logo.png" alt="ZakatAid" fill className="object-contain" />
                </div>
                <span className="font-black text-brand-green text-lg tracking-tight">ZakatAid</span>
            </header>

            {/* Content */}
            <div className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md bg-white rounded-[28px] shadow-2xl shadow-brand-green/5 p-10 border border-gray-100">
                    <Suspense fallback={
                        <div className="flex items-center justify-center py-20">
                            <Loader2 size={28} className="animate-spin text-brand-green" />
                        </div>
                    }>
                        <ResetPasswordForm />
                    </Suspense>
                </div>
            </div>

            {/* Footer */}
            <footer className="text-center py-4 text-xs text-gray-300 font-medium">
                © {new Date().getFullYear()} ZakatAid · Transparent Giving
            </footer>
        </main>
    );
}
