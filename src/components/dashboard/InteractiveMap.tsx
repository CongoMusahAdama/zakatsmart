"use client";

import React, { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { Navigation } from "lucide-react";

/* ── Fix Leaflet default icon paths broken by Next.js bundler ── */
const defaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

const locations = [
    { id: 1, name: "Central Mosque Accra", position: [5.5593, -0.2057] as [number, number], description: "Verified Zakat Collection Point" },
    { id: 2, name: "Al-Barakah Charity", position: [5.5800, -0.1900] as [number, number], description: "Supporting local families" },
    { id: 3, name: "Madina Community Center", position: [5.6685, -0.1650] as [number, number], description: "Community outreach program" },
];

export default function InteractiveMap() {
    /*
     * React 18 StrictMode mounts → unmounts → remounts every component in
     * development. Leaflet creates internal DOM nodes on first mount that it
     * never cleans up, so when the second mount tries to call appendChild it
     * finds an undefined container.
     *
     * Fix: track a `mapKey` integer in a ref. The effect increments it on
     * every *cleanup* (i.e. each unmount). Because state updates in cleanup
     * are batched before the next paint, the MapContainer is given a brand-new
     * `key` prop and React fully unmounts + remounts it, giving Leaflet a
     * clean DOM node every time.
     */
    const mapKeyRef = useRef(0);
    const [mapKey, setMapKey] = useState(0);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        return () => {
            /* On cleanup (unmount / StrictMode teardown) bump the key so the
               next render forces a completely fresh MapContainer. */
            mapKeyRef.current += 1;
            setMapKey(mapKeyRef.current);
            setMounted(false);
        };
    }, []);

    if (!mounted) {
        return (
            <div className="h-full w-full bg-brand-green/5 animate-pulse flex items-center justify-center">
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-text">
                    Loading Map…
                </span>
            </div>
        );
    }

    return (
        <div className="h-full w-full relative group" style={{ height: "100%", width: "100%" }}>
            <MapContainer
                key={mapKey}
                center={[5.6037, -0.1870]}
                zoom={12}
                scrollWheelZoom={false}
                className="h-full w-full z-0"
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {locations.map((loc) => (
                    <Marker key={loc.id} position={loc.position} icon={defaultIcon}>
                        <Popup>
                            <div className="p-1 font-body">
                                <h4 className="font-bold text-foreground text-sm mb-1">{loc.name}</h4>
                                <p className="text-xs text-slate-text">{loc.description}</p>
                                <button className="mt-2 w-full bg-brand-green text-white text-[10px] font-bold py-1 px-2 rounded-none hover:bg-brand-green-light transition-all flex items-center justify-center gap-1">
                                    <Navigation size={10} /> Get Directions
                                </button>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Discover Nearby overlay — hidden on mobile, compact on sm+ */}
            <div className="hidden sm:flex absolute bottom-3 left-1/2 -translate-x-1/2 z-[400] pointer-events-none">
                <button className="bg-brand-green text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest shadow-2xl hover:bg-brand-green-light transition-all flex items-center gap-1.5 active:scale-95 pointer-events-auto">
                    <Navigation size={12} className="animate-pulse" />
                    <span>Discover Nearby</span>
                </button>
            </div>
        </div>
    );
}
