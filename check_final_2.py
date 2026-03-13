import json

path = r'c:\Users\Melissa\OneDrive\Repositorios\n8n currículo\Workflows\Cargador_Cualificaciones_Gemini V15.json'
with open(path, 'r', encoding='utf-8') as f:
    wf = json.load(f)

c = wf['connections']

# Para ver las salidas limpias, guardemos en otro temporal e imprimámoslo estructurado
for line in json.dumps(c, indent=2).splitlines():
   print(line)
