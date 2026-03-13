import { useState } from 'react';
import { Sparkles, X, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../ui';
import { useN8nWebhook } from '../../hooks/useN8nWebhook';

interface GenerativeBuilderSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onApplyGeneration: (data: any) => void;
}

export function GenerativeBuilderSidebar({ isOpen, onClose, onApplyGeneration }: GenerativeBuilderSidebarProps) {
    const [prompt, setPrompt] = useState('');
    const { trigger, isLoading, error } = useN8nWebhook('generar-microcredencial');

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        // Llamada real al webhook de n8n
        const response = await trigger({ query: prompt });

        if (response) {
            // Se asume que n8n devuelve { title, description, suggested_qual_id, suggested_ra_ids }
            onApplyGeneration(response);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[450px] bg-bg-surface border-l border-white/5 shadow-2xl z-50 flex flex-col transform transition-transform duration-300 translate-x-0">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-brand-500/5">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-brand-500/20 rounded-lg">
                        <Sparkles size={18} className="text-brand-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-text-primary">Asistente IA</h3>
                        <p className="text-xs text-text-muted">Autocompletado inteligente</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 text-text-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <div className="bg-brand-500/10 border border-brand-500/20 rounded-xl p-4">
                    <p className="text-sm text-brand-200 leading-relaxed">
                        Describe la microcredencial que deseas diseñar. Buscaré en el catálogo del MNC las <b>cualificaciones</b> y <b>resultados de aprendizaje</b> más adecuados y llenaré el formulario por ti.
                    </p>
                </div>

                <div className="space-y-3">
                    <label className="text-sm font-medium text-text-secondary block">
                        ¿De qué trata este curso o formación?
                    </label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Ej. Un curso de 40 horas intensivo enfocado en técnicas de agricultura regenerativa y compostaje..."
                        className="w-full bg-bg-base border border-white/10 rounded-xl p-3 text-sm text-text-primary placeholder:text-text-muted/50 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all resize-none h-32"
                    />

                    <div className="flex items-center gap-2 text-xs text-text-muted">
                        <ChevronRight size={14} className="text-brand-500" />
                        A mayor detalle, mejor será la sugerencia de la IA.
                    </div>
                </div>

                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2 text-sm text-red-200">
                        <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
                        <p>{error}</p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/5 bg-bg-surface/50 backdrop-blur-md">
                <Button
                    variant="brand"
                    onClick={handleGenerate}
                    disabled={isLoading || !prompt.trim()}
                    className="w-full group"
                >
                    {isLoading ? (
                        <>
                            <Loader2 size={18} className="animate-spin" />
                            Generando propuesta...
                        </>
                    ) : (
                        <>
                            <Sparkles size={18} />
                            Generar con IA
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
