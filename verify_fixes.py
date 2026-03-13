import json

path = r'c:\Users\Melissa\OneDrive\Repositorios\n8n currículo\Workflows\Cargador_Cualificaciones_Gemini V15.json'
with open(path, 'r', encoding='utf-8') as f:
    wf = json.load(f)

checks = {
    'Preparar Competencias': ['competenciasValidas', 'comp.codigo)'],
    'Preparar Contenidos': ["$('Loop Competencias').item.json"],
    'Preparar Elementos': ["$('Loop Competencias').item.json"],
    'Preparar Criterios Desempeño': ["$('Loop Elementos').item.json"],
    'Preparar Resultados Aprendizaje': ["$('Loop Competencias').item.json"],
    'Preparar Criterios Evaluación': ["$('Loop Resultados Aprendizaje').item.json"],
}

for n in wf['nodes']:
    name = n.get('name', '')
    if name in checks:
        code = n['parameters'].get('jsCode', '')
        patterns = checks[name]
        all_ok = all(p in code for p in patterns)
        status = 'OK' if all_ok else 'MISSING'
        print(f'{status}: {name}')
        if not all_ok:
            for p in patterns:
                found = p in code
                print(f'  {"FOUND" if found else "NOT FOUND"}: {p}')
