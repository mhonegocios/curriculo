import { Card, Badge, Button } from '../../../components/ui';
import { Wrench, FileText, Download } from 'lucide-react';
import type { PasoProps } from './types';

/* ═══════════════════════════════════════════════════════
   Paso 7 — Ensamblaje y Generación Final
   ═══════════════════════════════════════════════════════ */

export function PasoEnsamblaje({ datos, actualizarDatos }: PasoProps) {
    // Calcular completitud de cada sección
    const secciones = [
        { nombre: 'Prefactibilidad', completo: !!(datos.sector && datos.demandaLaboral) },
        { nombre: 'Denominación', completo: !!(datos.nombrePrograma && datos.nivelMNC) },
        { nombre: 'Justificación', completo: !!(datos.justificacionSocial || datos.justificacionEconomica) },
        { nombre: 'Plan de Estudios', completo: datos.mallaModulos.length > 0 },
        { nombre: 'Módulos de Formación', completo: datos.modulosDetalle.length > 0 },
        { nombre: 'Perfiles', completo: !!(datos.perfilIngreso && datos.perfilEgreso) },
    ];

    const completadas = secciones.filter(s => s.completo).length;
    const porcentaje = Math.round((completadas / secciones.length) * 100);

    return (
        <div className="space-y-6">
            <Card>
                <div className="flex items-start gap-4">
                    <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400">
                        <Wrench size={24} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-text-primary text-lg">Ensamblaje y Generación Final</h3>
                        <p className="text-sm text-text-muted mt-1">
                            Revise la completitud del programa y genere el documento maestro consolidado.
                        </p>
                    </div>
                </div>
            </Card>

            {/* Resumen de completitud */}
            <Card>
                <h4 className="font-semibold text-text-primary mb-4">Estado del Programa</h4>
                <div className="space-y-3">
                    {secciones.map((sec) => (
                        <div key={sec.nombre} className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${sec.completo ? 'bg-accent-500' : 'bg-surface-4'}`} />
                            <span className="flex-1 text-sm text-text-primary">{sec.nombre}</span>
                            <Badge variant={sec.completo ? 'success' : 'default'}>
                                {sec.completo ? 'Completo' : 'Pendiente'}
                            </Badge>
                        </div>
                    ))}
                </div>

                {/* Barra de progreso */}
                <div className="mt-6">
                    <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-text-secondary">Progreso general</span>
                        <span className="font-semibold text-text-primary">{porcentaje}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-surface-3 overflow-hidden">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500 transition-all duration-500"
                            style={{ width: `${porcentaje}%` }}
                        />
                    </div>
                </div>
            </Card>

            {/* Documento Maestro */}
            <Card>
                <h4 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                    <FileText size={16} /> Documento Maestro
                </h4>
                <textarea
                    className="w-full min-h-[200px] p-3 rounded-xl text-sm bg-surface-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500/50 resize-y"
                    style={{ borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border-subtle)' }}
                    placeholder="Observaciones del documento consolidado, notas para revisión..."
                    value={datos.documentoMaestro}
                    onChange={(e) => actualizarDatos({ documentoMaestro: e.target.value })}
                />
            </Card>

            {/* Observaciones */}
            <Card>
                <h4 className="font-semibold text-text-primary mb-3">Observaciones</h4>
                <textarea
                    className="w-full min-h-[100px] p-3 rounded-xl text-sm bg-surface-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500/50 resize-y"
                    style={{ borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border-subtle)' }}
                    placeholder="Observaciones generales, puntos por resolver..."
                    value={datos.observaciones}
                    onChange={(e) => actualizarDatos({ observaciones: e.target.value })}
                />
            </Card>

            {/* Acciones */}
            <Card>
                <div className="flex items-center justify-center gap-4">
                    <Button variant="secondary" icon={<Download size={16} />} disabled>
                        Exportar PDF (Próximamente)
                    </Button>
                </div>
            </Card>
        </div>
    );
}
