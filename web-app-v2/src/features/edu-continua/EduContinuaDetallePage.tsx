import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Card, Badge, LoadingState, ErrorState, Button } from '../../components/ui';
import { GraduationCap, ArrowLeft, BookOpen, Target, Clock, FileText } from 'lucide-react';
import type { EduContinua } from '../../lib/types';
import { SilaboModal } from './SilaboModal';
import { EvaluacionModal } from './EvaluacionModal';
import { generateProgramaDocx } from '../../utils/docxExport';

export function EduContinuaDetallePage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [ec, setEc] = useState<EduContinua | null>(null);
    const [ras, setRas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Estado para el Modal de Sílabo
    const [mostrarSilabo, setMostrarSilabo] = useState(false);
    const [mostrarEvaluacion, setMostrarEvaluacion] = useState(false);
    const [exportandoDocx, setExportandoDocx] = useState(false);

    useEffect(() => {
        async function cargarDetalle() {
            if (!id) return;
            setLoading(true);
            try {
                // Cargar datos básicos (incluye silabo_json)
                const { data: ecData, error: ecError } = await supabase
                    .from('edu_continua')
                    .select('*')
                    .eq('id', id)
                    .single();
                if (ecError) throw ecError;
                setEc(ecData);

                // Cargar los RAs asociados y sus posibles adaptaciones
                const { data: raData, error: raError } = await supabase
                    .from('edu_continua_outcomes')
                    .select(`
                        learning_outcome_id,
                        descripcion_adaptada,
                        resultados_aprendizaje_cnc (
                            id,
                            codigo,
                            descripcion,
                            competencias_especificas_cnc (
                                cualificaciones_cnc (
                                    denominacion
                                )
                            )
                        )
                    `)
                    .eq('edu_continua_id', id);

                if (raError) throw raError;

                const rasExtraidos = raData
                    .map((item: any) => {
                        if (!item.resultados_aprendizaje_cnc) return null;
                        return {
                            ...item.resultados_aprendizaje_cnc,
                            descripcion_adaptada: item.descripcion_adaptada,
                            learning_outcome_id: item.learning_outcome_id
                        };
                    })
                    .filter(Boolean);
                setRas(rasExtraidos);

            } catch (err: any) {
                console.error(err);
                setError(err.message || 'Error al cargar los detalles');
            } finally {
                setLoading(false);
            }
        }
        cargarDetalle();
    }, [id]);

    const handleExportarDocx = async () => {
        if (!ec) return;
        setExportandoDocx(true);
        try {
            // Intentar extraer el nombre de la cualificación del primer RA
            const cualNombre = ras[0]?.competencias_especificas_cnc?.cualificaciones_cnc?.denominacion;

            await generateProgramaDocx(
                {
                    nombre: ec.name,
                    tipo: ec.type,
                    horas: ec.hours_total,
                    descripcion: ec.description || 'Sin descripción',
                    mnc_level: ec.mnc_level,
                    cualificacionNombre: cualNombre,
                },
                ec.silabo_json || null,
                ec.evaluacion_json || null,
                ras // Pasamos los RAs para mapear descripciones
            );
        } catch (error) {
            console.error("Error exporting to Word:", error);
            alert("Hubo un error al exportar el documento.");
        } finally {
            setExportandoDocx(false);
        }
    };

    if (loading) return <LoadingState message="Cargando detalles..." />;
    if (error || !ec) return <ErrorState message={error || 'Programa no encontrado'} onRetry={() => navigate('/edu-continua/catalogo')} />;

    const statusBadge = ec.status === 'publicada' ? { variant: 'success' as const, label: 'Publicada' } :
        ec.status === 'aprobada' ? { variant: 'info' as const, label: 'Aprobada' } :
            ec.status === 'revision' ? { variant: 'warning' as const, label: 'En Revisión' } :
                { variant: 'default' as const, label: 'Borrador' };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
            <Button variant="ghost" icon={<ArrowLeft size={16} />} onClick={() => navigate('/edu-continua/catalogo')}>
                Volver al catálogo
            </Button>

            <div className="flex flex-col gap-6">
                <Card>
                    <div className="flex items-start justify-between mb-4 flex-wrap gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-text-primary mb-2">{ec.name}</h1>
                            <div className="flex gap-2">
                                <Badge variant="brand" className="uppercase">{ec.type}</Badge>
                                <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {ec.silabo_json && (
                                <Button
                                    variant="brand"
                                    icon={<FileText size={16} />}
                                    onClick={() => setMostrarSilabo(true)}
                                >
                                    Ver Sílabo
                                </Button>
                            )}
                            {ec.evaluacion_json && (
                                <Button
                                    variant="secondary"
                                    icon={<Target size={16} />}
                                    onClick={() => setMostrarEvaluacion(true)}
                                >
                                    Ver Evaluaciones
                                </Button>
                            )}
                            {(ec.silabo_json || ec.evaluacion_json) && (
                                <Button
                                    variant="secondary"
                                    onClick={handleExportarDocx}
                                    loading={exportandoDocx}
                                    className="bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border-blue-500/30"
                                >
                                    Descargar Word (.docx)
                                </Button>
                            )}
                        </div>
                    </div>

                    <p className="text-text-secondary mb-6 leading-relaxed">
                        {ec.description || 'Sin descripción disponible.'}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-surface-3/50 rounded-xl border border-theme">
                        <div className="space-y-1">
                            <div className="text-xs text-text-muted flex items-center gap-1"><GraduationCap size={14} /> Nivel MNC</div>
                            <div className="font-semibold text-text-primary">{ec.mnc_level || 'N/A'}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-xs text-text-muted flex items-center gap-1"><Clock size={14} /> Duración</div>
                            <div className="font-semibold text-text-primary">{ec.hours_total || 0}h</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-xs text-text-muted flex items-center gap-1"><BookOpen size={14} /> Créditos</div>
                            <div className="font-semibold text-text-primary">{ec.credits || 0}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-xs text-text-muted flex items-center gap-1"><Target size={14} /> RAs</div>
                            <div className="font-semibold text-text-primary">{ras.length}</div>
                        </div>
                    </div>
                </Card>

                <Card>
                    <h2 className="text-lg font-semibold text-text-primary border-b border-theme pb-3 mb-4 flex items-center gap-2">
                        <Target size={18} className="text-brand-400" />
                        Resultados de Aprendizaje ({ras.length})
                    </h2>
                    {ras.length === 0 ? (
                        <p className="text-text-muted text-sm pb-2">No se han asociado Resultados de Aprendizaje.</p>
                    ) : (
                        <ul className="space-y-3">
                            {ras.map(ra => (
                                <li key={ra.id} className="p-3 bg-surface-3 rounded-lg border border-theme flex gap-3">
                                    <div className="mt-0.5 text-brand-500 font-mono text-xs">{ra.codigo}</div>
                                    <div className="flex-1">
                                        <div className="text-sm text-text-secondary">
                                            {ra.descripcion_adaptada ? (
                                                <span>
                                                    {ra.descripcion_adaptada}
                                                    <span className="block mt-1 text-xs text-text-muted italic flex items-center gap-1">
                                                        <Target size={10} /> Original: {ra.descripcion}
                                                    </span>
                                                </span>
                                            ) : (
                                                ra.descripcion
                                            )}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>
            </div>

            {/* Modal del Sílabo previamente generado y guardado */}
            {mostrarSilabo && ec.silabo_json && (
                <SilaboModal silabo={ec.silabo_json} ras={ras} onClose={() => setMostrarSilabo(false)} />
            )}

            {/* Modal de Evaluaciones previamente generadas y guardadas */}
            {mostrarEvaluacion && ec.evaluacion_json && (
                <EvaluacionModal
                    evaluaciones={ec.evaluacion_json.evaluaciones || ec.evaluacion_json}
                    onClose={() => setMostrarEvaluacion(false)}
                />
            )}
        </div>
    );
}
