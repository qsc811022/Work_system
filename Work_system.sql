-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: project22
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
  `CreatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `uq_reportdrafts_user_period` (`UserId`,`StartDate`,`EndDate`),
  CONSTRAINT `fk_reportdrafts_user` FOREIGN KEY (`UserId`) REFERENCES `users` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reportdrafts`
--

LOCK TABLES `reportdrafts` WRITE;
/*!40000 ALTER TABLE `reportdrafts` DISABLE KEYS */;
INSERT INTO `reportdrafts` VALUES (1,4,'2025-08-18','2025-08-24','下禮拜驗證系統','2025-08-20 13:14:15','2025-08-21 12:02:04'),(2,2,'2025-08-18','2025-08-24','123','2025-08-20 13:22:42','2025-08-20 13:22:42');
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
  UNIQUE KEY `uq_roles_rolename` (`RoleName`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  UNIQUE KEY `uq_users_username` (`UserName`),
  KEY `idx_users_roleid` (`RoleId`),
  CONSTRAINT `fk_users_roleid` FOREIGN KEY (`RoleId`) REFERENCES `roles` (`Id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
-- INSERT INTO `users` VALUES (1,'tedliu1111','$2a$10$BAnHggDcW4KIxTYP8.DpiOotQS4F39IZh7bE8P3S897JUrwyo/kqS',3,'2025-08-19 08:44:39'),(2,'admin','$2a$10$a3kSbW0B0.nFpS8TXn2sp.WKeXGPgMFFNVjMK0zJVtK6zS7ziu0q.',1,'2025-08-19 08:44:39'),(3,'admin2','$2a$12$rXUjunXl42IQU/qXzV4LC.P.DrFAu2zMXMRjM8f0Uef2qW6TFHNuq',1,'2025-08-19 08:48:52'),(4,'Test1','$2a$10$k/duS/3nS3v9iATuVi3YBOqJwj59olwaPn7OxiBDmDpbAr2hNoKC6',2,'2025-08-20 13:13:34');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `v_user_daily_hours`
--

DROP TABLE IF EXISTS `v_user_daily_hours`;
/*!50001 DROP VIEW IF EXISTS `v_user_daily_hours`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_user_daily_hours` AS SELECT 
 1 AS `UserId`,
 1 AS `WorkDate`,
 1 AS `Hours`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `v_user_daily_type_hours`
--

DROP TABLE IF EXISTS `v_user_daily_type_hours`;
/*!50001 DROP VIEW IF EXISTS `v_user_daily_type_hours`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_user_daily_type_hours` AS SELECT 
 1 AS `UserId`,
 1 AS `WorkDate`,
 1 AS `TypeName`,
 1 AS `Hours`*/;
SET character_set_client = @saved_cs_client;

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
  UNIQUE KEY `uq_weeklyreportdrafts_user_period` (`UserId`,`StartDate`,`EndDate`),
  CONSTRAINT `fk_weeklyreportdrafts_user` FOREIGN KEY (`UserId`) REFERENCES `users` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `weeklyreportdrafts`
--

LOCK TABLES `weeklyreportdrafts` WRITE;
/*!40000 ALTER TABLE `weeklyreportdrafts` DISABLE KEYS */;
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
  `TotalHours` decimal(6,2) DEFAULT '0.00',
  `WorkDays` int DEFAULT '0',
  `TaskCount` int DEFAULT '0',
  `Status` enum('draft','submitted','approved') DEFAULT 'draft',
  `SubmittedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `CreatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`),
  KEY `idx_weeklyreports_user_period` (`UserId`,`StartDate`,`EndDate`),
  KEY `idx_weeklyreports_status` (`Status`),
  CONSTRAINT `fk_weeklyreports_user` FOREIGN KEY (`UserId`) REFERENCES `users` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `weeklyreports`
--

LOCK TABLES `weeklyreports` WRITE;
/*!40000 ALTER TABLE `weeklyreports` DISABLE KEYS */;
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
  KEY `idx_worklogs_user` (`UserId`),
  KEY `idx_worklogs_worktype` (`WorkTypeId`),
  KEY `idx_worklogs_user_date` (`UserId`,`WorkDate`),
  CONSTRAINT `fk_worklogs_user` FOREIGN KEY (`UserId`) REFERENCES `users` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_worklogs_worktype` FOREIGN KEY (`WorkTypeId`) REFERENCES `worktypes` (`Id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `worklogs`
--

LOCK TABLES `worklogs` WRITE;
/*!40000 ALTER TABLE `worklogs` DISABLE KEYS */;
-- INSERT INTO `worklogs` VALUES (1,4,'2025-08-20','13:13:00','13:18:00',2,'123','2025-08-20 13:13:54'),(2,2,'2025-08-20','09:00:00','18:00:00',2,'123213213','2025-08-20 13:15:36'),(4,4,'2025-08-18','09:00:00','18:00:00',5,'驗證issue','2025-08-21 12:00:26'),(5,4,'2025-08-19','09:00:00','12:00:00',5,'測試系統','2025-08-21 12:01:04'),(6,4,'2025-08-11','09:00:00','18:01:00',5,'Testing','2025-08-21 12:01:35');
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
  UNIQUE KEY `uq_worktypes_typename` (`TypeName`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `worktypes`
--

LOCK TABLES `worktypes` WRITE;
/*!40000 ALTER TABLE `worktypes` DISABLE KEYS */;
INSERT INTO `worktypes` VALUES (3,'Code Review'),(2,'Coding'),(4,'Document'),(1,'Meeting'),(6,'Support'),(5,'Testing');
/*!40000 ALTER TABLE `worktypes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Final view structure for view `v_user_daily_hours`
--

/*!50001 DROP VIEW IF EXISTS `v_user_daily_hours`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_user_daily_hours` AS select `wl`.`UserId` AS `UserId`,`wl`.`WorkDate` AS `WorkDate`,round((sum(time_to_sec(timediff(`wl`.`EndTime`,`wl`.`StartTime`))) / 3600),2) AS `Hours` from `worklogs` `wl` group by `wl`.`UserId`,`wl`.`WorkDate` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_user_daily_type_hours`
--

/*!50001 DROP VIEW IF EXISTS `v_user_daily_type_hours`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_user_daily_type_hours` AS select `wl`.`UserId` AS `UserId`,`wl`.`WorkDate` AS `WorkDate`,`wt`.`TypeName` AS `TypeName`,round((sum(time_to_sec(timediff(`wl`.`EndTime`,`wl`.`StartTime`))) / 3600),2) AS `Hours` from (`worklogs` `wl` join `worktypes` `wt` on((`wt`.`Id` = `wl`.`WorkTypeId`))) group by `wl`.`UserId`,`wl`.`WorkDate`,`wt`.`TypeName` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-22 16:19:54
