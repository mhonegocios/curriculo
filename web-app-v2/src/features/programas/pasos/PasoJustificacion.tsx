import { Card, Button, Badge } from '../../../components/ui';
import { useN8nWebhook } from '../../../hooks/useN8nWebhook';
import { FileText, Sparkles } from 'lucide-react';
import type { PasoProps } from './types';

/* ═══════════════════════════════════════════════════════
   Paso 3 — Justificación del Programa
   ═══════════════════════════════════════════════════════ */

const SECCIONES = [
    { key: 'justificacionSocial' as const, titulo: 'Justificación Social', placeholder: 'Necesidades sociales que atiende el programa, impacto en la comunidad...' },
    { key: 'justificacionEconomica' as const, titulo: 'Justificación Económica', placeholder: 'Contribución al desarrollo económico, generación de empleo...' },
    { key: 'justificacionAcademica' as const, titulo: 'Justificación Académica', placeholder: 'Fundamento pedagógico, referentes académicos, innovación educativa...' },
    { key: 'justificacionLaboral' as const, titulo: 'Justificación Laboral', placeholder: 'Demanda laboral, perfiles ocupacionales, brechas de talento...' },
];

export function PasoJustificacion({ datos, actualizarDatos }: PasoProps) {
    const { trigger, isLoading: loading } = useN8nWebhook<{ justificacion: { social: string; economica: string; academica: string; laboral: string } }>('justificacion');

    async function generarJustificacion() {
        const resultado = await trigger({
            nombrePrograma: datos.nombrePrograma,
            sector: datos.sector,
            region: datos.region,
            nivelMNC: datos.nivelMNC,
        });
        if (resultado?.justificacion) {
            actualizarDatos({
                justificacionSocial: resultado.justificacion.social || datos.justificacionSocial,
                justificacionEconomica: resultado.justificacion.economica || datos.justificacionEconomica,
                justificacionAcademica: resultado.justificacion.academica || datos.justificacionAcademica,
                justificacionLaboral: resultado.justificacion.laboral || datos.justificacionLaboral,
            });
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400">
                            <FileText size={24} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-text-primary text-lg">Justificación del Programa</h3>
                            <p className="text-sm text-text-muted mt-1">
                                Genere el documento argumentativo completo. Puede redactarlo manualmente o usar IA.
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="primary"
                        size="sm"
                        icon={<Sparkles size={14} />}
                        onClick={generarJustificacion}
                        loading={loading}
                    >
                        Generar con IA
                    </Button>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SECCIONES.map((sec) => (
                    <Card key={sec.key}>
                        <h4 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                            {sec.titulo}
                            {datos[sec.key] && <Badge variant="success">Completado</Badge>}
                        </h4>
                        <textarea
                            className="w-full min-h-[140px] p-3 rounded-xl text-sm bg-surface-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500/50 resize-y"
                            style={{ borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border-subtle)' }}
                            placeholder={sec.placeholder}
                            value={datos[sec.key]}
                            onChange={(e) => actualizarDatos({ [sec.key]: e.target.value })}
                        />
                    </Card>
                ))}
            </div>
        </div>
    );
}
