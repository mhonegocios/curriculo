import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useCualificaciones } from '../../hooks/useCualificaciones';
import { Card, Badge, Button, LoadingState, ErrorState, Stepper, Select, SectionHeader } from '../../components/ui';
import { CheckCircle2, Circle, Save, Target, Sparkles, ChevronRight, ChevronLeft, Edit2, FileText, AlertCircle, BookOpen, RotateCcw, X, GraduationCap, Clock } from 'lucide-react';
import { SilaboModal, type SilaboData } from './SilaboModal';
import { EvaluacionModal } from './EvaluacionModal';
import { supabase } from '../../lib/supabase';
import { useN8nWebhook } from '../../hooks/useN8nWebhook';
import { generateProgramaDocx } from '../../utils/docxExport';

export function BuilderPage() {
    const navigate = useNavigate();
    const { cualificaciones, loading, error } = useCualificaciones();
    const [pasoActual, setPasoActual] = useState(1);

    // Paso 1: Filtros, Info Básica y Selección de RAs
    // Zone A: Descubrimiento
    const [modoDescubrimiento, setModoDescubrimiento] = useState<'ia' | 'manual'>('ia');
    const [promptIA, setPromptIA] = useState('');
    const [buscandoConIA, setBuscandoConIA] = useState(false);
    const [cualificacionesSugeridas, setCualificacionesSugeridas] = useState<string[]>([]);

    // Zone B: Formulación
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [tipoPrograma, setTipoPrograma] = useState('Microcredencial');
    const [tipologiaPersonalizada, setTipologiaPersonalizada] = useState('');
    const [tipologiasGuardadas, setTipologiasGuardadas] = useState<string[]>([]);
    const [modalidadesGuardadas, setModalidadesGuardadas] = useState<string[]>([]);
    const [enfoquesGuardados, setEnfoquesGuardados] = useState<string[]>([]);
    const [esOtroTipo, setEsOtroTipo] = useState(false);
    const [esOtraModalidad, setEsOtraModalidad] = useState(false);
    const [esOtroEnfoque, setEsOtroEnfoque] = useState(false);
    const [nuevaModalidad, setNuevaModalidad] = useState('');
    const [nuevoEnfoque, setNuevoEnfoque] = useState('');
    const [duracionHoras, setDuracionHoras] = useState<number>(0);
    const [duracionEditada, setDuracionEditada] = useState(false);

    // RAs Seleccionados (Paso 1)
    const [rasSeleccionados, setRAsSeleccionados] = useState<string[]>([]);

    // Paso 3: Adaptación y Copiloto
    const [rasAdaptados, setRasAdaptados] = useState<Record<string, string>>({});
    const [editandoRa, setEditandoRa] = useState<string | null>(null);
    const [textoEditado, setTextoEditado] = useState('');

    const [mostrarParametros, setMostrarParametros] = useState(false);
    const [parametrosSilabo, setParametrosSilabo] = useState({
        modalidad: 'Blended (Mixta)',
        enfoquePedagogico: 'Aprendizaje Basado en Proyectos (ABP)',
        perfilIngreso: 'Técnico/Operativo con conocimientos básicos',
        restriccionesHardware: 'Herramientas y software Open Source o de libre acceso',
    });
    const [silaboGenerado, setSilaboGenerado] = useState<any>(null);
    const [generandoSilabo, setGenerandoSilabo] = useState(false);
    const [silaboMostrado, setSilaboMostrado] = useState(false);

    const [evaluacionGenerada, setEvaluacionGenerada] = useState<any>(null);
    const [generandoEvaluacion, setGenerandoEvaluacion] = useState(false);
    const [evaluacionMostrada, setEvaluacionMostrada] = useState(false);
    const [loadingLabel, setLoadingLabel] = useState('Procesando...');

    // Paso 4: Publicación / Guardado
    const [guardando, setGuardando] = useState(false);
    const [guardado, setGuardado] = useState(false);
    const [errorGuardado, setErrorGuardado] = useState<string | null>(null);

    // ZONA C: Parámetros de Evaluación
    const [escalaEvaluacion, setEscalaEvaluacion] = useState('Escala 1 a 5');
    const [tipoEscala, setTipoEscala] = useState('Cuantitativa');
    const [esOtraEscala, setEsOtraEscala] = useState(false);
    const [nuevaEscala, setNuevaEscala] = useState('');
    const [escalasGuardadas, setEscalasGuardadas] = useState<string[]>([]);
    const [exportandoDocx, setExportandoDocx] = useState(false);

    // Opciones para filtros de Cualificación (Modo Manual)
    const [filtroSector, setFiltroSector] = useState('');
    const [filtroSubsector, setFiltroSubsector] = useState('');
    const [filtroArea, setFiltroArea] = useState('');
    const [filtroBusqueda, setFiltroBusqueda] = useState('');
    const [cualSeleccionada, setCualSeleccionada] = useState<string>('');

    // Persistencia de Borrador (Draft)
    useEffect(() => {
        const draft = {
            nombre, descripcion, tipoPrograma, duracionHoras,
            rasSeleccionados, rasAdaptados,
            silaboGenerado, evaluacionGenerada, pasoActual,
            cualSeleccionada, parametrosSilabo
        };
        if (pasoActual > 1 || nombre || rasSeleccionados.length > 0) {
            localStorage.setItem('builder_draft', JSON.stringify(draft));
        }
    }, [nombre, descripcion, tipoPrograma, duracionHoras, rasSeleccionados, rasAdaptados, silaboGenerado, evaluacionGenerada, pasoActual, cualSeleccionada, parametrosSilabo]);

    // Cargar Borrador y Tipologías al inicio
    useEffect(() => {
        const saved = localStorage.getItem('builder_draft');
        if (saved) {
            console.log("Draft available for recovery");
        }
        
        const savedTipos = localStorage.getItem('builder_custom_tipos');
        if (savedTipos) {
            try {
                setTipologiasGuardadas(JSON.parse(savedTipos));
            } catch (e) {
                console.error("Error parsing custom tipos", e);
            }
        }

        const savedModalidades = localStorage.getItem('builder_custom_modalidades');
        if (savedModalidades) {
            try {
                setModalidadesGuardadas(JSON.parse(savedModalidades));
            } catch (e) {
                console.error("Error parsing custom modalidades", e);
            }
        }

        const savedEnfoques = localStorage.getItem('builder_custom_enfoques');
        if (savedEnfoques) {
            try {
                setEnfoquesGuardados(JSON.parse(savedEnfoques));
            } catch (e) {
                console.error("Error parsing custom enfoques", e);
            }
        }

        const savedEscalas = localStorage.getItem('builder_custom_escalas');
        if (savedEscalas) {
            try {
                setEscalasGuardadas(JSON.parse(savedEscalas));
            } catch (e) {
                console.error("Error parsing custom escalas", e);
            }
        }
    }, []);

    const cargarBorrador = () => {
        const saved = localStorage.getItem('builder_draft');
        if (saved) {
            const d = JSON.parse(saved);
            setNombre(d.nombre || '');
            setDescripcion(d.descripcion || '');
            setTipoPrograma(d.tipoPrograma || 'Microcredencial');
            setDuracionHoras(d.duracionHoras || 0);
            setRAsSeleccionados(d.rasSeleccionados || []);
            setRasAdaptados(d.rasAdaptados || {});
            setSilaboGenerado(d.silaboGenerado || null);
            setEvaluacionGenerada(d.evaluacionGenerada || null);
            setPasoActual(d.pasoActual || 1);
            if (d.cualSeleccionada) setCualSeleccionada(d.cualSeleccionada);
            if (d.parametrosSilabo) setParametrosSilabo(d.parametrosSilabo);
        }
    };

    const n8nSilabo = useN8nWebhook('generar-silabo-microcredencial');
    const n8nEvaluacion = useN8nWebhook('generar-evaluacion-microcredencial', true);
    const n8nBuscadorIA = useN8nWebhook('sugerir-ras-mnc', true);

    // Computados
    const cualActiva = useMemo(() => cualificaciones.find(c => c.id === cualSeleccionada), [cualificaciones, cualSeleccionada]);
    const rasDisponibles = useMemo(() => {
        if (modoDescubrimiento === 'ia') {
            if (cualificacionesSugeridas.length === 0) return [];
            return cualificaciones
                .filter(c => cualificacionesSugeridas.includes(c.id))
                .flatMap(c => c.competencias.flatMap(comp => 
                    (comp.resultados || []).map(ra => ({ ...ra, competencia: comp.denominacion, compCodigo: comp.codigo, cualificacionNombre: `${c.codigo} — ${c.denominacion}` }))
                ));
        } else {
            if (!cualActiva) return [];
            return cualActiva.competencias.flatMap(comp =>
                (comp.resultados || []).map(ra => ({ ...ra, competencia: comp.denominacion, compCodigo: comp.codigo, cualificacionNombre: `${cualActiva.codigo} — ${cualActiva.denominacion}` }))
            );
        }
    }, [cualActiva, modoDescubrimiento, cualificacionesSugeridas, cualificaciones]);



    const rasDetalle = useMemo(() => {
        // Encontrar todos los RAs en TODAS las cualificaciones que correspondan a rasSeleccionados
        // Esto evita que se pierdan los RAs si el usuario cambia la cualificacion activa
        const allRAs = cualificaciones.flatMap(c => 
            c.competencias.flatMap(comp => 
                (comp.resultados || []).map(ra => ({ ...ra, competencia: comp.denominacion, compCodigo: comp.codigo, competencia_id: comp.id }))
            )
        );
        return allRAs.filter(ra => rasSeleccionados.includes(ra.id)).map(ra => ({
            ...ra,
            descripcion_adaptada: rasAdaptados[ra.id] || ''
        }));
    }, [cualificaciones, rasSeleccionados, rasAdaptados]);

    const cualInferida = useMemo(() => {
        if (cualActiva) return cualActiva;
        if (rasDetalle.length > 0) {
            const currentCompId = rasDetalle[0].competencia_id;
            return cualificaciones.find(c => c.competencias.some((comp: any) => comp.id === currentCompId));
        }
        return undefined;
    }, [cualActiva, rasDetalle, cualificaciones]);

    const creditos = Math.ceil(duracionHoras / 48);

    // Handlers
    function toggleRA(raId: string) {
        setRAsSeleccionados(prev => {
            const isSelected = prev.includes(raId);
            const nextSeleccionados = isSelected ? prev.filter(id => id !== raId) : [...prev, raId];

            if (cualActiva && rasDisponibles.length > 0) {
                if (!duracionEditada) {
                    const horasTotalesCualificacion = cualActiva.duracion_horas || 0;
                    const horasPorRA = horasTotalesCualificacion / rasDisponibles.length;
                    const horasSugeridas = Math.round(nextSeleccionados.length * horasPorRA);
                    setDuracionHoras(horasSugeridas > 0 ? horasSugeridas : 0);
                }
            }
            return nextSeleccionados;
        });
    }

    const handleGuardarRaAdaptado = (raId: string) => {
        setRasAdaptados(prev => ({ ...prev, [raId]: textoEditado }));
        setEditandoRa(null);
    };

    const handleGenerarSilabo = async () => {
        setMostrarParametros(false);
        setGenerandoSilabo(true);
        setLoadingLabel('Diseñando estructura curricular...');
        try {
            // Filtrar conocimientos que correspondan a las competencias de los RAs seleccionados
            const activeCompetenciaIds = [...new Set(rasDetalle.map(ra => ra.competencia_id))];
            
            // Buscar en todas las cualificaciones los conocimientos de estas competencias
            const activeConocimientos = cualificaciones
                .flatMap(c => c.competencias)
                .filter(comp => activeCompetenciaIds.includes(comp.id))
                .flatMap(comp => comp.conocimientos || []);

            const payload = {
                programa: nombre,
                tipo: tipoPrograma,
                descripcion: descripcion,
                horas_totales: duracionHoras,
                creditos: creditos,
                nivel_mnc: cualInferida?.nivel_mnc || 0,
                ras: rasDetalle.map(ra => ({
                    codigo: ra.codigo,
                    descripcion: ra.descripcion_adaptada || ra.descripcion
                })),
                conocimientos_esenciales: {
                    conceptuales: activeConocimientos.filter(c => c.tipo === 'conceptual').map(c => c.contenido),
                    procedimentales: activeConocimientos.filter(c => c.tipo === 'procedimental').map(c => c.contenido),
                    actitudinales: activeConocimientos.filter(c => c.tipo === 'actitudinal').map(c => c.contenido),
                },
                ...parametrosSilabo
            };
            const response = await n8nSilabo.trigger(payload);

            if (response) {
                let data = response;
                if (Array.isArray(response)) data = response[0];
                if (data?.output) data = data.output;
                if (Array.isArray(data)) data = data[0];
                setSilaboGenerado(data);
                toast.success('Sílabo generado exitosamente');
            }
        } catch (err) {
            console.error('Error al generar sílabo', err);
            toast.error('Ocurrió un error al generar el sílabo. Intenta de nuevo.');
        } finally {
            setGenerandoSilabo(false);
        }
    };

    async function handleGenerarEvaluaciones(silaboActual?: SilaboData) {
        // Si el usuario editó el sílabo, usamos ese para alinear evaluaciones
        const silaboSource = silaboActual || silaboGenerado;

        setGenerandoEvaluacion(true);
        setLoadingLabel('Construyendo matriz de evaluación y rúbricas...');
        try {
            // 1. Obtener criterios de evaluación de Supabase filtrando por los RAs
            const { data: criterios, error } = await supabase
                .from('criterios_evaluacion_cnc')
                .select('*')
                .in('resultado_aprendizaje_id', rasSeleccionados);

            if (error) throw error;

            // 2. Construir payload asociando cada RA a sus criterios
            const rasPayload = rasDetalle.map(ra => {
                const crits = criterios?.filter(c => c.resultado_aprendizaje_id === ra.id) || [];
                return {
                    codigo: ra.codigo,
                    descripcion: ra.descripcion_adaptada || ra.descripcion,
                    criterios_evaluacion: crits.map(c => ({
                        codigo: c.codigo,
                        descripcion: c.descripcion
                    }))
                };
            });

            // Extract Activities from Source to align the evaluation rubrics to them
            const actividadesSilabo = silaboSource?.modulos?.flatMap((m: any) => m.actividades_aprendizaje || []) || [];

            const payload = {
                programa: {
                    nombre,
                    tipo: tipoPrograma,
                    horas: duracionHoras,
                    descripcion
                },
                parametros_evaluacion: {
                    tipo_escala: tipoEscala,
                    escala_valores: escalaEvaluacion
                },
                silabo_actividades: actividadesSilabo,
                ras: rasPayload
            };

            // 3. Llamar n8n
            const response = await n8nEvaluacion.trigger(payload);

            if (response) {
                let data = response;
                if (Array.isArray(response)) data = response[0];
                if (data?.output) data = data.output;
                if (Array.isArray(data)) data = data[0];
                setEvaluacionGenerada(data);
                toast.success('Evaluaciones generadas exitosamente');
            }
        } catch (error: any) {
            console.error("Error generando evaluaciones:", error);
            toast.error("Hubo un error al generar las evaluaciones. Revisa la consola.");
        } finally {
            setGenerandoEvaluacion(false);
        }
    }

    async function guardarProgramaFinal() {
        if (!cualInferida || rasSeleccionados.length === 0 || !nombre.trim()) return;
        setGuardando(true);
        setErrorGuardado(null);

        try {
            const { data: ec, error: e1 } = await supabase
                .from('edu_continua')
                .insert({
                    institution_id: null,
                    name: nombre.trim(),
                    description: descripcion.trim(),
                    type: tipoPrograma,
                    mnc_level: cualInferida.nivel_mnc,
                    hours_total: duracionHoras,
                    credits: creditos,
                    status: 'aprobada', // Cambiamos a aprobada o publicada una vez hecho el wizard
                    silabo_json: silaboGenerado, // Guardamos el JSON
                    evaluacion_json: evaluacionGenerada // Guardamos el JSON de valuacion
                })
                .select('id')
                .single();
            if (e1) throw e1;

            const outcomes = rasDetalle.map(ra => ({
                edu_continua_id: ec.id,
                learning_outcome_id: ra.id,
                descripcion_adaptada: ra.descripcion_adaptada || null
            }));
            const { error: e2 } = await supabase.from('edu_continua_outcomes').insert(outcomes);
            if (e2) throw e2;

            setGuardado(true);
            toast.success('¡Programa guardado exitosamente!');
            setTimeout(() => {
                navigate('/edu-continua/catalogo');
            }, 2000);

        } catch (err: any) {
            console.error('Error guardando programa:', err);
            setErrorGuardado(err.message || 'Error al guardar el programa');
            toast.error(err.message || 'Error al guardar el programa');
        } finally {
            setGuardando(false);
        }
    }

    const handleExportarDocx = async () => {
        setExportandoDocx(true);
        try {
            await generateProgramaDocx(
                {
                    nombre: nombre.trim() || 'Software',
                    tipo: tipoPrograma,
                    horas: duracionHoras,
                    descripcion: descripcion.trim(),
                    cualificacionNombre: cualInferida?.denominacion,
                    mnc_level: cualInferida?.nivel_mnc
                },
                silaboGenerado || null,
                evaluacionGenerada || null,
                rasDetalle // Pasamos los RAs para mapear descripciones
            );
            toast.success('Documento exportado exitosamente');
        } catch (error) {
            console.error("Error exporting to Word:", error);
            toast.error("Hubo un error al exportar el documento.");
        } finally {
            setExportandoDocx(false);
        }
    };

    const handleGuardarNuevaEscala = () => {
        if (nuevaEscala.trim()) {
            const updated = [...escalasGuardadas, nuevaEscala.trim()];
            setEscalasGuardadas(updated);
            localStorage.setItem('builder_custom_escalas', JSON.stringify(updated));
            setEscalaEvaluacion(nuevaEscala.trim());
            setEsOtraEscala(false);
            setNuevaEscala('');
            toast.success('Escala guardada exitosamente');
        }
    };

    // Animación de textos de carga
    useEffect(() => {
        let interval: any;
        if (generandoSilabo || generandoEvaluacion) {
            const labelsSilabo = ['Analizando Resultados de Aprendizaje...', 'Estructurando módulos...', 'Buscando saberes complementarios...', 'Redactando el documento final...', 'Alineando Saberes con RAs...'];
            const labelsEvaluacion = ['Analizando los RAs seleccionados...', 'Generando rúbricas...', 'Creando matrices de evaluación...', 'Detallando niveles de desempeño...'];
            const labels = generandoSilabo ? labelsSilabo : labelsEvaluacion;
            
            let index = 0;
            setLoadingLabel(labels[0]);
            interval = setInterval(() => {
                index = (index + 1) % labels.length;
                setLoadingLabel(labels[index]);
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [generandoSilabo, generandoEvaluacion]);

    const sectoresInfo = useMemo(() => Array.from(new Set(cualificaciones.map(c => c.sector_productivo).filter(Boolean))), [cualificaciones]);
    const subsectoresInfo = useMemo(() => Array.from(new Set(cualificaciones.filter(c => !filtroSector || c.sector_productivo === filtroSector).map(c => c.subsector).filter(Boolean))), [cualificaciones, filtroSector]);
    const areasInfo = useMemo(() => Array.from(new Set(cualificaciones.filter(c => (!filtroSector || c.sector_productivo === filtroSector) && (!filtroSubsector || c.subsector === filtroSubsector)).map(c => c.area_cualificacion).filter(Boolean))), [cualificaciones, filtroSector, filtroSubsector]);

    const cualificacionesFiltradas = useMemo(() => {
        // Permitir búsqueda si hay filtros de sector O si hay una búsqueda por texto de al menos 3 caracteres
        const tieneFiltroManual = !!filtroSector;
        const tieneBusquedaTexto = filtroBusqueda.length >= 3;
        
        if (!tieneFiltroManual && !tieneBusquedaTexto) return [];
        
        return cualificaciones.filter(c => {
            // Filtros jerárquicos
            if (filtroSector && c.sector_productivo !== filtroSector) return false;
            if (filtroSubsector && c.subsector !== filtroSubsector) return false;
            if (filtroArea && c.area_cualificacion !== filtroArea) return false;
            
            // Filtro por texto (si existe)
            if (filtroBusqueda) {
                const search = filtroBusqueda.toLowerCase();
                const matchNombre = c.denominacion?.toLowerCase().includes(search);
                const matchCodigo = c.codigo?.toLowerCase().includes(search);
                if (!matchNombre && !matchCodigo) return false;
            }
            
            return true;
        });
    }, [cualificaciones, filtroSector, filtroSubsector, filtroArea, filtroBusqueda]);

    // UI Steps
    const handleSugerirIA = async () => {
        if (!promptIA.trim()) return;
        setBuscandoConIA(true);
        toast.info("Analizando solicitud y buscando RAs...", { duration: 3000 });
        
        try {
            const response = await n8nBuscadorIA.trigger({ prompt: promptIA });
            
            // Expected response format: { nombre_sugerido: "string", ras_ids: ["uuid1", "uuid2"] }
            if (response && response.ras_ids && Array.isArray(response.ras_ids) && response.ras_ids.length > 0) {
                const suggestedIds = response.ras_ids;
                
                // Find all matched RAs in the database
                const matchedRAs = cualificaciones.flatMap(c => 
                    c.competencias.flatMap(comp => 
                        (comp.resultados || []).filter(ra => suggestedIds.includes(ra.id)).map(ra => ({ ...ra, cualificacionId: c.id }))
                    )
                );

                if (matchedRAs.length > 0) {
                    // Group by Cualificacion to find the one with the most hits
                    const cualiCounts = matchedRAs.reduce((acc, ra) => {
                        acc[ra.cualificacionId] = (acc[ra.cualificacionId] || 0) + 1;
                        return acc;
                    }, {} as Record<string, number>);

                    let bestCualiId = Object.keys(cualiCounts)[0];
                    let maxCount = cualiCounts[bestCualiId];

                    for (const cid in cualiCounts) {
                        if (cualiCounts[cid] > maxCount) {
                            maxCount = cualiCounts[cid];
                            bestCualiId = cid;
                        }
                    }

                    // Auto-select the best qualification
                    setCualSeleccionada(bestCualiId);
                    
                    const matchedCualiIds = Array.from(new Set(matchedRAs.map(ra => ra.cualificacionId)));
                    setCualificacionesSugeridas(matchedCualiIds);
                    
                    // Auto-select the RAs
                    const newSelections = matchedRAs.map(ra => ra.id);
                    setRAsSeleccionados(newSelections);

                    // Auto-suggest name
                    if (response.nombre_sugerido) {
                        setNombre(response.nombre_sugerido);
                    } else {
                        setNombre(`Curso de ${promptIA}`);
                    }
                    
                     // Auto-suggest duration based on the number of RAs
                     const cualiOfBest = cualificaciones.find(c => c.id === bestCualiId);
                     if (cualiOfBest) {
                         const allRAsInCuali = cualiOfBest.competencias.flatMap(c => c.resultados || []);
                         if (allRAsInCuali.length > 0) {
                             const hoursPerRa = (cualiOfBest.duracion_horas || 0) / allRAsInCuali.length;
                             setDuracionHoras(Math.round(hoursPerRa * newSelections.length) || 48); // Fallback to 48 if calc fails
                         }
                     }

                    toast.success(`Se encontraron y seleccionaron ${newSelections.length} RAs sugeridos.`);
                } else {
                    toast.warning("La IA devolvió resultados, pero no se encontraron en la base de datos.");
                }
            } else {
                 toast.error("No se encontraron sugerencias de RAs para tu solicitud.");
            }
        } catch (err) {
            console.error(err);
            toast.error("Hubo un error al comunicarse con el asistente IA.");
        } finally {
            setBuscandoConIA(false);
        }
    };

    const handleGuardarNuevaTipologia = () => {
        if (!tipologiaPersonalizada.trim()) return;
        
        const nuevasTipologias = Array.from(new Set([...tipologiasGuardadas, tipologiaPersonalizada.trim()]));
        setTipologiasGuardadas(nuevasTipologias);
        localStorage.setItem('builder_custom_tipos', JSON.stringify(nuevasTipologias));
        
        setTipoPrograma(tipologiaPersonalizada.trim());
        setEsOtroTipo(false);
        setTipologiaPersonalizada('');
    };

    const handleGuardarNuevaModalidad = () => {
        if (!nuevaModalidad.trim()) return;
        const nuevas = Array.from(new Set([...modalidadesGuardadas, nuevaModalidad.trim()]));
        setModalidadesGuardadas(nuevas);
        localStorage.setItem('builder_custom_modalidades', JSON.stringify(nuevas));
        setParametrosSilabo(prev => ({ ...prev, modalidad: nuevaModalidad.trim() }));
        setEsOtraModalidad(false);
        setNuevaModalidad('');
    };

    const handleGuardarNuevoEnfoque = () => {
        if (!nuevoEnfoque.trim()) return;
        const nuevos = Array.from(new Set([...enfoquesGuardados, nuevoEnfoque.trim()]));
        setEnfoquesGuardados(nuevos);
        localStorage.setItem('builder_custom_enfoques', JSON.stringify(nuevos));
        setParametrosSilabo(prev => ({ ...prev, enfoquePedagogico: nuevoEnfoque.trim() }));
        setEsOtroEnfoque(false);
        setNuevoEnfoque('');
    };

    const renderStep1 = () => (
        <div className="space-y-8 animate-fade-in relative">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-xl font-semibold text-text-primary mb-2 flex items-center gap-2">Paso 1: Identificación de Competencias <Target size={20} className="text-brand-400" /></h2>
                    <p className="text-sm text-text-secondary">Selecciona las competencias del MNC que deseas desarrollar para definir la estructura base de tu programa.</p>
                </div>
                {localStorage.getItem('builder_draft') && (
                    <Button variant="ghost" size="sm" onClick={cargarBorrador} className="text-brand-400 hover:text-brand-300 gap-2">
                        <RotateCcw size={14} /> Recuperar Borrador
                    </Button>
                )}
            </div>

            {/* ZONA A: Descubrimiento de RAs */}
            <div className="bg-surface-2 border border-theme rounded-xl p-5 mb-8 shadow-sm">
                <div className="flex border-b border-theme mb-6">
                    <button
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${modoDescubrimiento === 'ia' ? 'border-brand-500 text-brand-400' : 'border-transparent text-text-muted hover:text-text-primary'}`}
                        onClick={() => setModoDescubrimiento('ia')}
                    >
                        <Sparkles size={16} /> Modo Asistente IA
                    </button>
                    <button
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${modoDescubrimiento === 'manual' ? 'border-brand-500 text-brand-400' : 'border-transparent text-text-muted hover:text-text-primary'}`}
                        onClick={() => setModoDescubrimiento('manual')}
                    >
                        <BookOpen size={16} /> Exploración Manual
                    </button>
                </div>

                {modoDescubrimiento === 'ia' ? (
                    <div className="space-y-4 animate-fade-in">
                        <label className="block text-sm font-medium text-text-primary">¿Qué necesitas que aprendan tus estudiantes?</label>
                        <textarea
                            value={promptIA}
                            onChange={(e) => setPromptIA(e.target.value)}
                            placeholder="Ej. Quiero diseñar un diplomado corto sobre análisis de datos turísticos para hoteles rurales..."
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl border border-brand-500/20 bg-brand-500/5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500/50 resize-none transition-shadow"
                        />
                        <div className="flex justify-end">
                            <Button variant="brand" onClick={handleSugerirIA} disabled={!promptIA.trim() || buscandoConIA} loading={buscandoConIA}>
                                <Sparkles size={16} className="mr-2" /> Sugerir RAs con IA
                            </Button>
                        </div>
                        {buscandoConIA && (
                            <p className="text-xs text-text-muted mt-2 animate-pulse flex items-center gap-2">
                                <Sparkles size={12} className="text-brand-400" /> Analizando tu solicitud y buscando en el Marco Nacional de Cualificaciones...
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                            <div>
                                <label className="block text-[10px] uppercase font-bold text-text-muted mb-1">Sector Productivo</label>
                                <select className="w-full bg-surface-3 border border-theme rounded-md p-2 text-xs text-text-primary outline-none" value={filtroSector} onChange={e => { setFiltroSector(e.target.value); setFiltroSubsector(''); setFiltroArea(''); setCualSeleccionada(''); setRAsSeleccionados([]); }}>
                                    <option value="">Todos los Sectores</option>
                                    {sectoresInfo.map(sec => <option key={sec} value={sec}>{sec}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase font-bold text-text-muted mb-1">Subsector</label>
                                <select className="w-full bg-surface-3 border border-theme rounded-md p-2 text-xs text-text-primary outline-none" value={filtroSubsector} onChange={e => { setFiltroSubsector(e.target.value); setFiltroArea(''); setCualSeleccionada(''); setRAsSeleccionados([]); }} disabled={!filtroSector}>
                                    <option value="">Todos los Subsectores</option>
                                    {subsectoresInfo.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase font-bold text-text-muted mb-1">Área de Cualificación</label>
                                <select className="w-full bg-surface-3 border border-theme rounded-md p-2 text-xs text-text-primary outline-none" value={filtroArea} onChange={e => { setFiltroArea(e.target.value); setCualSeleccionada(''); setRAsSeleccionados([]); }} disabled={!filtroSubsector}>
                                    <option value="">Todas las Áreas</option>
                                    {areasInfo.map(area => <option key={area} value={area}>{area}</option>)}
                                </select>
                            </div>
                            <div className="md:col-span-1">
                                <label className="block text-[10px] uppercase font-bold text-text-muted mb-1">Búsqueda rápida</label>
                                <div className="relative">
                                    <input 
                                        type="text"
                                        placeholder="Ej: Soldadura..."
                                        className="w-full bg-surface-3 border border-theme rounded-md p-2 text-xs text-text-primary outline-none focus:ring-1 focus:ring-brand-500"
                                        value={filtroBusqueda}
                                        onChange={(e) => setFiltroBusqueda(e.target.value)}
                                    />
                                    {filtroBusqueda && (
                                        <button 
                                            onClick={() => setFiltroBusqueda('')}
                                            className="absolute right-2 top-2 text-text-muted hover:text-text-primary"
                                        >
                                            <X size={12} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Select
                            label="Seleccione la cualificación específica"
                            options={cualificacionesFiltradas.map(c => ({ value: c.id, label: `${c.codigo} — ${c.denominacion}` }))}
                            placeholder={
                                (!filtroSector && filtroBusqueda.length < 3) ? "Busque por nombre o seleccione un sector..." :
                                cualificacionesFiltradas.length > 0 ? "Seleccione de la lista filtrada..." : "No se encontraron coincidencias"
                            }
                            value={cualSeleccionada}
                            onChange={(e) => {
                                setCualSeleccionada(e.target.value);
                                setRAsSeleccionados([]);
                                setDuracionEditada(false); // Reset auto-calc on new cual
                            }}
                        />
                    </div>
                )}

                {/* Mostrar RAs Disponibles solo si hay una cualificación seleccionada (manualmente o inyectada por IA) */}
                {(modoDescubrimiento === 'manual' ? cualActiva : cualificacionesSugeridas.length > 0) && (
                    <div className="mt-6 border-t border-theme pt-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-sm text-text-primary">Resultados de Aprendizaje Disponibles</h3>
                            <Badge variant={rasSeleccionados.length > 0 ? "brand" : "default"}>{rasSeleccionados.length} seleccionados</Badge>
                        </div>
                        {rasDisponibles.length > 0 ? (
                            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
                                {rasDisponibles.map((ra) => {
                                    const selected = rasSeleccionados.includes(ra.id);
                                    return (
                                        <button
                                            key={ra.id}
                                            onClick={() => toggleRA(ra.id)}
                                            className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all cursor-pointer border
                                            ${selected ? 'bg-brand-500/10 border-brand-500/30' : 'bg-surface-3 border-theme hover:bg-brand-500/5'}`}
                                        >
                                            {selected ? <CheckCircle2 size={18} className="text-brand-400 mt-0.5 shrink-0" /> : <Circle size={18} className="text-text-muted mt-0.5 shrink-0" />}
                                            <div className="flex-1 min-w-0">
                                                {/* Etiqueta de Competencia Superior */}
                                                <div className="flex flex-col gap-1 mb-2 opacity-70 group-hover:opacity-100 transition-opacity">
                                                    {modoDescubrimiento === 'ia' && (
                                                        <span className="text-[9px] uppercase font-bold tracking-wider text-brand-400 truncate">
                                                            {ra.cualificacionNombre}
                                                        </span>
                                                    )}
                                                    <div className="flex items-center gap-1.5 ">
                                                        <BookOpen size={10} className="text-brand-400" />
                                                        <span className="text-[9px] uppercase font-bold tracking-wider text-text-muted truncate">
                                                            {ra.compCodigo} — {ra.competencia}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Badge variant={selected ? 'info' : 'default'} className="!text-[10px]">{ra.codigo}</Badge>
                                                </div>
                                                <p className="text-sm text-text-secondary leading-relaxed">{ra.descripcion}</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-sm text-text-muted text-center py-4">No hay RAs para mostrar.</p>
                        )}
                    </div>
                )}
            </div>

            {/* ZONA B: Formulación del Programa (Condicional) */}
            {rasSeleccionados.length > 0 && (
                <div className="bg-brand-500/5 border border-brand-500/20 rounded-xl p-6  animate-fade-in-up">
                    <h3 className="text-lg font-bold mb-6 text-brand-400 flex items-center gap-2">
                        Configuración del Programa
                        <span className="text-xs font-normal text-text-muted bg-surface-1 px-2 py-0.5 rounded-full border border-theme ml-auto">
                            Basado en {rasSeleccionados.length} RA(s)
                        </span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-medium text-text-muted uppercase mb-1">Nombre del Programa</label>
                            <input
                                type="text"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                placeholder={`Ej. Especialización en...`}
                                className="w-full px-3 py-2 rounded-xl border border-theme bg-surface-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-text-muted uppercase mb-1">Tipo</label>
                                {!esOtroTipo ? (
                                    <select
                                        value={tipoPrograma}
                                        onChange={(e) => {
                                            if (e.target.value === 'Otro') {
                                                setEsOtroTipo(true);
                                            } else {
                                                setTipoPrograma(e.target.value);
                                            }
                                        }}
                                        className="w-full px-3 py-2 rounded-xl border border-theme bg-surface-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-500/50 appearance-none"
                                    >
                                        <option value="Microcredencial">Microcredencial</option>
                                        <option value="Curso">Curso</option>
                                        <option value="Taller">Taller</option>
                                        <option value="Diplomado">Diplomado</option>
                                        <option value="Bootcamp">Bootcamp</option>
                                        {tipologiasGuardadas.map(tipo => (
                                            <option key={tipo} value={tipo}>{tipo}</option>
                                        ))}
                                        <option value="Otro" className="text-brand-400 font-bold">+ Otro...</option>
                                    </select>
                                ) : (
                                    <div className="flex flex-nowrap gap-1 items-stretch h-[38px]">
                                        <input
                                            type="text"
                                            value={tipologiaPersonalizada}
                                            onChange={(e) => setTipologiaPersonalizada(e.target.value)}
                                            placeholder="Ej: Masterclass"
                                            className="flex-1 min-w-0 px-3 py-2 rounded-l-xl border border-theme bg-surface-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-500/50"
                                            autoFocus
                                        />
                                        <button 
                                            onClick={handleGuardarNuevaTipologia}
                                            className="shrink-0 px-2.5 bg-brand-500 text-white hover:bg-brand-400 transition-colors flex items-center justify-center"
                                            title="Guardar tipología"
                                        >
                                            <Save size={14} />
                                        </button>
                                        <button 
                                            onClick={() => setEsOtroTipo(false)}
                                            className="shrink-0 px-2.5 bg-red-500/10 text-red-400 rounded-r-xl hover:bg-red-500/20 transition-colors border border-red-500/20 flex items-center justify-center"
                                            title="Cancelar"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-text-muted uppercase mb-1">Horas <span className="ml-1 px-1 py-0.5 bg-brand-500/20 text-[9px] rounded text-brand-400" title="Cálculo automático al seleccionar RAs">Auto</span></label>
                                <input
                                    type="number"
                                    value={duracionHoras}
                                    onChange={(e) => {
                                        setDuracionHoras(parseInt(e.target.value) || 0);
                                        setDuracionEditada(true);
                                    }}
                                    className="w-full px-3 py-2 rounded-xl border border-theme bg-surface-2 text-sm text-brand-400 font-bold placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                                />
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-text-muted uppercase mb-1">Descripción general</label>
                            <textarea
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 rounded-xl border border-theme bg-surface-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500/50 resize-none"
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-end pt-4 sticky bottom-0 bg-surface-1 pb-4 z-10 border-t border-theme mt-4">
                <Button variant="primary" onClick={() => setPasoActual(2)} disabled={rasSeleccionados.length === 0 || !nombre.trim()}>
                    Siguiente: Diseño Curricular <ChevronRight size={16} />
                </Button>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-semibold text-text-primary mb-2 flex items-center gap-2">
                Paso 2: Adaptación y Diseño de Sílabo <Sparkles size={20} className="text-brand-400" />
            </h2>
            <p className="text-sm text-text-secondary mb-6">Adapta el lenguaje de los Resultados de Aprendizaje y usa la IA para generar el sílabo completo.</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <div className="flex items-center justify-between mb-3 border-b border-theme pb-2">
                        <h3 className="font-semibold text-text-primary text-sm flex items-center gap-2">RAs Seleccionados <Badge variant="brand">{rasSeleccionados.length}</Badge></h3>
                    </div>

                    {rasSeleccionados.length === 0 ? (
                        <p className="text-sm text-text-muted">No has seleccionado ningún RA en el Paso 1.</p>
                    ) : (
                        <ul className="space-y-3">
                            {rasDetalle.map(ra => (
                                <li key={ra.id} className="p-3 bg-surface-2 rounded-lg border border-theme flex gap-3">
                                    <div className="mt-0.5 text-brand-500 font-mono text-xs">{ra.codigo}</div>
                                    <div className="flex-1">
                                        {editandoRa === ra.id ? (
                                            <div className="space-y-2">
                                                <textarea
                                                    className="w-full bg-surface-1 border border-brand-500/50 rounded-md p-2 text-sm text-text-primary outline-none focus:ring-1 focus:ring-brand-500 min-h-[80px]"
                                                    value={textoEditado}
                                                    onChange={(e) => setTextoEditado(e.target.value)}
                                                />
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" className="text-xs py-1 px-3 h-auto" onClick={() => setEditandoRa(null)}>Cancelar</Button>
                                                    <Button variant="brand" className="text-xs py-1 px-3 h-auto" onClick={() => handleGuardarRaAdaptado(ra.id)}>Guardar Adaptación</Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="group relative">
                                                <div className="text-sm text-text-secondary pr-8">
                                                    {ra.descripcion_adaptada ? (
                                                        <span>
                                                            {ra.descripcion_adaptada}
                                                            <span className="block mt-1 text-xs text-brand-400/70 italic bg-brand-500/10 p-1.5 rounded mt-2">Original MNC: {ra.descripcion}</span>
                                                        </span>
                                                    ) : (
                                                        ra.descripcion
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => { setEditandoRa(ra.id); setTextoEditado(ra.descripcion_adaptada || ra.descripcion); }}
                                                    className="absolute top-0 right-0 p-1.5 text-text-muted hover:text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity rounded-md hover:bg-white/5"
                                                    title="Adaptar Resultado de Aprendizaje"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>

                <Card className="bg-gradient-to-br from-brand-500/5 to-accent-500/5 border-brand-500/20">
                    <div className="flex items-center gap-2 mb-4 text-brand-400">
                        <Sparkles size={18} />
                        <h3 className="font-semibold text-sm">Copiloto Curricular (Sílabo)</h3>
                    </div>

                    {!silaboGenerado ? (
                        <div className="space-y-4">
                            {!mostrarParametros ? (
                                <Button
                                    variant="brand"
                                    className="w-full"
                                    icon={<FileText size={16} />}
                                    onClick={() => setMostrarParametros(true)}
                                    disabled={rasSeleccionados.length === 0}
                                >
                                    Configurar Parámetros del Sílabo
                                </Button>
                            ) : (
                                <div className="space-y-3 p-4 bg-surface-1 rounded-xl border border-theme">
                                    <h4 className="text-xs font-semibold text-text-primary mb-2">Parámetros de Diseño</h4>

                                    <div className="space-y-1">
                                        <label className="text-[11px] text-text-muted uppercase tracking-wider font-bold">Modalidad</label>
                                        {!esOtraModalidad ? (
                                            <select
                                                className="w-full bg-surface-2 border border-theme rounded-md p-1.5 text-xs text-text-primary outline-none focus:ring-1 focus:ring-brand-500"
                                                value={parametrosSilabo.modalidad}
                                                onChange={(e) => {
                                                    if (e.target.value === 'Otro') {
                                                        setEsOtraModalidad(true);
                                                    } else {
                                                        setParametrosSilabo({ ...parametrosSilabo, modalidad: e.target.value });
                                                    }
                                                }}
                                            >
                                                <option>Presencial</option>
                                                <option>Virtual (E-learning)</option>
                                                <option>Blended (Mixta)</option>
                                                {modalidadesGuardadas.map(m => <option key={m}>{m}</option>)}
                                                <option value="Otro" className="text-brand-400 font-bold">+ Otro...</option>
                                            </select>
                                        ) : (
                                            <div className="flex flex-nowrap gap-1 items-stretch h-[32px]">
                                                <input
                                                    type="text"
                                                    className="flex-1 min-w-0 bg-surface-2 border border-brand-500/30 rounded-l-md p-1.5 text-xs text-white outline-none"
                                                    placeholder="Ej: Sincrónica"
                                                    value={nuevaModalidad}
                                                    onChange={(e) => setNuevaModalidad(e.target.value)}
                                                    autoFocus
                                                />
                                                <button onClick={handleGuardarNuevaModalidad} className="shrink-0 bg-brand-500 px-2 hover:bg-brand-400 flex items-center justify-center"><Save size={12}/></button>
                                                <button onClick={() => setEsOtraModalidad(false)} className="shrink-0 bg-red-500/20 text-red-400 px-2 rounded-r-sm border border-red-500/30 hover:bg-red-500/30 flex items-center justify-center"><X size={12}/></button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[11px] text-text-muted uppercase tracking-wider font-bold">Enfoque Pedagógico</label>
                                        {!esOtroEnfoque ? (
                                            <select
                                                className="w-full bg-surface-2 border border-theme rounded-md p-1.5 text-xs text-text-primary outline-none focus:ring-1 focus:ring-brand-500"
                                                value={parametrosSilabo.enfoquePedagogico}
                                                onChange={(e) => {
                                                    if (e.target.value === 'Otro') {
                                                        setEsOtroEnfoque(true);
                                                    } else {
                                                        setParametrosSilabo({ ...parametrosSilabo, enfoquePedagogico: e.target.value });
                                                    }
                                                }}
                                            >
                                                <option>Aprendizaje Basado en Proyectos (ABP)</option>
                                                <option>Aula Invertida (Flipped Classroom)</option>
                                                <option>Formación Dual</option>
                                                <option>Estudio de Casos</option>
                                                {enfoquesGuardados.map(e => <option key={e}>{e}</option>)}
                                                <option value="Otro" className="text-brand-400 font-bold">+ Otro...</option>
                                            </select>
                                        ) : (
                                            <div className="flex flex-nowrap gap-1 items-stretch h-[32px]">
                                                <input
                                                    type="text"
                                                    className="flex-1 min-w-0 bg-surface-2 border border-brand-500/30 rounded-l-md p-1.5 text-xs text-white outline-none"
                                                    placeholder="Ej: Gamificación"
                                                    value={nuevoEnfoque}
                                                    onChange={(e) => setNuevoEnfoque(e.target.value)}
                                                    autoFocus
                                                />
                                                <button onClick={handleGuardarNuevoEnfoque} className="shrink-0 bg-brand-500 px-2 hover:bg-brand-400 flex items-center justify-center"><Save size={12}/></button>
                                                <button onClick={() => setEsOtroEnfoque(false)} className="shrink-0 bg-red-500/20 text-red-400 px-2 rounded-r-sm border border-red-500/30 hover:bg-red-500/30 flex items-center justify-center"><X size={12}/></button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[11px] text-text-muted uppercase">Perfil de Ingreso</label>
                                        <input
                                            type="text"
                                            className="w-full bg-surface-2 border border-theme rounded-md p-1.5 text-xs text-text-primary outline-none"
                                            value={parametrosSilabo.perfilIngreso}
                                            onChange={(e) => setParametrosSilabo({ ...parametrosSilabo, perfilIngreso: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[11px] text-text-muted uppercase">Infraestructura</label>
                                        <input
                                            type="text"
                                            className="w-full bg-surface-2 border border-theme rounded-md p-1.5 text-xs text-text-primary outline-none"
                                            value={parametrosSilabo.restriccionesHardware}
                                            onChange={(e) => setParametrosSilabo({ ...parametrosSilabo, restriccionesHardware: e.target.value })}
                                        />
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <Button variant="ghost" className="flex-1 text-xs" onClick={() => setMostrarParametros(false)}>Cancelar</Button>
                                        <Button variant="brand" className="flex-1 text-xs" onClick={handleGenerarSilabo} loading={generandoSilabo || n8nSilabo.isLoading}>Generar Sílabo</Button>
                                    </div>
                                    {(n8nSilabo.error) && <p className="text-xs text-red-400 mt-2">{n8nSilabo.error}</p>}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="p-4 bg-surface-1 rounded-xl border border-brand-500/20 text-center">
                                <CheckCircle2 size={36} className="text-brand-400 mx-auto mb-3" />
                                <p className="text-sm text-text-primary font-medium">Sílabo generado con éxito</p>
                                <p className="text-xs text-text-muted mb-4">Se ha creado una propuesta de sílabo de {silaboGenerado.modulos?.length || 0} módulos.</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button variant="secondary" className="w-full text-xs" onClick={() => setSilaboMostrado(true)}>Ver y Editar Sílabo</Button>
                                    <Button variant="ghost" className="w-full text-xs hover:text-brand-400" onClick={() => setSilaboGenerado(null)}>Regenerar Sílabo</Button>
                                </div>
                            </div>
                        </div>
                    )}
                </Card>
            </div>

            <div className="flex justify-between pt-4">
                <Button variant="ghost" onClick={() => setPasoActual(1)}>
                    <ChevronLeft size={16} /> Volver
                </Button>
                <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => setPasoActual(3)}>
                        Omitir Sílabo
                    </Button>
                    <Button variant="primary" onClick={() => setPasoActual(3)} disabled={!silaboGenerado}>
                        Siguiente: Evaluaciones <ChevronRight size={16} />
                    </Button>
                </div>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-semibold text-text-primary mb-2 flex items-center gap-2">
                Paso 3: Generación de Evaluaciones <Sparkles size={20} className="text-purple-400" />
            </h2>
            <p className="text-sm text-text-secondary mb-6">Genera las matrices de evaluación basadas en los Criterios Oficiales del MNC asociados a tus RAs.</p>

            <Card className="border border-theme">
                {!evaluacionGenerada ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Sparkles size={28} className="text-purple-400" />
                        </div>
                        <h3 className="text-lg font-medium text-text-primary mb-2">Generador de Evaluaciones Alineadas</h3>
                        <p className="text-sm text-text-secondary max-w-md mx-auto mb-6">
                            Esta funcionalidad utilizará Inteligencia Artificial para diseñar rúbricas, actividades de evaluación y matrices de evidencia que demuestren el alcance de los RAs mediante los Criterios del MNC.
                        </p>

                        <div className="max-w-md mx-auto mb-8 bg-surface-1 border border-theme p-4 rounded-xl text-left">
                            <h4 className="text-xs font-semibold text-text-primary mb-4 flex items-center gap-2"><Target size={14} className="text-brand-400" /> Parámetros Institucionales</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[11px] text-text-muted uppercase">Tipo de Escala</label>
                                    <select
                                        className="w-full bg-surface-2 border border-theme rounded-md p-2 text-xs text-text-primary outline-none focus:ring-1 focus:ring-brand-500/50"
                                        value={tipoEscala}
                                        onChange={(e) => setTipoEscala(e.target.value)}
                                    >
                                        <option value="Cuantitativa">Cuantitativa</option>
                                        <option value="Cualitativa">Cualitativa</option>
                                        <option value="Mixta">Mixta</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] text-text-muted uppercase mb-1 block">Valores / Rango</label>
                                    {!esOtraEscala ? (
                                        <div className="flex gap-2">
                                            <select
                                                className="flex-1 bg-surface-2 border border-theme rounded-md p-2 text-xs text-text-primary outline-none focus:ring-1 focus:ring-brand-500/50"
                                                value={escalaEvaluacion}
                                                onChange={(e) => {
                                                    if (e.target.value === 'Otro...') setEsOtraEscala(true);
                                                    else setEscalaEvaluacion(e.target.value);
                                                }}
                                            >
                                                {tipoEscala === 'Cuantitativa' && (
                                                    <>
                                                        <option value="0.0 a 5.0">0.0 a 5.0 (Decimal)</option>
                                                        <option value="0 a 100">0 a 100 (Porcentaje)</option>
                                                        <option value="1 a 10">1 a 10 (Decimal)</option>
                                                    </>
                                                )}
                                                {tipoEscala === 'Cualitativa' && (
                                                    <>
                                                        <option value="E, S, A, I">Excelente, Sobresaliente, Aceptable, Insuficiente</option>
                                                        <option value="Aprobado / Reprobado">Aprobado / Reprobado</option>
                                                        <option value="Letras (A, B, C, D, F)">Letras (A, B, C, D, F)</option>
                                                    </>
                                                )}
                                                {tipoEscala === 'Mixta' && (
                                                    <>
                                                        <option value="0.0 a 5.0 + Cualitativa">0.0 a 5.0 + Comentarios</option>
                                                        <option value="0 a 100 + Desempeño">0 a 100 + Nivel Desempeño</option>
                                                    </>
                                                )}
                                                {escalasGuardadas.length > 0 && <optgroup label="Mis Escalas">
                                                    {escalasGuardadas.map(e => <option key={e} value={e}>{e}</option>)}
                                                </optgroup>}
                                                <option value="Otro...">Otro...</option>
                                            </select>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2 items-center flex-nowrap">
                                            <input
                                                type="text"
                                                className="flex-1 min-w-0 bg-surface-2 border border-theme rounded-md p-2 text-xs text-text-primary outline-none focus:ring-1 focus:ring-brand-500/50"
                                                placeholder="Ej: 1 a 100 Puntos..."
                                                value={nuevaEscala}
                                                onChange={(e) => setNuevaEscala(e.target.value)}
                                            />
                                            <div className="flex gap-1 shrink-0">
                                                <button
                                                    onClick={handleGuardarNuevaEscala}
                                                    disabled={!nuevaEscala.trim()}
                                                    className="p-2 bg-brand-500 hover:bg-brand-400 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <Save size={14} />
                                                </button>
                                                <button
                                                    onClick={() => setEsOtraEscala(false)}
                                                    className="p-2 border border-theme hover:bg-white/5 text-text-muted rounded-md"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Button
                            variant="brand"
                            className="bg-purple-600 hover:bg-purple-500 border-none text-white mx-auto flex items-center gap-2"
                            onClick={() => handleGenerarEvaluaciones()}
                            loading={generandoEvaluacion || n8nEvaluacion.isLoading}
                        >
                            <Sparkles size={16} /> Generar Evaluaciones
                        </Button>
                        {(n8nEvaluacion.error) && <p className="text-xs text-red-400 mt-4">{n8nEvaluacion.error}</p>}
                    </div>
                ) : (
                    <div className="p-6 bg-surface-1 rounded-xl border border-purple-500/20 text-center">
                        <CheckCircle2 size={36} className="text-purple-400 mx-auto mb-3" />
                        <p className="text-sm text-text-primary font-medium">Evaluaciones generadas con éxito</p>
                        <p className="text-xs text-text-muted mb-4">Se han creado rúbricas y actividades para los RAs seleccionados.</p>
                        <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
                            <Button variant="secondary" className="w-full text-xs" onClick={() => setEvaluacionMostrada(true)}>Ver y Editar Evaluaciones</Button>
                            <Button variant="ghost" className="w-full text-xs hover:text-purple-400" onClick={() => setEvaluacionGenerada(null)}>Regenerar Evaluaciones</Button>
                        </div>
                    </div>
                )}
            </Card>

            <div className="flex justify-between pt-4">
                <Button variant="ghost" onClick={() => setPasoActual(2)}>
                    <ChevronLeft size={16} /> Volver
                </Button>
                <Button variant="primary" onClick={() => setPasoActual(4)}>
                    Siguiente: Finalizar <ChevronRight size={16} />
                </Button>
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-brand-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-500/30">
                    <Save size={32} className="text-brand-400" />
                </div>
                <h2 className="text-2xl font-bold text-text-primary">Revisar y Guardar</h2>
                <p className="text-text-secondary mt-2">Todo listo para guardar el programa y su diseño curricular.</p>
            </div>

            <Card className="space-y-4">
                <div>
                    <p className="text-xs text-text-muted font-medium uppercase mb-1">Programa</p>
                    <p className="text-text-primary font-medium">{nombre}</p>
                    <p className="text-sm text-text-secondary">{tipoPrograma} | {duracionHoras}h | {creditos} cr</p>
                </div>
                <div className="pt-3 border-t border-theme">
                    <p className="text-xs text-text-muted font-medium uppercase mb-1">Base Normativa</p>
                    <p className="text-sm text-text-primary">{cualInferida?.denominacion} (Nivel {cualInferida?.nivel_mnc})</p>
                    <p className="text-sm text-text-secondary">{rasSeleccionados.length} Resultados de Aprendizaje asociados</p>
                </div>
                <div className="pt-3 border-t border-theme flex items-center justify-between">
                    <div>
                        <p className="text-xs text-text-muted font-medium uppercase mb-1">Sílabo Generado</p>
                        <p className="text-sm text-text-primary">{silaboGenerado ? 'Sí, incluye contenidos y estructura.' : 'No generado'}</p>
                    </div>
                    {silaboGenerado && <Badge variant="brand">Completado</Badge>}
                </div>

                {errorGuardado && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-sm">
                        <AlertCircle size={16} /> {errorGuardado}
                    </div>
                )}
                {guardado && (
                    <div className="p-3 bg-brand-500/10 border border-brand-500/20 rounded-xl flex items-center gap-2 text-brand-400 text-sm">
                        <CheckCircle2 size={16} /> ¡Guardado con éxito! Redirigiendo...
                    </div>
                )}
            </Card>

            <div className="flex justify-between pt-4">
                <Button variant="ghost" onClick={() => setPasoActual(3)} disabled={guardando || guardado}>
                    <ChevronLeft size={16} /> Volver
                </Button>
                <div className="flex gap-2">
                    <Button
                        variant="secondary"
                        onClick={handleExportarDocx}
                        loading={exportandoDocx}
                        disabled={guardando}
                        className="bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border-blue-500/30"
                    >
                        Descargar Word (.docx)
                    </Button>
                    <Button
                        variant="brand"
                        onClick={guardarProgramaFinal}
                        loading={guardando}
                        disabled={guardado || guardando}
                        className="w-48"
                    >
                        Confirmar y Guardar
                    </Button>
                </div>
            </div>
        </div>
    );

    if (loading) return <LoadingState message="Cargando..." />;
    if (error) return <ErrorState message={error} />;

    return (
        <div className="max-w-6xl mx-auto animate-fade-in relative pb-20 space-y-6">
            <div className="flex items-center justify-between">
                <SectionHeader
                    title="Constructor de Educación Continua"
                    description={`Paso ${pasoActual} de 4: ${['Información y RAs', 'Diseño de Sílabo', 'Matriz de Evaluación', 'Resumen Final'][pasoActual - 1]}`}
                />
                
                {pasoActual === 1 && (
                    <div className="flex gap-2">
                        {localStorage.getItem('builder_draft') && (
                            <Button variant="ghost" size="sm" onClick={cargarBorrador} className="text-brand-400 hover:text-brand-300 gap-2">
                                <RotateCcw size={14} /> Recuperar Borrador
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Indicador de Pasos (Stepper) */}
            <Card>
                <Stepper
                    steps={['General', 'Sílabo', 'Evaluaciones', 'Resumen']}
                    current={pasoActual - 1}
                />
            </Card>

            {/* Renderizar Paso respectivo */}
            <div className="bg-surface-1 border border-theme rounded-2xl p-6 shadow-sm min-h-[500px]">
                {pasoActual === 1 && renderStep1()}
                {pasoActual === 2 && renderStep2()}
                {pasoActual === 3 && renderStep3()}
                {pasoActual === 4 && renderStep4()}
            </div>

            {(generandoSilabo || generandoEvaluacion) && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                    <div className="bg-surface-1 border border-theme p-8 rounded-2xl shadow-2xl text-center max-w-sm w-full mx-4">
                        <div className="mb-4 relative">
                            <div className="w-16 h-16 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin mx-auto"></div>
                            <Sparkles className="absolute inset-0 m-auto text-brand-400 animate-pulse" size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-text-primary mb-2 transition-all duration-300 transform motion-reduce:transition-none">{loadingLabel}</h3>
                        <p className="text-sm text-text-secondary">Nuestra IA está procesando los datos para crear el mejor contenido curricular...</p>
                    </div>
                </div>
            )}

            {silaboMostrado && silaboGenerado && (
                <SilaboModal
                    silabo={silaboGenerado}
                    ras={rasSeleccionados.map(id => {
                        const ra = rasDisponibles.find(r => r.id === id);
                        return { codigo: ra?.codigo || '', descripcion: rasAdaptados[id] || ra?.descripcion || '' };
                    })}
                    onClose={() => setSilaboMostrado(false)}
                    onSave={(updatedData) => {
                        setSilaboGenerado(updatedData);
                        setSilaboMostrado(false);
                        handleGenerarEvaluaciones(updatedData); // Trigger evaluation generation with edited silabo
                    }}
                />
            )}
            {evaluacionMostrada && evaluacionGenerada && (
                <EvaluacionModal
                    evaluaciones={evaluacionGenerada.evaluaciones || evaluacionGenerada}
                    onClose={() => setEvaluacionMostrada(false)}
                    onSave={() => {
                        setEvaluacionMostrada(false);
                        setPasoActual(4); // Avanzar a Finalizar
                    }}
                />
            )}
        </div>
    );
}
