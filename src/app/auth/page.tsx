'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Phone, MapPin, Briefcase, Calendar, ChevronDown, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { ghanaLocations, countries, ageRanges, employmentStatuses } from '@/lib/data';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [registerStep, setRegisterStep] = useState(1);

    // Registration specific state
    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedRegion, setSelectedRegion] = useState('');
    const [selectedTown, setSelectedTown] = useState('');

    const toggleAuthMode = () => {
        setIsLogin(!isLogin);
        setRegisterStep(1);
    };

    const nextStep = () => setRegisterStep(prev => Math.min(prev + 1, 3));
    const prevStep = () => setRegisterStep(prev => Math.max(prev - 1, 1));

    const steps = [
        { id: 1, title: 'Personal Details' },
        { id: 2, title: 'Location Details' },
        { id: 3, title: 'Account Security' },
    ];

    return (
        <main className="min-h-screen bg-[#F0F7F6] flex flex-col lg:flex-row overflow-hidden font-body">
            {/* Left Side - Visual Hero */}
            <div className="hidden lg:flex lg:w-[42%] relative bg-brand-green items-center justify-center p-16 overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-40">
                    <Image src="/image copy 2.png" alt="Auth" fill className="object-cover" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-brand-green/95 via-brand-green/80 to-transparent z-10"></div>
                <div className="relative z-20 max-w-sm text-white flex flex-col items-center text-center">
                    <div className="w-56 h-56 mb-8 relative">
                        <Image src="/zakat logo.png" alt="Logo" fill className="object-contain" />
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
                {/* Subtle Right Side Background */}
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
                            <div className="mb-12">
                                <div className="text-brand-green font-black text-2xl tracking-tighter mb-1">ZAKAT AID</div>
                                <div className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">Digital Endowment</div>
                            </div>

                            <h3 className="text-2xl font-black text-[#111111] mb-10">Create account</h3>

                            <div className="flex-1 space-y-8 relative">
                                {/* Vertical Line Connection */}
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
                        {isLogin ? (
                            <div className="max-w-sm mx-auto w-full flex-1 flex flex-col justify-center">
                                <div className="mb-10 text-center">
                                    <h1 className="text-3xl font-black text-[#111111] mb-2 uppercase tracking-tight tracking-tight">Welcome Back</h1>
                                    <p className="text-gray-400 text-sm font-medium">Please enter your details to sign in.</p>
                                </div>

                                <form className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Identity</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-brand-green transition-colors" size={16} />
                                            <input type="text" placeholder="Email or Phone" className="w-full bg-gray-50/50 border border-gray-100 focus:border-brand-green/20 rounded-2xl py-4.5 pl-14 pr-5 text-sm font-semibold outline-none focus:ring-4 focus:ring-brand-green/5 transition-all" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center px-1">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Password</label>
                                            <button className="text-[10px] font-black uppercase text-brand-orange hover:underline">Forgot?</button>
                                        </div>
                                        <div className="relative group">
                                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-brand-green transition-colors" size={16} />
                                            <input type={showPassword ? "text" : "password"} placeholder="••••••••" className="w-full bg-gray-50/50 border border-gray-100 focus:border-brand-green/20 rounded-2xl py-4.5 pl-14 pr-12 text-sm font-semibold outline-none focus:ring-4 focus:ring-brand-green/5 transition-all" />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300">
                                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                    <button className="w-full bg-brand-green text-white font-black py-4.5 rounded-2xl shadow-xl shadow-brand-green/10 uppercase text-xs tracking-widest mt-4 hover:bg-brand-green-hover transition-all active:scale-95">Sign In Now</button>
                                </form>

                                <div className="mt-8 pt-8 border-t border-gray-50 text-center">
                                    <p className="text-gray-400 text-sm">New to Zakat Aid?</p>
                                    <button onClick={toggleAuthMode} className="text-brand-orange text-xs font-black uppercase tracking-widest mt-2 hover:underline">Create Account</button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={registerStep}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="flex-1"
                                    >
                                        {registerStep === 1 && (
                                            <div className="space-y-8">
                                                <div>
                                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-green mb-6 bg-brand-green/5 inline-block px-3 py-1 rounded-full">Step 01: Identitiy</div>
                                                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#111111] mb-6 flex items-center gap-2">
                                                        Your Personal Details
                                                        <div className="h-px bg-gray-100 flex-1"></div>
                                                    </h4>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                        <div className="space-y-2 relative group mt-2">
                                                            <div className="absolute -top-2.5 left-4 px-2 bg-white z-10 transition-colors group-focus-within:text-brand-green">
                                                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 group-focus-within:text-brand-green">Full Name</span>
                                                            </div>
                                                            <input type="text" placeholder="Ahmed Zakat" className="w-full bg-white border border-gray-200 rounded-xl py-4.5 px-6 text-sm font-semibold outline-none focus:border-brand-green/40 transition-all placeholder:text-gray-100 placeholder:font-normal font-inter" />
                                                            <p className="text-[10px] text-gray-300 font-medium ml-1">Legal name as per ID</p>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <div className="text-[11px] text-gray-400 font-bold ml-1 uppercase tracking-wider">Gender</div>
                                                            <select className="w-full bg-white border border-gray-200 rounded-xl py-4 px-5 text-sm font-semibold outline-none focus:border-brand-green/40 appearance-none cursor-pointer font-inter">
                                                                <option value="" disabled selected>Select Gender</option>
                                                                <option value="male">Male</option>
                                                                <option value="female">Female</option>
                                                            </select>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <div className="text-[11px] text-gray-400 font-bold ml-1 uppercase tracking-wider">Age Range</div>
                                                            <select className="w-full bg-white border border-gray-200 rounded-xl py-4 px-5 text-sm font-semibold outline-none focus:border-brand-green/40 appearance-none cursor-pointer font-inter">
                                                                <option value="" disabled selected>Select Age Range</option>
                                                                {ageRanges.map(range => <option key={range} value={range}>{range}</option>)}
                                                            </select>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <div className="text-[11px] text-gray-400 font-bold ml-1 uppercase tracking-wider">Employment</div>
                                                            <select className="w-full bg-white border border-gray-200 rounded-xl py-4 px-5 text-sm font-semibold outline-none focus:border-brand-green/40 appearance-none cursor-pointer font-inter">
                                                                <option value="" disabled selected>Select Status</option>
                                                                {employmentStatuses.map(status => <option key={status} value={status}>{status}</option>)}
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {registerStep === 2 && (
                                            <div className="space-y-8">
                                                <div>
                                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-green mb-6 bg-brand-green/5 inline-block px-3 py-1 rounded-full">Step 02: Geography</div>
                                                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#111111] mb-6 flex items-center gap-2">
                                                        Residential Information
                                                        <div className="h-px bg-gray-100 flex-1"></div>
                                                    </h4>

                                                    <div className="space-y-6">
                                                        <div className="space-y-2">
                                                            <div className="text-[11px] text-gray-400 font-bold ml-1">Country</div>
                                                            <select
                                                                value={selectedCountry}
                                                                onChange={(e) => setSelectedCountry(e.target.value)}
                                                                className="w-full bg-white border border-gray-200 rounded-xl py-4 px-5 text-sm font-semibold outline-none focus:border-brand-green/40 appearance-none pointer"
                                                            >
                                                                <option value="" disabled>Choose Country</option>
                                                                {countries.map(c => <option key={c} value={c}>{c}</option>)}
                                                            </select>
                                                        </div>

                                                        {selectedCountry === 'Ghana' && (
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                <div className="space-y-2">
                                                                    <div className="text-[11px] text-gray-400 font-bold ml-1">Region</div>
                                                                    <select
                                                                        value={selectedRegion}
                                                                        onChange={(e) => setSelectedRegion(e.target.value)}
                                                                        className="w-full bg-white border border-gray-200 rounded-xl py-4 px-5 text-sm font-semibold outline-none focus:border-brand-green/40 appearance-none pointer"
                                                                    >
                                                                        <option value="" disabled>Choose Region</option>
                                                                        {Object.keys(ghanaLocations).map(region => <option key={region} value={region}>{region}</option>)}
                                                                    </select>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <div className="text-[11px] text-gray-400 font-bold ml-1">Town</div>
                                                                    <select
                                                                        value={selectedTown}
                                                                        onChange={(e) => setSelectedTown(e.target.value)}
                                                                        className="w-full bg-white border border-gray-200 rounded-xl py-4 px-5 text-sm font-semibold outline-none focus:border-brand-green/40 appearance-none pointer"
                                                                    >
                                                                        <option value="" disabled>Choose Town</option>
                                                                        {selectedRegion && ghanaLocations[selectedRegion as keyof typeof ghanaLocations].map(town => (
                                                                            <option key={town} value={town}>{town}</option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {registerStep === 3 && (
                                            <div className="space-y-10">
                                                <div>
                                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-green mb-8 bg-brand-green/5 inline-block px-3 py-1.5 rounded-full">Step 03: Security</div>
                                                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#111111] mb-8 flex items-center gap-2">
                                                        Account Protection
                                                        <div className="h-px bg-gray-100 flex-1"></div>
                                                    </h4>

                                                    <div className="space-y-8">
                                                        <div className="space-y-2 relative group mt-2">
                                                            <div className="absolute -top-2.5 left-4 px-2 bg-white z-10 transition-colors group-focus-within:text-brand-green">
                                                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 group-focus-within:text-brand-green">Email or Phone Number</span>
                                                            </div>
                                                            <div className="relative">
                                                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-200" size={16} />
                                                                <input type="text" placeholder="you@example.com" className="w-full bg-white border border-gray-200 rounded-xl py-4.5 pl-14 pr-5 text-sm font-semibold outline-none focus:border-brand-green/40 transition-all font-inter" />
                                                            </div>
                                                            <p className="text-[10px] text-gray-300 font-medium ml-1">For secure account updates</p>
                                                        </div>

                                                        <div className="space-y-2 relative group mt-2">
                                                            <div className="absolute -top-2.5 left-4 px-2 bg-white z-10 transition-colors group-focus-within:text-brand-green">
                                                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 group-focus-within:text-brand-green">Secure Password</span>
                                                            </div>
                                                            <div className="relative">
                                                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-200" size={16} />
                                                                <input type={showPassword ? "text" : "password"} placeholder="••••••••" className="w-full bg-white border border-gray-200 rounded-xl py-4.5 pl-14 pr-12 text-sm font-semibold outline-none focus:border-brand-green/40 transition-all font-inter" />
                                                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-200">
                                                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                                </button>
                                                            </div>
                                                            <p className="text-[10px] text-gray-300 font-medium ml-1">Must be at least 8 characters long</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                </AnimatePresence>

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
                                        <button className="bg-brand-orange text-white px-12 py-4 rounded-full font-black text-[11px] uppercase tracking-widest shadow-xl shadow-brand-orange/10 hover:bg-brand-orange-hover transition-all active:scale-95">
                                            Create Account
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            <style jsx global>{`
                .py-4\.5 {
                    padding-top: 1.125rem;
                    padding-bottom: 1.125rem;
                }
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

