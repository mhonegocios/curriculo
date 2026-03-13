# Contrato de Integración API (React ↔ n8n)

Este documento define la estructura de datos que intercambian el Frontend (React) y el Backend (n8n). Es la única fuente de verdad para evitar errores de red o de parsing.

---

## 1. Generador de Sílabo (Educación Continua)
**Endpoint:** `/generar-silabo-microcredencial`
**Hook:** `useN8nWebhook('generar-silabo-microcredencial')`

### Payload (Enviado desde React)
```json
{
  "programa": "Nombre del programa",
  "tipo": "Microcredencial | Curso | Taller | Diplomado | Bootcamp",
  "descripcion": "Descripción general",
  "horas_totales": 48,
  "creditos": 1,
  "nivel_mnc": 3,
  "ras": [
    {
      "codigo": "RA-001",
      "descripcion": "Descripción adaptada o original"
    }
  ],
  "modalidad": "Presencial | Virtual | Blended",
  "enfoquePedagogico": "ABP | Case Study | etc",
  "perfilIngreso": "Texto libre",
  "restriccionesHardware": "Texto libre"
}
```

### Response (Esperado por React)
```json
{
  "resumen": "Resumen ejecutivo del sílabo",
  "modulos": [
    {
      "titulo": "Nombre del módulo",
      "duracion": "X horas",
      "objetivo": "Objetivo del módulo",
      "temas": ["Tema 1", "Tema 2"],
      "metodologia": "Descripción"
    }
  ],
  "bibliografia": ["Referencia 1", "Referencia 2"]
}
```

---

## 2. Generador de Evaluaciones (Educación Continua)
**Endpoint:** `/generar-evaluacion-microcredencial` (Test)
**Hook:** `useN8nWebhook('generar-evaluacion-microcredencial', true)`

### Payload (Enviado desde React)
```json
{
  "programa": {
    "nombre": "Nombre del programa",
    "tipo": "Tipo",
    "horas": 48,
    "descripcion": "Descripción"
  },
  "ras": [
    {
      "codigo": "RA-001",
      "descripcion": "Descripción del RA",
      "criterios_evaluacion": [
        {
          "codigo": "CE-001",
          "descripcion": "Descripción del criterio oficial MNC"
        }
      ]
    }
  ]
}
```

### Response (Esperado por React)
```json
{
  "evaluaciones": [
    {
      "tipo": "Actividad de Desempeño | Producto | Conocimiento",
      "titulo": "Título de la evaluación",
      "descripcion": "En qué consiste la actividad",
      "criterios_evaluados": ["CE-001", "CE-002"],
      "rubrica": [
        {
          "criterio": "Nombre del criterio",
          "niveles": {
            "excelente": "Descripción",
            "aceptable": "Descripción",
            "insuficiente": "Descripción"
          }
        }
      ]
    }
  ]
}
```

---

## 3. Sugerencia de RAs e Info Inicial (Copiloto)
**Endpoint:** `/sugerir-ras-ia` (Pendiente implementar)

### Payload
```json
{
  "prompt": "Texto del usuario describiendo lo que necesita"
}
```

### Response
```json
{
  "nombre_sugerido": "Título",
  "descripcion_sugerida": "Descripción",
  "tipo_sugerido": "Curso",
  "horas_sugeridas": 30,
  "cualificacion_codigo": "X-XXXX-XXX",
  "ras_segueridos_ids": ["uuid-1", "uuid-2"]
}
```
