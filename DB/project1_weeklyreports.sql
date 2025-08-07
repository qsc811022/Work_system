-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: project1
-- ------------------------------------------------------
-- Server version	8.0.42

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
-- Table structure for table `weeklyreports`
--

DROP TABLE IF EXISTS `weeklyreports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `weeklyreports` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `UserId` int NOT NULL,
  `StartDate` date NOT NULL,
  `EndDate` date NOT NULL,
  `ReportText` text NOT NULL,
  `CustomNotes` text,
  `TotalHours` decimal(5,2) DEFAULT '0.00',
  `WorkDays` int DEFAULT '0',
  `TaskCount` int DEFAULT '0',
  `Status` enum('draft','submitted','approved') DEFAULT 'submitted',
  `SubmittedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `CreatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`),
  KEY `idx_user_date` (`UserId`,`StartDate`,`EndDate`),
  KEY `idx_status` (`Status`),
  CONSTRAINT `weeklyreports_ibfk_1` FOREIGN KEY (`UserId`) REFERENCES `users` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `weeklyreports`
--

LOCK TABLES `weeklyreports` WRITE;
/*!40000 ALTER TABLE `weeklyreports` DISABLE KEYS */;
INSERT INTO `weeklyreports` VALUES (1,2,'2024-08-05','2024-08-11','本週完成會議與開發新功能','',15.00,5,3,'submitted','2025-08-07 19:16:34','2025-08-07 19:16:34'),(2,3,'2024-08-05','2024-08-11','本週主要撰寫文件及除錯','',8.00,5,2,'submitted','2025-08-07 19:16:34','2025-08-07 19:16:34'),(3,4,'2024-08-05','2024-08-11','參與產品會議與測試驗證','',6.00,5,2,'submitted','2025-08-07 19:16:34','2025-08-07 19:16:34'),(4,5,'2024-08-05','2024-08-11','進行程式優化','',3.00,5,1,'submitted','2025-08-07 19:16:34','2025-08-07 19:16:34'),(5,6,'2024-08-05','2024-08-11','協助測試與技術文件編輯','',6.00,5,2,'submitted','2025-08-07 19:16:34','2025-08-07 19:16:34');
/*!40000 ALTER TABLE `weeklyreports` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-07 22:30:06
