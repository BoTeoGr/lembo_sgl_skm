# INFORME ADMINISTRATIVO
## SISTEMA DE GESTIÓN AGRÍCOLA LEMBO SGL

---

### PORTADA

**UNIVERSIDAD/INSTITUCIÓN EDUCATIVA**  
**PROGRAMA DE INGENIERÍA DE SISTEMAS**

**INFORME ADMINISTRATIVO**  
**SISTEMA DE GESTIÓN AGRÍCOLA LEMBO SGL**  
**Versión 2.5.0**

**Autores:**
- Kevin Acevedo - Desarrollador Full Stack
- Stephanny Cruz - Desarrolladora Frontend  
- Mateo Mosquera - Desarrollador Backend

**Fecha:** Septiembre 2025  
**Ubicación:** Colombia

---

### CONTRAPORTADA

Este documento presenta el informe administrativo completo del Sistema de Gestión Agrícola Lembo SGL, desarrollado como proyecto académico/profesional. El sistema implementa tecnologías modernas para la gestión integral de procesos agrícolas, incluyendo manejo de cultivos, sensores IoT, insumos y producción.

**Repositorio:** https://github.com/BoTeoGr/Lembo_Sgl  
**Licencia:** ISC  
**Tecnologías:** Node.js, Express, MySQL, HTML5, CSS3, JavaScript

**Contacto del equipo:**
- Repositorio GitHub: BoTeoGr/Lembo_Sgl
- Versión actual: 2.5.0

---

## TABLA DE CONTENIDO

1. [Introducción](#introducción)
2. [Objetivo General](#objetivo-general)
3. [Objetivos Específicos](#objetivos-específicos)
4. [Planteamiento del Problema](#planteamiento-del-problema)
5. [Justificación](#justificación)
6. [Impacto del Proyecto](#impacto-del-proyecto)
7. [Personas Involucradas](#personas-involucradas)
8. [Descripción General del Sistema](#descripción-general-del-sistema)
9. [Tareas Asignadas al Grupo](#tareas-asignadas-al-grupo)
10. [Cronograma de Trabajo](#cronograma-de-trabajo)
11. [Requerimientos del Sistema](#requerimientos-del-sistema)
12. [Técnicas de Recolección](#técnicas-de-recolección)
13. [Mapa de Procesos](#mapa-de-procesos)
14. [Diagramas UML](#diagramas-uml)
15. [Modelo Entidad/Relación](#modelo-entidad-relación)
16. [Mapa de Navegación](#mapa-de-navegación)

## LISTA DE DIAGRAMAS

- Diagrama 1: Arquitectura del Sistema
- Diagrama 2: Diagrama de Casos de Uso
- Diagrama 3: Diagrama de Clases
- Diagrama 4: Diagrama de Secuencia - Autenticación
- Diagrama 5: Diagrama de Actividades - Gestión de Cultivos
- Diagrama 6: Modelo Entidad-Relación
- Diagrama 7: Mapa de Navegación Web
- Diagrama 8: Mapa de Procesos de Negocio

## LISTA DE ILUSTRACIONES

- Ilustración 1: Interfaz de Login del Sistema
- Ilustración 2: Dashboard Principal
- Ilustración 3: Módulo de Gestión de Cultivos
- Ilustración 4: Módulo de Sensores IoT
- Ilustración 5: Módulo de Producción
- Ilustración 6: Reportes y Analytics

## LISTA DE TABLAS

- Tabla 1: Roles y Permisos de Usuario
- Tabla 2: Cronograma de Desarrollo
- Tabla 3: Requerimientos Funcionales
- Tabla 4: Requerimientos No Funcionales
- Tabla 5: Tecnologías Utilizadas
- Tabla 6: Estructura de Base de Datos
- Tabla 7: APIs y Endpoints
- Tabla 8: Casos de Prueba

---

## INTRODUCCIÓN

El Sistema de Gestión Agrícola Lembo SGL representa una solución tecnológica integral diseñada para optimizar y modernizar los procesos de gestión en el sector agrícola. Este sistema web combina tecnologías modernas de desarrollo con conceptos especializados del dominio agrícola, proporcionando una plataforma robusta para el manejo de cultivos, sensores IoT, insumos y producción agrícola.

El proyecto surge de la necesidad de digitalizar y automatizar procesos tradicionalmente manuales en la agricultura, permitiendo un control más preciso, trazabilidad completa y toma de decisiones basada en datos. El sistema está desarrollado utilizando tecnologías web estándar como Node.js, Express.js, MySQL y JavaScript, garantizando escalabilidad, mantenibilidad y facilidad de despliegue.

La plataforma está diseñada para servir a diferentes tipos de usuarios, desde administradores del sistema hasta personal de apoyo y visitantes, cada uno con permisos y funcionalidades específicas según su rol en la organización agrícola.

## OBJETIVO GENERAL

Desarrollar e implementar un sistema web integral de gestión agrícola que permita la administración eficiente de cultivos, sensores IoT, insumos y procesos de producción, facilitando la toma de decisiones basada en datos y mejorando la productividad del sector agrícola mediante la digitalización de procesos.

## OBJETIVOS ESPECÍFICOS

1. **Diseñar una arquitectura de software escalable** que soporte el crecimiento futuro del sistema y permita la integración de nuevas funcionalidades.

2. **Implementar un sistema de autenticación y autorización robusto** que garantice la seguridad de la información y controle el acceso según roles de usuario.

3. **Desarrollar módulos especializados** para la gestión de:
   - Usuarios y roles del sistema
   - Sensores IoT y monitoreo en tiempo real
   - Inventario de insumos agrícolas
   - Cultivos y sus características
   - Ciclos de cultivo y planificación
   - Producciones y seguimiento de resultados

4. **Crear una base de datos normalizada** que garantice la integridad, consistencia y eficiencia en el almacenamiento de información agrícola.

5. **Implementar interfaces de usuario intuitivas** que faciliten la adopción del sistema por parte de usuarios con diferentes niveles de experiencia tecnológica.

6. **Establecer un sistema de trazabilidad completa** desde la siembra hasta la cosecha, permitiendo el seguimiento detallado de todos los procesos.

7. **Desarrollar funcionalidades de reportes y análisis** que apoyen la toma de decisiones estratégicas en la gestión agrícola.

## PLANTEAMIENTO DEL PROBLEMA

El sector agrícola tradicional enfrenta múltiples desafíos en la gestión eficiente de sus procesos:

### Problemática Identificada:

1. **Gestión Manual de Procesos:** La mayoría de las operaciones agrícolas se registran de forma manual en documentos físicos, lo que genera:
   - Pérdida de información crítica
   - Dificultad para realizar seguimientos históricos
   - Errores en el registro de datos
   - Tiempo excesivo en tareas administrativas

2. **Falta de Trazabilidad:** La ausencia de sistemas digitalizados impide:
   - Rastrear el origen y destino de los productos
   - Cumplir con normativas de calidad y seguridad alimentaria
   - Identificar rápidamente problemas en la cadena productiva

3. **Ineficiencia en el Uso de Recursos:** Sin herramientas de análisis, se presenta:
   - Uso inadecuado de insumos agrícolas
   - Desperdicio de recursos hídricos y energéticos
   - Planificación deficiente de ciclos de cultivo

4. **Limitaciones en el Monitoreo:** La falta de sistemas de sensores integrados resulta en:
   - Detección tardía de problemas en cultivos
   - Pérdidas por condiciones ambientales adversas
   - Toma de decisiones reactiva en lugar de preventiva

5. **Dificultades en la Gestión de Personal:** La ausencia de sistemas de roles y permisos genera:
   - Acceso no controlado a información sensible
   - Falta de accountability en las operaciones
   - Dificultades en la coordinación de equipos

### Impacto del Problema:

- **Económico:** Pérdidas financieras por ineficiencias operativas
- **Productivo:** Reducción en la calidad y cantidad de producción
- **Competitivo:** Desventaja frente a empresas tecnificadas
- **Ambiental:** Uso inadecuado de recursos naturales

## JUSTIFICACIÓN

### Justificación Técnica:

La implementación del Sistema de Gestión Agrícola Lembo SGL se justifica técnicamente por:

1. **Modernización Tecnológica:** El sector agrícola requiere adoptar tecnologías de la información para mantenerse competitivo en un mercado globalizado.

2. **Escalabilidad:** El sistema está diseñado con arquitectura modular que permite crecimiento y adaptación a diferentes tamaños de operación agrícola.

3. **Integración IoT:** La capacidad de integrar sensores IoT proporciona datos en tiempo real para optimizar procesos productivos.

4. **Estándares de Desarrollo:** Utilización de tecnologías probadas y estándares de la industria garantiza confiabilidad y mantenibilidad.

### Justificación Económica:

1. **Reducción de Costos Operativos:** Automatización de procesos administrativos reduce tiempo y recursos humanos.

2. **Optimización de Recursos:** Mejor gestión de insumos reduce desperdicios y costos de producción.

3. **Incremento en Productividad:** Datos precisos permiten tomar decisiones que aumentan el rendimiento de cultivos.

4. **ROI Medible:** El sistema proporciona métricas claras para evaluar el retorno de inversión.

### Justificación Social:

1. **Seguridad Alimentaria:** Mejor trazabilidad garantiza productos más seguros para el consumo.

2. **Sostenibilidad:** Uso eficiente de recursos contribuye a prácticas agrícolas sostenibles.

3. **Generación de Empleo:** La tecnificación crea nuevas oportunidades laborales especializadas.

4. **Transferencia de Conocimiento:** El sistema facilita la capacitación y transferencia de mejores prácticas.

## IMPACTO DEL PROYECTO

### Impacto Tecnológico:

1. **Digitalización del Sector:** Contribuye a la transformación digital de la agricultura tradicional.

2. **Innovación en IoT Agrícola:** Implementación práctica de sensores para monitoreo agrícola.

3. **Desarrollo de Competencias:** Fortalecimiento de habilidades tecnológicas en el equipo de desarrollo.

4. **Referente Tecnológico:** El proyecto puede servir como base para desarrollos similares en el sector.

### Impacto Económico:

1. **Ahorro en Costos Operativos:** Estimado del 15-25% en reducción de costos administrativos.

2. **Incremento en Productividad:** Potencial aumento del 10-20% en eficiencia productiva.

3. **Optimización de Inventarios:** Reducción del 30% en desperdicios de insumos.

4. **Valor Agregado:** Productos con trazabilidad completa tienen mayor valor de mercado.

### Impacto Ambiental:

1. **Uso Eficiente de Recursos:** Reducción en el consumo de agua y fertilizantes.

2. **Agricultura de Precisión:** Aplicación exacta de insumos reduce impacto ambiental.

3. **Monitoreo Ambiental:** Sensores permiten detectar y prevenir problemas ambientales.

4. **Sostenibilidad:** Promoción de prácticas agrícolas sostenibles.

### Impacto Social:

1. **Mejora en Calidad de Vida:** Reducción de trabajo manual repetitivo.

2. **Capacitación Tecnológica:** Desarrollo de competencias digitales en usuarios.

3. **Seguridad Alimentaria:** Mayor control en la calidad de alimentos producidos.

4. **Inclusión Digital:** Acerca la tecnología a sectores tradicionalmente excluidos.

## PERSONAS INVOLUCRADAS

### Equipo de Desarrollo:

| Nombre | Cargo | Función en el Proyecto | Responsabilidades |
|--------|-------|----------------------|-------------------|
| **Kevin Acevedo** | Desarrollador Full Stack | Líder Técnico y Desarrollador Principal | - Arquitectura general del sistema<br>- Desarrollo backend y frontend<br>- Integración de componentes<br>- Supervisión técnica general |
| **Stephanny Cruz** | Desarrolladora Frontend | Especialista en Interfaz de Usuario | - Diseño de interfaces de usuario<br>- Implementación de componentes frontend<br>- Experiencia de usuario (UX/UI)<br>- Validaciones del lado cliente |
| **Mateo Mosquera** | Desarrollador Backend | Especialista en Servidor y Base de Datos | - Desarrollo de APIs REST<br>- Diseño y administración de base de datos<br>- Implementación de autenticación<br>- Optimización de consultas |

### Roles Adicionales (Potenciales):

| Rol | Función | Responsabilidades |
|-----|---------|-------------------|
| **Product Owner** | Definición de Requerimientos | - Especificación de funcionalidades<br>- Validación de entregables<br>- Comunicación con stakeholders |
| **Tester/QA** | Aseguramiento de Calidad | - Pruebas funcionales<br>- Pruebas de integración<br>- Documentación de bugs |
| **DevOps Engineer** | Infraestructura y Despliegue | - Configuración de servidores<br>- Automatización de despliegues<br>- Monitoreo de aplicación |

### Stakeholders del Proyecto:

1. **Usuarios Finales:**
   - Administradores agrícolas
   - Personal técnico
   - Operadores de campo
   - Personal de apoyo

2. **Beneficiarios Indirectos:**
   - Productores agrícolas
   - Consumidores finales
   - Instituciones educativas
   - Sector agrícola en general

## DESCRIPCIÓN GENERAL DEL SISTEMA

### Visión General:

El Sistema de Gestión Agrícola Lembo SGL es una aplicación web completa diseñada para digitalizar y optimizar los procesos de gestión en el sector agrícola. El sistema integra múltiples módulos especializados que trabajan de manera coordinada para proporcionar una solución integral.

### Arquitectura del Sistema:

**Arquitectura de 3 Capas:**

1. **Capa de Presentación (Frontend):**
   - Tecnología: HTML5, CSS3, JavaScript (Vanilla)
   - Responsabilidades: Interfaz de usuario, validaciones cliente, experiencia de usuario
   - Características: Responsive design, interfaces intuitivas, compatibilidad cross-browser

2. **Capa de Lógica de Negocio (Backend):**
   - Tecnología: Node.js con Express.js
   - Responsabilidades: Lógica de negocio, APIs REST, autenticación, autorización
   - Características: Middleware de seguridad, manejo de errores, validaciones servidor

3. **Capa de Datos:**
   - Tecnología: MySQL 8.0+
   - Responsabilidades: Almacenamiento persistente, integridad referencial, consultas optimizadas
   - Características: Base de datos normalizada, índices optimizados, respaldos automáticos

### Módulos del Sistema:

#### 1. Módulo de Gestión de Usuarios
- **Funcionalidad:** Administración completa de usuarios del sistema
- **Características:**
  - Registro y autenticación de usuarios
  - Gestión de roles y permisos (Super administrador, Administrador, Personal de Apoyo, Visitante)
  - Perfil de usuario personalizable
  - Control de sesiones y seguridad

#### 2. Módulo de Sensores IoT
- **Funcionalidad:** Gestión y monitoreo de sensores agrícolas
- **Características:**
  - Registro de diferentes tipos de sensores (contacto, distancia, luz)
  - Configuración de parámetros de medición
  - Monitoreo en tiempo real
  - Alertas y notificaciones automáticas

#### 3. Módulo de Gestión de Insumos
- **Funcionalidad:** Control de inventario de insumos agrícolas
- **Características:**
  - Catálogo completo de insumos
  - Control de stock y movimientos
  - Cálculo automático de valores
  - Alertas de stock mínimo

#### 4. Módulo de Cultivos
- **Funcionalidad:** Administración de cultivos y sus características
- **Características:**
  - Registro de diferentes tipos de cultivos
  - Información detallada de cada cultivo
  - Asociación con ubicaciones específicas
  - Seguimiento de estados y condiciones

#### 5. Módulo de Ciclos de Cultivo
- **Funcionalidad:** Planificación y seguimiento de ciclos productivos
- **Características:**
  - Definición de períodos de cultivo
  - Planificación de actividades
  - Seguimiento de progreso
  - Registro de novedades y observaciones

#### 6. Módulo de Producción
- **Funcionalidad:** Gestión integral de procesos productivos
- **Características:**
  - Planificación de producciones
  - Seguimiento de inversiones y ganancias
  - Asociación con cultivos y ciclos
  - Control de uso de insumos y sensores

### Características Técnicas:

#### Seguridad:
- Autenticación basada en JWT (JSON Web Tokens)
- Encriptación de contraseñas con bcrypt
- Validación de datos en cliente y servidor
- Control de acceso basado en roles
- Protección contra ataques comunes (SQL Injection, XSS)

#### Performance:
- Consultas optimizadas con índices de base de datos
- Lazy loading de componentes
- Compresión de respuestas HTTP
- Cache de consultas frecuentes

#### Escalabilidad:
- Arquitectura modular y desacoplada
- APIs RESTful bien definidas
- Base de datos normalizada
- Posibilidad de microservicios futuros

#### Usabilidad:
- Interfaz responsive para diferentes dispositivos
- Navegación intuitiva y consistente
- Feedback visual para acciones de usuario
- Manejo de errores amigable

### Flujo de Datos:

1. **Entrada de Datos:**
   - Formularios web para entrada manual
   - APIs para integración con sensores IoT
   - Importación de datos desde archivos

2. **Procesamiento:**
   - Validación y sanitización de datos
   - Aplicación de lógica de negocio
   - Cálculos automáticos y derivados

3. **Almacenamiento:**
   - Persistencia en base de datos MySQL
   - Mantenimiento de integridad referencial
   - Respaldos automáticos programados

4. **Salida de Datos:**
   - Interfaces web para visualización
   - APIs para integración externa
   - Reportes y exportaciones

### Integración y Extensibilidad:

El sistema está diseñado para permitir futuras integraciones con:
- Sistemas ERP agrícolas
- Plataformas de comercio electrónico
- Servicios meteorológicos
- Sistemas de geolocalización (GPS)
- Plataformas de análisis de datos (Business Intelligence)

---

*Continúa en la siguiente sección...*