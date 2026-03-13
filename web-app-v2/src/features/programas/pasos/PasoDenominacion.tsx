import { Card, Input, Select } from '../../../components/ui';
import { Tag, Clock, Award, GraduationCap } from 'lucide-react';
import { useCualificaciones } from '../../../hooks/useCualificaciones';
import type { PasoProps } from './types';

/* ═══════════════════════════════════════════════════════
   Paso 2 — Denominación del Programa
   ═══════════════════════════════════════════════════════ */

const MODALIDADES = [
    { value: 'presencial', label: 'Presencial' },
    { value: 'virtual', label: 'Virtual' },
    { value: 'mixta', label: 'Mixta (Blended)' },
    { value: 'distancia', label: 'A Distancia' },
];

const JORNADAS = [
    { value: '', label: 'Seleccionar jornada...' },
    { value: 'diurna', label: 'Diurna' },
    { value: 'nocturna', label: 'Nocturna' },
    { value: 'fines_semana', label: 'Fines de Semana' },
    { value: 'flexible', label: 'Horario Flexible' },
];

const NIVELES_MNC = [
    { value: '1', label: 'Nivel 1 - Operativo' },
    { value: '2', label: 'Nivel 2 - Cualificado' },
    { value: '3', label: 'Nivel 3 - Técnico Laboral' },
    { value: '4', label: 'Nivel 4 - Técnico Profesional' },
    { value: '5', label: 'Nivel 5 - Tecnológico' },
    { value: '6', label: 'Nivel 6 - Profesional' },
    { value: '7', label: 'Nivel 7 - Especialización/Maestría' },
    { value: '8', label: 'Nivel 8 - Doctorado' },
];

export function PasoDenominacion({ datos, actualizarDatos }: PasoProps) {
    const { cualificaciones } = useCualificaciones();

    const opcionesCualificacion = (cualificaciones ?? []).map(c => ({
        value: c.id,
        label: `${c.denominacion} (Nivel ${c.nivel_mnc})`,
    }));

    return (
        <div className="space-y-6">
            <Card>
                <div className="flex items-start gap-4">
                    <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400">
                        <Tag size={24} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-text-primary text-lg">Denominación del Programa</h3>
                        <p className="text-sm text-text-muted mt-1">
                            Estructure la ficha técnica de identificación del programa ETDH.
                        </p>
                    </div>
                </div>
            </Card>

            {/* Identificación */}
            <Card>
                <h4 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                    <GraduationCap size={18} /> Identificación del Programa
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Nombre del Programa"
                        placeholder="Ej: Técnico Laboral en Desarrollo de Software"
                        value={datos.nombrePrograma}
                        onChange={(e) => actualizarDatos({ nombrePrograma: e.target.value })}
                    />
                    <Input
                        label="Código del Programa"
                        placeholder="Ej: TL-DS-001"
                        value={datos.codigoPrograma}
                        onChange={(e) => actualizarDatos({ codigoPrograma: e.target.value })}
                    />
                    <Select
                        label="Nivel MNC"
                        options={NIVELES_MNC}
                        value={String(datos.nivelMNC)}
                        onChange={(e) => actualizarDatos({ nivelMNC: Number(e.target.value) })}
                    />
                    <Select
                        label="Cualificación Asociada (MNC)"
                        options={[{ value: '', label: 'Seleccionar cualificación...' }, ...opcionesCualificacion]}
                        value={datos.cualificacionId}
                        onChange={(e) => actualizarDatos({ cualificacionId: e.target.value })}
                    />
                </div>
            </Card>

            {/* Estructura */}
            <Card>
                <h4 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                    <Clock size={18} /> Estructura Temporal
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                        label="Duración Total (horas)"
                        type="number"
                        placeholder="Ej: 1440"
                        value={datos.duracionHoras || ''}
                        onChange={(e) => actualizarDatos({ duracionHoras: Number(e.target.value) })}
                    />
                    <Input
                        label="Trimestres / Periodos"
                        type="number"
                        placeholder="Ej: 6"
                        value={datos.duracionTrimestres || ''}
                        onChange={(e) => actualizarDatos({ duracionTrimestres: Number(e.target.value) })}
                    />
                    <Input
                        label="Créditos Académicos"
                        type="number"
                        placeholder="Ej: 80"
                        value={datos.creditos || ''}
                        onChange={(e) => actualizarDatos({ creditos: Number(e.target.value) })}
                    />
                </div>
            </Card>

            {/* Modalidad */}
            <Card>
                <h4 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                    <Award size={18} /> Modalidad y Certificación
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Select
                        label="Modalidad"
                        options={MODALIDADES}
                        value={datos.modalidad}
                        onChange={(e) => actualizarDatos({ modalidad: e.target.value })}
                    />
                    <Select
                        label="Jornada"
                        options={JORNADAS}
                        value={datos.jornada}
                        onChange={(e) => actualizarDatos({ jornada: e.target.value })}
                    />
                    <Input
                        label="Certificación que Otorga"
                        placeholder="Ej: Certificado de Aptitud Ocupacional"
                        value={datos.certificacion}
                        onChange={(e) => actualizarDatos({ certificacion: e.target.value })}
                    />
                </div>
            </Card>
        </div>
    );
}
