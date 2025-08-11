// ===== 主路由檔案 =====
// 功能：處理所有頁面路由和 API 路由的分配
// 作者：Amazon Q Developer
// 最後更新：2025-01-08

const express = require('express');
const router = express.Router();

// ===== 中介軟體定義 =====
/**
 * 身份驗證中介軟體
 * 檢查使用者是否已登入，未登入則重導向登入頁面
 */
const requireAuth = (req, res, next) => {
    if (req.session.user) {
        next(); // 已登入，繼續執行
    } else {
        res.redirect('/login'); // 未登入，重導向登入頁面
    }
};

/**
 * 管理員權限中介軟體
 * 檢查使用者是否為管理員角色，非管理員則返回 403 錯誤
 */
const requireAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.roleName === 'admin') {
        next(); // 是管理員，繼續執行
    } else {
        res.status(403).send('需要管理員權限'); // 非管理員，返回 403
    }
};

// 首頁 - 重導向到登入頁面或儀表板
router.get('/', (req, res) => {
    if (req.session.user) {
        res.redirect('/dashboard');
    } else {
        res.redirect('/login');
    }
});

// 登入頁面
router.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    res.render('login', { error: null });
});

// 註冊頁面
router.get('/register', (req, res) => {
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    res.render('register', { error: null });
});

// 儀表板頁面
router.get('/dashboard', requireAuth, (req, res) => {
    res.render('dashboard', { user: req.session.user });
});

// 工時記錄頁面
router.get('/worklog', requireAuth, (req, res) => {
    res.render('worklog', { user: req.session.user });
});

// 週報頁面
router.get('/report', requireAuth, (req, res) => {
    res.render('report', { user: req.session.user });
});

// 管理員頁面
router.get('/admin', requireAuth, requireAdmin, (req, res) => {
    res.render('admin', { user: req.session.user });
});

// 登出
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('登出時發生錯誤:', err);
        }
        res.redirect('/login');
    });
});

// 登出 API 路由（相容性）
router.get('/auth/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('登出時發生錯誤:', err);
        }
        res.redirect('/login');
    });
});

// API 路由
router.use('/api/auth', require('./auth'));
router.use('/api/worklog', require('./worklog')); // 恢復使用完整版本
router.use('/api/report', require('./report'));
router.use('/api/admin', require('./admin'));

module.exports = router;