const bcrypt = require('bcryptjs');
const DatabaseConnection = require('./config/database');

async function quickFixAdmin() {
    console.log('=== 快速修復管理員帳號 ===');
    
    const db = new DatabaseConnection();
    
    try {
        await db.connect();
        console.log('✅ 資料庫連線成功');
        
        // 檢查是否有管理員角色
        const adminRole = await db.query('SELECT * FROM Roles WHERE RoleName = ?', ['admin']);
        if (adminRole.length === 0) {
            console.log('❌ 沒有找到 admin 角色，請先執行 init-database.js');
            return;
        }
        
        // 檢查是否已有管理員
        const existingAdmin = await db.query(`
            SELECT u.*, r.RoleName 
            FROM Users u 
            JOIN Roles r ON u.RoleId = r.Id 
            WHERE r.RoleName = 'admin'
        `);
        
        if (existingAdmin.length > 0) {
            console.log('✅ 管理員帳號已存在:');
            existingAdmin.forEach(admin => {
                console.log(`  帳號: ${admin.UserName}`);
            });
            
            // 重設管理員密碼為 admin123
            const newPassword = 'admin123';
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            
            await db.query(
                'UPDATE Users SET PasswordHash = ? WHERE Id = ?',
                [hashedPassword, existingAdmin[0].Id]
            );
            
            console.log(`🔑 管理員密碼已重設為: ${newPassword}`);
        } else {
            // 創建新的管理員帳號
            const adminData = {
                userName: 'admin',
                password: 'admin123',
                roleId: adminRole[0].Id
            };
            
            const hashedPassword = await bcrypt.hash(adminData.password, 10);
            
            await db.query(
                'INSERT INTO Users (UserName, PasswordHash, RoleId) VALUES (?, ?, ?)',
                [adminData.userName, hashedPassword, adminData.roleId]
            );
            
            console.log('🎉 新管理員帳號已創建:');
            console.log(`  帳號: ${adminData.userName}`);
            console.log(`  密碼: ${adminData.password}`);
        }
        
        console.log('\n📝 登入資訊:');
        console.log('  網址: http://localhost:3000/login');
        console.log('  帳號: admin');
        console.log('  密碼: admin123');
        
    } catch (error) {
        console.error('❌ 修復失敗:', error.message);
    } finally {
        await db.close();
    }
}

quickFixAdmin();