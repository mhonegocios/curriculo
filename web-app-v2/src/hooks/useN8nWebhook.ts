import { useState, useCallback } from 'react';
import { useSettings } from '../context/SettingsContext';

/* ═══════════════════════════════════════════════════════
   Hook: useN8nWebhook
   Llama webhooks de n8n para generaciones IA y procesos
   ═══════════════════════════════════════════════════════ */

export function useN8nWebhook<T = any>(endpoint: string, fallbackIsTest: boolean = false) {
    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Obtener la url y el modo test del contexto
    const { n8nBaseUrl, isTestMode } = useSettings();

    const trigger = useCallback(async (payload: Record<string, unknown>) => {
        setIsLoading(true);
        setError(null);
        setData(null);
        try {
            const actualTestMode = isTestMode !== undefined ? isTestMode : fallbackIsTest;
            let baseUrl = n8nBaseUrl;

            // Reemplazar /webhook por /webhook-test si isTestMode es true
            if (actualTestMode && baseUrl.includes('/webhook') && !baseUrl.includes('webhook-test')) {
                baseUrl = baseUrl.replace('/webhook', '/webhook-test');
            }

            // Remueve el trailing slash para evitar dobles barras
            const normalizedBase = baseUrl.replace(/\/$/, '');
            const normalizedEndpoint = endpoint.replace(/^\//, '');
            const url = `${normalizedBase}/${normalizedEndpoint}`;
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
            const result = await res.json();
            setData(result as T);
            return result as T;
        } catch (err: any) {
            const msg = err.message || 'Error al conectar con n8n';
            setError(msg);
            console.error(`Error webhook n8n [${endpoint}]:`, err);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [endpoint]);

    const reset = useCallback(() => {
        setData(null);
        setError(null);
    }, []);

    return { trigger, data, isLoading, error, reset };
}
