const express = require('express');
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

// 日期處理函數
function getWeekStart(date = new Date()) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return d.toISOString().split('T')[0];
}

function getWeekEnd(date = new Date()) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? 0 : 7);
    d.setDate(diff);
    return d.toISOString().split('T')[0];
}

// 安全的時間計算函數
function calculateHours(dateStr, startTimeStr, endTimeStr) {
    try {
        // 確保時間格式正確
        const startTime = startTimeStr.substring(0, 5);
        const endTime = endTimeStr.substring(0, 5);
        
        const [startHour, startMin] = startTime.split(':').map(Number);
        const [endHour, endMin] = endTime.split(':').map(Number);
        
        const startTotalMinutes = startHour * 60 + startMin;
        const endTotalMinutes = endHour * 60 + endMin;
        
        const diffMinutes = endTotalMinutes - startTotalMinutes;
        const hours = diffMinutes / 60;
        
        if (isNaN(hours) || hours < 0) {
            return 0;
        }
        
        return hours;
    } catch (error) {
        console.error('計算工時錯誤:', error);
        return 0;
    }
}

// 格式化小時數
function formatHours(hours) {
    if (isNaN(hours) || hours === null || hours === undefined) {
        return '0';
    }
    return (Math.round(hours * 100) / 100).toString();
}

// 取得週報資料
router.get('/weekly', async (req, res) => {
    const userId = req.session.user.id;
    const { startDate, endDate } = req.query;

    try {
        let weekStart, weekEnd;
        
        if (startDate && endDate) {
            weekStart = startDate;
            weekEnd = endDate;
        } else {
            weekStart = getWeekStart();
            weekEnd = getWeekEnd();
        }

        const db = new DatabaseConnection();
        await db.connect();

        const workLogs = await db.query(
            `SELECT wl.Id, wl.UserId, 
                    DATE_FORMAT(wl.WorkDate, '%Y-%m-%d') as WorkDate,
                    wl.StartTime, wl.EndTime, wl.Description, wt.TypeName 
             FROM WorkLogs wl 
             JOIN WorkTypes wt ON wl.WorkTypeId = wt.Id 
             WHERE wl.UserId = ? AND wl.WorkDate BETWEEN ? AND ?
             ORDER BY wl.WorkDate, wl.StartTime`,
            [userId, weekStart, weekEnd]
        );

        let totalHours = 0;
        const dailySummary = {};
        const typeSummary = {};

        workLogs.forEach(log => {
            const hours = calculateHours(log.WorkDate, log.StartTime, log.EndTime);
            totalHours += hours;

            const dateKey = log.WorkDate;
            if (!dailySummary[dateKey]) {
                dailySummary[dateKey] = { hours: 0, logs: [] };
            }
            dailySummary[dateKey].hours += hours;
            dailySummary[dateKey].logs.push({
                ...log,
                duration: hours
            });

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
                totalHours: parseFloat(formatHours(totalHours)),
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

// 生成文字週報
router.post('/generate-text', async (req, res) => {
    const userId = req.session.user.id;
    const { startDate, endDate, customNotes } = req.body;

    try {
        const db = new DatabaseConnection();
        await db.connect();

        const workLogs = await db.query(
            `SELECT wl.Id, wl.UserId, 
                    DATE_FORMAT(wl.WorkDate, '%Y-%m-%d') as WorkDate,
                    wl.StartTime, wl.EndTime, wl.Description, wt.TypeName 
             FROM WorkLogs wl 
             JOIN WorkTypes wt ON wl.WorkTypeId = wt.Id 
             WHERE wl.UserId = ? AND wl.WorkDate BETWEEN ? AND ?
             ORDER BY wl.WorkDate, wl.StartTime`,
            [userId, startDate, endDate]
        );

        await db.close();

        let reportText = `=== 週報 ===\n`;
        reportText += `期間：${startDate} 至 ${endDate}\n`;
        reportText += `員工：${req.session.user.userName}\n\n`;

        let totalHours = 0;
        const dailyGroups = {};
        const typeStats = {};

        workLogs.forEach(log => {
            const hours = calculateHours(log.WorkDate, log.StartTime, log.EndTime);
            totalHours += hours;

            const dateKey = log.WorkDate;
            if (!dailyGroups[dateKey]) {
                dailyGroups[dateKey] = [];
            }
            
            dailyGroups[dateKey].push({
                time: `${log.StartTime.substring(0,5)}-${log.EndTime.substring(0,5)}`,
                type: log.TypeName,
                description: log.Description || '',
                duration: hours
            });

            if (!typeStats[log.TypeName]) {
                typeStats[log.TypeName] = 0;
            }
            typeStats[log.TypeName] += hours;
        });

        // 按日期排序生成每日摘要
        Object.keys(dailyGroups).sort((a, b) => new Date(a) - new Date(b)).forEach(date => {
            const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
            const dayName = weekDays[new Date(date).getDay()];
            const dayData = dailyGroups[date];
            
            reportText += `【${date} (${dayName})】\n`;
            
            let dayHours = 0;
            dayData.sort((a, b) => a.time.localeCompare(b.time)).forEach(task => {
                dayHours += task.duration;
                reportText += `• ${task.time} ${task.type}`;
                if (task.description) {
                    reportText += `：${task.description}`;
                }
                reportText += `\n`;
            });
            
            reportText += `  小計：${formatHours(dayHours)}小時\n\n`;
        });

        // 工作類型統計
        reportText += `=== 工作類型統計 ===\n`;
        Object.keys(typeStats)
            .sort((a, b) => typeStats[b] - typeStats[a])
            .forEach(type => {
                const hours = typeStats[type];
                const percentage = totalHours > 0 ? ((hours / totalHours) * 100).toFixed(1) : '0.0';
                reportText += `• ${type}：${formatHours(hours)}小時 (${percentage}%)\n`;
            });

        reportText += `\n總工時：${formatHours(totalHours)}小時\n`;

        if (customNotes) {
            reportText += `\n=== 備註 ===\n${customNotes}\n`;
        }

        res.json({
            success: true,
            reportText,
            stats: {
                totalHours: parseFloat(formatHours(totalHours)),
                typeStats,
                dailyCount: Object.keys(dailyGroups).length
            }
        });

    } catch (error) {
        console.error('生成週報文字錯誤:', error);
        res.status(500).json({ success: false, message: '生成週報文字失敗' });
    }
});

// 儲存草稿
router.post('/save-draft', async (req, res) => {
    const userId = req.session.user.id;
    const { startDate, endDate, customNotes } = req.body;

    try {
        const db = new DatabaseConnection();
        await db.connect();

        // 檢查是否已有草稿
        const existingDraft = await db.query(
            'SELECT Id FROM ReportDrafts WHERE UserId = ? AND StartDate = ? AND EndDate = ?',
            [userId, startDate, endDate]
        );

        if (existingDraft.length > 0) {
            // 更新現有草稿
            await db.query(
                'UPDATE ReportDrafts SET CustomNotes = ?, UpdatedAt = CURRENT_TIMESTAMP WHERE Id = ?',
                [customNotes, existingDraft[0].Id]
            );
        } else {
            // 創建新草稿
            await db.query(
                'INSERT INTO ReportDrafts (UserId, StartDate, EndDate, CustomNotes) VALUES (?, ?, ?, ?)',
                [userId, startDate, endDate, customNotes]
            );
        }

        await db.close();

        res.json({ 
            success: true, 
            message: '草稿已儲存' 
        });

    } catch (error) {
        console.error('儲存草稿錯誤:', error);
        res.status(500).json({ 
            success: false, 
            message: '儲存草稿失敗' 
        });
    }
});

// 載入草稿
router.get('/load-draft', async (req, res) => {
    const userId = req.session.user.id;
    const { startDate, endDate } = req.query;

    try {
        const db = new DatabaseConnection();
        await db.connect();

        const draft = await db.query(
            'SELECT CustomNotes FROM ReportDrafts WHERE UserId = ? AND StartDate = ? AND EndDate = ?',
            [userId, startDate, endDate]
        );

        await db.close();

        res.json({ 
            success: true, 
            customNotes: draft.length > 0 ? draft[0].CustomNotes : '' 
        });

    } catch (error) {
        console.error('載入草稿錯誤:', error);
        res.status(500).json({ 
            success: false, 
            message: '載入草稿失敗' 
        });
    }
});

// 匯出 PDF
router.post('/export-pdf', async (req, res) => {
    const { startDate, endDate, reportText } = req.body;

    try {
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
                <p>產生時間：${new Date().toLocaleString('zh-TW')}</p>
            </div>
        </body>
        </html>`;

        const puppeteer = require('puppeteer-core');
        const chromeLauncher = require('chrome-launcher');

        const chromePath = chromeLauncher.Launcher.getInstallations()[0]; // 自動取得 Chrome 路徑

        const browser = await puppeteer.launch({
        executablePath: chromePath,
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        // const browser = await puppeteer.launch({
        //     headless: true,
        //     args: ['--no-sandbox', '--disable-setuid-sandbox']
        // });
        
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

        const fileName = `週報_${req.session.user.userName}_${startDate}_${endDate}.pdf`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
        res.send(pdfBuffer);

    } catch (error) {
        console.error('匯出 PDF 錯誤:', error);
        res.status(500).json({ success: false, message: '匯出 PDF 失敗' });
    }
});

module.exports = router;