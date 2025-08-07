const express = require('express');
const path = require('path');
const session = require('express-session');
const cors = require('cors');
require('dotenv').config();

const DatabaseConnection = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// 設定 EJS 模板引擎
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 中介軟體設定
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session 設定
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // 開發環境設為 false
        maxAge: 24 * 60 * 60 * 1000 // 24小時
    }
}));

// 身份驗證中介軟體
const requireAuth = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
};

// 管理員權限中介軟體
const requireAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.roleName === 'admin') {
        next();
    } else {
        res.status(403).send('需要管理員權限');
    }
};

// 設定路由
app.use('/', require('./routes/index'));

// 錯誤處理中介軟體
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: '伺服器內部錯誤' });
});

// 404 處理
app.use((req, res) => {
    res.status(404).json({ error: '頁面不存在' });
});

// 啟動伺服器
async function startServer() {
    try {
        // 測試資料庫連接
        const db = new DatabaseConnection();
        const isConnected = await db.testConnection();
        if (!isConnected) {
            console.error('資料庫連接失敗，請檢查設定');
            process.exit(1);
        }
        await db.close();

        // 啟動伺服器
        app.listen(PORT, () => {
            console.log(`伺服器運行在 http://localhost:${PORT}`);
            console.log(`資料庫類型: ${process.env.DB_TYPE || 'mysql'}`);
            console.log('按 Ctrl+C 停止伺服器');
        });
    } catch (error) {
        console.error('伺服器啟動失敗:', error);
        process.exit(1);
    }
}

// 優雅地處理程序結束
process.on('SIGINT', () => {
    console.log('\n正在關閉伺服器...');
    process.exit(0);
});

// 啟動應用程式
startServer();