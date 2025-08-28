// ===== 建立管理員帳號腳本（允許多個 admin） =====
// 重點：檢查「UserName 是否重覆」，而不是檢查「資料庫是否已有任何 RoleId = 1」
// 作者：你
// 最後更新：2025-08-19

const bcrypt = require('bcryptjs'); // 用於密碼加密
const DatabaseConnection = require('./config/database'); // 資料庫連線類別

async function createAdmin() {
  console.log('=== 建立管理員帳號 ===');

  // 可調整的管理員資訊
  const adminData = {
    userName: 'admin1',   // ← 想新增的管理員帳號（不能和現有 UserName 重覆）
    password: '123456',   // ← 請改成強密碼；建立後請強制使用者修改
    roleId: 1             // ← admin 角色
  };

  const db = new DatabaseConnection();

  try {
    await db.connect();
    console.log('✅ 資料庫連線成功');

    // ✅ 只檢查「同名帳號」是否已存在；允許多筆 RoleId = 1
    const existingUser = await db.query(
      'SELECT Id FROM Users WHERE UserName = ? LIMIT 1',
      [adminData.userName]
    );

    if (existingUser.length > 0) {
      console.log(`⚠️  使用者名稱已存在：${adminData.userName}（跳過建立）`);
      return;
    }

    // 產生密碼雜湊（建議 cost 12）
    const COST = 12;
    const hashedPassword = await bcrypt.hash(adminData.password, COST);

    // 插入新帳號
    await db.query(
      'INSERT INTO Users (UserName, PasswordHash, RoleId) VALUES (?, ?, ?)',
      [adminData.userName, hashedPassword, adminData.roleId]
    );

    console.log('🎉 管理員帳號建立成功！');
    console.log(`  使用者名稱: ${adminData.userName}`);
    console.log(`  角色: admin (RoleId: ${adminData.roleId})`);
    console.log('⚠️  安全提醒：請立即登入並修改密碼');
  } catch (error) {
    console.error('❌ 建立管理員帳號失敗:', error.message);
    // 若 DB 有唯一索引，撞到同名會丟這個錯
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('💡 這個 UserName 已存在，請改成其他使用者名稱。');
    }
  } finally {
    await db.close();
    console.log('📚 資料庫連線已關閉');
  }
}

createAdmin();
