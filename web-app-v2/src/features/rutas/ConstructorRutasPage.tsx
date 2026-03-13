import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Card, Button, Badge, SectionHeader, LoadingState, EmptyState } from '../../components/ui';
import { Plus, Trash2, GripVertical, ArrowUpDown, Save, CheckCircle2 } from 'lucide-react';

/* ═══════════════════════════════════════════════════════
   Constructor de Rutas Formativas
   ═══════════════════════════════════════════════════════ */

interface MicrocredencialItem {
    id: string;
    name: string;
    hours_total: number;
    credits: number;
    status: string;
}

interface PathwayItem {
    microcredencial: MicrocredencialItem;
    order: number;
}

export function ConstructorRutasPage() {
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [items, setItems] = useState<PathwayItem[]>([]);
    const [disponibles, setDisponibles] = useState<MicrocredencialItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [guardado, setGuardado] = useState(false);

    useEffect(() => {
        async function cargar() {
            setLoading(true);
            const { data } = await supabase
                .from('microcredentials')
                .select('id, name, hours_total, credits, status')
                .order('name');
            if (data) setDisponibles(data);
            setLoading(false);
        }
        cargar();
    }, []);

    function agregarItem(micro: MicrocredencialItem) {
        if (items.some(i => i.microcredencial.id === micro.id)) return;
        setItems(prev => [...prev, { microcredencial: micro, order: prev.length }]);
        setGuardado(false);
    }

    function eliminarItem(idx: number) {
        setItems(prev => prev.filter((_, i) => i !== idx).map((item, i) => ({ ...item, order: i })));
        setGuardado(false);
    }

    function moverItem(idx: number, direccion: 'up' | 'down') {
        const newIdx = direccion === 'up' ? idx - 1 : idx + 1;
        if (newIdx < 0 || newIdx >= items.length) return;
        const newItems = [...items];
        [newItems[idx], newItems[newIdx]] = [newItems[newIdx], newItems[idx]];
        setItems(newItems.map((item, i) => ({ ...item, order: i })));
        setGuardado(false);
    }

    async function guardarRuta() {
        if (!nombre.trim() || items.length === 0) return;
        setGuardando(true);
        try {
            // Crear ruta
            const { data: ruta, error: rutaErr } = await supabase
                .from('learning_pathways')
                .insert({
                    institution_id: null,
                    name: nombre,
                    description: descripcion,
                })
                .select('id')
                .single();
            if (rutaErr) throw rutaErr;

            // Crear ítems
            const pathwayItems = items.map((item) => ({
                pathway_id: ruta.id,
                microcredential_id: item.microcredencial.id,
                order_index: item.order,
            }));

            const { error: itemsErr } = await supabase
                .from('pathway_items')
                .insert(pathwayItems);
            if (itemsErr) throw itemsErr;

            setGuardado(true);
        } catch (err) {
            console.error('Error guardando ruta:', err);
            alert('Error al guardar la ruta formativa');
        } finally {
            setGuardando(false);
        }
    }

    const totalHoras = items.reduce((sum, i) => sum + (i.microcredencial.hours_total || 0), 0);
    const totalCreditos = items.reduce((sum, i) => sum + (i.microcredencial.credits || 0), 0);

    // Microcredenciales no agregadas aún
    const noAgregadas = disponibles.filter(d => !items.some(i => i.microcredencial.id === d.id));

    if (loading) return <LoadingState message="Cargando microcredenciales..." />;

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
            <SectionHeader
                title="Constructor de Rutas Formativas"
                description="Arme una trayectoria de aprendizaje combinando microcredenciales en orden."
            />

            {/* Datos de la ruta */}
            <Card>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1.5">Nombre de la Ruta</label>
                        <input
                            className="w-full px-4 py-2.5 rounded-xl text-sm bg-surface-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                            style={{ borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border-subtle)' }}
                            placeholder="Ej: Ruta de Desarrollo de Software"
                            value={nombre}
                            onChange={(e) => { setNombre(e.target.value); setGuardado(false); }}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1.5">Descripción</label>
                        <input
                            className="w-full px-4 py-2.5 rounded-xl text-sm bg-surface-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                            style={{ borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border-subtle)' }}
                            placeholder="Trayectoria de aprendizaje para..."
                            value={descripcion}
                            onChange={(e) => { setDescripcion(e.target.value); setGuardado(false); }}
                        />
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Panel izquierdo: Microcredenciales disponibles */}
                <div className="lg:col-span-2 space-y-3">
                    <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
                        Microcredenciales Disponibles
                    </h3>
                    {noAgregadas.length === 0 ? (
                        <Card>
                            <p className="text-sm text-text-muted text-center py-4">
                                {disponibles.length === 0 ? 'No hay microcredenciales creadas.' : 'Todas las microcredenciales han sido agregadas.'}
                            </p>
                        </Card>
                    ) : (
                        noAgregadas.map((micro) => (
                            <Card key={micro.id} className="cursor-pointer hover:border-brand-500/30 transition-all" onClick={() => agregarItem(micro)}>
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-text-primary truncate">{micro.name}</p>
                                        <div className="flex gap-2 mt-1 text-xs text-text-muted">
                                            {micro.hours_total > 0 && <span>{micro.hours_total}h</span>}
                                            {micro.credits > 0 && <span>{micro.credits} créd.</span>}
                                        </div>
                                    </div>
                                    <Plus size={16} className="text-brand-400 shrink-0 ml-2" />
                                </div>
                            </Card>
                        ))
                    )}
                </div>

                {/* Panel derecho: Ruta formativa */}
                <div className="lg:col-span-3 space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
                            Ruta Formativa ({items.length} microcredenciales)
                        </h3>
                        <div className="flex gap-2">
                            <Badge variant="info">{totalHoras}h totales</Badge>
                            <Badge variant="info">{totalCreditos} créditos</Badge>
                        </div>
                    </div>

                    {items.length === 0 ? (
                        <EmptyState
                            icon="🛤️"
                            title="Ruta vacía"
                            description="Haga clic en las microcredenciales de la izquierda para agregarlas a la ruta."
                        />
                    ) : (
                        <>
                            {items.map((item, idx) => (
                                <Card key={item.microcredencial.id}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-brand-500/15 flex items-center justify-center text-xs font-bold text-brand-400 shrink-0">
                                            {idx + 1}
                                        </div>
                                        <GripVertical size={16} className="text-text-muted shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-text-primary truncate">{item.microcredencial.name}</p>
                                            <div className="flex gap-2 mt-0.5 text-xs text-text-muted">
                                                {item.microcredencial.hours_total > 0 && <span>{item.microcredencial.hours_total}h</span>}
                                                {item.microcredencial.credits > 0 && <span>{item.microcredencial.credits} créd.</span>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                className="p-1.5 text-text-muted hover:text-text-primary cursor-pointer disabled:opacity-30"
                                                onClick={() => moverItem(idx, 'up')}
                                                disabled={idx === 0}
                                            >
                                                <ArrowUpDown size={14} />
                                            </button>
                                            <button
                                                className="p-1.5 text-text-muted hover:text-red-400 cursor-pointer"
                                                onClick={() => eliminarItem(idx)}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </Card>
                            ))}

                            {/* Línea de conexión visual */}
                            <div className="flex justify-center">
                                <div className="w-0.5 h-8 bg-brand-500/20 rounded-full" />
                            </div>
                            <div className="text-center">
                                <Badge variant="success">🎓 Certificación Completa</Badge>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Guardar */}
            <Card>
                <div className="flex items-center justify-end gap-3">
                    <Button
                        variant={guardado ? 'secondary' : 'primary'}
                        icon={guardado ? <CheckCircle2 size={16} /> : <Save size={16} />}
                        onClick={guardarRuta}
                        loading={guardando}
                        disabled={!nombre.trim() || items.length === 0}
                    >
                        {guardado ? 'Ruta Guardada ✓' : 'Guardar Ruta Formativa'}
                    </Button>
                </div>
            </Card>
        </div>
    );
}
