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
-- Table structure for table `reportdrafts`
--

DROP TABLE IF EXISTS `reportdrafts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reportdrafts` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `UserId` int NOT NULL,
  `StartDate` date NOT NULL,
  `EndDate` date NOT NULL,
  `CustomNotes` text,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `unique_user_period` (`UserId`,`StartDate`,`EndDate`),
  CONSTRAINT `reportdrafts_ibfk_1` FOREIGN KEY (`UserId`) REFERENCES `users` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reportdrafts`
--

LOCK TABLES `reportdrafts` WRITE;
/*!40000 ALTER TABLE `reportdrafts` DISABLE KEYS */;
INSERT INTO `reportdrafts` VALUES (1,1,'2025-08-04','2025-08-10','下禮拜處理AMD專案','2025-08-08 20:41:59','2025-08-08 20:41:59');
/*!40000 ALTER TABLE `reportdrafts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `RoleName` varchar(20) NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `RoleName` (`RoleName`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'admin'),(2,'employee');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `UserName` varchar(50) NOT NULL,
  `PasswordHash` varchar(255) NOT NULL,
  `RoleId` int NOT NULL,
  `CreatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `UserName` (`UserName`),
  KEY `RoleId` (`RoleId`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`RoleId`) REFERENCES `roles` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'tedliu1111','$2a$10$BAnHggDcW4KIxTYP8.DpiOotQS4F39IZh7bE8P3S897JUrwyo/kqS',3,'2025-08-06 21:19:05'),(2,'admin','$2a$10$NSFWIREPGsIPrKuFUZ/24u.1B2sGAX3DjOz4X35f5VxNY0ggwr2Je',1,'2025-08-06 21:22:02'),(3,'alice','hash_alice',3,'2025-08-07 19:16:06'),(4,'bob','hash_bob',3,'2025-08-07 19:16:06'),(5,'cathy','hash_cathy',3,'2025-08-07 19:16:06'),(6,'david','hash_david',3,'2025-08-07 19:16:06'),(7,'emma','hash_emma',3,'2025-08-07 19:16:06'),(8,'tedliu1234','$2a$10$nnqUsFSTLlxTZcJuvtGlru7.lh7m5QEs.On2I1QQW3T6u6g1SauSm',3,'2025-08-07 20:02:00');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `weeklyreportdrafts`
--

DROP TABLE IF EXISTS `weeklyreportdrafts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `weeklyreportdrafts` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `UserId` int NOT NULL,
  `StartDate` date NOT NULL,
  `EndDate` date NOT NULL,
  `ReportText` text,
  `CustomNotes` text,
  `CreatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `unique_user_period` (`UserId`,`StartDate`,`EndDate`),
  CONSTRAINT `weeklyreportdrafts_ibfk_1` FOREIGN KEY (`UserId`) REFERENCES `users` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `weeklyreportdrafts`
--

LOCK TABLES `weeklyreportdrafts` WRITE;
/*!40000 ALTER TABLE `weeklyreportdrafts` DISABLE KEYS */;
INSERT INTO `weeklyreportdrafts` VALUES (1,1,'2025-08-04','2025-08-06','=== 週報 ===\n期間：2025-08-04 至 2025-08-06\n員工：tedliu1111\n\n【Mon Aug 04 2025 00:00:00 GMT+0800 (台北標準時間) (一)】\n• 09:00:00-11:46:00 Meeting：客戶需求討論\n• 12:16:00-13:14:00 Testing：單元測試撰寫\n• 13:44:00-17:00:00 Meeting：專案進度會議\n• 17:30:00-18:00:00 Code Review：Security Code Review\n  小計：NaN小時\n\n【Tue Aug 05 2025 00:00:00 GMT+0800 (台北標準時間) (二)】\n• 09:00:00-11:46:00 Document：系統規格文件\n• 12:16:00-13:46:00 Document：撰寫使用手冊\n• 14:16:00-15:41:00 Code Review：Security Code Review\n  小計：NaN小時\n\n【Wed Aug 06 2025 00:00:00 GMT+0800 (台北標準時間) (三)】\n• 09:00:00-10:42:00 Code Review：Review 同事的程式碼\n• 11:12:00-13:06:00 Coding：實作 API 介面\n• 13:36:00-14:44:00 Testing：單元測試撰寫\n  小計：NaN小時\n\n=== 工作類型統計 ===\n• Meeting：NaN小時 (NaN%)\n• Testing：NaN小時 (NaN%)\n• Code Review：NaN小時 (NaN%)\n• Document：NaN小時 (NaN%)\n• Coding：NaN小時 (NaN%)\n\n總工時：NaN小時\n','','2025-08-07 06:36:37','2025-08-07 06:37:34'),(2,1,'2025-08-01','2025-08-05','=== 週報 ===\n期間：2025-08-01 至 2025-08-05\n員工：tedliu1111\n\n【Mon Aug 04 2025 00:00:00 GMT+0800 (台北標準時間) (一)】\n• 09:00:00-11:46:00 Meeting：客戶需求討論\n• 12:16:00-13:14:00 Testing：單元測試撰寫\n• 13:44:00-17:00:00 Meeting：專案進度會議\n• 17:30:00-18:00:00 Code Review：Security Code Review\n  小計：0小時\n\n【Sun Aug 03 2025 00:00:00 GMT+0800 (台北標準時間) (日)】\n• 09:00:00-09:42:00 Code Review：架構設計審核\n• 10:12:00-12:01:00 Code Review：檢查 Pull Request\n• 12:31:00-13:48:00 Document：系統規格文件\n• 14:18:00-16:00:00 Support：生產環境監控\n  小計：0小時\n\n【Tue Aug 05 2025 00:00:00 GMT+0800 (台北標準時間) (二)】\n• 09:00:00-11:46:00 Document：系統規格文件\n• 12:16:00-13:46:00 Document：撰寫使用手冊\n• 14:16:00-15:41:00 Code Review：Security Code Review\n  小計：0小時\n\n=== 工作類型統計 ===\n• Code Review：0小時 (0.0%)\n• Document：0小時 (0.0%)\n• Support：0小時 (0.0%)\n• Meeting：0小時 (0.0%)\n• Testing：0小時 (0.0%)\n\n總工時：0小時\n','','2025-08-07 06:48:08','2025-08-07 06:48:08');
/*!40000 ALTER TABLE `weeklyreportdrafts` ENABLE KEYS */;
UNLOCK TABLES;

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

--
-- Table structure for table `worklogs`
--

DROP TABLE IF EXISTS `worklogs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `worklogs` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `UserId` int NOT NULL,
  `WorkDate` date NOT NULL,
  `StartTime` time NOT NULL,
  `EndTime` time NOT NULL,
  `WorkTypeId` int NOT NULL,
  `Description` varchar(255) DEFAULT NULL,
  `CreatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`),
  KEY `UserId` (`UserId`),
  KEY `WorkTypeId` (`WorkTypeId`),
  CONSTRAINT `worklogs_ibfk_1` FOREIGN KEY (`UserId`) REFERENCES `users` (`Id`),
  CONSTRAINT `worklogs_ibfk_2` FOREIGN KEY (`WorkTypeId`) REFERENCES `worktypes` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `worklogs`
--

LOCK TABLES `worklogs` WRITE;
/*!40000 ALTER TABLE `worklogs` DISABLE KEYS */;
INSERT INTO `worklogs` VALUES (4,1,'2025-07-23','09:00:00','10:02:00',2,'實作 API 介面','2025-08-07 06:30:16'),(5,1,'2025-07-23','10:32:00','12:47:00',6,'系統維護作業','2025-08-07 06:30:16'),(6,1,'2025-07-23','13:17:00','15:18:00',2,'實作 API 介面','2025-08-07 06:30:16'),(7,1,'2025-07-24','09:00:00','12:11:00',6,'系統維護作業','2025-08-07 06:30:16'),(8,1,'2025-07-24','12:41:00','14:14:00',5,'單元測試撰寫','2025-08-07 06:30:16'),(9,1,'2025-07-27','09:00:00','11:34:00',1,'週會報告','2025-08-07 06:30:16'),(10,1,'2025-07-27','12:04:00','12:34:00',5,'Bug 修復測試','2025-08-07 06:30:16'),(11,1,'2025-07-27','13:04:00','15:04:00',6,'緊急問題排除','2025-08-07 06:30:16'),(12,1,'2025-07-28','09:00:00','10:34:00',5,'整合測試執行','2025-08-07 06:30:16'),(13,1,'2025-07-28','11:04:00','13:52:00',1,'客戶需求討論','2025-08-07 06:30:16'),(14,1,'2025-07-29','09:00:00','11:03:00',5,'系統測試驗證','2025-08-07 06:30:16'),(15,1,'2025-07-29','11:33:00','13:29:00',1,'客戶需求討論','2025-08-07 06:30:16'),(16,1,'2025-07-30','09:00:00','10:50:00',6,'客戶問題處理','2025-08-07 06:30:16'),(17,1,'2025-07-30','11:20:00','14:19:00',6,'技術支援服務','2025-08-07 06:30:16'),(18,1,'2025-07-30','14:49:00','17:55:00',6,'系統維護作業','2025-08-07 06:30:16'),(19,1,'2025-07-31','09:00:00','12:28:00',4,'整理專案說明','2025-08-07 06:30:16'),(20,1,'2025-07-31','12:58:00','14:37:00',4,'系統規格文件','2025-08-07 06:30:16'),(21,1,'2025-07-31','15:07:00','15:57:00',5,'Bug 修復測試','2025-08-07 06:30:16'),(22,1,'2025-07-31','16:27:00','18:00:00',1,'客戶需求討論','2025-08-07 06:30:16'),(23,1,'2025-08-03','09:00:00','09:42:00',3,'架構設計審核','2025-08-07 06:30:16'),(24,1,'2025-08-03','10:12:00','12:01:00',3,'檢查 Pull Request','2025-08-07 06:30:16'),(25,1,'2025-08-03','12:31:00','13:48:00',4,'系統規格文件','2025-08-07 06:30:16'),(26,1,'2025-08-03','14:18:00','16:00:00',6,'生產環境監控','2025-08-07 06:30:16'),(27,1,'2025-08-04','09:00:00','11:46:00',1,'客戶需求討論','2025-08-07 06:30:16'),(28,1,'2025-08-04','12:16:00','13:14:00',5,'單元測試撰寫','2025-08-07 06:30:16'),(29,1,'2025-08-04','13:44:00','17:00:00',1,'專案進度會議','2025-08-07 06:30:16'),(30,1,'2025-08-04','17:30:00','18:00:00',3,'Security Code Review','2025-08-07 06:30:16'),(31,1,'2025-08-05','09:00:00','11:46:00',4,'系統規格文件','2025-08-07 06:30:16'),(32,1,'2025-08-05','12:16:00','13:46:00',4,'撰寫使用手冊','2025-08-07 06:30:16'),(33,1,'2025-08-05','14:16:00','15:41:00',3,'Security Code Review','2025-08-07 06:30:16'),(34,1,'2025-08-06','09:00:00','10:42:00',3,'Review 同事的程式碼','2025-08-07 06:30:16'),(35,1,'2025-08-06','11:12:00','13:06:00',2,'實作 API 介面','2025-08-07 06:30:16'),(36,1,'2025-08-06','13:36:00','14:44:00',5,'單元測試撰寫','2025-08-07 06:30:16'),(38,2,'2024-08-05','13:00:00','18:00:00',2,'寫新功能','2025-08-07 19:16:20'),(39,2,'2024-08-06','09:00:00','18:00:00',2,'功能優化','2025-08-07 19:16:20'),(40,3,'2024-08-05','10:00:00','12:00:00',3,'寫文件','2025-08-07 19:16:20'),(41,3,'2024-08-05','13:00:00','17:00:00',2,'除錯','2025-08-07 19:16:20'),(42,4,'2024-08-06','09:00:00','12:00:00',1,'產品會議','2025-08-07 19:16:20'),(43,4,'2024-08-06','13:00:00','16:00:00',4,'測試','2025-08-07 19:16:20'),(44,5,'2024-08-06','09:30:00','12:30:00',2,'程式優化','2025-08-07 19:16:20'),(45,6,'2024-08-05','09:00:00','12:00:00',4,'測試驗收','2025-08-07 19:16:20'),(46,6,'2024-08-06','13:00:00','16:00:00',3,'編寫手冊','2025-08-07 19:16:20');
/*!40000 ALTER TABLE `worklogs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `worktypes`
--

DROP TABLE IF EXISTS `worktypes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `worktypes` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `TypeName` varchar(50) NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `TypeName` (`TypeName`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `worktypes`
--

LOCK TABLES `worktypes` WRITE;
/*!40000 ALTER TABLE `worktypes` DISABLE KEYS */;
INSERT INTO `worktypes` VALUES (3,'Code Review'),(2,'Coding'),(4,'Document'),(1,'Meeting'),(6,'Support'),(5,'Testing');
/*!40000 ALTER TABLE `worktypes` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-08 20:45:32
