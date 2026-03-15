## Plan de Pruebas

### Control de documento
- **Proyecto**: [Nombre del proyecto]
- **Versión del plan**: v0.1 (borrador)
- **Fecha**: [AAAA-MM-DD]
- **Autor**: [Nombre / Rol]
- **Aprobadores**: [Product Owner], [QA Lead], [Tech Lead]

### 1. Introducción
Este documento define el enfoque, alcance, criterios, responsabilidades y calendario para la verificación y validación del sistema. Sirve como guía única para planificar, ejecutar y reportar las actividades de pruebas.

### 2. Alcance
- **En alcance**: [Módulos/Servicios/Plataformas]
- **Fuera de alcance**: [Lo que explícitamente no se probará]

### 3. Objetivos
- Validar que las funcionalidades cumplan los requisitos funcionales y no funcionales.
- Detectar defectos de forma temprana y reducir riesgo en producción.
- Proveer métricas objetivas del estado de calidad.

### 4. Referencias
- Requisitos: [enlace/ubicación]
- Diseño/Arquitectura: [enlace/ubicación]
- Guías de desarrollo/QA: [enlace]

### 5. Elementos a probar (Test Items)
- Aplicaciones/Servicios: [lista]
- APIs/Endpoints: [lista]
- Jobs/Procesos: [lista]

### 6. Funcionalidades a probar
- [Epics/Historias/Características]
- Reglas de negocio clave
- Flujo E2E crítico: [describir]

### 7. Funcionalidades que NO se probarán
- [Lista y justificación]

### 8. Enfoque y estrategia de pruebas
- **Pruebas unitarias**: responsabilidad de desarrollo, cobertura objetivo ≥ [80% líneas], ejecutadas en CI.
- **Pruebas de integración**: componentes y contratos entre módulos/servicios; usar dobles de prueba donde aplique.
- **Pruebas de API/contratos**: validación de esquemas, estados y timeouts; mock de dependencias externas.
- **Pruebas de sistema/funcionales**: validación end-to-end de flujos críticos en entorno de staging.
- **Pruebas de regresión**: suite priorizada por riesgo y uso; ejecutar en cada release.
- **Pruebas UAT**: con negocio/usuarios clave; criterios de aceptación por historia.
- **No funcionales**:
  - Rendimiento: tiempos p95/p99, throughput, consumo de recursos.
  - Carga/estrés: degradación controlada y estabilidad bajo picos.
  - Seguridad: OWASP Top 10, control de acceso, dependencia SCA/DAST.
  - Compatibilidad: navegadores/SO/dispositivos soportados.
  - Usabilidad/Accesibilidad: WCAG 2.1 AA para frontend.
  - Resiliencia: reintentos, timeouts, fallos de red, recuperación.

### 9. Criterios de entrada (Entry)
- Requisitos priorizados y refinados.
- Diseño técnico base disponible.
- Entorno de pruebas preparado y estable.
- Datos de prueba listos o generables.
- Pipelines de CI configurados.

### 10. Criterios de salida (Exit)
- 100% de casos críticos ejecutados; ≥ [95%] aprobados.
- Defectos severidad Bloqueante/Alta: 0 abiertos o con mitigación aceptada.
- Cobertura unitaria ≥ [80%] y estabilidad de suites.
- Riesgos residuales aceptados por stakeholders.

### 11. Criterios de suspensión y reanudación
- Suspender si: entorno inestable, tasa de fallos por ambiente > [X%], build roto.
- Reanudar cuando: se restablezcan servicios/ambiente y se corrijan causas raíz.

### 12. Entregables de pruebas
- Plan de pruebas (este documento)
- Casos de prueba y datos
- Evidencias de ejecución (logs, capturas, videos)
- Reportes de ciclo/sprint y de release
- Informe final de calidad (QA sign-off)

### 13. Ambiente de pruebas
- **Entornos**: DEV, QA/STG, PRE, PROD.
- **Infraestructura**: [nube/on-prem], regiones, tamaños.
- **Configuraciones**: variables, secretos, flags.
- **Observabilidad**: logs, métricas, trazas, dashboards.

### 14. Datos de prueba
- Estrategia: anonimización/sintéticos/híbridos.
- Conjuntos: datos felices, bordes, negativos, volúmenes.
- Gestión: generación, refresco, limpieza post-ejecución.

### 15. Herramientas
- Gestión de pruebas: [Jira/Xray, TestRail, Zephyr, etc.]
- Automatización UI: [Playwright/Cypress]
- Automatización API: [Postman/Newman, REST Assured]
- Unitaria/Integración: [JUnit/Jest/PyTest/etc.]
- Performance: [k6/Gatling/JMeter]
- Seguridad: [OWASP ZAP, Snyk, Trivy]
- CI/CD: [GitHub Actions/GitLab CI/etc.]

### 16. Organización y responsabilidades
- **QA Lead**: estrategia, métricas, coordinación.
- **QA Engineers**: diseño y ejecución de casos, automatización.
- **Developers**: pruebas unitarias/integración, fixes, soporte.
- **PO/Negocio**: UAT, priorización de defectos.
- **DevOps/SRE**: ambientes, pipelines, observabilidad.

### 17. Planificación y cronograma
- Hitos: inicio QA, freeze, UAT, sign-off, release.
- Cadencia: por sprint [semanal/quincenal].
- Buffer de regresión: [X] días.

### 18. Gestión de defectos
- Registro en: [herramienta]
- Campos mínimos: título, pasos, resultado esperado/obtenido, severidad, prioridad, adjuntos.
- Flujo: Nuevo → En análisis → En corrección → En verificación → Cerrado/Rechazado.
- SLAs: Alta [24h], Media [3d], Baja [5d] para primera respuesta.

### 19. Métricas y seguimiento
- Cobertura unitaria/integración [%].
- Tasa de aprobación por suite/área.
- Defectos por severidad y por sprint.
- Detección temprana (shift-left) y fuga a producción.
- MTTR de defectos.
- Tendencias de performance (p95, error rate).

### 20. Riesgos y mitigaciones
| Riesgo | Impacto | Prob. | Mitigación |
|---|---|---|---|
| Ambientes inestables | Alto | Media | Monitoreo, rollback, entornos efímeros |
| Dependencias externas | Alto | Media | Mocks, pruebas de contrato |
| Datos sensibles | Alto | Baja | Anonimización, controles de acceso |
| Ventanas cortas de test | Medio | Alta | Priorización por riesgo, smoke/regresión priorizada |

### 21. Trazabilidad
- Matriz Requisito ↔ Caso(s) ↔ Evidencia ↔ Defecto(s) asociado(s).
- Mantener actualizada en [herramienta] o como tabla adjunta.

### 22. Plantilla de caso de prueba (ejemplo)
| Campo | Contenido |
|---|---|
| ID | TC-LOGIN-001 |
| Título | Autenticación exitosa con credenciales válidas |
| Requisito | REQ-AUTH-01 |
| Prioridad | Alta |
| Precondiciones | Usuario existente, servicio de auth disponible |
| Datos de prueba | user: demo@example.com, pass: **** |
| Pasos | 1) Abrir login 2) Ingresar credenciales 3) Enviar |
| Resultado esperado | Redirige al dashboard; token válido en almacenamiento |
| Resultado obtenido | [llenar] |
| Evidencia | [capturas/logs] |
| Estado | Aprobado/Rechazado |

### 23. Procedimiento de ejecución
- Orden sugerido: smoke → funcional → regresión → no funcionales → UAT.
- Criterios de reintento y aislamiento de fallos.
- Registro de evidencia automatizado cuando sea posible.

### 24. Reportes y comunicación
- Reporte diario de avance: ejecutados/aprobados/rechazados/bloqueados.
- Tablero de calidad con métricas clave.
- Informe de release con riesgos residuales y recomendación de GO/NO-GO.

### 25. Aprobaciones
- QA Lead: [nombre, fecha]
- Tech Lead: [nombre, fecha]
- Product Owner: [nombre, fecha]

