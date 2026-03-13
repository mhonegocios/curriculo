import { useState } from 'react';
import { Card, Button, Badge } from '../../../components/ui';
import { useCualificaciones } from '../../../hooks/useCualificaciones';
import { Layers, Plus, Trash2, GripVertical } from 'lucide-react';
import type { PasoProps } from './types';

/* ═══════════════════════════════════════════════════════
   Paso 4 — Plan de Estudios
   ═══════════════════════════════════════════════════════ */

export function PasoPlanEstudios({ datos, actualizarDatos }: PasoProps) {
    const { cualificaciones } = useCualificaciones();
    const [expandido, setExpandido] = useState<string | null>(null);

    // Obtener competencias de la cualificación seleccionada
    const cualificacion = cualificaciones?.find(c => c.id === datos.cualificacionId);
    const competencias = cualificacion?.competencias ?? [];

    function toggleCompetencia(id: string) {
        const seleccionadas = datos.competenciasSeleccionadas.includes(id)
            ? datos.competenciasSeleccionadas.filter(c => c !== id)
            : [...datos.competenciasSeleccionadas, id];
        actualizarDatos({ competenciasSeleccionadas: seleccionadas });
    }

    function agregarModulo() {
        actualizarDatos({
            mallaModulos: [
                ...datos.mallaModulos,
                {
                    nombre: '',
                    competenciaId: '',
                    horas: 0,
                    creditos: 0,
                    trimestre: 1,
                    orden: datos.mallaModulos.length,
                },
            ],
        });
    }

    function actualizarModulo(idx: number, campo: string, valor: string | number) {
        const modulos = [...datos.mallaModulos];
        modulos[idx] = { ...modulos[idx], [campo]: valor };
        actualizarDatos({ mallaModulos: modulos });
    }

    function eliminarModulo(idx: number) {
        actualizarDatos({
            mallaModulos: datos.mallaModulos.filter((_, i) => i !== idx),
        });
    }

    const totalHorasMalla = datos.mallaModulos.reduce((sum, m) => sum + m.horas, 0);
    const totalCreditosMalla = datos.mallaModulos.reduce((sum, m) => sum + m.creditos, 0);

    return (
        <div className="space-y-6">
            <Card>
                <div className="flex items-start gap-4">
                    <div className="p-3 rounded-2xl bg-violet-500/10 text-violet-400">
                        <Layers size={24} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-text-primary text-lg">Plan de Estudios</h3>
                        <p className="text-sm text-text-muted mt-1">
                            Seleccione las competencias del MNC y diseñe la malla curricular con módulos de formación.
                        </p>
                    </div>
                </div>
            </Card>

            {/* Selección de competencias */}
            <Card>
                <h4 className="font-semibold text-text-primary mb-4">
                    Competencias de la Cualificación
                    {!cualificacion && (
                        <span className="text-sm font-normal text-text-muted ml-2">
                            (Seleccione una cualificación en el Paso 2)
                        </span>
                    )}
                </h4>
                {competencias.length > 0 ? (
                    <div className="space-y-2">
                        {competencias.map((comp) => (
                            <div
                                key={comp.id}
                                className={`p-3 rounded-xl cursor-pointer transition-all ${datos.competenciasSeleccionadas.includes(comp.id)
                                    ? 'bg-brand-500/10 ring-1 ring-brand-500/30'
                                    : 'hover:bg-surface-3'
                                    }`}
                                style={{ borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border-subtle)' }}
                                onClick={() => toggleCompetencia(comp.id)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded-md flex items-center justify-center text-xs ${datos.competenciasSeleccionadas.includes(comp.id)
                                        ? 'bg-brand-500 text-white'
                                        : 'bg-surface-3 text-text-muted'
                                        }`}>
                                        {datos.competenciasSeleccionadas.includes(comp.id) ? '✓' : ''}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-text-primary">{comp.denominacion}</p>
                                        <p className="text-xs text-text-muted mt-0.5">{comp.codigo}</p>
                                    </div>
                                    <button
                                        className="text-text-muted hover:text-text-primary text-xs cursor-pointer"
                                        onClick={(e) => { e.stopPropagation(); setExpandido(expandido === comp.id ? null : comp.id); }}
                                    >
                                        {expandido === comp.id ? 'Cerrar' : 'Ver RAs'}
                                    </button>
                                </div>
                                {expandido === comp.id && comp.resultados && (
                                    <div className="mt-3 ml-8 space-y-1">
                                        {comp.resultados.map((ra: any) => (
                                            <p key={ra.id} className="text-xs text-text-secondary">• {ra.descripcion}</p>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-text-muted text-center py-4">
                        No hay competencias disponibles. Seleccione una cualificación en el Paso 2.
                    </p>
                )}
                <div className="mt-3">
                    <Badge variant="info">{datos.competenciasSeleccionadas.length} competencias seleccionadas</Badge>
                </div>
            </Card>

            {/* Malla curricular */}
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-text-primary">Malla Curricular — Módulos</h4>
                    <Button variant="secondary" size="sm" icon={<Plus size={14} />} onClick={agregarModulo}>
                        Agregar Módulo
                    </Button>
                </div>

                {datos.mallaModulos.length > 0 ? (
                    <div className="space-y-3">
                        {datos.mallaModulos.map((mod, idx) => (
                            <div
                                key={idx}
                                className="flex items-center gap-3 p-3 rounded-xl bg-surface-2"
                                style={{ borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border-subtle)' }}
                            >
                                <GripVertical size={16} className="text-text-muted shrink-0" />
                                <input
                                    className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
                                    placeholder="Nombre del módulo"
                                    value={mod.nombre}
                                    onChange={(e) => actualizarModulo(idx, 'nombre', e.target.value)}
                                />
                                <input
                                    type="number"
                                    className="w-20 bg-surface-3 rounded-lg px-2 py-1 text-sm text-text-primary text-center focus:outline-none"
                                    placeholder="Horas"
                                    value={mod.horas || ''}
                                    onChange={(e) => actualizarModulo(idx, 'horas', Number(e.target.value))}
                                />
                                <input
                                    type="number"
                                    className="w-20 bg-surface-3 rounded-lg px-2 py-1 text-sm text-text-primary text-center focus:outline-none"
                                    placeholder="Créd."
                                    value={mod.creditos || ''}
                                    onChange={(e) => actualizarModulo(idx, 'creditos', Number(e.target.value))}
                                />
                                <input
                                    type="number"
                                    className="w-16 bg-surface-3 rounded-lg px-2 py-1 text-sm text-text-primary text-center focus:outline-none"
                                    placeholder="Trim."
                                    value={mod.trimestre || ''}
                                    onChange={(e) => actualizarModulo(idx, 'trimestre', Number(e.target.value))}
                                />
                                <button
                                    className="text-text-muted hover:text-red-400 cursor-pointer"
                                    onClick={() => eliminarModulo(idx)}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}

                        {/* Totales */}
                        <div className="flex items-center justify-end gap-6 pt-3 text-sm">
                            <span className="text-text-muted">Total:</span>
                            <Badge variant="info">{totalHorasMalla} horas</Badge>
                            <Badge variant="info">{totalCreditosMalla} créditos</Badge>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-text-muted text-center py-8">
                        Agregue módulos para construir la malla curricular del programa.
                    </p>
                )}
            </Card>
        </div>
    );
}
