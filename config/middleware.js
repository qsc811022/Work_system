const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');

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

// 錯誤處理中介軟體
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { 
        error: '伺服器內部錯誤',
        user: req.session.user || null 
    });
};

// 404 處理中介軟體
const notFoundHandler = (req, res) => {
    res.status(404).render('error', { 
        error: '頁面不存在',
        user: req.session.user || null 
    });
};

// 設定所有中介軟體
const setupMiddleware = (app) => {
    // 基本中介軟體
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(express.static(path.join(__dirname, '..', 'public')));

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

    // 錯誤處理中介軟體 (放在最後)
    app.use(errorHandler);
    app.use(notFoundHandler);
};

module.exports = {
    setupMiddleware,
    requireAuth,
    requireAdmin,
    errorHandler,
    notFoundHandler
};