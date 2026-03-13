import {
    Document,
    Packer,
    Paragraph,
    TextRun,
    Table,
    TableRow,
    TableCell,
    HeadingLevel,
    BorderStyle,
    WidthType,
    AlignmentType,
    PageBreak
} from "docx";
import { saveAs } from "file-saver";
import type { SilaboData } from "../features/edu-continua/SilaboModal";

interface ProgramaInfo {
    nombre: string;
    tipo: string;
    horas: number;
    descripcion: string;
    cualificacionNombre?: string;
    mnc_level?: number;
}

interface EvaluacionInfo {
    evaluaciones?: Array<{
        resultado_aprendizaje: string;
        criterios_cubiertos: any[];
        actividad_evaluativa: {
            nombre: string;
            tipo: string;
            descripcion: string;
        };
        rubrica: any;
    }>;
}

export const generateProgramaDocx = async (
    programa: ProgramaInfo,
    silabo: SilaboData | null,
    evaluacion: EvaluacionInfo | any[] | null,
    ras: any[] = []
) => {

    const children: any[] = [];

    // Función auxiliar para forzar strings
    const safeString = (val: any): string => {
        if (val === undefined || val === null) return "N/A";
        if (typeof val === 'string' && val.trim() === '') return "N/A";
        if (typeof val === 'string') return val;
        if (Array.isArray(val)) return val.length > 0 ? val.join(", ") : "N/A";
        return JSON.stringify(val);
    }

    // 1. Título principal
    children.push(
        new Paragraph({
            text: "Diseño Curricular del Programa",
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
        })
    );

    // 2. Información del Programa
    children.push(
        new Paragraph({ text: "Información General", heading: HeadingLevel.HEADING_1, spacing: { after: 200 } }),
        new Paragraph({
            children: [
                new TextRun({ text: "Nombre: ", bold: true }),
                new TextRun(programa.nombre)
            ]
        }),
        new Paragraph({
            children: [
                new TextRun({ text: "Tipo: ", bold: true }),
                new TextRun(`${programa.tipo} (${programa.horas} horas)`)
            ]
        }),
        new Paragraph({
            children: [
                new TextRun({ text: "Nivel MNC: ", bold: true }),
                new TextRun(safeString(programa.mnc_level))
            ]
        }),
        new Paragraph({
            children: [
                new TextRun({ text: "Cualificación Base (MNC): ", bold: true }),
                new TextRun(programa.cualificacionNombre || "N/A")
            ]
        }),
        new Paragraph({
            spacing: { before: 100, after: 300 },
            children: [
                new TextRun({ text: "Descripción: ", bold: true }),
                new TextRun(programa.descripcion)
            ]
        })
    );

    // 3. Sílabo Completo
    if (silabo) {
        const {
            presentacion: p = {} as any,
            modulos = [],
            recursos_adicionales: rec = { bibliografia: [], herramientas_software: [] },
            politicas: pol = { asistencia: '', aprobacion: '' },
            perfil_instructores: perf = { educacion: '', formacion_complementaria: '', experiencia: '' },
            certificacion: cert = { nombre_credencial: '', descripcion: '', habilidades_desarrolladas: [], requisitos_logro: [], norma: '', evidencias_logro: [], firmas_certificadoras: [] }
        } = silabo;

        // PRESENTACION
        children.push(new Paragraph({ children: [new PageBreak()] }));
        children.push(new Paragraph({ text: "Presentación del Programa", heading: HeadingLevel.HEADING_1, spacing: { after: 200 } }));

        if (ras && ras.length > 0) {
            children.push(new Paragraph({ children: [new TextRun({ text: "Resultados de Aprendizaje (RAs):", bold: true })], spacing: { after: 100 } }));
            ras.forEach((ra: any) => {
                const desc = ra.descripcion_adaptada || ra.descripcion;
                children.push(new Paragraph({
                    children: [
                        new TextRun({ text: `${ra.codigo}: `, bold: true }),
                        new TextRun(desc)
                    ],
                    bullet: { level: 0 },
                    spacing: { after: 50 }
                }));
            });
            children.push(new Paragraph({ text: "", spacing: { after: 200 } }));
        }
        
        children.push(new Paragraph({ children: [new TextRun({ text: "Descripción General:", bold: true })], spacing: { after: 100 } }));
        children.push(new Paragraph({ text: safeString(p.descripcion_general), spacing: { after: 200 } }));

        children.push(new Paragraph({ children: [new TextRun({ text: "Competencia General:", bold: true })], spacing: { after: 100 } }));
        children.push(new Paragraph({ text: safeString(p.competencia_general), spacing: { after: 200 } }));

        if (p.objetivos_aprendizaje && p.objetivos_aprendizaje.length > 0) {
            children.push(new Paragraph({ children: [new TextRun({ text: "Objetivos de Aprendizaje:", bold: true })], spacing: { after: 100 } }));
            p.objetivos_aprendizaje.forEach((obj: string) => {
                children.push(new Paragraph({ text: obj, bullet: { level: 0 } }));
            });
            children.push(new Paragraph({ text: "", spacing: { after: 100 } }));
        }

        if (p.habilidades_especificas) {
            children.push(new Paragraph({ children: [new TextRun({ text: "Habilidades a Desarrollar:", bold: true })], spacing: { after: 100 } }));
            if (p.habilidades_especificas.tecnicas && p.habilidades_especificas.tecnicas.length > 0) {
                children.push(new Paragraph({ text: "Técnicas:", bold: true }));
                p.habilidades_especificas.tecnicas.forEach((h: string) => children.push(new Paragraph({ text: h, bullet: { level: 1 } })));
            }
            if (p.habilidades_especificas.transversales && p.habilidades_especificas.transversales.length > 0) {
                children.push(new Paragraph({ text: "Transversales:", bold: true, spacing: { before: 100 } }));
                p.habilidades_especificas.transversales.forEach((h: string) => children.push(new Paragraph({ text: h, bullet: { level: 1 } })));
            }
            children.push(new Paragraph({ text: "", spacing: { after: 100 } }));
        }

        children.push(new Paragraph({ children: [new TextRun({ text: "Modelo Metodológico: ", bold: true }), new TextRun(safeString(p.modelo_metodologico))], spacing: { after: 100 } }));
        children.push(new Paragraph({ children: [new TextRun({ text: "Público Objetivo: ", bold: true }), new TextRun(safeString(p.publico_objetivo))], spacing: { after: 100 } }));
        children.push(new Paragraph({ children: [new TextRun({ text: "Prerrequisitos: ", bold: true }), new TextRun(safeString(p.prerrequisitos))], spacing: { after: 100 } }));
        children.push(new Paragraph({ children: [new TextRun({ text: "Referentes Normativos: ", bold: true }), new TextRun(safeString(p.referentes_normativos))], spacing: { after: 100 } }));
        
        if (p.articulacion) {
            children.push(new Paragraph({ children: [new TextRun({ text: "Articulación:", bold: true })], spacing: { before: 100, after: 100 } }));
            children.push(new Paragraph({ children: [new TextRun({ text: "• Programa Previo: ", bold: true }), new TextRun(safeString(p.articulacion.programa_previo))] }));
            children.push(new Paragraph({ children: [new TextRun({ text: "• Programa Siguiente: ", bold: true }), new TextRun(safeString(p.articulacion.programa_siguiente))] }));
        }
        children.push(new Paragraph({ text: "", spacing: { after: 200 } }));

        // MÓDULOS
        if (modulos && modulos.length > 0) {
            children.push(new Paragraph({ children: [new PageBreak()] }));
            children.push(new Paragraph({ text: "Contenido Temático y Módulos", heading: HeadingLevel.HEADING_1, spacing: { after: 300 } }));

            modulos.forEach((modulo: any, index: number) => {
                const moduloNombre = modulo.titulo || modulo.nombre || `Módulo ${index + 1}`;
                const duracion = modulo.duracion_horas ? ` (${modulo.duracion_horas} horas)` : "";
                children.push(new Paragraph({ text: `Módulo ${modulo.numero || index + 1}: ${moduloNombre}${duracion}`, heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }));
                if (modulo.descripcion) {
                    children.push(new Paragraph({ text: modulo.descripcion, spacing: { after: 100 } }));
                }

                if (modulo.objetivos_especificos && modulo.objetivos_especificos.length > 0) {
                    children.push(new Paragraph({ children: [new TextRun({ text: "Objetivos Específicos:", bold: true })], spacing: { before: 100 } }));
                    modulo.objetivos_especificos.forEach((obj: string) => children.push(new Paragraph({ text: obj, bullet: { level: 0 } })));
                }

                if (modulo.resultados_aprendizaje && modulo.resultados_aprendizaje.length > 0) {
                    children.push(new Paragraph({ children: [new TextRun({ text: "Alineación Curricular (RAs):", bold: true })], spacing: { before: 100 } }));
                    modulo.resultados_aprendizaje.forEach((raCode: string) => {
                        // Búsqueda más robusta de RA (idéntica a SilaboModal)
                        const matchedRa = ras.find(r => 
                            r.codigo === raCode || 
                            raCode.includes(r.codigo) || 
                            (r.codigo && raCode.toLowerCase().includes(r.codigo.toLowerCase()))
                        );
                        const desc = matchedRa ? (matchedRa.descripcion_adaptada || matchedRa.descripcion) : '';
                        const text = desc ? `${raCode}: ${desc}` : raCode;
                        children.push(new Paragraph({ text, bullet: { level: 0 } }));
                    });
                }

                const temasSaberes = modulo.temas || modulo.saberes || [];
                if (temasSaberes && temasSaberes.length > 0) {
                    children.push(new Paragraph({ children: [new TextRun({ text: "Temas / Saberes:", bold: true })], spacing: { before: 100 } }));
                    temasSaberes.forEach((tema: any) => {
                        if (typeof tema === 'string') {
                             children.push(new Paragraph({ text: tema, bullet: { level: 0 } }));
                        } else if (tema && typeof tema === 'object') {
                             const title = tema.nombre || tema.titulo || tema.tema || tema.contenido || "Tema";
                             children.push(new Paragraph({ text: title, bullet: { level: 0 } }));
                             if (tema.subtemas && Array.isArray(tema.subtemas)) {
                                 tema.subtemas.forEach((sub: string) => {
                                     children.push(new Paragraph({ text: sub, bullet: { level: 1 } }));
                                 });
                             }
                        }
                    });
                }

                const recursosMateriales = modulo.materiales_estudio || modulo.recursos || [];
                if (recursosMateriales && recursosMateriales.length > 0) {
                    children.push(new Paragraph({ children: [new TextRun({ text: "Recursos y Materiales:", bold: true })], spacing: { before: 100 } }));
                    recursosMateriales.forEach((mat: string) => children.push(new Paragraph({ text: mat, bullet: { level: 0 } })));
                }

                if (modulo.estrategias_didacticas || modulo.metodologia) {
                    children.push(new Paragraph({ children: [new TextRun({ text: "Estrategias Didácticas:", bold: true })], spacing: { before: 100 } }));
                    const ed = modulo.estrategias_didacticas || modulo.metodologia;
                    if (Array.isArray(ed)) {
                        ed.forEach((e: string) => children.push(new Paragraph({ text: e, bullet: { level: 0 } })));
                    } else {
                        children.push(new Paragraph({ text: safeString(ed) }));
                    }
                }

                if (modulo.actividades_aprendizaje && modulo.actividades_aprendizaje.length > 0) {
                    children.push(new Paragraph({ children: [new TextRun({ text: "Actividades de Aprendizaje:", bold: true })], spacing: { before: 100 } }));
                    modulo.actividades_aprendizaje.forEach((act: any) => children.push(new Paragraph({ text: typeof act === 'string' ? act : (act.descripcion || JSON.stringify(act)), bullet: { level: 0 } })));
                }

                if (modulo.estrategias_evaluacion) {
                    children.push(new Paragraph({ children: [new TextRun({ text: "Estrategias de Evaluación:", bold: true })], spacing: { before: 100 } }));
                    if (typeof modulo.estrategias_evaluacion === 'string') {
                        children.push(new Paragraph({ text: modulo.estrategias_evaluacion }));
                    } else if (typeof modulo.estrategias_evaluacion === 'object') {
                        const { saber, saber_hacer, ser } = modulo.estrategias_evaluacion;
                        if (saber) children.push(new Paragraph({ text: `Saber (Conceptual): ${saber}`, bullet: { level: 0 } }));
                        if (saber_hacer) children.push(new Paragraph({ text: `Saber Hacer (Procedimental): ${saber_hacer}`, bullet: { level: 0 } }));
                        if (ser) children.push(new Paragraph({ text: `Ser (Actitudinal): ${ser}`, bullet: { level: 0 } }));
                    }
                }

                if (modulo.criterios_evaluacion && modulo.criterios_evaluacion.length > 0) {
                    children.push(new Paragraph({ children: [new TextRun({ text: "Criterios de Evaluación:", bold: true })], spacing: { before: 100 } }));
                    modulo.criterios_evaluacion.forEach((crit: string) => children.push(new Paragraph({ text: crit, bullet: { level: 0 } })));
                }

                children.push(new Paragraph({ text: "", spacing: { after: 200 } }));
            });
        }

        // OTROS CAPÍTULOS
        children.push(new Paragraph({ children: [new PageBreak()] }));
        
        children.push(new Paragraph({ text: "Recursos Adicionales, Políticas y Perfiles", heading: HeadingLevel.HEADING_1, spacing: { after: 300 } }));

        children.push(new Paragraph({ text: "Recursos Adicionales", heading: HeadingLevel.HEADING_2, spacing: { after: 100 } }));
        if (rec.bibliografia && rec.bibliografia.length > 0) {
            children.push(new Paragraph({ children: [new TextRun({ text: "Bibliografía:", bold: true })] }));
            rec.bibliografia.forEach((b: string) => children.push(new Paragraph({ text: b, bullet: { level: 0 } })));
        }
        if (rec.herramientas_software && rec.herramientas_software.length > 0) {
            children.push(new Paragraph({ children: [new TextRun({ text: "Herramientas de Software:", bold: true })], spacing: { before: 100 } }));
            rec.herramientas_software.forEach((h: string) => children.push(new Paragraph({ text: h, bullet: { level: 0 } })));
        }
        children.push(new Paragraph({ text: "", spacing: { after: 200 } }));

        children.push(new Paragraph({ text: "Políticas del Programa", heading: HeadingLevel.HEADING_2, spacing: { after: 100 } }));
        children.push(new Paragraph({ children: [new TextRun({ text: "Asistencia: ", bold: true }), new TextRun(safeString(pol.asistencia))] }));
        children.push(new Paragraph({ children: [new TextRun({ text: "Aprobación: ", bold: true }), new TextRun(safeString(pol.aprobacion))] }));
        children.push(new Paragraph({ text: "", spacing: { after: 200 } }));

        children.push(new Paragraph({ text: "Perfil de Instructores", heading: HeadingLevel.HEADING_2, spacing: { after: 100 } }));
        children.push(new Paragraph({ children: [new TextRun({ text: "Educación: ", bold: true }), new TextRun(safeString(perf.educacion))] }));
        children.push(new Paragraph({ children: [new TextRun({ text: "Formación Complementaria: ", bold: true }), new TextRun(safeString(perf.formacion_complementaria))] }));
        children.push(new Paragraph({ children: [new TextRun({ text: "Experiencia: ", bold: true }), new TextRun(safeString(perf.experiencia))] }));
        children.push(new Paragraph({ text: "", spacing: { after: 200 } }));

        children.push(new Paragraph({ text: "Certificación y Reconocimiento", heading: HeadingLevel.HEADING_1, spacing: { after: 300 } }));
        children.push(new Paragraph({ children: [new TextRun({ text: "Credencial: ", bold: true }), new TextRun(safeString(cert.nombre_credencial))] }));
        children.push(new Paragraph({ children: [new TextRun({ text: "Descripción: ", bold: true }), new TextRun(safeString(cert.descripcion))] }));
        
        if (cert.habilidades_desarrolladas && cert.habilidades_desarrolladas.length > 0) {
            children.push(new Paragraph({ children: [new TextRun({ text: "Habilidades Desarrolladas:", bold: true })], spacing: { before: 100 } }));
            cert.habilidades_desarrolladas.forEach((h: string) => children.push(new Paragraph({ text: h, bullet: { level: 0 } })));
        }
        if (cert.requisitos_logro && cert.requisitos_logro.length > 0) {
            children.push(new Paragraph({ children: [new TextRun({ text: "Requisitos de Logro:", bold: true })], spacing: { before: 100 } }));
            cert.requisitos_logro.forEach((r: string) => children.push(new Paragraph({ text: r, bullet: { level: 0 } })));
        }
        if (cert.evidencias_logro && cert.evidencias_logro.length > 0) {
            children.push(new Paragraph({ children: [new TextRun({ text: "Evidencias de Logro:", bold: true })], spacing: { before: 100 } }));
            cert.evidencias_logro.forEach((e: string) => children.push(new Paragraph({ text: e, bullet: { level: 0 } })));
        }
        children.push(new Paragraph({ children: [new TextRun({ text: "Norma Aplicable: ", bold: true }), new TextRun(safeString(cert.norma))], spacing: { before: 100 } }));
        
        if (cert.firmas_certificadoras && cert.firmas_certificadoras.length > 0) {
            children.push(new Paragraph({ children: [new TextRun({ text: "Entidades / Firmas Certificadoras:", bold: true })], spacing: { before: 100 } }));
            cert.firmas_certificadoras.forEach((f: string) => children.push(new Paragraph({ text: f, bullet: { level: 0 } })));
        }
    }

    // 4. Evaluaciones y Rúbricas
    const evalItems = Array.isArray(evaluacion) ? evaluacion : (evaluacion as any)?.evaluaciones || [];
    
    if (evalItems && evalItems.length > 0) {
        children.push(new Paragraph({ children: [new PageBreak()] }));
        children.push(new Paragraph({ text: "Evaluaciones y Rúbricas", heading: HeadingLevel.HEADING_1, spacing: { after: 300 } }));

        evalItems.forEach((ev: any, index: number) => {
            const act = ev.actividad_evaluativa || {};
            children.push(new Paragraph({
                text: `Evaluación ${index + 1}: ${act.nombre || "N/A"} (${act.tipo || "N/A"})`,
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 200, after: 100 }
            }));

            children.push(new Paragraph({
                children: [
                    new TextRun({ text: "Resultado de Aprendizaje: ", bold: true }),
                    new TextRun(safeString(ev.resultado_aprendizaje))
                ]
            }));

            children.push(new Paragraph({ children: [new TextRun({ text: "Descripción de la actividad:", bold: true })], spacing: { before: 100 } }));
            children.push(new Paragraph({ text: safeString(act.descripcion) }));

            const critCubiertos = ev.criterios_cubiertos || [];
            if (critCubiertos.length > 0) {
                children.push(new Paragraph({ children: [new TextRun({ text: "Criterios del MNC cubiertos:", bold: true })], spacing: { before: 100 } }));
                critCubiertos.forEach((crit: any) => {
                    const text = typeof crit === 'object' ? `${crit.codigo ? crit.codigo + ': ' : ''}${crit.descripcion}` : crit;
                    children.push(new Paragraph({ text: safeString(text), bullet: { level: 0 } }));
                });
            }

            // Tabla de rúbrica
            let rubricaData: any[] = [];
            if (Array.isArray(ev.rubrica)) {
                rubricaData = ev.rubrica;
            } else if (ev.rubrica && typeof ev.rubrica === 'object') {
                rubricaData = Object.entries(ev.rubrica).map(([nivel, desc]) => ({
                    nivel_academico: nivel,
                    descripcion: desc
                }));
            }

            if (rubricaData.length > 0) {
                children.push(new Paragraph({ children: [new TextRun({ text: "Rúbrica de Evaluación:", bold: true })], spacing: { before: 200, after: 100 } }));

                const tableRows = [
                    new TableRow({
                        children: [
                            new TableCell({
                                children: [new Paragraph({ children: [new TextRun({ text: "Nivel / Escala", bold: true })], alignment: AlignmentType.CENTER })],
                                width: { size: 25, type: WidthType.PERCENTAGE },
                                shading: { fill: "F3F4F6" }
                            }),
                            new TableCell({
                                children: [new Paragraph({ children: [new TextRun({ text: "Descriptor de Evidencia", bold: true })], alignment: AlignmentType.CENTER })],
                                width: { size: 75, type: WidthType.PERCENTAGE },
                                shading: { fill: "F3F4F6" }
                            })
                        ]
                    })
                ];

                rubricaData.forEach(rub => {
                    tableRows.push(
                        new TableRow({
                            children: [
                                new TableCell({
                                    children: [new Paragraph({ text: safeString(rub.nivel_academico), alignment: AlignmentType.CENTER })],
                                }),
                                new TableCell({
                                    children: [new Paragraph({ text: safeString(rub.descripcion) })],
                                })
                            ]
                        })
                    );
                });

                const table = new Table({
                    rows: tableRows,
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    borders: {
                        top: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
                        bottom: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
                        left: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
                        right: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
                        insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
                        insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
                    }
                });

                children.push(table);
            }
        });
    }

    const doc = new Document({
        sections: [{
            properties: {},
            children: children
        }]
    });

    try {
        const blob = await Packer.toBlob(doc);
        saveAs(blob, `Diseno Curricular - ${programa.nombre.replace(/[^a-z0-9]/gi, '_')}.docx`);
    } catch (error) {
        console.error("Error al exportar DOCX", error);
        throw error;
    }

}
