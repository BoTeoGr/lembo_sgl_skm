#!/usr/bin/env python3
"""
Script para crear archivo Excel con todos los campos de formularios del sistema agrícola
"""

import csv
import json

def create_csv_data():
    """Crear datos para cada formulario del sistema"""
    
    # Datos de REGISTRO DE USUARIOS
    usuarios_data = [
        ['Campo', 'Valor Esperado', 'Validado', 'Tipo de Campo', 'Requerido', 'Validaciones', 'Observaciones'],
        ['Tipo de documento', 'cc', 'Sí', 'Select', 'Sí', 'Opciones: ti, cc, ce, ppt, pep', 'Campo obligatorio para identificación'],
        ['Nombre', 'Mateo', 'Sí', 'Text', 'Sí', 'Solo letras, sin números', 'Nombre completo del usuario'],
        ['Número de documento', '12345678', 'Sí', 'Number', 'Sí', 'Solo números', 'Documento de identidad único'],
        ['Teléfono', '3001234567', 'Sí', 'Number', 'Sí', 'Solo números, 7-15 dígitos', 'Número de contacto'],
        ['Correo electrónico', 'mateo@email.com', 'Sí', 'Email', 'Sí', 'Formato email válido', 'Email único en el sistema'],
        ['Confirmar correo', 'mateo@email.com', 'Sí', 'Email', 'Sí', 'Debe coincidir con correo', 'Verificación de email'],
        ['Rol', 'Administrador', 'Sí', 'Select', 'Sí', 'Super Administrador, Administrador, Personal de Apoyo, Visitante', 'Nivel de acceso en el sistema'],
        ['Contraseña', '********', 'Sí', 'Password', 'Sí', '8-18 caracteres', 'Contraseña segura'],
        ['Estado', 'habilitado', 'Sí', 'Radio', 'Sí', 'habilitado/deshabilitado', 'Estado del usuario en el sistema'],
    ]
    
    # Datos de LOGIN
    login_data = [
        ['Campo', 'Valor Esperado', 'Validado', 'Tipo de Campo', 'Requerido', 'Validaciones', 'Observaciones'],
        ['Correo electrónico', 'admin@sistema.com', 'Sí', 'Email', 'Sí', 'Formato email válido', 'Credencial de acceso'],
        ['Contraseña', '********', 'Sí', 'Password', 'Sí', 'Mínimo 1 carácter', 'Contraseña del usuario'],
    ]
    
    # Datos de SENSORES
    sensores_data = [
        ['Campo', 'Valor Esperado', 'Validado', 'Tipo de Campo', 'Requerido', 'Validaciones', 'Observaciones'],
        ['Tipo de sensor', 'Sensor de contacto', 'Sí', 'Select', 'Sí', 'Sensor de contacto, Sensor de distancia, Sensores de luz', 'Clasificación del sensor'],
        ['Nombre del sensor', 'Sensor Temperatura A1', 'Sí', 'Text', 'Sí', 'Solo letras, sin números', 'Identificación del sensor'],
        ['Unidad de medida', 'Temperatura', 'Sí', 'Select', 'Sí', 'Temperatura, Distancia, Presión', 'Tipo de medición'],
        ['Imagen', 'sensor.jpg', 'Sí', 'File', 'Sí', 'Archivos de imagen', 'Foto del sensor'],
        ['Descripción', 'Sensor para medir temperatura ambiente', 'Sí', 'Textarea', 'Sí', 'Texto descriptivo', 'Detalles del sensor'],
        ['Tiempo de escaneo', 'Sensores lentos', 'Sí', 'Select', 'Sí', 'Sensores lentos, Sensores de velocidad media, Sensores rápidos', 'Velocidad de lectura'],
        ['Estado', 'habilitado', 'Sí', 'Radio', 'Sí', 'habilitado/deshabilitado', 'Estado operativo del sensor'],
    ]
    
    # Datos de CULTIVOS
    cultivos_data = [
        ['Campo', 'Valor Esperado', 'Validado', 'Tipo de Campo', 'Requerido', 'Validaciones', 'Observaciones'],
        ['Nombre', 'Tomate Cherry', 'Sí', 'Text', 'Sí', 'Solo letras, sin números', 'Nombre del cultivo'],
        ['Tipo', 'Fruta', 'Sí', 'Text', 'Sí', 'Solo letras, sin números', 'Categoría del cultivo'],
        ['Imagen', 'tomate.jpg', 'Sí', 'File', 'Sí', 'Archivos de imagen', 'Foto del cultivo'],
        ['Ubicación', 'Invernadero 1', 'Sí', 'Text', 'Sí', 'Texto libre', 'Localización del cultivo'],
        ['Descripción', 'Cultivo de tomates cherry orgánicos', 'Sí', 'Textarea', 'Sí', 'Texto descriptivo', 'Detalles del cultivo'],
        ['Tamaño', '150.5', 'Sí', 'Number', 'Sí', 'Número decimal, 10-10000 m²', 'Área del cultivo en metros cuadrados'],
        ['Estado', 'habilitado', 'Sí', 'Radio', 'Sí', 'habilitado/deshabilitado', 'Estado del cultivo'],
    ]
    
    # Datos de INSUMOS
    insumos_data = [
        ['Campo', 'Valor Esperado', 'Validado', 'Tipo de Campo', 'Requerido', 'Validaciones', 'Observaciones'],
        ['Nombre', 'Fertilizante NPK', 'Sí', 'Text', 'Sí', 'Solo letras, sin números', 'Nombre del insumo'],
        ['Tipo', 'Químico', 'Sí', 'Text', 'Sí', 'Texto libre', 'Categoría del insumo'],
        ['Imagen', 'fertilizante.jpg', 'Sí', 'File', 'Sí', 'Archivos de imagen', 'Foto del insumo'],
        ['Unidad de medida', 'kilo', 'Sí', 'Select', 'Sí', 'peso, volumen, superficie, concentración, litro, kilo', 'Unidad de medición'],
        ['Valor unitario', '15.50', 'Sí', 'Number', 'Sí', 'Número decimal > 0', 'Precio por unidad'],
        ['Cantidad', '100', 'Sí', 'Number', 'Sí', 'Número entero > 0', 'Stock disponible'],
        ['Valor total', '1550.00', 'Sí', 'Number', 'Sí', 'Calculado automáticamente', 'Valor unitario × cantidad'],
        ['Descripción', 'Fertilizante balanceado para cultivos', 'Sí', 'Textarea', 'Sí', 'Texto descriptivo', 'Detalles del insumo'],
        ['Estado', 'habilitado', 'Sí', 'Radio', 'Sí', 'habilitado/deshabilitado', 'Estado del insumo'],
    ]
    
    # Datos de CICLOS DE CULTIVO
    ciclos_data = [
        ['Campo', 'Valor Esperado', 'Validado', 'Tipo de Campo', 'Requerido', 'Validaciones', 'Observaciones'],
        ['Nombre', 'Ciclo Primavera 2025', 'Sí', 'Text', 'Sí', 'Solo letras, sin números', 'Nombre del ciclo'],
        ['Descripción', 'Ciclo de cultivo para temporada primaveral', 'Sí', 'Textarea', 'Sí', 'Texto descriptivo', 'Detalles del ciclo'],
        ['Periodo de inicio', '2025-03-01', 'Sí', 'Date', 'Sí', 'Formato YYYY-MM-DD', 'Fecha de inicio del ciclo'],
        ['Periodo final', '2025-06-30', 'Sí', 'Date', 'Sí', 'Formato YYYY-MM-DD, posterior al inicio', 'Fecha de finalización'],
        ['Novedades', 'Implementación de riego por goteo', 'Sí', 'Textarea', 'Sí', 'Texto descriptivo', 'Observaciones del ciclo'],
        ['Estado', 'habilitado', 'Sí', 'Radio', 'Sí', 'habilitado/deshabilitado', 'Estado del ciclo'],
    ]
    
    # Datos de PRODUCCIONES
    producciones_data = [
        ['Campo', 'Valor Esperado', 'Validado', 'Tipo de Campo', 'Requerido', 'Validaciones', 'Observaciones'],
        ['Nombre', 'Producción Tomates Q1-2025', 'Sí', 'Text', 'Sí', 'Mínimo 3 caracteres', 'Identificación de la producción'],
        ['Tipo', 'Orgánica', 'Sí', 'Text', 'Sí', 'Texto libre', 'Tipo de producción'],
        ['Ubicación', 'Invernadero Principal', 'Sí', 'Text', 'Sí', 'Texto libre', 'Localización de la producción'],
        ['Descripción', 'Producción de tomates orgánicos certificados', 'Sí', 'Textarea', 'Sí', 'Texto descriptivo', 'Detalles de la producción'],
        ['Cultivo', 'Tomate Cherry', 'Sí', 'Select', 'Sí', 'Lista de cultivos habilitados', 'Cultivo asociado'],
        ['Ciclo de cultivo', 'Ciclo Primavera 2025', 'Sí', 'Select', 'Sí', 'Lista de ciclos habilitados', 'Ciclo asociado'],
        ['Responsable', 'Juan Pérez', 'Sí', 'Select', 'Sí', 'Usuarios con rol Admin/SuperAdmin', 'Usuario responsable'],
        ['Fecha de inicio', '2025-03-01', 'Sí', 'Date', 'Sí', 'Formato YYYY-MM-DD', 'Inicio de la producción'],
        ['Fecha de fin', '2025-06-30', 'Sí', 'Date', 'Sí', 'Posterior a fecha inicio, máximo 2 años', 'Fin de la producción'],
        ['Cantidad', '50.5', 'Sí', 'Number', 'Sí', 'Número decimal > 0', 'Cantidad esperada de producción'],
        ['Inversión total', '15000.00', 'Sí', 'Number', 'Sí', 'Calculado automáticamente', 'Suma del costo de insumos'],
        ['Meta de ganancia', '22500.00', 'Sí', 'Number', 'Sí', 'Debe ser >= inversión', 'Ganancia esperada'],
        ['Sensores', 'Sensor Temperatura A1', 'Sí', 'Multi-Select', 'No', 'Máximo 3 sensores', 'Sensores asignados'],
        ['Insumos', 'Fertilizante NPK (15 kg)', 'Sí', 'Multi-Select', 'Sí', 'Mínimo 1 insumo con cantidad', 'Insumos utilizados con cantidades'],
        ['Estado', 'habilitado', 'Sí', 'Radio', 'Sí', 'habilitado/deshabilitado', 'Estado de la producción'],
    ]
    
    # Datos de RECUPERACIÓN DE CONTRASEÑA
    recovery_data = [
        ['Campo', 'Valor Esperado', 'Validado', 'Tipo de Campo', 'Requerido', 'Validaciones', 'Observaciones'],
        ['Correo electrónico', 'usuario@email.com', 'Sí', 'Email', 'Sí', 'Formato email válido, debe existir', 'Email registrado en el sistema'],
        ['Código de recuperación', '123456', 'Sí', 'Number', 'Sí', 'Código de 6 dígitos', 'Código enviado por email'],
        ['Nueva contraseña', '********', 'Sí', 'Password', 'Sí', '8-18 caracteres', 'Nueva contraseña segura'],
        ['Confirmar contraseña', '********', 'Sí', 'Password', 'Sí', 'Debe coincidir con nueva contraseña', 'Verificación de contraseña'],
    ]
    
    return {
        'usuarios': usuarios_data,
        'login': login_data,
        'sensores': sensores_data,
        'cultivos': cultivos_data,
        'insumos': insumos_data,
        'ciclos': ciclos_data,
        'producciones': producciones_data,
        'recovery': recovery_data
    }

def create_database_schema():
    """Crear datos del esquema de base de datos"""
    return [
        ['Tabla', 'Campo', 'Tipo de Dato', 'Restricciones', 'Valor Ejemplo', 'Descripción'],
        ['usuarios', 'id', 'INT', 'PRIMARY KEY, AUTO_INCREMENT', '1', 'Identificador único del usuario'],
        ['usuarios', 'tipo_documento', 'VARCHAR(50)', 'NOT NULL', 'Cédula', 'Tipo de documento de identidad'],
        ['usuarios', 'numero_documento', 'VARCHAR(20)', 'NOT NULL, UNIQUE', '12345678', 'Número de documento único'],
        ['usuarios', 'nombre', 'VARCHAR(100)', 'NOT NULL', 'Mateo González', 'Nombre completo del usuario'],
        ['usuarios', 'telefono', 'VARCHAR(20)', 'NOT NULL', '3001234567', 'Número de teléfono'],
        ['usuarios', 'correo', 'VARCHAR(100)', 'NOT NULL, UNIQUE', 'mateo@email.com', 'Correo electrónico único'],
        ['usuarios', 'password', 'VARCHAR(255)', 'NOT NULL', 'hash_password', 'Contraseña encriptada'],
        ['usuarios', 'rol', 'ENUM', 'Super administrador, Administrador, Personal de Apoyo, Visitante', 'Administrador', 'Rol del usuario en el sistema'],
        ['usuarios', 'estado', 'ENUM', 'habilitado, deshabilitado', 'habilitado', 'Estado del usuario'],
        ['usuarios', 'fecha_creacion', 'TIMESTAMP', 'DEFAULT CURRENT_TIMESTAMP', '2025-01-15 10:30:00', 'Fecha de registro'],
        
        ['sensores', 'id', 'INT', 'PRIMARY KEY, AUTO_INCREMENT', '1', 'Identificador único del sensor'],
        ['sensores', 'tipo_sensor', 'ENUM', 'Sensor de contacto, Sensor de distancia, Sensores de luz', 'Sensor de contacto', 'Tipo de sensor'],
        ['sensores', 'nombre_sensor', 'VARCHAR(100)', 'NOT NULL', 'Sensor Temperatura A1', 'Nombre del sensor'],
        ['sensores', 'unidad_medida', 'ENUM', 'Temperatura, Distancia, Presión', 'Temperatura', 'Unidad de medición'],
        ['sensores', 'imagen', 'VARCHAR(255)', 'NULL', 'sensor1.jpg', 'Ruta de la imagen'],
        ['sensores', 'descripcion', 'TEXT', 'NOT NULL', 'Sensor de temperatura ambiente', 'Descripción del sensor'],
        ['sensores', 'tiempo_escaneo', 'ENUM', 'Sensores lentos, Sensores de velocidad media, Sensores rápidos', 'Sensores lentos', 'Velocidad de lectura'],
        ['sensores', 'usuario_id', 'INT', 'FOREIGN KEY', '1', 'Usuario que registró el sensor'],
        ['sensores', 'estado', 'ENUM', 'habilitado, deshabilitado', 'habilitado', 'Estado del sensor'],
        ['sensores', 'fecha_creacion', 'TIMESTAMP', 'DEFAULT CURRENT_TIMESTAMP', '2025-01-15 10:30:00', 'Fecha de registro'],
        
        ['cultivos', 'id', 'INT', 'PRIMARY KEY, AUTO_INCREMENT', '1', 'Identificador único del cultivo'],
        ['cultivos', 'nombre', 'VARCHAR(100)', 'NOT NULL', 'Tomate Cherry', 'Nombre del cultivo'],
        ['cultivos', 'tipo', 'VARCHAR(50)', 'NOT NULL', 'Fruta', 'Tipo de cultivo'],
        ['cultivos', 'imagen', 'VARCHAR(255)', 'NULL', 'tomate.jpg', 'Ruta de la imagen'],
        ['cultivos', 'ubicacion', 'VARCHAR(100)', 'NOT NULL', 'Invernadero 1', 'Ubicación del cultivo'],
        ['cultivos', 'descripcion', 'TEXT', 'NOT NULL', 'Cultivo de tomates cherry orgánicos', 'Descripción del cultivo'],
        ['cultivos', 'tamano', 'VARCHAR(50)', 'NOT NULL', '150', 'Tamaño en metros cuadrados'],
        ['cultivos', 'usuario_id', 'INT', 'FOREIGN KEY', '1', 'Usuario responsable'],
        ['cultivos', 'estado', 'ENUM', 'habilitado, deshabilitado', 'habilitado', 'Estado del cultivo'],
        ['cultivos', 'fecha_creacion', 'TIMESTAMP', 'DEFAULT CURRENT_TIMESTAMP', '2025-01-15 10:30:00', 'Fecha de registro'],
        
        ['insumos', 'id', 'INT', 'PRIMARY KEY, AUTO_INCREMENT', '1', 'Identificador único del insumo'],
        ['insumos', 'nombre', 'VARCHAR(100)', 'NOT NULL', 'Fertilizante NPK', 'Nombre del insumo'],
        ['insumos', 'tipo', 'VARCHAR(50)', 'NOT NULL', 'Químico', 'Tipo de insumo'],
        ['insumos', 'imagen', 'VARCHAR(255)', 'NULL', 'fertilizante.jpg', 'Ruta de la imagen'],
        ['insumos', 'unidad_medida', 'ENUM', 'peso, volumen, superficie, concentración, litro, kilo', 'kilo', 'Unidad de medida'],
        ['insumos', 'valor_unitario', 'DECIMAL(10,2)', 'NOT NULL', '15.50', 'Precio por unidad'],
        ['insumos', 'cantidad', 'INT', 'NOT NULL', '100', 'Stock disponible'],
        ['insumos', 'valor_total', 'DECIMAL(10,2)', 'NOT NULL', '1550.00', 'Valor total calculado'],
        ['insumos', 'descripcion', 'TEXT', 'NOT NULL', 'Fertilizante balanceado NPK', 'Descripción del insumo'],
        ['insumos', 'usuario_id', 'INT', 'FOREIGN KEY', '1', 'Usuario que registró el insumo'],
        ['insumos', 'estado', 'ENUM', 'habilitado, deshabilitado', 'habilitado', 'Estado del insumo'],
        ['insumos', 'fecha_creacion', 'TIMESTAMP', 'DEFAULT CURRENT_TIMESTAMP', '2025-01-15 10:30:00', 'Fecha de registro'],
        
        ['ciclo_cultivo', 'id', 'INT', 'PRIMARY KEY, AUTO_INCREMENT', '1', 'Identificador único del ciclo'],
        ['ciclo_cultivo', 'nombre', 'VARCHAR(100)', 'NOT NULL', 'Ciclo Primavera 2025', 'Nombre del ciclo'],
        ['ciclo_cultivo', 'descripcion', 'TEXT', 'NOT NULL', 'Ciclo de cultivo primaveral', 'Descripción del ciclo'],
        ['ciclo_cultivo', 'periodo_inicio', 'DATE', 'NOT NULL', '2025-03-01', 'Fecha de inicio'],
        ['ciclo_cultivo', 'periodo_final', 'DATE', 'NOT NULL', '2025-06-30', 'Fecha de finalización'],
        ['ciclo_cultivo', 'novedades', 'TEXT', 'NULL', 'Implementación riego por goteo', 'Novedades del ciclo'],
        ['ciclo_cultivo', 'usuario_id', 'INT', 'FOREIGN KEY', '1', 'Usuario responsable'],
        ['ciclo_cultivo', 'estado', 'ENUM', 'habilitado, deshabilitado', 'habilitado', 'Estado del ciclo'],
        ['ciclo_cultivo', 'fecha_creacion', 'TIMESTAMP', 'DEFAULT CURRENT_TIMESTAMP', '2025-01-15 10:30:00', 'Fecha de registro'],
        
        ['producciones', 'id', 'INT', 'PRIMARY KEY, AUTO_INCREMENT', '1', 'Identificador único de la producción'],
        ['producciones', 'nombre', 'VARCHAR(100)', 'NOT NULL', 'Producción Tomates Q1-2025', 'Nombre de la producción'],
        ['producciones', 'tipo', 'VARCHAR(50)', 'NOT NULL', 'Orgánica', 'Tipo de producción'],
        ['producciones', 'ubicacion', 'VARCHAR(100)', 'NOT NULL', 'Invernadero Principal', 'Ubicación de la producción'],
        ['producciones', 'descripcion', 'TEXT', 'NOT NULL', 'Producción orgánica certificada', 'Descripción de la producción'],
        ['producciones', 'usuario_id', 'INT', 'FOREIGN KEY', '1', 'Usuario responsable'],
        ['producciones', 'cantidad', 'DECIMAL(10,2)', 'NOT NULL', '50.5', 'Cantidad esperada'],
        ['producciones', 'cultivo_id', 'INT', 'FOREIGN KEY', '1', 'Cultivo asociado'],
        ['producciones', 'ciclo_id', 'INT', 'FOREIGN KEY', '1', 'Ciclo de cultivo asociado'],
        ['producciones', 'fecha_de_inicio', 'DATE', 'NULL', '2025-03-01', 'Fecha de inicio de producción'],
        ['producciones', 'fecha_fin', 'DATE', 'NULL', '2025-06-30', 'Fecha de fin de producción'],
        ['producciones', 'inversion', 'DECIMAL(10,2)', 'NULL', '15000.00', 'Inversión total'],
        ['producciones', 'meta_ganancia', 'DECIMAL(10,2)', 'NULL', '22500.00', 'Meta de ganancia'],
        ['producciones', 'estado', 'ENUM', 'habilitado, deshabilitado', 'habilitado', 'Estado de la producción'],
        ['producciones', 'fecha_creacion', 'TIMESTAMP', 'DEFAULT CURRENT_TIMESTAMP', '2025-01-15 10:30:00', 'Fecha de registro'],
        
        ['uso_insumo', 'id', 'INT', 'PRIMARY KEY, AUTO_INCREMENT', '1', 'Identificador único'],
        ['uso_insumo', 'produccion_id', 'INT', 'FOREIGN KEY, NOT NULL', '1', 'Producción asociada'],
        ['uso_insumo', 'insumo_id', 'INT', 'FOREIGN KEY, NOT NULL', '1', 'Insumo utilizado'],
        ['uso_insumo', 'cantidad_utilizada', 'DECIMAL(10,2)', 'NOT NULL', '15.50', 'Cantidad utilizada del insumo'],
        
        ['uso_sensor', 'id', 'INT', 'PRIMARY KEY, AUTO_INCREMENT', '1', 'Identificador único'],
        ['uso_sensor', 'produccion_id', 'INT', 'FOREIGN KEY, NOT NULL', '1', 'Producción asociada'],
        ['uso_sensor', 'sensor_id', 'INT', 'FOREIGN KEY', '1', 'Sensor utilizado'],
    ]

def save_csv_files():
    """Guardar datos en archivos CSV"""
    form_data = create_csv_data()
    
    # Crear archivos CSV para cada formulario
    for form_name, data in form_data.items():
        filename = f"/workspace/{form_name}_formulario.csv"
        with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.writer(csvfile)
            writer.writerows(data)
        print(f"Archivo creado: {filename}")
    
    # Crear archivo CSV para base de datos
    bd_data = create_database_schema()
    filename = "/workspace/base_datos_esquema.csv"
    with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerows(bd_data)
    print(f"Archivo creado: {filename}")

def create_summary_json():
    """Crear resumen JSON con todos los datos"""
    form_data = create_csv_data()
    bd_data = create_database_schema()
    
    summary = {
        "proyecto": "Sistema de Gestión Agrícola",
        "fecha_creacion": "2025-01-15",
        "formularios": {
            "registro_usuarios": {
                "descripcion": "Formulario para registrar nuevos usuarios del sistema",
                "campos_total": len(form_data['usuarios']) - 1,  # -1 para el header
                "campos": form_data['usuarios'][1:]  # Sin header
            },
            "login": {
                "descripcion": "Formulario de autenticación de usuarios",
                "campos_total": len(form_data['login']) - 1,
                "campos": form_data['login'][1:]
            },
            "sensores": {
                "descripcion": "Formulario para registrar sensores agrícolas",
                "campos_total": len(form_data['sensores']) - 1,
                "campos": form_data['sensores'][1:]
            },
            "cultivos": {
                "descripcion": "Formulario para registrar cultivos",
                "campos_total": len(form_data['cultivos']) - 1,
                "campos": form_data['cultivos'][1:]
            },
            "insumos": {
                "descripcion": "Formulario para registrar insumos agrícolas",
                "campos_total": len(form_data['insumos']) - 1,
                "campos": form_data['insumos'][1:]
            },
            "ciclos_cultivo": {
                "descripcion": "Formulario para registrar ciclos de cultivo",
                "campos_total": len(form_data['ciclos']) - 1,
                "campos": form_data['ciclos'][1:]
            },
            "producciones": {
                "descripcion": "Formulario para registrar producciones agrícolas",
                "campos_total": len(form_data['producciones']) - 1,
                "campos": form_data['producciones'][1:]
            },
            "recuperar_contraseña": {
                "descripcion": "Formulario para recuperación de contraseñas",
                "campos_total": len(form_data['recovery']) - 1,
                "campos": form_data['recovery'][1:]
            }
        },
        "base_datos": {
            "descripcion": "Esquema completo de la base de datos",
            "tablas_total": len(set([row[0] for row in bd_data[1:]])),
            "campos_total": len(bd_data) - 1,
            "esquema": bd_data[1:]
        }
    }
    
    with open('/workspace/resumen_formularios.json', 'w', encoding='utf-8') as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)
    
    print("Archivo creado: /workspace/resumen_formularios.json")
    return summary

if __name__ == "__main__":
    print("=== CREANDO DOCUMENTACIÓN DE FORMULARIOS ===")
    print()
    
    # Crear archivos CSV
    save_csv_files()
    print()
    
    # Crear resumen JSON
    summary = create_summary_json()
    print()
    
    print("=== RESUMEN GENERAL ===")
    print(f"Total de formularios: {len(summary['formularios'])}")
    print(f"Total de tablas en BD: {summary['base_datos']['tablas_total']}")
    print(f"Total de campos en BD: {summary['base_datos']['campos_total']}")
    print()
    
    print("Formularios creados:")
    for form_name, form_info in summary['formularios'].items():
        print(f"- {form_name}: {form_info['campos_total']} campos")
    
    print()
    print("Archivos generados:")
    print("- 8 archivos CSV con formularios")
    print("- 1 archivo CSV con esquema de BD")
    print("- 1 archivo JSON con resumen completo")