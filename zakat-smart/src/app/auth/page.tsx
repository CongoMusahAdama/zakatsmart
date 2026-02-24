'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mail, Lock, Eye, EyeOff, ArrowLeft,
    CheckCircle, AlertCircle, Loader2, Phone, KeyRound,
} from 'lucide-react';
import { ghanaLocations, countries, ageRanges, employmentStatuses } from '@/lib/data';
import { authApi, tokenStorage, userStorage, ApiError, RegisterPayload } from '@/lib/api';
import Swal from 'sweetalert2';

// ── small helpers ─────────────────────────────────────────────────────────────
const InputWrapper = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
    <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">{label}</label>
        {children}
        {error && (
            <p className="text-[11px] text-red-500 font-medium ml-1 flex items-center gap-1">
                <AlertCircle size={11} /> {error}
            </p>
        )}
    </div>
);

const FloatInput = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
    <div className="space-y-1.5 relative group mt-2">
        <div className="absolute -top-2.5 left-4 px-2 bg-white z-10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 group-focus-within:text-brand-green transition-colors">{label}</span>
        </div>
        {children}
        {error && (
            <p className="text-[11px] text-red-500 font-medium ml-1 flex items-center gap-1">
                <AlertCircle size={11} /> {error}
            </p>
        )}
    </div>
);

// ── OTP Verification Screen ───────────────────────────────────────────────────
function OTPScreen({
    userId, purpose, target, onSuccess,
}: {
    userId: string; purpose: string; target: string; onSuccess: () => void;
}) {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleVerify = async () => {
        if (otp.length !== 6) { setError('Enter the 6-digit code.'); return; }
        setLoading(true); setError('');
        try {
            await authApi.verifyOTP(userId, otp, purpose);
            setSuccess('Verified! Redirecting…');
            setTimeout(onSuccess, 800);
        } catch (e) {
            setError(e instanceof ApiError ? e.message : 'Verification failed.');
        } finally { setLoading(false); }
    };

    const handleResend = async () => {
        setResending(true); setError(''); setSuccess('');
        try {
            await authApi.resendOTP(userId, purpose);
            setSuccess('A new code has been sent!');
        } catch (e) {
            setError(e instanceof ApiError ? e.message : 'Could not resend.');
        } finally { setResending(false); }
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-14 text-center max-w-sm mx-auto w-full">
            <div className="w-16 h-16 rounded-full bg-brand-green/10 flex items-center justify-center mb-6">
                <Mail size={28} className="text-brand-green" />
            </div>
            <h2 className="text-2xl font-black text-[#111] mb-2 uppercase tracking-tight">Check your inbox</h2>
            <p className="text-gray-400 text-sm mb-8">
                We sent a 6-digit code to <strong className="text-[#111]">{target}</strong>
            </p>

            {/* OTP Digit Input */}
            <input
                type="text"
                maxLength={6}
                inputMode="numeric"
                value={otp}
                onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '')); setError(''); }}
                placeholder="○ ○ ○ ○ ○ ○"
                className="w-full text-center text-3xl font-black tracking-[0.5em] bg-gray-50 border border-gray-200 rounded-2xl py-5 outline-none focus:border-brand-green/40 focus:ring-4 focus:ring-brand-green/5 transition-all"
            />

            {error && (
                <div className="mt-4 w-full bg-red-50 border border-red-100 rounded-xl p-3 flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle size={16} className="shrink-0" /> {error}
                </div>
            )}
            {success && (
                <div className="mt-4 w-full bg-green-50 border border-green-100 rounded-xl p-3 flex items-center gap-2 text-green-700 text-sm">
                    <CheckCircle size={16} className="shrink-0" /> {success}
                </div>
            )}

            <button
                onClick={handleVerify}
                disabled={loading || otp.length !== 6}
                className="w-full mt-6 bg-brand-green text-white font-black py-4 rounded-2xl shadow-xl shadow-brand-green/10 uppercase text-xs tracking-widest hover:bg-brand-green-hover transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {loading ? <><Loader2 size={16} className="animate-spin" /> Verifying…</> : 'Verify Code'}
            </button>

            <button
                onClick={handleResend}
                disabled={resending}
                className="mt-4 text-brand-orange text-xs font-black uppercase tracking-widest hover:underline disabled:opacity-50"
            >
                {resending ? 'Resending…' : "Didn't receive it? Resend"}
            </button>
        </div>
    );
}

// ── Forgot Password Screen ──────────────────────────────────────────────────
function ForgotPasswordScreen({ onBack }: { onBack: () => void }) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) { setError('Please enter your email address.'); return; }
        setLoading(true); setError('');
        try {
            await authApi.forgotPassword(email);
            setSent(true);
        } catch (err) {
            setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
        } finally { setLoading(false); }
    };

    return (
        <div className="max-w-sm mx-auto w-full flex-1 flex flex-col justify-center">
            {/* Back */}
            <button onClick={onBack} className="flex items-center gap-2 text-gray-400 text-xs font-black uppercase tracking-widest hover:text-brand-green transition-colors mb-10 group">
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Sign In
            </button>

            {/* Header */}
            <div className="mb-10 text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-brand-green/10 flex items-center justify-center mb-5">
                    <KeyRound size={26} className="text-brand-green" />
                </div>
                <h1 className="text-3xl font-black text-[#111] mb-2 uppercase tracking-tight">Forgot Password?</h1>
                <p className="text-gray-400 text-sm font-medium max-w-[260px]">
                    Enter your registered email and we'll send you a reset link.
                </p>
            </div>

            {/* Sent state */}
            {sent ? (
                <div className="bg-brand-green/5 border border-brand-green/20 rounded-2xl p-6 text-center">
                    <CheckCircle size={36} className="text-brand-green mx-auto mb-3" />
                    <p className="font-black text-[#111] text-base">Check your inbox!</p>
                    <p className="text-gray-400 text-sm mt-1">
                        A reset link has been sent to <span className="font-bold text-brand-green">{email}</span>.
                        Check your spam folder too.
                    </p>
                    <button
                        onClick={onBack}
                        className="mt-6 w-full bg-brand-green text-white font-black py-4 rounded-2xl uppercase text-xs tracking-widest hover:bg-brand-green-hover transition-all active:scale-95"
                    >
                        Back to Sign In
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-center gap-2 text-red-600 text-sm">
                            <AlertCircle size={15} className="shrink-0" /> {error}
                        </div>
                    )}

                    <div className="relative group">
                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-brand-green transition-colors" size={16} />
                        <input
                            type="email"
                            id="forgot-email"
                            placeholder="Your registered email"
                            value={email}
                            onChange={e => { setEmail(e.target.value); setError(''); }}
                            className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-[1.125rem] pl-14 pr-5 text-sm font-semibold outline-none focus:ring-4 focus:ring-brand-green/5 focus:border-brand-green/20 transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand-green text-white font-black py-[1.125rem] rounded-2xl shadow-xl shadow-brand-green/10 uppercase text-xs tracking-widest hover:bg-brand-green-hover transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading
                            ? <><Loader2 size={16} className="animate-spin" /> Sending…</>
                            : <><Mail size={14} /> Send Reset Link</>
                        }
                    </button>
                </form>
            )}
        </div>
    );
}

// ── Main Auth Page ────────────────────────────────────────────────────────────
const AuthPage = () => {
    const router = useRouter();

    // ── Mode ───────────────────────────────────────────────────────────────────
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [registerStep, setRegisterStep] = useState(1);
    const [showForgotPassword, setShowForgotPassword] = useState(false);

    // ── OTP gate ───────────────────────────────────────────────────────────────
    const [otpData, setOtpData] = useState<{
        userId: string; purpose: string; target: string;
    } | null>(null);

    // ── Global state ───────────────────────────────────────────────────────────
    const [loading, setLoading] = useState(false);
    const [globalError, setGlobalError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    // ── Login form ─────────────────────────────────────────────────────────────
    const [loginForm, setLoginForm] = useState({ identifier: '', password: '' });

    // ── Register form ──────────────────────────────────────────────────────────
    const [regForm, setRegForm] = useState<RegisterPayload>({
        fullName: '', gender: '', ageRange: '', employmentStatus: '',
        country: '', region: '', town: '',
        email: '', phone: '', password: '',
    });

    const setReg = (key: keyof RegisterPayload, val: string) => {
        setRegForm(prev => ({ ...prev, [key]: val }));
        setFieldErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
    };

    const clearErrors = () => { setGlobalError(''); setFieldErrors({}); };

    const toggleAuthMode = () => {
        setIsLogin(!isLogin);
        setRegisterStep(1);
        clearErrors();
    };

    const steps = [
        { id: 1, title: 'Personal Details' },
        { id: 2, title: 'Location Details' },
        { id: 3, title: 'Account Security' },
    ];

    // ── Step validators ────────────────────────────────────────────────────────
    const validateStep1 = () => {
        const errs: Record<string, string> = {};
        if (!regForm.fullName.trim()) errs.fullName = 'Full name is required';
        if (!regForm.gender) errs.gender = 'Please select your gender';
        if (!regForm.ageRange) errs.ageRange = 'Please select an age range';
        if (!regForm.employmentStatus) errs.employmentStatus = 'Please select employment status';
        setFieldErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const validateStep2 = () => {
        const errs: Record<string, string> = {};
        if (!regForm.country) errs.country = 'Please select your country';
        setFieldErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const validateStep3 = () => {
        const errs: Record<string, string> = {};
        if (!regForm.email && !regForm.phone) errs.email = 'Email or phone is required';
        if (regForm.email && !/\S+@\S+\.\S+/.test(regForm.email)) errs.email = 'Enter a valid email';
        if (!regForm.password) errs.password = 'Password is required';
        if (regForm.password && regForm.password.length < 8) errs.password = 'Min. 8 characters';
        setFieldErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const nextStep = () => {
        clearErrors();
        if (registerStep === 1 && !validateStep1()) return;
        if (registerStep === 2 && !validateStep2()) return;
        setRegisterStep(prev => Math.min(prev + 1, 3));
    };

    const prevStep = () => { clearErrors(); setRegisterStep(prev => Math.max(prev - 1, 1)); };

    // ── LOGIN ──────────────────────────────────────────────────────────────────
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        clearErrors();
        if (!loginForm.identifier || !loginForm.password) {
            setGlobalError('Please fill in all fields.');
            return;
        }
        setLoading(true);
        try {
            const res = await authApi.login(loginForm);
            tokenStorage.setTokens(res.data.accessToken, res.data.refreshToken);
            userStorage.save(res.data.user);
            const firstName = res.data.user.fullName?.split(' ')[0] || 'Friend';
            const fullName = res.data.user.fullName || 'Friend';
            await Swal.fire({
                html: `
                  <div style="font-family:'Inter',sans-serif;text-align:center;padding:0">
                    <!-- Green header -->
                    <div style="background:linear-gradient(135deg,#005C46 0%,#007a5e 100%);margin:-1px -1px 0;padding:32px 24px 40px;position:relative;overflow:hidden">
                      <div style="position:absolute;top:-20px;right:-20px;width:120px;height:120px;background:rgba(255,255,255,0.05);border-radius:50%"></div>
                      <div style="position:absolute;bottom:-30px;left:-10px;width:100px;height:100px;background:rgba(255,255,255,0.05);border-radius:50%"></div>
                      <img src="/zakat logo.png" width="52" height="52" style="object-fit:contain;margin-bottom:12px;position:relative;z-index:1" />
                      <div style="color:rgba(255,255,255,0.65);font-size:11px;font-weight:700;letter-spacing:0.25em;text-transform:uppercase;margin-bottom:4px;position:relative;z-index:1">ZakatAid</div>
                    </div>
                    <!-- Gold avatar bridge -->
                    <div style="margin-top:-24px;display:flex;justify-content:center;margin-bottom:16px">
                      <div style="width:48px;height:48px;border-radius:50%;background:#F7A300;border:4px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 20px rgba(247,163,0,0.35);font-size:18px">👋</div>
                    </div>
                    <!-- Body -->
                    <div style="padding:0 24px 8px">
                      <p style="color:rgba(0,92,70,0.6);font-size:11px;font-weight:800;letter-spacing:0.25em;text-transform:uppercase;margin:0 0 6px">Welcome back</p>
                      <h2 style="margin:0 0 6px;font-family:'Outfit',sans-serif;font-size:1.6rem;font-weight:900;color:#111;letter-spacing:-0.04em;line-height:1.1">${firstName}</h2>
                      <p style="color:#888;font-size:13px;margin:0 0 4px;font-weight:500">${fullName}</p>
                      <p style="color:#aaa;font-size:12px;margin:0">You've signed in successfully.</p>
                    </div>
                    <!-- Arabic greeting -->
                    <div style="margin:16px 24px 4px;padding:12px 16px;background:#F0F7F5;border-radius:12px">
                      <p style="margin:0;color:#005C46;font-size:16px;direction:rtl;font-weight:600">السَّلَامُ عَلَيْكُمْ</p>
                      <p style="margin:4px 0 0;color:#888;font-size:11px;font-weight:500">Peace be upon you</p>
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
            router.push('/dashboard');
        } catch (err) {
            if (err instanceof ApiError) {
                setGlobalError(err.message);
                if (err.errors) setFieldErrors(err.errors);
            } else {
                setGlobalError('Unable to connect to the server. Please try again.');
            }
        } finally { setLoading(false); }
    };

    // ── REGISTER ───────────────────────────────────────────────────────────────
    const handleRegister = async () => {
        if (!validateStep3()) return;
        clearErrors();
        setLoading(true);
        try {
            // Strip empty optional fields
            const payload: RegisterPayload = {
                ...regForm,
                email: regForm.email || undefined,
                phone: regForm.phone || undefined,
                region: regForm.region || undefined,
                town: regForm.town || undefined,
            };
            const res = await authApi.register(payload);
            tokenStorage.setTokens(res.data.accessToken, res.data.refreshToken);
            userStorage.save(res.data.user);
            const firstName = res.data.user.fullName?.split(' ')[0] || 'Friend';
            const fullName = res.data.user.fullName || 'Friend';
            await Swal.fire({
                html: `
                  <div style="font-family:'Inter',sans-serif;text-align:center;padding:0">
                    <!-- Green header -->
                    <div style="background:linear-gradient(135deg,#005C46 0%,#007a5e 100%);margin:-1px -1px 0;padding:32px 24px 40px;position:relative;overflow:hidden">
                      <div style="position:absolute;top:-20px;right:-20px;width:120px;height:120px;background:rgba(255,255,255,0.05);border-radius:50%"></div>
                      <div style="position:absolute;bottom:-30px;left:-10px;width:100px;height:100px;background:rgba(255,255,255,0.05);border-radius:50%"></div>
                      <img src="/zakat logo.png" width="52" height="52" style="object-fit:contain;margin-bottom:12px;position:relative;z-index:1" />
                      <div style="color:rgba(255,255,255,0.65);font-size:11px;font-weight:700;letter-spacing:0.25em;text-transform:uppercase;margin-bottom:4px;position:relative;z-index:1">ZakatAid</div>
                    </div>
                    <!-- Gold avatar bridge -->
                    <div style="margin-top:-24px;display:flex;justify-content:center;margin-bottom:16px">
                      <div style="width:48px;height:48px;border-radius:50%;background:#F7A300;border:4px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 20px rgba(247,163,0,0.35);font-size:18px">🎉</div>
                    </div>
                    <!-- Body -->
                    <div style="padding:0 24px 8px">
                      <p style="color:rgba(0,92,70,0.6);font-size:11px;font-weight:800;letter-spacing:0.25em;text-transform:uppercase;margin:0 0 6px">Account Created</p>
                      <h2 style="margin:0 0 6px;font-family:'Outfit',sans-serif;font-size:1.6rem;font-weight:900;color:#111;letter-spacing:-0.04em;line-height:1.1">Welcome, ${firstName}!</h2>
                      <p style="color:#888;font-size:13px;margin:0 0 4px;font-weight:500">${fullName}</p>
                      <p style="color:#aaa;font-size:12px;margin:0">Let's make giving beautifully transparent.</p>
                    </div>
                    <!-- Arabic greeting -->
                    <div style="margin:16px 24px 4px;padding:12px 16px;background:#F0F7F5;border-radius:12px">
                      <p style="margin:0;color:#005C46;font-size:16px;direction:rtl;font-weight:600">السَّلَامُ عَلَيْكُمْ</p>
                      <p style="margin:4px 0 0;color:#888;font-size:11px;font-weight:500">Peace be upon you</p>
                    </div>
                  </div>`,
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false,
                background: '#ffffff',
                padding: 0,
                customClass: {
                    popup: 'swal-zakat-popup',
                    timerProgressBar: 'swal-zakat-bar',
                },
            });
            // OTP bypassed for now — go straight to dashboard
            router.push('/dashboard');
        } catch (err) {
            if (err instanceof ApiError) {
                setGlobalError(err.message);
                if (err.errors) setFieldErrors(err.errors);
                // Jump back to the step with the first error
                const errKeys = Object.keys(err.errors || {});
                if (errKeys.some(k => ['fullName', 'gender', 'ageRange', 'employmentStatus'].includes(k))) setRegisterStep(1);
                else if (errKeys.includes('country')) setRegisterStep(2);
            } else {
                setGlobalError('Unable to connect to the server.');
            }
        } finally { setLoading(false); }
    };

    // ── If awaiting OTP verification ───────────────────────────────────────────
    if (otpData) {
        return (
            <main className="min-h-screen bg-[#F0F7F6] flex items-center justify-center font-body px-4">
                <div className="w-full max-w-md bg-white rounded-[32px] shadow-2xl shadow-brand-green/5 overflow-hidden flex flex-col border border-gray-100">
                    <OTPScreen
                        {...otpData}
                        onSuccess={() => router.push('/dashboard')}
                    />
                </div>
            </main>
        );
    }

    // ── Main render ────────────────────────────────────────────────────────────
    return (
        <main className="min-h-screen bg-[#F0F7F6] flex flex-col lg:flex-row overflow-hidden font-body">

            {/* Left Side - Visual Hero */}
            <div className="hidden lg:flex lg:w-[42%] relative bg-brand-green items-center justify-center p-16 overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-40">
                    <Image src="/image copy 2.png" alt="Auth" fill className="object-cover" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-brand-green/95 via-brand-green/80 to-transparent z-10"></div>
                <div className="relative z-20 max-w-sm text-white flex flex-col items-center text-center">
                    <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
                        <Image src="/zakat logo.png" alt="Zakat Smart Logo" width={120} height={120} className="object-contain relative z-10" />
                    </div>
                    <Link href="/" className="inline-flex items-center gap-3 text-white/70 hover:text-white transition-all mb-10 group uppercase text-[11px] font-black tracking-[0.3em] bg-white/5 px-6 py-2.5 rounded-full border border-white/10">
                        <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
                        Back to Website
                    </Link>
                    <h2 className="text-4xl md:text-5xl font-black leading-[1.1] mb-6 uppercase tracking-tight font-outfit">
                        Transparent <br />
                        <span className="text-brand-orange">Giving.</span>
                    </h2>
                    <p className="text-white/80 text-lg leading-relaxed font-medium max-w-xs">
                        Join the most trusted Zakat platform in West Africa. <br className="hidden md:block" />
                        Radical transparency, local impact.
                    </p>
                </div>
            </div>

            {/* Right Side - Form Container */}
            <div className="flex-1 flex items-center justify-center p-4 md:p-8 lg:p-12 relative overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-[0.03] grayscale pointer-events-none">
                    <Image src="/mosque.png" alt="Watermark" fill className="object-cover" />
                </div>

                <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`w-full ${!isLogin ? 'max-w-5xl' : 'max-w-xl'} bg-white/95 backdrop-blur-sm rounded-[32px] shadow-2xl shadow-brand-green/5 overflow-hidden flex flex-col md:flex-row min-h-[600px] border border-gray-100 relative z-10`}
                >
                    {/* Multi-step Sidebar (Only for Signup) */}
                    {!isLogin && (
                        <div className="w-full md:w-[320px] bg-[#F8FBFA] p-10 border-r border-gray-100 flex flex-col">
                            <div className="mb-12 flex items-center gap-3">
                                <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                                    <Image src="/zakat logo.png" alt="Zakat Smart Logo" fill className="object-contain" />
                                </div>
                                <div>
                                    <div className="text-brand-green font-black text-2xl tracking-tighter">ZAKAT SMART</div>
                                    <div className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">Digital Endowment</div>
                                </div>
                            </div>
                            <h3 className="text-2xl font-black text-[#111111] mb-10">Create account</h3>
                            <div className="flex-1 space-y-8 relative">
                                <div className="absolute left-[15px] top-2 bottom-2 w-px bg-gray-200 z-0"></div>
                                {steps.map((step) => (
                                    <div key={step.id} className="flex items-center gap-4 relative z-10">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black transition-all ${registerStep === step.id ? 'bg-brand-green text-white scale-110 shadow-lg shadow-brand-green/20' : registerStep > step.id ? 'bg-brand-green/10 text-brand-green border-2 border-brand-green/20' : 'bg-white border-2 border-gray-100 text-gray-300'}`}>
                                            {registerStep > step.id ? '✓' : step.id}
                                        </div>
                                        <span className={`text-[13px] font-bold tracking-tight ${registerStep === step.id ? 'text-[#111111]' : 'text-gray-300'}`}>
                                            {step.title}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-auto pt-10 border-t border-gray-100">
                                <p className="text-[13px] text-gray-400 font-medium">Already a member?</p>
                                <button onClick={toggleAuthMode} className="text-brand-orange text-xs font-black uppercase tracking-widest mt-1 hover:text-brand-orange-hover transition-colors">Sign In Instead</button>
                            </div>
                        </div>
                    )}

                    {/* Main Content Area */}
                    <div className="flex-1 p-8 md:p-14 flex flex-col">

                        {/* ── FORGOT PASSWORD ── */}
                        {isLogin && showForgotPassword && (
                            <ForgotPasswordScreen onBack={() => setShowForgotPassword(false)} />
                        )}

                        {/* ── LOGIN ── */}
                        {isLogin && !showForgotPassword && (
                            <div className="max-w-sm mx-auto w-full flex-1 flex flex-col justify-center">
                                <div className="mb-10 text-center flex flex-col items-center">
                                    <div className="relative w-20 h-20 flex items-center justify-center shrink-0 mb-4">
                                        <Image src="/zakat logo.png" alt="Zakat Smart Logo" fill className="object-contain" />
                                    </div>
                                    <h1 className="text-3xl font-black text-[#111111] mb-2 uppercase tracking-tight">Welcome Back</h1>
                                    <p className="text-gray-400 text-sm font-medium">Please enter your details to sign in.</p>
                                </div>

                                {/* Global error */}
                                {globalError && (
                                    <div className="mb-6 bg-red-50 border border-red-100 rounded-xl p-3 flex items-center gap-2 text-red-600 text-sm">
                                        <AlertCircle size={16} className="shrink-0" /> {globalError}
                                    </div>
                                )}

                                <form className="space-y-6" onSubmit={handleLogin}>
                                    <InputWrapper label="Identity" error={fieldErrors.identifier}>
                                        <div className="relative group">
                                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-brand-green transition-colors" size={16} />
                                            <input
                                                type="text"
                                                id="login-identifier"
                                                placeholder="Email or Phone"
                                                value={loginForm.identifier}
                                                onChange={e => { setLoginForm(p => ({ ...p, identifier: e.target.value })); clearErrors(); }}
                                                className={`w-full bg-gray-50/50 border rounded-2xl py-[1.125rem] pl-14 pr-5 text-sm font-semibold outline-none focus:ring-4 focus:ring-brand-green/5 transition-all ${fieldErrors.identifier ? 'border-red-300 focus:border-red-300' : 'border-gray-100 focus:border-brand-green/20'}`}
                                            />
                                        </div>
                                    </InputWrapper>

                                    <InputWrapper label="Password" error={fieldErrors.password}>
                                        <div className="flex justify-between items-center px-1 mb-1.5">
                                            <span />
                                            <button
                                                type="button"
                                                onClick={() => { clearErrors(); setShowForgotPassword(true); }}
                                                className="text-[10px] font-black uppercase text-brand-orange hover:underline"
                                            >Forgot?</button>
                                        </div>
                                        <div className="relative group">
                                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-brand-green transition-colors" size={16} />
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                id="login-password"
                                                placeholder="••••••••"
                                                value={loginForm.password}
                                                onChange={e => { setLoginForm(p => ({ ...p, password: e.target.value })); clearErrors(); }}
                                                className={`w-full bg-gray-50/50 border rounded-2xl py-[1.125rem] pl-14 pr-12 text-sm font-semibold outline-none focus:ring-4 focus:ring-brand-green/5 transition-all ${fieldErrors.password ? 'border-red-300 focus:border-red-300' : 'border-gray-100 focus:border-brand-green/20'}`}
                                            />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300">
                                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </InputWrapper>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-brand-green text-white font-black py-[1.125rem] rounded-2xl shadow-xl shadow-brand-green/10 uppercase text-xs tracking-widest mt-4 hover:bg-brand-green-hover transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {loading ? <><Loader2 size={16} className="animate-spin" /> Signing In…</> : 'Sign In Now'}
                                    </button>
                                </form>

                                <div className="mt-8 pt-8 border-t border-gray-50 text-center">
                                    <p className="text-gray-400 text-sm">New to Zakat Aid?</p>
                                    <button onClick={toggleAuthMode} className="text-brand-orange text-xs font-black uppercase tracking-widest mt-2 hover:underline">Create Account</button>
                                </div>
                            </div>
                        )}

                        {/* ── REGISTER ── */}
                        {!isLogin && (
                            <div className="flex-1 flex flex-col">
                                {/* Global error */}
                                {globalError && (
                                    <div className="mb-6 bg-red-50 border border-red-100 rounded-xl p-3 flex items-center gap-2 text-red-600 text-sm">
                                        <AlertCircle size={16} className="shrink-0" /> {globalError}
                                    </div>
                                )}

                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={registerStep}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="flex-1"
                                    >
                                        {/* ── Step 1: Personal ── */}
                                        {registerStep === 1 && (
                                            <div className="space-y-8">
                                                <div>
                                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-green mb-6 bg-brand-green/5 inline-block px-3 py-1 rounded-full">Step 01: Identity</div>
                                                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#111111] mb-6 flex items-center gap-2">
                                                        Your Personal Details <div className="h-px bg-gray-100 flex-1"></div>
                                                    </h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <FloatInput label="Full Name" error={fieldErrors.fullName}>
                                                            <input
                                                                type="text"
                                                                id="reg-fullName"
                                                                placeholder="Ahmed Zakat"
                                                                value={regForm.fullName}
                                                                onChange={e => setReg('fullName', e.target.value)}
                                                                className={`w-full bg-white border rounded-xl py-[1.125rem] px-6 text-sm font-semibold outline-none transition-all ${fieldErrors.fullName ? 'border-red-300' : 'border-gray-200 focus:border-brand-green/40'}`}
                                                            />
                                                        </FloatInput>

                                                        <InputWrapper label="Gender" error={fieldErrors.gender}>
                                                            <select
                                                                id="reg-gender"
                                                                value={regForm.gender}
                                                                onChange={e => setReg('gender', e.target.value)}
                                                                className={`w-full bg-white border rounded-xl py-4 px-5 text-sm font-semibold outline-none focus:border-brand-green/40 appearance-none cursor-pointer ${fieldErrors.gender ? 'border-red-300' : 'border-gray-200'}`}
                                                            >
                                                                <option value="" disabled>Select Gender</option>
                                                                <option value="male">Male</option>
                                                                <option value="female">Female</option>
                                                            </select>
                                                        </InputWrapper>

                                                        <InputWrapper label="Age Range" error={fieldErrors.ageRange}>
                                                            <select
                                                                id="reg-ageRange"
                                                                value={regForm.ageRange}
                                                                onChange={e => setReg('ageRange', e.target.value)}
                                                                className={`w-full bg-white border rounded-xl py-4 px-5 text-sm font-semibold outline-none focus:border-brand-green/40 appearance-none cursor-pointer ${fieldErrors.ageRange ? 'border-red-300' : 'border-gray-200'}`}
                                                            >
                                                                <option value="" disabled>Select Age Range</option>
                                                                {ageRanges.map(r => <option key={r} value={r}>{r}</option>)}
                                                            </select>
                                                        </InputWrapper>

                                                        <InputWrapper label="Employment" error={fieldErrors.employmentStatus}>
                                                            <select
                                                                id="reg-employment"
                                                                value={regForm.employmentStatus}
                                                                onChange={e => setReg('employmentStatus', e.target.value)}
                                                                className={`w-full bg-white border rounded-xl py-4 px-5 text-sm font-semibold outline-none focus:border-brand-green/40 appearance-none cursor-pointer ${fieldErrors.employmentStatus ? 'border-red-300' : 'border-gray-200'}`}
                                                            >
                                                                <option value="" disabled>Select Status</option>
                                                                {employmentStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                                                            </select>
                                                        </InputWrapper>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* ── Step 2: Location ── */}
                                        {registerStep === 2 && (
                                            <div className="space-y-8">
                                                <div>
                                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-green mb-6 bg-brand-green/5 inline-block px-3 py-1 rounded-full">Step 02: Geography</div>
                                                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#111111] mb-6 flex items-center gap-2">
                                                        Residential Information <div className="h-px bg-gray-100 flex-1"></div>
                                                    </h4>
                                                    <div className="space-y-6">
                                                        <InputWrapper label="Country" error={fieldErrors.country}>
                                                            <select
                                                                id="reg-country"
                                                                value={regForm.country}
                                                                onChange={e => { setReg('country', e.target.value); setReg('region', ''); setReg('town', ''); }}
                                                                className={`w-full bg-white border rounded-xl py-4 px-5 text-sm font-semibold outline-none focus:border-brand-green/40 appearance-none cursor-pointer ${fieldErrors.country ? 'border-red-300' : 'border-gray-200'}`}
                                                            >
                                                                <option value="" disabled>Choose Country</option>
                                                                {countries.map(c => <option key={c} value={c}>{c}</option>)}
                                                            </select>
                                                        </InputWrapper>

                                                        {regForm.country === 'Ghana' && (
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                <InputWrapper label="Region">
                                                                    <select
                                                                        id="reg-region"
                                                                        value={regForm.region}
                                                                        onChange={e => { setReg('region', e.target.value); setReg('town', ''); }}
                                                                        className="w-full bg-white border border-gray-200 rounded-xl py-4 px-5 text-sm font-semibold outline-none focus:border-brand-green/40 appearance-none cursor-pointer"
                                                                    >
                                                                        <option value="" disabled>Choose Region</option>
                                                                        {Object.keys(ghanaLocations).map(r => <option key={r} value={r}>{r}</option>)}
                                                                    </select>
                                                                </InputWrapper>

                                                                <InputWrapper label="Town">
                                                                    <select
                                                                        id="reg-town"
                                                                        value={regForm.town}
                                                                        onChange={e => setReg('town', e.target.value)}
                                                                        className="w-full bg-white border border-gray-200 rounded-xl py-4 px-5 text-sm font-semibold outline-none focus:border-brand-green/40 appearance-none cursor-pointer"
                                                                    >
                                                                        <option value="" disabled>Choose Town</option>
                                                                        {regForm.region && ghanaLocations[regForm.region as keyof typeof ghanaLocations]?.map(t => (
                                                                            <option key={t} value={t}>{t}</option>
                                                                        ))}
                                                                    </select>
                                                                </InputWrapper>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* ── Step 3: Security ── */}
                                        {registerStep === 3 && (
                                            <div className="space-y-10">
                                                <div>
                                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-green mb-8 bg-brand-green/5 inline-block px-3 py-1.5 rounded-full">Step 03: Security</div>
                                                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#111111] mb-8 flex items-center gap-2">
                                                        Account Protection <div className="h-px bg-gray-100 flex-1"></div>
                                                    </h4>
                                                    <div className="space-y-8">
                                                        <FloatInput label="Email Address" error={fieldErrors.email}>
                                                            <div className="relative">
                                                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-200" size={16} />
                                                                <input
                                                                    type="email"
                                                                    id="reg-email"
                                                                    placeholder="you@example.com"
                                                                    value={regForm.email}
                                                                    onChange={e => setReg('email', e.target.value)}
                                                                    className={`w-full bg-white border rounded-xl py-[1.125rem] pl-14 pr-5 text-sm font-semibold outline-none transition-all ${fieldErrors.email ? 'border-red-300' : 'border-gray-200 focus:border-brand-green/40'}`}
                                                                />
                                                            </div>
                                                            <p className="text-[10px] text-gray-300 font-medium ml-1 mt-1">For secure account updates</p>
                                                        </FloatInput>

                                                        <FloatInput label="Phone (optional)" error={fieldErrors.phone}>
                                                            <div className="relative">
                                                                <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-200" size={16} />
                                                                <input
                                                                    type="tel"
                                                                    id="reg-phone"
                                                                    placeholder="+233 XX XXX XXXX"
                                                                    value={regForm.phone}
                                                                    onChange={e => setReg('phone', e.target.value)}
                                                                    className="w-full bg-white border border-gray-200 rounded-xl py-[1.125rem] pl-14 pr-5 text-sm font-semibold outline-none focus:border-brand-green/40 transition-all"
                                                                />
                                                            </div>
                                                        </FloatInput>

                                                        <FloatInput label="Secure Password" error={fieldErrors.password}>
                                                            <div className="relative">
                                                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-200" size={16} />
                                                                <input
                                                                    type={showPassword ? 'text' : 'password'}
                                                                    id="reg-password"
                                                                    placeholder="••••••••"
                                                                    value={regForm.password}
                                                                    onChange={e => setReg('password', e.target.value)}
                                                                    className={`w-full bg-white border rounded-xl py-[1.125rem] pl-14 pr-12 text-sm font-semibold outline-none transition-all ${fieldErrors.password ? 'border-red-300' : 'border-gray-200 focus:border-brand-green/40'}`}
                                                                />
                                                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-200">
                                                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                                </button>
                                                            </div>
                                                            <p className="text-[10px] text-gray-300 font-medium ml-1 mt-1">Min. 8 characters, 1 uppercase, 1 number</p>
                                                        </FloatInput>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                </AnimatePresence>

                                {/* Step navigation */}
                                <div className="mt-12 flex items-center justify-between pt-8 border-t border-gray-50">
                                    <button
                                        onClick={prevStep}
                                        disabled={registerStep === 1}
                                        className={`px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all ${registerStep === 1 ? 'opacity-0 pointer-events-none' : 'text-gray-400 hover:bg-gray-50'}`}
                                    >
                                        Back
                                    </button>

                                    {registerStep < 3 ? (
                                        <button
                                            onClick={nextStep}
                                            className="bg-brand-green text-white px-12 py-4 rounded-full font-black text-[11px] uppercase tracking-widest shadow-xl shadow-brand-green/10 hover:bg-brand-green-hover transition-all active:scale-95"
                                        >
                                            Next
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleRegister}
                                            disabled={loading}
                                            className="bg-brand-orange text-white px-12 py-4 rounded-full font-black text-[11px] uppercase tracking-widest shadow-xl shadow-brand-orange/10 hover:opacity-90 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            {loading ? <><Loader2 size={14} className="animate-spin" /> Creating Account…</> : 'Create Account'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            <style jsx global>{`
                select {
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23D1D5DB'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: right 1.25rem center;
                    background-size: 1rem;
                }
            `}</style>
        </main>
    );
};

export default AuthPage;
