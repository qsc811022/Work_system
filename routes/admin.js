const express = require('express');
const moment = require('moment');
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

// 管理員權限中介軟體
const requireAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.roleName === 'admin') {
        next();
    } else {
        res.status(403).send('需要管理員權限');
    }
};

// 所有路由都需要管理員權限
router.use(requireAuth);
router.use(requireAdmin);

// 測試路由 - 確認路由正常工作
router.get('/test', (req, res) => {
    res.json({ message: 'Admin routes working!', user: req.session.user });
});



// 統計數據 API - 完整版本
router.get('/stats', async (req, res) => {
    console.log('Stats API requested');
    console.log('Query params:', req.query);
    
    const { startDate, endDate } = req.query;

    try {
        let weekStart, weekEnd;
        
        // 如果沒有提供日期，使用本週
        if (startDate && endDate) {
            weekStart = startDate;
            weekEnd = endDate;
        } else {
            weekStart = moment().startOf('week').format('YYYY-MM-DD');
            weekEnd = moment().endOf('week').format('YYYY-MM-DD');
        }

        console.log('Date range:', weekStart, 'to', weekEnd);

        const db = new DatabaseConnection();
        await db.connect();

        // 1. 獲取所有用戶
        const users = await db.query(
            `SELECT u.Id, u.UserName, r.RoleName, u.CreatedAt
             FROM Users u 
             JOIN Roles r ON u.RoleId = r.Id 
             ORDER BY u.UserName`
        );

        console.log('Found users:', users.length);

        // 2. 查詢工時數據
        const workLogs = await db.query(
            `SELECT wl.Id, wl.UserId, u.UserName, u.Id as userId,
                    DATE_FORMAT(wl.WorkDate, '%Y-%m-%d') as WorkDate,
                    wl.StartTime, wl.EndTime, wl.Description, wt.TypeName,
                    TIME_TO_SEC(TIMEDIFF(wl.EndTime, wl.StartTime))/3600 as Hours
             FROM WorkLogs wl
             JOIN Users u ON wl.UserId = u.Id
             JOIN WorkTypes wt ON wl.WorkTypeId = wt.Id
             WHERE wl.WorkDate BETWEEN ? AND ?
             ORDER BY u.UserName, wl.WorkDate, wl.StartTime`,
            [weekStart, weekEnd]
        );

        console.log('Found work logs:', workLogs.length);

        // 3. 統計每個員工的數據
        const userStats = {};
        users.forEach(user => {
            userStats[user.Id] = {
                userId: user.Id,
                username: user.UserName,
                email: user.UserName + '@company.com', // 如果沒有email欄位
                totalHours: 0,
                logs: []
            };
        });

        // 處理工時記錄
        workLogs.forEach(log => {
            if (userStats[log.UserId]) {
                const hours = parseFloat(log.Hours) || 0;
                userStats[log.UserId].totalHours += hours;
                userStats[log.UserId].logs.push({
                    date: log.WorkDate,
                    hours: hours,
                    workType: log.TypeName,
                    description: log.Description
                });
            }
        });

        // 轉換為陣列格式
        const userSummary = Object.values(userStats).map(user => ({
            ...user,
            totalHours: Math.round(user.totalHours * 100) / 100
        }));

        console.log('User summary prepared:', userSummary.length);

        // 4. 工作類型統計
        const workTypeStats = {};
        workLogs.forEach(log => {
            const type = log.TypeName;
            if (!workTypeStats[type]) {
                workTypeStats[type] = { count: 0, hours: 0 };
            }
            workTypeStats[type].count++;
            workTypeStats[type].hours += parseFloat(log.Hours) || 0;
        });

        // 格式化工作類型統計
        Object.keys(workTypeStats).forEach(type => {
            workTypeStats[type].hours = Math.round(workTypeStats[type].hours * 100) / 100;
        });

        console.log('Work type stats:', Object.keys(workTypeStats));

        // 5. 計算總統計
        const totalUsers = users.length;
        const totalHours = userSummary.reduce((sum, user) => sum + user.totalHours, 0);
        const totalTasks = workLogs.length;
        const activeUsers = userSummary.filter(user => user.totalHours > 0).length;

        const responseData = {
            summary: {
                totalUsers,
                totalHours: Math.round(totalHours * 100) / 100,
                totalTasks,
                activeUsers
            },
            users,
            userSummary,
            workTypeStats,
            workLogs: workLogs.slice(0, 50), // 限制回傳數量
            dateRange: {
                startDate: weekStart,
                endDate: weekEnd
            }
        };

        console.log('Response summary:', {
            totalUsers: responseData.summary.totalUsers,
            totalHours: responseData.summary.totalHours,
            totalTasks: responseData.summary.totalTasks,
            activeUsers: responseData.summary.activeUsers
        });

        await db.close();
        res.json(responseData);

    } catch (error) {
        console.error('Stats API error:', error);
        res.status(500).json({ 
            error: '獲取統計數據失敗',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// 取得所有員工列表
router.get('/users', async (req, res) => {
    try {
        const db = new DatabaseConnection();
        await db.connect();

        const users = await db.query(
            `SELECT u.Id, u.UserName, r.RoleName, u.CreatedAt
             FROM Users u 
             JOIN Roles r ON u.RoleId = r.Id 
             ORDER BY u.UserName`
        );

        await db.close();
        res.json({ success: true, users });

    } catch (error) {
        console.error('取得員工列表錯誤:', error);
        res.status(500).json({ success: false, message: '取得員工列表失敗' });
    }
});

// 匯出統計數據為 CSV
router.get('/export', async (req, res) => {
    const { format, startDate, endDate } = req.query;

    try {
        let weekStart, weekEnd;
        
        if (startDate && endDate) {
            weekStart = startDate;
            weekEnd = endDate;
        } else {
            weekStart = moment().startOf('week').format('YYYY-MM-DD');
            weekEnd = moment().endOf('week').format('YYYY-MM-DD');
        }

        const db = new DatabaseConnection();
        await db.connect();

        const workLogs = await db.query(
            `SELECT u.UserName, wl.WorkDate, wl.StartTime, wl.EndTime, 
                    wt.TypeName, wl.Description,
                    TIME_TO_SEC(TIMEDIFF(wl.EndTime, wl.StartTime))/3600 as Hours
             FROM WorkLogs wl
             JOIN Users u ON wl.UserId = u.Id
             JOIN WorkTypes wt ON wl.WorkTypeId = wt.Id
             WHERE wl.WorkDate BETWEEN ? AND ?
             ORDER BY u.UserName, wl.WorkDate, wl.StartTime`,
            [weekStart, weekEnd]
        );

        await db.close();

        if (format === 'csv') {
            // 生成 CSV 內容
            let csvContent = '\uFEFF'; // UTF-8 BOM for Excel
            csvContent += '員工姓名,工作日期,開始時間,結束時間,工作類型,工作描述,工時(小時)\n';
            
            workLogs.forEach(log => {
                const hours = Math.round((log.Hours || 0) * 100) / 100;
                csvContent += `"${log.UserName}","${log.WorkDate}","${log.StartTime}","${log.EndTime}","${log.TypeName}","${log.Description || ''}",${hours}\n`;
            });

            const fileName = `工時統計_${weekStart}_${weekEnd}.csv`;

            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
            res.send(csvContent);
        } else {
            res.json({ workLogs });
        }

    } catch (error) {
        console.error('匯出數據錯誤:', error);
        res.status(500).json({ error: '匯出數據失敗' });
    }
});

// 取得所有員工的週報統計 (保留原有功能)
router.get('/weekly-summary', async (req, res) => {
    const { startDate, endDate } = req.query;

    try {
        let weekStart, weekEnd;
        
        // 如果沒有提供日期，使用本週
        if (startDate && endDate) {
            weekStart = startDate;
            weekEnd = endDate;
        } else {
            weekStart = moment().startOf('week').format('YYYY-MM-DD');
            weekEnd = moment().endOf('week').format('YYYY-MM-DD');
        }

        const db = new DatabaseConnection();
        await db.connect();

        // 查詢所有員工的工時資料
        const workLogs = await db.query(
            `SELECT wl.Id, wl.UserId, u.UserName,
                    DATE_FORMAT(wl.WorkDate, '%Y-%m-%d') as WorkDate,
                    wl.StartTime, wl.EndTime, wl.Description, wt.TypeName
             FROM WorkLogs wl
             JOIN Users u ON wl.UserId = u.Id
             JOIN WorkTypes wt ON wl.WorkTypeId = wt.Id
             WHERE wl.WorkDate BETWEEN ? AND ?
             ORDER BY u.UserName, wl.WorkDate, wl.StartTime`,
            [weekStart, weekEnd]
        );

        // 統計每個員工的工時
        const userSummary = {};
        workLogs.forEach(log => {
            const userId = log.UserId;
            const userName = log.UserName;
            
            if (!userSummary[userId]) {
                userSummary[userId] = {
                    userId,
                    userName,
                    totalHours: 0,
                    dailyHours: {},
                    typeHours: {},
                    logs: []
                };
            }

            // 計算工時
            const startTime = new Date(`${log.WorkDate} ${log.StartTime}`);
            const endTime = new Date(`${log.WorkDate} ${log.EndTime}`);
            const hours = (endTime - startTime) / (1000 * 60 * 60);

            userSummary[userId].totalHours += hours;
            userSummary[userId].logs.push({
                ...log,
                duration: hours
            });

            // 日期統計
            const dateKey = log.WorkDate;
            if (!userSummary[userId].dailyHours[dateKey]) {
                userSummary[userId].dailyHours[dateKey] = 0;
            }
            userSummary[userId].dailyHours[dateKey] += hours;

            // 工作類型統計
            if (!userSummary[userId].typeHours[log.TypeName]) {
                userSummary[userId].typeHours[log.TypeName] = 0;
            }
            userSummary[userId].typeHours[log.TypeName] += hours;
        });

        // 整理格式並加入沒有記錄的員工
        const allUsers = await db.query(
            'SELECT Id, UserName FROM Users WHERE RoleId != 1 ORDER BY UserName'
        );

        const finalSummary = allUsers.map(user => {
            const summary = userSummary[user.Id] || {
                userId: user.Id,
                userName: user.UserName,
                totalHours: 0,
                dailyHours: {},
                typeHours: {},
                logs: []
            };
            
            // 四捨五入總時數
            summary.totalHours = Math.round(summary.totalHours * 100) / 100;
            
            return summary;
        });

        await db.close();

        res.json({
            success: true,
            data: {
                period: { startDate: weekStart, endDate: weekEnd },
                userSummary: finalSummary,
                totalUsers: finalSummary.length
            }
        });

    } catch (error) {
        console.error('取得週報統計錯誤:', error);
        res.status(500).json({ success: false, message: '取得週報統計失敗' });
    }
});

// 重設使用者密碼
router.post('/reset-password', async (req, res) => {
    const { userId, newPassword } = req.body;

    try {
        if (!userId || !newPassword) {
            return res.status(400).json({ 
                success: false, 
                message: '請提供使用者ID和新密碼' 
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ 
                success: false, 
                message: '密碼至少需要6個字元' 
            });
        }

        const db = new DatabaseConnection();
        await db.connect();

        // 檢查使用者是否存在
        const user = await db.query(
            'SELECT Id, UserName FROM Users WHERE Id = ?',
            [userId]
        );

        if (user.length === 0) {
            await db.close();
            return res.status(404).json({ 
                success: false, 
                message: '使用者不存在' 
            });
        }

        // 加密新密碼
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 更新密碼
        await db.query(
            'UPDATE Users SET PasswordHash = ? WHERE Id = ?',
            [hashedPassword, userId]
        );

        await db.close();

        res.json({ 
            success: true, 
            message: `使用者 ${user[0].UserName} 的密碼已重設成功` 
        });

    } catch (error) {
        console.error('重設密碼錯誤:', error);
        res.status(500).json({ 
            success: false, 
            message: '重設密碼失敗' 
        });
    }
});

// 取得所有工作類型
router.get('/work-types', async (req, res) => {
    try {
        const db = new DatabaseConnection();
        await db.connect();

        const workTypes = await db.query(
            'SELECT Id, TypeName FROM WorkTypes ORDER BY Id'
        );

        await db.close();
        res.json({ success: true, workTypes });

    } catch (error) {
        console.error('取得工作類型錯誤:', error);
        res.status(500).json({ success: false, message: '取得工作類型失敗' });
    }
});

// 新增工作類型
router.post('/work-types', async (req, res) => {
    const { typeName } = req.body;

    try {
        if (!typeName || typeName.trim().length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: '請輸入工作類型名稱' 
            });
        }

        const db = new DatabaseConnection();
        await db.connect();

        // 檢查是否已存在
        const existing = await db.query(
            'SELECT Id FROM WorkTypes WHERE TypeName = ?',
            [typeName.trim()]
        );

        if (existing.length > 0) {
            await db.close();
            return res.status(400).json({ 
                success: false, 
                message: '此工作類型已存在' 
            });
        }

        // 新增工作類型
        await db.query(
            'INSERT INTO WorkTypes (TypeName) VALUES (?)',
            [typeName.trim()]
        );

        await db.close();
        res.json({ 
            success: true, 
            message: `工作類型「${typeName}」新增成功` 
        });

    } catch (error) {
        console.error('新增工作類型錯誤:', error);
        res.status(500).json({ 
            success: false, 
            message: '新增工作類型失敗' 
        });
    }
});

// 刪除工作類型
router.delete('/work-types/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const db = new DatabaseConnection();
        await db.connect();

        // 檢查是否有工時記錄使用此類型
        const usageCount = await db.query(
            'SELECT COUNT(*) as count FROM WorkLogs WHERE WorkTypeId = ?',
            [id]
        );

        if (usageCount[0].count > 0) {
            await db.close();
            return res.status(400).json({ 
                success: false, 
                message: '此工作類型已被使用，無法刪除' 
            });
        }

        // 刪除工作類型
        const result = await db.query(
            'DELETE FROM WorkTypes WHERE Id = ?',
            [id]
        );

        await db.close();

        if (result.affectedRows > 0) {
            res.json({ 
                success: true, 
                message: '工作類型刪除成功' 
            });
        } else {
            res.status(404).json({ 
                success: false, 
                message: '找不到此工作類型' 
            });
        }

    } catch (error) {
        console.error('刪除工作類型錯誤:', error);
        res.status(500).json({ 
            success: false, 
            message: '刪除工作類型失敗' 
        });
    }
});

// 匯出全員週報 CSV (保留原有功能)
router.post('/export-csv', async (req, res) => {
    const { startDate, endDate } = req.body;

    try {
        const db = new DatabaseConnection();
        await db.connect();

        const workLogs = await db.query(
            `SELECT u.UserName, wl.WorkDate, wl.StartTime, wl.EndTime, 
                    wt.TypeName, wl.Description,
                    TIME_TO_SEC(TIMEDIFF(wl.EndTime, wl.StartTime))/3600 as Hours
             FROM WorkLogs wl
             JOIN Users u ON wl.UserId = u.Id
             JOIN WorkTypes wt ON wl.WorkTypeId = wt.Id
             WHERE wl.WorkDate BETWEEN ? AND ?
             ORDER BY u.UserName, wl.WorkDate, wl.StartTime`,
            [startDate, endDate]
        );

        await db.close();

        // 生成 CSV 內容
        const csvData = workLogs.map(log => ({
            員工姓名: log.UserName,
            工作日期: log.WorkDate,
            開始時間: log.StartTime,
            結束時間: log.EndTime,
            工作類型: log.TypeName,
            工作描述: log.Description || '',
            工時: Math.round(log.Hours * 100) / 100
        }));

        // 設定 CSV 格式
        let csvContent = '\uFEFF'; // UTF-8 BOM for Excel
        csvContent += '員工姓名,工作日期,開始時間,結束時間,工作類型,工作描述,工時(小時)\n';
        
        csvData.forEach(row => {
            csvContent += `"${row.員工姓名}","${row.工作日期}","${row.開始時間}","${row.結束時間}","${row.工作類型}","${row.工作描述}",${row.工時}\n`;
        });

        const fileName = `全員工時報表_${startDate}_${endDate}.csv`;

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
        res.send(csvContent);

    } catch (error) {
        console.error('匯出 CSV 錯誤:', error);
        res.status(500).json({ success: false, message: '匯出 CSV 失敗' });
    }
});

module.exports = router;