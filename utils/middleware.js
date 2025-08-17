// ===== 共用中介軟體 =====
// 功能：提供系統中常用的中介軟體函數
// 作者：Amazon Q Developer
// 最後更新：2025-01-08

/**
 * 身份驗證中介軟體
 * 檢查使用者是否已登入
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
 * 檢查使用者是否為管理員角色
 */
const requireAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.roleName === 'admin') {
        next(); // 是管理員，繼續執行
    } else {
        res.status(403).json({ 
            success: false, 
            message: '需要管理員權限' 
        });
    }
};

/**
 * API 身份驗證中介軟體
 * 用於 API 路由的身份驗證，返回 JSON 格式錯誤
 */
const requireAuthAPI = (req, res, next) => {
    if (req.session.user) {
        next(); // 已登入，繼續執行
    } else {
        res.status(401).json({ 
            success: false, 
            message: '請先登入' 
        });
    }
};

/**
 * 錯誤處理中介軟體
 * 統一處理未捕獲的錯誤
 */
const errorHandler = (err, req, res, next) => {
    console.error('未處理的錯誤:', err);
    
    // 如果是 API 請求，返回 JSON 格式錯誤
    if (req.path.startsWith('/api/')) {
        res.status(500).json({ 
            success: false, 
            message: '伺服器內部錯誤' 
        });
    } else {
        // 一般頁面請求，重導向到錯誤頁面
        res.status(500).send('伺服器內部錯誤');
    }
};

/**
 * 404 處理中介軟體
 * 處理找不到的路由
 */
const notFoundHandler = (req, res) => {
    if (req.path.startsWith('/api/')) {
        res.status(404).json({ 
            success: false, 
            message: 'API 端點不存在' 
        });
    } else {
        res.status(404).send('頁面不存在');
    }
};

/**
 * 請求日誌中介軟體
 * 記錄所有請求的基本資訊
 */
const requestLogger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.url;
    const userAgent = req.get('User-Agent');
    
    console.log(`[${timestamp}] ${method} ${url} - ${userAgent}`);
    next();
};

module.exports = {
    requireAuth,
    requireAdmin,
    requireAuthAPI,
    errorHandler,
    notFoundHandler,
    requestLogger
};