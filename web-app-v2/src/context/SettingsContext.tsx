import { createContext, useContext, useState, type ReactNode } from 'react';

interface SettingsContextType {
    n8nBaseUrl: string;
    setN8nBaseUrl: (url: string) => void;
    isTestMode: boolean;
    setIsTestMode: (isTest: boolean) => void;
    resetToDefaults: () => void;
}

const DEFAULT_N8N_BASE = import.meta.env.VITE_N8N_WEBHOOK_BASE || 'http://localhost:5678/webhook';

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
    // Inicializar desde localStorage o usar valores por defecto
    const [n8nBaseUrl, setN8nBaseUrlState] = useState<string>(() => {
        const saved = localStorage.getItem('n8nBaseUrl');
        return saved !== null ? saved : DEFAULT_N8N_BASE;
    });

    const [isTestMode, setIsTestModeState] = useState<boolean>(() => {
        const saved = localStorage.getItem('n8nTestMode');
        return saved !== null ? JSON.parse(saved) : true; // Por defecto true para desarrollo
    });

    // Guardar en localStorage cuando cambien
    const setN8nBaseUrl = (url: string) => {
        setN8nBaseUrlState(url);
        localStorage.setItem('n8nBaseUrl', url);
    };

    const setIsTestMode = (isTest: boolean) => {
        setIsTestModeState(isTest);
        localStorage.setItem('n8nTestMode', JSON.stringify(isTest));
    };

    const resetToDefaults = () => {
        setN8nBaseUrl(DEFAULT_N8N_BASE);
        setIsTestMode(true);
    };

    return (
        <SettingsContext.Provider value={{ n8nBaseUrl, setN8nBaseUrl, isTestMode, setIsTestMode, resetToDefaults }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
