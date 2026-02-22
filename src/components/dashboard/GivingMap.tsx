"use client";

import React from "react";
import { MapPin, Navigation, Info, ArrowUpRight, Search, Filter } from "lucide-react";

import dynamic from "next/dynamic";

const InteractiveMap = dynamic(() => import("./InteractiveMap"), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-light-gray animate-pulse flex items-center justify-center text-slate-text font-bold uppercase tracking-widest text-xs">Loading Live Map...</div>
});

const nearbyLocations = [
    { name: "Central Mosque Accra", distance: "0.8 km", status: "Verified" },
    { name: "Al-Barakah Charity", distance: "1.2 km", status: "Verified" },
    { name: "Madina Community Center", distance: "2.5 km", status: "New" },
];

export default function GivingMap() {
    return (
        <div className="bg-white rounded-none p-6 shadow-sm border border-gray-50 flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg md:text-xl font-heading font-bold text-foreground">Local Giving Map</h2>
                <button className="text-brand-green font-bold text-sm hover:underline flex items-center gap-1 active:scale-95 transition-all">
                    See All <ArrowUpRight size={14} />
                </button>
            </div>

            <div className="relative rounded-none overflow-hidden bg-light-gray h-72 mb-6 border border-gray-100 group shadow-inner">
                <InteractiveMap />
            </div>

            <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-text uppercase tracking-wider">Nearby Verified Organizations</h3>
                {nearbyLocations.map((loc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-none hover:bg-light-gray/50 transition-colors group cursor-pointer border border-transparent hover:border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-brand-green/5 text-brand-green flex items-center justify-center group-hover:bg-brand-green group-hover:text-white transition-all">
                                <MapPin size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-foreground">{loc.name}</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-medium text-slate-text">{loc.distance} away</span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${loc.status === 'Verified' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'} font-bold`}>
                                        {loc.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 group-hover:text-brand-green transition-colors">
                            <Navigation size={16} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
