import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { CualificacionCompleta, CompetenciaConDetalle } from '../lib/types';

/* ═══════════════════════════════════════════════════════
   Hook: useCualificaciones
   Carga la jerarquía completa del MNC desde Supabase
   ═══════════════════════════════════════════════════════ */

export function useCualificaciones() {
    const [cualificaciones, setCualificaciones] = useState<CualificacionCompleta[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => { cargarCualificaciones(); }, []);

    async function cargarCualificaciones() {
        setLoading(true);
        setError(null);
        try {
            // 1. Cualificaciones
            const { data: cualsData, error: e1 } = await supabase
                .from('cualificaciones_cnc').select('*').order('codigo');
            if (e1) throw e1;
            if (!cualsData?.length) { setCualificaciones([]); return; }

            const cualIds = cualsData.map(c => c.id);

            // 2. Competencias específicas
            const { data: compsData, error: e2 } = await supabase
                .from('competencias_especificas_cnc').select('*')
                .in('cualificacion_id', cualIds).order('orden_secuencia');
            if (e2) throw e2;

            const compIds = (compsData || []).map(c => c.id);

            // 3. Resultados de aprendizaje
            let rasData: any[] = [];
            if (compIds.length > 0) {
                const { data, error: e3 } = await supabase
                    .from('resultados_aprendizaje_cnc').select('*')
                    .in('competencia_id', compIds).order('orden');
                if (e3) throw e3;
                rasData = data || [];
            }

            // 4. Elementos de competencia
            let elemData: any[] = [];
            if (compIds.length > 0) {
                const { data, error: e4 } = await supabase
                    .from('elementos_competencia_cnc').select('*')
                    .in('competencia_id', compIds).order('numero_elemento');
                if (e4) throw e4;
                elemData = data || [];
            }

            // 5. Criterios de desempeño
            const elemIds = elemData.map(e => e.id);
            let critDesData: any[] = [];
            if (elemIds.length > 0) {
                const { data, error: e5 } = await supabase
                    .from('criterios_desempeno_cnc').select('*')
                    .in('elemento_id', elemIds).order('orden');
                if (e5) throw e5;
                critDesData = data || [];
            }

            // 6. Conocimientos esenciales
            let conocData: any[] = [];
            if (compIds.length > 0) {
                const { data, error: e6 } = await supabase
                    .from('conocimientos_esenciales_cnc').select('*')
                    .in('competencia_id', compIds).order('orden');
                if (e6) throw e6;
                conocData = data || [];
            }

            // 7. Ensamblar jerarquía
            const result: CualificacionCompleta[] = cualsData.map(cual => {
                const competencias: CompetenciaConDetalle[] = (compsData || [])
                    .filter(comp => comp.cualificacion_id === cual.id)
                    .map(comp => ({
                        ...comp,
                        resultados: rasData.filter(ra => ra.competencia_id === comp.id),
                        elementos: elemData
                            .filter(elem => elem.competencia_id === comp.id)
                            .map(elem => ({
                                ...elem,
                                criterios_desempeno: critDesData.filter(cd => cd.elemento_id === elem.id),
                            })),
                        conocimientos: conocData.filter(c => c.competencia_id === comp.id),
                    }));

                return { ...cual, competencias } as CualificacionCompleta;
            });

            setCualificaciones(result);
        } catch (err) {
            console.error('Error cargando jerarquía MNC:', err);
            setError('Error al cargar datos del Marco Nacional de Cualificaciones');
        } finally {
            setLoading(false);
        }
    }

    return { cualificaciones, loading, error, recargar: cargarCualificaciones };
}
