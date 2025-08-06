const bcrypt = require('bcryptjs');
const DatabaseConnection = require('./config/database');

async function createAdmin() {
    console.log('=== 建立管理員帳號 ===');
    
    // 可以在這裡修改管理員資訊
    const adminData = {
        userName: 'admin',        // 管理員帳號
        password: 'admin123',     // 管理員密碼 (請修改為安全密碼)
        roleId: 1                 // admin 角色
    };

    const db = new DatabaseConnection();

    try {
        await db.connect();
        console.log('✅ 資料庫連線成功');

        // 檢查管理員是否已存在
        const existingAdmin = await db.query(
            'SELECT Id FROM Users WHERE UserName = ? OR RoleId = 1',
            [adminData.userName]
        );

        if (existingAdmin.length > 0) {
            console.log('⚠️  管理員帳號已存在，跳過建立');
            console.log('現有管理員帳號:', existingAdmin);
            return;
        }

        // 加密密碼
        const hashedPassword = await bcrypt.hash(adminData.password, 10);

        // 建立管理員帳號
        const result = await db.query(
            'INSERT INTO Users (UserName, PasswordHash, RoleId) VALUES (?, ?, ?)',
            [adminData.userName, hashedPassword, adminData.roleId]
        );

        console.log('🎉 管理員帳號建立成功！');
        console.log('帳號資訊:');
        console.log(`  使用者名稱: ${adminData.userName}`);
        console.log(`  密碼: ${adminData.password}`);
        console.log(`  角色: admin (RoleId: ${adminData.roleId})`);
        console.log('');
        console.log('⚠️  請立即登入並修改密碼！');
        console.log('登入網址: http://localhost:3000/login');

    } catch (error) {
        console.error('❌ 建立管理員帳號失敗:', error.message);
        
        if (error.code === 'ER_DUP_ENTRY') {
            console.log('💡 可能是使用者名稱已存在，請修改腳本中的 userName');
        }
    } finally {
        await db.close();
        console.log('📚 資料庫連線已關閉');
    }
}

// 執行建立管理員
createAdmin();