import { useState } from 'react';
import { useCualificaciones } from '../../hooks/useCualificaciones';
import { Card, Badge, LoadingState, ErrorState, EmptyState, SectionHeader } from '../../components/ui';
import { ChevronDown, ChevronRight, BookOpen, Target, Brain, Search, Layers, Lightbulb } from 'lucide-react';
import type { CualificacionCompleta, CompetenciaConDetalle, ResultadoAprendizaje } from '../../lib/types';

/* ═══════════════════════════════════════════════════════
   Explorador de Cualificaciones MNC — V2
   Visualización completa de la jerarquía del MNC
   ═══════════════════════════════════════════════════════ */

function AccordionRA({ ra }: { ra: ResultadoAprendizaje }) {
    return (
        <div className="flex items-start gap-3 py-2.5 px-4 rounded-xl hover:bg-white/[0.02] transition-colors">
            <Target size={16} className="text-accent-400 mt-0.5 shrink-0" />
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                    <Badge variant="success">{ra.codigo}</Badge>
                    {ra.duracion_horas > 0 && <Badge>{ra.duracion_horas}h</Badge>}
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">{ra.descripcion}</p>
            </div>
        </div>
    );
}

function AccordionComp({ comp }: { comp: CompetenciaConDetalle }) {
    const [abierto, setAbierto] = useState(false);
    const totalRAs = comp.resultados?.length ?? 0;
    const totalConoc = comp.conocimientos?.length ?? 0;

    return (
        <div className="border border-white/[0.04] rounded-2xl overflow-hidden transition-all">
            <button
                onClick={() => setAbierto(!abierto)}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/[0.02] transition-colors cursor-pointer"
            >
                {abierto ? <ChevronDown size={18} className="text-brand-400 shrink-0" /> : <ChevronRight size={18} className="text-text-muted shrink-0" />}
                <BookOpen size={18} className="text-brand-400 shrink-0" />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-text-primary">{comp.codigo}</span>
                        <Badge variant="info">{totalRAs} RAs</Badge>
                        {totalConoc > 0 && <Badge>{totalConoc} conocimientos</Badge>}
                        {comp.duracion_horas > 0 && <Badge variant="warning">{comp.duracion_horas}h</Badge>}
                    </div>
                    <p className="text-sm text-text-secondary mt-0.5 truncate">{comp.denominacion}</p>
                </div>
            </button>

            {abierto && (
                <div className="animate-fade-in border-t border-white/[0.04]">
                    {/* Resultados de aprendizaje */}
                    {totalRAs > 0 && (
                        <div className="p-3">
                            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted px-4 py-2 flex items-center gap-2">
                                <Target size={14} />Resultados de Aprendizaje
                            </p>
                            <div className="space-y-1">
                                {comp.resultados.map((ra) => <AccordionRA key={ra.id} ra={ra} />)}
                            </div>
                        </div>
                    )}

                    {/* Conocimientos esenciales */}
                    {totalConoc > 0 && (
                        <div className="p-3 border-t border-white/[0.04]">
                            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted px-4 py-2 flex items-center gap-2">
                                <Brain size={14} />Conocimientos Esenciales
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 px-4">
                                {['conceptual', 'procedimental', 'actitudinal'].map((tipo) => {
                                    const items = comp.conocimientos.filter(c => c.tipo === tipo);
                                    if (!items.length) return null;
                                    return (
                                        <div key={tipo} className="space-y-1.5">
                                            <p className="text-xs font-medium text-text-muted capitalize flex items-center gap-1.5">
                                                <Lightbulb size={12} />{tipo}
                                            </p>
                                            {items.map((c) => (
                                                <p key={c.id} className="text-xs text-text-secondary leading-relaxed pl-4 border-l-2 border-white/[0.06]">
                                                    {c.contenido}
                                                </p>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Elementos de competencia */}
                    {comp.elementos?.length > 0 && (
                        <div className="p-3 border-t border-white/[0.04]">
                            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted px-4 py-2 flex items-center gap-2">
                                <Layers size={14} />Elementos de Competencia
                            </p>
                            <div className="space-y-2 px-4">
                                {comp.elementos.map((elem) => (
                                    <div key={elem.id} className="rounded-xl p-3 border border-white/[0.04]" style={{ background: 'var(--color-surface-2)' }}>
                                        <p className="text-sm text-text-primary font-medium">
                                            Elemento {elem.numero_elemento}: {elem.descripcion}
                                        </p>
                                        {elem.criterios_desempeno?.length > 0 && (
                                            <ul className="mt-2 space-y-1">
                                                {elem.criterios_desempeno.map((cd) => (
                                                    <li key={cd.id} className="text-xs text-text-muted flex items-start gap-2">
                                                        <span className="text-warn-400 mt-0.5">•</span>
                                                        {cd.descripcion}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function AccordionCual({ cual }: { cual: CualificacionCompleta }) {
    const [abierto, setAbierto] = useState(false);
    const totalComps = cual.competencias?.length ?? 0;
    const totalRAs = cual.competencias?.reduce((sum, c) => sum + (c.resultados?.length ?? 0), 0) ?? 0;

    return (
        <Card className="overflow-hidden">
            <button
                onClick={() => setAbierto(!abierto)}
                className="w-full flex items-center gap-4 text-left cursor-pointer"
            >
                {abierto
                    ? <ChevronDown size={20} className="text-brand-400 shrink-0" />
                    : <ChevronRight size={20} className="text-text-muted shrink-0" />
                }
                <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-brand-500/20 to-brand-600/20 flex items-center justify-center text-brand-400 font-bold text-sm">
                    N{cual.nivel_mnc}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <Badge variant="info">{cual.codigo}</Badge>
                        <Badge variant="warning">Nivel {cual.nivel_mnc}</Badge>
                        <Badge>{totalComps} competencias</Badge>
                        <Badge>{totalRAs} RAs</Badge>
                    </div>
                    <h3 className="font-semibold text-text-primary truncate">{cual.denominacion}</h3>
                    <p className="text-xs text-text-muted truncate">{cual.sector_productivo} · {cual.subsector}</p>
                </div>
            </button>

            {abierto && (
                <div className="mt-4 space-y-3 animate-fade-in">
                    {/* Info general */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 rounded-xl border border-white/[0.04]" style={{ background: 'var(--color-surface-2)' }}>
                        <div><p className="text-xs text-text-muted">Duración</p><p className="text-sm font-semibold text-text-primary">{cual.duracion_horas}h / {cual.duracion_creditos} créditos</p></div>
                        <div><p className="text-xs text-text-muted">Ocupación CUOC</p><p className="text-sm font-semibold text-text-primary">{cual.ocupacion_cuoc || '—'}</p></div>
                        <div><p className="text-xs text-text-muted">Estado</p><p className="text-sm font-semibold text-text-primary">{cual.estado || '—'}</p></div>
                        <div><p className="text-xs text-text-muted">Versión</p><p className="text-sm font-semibold text-text-primary">{cual.version || '—'}</p></div>
                    </div>

                    {/* Competencia general */}
                    {cual.competencia_general && (
                        <div className="p-3 rounded-xl border border-white/[0.04]" style={{ background: 'var(--color-surface-2)' }}>
                            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">Competencia General</p>
                            <p className="text-sm text-text-secondary leading-relaxed">{cual.competencia_general}</p>
                        </div>
                    )}

                    {/* Competencias */}
                    <div className="space-y-2">
                        {cual.competencias.map((comp) => <AccordionComp key={comp.id} comp={comp} />)}
                    </div>
                </div>
            )}
        </Card>
    );
}

export function ExplorerPage() {
    const { cualificaciones, loading, error, recargar } = useCualificaciones();
    const [busqueda, setBusqueda] = useState('');

    const filtradas = cualificaciones.filter(c =>
        !busqueda ||
        c.denominacion.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.sector_productivo?.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
            <SectionHeader
                title="Explorador de Cualificaciones"
                description="Navega la estructura completa del Marco Nacional de Cualificaciones (MNC) de Colombia"
            />

            {/* Barra de búsqueda */}
            <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                    type="text"
                    placeholder="Buscar por nombre, código o sector..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-white/[0.06] text-sm
            bg-surface-1 text-text-primary placeholder:text-text-muted
            focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                />
            </div>

            {/* Contenido */}
            {loading && <LoadingState message="Cargando cualificaciones del MNC..." />}
            {error && <ErrorState message={error} onRetry={recargar} />}
            {!loading && !error && filtradas.length === 0 && (
                <EmptyState
                    icon="🔍"
                    title="Sin resultados"
                    description={busqueda ? 'No se encontraron cualificaciones con ese criterio' : 'No hay cualificaciones cargadas aún'}
                />
            )}
            {!loading && !error && (
                <div className="space-y-4">
                    <p className="text-sm text-text-muted">{filtradas.length} cualificación(es) encontrada(s)</p>
                    {filtradas.map((cual) => <AccordionCual key={cual.id} cual={cual} />)}
                </div>
            )}
        </div>
    );
}
