import { Card, Button, Badge } from '../../../components/ui';
import { useN8nWebhook } from '../../../hooks/useN8nWebhook';
import { BookOpen, Plus, Trash2, Sparkles } from 'lucide-react';
import type { PasoProps } from './types';

/* ═══════════════════════════════════════════════════════
   Paso 5 — Módulos de Formación (Tablas de Saberes)
   ═══════════════════════════════════════════════════════ */

export function PasoModulosFormacion({ datos, actualizarDatos }: PasoProps) {
    const { trigger, isLoading: loading } = useN8nWebhook<{ modulos: typeof datos.modulosDetalle }>('modulos-formacion');

    // Inicializar módulos detalle desde la malla si están vacíos
    function inicializarDesdeBloque() {
        if (datos.mallaModulos.length > 0 && datos.modulosDetalle.length === 0) {
            actualizarDatos({
                modulosDetalle: datos.mallaModulos.map((m) => ({
                    nombre: m.nombre,
                    resultados: [],
                    saberes: { conceptual: [], procedimental: [], actitudinal: [] },
                    estrategias: '',
                    criteriosEval: '',
                })),
            });
        }
    }

    async function generarContenidos(idx: number) {
        const modulo = datos.modulosDetalle[idx];
        const resultado = await trigger({
            nombreModulo: modulo.nombre,
            nombrePrograma: datos.nombrePrograma,
            competencias: datos.competenciasSeleccionadas,
        });
        if (resultado?.modulos?.[0]) {
            const updated = [...datos.modulosDetalle];
            updated[idx] = { ...updated[idx], ...resultado.modulos[0] };
            actualizarDatos({ modulosDetalle: updated });
        }
    }

    function agregarSaber(idx: number, tipo: 'conceptual' | 'procedimental' | 'actitudinal') {
        const updated = [...datos.modulosDetalle];
        updated[idx].saberes[tipo] = [...updated[idx].saberes[tipo], ''];
        actualizarDatos({ modulosDetalle: updated });
    }

    function actualizarSaber(idx: number, tipo: 'conceptual' | 'procedimental' | 'actitudinal', saberIdx: number, valor: string) {
        const updated = [...datos.modulosDetalle];
        updated[idx].saberes[tipo][saberIdx] = valor;
        actualizarDatos({ modulosDetalle: updated });
    }

    function eliminarSaber(idx: number, tipo: 'conceptual' | 'procedimental' | 'actitudinal', saberIdx: number) {
        const updated = [...datos.modulosDetalle];
        updated[idx].saberes[tipo] = updated[idx].saberes[tipo].filter((_, i) => i !== saberIdx);
        actualizarDatos({ modulosDetalle: updated });
    }

    return (
        <div className="space-y-6">
            <Card>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-400">
                            <BookOpen size={24} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-text-primary text-lg">Módulos de Formación</h3>
                            <p className="text-sm text-text-muted mt-1">
                                Desarrolle las tablas de saberes (SABER, SABER HACER, SABER SER) y estrategias para cada módulo.
                            </p>
                        </div>
                    </div>
                    {datos.modulosDetalle.length === 0 && datos.mallaModulos.length > 0 && (
                        <Button variant="secondary" size="sm" onClick={inicializarDesdeBloque}>
                            Importar desde Malla
                        </Button>
                    )}
                </div>
            </Card>

            {datos.modulosDetalle.length === 0 ? (
                <Card>
                    <p className="text-sm text-text-muted text-center py-8">
                        {datos.mallaModulos.length > 0
                            ? 'Haga clic en "Importar desde Malla" para traer los módulos del Plan de Estudios.'
                            : 'Primero defina los módulos en el Paso 4 (Plan de Estudios).'}
                    </p>
                </Card>
            ) : (
                datos.modulosDetalle.map((mod, idx) => (
                    <Card key={idx}>
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold text-text-primary">
                                Módulo {idx + 1}: {mod.nombre || '(Sin nombre)'}
                            </h4>
                            <Button
                                variant="ghost"
                                size="sm"
                                icon={<Sparkles size={14} />}
                                onClick={() => generarContenidos(idx)}
                                loading={loading}
                            >
                                Generar con IA
                            </Button>
                        </div>

                        {/* Tablas de Saberes */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            {(['conceptual', 'procedimental', 'actitudinal'] as const).map((tipo) => (
                                <div key={tipo}>
                                    <div className="flex items-center justify-between mb-2">
                                        <Badge variant={tipo === 'conceptual' ? 'info' : tipo === 'procedimental' ? 'success' : 'warning'}>
                                            {tipo === 'conceptual' ? 'SABER' : tipo === 'procedimental' ? 'SABER HACER' : 'SABER SER'}
                                        </Badge>
                                        <button
                                            className="text-text-muted hover:text-text-primary cursor-pointer"
                                            onClick={() => agregarSaber(idx, tipo)}
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                    <div className="space-y-1.5">
                                        {mod.saberes[tipo].map((saber, si) => (
                                            <div key={si} className="flex items-center gap-1.5">
                                                <input
                                                    className="flex-1 bg-surface-2 rounded-lg px-2.5 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none"
                                                    style={{ borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border-subtle)' }}
                                                    placeholder={`${tipo === 'conceptual' ? 'Concepto' : tipo === 'procedimental' ? 'Procedimiento' : 'Actitud'}...`}
                                                    value={saber}
                                                    onChange={(e) => actualizarSaber(idx, tipo, si, e.target.value)}
                                                />
                                                <button
                                                    className="text-text-muted hover:text-red-400 cursor-pointer shrink-0"
                                                    onClick={() => eliminarSaber(idx, tipo, si)}
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        ))}
                                        {mod.saberes[tipo].length === 0 && (
                                            <p className="text-[11px] text-text-muted text-center py-2">Sin {tipo === 'conceptual' ? 'saberes' : tipo === 'procedimental' ? 'procedimientos' : 'actitudes'}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Estrategias y Evaluación */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-text-secondary mb-1.5 block">Estrategias Metodológicas</label>
                                <textarea
                                    className="w-full min-h-[80px] p-2.5 rounded-xl text-xs bg-surface-2 text-text-primary placeholder:text-text-muted focus:outline-none resize-y"
                                    style={{ borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border-subtle)' }}
                                    placeholder="Estrategias de enseñanza-aprendizaje..."
                                    value={mod.estrategias}
                                    onChange={(e) => {
                                        const updated = [...datos.modulosDetalle];
                                        updated[idx].estrategias = e.target.value;
                                        actualizarDatos({ modulosDetalle: updated });
                                    }}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-text-secondary mb-1.5 block">Criterios de Evaluación</label>
                                <textarea
                                    className="w-full min-h-[80px] p-2.5 rounded-xl text-xs bg-surface-2 text-text-primary placeholder:text-text-muted focus:outline-none resize-y"
                                    style={{ borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border-subtle)' }}
                                    placeholder="Evidencias, instrumentos de evaluación..."
                                    value={mod.criteriosEval}
                                    onChange={(e) => {
                                        const updated = [...datos.modulosDetalle];
                                        updated[idx].criteriosEval = e.target.value;
                                        actualizarDatos({ modulosDetalle: updated });
                                    }}
                                />
                            </div>
                        </div>
                    </Card>
                ))
            )}
        </div>
    );
}
