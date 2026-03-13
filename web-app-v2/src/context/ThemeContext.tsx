import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

/* ═══════════════════════════════════════════════════════
   Contexto de Tema — Modo Oscuro/Claro
   ═══════════════════════════════════════════════════════ */

type Theme = 'dark' | 'light';

interface ThemeCtx {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeCtx>({ theme: 'light', toggleTheme: () => { } });

export function ThemeProvider({ children }: { children: ReactNode }) {
    // Cargar tema inicial de localStorage o predeterminar 'light'
    const [theme, setTheme] = useState<Theme>(() => {
        const saved = localStorage.getItem('app-theme');
        return (saved as Theme) || 'light';
    });

    // Sincronizar clase CSS y persistencia al cambiar el tema
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('app-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
