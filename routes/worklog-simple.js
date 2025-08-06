const express = require('express');
const DatabaseConnection = require('../config/database');

const router = express.Router();

// 身份驗證中介軟體
const requireAuth = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
};

// 所有路由都需要登入
router.use(requireAuth);

// 取得工作類型列表
router.get('/work-types', async (req, res) => {
    try {
        const db = new DatabaseConnection();
        await db.connect();

        const workTypes = await db.query('SELECT * FROM WorkTypes ORDER BY TypeName');
        
        await db.close();
        res.json({ success: true, workTypes });
    } catch (error) {
        console.error('取得工作類型錯誤:', error);
        res.status(500).json({ success: false, message: '取得工作類型失敗' });
    }
});

// 取得使用者的工時記錄 - 簡化版本
router.get('/list', async (req, res) => {
    const userId = req.session.user.id;

    try {
        const db = new DatabaseConnection();
        await db.connect();

        // 簡化查詢，先不用分頁
        const workLogs = await db.query(
            `SELECT wl.Id, wl.WorkDate, wl.StartTime, wl.EndTime, wl.Description, wt.TypeName
             FROM WorkLogs wl 
             JOIN WorkTypes wt ON wl.WorkTypeId = wt.Id 
             WHERE wl.UserId = ?
             ORDER BY wl.WorkDate DESC, wl.StartTime ASC`,
            [userId]
        );
        
        await db.close();
        
        res.json({ 
            success: true, 
            workLogs,
            pagination: {
                current: 1,
                total: 1,
                limit: 20,
                totalRecords: workLogs.length
            }
        });

    } catch (error) {
        console.error('取得工時記錄錯誤:', error);
        res.status(500).json({ success: false, message: '取得工時記錄失敗: ' + error.message });
    }
});

// 新增工時記錄
router.post('/add', async (req, res) => {
    const { workDate, startTime, endTime, workTypeId, description } = req.body;
    const userId = req.session.user.id;

    try {
        // 基本驗證
        if (!workDate || !startTime || !endTime || !workTypeId) {
            return res.status(400).json({ 
                success: false, 
                message: '請填寫所有必填欄位' 
            });
        }

        const db = new DatabaseConnection();
        await db.connect();

        // 新增工時記錄
        const result = await db.query(
            `INSERT INTO WorkLogs (UserId, WorkDate, StartTime, EndTime, WorkTypeId, Description) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, workDate, startTime, endTime, parseInt(workTypeId), description || '']
        );

        await db.close();
        res.json({ success: true, message: '工時記錄新增成功' });

    } catch (error) {
        console.error('新增工時記錄錯誤:', error);
        res.status(500).json({ success: false, message: '新增工時記錄失敗: ' + error.message });
    }
});

module.exports = router;