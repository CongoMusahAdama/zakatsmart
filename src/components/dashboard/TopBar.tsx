"use client";

import React, { useEffect, useState } from "react";
import { Search, Bell, User, MessageSquare } from "lucide-react";
import { useSearch } from "@/context/SearchContext";
import { userStorage, type AuthUser } from "@/lib/api";

export default function TopBar() {
    const { searchQuery, setSearchQuery } = useSearch();
    const [user, setUser] = useState<AuthUser | null>(null);

    useEffect(() => {
        setUser(userStorage.get());
    }, []);

    const displayName = user?.fullName || "Guest";
    const role = user?.role
        ? user.role.charAt(0).toUpperCase() + user.role.slice(1) + " Member"
        : "Member";

    return (
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-6 lg:px-10 sticky top-0 z-30">
            {/* Search Bar */}
            <div className="flex-1 max-w-md hidden md:block">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-text group-focus-within:text-brand-green transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search anything..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-light-gray border-none rounded-none py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-brand-green transition-all outline-none"
                    />
                </div>
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-4 ml-auto">
                <button className="p-2 text-slate-text hover:bg-light-gray rounded-full transition-all active:scale-95 relative">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-brand-orange rounded-full border-2 border-white"></span>
                </button>

                <button className="p-2 text-slate-text hover:bg-light-gray rounded-full transition-all active:scale-95">
                    <MessageSquare size={20} />
                </button>

                <div className="h-8 w-[1px] bg-gray-100 mx-2"></div>

                <div className="flex items-center gap-3 cursor-pointer group">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-foreground leading-tight">{displayName}</p>
                        <p className="text-[10px] text-slate-text font-medium uppercase tracking-wider">{role}</p>
                    </div>
                    <div className="w-10 h-10 rounded-none bg-brand-green/10 flex items-center justify-center text-brand-green border border-brand-green/20 overflow-hidden group-hover:border-brand-green transition-all">
                        <User size={20} />
                    </div>
                </div>
            </div>
        </header>
    );
}
