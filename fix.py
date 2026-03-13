import json

file_path = r'c:\Users\Melissa\OneDrive\Repositorios\n8n currículo\Workflows\Cargador_Cualificaciones_Gemini V15.json'

with open(file_path, 'r', encoding='utf-8') as f:
    wf = json.load(f)

preparar_competencias_code = """const cualificacionId = $('Supabase - Insertar Cualificación').item.json.id;
const cualificacion = $('Validar y Limpiar JSON').item.json.cualificacion;

// Buscar el array de competencias bajo distintas claves posibles
const competencias =
  cualificacion.competencias_especificas ||
  cualificacion.unidades_de_competencia ||
  cualificacion.unidades_competencia ||
  cualificacion.competencias ||
  [];

if (!Array.isArray(competencias) || competencias.length === 0) return [];

return competencias.map((comp, index) => {
  // Buscar denominación bajo distintas claves posibles
  const den =
    comp.denominacion ||
    comp.nombre ||
    comp.titulo ||
    comp.competencia ||
    comp.descripcion ||
    null;

  return {
    json: {
      cualificacion_id: cualificacionId,
      codigo: comp.codigo || null,
      denominacion: den ? String(den).trim() : 'Sin denominación (extracción fallida)',
      es_transversal: comp.es_transversal === true ? true : false,
      orden_secuencia: index + 1,
      duracion_horas: (comp.duracion_horas !== null && comp.duracion_horas !== undefined) ? Number(comp.duracion_horas) : null,
      elementos: comp.elementos || [],
      resultados_aprendizaje: comp.resultados_aprendizaje || [],
      contenidos: comp.contenidos || {}
    }
  };
});"""

insertar_competencia_sql = """INSERT INTO competencias_especificas_cnc (
  cualificacion_id, 
  codigo, 
  denominacion, 
  es_transversal, 
  orden_secuencia, 
  duracion_horas
)
VALUES (
  '{{ $json.cualificacion_id }}',
  {{ $json.codigo ? "'" + String($json.codigo).replace(/'/g, "''") + "'" : "NULL" }},
  '{{ String($json.denominacion || "").replace(/'/g, "''") }}',
  {{ $json.es_transversal === true ? "true" : "false" }},
  {{ $json.orden_secuencia }},
  {{ $json.duracion_horas !== null && $json.duracion_horas !== undefined ? $json.duracion_horas : "NULL" }}
)
RETURNING id;"""

for node in wf.get('nodes', []):
    if node['name'] == 'Preparar Competencias':
        node['parameters']['jsCode'] = preparar_competencias_code
        print('[OK] Preparar Competencias actualizado.')

    if node['name'] == 'Supabase - Insertar Competencia':
        node['parameters']['operation'] = 'executeQuery'
        node['parameters']['query'] = insertar_competencia_sql
        # Remove the columns/schema/table params that are for GUI mode
        for key in ['schema', 'table', 'columns', 'options']:
            node['parameters'].pop(key, None)
        node['parameters']['options'] = {}
        print('[OK] Supabase - Insertar Competencia actualizado a executeQuery.')

with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(wf, f, indent=2, ensure_ascii=False)

print('Workflow guardado correctamente.')
