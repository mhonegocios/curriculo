import { Card, Badge } from '../../../components/ui';
import { Users } from 'lucide-react';
import type { PasoProps } from './types';

/* ═══════════════════════════════════════════════════════
   Paso 6 — Perfiles y Complementos
   ═══════════════════════════════════════════════════════ */

const SECCIONES = [
    { key: 'perfilIngreso' as const, titulo: 'Perfil de Ingreso', placeholder: 'Requisitos académicos, edad, conocimientos previos requeridos para ingresar al programa...' },
    { key: 'perfilEgreso' as const, titulo: 'Perfil de Egreso', placeholder: 'Competencias, habilidades y conocimientos que tendrá el egresado del programa...' },
    { key: 'perfilOcupacional' as const, titulo: 'Perfil Ocupacional', placeholder: 'Cargos y funciones que podrá desempeñar el egresado en el mercado laboral...' },
    { key: 'requisitos' as const, titulo: 'Requisitos de Ingreso', placeholder: 'Documentación, pruebas o requisitos específicos para la matrícula...' },
    { key: 'campoOcupacional' as const, titulo: 'Campo Ocupacional', placeholder: 'Sectores económicos, empresas y contextos donde se desempeñará el egresado...' },
];

export function PasoPerfiles({ datos, actualizarDatos }: PasoProps) {
    return (
        <div className="space-y-6">
            <Card>
                <div className="flex items-start gap-4">
                    <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400">
                        <Users size={24} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-text-primary text-lg">Perfiles y Complementos</h3>
                        <p className="text-sm text-text-muted mt-1">
                            Defina los perfiles de ingreso, egreso y ocupacional del programa.
                        </p>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SECCIONES.map((sec) => (
                    <Card key={sec.key} className={sec.key === 'campoOcupacional' ? 'md:col-span-2' : ''}>
                        <h4 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                            {sec.titulo}
                            {datos[sec.key] && <Badge variant="success">Completado</Badge>}
                        </h4>
                        <textarea
                            className="w-full min-h-[120px] p-3 rounded-xl text-sm bg-surface-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500/50 resize-y"
                            style={{ borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border-subtle)' }}
                            placeholder={sec.placeholder}
                            value={datos[sec.key]}
                            onChange={(e) => actualizarDatos({ [sec.key]: e.target.value })}
                        />
                    </Card>
                ))}
            </div>
        </div>
    );
}
