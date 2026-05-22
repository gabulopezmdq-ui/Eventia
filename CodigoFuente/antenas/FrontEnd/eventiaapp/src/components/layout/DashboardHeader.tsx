"use client";

import { useState, useEffect } from "react";
import { Bell, Search, Menu, ChevronDown, Building2, User, Check } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import ThemeToggle from "@/src/components/ui/ThemeToggle";
import { useAuth } from "@/src/context/AuthContext";
import { useRouter } from "next/navigation";

interface DashboardHeaderProps {
    onMenuClick: () => void;
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
    const { espacios, selectedEspacioId, selectEspacio, cuenta } = useAuth();
    const router = useRouter();
    const [dropdownOpen, setDropdownOpen] = useState(false);
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

    // Calcular datos del espacio seleccionado
    const activeSpace = espacios?.find(e => e.id_cuenta === selectedEspacioId);
    const activeSpaceName = selectedEspacioId === null 
        ? "Espacio Personal" 
        : (cuenta?.nombre_cuenta || activeSpace?.nombre_cuenta || "Mi Cuenta B2B");

    return (
        <header className="h-20 flex items-center justify-between px-4 lg:px-8 bg-white/50 dark:bg-neutral-950/50 backdrop-blur-xl border-b border-neutral-200 dark:border-neutral-800/50 sticky top-0 z-10">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-all"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <div className="hidden sm:block">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-neutral-900 dark:from-white to-neutral-400 dark:to-neutral-500 bg-clip-text text-transparent">
                        Bienvenido de nuevo
                    </h1>
                    <p className="text-sm text-neutral-500">Gestiona tus eventos de forma profesional</p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {/* Selector rápido de espacios */}
                {espacios && espacios.length > 1 && (
                    <div className="relative">
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800/80 bg-white/50 dark:bg-neutral-900/40 hover:bg-neutral-100 dark:hover:bg-neutral-900/80 transition-all text-xs font-semibold text-neutral-700 dark:text-neutral-300"
                        >
                            {selectedEspacioId === null ? (
                                <User className="w-3.5 h-3.5 text-indigo-400" />
                            ) : (
                                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                            )}
                            <span className="max-w-[120px] truncate">{activeSpaceName}</span>
                            <ChevronDown className="w-3.5 h-3.5 text-neutral-400 transition-colors" />
                        </button>

                        {/* Overlay invisible para cerrar el menú haciendo clic afuera */}
                        {dropdownOpen && (
                            <div
                                className="fixed inset-0 z-20 cursor-default"
                                onClick={() => setDropdownOpen(false)}
                            />
                        )}

                        {/* Dropdown Menu */}
                        {dropdownOpen && (
                            <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-xl shadow-2xl p-1.5 space-y-1 z-30 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="px-3 py-1.5 text-[10px] font-bold text-neutral-400 uppercase tracking-wider border-b border-neutral-100 dark:border-neutral-900 mb-1">
                                    Cambiar de Espacio
                                </div>

                                {/* Opción Personal (B2C) */}
                                <button
                                    onClick={() => {
                                        selectEspacio(null);
                                        setDropdownOpen(false);
                                        router.push('/dashboard');
                                    }}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all ${
                                        selectedEspacioId === null
                                            ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold'
                                            : 'hover:bg-neutral-100 dark:hover:bg-neutral-900/60 text-neutral-600 dark:text-neutral-300'
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                                            selectedEspacioId === null ? 'bg-indigo-500/20' : 'bg-neutral-100 dark:bg-neutral-900'
                                        }`}>
                                            <User className="w-4 h-4 text-indigo-500" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold truncate">Mi Espacio Personal</p>
                                            <p className="text-[10px] text-neutral-400 truncate">Eventos sociales</p>
                                        </div>
                                    </div>
                                    {selectedEspacioId === null && <Check className="w-4 h-4 text-indigo-500 flex-shrink-0" />}
                                </button>

                                {/* Opciones B2B (Cuentas) */}
                                {espacios
                                    .filter(space => space.tipo === 'CUENTA' && space.id_cuenta !== null)
                                    .map((space) => {
                                        const isSelected = selectedEspacioId === space.id_cuenta;
                                        const isAdmin = space.rol_cuenta === 'ACCOUNT_ADMIN';
                                        return (
                                            <button
                                                key={space.id_cuenta}
                                                onClick={() => {
                                                    selectEspacio(space.id_cuenta);
                                                    setDropdownOpen(false);
                                                    router.push('/dashboard/cuenta');
                                                }}
                                                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all ${
                                                    isSelected
                                                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                                                        : 'hover:bg-neutral-100 dark:hover:bg-neutral-900/60 text-neutral-600 dark:text-neutral-300'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                                                        isSelected ? 'bg-emerald-500/20' : 'bg-neutral-100 dark:bg-neutral-900'
                                                    }`}>
                                                        <Building2 className="w-4 h-4 text-emerald-500" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-semibold truncate">
                                                            {space.nombre_cuenta || space.nombre}
                                                        </p>
                                                        <p className="text-[10px] text-neutral-400 truncate uppercase tracking-wider">
                                                            {isAdmin ? 'ADMIN' : 'STAFF'}
                                                        </p>
                                                    </div>
                                                </div>
                                                {isSelected && <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
                                            </button>
                                        );
                                    })}
                            </div>
                        )}
                    </div>
                )}

                {/* Theme Toggle */}
                <ThemeToggle />

                <button className="hidden md:flex p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:border-neutral-300 dark:hover:border-neutral-700 transition-all">
                    <Search className="w-5 h-5" />
                </button>
                <button className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:border-neutral-300 dark:hover:border-neutral-700 transition-all relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-indigo-500 border-2 border-white dark:border-neutral-950 rounded-full"></span>
                </button>
                <div className="h-10 w-[1px] bg-neutral-200 dark:bg-neutral-800 mx-1 hidden sm:block"></div>
                <button className="flex items-center gap-3 pl-1 pr-3 py-1 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white/30 dark:bg-neutral-900/30 hover:bg-neutral-100 dark:hover:bg-neutral-900/50 transition-all group max-w-[200px] overflow-hidden">
                    <div className="w-8 h-8 min-w-[32px] rounded-full bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center text-white font-bold text-xs ring-2 ring-white dark:ring-neutral-900">
                        {initials}
                    </div>
                    <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors truncate">
                        {userEmail}
                    </span>
                </button>
            </div>
        </header>
    );
}

