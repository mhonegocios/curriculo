import json

path = r'c:\Users\Melissa\OneDrive\Repositorios\n8n currículo\Workflows\Cargador_Cualificaciones_Gemini V15.json'
with open(path, 'r', encoding='utf-8') as f:
    wf = json.load(f)

c = wf['connections']

# ─────────────────────────────────────────────────────────────────────────────
# DIAGNÓSTICO: imprimir conexiones relevantes a stderr
# ─────────────────────────────────────────────────────────────────────────────
import sys

relevant_nodes = [
    'Supabase - Insertar Competencia',
    'Loop Competencias',
    'Preparar Contenidos',
    'Preparar Elementos',
    'Preparar Resultados Aprendizaje',
    'Loop Elementos',
    'Supabase - Insertar Elemento',
    'Preparar Criterios Desempeño',
    'Loop criterios desempeño',
    'Supabase - Insertar Criterios',
]
for node in relevant_nodes:
    conns = c.get(node, 'NOT IN CONNECTIONS')
    print(f"{node}: {conns}", file=sys.stderr)

# ─────────────────────────────────────────────────────────────────────────────
# FIX 1: Preparar Resultados Aprendizaje debe venir de Supabase - Insertar Competencia
# Actualmente en el workflow subido por el usuario, viene de Loop Elementos out0.
# Necesitamos:
#   - Eliminar la conexión: Loop Elementos --out0--> Preparar Resultados Aprendizaje
#   - Agregar la conexión:  Supabase - Insertar Competencia --out? --> Preparar Resultados Aprendizaje
# ─────────────────────────────────────────────────────────────────────────────

# Remove "Preparar Resultados Aprendizaje" from Loop Elementos out0
if 'Loop Elementos' in c:
    for out_idx, targets in enumerate(c['Loop Elementos'].get('main', [])):
        c['Loop Elementos']['main'][out_idx] = [
            t for t in targets 
            if t.get('node') != 'Preparar Resultados Aprendizaje'
        ]
    print("FIX1a: Removed Preparar Resultados Aprendizaje from Loop Elementos out0")

# Add "Preparar Resultados Aprendizaje" to Supabase - Insertar Competencia out0
if 'Supabase - Insertar Competencia' in c:
    main_outs = c['Supabase - Insertar Competencia']['main']
    # out0 should exist, add to it
    already_there = any(
        t.get('node') == 'Preparar Resultados Aprendizaje'
        for targets in main_outs
        for t in targets
    )
    if not already_there:
        if len(main_outs) == 0:
            main_outs.append([])
        main_outs[0].append({"node": "Preparar Resultados Aprendizaje", "type": "main", "index": 0})
        print("FIX1b: Added Preparar Resultados Aprendizaje to Supabase - Insertar Competencia out0")
    else:
        print("FIX1b: Preparar Resultados Aprendizaje already connected to Supabase - Insertar Competencia")

# ─────────────────────────────────────────────────────────────────────────────
# FIX 2: Asegurarnos de que Supabase - Insertar Elemento tiene continueOnFail = true
# y que no tiene skipOnConflict que impida pasar el item
# ─────────────────────────────────────────────────────────────────────────────
for n in wf['nodes']:
    if n['name'] == 'Supabase - Insertar Elemento':
        # Check skipOnConflict - when skipOnConflict=True item doesn't pass downstream
        opts = n['parameters'].get('options', {})
        if opts.get('skipOnConflict'):
            # Change to using ON CONFLICT DO NOTHING via raw query instead
            # But first, let's just ensure continueOnFail=true
            pass
        n['continueOnFail'] = True
        print(f"FIX2: Supabase - Insertar Elemento continueOnFail=True confirmed")
        print(f"  skipOnConflict = {opts.get('skipOnConflict')}")
        print(f"  outputColumns = {opts.get('outputColumns')}")

# ─────────────────────────────────────────────────────────────────────────────
# FIX 3: Verificar que Loop criterios desempeño out1 -> Supabase - Insertar Criterios
# ─────────────────────────────────────────────────────────────────────────────
lc = c.get('Loop criterios desempeño', {})
main = lc.get('main', [[], []])
# out0 = loop back (done), out1 = each item
has_insert_criterios = any(
    t.get('node') == 'Supabase - Insertar Criterios'
    for targets in main
    for t in targets
)
print(f"FIX3: Loop criterios desempeño --> Supabase - Insertar Criterios: {has_insert_criterios}")
print(f"  Current connections: {main}")

# ─────────────────────────────────────────────────────────────────────────────
# FIX 4: Verificar Loop criterios evaluacion out1 -> Supabase - Insertar Criterios Evaluación
# ─────────────────────────────────────────────────────────────────────────────
lce = c.get('Loop criterios evaluacion', {})
main_e = lce.get('main', [[], []])
print(f"FIX4: Loop criterios evaluacion connections: {main_e}")

with open(path, 'w', encoding='utf-8') as f:
    json.dump(wf, f, ensure_ascii=False, indent=2)

print("File saved OK")
