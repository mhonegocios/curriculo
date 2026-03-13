import json

path = r'c:\Users\Melissa\OneDrive\Repositorios\n8n currículo\Workflows\Cargador_Cualificaciones_Gemini V15.json'
with open(path, 'r', encoding='utf-8') as f:
    wf = json.load(f)

c = wf['connections']

for node_name, outs in c.items():
    for out_idx, targets in enumerate(outs.get('main', [])):
        if targets:
            names = [t['node'] for t in targets]
            print(f"{node_name} [out{out_idx}] -> {names}")

print("\nVerificando Preparar Criterios Desempeño:")
print(c.get('Preparar Criterios Desempeño', {}))

print("\nVerificando Loop Elementos:")
print(c.get('Loop Elementos', {}))
