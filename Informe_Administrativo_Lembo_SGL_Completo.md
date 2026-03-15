# INFORME ADMINISTRATIVO - SISTEMA DE GESTIÓN AGRÍCOLA LEMBO SGL

## MAPA DE PROCESOS Y FICHA DE PROCESOS

### Mapa de Procesos del Sistema

El Sistema de Gestión Agrícola Lembo SGL se estructura en tres niveles de procesos:

#### 1. PROCESOS ESTRATÉGICOS
- **Planificación Agrícola:** Definición de estrategias de cultivo y producción
- **Gestión de Calidad:** Aseguramiento de estándares de calidad en procesos
- **Análisis y Mejora Continua:** Evaluación de métricas y optimización de procesos

#### 2. PROCESOS OPERATIVOS (CORE)
- **Gestión de Cultivos:** Administración integral de cultivos
- **Gestión de Producción:** Control de procesos productivos
- **Monitoreo IoT:** Supervisión mediante sensores
- **Gestión de Insumos:** Control de inventario y recursos

#### 3. PROCESOS DE APOYO
- **Gestión de Usuarios:** Administración de accesos y roles
- **Seguridad del Sistema:** Protección de datos e información
- **Mantenimiento Técnico:** Soporte y actualizaciones del sistema

### Fichas de Procesos Detalladas

#### FICHA DE PROCESO 001: GESTIÓN DE USUARIOS

| **Campo** | **Descripción** |
|-----------|-----------------|
| **Nombre del Proceso** | Gestión de Usuarios |
| **Código** | GP-001 |
| **Versión** | 1.0 |
| **Propósito** | Administrar usuarios del sistema, roles y permisos de acceso |
| **Alcance** | Desde el registro de nuevos usuarios hasta la gestión de permisos |
| **Responsable del Proceso** | Administrador del Sistema |
| **Entradas** | - Solicitud de registro<br>- Datos de usuario<br>- Definición de rol |
| **Salidas** | - Usuario registrado<br>- Credenciales de acceso<br>- Permisos asignados |
| **Actividades Principales** | 1. Validar datos de registro<br>2. Crear cuenta de usuario<br>3. Asignar rol y permisos<br>4. Enviar credenciales<br>5. Activar cuenta |
| **Recursos Necesarios** | - Base de datos de usuarios<br>- Sistema de encriptación<br>- Servicio de email |
| **Indicadores** | - Tiempo de registro: < 5 minutos<br>- Tasa de activación: > 95%<br>- Errores de autenticación: < 2% |
| **Riesgos** | - Acceso no autorizado<br>- Pérdida de credenciales<br>- Fallos de autenticación |
| **Controles** | - Validación de datos<br>- Encriptación de contraseñas<br>- Logs de auditoría |

#### FICHA DE PROCESO 002: GESTIÓN DE CULTIVOS

| **Campo** | **Descripción** |
|-----------|-----------------|
| **Nombre del Proceso** | Gestión de Cultivos |
| **Código** | GC-002 |
| **Versión** | 1.0 |
| **Propósito** | Administrar información de cultivos, características y ubicaciones |
| **Alcance** | Desde el registro de cultivos hasta su seguimiento completo |
| **Responsable del Proceso** | Personal de Apoyo/Administrador |
| **Entradas** | - Datos del cultivo<br>- Ubicación<br>- Características específicas |
| **Salidas** | - Cultivo registrado<br>- Ficha técnica<br>- Asociaciones establecidas |
| **Actividades Principales** | 1. Registrar datos básicos<br>2. Definir características<br>3. Asignar ubicación<br>4. Establecer parámetros<br>5. Activar seguimiento |
| **Recursos Necesarios** | - Base de datos de cultivos<br>- Catálogo de tipos<br>- Sistema de geolocalización |
| **Indicadores** | - Cultivos registrados/mes<br>- Precisión de datos: > 98%<br>- Tiempo de registro: < 10 min |
| **Riesgos** | - Datos incompletos<br>- Ubicaciones incorrectas<br>- Duplicación de registros |
| **Controles** | - Validación obligatoria<br>- Verificación de ubicación<br>- Control de duplicados |

## DIAGRAMAS UML

### 1. Diagrama de Casos de Uso del Sistema

```
Sistema de Gestión Agrícola Lembo SGL

Actores:
- Super Administrador: Acceso completo al sistema
- Administrador: Gestión operativa completa
- Personal de Apoyo: Operaciones diarias
- Visitante: Solo consulta
- Sistema IoT: Envío automático de datos

Casos de Uso Principales:
1. Gestionar Usuarios (Super Admin)
2. Autenticar Usuario (Todos)
3. Gestionar Cultivos (Admin, Personal)
4. Monitorear Sensores (Admin, Personal, IoT)
5. Gestionar Insumos (Admin, Personal)
6. Planificar Producción (Admin)
7. Generar Reportes (Admin, Super Admin)
```

### 2. Diagrama de Clases Principal

```
Clases Principales del Sistema:

Usuario:
- Atributos: id, documento, nombre, email, rol, estado
- Métodos: autenticar(), cambiarPassword(), actualizarPerfil()

Sensor:
- Atributos: id, tipo, nombre, unidadMedida, estado
- Métodos: configurar(), obtenerDatos(), calibrar()

Cultivo:
- Atributos: id, nombre, tipo, ubicacion, tamano
- Métodos: registrar(), actualizar(), obtenerInfo()

Produccion:
- Atributos: id, nombre, inversion, metaGanancia, fechas
- Métodos: calcularROI(), actualizarProgreso(), finalizar()

Relaciones:
- Usuario gestiona múltiples Sensores, Cultivos, Producciones
- Produccion utiliza múltiples Insumos (many-to-many)
- Produccion es monitoreada por múltiples Sensores (many-to-many)
```

## MODELO ENTIDAD/RELACIÓN

### Estructura de Base de Datos

#### Entidades Principales:

**usuarios**
- id (PK), tipo_documento, numero_documento (UK)
- nombre, telefono, correo (UK), password
- rol (enum), estado (enum), fecha_creacion

**sensores**
- id (PK), tipo_sensor (enum), nombre_sensor
- unidad_medida (enum), descripcion, tiempo_escaneo (enum)
- usuario_id (FK), estado (enum), fecha_creacion

**insumos**
- id (PK), nombre, tipo, unidad_medida (enum)
- valor_unitario, cantidad, valor_total, descripcion
- usuario_id (FK), estado (enum), fecha_creacion

**cultivos**
- id (PK), nombre, tipo, ubicacion, tamano
- descripcion, usuario_id (FK), estado (enum), fecha_creacion

**ciclo_cultivo**
- id (PK), nombre, descripcion, periodo_inicio, periodo_final
- novedades, usuario_id (FK), estado (enum), fecha_creacion

**producciones**
- id (PK), nombre, tipo, ubicacion, cantidad
- cultivo_id (FK), ciclo_id (FK), usuario_id (FK)
- fecha_inicio, fecha_fin, inversion, meta_ganancia
- estado (enum), fecha_creacion

**Tablas de Relación:**
- uso_insumo: produccion_id (FK), insumo_id (FK), cantidad_utilizada
- uso_sensor: produccion_id (FK), sensor_id (FK)

#### Relaciones Clave:
1. Usuario → Sensores, Insumos, Cultivos, Ciclos, Producciones (1:N)
2. Cultivo → Producciones (1:N)
3. Ciclo → Producciones (1:N)
4. Producción ↔ Insumos (N:M via uso_insumo)
5. Producción ↔ Sensores (N:M via uso_sensor)

## MAPA DE NAVEGACIÓN

### Estructura de Navegación Principal

```
HOME (Dashboard)
├── GESTIÓN DE USUARIOS
│   ├── Listar Usuarios
│   ├── Crear Usuario
│   ├── Editar Usuario
│   └── Perfil de Usuario
├── GESTIÓN DE SENSORES
│   ├── Listar Sensores
│   ├── Registrar Sensor
│   ├── Configurar Sensor
│   └── Monitoreo en Tiempo Real
├── GESTIÓN DE INSUMOS
│   ├── Inventario de Insumos
│   ├── Registrar Insumo
│   ├── Actualizar Stock
│   └── Reportes de Inventario
├── GESTIÓN DE CULTIVOS
│   ├── Catálogo de Cultivos
│   ├── Registrar Cultivo
│   ├── Actualizar Cultivo
│   └── Información Detallada
├── CICLOS DE CULTIVO
│   ├── Planificación de Ciclos
│   ├── Crear Ciclo
│   ├── Seguimiento de Ciclos
│   └── Historial de Ciclos
├── GESTIÓN DE PRODUCCIÓN
│   ├── Dashboard de Producción
│   ├── Nueva Producción
│   ├── Seguimiento de Producciones
│   ├── Análisis de ROI
│   └── Reportes de Producción
├── REPORTES Y ANALYTICS
│   ├── Dashboard Ejecutivo
│   ├── Reportes Operativos
│   ├── Análisis de Tendencias
│   └── Exportar Datos
└── CONFIGURACIÓN
    ├── Configuración del Sistema
    ├── Respaldos
    ├── Logs del Sistema
    └── Ayuda y Soporte
```

### Flujos de Navegación por Rol

#### Super Administrador - Acceso Completo
```
Login → Dashboard → [Todos los módulos disponibles]
- Gestión completa de usuarios y sistema
- Acceso a configuración avanzada
- Todos los reportes y analytics
```

#### Administrador - Gestión Operativa
```
Login → Dashboard → [Gestión operativa completa]
- Sensores, Insumos, Cultivos, Producción
- Reportes operativos
- Configuración básica
```

#### Personal de Apoyo - Operación Diaria
```
Login → Dashboard → [Operaciones específicas]
- Consulta y actualización de datos
- Monitoreo de sensores
- Registro de actividades diarias
```

#### Visitante - Solo Consulta
```
Login → Dashboard → [Solo visualización]
- Consulta de información general
- Reportes básicos
- Sin capacidad de modificación
```

## ARQUITECTURA TÉCNICA DEL SISTEMA

### Stack Tecnológico Utilizado

#### Backend:
- **Node.js 16+**: Entorno de ejecución JavaScript
- **Express.js 4.21+**: Framework web minimalista
- **MySQL 8.0+**: Sistema de gestión de base de datos
- **JWT**: Autenticación basada en tokens
- **bcrypt**: Encriptación de contraseñas
- **CORS**: Control de acceso entre dominios

#### Frontend:
- **HTML5**: Estructura semántica de páginas
- **CSS3**: Estilos y responsive design
- **JavaScript (Vanilla)**: Lógica del lado cliente
- **Fetch API**: Comunicación con backend

#### Herramientas de Desarrollo:
- **nodemon**: Auto-restart del servidor en desarrollo
- **Git**: Control de versiones
- **GitHub**: Repositorio remoto y colaboración

### Arquitectura de 3 Capas

#### Capa de Presentación (Frontend):
- Interfaces de usuario responsivas
- Validaciones del lado cliente
- Comunicación asíncrona con backend
- Manejo de estados de aplicación

#### Capa de Lógica de Negocio (Backend):
- APIs RESTful bien definidas
- Middleware de autenticación y autorización
- Validaciones del lado servidor
- Lógica de negocio centralizada

#### Capa de Datos:
- Base de datos MySQL normalizada
- Integridad referencial garantizada
- Índices optimizados para consultas
- Respaldos y recuperación de datos

### Seguridad Implementada

#### Autenticación:
- JWT tokens con tiempo de expiración
- Encriptación de contraseñas con bcrypt
- Validación de credenciales robusta

#### Autorización:
- Control de acceso basado en roles (RBAC)
- Middleware de autorización en rutas protegidas
- Validación de permisos por funcionalidad

#### Protección de Datos:
- Validación y sanitización de inputs
- Protección contra SQL Injection
- Headers de seguridad HTTP
- Logs de auditoría para acciones críticas

## CONCLUSIONES Y RECOMENDACIONES

### Logros Alcanzados

1. **Sistema Integral Desarrollado**: Se ha completado exitosamente el desarrollo del Sistema de Gestión Agrícola Lembo SGL con todas las funcionalidades planificadas.

2. **Arquitectura Robusta**: La implementación de una arquitectura de 3 capas garantiza escalabilidad, mantenibilidad y separación clara de responsabilidades.

3. **Seguridad Implementada**: El sistema cuenta con medidas de seguridad robustas incluyendo autenticación JWT, control de acceso basado en roles y protección contra vulnerabilidades comunes.

4. **Base de Datos Optimizada**: Se ha diseñado e implementado una base de datos normalizada que garantiza integridad de datos y eficiencia en consultas.

5. **Funcionalidad Completa**: Todos los módulos principales están implementados y funcionando: usuarios, sensores, insumos, cultivos, ciclos de cultivo y producción.

### Impacto Esperado

#### Operativo:
- **Reducción del 25%** en tiempo de gestión administrativa
- **Mejora del 30%** en control de inventario de insumos
- **Incremento del 20%** en eficiencia de planificación de cultivos

#### Tecnológico:
- Digitalización completa de procesos agrícolas
- Integración de tecnología IoT para monitoreo
- Plataforma base para futuras expansiones

#### Económico:
- Optimización de recursos y reducción de desperdicios
- Mejor toma de decisiones basada en datos
- Incremento potencial del ROI en producciones

### Recomendaciones para Futuras Mejoras

#### Corto Plazo (3-6 meses):
1. **Implementar notificaciones push** para alertas críticas
2. **Desarrollar dashboard móvil** para acceso desde campo
3. **Agregar más tipos de sensores** IoT especializados
4. **Implementar backup automático** de base de datos

#### Mediano Plazo (6-12 meses):
1. **Integración con APIs meteorológicas** para predicciones
2. **Implementar análisis predictivo** con machine learning
3. **Desarrollar aplicación móvil nativa** (iOS/Android)
4. **Agregar módulo de contabilidad** agrícola

#### Largo Plazo (1-2 años):
1. **Implementar blockchain** para trazabilidad alimentaria
2. **Integración con drones** para monitoreo aéreo
3. **Desarrollo de marketplace** integrado
4. **Implementar IA** para recomendaciones automáticas

### Lecciones Aprendidas

#### Técnicas:
- La importancia de una planificación detallada antes del desarrollo
- El valor de las metodologías ágiles para adaptarse a cambios
- La necesidad de testing continuo durante el desarrollo

#### De Negocio:
- La importancia de entender profundamente el dominio agrícola
- El valor de involucrar a usuarios finales en el proceso de desarrollo
- La necesidad de considerar diferentes niveles de alfabetización tecnológica

#### De Equipo:
- La comunicación constante es clave para el éxito del proyecto
- La especialización por capas mejoró la eficiencia del desarrollo
- La documentación continua facilita el mantenimiento futuro

### Sostenibilidad del Proyecto

#### Técnica:
- Código bien documentado y estructurado
- Arquitectura modular que facilita mantenimiento
- Uso de tecnologías estándar y ampliamente soportadas

#### Económica:
- Costos de mantenimiento reducidos por simplicidad técnica
- Potencial de comercialización del producto
- Escalabilidad que permite crecimiento sin reescritura

#### Social:
- Contribución a la modernización del sector agrícola
- Potencial impacto en seguridad alimentaria
- Creación de oportunidades de capacitación tecnológica

---

## ANEXOS

### Anexo A: Configuración del Entorno de Desarrollo

#### Requisitos del Sistema:
- Node.js versión 16 o superior
- MySQL 8.0 o superior
- Git para control de versiones
- Editor de código (recomendado: VS Code)

#### Instalación:
```bash
# Clonar repositorio
git clone https://github.com/BoTeoGr/Lembo_Sgl.git

# Instalar dependencias
cd Lembo_Sgl
npm install

# Configurar base de datos
mysql -u root -p < backend/db/sistema_gestion_agricola.sql

# Configurar variables de entorno
cp .env.example .env
# Editar .env con configuración local

# Ejecutar en modo desarrollo
npm run dev
```

### Anexo B: APIs Disponibles

#### Endpoints Principales:

**Autenticación:**
- POST `/auth/login` - Iniciar sesión
- POST `/auth/logout` - Cerrar sesión
- POST `/auth/refresh` - Renovar token

**Usuarios:**
- GET `/users` - Listar usuarios
- POST `/users` - Crear usuario
- PUT `/users/:id` - Actualizar usuario
- DELETE `/users/:id` - Eliminar usuario

**Sensores:**
- GET `/sensors` - Listar sensores
- POST `/sensors` - Crear sensor
- PUT `/sensors/:id` - Actualizar sensor
- GET `/sensors/:id/data` - Obtener datos del sensor

**Producciones:**
- GET `/productions` - Listar producciones
- POST `/productions` - Crear producción
- PUT `/productions/:id` - Actualizar producción
- GET `/productions/:id/roi` - Calcular ROI

### Anexo C: Estructura de Archivos del Proyecto

```
Lembo_Sgl/
├── backend/
│   ├── controllers/          # Controladores de negocio
│   ├── db/                  # Configuración y scripts de BD
│   ├── middleware/          # Middleware de autenticación
│   ├── routes/             # Definición de rutas
│   └── server.js           # Servidor principal
├── frontend/
│   ├── public/
│   │   ├── css/           # Estilos CSS
│   │   ├── js/            # JavaScript del cliente
│   │   ├── imgs/          # Imágenes del sistema
│   │   └── views/         # Páginas HTML
├── package.json           # Dependencias del proyecto
└── README.md             # Documentación básica
```

---

**Documento Final del Informe Administrativo**  
**Sistema de Gestión Agrícola Lembo SGL v2.5.0**

**Elaborado por:**
- Kevin Acevedo - Desarrollador Full Stack y Líder Técnico
- Stephanny Cruz - Desarrolladora Frontend y Especialista UX/UI  
- Mateo Mosquera - Desarrollador Backend y Arquitecto de Datos

**Fecha:** Septiembre 2025  
**Estado:** Documento Final Completo  
**Versión:** 1.0