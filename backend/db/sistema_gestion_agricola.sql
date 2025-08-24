-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: sistema_gestion_agricola
-- ------------------------------------------------------
-- Server version	9.3.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Create and use database
--
CREATE DATABASE IF NOT EXISTS sistema_gestion_agricola;
USE sistema_gestion_agricola;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tipo_documento` varchar(50) NOT NULL,
  `numero_documento` varchar(20) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `telefono` varchar(20) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rol` enum('Super administrador','Administrador','Personal de Apoyo','Visitante') NOT NULL,
  `estado` enum('habilitado','deshabilitado') NOT NULL DEFAULT 'habilitado',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `correo` (`correo`),
  UNIQUE KEY `numero_documento` (`numero_documento`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `usuarios` (Original + 50 additional with corrected enum values)
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES 
-- Original data (already correct)
(1,'Cédula','1000000000','Administrador','3111111111','admin@example.com',SHA2('Admin123!', 256),'Super administrador','habilitado','2025-04-22 17:40:51'),
(2,'Cédula','1000000001','Gerente','3111111112','gerente@example.com',SHA2('Gerente123!', 256),'Administrador','habilitado','2025-04-22 17:40:51'),
(3,'Cédula','1000000002','Supervisor','3111111113','supervisor@example.com',SHA2('Supervisor123!', 256),'Personal de Apoyo','habilitado','2025-04-22 17:40:51'),
-- Additional 50 users with CORRECTED enum values
(4,'Cédula','1000000003','María González','3201234567','maria.gonzalez@agricola.com',SHA2('Maria123!', 256),'Personal de Apoyo','habilitado','2025-01-15 08:30:00'),
(5,'Cédula','1000000004','Carlos Rodríguez','3209876543','carlos.rodriguez@agricola.com',SHA2('Carlos123!', 256),'Administrador','habilitado','2025-01-16 09:15:00'),
(6,'Cédula','1000000005','Ana Martínez','3187654321','ana.martinez@agricola.com',SHA2('Ana123!', 256),'Personal de Apoyo','habilitado','2025-01-17 10:00:00'),
(7,'Cédula','1000000006','Luis Fernández','3156789012','luis.fernandez@agricola.com',SHA2('Luis123!', 256),'Personal de Apoyo','habilitado','2025-01-18 11:30:00'),
(8,'Cédula','1000000007','Carmen López','3145678901','carmen.lopez@agricola.com',SHA2('Carmen123!', 256),'Administrador','habilitado','2025-01-19 12:45:00'),
(9,'Cédula','1000000008','Roberto Silva','3134567890','roberto.silva@agricola.com',SHA2('Roberto123!', 256),'Personal de Apoyo','habilitado','2025-01-20 13:20:00'),
(10,'Cédula','1000000009','Patricia Morales','3123456789','patricia.morales@agricola.com',SHA2('Patricia123!', 256),'Personal de Apoyo','habilitado','2025-01-21 14:10:00'),
(11,'Cédula','1000000010','Diego Herrera','3112345678','diego.herrera@agricola.com',SHA2('Diego123!', 256),'Administrador','habilitado','2025-01-22 15:00:00'),
(12,'Cédula','1000000011','Sofía Jiménez','3101234567','sofia.jimenez@agricola.com',SHA2('Sofia123!', 256),'Personal de Apoyo','habilitado','2025-01-23 16:30:00'),
(13,'Cédula','1000000012','Andrés Vargas','3190123456','andres.vargas@agricola.com',SHA2('Andres123!', 256),'Personal de Apoyo','habilitado','2025-01-24 17:15:00'),
(14,'Cédula','1000000013','Valentina Castro','3189012345','valentina.castro@agricola.com',SHA2('Valentina123!', 256),'Administrador','habilitado','2025-01-25 08:45:00'),
(15,'Cédula','1000000014','Sebastián Ruiz','3178901234','sebastian.ruiz@agricola.com',SHA2('Sebastian123!', 256),'Personal de Apoyo','habilitado','2025-01-26 09:30:00'),
(16,'Cédula','1000000015','Isabella Torres','3167890123','isabella.torres@agricola.com',SHA2('Isabella123!', 256),'Personal de Apoyo','habilitado','2025-01-27 10:20:00'),
(17,'Cédula','1000000016','Mateo Ramírez','3156789012','mateo.ramirez@agricola.com',SHA2('Mateo123!', 256),'Administrador','habilitado','2025-01-28 11:10:00'),
(18,'Cédula','1000000017','Camila Flores','3145678901','camila.flores@agricola.com',SHA2('Camila123!', 256),'Personal de Apoyo','habilitado','2025-01-29 12:00:00'),
(19,'Cédula','1000000018','Santiago Mendoza','3134567890','santiago.mendoza@agricola.com',SHA2('Santiago123!', 256),'Personal de Apoyo','habilitado','2025-01-30 13:45:00'),
(20,'Cédula','1000000019','Lucía Peña','3123456789','lucia.pena@agricola.com',SHA2('Lucia123!', 256),'Super administrador','habilitado','2025-02-01 14:30:00'),
(21,'Cédula','1000000020','Gabriel Ortiz','3112345678','gabriel.ortiz@agricola.com',SHA2('Gabriel123!', 256),'Personal de Apoyo','habilitado','2025-02-02 15:20:00'),
(22,'Cédula','1000000021','Mariana Guerrero','3101234567','mariana.guerrero@agricola.com',SHA2('Mariana123!', 256),'Administrador','habilitado','2025-02-03 16:10:00'),
(23,'Cédula','1000000022','Nicolás Vega','3190123456','nicolas.vega@agricola.com',SHA2('Nicolas123!', 256),'Personal de Apoyo','habilitado','2025-02-04 17:00:00'),
(24,'Cédula','1000000023','Alejandra Cruz','3189012345','alejandra.cruz@agricola.com',SHA2('Alejandra123!', 256),'Personal de Apoyo','habilitado','2025-02-05 08:15:00'),
(25,'Cédula','1000000024','Fernando Soto','3178901234','fernando.soto@agricola.com',SHA2('Fernando123!', 256),'Administrador','habilitado','2025-02-06 09:00:00'),
(26,'Cédula','1000000025','Daniela Ramos','3167890123','daniela.ramos@agricola.com',SHA2('Daniela123!', 256),'Personal de Apoyo','habilitado','2025-02-07 10:45:00'),
(27,'Cédula','1000000026','Emilio Aguilar','3156789012','emilio.aguilar@agricola.com',SHA2('Emilio123!', 256),'Personal de Apoyo','habilitado','2025-02-08 11:30:00'),
(28,'Cédula','1000000027','Natalia Delgado','3145678901','natalia.delgado@agricola.com',SHA2('Natalia123!', 256),'Administrador','habilitado','2025-02-09 12:15:00'),
(29,'Cédula','1000000028','Joaquín Molina','3134567890','joaquin.molina@agricola.com',SHA2('Joaquin123!', 256),'Personal de Apoyo','habilitado','2025-02-10 13:00:00'),
(30,'Cédula','1000000029','Valeria Campos','3123456789','valeria.campos@agricola.com',SHA2('Valeria123!', 256),'Personal de Apoyo','habilitado','2025-02-11 14:45:00'),
(31,'Cédula','1000000030','Maximiliano Reyes','3112345678','maximiliano.reyes@agricola.com',SHA2('Maximiliano123!', 256),'Super administrador','habilitado','2025-02-12 15:30:00'),
(32,'Cédula','1000000031','Antonella Paredes','3101234567','antonella.paredes@agricola.com',SHA2('Antonella123!', 256),'Personal de Apoyo','habilitado','2025-02-13 16:20:00'),
(33,'Cédula','1000000032','Tomás Navarro','3190123456','tomas.navarro@agricola.com',SHA2('Tomas123!', 256),'Administrador','habilitado','2025-02-14 17:10:00'),
(34,'Cédula','1000000033','Regina Cortés','3189012345','regina.cortes@agricola.com',SHA2('Regina123!', 256),'Personal de Apoyo','habilitado','2025-02-15 08:00:00'),
(35,'Cédula','1000000034','Ignacio Sandoval','3178901234','ignacio.sandoval@agricola.com',SHA2('Ignacio123!', 256),'Personal de Apoyo','habilitado','2025-02-16 09:45:00'),
(36,'Cédula','1000000035','Renata Espinoza','3167890123','renata.espinoza@agricola.com',SHA2('Renata123!', 256),'Administrador','habilitado','2025-02-17 10:30:00'),
(37,'Cédula','1000000036','Benjamín Ibarra','3156789012','benjamin.ibarra@agricola.com',SHA2('Benjamin123!', 256),'Personal de Apoyo','habilitado','2025-02-18 11:15:00'),
(38,'Cédula','1000000037','Constanza Fuentes','3145678901','constanza.fuentes@agricola.com',SHA2('Constanza123!', 256),'Personal de Apoyo','habilitado','2025-02-19 12:00:00'),
(39,'Cédula','1000000038','Agustín Moreno','3134567890','agustin.moreno@agricola.com',SHA2('Agustin123!', 256),'Administrador','habilitado','2025-02-20 13:45:00'),
(40,'Cédula','1000000039','Florencia Rojas','3123456789','florencia.rojas@agricola.com',SHA2('Florencia123!', 256),'Personal de Apoyo','habilitado','2025-02-21 14:30:00'),
(41,'Cédula','1000000040','Vicente Carrasco','3112345678','vicente.carrasco@agricola.com',SHA2('Vicente123!', 256),'Personal de Apoyo','habilitado','2025-02-22 15:15:00'),
(42,'Cédula','1000000041','Esperanza Valdés','3101234567','esperanza.valdes@agricola.com',SHA2('Esperanza123!', 256),'Super administrador','habilitado','2025-02-23 16:00:00'),
(43,'Cédula','1000000042','Rodrigo Palacios','3190123456','rodrigo.palacios@agricola.com',SHA2('Rodrigo123!', 256),'Personal de Apoyo','habilitado','2025-02-24 17:45:00'),
(44,'Cédula','1000000043','Amparo Figueroa','3189012345','amparo.figueroa@agricola.com',SHA2('Amparo123!', 256),'Administrador','habilitado','2025-02-25 08:30:00'),
(45,'Cédula','1000000044','Esteban Contreras','3178901234','esteban.contreras@agricola.com',SHA2('Esteban123!', 256),'Personal de Apoyo','habilitado','2025-02-26 09:15:00'),
(46,'Cédula','1000000045','Pilar Cáceres','3167890123','pilar.caceres@agricola.com',SHA2('Pilar123!', 256),'Personal de Apoyo','habilitado','2025-02-27 10:00:00'),
(47,'Cédula','1000000046','Cristóbal Muñoz','3156789012','cristobal.munoz@agricola.com',SHA2('Cristobal123!', 256),'Administrador','habilitado','2025-02-28 11:45:00'),
(48,'Cédula','1000000047','Magdalena Bravo','3145678901','magdalena.bravo@agricola.com',SHA2('Magdalena123!', 256),'Personal de Apoyo','habilitado','2025-03-01 12:30:00'),
(49,'Cédula','1000000048','Patricio Lara','3134567890','patricio.lara@agricola.com',SHA2('Patricio123!', 256),'Personal de Apoyo','habilitado','2025-03-02 13:15:00'),
(50,'Cédula','1000000049','Esperanza Vera','3123456789','esperanza.vera@agricola.com',SHA2('Esperanza123!', 256),'Administrador','habilitado','2025-03-03 14:00:00'),
(51,'Cédula','1000000050','Álvaro Medina','3112345678','alvaro.medina@agricola.com',SHA2('Alvaro123!', 256),'Personal de Apoyo','habilitado','2025-03-04 15:45:00'),
(52,'Cédula','1000000051','Beatriz Salinas','3101234567','beatriz.salinas@agricola.com',SHA2('Beatriz123!', 256),'Visitante','habilitado','2025-03-05 16:30:00'),
(53,'Cédula','1000000052','Claudio Henríquez','3190123456','claudio.henriquez@agricola.com',SHA2('Claudio123!', 256),'Super administrador','habilitado','2025-03-06 17:15:00');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sensores`
--

DROP TABLE IF EXISTS `sensores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sensores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tipo_sensor` enum('Sensor de contacto','Sensor de distancia','Sensores de luz') NOT NULL,
  `nombre_sensor` varchar(100) NOT NULL,
  `unidad_medida` enum('Temperatura','Distancia','Presión') NOT NULL,
  `imagen` varchar(255) DEFAULT NULL,
  `descripcion` text NOT NULL,
  `tiempo_escaneo` enum('Sensores lentos','Sensores de velocidad media','Sensores rápidos') NOT NULL,
  `usuario_id` int DEFAULT NULL,
  `estado` enum('habilitado','deshabilitado') NOT NULL DEFAULT 'habilitado',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_sensor_usuario_id` (`usuario_id`),
  CONSTRAINT `fk_sensor_usuario_id` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL,
  CONSTRAINT `sensores_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `sensores` (Original + 50 additional)
--

LOCK TABLES `sensores` WRITE;
/*!40000 ALTER TABLE `sensores` DISABLE KEYS */;
INSERT INTO `sensores` VALUES 
-- Original data
(1,'Sensor de contacto','Sensor 1','Temperatura','sensor1.jpg','Sensor de temperatura de contacto','Sensores lentos',1,'habilitado','2025-04-22 17:40:51'),
(2,'Sensor de distancia','Sensor 2','Distancia','sensor2.jpg','Sensor de distancia láser','Sensores rápidos',2,'habilitado','2025-04-22 17:40:51'),
(3,'Sensores de luz','Sensor 3','Temperatura','sensor3.jpg','Sensor de intensidad lumínica','Sensores de velocidad media',3,'habilitado','2025-04-22 17:40:51'),
-- Additional 50 sensors
(4,'Sensor de contacto','Sensor Humedad Suelo A1','Temperatura','sensor_humedad_a1.jpg','Sensor de humedad del suelo para invernadero A1','Sensores lentos',4,'habilitado','2025-01-15 08:30:00'),
(5,'Sensor de distancia','Sensor Nivel Agua B2','Distancia','sensor_nivel_b2.jpg','Sensor ultrasónico para medir nivel de agua en tanques','Sensores rápidos',5,'habilitado','2025-01-16 09:15:00'),
(6,'Sensores de luz','Sensor Luminosidad C3','Presión','sensor_luz_c3.jpg','Sensor de intensidad lumínica para cultivos de interior','Sensores de velocidad media',6,'habilitado','2025-01-17 10:00:00'),
(7,'Sensor de contacto','Sensor pH Tierra D4','Temperatura','sensor_ph_d4.jpg','Sensor de pH para monitoreo de acidez del suelo','Sensores lentos',7,'habilitado','2025-01-18 11:30:00'),
(8,'Sensor de distancia','Sensor Proximidad E5','Distancia','sensor_prox_e5.jpg','Sensor de proximidad para detección de plagas','Sensores rápidos',8,'habilitado','2025-01-19 12:45:00'),
(9,'Sensores de luz','Sensor UV F6','Presión','sensor_uv_f6.jpg','Sensor de radiación ultravioleta para protección de cultivos','Sensores de velocidad media',9,'habilitado','2025-01-20 13:20:00'),
(10,'Sensor de contacto','Sensor Conductividad G7','Temperatura','sensor_cond_g7.jpg','Sensor de conductividad eléctrica del suelo','Sensores lentos',10,'habilitado','2025-01-21 14:10:00'),
(11,'Sensor de distancia','Sensor Altura Plantas H8','Distancia','sensor_altura_h8.jpg','Sensor láser para medir altura de plantas','Sensores rápidos',11,'habilitado','2025-01-22 15:00:00'),
(12,'Sensores de luz','Sensor Fotosíntesis I9','Presión','sensor_foto_i9.jpg','Sensor para medir actividad fotosintética','Sensores de velocidad media',12,'habilitado','2025-01-23 16:30:00'),
(13,'Sensor de contacto','Sensor Temperatura Ambiente J10','Temperatura','sensor_temp_j10.jpg','Sensor de temperatura ambiente para invernaderos','Sensores lentos',13,'habilitado','2025-01-24 17:15:00'),
(14,'Sensor de distancia','Sensor Movimiento K11','Distancia','sensor_mov_k11.jpg','Sensor de movimiento para detección de animales','Sensores rápidos',14,'habilitado','2025-01-25 08:45:00'),
(15,'Sensores de luz','Sensor Espectro L12','Presión','sensor_esp_l12.jpg','Sensor de espectro lumínico completo','Sensores de velocidad media',15,'habilitado','2025-01-26 09:30:00'),
(16,'Sensor de contacto','Sensor Presión Atmosférica M13','Temperatura','sensor_pres_m13.jpg','Sensor de presión atmosférica para predicción climática','Sensores lentos',16,'habilitado','2025-01-27 10:20:00'),
(17,'Sensor de distancia','Sensor Densidad Follaje N14','Distancia','sensor_dens_n14.jpg','Sensor para medir densidad del follaje','Sensores rápidos',17,'habilitado','2025-01-28 11:10:00'),
(18,'Sensores de luz','Sensor Clorofila O15','Presión','sensor_clor_o15.jpg','Sensor para medir contenido de clorofila','Sensores de velocidad media',18,'habilitado','2025-01-29 12:00:00'),
(19,'Sensor de contacto','Sensor Vibración P16','Temperatura','sensor_vib_p16.jpg','Sensor de vibración para detección de maquinaria','Sensores lentos',19,'habilitado','2025-01-30 13:45:00'),
(20,'Sensor de distancia','Sensor Grosor Tallo Q17','Distancia','sensor_gros_q17.jpg','Sensor para medir grosor de tallos','Sensores rápidos',20,'habilitado','2025-02-01 14:30:00'),
(21,'Sensores de luz','Sensor Infrarrojo R18','Presión','sensor_ir_r18.jpg','Sensor infrarrojo para análisis térmico','Sensores de velocidad media',21,'habilitado','2025-02-02 15:20:00'),
(22,'Sensor de contacto','Sensor Humedad Relativa S19','Temperatura','sensor_hr_s19.jpg','Sensor de humedad relativa del aire','Sensores lentos',22,'habilitado','2025-02-03 16:10:00'),
(23,'Sensor de distancia','Sensor Volumen Frutos T20','Distancia','sensor_vol_t20.jpg','Sensor 3D para medir volumen de frutos','Sensores rápidos',23,'habilitado','2025-02-04 17:00:00'),
(24,'Sensores de luz','Sensor PAR U21','Presión','sensor_par_u21.jpg','Sensor de radiación fotosintéticamente activa','Sensores de velocidad media',24,'habilitado','2025-02-05 08:15:00'),
(25,'Sensor de contacto','Sensor Salinidad V22','Temperatura','sensor_sal_v22.jpg','Sensor de salinidad del suelo','Sensores lentos',25,'habilitado','2025-02-06 09:00:00'),
(26,'Sensor de distancia','Sensor Cobertura Vegetal W23','Distancia','sensor_cob_w23.jpg','Sensor para medir cobertura vegetal','Sensores rápidos',26,'habilitado','2025-02-07 10:45:00'),
(27,'Sensores de luz','Sensor Reflectancia X24','Presión','sensor_ref_x24.jpg','Sensor de reflectancia para análisis de cultivos','Sensores de velocidad media',27,'habilitado','2025-02-08 11:30:00'),
(28,'Sensor de contacto','Sensor Oxígeno Suelo Y25','Temperatura','sensor_ox_y25.jpg','Sensor de oxígeno disuelto en suelo','Sensores lentos',28,'habilitado','2025-02-09 12:15:00'),
(29,'Sensor de distancia','Sensor Pendiente Terreno Z26','Distancia','sensor_pend_z26.jpg','Sensor de inclinación para análisis topográfico','Sensores rápidos',29,'habilitado','2025-02-10 13:00:00'),
(30,'Sensores de luz','Sensor Fluorescencia AA27','Presión','sensor_fluor_aa27.jpg','Sensor de fluorescencia de clorofila','Sensores de velocidad media',30,'habilitado','2025-02-11 14:45:00'),
(31,'Sensor de contacto','Sensor Compactación BB28','Temperatura','sensor_comp_bb28.jpg','Sensor de compactación del suelo','Sensores lentos',31,'habilitado','2025-02-12 15:30:00'),
(32,'Sensor de distancia','Sensor Área Foliar CC29','Distancia','sensor_area_cc29.jpg','Sensor para calcular área foliar','Sensores rápidos',32,'habilitado','2025-02-13 16:20:00'),
(33,'Sensores de luz','Sensor Multispectral DD30','Presión','sensor_multi_dd30.jpg','Sensor multispectral para análisis avanzado','Sensores de velocidad media',33,'habilitado','2025-02-14 17:10:00'),
(34,'Sensor de contacto','Sensor Nitrato EE31','Temperatura','sensor_nit_ee31.jpg','Sensor de nitratos en suelo','Sensores lentos',34,'habilitado','2025-02-15 08:00:00'),
(35,'Sensor de distancia','Sensor Biomasa FF32','Distancia','sensor_bio_ff32.jpg','Sensor para estimar biomasa vegetal','Sensores rápidos',35,'habilitado','2025-02-16 09:45:00'),
(36,'Sensores de luz','Sensor NDVI GG33','Presión','sensor_ndvi_gg33.jpg','Sensor de índice de vegetación normalizado','Sensores de velocidad media',36,'habilitado','2025-02-17 10:30:00'),
(37,'Sensor de contacto','Sensor Fósforo HH34','Temperatura','sensor_fos_hh34.jpg','Sensor de fósforo disponible en suelo','Sensores lentos',37,'habilitado','2025-02-18 11:15:00'),
(38,'Sensor de distancia','Sensor Diámetro Copa II35','Distancia','sensor_copa_ii35.jpg','Sensor para medir diámetro de copa de árboles','Sensores rápidos',38,'habilitado','2025-02-19 12:00:00'),
(39,'Sensores de luz','Sensor Estrés Hídrico JJ36','Presión','sensor_estres_jj36.jpg','Sensor de estrés hídrico en plantas','Sensores de velocidad media',39,'habilitado','2025-02-20 13:45:00'),
(40,'Sensor de contacto','Sensor Potasio KK37','Temperatura','sensor_pot_kk37.jpg','Sensor de potasio en suelo','Sensores lentos',40,'habilitado','2025-02-21 14:30:00'),
(41,'Sensor de distancia','Sensor Rugosidad LL38','Distancia','sensor_rug_ll38.jpg','Sensor de rugosidad superficial del terreno','Sensores rápidos',41,'habilitado','2025-02-22 15:15:00'),
(42,'Sensores de luz','Sensor Calidad Fruto MM39','Presión','sensor_cal_mm39.jpg','Sensor de calidad óptica de frutos','Sensores de velocidad media',42,'habilitado','2025-02-23 16:00:00'),
(43,'Sensor de contacto','Sensor Materia Orgánica NN40','Temperatura','sensor_mo_nn40.jpg','Sensor de materia orgánica en suelo','Sensores lentos',43,'habilitado','2025-02-24 17:45:00'),
(44,'Sensor de distancia','Sensor Erosión OO41','Distancia','sensor_ero_oo41.jpg','Sensor de erosión del suelo','Sensores rápidos',44,'habilitado','2025-02-25 08:30:00'),
(45,'Sensores de luz','Sensor Madurez PP42','Presión','sensor_mad_pp42.jpg','Sensor de madurez de frutos por espectroscopía','Sensores de velocidad media',45,'habilitado','2025-02-26 09:15:00'),
(46,'Sensor de contacto','Sensor Micronutrientes QQ43','Temperatura','sensor_micro_qq43.jpg','Sensor de micronutrientes en suelo','Sensores lentos',46,'habilitado','2025-02-27 10:00:00'),
(47,'Sensor de distancia','Sensor Porosidad RR44','Distancia','sensor_por_rr44.jpg','Sensor de porosidad del suelo','Sensores rápidos',47,'habilitado','2025-02-28 11:45:00'),
(48,'Sensores de luz','Sensor Antocianinas SS45','Presión','sensor_ant_ss45.jpg','Sensor de antocianinas en frutos','Sensores de velocidad media',48,'habilitado','2025-03-01 12:30:00'),
(49,'Sensor de contacto','Sensor Carbono Orgánico TT46','Temperatura','sensor_co_tt46.jpg','Sensor de carbono orgánico en suelo','Sensores lentos',49,'habilitado','2025-03-02 13:15:00'),
(50,'Sensor de distancia','Sensor Textura Suelo UU47','Distancia','sensor_tex_uu47.jpg','Sensor de textura del suelo','Sensores rápidos',50,'habilitado','2025-03-03 14:00:00'),
(51,'Sensores de luz','Sensor Azúcares VV48','Presión','sensor_azuc_vv48.jpg','Sensor de contenido de azúcares en frutos','Sensores de velocidad media',51,'habilitado','2025-03-04 15:45:00'),
(52,'Sensor de contacto','Sensor Capacidad Campo WW49','Temperatura','sensor_cc_ww49.jpg','Sensor de capacidad de campo del suelo','Sensores lentos',52,'habilitado','2025-03-05 16:30:00'),
(53,'Sensor de distancia','Sensor Índice Área Foliar XX50','Distancia','sensor_iaf_xx50.jpg','Sensor de índice de área foliar','Sensores rápidos',53,'habilitado','2025-03-06 17:15:00');
/*!40000 ALTER TABLE `sensores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `insumos`
--

DROP TABLE IF EXISTS `insumos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `insumos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `imagen` varchar(255) DEFAULT NULL,
  `unidad_medida` enum('peso','volumen','superficie','concentración','litro','kilo') NOT NULL,
  `valor_unitario` decimal(10,2) NOT NULL,
  `cantidad` int NOT NULL,
  `valor_total` decimal(10,2) NOT NULL,
  `descripcion` text NOT NULL,
  `usuario_id` int DEFAULT NULL,
  `estado` enum('habilitado','deshabilitado') NOT NULL DEFAULT 'habilitado',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_usuario_id` (`usuario_id`),
  CONSTRAINT `fk_usuario_id` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL,
  CONSTRAINT `insumos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `insumos` (Original + 50 additional)
--

LOCK TABLES `insumos` WRITE;
/*!40000 ALTER TABLE `insumos` DISABLE KEYS */;
INSERT INTO `insumos` VALUES 
-- Original data
(1,'Fertilizante','Químico','fertilizante.jpg','kilo',10.00,95,950.00,'Fertilizante para cultivos',1,'habilitado','2025-04-22 17:40:51'),
(2,'Pesticida','Químico','pesticida.jpg','litro',20.00,47,940.00,'Pesticida para cultivos',2,'habilitado','2025-04-22 17:40:51'),
(3,'Herbicida','Químico','herbicida.jpg','litro',15.00,200,3000.00,'Herbicida para control de malezas',2,'habilitado','2025-04-22 17:40:51'),
-- Additional 50 supplies
(4,'Abono Orgánico Compost','Orgánico','compost.jpg','kilo',8.50,150,1275.00,'Compost orgánico rico en nutrientes',4,'habilitado','2025-01-15 08:30:00'),
(5,'Fungicida Cobre','Químico','fungicida_cobre.jpg','litro',25.00,80,2000.00,'Fungicida a base de cobre para hongos',5,'habilitado','2025-01-16 09:15:00'),
(6,'Semillas Tomate Cherry','Semillas','semillas_tomate.jpg','peso',45.00,20,900.00,'Semillas certificadas de tomate cherry',6,'habilitado','2025-01-17 10:00:00'),
(7,'Sustrato Fibra Coco','Sustrato','fibra_coco.jpg','kilo',12.00,100,1200.00,'Sustrato de fibra de coco para hidroponía',7,'habilitado','2025-01-18 11:30:00'),
(8,'Bioestimulante Algas','Biológico','bioestimulante.jpg','litro',35.00,30,1050.00,'Bioestimulante a base de extracto de algas',8,'habilitado','2025-01-19 12:45:00'),
(9,'Insecticida Neem','Orgánico','neem.jpg','litro',18.00,60,1080.00,'Insecticida orgánico de aceite de neem',9,'habilitado','2025-01-20 13:20:00'),
(10,'Fertilizante NPK 15-15-15','Químico','npk_15.jpg','kilo',14.00,120,1680.00,'Fertilizante balanceado NPK',10,'habilitado','2025-01-21 14:10:00'),
(11,'Semillas Lechuga Romana','Semillas','lechuga_romana.jpg','peso',28.00,25,700.00,'Semillas de lechuga romana orgánica',11,'habilitado','2025-01-22 15:00:00'),
(12,'Perlita Expandida','Sustrato','perlita.jpg','kilo',9.00,80,720.00,'Perlita expandida para mejorar drenaje',12,'habilitado','2025-01-23 16:30:00'),
(13,'Quelato Hierro','Químico','quelato_hierro.jpg','kilo',32.00,40,1280.00,'Quelato de hierro para deficiencias',13,'habilitado','2025-01-24 17:15:00'),
(14,'Bacillus Thuringiensis','Biológico','bacillus.jpg','kilo',42.00,15,630.00,'Control biológico de larvas',14,'habilitado','2025-01-25 08:45:00'),
(15,'Humus Lombriz','Orgánico','humus.jpg','kilo',6.50,200,1300.00,'Humus de lombriz californiana',15,'habilitado','2025-01-26 09:30:00'),
(16,'Semillas Pimiento Rojo','Semillas','pimiento.jpg','peso',38.00,18,684.00,'Semillas híbridas de pimiento rojo',16,'habilitado','2025-01-27 10:20:00'),
(17,'Vermiculita','Sustrato','vermiculita.jpg','kilo',11.00,70,770.00,'Vermiculita para germinación',17,'habilitado','2025-01-28 11:10:00'),
(18,'Sulfato Potasio','Químico','sulfato_potasio.jpg','kilo',16.00,90,1440.00,'Sulfato de potasio soluble',18,'habilitado','2025-01-29 12:00:00'),
(19,'Trichoderma','Biológico','trichoderma.jpg','kilo',48.00,12,576.00,'Hongo benéfico para raíces',19,'habilitado','2025-01-30 13:45:00'),
(20,'Estiércol Bovino','Orgánico','estiercol.jpg','kilo',4.00,300,1200.00,'Estiércol bovino compostado',20,'habilitado','2025-02-01 14:30:00'),
(21,'Semillas Zanahoria','Semillas','zanahoria.jpg','peso',22.00,30,660.00,'Semillas de zanahoria Nantes',21,'habilitado','2025-02-02 15:20:00'),
(22,'Turba Rubia','Sustrato','turba.jpg','kilo',13.50,85,1147.50,'Turba rubia de alta calidad',22,'habilitado','2025-02-03 16:10:00'),
(23,'Fosfato Monoamónico','Químico','fosfato.jpg','kilo',19.00,75,1425.00,'Fosfato monoamónico cristalino',23,'habilitado','2025-02-04 17:00:00'),
(24,'Beauveria Bassiana','Biológico','beauveria.jpg','kilo',55.00,10,550.00,'Hongo entomopatógeno',24,'habilitado','2025-02-05 08:15:00'),
(25,'Guano Murciélago','Orgánico','guano.jpg','kilo',15.00,60,900.00,'Guano de murciélago rico en fósforo',25,'habilitado','2025-02-06 09:00:00'),
(26,'Semillas Pepino','Semillas','pepino.jpg','peso',33.00,22,726.00,'Semillas de pepino partenocárpico',26,'habilitado','2025-02-07 10:45:00'),
(27,'Arena Sílice','Sustrato','arena_silice.jpg','kilo',7.00,150,1050.00,'Arena de sílice lavada',27,'habilitado','2025-02-08 11:30:00'),
(28,'Nitrato Calcio','Químico','nitrato_calcio.jpg','kilo',17.50,100,1750.00,'Nitrato de calcio soluble',28,'habilitado','2025-02-09 12:15:00'),
(29,'Metarhizium','Biológico','metarhizium.jpg','kilo',52.00,8,416.00,'Hongo para control de plagas',29,'habilitado','2025-02-10 13:00:00'),
(30,'Bokashi','Orgánico','bokashi.jpg','kilo',10.50,120,1260.00,'Abono fermentado japonés',30,'habilitado','2025-02-11 14:45:00'),
(31,'Semillas Calabacín','Semillas','calabacin.jpg','peso',29.00,24,696.00,'Semillas de calabacín verde',31,'habilitado','2025-02-12 15:30:00'),
(32,'Arlita Expandida','Sustrato','arlita.jpg','kilo',8.50,110,935.00,'Arcilla expandida para hidroponía',32,'habilitado','2025-02-13 16:20:00'),
(33,'Sulfato Magnesio','Químico','sulfato_magnesio.jpg','kilo',12.50,95,1187.50,'Sal de Epsom para magnesio',33,'habilitado','2025-02-14 17:10:00'),
(34,'Paecilomyces','Biológico','paecilomyces.jpg','kilo',58.00,7,406.00,'Hongo nematicida biológico',34,'habilitado','2025-02-15 08:00:00'),
(35,'Gallinaza','Orgánico','gallinaza.jpg','kilo',5.50,180,990.00,'Gallinaza compostada',35,'habilitado','2025-02-16 09:45:00'),
(36,'Semillas Rábano','Semillas','rabano.jpg','peso',18.00,35,630.00,'Semillas de rábano rojo',36,'habilitado','2025-02-17 10:30:00'),
(37,'Lana Roca','Sustrato','lana_roca.jpg','kilo',14.50,65,942.50,'Lana de roca para cultivo sin suelo',37,'habilitado','2025-02-18 11:15:00'),
(38,'Cloruro Potasio','Químico','cloruro_potasio.jpg','kilo',13.00,85,1105.00,'Cloruro de potasio granulado',38,'habilitado','2025-02-19 12:00:00'),
(39,'Lecanicillium','Biológico','lecanicillium.jpg','kilo',61.00,6,366.00,'Hongo para control de áfidos',39,'habilitado','2025-02-20 13:45:00'),
(40,'Compost Vegetal','Orgánico','compost_vegetal.jpg','kilo',7.50,160,1200.00,'Compost de restos vegetales',40,'habilitado','2025-02-21 14:30:00'),
(41,'Semillas Espinaca','Semillas','espinaca.jpg','peso',25.00,28,700.00,'Semillas de espinaca baby',41,'habilitado','2025-02-22 15:15:00'),
(42,'Cascarilla Arroz','Sustrato','cascarilla.jpg','kilo',3.50,250,875.00,'Cascarilla de arroz carbonizada',42,'habilitado','2025-02-23 16:00:00'),
(43,'Urea','Químico','urea.jpg','kilo',11.00,110,1210.00,'Urea granulada 46% nitrógeno',43,'habilitado','2025-02-24 17:45:00'),
(44,'Isaria Fumosorosea','Biológico','isaria.jpg','kilo',64.00,5,320.00,'Hongo para mosca blanca',44,'habilitado','2025-02-25 08:30:00'),
(45,'Leonardita','Orgánico','leonardita.jpg','kilo',16.50,75,1237.50,'Leonardita rica en ácidos húmicos',45,'habilitado','2025-02-26 09:15:00'),
(46,'Semillas Brócoli','Semillas','brocoli.jpg','peso',41.00,16,656.00,'Semillas de brócoli híbrido',46,'habilitado','2025-02-27 10:00:00'),
(47,'Peat Moss','Sustrato','peat_moss.jpg','kilo',18.50,55,1017.50,'Musgo de turba canadiense',47,'habilitado','2025-02-28 11:45:00'),
(48,'Superfosfato Triple','Químico','superfosfato.jpg','kilo',21.00,70,1470.00,'Superfosfato triple granulado',48,'habilitado','2025-03-01 12:30:00'),
(49,'Pochonia','Biológico','pochonia.jpg','kilo',67.00,4,268.00,'Hongo nematicida especializado',49,'habilitado','2025-03-02 13:15:00'),
(50,'Biochar','Orgánico','biochar.jpg','kilo',22.00,50,1100.00,'Carbón vegetal activado',50,'habilitado','2025-03-03 14:00:00'),
(51,'Semillas Cilantro','Semillas','cilantro.jpg','peso',19.50,32,624.00,'Semillas de cilantro aromático',51,'habilitado','2025-03-04 15:45:00'),
(52,'Zeolita','Sustrato','zeolita.jpg','kilo',26.00,45,1170.00,'Zeolita natural para retención',52,'habilitado','2025-03-05 16:30:00'),
(53,'Nitrato Amonio','Químico','nitrato_amonio.jpg','kilo',15.50,90,1395.00,'Nitrato de amonio granulado',53,'habilitado','2025-03-06 17:15:00');
/*!40000 ALTER TABLE `insumos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ciclo_cultivo`
--

DROP TABLE IF EXISTS `ciclo_cultivo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ciclo_cultivo` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text NOT NULL,
  `periodo_inicio` date NOT NULL,
  `periodo_final` date NOT NULL,
  `novedades` text,
  `usuario_id` int DEFAULT NULL,
  `estado` enum('habilitado','deshabilitado') NOT NULL DEFAULT 'habilitado',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `ciclo_cultivo_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `ciclo_cultivo` (Original + 50 additional)
--

LOCK TABLES `ciclo_cultivo` WRITE;
/*!40000 ALTER TABLE `ciclo_cultivo` DISABLE KEYS */;
INSERT INTO `ciclo_cultivo` VALUES 
-- Original data
(1,'Ciclo Primavera','Ciclo de cultivo para primavera','2025-03-01','2025-06-30','Ninguna',1,'habilitado','2025-04-22 17:40:51'),
(2,'Ciclo Verano','Ciclo de cultivo para verano','2025-07-01','2025-09-30','Ninguna',2,'habilitado','2025-04-22 17:40:51'),
(3,'Ciclo Otoño','Ciclo de cultivo para otoño','2025-10-01','2025-12-31','Ninguna',3,'habilitado','2025-04-22 17:40:51'),
-- Additional 50 cycles
(4,'Ciclo Invierno Protegido','Cultivos de invierno en invernadero','2025-01-01','2025-02-28','Uso de calefacción suplementaria',4,'habilitado','2025-01-15 08:30:00'),
(5,'Ciclo Hidropónico Continuo','Sistema hidropónico de producción continua','2025-01-01','2025-12-31','Monitoreo constante de pH y EC',5,'habilitado','2025-01-16 09:15:00'),
(6,'Ciclo Orgánico Certificado','Producción orgánica certificada','2025-02-01','2025-11-30','Certificación USDA Organic',6,'habilitado','2025-01-17 10:00:00'),
(7,'Ciclo Rotación Leguminosas','Rotación con cultivos de leguminosas','2025-03-15','2025-08-15','Fijación natural de nitrógeno',7,'habilitado','2025-01-18 11:30:00'),
(8,'Ciclo Agricultura Precisión','Cultivo con tecnología de precisión','2025-04-01','2025-10-31','Uso de drones y sensores IoT',8,'habilitado','2025-01-19 12:45:00'),
(9,'Ciclo Policultivo','Sistema de policultivo diversificado','2025-02-15','2025-09-15','Asociación de cultivos complementarios',9,'habilitado','2025-01-20 13:20:00'),
(10,'Ciclo Cultivo Vertical','Sistema de cultivo vertical indoor','2025-01-01','2025-12-31','Iluminación LED de espectro completo',10,'habilitado','2025-01-21 14:10:00'),
(11,'Ciclo Biodinámico','Agricultura biodinámica lunar','2025-03-20','2025-09-22','Seguimiento del calendario lunar',11,'habilitado','2025-01-22 15:00:00'),
(12,'Ciclo Permacultura','Sistema permacultural sostenible','2025-01-01','2025-12-31','Diseño regenerativo del ecosistema',12,'habilitado','2025-01-23 16:30:00'),
(13,'Ciclo Cultivo Protegido','Cultivos bajo malla antiáfidos','2025-02-01','2025-08-31','Protección física contra plagas',13,'habilitado','2025-01-24 17:15:00'),
(14,'Ciclo Aeroponía','Sistema aeropónico avanzado','2025-01-15','2025-12-15','Nebulización de nutrientes',14,'habilitado','2025-01-25 08:45:00'),
(15,'Ciclo Cultivo Secano','Agricultura de secano tradicional','2025-04-01','2025-09-30','Dependiente de precipitaciones',15,'habilitado','2025-01-26 09:30:00'),
(16,'Ciclo Invernadero Climatizado','Invernadero con control climático','2025-01-01','2025-12-31','Control automático de temperatura',16,'habilitado','2025-01-27 10:20:00'),
(17,'Ciclo Cultivo Intercalado','Sistema de cultivos intercalados','2025-03-01','2025-10-31','Maximización del uso del suelo',17,'habilitado','2025-01-28 11:10:00'),
(18,'Ciclo Agricultura Regenerativa','Prácticas regenerativas del suelo','2025-02-01','2025-11-30','Restauración de la biodiversidad',18,'habilitado','2025-01-29 12:00:00'),
(19,'Ciclo Cultivo Flotante','Sistema de cultivo en balsa flotante','2025-04-01','2025-09-30','Cultivo sobre lámina de agua',19,'habilitado','2025-01-30 13:45:00'),
(20,'Ciclo Microgreens','Producción de microvegetales','2025-01-01','2025-12-31','Cosecha en 7-14 días',20,'habilitado','2025-02-01 14:30:00'),
(21,'Ciclo Cultivo Nocturno','Cultivo con iluminación nocturna','2025-01-01','2025-12-31','Aprovechamiento de tarifas eléctricas',21,'habilitado','2025-02-02 15:20:00'),
(22,'Ciclo Solarización','Tratamiento de solarización del suelo','2025-06-01','2025-08-31','Desinfección natural por calor solar',22,'habilitado','2025-02-03 16:10:00'),
(23,'Ciclo Cultivo Escalonado','Siembras escalonadas semanales','2025-01-01','2025-12-31','Cosecha continua durante el año',23,'habilitado','2025-02-04 17:00:00'),
(24,'Ciclo Agricultura Urbana','Cultivo en azoteas urbanas','2025-03-01','2025-11-30','Aprovechamiento de espacios urbanos',24,'habilitado','2025-02-05 08:15:00'),
(25,'Ciclo Cultivo Subterráneo','Sistema de cultivo subterráneo','2025-01-01','2025-12-31','Temperatura constante bajo tierra',25,'habilitado','2025-02-06 09:00:00'),
(26,'Ciclo Acuaponía','Sistema acuapónico integrado','2025-02-01','2025-11-30','Combinación peces-plantas',26,'habilitado','2025-02-07 10:45:00'),
(27,'Ciclo Cultivo Desértico','Agricultura en clima desértico','2025-01-01','2025-12-31','Técnicas de conservación de agua',27,'habilitado','2025-02-08 11:30:00'),
(28,'Ciclo Cultivo Salino','Cultivo en suelos salinos','2025-03-01','2025-10-31','Plantas halófitas tolerantes',28,'habilitado','2025-02-09 12:15:00'),
(29,'Ciclo Cultivo Montaña','Agricultura de montaña','2025-04-15','2025-09-15','Adaptación a altitud y clima',29,'habilitado','2025-02-10 13:00:00'),
(30,'Ciclo Cultivo Tropical','Sistema tropical permanente','2025-01-01','2025-12-31','Alta humedad y temperatura',30,'habilitado','2025-02-11 14:45:00'),
(31,'Ciclo Cultivo Ártico','Cultivo en condiciones árticas','2025-05-01','2025-08-31','Aprovechamiento del sol de medianoche',31,'habilitado','2025-02-12 15:30:00'),
(32,'Ciclo Cultivo Marino','Agricultura marina costera','2025-01-01','2025-12-31','Uso de agua de mar tratada',32,'habilitado','2025-02-13 16:20:00'),
(33,'Ciclo Cultivo Espacial','Simulación de cultivo espacial','2025-01-01','2025-12-31','Condiciones de gravedad reducida',33,'habilitado','2025-02-14 17:10:00'),
(34,'Ciclo Cultivo Robótico','Sistema completamente robotizado','2025-01-01','2025-12-31','Automatización total del proceso',34,'habilitado','2025-02-15 08:00:00'),
(35,'Ciclo Cultivo Medicinal','Plantas medicinales certificadas','2025-02-01','2025-11-30','Estándares farmacéuticos',35,'habilitado','2025-02-16 09:45:00'),
(36,'Ciclo Cultivo Energético','Cultivos para bioenergía','2025-03-01','2025-10-31','Biomasa para biocombustibles',36,'habilitado','2025-02-17 10:30:00'),
(37,'Ciclo Cultivo Forestal','Sistema agroforestal','2025-01-01','2025-12-31','Integración árboles-cultivos',37,'habilitado','2025-02-18 11:15:00'),
(38,'Ciclo Cultivo Experimental','Variedades experimentales','2025-02-01','2025-11-30','Pruebas de nuevas variedades',38,'habilitado','2025-02-19 12:00:00'),
(39,'Ciclo Cultivo Terapéutico','Horticultura terapéutica','2025-01-01','2025-12-31','Beneficios para la salud mental',39,'habilitado','2025-02-20 13:45:00'),
(40,'Ciclo Cultivo Educativo','Huerto educativo escolar','2025-03-01','2025-11-30','Enseñanza práctica de agricultura',40,'habilitado','2025-02-21 14:30:00'),
(41,'Ciclo Cultivo Comunitario','Huerto comunitario urbano','2025-01-01','2025-12-31','Participación vecinal activa',41,'habilitado','2025-02-22 15:15:00'),
(42,'Ciclo Cultivo Gourmet','Productos gourmet especializados','2025-02-01','2025-11-30','Alta calidad gastronómica',42,'habilitado','2025-02-23 16:00:00'),
(43,'Ciclo Cultivo Exportación','Cultivos para exportación','2025-01-01','2025-12-31','Estándares internacionales',43,'habilitado','2025-02-24 17:45:00'),
(44,'Ciclo Cultivo Procesamiento','Cultivos para industria alimentaria','2025-03-01','2025-10-31','Variedades industriales',44,'habilitado','2025-02-25 08:30:00'),
(45,'Ciclo Cultivo Semillero','Producción de semillas certificadas','2025-02-01','2025-09-30','Pureza genética garantizada',45,'habilitado','2025-02-26 09:15:00'),
(46,'Ciclo Cultivo Ornamental','Plantas ornamentales comerciales','2025-01-01','2025-12-31','Mercado de jardinería',46,'habilitado','2025-02-27 10:00:00'),
(47,'Ciclo Cultivo Aromático','Hierbas aromáticas especializadas','2025-02-01','2025-11-30','Aceites esenciales naturales',47,'habilitado','2025-02-28 11:45:00'),
(48,'Ciclo Cultivo Nutracéutico','Alimentos funcionales','2025-01-01','2025-12-31','Propiedades nutricionales mejoradas',48,'habilitado','2025-03-01 12:30:00'),
(49,'Ciclo Cultivo Resistente','Variedades resistentes al cambio climático','2025-01-01','2025-12-31','Adaptación climática',49,'habilitado','2025-03-02 13:15:00'),
(50,'Ciclo Cultivo Inteligente','Agricultura 4.0 con IA','2025-01-01','2025-12-31','Inteligencia artificial aplicada',50,'habilitado','2025-03-03 14:00:00'),
(51,'Ciclo Cultivo Sostenible','Máxima sostenibilidad ambiental','2025-01-01','2025-12-31','Huella de carbono neutral',51,'habilitado','2025-03-04 15:45:00'),
(52,'Ciclo Cultivo Circular','Economía circular aplicada','2025-01-01','2025-12-31','Cero residuos, máximo aprovechamiento',52,'habilitado','2025-03-05 16:30:00'),
(53,'Ciclo Cultivo Futuro','Tecnologías emergentes','2025-01-01','2025-12-31','Innovación y desarrollo continuo',53,'habilitado','2025-03-06 17:15:00');
/*!40000 ALTER TABLE `ciclo_cultivo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cultivos`
--

DROP TABLE IF EXISTS `cultivos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cultivos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `imagen` varchar(255) DEFAULT NULL,
  `ubicacion` varchar(100) NOT NULL,
  `descripcion` text NOT NULL,
  `usuario_id` int DEFAULT NULL,
  `tamano` varchar(50) NOT NULL,
  `estado` enum('habilitado','deshabilitado') NOT NULL DEFAULT 'habilitado',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `cultivos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `cultivos` (Original + 50 additional)
--

LOCK TABLES `cultivos` WRITE;
/*!40000 ALTER TABLE `cultivos` DISABLE KEYS */;
INSERT INTO `cultivos` VALUES 
-- Original data
(1,'Tomate','Fruta','tomate.jpg','Invernadero 1','Cultivo de tomates',1,'200','habilitado','2025-04-22 17:40:51'),
(2,'Lechuga','Verdura','lechuga.jpg','Campo 2','Cultivo de lechugas',2,'100','habilitado','2025-04-22 17:40:51'),
(3,'Maíz','Cereal','maiz.jpg','Campo 3','Cultivo de maíz',3,'150','habilitado','2025-04-22 17:40:51'),
-- Additional 50 crops
(4,'Fresa','Fruta','fresa.jpg','Invernadero 2','Cultivo hidropónico de fresas','4','80','habilitado','2025-01-15 08:30:00'),
(5,'Pimiento','Verdura','pimiento.jpg','Invernadero 3','Pimientos rojos y amarillos','5','120','habilitado','2025-01-16 09:15:00'),
(6,'Pepino','Verdura','pepino.jpg','Invernadero 4','Pepinos partenocárpicos','6','90','habilitado','2025-01-17 10:00:00'),
(7,'Espinaca','Verdura','espinaca.jpg','Campo 4','Espinaca baby para ensaladas','7','60','habilitado','2025-01-18 11:30:00'),
(8,'Zanahoria','Verdura','zanahoria.jpg','Campo 5','Zanahorias Nantes','8','110','habilitado','2025-01-19 12:45:00'),
(9,'Brócoli','Verdura','brocoli.jpg','Campo 6','Brócoli híbrido','9','85','habilitado','2025-01-20 13:20:00'),
(10,'Calabacín','Verdura','calabacin.jpg','Campo 7','Calabacín verde italiano','10','95','habilitado','2025-01-21 14:10:00'),
(11,'Rábano','Verdura','rabano.jpg','Campo 8','Rábanos rojos redondos','11','40','habilitado','2025-01-22 15:00:00'),
(12,'Cilantro','Hierba','cilantro.jpg','Invernadero 5','Cilantro aromático fresco','12','30','habilitado','2025-01-23 16:30:00'),
(13,'Albahaca','Hierba','albahaca.jpg','Invernadero 6','Albahaca genovesa','13','25','habilitado','2025-01-24 17:15:00'),
(14,'Perejil','Hierba','perejil.jpg','Campo 9','Perejil rizado','14','35','habilitado','2025-01-25 08:45:00'),
(15,'Apio','Verdura','apio.jpg','Campo 10','Apio verde crujiente','15','70','habilitado','2025-01-26 09:30:00'),
(16,'Cebolla','Verdura','cebolla.jpg','Campo 11','Cebolla blanca dulce','16','130','habilitado','2025-01-27 10:20:00'),
(17,'Ajo','Verdura','ajo.jpg','Campo 12','Ajo morado','17','75','habilitado','2025-01-28 11:10:00'),
(18,'Berenjena','Fruta','berenjena.jpg','Invernadero 7','Berenjena italiana','18','100','habilitado','2025-01-29 12:00:00'),
(19,'Calabaza','Fruta','calabaza.jpg','Campo 13','Calabaza butternut','19','200','habilitado','2025-01-30 13:45:00'),
(20,'Melón','Fruta','melon.jpg','Campo 14','Melón cantaloupe','20','150','habilitado','2025-02-01 14:30:00'),
(21,'Sandía','Fruta','sandia.jpg','Campo 15','Sandía sin semillas','21','300','habilitado','2025-02-02 15:20:00'),
(22,'Acelga','Verdura','acelga.jpg','Campo 16','Acelga arcoíris','22','50','habilitado','2025-02-03 16:10:00'),
(23,'Kale','Verdura','kale.jpg','Campo 17','Kale rizado verde','23','45','habilitado','2025-02-04 17:00:00'),
(24,'Rúcula','Verdura','rucula.jpg','Invernadero 8','Rúcula silvestre','24','20','habilitado','2025-02-05 08:15:00'),
(25,'Berro','Verdura','berro.jpg','Sistema hidropónico 1','Berro de agua','25','15','habilitado','2025-02-06 09:00:00'),
(26,'Mostaza','Verdura','mostaza.jpg','Campo 18','Hojas de mostaza','26','30','habilitado','2025-02-07 10:45:00'),
(27,'Coliflor','Verdura','coliflor.jpg','Campo 19','Coliflor blanca','27','90','habilitado','2025-02-08 11:30:00'),
(28,'Repollo','Verdura','repollo.jpg','Campo 20','Repollo verde compacto','28','80','habilitado','2025-02-09 12:15:00'),
(29,'Coles de Bruselas','Verdura','coles_bruselas.jpg','Campo 21','Coles de Bruselas','29','65','habilitado','2025-02-10 13:00:00'),
(30,'Nabo','Verdura','nabo.jpg','Campo 22','Nabo blanco','30','55','habilitado','2025-02-11 14:45:00'),
(31,'Remolacha','Verdura','remolacha.jpg','Campo 23','Remolacha roja','31','60','habilitado','2025-02-12 15:30:00'),
(32,'Chícharo','Legumbre','chicharo.jpg','Campo 24','Chícharos dulces','32','70','habilitado','2025-02-13 16:20:00'),
(33,'Frijol','Legumbre','frijol.jpg','Campo 25','Frijoles verdes','33','85','habilitado','2025-02-14 17:10:00'),
(34,'Lenteja','Legumbre','lenteja.jpg','Campo 26','Lentejas rojas','34','90','habilitado','2025-02-15 08:00:00'),
(35,'Garbanzo','Legumbre','garbanzo.jpg','Campo 27','Garbanzos blancos','35','95','habilitado','2025-02-16 09:45:00'),
(36,'Soja','Legumbre','soja.jpg','Campo 28','Soja orgánica','36','120','habilitado','2025-02-17 10:30:00'),
(37,'Quinoa','Cereal','quinoa.jpg','Campo 29','Quinoa real','37','100','habilitado','2025-02-18 11:15:00'),
(38,'Amaranto','Cereal','amaranto.jpg','Campo 30','Amaranto rojo','38','75','habilitado','2025-02-19 12:00:00'),
(39,'Trigo','Cereal','trigo.jpg','Campo 31','Trigo duro','39','500','habilitado','2025-02-20 13:45:00'),
(40,'Cebada','Cereal','cebada.jpg','Campo 32','Cebada maltera','40','400','habilitado','2025-02-21 14:30:00'),
(41,'Avena','Cereal','avena.jpg','Campo 33','Avena blanca','41','350','habilitado','2025-02-22 15:15:00'),
(42,'Centeno','Cereal','centeno.jpg','Campo 34','Centeno híbrido','42','300','habilitado','2025-02-23 16:00:00'),
(43,'Sorgo','Cereal','sorgo.jpg','Campo 35','Sorgo granífero','43','250','habilitado','2025-02-24 17:45:00'),
(44,'Mijo','Cereal','mijo.jpg','Campo 36','Mijo perla','44','180','habilitado','2025-02-25 08:30:00'),
(45,'Girasol','Oleaginosa','girasol.jpg','Campo 37','Girasol alto oleico','45','200','habilitado','2025-02-26 09:15:00'),
(46,'Canola','Oleaginosa','canola.jpg','Campo 38','Canola híbrida','46','150','habilitado','2025-02-27 10:00:00'),
(47,'Cártamo','Oleaginosa','cartamo.jpg','Campo 39','Cártamo sin espinas','47','120','habilitado','2025-02-28 11:45:00'),
(48,'Sésamo','Oleaginosa','sesamo.jpg','Campo 40','Sésamo blanco','48','80','habilitado','2025-03-01 12:30:00'),
(49,'Chía','Oleaginosa','chia.jpg','Campo 41','Chía negra','49','60','habilitado','2025-03-02 13:15:00'),
(50,'Linaza','Oleaginosa','linaza.jpg','Campo 42','Linaza dorada','50','70','habilitado','2025-03-03 14:00:00'),
(51,'Menta','Hierba','menta.jpg','Invernadero 9','Menta piperita','51','25','habilitado','2025-03-04 15:45:00'),
(52,'Orégano','Hierba','oregano.jpg','Invernadero 10','Orégano mediterráneo','52','20','habilitado','2025-03-05 16:30:00'),
(53,'Tomillo','Hierba','tomillo.jpg','Campo 43','Tomillo común','53','15','habilitado','2025-03-06 17:15:00');
/*!40000 ALTER TABLE `cultivos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `producciones`
--

DROP TABLE IF EXISTS `producciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `producciones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `ubicacion` varchar(100) NOT NULL,
  `descripcion` text NOT NULL,
  `usuario_id` int DEFAULT NULL,
  `cantidad` decimal(10,2) NOT NULL,
  `estado` enum('habilitado','deshabilitado') NOT NULL DEFAULT 'habilitado',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `cultivo_id` int DEFAULT NULL,
  `ciclo_id` int DEFAULT NULL,
  `fecha_de_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `inversion` decimal(10,2) DEFAULT NULL,
  `meta_ganancia` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `cultivo_id` (`cultivo_id`),
  KEY `ciclo_id` (`ciclo_id`),
  CONSTRAINT `producciones_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL,
  CONSTRAINT `producciones_ibfk_2` FOREIGN KEY (`cultivo_id`) REFERENCES `cultivos` (`id`) ON DELETE SET NULL,
  CONSTRAINT `producciones_ibfk_3` FOREIGN KEY (`ciclo_id`) REFERENCES `ciclo_cultivo` (`id`) ON DELETE SET NULL,
  CONSTRAINT `chk_meta_ganancia` CHECK ((`meta_ganancia` >= `inversion`))
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `producciones` (Original + 50 additional)
--

LOCK TABLES `producciones` WRITE;
/*!40000 ALTER TABLE `producciones` DISABLE KEYS */;
INSERT INTO `producciones` VALUES 
-- Original data
(1,'Producción de Tomates 2025','Orgánica','Invernadero 1','Producción de tomates orgánicos',1,40.00,'habilitado','2025-04-22 17:40:51',1,1,'2025-03-01','2025-06-30',10000.00,15000.00),
(2,'Producción de Maíz Verano','Tradicional','Campo 3','Producción de maíz para temporada de verano',3,50.00,'habilitado','2025-04-22 17:40:51',3,2,'2025-07-01','2025-09-30',15000.00,20000.00),
(3,'Producción de Fresas','Hidropónica','Invernadero 2','Producción de fresas en sistema hidropónico',8,10.00,'habilitado','2025-04-22 17:40:51',4,8,'2025-01-15','2025-12-15',8000.00,12000.00),
-- Additional 50 productions
(4,'Producción Lechuga Orgánica','Orgánica','Campo 2','Lechugas orgánicas certificadas',4,25.00,'habilitado','2025-01-15 08:30:00',2,6,'2025-02-01','2025-11-30',5000.00,8000.00),
(5,'Producción Pimientos Hidropónicos','Hidropónica','Invernadero 3','Pimientos en sistema NFT',5,35.00,'habilitado','2025-01-16 09:15:00',5,5,'2025-01-01','2025-12-31',12000.00,18000.00),
(6,'Producción Pepinos Protegidos','Protegida','Invernadero 4','Pepinos bajo malla antiinsectos',6,30.00,'habilitado','2025-01-17 10:00:00',6,13,'2025-02-01','2025-08-31',9000.00,14000.00),
(7,'Producción Espinaca Baby','Intensiva','Campo 4','Espinaca baby para mercado gourmet',7,20.00,'habilitado','2025-01-18 11:30:00',7,42,'2025-02-01','2025-11-30',4000.00,7000.00),
(8,'Producción Zanahoria Nantes','Tradicional','Campo 5','Zanahorias para mercado local',8,45.00,'habilitado','2025-01-19 12:45:00',8,1,'2025-03-01','2025-06-30',6000.00,9500.00),
(9,'Producción Brócoli Premium','Orgánica','Campo 6','Brócoli orgánico premium',9,28.00,'habilitado','2025-01-20 13:20:00',9,6,'2025-02-01','2025-11-30',7000.00,11000.00),
(10,'Producción Calabacín Continuo','Escalonada','Campo 7','Calabacín con siembras escalonadas',10,32.00,'habilitado','2025-01-21 14:10:00',10,23,'2025-01-01','2025-12-31',5500.00,8500.00),
(11,'Producción Rábano Rápido','Intensiva','Campo 8','Rábanos de ciclo corto',11,15.00,'habilitado','2025-01-22 15:00:00',11,20,'2025-01-01','2025-12-31',2000.00,4000.00),
(12,'Producción Cilantro Aromático','Hidropónica','Invernadero 5','Cilantro hidropónico aromático',12,12.00,'habilitado','2025-01-23 16:30:00',12,5,'2025-01-01','2025-12-31',3000.00,5500.00),
(13,'Producción Albahaca Gourmet','Vertical','Invernadero 6','Albahaca en sistema vertical',13,8.00,'habilitado','2025-01-24 17:15:00',13,10,'2025-01-01','2025-12-31',4000.00,7000.00),
(14,'Producción Perejil Rizado','Aeropónica','Invernadero 11','Perejil en sistema aeropónico',14,10.00,'habilitado','2025-01-25 08:45:00',14,14,'2025-01-15','2025-12-15',3500.00,6000.00),
(15,'Producción Apio Crujiente','Tradicional','Campo 10','Apio para mercado fresco',15,22.00,'habilitado','2025-01-26 09:30:00',15,1,'2025-03-01','2025-06-30',5000.00,8000.00),
(16,'Producción Cebolla Dulce','Secano','Campo 11','Cebolla blanca de secano',16,55.00,'habilitado','2025-01-27 10:20:00',16,15,'2025-04-01','2025-09-30',8000.00,12000.00),
(17,'Producción Ajo Morado','Tradicional','Campo 12','Ajo morado de siembra otoñal',17,18.00,'habilitado','2025-01-28 11:10:00',17,3,'2025-10-01','2025-12-31',4500.00,7500.00),
(18,'Producción Berenjena Italiana','Protegida','Invernadero 7','Berenjena bajo invernadero',18,25.00,'habilitado','2025-01-29 12:00:00',18,16,'2025-01-01','2025-12-31',7000.00,11000.00),
(19,'Producción Calabaza Butternut','Extensiva','Campo 13','Calabaza para almacenamiento',19,80.00,'habilitado','2025-01-30 13:45:00',19,1,'2025-03-01','2025-06-30',10000.00,15000.00),
(20,'Producción Melón Cantaloupe','Protegida','Campo 14','Melón bajo túneles',20,60.00,'habilitado','2025-02-01 14:30:00',20,13,'2025-02-01','2025-08-31',12000.00,18000.00),
(21,'Producción Sandía Sin Semillas','Tradicional','Campo 15','Sandía triploide',21,120.00,'habilitado','2025-02-02 15:20:00',21,2,'2025-07-01','2025-09-30',15000.00,22000.00),
(22,'Producción Acelga Arcoíris','Orgánica','Campo 16','Acelga multicolor orgánica',22,18.00,'habilitado','2025-02-03 16:10:00',22,6,'2025-02-01','2025-11-30',3500.00,6000.00),
(23,'Producción Kale Superfood','Orgánica','Campo 17','Kale para mercado saludable',23,16.00,'habilitado','2025-02-04 17:00:00',23,6,'2025-02-01','2025-11-30',4000.00,7000.00),
(24,'Producción Rúcula Silvestre','Urbana','Invernadero 8','Rúcula en azotea urbana',24,6.00,'habilitado','2025-02-05 08:15:00',24,24,'2025-03-01','2025-11-30',2000.00,4000.00),
(25,'Producción Berro Acuático','Acuapónica','Sistema hidropónico 1','Berro en sistema acuapónico',25,5.00,'habilitado','2025-02-06 09:00:00',25,26,'2025-02-01','2025-11-30',3000.00,5000.00),
(26,'Producción Mostaza Picante','Intensiva','Campo 18','Hojas de mostaza picante',26,12.00,'habilitado','2025-02-07 10:45:00',26,23,'2025-01-01','2025-12-31',2500.00,4500.00),
(27,'Producción Coliflor Blanca','Tradicional','Campo 19','Coliflor de cabeza compacta',27,35.00,'habilitado','2025-02-08 11:30:00',27,1,'2025-03-01','2025-06-30',6000.00,9500.00),
(28,'Producción Repollo Verde','Tradicional','Campo 20','Repollo verde compacto',28,40.00,'habilitado','2025-02-09 12:15:00',28,1,'2025-03-01','2025-06-30',5500.00,8500.00),
(29,'Producción Coles Bruselas','Especializada','Campo 21','Coles de Bruselas gourmet',29,20.00,'habilitado','2025-02-10 13:00:00',29,42,'2025-02-01','2025-11-30',4500.00,7500.00),
(30,'Producción Nabo Blanco','Tradicional','Campo 22','Nabo para mercado local',30,25.00,'habilitado','2025-02-11 14:45:00',30,1,'2025-03-01','2025-06-30',3000.00,5000.00),
(31,'Producción Remolacha Roja','Orgánica','Campo 23','Remolacha orgánica certificada',31,22.00,'habilitado','2025-02-12 15:30:00',31,6,'2025-02-01','2025-11-30',4000.00,6500.00),
(32,'Producción Chícharos Dulces','Rotación','Campo 24','Chícharos en rotación con leguminosas',32,28.00,'habilitado','2025-02-13 16:20:00',32,7,'2025-03-15','2025-08-15',5000.00,8000.00),
(33,'Producción Frijoles Verdes','Rotación','Campo 25','Frijoles verdes tiernos',33,32.00,'habilitado','2025-02-14 17:10:00',33,7,'2025-03-15','2025-08-15',5500.00,8500.00),
(34,'Producción Lentejas Rojas','Extensiva','Campo 26','Lentejas para grano seco',34,38.00,'habilitado','2025-02-15 08:00:00',34,7,'2025-03-15','2025-08-15',6000.00,9000.00),
(35,'Producción Garbanzos Blancos','Extensiva','Campo 27','Garbanzos para consumo directo',35,42.00,'habilitado','2025-02-16 09:45:00',35,7,'2025-03-15','2025-08-15',7000.00,10500.00),
(36,'Producción Soja Orgánica','Extensiva','Campo 28','Soja orgánica certificada',36,65.00,'habilitado','2025-02-17 10:30:00',36,6,'2025-02-01','2025-11-30',12000.00,18000.00),
(37,'Producción Quinoa Real','Especializada','Campo 29','Quinoa andina premium',37,45.00,'habilitado','2025-02-18 11:15:00',37,49,'2025-01-01','2025-12-31',10000.00,16000.00),
(38,'Producción Amaranto Rojo','Experimental','Campo 30','Amaranto para investigación',38,30.00,'habilitado','2025-02-19 12:00:00',38,38,'2025-02-01','2025-11-30',8000.00,12000.00),
(39,'Producción Trigo Duro','Extensiva','Campo 31','Trigo para panificación',39,200.00,'habilitado','2025-02-20 13:45:00',39,15,'2025-04-01','2025-09-30',25000.00,35000.00),
(40,'Producción Cebada Maltera','Extensiva','Campo 32','Cebada para industria cervecera',40,180.00,'habilitado','2025-02-21 14:30:00',40,15,'2025-04-01','2025-09-30',22000.00,32000.00),
(41,'Producción Avena Blanca','Extensiva','Campo 33','Avena para consumo humano',41,160.00,'habilitado','2025-02-22 15:15:00',41,15,'2025-04-01','2025-09-30',20000.00,28000.00),
(42,'Producción Centeno Híbrido','Extensiva','Campo 34','Centeno para panificación',42,140.00,'habilitado','2025-02-23 16:00:00',42,15,'2025-04-01','2025-09-30',18000.00,26000.00),
(43,'Producción Sorgo Granífero','Extensiva','Campo 35','Sorgo para alimentación animal',43,120.00,'habilitado','2025-02-24 17:45:00',43,15,'2025-04-01','2025-09-30',15000.00,22000.00),
(44,'Producción Mijo Perla','Especializada','Campo 36','Mijo para mercado saludable',44,85.00,'habilitado','2025-02-25 08:30:00',44,49,'2025-01-01','2025-12-31',12000.00,18000.00),
(45,'Producción Girasol Alto Oleico','Extensiva','Campo 37','Girasol para aceite premium',45,95.00,'habilitado','2025-02-26 09:15:00',45,15,'2025-04-01','2025-09-30',14000.00,21000.00),
(46,'Producción Canola Híbrida','Extensiva','Campo 38','Canola para biodiesel',46,75.00,'habilitado','2025-02-27 10:00:00',46,36,'2025-03-01','2025-10-31',13000.00,19000.00),
(47,'Producción Cártamo Sin Espinas','Especializada','Campo 39','Cártamo para aceite cosmético',47,60.00,'habilitado','2025-02-28 11:45:00',47,15,'2025-04-01','2025-09-30',11000.00,16000.00),
(48,'Producción Sésamo Blanco','Especializada','Campo 40','Sésamo para tahini',48,35.00,'habilitado','2025-03-01 12:30:00',48,49,'2025-01-01','2025-12-31',8000.00,13000.00),
(49,'Producción Chía Negra','Superfood','Campo 41','Chía para mercado saludable',49,25.00,'habilitado','2025-03-02 13:15:00',49,49,'2025-01-01','2025-12-31',9000.00,15000.00),
(50,'Producción Linaza Dorada','Nutracéutica','Campo 42','Linaza para suplementos',50,30.00,'habilitado','2025-03-03 14:00:00',50,48,'2025-01-01','2025-12-31',7500.00,12000.00),
(51,'Producción Menta Piperita','Aromática','Invernadero 9','Menta para aceites esenciales',51,8.00,'habilitado','2025-03-04 15:45:00',51,47,'2025-02-01','2025-11-30',4000.00,7000.00),
(52,'Producción Orégano Mediterráneo','Aromática','Invernadero 10','Orégano seco premium',52,6.00,'habilitado','2025-03-05 16:30:00',52,47,'2025-02-01','2025-11-30',3500.00,6000.00),
(53,'Producción Tomillo Común','Medicinal','Campo 43','Tomillo para fitoterapia',53,5.00,'habilitado','2025-03-06 17:15:00',53,35,'2025-02-01','2025-11-30',3000.00,5500.00);
/*!40000 ALTER TABLE `producciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `uso_insumo`
--

DROP TABLE IF EXISTS `uso_insumo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uso_insumo` (
  `id` int NOT NULL AUTO_INCREMENT,
  `produccion_id` int NOT NULL,
  `insumo_id` int NOT NULL,
  `cantidad_utilizada` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_produccion_id` (`produccion_id`),
  KEY `fk_insumo_id` (`insumo_id`),
  CONSTRAINT `fk_produccion_id` FOREIGN KEY (`produccion_id`) REFERENCES `producciones` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_insumo_id` FOREIGN KEY (`insumo_id`) REFERENCES `insumos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `uso_insumo` (100 usage records)
--

LOCK TABLES `uso_insumo` WRITE;
/*!40000 ALTER TABLE `uso_insumo` DISABLE KEYS */;
INSERT INTO `uso_insumo` VALUES 
-- Production 1 (Tomates) uses various inputs
(1,1,1,15.50), (2,1,4,25.00), (3,1,8,5.00), (4,1,10,20.00),
-- Production 2 (Maíz) uses different inputs
(5,2,1,30.00), (6,2,2,8.00), (7,2,18,12.00), (8,2,23,15.00),
-- Production 3 (Fresas) hydroponic system
(9,3,7,18.00), (10,3,13,8.00), (11,3,17,12.00), (12,3,28,10.00),
-- Production 4 (Lechuga Orgánica)
(13,4,4,20.00), (14,4,15,30.00), (15,4,9,6.00), (16,4,25,15.00),
-- Production 5 (Pimientos Hidropónicos)
(17,5,7,22.00), (18,5,10,18.00), (19,5,13,12.00), (20,5,28,14.00),
-- Production 6 (Pepinos Protegidos)
(21,6,1,12.00), (22,6,5,4.00), (23,6,17,15.00), (24,6,33,8.00),
-- Production 7 (Espinaca Baby)
(25,7,4,15.00), (26,7,15,20.00), (27,7,22,10.00), (28,7,30,12.00),
-- Production 8 (Zanahoria)
(29,8,1,25.00), (30,8,20,40.00), (31,8,18,15.00), (32,8,23,10.00),
-- Production 9 (Brócoli Premium)
(33,9,4,18.00), (34,9,15,25.00), (35,9,9,5.00), (36,9,25,12.00),
-- Production 10 (Calabacín Continuo)
(37,10,1,20.00), (38,10,4,22.00), (39,10,10,16.00), (40,10,18,12.00),
-- Production 11 (Rábano Rápido)
(41,11,4,8.00), (42,11,15,12.00), (43,11,30,6.00), (44,11,40,10.00),
-- Production 12 (Cilantro Aromático)
(45,12,7,10.00), (46,12,13,6.00), (47,12,28,8.00), (48,12,33,5.00),
-- Production 13 (Albahaca Gourmet)
(49,13,7,8.00), (50,13,17,6.00), (51,13,28,5.00), (52,13,33,4.00),
-- Production 14 (Perejil Rizado)
(53,14,7,6.00), (54,14,13,4.00), (55,14,28,6.00), (56,14,33,3.00),
-- Production 15 (Apio Crujiente)
(57,15,1,18.00), (58,15,4,20.00), (59,15,18,12.00), (60,15,23,8.00),
-- Production 16 (Cebolla Dulce)
(61,16,1,35.00), (62,16,20,50.00), (63,16,18,20.00), (64,16,38,15.00),
-- Production 17 (Ajo Morado)
(65,17,1,12.00), (66,17,4,15.00), (67,17,18,8.00), (68,17,33,6.00),
-- Production 18 (Berenjena Italiana)
(69,18,1,15.00), (70,18,7,12.00), (71,18,10,14.00), (72,18,28,10.00),
-- Production 19 (Calabaza Butternut)
(73,19,1,40.00), (74,19,20,60.00), (75,19,18,25.00), (76,19,23,20.00),
-- Production 20 (Melón Cantaloupe)
(77,20,1,30.00), (78,20,4,25.00), (79,20,18,18.00), (80,20,28,15.00),
-- Production 21 (Sandía Sin Semillas)
(81,21,1,50.00), (82,21,20,80.00), (83,21,18,30.00), (84,21,23,25.00),
-- Production 22 (Acelga Arcoíris)
(85,22,4,12.00), (86,22,15,18.00), (87,22,9,4.00), (88,22,25,8.00),
-- Production 23 (Kale Superfood)
(89,23,4,10.00), (90,23,15,15.00), (91,23,9,3.00), (92,23,25,6.00),
-- Production 24 (Rúcula Silvestre)
(93,24,4,4.00), (94,24,15,6.00), (95,24,30,3.00), (96,24,40,4.00),
-- Production 25 (Berro Acuático)
(97,25,13,3.00), (98,25,28,4.00), (99,25,33,2.00), (100,25,8,2.00);
/*!40000 ALTER TABLE `uso_insumo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `uso_sensor`
--

DROP TABLE IF EXISTS `uso_sensor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uso_sensor` (
   `id` int NOT NULL AUTO_INCREMENT,
   `produccion_id` int NOT NULL,
   `sensor_id` int NULL,
   PRIMARY KEY (`id`),
   KEY `fk_uso_sensor_produccion_id` (`produccion_id`),
   KEY `fk_uso_sensor_sensor_id` (`sensor_id`),
   CONSTRAINT `fk_uso_sensor_produccion_id` FOREIGN KEY (`produccion_id`) REFERENCES `producciones` (`id`) ON DELETE CASCADE,
   CONSTRAINT `fk_uso_sensor_sensor_id` FOREIGN KEY (`sensor_id`) REFERENCES `sensores` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `uso_sensor` (75 sensor usage records)
--

LOCK TABLES `uso_sensor` WRITE;
/*!40000 ALTER TABLE `uso_sensor` DISABLE KEYS */;
INSERT INTO `uso_sensor` VALUES 
-- Production 1 (Tomates) uses multiple sensors
(1,1,1), (2,1,4), (3,1,13), (4,1,21),
-- Production 2 (Maíz) uses field sensors
(5,2,1), (6,2,16), (7,2,19), (8,2,29),
-- Production 3 (Fresas) hydroponic sensors
(9,3,4), (10,3,5), (11,3,10), (12,3,28),
-- Production 4 (Lechuga Orgánica)
(13,4,4), (14,4,22), (15,4,34), (16,4,40),
-- Production 5 (Pimientos Hidropónicos)
(17,5,1), (18,5,4), (19,5,13), (20,5,28),
-- Production 6 (Pepinos Protegidos)
(21,6,1), (22,6,8), (23,6,14), (24,6,22),
-- Production 7 (Espinaca Baby)
(25,7,4), (26,7,22), (27,7,34), (28,7,46),
-- Production 8 (Zanahoria)
(29,8,4), (30,8,16), (31,8,28), (32,8,37),
-- Production 9 (Brócoli Premium)
(33,9,4), (34,9,22), (35,9,34), (36,9,40),
-- Production 10 (Calabacín Continuo)
(37,10,1), (38,10,4), (39,10,13), (40,10,22),
-- Production 11 (Rábano Rápido)
(41,11,4), (42,11,22), (43,11,46), (44,11,52),
-- Production 12 (Cilantro Aromático)
(45,12,4), (46,12,10), (47,12,28), (48,12,33),
-- Production 13 (Albahaca Gourmet)
(49,13,4), (50,13,10), (51,13,28), (52,13,33),
-- Production 14 (Perejil Rizado)
(53,14,4), (54,14,10), (55,14,28), (56,14,33),
-- Production 15 (Apio Crujiente)
(57,15,1), (58,15,4), (59,15,16), (60,15,22),
-- Production 16 (Cebolla Dulce)
(61,16,4), (62,16,16), (63,16,28), (64,16,37),
-- Production 17 (Ajo Morado)
(65,17,4), (66,17,16), (67,17,28), (68,17,37),
-- Production 18 (Berenjena Italiana)
(69,18,1), (70,18,4), (71,18,13), (72,18,22),
-- Production 19 (Calabaza Butternut)
(73,19,1), (74,19,16), (75,19,29);
/*!40000 ALTER TABLE `uso_sensor` ENABLE KEYS */;
UNLOCK TABLES;

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-23 17:15:00
