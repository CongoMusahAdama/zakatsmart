"use client";

import React from "react";
import { CheckCircle2, Clock, ArrowUpRight, BarChart3, TrendingUp } from "lucide-react";
import { useSearch } from "@/context/SearchContext";

const activities = [
    { id: 1, type: "Donation", to: "Central Mosque Accra", amount: "GHS 500.00", status: "Received by Mosque", date: "2 hours ago", color: "green" },
    { id: 2, type: "Distribution", project: "Food Aid Ramadan", impact: "10 Families", status: "In Progress", date: "Yesterday", color: "orange" },
    { id: 3, type: "Donation", to: "Islamic Orphans Fund", amount: "GHS 1,200.00", status: "Verified & Locked", date: "3 days ago", color: "green" },
    { id: 4, type: "Verification", to: "Madina Clinic", amount: "Report Ready", status: "Completion Report", date: "1 week ago", color: "blue" },
];

export default function ImpactTracker() {
    const { searchQuery } = useSearch();

    const filteredActivities = activities.filter(activity =>
        (activity.to || activity.project || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return (
        <div className="bg-white rounded-none p-6 shadow-sm border border-gray-50 flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-lg md:text-xl font-heading font-bold text-foreground">Transparency Tracker</h2>
                    <p className="text-[10px] md:text-xs text-slate-text mt-1">Real-time impact of your Zakat contributions</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[10px] font-bold overflow-hidden uppercase">
                                {i === 3 ? "+12" : <div className="w-full h-full bg-brand-green/20" />}
                            </div>
                        ))}
                    </div>
                    <button className="p-2 rounded-lg bg-light-gray text-slate-text hover:text-brand-green transition-all active:scale-95">
                        <BarChart3 size={18} />
                    </button>
                </div>
            </div>

            {/* Summary Mini Cards */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4 mb-8">
                {/* Total Impact - Green */}
                <div className="relative overflow-hidden bg-brand-green rounded-none p-4 md:p-5 text-white shadow-lg shadow-brand-green/20 group">
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-3 md:mb-4">
                            <div className="p-1.5 md:p-2 bg-white/20 backdrop-blur-md rounded-none">
                                <TrendingUp size={16} className="text-white md:w-5 md:h-5" />
                            </div>
                            <span className="text-[8px] md:text-[10px] font-black tracking-widest bg-white/20 backdrop-blur-md px-1.5 py-0.5 md:px-2 md:py-1 rounded-none uppercase">Lifetime</span>
                        </div>
                        <p className="text-[9px] md:text-[10px] font-bold text-white/70 uppercase tracking-widest mb-0.5">Impact</p>
                        <h3 className="text-lg md:text-2xl font-black font-heading tracking-tight leading-none text-white">124</h3>
                        <p className="text-[9px] md:text-[10px] text-white/50 mt-1 font-medium hidden sm:block">Families reached</p>
                    </div>
                    {/* Background Pattern Icon */}
                    <TrendingUp size={70} className="absolute -bottom-2 -right-2 text-white/10 -rotate-12 transition-transform group-hover:scale-110 duration-500 md:w-[100px] md:h-[100px]" />
                </div>

                {/* Pending - Blue */}
                <div className="relative overflow-hidden bg-blue-600 rounded-none p-4 md:p-5 text-white shadow-lg shadow-blue-600/20 group">
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-3 md:mb-4">
                            <div className="p-1.5 md:p-2 bg-white/20 backdrop-blur-md rounded-none">
                                <Clock size={16} className="text-white md:w-5 md:h-5" />
                            </div>
                        </div>
                        <p className="text-[9px] md:text-[10px] font-bold text-white/70 uppercase tracking-widest mb-0.5">Pending</p>
                        <h3 className="text-lg md:text-2xl font-black font-heading tracking-tight leading-none text-white">2</h3>
                        <p className="text-[9px] md:text-[10px] text-white/50 mt-1 font-medium hidden sm:block">Active deliveries</p>
                    </div>
                    {/* Background Pattern Icon */}
                    <Clock size={70} className="absolute -bottom-2 -right-2 text-white/10 -rotate-12 transition-transform group-hover:scale-110 duration-500 md:w-[100px] md:h-[100px]" />
                </div>

                {/* Verified - Purple */}
                <div className="relative overflow-hidden bg-purple-600 rounded-none p-4 md:p-5 text-white shadow-lg shadow-purple-600/20 group">
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-3 md:mb-4">
                            <div className="p-1.5 md:p-2 bg-white/20 backdrop-blur-md rounded-none">
                                <CheckCircle2 size={16} className="text-white md:w-5 md:h-5" />
                            </div>
                        </div>
                        <p className="text-[9px] md:text-[10px] font-bold text-white/70 uppercase tracking-widest mb-0.5">Verified</p>
                        <h3 className="text-lg md:text-2xl font-black font-heading tracking-tight leading-none text-white">98%</h3>
                        <p className="text-[9px] md:text-[10px] text-white/50 mt-1 font-medium hidden sm:block">Trust Score</p>
                    </div>
                    {/* Background Pattern Icon */}
                    <CheckCircle2 size={70} className="absolute -bottom-2 -right-2 text-white/10 -rotate-12 transition-transform group-hover:scale-110 duration-500 md:w-[100px] md:h-[100px]" />
                </div>

                {/* Receipts - Orange */}
                <div className="relative overflow-hidden bg-brand-orange rounded-none p-4 md:p-5 text-white shadow-lg shadow-brand-orange/20 group">
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-3 md:mb-4">
                            <div className="p-1.5 md:p-2 bg-white/20 backdrop-blur-md rounded-none">
                                <ArrowUpRight size={16} className="text-white md:w-5 md:h-5" />
                            </div>
                        </div>
                        <p className="text-[9px] md:text-[10px] font-bold text-white/70 uppercase tracking-widest mb-0.5">Receipts</p>
                        <h3 className="text-lg md:text-2xl font-black font-heading tracking-tight leading-none text-white">42</h3>
                        <p className="text-[9px] md:text-[10px] text-white/50 mt-1 font-medium hidden sm:block">Digital proofs</p>
                    </div>
                    {/* Background Pattern Icon */}
                    <ArrowUpRight size={70} className="absolute -bottom-2 -right-2 text-white/10 -rotate-12 transition-transform group-hover:scale-110 duration-500 md:w-[100px] md:h-[100px]" />
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-text uppercase tracking-wider flex items-center justify-between">
                    Recent Activity
                    <span className="text-[10px] text-brand-green bg-brand-green/10 px-2 py-0.5 rounded-full lowercase">live updates</span>
                </h3>

                <div className="relative space-y-4 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-100 before:to-transparent">
                    {filteredActivities.length > 0 ? (
                        filteredActivities.map((activity) => (
                            <div key={activity.id} className="relative flex items-center gap-4 group">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm z-10 transition-transform group-hover:scale-110 ${activity.color === 'green' ? 'bg-brand-green text-white' :
                                    activity.color === 'orange' ? 'bg-brand-orange text-white' : 'bg-blue-500 text-white'
                                    }`}>
                                    {activity.color === 'green' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                                </div>

                                <div className="flex-1 bg-light-gray/30 p-4 rounded-2xl group-hover:bg-light-gray/60 transition-colors border border-transparent group-hover:border-gray-100">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-xs font-bold text-foreground">{activity.to || activity.project}</p>
                                        <span className="text-[10px] font-medium text-slate-text">{activity.date}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-bold text-brand-green">{activity.amount || activity.impact}</p>
                                        <p className="text-[10px] font-bold uppercase tracking-tight text-slate-text">{activity.status}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-10 text-center text-slate-text text-sm italic">
                            No matching activities found for "{searchQuery}"
                        </div>
                    )}
                </div>
            </div>

            <button className="mt-8 w-full py-4 text-sm font-bold text-slate-text hover:text-brand-green transition-all active:scale-[0.99] flex items-center justify-center gap-2 border border-transparent hover:border-gray-100">
                View Full History <ArrowUpRight size={16} />
            </button>
        </div>
    );
}
