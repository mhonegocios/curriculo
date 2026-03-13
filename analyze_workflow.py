import json

path = r'c:\Users\Melissa\OneDrive\Repositorios\n8n currículo\Workflows\Cargador_Cualificaciones_Gemini V15.json'
with open(path, 'r', encoding='utf-8') as f:
    wf = json.load(f)

print("=== CONNECTIONS ===")
for src, dests in wf['connections'].items():
    for output_idx, targets in enumerate(dests.get('main', [])):
        for t in targets:
            print(f"{src} --out{output_idx}--> {t['node']}")

print("\n\n=== RELEVANT NODE CODES ===")
relevant = {
    'Preparar Resultados Aprendizaje',
    'Preparar Elementos', 
    'Preparar Criterios Desempeño',
    'Loop criterios desempeño',
}
for n in wf['nodes']:
    if n['name'] in relevant:
        code = n['parameters'].get('jsCode', 'NO CODE')
        print(f"\n{'='*60}")
        print(f"NODE: {n['name']}")
        print(f"{'='*60}")
        print(code)
