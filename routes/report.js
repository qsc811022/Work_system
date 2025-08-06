const express = require('express');
const moment = require('moment');
const puppeteer = require('puppeteer');
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

// 取得週報資料
router.get('/weekly', async (req, res) => {
    const userId = req.session.user.id;
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

        // 查詢該週的工時記錄
        const workLogs = await db.query(
            `SELECT wl.*, wt.TypeName 
             FROM WorkLogs wl 
             JOIN WorkTypes wt ON wl.WorkTypeId = wt.Id 
             WHERE wl.UserId = ? AND wl.WorkDate BETWEEN ? AND ?
             ORDER BY wl.WorkDate, wl.StartTime`,
            [userId, weekStart, weekEnd]
        );

        // 計算統計資料
        let totalHours = 0;
        const dailySummary = {};
        const typeSummary = {};

        workLogs.forEach(log => {
            const startTime = moment(`${log.WorkDate} ${log.StartTime}`);
            const endTime = moment(`${log.WorkDate} ${log.EndTime}`);
            const hours = endTime.diff(startTime, 'hours', true);
            
            totalHours += hours;

            // 日期統計
            const dateKey = log.WorkDate;
            if (!dailySummary[dateKey]) {
                dailySummary[dateKey] = { hours: 0, logs: [] };
            }
            dailySummary[dateKey].hours += hours;
            dailySummary[dateKey].logs.push({
                ...log,
                duration: hours
            });

            // 工作類型統計
            if (!typeSummary[log.TypeName]) {
                typeSummary[log.TypeName] = { hours: 0, count: 0 };
            }
            typeSummary[log.TypeName].hours += hours;
            typeSummary[log.TypeName].count++;
        });

        await db.close();

        res.json({
            success: true,
            data: {
                period: { startDate: weekStart, endDate: weekEnd },
                totalHours: Math.round(totalHours * 100) / 100,
                dailySummary,
                typeSummary,
                workLogs,
                user: req.session.user
            }
        });

    } catch (error) {
        console.error('取得週報錯誤:', error);
        res.status(500).json({ success: false, message: '取得週報資料失敗' });
    }
});

// 生成週報文字內容
router.post('/generate-text', async (req, res) => {
    const userId = req.session.user.id;
    const { startDate, endDate, customNotes } = req.body;

    try {
        const db = new DatabaseConnection();
        await db.connect();

        // 取得週報資料
        const workLogs = await db.query(
            `SELECT wl.*, wt.TypeName 
             FROM WorkLogs wl 
             JOIN WorkTypes wt ON wl.WorkTypeId = wt.Id 
             WHERE wl.UserId = ? AND wl.WorkDate BETWEEN ? AND ?
             ORDER BY wl.WorkDate, wl.StartTime`,
            [userId, startDate, endDate]
        );

        await db.close();

        // 生成文字報告
        let reportText = `=== 週報 ===\n`;
        reportText += `期間：${startDate} 至 ${endDate}\n`;
        reportText += `員工：${req.session.user.userName}\n\n`;

        // 按日期分組
        const dailyGroups = {};
        let totalHours = 0;

        workLogs.forEach(log => {
            const date = log.WorkDate;
            if (!dailyGroups[date]) {
                dailyGroups[date] = [];
            }
            
            const startTime = moment(`${date} ${log.StartTime}`);
            const endTime = moment(`${date} ${log.EndTime}`);
            const hours = endTime.diff(startTime, 'hours', true);
            
            totalHours += hours;
            
            dailyGroups[date].push({
                ...log,
                duration: hours
            });
        });

        // 生成每日摘要
        Object.keys(dailyGroups).sort().forEach(date => {
            const dayName = moment(date).format('dddd');
            reportText += `【${date} (${dayName})】\n`;
            
            let dayHours = 0;
            dailyGroups[date].forEach(log => {
                dayHours += log.duration;
                reportText += `• ${log.StartTime}-${log.EndTime} ${log.TypeName}`;
                if (log.Description) {
                    reportText += `：${log.Description}`;
                }
                reportText += `\n`;
            });
            
            reportText += `  小計：${Math.round(dayHours * 100) / 100}小時\n\n`;
        });

        // 工作類型統計
        const typeStats = {};
        workLogs.forEach(log => {
            const startTime = moment(`${log.WorkDate} ${log.StartTime}`);
            const endTime = moment(`${log.WorkDate} ${log.EndTime}`);
            const hours = endTime.diff(startTime, 'hours', true);
            
            if (!typeStats[log.TypeName]) {
                typeStats[log.TypeName] = 0;
            }
            typeStats[log.TypeName] += hours;
        });

        reportText += `=== 工作類型統計 ===\n`;
        Object.keys(typeStats).forEach(type => {
            const percentage = ((typeStats[type] / totalHours) * 100).toFixed(1);
            reportText += `• ${type}：${Math.round(typeStats[type] * 100) / 100}小時 (${percentage}%)\n`;
        });

        reportText += `\n總工時：${Math.round(totalHours * 100) / 100}小時\n`;

        // 加入自訂備註
        if (customNotes) {
            reportText += `\n=== 備註 ===\n${customNotes}\n`;
        }

        res.json({
            success: true,
            reportText,
            stats: {
                totalHours: Math.round(totalHours * 100) / 100,
                typeStats,
                dailyCount: Object.keys(dailyGroups).length
            }
        });

    } catch (error) {
        console.error('生成週報文字錯誤:', error);
        res.status(500).json({ success: false, message: '生成週報文字失敗' });
    }
});

// 匯出 PDF
router.post('/export-pdf', async (req, res) => {
    const userId = req.session.user.id;
    const { startDate, endDate, reportText } = req.body;

    try {
        // 生成 HTML 內容
        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>週報 - ${req.session.user.userName}</title>
            <style>
                body { 
                    font-family: 'Microsoft JhengHei', Arial, sans-serif; 
                    margin: 20px;
                    line-height: 1.6;
                }
                .header { 
                    text-align: center; 
                    border-bottom: 2px solid #333; 
                    padding-bottom: 10px;
                    margin-bottom: 20px;
                }
                .content { 
                    white-space: pre-line; 
                    font-size: 14px;
                }
                .footer {
                    margin-top: 30px;
                    text-align: right;
                    font-size: 12px;
                    color: #666;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>工作週報</h1>
                <p>員工：${req.session.user.userName} | 期間：${startDate} 至 ${endDate}</p>
            </div>
            <div class="content">${reportText.replace(/\n/g, '<br>')}</div>
            <div class="footer">
                <p>產生時間：${moment().format('YYYY-MM-DD HH:mm:ss')}</p>
            </div>
        </body>
        </html>`;

        // 使用 Puppeteer 生成 PDF
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        
        const pdfBuffer = await page.pdf({
            format: 'A4',
            margin: {
                top: '20px',
                right: '20px',
                bottom: '20px',
                left: '20px'
            }
        });

        await browser.close();

        // 設定檔案名稱
        const fileName = `週報_${req.session.user.userName}_${startDate}_${endDate}.pdf`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
        res.send(pdfBuffer);

    } catch (error) {
        console.error('匯出 PDF 錯誤:', error);
        res.status(500).json({ success: false, message: '匯出 PDF 失敗' });
    }
});

// 儲存週報草稿
router.post('/save-draft', async (req, res) => {
    const userId = req.session.user.id;
    const { startDate, endDate, reportText, customNotes } = req.body;

    try {
        const db = new DatabaseConnection();
        await db.connect();

        // 檢查是否已有草稿
        const existing = await db.query(
            `SELECT Id FROM WeeklyReportDrafts 
             WHERE UserId = ? AND StartDate = ? AND EndDate = ?`,
            [userId, startDate, endDate]
        );

        if (existing.length > 0) {
            // 更新現有草稿
            await db.query(
                `UPDATE WeeklyReportDrafts 
                 SET ReportText = ?, CustomNotes = ?, UpdatedAt = CURRENT_TIMESTAMP
                 WHERE Id = ?`,
                [reportText, customNotes || '', existing[0].Id]
            );
        } else {
            // 建立新草稿 (需要先建立 WeeklyReportDrafts 表)
            await db.query(
                `INSERT INTO WeeklyReportDrafts (UserId, StartDate, EndDate, ReportText, CustomNotes) 
                 VALUES (?, ?, ?, ?, ?)`,
                [userId, startDate, endDate, reportText, customNotes || '']
            );
        }

        await db.close();
        res.json({ success: true, message: '草稿儲存成功' });

    } catch (error) {
        console.error('儲存草稿錯誤:', error);
        res.status(500).json({ success: false, message: '儲存草稿失敗' });
    }
});

module.exports = router;