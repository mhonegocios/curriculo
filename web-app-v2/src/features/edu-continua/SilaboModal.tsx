import { useState, type ReactNode } from 'react';
import { Card, Badge, Button } from '../../components/ui';
import { X, ChevronDown, ChevronRight, BookOpen, Users, Award, Library, ShieldCheck, GraduationCap, Target, CheckCircle2 } from 'lucide-react';

/* ── Tipos del Sílabo ──────────────────────────────────── */
export interface SilaboModulo {
    numero: number;
    titulo: string;
    descripcion: string;
    objetivos_especificos: string[];
    duracion_horas: number;
    temas: string[];
    materiales_estudio: string[];
    actividades_aprendizaje: string[];
    estrategias_evaluacion: { saber: string; saber_hacer: string; ser: string };
    criterios_evaluacion: string[];
    resultados_aprendizaje: string[];
}

export interface SilaboData {
    presentacion: {
        descripcion_general: string;
        objetivos_aprendizaje: string[];
        referentes_normativos: string;
        competencia_general: string;
        habilidades_especificas: { tecnicas: string[]; transversales: string[] };
        modelo_metodologico: string;
        publico_objetivo: string;
        prerrequisitos: string;
        articulacion: { programa_previo: string; programa_siguiente: string };
    };
    modulos: SilaboModulo[];
    recursos_adicionales: { bibliografia: string[]; herramientas_software: string[] };
    politicas: { asistencia: string; aprobacion: string };
    perfil_instructores: { educacion: string; formacion_complementaria: string; experiencia: string };
    certificacion: {
        nombre_credencial: string;
        descripcion: string;
        habilidades_desarrolladas: string[];
        requisitos_logro: string[];
        norma: string;
        evidencias_logro: string[];
        firmas_certificadoras: string[];
    };
}

interface SilaboModalProps {
    silabo: SilaboData;
    ras?: any[];
    onClose: () => void;
    onSave?: (updatedSilabo: SilaboData) => void;
}

/* ── Componente de sección colapsable ──────────────────── */
function Section({ title, icon, children, defaultOpen = false }: { title: string; icon: ReactNode; children: ReactNode; defaultOpen?: boolean }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="border border-theme rounded-xl overflow-hidden">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center gap-3 px-5 py-4 bg-surface-3/50 hover:bg-surface-3 transition-colors text-left"
            >
                <span className="text-brand-400">{icon}</span>
                <span className="font-semibold text-text-primary flex-1">{title}</span>
                {open ? <ChevronDown size={16} className="text-text-muted" /> : <ChevronRight size={16} className="text-text-muted" />}
            </button>
            {open && <div className="px-5 py-4 space-y-4 animate-fade-in">{children}</div>}
        </div>
    );
}

/* ── Componente Módulo ─────────────────────────────────── */
function ModuloCard({ modulo, ras = [], onUpdate }: { modulo: SilaboModulo, ras?: any[], onUpdate: (mod: SilaboModulo) => void }) {
    const [expanded, setExpanded] = useState(false);

    const updateField = (field: keyof SilaboModulo, value: any) => {
        onUpdate({ ...modulo, [field]: value });
    };

    const updateArrayField = (field: keyof SilaboModulo, index: number, value: string) => {
        const arr = [...(modulo[field] as string[])];
        arr[index] = value;
        updateField(field, arr);
    };

    const addArrayItem = (field: keyof SilaboModulo) => {
        const arr = [...(modulo[field] as string[]), ""];
        updateField(field, arr);
    };

    const removeArrayItem = (field: keyof SilaboModulo, index: number) => {
        const arr = [...(modulo[field] as string[])];
        arr.splice(index, 1);
        updateField(field, arr);
    };
    return (
        <div className="border border-theme rounded-xl overflow-hidden">
            <div
                className="w-full flex items-center gap-3 px-4 py-3 bg-surface-3/30 hover:bg-surface-3/60 transition-colors text-left"
            >
                <Badge variant="info">M{modulo.numero}</Badge>
                <input
                    value={modulo.titulo}
                    onChange={(e) => updateField('titulo', e.target.value)}
                    className="flex-1 bg-transparent border-none text-text-primary text-sm font-medium focus:ring-1 focus:ring-brand-500 rounded px-1"
                />
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-surface-4 border border-theme rounded px-2 py-0.5" title="Horas del módulo">
                        <input
                            type="number"
                            value={modulo.duracion_horas}
                            onChange={(e) => updateField('duracion_horas', parseInt(e.target.value) || 0)}
                            className="w-10 bg-transparent text-center text-xs font-bold text-brand-400 outline-none p-0"
                        />
                        <span className="text-[10px] text-text-muted font-medium">h</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-1 bg-surface-4/50 border border-theme rounded px-2 py-0.5" title="Créditos (Auto-calculado: Horas / 48)">
                        <span className="text-center text-xs font-bold text-purple-400">{Math.ceil(modulo.duracion_horas / 48)}</span>
                        <span className="text-[10px] text-text-muted font-medium">créditos</span>
                    </div>
                </div>
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="p-1 hover:bg-white/5 rounded transition-colors"
                >
                    {expanded ? <ChevronDown size={14} className="text-text-muted" /> : <ChevronRight size={14} className="text-text-muted" />}
                </button>
            </div>
            {expanded && (
                <div className="px-4 py-4 space-y-4 text-sm animate-fade-in">
                    <textarea
                        value={modulo.descripcion}
                        onChange={(e) => updateField('descripcion', e.target.value)}
                        className="w-full bg-surface-4/50 border border-theme rounded-lg p-2 text-text-secondary leading-relaxed text-xs min-h-[60px] resize-y focus:border-brand-500/50"
                        placeholder="Descripción del módulo..."
                    />

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <h5 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Objetivos Específicos</h5>
                            <button onClick={() => addArrayItem('objetivos_especificos')} className="text-[10px] text-brand-400 hover:text-brand-300 font-bold">+ Agregar</button>
                        </div>
                        <ul className="space-y-2">
                            {modulo.objetivos_especificos.map((obj, i) => (
                                <li key={i} className="flex gap-2 group">
                                    <span className="text-brand-400 shrink-0 mt-1">•</span>
                                    <input
                                        value={obj}
                                        onChange={(e) => updateArrayField('objetivos_especificos', i, e.target.value)}
                                        className="flex-1 bg-transparent text-text-secondary text-xs border-b border-theme focus:border-brand-500/30 outline-none pb-0.5"
                                    />
                                    <button onClick={() => removeArrayItem('objetivos_especificos', i)} className="opacity-0 group-hover:opacity-100 text-red-500/50 hover:text-red-500 transition-opacity">
                                        <X size={12} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-surface-3/30 border border-theme rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-4">
                            <Target size={16} className="text-brand-400" />
                            <h5 className="text-xs font-semibold text-text-primary uppercase tracking-wider">Alineación Curricular</h5>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* RAs Alineados */}
                            <div>
                                <h6 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">Resultados de Aprendizaje (RAs)</h6>
                                {modulo.resultados_aprendizaje.length > 0 ? (
                                    <div className="flex flex-col gap-2">
                                        {modulo.resultados_aprendizaje.map((raCode, i) => {
                                            const matchedRa = ras.find(r => r.codigo === raCode || raCode.includes(r.codigo) || (r.codigo && raCode.toLowerCase().includes(r.codigo.toLowerCase())));
                                            if (matchedRa) {
                                                return (
                                                    <div key={i} className="flex flex-col gap-1.5 p-2 rounded-lg border border-success-500/20 bg-success-500/5">
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="success" className="shrink-0 !text-[10px]">{raCode}</Badge>
                                                        </div>
                                                        <span className="text-xs text-text-secondary leading-relaxed">{matchedRa.descripcion}</span>
                                                    </div>
                                                );
                                            }
                                            return <div key={i} className="flex"><Badge variant="success">{raCode}</Badge></div>;
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-xs text-text-muted italic">No hay RAs alineados a este módulo.</p>
                                )}
                            </div>

                            {/* Saberes (Temas) */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h6 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Saberes (Temas) Asociados</h6>
                                    <button onClick={() => addArrayItem('temas')} className="text-[10px] text-brand-400 hover:text-brand-300 font-bold">+ Agregar Saber</button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {modulo.temas.map((tema, i) => (
                                        <div key={i} className="flex items-center gap-1.5 px-2 py-1 bg-brand-500/10 border border-brand-500/20 text-brand-300 rounded-lg text-xs group">
                                            <span className="text-brand-500/50 select-none">•</span>
                                            <input
                                                value={tema}
                                                onChange={(e) => updateArrayField('temas', i, e.target.value)}
                                                className="bg-transparent border-none outline-none focus:ring-0 min-w-[60px]"
                                            />
                                            <button onClick={() => removeArrayItem('temas', i)} className="opacity-0 group-hover:opacity-100 hover:text-red-400">
                                                <X size={10} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h5 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Materiales</h5>
                            <ul className="space-y-1">
                                {modulo.materiales_estudio.map((mat, i) => (
                                    <li key={i} className="text-text-secondary flex gap-2 text-xs"><span className="text-accent-400 shrink-0">📄</span>{mat}</li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h5 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Actividades</h5>
                            <ul className="space-y-1">
                                {modulo.actividades_aprendizaje.map((act, i) => (
                                    <li key={i} className="text-text-secondary flex gap-2 text-xs"><span className="text-accent-400 shrink-0">🎯</span>{act}</li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div>
                        <h5 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Estrategias de Evaluación</h5>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="p-2.5 bg-blue-500/10 rounded-lg">
                                <div className="text-[10px] font-bold text-blue-400 uppercase mb-1">Saber</div>
                                <textarea
                                    value={modulo.estrategias_evaluacion.saber}
                                    onChange={(e) => updateField('estrategias_evaluacion', { ...modulo.estrategias_evaluacion, saber: e.target.value })}
                                    className="w-full bg-transparent border-none text-xs text-text-secondary p-0 focus:ring-0 resize-none min-h-[40px]"
                                />
                            </div>
                            <div className="p-2.5 bg-emerald-500/10 rounded-lg">
                                <div className="text-[10px] font-bold text-emerald-400 uppercase mb-1">Saber Hacer</div>
                                <textarea
                                    value={modulo.estrategias_evaluacion.saber_hacer}
                                    onChange={(e) => updateField('estrategias_evaluacion', { ...modulo.estrategias_evaluacion, saber_hacer: e.target.value })}
                                    className="w-full bg-transparent border-none text-xs text-text-secondary p-0 focus:ring-0 resize-none min-h-[40px]"
                                />
                            </div>
                            <div className="p-2.5 bg-purple-500/10 rounded-lg">
                                <div className="text-[10px] font-bold text-purple-400 uppercase mb-1">Ser</div>
                                <textarea
                                    value={modulo.estrategias_evaluacion.ser}
                                    onChange={(e) => updateField('estrategias_evaluacion', { ...modulo.estrategias_evaluacion, ser: e.target.value })}
                                    className="w-full bg-transparent border-none text-xs text-text-secondary p-0 focus:ring-0 resize-none min-h-[40px]"
                                />
                            </div>
                        </div>
                    </div>

                    {modulo.criterios_evaluacion && (
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h5 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Criterios de Evaluación</h5>
                                <button onClick={() => addArrayItem('criterios_evaluacion')} className="text-[10px] text-brand-400 font-bold">+ Agregar</button>
                            </div>
                            <ul className="space-y-1.5">
                                {modulo.criterios_evaluacion.map((crit, i) => (
                                    <li key={i} className="flex gap-2 group items-start">
                                        <CheckCircle2 size={12} className="text-success-500 mt-0.5 shrink-0" />
                                        <input
                                            value={crit}
                                            onChange={(e) => updateArrayField('criterios_evaluacion', i, e.target.value)}
                                            className="flex-1 bg-transparent text-text-secondary text-xs border-b border-theme focus:border-brand-500/30 outline-none pb-0.5"
                                        />
                                        <button onClick={() => removeArrayItem('criterios_evaluacion', i)} className="opacity-0 group-hover:opacity-100 text-red-500/50 hover:text-red-500">
                                            <X size={12} />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}


                </div>
            )}
        </div>
    );
}

/* ── Modal Principal ───────────────────────────────────── */
export function SilaboModal({ silabo, ras = [], onClose, onSave }: SilaboModalProps) {
    const [editSilabo, setEditSilabo] = useState<SilaboData>(silabo);

    if (!editSilabo || !editSilabo.presentacion) {
        console.error("Sílabo con formato inválido:", editSilabo);
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                <Card className="max-w-md w-full text-center">
                    <h2 className="text-xl font-bold text-red-500 mb-2">Error de formato</h2>
                    <p className="text-sm text-text-secondary mb-4">La IA no devolvió la estructura esperada.</p>
                    <pre className="text-xs text-left bg-black p-2 rounded overflow-auto max-h-40">{JSON.stringify(editSilabo, null, 2)}</pre>
                    <Button variant="ghost" onClick={onClose} className="mt-4">Cerrar</Button>
                </Card>
            </div>
        );
    }

    const {
        presentacion: p,
        modulos = [],
        recursos_adicionales: rec = { bibliografia: [], herramientas_software: [] },
        politicas: pol = { asistencia: '', aprobacion: '' },
        perfil_instructores: perf = { educacion: '', formacion_complementaria: '', experiencia: '' },
        certificacion: cert = { nombre_credencial: '', descripcion: '', habilidades_desarrolladas: [], requisitos_logro: [], norma: '', evidencias_logro: [], firmas_certificadoras: [] }
    } = editSilabo;

    const updatePresentacion = (field: keyof SilaboData['presentacion'], value: any) => {
        setEditSilabo(prev => ({
            ...prev,
            presentacion: { ...prev.presentacion, [field]: value }
        }));
    };

    const updateModulo = (index: number, updatedMod: SilaboModulo) => {
        const newModulos = [...editSilabo.modulos];
        newModulos[index] = updatedMod;
        setEditSilabo(prev => ({ ...prev, modulos: newModulos }));
    };

    const handleSave = () => {
        if (onSave) onSave(editSilabo);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="w-full max-w-4xl bg-surface-1 rounded-2xl shadow-2xl border border-theme my-8">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-theme bg-gradient-to-r from-brand-500/10 to-accent-500/10 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <BookOpen size={22} className="text-brand-400" />
                        <div>
                            <h2 className="text-lg font-bold text-text-primary">Sílabo Generado</h2>
                            <p className="text-xs text-text-muted">Generado por IA · Copiloto Curricular</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 transition-colors text-text-muted hover:text-text-primary">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-4 max-h-[75vh] overflow-y-auto">

                    {/* Presentación */}
                    <Section title="Presentación General" icon={<GraduationCap size={18} />} defaultOpen={true}>
                        <textarea
                            value={p.descripcion_general}
                            onChange={(e) => updatePresentacion('descripcion_general', e.target.value)}
                            className="w-full bg-surface-3/50 border border-theme rounded-xl p-3 text-text-secondary text-sm leading-relaxed min-h-[100px] focus:ring-1 focus:ring-brand-500 outline-none"
                            placeholder="Descripción general del programa..."
                        />

                        <div>
                            <h5 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Competencia General</h5>
                            <textarea
                                value={p.competencia_general}
                                onChange={(e) => updatePresentacion('competencia_general', e.target.value)}
                                className="w-full bg-brand-500/5 border border-brand-500/10 rounded-lg p-3 text-sm text-text-primary focus:ring-1 focus:ring-brand-500 outline-none min-h-[60px]"
                                placeholder="Defina la competencia principal..."
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h5 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Objetivos de Aprendizaje</h5>
                                <button
                                    onClick={() => updatePresentacion('objetivos_aprendizaje', [...(p.objetivos_aprendizaje || []), ''])}
                                    className="text-[10px] text-brand-400 font-bold"
                                >
                                    + Agregar
                                </button>
                            </div>
                            <ul className="space-y-2">
                                {(p.objetivos_aprendizaje || []).map((obj: string, i: number) => (
                                    <li key={i} className="flex gap-2 group items-center">
                                        <span className="text-brand-400 shrink-0 text-sm">{i + 1}.</span>
                                        <input
                                            value={obj}
                                            onChange={(e) => {
                                                const newObs = [...p.objetivos_aprendizaje];
                                                newObs[i] = e.target.value;
                                                updatePresentacion('objetivos_aprendizaje', newObs);
                                            }}
                                            className="flex-1 bg-transparent border-b border-theme text-sm text-text-secondary outline-none py-1 focus:border-brand-500/30"
                                        />
                                        <button
                                            onClick={() => {
                                                const newObs = p.objetivos_aprendizaje.filter((_: any, idx: number) => idx !== i);
                                                updatePresentacion('objetivos_aprendizaje', newObs);
                                            }}
                                            className="opacity-0 group-hover:opacity-100 text-red-500/50 hover:text-red-500 transition-opacity"
                                        >
                                            <X size={14} />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h5 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Habilidades Técnicas</h5>
                                <div className="flex flex-wrap gap-1.5">
                                    {(p.habilidades_especificas?.tecnicas || []).map((h: string, i: number) => (
                                        <span key={i} className="px-2 py-1 bg-blue-500/10 text-blue-300 rounded-md text-xs">{h}</span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h5 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Habilidades Transversales</h5>
                                <div className="flex flex-wrap gap-1.5">
                                    {(p.habilidades_especificas?.transversales || []).map((h: string, i: number) => (
                                        <span key={i} className="px-2 py-1 bg-purple-500/10 text-purple-300 rounded-md text-xs">{h}</span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div><span className="text-text-muted">Modelo Metodológico:</span><p className="text-text-secondary mt-1">{p.modelo_metodologico}</p></div>
                            <div><span className="text-text-muted">Público Objetivo:</span><p className="text-text-secondary mt-1">{p.publico_objetivo}</p></div>
                            <div><span className="text-text-muted">Prerrequisitos:</span><p className="text-text-secondary mt-1">{typeof p.prerrequisitos === 'string' ? p.prerrequisitos : JSON.stringify(p.prerrequisitos)}</p></div>
                            <div><span className="text-text-muted">Referentes Normativos:</span><p className="text-text-secondary mt-1">{typeof p.referentes_normativos === 'string' ? p.referentes_normativos : JSON.stringify(p.referentes_normativos)}</p></div>
                        </div>

                        {p.articulacion && (
                            <div className="p-3 bg-surface-3/30 border border-theme rounded-xl text-xs space-y-2">
                                <h5 className="font-semibold text-text-muted uppercase tracking-wider">Articulación</h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div><span className="text-text-muted">Programa Previo:</span> <span className="text-text-secondary">{p.articulacion.programa_previo}</span></div>
                                    <div><span className="text-text-muted">Programa Siguiente:</span> <span className="text-text-secondary">{p.articulacion.programa_siguiente}</span></div>
                                </div>
                            </div>
                        )}
                    </Section>

                    {/* Módulos */}
                    <Section title={`Contenido Temático (${modulos.length} módulos)`} icon={<BookOpen size={18} />} defaultOpen={true}>
                        <div className="space-y-2">
                            {modulos.map((m: SilaboModulo, idx: number) => (
                                <ModuloCard
                                    key={idx}
                                    modulo={m}
                                    ras={ras}
                                    onUpdate={(updated) => updateModulo(idx, updated)}
                                />
                            ))}
                        </div>
                    </Section>

                    {/* Recursos */}
                    <Section title="Recursos Adicionales" icon={<Library size={18} />}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h5 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Bibliografía</h5>
                                <ul className="space-y-1.5">
                                    {(rec.bibliografia || []).map((b: string, i: number) => (
                                        <li key={i} className="text-xs text-text-secondary flex gap-2"><span className="text-brand-400 shrink-0">📚</span>{b}</li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h5 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Herramientas / Software</h5>
                                <ul className="space-y-1.5">
                                    {(rec.herramientas_software || []).map((h: string, i: number) => (
                                        <li key={i} className="text-xs text-text-secondary flex gap-2"><span className="text-brand-400 shrink-0">🛠️</span>{h}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </Section>

                    {/* Políticas */}
                    <Section title="Políticas" icon={<ShieldCheck size={18} />}>
                        <div className="space-y-3 text-sm">
                            <div><span className="font-medium text-text-muted">Asistencia:</span><p className="text-text-secondary mt-1">{pol.asistencia}</p></div>
                            <div><span className="font-medium text-text-muted">Aprobación:</span><p className="text-text-secondary mt-1">{pol.aprobacion}</p></div>
                        </div>
                    </Section>

                    {/* Perfil Instructores */}
                    <Section title="Perfil de Instructores" icon={<Users size={18} />}>
                        <div className="space-y-3 text-sm">
                            <div><span className="font-medium text-text-muted">Educación:</span><p className="text-text-secondary mt-1">{perf.educacion}</p></div>
                            <div><span className="font-medium text-text-muted">Formación complementaria:</span><p className="text-text-secondary mt-1">{perf.formacion_complementaria}</p></div>
                            <div><span className="font-medium text-text-muted">Experiencia:</span><p className="text-text-secondary mt-1">{perf.experiencia}</p></div>
                        </div>
                    </Section>

                    {/* Certificación */}
                    <Section title="Certificación y Reconocimiento" icon={<Award size={18} />}>
                        <Card className="bg-gradient-to-br from-accent-500/5 to-brand-500/5 border-accent-500/10">
                            <h4 className="font-semibold text-text-primary mb-2">{cert.nombre_credencial}</h4>
                            <p className="text-sm text-text-secondary mb-3">{cert.descripcion}</p>
                            <div className="space-y-3">
                                <div>
                                    <h5 className="text-xs font-semibold text-text-muted uppercase mb-1">Habilidades Desarrolladas</h5>
                                    <div className="flex flex-wrap gap-1.5">
                                        {(cert.habilidades_desarrolladas || []).map((h: string, i: number) => (
                                            <Badge key={i} variant="success">{h}</Badge>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h5 className="text-xs font-semibold text-text-muted uppercase mb-1">Requisitos de Logro</h5>
                                    <ul className="space-y-1">
                                        {(cert.requisitos_logro || []).map((r: string, i: number) => (
                                            <li key={i} className="text-xs text-text-secondary flex gap-2"><span className="text-accent-400">✓</span>{r}</li>
                                        ))}
                                    </ul>
                                </div>

                                {cert.evidencias_logro && cert.evidencias_logro.length > 0 && (
                                    <div>
                                        <h5 className="text-xs font-semibold text-text-muted uppercase mb-1">Evidencias de Logro</h5>
                                        <ul className="space-y-1">
                                            {cert.evidencias_logro.map((e: string, i: number) => (
                                                <li key={i} className="text-xs text-text-secondary flex gap-2"><span className="text-brand-400">»</span>{e}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {cert.firmas_certificadoras && cert.firmas_certificadoras.length > 0 && (
                                    <div className="pt-2 border-t border-theme">
                                        <h5 className="text-xs font-semibold text-text-muted uppercase mb-2">Entidades Certificadoras</h5>
                                        <div className="flex flex-wrap gap-2">
                                            {cert.firmas_certificadoras.map((f: string, i: number) => (
                                                <Badge key={i} variant="default" className="!bg-surface-4">{f}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </Section>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-theme flex justify-end gap-3">
                    <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                    {onSave && (
                        <Button variant="brand" onClick={handleSave}>
                            Confirmar y Seguir con Evaluaciones
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
