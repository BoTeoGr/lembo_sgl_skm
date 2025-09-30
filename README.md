# Sistema de Gestión Agrícola Lembo (SGL)

[![Version](https://img.shields.io/badge/version-2.5.0-blue.svg)](https://github.com/BoTeoGr/Lembo_Sgl)
[![License](https://img.shields.io/badge/license-ISC-green.svg)](https://github.com/BoTeoGr/Lembo_Sgl/blob/main/LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-14+-green.svg)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-blue.svg)](https://www.mysql.com/)

## 📋 Descripción General

**Lembo SGL** es un sistema integral de gestión agrícola desarrollado para optimizar y monitorear todas las actividades relacionadas con la producción agrícola. Esta aplicación web permite gestionar cultivos, ciclos de cultivo, sensores, insumos y usuarios de manera eficiente, integrando tecnologías modernas para el monitoreo y control de procesos agrícolas.

### ✨ Características Destacadas

- 🎯 **Gestión Integral**: Control completo de cultivos, producciones e insumos
- 📊 **Análisis de Datos**: Seguimiento detallado de inversiones y ganancias
- 🔐 **Seguridad Avanzada**: Autenticación JWT con roles diferenciados
- 📱 **Interfaz Responsiva**: Diseño adaptable a todos los dispositivos
- 🚀 **Alto Rendimiento**: Arquitectura optimizada para grandes volúmenes de datos

## 👥 Equipo de Desarrollo

- **Kevin Acevedo** - Desarrollador 
- **Stephanny Cruz** - Desarrolladora 
- **Mateo Mosquera** - Desarrollador 

## 🚀 Características Principales

### 🌱 Gestión de Cultivos
- Registro y seguimiento de diferentes tipos de cultivos (frutas, verduras, cereales, hierbas)
- Información detallada por ubicación, tamaño y estado
- Sistema de imágenes para identificación visual

### 🔄 Ciclos de Cultivo
- Gestión de ciclos agrícolas por temporadas
- Seguimiento de fechas de inicio y fin
- Registro de novedades y observaciones especiales

### 📊 Gestión de Producciones
- Control detallado de producciones específicas
- Seguimiento de inversiones y ganancias proyectadas
- Vinculación con cultivos y ciclos específicos

### 🔧 Gestión de Insumos
- Control de inventario de fertilizantes, pesticidas, semillas y otros insumos
- Seguimiento de cantidades disponibles y utilizadas
- Cálculo automático de costos y valor total

### 📡 Sistema de Sensores
- Monitoreo de sensores IoT para diferentes parámetros
- Tipos de sensores: contacto, distancia y luz
- Unidades de medida configurables (temperatura, distancia, presión)
- Tiempos de escaneo diferenciados

### 👤 Gestión de Usuarios
- Sistema de autenticación y autorización
- Roles diferenciados:
  - **Super administrador**: Control total del sistema
  - **Administrador**: Gestión avanzada
  - **Personal de Apoyo**: Operaciones básicas
  - **Visitante**: Acceso limitado

## 🏗️ Arquitectura del Sistema

### Backend
- **Framework**: Node.js con Express.js
- **Base de Datos**: MySQL
- **Autenticación**: JSON Web Tokens (JWT)
- **Encriptación**: bcrypt para contraseñas
- **Comunicación**: CORS habilitado para integración frontend

### Frontend
- **Tecnologías**: HTML5, CSS3, JavaScript (ES6+)
- **Arquitectura**: MVC (Modelo-Vista-Controlador)
- **Características**:
  - Interfaz responsiva
  - Validaciones de formulario
  - Sistema de notificaciones toast
  - Paginación dinámica
  - Modales interactivos

## 🗄️ Base de Datos

### Entidades Principales

#### 1. Usuarios (`usuarios`)
```sql
- id: INT (PK, AI)
- tipo_documento: VARCHAR(50)
- numero_documento: VARCHAR(20) UNIQUE
- nombre: VARCHAR(100)
- telefono: VARCHAR(20)
- correo: VARCHAR(100) UNIQUE
- password: VARCHAR(255) HASH
- rol: ENUM('Super administrador','Administrador','Personal de Apoyo','Visitante')
- estado: ENUM('habilitado','deshabilitado')
- fecha_creacion: TIMESTAMP
```

#### 2. Sensores (`sensores`)
```sql
- id: INT (PK, AI)
- tipo_sensor: ENUM('Sensor de contacto','Sensor de distancia','Sensores de luz')
- nombre_sensor: VARCHAR(100)
- unidad_medida: ENUM('Temperatura','Distancia','Presión')
- imagen: VARCHAR(255)
- descripcion: TEXT
- tiempo_escaneo: ENUM('Sensores lentos','Sensores de velocidad media','Sensores rápidos')
- usuario_id: INT (FK)
- estado: ENUM('habilitado','deshabilitado')
- fecha_creacion: TIMESTAMP
```

#### 3. Insumos (`insumos`)
```sql
- id: INT (PK, AI)
- nombre: VARCHAR(100)
- tipo: VARCHAR(50)
- imagen: VARCHAR(255)
- unidad_medida: ENUM('peso','volumen','superficie','concentración','litro','kilo')
- valor_unitario: DECIMAL(10,2)
- cantidad: INT
- valor_total: DECIMAL(10,2) CALCULADO
- descripcion: TEXT
- usuario_id: INT (FK)
- estado: ENUM('habilitado','deshabilitado')
- fecha_creacion: TIMESTAMP
```

#### 4. Ciclo de Cultivo (`ciclo_cultivo`)
```sql
- id: INT (PK, AI)
- nombre: VARCHAR(100)
- descripcion: TEXT
- periodo_inicio: DATE
- periodo_final: DATE
- novedades: TEXT
- usuario_id: INT (FK)
- estado: ENUM('habilitado','deshabilitado')
- fecha_creacion: TIMESTAMP
```

#### 5. Cultivos (`cultivos`)
```sql
- id: INT (PK, AI)
- nombre: VARCHAR(100)
- tipo: VARCHAR(50)
- imagen: VARCHAR(255)
- ubicacion: VARCHAR(100)
- descripcion: TEXT
- usuario_id: INT (FK)
- tamano: VARCHAR(50)
- estado: ENUM('habilitado','deshabilitado')
- fecha_creacion: TIMESTAMP
```

#### 6. Producciones (`producciones`)
```sql
- id: INT (PK, AI)
- nombre: VARCHAR(100)
- tipo: VARCHAR(50)
- ubicacion: VARCHAR(100)
- descripcion: TEXT
- usuario_id: INT (FK)
- cantidad: DECIMAL(10,2)
- estado: ENUM('habilitado','deshabilitado')
- fecha_creacion: TIMESTAMP
- cultivo_id: INT (FK)
- ciclo_id: INT (FK)
- fecha_de_inicio: DATE
- fecha_fin: DATE
- inversion: DECIMAL(10,2)
- meta_ganancia: DECIMAL(10,2) CHECK >= inversion
```

### Relaciones
- **Uso de Insumos** (`uso_insumo`): Relaciona producciones con insumos utilizados
- **Uso de Sensores** (`uso_sensor`): Relaciona producciones con sensores monitoreados

## 📁 Estructura del Proyecto

```
lembo_sgl_skm/
├── backend/
│   ├── controllers/           # Controladores de la API
│   │   ├── ciclo-cultivo.controller.js
│   │   ├── cultivo.controller.js
│   │   ├── insumo.controller.js
│   │   ├── production.controller.js
│   │   ├── sensor.controller.js
│   │   └── user.controller.js
│   ├── db/                   # Configuración de base de datos
│   │   ├── config.db.js
│   │   └── sistema_gestion_agricola.sql
│   ├── middleware/           # Middlewares personalizados
│   │   └── authRole.js
│   ├── routes/               # Definición de rutas
│   │   ├── publicWidgets.routes.js
│   │   └── routes.js
│   └── server.js             # Punto de entrada del servidor
├── frontend/
│   ├── public/
│   │   ├── css/              # Estilos CSS
│   │   │   ├── components/   # Estilos de componentes
│   │   │   └── pages/        # Estilos de páginas
│   │   ├── imgs/             # Recursos gráficos
│   │   ├── js/               # Código JavaScript
│   │   │   ├── config/       # Configuraciones de módulos
│   │   │   ├── data/         # Datos de ejemplo
│   │   │   ├── pages/        # Lógica de páginas
│   │   │   ├── services/     # Servicios y utilidades
│   │   │   ├── utils/        # Funciones auxiliares
│   │   │   └── validations/  # Validaciones de formularios
│   │   └── views/            # Plantillas HTML
│   └── node_modules/         # Dependencias de Node.js
├── node_modules/             # Dependencias raíz
├── package.json              # Configuración del proyecto
└── README.md                 # Esta documentación
```

## 🚀 Instalación y Configuración

### 📋 Prerrequisitos del Sistema

| Componente | Versión | Descripción |
|------------|---------|-------------|
| **Node.js** | 14+ | Entorno de ejecución JavaScript |
| **MySQL** | 8.0+ | Sistema de gestión de bases de datos |
| **npm** | 6+ | Gestor de paquetes de Node.js |
| **Git** | 2+ | Sistema de control de versiones |

### ⚡ Instalación Rápida

1. **Clonar el repositorio**
```bash
git clone https://github.com/BoTeoGr/Lembo_Sgl.git
cd lembo_sgl_skm
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar la base de datos**
```bash
# Ejecutar el script SQL para crear la estructura de la base de datos
mysql -u root -p < backend/db/sistema_gestion_agricola.sql

# Verificar que la base de datos se creó correctamente
mysql -u root -p -e "USE sistema_gestion_agricola; SHOW TABLES;"
```

4. **Configurar variables de entorno**
Crear archivo `.env` en la raíz del proyecto:
```env
# Base de datos
DB_HOST=localhost
DB_USER=tu_usuario_mysql
DB_PASSWORD=tu_contraseña_mysql
DB_NAME=sistema_gestion_agricola

# Seguridad
JWT_SECRET=tu_secreto_jwt_super_seguro_aqui

# Servidor
PORT=3000
NODE_ENV=development

# Configuración adicional
BCRYPT_ROUNDS=12
JWT_EXPIRES_IN=24h
```

5. **Verificar configuración**
```bash
# Probar conexión a la base de datos
npm run test-db

# Iniciar servidor en modo desarrollo
npm run dev
```

### 🌐 Acceso al Sistema

Una vez iniciado el servidor, accede a la aplicación en:
- **URL Local**: `http://localhost:3000`
- **Usuario Admin**: `admin@example.com`
- **Contraseña**: `Admin123!`

### 🔧 Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia servidor en modo desarrollo |
| `npm test` | Ejecuta pruebas (si están disponibles) |

## 🔌 APIs REST Disponibles

### 📡 Información General

- **Base URL**: `http://localhost:3000/api`
- **Formato**: JSON
- **Autenticación**: Bearer Token (JWT)
- **Rate Limiting**: Implementado para prevenir abuso

### 🔐 Endpoints de Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/auth/login` | Inicio de sesión de usuario |
| POST | `/auth/logout` | Cierre de sesión seguro |
| POST | `/auth/recovery` | Solicitud de recuperación de contraseña |
| POST | `/auth/reset-password` | Restablecimiento de contraseña |

### 👥 Gestión de Usuarios

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/users` | Listar todos los usuarios |
| GET | `/users/:id` | Obtener usuario específico |
| POST | `/users` | Crear nuevo usuario |
| PUT | `/users/:id` | Actualizar usuario existente |
| DELETE | `/users/:id` | Eliminar usuario |

### 🌱 Gestión de Cultivos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/crops` | Listar todos los cultivos |
| GET | `/crops/:id` | Obtener cultivo específico |
| POST | `/crops` | Crear nuevo cultivo |
| PUT | `/crops/:id` | Actualizar cultivo existente |
| DELETE | `/crops/:id` | Eliminar cultivo |

### 📊 Gestión de Producciones

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/productions` | Listar todas las producciones |
| GET | `/productions/:id` | Obtener producción específica |
| POST | `/productions` | Crear nueva producción |
| PUT | `/productions/:id` | Actualizar producción existente |
| DELETE | `/productions/:id` | Eliminar producción |

### 📡 Gestión de Sensores

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/sensors` | Listar todos los sensores |
| GET | `/sensors/:id` | Obtener sensor específico |
| POST | `/sensors` | Crear nuevo sensor |
| PUT | `/sensors/:id` | Actualizar sensor existente |
| DELETE | `/sensors/:id` | Eliminar sensor |

### 🔧 Gestión de Insumos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/insumos` | Listar todos los insumos |
| GET | `/insumos/:id` | Obtener insumo específico |
| POST | `/insumos` | Crear nuevo insumo |
| PUT | `/insumos/:id` | Actualizar insumo existente |
| DELETE | `/insumos/:id` | Eliminar insumo |

### 🔄 Gestión de Ciclos de Cultivo

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/ciclos-cultivo` | Listar todos los ciclos |
| GET | `/ciclos-cultivo/:id` | Obtener ciclo específico |
| POST | `/ciclos-cultivo` | Crear nuevo ciclo |
| PUT | `/ciclos-cultivo/:id` | Actualizar ciclo existente |
| DELETE | `/ciclos-cultivo/:id` | Eliminar ciclo |

### 📈 Endpoints Especiales

#### Reportes y Estadísticas
- `GET /api/reports/production-summary` - Resumen de producciones
- `GET /api/reports/inventory-status` - Estado de inventario
- `GET /api/reports/sensor-readings` - Lecturas de sensores

#### Dashboard y Widgets
- `GET /api/dashboard/stats` - Estadísticas generales
- `GET /api/dashboard/recent-activity` - Actividad reciente

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** - Entorno de ejecución JavaScript
- **Express.js** - Framework web
- **MySQL2** - Cliente MySQL para Node.js
- **JWT** - JSON Web Tokens para autenticación
- **bcrypt** - Encriptación de contraseñas
- **CORS** - Cross-Origin Resource Sharing
- **Nodemailer** - Envío de correos electrónicos
- **Crypto** - Funciones criptográficas

### Frontend
- **HTML5** - Estructura web semántica
- **CSS3** - Estilos y diseño responsivo
- **JavaScript ES6+** - Lógica del cliente
- **Fetch API** - Comunicación con el servidor

### Base de Datos
- **MySQL 8.0+** - Sistema de gestión de bases de datos
- **InnoDB** - Motor de almacenamiento con soporte de transacciones

## 🔐 Seguridad

- **Autenticación JWT**: Tokens seguros con expiración
- **Encriptación de contraseñas**: Uso de bcrypt con salt
- **Control de acceso basado en roles**: Diferentes niveles de permisos
- **Validación de datos**: Sanitización de entradas
- **CORS configurado**: Protección contra ataques CSRF

## 📋 Funcionalidades del Sistema

### Dashboard Principal
- Vista general de estadísticas del sistema
- Widgets informativos para métricas clave
- Navegación intuitiva entre módulos

### Gestión Completa de CRUD
- **Crear**: Formularios con validación completa
- **Leer**: Listados paginados con filtros
- **Actualizar**: Edición con pre-carga de datos
- **Eliminar**: Eliminación segura con confirmación

### Sistema de Reportes
- Generación de reportes personalizados
- Exportación de datos en múltiples formatos
- Filtros avanzados por fechas y criterios

### Gestión de Inventario
- Control automático de stock de insumos
- Alertas de bajo inventario
- Seguimiento de uso por producción

## 📄 Licencia

Este proyecto está bajo la Licencia ISC - ver el archivo [LICENSE](LICENSE) para más detalles.

## 📞 Soporte

Para soporte técnico o consultas:
- Crear un [issue](https://github.com/BoTeoGr/Lembo_Sgl/issues) en GitHub
- Contactar al equipo de desarrollo

## 🔄 Versiones

### v2.5.0 (Actual)
- Mejoras en la interfaz de usuario
- Optimización de consultas a base de datos
- Nuevas funcionalidades de reporte
- Correcciones de seguridad

### Historial de versiones
- **v2.0.0**: Reestructuración completa del sistema
- **v1.5.0**: Integración de sistema de sensores
- **v1.0.0**: Versión inicial del sistema

## 📊 Características Técnicas

### Rendimiento
- **Consultas Optimizadas**: Uso eficiente de índices y relaciones
- **Paginación Inteligente**: Carga rápida de grandes conjuntos de datos
- **Cache de Datos**: Mejora de tiempos de respuesta

### Escalabilidad
- **Arquitectura Modular**: Fácil extensión de funcionalidades
- **Base de Datos Relacional**: Soporte para grandes volúmenes de información
- **Separación de Responsabilidades**: Código mantenible y escalable

### Mantenimiento
- **Código Documentado**: Comentarios claros y guías de desarrollo
- **Validaciones Completas**: Prevención de errores de datos
- **Logs Detallados**: Trazabilidad completa de operaciones

