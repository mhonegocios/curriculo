import json

path = r'c:\Users\Melissa\OneDrive\Repositorios\n8n currículo\Workflows\Cargador_Cualificaciones_Gemini V15.json'
with open(path, 'r', encoding='utf-8') as f:
    wf = json.load(f)

changes = []

for n in wf['nodes']:
    name = n['name']
    params = n.get('parameters', {})

    # ─────────────────────────────────────────────────────────────────────
    # FIX: Supabase - Insertar Elemento
    # skipOnConflict=True bloquea el output cuando hay conflicto.
    # Lo convertimos a executeQuery con ON CONFLICT DO UPDATE (upsert),
    # para que SIEMPRE devuelva el {id}.
    # ─────────────────────────────────────────────────────────────────────
    if name == 'Supabase - Insertar Elemento':
        # Cambiar de modo 'insert' a 'executeQuery' con SQL raw
        n['parameters'] = {
            "operation": "executeQuery",
            "query": (
                "INSERT INTO elementos_competencia_cnc (competencia_id, numero_elemento, descripcion)\n"
                "VALUES (\n"
                "  '{{ $json.competencia_id }}',\n"
                "  {{ $json.numero_elemento }},\n"
                "  '{{ String($json.descripcion || \"\").replace(/'/g, \"''\") }}'\n"
                ")\n"
                "ON CONFLICT (competencia_id, numero_elemento) DO UPDATE\n"
                "  SET descripcion = EXCLUDED.descripcion\n"
                "RETURNING id;"
            ),
            "options": {}
        }
        n['continueOnFail'] = True
        n['typeVersion'] = 2.4
        changes.append('Supabase - Insertar Elemento: converted to executeQuery with RETURNING id (always outputs)')

    # ─────────────────────────────────────────────────────────────────────
    # FIX: Supabase - Insertar Resultado Aprendizaje
    # Mismo problema: skipOnConflict=True bloquea el output.
    # ─────────────────────────────────────────────────────────────────────
    elif name == 'Supabase - Insertar Resultado Aprendizaje':
        n['parameters'] = {
            "operation": "executeQuery",
            "query": (
                "INSERT INTO resultados_aprendizaje_cnc (competencia_id, codigo, descripcion, duracion_horas)\n"
                "VALUES (\n"
                "  '{{ $json.competencia_id }}',\n"
                "  '{{ String($json.codigo || \"\").replace(/'/g, \"''\") }}',\n"
                "  '{{ String($json.descripcion || \"\").replace(/'/g, \"''\") }}',\n"
                "  {{ $json.duracion_horas !== null && $json.duracion_horas !== undefined ? $json.duracion_horas : 'NULL' }}\n"
                ")\n"
                "ON CONFLICT (competencia_id, codigo) DO UPDATE\n"
                "  SET descripcion = EXCLUDED.descripcion,\n"
                "      duracion_horas = EXCLUDED.duracion_horas\n"
                "RETURNING id;"
            ),
            "options": {}
        }
        n['continueOnFail'] = True
        n['typeVersion'] = 2.4
        changes.append('Supabase - Insertar Resultado Aprendizaje: converted to executeQuery with RETURNING id')

    # ─────────────────────────────────────────────────────────────────────
    # FIX: Preparar Criterios Desempeño
    # El Supabase - Insertar Elemento ahora usa executeQuery y devuelve {id}.
    # El codigo ya es correcto ($input.item.json.id + Loop Elementos).
    # Solo verificamos que está bien.
    # ─────────────────────────────────────────────────────────────────────
    elif name == 'Preparar Criterios Desempeño':
        code = params.get('jsCode', '')
        expected_ref = "$('Loop Elementos').item.json"
        if expected_ref in code:
            changes.append(f'Preparar Criterios Desempeño: OK - already reads from Loop Elementos')
        else:
            changes.append(f'Preparar Criterios Desempeño: WARNING - missing Loop Elementos reference!')

    # ─────────────────────────────────────────────────────────────────────
    # FIX: Preparar Criterios Evaluación
    # Similar: verifica que lee de Loop Resultados Aprendizaje
    # ─────────────────────────────────────────────────────────────────────
    elif name == 'Preparar Criterios Evaluación':
        code = params.get('jsCode', '')
        expected_ref = "$('Loop Resultados Aprendizaje').item.json"
        if expected_ref in code:
            changes.append(f'Preparar Criterios Evaluación: OK - already reads from Loop Resultados Aprendizaje')
        else:
            changes.append(f'Preparar Criterios Evaluación: WARNING - missing Loop RA reference!')

# ─────────────────────────────────────────────────────────────────────────────
# Verificar que las conexiones de Loop Resultados Aprendizaje están bien:
# out0 -> Loop Competencias (termine el loop de RA, volver al de competencias)
# out1 -> Supabase - Insertar Resultado Aprendizaje (cada item del loop)
# ─────────────────────────────────────────────────────────────────────────────
c = wf['connections']
loop_ra_conn = c.get('Loop Resultados Aprendizaje', {}).get('main', [])
changes.append(f'Loop Resultados Aprendizaje connections: {loop_ra_conn}')

for ch in changes:
    print(ch)

with open(path, 'w', encoding='utf-8') as f:
    json.dump(wf, f, ensure_ascii=False, indent=2)

print('\nFile saved OK')
