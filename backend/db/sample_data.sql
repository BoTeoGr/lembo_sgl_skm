-- Sample data for usuarios table
INSERT INTO `usuarios` (`tipo_documento`, `numero_documento`, `nombre`, `telefono`, `correo`, `password`, `rol`, `estado`) VALUES
('Cédula', '1000000003', 'Ana Pérez', '3123456789', 'ana.perez@example.com', SHA2('Ana123!', 256), 'técnico', 'habilitado'),
('Cédula', '1000000004', 'Carlos López', '3145678901', 'carlos.lopez@example.com', SHA2('Carlos123!', 256), 'técnico', 'habilitado'),
('Cédula', '1000000005', 'María García', '3156789012', 'maria.garcia@example.com', SHA2('Maria123!', 256), 'supervisor', 'habilitado'),
('Cédula', '1000000006', 'Juan Rodríguez', '3167890123', 'juan.rodriguez@example.com', SHA2('Juan123!', 256), 'técnico', 'habilitado'),
('Cédula', '1000000007', 'Laura Martínez', '3178901234', 'laura.martinez@example.com', SHA2('Laura123!', 256), 'técnico', 'habilitado');

-- Sample data for sensores table
INSERT INTO `sensores` (`tipo_sensor`, `nombre_sensor`, `unidad_medida`, `imagen`, `descripcion`, `tiempo_escaneo`, `usuario_id`, `estado`) VALUES
('Sensor de contacto', 'Sensor de Humedad 1', 'Temperatura', 'humedad1.jpg', 'Sensor de humedad del suelo', 'Sensores lentos', 4, 'habilitado'),
('Sensor de distancia', 'Sensor de Nivel 1', 'Distancia', 'nivel1.jpg', 'Sensor de nivel de agua', 'Sensores de velocidad media', 5, 'habilitado'),
('Sensores de luz', 'Sensor de Luz 1', 'Temperatura', 'luz1.jpg', 'Sensor de intensidad lumínica', 'Sensores rápidos', 6, 'habilitado'),
('Sensor de contacto', 'Sensor de Temperatura 2', 'Temperatura', 'temp2.jpg', 'Sensor de temperatura ambiente', 'Sensores lentos', 7, 'habilitado'),
('Sensor de distancia', 'Sensor de Nivel 2', 'Distancia', 'nivel2.jpg', 'Sensor de nivel de depósito', 'Sensores rápidos', 8, 'habilitado');

-- Sample data for insumos table
INSERT INTO `insumos` (`nombre`, `tipo`, `imagen`, `unidad_medida`, `valor_unitario`, `cantidad`, `valor_total`, `descripcion`, `usuario_id`, `estado`) VALUES
('Fungicida', 'Químico', 'fungicida.jpg', 'litro', 25.00, 30, 750.00, 'Fungicida para control de hongos', 1, 'habilitado'),
('Semillas de Lechuga', 'Semilla', 'semilla_lechuga.jpg', 'kilo', 15.00, 20, 300.00, 'Semillas de lechuga hidropónica', 2, 'habilitado'),
('Abono Orgánico', 'Orgánico', 'abono_organico.jpg', 'kilo', 8.00, 100, 800.00, 'Abono orgánico para cultivos', 3, 'habilitado'),
('Manguera de Riego', 'Herramienta', 'manguera.jpg', 'unidad', 35.00, 15, 525.00, 'Manguera para sistema de riego', 4, 'habilitado'),
('Guantes de Jardinería', 'Protección', 'guantes.jpg', 'par', 5.00, 50, 250.00, 'Guantes para trabajo en campo', 5, 'habilitado');

-- Sample data for cultivos table
INSERT INTO `cultivos` (`nombre`, `tipo`, `imagen`, `ubicacion`, `descripcion`, `usuario_id`, `tamano`, `estado`) VALUES
('Zanahoria', 'Raíz', 'zanahoria.jpg', 'Campo 4', 'Cultivo de zanahorias orgánicas', 4, '80', 'habilitado'),
('Fresa', 'Fruta', 'fresa.jpg', 'Invernadero 3', 'Cultivo de fresas hidropónicas', 5, '50', 'habilitado'),
('Papa', 'Tubérculo', 'papa.jpg', 'Campo 5', 'Cultivo de papas criollas', 6, '120', 'habilitado'),
('Cebolla', 'Bulbo', 'cebolla.jpg', 'Campo 6', 'Cultivo de cebolla cabezona', 7, '90', 'habilitado'),
('Espinaca', 'Hoja', 'espinaca.jpg', 'Invernadero 4', 'Cultivo de espinaca orgánica', 8, '60', 'habilitado');

-- Sample data for ciclo_cultivo table
INSERT INTO `ciclo_cultivo` (`nombre`, `descripcion`, `periodo_inicio`, `periodo_final`, `novedades`, `usuario_id`, `estado`) VALUES
('Ciclo Invierno 2025', 'Cultivos de invierno 2025', '2025-01-01', '2025-02-28', 'Temporada fría, requerirá protección contra heladas', 1, 'habilitado'),
('Ciclo Primavera 2026', 'Cultivos de primavera 2026', '2026-03-01', '2026-06-30', 'Incluir nuevos cultivos experimentales', 2, 'habilitado'),
('Ciclo Verano 2026', 'Cultivos de verano 2026', '2026-07-01', '2026-09-30', 'Aumentar riego por altas temperaturas', 3, 'habilitado'),
('Ciclo Otoño 2026', 'Cultivos de otoño 2026', '2026-10-01', '2026-12-31', 'Preparación de suelos para invierno', 4, 'habilitado'),
('Ciclo Invierno 2026', 'Cultivos de invierno 2026', '2026-01-01', '2026-02-28', 'Cultivos resistentes a bajas temperaturas', 5, 'habilitado');

-- Sample data for producciones table
INSERT INTO `producciones` (`nombre`, `tipo`, `ubicacion`, `descripcion`, `usuario_id`, `cantidad`, `estado`, `cultivo_id`, `ciclo_id`, `fecha_de_inicio`, `fecha_fin`, `inversion`, `meta_ganancia`) VALUES
('Producción de Zanahorias 2025', 'Orgánica', 'Campo 4', 'Producción de zanahorias orgánicas', 4, 80.00, 'habilitado', 4, 4, '2025-04-01', '2025-08-31', 5000.00, 7500.00),
('Producción de Fresas 2025', 'Hidropónica', 'Invernadero 3', 'Producción de fresas en sistema hidropónico', 5, 30.00, 'habilitado', 5, 5, '2025-05-01', '2025-10-31', 12000.00, 18000.00),
('Producción de Papas 2025', 'Tradicional', 'Campo 5', 'Producción de papas criollas', 6, 200.00, 'habilitado', 6, 1, '2025-03-15', '2025-09-30', 15000.00, 22000.00),
('Producción de Cebollas 2025', 'Orgánica', 'Campo 6', 'Producción de cebolla cabezona orgánica', 7, 150.00, 'habilitado', 7, 2, '2025-04-15', '2025-11-30', 10000.00, 16000.00),
('Producción de Espinaca 2025', 'Orgánica', 'Invernadero 4', 'Producción de espinaca orgánica', 8, 60.00, 'habilitado', 8, 3, '2025-05-01', '2025-10-31', 7000.00, 12000.00);

-- Sample data for uso_insumo table
INSERT INTO `uso_insumo` (`produccion_id`, `insumo_id`, `cantidad_utilizada`) VALUES
(4, 4, 5.00),  -- Producción de Zanahorias usa Fungicida
(5, 5, 2.00),  -- Producción de Fresas usa Semillas de Lechuga
(6, 6, 10.00), -- Producción de Papas usa Abono Orgánico
(7, 7, 3.00),  -- Producción de Cebollas usa Manguera de Riego
(8, 8, 10.00); -- Producción de Espinaca usa Guantes de Jardinería

-- Sample data for uso_sensor table
INSERT INTO `uso_sensor` (`produccion_id`, `sensor_id`) VALUES
(4, 4),  -- Producción de Zanahorias usa Sensor de Humedad 1
(5, 5),  -- Producción de Fresas usa Sensor de Nivel 1
(6, 6),  -- Producción de Papas usa Sensor de Luz 1
(7, 7),  -- Producción de Cebollas usa Sensor de Temperatura 2
(8, 8);  -- Producción de Espinaca usa Sensor de Nivel 2
