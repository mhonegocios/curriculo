import { Card, Input, Select, Badge } from '../../../components/ui';
import { Activity } from 'lucide-react';
import type { PasoProps } from './types';

/* ═══════════════════════════════════════════════════════
   Paso 8 — Monitoreo Continuo
   ═══════════════════════════════════════════════════════ */

const FRECUENCIAS = [
    { value: 'trimestral', label: 'Trimestral' },
    { value: 'semestral', label: 'Semestral' },
    { value: 'anual', label: 'Anual' },
    { value: 'continuo', label: 'Continuo' },
];

export function PasoMonitoreo({ datos, actualizarDatos }: PasoProps) {
    return (
        <div className="space-y-6">
            <Card>
                <div className="flex items-start gap-4">
                    <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-400">
                        <Activity size={24} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-text-primary text-lg">Monitoreo Continuo</h3>
                        <p className="text-sm text-text-muted mt-1">
                            Defina indicadores de desempeño y estrategias de monitoreo post-radicación del programa.
                        </p>
                    </div>
                </div>
            </Card>

            <Card>
                <h4 className="font-semibold text-text-primary mb-4">Configuración de Monitoreo</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                        label="Frecuencia de Revisión"
                        options={FRECUENCIAS}
                        value={datos.frecuenciaRevision}
                        onChange={(e) => actualizarDatos({ frecuenciaRevision: e.target.value })}
                    />
                    <Input
                        label="Responsable del Monitoreo"
                        placeholder="Nombre del coordinador o comité responsable"
                        value={datos.responsable}
                        onChange={(e) => actualizarDatos({ responsable: e.target.value })}
                    />
                </div>
            </Card>

            <Card>
                <h4 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                    Indicadores de Desempeño
                    {datos.indicadoresDesempeno && <Badge variant="success">Completado</Badge>}
                </h4>
                <textarea
                    className="w-full min-h-[200px] p-3 rounded-xl text-sm bg-surface-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500/50 resize-y"
                    style={{ borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border-subtle)' }}
                    placeholder="Defina indicadores de desempeño del programa:
- Tasa de deserción esperada
- Índice de empleabilidad
- Satisfacción estudiantil
- Pertinencia curricular
- Actualización tecnológica..."
                    value={datos.indicadoresDesempeno}
                    onChange={(e) => actualizarDatos({ indicadoresDesempeno: e.target.value })}
                />
            </Card>
        </div>
    );
}
