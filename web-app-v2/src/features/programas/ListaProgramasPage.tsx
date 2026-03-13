import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Card, Badge, Button, SectionHeader, LoadingState, EmptyState } from '../../components/ui';
import { GraduationCap, Clock, Plus, ChevronRight, Layers } from 'lucide-react';

/* ═══════════════════════════════════════════════════════
   Mis Programas — Listado de Programas ETDH
   ═══════════════════════════════════════════════════════ */

interface Programa {
    id: string;
    name: string;
    type: string;
    mnc_level: number;
    total_hours: number;
    status: string;
    created_at: string;
    updated_at: string;
}

const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'info' | 'danger' }> = {
    borrador: { label: 'Borrador', variant: 'default' },
    revision: { label: 'En Revisión', variant: 'warning' },
    aprobado: { label: 'Aprobado', variant: 'success' },
    publicado: { label: 'Publicado', variant: 'info' },
};

export function ListaProgramasPage() {
    const [programas, setProgramas] = useState<Programa[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function cargar() {
            setLoading(true);
            const { data, error } = await supabase
                .from('programs')
                .select('id, name, type, mnc_level, total_hours, status, created_at, updated_at')
                .eq('type', 'tecnico_laboral')
                .order('updated_at', { ascending: false });
            if (!error && data) setProgramas(data);
            setLoading(false);
        }
        cargar();
    }, []);

    if (loading) return <LoadingState message="Cargando programas..." />;

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
            <SectionHeader
                title="Mis Programas ETDH"
                description={`${programas.length} programa${programas.length !== 1 ? 's' : ''} registrado${programas.length !== 1 ? 's' : ''}`}
                action={
                    <Link to="/programas/nuevo">
                        <Button icon={<Plus size={16} />}>Nuevo Programa</Button>
                    </Link>
                }
            />

            {programas.length === 0 ? (
                <EmptyState
                    icon="🎓"
                    title="No hay programas aún"
                    description="Cree su primer programa ETDH usando el wizard de 9 pasos."
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {programas.map((prog) => {
                        const status = STATUS_MAP[prog.status] || STATUS_MAP.borrador;
                        return (
                            <Link key={prog.id} to={`/programas/nuevo?id=${prog.id}`} className="group">
                                <Card className="h-full hover:border-brand-500/30 transition-all group-hover:scale-[1.01]">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-rose-500/15 to-pink-600/15">
                                            <GraduationCap size={20} className="text-rose-400" />
                                        </div>
                                        <Badge variant={status.variant}>{status.label}</Badge>
                                    </div>
                                    <h3 className="font-semibold text-text-primary mb-1">{prog.name}</h3>
                                    <div className="flex flex-wrap gap-3 text-xs text-text-muted mt-3">
                                        <span className="flex items-center gap-1">
                                            <Layers size={12} /> Nivel MNC {prog.mnc_level}
                                        </span>
                                        {prog.total_hours > 0 && (
                                            <span className="flex items-center gap-1">
                                                <Clock size={12} /> {prog.total_hours}h
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 text-brand-400 text-sm font-medium mt-4 group-hover:gap-2 transition-all">
                                        Continuar <ChevronRight size={14} />
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
