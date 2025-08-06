const DatabaseConnection = require('./config/database');

async function testAPI() {
    console.log('=== 測試 API 功能 ===');
    
    const db = new DatabaseConnection();
    
    try {
        await db.connect();
        console.log('✅ 資料庫連接成功');
        
        // 測試取得工作類型
        console.log('\n--- 測試工作類型查詢 ---');
        const workTypes = await db.query('SELECT * FROM WorkTypes ORDER BY TypeName');
        console.log('工作類型:', workTypes);
        
        // 測試取得使用者資訊
        console.log('\n--- 測試使用者查詢 ---');
        const users = await db.query('SELECT Id, UserName, RoleId FROM Users');
        console.log('使用者:', users);
        
        // 如果有使用者，測試工時記錄查詢
        if (users.length > 0) {
            const userId = users[0].Id;
            console.log(`\n--- 測試使用者 ${userId} 的工時記錄查詢 ---`);
            
            const workLogs = await db.query(
                `SELECT wl.*, wt.TypeName 
                 FROM WorkLogs wl 
                 JOIN WorkTypes wt ON wl.WorkTypeId = wt.Id 
                 WHERE wl.UserId = ?
                 ORDER BY wl.WorkDate DESC`,
                [userId]
            );
            console.log('工時記錄:', workLogs);
            
            // 測試新增工時記錄
            console.log('\n--- 測試新增工時記錄 ---');
            const today = new Date().toISOString().split('T')[0];
            
            try {
                const result = await db.query(
                    `INSERT INTO WorkLogs (UserId, WorkDate, StartTime, EndTime, WorkTypeId, Description) 
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [userId, today, '09:00:00', '10:00:00', 1, '測試記錄']
                );
                console.log('✅ 新增測試記錄成功');
                
                // 刪除測試記錄
                await db.query('DELETE FROM WorkLogs WHERE Description = ?', ['測試記錄']);
                console.log('✅ 清理測試記錄成功');
                
            } catch (insertError) {
                console.log('⚠️ 新增記錄可能失敗（可能是時間衝突）:', insertError.message);
            }
        }
        
    } catch (error) {
        console.error('❌ 測試失敗:', error);
    } finally {
        await db.close();
        console.log('\n📚 資料庫連接已關閉');
    }
}

testAPI();