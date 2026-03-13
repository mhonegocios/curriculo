import json

path = r'c:\Users\Melissa\OneDrive\Repositorios\n8n currículo\Workflows\Cargador_Cualificaciones_Gemini V15.json'
with open(path, 'r', encoding='utf-8') as f:
    wf = json.load(f)

c = wf['connections']

def check_loop(loop_node, insert_node):
    print(f"\nRevisando {loop_node} -> {insert_node}")
    main = c.get(loop_node, {}).get('main', [[], []])
    if not main: main = [[], []]
    
    # n8n loop:
    # out0 = 'done'
    # out1 = 'loop'
    
    out0 = main[0] if len(main) > 0 else []
    out1 = main[1] if len(main) > 1 else []
    
    has_insert = any(t['node'] == insert_node for t in out1)
    
    # Revisar si el insert devuelve al loop
    insert_main = c.get(insert_node, {}).get('main', [[]])
    out_insert = insert_main[0] if len(insert_main) > 0 else []
    loop_back = any(t['node'] == loop_node for t in out_insert)
    
    print(f"  {loop_node} [out1] (loop) -> {insert_node}: {has_insert}")
    print(f"  {insert_node} [out0] -> {loop_node}: {loop_back}")
    
    if not has_insert or not loop_back:
        print(f"  --> ¡NECESITAMOS CORREGIR ESTE BUCLE!")
        
        # Corregir loop -> insert en out1
        if not has_insert:
            if len(c.get(loop_node, {}).get('main', [])) < 2:
                if loop_node not in c: c[loop_node] = {'main': [[], []]}
                while len(c[loop_node]['main']) < 2: c[loop_node]['main'].append([])
            c[loop_node]['main'][1].append({"node": insert_node, "type": "main", "index": 0})
            print(f"  -> Conexión {loop_node} out1 -> {insert_node} añadida")
            
        # Corregir insert -> loop en out0
        if not loop_back:
            if insert_node not in c: c[insert_node] = {'main': [[]]}
            if len(c[insert_node]['main']) == 0: c[insert_node]['main'].append([])
            c[insert_node]['main'][0].append({"node": loop_node, "type": "main", "index": 0})
            print(f"  -> Conexión {insert_node} out0 -> {loop_node} añadida")

check_loop('Loop Contenidos', 'Supabase - Insertar Contenido')
check_loop('Loop Elementos', 'Supabase - Insertar Elemento')
check_loop('Loop criterios desempeño', 'Supabase - Insertar Criterios')
check_loop('Loop Resultados Aprendizaje', 'Supabase - Insertar Resultado Aprendizaje')
check_loop('Loop criterios evaluacion', 'Supabase - Insertar Criterios Evaluación')

with open(path, 'w', encoding='utf-8') as f:
    json.dump(wf, f, ensure_ascii=False, indent=2)

print("\nArchivo JSON guardado con los bucles corregidos.")
