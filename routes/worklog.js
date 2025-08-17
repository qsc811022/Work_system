const express = require('express');
const DatabaseConnection = require('../config/database');
const { timeUtils, validationUtils, responseUtils, paginationUtils } = require('../utils/helpers');
const { requireAuth } = require('../utils/middleware');

const router = express.Router();

// 所有路由都需要登入
router.use(requireAuth);

// 取得工作類型列表
router.get('/work-types', async (req, res) => {
    try {
        const db = new DatabaseConnection();
        await db.connect();

        const workTypes = await db.query('SELECT * FROM WorkTypes ORDER BY TypeName');
        
        await db.close();
        responseUtils.success(res, '取得工作類型成功', { workTypes });
    } catch (error) {
        responseUtils.serverError(res, error, '取得工作類型失敗');
    }
});

// 新增工時記錄
router.post('/add', async (req, res) => {
    const { workDate, startTime, endTime, workTypeId, description } = req.body;
    const userId = req.session.user.id;

    try {
        // 基本驗證
        const requiredValidation = validationUtils.validateRequired(
            { workDate, startTime, endTime, workTypeId },
            ['workDate', 'startTime', 'endTime', 'workTypeId']
        );
        if (!requiredValidation.valid) {
            return responseUtils.error(res, requiredValidation.message);
        }

        // 驗證工作時間
        const timeValidation = timeUtils.validateWorkTime(startTime, endTime, workDate);
        if (!timeValidation.valid) {
            return responseUtils.error(res, timeValidation.message);
        }

        const db = new DatabaseConnection();
        await db.connect();

        // 檢查同一天是否有重複的時間區間
        const conflicts = await db.query(
            `SELECT * FROM WorkLogs 
             WHERE UserId = ? AND WorkDate = ? 
             AND ((StartTime <= ? AND EndTime > ?) OR (StartTime < ? AND EndTime >= ?))`,
            [userId, workDate, startTime, startTime, endTime, endTime]
        );

        if (conflicts.length > 0) {
            await db.close();
            return res.status(400).json({ 
                success: false, 
                message: '時間區間與現有記錄重複' 
            });
        }

        // 新增工時記錄
        const result = await db.query(
            `INSERT INTO WorkLogs (UserId, WorkDate, StartTime, EndTime, WorkTypeId, Description) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, workDate, startTime, endTime, workTypeId, description || '']
        );

        await db.close();
        res.json({ success: true, message: '工時記錄新增成功' });

    } catch (error) {
        console.error('新增工時記錄錯誤:', error);
        res.status(500).json({ success: false, message: '新增工時記錄失敗' });
    }
});

// 取得使用者的工時記錄（支援日期篩選與分頁）
router.get('/list', async (req, res) => {
    const userId = req.session.user.id;
    const { startDate, endDate, page = 1, limit = 20 } = req.query;

    try {
        const db = new DatabaseConnection();
        await db.connect();

        let whereClause = 'WHERE wl.UserId = ?';
        let queryParams = [userId];

        if (startDate) {
            whereClause += ' AND wl.WorkDate >= ?';
            queryParams.push(startDate);
        }
        if (endDate) {
            whereClause += ' AND wl.WorkDate <= ?';
            queryParams.push(endDate);
        }

        const limitNum = parseInt(limit);
        const pageNum = parseInt(page);
        if (isNaN(limitNum) || isNaN(pageNum)) {
            return res.status(400).json({ success: false, message: '分頁參數格式錯誤' });
        }
        const offset = (pageNum - 1) * limitNum;

        // 👇 直接拼接 LIMIT/OFFSET
        const sql = `
            SELECT wl.*, wt.TypeName 
            FROM WorkLogs wl 
            JOIN WorkTypes wt ON wl.WorkTypeId = wt.Id 
            ${whereClause}
            ORDER BY wl.WorkDate DESC, wl.StartTime ASC
            LIMIT ${limitNum} OFFSET ${offset}
        `;

        const workLogs = await db.query(sql, queryParams);

        // 查詢總筆數
        const totalResult = await db.query(
            `SELECT COUNT(*) as total FROM WorkLogs wl ${whereClause}`,
            queryParams
        );

        const total = totalResult[0].total;

        await db.close();

        res.json({
            success: true,
            workLogs,
            pagination: {
                current: pageNum,
                total: Math.ceil(total / limitNum),
                limit: limitNum,
                totalRecords: total
            }
        });

    } catch (error) {
        console.error('取得工時記錄錯誤:', error);
        res.status(500).json({ success: false, message: '取得工時記錄失敗' });
    }
});


// 取得單一工時記錄
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const userId = req.session.user.id;

    try {
        const db = new DatabaseConnection();
        await db.connect();

        const workLogs = await db.query(
            `SELECT wl.*, wt.TypeName 
             FROM WorkLogs wl 
             JOIN WorkTypes wt ON wl.WorkTypeId = wt.Id 
             WHERE wl.Id = ? AND wl.UserId = ?`,
            [id, userId]
        );

        if (workLogs.length === 0) {
            await db.close();
            return res.status(404).json({ success: false, message: '工時記錄不存在' });
        }

        await db.close();
        res.json({ success: true, workLog: workLogs[0] });

    } catch (error) {
        console.error('取得工時記錄錯誤:', error);
        res.status(500).json({ success: false, message: '取得工時記錄失敗' });
    }
});

// 更新工時記錄
router.put('/:id', async (req, res) => {
    const { id } = req.params;
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

        // 確認記錄存在且屬於當前使用者
        const existing = await db.query(
            'SELECT * FROM WorkLogs WHERE Id = ? AND UserId = ?',
            [id, userId]
        );

        if (existing.length === 0) {
            await db.close();
            return res.status(404).json({ success: false, message: '工時記錄不存在' });
        }

        // 更新記錄
        await db.query(
            `UPDATE WorkLogs 
             SET WorkDate = ?, StartTime = ?, EndTime = ?, WorkTypeId = ?, Description = ?
             WHERE Id = ? AND UserId = ?`,
            [workDate, startTime, endTime, workTypeId, description || '', id, userId]
        );

        await db.close();
        res.json({ success: true, message: '工時記錄更新成功' });

    } catch (error) {
        console.error('更新工時記錄錯誤:', error);
        res.status(500).json({ success: false, message: '更新工時記錄失敗' });
    }
});

// 刪除工時記錄
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const userId = req.session.user.id;

    try {
        const db = new DatabaseConnection();
        await db.connect();

        // 確認記錄存在且屬於當前使用者
        const existing = await db.query(
            'SELECT * FROM WorkLogs WHERE Id = ? AND UserId = ?',
            [id, userId]
        );

        if (existing.length === 0) {
            await db.close();
            return res.status(404).json({ success: false, message: '工時記錄不存在' });
        }

        // 刪除記錄
        await db.query('DELETE FROM WorkLogs WHERE Id = ? AND UserId = ?', [id, userId]);

        await db.close();
        res.json({ success: true, message: '工時記錄刪除成功' });

    } catch (error) {
        console.error('刪除工時記錄錯誤:', error);
        res.status(500).json({ success: false, message: '刪除工時記錄失敗' });
    }
});

module.exports = router;