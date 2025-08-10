// init-database.js
// 功能：依照 0810.sql 的結構初始化資料庫（表名、欄位、索引、外鍵、初始資料）
// 說明：此版本嚴格對齊 dump：小寫表名、reportdrafts 表、roles 只插入 admin/employee、worktypes 採固定 Id

const DatabaseConnection = require('./config/database');

async function initializeDatabase() {
    console.log('=== 初始化資料庫（對齊 0810.sql） ===');

    const db = new DatabaseConnection();

    try {
        // 連線資料庫
        await db.connect();
        console.log('✅ 資料庫連線成功');

        // 👉 重要：確保使用正確的資料庫（若連線設定已指定 DB，這步可省略）
        // await db.query(`CREATE DATABASE IF NOT EXISTS project1 
        //     DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci`);
        // await db.query(`USE project1`);

        // 1) roles
        console.log('📋 建立 roles 表...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS roles (
                Id INT NOT NULL AUTO_INCREMENT,
                RoleName VARCHAR(20) NOT NULL,
                PRIMARY KEY (Id),
                UNIQUE KEY RoleName (RoleName)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
        `);

        // dump 裡只有 admin / employee（沒有 student）
        console.log('📝 插入預設角色資料（與 dump 對齊）...');
        await db.query(`
            INSERT IGNORE INTO roles (Id, RoleName) VALUES
                (1, 'admin'),
                (2, 'employee')
        `);

        // 2) worktypes
        console.log('📋 建立 worktypes 表...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS worktypes (
                Id INT NOT NULL AUTO_INCREMENT,
                TypeName VARCHAR(50) NOT NULL,
                PRIMARY KEY (Id),
                UNIQUE KEY TypeName (TypeName)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
        `);

        // 與 dump 對齊：固定 Id 插入，避免後續舊資料引用 WorkTypeId 時對不起來
        console.log('📝 插入預設工作類型（固定 Id，與 dump 對齊）...');
        await db.query(`
            INSERT IGNORE INTO worktypes (Id, TypeName) VALUES
                (1, 'Meeting'),
                (2, 'Coding'),
                (3, 'Code Review'),
                (4, 'Document'),
                (5, 'Testing'),
                (6, 'Support')
        `);

        // 3) users
        console.log('📋 建立 users 表...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                Id INT NOT NULL AUTO_INCREMENT,
                UserName VARCHAR(50) NOT NULL,
                PasswordHash VARCHAR(255) NOT NULL,
                RoleId INT NOT NULL,
                CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (Id),
                UNIQUE KEY UserName (UserName),
                KEY RoleId (RoleId),
                CONSTRAINT users_ibfk_1 FOREIGN KEY (RoleId) REFERENCES roles (Id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
        `);
        // ⚠ 不主動插入 user，以免與你 dump 既有使用者衝突

        // 4) worklogs
        console.log('📋 建立 worklogs 表...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS worklogs (
                Id INT NOT NULL AUTO_INCREMENT,
                UserId INT NOT NULL,
                WorkDate DATE NOT NULL,
                StartTime TIME NOT NULL,
                EndTime TIME NOT NULL,
                WorkTypeId INT NOT NULL,
                Description VARCHAR(255) DEFAULT NULL,
                CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (Id),
                KEY UserId (UserId),
                KEY WorkTypeId (WorkTypeId),
                CONSTRAINT worklogs_ibfk_1 FOREIGN KEY (UserId) REFERENCES users (Id),
                CONSTRAINT worklogs_ibfk_2 FOREIGN KEY (WorkTypeId) REFERENCES worktypes (Id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
        `);

        // 5) weeklyreportdrafts
        console.log('📋 建立 weeklyreportdrafts 表...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS weeklyreportdrafts (
                Id INT NOT NULL AUTO_INCREMENT,
                UserId INT NOT NULL,
                StartDate DATE NOT NULL,
                EndDate DATE NOT NULL,
                ReportText TEXT,
                CustomNotes TEXT,
                CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (Id),
                UNIQUE KEY unique_user_period (UserId, StartDate, EndDate),
                CONSTRAINT weeklyreportdrafts_ibfk_1 FOREIGN KEY (UserId) REFERENCES users (Id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
        `);

        // 6) weeklyreports
        console.log('📋 建立 weeklyreports 表...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS weeklyreports (
                Id INT NOT NULL AUTO_INCREMENT,
                UserId INT NOT NULL,
                StartDate DATE NOT NULL,
                EndDate DATE NOT NULL,
                ReportText TEXT NOT NULL,
                CustomNotes TEXT,
                TotalHours DECIMAL(5,2) DEFAULT '0.00',
                WorkDays INT DEFAULT '0',
                TaskCount INT DEFAULT '0',
                Status ENUM('draft','submitted','approved') DEFAULT 'submitted',
                SubmittedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (Id),
                KEY idx_user_date (UserId, StartDate, EndDate),
                KEY idx_status (Status),
                CONSTRAINT weeklyreports_ibfk_1 FOREIGN KEY (UserId) REFERENCES users (Id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
        `);

        // 7) reportdrafts（⚠ dump 裡有這張表，舊版/平行用途；需保留）
        console.log('📋 建立 reportdrafts 表（舊版/平行草稿表）...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS reportdrafts (
                Id INT NOT NULL AUTO_INCREMENT,
                UserId INT NOT NULL,
                StartDate DATE NOT NULL,
                EndDate DATE NOT NULL,
                CustomNotes TEXT,
                CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (Id),
                UNIQUE KEY unique_user_period (UserId, StartDate, EndDate),
                -- 與 dump 對齊，這裡特別有 ON DELETE CASCADE
                CONSTRAINT reportdrafts_ibfk_1 
                    FOREIGN KEY (UserId) REFERENCES users (Id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
        `);

        // 🔍 驗證資料表
        console.log('🔍 驗證資料表清單...');
        const tables = await db.query('SHOW TABLES');
        const tableNames = tables.map(t => Object.values(t)[0]);
        console.log('現有資料表:', tableNames);

        // 📊 基礎資料確認
        const roles = await db.query('SELECT * FROM roles ORDER BY Id');
        console.log('📊 角色資料:', roles);

        const workTypes = await db.query('SELECT * FROM worktypes ORDER BY Id');
        console.log('📊 工作類型資料:', workTypes);

        // 📈 簡單統計
        const [[{ count: userCount }]] = [await db.query('SELECT COUNT(*) AS count FROM users')];
        const [[{ count: workLogCount }]] = [await db.query('SELECT COUNT(*) AS count FROM worklogs')];
        const [[{ count: draftCount }]] = [await db.query('SELECT COUNT(*) AS count FROM weeklyreportdrafts')];
        const [[{ count: reportCount }]] = [await db.query('SELECT COUNT(*) AS count FROM weeklyreports')];

        console.log('\n📊 資料統計:');
        console.log(`  使用者數量: ${userCount}`);
        console.log(`  工時記錄: ${workLogCount}`);
        console.log(`  週報草稿(weeklyreportdrafts): ${draftCount}`);
        console.log(`  正式週報(weeklyreports): ${reportCount}`);

        console.log('\n🎉 資料庫初始化完成（對齊 0810.sql）！');
        console.log('💡 後續可執行:');
        console.log('   node create-admin.js  # 建立管理員帳號');
        console.log('   npm start            # 啟動伺服器');

    } catch (error) {
        console.error('❌ 資料庫初始化失敗:', error);
        console.error('錯誤詳情:', error.message);

        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('💡 請檢查 .env 檔案中的資料庫連線設定');
        } else if (error.code === 'ECONNREFUSED') {
            console.log('💡 請確認資料庫服務已啟動');
        } else if (error.code === 'ER_NO_DB_ERROR') {
            console.log('💡 請確認連線字串已指定資料庫，或取消註解本檔上方的 CREATE/USE 語句');
        }
    } finally {
        await db.close();
        console.log('📚 資料庫連線已關閉');
    }
}

// 執行初始化
initializeDatabase();
