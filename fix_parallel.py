import json

path = r'c:\Users\Melissa\OneDrive\Repositorios\n8n currículo\Workflows\Cargador_Cualificaciones_Gemini V15.json'
with open(path, 'r', encoding='utf-8') as f:
    wf = json.load(f)

# Helper para conectar
def connect(src, src_out, trg, trg_in=0):
    if src not in wf['connections']:
        wf['connections'][src] = {'main': []}
    while len(wf['connections'][src]['main']) <= src_out:
        wf['connections'][src]['main'].append([])
    
    # Check if already connected
    for t in wf['connections'][src]['main'][src_out]:
        if t['node'] == trg and t.get('index', 0) == trg_in:
            return # already connected
            
    wf['connections'][src]['main'][src_out].append({
        'node': trg,
        'type': 'main',
        'index': trg_in
    })

def disconnect_all_from(src, src_out):
    if src in wf['connections'] and len(wf['connections'][src]['main']) > src_out:
        wf['connections'][src]['main'][src_out] = []

def disconnect(src, src_out, trg):
    if src in wf['connections'] and len(wf['connections'][src]['main']) > src_out:
        wf['connections'][src]['main'][src_out] = [
            t for t in wf['connections'][src]['main'][src_out]
            if t['node'] != trg
        ]

# 1. Supabase - Insertar Competencia ->(out0) Preparar Contenidos, Preparar Elementos, Preparar Resultados Aprendizaje
disconnect_all_from('Supabase - Insertar Competencia', 0)
connect('Supabase - Insertar Competencia', 0, 'Preparar Contenidos')
connect('Supabase - Insertar Competencia', 0, 'Preparar Elementos')
connect('Supabase - Insertar Competencia', 0, 'Preparar Resultados Aprendizaje')

# Desconectar cualquier encadenamiento anterior
disconnect('Loop Contenidos', 0, 'Preparar Elementos')
disconnect('Loop Elementos', 0, 'Preparar Resultados Aprendizaje')
disconnect('Loop Resultados Aprendizaje', 0, 'Loop Competencias')

# 2. Add 3 NoOp nodes
def add_node(name, ntype, position, params=None):
    if not any(n['name'] == name for n in wf['nodes']):
        wf['nodes'].append({
            "parameters": params or {},
            "id": "gen-" + name.replace(" ", "-"),
            "name": name,
            "type": ntype,
            "typeVersion": 1,
            "position": position
        })

add_node('NoOp Contenidos', 'n8n-nodes-base.noOp', [2500, 300])
add_node('NoOp Elementos', 'n8n-nodes-base.noOp', [2500, 500])
add_node('NoOp RA', 'n8n-nodes-base.noOp', [2500, 700])

# 3. Add Merge nodes (Append mode waits for all inputs)
add_node('Merge 1', 'n8n-nodes-base.merge', [2800, 400], {"mode": "append"})
add_node('Merge Final', 'n8n-nodes-base.merge', [3100, 500], {"mode": "append"})

# 4. Connect Loops to NoOps
disconnect_all_from('Loop Contenidos', 0)
connect('Loop Contenidos', 0, 'NoOp Contenidos')

disconnect_all_from('Loop Elementos', 0)
connect('Loop Elementos', 0, 'NoOp Elementos')

disconnect_all_from('Loop Resultados Aprendizaje', 0)
connect('Loop Resultados Aprendizaje', 0, 'NoOp RA')

# 5. Connect NoOps to Merges
# Merge 1 receives Contenidos (in 0) and Elementos (in 1)
disconnect_all_from('NoOp Contenidos', 0)
connect('NoOp Contenidos', 0, 'Merge 1', 0)

disconnect_all_from('NoOp Elementos', 0)
connect('NoOp Elementos', 0, 'Merge 1', 1)

# Merge Final receives Merge 1 (in 0) and RA (in 1)
disconnect_all_from('Merge 1', 0)
connect('Merge 1', 0, 'Merge Final', 0)

disconnect_all_from('NoOp RA', 0)
connect('NoOp RA', 0, 'Merge Final', 1)

# 6. Connect Merge Final back to Loop Competencias
disconnect_all_from('Merge Final', 0)
connect('Merge Final', 0, 'Loop Competencias', 0)

with open(path, 'w', encoding='utf-8') as f:
    json.dump(wf, f, ensure_ascii=False, indent=2)

print("Workflow modificado con Merge en paralelo exitosamente.")
