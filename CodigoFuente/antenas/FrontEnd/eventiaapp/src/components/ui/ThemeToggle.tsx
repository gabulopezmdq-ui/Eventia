'use client';

import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/src/context/ThemeContext';

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    const themes = [
        { value: 'light' as const, icon: Sun, label: 'Claro' },
        { value: 'dark' as const, icon: Moon, label: 'Oscuro' },
        { value: 'system' as const, icon: Monitor, label: 'Sistema' },
    ];

    return (
        <div className="flex items-center gap-1 p-1 rounded-lg bg-neutral-200 dark:bg-neutral-800">
            {themes.map(({ value, icon: Icon, label }) => (
                <button
                    key={value}
                    type="button"
                    onClick={() => setTheme(value)}
                    className={`p-2 rounded-md transition-all ${theme === value
                        ? 'bg-white dark:bg-neutral-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
                        }`}
                    title={label}
                    aria-label={`Cambiar a modo ${label}`}
                >
                    <Icon className="w-4 h-4" />
                </button>
            ))}
        </div>
    );
}
