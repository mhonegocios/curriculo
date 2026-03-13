/* ═══════════════════════════════════════════════════════
   Tipos TypeScript — Modelo de Datos
   ═══════════════════════════════════════════════════════ */

/* ── Tablas Base MNC ────────────────────────────────── */

export interface Cualificacion {
    id: string;
    codigo: string;
    denominacion: string;
    nivel_mnc: number;
    area_cualificacion: string;
    sector_productivo: string;
    subsector: string;
    duracion_horas: number;
    duracion_creditos: number;
    competencia_general: string;
    ocupacion_cuoc: string;
    ocupaciones_relacionadas: string;
    contexto_accion: string;
    requisitos_ingreso: string;
    estado: string;
    version: string;
}

export interface CompetenciaEspecifica {
    id: string;
    cualificacion_id: string;
    codigo: string;
    denominacion: string;
    es_transversal: boolean;
    orden_secuencia: number;
    duracion_horas: number;
    duracion_creditos: number;
}

export interface ElementoCompetencia {
    id: string;
    competencia_id: string;
    numero_elemento: number;
    descripcion: string;
}

export interface CriterioDesempeno {
    id: string;
    elemento_id: string;
    descripcion: string;
    orden: number;
}

export interface ResultadoAprendizaje {
    id: string;
    competencia_id: string;
    codigo: string;
    descripcion: string;
    duracion_horas: number;
    orden: number;
}

export interface CriterioEvaluacion {
    id: string;
    resultado_aprendizaje_id: string;
    codigo: string;
    descripcion: string;
    orden: number;
}

export interface ConocimientoEsencial {
    id: string;
    competencia_id: string;
    tipo: 'conceptual' | 'procedimental' | 'actitudinal';
    contenido: string;
    orden: number;
    fuente: 'extraido' | 'generado_ia';
}

/* ── Jerarquía Completa (para el Explorador) ────────── */

export interface CompetenciaConDetalle extends CompetenciaEspecifica {
    resultados: ResultadoAprendizaje[];
    elementos: (ElementoCompetencia & {
        criterios_desempeno: CriterioDesempeno[];
    })[];
    conocimientos: ConocimientoEsencial[];
}

export interface CualificacionCompleta extends Cualificacion {
    competencias: CompetenciaConDetalle[];
}

/* ── Tablas de Tenant ───────────────────────────────── */

export interface Institucion {
    id: string;
    name: string;
    type: 'universidad' | 'institucion_etdh' | 'corporacion' | 'otro';
    country: string;
    logo_url: string;
    created_at: string;
}

export interface Usuario {
    id: string;
    institution_id: string;
    email: string;
    full_name: string;
    role: 'admin' | 'disenador' | 'revisor';
    created_at: string;
}

/* ── Educación Continua ─────────────────────────────── */

export interface EduContinua {
    id: string;
    institution_id: string;
    name: string;
    description: string;
    type: string;
    mnc_level: number;
    hours_total: number;
    credits: number;
    status: 'borrador' | 'revision' | 'aprobada' | 'publicada';
    silabo_json?: any;
    evaluacion_json?: any;
    created_by: string;
    created_at: string;
    updated_at: string;
}

export interface EduContinuaOutcome {
    id: string;
    edu_continua_id: string;
    learning_outcome_id: string;
}

export interface EduContinuaContenido {
    id: string;
    edu_continua_id: string;
    title: string;
    description: string;
    hours: number;
    order_index: number;
}

/* ── Programas ──────────────────────────────────────── */

export interface Programa {
    id: string;
    institution_id: string;
    name: string;
    type: 'tecnico_laboral' | 'microcredencial' | 'ruta_aprendizaje';
    mnc_level: number;
    total_hours: number;
    status: 'borrador' | 'revision' | 'aprobado' | 'publicado';
    wizard_data: Record<string, unknown>;
    created_by: string;
    created_at: string;
    updated_at: string;
}

export interface ModuloPrograma {
    id: string;
    program_id: string;
    name: string;
    hours: number;
    order_index: number;
}

/* ── Rutas Formativas ───────────────────────────────── */

export interface RutaFormativa {
    id: string;
    institution_id: string;
    name: string;
    description: string;
    created_by: string;
    created_at: string;
}

export interface ItemRuta {
    id: string;
    pathway_id: string;
    edu_continua_id: string;
    order_index: number;
}

/* ── Evaluaciones ───────────────────────────────────── */

export interface Evaluacion {
    id: string;
    institution_id: string;
    learning_outcome_id: string;
    type: 'proyecto' | 'examen' | 'practica' | 'rubrica';
    description: string;
    ai_generated: boolean;
    created_at: string;
}
