"use client";

import { useState, useEffect } from "react";
import { Bell, Search, Menu } from "lucide-react";
import { jwtDecode } from "jwt-decode";

interface DashboardHeaderProps {
    onMenuClick: () => void;
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
    const [userEmail, setUserEmail] = useState<string>("Cargando...");
    const [initials, setInitials] = useState<string>("");

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            try {
                const decoded: { email?: string } = jwtDecode(token);
                const email = decoded.email;

                if (email) {
                    setUserEmail(email);
                    setInitials(email.substring(0, 2).toUpperCase());
                } else {
                    setUserEmail("Usuario");
                    setInitials("US");
                }
            } catch (error) {
                console.error("Error decoding token:", error);
                setUserEmail("Usuario");
                setInitials("US");
            }
        } else {
            setUserEmail("Invitado");
            setInitials("INV");
        }
    }, []);

    return (
        <header className="h-20 flex items-center justify-between px-4 lg:px-8 bg-neutral-950/50 backdrop-blur-xl border-b border-neutral-800/50 sticky top-0 z-10">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 rounded-xl border border-neutral-800 bg-neutral-900/50 text-neutral-400 hover:text-white transition-all"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <div className="hidden sm:block">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-white to-neutral-500 bg-clip-text text-transparent">
                        Bienvenido de nuevo
                    </h1>
                    <p className="text-sm text-neutral-500">Gestiona tus eventos de forma profesional</p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button className="hidden md:flex p-2.5 rounded-xl border border-neutral-800 bg-neutral-900/50 text-neutral-400 hover:text-white hover:border-neutral-700 transition-all">
                    <Search className="w-5 h-5" />
                </button>
                <button className="p-2.5 rounded-xl border border-neutral-800 bg-neutral-900/50 text-neutral-400 hover:text-white hover:border-neutral-700 transition-all relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-indigo-500 border-2 border-neutral-950 rounded-full"></span>
                </button>
                <div className="h-10 w-[1px] bg-neutral-800 mx-2 hidden sm:block"></div>
                <button className="flex items-center gap-3 pl-1 pr-3 py-1 rounded-full border border-neutral-800 bg-neutral-900/30 hover:bg-neutral-900/50 transition-all group max-w-[200px] overflow-hidden">
                    <div className="w-8 h-8 min-w-[32px] rounded-full bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center text-white font-bold text-xs ring-2 ring-neutral-900">
                        {initials}
                    </div>
                    <span className="text-sm font-medium text-neutral-300 group-hover:text-white transition-colors truncate">
                        {userEmail}
                    </span>
                </button>
            </div>
        </header>
    );
}
