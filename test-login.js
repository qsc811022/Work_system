const DatabaseConnection = require('./config/database');
const bcrypt = require('bcryptjs');

async function testLogin() {
    console.log('=== 測試登入功能 ===');
    
    const db = new DatabaseConnection();
    
    try {
        await db.connect();
        console.log('✅ 資料庫連線成功');
        
        // 檢查所有使用者
        const users = await db.query(`
            SELECT u.Id, u.UserName, u.RoleId, r.RoleName 
            FROM Users u 
            JOIN Roles r ON u.RoleId = r.Id 
            ORDER BY u.Id
        `);
        
        console.log('\n📋 現有使用者列表:');
        users.forEach(user => {
            console.log(`  ID: ${user.Id}, 帳號: ${user.UserName}, 角色: ${user.RoleName}`);
        });
        
        // 測試管理員登入
        const adminUser = users.find(u => u.RoleName === 'admin');
        if (adminUser) {
            console.log(`\n🔍 找到管理員帳號: ${adminUser.UserName}`);
            
            // 取得密碼雜湊
            const userWithPassword = await db.query(
                'SELECT PasswordHash FROM Users WHERE Id = ?',
                [adminUser.Id]
            );
            
            if (userWithPassword.length > 0) {
                // 測試預設密碼
                const testPasswords = ['admin123', 'admin', '123456', 'password'];
                
                for (const testPassword of testPasswords) {
                    const isValid = await bcrypt.compare(testPassword, userWithPassword[0].PasswordHash);
                    if (isValid) {
                        console.log(`✅ 管理員密碼是: ${testPassword}`);
                        break;
                    }
                }
            }
        } else {
            console.log('\n❌ 沒有找到管理員帳號');
            console.log('請執行: node create-admin.js');
        }
        
    } catch (error) {
        console.error('❌ 測試失敗:', error.message);
    } finally {
        await db.close();
    }
}

testLogin();