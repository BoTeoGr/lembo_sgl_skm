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
  `rol` varchar(50) NOT NULL,
  `estado` enum('habilitado','deshabilitado') NOT NULL DEFAULT 'habilitado',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `correo` (`correo`),
  UNIQUE KEY `numero_documento` (`numero_documento`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES 
-- Estos datos datos deben ser actualizados para que tengan contraseña
(1,'Cédula','1000000000','Administrador','3111111111','admin@example.com',SHA2('Admin123!', 256),'admin','habilitado','2025-04-22 17:40:51'),
(2,'Cédula','1000000001','Gerente','3111111112','gerente@example.com',SHA2('Gerente123!', 256),'superadmin','habilitado','2025-04-22 17:40:51'),
(3,'Cédula','1000000002','Supervisor','3111111113','supervisor@example.com',SHA2('Supervisor123!', 256),'admin','habilitado','2025-04-22 17:40:51');/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
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
-- Dumping data for table `sensores`
--

LOCK TABLES `sensores` WRITE;
/*!40000 ALTER TABLE `sensores` DISABLE KEYS */;
INSERT INTO `sensores` VALUES 
(1,'Sensor de contacto','Sensor 1','Temperatura','sensor1.jpg','Sensor de temperatura de contacto','Sensores lentos',1,'habilitado','2025-04-22 17:40:51'),
(2,'Sensor de distancia','Sensor 2','Distancia','sensor2.jpg','Sensor de distancia láser','Sensores rápidos',2,'habilitado','2025-04-22 17:40:51'),
(3,'Sensores de luz','Sensor 3','Temperatura','sensor3.jpg','Sensor de intensidad lumínica','Sensores de velocidad media',3,'habilitado','2025-04-22 17:40:51');
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
-- Dumping data for table `insumos`
--

LOCK TABLES `insumos` WRITE;
/*!40000 ALTER TABLE `insumos` DISABLE KEYS */;
INSERT INTO `insumos` VALUES 
(1,'Fertilizante','Químico','fertilizante.jpg','kilo',10.00,95,950.00,'Fertilizante para cultivos',1,'habilitado','2025-04-22 17:40:51'),
(2,'Pesticida','Químico','pesticida.jpg','litro',20.00,47,940.00,'Pesticida para cultivos',2,'habilitado','2025-04-22 17:40:51'),
(3,'Herbicida','Químico','herbicida.jpg','litro',15.00,200,3000.00,'Herbicida para control de malezas',2,'habilitado','2025-04-22 17:40:51');
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
-- Dumping data for table `ciclo_cultivo`
--

LOCK TABLES `ciclo_cultivo` WRITE;
/*!40000 ALTER TABLE `ciclo_cultivo` DISABLE KEYS */;
INSERT INTO `ciclo_cultivo` VALUES 
(1,'Ciclo Primavera','Ciclo de cultivo para primavera','2025-03-01','2025-06-30','Ninguna',1,'habilitado','2025-04-22 17:40:51'),
(2,'Ciclo Verano','Ciclo de cultivo para verano','2025-07-01','2025-09-30','Ninguna',2,'habilitado','2025-04-22 17:40:51'),
(3,'Ciclo Otoño','Ciclo de cultivo para otoño','2025-10-01','2025-12-31','Ninguna',3,'habilitado','2025-04-22 17:40:51');
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
-- Dumping data for table `cultivos`
--

LOCK TABLES `cultivos` WRITE;
/*!40000 ALTER TABLE `cultivos` DISABLE KEYS */;
INSERT INTO `cultivos` VALUES 
(1,'Tomate','Fruta','tomate.jpg','Invernadero 1','Cultivo de tomates',1,'200','habilitado','2025-04-22 17:40:51'),
(2,'Lechuga','Verdura','lechuga.jpg','Campo 2','Cultivo de lechugas',2,'100','habilitado','2025-04-22 17:40:51'),
(3,'Maíz','Cereal','maiz.jpg','Campo 3','Cultivo de maíz',3,'150','habilitado','2025-04-22 17:40:51');
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
-- Dumping data for table `producciones`
--

LOCK TABLES `producciones` WRITE;
/*!40000 ALTER TABLE `producciones` DISABLE KEYS */;
INSERT INTO `producciones` VALUES 
(1,'Producción de Tomates 2025','Orgánica','Invernadero 1','Producción de tomates orgánicos',1, 40, 'habilitado','2025-04-22 17:40:51',1,1,NULL,NULL,10000.00,15000.00),
(2,'Producción de Maíz Verano','Tradicional','Campo 3','Producción de maíz para temporada de verano',3, 50,'habilitado','2025-04-22 17:40:51',3,2,NULL,NULL,15000.00,20000.00),
(3,'Producción de Fresas','Hidropónica','Invernadero 2','Producción de fresas en sistema hidropónico',8, 10,'habilitado','2025-04-22 17:40:51',8,8,NULL,NULL,8000.00,12000.00);
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

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-14 23:29:43