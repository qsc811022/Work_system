require('dotenv').config();  // ✅ 一定要在最上面！
const DatabaseConnection = require('./config/database');

async function testDatabase() {
    console.log('開始測試資料庫連線...');
    console.log('⛏ DEBUG：.env 變數內容檢查:');
    console.log('DB_USER:', process.env.DB_USER);
    console.log('DB_PASSWORD:', process.env.DB_PASSWORD);  // 👈 這行最重要
    console.log('DB_NAME:', process.env.DB_NAME);
    console.log('=====================================');
    const db = new DatabaseConnection();

    try {
        // 測試連線
        await db.connect();
        console.log('✅ 資料庫連線成功！');

        // 執行簡單查詢測試
        const result = await db.query('SELECT 1 as test, NOW() as current_time');
        console.log('✅ 查詢測試成功:', result);

        // 測試資料庫是否存在我們的表格
        try {
            const tables = await db.query("SHOW TABLES");
            console.log('📋 現有資料表:', tables);
        } catch (error) {
            console.log('ℹ️  尚未建立資料表 (這是正常的)');
        }

    } catch (error) {
        console.error('❌ 資料庫測試失敗:');
        console.error('錯誤訊息:', error.message);

        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('💡 可能是帳號密碼錯誤，請檢查 .env 檔案設定');
        } else if (error.code === 'ECONNREFUSED') {
            console.log('💡 無法連接到資料庫，請確認 MySQL 服務是否啟動');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.log('💡 資料庫不存在，請先建立資料庫: CREATE DATABASE worklog_db;');
        }
    } finally {
        await db.close();
        console.log('📚 資料庫連線已關閉');
    }
}

// 執行測試
testDatabase();