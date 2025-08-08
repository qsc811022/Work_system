const DatabaseConnection = require('./config/database');

async function createReportDraftsTable() {
    console.log('=== 創建 ReportDrafts 資料表 ===');
    
    const db = new DatabaseConnection();
    
    try {
        await db.connect();
        console.log('✅ 資料庫連線成功');
        
        // 創建 ReportDrafts 表
        const createTableSQL = `
            CREATE TABLE IF NOT EXISTS ReportDrafts (
                Id INT AUTO_INCREMENT PRIMARY KEY,
                UserId INT NOT NULL,
                StartDate DATE NOT NULL,
                EndDate DATE NOT NULL,
                CustomNotes TEXT,
                CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
                UNIQUE KEY unique_user_period (UserId, StartDate, EndDate)
            )
        `;
        
        await db.query(createTableSQL);
        console.log('✅ ReportDrafts 資料表創建成功');
        
        // 檢查表結構
        const tableInfo = await db.query('DESCRIBE ReportDrafts');
        console.log('📋 資料表結構:');
        tableInfo.forEach(column => {
            console.log(`  ${column.Field}: ${column.Type} ${column.Null === 'NO' ? 'NOT NULL' : ''} ${column.Key ? `(${column.Key})` : ''}`);
        });
        
    } catch (error) {
        console.error('❌ 創建資料表失敗:', error.message);
    } finally {
        await db.close();
        console.log('📚 資料庫連線已關閉');
    }
}

createReportDraftsTable();