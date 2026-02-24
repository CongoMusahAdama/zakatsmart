"use client";

import React, { useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import {
    MapPin, Navigation, CheckCircle2, ShieldCheck,
    Phone, Globe, Heart, Lock, Unlock, ArrowRight,
    X, CreditCard, LocateFixed, Loader2, Info, Smartphone,
    Utensils, BookOpen, Stethoscope, BadgeCheck,
    Mail, Home, List, Search, SlidersHorizontal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ExternalLocation } from "@/components/dashboard/InteractiveMap";

/* ─── Dynamic Map ────────────────────────────────────────────── */
const InteractiveMap = dynamic(
    () => import("@/components/dashboard/InteractiveMap"),
    {
        ssr: false,
        loading: () => (
            <div className="h-full w-full bg-brand-green/5 animate-pulse flex items-center justify-center">
                <span className="text-xs font-black uppercase tracking-widest text-slate-text">
                    Loading Live Map…
                </span>
            </div>
        ),
    }
);

/* ─── Data ───────────────────────────────────────────────────── */
type OrgCategory = "Food Support" | "Education" | "Health" | "Community";
type GivingType = "Zakat" | "Sadaqah";

interface Org {
    id: number;
    name: string;
    description: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    distance: string;
    verified: boolean;
    category: OrgCategory;
    givingTypes: GivingType[];
    accepts: string[];
    supports: string[];
    /** Lat/lon for in-map routing */
    position?: [number, number];
}

// No hardcoded organisations — all data is sourced live from OpenStreetMap via Overpass.

const CATEGORY_ICONS: Record<OrgCategory, React.ElementType> = {
    "Food Support": Utensils,
    "Education": BookOpen,
    "Health": Stethoscope,
    "Community": Home,
};

const CATEGORY_COLORS: Record<OrgCategory, string> = {
    "Food Support": "bg-amber-50 text-amber-700 border-amber-200",
    "Education": "bg-blue-50 text-blue-700 border-blue-200",
    "Health": "bg-rose-50 text-rose-700 border-rose-200",
    "Community": "bg-brand-green/10 text-brand-green border-brand-green/20",
};

const QUICK_AMOUNTS = [10, 20, 50, 100, 200];

type TabId = "centers" | "filters" | "details";

/* ─── Utilities ─────────────────────────────────────────────── */
// Cache for reverse geocoding to reduce API hits
const GEO_CACHE: Record<string, string> = {};

async function reverseGeocode(lat: number, lon: number): Promise<string> {
    const cacheKey = `${lat.toFixed(3)},${lon.toFixed(3)}`;
    if (GEO_CACHE[cacheKey]) return GEO_CACHE[cacheKey];

    try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 4000);

        const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14`,
            {
                headers: {
                    "User-Agent": "ZakatAid-App/1.1",
                    "Accept-Language": "en"
                },
                signal: controller.signal
            }
        );
        clearTimeout(id);

        if (!res.ok) return "Area Detected";
        const data = await res.json();
        const addr = data.address ?? {};
        const label = addr.suburb || addr.neighbourhood || addr.city || addr.town || addr.village || "Area Detected";
        GEO_CACHE[cacheKey] = label;
        return label;
    } catch {
        // Silently fail to avoid console spam during CORS/Rate-limit issues
        return "Area Detected";
    }
}

/** Haversine distance in human-readable string. */
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

interface OverpassElement {
    type: "node" | "way" | "relation";
    id: number;
    lat?: number;
    lon?: number;
    center?: { lat: number; lon: number };
    tags?: Record<string, string>;
}

/** Convert an Overpass element to the internal Org shape. */
function overpassToOrg(
    el: OverpassElement,
    userLat: number,
    userLon: number,
): Org | null {
    const lat = el.lat ?? el.center?.lat;
    const lon = el.lon ?? el.center?.lon;
    if (!lat || !lon) return null;

    const tags = el.tags ?? {};
    const rawName = tags.name || tags["name:en"] || tags["name:ar"];
    if (!rawName) return null; // skip unnamed features

    const nameLower = rawName.toLowerCase();

    // ── Pre-filter: Explicitly skip non-Islamic religious places ──────────
    if (tags.amenity === "place_of_worship") {
        const isActuallyMuslim = tags.religion === "muslim" ||
            nameLower.includes("mosque") ||
            nameLower.includes("masjid") ||
            nameLower.includes("central prayer") ||
            nameLower.includes("islamic");

        // If it's a place of worship but doesn't look Muslim, we discard it
        if (!isActuallyMuslim) return null;

        // Extra check for churches that might be tagged as place_of_worship
        if (nameLower.includes("church") || nameLower.includes("cathedral") || nameLower.includes("chapel") || nameLower.includes("ministr")) {
            return null;
        }
    }

    const addrParts = [
        tags["addr:housenumber"],
        tags["addr:street"],
        tags["addr:suburb"],
        tags["addr:city"],
    ].filter(Boolean);
    const address =
        addrParts.length > 0
            ? addrParts.join(", ")
            : tags["addr:full"] || "Address not listed";

    const isMosque = tags.amenity === "place_of_worship";

    // ── Smart category detection from OSM tags ──────────────────
    const descLower = (tags.description || "").toLowerCase();
    const operatorLower = (tags.operator || "").toLowerCase();
    const combinedText = `${nameLower} ${descLower} ${operatorLower}`;

    let category: OrgCategory;
    if (
        combinedText.includes("school") ||
        combinedText.includes("madrasa") ||
        combinedText.includes("madrasah") ||
        combinedText.includes("institute") ||
        combinedText.includes("college") ||
        combinedText.includes("education") ||
        combinedText.includes("quran") ||
        combinedText.includes("islamic school") ||
        tags["isced:level"] ||
        tags["school:type"]
    ) {
        category = "Education";
    } else if (
        combinedText.includes("health") ||
        combinedText.includes("medical") ||
        combinedText.includes("clinic") ||
        combinedText.includes("hospital") ||
        combinedText.includes("outreach") ||
        combinedText.includes("dispensary") ||
        tags.amenity === "clinic" ||
        tags.amenity === "hospital"
    ) {
        category = "Health";
    } else if (
        combinedText.includes("charity") ||
        combinedText.includes("food") ||
        combinedText.includes("relief") ||
        combinedText.includes("zakat") ||
        combinedText.includes("sadaqah") ||
        combinedText.includes("welfare") ||
        combinedText.includes("aid") ||
        combinedText.includes("orphan") ||
        combinedText.includes("foundation") ||
        combinedText.includes("ngo") ||
        combinedText.includes("home") ||
        combinedText.includes("shelter") ||
        tags.amenity === "social_facility" ||
        tags["office"] === "ngo" ||
        tags["social_facility"] === "food_bank" ||
        tags["social_facility"] === "orphanage" ||
        tags["social_facility"] === "group_home" ||
        tags["social_facility"] === "shelter"
    ) {
        category = "Food Support";
    } else {
        category = "Community";
    }

    const givingTypes: GivingType[] =
        category === "Community" || category === "Education"
            ? ["Zakat", "Sadaqah"]
            : ["Sadaqah"];

    // Verified = OSM element has a name + meaningful data (≥4 tags)
    const tagCount = Object.keys(tags).length;
    const verified = !!(tags.name && tagCount >= 4);

    return {
        id: el.id,
        name: rawName,
        description:
            tags.description ||
            tags["description:en"] ||
            (isMosque
                ? "Islamic place of worship — Zakat collection & community services."
                : "Local Islamic charity & community organisation."),
        address,
        phone:
            tags.phone ||
            tags["contact:phone"] ||
            tags["contact:mobile"] ||
            "Not listed",
        email:
            tags.email ||
            tags["contact:email"] ||
            "Not listed",
        website:
            tags.website ||
            tags["contact:website"] ||
            "",
        distance: calcDistance(userLat, userLon, lat, lon),
        verified,
        category,
        givingTypes,
        accepts: givingTypes.includes("Zakat")
            ? ["Zakat al-Mal", "Zakat al-Fitr", "Sadaqah"]
            : ["Sadaqah"],
        supports: ["Community Support", "Religious Services"],
        position: [lat, lon] as [number, number],
    };
}

/** Fetch nearby mosques + Islamic charities from the Overpass API.
 *  Tries multiple mirror endpoints so a single 504 doesn't kill the feature.
 */
async function fetchNearbyMosques(
    lat: number,
    lon: number,
    radiusMeters = 5000,
): Promise<{ orgs: Org[]; mapLocations: ExternalLocation[] }> {
    const query = `
[out:json][timeout:25];
(
  node["amenity"="place_of_worship"](around:${radiusMeters},${lat},${lon});
  node["office"="ngo"](around:${radiusMeters},${lat},${lon});
  node["social_facility"](around:${radiusMeters},${lat},${lon});
  node["foundation"="yes"](around:${radiusMeters},${lat},${lon});
  node["charity"="yes"](around:${radiusMeters},${lat},${lon});
  node["social_facility"="orphanage"](around:${radiusMeters},${lat},${lon});
  node["social_facility"="group_home"](around:${radiusMeters},${lat},${lon});
  node["social_facility"="shelter"](around:${radiusMeters},${lat},${lon});
);
out center 80;
`.trim();

    // Multiple public Overpass mirrors — tried in order until one succeeds
    const ENDPOINTS = [
        "https://overpass-api.de/api/interpreter",
        "https://lz4.overpass-api.de/api/interpreter",
        "https://z.overpass-api.de/api/interpreter",
        "https://overpass.kumi.systems/api/interpreter",
    ];

    let json: { elements?: OverpassElement[] } | null = null;
    const body = `data=${encodeURIComponent(query)}`;
    const headers = { "Content-Type": "application/x-www-form-urlencoded" };

    for (const endpoint of ENDPOINTS) {
        try {
            const ctrl = new AbortController();
            const timeoutDuration = 30_000; // 30s for mirror
            const timer = setTimeout(() => ctrl.abort(), timeoutDuration);
            const res = await fetch(endpoint, { method: "POST", body, headers, signal: ctrl.signal });
            clearTimeout(timer);
            if (!res.ok) {
                console.warn(`Overpass ${endpoint} → ${res.status}, trying next…`);
                continue;
            }
            json = await res.json();
            break; // success — stop trying
        } catch (err) {
            console.warn(`Overpass ${endpoint} failed:`, err, "trying next…");
        }
    }

    if (!json) throw new Error("All Overpass endpoints failed");

    const elements: OverpassElement[] = json.elements ?? [];
    const orgs: Org[] = [];
    const mapLocations: ExternalLocation[] = [];

    for (const el of elements) {
        const org = overpassToOrg(el, lat, lon);
        if (!org) continue;
        orgs.push(org);
        const elLat = el.lat ?? el.center?.lat;
        const elLon = el.lon ?? el.center?.lon;
        if (elLat && elLon) {
            mapLocations.push({
                id: el.id,
                name: org.name,
                position: [elLat, elLon],
                description: org.description,
                category: org.category,
            });
        }
    }

    // Sort by numeric distance (convert "500 m" and "1.2 km" both to metres)
    orgs.sort((a, b) => {
        const toM = (d: string) => {
            const n = parseFloat(d);
            return d.includes("km") ? n * 1000 : n;
        };
        return toM(a.distance) - toM(b.distance);
    });

    return { orgs, mapLocations };
}

export default function MapPage() {
    /* Filter state */
    const [verifiedOnly, setVerifiedOnly] = useState(false);
    const [activeCategories, setActiveCategories] = useState<OrgCategory[]>([]);
    const [activeGiving, setActiveGiving] = useState<GivingType[]>([]);

    /* UI state */
    const [activeTab, setActiveTab] = useState<TabId>("centers");
    const [selectedOrg, setSelectedOrg] = useState<Org | null>(null);

    /* Donation modal */
    const [donateTarget, setDonateTarget] = useState<Org | null>(null);
    const [donateStep, setDonateStep] = useState<"form" | "confirm" | "success">("form");
    const [amount, setAmount] = useState("");
    const [givingIntent, setGivingIntent] = useState<GivingType>("Zakat");
    const [anonymous, setAnonymous] = useState(false);
    const [momoNetwork, setMomoNetwork] = useState<string>("");

    /* Search */
    const [searchQuery, setSearchQuery] = useState("");

    /* Live location label */
    const [locationLabel, setLocationLabel] = useState("Allow location to find nearby centers");

    /* Live mosque data from Overpass */
    const [liveOrgs, setLiveOrgs] = useState<Org[] | null>(null);
    const [liveMapLocations, setLiveMapLocations] = useState<ExternalLocation[] | null>(null);
    const [orgsLoading, setOrgsLoading] = useState(false);
    const [orgsError, setOrgsError] = useState(false);

    /* In-map routing */
    const [routeDestination, setRouteDestination] = useState<[number, number] | null>(null);
    const mapSectionRef = React.useRef<HTMLDivElement>(null);

    /* Map Interaction */
    const [currentMapCenter, setCurrentMapCenter] = useState<[number, number] | null>(null);
    const [showSearchButton, setShowSearchButton] = useState(false);

    const handleGetDirections = useCallback((org: Org) => {
        if (!org.position) return;
        setRouteDestination(org.position);
        setActiveTab("centers"); // switch away from details so map is visible on mobile
        // Scroll map into view smoothly
        setTimeout(() => {
            mapSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 80);
    }, []);

    const handleClearRoute = useCallback(() => {
        setRouteDestination(null);
    }, []);

    const WEST_AFRICAN_HUBS = [
        { name: "Accra", coords: [5.6037, -0.1870] as [number, number] },
        { name: "Kumasi", coords: [6.6666, -1.6163] as [number, number] },
        { name: "Sekondi-Takoradi", coords: [4.8891, -1.7584] as [number, number] },
        { name: "Lagos", coords: [6.5244, 3.3792] as [number, number] },
        { name: "Abuja", coords: [9.0765, 7.3986] as [number, number] },
        { name: "Dakar", coords: [14.7167, -17.4677] as [number, number] },
    ];

    const jumpToHub = (coords: [number, number]) => {
        // We trigger the resolve flow as if the user was there
        handleLocationResolved(coords);
    };

    const lastGeocodeTime = React.useRef(0);

    const handleLocationResolved = useCallback(async ([lat, lon]: [number, number], radius = 8000) => {
        // Debounce geocode to avoid Nominatim blocks (min 1.6s between calls)
        const now = Date.now();
        if (now - lastGeocodeTime.current > 1600) {
            lastGeocodeTime.current = now;
            const label = await reverseGeocode(lat, lon);
            setLocationLabel(label);
        }

        setShowSearchButton(false);

        // 2 — fetch from Overpass
        setOrgsLoading(true);
        setOrgsError(false);
        try {
            const { orgs, mapLocations } = await fetchNearbyMosques(lat, lon, radius);
            setLiveOrgs(orgs.length > 0 ? orgs : null);
            setLiveMapLocations(mapLocations.length > 0 ? mapLocations : null);
        } catch (err) {
            console.warn("Overpass fetch failed:", err);
            setOrgsError(true);
        } finally {
            setOrgsLoading(false);
        }
    }, []);

    /* The source of truth for the centers list — empty until Overpass returns */
    const sourceOrgs: Org[] = liveOrgs ?? [];

    const filtered = useMemo(() => sourceOrgs.filter(o => {
        if (verifiedOnly && !o.verified) return false;
        if (activeCategories.length > 0 && !activeCategories.includes(o.category)) return false;
        if (activeGiving.length > 0 && !activeGiving.some(g => o.givingTypes.includes(g))) return false;
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            if (!o.name.toLowerCase().includes(q) &&
                !o.description.toLowerCase().includes(q) &&
                !o.category.toLowerCase().includes(q) &&
                !o.address.toLowerCase().includes(q)) return false;
        }
        return true;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [sourceOrgs, verifiedOnly, activeCategories, activeGiving, searchQuery]);

    const activeFilterCount = (verifiedOnly ? 1 : 0) + activeCategories.length + activeGiving.length;

    const toggleCategory = (cat: OrgCategory) =>
        setActiveCategories(p => p.includes(cat) ? p.filter(c => c !== cat) : [...p, cat]);

    const toggleGiving = (g: GivingType) =>
        setActiveGiving(p => p.includes(g) ? p.filter(x => x !== g) : [...p, g]);

    const openDonate = (org: Org) => {
        setDonateTarget(org);
        setDonateStep("form");
        setAmount("");
        setAnonymous(false);
        setMomoNetwork("");
        setGivingIntent(org.givingTypes.includes("Zakat") ? "Zakat" : "Sadaqah");
    };

    const closeModal = () => { setDonateTarget(null); setDonateStep("form"); };

    const selectOrg = (org: Org) => {
        setSelectedOrg(org);
        setActiveTab("details");
    };

    const tabs: { id: TabId; label: string; icon: React.ElementType; count?: number }[] = [
        { id: "centers", label: "Centers", icon: List, count: filtered.length },
        { id: "filters", label: "Filters", icon: SlidersHorizontal, count: activeFilterCount || undefined },
        { id: "details", label: "Details", icon: MapPin, count: selectedOrg ? 1 : undefined },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="w-full flex flex-col gap-6 pb-36 lg:pb-10"
        >
            {/* ══ Hero ════════════════════════════════════════════════ */}
            <div className="relative overflow-hidden bg-brand-green text-white p-5 md:p-10 shadow-lg shadow-brand-green/20">
                <div className="absolute -top-10 -right-10 w-56 h-56 bg-white/5 rounded-full pointer-events-none" />
                <div className="absolute -bottom-16 -left-8 w-72 h-72 bg-white/5 rounded-full pointer-events-none" />
                <MapPin size={100} className="absolute -right-4 -bottom-4 text-white/5 pointer-events-none hidden sm:block" />
                <div className="relative z-10 flex flex-col gap-2.5">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="text-brand-orange font-arabic text-xl" dir="rtl">زكاة</span>
                        <span className="text-white/60 text-xs font-medium uppercase tracking-widest">Local Giving Zone</span>
                    </div>
                    <h1 className="text-2xl md:text-4xl font-heading font-black uppercase tracking-tight leading-none">
                        Local Giving Map
                    </h1>
                    <p className="text-white/70 text-xs md:text-base font-medium max-w-xl leading-relaxed">
                        Discover curated, Shariah-verified mosques and charities near you.
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-0.5">
                        {[
                            { icon: CheckCircle2, label: "Shariah-Verified" },
                            { icon: Navigation, label: "Geolocation" },
                            { icon: Lock, label: "Anonymous" },
                        ].map(({ icon: Icon, label }) => (
                            <div key={label} className="flex items-center gap-1 bg-white/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider">
                                <Icon size={10} className="text-brand-orange" /> {label}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ══ Map + Tabs Side-by-Side ══════════════════════════════ */}
            <div className="flex flex-col lg:flex-row gap-0 bg-white border border-gray-100 shadow-sm overflow-hidden lg:h-[880px]">

                {/* Map column */}
                <div ref={mapSectionRef} className="lg:w-[55%] lg:h-full flex flex-col border-b lg:border-b-0 lg:border-r border-gray-100">
                    <div className="flex flex-col border-b border-gray-100 shrink-0">
                        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-50 bg-gray-50/30">
                            <div>
                                <h2 className="font-black text-xs uppercase tracking-widest text-[#111]">Live Zone Map</h2>
                                <p className="text-[10px] text-slate-text mt-0.5 font-medium">
                                    {locationLabel} · {filtered.length} center{filtered.length !== 1 ? "s" : ""}
                                </p>
                            </div>
                            <div className="flex items-center gap-1.5">
                                {routeDestination && (
                                    <button
                                        onClick={handleClearRoute}
                                        className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-rose-500 hover:text-rose-700 transition-colors mr-2"
                                    >
                                        <X size={10} /> Clear Route
                                    </button>
                                )}
                                <div className="flex items-center gap-1.5 text-[9px] font-black text-brand-green uppercase tracking-widest">
                                    <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
                                    Live Tracker
                                </div>
                            </div>
                        </div>

                        {/* West African Hubs Bar */}
                        <div className="px-4 py-2 overflow-x-auto scroller-hidden flex items-center gap-2 bg-white">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-text/40 mr-1 whitespace-nowrap">West Africa Hubs:</span>
                            {WEST_AFRICAN_HUBS.map(hub => (
                                <button
                                    key={hub.name}
                                    onClick={() => jumpToHub(hub.coords)}
                                    className="px-3 py-1.5 bg-gray-100 hover:bg-brand-green hover:text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap active:scale-95"
                                >
                                    {hub.name}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="h-[300px] sm:h-[460px] md:h-[800px] lg:h-full w-full relative">
                        <InteractiveMap
                            onLocationResolved={handleLocationResolved}
                            externalLocations={liveMapLocations ?? undefined}
                            routeDestination={routeDestination}
                            onClearRoute={handleClearRoute}
                            onCenterChange={(coords) => {
                                setCurrentMapCenter(coords);
                                setShowSearchButton(true);
                            }}
                        />

                        {/* Search in this area button */}
                        <AnimatePresence>
                            {showSearchButton && !orgsLoading && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, x: "-50%" }}
                                    animate={{ opacity: 1, y: 0, x: "-50%" }}
                                    exit={{ opacity: 0, y: 10, x: "-50%" }}
                                    className="absolute top-5 left-1/2 -translate-x-1/2 z-[400]"
                                >
                                    <button
                                        onClick={() => handleLocationResolved(currentMapCenter!)}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-100 shadow-2xl rounded-full text-[10px] font-black uppercase tracking-widest text-[#111] hover:bg-brand-green hover:text-white hover:border-brand-green transition-all active:scale-95"
                                    >
                                        <Search size={12} className="shrink-0" />
                                        <span>Search in this area</span>
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Tabs column */}
                <div className="lg:w-[45%] lg:h-full flex flex-col overflow-hidden">

                    {/* Tab Bar */}
                    <div className="flex items-stretch border-b border-gray-100">
                        {tabs.map(tab => {
                            const isActive = activeTab === tab.id;
                            const Icon = tab.icon;
                            const disabled = tab.id === "details" && !selectedOrg;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => !disabled && setActiveTab(tab.id)}
                                    disabled={disabled}
                                    className={cn(
                                        "relative flex flex-1 items-center justify-center gap-1.5 py-3 px-2 text-[10px] font-black uppercase tracking-widest transition-all",
                                        isActive
                                            ? "text-white"
                                            : disabled
                                                ? "text-gray-300 cursor-not-allowed"
                                                : "text-slate-text hover:text-brand-green hover:bg-gray-50"
                                    )}
                                >
                                    {/* Active fill */}
                                    {isActive && (
                                        <motion.div
                                            layoutId="mapTabIndicator"
                                            className="absolute inset-0 bg-brand-orange shadow-lg shadow-brand-orange/20"
                                            initial={false}
                                            transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                                        />
                                    )}
                                    <Icon size={13} className="relative z-10 shrink-0" />
                                    <span className="relative z-10 text-[10px]">{tab.label}</span>
                                    {tab.count !== undefined && tab.count > 0 && (
                                        <span className={cn(
                                            "relative z-10 text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full shrink-0",
                                            isActive ? "bg-white/25 text-white" : "bg-brand-green text-white"
                                        )}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* ── Always-visible Search Bar ── */}
                    <div className="px-4 py-3 border-b border-gray-100 shrink-0">
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-text pointer-events-none" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search centers, categories, areas…"
                                className="w-full bg-gray-50 border border-gray-200 focus:border-brand-green focus:ring-1 focus:ring-brand-green/20 rounded-xl py-2 pl-9 pr-8 text-sm text-foreground placeholder:text-slate-text/60 outline-none transition-all"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-text hover:text-foreground transition-colors"
                                >
                                    <X size={13} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-y-auto">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 8 }}
                                transition={{ duration: 0.2 }}
                            >
                                {activeTab === "centers" && (
                                    <div>
                                        {/* ── Loading skeleton ── */}
                                        {orgsLoading && (
                                            <div className="divide-y divide-gray-50">
                                                {/* header bar */}
                                                <div className="px-4 py-2.5 flex items-center gap-2 bg-brand-green/5 border-b border-brand-green/10">
                                                    <Loader2 size={11} className="animate-spin text-brand-green" />
                                                    <span className="text-[10px] font-black text-brand-green uppercase tracking-widest">
                                                        Finding mosques near you…
                                                    </span>
                                                </div>
                                                {[...Array(5)].map((_, i) => (
                                                    <div key={i} className="flex items-center gap-3 px-4 py-3.5 animate-pulse">
                                                        <div className="w-9 h-9 rounded-xl bg-gray-100 shrink-0" />
                                                        <div className="flex-1 space-y-2">
                                                            <div className="h-3 bg-gray-100 rounded-full w-3/4" />
                                                            <div className="h-2 bg-gray-100 rounded-full w-1/2" />
                                                        </div>
                                                        <div className="w-10 h-7 rounded-lg bg-gray-100 shrink-0" />
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* ── Overpass error ── */}
                                        {!orgsLoading && orgsError && (
                                            <div className="py-10 text-center px-6">
                                                <MapPin size={28} className="text-gray-200 mx-auto mb-3" />
                                                <p className="text-sm font-bold text-foreground mb-1">Couldn't reach live data</p>
                                                <p className="text-[11px] text-slate-text mb-3">Showing sample centers. Check your connection and try again.</p>
                                                <button
                                                    onClick={() => { }}
                                                    className="text-brand-green text-xs font-black uppercase tracking-widest hover:underline"
                                                >Retry</button>
                                            </div>
                                        )}

                                        {/* ── Live source badge ── */}
                                        {!orgsLoading && liveOrgs && liveOrgs.length > 0 && (
                                            <div className="px-4 py-2.5 flex items-center gap-2 bg-brand-green/5 border-b border-brand-green/10">
                                                <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
                                                <span className="text-[10px] font-black text-brand-green uppercase tracking-widest">
                                                    {liveOrgs.length} mosques found near you · OpenStreetMap
                                                </span>
                                            </div>
                                        )}

                                        {/* ── Fallback badge — no location yet ── */}
                                        {!orgsLoading && !liveOrgs && !orgsError && (
                                            <div className="px-4 py-2.5 flex items-center gap-2 bg-amber-50 border-b border-amber-100">
                                                <LocateFixed size={11} className="text-brand-orange shrink-0" />
                                                <span className="text-[10px] font-medium text-amber-700 uppercase tracking-widest">
                                                    Allow location access to discover real centers near you
                                                </span>
                                            </div>
                                        )}

                                        {!orgsLoading && filtered.length === 0 ? (
                                            <div className="py-12 text-center px-4">
                                                <Search size={28} className="text-gray-200 mx-auto mb-3" />
                                                <p className="text-sm text-slate-text font-medium">
                                                    {searchQuery ? `No results for "${searchQuery}"` : "No centers match your filters."}
                                                </p>
                                                <button
                                                    onClick={() => { setVerifiedOnly(false); setActiveCategories([]); setActiveGiving([]); setSearchQuery(""); }}
                                                    className="text-brand-green text-xs font-black mt-2 uppercase tracking-widest hover:underline"
                                                >Clear All</button>
                                            </div>
                                        ) : !orgsLoading && (
                                            <div className="divide-y divide-gray-50">
                                                {filtered.map(org => {
                                                    const Icon = CATEGORY_ICONS[org.category];
                                                    const isSelected = selectedOrg?.id === org.id;
                                                    return (
                                                        <div
                                                            key={org.id}
                                                            onClick={() => selectOrg(org)}
                                                            role="button"
                                                            tabIndex={0}
                                                            onKeyDown={e => { if (e.key === "Enter") selectOrg(org); }}
                                                            className={cn(
                                                                "w-full text-left flex items-center gap-3 px-4 py-3.5 transition-all group cursor-pointer",
                                                                isSelected ? "bg-brand-green/5" : "hover:bg-gray-50 outline-none focus:bg-gray-50 focus:ring-1 focus:ring-inset focus:ring-brand-green/20"
                                                            )}
                                                        >
                                                            <div className={cn(
                                                                "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all",
                                                                isSelected
                                                                    ? "bg-brand-green text-white shadow-md shadow-brand-green/20"
                                                                    : "bg-brand-green/5 text-brand-green group-hover:bg-brand-green group-hover:text-white"
                                                            )}>
                                                                <Icon size={16} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-1.5 min-w-0">
                                                                    <p className="text-sm font-bold text-foreground truncate">{org.name}</p>
                                                                    {org.verified && <BadgeCheck size={13} className="text-brand-green shrink-0" />}
                                                                </div>
                                                                <p className="text-[10px] text-slate-text mt-0.5 leading-snug line-clamp-1">{org.description}</p>
                                                                <div className="flex items-center gap-1.5 mt-1">
                                                                    <span className={cn("text-[9px] font-bold border px-1.5 py-0.5 rounded-full", CATEGORY_COLORS[org.category])}>
                                                                        {org.category}
                                                                    </span>
                                                                    <span className="text-[10px] text-slate-text font-medium">📍 {org.distance}</span>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={e => { e.stopPropagation(); openDonate(org); }}
                                                                className="shrink-0 bg-brand-orange text-white p-2 sm:px-3 sm:py-1.5 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-brand-orange-hover active:scale-95 transition-all flex items-center gap-1 shadow-md shadow-brand-orange/10"
                                                            >
                                                                <Heart size={11} />
                                                                <span className="hidden sm:inline">Give</span>
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ── Tab: Filters ── */}
                                {activeTab === "filters" && (
                                    <div className="flex flex-col h-full">

                                        {/* ── Location row ── */}
                                        <div className="px-4 pt-4 pb-3 border-b border-gray-50">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-text mb-2">📍 Location</p>
                                            <div className="flex items-center gap-2 bg-brand-green/5 border border-brand-green/15 px-3 py-2 rounded-xl">
                                                <LocateFixed size={13} className="text-brand-green shrink-0" />
                                                <span className="text-sm font-bold text-foreground flex-1">{locationLabel}</span>
                                                <span className="text-[9px] font-black text-brand-green bg-brand-green/10 px-2 py-0.5 rounded-full uppercase tracking-wider">Live GPS</span>
                                            </div>
                                        </div>

                                        {/* ── Category chips ── */}
                                        <div className="px-4 pt-4 pb-3 border-b border-gray-50">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-text mb-3">Category</p>
                                            <div className="grid grid-cols-2 gap-2">
                                                {(["Food Support", "Education", "Health", "Community"] as OrgCategory[]).map(cat => {
                                                    const Icon = CATEGORY_ICONS[cat];
                                                    const active = activeCategories.includes(cat);
                                                    const count = sourceOrgs.filter(o => o.category === cat).length;
                                                    return (
                                                        <button
                                                            key={cat}
                                                            onClick={() => toggleCategory(cat)}
                                                            className={cn(
                                                                "flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all group",
                                                                active
                                                                    ? "bg-brand-green text-white border-brand-green shadow-sm shadow-brand-green/20"
                                                                    : "bg-white text-foreground border-gray-200 hover:border-brand-green/40 hover:bg-brand-green/5"
                                                            )}
                                                        >
                                                            <div className={cn(
                                                                "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all",
                                                                active ? "bg-white/20" : "bg-brand-green/5 group-hover:bg-brand-green/10"
                                                            )}>
                                                                <Icon size={13} className={active ? "text-white" : "text-brand-green"} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className={cn("text-xs font-black leading-tight", active ? "text-white" : "text-foreground")}>{cat}</p>
                                                                <p className={cn("text-[10px] font-medium", active ? "text-white/70" : "text-slate-text")}>{count} center{count !== 1 ? "s" : ""}</p>
                                                            </div>
                                                            {active && (
                                                                <div className="w-4 h-4 rounded-full bg-white/25 flex items-center justify-center shrink-0">
                                                                    <CheckCircle2 size={10} className="text-white" />
                                                                </div>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* ── Giving type ── */}
                                        <div className="px-4 pt-4 pb-3 border-b border-gray-50">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-text mb-3">Giving Type</p>
                                            <div className="flex gap-2">
                                                {(["Zakat", "Sadaqah"] as GivingType[]).map(g => (
                                                    <button
                                                        key={g}
                                                        onClick={() => toggleGiving(g)}
                                                        className={cn(
                                                            "flex-1 py-2.5 rounded-xl text-sm font-black border transition-all flex items-center justify-center gap-1.5",
                                                            activeGiving.includes(g)
                                                                ? "bg-brand-orange text-white border-brand-orange shadow-sm"
                                                                : "bg-white text-slate-text border-gray-200 hover:border-brand-orange/50 hover:text-brand-orange"
                                                        )}
                                                    >
                                                        {activeGiving.includes(g) && <CheckCircle2 size={13} />}
                                                        {g === "Zakat" ? "Zakat" : "Sadaqah"}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* ── Verified only toggle ── */}
                                        <div className="px-4 pt-4 pb-3 border-b border-gray-50">
                                            <button
                                                onClick={() => setVerifiedOnly(!verifiedOnly)}
                                                className={cn(
                                                    "w-full flex items-center gap-3 p-3 rounded-xl border transition-all",
                                                    verifiedOnly
                                                        ? "bg-brand-green/5 border-brand-green/30"
                                                        : "bg-gray-50 border-gray-100 hover:border-brand-green/20"
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all",
                                                    verifiedOnly ? "bg-brand-green text-white" : "bg-gray-100 text-slate-text"
                                                )}>
                                                    <BadgeCheck size={16} />
                                                </div>
                                                <div className="flex-1 text-left">
                                                    <p className="text-sm font-black text-foreground">Verified Centers Only</p>
                                                    <p className="text-[10px] text-slate-text">
                                                        {sourceOrgs.filter(o => o.verified).length} of {sourceOrgs.length} centers verified
                                                    </p>
                                                </div>
                                                {/* Toggle pill */}
                                                <div className={cn(
                                                    "w-11 h-6 rounded-full transition-all relative shrink-0",
                                                    verifiedOnly ? "bg-brand-green" : "bg-gray-300"
                                                )}>
                                                    <span className={cn(
                                                        "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all",
                                                        verifiedOnly ? "left-[22px]" : "left-0.5"
                                                    )} />
                                                </div>
                                            </button>
                                        </div>

                                        {/* ── Active filter summary ── */}
                                        {activeFilterCount > 0 && (
                                            <div className="px-4 py-2.5 bg-brand-orange/5 border-b border-brand-orange/15 flex items-center gap-2 flex-wrap">
                                                <span className="text-[10px] font-black text-brand-orange uppercase tracking-wider">Active:</span>
                                                {verifiedOnly && (
                                                    <span className="flex items-center gap-1 bg-brand-green/10 text-brand-green text-[9px] font-black px-2 py-0.5 rounded-full">
                                                        <BadgeCheck size={9} /> Verified
                                                    </span>
                                                )}
                                                {activeCategories.map(c => (
                                                    <span key={c} className="flex items-center gap-1 bg-gray-100 text-foreground text-[9px] font-bold px-2 py-0.5 rounded-full">
                                                        {c}
                                                        <button onClick={() => toggleCategory(c)} className="hover:text-brand-orange"><X size={8} /></button>
                                                    </span>
                                                ))}
                                                {activeGiving.map(g => (
                                                    <span key={g} className="flex items-center gap-1 bg-brand-orange/10 text-brand-orange text-[9px] font-bold px-2 py-0.5 rounded-full">
                                                        {g}
                                                        <button onClick={() => toggleGiving(g)} className="hover:opacity-60"><X size={8} /></button>
                                                    </span>
                                                ))}
                                                <button
                                                    onClick={() => { setVerifiedOnly(false); setActiveCategories([]); setActiveGiving([]); }}
                                                    className="ml-auto text-[9px] font-black text-brand-orange hover:underline uppercase tracking-wider"
                                                >Clear all</button>
                                            </div>
                                        )}

                                        {/* ── Sticky CTA ── */}
                                        <div className="p-4 mt-auto border-t border-gray-100 shrink-0">
                                            <button
                                                onClick={() => setActiveTab("centers")}
                                                className="w-full bg-brand-green text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-green-light transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-green/15 active:scale-[0.99]"
                                            >
                                                <List size={14} />
                                                View {filtered.length} Result{filtered.length !== 1 ? "s" : ""}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* ── Tab: Details ── */}
                                {activeTab === "details" && selectedOrg && (
                                    <div className="p-5 flex flex-col gap-5">
                                        {/* Org Header */}
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-brand-green/10 text-brand-green rounded-xl flex items-center justify-center shrink-0">
                                                {React.createElement(CATEGORY_ICONS[selectedOrg.category], { size: 22 })}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="font-heading font-black text-lg uppercase tracking-tight leading-tight text-foreground">{selectedOrg.name}</h3>
                                                    {selectedOrg.verified && (
                                                        <span className="flex items-center gap-1 bg-brand-green/10 text-brand-green text-[10px] font-black px-2 py-0.5 rounded-full">
                                                            <BadgeCheck size={11} /> Verified
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-slate-text mt-0.5">📍 {selectedOrg.distance} · {selectedOrg.address}</p>
                                            </div>
                                            <button
                                                onClick={() => { setSelectedOrg(null); setActiveTab("centers"); }}
                                                className="p-1.5 hover:bg-gray-100 rounded-full transition-all shrink-0"
                                            >
                                                <X size={16} className="text-slate-text" />
                                            </button>
                                        </div>

                                        <p className="text-sm text-slate-text leading-relaxed">{selectedOrg.description}</p>

                                        {/* Contact */}
                                        <div className="grid grid-cols-1 gap-2">
                                            <a href={`tel:${selectedOrg.phone}`} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 hover:bg-brand-green/5 transition-colors group">
                                                <Phone size={14} className="text-brand-green shrink-0" />
                                                <span className="text-xs font-bold text-foreground truncate group-hover:text-brand-green">{selectedOrg.phone}</span>
                                            </a>
                                            <a href={`mailto:${selectedOrg.email}`} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 hover:bg-brand-green/5 transition-colors group">
                                                <Mail size={14} className="text-brand-green shrink-0" />
                                                <span className="text-xs font-bold text-foreground truncate group-hover:text-brand-green">{selectedOrg.email}</span>
                                            </a>
                                            <a href={`https://${selectedOrg.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 hover:bg-brand-green/5 transition-colors group">
                                                <Globe size={14} className="text-brand-green shrink-0" />
                                                <span className="text-xs font-bold text-foreground truncate group-hover:text-brand-green">{selectedOrg.website}</span>
                                            </a>
                                        </div>

                                        {/* Accepts + Supports */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-text mb-1.5">Accepts</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {selectedOrg.accepts.map(a => (
                                                        <span key={a} className="text-[9px] font-bold text-brand-green border border-brand-green/20 px-1.5 py-0.5 rounded-full bg-brand-green/5">{a}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-text mb-1.5">Supports</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {selectedOrg.supports.map(s => (
                                                        <span key={s} className="text-[9px] font-medium text-slate-text bg-gray-100 px-1.5 py-0.5 rounded-full">{s}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Trust message */}
                                        {selectedOrg.verified && (
                                            <div className="flex items-center gap-3 bg-brand-green/5 border border-brand-green/15 rounded-xl p-3">
                                                <ShieldCheck size={18} className="text-brand-green shrink-0" />
                                                <p className="text-[11px] text-brand-green font-bold leading-snug">
                                                    Verified by the Zakat Smart community review board. Your donation is in trusted hands.
                                                </p>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="grid grid-cols-3 gap-2">
                                            <button
                                                onClick={() => openDonate(selectedOrg)}
                                                className="col-span-1 bg-brand-orange text-white py-3 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-1.5 rounded-xl hover:bg-brand-orange-hover active:scale-[0.98] transition-all shadow-lg shadow-brand-orange/20"
                                            >
                                                <Heart size={14} /> Donate
                                            </button>
                                            <button
                                                onClick={() => handleGetDirections(selectedOrg)}
                                                disabled={!selectedOrg.position}
                                                className="col-span-1 bg-brand-green text-white py-3 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-1.5 rounded-xl hover:bg-brand-green-light active:scale-[0.98] transition-all shadow-lg shadow-brand-green/20 disabled:opacity-40 disabled:cursor-not-allowed"
                                                title={selectedOrg.position ? "Show route on map" : "Location coordinates not available"}
                                            >
                                                <Navigation size={14} /> Directions
                                            </button>
                                            <a
                                                href={`tel:${selectedOrg.phone}`}
                                                className="col-span-1 bg-white border border-gray-200 text-foreground py-3 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-1.5 rounded-xl hover:border-brand-green hover:text-brand-green active:scale-[0.98] transition-all"
                                            >
                                                <Phone size={14} /> Call
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {/* Details tab but no org selected */}
                                {activeTab === "details" && !selectedOrg && (
                                    <div className="py-12 text-center px-6">
                                        <MapPin size={32} className="text-gray-200 mx-auto mb-3" />
                                        <p className="text-sm text-slate-text font-medium">Select a center from the list to view details.</p>
                                        <button onClick={() => setActiveTab("centers")} className="text-brand-green text-xs font-black mt-2 uppercase tracking-widest hover:underline">View Centers</button>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>{/* end scroll wrapper */}
                </div>{/* end tabs column */}
            </div>{/* end side-by-side flex */}

            {/* ── Info Banner ── */}
            <div className="bg-brand-orange/5 border border-brand-orange/20 rounded-2xl p-5 flex gap-4 items-start">
                <div className="w-10 h-10 bg-brand-orange/10 text-brand-orange rounded-xl flex items-center justify-center shrink-0">
                    <ShieldCheck size={20} />
                </div>
                <div>
                    <h4 className="font-black text-foreground text-sm mb-1 uppercase tracking-tight">How Zakat Zones Work</h4>
                    <p className="text-[12px] text-slate-text leading-relaxed">
                        Every center on this map is reviewed by our Shariah board. Only <strong>Verified</strong> centres accept Zakat al-Mal. <strong>New</strong> centres accept Sadaqah only while under review.
                    </p>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════
                DONATION MODAL
            ══════════════════════════════════════════════════════ */}
            <AnimatePresence>
                {donateTarget && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4"
                        onClick={closeModal}
                    >
                        <motion.div
                            initial={{ y: 80, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 80, opacity: 0 }}
                            transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                            className="bg-white w-full sm:max-w-xl flex flex-col shadow-2xl rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* ── Modal header ── */}
                            <div className="relative overflow-hidden rounded-t-3xl shrink-0"
                                style={{ background: "linear-gradient(135deg, #0f4c2b 0%, #16a34a 60%, #22c55e 100%)" }}>
                                {/* Decorative rings */}
                                <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
                                <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />

                                <div className="relative p-6 flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        {/* Mosque glyph */}
                                        <div className="w-12 h-12 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center shrink-0 border border-white/20 shadow-lg">
                                            <span className="text-2xl leading-none select-none">🕌</span>
                                        </div>
                                        <div>
                                            <p className="text-white/50 text-[9px] font-black uppercase tracking-widest mb-0.5">Donate to</p>
                                            <h3 className="font-heading font-black text-lg uppercase tracking-tight text-white leading-tight max-w-[200px]">
                                                {donateTarget.name}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                                {donateTarget.verified && (
                                                    <span className="inline-flex items-center gap-1 bg-white/15 border border-white/20 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                                                        <BadgeCheck size={9} /> Verified
                                                    </span>
                                                )}
                                                <span className="inline-flex items-center gap-1 bg-white/10 border border-white/15 text-white/70 text-[9px] font-medium px-2 py-0.5 rounded-full">
                                                    {donateTarget.category}
                                                </span>
                                                {donateTarget.distance && (
                                                    <span className="text-white/50 text-[9px] font-medium">📍 {donateTarget.distance}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={closeModal}
                                        className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all active:scale-90 shrink-0 border border-white/15"
                                    >
                                        <X size={14} className="text-white" />
                                    </button>
                                </div>

                                {/* Giving type summary pill */}
                                <div className="px-6 pb-5">
                                    <div className="flex items-center gap-2 bg-white/10 border border-white/15 rounded-2xl px-4 py-2.5">
                                        <Heart size={12} className="text-brand-orange shrink-0" />
                                        <span className="text-white/80 text-xs font-bold flex-1">
                                            {givingIntent === "Zakat" ? "Paying Zakat · obligatory giving" : "Giving Sadaqah · voluntary giving"}
                                        </span>
                                        <span className="text-white/50 text-[9px] font-black uppercase tracking-wider">
                                            {givingIntent}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {donateStep === "form" && (
                                <div className="p-5 flex flex-col gap-5">

                                    {/* ── Amount section ── */}
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-text mb-3">
                                            Select Amount <span className="text-brand-green">(GHS)</span>
                                        </p>
                                        {/* Quick amounts */}
                                        <div className="grid grid-cols-5 gap-2 mb-3">
                                            {QUICK_AMOUNTS.map(a => (
                                                <button
                                                    key={a}
                                                    onClick={() => setAmount(String(a))}
                                                    className={cn(
                                                        "py-2.5 rounded-2xl text-xs font-black border-2 transition-all active:scale-95",
                                                        amount === String(a)
                                                            ? "bg-brand-orange text-white border-brand-orange shadow-lg shadow-brand-orange/25 scale-[1.04]"
                                                            : "border-gray-200 text-slate-text bg-gray-50 hover:border-brand-orange/50 hover:text-brand-orange hover:bg-brand-orange/5"
                                                    )}
                                                >₵{a}</button>
                                            ))}
                                        </div>

                                        {/* Custom input */}
                                        <div className="relative group">
                                            <div className={cn(
                                                "absolute inset-0 rounded-2xl transition-all pointer-events-none",
                                                amount && Number(amount) > 0
                                                    ? "bg-gradient-to-r from-brand-green/20 to-brand-orange/10 blur-sm scale-[1.02]"
                                                    : "bg-transparent"
                                            )} />
                                            <div className="relative flex items-center bg-gray-50 border-2 border-gray-100 focus-within:border-brand-green rounded-2xl transition-all overflow-hidden">
                                                <span className="pl-4 text-2xl font-black text-brand-green shrink-0 select-none">₵</span>
                                                <input
                                                    type="number"
                                                    value={amount}
                                                    onChange={e => setAmount(e.target.value)}
                                                    placeholder="0.00"
                                                    className="flex-1 bg-transparent py-4 px-3 font-black text-foreground outline-none text-2xl placeholder:text-gray-300 placeholder:font-black"
                                                />
                                                {amount && Number(amount) > 0 && (
                                                    <span className="pr-4 text-[10px] font-black text-brand-green uppercase tracking-wider whitespace-nowrap">GHS</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* ── Network Provider Selection ── */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-text">Select Network</p>
                                            <a href={`tel:${donateTarget.phone}`} className="text-[10px] font-black uppercase tracking-widest text-brand-green hover:underline">Contact Center for Details</a>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { id: "mtn", name: "MTN", color: "bg-[#FFCC00]", textColor: "text-black" },
                                                { id: "telecel", name: "Telecel", color: "bg-[#E60000]", textColor: "text-white" },
                                                { id: "at", name: "AT", color: "bg-[#004A99]", textColor: "text-white" },
                                            ].map(net => (
                                                <button
                                                    key={net.id}
                                                    onClick={() => setMomoNetwork(net.name)}
                                                    className={cn(
                                                        "relative h-12 rounded-2xl flex items-center justify-center transition-all overflow-hidden border-2",
                                                        momoNetwork === net.name
                                                            ? "border-brand-green scale-[1.02] shadow-lg"
                                                            : "border-gray-100 hover:border-gray-200"
                                                    )}
                                                >
                                                    <div className={cn("absolute inset-0 opacity-10", net.color)} />
                                                    <span className={cn("relative z-10 text-[11px] font-black italic tracking-tighter", momoNetwork === net.name ? "text-brand-green" : "text-slate-text")}>
                                                        {net.name}
                                                    </span>
                                                    {momoNetwork === net.name && (
                                                        <div className="absolute top-1 right-1">
                                                            <CheckCircle2 size={10} className="text-brand-green" />
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* ── Giving type segmented pill ── */}
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-text mb-2">Giving Type</p>
                                        <div className="relative bg-gray-100 rounded-2xl p-1 flex gap-1">
                                            {(donateTarget.givingTypes as GivingType[]).map(g => (
                                                <button
                                                    key={g}
                                                    onClick={() => setGivingIntent(g)}
                                                    className={cn(
                                                        "flex-1 py-2.5 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2",
                                                        givingIntent === g
                                                            ? "bg-brand-green text-white shadow-md shadow-brand-green/30"
                                                            : "text-slate-text hover:text-foreground"
                                                    )}
                                                >
                                                    {g === "Zakat" ? (
                                                        <><span className="text-base leading-none">🌙</span> Pay Zakat</>
                                                    ) : (
                                                        <><Heart size={13} className={givingIntent === g ? "text-white" : "text-brand-orange"} /> Give Sadaqah</>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* ── Anonymous toggle ── */}
                                    <button
                                        onClick={() => setAnonymous(!anonymous)}
                                        className={cn(
                                            "w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left",
                                            anonymous
                                                ? "bg-brand-green/5 border-brand-green/25"
                                                : "bg-gray-50 border-gray-100 hover:border-gray-200"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all",
                                            anonymous ? "bg-brand-green text-white shadow-md shadow-brand-green/25" : "bg-gray-200 text-slate-text"
                                        )}>
                                            {anonymous ? <Lock size={16} /> : <Unlock size={16} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-black text-foreground">Donate Anonymously</p>
                                            <p className="text-[11px] text-slate-text mt-0.5 leading-snug">
                                                {anonymous ? "🤫 Only Allah knows your identity." : "Your name is shared with the center."}
                                            </p>
                                        </div>
                                        {/* toggle pill */}
                                        <div className={cn(
                                            "w-12 h-6 rounded-full transition-all relative shrink-0 border-2",
                                            anonymous ? "bg-brand-green border-brand-green" : "bg-gray-200 border-gray-200"
                                        )}>
                                            <span className={cn(
                                                "absolute top-[2px] w-4 h-4 bg-white rounded-full shadow-sm transition-all",
                                                anonymous ? "left-[26px]" : "left-[2px]"
                                            )} />
                                        </div>
                                    </button>

                                    {/* ── Security strip ── */}
                                    <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5">
                                        <Smartphone size={14} className="text-slate-text shrink-0" />
                                        <div className="flex-1">
                                            <p className="text-[10px] text-slate-text">
                                                Payments processed securely via <strong className="text-foreground">Mobile Money (Momo)</strong>
                                            </p>
                                        </div>
                                        <span className="text-[8px] font-black uppercase tracking-wider text-brand-green bg-brand-green/10 px-1.5 py-0.5 rounded-full shrink-0">
                                            MTN / Telecel / AT
                                        </span>
                                    </div>

                                    {/* ── Pay button ── */}
                                    <button
                                        disabled={!amount || Number(amount) <= 0 || !momoNetwork}
                                        onClick={() => setDonateStep("confirm")}
                                        className="relative w-full overflow-hidden group bg-brand-green text-white py-4 font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 rounded-2xl active:scale-[0.99] transition-all shadow-xl shadow-brand-green/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                                        style={{ background: amount && Number(amount) > 0 && momoNetwork ? "linear-gradient(135deg,#16a34a,#22c55e)" : undefined }}
                                    >
                                        {/* Shimmer overlay */}
                                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                                        <span className="relative flex items-center gap-2">
                                            <Lock size={14} />
                                            Pay {amount && Number(amount) > 0 ? `₵${Number(amount).toLocaleString()}` : ""} Securely
                                            <ArrowRight size={16} />
                                        </span>
                                    </button>
                                </div>
                            )}


                            {donateStep === "confirm" && (
                                <div className="p-5 flex flex-col gap-5">
                                    <div className="bg-gray-50 rounded-2xl p-5 flex flex-col gap-3">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-text">Review Your Donation</p>
                                        {[
                                            { label: "To", value: donateTarget.name },
                                            { label: "Amount", value: `₵${Number(amount).toLocaleString()} GHS` },
                                            { label: "Type", value: givingIntent === "Zakat" ? "Pay Zakat" : "Give Sadaqah" },
                                            { label: "Identity", value: anonymous ? "Anonymous" : "Congo Musah" },
                                            { label: "Via", value: `Momo (${momoNetwork})` },
                                        ].map(({ label, value }) => (
                                            <div key={label} className="flex justify-between items-center border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                                                <span className="text-sm font-bold text-slate-text">{label}</span>
                                                <span className={cn("text-sm font-black", label === "Amount" ? "text-brand-green text-lg" : "text-foreground")}>{value}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex items-start gap-2 bg-brand-orange/5 border border-brand-orange/20 rounded-xl p-3">
                                        <Info size={12} className="text-brand-orange shrink-0 mt-0.5" />
                                        <p className="text-[11px] text-slate-text leading-relaxed">
                                            By confirming, you authorise our secure gateway to process this transaction via your **Mobile Money** wallet. A receipt will be saved to your Transparency Tracker.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setDonateStep("success")}
                                        className="w-full bg-brand-orange text-white py-4 font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 rounded-2xl hover:bg-brand-orange-hover active:scale-[0.99] transition-all shadow-lg shadow-brand-orange/20"
                                    >
                                        <Heart size={16} /> Confirm Donation
                                    </button>
                                    <button onClick={() => setDonateStep("form")} className="text-slate-text text-xs font-black uppercase tracking-widest hover:text-brand-green text-center">← Edit Amount</button>
                                </div>
                            )}

                            {donateStep === "success" && (
                                <div className="p-8 flex flex-col items-center text-center gap-5">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", bounce: 0.45, delay: 0.1 }}
                                        className="w-20 h-20 bg-brand-green rounded-full text-white flex items-center justify-center shadow-xl shadow-brand-green/30"
                                    >
                                        <CheckCircle2 size={40} />
                                    </motion.div>
                                    <div>
                                        <h3 className="text-2xl font-heading font-black uppercase tracking-tight text-foreground mb-1">JazakAllah Khayran</h3>
                                        <p className="text-slate-text text-sm leading-relaxed">
                                            Your {givingIntent} of <strong>₵{Number(amount).toLocaleString()}</strong> to <strong>{donateTarget.name}</strong> was processed.
                                            {anonymous && " Your identity was kept anonymous."}
                                        </p>
                                    </div>
                                    <div className="w-full bg-brand-green/5 border border-brand-green/15 rounded-xl p-4">
                                        <p className="text-[11px] text-slate-text leading-relaxed">
                                            A receipt has been saved to your <strong>Transparency Tracker</strong>. You can track the impact of this donation from your dashboard.
                                        </p>
                                    </div>
                                    <button onClick={closeModal} className="w-full bg-brand-green text-white py-3 font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-brand-green-light active:scale-[0.99] transition-all">
                                        Done
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
