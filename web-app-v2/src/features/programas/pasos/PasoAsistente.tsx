import { useState } from 'react';
import { Card, Button, Badge } from '../../../components/ui';
import { useN8nWebhook } from '../../../hooks/useN8nWebhook';
import { Bot, Send, User } from 'lucide-react';
import type { PasoProps } from './types';

/* ═══════════════════════════════════════════════════════
   Paso 9 — Asistente Virtual y Soporte Normativo
   ═══════════════════════════════════════════════════════ */

export function PasoAsistente({ datos, actualizarDatos }: PasoProps) {
    const [pregunta, setPregunta] = useState('');
    const { trigger, isLoading: loading } = useN8nWebhook<{ respuesta: string }>('asistente-normativo');

    async function enviarPregunta() {
        if (!pregunta.trim()) return;
        const nuevaPregunta = pregunta;
        setPregunta('');

        const respuestas = [...datos.respuestas, { pregunta: nuevaPregunta, respuesta: '...' }];
        actualizarDatos({ respuestas });

        const resultado = await trigger({
            pregunta: nuevaPregunta,
            contextoPrograma: {
                nombre: datos.nombrePrograma,
                sector: datos.sector,
                nivel: datos.nivelMNC,
            },
        });

        const respuestaFinal = resultado?.respuesta || 'No se pudo obtener una respuesta. Intente de nuevo.';
        const actualizado = [...datos.respuestas, { pregunta: nuevaPregunta, respuesta: respuestaFinal }];
        actualizarDatos({ respuestas: actualizado });
    }

    return (
        <div className="space-y-6">
            <Card>
                <div className="flex items-start gap-4">
                    <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400">
                        <Bot size={24} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-text-primary text-lg">Asistente Virtual Normativo</h3>
                        <p className="text-sm text-text-muted mt-1">
                            Consulte sobre normativa ETDH, requisitos del MEN, resoluciones vigentes o cualquier duda del proceso de diseño curricular.
                        </p>
                    </div>
                </div>
            </Card>

            {/* Chat */}
            <Card>
                <div className="space-y-4 max-h-[400px] overflow-y-auto mb-4">
                    {datos.respuestas.length === 0 ? (
                        <div className="text-center py-8">
                            <Bot size={40} className="mx-auto text-text-muted mb-3" />
                            <p className="text-sm text-text-muted">
                                Haga una pregunta sobre normativa ETDH, requisitos,<br />
                                resoluciones o el proceso de diseño curricular.
                            </p>
                            <div className="flex flex-wrap gap-2 justify-center mt-4">
                                {[
                                    '¿Cuáles son los requisitos del Decreto 1075?',
                                    '¿Qué resolución regula los programas ETDH?',
                                    '¿Cómo se calcula la intensidad horaria?',
                                ].map((sugerencia) => (
                                    <button
                                        key={sugerencia}
                                        className="px-3 py-1.5 rounded-lg text-xs text-brand-400 bg-brand-500/10 hover:bg-brand-500/20 cursor-pointer transition-colors"
                                        onClick={() => setPregunta(sugerencia)}
                                    >
                                        {sugerencia}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        datos.respuestas.map((r, idx) => (
                            <div key={idx} className="space-y-3">
                                {/* Pregunta */}
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-brand-500/15 flex items-center justify-center shrink-0">
                                        <User size={14} className="text-brand-400" />
                                    </div>
                                    <div className="flex-1 p-3 rounded-xl bg-brand-500/5 text-sm text-text-primary">
                                        {r.pregunta}
                                    </div>
                                </div>
                                {/* Respuesta */}
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-accent-500/15 flex items-center justify-center shrink-0">
                                        <Bot size={14} className="text-accent-400" />
                                    </div>
                                    <div className="flex-1 p-3 rounded-xl bg-surface-2 text-sm text-text-primary" style={{ borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border-subtle)' }}>
                                        {r.respuesta === '...' ? (
                                            <span className="inline-flex items-center gap-2 text-text-muted">
                                                <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                Generando respuesta...
                                            </span>
                                        ) : (
                                            <div className="whitespace-pre-wrap">{r.respuesta}</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Input de pregunta */}
                <div className="flex gap-3">
                    <input
                        className="flex-1 px-4 py-3 rounded-xl text-sm bg-surface-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                        style={{ borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border-subtle)' }}
                        placeholder="Escriba su consulta normativa..."
                        value={pregunta}
                        onChange={(e) => setPregunta(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviarPregunta(); } }}
                    />
                    <Button
                        icon={<Send size={16} />}
                        onClick={enviarPregunta}
                        loading={loading}
                        disabled={!pregunta.trim()}
                    >
                        Enviar
                    </Button>
                </div>
            </Card>

            {/* Notas normativas guardadas */}
            {datos.consultaNormativa && (
                <Card>
                    <h4 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                        Notas Normativas <Badge variant="info">Guardadas</Badge>
                    </h4>
                    <textarea
                        className="w-full min-h-[100px] p-3 rounded-xl text-sm bg-surface-2 text-text-primary placeholder:text-text-muted focus:outline-none resize-y"
                        style={{ borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border-subtle)' }}
                        value={datos.consultaNormativa}
                        onChange={(e) => actualizarDatos({ consultaNormativa: e.target.value })}
                    />
                </Card>
            )}
        </div>
    );
}
