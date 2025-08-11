// ===== 工時記錄系統 - 主伺服器檔案 =====
// 功能：設定 Express 伺服器、中介軟體、路由和資料庫連線
// 作者：Amazon Q Developer
// 最後更新：2025-01-08

// 引入必要的模組
const express = require('express');        // Express 框架
const path = require('path');              // 路徑處理工具
const session = require('express-session'); // Session 管理
const cors = require('cors');              // 跨域請求處理
require('dotenv').config();               // 環境變數載入

// 引入自定義模組
const DatabaseConnection = require('./config/database'); // 資料庫連線類別

// 建立 Express 應用程式實例
const app = express();
// 設定伺服器埠號（從環境變數或預設 3000）
const PORT = process.env.PORT || 3000;

// ===== 模板引擎設定 =====
// 設定 EJS 為模板引擎，用於渲染 HTML 頁面
app.set('view engine', 'ejs');
// 設定模板檔案目錄
app.set('views', path.join(__dirname, 'views'));

// ===== 中介軟體設定 =====
// 解析 JSON 格式的請求體
app.use(express.json());
// 解析 URL 編碼的請求體（表單數據）
app.use(express.urlencoded({ extended: true }));
// 設定靜態檔案目錄（CSS, JS, 圖片等）
app.use(express.static(path.join(__dirname, 'public')));

// ===== Session 管理設定 =====
// 設定使用者 session 管理，用於身份驗證和狀態保持
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key', // session 加密金鑰
    resave: false,              // 不強制重新儲存 session
    saveUninitialized: false,   // 不儲存未初始化的 session
    cookie: {
        secure: false,          // HTTP 環境設為 false（HTTPS 設為 true）
        maxAge: 24 * 60 * 60 * 1000, // Cookie 有效期 24 小時
        httpOnly: true          // 防止 XSS 攻擊，禁止 JavaScript 存取
    }
}));

// ===== CORS 設定 =====
// 設定跨域請求支援（必須在 session 之後）
app.use(cors({
    origin: true,      // 允許所有來源
    credentials: true  // 允許帶有認證資訊的請求
}));

// ===== 自定義中介軟體 =====
// 身份驗證中介軟體：檢查使用者是否已登入
const requireAuth = (req, res, next) => {
    if (req.session.user) {
        next(); // 已登入，繼續執行
    } else {
        res.redirect('/login'); // 未登入，重導向登入頁面
    }
};

// 管理員權限中介軟體：檢查使用者是否為管理員
const requireAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.roleName === 'admin') {
        next(); // 是管理員，繼續執行
    } else {
        res.status(403).send('需要管理員權限'); // 非管理員，返回 403 錯誤
    }
};

// ===== 路由設定 =====
// 載入主路由檔案，包含所有頁面和 API 路由
app.use('/', require('./routes/index'));

// ===== 錯誤處理中介軟體 =====
// 全域錯誤處理：捕捉所有未處理的錯誤
app.use((err, req, res, next) => {
    console.error(err.stack); // 記錄錯誤堆疊資訊
    res.status(500).json({ error: '伺服器內部錯誤' }); // 返回 500 錯誤
});

// 404 錯誤處理：處理找不到的路由
app.use((req, res) => {
    res.status(404).json({ error: '頁面不存在' }); // 返回 404 錯誤
});

// ===== 伺服器啟動函數 =====
// 非同步函數：負責啟動伺服器和初始化資料庫連線
async function startServer() {
    try {
        // ===== 資料庫連線測試 =====
        console.log('正在測試資料庫連線...');
        const db = new DatabaseConnection();
        const isConnected = await db.testConnection();
        if (!isConnected) {
            console.error('資料庫連接失敗，請檢查設定');
            process.exit(1); // 結束程序
        }
        await db.close(); // 關閉測試連線
        console.log('資料庫連線測試成功');

        // ===== 啟動 HTTP 伺服器 =====
        app.listen(PORT, '0.0.0.0', () => {
            // 取得系統網路資訊
            const os = require('os');
            const networkInterfaces = os.networkInterfaces();
            let localIP = 'localhost';
            
            // 尋找本機實際 IP 位址（非內部回環位址）
            for (const interfaceName in networkInterfaces) {
                const interfaces = networkInterfaces[interfaceName];
                for (const iface of interfaces) {
                    // 尋找 IPv4 且非內部的網路介面
                    if (iface.family === 'IPv4' && !iface.internal) {
                        localIP = iface.address;
                        break;
                    }
                }
                if (localIP !== 'localhost') break;
            }
            
            // 顯示伺服器啟動資訊
            console.log('\n=== 伺服器啟動成功 ===');
            console.log(`伺服器運行在:`);
            console.log(`  本機訪問: http://localhost:${PORT}`);
            console.log(`  網路訪問: http://${localIP}:${PORT}`);
            console.log(`資料庫類型: ${process.env.DB_TYPE || 'mysql'}`);
            console.log('按 Ctrl+C 停止伺服器\n');
        });
    } catch (error) {
        console.error('伺服器啟動失敗:', error);
        process.exit(1); // 結束程序
    }
}

// ===== 程序結束處理 =====
// 監聽 Ctrl+C 信號，優雅地關閉伺服器
process.on('SIGINT', () => {
    console.log('\n正在關閉伺服器...');
    process.exit(0); // 正常結束程序
});

// ===== 主程式入口 =====
// 執行伺服器啟動函數
startServer();