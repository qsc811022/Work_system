// 測試 Admin 功能修復
const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();

// 設定 EJS 模板引擎
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 中介軟體設定
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// 模擬 session
app.use((req, res, next) => {
    req.session = {
        user: {
            id: 1,
            userName: 'admin',
            roleName: 'admin'
        }
    };
    next();
});

// 測試路由
app.get('/admin', (req, res) => {
    console.log('Admin page accessed');
    res.render('admin', {
        title: '管理面板',
        user: req.session.user
    });
});

// 測試 API 路由
app.get('/api/admin/stats', (req, res) => {
    console.log('Stats API called with params:', req.query);
    
    // 模擬數據
    const mockData = {
        summary: {
            totalUsers: 5,
            totalHours: 120.5,
            totalTasks: 25,
            activeUsers: 4
        },
        userSummary: [
            {
                username: '張三',
                totalHours: 40.5,
                logs: [
                    { date: '2025-01-06', hours: 8, workType: 'Coding', description: '開發功能' },
                    { date: '2025-01-07', hours: 7.5, workType: 'Testing', description: '測試功能' }
                ]
            },
            {
                username: '李四',
                totalHours: 35.0,
                logs: [
                    { date: '2025-01-06', hours: 8, workType: 'Meeting', description: '會議討論' }
                ]
            }
        ],
        workTypeStats: {
            'Coding': { count: 10, hours: 50.5 },
            'Meeting': { count: 8, hours: 30.0 },
            'Testing': { count: 7, hours: 40.0 }
        },
        dateRange: {
            startDate: req.query.startDate || '2025-01-06',
            endDate: req.query.endDate || '2025-01-12'
        }
    };
    
    res.json(mockData);
});

// 測試匯出功能
app.get('/api/admin/export', (req, res) => {
    console.log('Export API called with params:', req.query);
    
    if (req.query.format === 'csv') {
        const csvContent = '\uFEFF員工姓名,工作日期,開始時間,結束時間,工作類型,工作描述,工時(小時)\n' +
                          '"張三","2025-01-06","09:00","17:00","Coding","開發功能",8\n' +
                          '"李四","2025-01-06","09:00","17:00","Meeting","會議討論",8\n';
        
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="test-export.csv"');
        res.send(csvContent);
    } else {
        res.json({ message: 'Export test successful' });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`測試伺服器運行在 http://localhost:${PORT}`);
    console.log('請訪問 http://localhost:3001/admin 測試管理員功能');
    console.log('測試項目：');
    console.log('1. 查詢按鈕功能');
    console.log('2. 重設按鈕功能');
    console.log('3. 匯出 CSV 功能');
    console.log('4. 匯出 PDF 功能');
});