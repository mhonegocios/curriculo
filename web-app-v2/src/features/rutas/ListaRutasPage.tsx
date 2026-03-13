import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Card, Badge, Button, SectionHeader, LoadingState, EmptyState } from '../../components/ui';
import { Route, Plus, ChevronRight } from 'lucide-react';

/* ═══════════════════════════════════════════════════════
   Mis Rutas Formativas — Listado
   ═══════════════════════════════════════════════════════ */

interface Ruta {
    id: string;
    name: string;
    description: string;
    created_at: string;
    pathway_items: { count: number }[];
}

export function ListaRutasPage() {
    const [rutas, setRutas] = useState<Ruta[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function cargar() {
            setLoading(true);
            const { data, error } = await supabase
                .from('learning_pathways')
                .select('id, name, description, created_at, pathway_items(count)')
                .order('created_at', { ascending: false });
            if (!error && data) setRutas(data as unknown as Ruta[]);
            setLoading(false);
        }
        cargar();
    }, []);

    if (loading) return <LoadingState message="Cargando rutas formativas..." />;

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
            <SectionHeader
                title="Mis Rutas Formativas"
                description={`${rutas.length} ruta${rutas.length !== 1 ? 's' : ''} formativa${rutas.length !== 1 ? 's' : ''}`}
                action={
                    <Link to="/rutas/constructor">
                        <Button icon={<Plus size={16} />}>Nueva Ruta</Button>
                    </Link>
                }
            />

            {rutas.length === 0 ? (
                <EmptyState
                    icon="🛤️"
                    title="No hay rutas formativas aún"
                    description="Cree su primera ruta combinando microcredenciales en el constructor."
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {rutas.map((ruta) => {
                        const itemCount = ruta.pathway_items?.[0]?.count ?? 0;
                        return (
                            <Link key={ruta.id} to="/rutas/constructor" className="group">
                                <Card className="h-full hover:border-brand-500/30 transition-all group-hover:scale-[1.01]">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/15 to-sky-600/15">
                                            <Route size={20} className="text-cyan-400" />
                                        </div>
                                        <Badge variant="info">{itemCount} microcredenciales</Badge>
                                    </div>
                                    <h3 className="font-semibold text-text-primary mb-1">{ruta.name}</h3>
                                    {ruta.description && (
                                        <p className="text-sm text-text-muted line-clamp-2">{ruta.description}</p>
                                    )}
                                    <div className="flex items-center gap-1 text-brand-400 text-sm font-medium mt-4 group-hover:gap-2 transition-all">
                                        Ver ruta <ChevronRight size={14} />
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
