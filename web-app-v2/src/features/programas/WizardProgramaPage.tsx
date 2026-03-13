import { useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { Card, Button, Stepper, SectionHeader } from '../../components/ui';
import { Save, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

import { PasoPrefactibilidad } from './pasos/PasoPrefactibilidad';
import { PasoDenominacion } from './pasos/PasoDenominacion';
import { PasoJustificacion } from './pasos/PasoJustificacion';
import { PasoPlanEstudios } from './pasos/PasoPlanEstudios';
import { PasoModulosFormacion } from './pasos/PasoModulosFormacion';
import { PasoPerfiles } from './pasos/PasoPerfiles';
import { PasoEnsamblaje } from './pasos/PasoEnsamblaje';
import { PasoMonitoreo } from './pasos/PasoMonitoreo';
import { PasoAsistente } from './pasos/PasoAsistente';
import { GenerativeBuilderSidebar } from '../../components/ia/GenerativeBuilderSidebar';
import { Sparkles } from 'lucide-react';

/* ═══════════════════════════════════════════════════════
   Wizard de Programas ETDH — 9 Pasos
   ═══════════════════════════════════════════════════════ */

export interface WizardData {
    /* Paso 1: Prefactibilidad */
    sector: string;
    subsector: string;
    region: string;
    demandaLaboral: string;
    competenciaMercado: string;
    pertinencia: string;
    programasExistentes: string;

    /* Paso 2: Denominación */
    nombrePrograma: string;
    codigoPrograma: string;
    nivelMNC: number;
    cualificacionId: string;
    duracionHoras: number;
    duracionTrimestres: number;
    creditos: number;
    certificacion: string;
    modalidad: string;
    jornada: string;

    /* Paso 3: Justificación */
    justificacionSocial: string;
    justificacionEconomica: string;
    justificacionAcademica: string;
    justificacionLaboral: string;

    /* Paso 4: Plan de Estudios */
    competenciasSeleccionadas: string[];
    mallaModulos: {
        nombre: string;
        competenciaId: string;
        horas: number;
        creditos: number;
        trimestre: number;
        orden: number;
    }[];

    /* Paso 5: Módulos de Formación */
    modulosDetalle: {
        nombre: string;
        resultados: string[];
        saberes: { conceptual: string[]; procedimental: string[]; actitudinal: string[] };
        estrategias: string;
        criteriosEval: string;
    }[];

    /* Paso 6: Perfiles */
    perfilIngreso: string;
    perfilEgreso: string;
    perfilOcupacional: string;
    requisitos: string;
    campoOcupacional: string;

    /* Paso 7: Ensamblaje */
    documentoMaestro: string;
    observaciones: string;

    /* Paso 8: Monitoreo */
    indicadoresDesempeno: string;
    frecuenciaRevision: string;
    responsable: string;

    /* Paso 9: Asistente */
    consultaNormativa: string;
    respuestas: { pregunta: string; respuesta: string }[];
}

const INITIAL_DATA: WizardData = {
    sector: '', subsector: '', region: '', demandaLaboral: '',
    competenciaMercado: '', pertinencia: '', programasExistentes: '',
    nombrePrograma: '', codigoPrograma: '', nivelMNC: 3,
    cualificacionId: '', duracionHoras: 0, duracionTrimestres: 0,
    creditos: 0, certificacion: '', modalidad: 'presencial', jornada: '',
    justificacionSocial: '', justificacionEconomica: '',
    justificacionAcademica: '', justificacionLaboral: '',
    competenciasSeleccionadas: [],
    mallaModulos: [],
    modulosDetalle: [],
    perfilIngreso: '', perfilEgreso: '', perfilOcupacional: '',
    requisitos: '', campoOcupacional: '',
    documentoMaestro: '', observaciones: '',
    indicadoresDesempeno: '', frecuenciaRevision: 'semestral', responsable: '',
    consultaNormativa: '', respuestas: [],
};

const PASOS = [
    'Prefactibilidad',
    'Denominación',
    'Justificación',
    'Plan de Estudios',
    'Módulos',
    'Perfiles',
    'Ensamblaje',
    'Monitoreo',
    'Asistente',
];

export function WizardProgramaPage() {
    const [paso, setPaso] = useState(0);
    const [datos, setDatos] = useState<WizardData>(INITIAL_DATA);
    const [guardando, setGuardando] = useState(false);
    const [guardado, setGuardado] = useState(false);
    const [programaId, setProgramaId] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const actualizarDatos = useCallback((parcial: Partial<WizardData>) => {
        setDatos(prev => ({ ...prev, ...parcial }));
        setGuardado(false);
    }, []);

    async function guardarPrograma() {
        setGuardando(true);
        try {
            if (programaId) {
                // Actualizar existente
                const { error } = await supabase
                    .from('programs')
                    .update({
                        name: datos.nombrePrograma || 'Programa sin nombre',
                        type: 'tecnico_laboral',
                        mnc_level: datos.nivelMNC,
                        total_hours: datos.duracionHoras,
                        wizard_data: datos,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', programaId);
                if (error) throw error;
            } else {
                // Crear nuevo
                const { data, error } = await supabase
                    .from('programs')
                    .insert({
                        institution_id: null,
                        name: datos.nombrePrograma || 'Programa sin nombre',
                        type: 'tecnico_laboral',
                        mnc_level: datos.nivelMNC,
                        total_hours: datos.duracionHoras,
                        status: 'borrador',
                        wizard_data: datos,
                    })
                    .select('id')
                    .single();
                if (error) throw error;
                setProgramaId(data.id);
            }
            setGuardado(true);
        } catch (err) {
            console.error('Error guardando programa:', err);
            alert('Error al guardar el programa');
        } finally {
            setGuardando(false);
        }
    }

    const handleApplyGeneration = (data: any) => {
        setIsSidebarOpen(false);

        // Aquí la IA devolvería datos que calzan con el WizardData de Programas ETDH.
        // Hacemos un merge parcial de lo que n8n entregue.
        const nuevosDatos: Partial<WizardData> = {};
        if (data.nombrePrograma) nuevosDatos.nombrePrograma = data.nombrePrograma;
        if (data.justificacionSocial) nuevosDatos.justificacionSocial = data.justificacionSocial;
        if (data.perfilIngreso) nuevosDatos.perfilIngreso = data.perfilIngreso;
        // ... entre otros campos.

        actualizarDatos(nuevosDatos);
    };

    function renderPaso() {
        const props = { datos, actualizarDatos };
        switch (paso) {
            case 0: return <PasoPrefactibilidad {...props} />;
            case 1: return <PasoDenominacion {...props} />;
            case 2: return <PasoJustificacion {...props} />;
            case 3: return <PasoPlanEstudios {...props} />;
            case 4: return <PasoModulosFormacion {...props} />;
            case 5: return <PasoPerfiles {...props} />;
            case 6: return <PasoEnsamblaje {...props} />;
            case 7: return <PasoMonitoreo {...props} />;
            case 8: return <PasoAsistente {...props} />;
            default: return null;
        }
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-fade-in relative">

            <GenerativeBuilderSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                onApplyGeneration={handleApplyGeneration}
            />

            <div className="flex items-center justify-between">
                <SectionHeader
                    title="Nuevo Programa ETDH"
                    description={`Paso ${paso + 1} de ${PASOS.length}: ${PASOS[paso]}`}
                />

                {paso === 0 && (
                    <Button
                        variant="brand"
                        icon={<Sparkles size={16} />}
                        onClick={() => setIsSidebarOpen(true)}
                        className="shadow-lg shadow-brand-500/20"
                    >
                        Sugerir con IA
                    </Button>
                )}
            </div>

            {/* Stepper visual */}
            <Card>
                <Stepper steps={PASOS} current={paso} />
            </Card>

            {/* Contenido del paso */}
            <div className="animate-fade-in" key={paso}>
                {renderPaso()}
            </div>

            {/* Barra de navegación inferior */}
            <Card>
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        icon={<ArrowLeft size={16} />}
                        onClick={() => setPaso(p => Math.max(0, p - 1))}
                        disabled={paso === 0}
                    >
                        Anterior
                    </Button>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="secondary"
                            icon={guardado ? <CheckCircle2 size={16} /> : <Save size={16} />}
                            onClick={guardarPrograma}
                            loading={guardando}
                        >
                            {guardado ? 'Guardado ✓' : 'Guardar Borrador'}
                        </Button>

                        {paso < PASOS.length - 1 ? (
                            <Button
                                icon={<ArrowRight size={16} />}
                                onClick={() => setPaso(p => Math.min(PASOS.length - 1, p + 1))}
                            >
                                Siguiente
                            </Button>
                        ) : (
                            <Button
                                icon={<CheckCircle2 size={16} />}
                                onClick={guardarPrograma}
                                loading={guardando}
                            >
                                Finalizar Programa
                            </Button>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
}
