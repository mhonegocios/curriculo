import json

path = r'c:\Users\Melissa\OneDrive\Repositorios\n8n currículo\Workflows\Cargador_Cualificaciones_Gemini V15.json'
with open(path, 'r', encoding='utf-8') as f:
    wf = json.load(f)

print("=== CONNECTIONS CLEAN ===")
for src, dests in wf['connections'].items():
    for output_idx, targets in enumerate(dests.get('main', [])):
        for t in targets:
            print(f"  {src!r:45s} --out{output_idx}--> {t['node']!r}")

print("\n=== MISSING CONNECTIONS CHECK ===")
# Check Loop criterios desempeño connections
c = wf['connections']
if 'Loop criterios desempeño' in c:
    print("Loop criterios desempeño:", c['Loop criterios desempeño'])
else:
    print("Loop criterios desempeño: NO CONNECTIONS")

if 'Preparar Criterios Desempeño' in c:
    print("Preparar Criterios Desempeño:", c['Preparar Criterios Desempeño'])
else:
    print("Preparar Criterios Desempeño: NO CONNECTIONS")

if 'Supabase - Insertar Criterios' in c:
    print("Supabase - Insertar Criterios:", c['Supabase - Insertar Criterios'])
else:
    print("Supabase - Insertar Criterios: NO CONNECTIONS")
