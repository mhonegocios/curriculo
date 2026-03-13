import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Card, Badge, LoadingState, ErrorState, EmptyState, SectionHeader, Button } from '../../components/ui';
import { GraduationCap, Clock, BookOpen, Target, Trash2 } from 'lucide-react';
import type { EduContinua } from '../../lib/types';
import { Link } from 'react-router-dom';

/* ═══════════════════════════════════════════════════════
   Catálogo de Educación Continua — V2
   Lista los programas (microcredenciales, cursos, etc)
   ═══════════════════════════════════════════════════════ */

interface EduContinuaConRAs extends EduContinua {
    ra_count: number;
}

export function CatalogPage() {
    const [programas, setProgramas] = useState<EduContinuaConRAs[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    async function cargar() {
        setLoading(true);
        setError(null);
        try {
            const { data, error: err } = await supabase
                .from('edu_continua')
                .select('*, edu_continua_outcomes(count)')
                .order('created_at', { ascending: false });
            if (err) throw err;

            const result: EduContinuaConRAs[] = (data || []).map((ec: any) => ({
                ...ec,
                ra_count: ec.edu_continua_outcomes?.[0]?.count ?? 0,
            }));
            setProgramas(result);
        } catch (err: any) {
            setError(err.message || 'Error al cargar el catálogo');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { cargar(); }, []);

    const statusBadge: Record<string, { variant: 'default' | 'success' | 'warning' | 'info' | 'danger'; label: string }> = {
        borrador: { variant: 'default', label: 'Borrador' },
        revision: { variant: 'warning', label: 'En Revisión' },
        aprobada: { variant: 'info', label: 'Aprobada' },
        publicada: { variant: 'success', label: 'Publicada' },
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
            <SectionHeader
                title="Catálogo de Educación Continua"
                description="Todos los programas formativos diseñados en la plataforma"
                action={
                    <Link to="/edu-continua/constructor">
                        <Button size="sm" icon={<GraduationCap size={16} />}>Nuevo Programa</Button>
                    </Link>
                }
            />

            {loading && <LoadingState message="Cargando catálogo..." />}
            {error && <ErrorState message={error} onRetry={cargar} />}
            {!loading && !error && programas.length === 0 && (
                <EmptyState
                    icon="🎓"
                    title="Aún no hay programas"
                    description="Crea tu primer programa desde el Constructor"
                />
            )}

            {!loading && !error && programas.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {programas.map((programa) => {
                        const status = statusBadge[programa.status] || statusBadge.borrador;
                        return (
                            <Link key={programa.id} to={`/edu-continua/${programa.id}`} className="block">
                                <Card className="hover:border-brand-500/20 transition-all h-full">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1 min-w-0 pr-3">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant="brand" className="uppercase text-[10px]">{programa.type}</Badge>
                                            </div>
                                            <h3 className="font-semibold text-text-primary truncate">{programa.name}</h3>
                                            {programa.description && (
                                                <p className="text-sm text-text-muted mt-1 line-clamp-2">{programa.description}</p>
                                            )}
                                        </div>
                                        <Badge variant={status.variant}>{status.label}</Badge>
                                    </div>

                                    <div className="flex items-center gap-4 text-xs text-text-muted">
                                        {programa.mnc_level && (
                                            <span className="flex items-center gap-1">
                                                <GraduationCap size={14} /> Nivel {programa.mnc_level}
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1">
                                            <Target size={14} /> {programa.ra_count} RA{programa.ra_count !== 1 ? 's' : ''}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock size={14} /> {programa.hours_total || 0}h
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <BookOpen size={14} /> {programa.credits || 0} créditos
                                        </span>
                                    </div>

                                    <div className="mt-3 flex items-center justify-between text-xs text-text-muted border-t border-white/5 pt-3">
                                        <span>Creada: {new Date(programa.created_at).toLocaleDateString('es-CO')}</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-400 hover:text-red-300 hover:bg-red-400/10 px-2 py-1 h-auto"
                                            onClick={async (e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                if (window.confirm(`¿Seguro que deseas eliminar "${programa.name}"? Esta acción no se puede deshacer.`)) {
                                                    try {
                                                        // Primero borramos las relaciones para evitar errores de llave foránea (por si no hay ON DELETE CASCADE)
                                                        const { error: err1 } = await supabase.from('edu_continua_outcomes').delete().eq('edu_continua_id', programa.id);
                                                        if (err1) throw err1;

                                                        // Luego el programa en sí
                                                        const { error: err2 } = await supabase.from('edu_continua').delete().eq('id', programa.id);
                                                        if (err2) throw err2;

                                                        // Actualizamos UI
                                                        setProgramas(prev => prev.filter(p => p.id !== programa.id));
                                                    } catch (error: any) {
                                                        alert('Error al eliminar: ' + error.message);
                                                    }
                                                }
                                            }}
                                        >
                                            <Trash2 size={14} className="mr-1" /> Eliminar
                                        </Button>
                                    </div>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
