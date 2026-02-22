"use client";

import React from "react";
import { Hammer } from "lucide-react";

export default function ComingSoon({ title }: { title: string }) {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-brand-green/10 rounded-full flex items-center justify-center text-brand-green mb-6 animate-pulse">
                <Hammer size={40} />
            </div>
            <h1 className="text-3xl font-heading font-bold text-foreground mb-2">{title}</h1>
            <p className="text-slate-text max-w-md">
                We're currently building this module to provide you with the best Zakat experience. Please check back later!
            </p>
            <button
                onClick={() => window.history.back()}
                className="mt-8 text-brand-green font-bold hover:underline"
            >
                Go back to Overview
            </button>
        </div>
    );
}
