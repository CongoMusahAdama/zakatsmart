"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, Polyline } from "react-leaflet";
import L from "leaflet";
import { LocateFixed, Loader2, X, Route } from "lucide-react";

/* ── Fix Leaflet default icon paths broken by Next.js bundler ── */
const defaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

/* ── Custom "You Are Here" pulse icon ── */
function createUserIcon() {
    return L.divIcon({
        className: "",
        html: `
            <div style="position:relative;width:36px;height:36px;">
                <div style="
                    position:absolute;inset:0;
                    background:rgba(34,197,94,0.15);
                    border-radius:50%;
                    animation:userPulseRing 2s ease-out infinite;
                "></div>
                <div style="
                    position:absolute;inset:6px;
                    background:#16a34a;
                    border-radius:50%;
                    border:3px solid #fff;
                    box-shadow:0 2px 8px rgba(22,163,74,0.5);
                "></div>
            </div>
            <style>
                @keyframes userPulseRing {
                    0%  { transform:scale(1); opacity:.9; }
                    100%{ transform:scale(2.4); opacity:0; }
                }
            </style>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -20],
    });
}

/* ── Destination pin icon ── */
function createDestIcon() {
    return L.divIcon({
        className: "",
        html: `
            <div style="width:28px;height:36px;display:flex;align-items:center;justify-content:center;">
                <svg viewBox="0 0 24 32" width="28" height="36" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 20 12 20S24 21 24 12C24 5.373 18.627 0 12 0z"
                          fill="#f97316" stroke="#fff" stroke-width="1.5"/>
                    <circle cx="12" cy="12" r="4.5" fill="white"/>
                </svg>
            </div>
        `,
        iconSize: [28, 36],
        iconAnchor: [14, 36],
        popupAnchor: [0, -38],
    });
}

// No hardcoded fallback locations — all map markers are sourced live from OpenStreetMap.

/* ── Map Events Tracker ── */
function MapEvents({ onMove }: { onMove: (coords: [number, number]) => void }) {
    const map = useMap();
    useEffect(() => {
        const handleMove = () => {
            const center = map.getCenter();
            onMove([center.lat, center.lng]);
        };
        map.on("moveend", handleMove);
        return () => { map.off("moveend", handleMove); };
    }, [map, onMove]);
    return null;
}

/* ── Fly-to helper ── */
function FlyToLocation({ coords }: { coords: [number, number] | null }) {
    const map = useMap();
    const prevRef = useRef<string | null>(null);
    useEffect(() => {
        if (!coords) return;
        const key = coords.join(",");
        if (key === prevRef.current) return; // avoid re-flying same coords
        prevRef.current = key;
        map.flyTo(coords, 14, { duration: 1.6 });
    }, [coords, map]);
    return null;
}

/* ── Route layer: fetches OSRM route and draws it ── */
function RouteLayer({
    from,
    to,
    onLoading,
}: {
    from: [number, number];
    to: [number, number];
    onLoading: (v: boolean) => void;
}) {
    const map = useMap();
    const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
    const fetchedKey = useRef<string | null>(null);

    useEffect(() => {
        const key = `${from[0]},${from[1]},${to[0]},${to[1]}`;
        if (key === fetchedKey.current) return;
        fetchedKey.current = key;

        const [fromLat, fromLon] = from;
        const [toLat, toLon] = to;
        onLoading(true);

        fetch(
            `https://router.project-osrm.org/route/v1/driving/${fromLon},${fromLat};${toLon},${toLat}?overview=full&geometries=geojson`
        )
            .then((r) => r.json())
            .then((data) => {
                const raw: [number, number][] = data.routes?.[0]?.geometry?.coordinates ?? [];
                const leafletCoords: [number, number][] = raw.map(([ln, lt]) => [lt, ln]);
                setRouteCoords(leafletCoords);
                if (leafletCoords.length >= 2) {
                    map.fitBounds(L.latLngBounds([from, to]), { padding: [60, 80], animate: true, duration: 1.0 });
                }
            })
            .catch((err) => {
                console.warn("OSRM routing failed:", err);
                // Fallback: just fit bounds
                map.fitBounds(L.latLngBounds([from, to]), { padding: [60, 80], animate: true, duration: 1.0 });
            })
            .finally(() => onLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [from[0], from[1], to[0], to[1]]);

    if (!routeCoords.length) return null;

    return (
        <>
            {/* Shadow */}
            <Polyline positions={routeCoords} pathOptions={{ color: "#000", weight: 8, opacity: 0.08, lineCap: "round", lineJoin: "round" }} />
            {/* Main route */}
            <Polyline positions={routeCoords} pathOptions={{ color: "#16a34a", weight: 5, opacity: 0.9, lineCap: "round", lineJoin: "round" }} />
            {/* Dash overlay */}
            <Polyline positions={routeCoords} pathOptions={{ color: "#fff", weight: 2, opacity: 0.5, lineCap: "round", lineJoin: "round", dashArray: "10 18" }} />
        </>
    );
}

/* ── Types ── */
type GeoStatus = "idle" | "locating" | "success" | "denied" | "unavailable";

export interface ExternalLocation {
    id: number;
    name: string;
    position: [number, number];
    description: string;
    category?: string;
}

interface InteractiveMapProps {
    initialCenter?: [number, number];
    onLocationResolved?: (coords: [number, number]) => void;
    onLocationDenied?: () => void;
    externalLocations?: ExternalLocation[];
    routeDestination?: [number, number] | null;
    onClearRoute?: () => void;
    onCenterChange?: (coords: [number, number]) => void;
}

const ACCRA_CENTER: [number, number] = [5.6037, -0.1870];

export default function InteractiveMap({
    initialCenter,
    onLocationResolved,
    onLocationDenied,
    externalLocations,
    routeDestination,
    onClearRoute,
    onCenterChange,
}: InteractiveMapProps) {
    const [mounted, setMounted] = useState(false);

    /* Geo state */
    const [geoStatus, setGeoStatus] = useState<GeoStatus>("idle");
    const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
    const [flyTo, setFlyTo] = useState<[number, number] | null>(null);
    const [accuracy, setAccuracy] = useState<number | null>(null);
    const [userIcon, setUserIcon] = useState<L.DivIcon | null>(null);
    const [destIcon, setDestIcon] = useState<L.DivIcon | null>(null);

    /* Route state */
    const [routeLoading, setRouteLoading] = useState(false);

    const mapCenter = initialCenter ?? ACCRA_CENTER;
    const markers: ExternalLocation[] = externalLocations ?? [];
    const isRouting = !!(routeDestination && userCoords);

    /* Mount — note: NO map-key cycling; that causes the "container reused" error */
    useEffect(() => {
        setMounted(true);
        setUserIcon(createUserIcon());
        setDestIcon(createDestIcon());
        return () => {
            setMounted(false);
        };
    }, []);

    /* Auto-request on mount */
    useEffect(() => {
        if (mounted) requestLocation();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mounted]);

    function requestLocation() {
        if (!navigator.geolocation) {
            setGeoStatus("unavailable");
            onLocationDenied?.();
            return;
        }
        setGeoStatus("locating");
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
                setUserCoords(coords);
                setAccuracy(pos.coords.accuracy);
                setFlyTo(coords);
                setGeoStatus("success");
                onLocationResolved?.(coords);
            },
            (err) => {
                const status = err.code === 1 ? "denied" : "unavailable";
                setGeoStatus(status);
                onLocationDenied?.();
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        );
    }

    const handleRouteLoading = useCallback((v: boolean) => setRouteLoading(v), []);

    if (!mounted) {
        return (
            <div className="h-full w-full bg-brand-green/5 animate-pulse flex items-center justify-center">
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-text">Loading Map…</span>
            </div>
        );
    }

    return (
        <div className="h-full w-full relative" style={{ height: "100%", width: "100%" }}>
            {/* 
                IMPORTANT: Do NOT put a changing `key` on MapContainer.
                Changing the key during cleanup causes "Map container is being reused".
                react-leaflet v5 handles StrictMode lifecycle internally.
            */}
            <MapContainer
                center={mapCenter}
                zoom={12}
                scrollWheelZoom={false}
                className="h-full w-full z-0"
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Fly to user position (only when not routing) */}
                {!isRouting && <FlyToLocation coords={flyTo} />}

                {/* Track center changes */}
                {onCenterChange && <MapEvents onMove={onCenterChange} />}

                {/* Mosque / giving-zone markers — styled by category */}
                {markers.map((loc) => {
                    // Category-based colors
                    let iconColor = "#16a34a"; // Default brand-green
                    if (loc.category === "Education") iconColor = "#2563eb"; // Blue
                    if (loc.category === "Health") iconColor = "#e11d48"; // Rose
                    if (loc.category === "Food Support") iconColor = "#f59e0b"; // Amber

                    const customPin = L.divIcon({
                        className: "",
                        html: `
                            <div style="filter: drop-shadow(0 4px 12px rgba(0,0,0,0.15)); transform: translateY(-50%) transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
                                <svg viewBox="0 0 24 32" width="28" height="36" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 20 12 20S24 21 24 12C24 5.373 18.627 0 12 0z"
                                          fill="${iconColor}" stroke="#fff" stroke-width="1.8"/>
                                    <circle cx="12" cy="12" r="4.5" fill="white"/>
                                </svg>
                            </div>
                        `,
                        iconSize: [28, 36],
                        iconAnchor: [14, 36],
                        popupAnchor: [0, -40],
                    });

                    return (
                        <Marker key={loc.id} position={loc.position} icon={customPin}>
                            <Popup>
                                <div className="p-1 min-w-[140px]">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-[#666] mb-1 opacity-60">{loc.category || "Community"}</p>
                                    <h4 className="font-heading font-black text-foreground text-sm leading-tight mb-1">{loc.name}</h4>
                                    <p className="text-[10px] leading-relaxed text-slate-text/80">{loc.description.length > 80 ? loc.description.substring(0, 80) + "..." : loc.description}</p>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}

                {/* User location */}
                {userCoords && userIcon && (
                    <>
                        {accuracy && accuracy < 2000 && (
                            <Circle
                                center={userCoords}
                                radius={accuracy}
                                pathOptions={{ fillColor: "#22c55e", fillOpacity: 0.1, color: "#16a34a", weight: 1, dashArray: "4 4" }}
                            />
                        )}
                        <Marker position={userCoords} icon={userIcon} zIndexOffset={1000}>
                            <Popup>
                                <div className="p-1 font-body text-center">
                                    <p className="font-bold text-brand-green text-sm">📍 You are here</p>
                                    {accuracy && (
                                        <p className="text-[10px] text-slate-text mt-0.5">
                                            Accuracy ≈ {accuracy < 1000 ? `${Math.round(accuracy)} m` : `${(accuracy / 1000).toFixed(1)} km`}
                                        </p>
                                    )}
                                </div>
                            </Popup>
                        </Marker>
                    </>
                )}

                {/* Route polyline */}
                {isRouting && (
                    <RouteLayer from={userCoords!} to={routeDestination!} onLoading={handleRouteLoading} />
                )}

                {/* Destination pin */}
                {routeDestination && destIcon && (
                    <Marker position={routeDestination} icon={destIcon} zIndexOffset={900}>
                        <Popup>
                            <p className="text-sm font-bold text-foreground p-1">🏁 Destination</p>
                        </Popup>
                    </Marker>
                )}
            </MapContainer>

            {/* Route calculating banner */}
            {routeLoading && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[400] bg-white/95 backdrop-blur-sm border border-brand-green/20 shadow-xl rounded-full px-4 py-2 flex items-center gap-2 pointer-events-none">
                    <Loader2 size={12} className="animate-spin text-brand-green" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-green">Calculating route…</span>
                </div>
            )}

            {/* Route active banner */}
            {isRouting && !routeLoading && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[400] bg-brand-green text-white shadow-xl rounded-full px-4 py-2 flex items-center gap-2.5">
                    <Route size={12} className="shrink-0" />
                    <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Route active</span>
                    <button
                        onClick={onClearRoute}
                        className="ml-1 w-5 h-5 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all active:scale-90"
                    >
                        <X size={10} />
                    </button>
                </div>
            )}

            {/* Locate Me button */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[400] flex items-center gap-2">
                {geoStatus === "denied" && (
                    <div className="bg-white/90 backdrop-blur-sm border border-rose-200 text-rose-600 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md pointer-events-auto">
                        Location denied
                    </div>
                )}
                {geoStatus === "unavailable" && (
                    <div className="bg-white/90 backdrop-blur-sm border border-amber-200 text-amber-600 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md pointer-events-auto">
                        Location unavailable
                    </div>
                )}
                <button
                    onClick={requestLocation}
                    disabled={geoStatus === "locating"}
                    className="bg-brand-green text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest shadow-2xl hover:bg-brand-green-light transition-all flex items-center gap-1.5 active:scale-95 pointer-events-auto disabled:opacity-70 disabled:cursor-wait"
                >
                    {geoStatus === "locating" ? <Loader2 size={12} className="animate-spin" /> : <LocateFixed size={12} />}
                    <span>{geoStatus === "success" ? "Re-centre" : geoStatus === "locating" ? "Locating…" : "Locate Me"}</span>
                </button>
            </div>
        </div>
    );
}
