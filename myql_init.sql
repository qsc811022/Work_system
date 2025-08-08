-- ===========================================
-- 0) 建庫與通用設定（可安全重複執行）
-- ===========================================
CREATE DATABASE IF NOT EXISTS project1
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_0900_ai_ci;

USE project1;

-- 建議鎖定時區，避免 NOW()/CURRENT_TIMESTAMP 受 session 影響
SET time_zone = '+08:00';

-- ===========================================
-- 1) 角色：roles（父表）
-- ===========================================
CREATE TABLE IF NOT EXISTS roles (
  Id INT NOT NULL AUTO_INCREMENT,
  RoleName VARCHAR(20) NOT NULL,
  PRIMARY KEY (Id),
  UNIQUE KEY uq_roles_rolename (RoleName)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 種子資料（避免重複插入用 IGNORE）
INSERT IGNORE INTO roles (Id, RoleName) VALUES
  (1,'admin'), (2,'student'), (3,'employee');

-- ===========================================
-- 2) 使用者：users（父表，FK -> roles）
-- ===========================================
CREATE TABLE IF NOT EXISTS users (
  Id INT NOT NULL AUTO_INCREMENT,
  UserName VARCHAR(50) NOT NULL,
  PasswordHash VARCHAR(255) NOT NULL,
  RoleId INT NOT NULL,
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (Id),
  UNIQUE KEY uq_users_username (UserName),
  KEY idx_users_roleid (RoleId),
  CONSTRAINT fk_users_roleid
    FOREIGN KEY (RoleId) REFERENCES roles(Id)
    ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 範例帳號（可刪可留）
INSERT IGNORE INTO users (Id, UserName, PasswordHash, RoleId)
VALUES
  (1,'tedliu1111','$2a$10$BAnHggDcW4KIxTYP8.DpiOotQS4F39IZh7bE8P3S897JUrwyo/kqS',3),
  (2,'admin','$2a$10$NSFWIREPGsIPrKuFUZ/24u.1B2sGAX3DjOz4X35f5VxNY0ggwr2Je',1);

-- ===========================================
-- 3) 工作類型：worktypes（父表）
-- ===========================================
CREATE TABLE IF NOT EXISTS worktypes (
  Id INT NOT NULL AUTO_INCREMENT,
  TypeName VARCHAR(50) NOT NULL,
  PRIMARY KEY (Id),
  UNIQUE KEY uq_worktypes_typename (TypeName)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 種子資料
INSERT IGNORE INTO worktypes (Id, TypeName) VALUES
  (1,'Meeting'), (2,'Coding'), (3,'Code Review'),
  (4,'Document'), (5,'Testing'), (6,'Support');

-- ===========================================
-- 4) 每日工時：worklogs（子表，FK -> users / worktypes）
--    提供 (UserId, WorkDate) 複合索引，利於周報查詢
-- ===========================================
CREATE TABLE IF NOT EXISTS worklogs (
  Id INT NOT NULL AUTO_INCREMENT,
  UserId INT NOT NULL,
  WorkDate DATE NOT NULL,              -- 建議用 DATE 儲存日期
  StartTime TIME NOT NULL,             -- 開始時間 (當日)
  EndTime TIME NOT NULL,               -- 結束時間 (當日)；若跨日需額外處理
  WorkTypeId INT NOT NULL,
  Description VARCHAR(255) DEFAULT NULL,
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (Id),
  KEY idx_worklogs_user (UserId),
  KEY idx_worklogs_worktype (WorkTypeId),
  KEY idx_worklogs_user_date (UserId, WorkDate), -- 常用查詢場景
  CONSTRAINT fk_worklogs_user
    FOREIGN KEY (UserId) REFERENCES users(Id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_worklogs_worktype
    FOREIGN KEY (WorkTypeId) REFERENCES worktypes(Id)
    ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ===========================================
-- 5) 週報草稿：weeklyreportdrafts（建議保留，語義清楚）
--    限制同一使用者、同一期間只能有一筆：UNIQUE (UserId, StartDate, EndDate)
-- ===========================================
CREATE TABLE IF NOT EXISTS weeklyreportdrafts (
  Id INT NOT NULL AUTO_INCREMENT,
  UserId INT NOT NULL,
  StartDate DATE NOT NULL,
  EndDate DATE NOT NULL,
  ReportText TEXT,                     -- 組好的顯示文字（可選）
  CustomNotes TEXT,                    -- 自訂備註（可選）
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (Id),
  UNIQUE KEY uq_weeklyreportdrafts_user_period (UserId, StartDate, EndDate),
  CONSTRAINT fk_weeklyreportdrafts_user
    FOREIGN KEY (UserId) REFERENCES users(Id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ===========================================
-- 6)（可選）另一個草稿概念：reportdrafts
--    若你只打算用 weeklyreportdrafts，這張可以不建
-- ===========================================
CREATE TABLE IF NOT EXISTS reportdrafts (
  Id INT NOT NULL AUTO_INCREMENT,
  UserId INT NOT NULL,
  StartDate DATE NOT NULL,
  EndDate DATE NOT NULL,
  CustomNotes TEXT,
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (Id),
  UNIQUE KEY uq_reportdrafts_user_period (UserId, StartDate, EndDate),
  CONSTRAINT fk_reportdrafts_user
    FOREIGN KEY (UserId) REFERENCES users(Id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ===========================================
-- 7) 週報正式表：weeklyreports（子表，FK -> users）
--    預設狀態建議 'draft'，提交後再改 'submitted'
-- ===========================================
CREATE TABLE IF NOT EXISTS weeklyreports (
  Id INT NOT NULL AUTO_INCREMENT,
  UserId INT NOT NULL,
  StartDate DATE NOT NULL,
  EndDate DATE NOT NULL,
  ReportText TEXT NOT NULL,            -- 固定下來的週報文字（儲存快照）
  CustomNotes TEXT,
  TotalHours DECIMAL(6,2) DEFAULT 0.00, -- 允許 > 99.99 小時就多一位
  WorkDays INT DEFAULT 0,
  TaskCount INT DEFAULT 0,
  Status ENUM('draft','submitted','approved') DEFAULT 'draft',
  SubmittedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (Id),
  KEY idx_weeklyreports_user_period (UserId, StartDate, EndDate),
  KEY idx_weeklyreports_status (Status),
  CONSTRAINT fk_weeklyreports_user
    FOREIGN KEY (UserId) REFERENCES users(Id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ===========================================
-- 8) 常用 View（查詢友好，不是必需）
-- ===========================================

-- 每日總工時（不分類型）
CREATE OR REPLACE VIEW v_user_daily_hours AS
SELECT
  wl.UserId,
  wl.WorkDate,
  -- 將 (EndTime - StartTime) 轉為秒數 /3600 變小時；四捨五入到 2 位
  ROUND(SUM(TIME_TO_SEC(TIMEDIFF(wl.EndTime, wl.StartTime)))/3600, 2) AS Hours
FROM worklogs wl
GROUP BY wl.UserId, wl.WorkDate;

-- 每日各類型工時
CREATE OR REPLACE VIEW v_user_daily_type_hours AS
SELECT
  wl.UserId,
  wl.WorkDate,
  wt.TypeName,
  ROUND(SUM(TIME_TO_SEC(TIMEDIFF(wl.EndTime, wl.StartTime)))/3600, 2) AS Hours
FROM worklogs wl
JOIN worktypes wt ON wt.Id = wl.WorkTypeId
GROUP BY wl.UserId, wl.WorkDate, wt.TypeName;

-- ===========================================
-- 9) UPSERT 範例（草稿：同人同週存在就更新）
--    你在 API 可以用這招避免 UNIQUE 撞到錯誤
-- ===========================================
-- 使用者變數只是示範，可換成實際參數
SET @uid = 1, @s = '2025-08-04', @e = '2025-08-10', @txt = '草稿內容', @note = '備註';

INSERT INTO weeklyreportdrafts (UserId, StartDate, EndDate, ReportText, CustomNotes)
VALUES (@uid, @s, @e, @txt, @note)
ON DUPLICATE KEY UPDATE
  ReportText = VALUES(ReportText),
  CustomNotes = VALUES(CustomNotes),
  UpdatedAt = CURRENT_TIMESTAMP;

-- ===========================================
-- 10) 範例：產生週報用的彙總 SQL（只示範查詢，不寫入）
-- ===========================================
-- (A) 各類型小計（週範圍）
--   用於「工作類型統計」區塊
SELECT 
  wt.TypeName,
  ROUND(SUM(TIME_TO_SEC(TIMEDIFF(wl.EndTime, wl.StartTime)))/3600, 2) AS Hours
FROM worklogs wl
JOIN worktypes wt ON wt.Id = wl.WorkTypeId
WHERE wl.UserId = @uid
  AND wl.WorkDate BETWEEN @s AND @e
GROUP BY wt.TypeName
ORDER BY Hours DESC;

-- (B) 週總工時
SELECT 
  ROUND(SUM(TIME_TO_SEC(TIMEDIFF(wl.EndTime, wl.StartTime)))/3600, 2) AS TotalHours
FROM worklogs wl
WHERE wl.UserId = @uid
  AND wl.WorkDate BETWEEN @s AND @e;

-- (C) 每日詳細（列出某人該週每天、各段落）
SELECT 
  wl.WorkDate,
  wt.TypeName,
  wl.StartTime,
  wl.EndTime,
  wl.Description,
  ROUND(TIME_TO_SEC(TIMEDIFF(wl.EndTime, wl.StartTime))/3600, 2) AS Hours
FROM worklogs wl
JOIN worktypes wt ON wt.Id = wl.WorkTypeId
WHERE wl.UserId = @uid
  AND wl.WorkDate BETWEEN @s AND @e
ORDER BY wl.WorkDate, wl.StartTime;

-- ===========================================
-- 11) 注意：跨日工時如何避免負數（說明）
-- ===========================================
-- 若存在 22:00~02:00 這種跨日班，你不要直接用 TIMEDIFF，
-- 建議在後端先把時間轉秒數再相減；或在 SQL 用 CASE 處理：
-- EX: TIMESTAMPDIFF_SECOND 與 CASE
-- SELECT
--   CASE
--     WHEN EndTime >= StartTime THEN TIME_TO_SEC(TIMEDIFF(EndTime, StartTime))
--     ELSE TIME_TO_SEC(TIMEDIFF(ADDTIME(EndTime, '24:00:00'), StartTime))
--   END AS SecondsWorked
-- FROM worklogs;
