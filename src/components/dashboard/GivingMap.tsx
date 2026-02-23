"use client";

import React from "react";
import { MapPin, Navigation, ArrowUpRight, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

const InteractiveMap = dynamic(() => import("./InteractiveMap"), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full bg-brand-green/5 animate-pulse flex items-center justify-center">
            <span className="text-xs font-black uppercase tracking-widest text-slate-text">
                Loading Live Map…
            </span>
        </div>
    ),
});

const nearbyLocations = [
    { name: "Central Mosque Accra", distance: "0.8 km", status: "Verified", category: "Mosque" },
    { name: "Al-Barakah Charity", distance: "1.2 km", status: "Verified", category: "Charity" },
    { name: "Madina Community Center", distance: "2.5 km", status: "New", category: "Community" },
];

export default function GivingMap() {
    return (
        <div className="bg-white border border-gray-50 shadow-sm flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <div>
                    <h2 className="font-heading font-black text-base uppercase tracking-tight text-foreground">
                        Local Giving Map
                    </h2>
                    <p className="text-[11px] text-slate-text mt-0.5 font-medium">
                        Accra Metropolitan Area · 3 centers nearby
                    </p>
                </div>
                <Link
                    href="/dashboard/map"
                    className="flex items-center gap-1.5 text-brand-green font-black text-[11px] uppercase tracking-widest hover:underline active:scale-95 transition-all"
                >
                    Full Map <ArrowUpRight size={13} />
                </Link>
            </div>

            {/* Map */}
            <div className="h-60 md:h-72 w-full border-b border-gray-100">
                <InteractiveMap />
            </div>

            {/* Nearby List */}
            <div className="divide-y divide-gray-50">
                <p className="px-5 pt-4 pb-2 text-[10px] font-black uppercase tracking-widest text-slate-text">
                    Nearby Verified Centers
                </p>
                {nearbyLocations.map((loc, idx) => (
                    <div
                        key={idx}
                        className="group flex items-center gap-3 px-5 py-3.5 hover:bg-brand-green/[0.03] transition-colors cursor-pointer"
                    >
                        <div className="w-9 h-9 bg-brand-green/5 border border-brand-green/10 flex items-center justify-center shrink-0 group-hover:bg-brand-green group-hover:border-brand-green transition-all">
                            <MapPin size={16} className="text-brand-green group-hover:text-white transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-foreground truncate">{loc.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-slate-text font-medium">📍 {loc.distance}</span>
                                <span className={`text-[10px] font-black px-1.5 py-0.5 uppercase tracking-wider ${loc.status === "Verified"
                                        ? "bg-brand-green/10 text-brand-green"
                                        : "bg-brand-orange/10 text-brand-orange"
                                    }`}>
                                    {loc.status}
                                </span>
                                <span className="text-[10px] text-slate-text bg-gray-100 px-1.5 py-0.5 font-medium">
                                    {loc.category}
                                </span>
                            </div>
                        </div>
                        <Navigation size={14} className="text-gray-300 group-hover:text-brand-green transition-colors shrink-0" />
                    </div>
                ))}
            </div>

            {/* CTA Footer */}
            <div className="p-5 border-t border-gray-50">
                <Link
                    href="/dashboard/map"
                    className="w-full flex items-center justify-center gap-2 bg-brand-green text-white py-3 text-[11px] font-black uppercase tracking-widest hover:bg-brand-green-light active:scale-[0.99] transition-all shadow-lg shadow-brand-green/10"
                >
                    View All Giving Zones <ArrowRight size={14} />
                </Link>
            </div>
        </div>
    );
}
