import { useState } from 'react';
import { Card, Badge, Button } from '../../components/ui';
import { X, ChevronDown, ChevronRight, CheckCircle2, ClipboardList, Target, Award } from 'lucide-react';

export interface EvaluacionItem {
    resultado_aprendizaje: string;
    criterios_cubiertos: Array<{ codigo: string; descripcion: string } | string>;
    actividad_evaluativa: {
        nombre: string;
        tipo: string;
        descripcion: string;
    };
    rubrica: {
        excelente?: string;
        bueno?: string;
        regular?: string;
        deficiente?: string;
    } | Array<{ nivel_academico: string; descripcion: string }>;
}

interface EvaluacionModalProps {
    evaluaciones: EvaluacionItem[];
    onClose: () => void;
    onSave?: () => void;
}

function EvaluacionCard({ evaluacion, index }: { evaluacion: EvaluacionItem, index: number }) {
    const [expanded, setExpanded] = useState(false);

    // Determines styles for dynamic rubrics
    const getColors = (i: number) => {
        if (i % 4 === 0) return { bg: 'bg-green-500/10 border-green-500/20', text: 'text-green-400' };
        if (i % 4 === 1) return { bg: 'bg-blue-500/10 border-blue-500/20', text: 'text-blue-400' };
        if (i % 4 === 2) return { bg: 'bg-yellow-500/10 border-yellow-500/20', text: 'text-yellow-500' };
        return { bg: 'bg-red-500/10 border-red-500/20', text: 'text-red-400' };
    };

    return (
        <div className="border border-white/5 rounded-xl overflow-hidden mb-4">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center gap-3 px-4 py-3 bg-surface-3/30 hover:bg-surface-3/60 transition-colors text-left"
            >
                <Badge variant="brand">Evaluación {index + 1}</Badge>
                <span className="font-semibold text-text-primary flex-1 text-sm line-clamp-1">{evaluacion.actividad_evaluativa?.nombre || 'Actividad Evaluativa'}</span>
                {expanded ? <ChevronDown size={14} className="text-text-muted" /> : <ChevronRight size={14} className="text-text-muted" />}
            </button>

            {expanded && (
                <div className="px-4 py-4 space-y-6 text-sm animate-fade-in bg-surface-2/50">
                    {/* Detalles de la Actividad */}
                    <div>
                        <h4 className="flex items-center gap-2 font-medium text-purple-400 mb-2">
                            <ClipboardList size={16} /> Actividad Evaluativa
                        </h4>
                        <div className="bg-surface-1 rounded-lg p-4 border border-white/5 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-text-primary font-medium">{evaluacion.actividad_evaluativa?.nombre}</span>
                                <Badge variant="default">{evaluacion.actividad_evaluativa?.tipo}</Badge>
                            </div>
                            <p className="text-text-secondary leading-relaxed">{evaluacion.actividad_evaluativa?.descripcion}</p>
                        </div>
                    </div>

                    {/* Resultado de Aprendizaje y Criterios */}
                    <div>
                        <h4 className="flex items-center gap-2 font-medium text-brand-400 mb-2">
                            <Target size={16} /> Alineación Curricular
                        </h4>
                        <div className="bg-surface-1 rounded-lg p-4 border border-white/5 space-y-3">
                            <div>
                                <span className="text-xs text-text-muted uppercase font-bold tracking-wider block mb-1">Resultado de Aprendizaje:</span>
                                <p className="text-text-primary">{evaluacion.resultado_aprendizaje}</p>
                            </div>
                            {evaluacion.criterios_cubiertos && evaluacion.criterios_cubiertos.length > 0 && (
                                <div className="bg-surface-1 rounded-lg p-4 border border-white/5">
                                    <h4 className="text-xs font-semibold text-text-muted uppercase mb-3 flex items-center gap-1.5">
                                        <CheckCircle2 size={14} className="text-success-400" />
                                        Criterios de Evaluación Cubiertos:
                                    </h4>
                                    <ul className="space-y-2">
                                        {evaluacion.criterios_cubiertos.map((criterio, i) => {
                                            const isObj = typeof criterio === 'object' && criterio !== null;
                                            const texto = isObj ? criterio.descripcion : (criterio as string);
                                            const codigo = isObj ? criterio.codigo : null;

                                            return (
                                                <li key={i} className="text-sm text-text-secondary flex gap-2">
                                                    <CheckCircle2 size={16} className="text-brand-500 mt-0.5 shrink-0" />
                                                    <span>
                                                        {codigo && <Badge variant="default" className="mr-2 font-mono text-[10px]">{codigo}</Badge>}
                                                        {texto}
                                                    </span>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Rúbrica */}
                    {evaluacion.rubrica && (
                        <div>
                            <h4 className="flex items-center gap-2 font-medium text-green-400 mb-2">
                                <Award size={16} /> Rúbrica de Evaluación
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {Array.isArray(evaluacion.rubrica) ? (
                                    evaluacion.rubrica.map((r, i) => {
                                        const c = getColors(i);
                                        return (
                                            <div key={i} className={`border rounded-lg p-3 ${c.bg}`}>
                                                <span className={`text-xs font-bold uppercase tracking-wider block mb-1 ${c.text}`}>{r.nivel_academico}</span>
                                                <p className="text-text-secondary text-xs">{r.descripcion}</p>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <>
                                        {(evaluacion.rubrica as any).excelente && (
                                            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                                                <span className="text-xs font-bold text-green-400 uppercase tracking-wider block mb-1">Excelente</span>
                                                <p className="text-text-secondary text-xs">{(evaluacion.rubrica as any).excelente}</p>
                                            </div>
                                        )}
                                        {(evaluacion.rubrica as any).bueno && (
                                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                                                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block mb-1">Bueno</span>
                                                <p className="text-text-secondary text-xs">{(evaluacion.rubrica as any).bueno}</p>
                                            </div>
                                        )}
                                        {(evaluacion.rubrica as any).regular && (
                                            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                                                <span className="text-xs font-bold text-yellow-500 uppercase tracking-wider block mb-1">Regular</span>
                                                <p className="text-text-secondary text-xs">{(evaluacion.rubrica as any).regular}</p>
                                            </div>
                                        )}
                                        {(evaluacion.rubrica as any).deficiente && (
                                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                                <span className="text-xs font-bold text-red-400 uppercase tracking-wider block mb-1">Deficiente</span>
                                                <p className="text-text-secondary text-xs">{(evaluacion.rubrica as any).deficiente}</p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export function EvaluacionModal({ evaluaciones, onClose, onSave }: EvaluacionModalProps) {
    // Si recibe un objecto vacío o mal formado, tratamos de extraer el array
    const data = Array.isArray(evaluaciones) ? evaluaciones : (evaluaciones as any)?.evaluaciones || [];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
            <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-surface-1 border-white/10 shadow-2xl p-0 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5 bg-surface-2/30">
                    <div>
                        <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                            <ClipboardList className="text-purple-400" /> Matriz de Evaluaciones
                        </h2>
                        <p className="text-sm text-text-secondary mt-1">
                            Revisa las actividades evaluativas y rúbricas generadas para tu programa.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/10 text-text-muted transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body / Evaluaciones List */}
                <div className="flex-1 overflow-y-auto p-6 bg-surface-1 custom-scrollbar">
                    {data.length === 0 ? (
                        <div className="text-center py-12 text-text-muted">
                            <p>No se encontraron evaluaciones validas en la respuesta generada.</p>
                        </div>
                    ) : (
                        data.map((evaluacion: EvaluacionItem, index: number) => (
                            <EvaluacionCard key={index} evaluacion={evaluacion} index={index} />
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/5 bg-surface-2/30 flex justify-end gap-3">
                    <Button variant="ghost" onClick={onClose}>
                        Cerrar
                    </Button>
                    {onSave && (
                        <Button variant="brand" onClick={onSave} disabled={data.length === 0}>
                            Confirmar y Continuar
                        </Button>
                    )}
                </div>
            </Card>
        </div>
    );
}
