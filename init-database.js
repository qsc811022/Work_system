const DatabaseConnection = require('./config/database');

async function initializeDatabase() {
    console.log('開始初始化資料庫...');
    
    const db = new DatabaseConnection();
    
    try {
        await db.connect();
        console.log('✅ 資料庫連線成功');

        // 建立 Roles 表
        console.log('📋 建立 Roles 表...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS Roles (
                Id INT AUTO_INCREMENT PRIMARY KEY,
                RoleName VARCHAR(20) NOT NULL UNIQUE
            )
        `);

        // 插入預設角色
        console.log('📝 插入預設角色資料...');
        await db.query(`
            INSERT IGNORE INTO Roles (RoleName) 
            VALUES ('admin'), ('student'), ('employee')
        `);

        // 建立 Users 表
        console.log('📋 建立 Users 表...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS Users (
                Id INT AUTO_INCREMENT PRIMARY KEY,
                UserName VARCHAR(50) NOT NULL UNIQUE,
                PasswordHash VARCHAR(255) NOT NULL,
                RoleId INT NOT NULL,
                CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (RoleId) REFERENCES Roles(Id)
            )
        `);

        // 建立 WorkTypes 表
        console.log('📋 建立 WorkTypes 表...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS WorkTypes (
                Id INT AUTO_INCREMENT PRIMARY KEY,
                TypeName VARCHAR(50) NOT NULL UNIQUE
            )
        `);

        // 插入預設工作類型
        console.log('📝 插入預設工作類型資料...');
        await db.query(`
            INSERT IGNORE INTO WorkTypes (TypeName) 
            VALUES ('Meeting'), ('Coding'), ('Code Review'), ('Document'), ('Testing'), ('Support')
        `);

        // 建立 WorkLogs 表
        console.log('📋 建立 WorkLogs 表...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS WorkLogs (
                Id INT AUTO_INCREMENT PRIMARY KEY,
                UserId INT NOT NULL,
                WorkDate DATE NOT NULL,
                StartTime TIME NOT NULL,
                EndTime TIME NOT NULL,
                WorkTypeId INT NOT NULL,
                Description VARCHAR(255),
                CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (UserId) REFERENCES Users(Id),
                FOREIGN KEY (WorkTypeId) REFERENCES WorkTypes(Id)
            )
        `);

        // 驗證資料表建立成功
        console.log('🔍 驗證資料表...');
        const tables = await db.query('SHOW TABLES');
        console.log('現有資料表:', tables.map(t => Object.values(t)[0]));

        // 檢查角色和工作類型資料
        const roles = await db.query('SELECT * FROM Roles');
        console.log('角色資料:', roles);

        const workTypes = await db.query('SELECT * FROM WorkTypes');
        console.log('工作類型資料:', workTypes);

        console.log('🎉 資料庫初始化完成！');

    } catch (error) {
        console.error('❌ 資料庫初始化失敗:', error);
    } finally {
        await db.close();
    }
}

// 執行初始化
initializeDatabase();