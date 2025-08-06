const express = require('express');
const moment = require('moment');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const puppeteer = require('puppeteer');
const DatabaseConnection = require('../config/database');
const { requireAuth, requireAdmin } = require('../config/middleware');

const router = express.Router();

// 所有路由都需要管理員權限
router.use(requireAuth);
router.use(requireAdmin);

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

// 取得所有員工的週報統計
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
            `SELECT wl.*, u.UserName, wt.TypeName
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

            const startTime = moment(`${log.WorkDate} ${log.StartTime}`);
            const endTime = moment(`${log.WorkDate} ${log.EndTime}`);
            const hours = endTime.diff(startTime, 'hours', true);

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

// 取得工作內容統計
router.get('/work-statistics', async (req, res) => {
    const { startDate, endDate } = req.query;

    try {
        let dateStart, dateEnd;
        
        if (startDate && endDate) {
            dateStart = startDate;
            dateEnd = endDate;
        } else {
            // 預設為本月
            dateStart = moment().startOf('month').format('YYYY-MM-DD');
            dateEnd = moment().endOf('month').format('YYYY-MM-DD');
        }

        const db = new DatabaseConnection();
        await db.connect();

        // 工作類型統計
        const typeStats = await db.query(
            `SELECT wt.TypeName, 
                    COUNT(wl.Id) as TaskCount,
                    SUM(TIME_TO_SEC(TIMEDIFF(wl.EndTime, wl.StartTime))/3600) as TotalHours
             FROM WorkLogs wl
             JOIN WorkTypes wt ON wl.WorkTypeId = wt.Id
             WHERE wl.WorkDate BETWEEN ? AND ?
             GROUP BY wt.Id, wt.TypeName
             ORDER BY TotalHours DESC`,
            [dateStart, dateEnd]
        );

        // 每日工時統計
        const dailyStats = await db.query(
            `SELECT wl.WorkDate,
                    COUNT(DISTINCT wl.UserId) as ActiveUsers,
                    COUNT(wl.Id) as TaskCount,
                    SUM(TIME_TO_SEC(TIMEDIFF(wl.EndTime, wl.StartTime))/3600) as TotalHours
             FROM WorkLogs wl
             WHERE wl.WorkDate BETWEEN ? AND ?
             GROUP BY wl.WorkDate
             ORDER BY wl.WorkDate`,
            [dateStart, dateEnd]
        );

        // 員工績效排行
        const userRanking = await db.query(
            `SELECT u.UserName,
                    COUNT(wl.Id) as TaskCount,
                    SUM(TIME_TO_SEC(TIMEDIFF(wl.EndTime, wl.StartTime))/3600) as TotalHours
             FROM WorkLogs wl
             JOIN Users u ON wl.UserId = u.Id
             WHERE wl.WorkDate BETWEEN ? AND ?
             GROUP BY u.Id, u.UserName
             ORDER BY TotalHours DESC
             LIMIT 10`,
            [dateStart, dateEnd]
        );

        await db.close();

        res.json({
            success: true,
            data: {
                period: { startDate: dateStart, endDate: dateEnd },
                typeStatistics: typeStats.map(stat => ({
                    ...stat,
                    TotalHours: Math.round(stat.TotalHours * 100) / 100
                })),
                dailyStatistics: dailyStats.map(stat => ({
                    ...stat,
                    TotalHours: Math.round(stat.TotalHours * 100) / 100
                })),
                userRanking: userRanking.map(stat => ({
                    ...stat,
                    TotalHours: Math.round(stat.TotalHours * 100) / 100
                }))
            }
        });

    } catch (error) {
        console.error('取得工作統計錯誤:', error);
        res.status(500).json({ success: false, message: '取得工作統計失敗' });
    }
});

// 匯出全員週報 CSV
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

// 匯出全員週報 PDF
router.post('/export-pdf', async (req, res) => {
    const { startDate, endDate } = req.body;

    try {
        const db = new DatabaseConnection();
        await db.connect();

        // 取得統計資料
        const userSummary = await db.query(
            `SELECT u.UserName,
                    COUNT(wl.Id) as TaskCount,
                    SUM(TIME_TO_SEC(TIMEDIFF(wl.EndTime, wl.StartTime))/3600) as TotalHours
             FROM Users u
             LEFT JOIN WorkLogs wl ON u.Id = wl.UserId AND wl.WorkDate BETWEEN ? AND ?
             WHERE u.RoleId != 1
             GROUP BY u.Id, u.UserName
             ORDER BY u.UserName`,
            [startDate, endDate]
        );

        await db.close();

        // 生成 HTML 報告
        let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>全員工時週報</title>
            <style>
                body { font-family: 'Microsoft JhengHei', Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 15px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
                th { background-color: #f2f2f2; font-weight: bold; }
                .footer { margin-top: 30px; text-align: right; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>全員工時週報</h1>
                <p>統計期間：${startDate} 至 ${endDate}</p>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>員工姓名</th>
                        <th>工作天數</th>
                        <th>總工時</th>
                        <th>平均日工時</th>
                    </tr>
                </thead>
                <tbody>`;

        userSummary.forEach(user => {
            const totalHours = Math.round((user.TotalHours || 0) * 100) / 100;
            const avgHours = user.TaskCount > 0 ? Math.round((totalHours / user.TaskCount) * 100) / 100 : 0;
            
            htmlContent += `
                    <tr>
                        <td>${user.UserName}</td>
                        <td>${user.TaskCount || 0}</td>
                        <td>${totalHours}</td>
                        <td>${avgHours}</td>
                    </tr>`;
        });

        htmlContent += `
                </tbody>
            </table>
            <div class="footer">
                <p>報表產生時間：${moment().format('YYYY-MM-DD HH:mm:ss')}</p>
            </div>
        </body>
        </html>`;

        // 生成 PDF
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        
        const pdfBuffer = await page.pdf({
            format: 'A4',
            margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
        });

        await browser.close();

        const fileName = `全員工時週報_${startDate}_${endDate}.pdf`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
        res.send(pdfBuffer);

    } catch (error) {
        console.error('匯出 PDF 錯誤:', error);
        res.status(500).json({ success: false, message: '匯出 PDF 失敗' });
    }
});

module.exports = router;