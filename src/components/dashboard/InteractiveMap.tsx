





























"use client";

import React, { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { MapPin, Navigation } from "lucide-react";

// Fix for default marker icons in Leaflet with Next.js
const icon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

const locations = [
    { id: 1, name: "Central Mosque Accra", position: [5.5593, -0.2057] as [number, number], description: "Verified Zakat Collection Point" },
    { id: 2, name: "Al-Barakah Charity", position: [5.5800, -0.1900] as [number, number], description: "Supporting local families" },
    { id: 3, name: "Madina Community Center", position: [5.6685, -0.1650] as [number, number], description: "Community outreach program" },
];

export default function InteractiveMap() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="h-full w-full bg-light-gray animate-pulse" />;

    return (
        <div className="h-full w-full relative group">
            <MapContainer
                center={[5.6037, -0.1870]}
                zoom={12}
                scrollWheelZoom={false}
                className="h-full w-full z-0"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {locations.map((loc) => (
                    <Marker key={loc.id} position={loc.position} icon={icon}>
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

            {/* Discover Nearby Overlay */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[400] pointer-events-none">
                <button className="bg-brand-green text-white px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest shadow-2xl hover:bg-brand-green-light transition-all flex items-center gap-2 active:scale-95 pointer-events-auto">
                    <Navigation size={14} className="animate-pulse" />
                    Discover Nearby
                </button>
            </div>
        </div>
    );
}
