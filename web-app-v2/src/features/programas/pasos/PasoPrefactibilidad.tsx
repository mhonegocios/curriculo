import { Card, Input, Select, Badge, Button } from '../../../components/ui';
import { useN8nWebhook } from '../../../hooks/useN8nWebhook';
import { TrendingUp, Search, BarChart3, FileText } from 'lucide-react';
import type { PasoProps } from './types';

/* ═══════════════════════════════════════════════════════
   Paso 1 — Prefactibilidad y Análisis de Mercado
   ═══════════════════════════════════════════════════════ */

const SECTORES = [
    { value: '', label: 'Seleccionar sector...' },
    { value: 'agropecuario', label: 'Agropecuario' },
    { value: 'industrial', label: 'Industrial' },
    { value: 'comercio', label: 'Comercio y Ventas' },
    { value: 'servicios', label: 'Servicios' },
    { value: 'tecnologia', label: 'Tecnología e Informática' },
    { value: 'salud', label: 'Salud' },
    { value: 'turismo', label: 'Turismo y Gastronomía' },
    { value: 'construccion', label: 'Construcción' },
    { value: 'transporte', label: 'Transporte y Logística' },
    { value: 'artes', label: 'Artes y Cultura' },
];

const REGIONES = [
    { value: '', label: 'Seleccionar región...' },
    { value: 'bogota', label: 'Bogotá D.C.' },
    { value: 'antioquia', label: 'Antioquia' },
    { value: 'valle', label: 'Valle del Cauca' },
    { value: 'santander', label: 'Santander' },
    { value: 'atlantico', label: 'Atlántico' },
    { value: 'cundinamarca', label: 'Cundinamarca' },
    { value: 'nacional', label: 'Cobertura Nacional' },
];

export function PasoPrefactibilidad({ datos, actualizarDatos }: PasoProps) {
    const { trigger, isLoading: loading } = useN8nWebhook<{ analisis: string }>('prefactibilidad');

    async function analizarMercado() {
        const resultado = await trigger({
            sector: datos.sector,
            subsector: datos.subsector,
            region: datos.region,
        });
        if (resultado?.analisis) {
            actualizarDatos({
                demandaLaboral: resultado.analisis,
            });
        }
    }

    return (
        <div className="space-y-6">
            {/* Info */}
            <Card>
                <div className="flex items-start gap-4">
                    <div className="p-3 rounded-2xl bg-brand-500/10 text-brand-400">
                        <BarChart3 size={24} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-text-primary text-lg">Prefactibilidad y Análisis de Mercado</h3>
                        <p className="text-sm text-text-muted mt-1">
                            Determinar la viabilidad del programa antes de invertir tiempo en diseñarlo.
                            Analice la demanda laboral, competencia y pertinencia regional.
                        </p>
                    </div>
                </div>
            </Card>

            {/* Formulario de contexto */}
            <Card>
                <h4 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                    <Search size={18} /> Contexto del Programa
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                        label="Sector Económico"
                        options={SECTORES}
                        value={datos.sector}
                        onChange={(e) => actualizarDatos({ sector: e.target.value })}
                    />
                    <Input
                        label="Subsector / Área Específica"
                        placeholder="Ej: Desarrollo de software, Gastronomía, ..."
                        value={datos.subsector}
                        onChange={(e) => actualizarDatos({ subsector: e.target.value })}
                    />
                    <Select
                        label="Región"
                        options={REGIONES}
                        value={datos.region}
                        onChange={(e) => actualizarDatos({ region: e.target.value })}
                    />
                    <div className="flex items-end">
                        <Button
                            variant="primary"
                            icon={<TrendingUp size={16} />}
                            onClick={analizarMercado}
                            loading={loading}
                            disabled={!datos.sector}
                        >
                            Analizar con IA
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Resultados */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <h4 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                        <TrendingUp size={16} /> Demanda Laboral
                        {datos.demandaLaboral && <Badge variant="success">Completado</Badge>}
                    </h4>
                    <textarea
                        className="w-full min-h-[120px] p-3 rounded-xl text-sm bg-surface-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500/50 resize-y"
                        style={{ borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border-subtle)' }}
                        placeholder="Análisis de la demanda laboral del sector y región seleccionados..."
                        value={datos.demandaLaboral}
                        onChange={(e) => actualizarDatos({ demandaLaboral: e.target.value })}
                    />
                </Card>

                <Card>
                    <h4 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                        <BarChart3 size={16} /> Análisis de Competencia
                        {datos.competenciaMercado && <Badge variant="success">Completado</Badge>}
                    </h4>
                    <textarea
                        className="w-full min-h-[120px] p-3 rounded-xl text-sm bg-surface-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500/50 resize-y"
                        style={{ borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border-subtle)' }}
                        placeholder="Programas similares ofertados en la región, instituciones competidoras..."
                        value={datos.competenciaMercado}
                        onChange={(e) => actualizarDatos({ competenciaMercado: e.target.value })}
                    />
                </Card>

                <Card>
                    <h4 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                        <FileText size={16} /> Informe de Pertinencia
                        {datos.pertinencia && <Badge variant="success">Completado</Badge>}
                    </h4>
                    <textarea
                        className="w-full min-h-[120px] p-3 rounded-xl text-sm bg-surface-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500/50 resize-y"
                        style={{ borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border-subtle)' }}
                        placeholder="Justifique la pertinencia del programa en el contexto regional y sectorial..."
                        value={datos.pertinencia}
                        onChange={(e) => actualizarDatos({ pertinencia: e.target.value })}
                    />
                </Card>

                <Card>
                    <h4 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                        <Search size={16} /> Programas Existentes
                        {datos.programasExistentes && <Badge variant="success">Completado</Badge>}
                    </h4>
                    <textarea
                        className="w-full min-h-[120px] p-3 rounded-xl text-sm bg-surface-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500/50 resize-y"
                        style={{ borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border-subtle)' }}
                        placeholder="SNIES: programas existentes registrados en el sector / región..."
                        value={datos.programasExistentes}
                        onChange={(e) => actualizarDatos({ programasExistentes: e.target.value })}
                    />
                </Card>
            </div>
        </div>
    );
}
