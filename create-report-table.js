const DatabaseConnection = require('./config/database');

async function createReportTables() {
    console.log('=== 建立週報相關資料表 ===');
    
    const db = new DatabaseConnection();
    
    try {
        await db.connect();
        console.log('✅ 資料庫連接成功');

        // 建立週報草稿表
        console.log('📋 建立 WeeklyReportDrafts 表...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS WeeklyReportDrafts (
                Id INT AUTO_INCREMENT PRIMARY KEY,
                UserId INT NOT NULL,
                StartDate DATE NOT NULL,
                EndDate DATE NOT NULL,
                ReportText TEXT,
                CustomNotes TEXT,
                CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (UserId) REFERENCES Users(Id),
                UNIQUE KEY unique_user_period (UserId, StartDate, EndDate)
            )
        `);

        // 建立週報歷史表
        console.log('📋 建立 WeeklyReports 表...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS WeeklyReports (
                Id INT AUTO_INCREMENT PRIMARY KEY,
                UserId INT NOT NULL,
                StartDate DATE NOT NULL,
                EndDate DATE NOT NULL,
                ReportText TEXT NOT NULL,
                CustomNotes TEXT,
                TotalHours DECIMAL(5,2) DEFAULT 0,
                WorkDays INT DEFAULT 0,
                TaskCount INT DEFAULT 0,
                Status ENUM('draft', 'submitted', 'approved') DEFAULT 'submitted',
                SubmittedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (UserId) REFERENCES Users(Id),
                INDEX idx_user_date (UserId, StartDate, EndDate),
                INDEX idx_status (Status)
            )
        `);

        // 驗證資料表建立成功
        console.log('🔍 驗證資料表...');
        const tables = await db.query("SHOW TABLES LIKE '%Report%'");
        console.log('週報相關資料表:', tables.map(t => Object.values(t)[0]));

        console.log('🎉 週報資料表建立完成！');

    } catch (error) {
        console.error('❌ 建立資料表失敗:', error);
    } finally {
        await db.close();
        console.log('📚 資料庫連接已關閉');
    }
}

createReportTables();