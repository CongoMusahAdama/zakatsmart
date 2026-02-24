"use client";

import React, { useState, useCallback } from "react";
import { MapPin, Navigation, ArrowUpRight, ArrowRight, Loader2 } from "lucide-react";
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

/* ── Minimal Org shape for the nearby list ── */
interface NearbyOrg {
    id: number;
    name: string;
    distance: string;
    status: "Verified" | "New";
    category: string;
    position: [number, number];
}

/* ── Haversine distance ── */
function calcDistance(lat1: number, lon1: number, lat2: number, lon2: number): string {
    const R = 6371000;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    const d = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return d < 1000 ? `${Math.round(d)} m` : `${(d / 1000).toFixed(1)} km`;
}

/* ── Reverse-geocode ── */
async function reverseGeocode(lat: number, lon: number): Promise<string> {
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`,
            { headers: { "Accept-Language": "en" } }
        );
        const data = await res.json();
        const addr = data.address ?? {};
        return addr.city || addr.town || addr.village || addr.county || addr.state || addr.country || "Your Location";
    } catch {
        return "Your Location";
    }
}

/* ── Fetch 3 nearest mosques from Overpass ── */
async function fetchNearbyMosques(lat: number, lon: number): Promise<NearbyOrg[]> {
    const query = `
[out:json][timeout:15];
(
  node["amenity"="place_of_worship"]["religion"="muslim"](around:5000,${lat},${lon});
  way["amenity"="place_of_worship"]["religion"="muslim"](around:5000,${lat},${lon});
);
out center 20;
`.trim();

    const res = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: `data=${encodeURIComponent(query)}`,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    if (!res.ok) throw new Error("Overpass error");

    const json = await res.json();
    interface OverpassEl {
        id: number;
        lat?: number;
        lon?: number;
        center?: { lat: number; lon: number };
        tags?: Record<string, string>;
    }
    const elements: OverpassEl[] = json.elements ?? [];

    const orgs: NearbyOrg[] = [];
    for (const el of elements) {
        const elLat = el.lat ?? el.center?.lat;
        const elLon = el.lon ?? el.center?.lon;
        if (!elLat || !elLon) continue;
        const name = el.tags?.name || el.tags?.["name:en"];
        if (!name) continue;
        const hasContact = !!(el.tags?.phone || el.tags?.website || el.tags?.email || el.tags?.["contact:phone"]);
        orgs.push({
            id: el.id,
            name,
            distance: calcDistance(lat, lon, elLat, elLon),
            status: hasContact ? "Verified" : "New",
            category: "Mosque",
            position: [elLat, elLon],
        });
    }

    // Sort by distance
    orgs.sort((a, b) => {
        const toM = (d: string) => d.endsWith("km") ? parseFloat(d) * 1000 : parseFloat(d);
        return toM(a.distance) - toM(b.distance);
    });

    return orgs.slice(0, 3); // top 3 closest
}

export default function GivingMap() {
    const [locationLabel, setLocationLabel] = useState<string>("Awaiting your location…");
    const [nearbyOrgs, setNearbyOrgs] = useState<NearbyOrg[]>([]);
    const [locationDenied, setLocationDenied] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLocationResolved = useCallback(async ([lat, lon]: [number, number]) => {
        setLocationDenied(false);
        // 1 — area name
        const label = await reverseGeocode(lat, lon);
        setLocationLabel(label);

        // 2 — nearest mosques
        setLoading(true);
        try {
            const orgs = await fetchNearbyMosques(lat, lon);
            setNearbyOrgs(orgs); // only real results, empty if none found
        } catch {
            setNearbyOrgs([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleLocationDenied = useCallback(() => {
        setLocationLabel("Location access denied");
        setLocationDenied(true);
    }, []);

    return (
        <div className="bg-white border border-gray-50 shadow-sm flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <div>
                    <h2 className="font-heading font-black text-base uppercase tracking-tight text-foreground">
                        Local Giving Map
                    </h2>
                    <p className="text-[11px] text-slate-text mt-0.5 font-medium">
                        {locationLabel} · {nearbyOrgs.length} centers nearby
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
                <InteractiveMap onLocationResolved={handleLocationResolved} onLocationDenied={handleLocationDenied} />
            </div>

            {/* Nearby List */}
            <div className="divide-y divide-gray-50">
                <div className="px-5 pt-4 pb-2 flex items-center gap-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-text">
                        Nearby Verified Centers
                    </p>
                    {loading && <Loader2 size={10} className="animate-spin text-brand-green" />}
                </div>

                {/* Location denied */}
                {locationDenied && !loading && (
                    <div className="px-5 py-6 text-center">
                        <MapPin size={28} className="text-gray-200 mx-auto mb-2" />
                        <p className="text-xs text-slate-text font-medium">Location access was denied.</p>
                        <p className="text-[10px] text-gray-400 mt-1">Enable location in your browser settings to find nearby centers.</p>
                    </div>
                )}

                {/* Loading */}
                {loading && nearbyOrgs.length === 0 && (
                    <div className="px-5 py-6 text-center">
                        <Loader2 size={20} className="animate-spin text-brand-green mx-auto mb-2" />
                        <p className="text-xs text-slate-text font-medium">Finding nearby centers…</p>
                    </div>
                )}

                {/* No results (after load, not denied) */}
                {!loading && !locationDenied && nearbyOrgs.length === 0 && (
                    <div className="px-5 py-6 text-center">
                        <MapPin size={28} className="text-gray-200 mx-auto mb-2" />
                        <p className="text-xs text-slate-text font-medium">No centers found within 5 km.</p>
                        <p className="text-[10px] text-gray-400 mt-1">Try the full map to explore a wider area.</p>
                    </div>
                )}

                {/* Real results */}
                {nearbyOrgs.map((loc) => (
                    <div
                        key={loc.id}
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
