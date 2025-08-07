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
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-07 22:30:06
