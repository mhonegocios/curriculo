import json

path = r'c:\Users\Melissa\OneDrive\Repositorios\n8n currículo\Workflows\Cargador_Cualificaciones_Gemini V15.json'
with open(path, 'r', encoding='utf-8') as f:
    wf = json.load(f)

results = []

for n in wf['nodes']:
    name = n.get('name', '')
    params = n.get('parameters', {})
    code = params.get('jsCode', '')

    # ── FIX 1: Preparar Competencias ─────────────────────────────────────────
    if name == 'Preparar Competencias':
        old = (
            'return competencias.map((comp, index) => {\n'
            '  // Buscar denominación bajo distintas claves posibles\n'
            '  const den =\n'
            '    comp.denominacion ||\n'
            '    comp.nombre ||\n'
            '    comp.titulo ||\n'
            '    comp.competencia ||\n'
            '    comp.descripcion ||\n'
            '    null;\n'
            '\n'
            '  return {\n'
            '    json: {\n'
            '      cualificacion_id: cualificacionId,\n'
            '      codigo: comp.codigo || null,\n'
            "      denominacion: den ? String(den).trim() : 'Sin denominación (extracción fallida)',\n"
            '      es_transversal: comp.es_transversal === true ? true : false,\n'
            '      orden_secuencia: index + 1,\n'
            '      duracion_horas: (comp.duracion_horas !== null && comp.duracion_horas !== undefined) ? Number(comp.duracion_horas) : null,\n'
            '      elementos: comp.elementos || [],\n'
            '      resultados_aprendizaje: comp.resultados_aprendizaje || [],\n'
            '      contenidos: comp.contenidos || {}\n'
            '    }\n'
            '  };\n'
            '});'
        )
        new = (
            '// Filtrar: solo competencias con código UC válido (excluir sub-items sueltos del LLM)\n'
            'const competenciasValidas = competencias.filter(comp => comp && comp.codigo);\n'
            '\n'
            'if (competenciasValidas.length === 0) {\n'
            '  return [{\n'
            '    json: {\n'
            '      _error: true,\n'
            "      mensaje: 'ERROR: El array de competencias existe pero ningún ítem tiene código UC. Items sin filtro: ' + competencias.length,\n"
            '      cualificacion_id: cualificacionId\n'
            '    }\n'
            '  }];\n'
            '}\n'
            '\n'
            'return competenciasValidas.map((comp, index) => {\n'
            '  const den =\n'
            '    comp.denominacion ||\n'
            '    comp.nombre ||\n'
            '    comp.titulo ||\n'
            '    comp.competencia ||\n'
            '    comp.descripcion ||\n'
            '    null;\n'
            '\n'
            '  return {\n'
            '    json: {\n'
            '      cualificacion_id: cualificacionId,\n'
            '      codigo: comp.codigo,\n'
            "      denominacion: den ? String(den).trim() : 'Sin denominación (extracción fallida)',\n"
            '      es_transversal: comp.es_transversal === true ? true : false,\n'
            '      orden_secuencia: index + 1,\n'
            '      duracion_horas: (comp.duracion_horas !== null && comp.duracion_horas !== undefined) ? Number(comp.duracion_horas) : null,\n'
            '      elementos: comp.elementos || [],\n'
            '      resultados_aprendizaje: comp.resultados_aprendizaje || [],\n'
            '      contenidos: comp.contenidos || {}\n'
            '    }\n'
            '  };\n'
            '});'
        )
        if old in code:
            params['jsCode'] = code.replace(old, new)
            results.append('OK: Preparar Competencias - filter added')
        else:
            results.append('WARN: Preparar Competencias - old pattern not found')
            results.append('  Snippet: ' + repr(code[1400:1600]))

    # ── FIX 2: Preparar Criterios Evaluación ─────────────────────────────────
    elif name == 'Preparar Criterios Evaluación':
        old = (
            '// El nodo Supabase - Insertar Resultado Aprendizaje (INSERT mode) pasa todos los campos\n'
            '// $input.item.json.id = resultado_aprendizaje_id\n'
            '// $input.item.json.criterios_evaluacion = el array original\n'
            'const raId = $input.item.json.id;\n'
            'const criterios = $input.item.json.criterios_evaluacion || [];'
        )
        new = (
            '// CORRECCIÓN: Supabase INSERT solo devuelve {id}. Los criterios se leen del Loop actual.\n'
            'const raId = $input.item.json.id;\n'
            "const loopRA = $('Loop Resultados Aprendizaje').item.json;\n"
            'const criterios = loopRA.criterios_evaluacion || [];'
        )
        if old in code:
            params['jsCode'] = code.replace(old, new)
            results.append('OK: Preparar Criterios Evaluación - Loop reference fixed')
        else:
            results.append('WARN: Preparar Criterios Evaluación - old pattern not found')
            results.append('  Snippet: ' + repr(code[:400]))

for r in results:
    print(r)

with open(path, 'w', encoding='utf-8') as f:
    json.dump(wf, f, ensure_ascii=False, indent=2)

print('File saved OK')
