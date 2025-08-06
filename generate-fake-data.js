const DatabaseConnection = require('./config/database');

async function generateFakeData() {
    console.log('=== 開始產生假資料 ===');
    
    const db = new DatabaseConnection();
    
    try {
        await db.connect();
        console.log('✅ 資料庫連接成功');
        
        // 取得使用者 ID
        const users = await db.query('SELECT Id, UserName FROM Users WHERE RoleId != 1');
        if (users.length === 0) {
            console.log('❌ 沒有找到非管理員使用者，請先註冊一些使用者');
            return;
        }
        
        const userId = users[0].Id;
        const userName = users[0].UserName;
        console.log(`📝 為使用者 ${userName} (ID: ${userId}) 生成假資料`);
        
        // 取得工作類型
        const workTypes = await db.query('SELECT Id, TypeName FROM WorkTypes');
        console.log('工作類型:', workTypes.map(t => t.TypeName).join(', '));
        
        // 清除該使用者的舊記錄（可選）
        await db.query('DELETE FROM WorkLogs WHERE UserId = ?', [userId]);
        console.log('🗑️ 清除舊記錄');
        
        // 生成最近兩週的假資料
        const fakeData = [];
        const today = new Date();
        
        for (let dayOffset = -14; dayOffset <= 0; dayOffset++) {
            const workDate = new Date(today);
            workDate.setDate(today.getDate() + dayOffset);
            
            // 跳過週末
            const dayOfWeek = workDate.getDay();
            if (dayOfWeek === 0 || dayOfWeek === 6) continue;
            
            const dateString = workDate.toISOString().split('T')[0];
            
            // 每天生成 2-4 個工時記錄
            const recordsCount = Math.floor(Math.random() * 3) + 2;
            let currentTime = 9; // 從 9:00 開始
            
            for (let i = 0; i < recordsCount; i++) {
                if (currentTime >= 18) break; // 不超過 18:00
                
                const startHour = currentTime;
                const duration = Math.random() * 3 + 0.5; // 0.5-3.5 小時
                const endTime = Math.min(startHour + duration, 18);
                
                if (endTime > 18) break;
                
                const startTimeStr = `${Math.floor(startHour).toString().padStart(2, '0')}:${Math.floor((startHour % 1) * 60).toString().padStart(2, '0')}:00`;
                const endTimeStr = `${Math.floor(endTime).toString().padStart(2, '0')}:${Math.floor((endTime % 1) * 60).toString().padStart(2, '0')}:00`;
                
                // 隨機選擇工作類型
                const workType = workTypes[Math.floor(Math.random() * workTypes.length)];
                
                // 生成描述
                const descriptions = {
                    'Meeting': [
                        '每日站會討論',
                        '專案進度會議',
                        '客戶需求討論',
                        '技術方案評估會議',
                        '週會報告'
                    ],
                    'Coding': [
                        '開發新功能模組',
                        '修復系統 Bug',
                        '優化程式碼效能',
                        '實作 API 介面',
                        '前端頁面開發'
                    ],
                    'Code Review': [
                        'Review 同事的程式碼',
                        '檢查 Pull Request',
                        '程式碼品質審查',
                        '架構設計審核',
                        'Security Code Review'
                    ],
                    'Document': [
                        '撰寫技術文件',
                        '更新 API 文件',
                        '整理專案說明',
                        '撰寫使用手冊',
                        '系統規格文件'
                    ],
                    'Testing': [
                        '單元測試撰寫',
                        '整合測試執行',
                        '系統測試驗證',
                        'Bug 修復測試',
                        '效能測試分析'
                    ],
                    'Support': [
                        '客戶問題處理',
                        '系統維護作業',
                        '技術支援服務',
                        '生產環境監控',
                        '緊急問題排除'
                    ]
                };
                
                const typeDescriptions = descriptions[workType.TypeName] || ['一般工作'];
                const description = typeDescriptions[Math.floor(Math.random() * typeDescriptions.length)];
                
                fakeData.push({
                    userId,
                    workDate: dateString,
                    startTime: startTimeStr,
                    endTime: endTimeStr,
                    workTypeId: workType.Id,
                    description
                });
                
                currentTime = endTime + 0.5; // 加上休息時間
            }
        }
        
        // 插入假資料
        console.log(`📊 準備插入 ${fakeData.length} 筆假資料...`);
        
        for (const record of fakeData) {
            await db.query(
                `INSERT INTO WorkLogs (UserId, WorkDate, StartTime, EndTime, WorkTypeId, Description) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [record.userId, record.workDate, record.startTime, record.endTime, record.workTypeId, record.description]
            );
        }
        
        console.log('✅ 假資料插入完成！');
        
        // 顯示統計資料
        const stats = await db.query(
            `SELECT 
                COUNT(*) as totalRecords,
                COUNT(DISTINCT WorkDate) as workDays,
                SUM(TIME_TO_SEC(TIMEDIFF(EndTime, StartTime))/3600) as totalHours
             FROM WorkLogs 
             WHERE UserId = ?`,
            [userId]
        );
        
        const typeStats = await db.query(
            `SELECT wt.TypeName, COUNT(*) as count, 
                    SUM(TIME_TO_SEC(TIMEDIFF(wl.EndTime, wl.StartTime))/3600) as hours
             FROM WorkLogs wl
             JOIN WorkTypes wt ON wl.WorkTypeId = wt.Id
             WHERE wl.UserId = ?
             GROUP BY wt.TypeName
             ORDER BY hours DESC`,
            [userId]
        );
        
        console.log('\n📈 假資料統計：');
        console.log(`總記錄數: ${stats[0].totalRecords}`);
        console.log(`工作天數: ${stats[0].workDays}`);
        console.log(`總工時: ${Math.round(stats[0].totalHours * 100) / 100} 小時`);
        
        console.log('\n🏷️ 工作類型分布：');
        typeStats.forEach(stat => {
            console.log(`${stat.TypeName}: ${stat.count} 筆, ${Math.round(stat.hours * 100) / 100} 小時`);
        });
        
        console.log('\n🎉 假資料生成完成！現在您可以測試以下功能：');
        console.log('1. 前往儀表板查看統計');
        console.log('2. 前往工時記錄查看詳細記錄');
        console.log('3. 前往週報頁面生成週報');
        console.log('4. 測試 PDF 匯出功能');
        
    } catch (error) {
        console.error('❌ 生成假資料失敗:', error);
    } finally {
        await db.close();
        console.log('📚 資料庫連接已關閉');
    }
}

// 執行生成假資料
generateFakeData();