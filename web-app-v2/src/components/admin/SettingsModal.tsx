import { useState, useEffect } from 'react';
import { X, Save, RotateCcw, MonitorPlay, FlaskConical } from 'lucide-react';
import { Card, Button } from '../ui';
import { useSettings } from '../../context/SettingsContext';

interface SettingsModalProps {
    onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
    const { n8nBaseUrl, setN8nBaseUrl, isTestMode, setIsTestMode, resetToDefaults } = useSettings();

    // Estados temporales para el modal antes de guardar
    const [tempUrl, setTempUrl] = useState(n8nBaseUrl);
    const [tempTestMode, setTempTestMode] = useState(isTestMode);

    useEffect(() => {
        setTempUrl(n8nBaseUrl);
        setTempTestMode(isTestMode);
    }, [n8nBaseUrl, isTestMode]);

    const handleSave = () => {
        setN8nBaseUrl(tempUrl);
        setIsTestMode(tempTestMode);
        onClose();
    };

    const handleReset = () => {
        resetToDefaults();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="w-full max-w-md animate-scale-up shadow-2xl border-white/10">
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                        <MonitorPlay size={20} className="text-brand-400" />
                        Configuración de Entorno (n8n)
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-md text-text-muted hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Toggle Modo Pruebas */}
                    <div className="bg-surface-3 border border-white/5 rounded-xl p-4 flex items-center justify-between">
                        <div>
                            <div className="font-medium text-text-primary flex items-center gap-2">
                                <FlaskConical size={16} className={tempTestMode ? "text-amber-400" : "text-text-muted"} />
                                Modo de Pruebas
                            </div>
                            <div className="text-xs text-text-secondary mt-1">
                                Usa el endpoint de test en n8n para no afectar datos reales.
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setTempTestMode(!tempTestMode)}
                            className={`
                                relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-background
                                ${tempTestMode ? 'bg-amber-500' : 'bg-surface-1 border-white/10'}
                            `}
                            role="switch"
                            aria-checked={tempTestMode}
                        >
                            <span className="sr-only">Usar modo de pruebas</span>
                            <span
                                aria-hidden="true"
                                className={`
                                    pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                                    ${tempTestMode ? 'translate-x-5' : 'translate-x-0'}
                                `}
                            />
                        </button>
                    </div>

                    {/* URL Base */}
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                            Ruta Base de Webhooks n8n
                        </label>
                        <input
                            type="url"
                            value={tempUrl}
                            onChange={(e) => setTempUrl(e.target.value)}
                            className="w-full px-4 py-3 bg-surface-1 border border-white/10 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all font-mono text-sm"
                            placeholder="Ej: http://192.168.1.10:5678/webhook"
                        />
                        <div className="mt-2 text-xs text-text-muted">
                            Ruta activa actual: <br />
                            <code className="text-brand-300 bg-brand-500/10 px-1 py-0.5 rounded">
                                {tempUrl.replace(/\/$/, '')}{tempTestMode && !tempUrl.includes('test') ? '-test' : ''}/*
                            </code>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between p-4 border-t border-white/10 bg-surface-3/30 rounded-b-xl">
                    <Button
                        variant="ghost"
                        onClick={handleReset}
                        className="text-text-muted hover:text-red-400"
                        icon={<RotateCcw size={16} />}
                    >
                        Restaurar Specs
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                        <Button variant="brand" onClick={handleSave} icon={<Save size={16} />}>
                            Guardar
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
