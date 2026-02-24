'use client';

import React from 'react';
import { ShieldCheck, Lock, Globe, Heart } from 'lucide-react';

const Trust = () => {
    const trusts = [
        { icon: <ShieldCheck size={32} />, label: 'SSL Secured', sub: '256-bit Encryption' },
        { icon: <Globe size={32} />, label: 'Verified Charities', sub: '100% Vetted Orgs' },
        { icon: <Lock size={32} />, label: 'Anonymous Giving', sub: 'Privacy First' },
        { icon: <Heart size={32} />, label: '1:1 Giving', sub: '100% to Recipients' },
    ];

    return (
        <section className="py-20 bg-brand-green" id="trust">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {trusts.map((t, i) => (
                        <div key={i} className="flex flex-col items-center text-center gap-4 group cursor-default">
                            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:bg-brand-orange group-hover:scale-110 transition-all duration-300">
                                {t.icon}
                            </div>
                            <div className="flex flex-col gap-1">
                                <h4 className="font-bold text-white text-base tracking-tight group-hover:text-brand-orange transition-colors">
                                    {t.label}
                                </h4>
                                <p className="text-white/50 text-xs font-medium">
                                    {t.sub}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Trust;

