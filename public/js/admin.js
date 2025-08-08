// 管理員頁面主要功能
let currentData = null;
let currentView = 'table';

// 頁面載入時初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('管理員頁面載入中...');
    
    // 先載入數據，然後更新介面
    loadData().then(() => {
        if (currentData) {
            updateDashboard();
        } else {
            showEmptyState();
        }
    }).catch(error => {
        console.error('初始載入失敗:', error);
        showErrorState();
    });
    
    // 設定定時更新（每5分鐘更新一次）
    setInterval(() => {
        loadData().then(() => {
            if (currentData) {
                updateDashboard();
            }
        }).catch(error => {
            console.error('定時更新失敗:', error);
        });
    }, 5 * 60 * 1000);
    
    // 設定查詢按鈕事件
    const queryBtn = document.getElementById('queryBtn');
    if (queryBtn) {
        queryBtn.addEventListener('click', performQuery);
    }
    
    // 設定重設按鈕事件  
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            console.log('重設按鈕被點擊');
            // 清空日期輸入
            document.getElementById('startDate').value = '';
            document.getElementById('endDate').value = '';
            // 重新載入預設數據
            loadData().then(() => {
                if (currentData) {
                    updateDashboard();
                }
                showMessage('已重設為預設期間', 'success');
            }).catch(error => {
                console.error('重設時發生錯誤:', error);
                showMessage('重設失敗', 'error');
            });
        });
    }
    
    // 設定匯出 CSV 按鈕事件
    const exportCsvBtn = document.getElementById('exportCsv');
    if (exportCsvBtn) {
        exportCsvBtn.addEventListener('click', exportToCSV);
    }
    
    // 設定匯出 PDF 按鈕事件
    const exportPdfBtn = document.getElementById('exportPdf');
    if (exportPdfBtn) {
        exportPdfBtn.addEventListener('click', exportToPDF);
    }
    
    // 設定檢視切換按鈕事件
    const tableViewBtn = document.getElementById('tableView');
    const gridViewBtn = document.getElementById('gridView');
    
    if (tableViewBtn) {
        tableViewBtn.addEventListener('click', () => switchView('table'));
    }
    if (gridViewBtn) {
        gridViewBtn.addEventListener('click', () => switchView('grid'));
    }
    
    // 設定登出按鈕事件
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('確定要登出嗎？')) {
                window.location.href = '/logout';
            }
        });
    }
});

// 執行查詢
async function performQuery() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    console.log('執行查詢，日期範圍:', startDate, 'to', endDate);
    
    if (startDate && endDate && startDate > endDate) {
        alert('開始日期不能晚於結束日期');
        return;
    }
    
    try {
        showLoadingState();
        
        const queryParams = new URLSearchParams();
        if (startDate) queryParams.append('startDate', startDate);
        if (endDate) queryParams.append('endDate', endDate);
        
        console.log('查詢參數:', queryParams.toString());
        
        const response = await fetch(`/api/admin/stats?${queryParams.toString()}`);
        
        if (response.ok) {
            currentData = await response.json();
            console.log('查詢結果:', currentData);
            updateDashboard();
            hideLoadingState();
            
            // 顯示成功訊息
            showMessage('查詢完成！', 'success');
        } else {
            console.error('查詢失敗，狀態碼:', response.status);
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
        console.error('查詢時發生錯誤:', error);
        alert('查詢時發生錯誤：' + error.message);
        hideLoadingState();
        showErrorState();
    }
}

// 載入資料
async function loadData() {
    try {
        console.log('開始載入統計數據...');
        
        const response = await fetch('/api/admin/stats', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('API 回應狀態:', response.status);
        
        if (response.ok) {
            currentData = await response.json();
            console.log('載入的數據:', currentData);
            return currentData;
        } else {
            const errorText = await response.text();
            console.error('載入失敗:', response.status, errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
    } catch (error) {
        console.error('載入資料時發生錯誤:', error);
        currentData = null;
        throw error;
    }
}

// 顯示訊息
function showMessage(message, type = 'info') {
    // 移除現有的訊息
    const existingMessage = document.querySelector('.admin-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // 創建新訊息
    const messageDiv = document.createElement('div');
    messageDiv.className = `admin-message admin-message-${type}`;
    messageDiv.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" style="margin-left: 1rem; background: none; border: none; color: inherit; cursor: pointer;">×</button>
    `;
    
    // 插入到頁面頂部
    const container = document.querySelector('.container');
    if (container) {
        container.insertBefore(messageDiv, container.firstChild);
        
        // 3秒後自動移除
        setTimeout(() => {
            if (messageDiv && messageDiv.parentElement) {
                messageDiv.remove();
            }
        }, 3000);
    }
}

// 顯示載入狀態
function showLoadingState() {
    const loadingSection = document.getElementById('loadingSection');
    const mainContent = document.getElementById('mainContent');
    
    if (loadingSection) {
        loadingSection.style.display = 'flex';
    }
    if (mainContent) {
        mainContent.style.opacity = '0.5';
    }
}

// 隱藏載入狀態
function hideLoadingState() {
    const loadingSection = document.getElementById('loadingSection');
    const mainContent = document.getElementById('mainContent');
    
    if (loadingSection) {
        loadingSection.style.display = 'none';
    }
    if (mainContent) {
        mainContent.style.opacity = '1';
    }
}

// 顯示空狀態
function showEmptyState() {
    // 顯示預設的空狀態訊息
    const sections = ['employeesTable', 'workTypesChart', 'hoursRanking', 'efficiencyRanking'];
    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            if (sectionId === 'employeesTable') {
                const tbody = section.querySelector('tbody');
                if (tbody) {
                    tbody.innerHTML = '<tr><td colspan="6" class="no-data">請選擇查詢期間後點擊查詢</td></tr>';
                }
            } else {
                section.innerHTML = '<div class="empty-state"><div class="icon">📈</div><p>請先查詢資料</p></div>';
            }
        }
    });
}

// 顯示錯誤狀態
function showErrorState() {
    const sections = ['employeesTable', 'workTypesChart', 'hoursRanking', 'efficiencyRanking'];
    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            if (sectionId === 'employeesTable') {
                const tbody = section.querySelector('tbody');
                if (tbody) {
                    tbody.innerHTML = '<tr><td colspan="6" class="no-data">載入失敗，請重新整理頁面或聯繫管理員</td></tr>';
                }
            } else {
                section.innerHTML = '<div class="empty-state"><div class="icon">⚠️</div><p>載入失敗，請重新整理頁面</p></div>';
            }
        }
    });
}

// 更新儀表板統計
function updateDashboard() {
    if (!currentData) {
        console.warn('沒有數據可更新');
        return;
    }
    
    console.log('更新儀表板...');
    updateOverviewStats();
    updateEmployeesSection();
    updateWorkTypesSection();
    updateRankingSection();
}

// 更新統計概況
function updateOverviewStats() {
    if (!currentData || !currentData.summary) {
        console.warn('統計數據不完整');
        return;
    }
    
    const { summary } = currentData;
    console.log('更新統計概況:', summary);
    
    // 更新統計卡片
    const totalUsersEl = document.getElementById('totalUsers');
    const totalHoursEl = document.getElementById('totalHours');
    const totalTasksEl = document.getElementById('totalTasks');
    const activeUsersEl = document.getElementById('activeUsers');
    
    if (totalUsersEl) {
        totalUsersEl.textContent = summary.totalUsers || 0;
        console.log('更新總用戶數:', summary.totalUsers);
    }
    if (totalHoursEl) {
        totalHoursEl.textContent = summary.totalHours || 0;
        console.log('更新總工時:', summary.totalHours);
    }
    if (totalTasksEl) {
        totalTasksEl.textContent = summary.totalTasks || 0;
        console.log('更新總任務數:', summary.totalTasks);
    }
    if (activeUsersEl) {
        activeUsersEl.textContent = summary.activeUsers || 0;
        console.log('更新活躍用戶數:', summary.activeUsers);
    }
}

// 更新員工工時區域
function updateEmployeesSection() {
    if (currentView === 'table') {
        updateEmployeesTable();
    } else {
        updateEmployeesGrid();
    }
}

// 更新員工工時表格
function updateEmployeesTable() {
    const tbody = document.querySelector('#employeesTable tbody');
    if (!tbody) {
        console.error('找不到員工表格 tbody');
        return;
    }
    
    if (!currentData || !currentData.userSummary) {
        tbody.innerHTML = '<tr><td colspan="5" class="no-data">暫無員工數據</td></tr>';
        return;
    }
    
    console.log('更新員工表格，員工數量:', currentData.userSummary.length);
    tbody.innerHTML = '';
    
    if (currentData.userSummary.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="no-data">此期間無工時記錄</td></tr>';
        return;
    }
    
    currentData.userSummary.forEach(user => {
        const logsCount = user.logs ? user.logs.length : 0;
        const efficiency = user.totalHours > 0 ? Math.round((logsCount / user.totalHours) * 100) / 100 : 0;
        const status = user.totalHours > 40 ? 'active' : user.totalHours > 20 ? 'moderate' : 'low';
        const statusText = user.totalHours > 40 ? '高效' : user.totalHours > 20 ? '中等' : '較少';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.username || user.userName || '未知'}</td>
            <td>${Math.round((user.totalHours || 0) * 100) / 100}</td>
            <td>${logsCount}</td>
            <td>${efficiency}</td>
            <td>
                <span class="status ${status}">
                    ${statusText}
                </span>
            </td>
            <td>
                <button class="btn-reset-password" onclick="resetUserPassword(${user.userId || user.id}, '${user.username || user.userName}')">
                    🔑 重設密碼
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// 更新員工工時網格
function updateEmployeesGrid() {
    const container = document.getElementById('employeesGrid');
    if (!container) {
        console.error('找不到員工網格容器');
        return;
    }
    
    if (!currentData || !currentData.userSummary) {
        container.innerHTML = '<p class="no-data">暫無員工數據</p>';
        return;
    }
    
    container.innerHTML = '';
    
    if (currentData.userSummary.length === 0) {
        container.innerHTML = '<p class="no-data">此期間無工時記錄</p>';
        return;
    }
    
    currentData.userSummary.forEach(user => {
        const logsCount = user.logs ? user.logs.length : 0;
        const efficiency = user.totalHours > 0 ? Math.round((logsCount / user.totalHours) * 100) / 100 : 0;
        const status = user.totalHours > 40 ? 'active' : user.totalHours > 20 ? 'moderate' : 'low';
        const statusText = user.totalHours > 40 ? '高效率' : user.totalHours > 20 ? '中等' : '需改進';
        
        const card = document.createElement('div');
        card.className = 'employee-card';
        card.innerHTML = `
            <h4>${user.username || user.userName || '未知'}</h4>
            <div class="employee-stats">
                <div class="stat">
                    <span class="stat-label">工時</span>
                    <span class="stat-value">${Math.round((user.totalHours || 0) * 100) / 100}h</span>
                </div>
                <div class="stat">
                    <span class="stat-label">任務</span>
                    <span class="stat-value">${logsCount}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">效率</span>
                    <span class="stat-value">${efficiency}</span>
                </div>
            </div>
            <div class="status ${status}">
                ${statusText}
            </div>
        `;
        container.appendChild(card);
    });
}

// 更新工作類型區域
function updateWorkTypesSection() {
    if (!currentData || !currentData.workTypeStats) {
        console.log('工作類型數據不完整');
        const container = document.getElementById('workTypesChart');
        const tbody = document.querySelector('#workTypesTable tbody');
        
        if (container) {
            container.innerHTML = '<p class="no-data">暫無工作類型數據</p>';
        }
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="4" class="no-data">暫無工作類型數據</td></tr>';
        }
        return;
    }
    
    updateWorkTypesChart(currentData.workTypeStats);
    updateWorkTypesTable(currentData.workTypeStats);
}

// 更新工作類型圖表
function updateWorkTypesChart(workTypeStats) {
    const container = document.getElementById('workTypesChart');
    if (!container) return;
    
    container.innerHTML = '';
    
    const entries = Object.entries(workTypeStats);
    if (entries.length === 0) {
        container.innerHTML = '<p class="no-data">暫無工作類型數據</p>';
        return;
    }
    
    const total = entries.reduce((sum, [, stat]) => sum + (stat.hours || 0), 0);
    
    if (total === 0) {
        container.innerHTML = '<p class="no-data">此期間無工時記錄</p>';
        return;
    }
    
    entries.forEach(([type, stat]) => {
        const hours = stat.hours || 0;
        const percentage = (hours / total) * 100;
        
        const item = document.createElement('div');
        item.className = 'chart-item';
        item.innerHTML = `
            <div class="chart-label">${type}</div>
            <div class="chart-bar">
                <div class="chart-fill" style="width: ${percentage}%"></div>
            </div>
            <div class="chart-value">${Math.round(hours * 100) / 100}h (${Math.round(percentage)}%)</div>
        `;
        container.appendChild(item);
    });
}

// 更新工作類型表格
function updateWorkTypesTable(workTypeStats) {
    const tbody = document.querySelector('#workTypesTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const entries = Object.entries(workTypeStats);
    if (entries.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="no-data">暫無工作類型數據</td></tr>';
        return;
    }
    
    entries
        .sort(([,a], [,b]) => (b.hours || 0) - (a.hours || 0))
        .forEach(([type, stat]) => {
            const hours = Math.round((stat.hours || 0) * 100) / 100;
            const count = stat.count || 0;
            const avgHours = count > 0 ? Math.round((hours / count) * 100) / 100 : 0;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${type}</td>
                <td>${hours}</td>
                <td>${count}</td>
                <td>${avgHours}</td>
            `;
            tbody.appendChild(row);
        });
}

// 更新排行榜區域
function updateRankingSection() {
    if (!currentData || !currentData.userSummary) {
        const hourContainer = document.getElementById('hoursRanking');
        const efficiencyContainer = document.getElementById('efficiencyRanking');
        
        if (hourContainer) {
            hourContainer.innerHTML = '<div class="empty-state"><div class="icon">🏆</div><p>暫無排行數據</p></div>';
        }
        if (efficiencyContainer) {
            efficiencyContainer.innerHTML = '<div class="empty-state"><div class="icon">⚡</div><p>暫無排行數據</p></div>';
        }
        return;
    }
    
    // 工時排行榜
    const hourRanking = [...currentData.userSummary]
        .filter(user => user.totalHours > 0)
        .sort((a, b) => (b.totalHours || 0) - (a.totalHours || 0))
        .slice(0, 10);
    
    updateHourRanking(hourRanking);
    
    // 效率排行榜
    const efficiencyRanking = [...currentData.userSummary]
        .map(user => ({
            ...user,
            efficiency: user.totalHours > 0 ? (user.logs ? user.logs.length : 0) / user.totalHours : 0
        }))
        .filter(user => user.efficiency > 0)
        .sort((a, b) => b.efficiency - a.efficiency)
        .slice(0, 10);
    
    updateEfficiencyRanking(efficiencyRanking);
}

// 更新工時排行榜
function updateHourRanking(ranking) {
    const container = document.getElementById('hoursRanking');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (ranking.length === 0) {
        container.innerHTML = '<p class="no-data">此期間無工時記錄</p>';
        return;
    }
    
    ranking.forEach((user, index) => {
        const item = document.createElement('div');
        item.className = 'ranking-item';
        item.innerHTML = `
            <span class="ranking-position">${index + 1}</span>
            <span class="ranking-name">${user.username || user.userName || '未知'}</span>
            <span class="ranking-value">${Math.round((user.totalHours || 0) * 100) / 100}h</span>
        `;
        container.appendChild(item);
    });
}

// 更新效率排行榜
function updateEfficiencyRanking(ranking) {
    const container = document.getElementById('efficiencyRanking');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (ranking.length === 0) {
        container.innerHTML = '<p class="no-data">此期間無效率數據</p>';
        return;
    }
    
    ranking.forEach((user, index) => {
        const item = document.createElement('div');
        item.className = 'ranking-item';
        item.innerHTML = `
            <span class="ranking-position">${index + 1}</span>
            <span class="ranking-name">${user.username || user.userName || '未知'}</span>
            <span class="ranking-value">${Math.round((user.efficiency || 0) * 100) / 100}</span>
        `;
        container.appendChild(item);
    });
}

// 切換檢視模式
function switchView(view) {
    currentView = view;
    
    // 更新按鈕狀態
    document.querySelectorAll('.view-toggle button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeBtn = document.querySelector(`[onclick="switchView('${view}')"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    // 切換內容顯示
    const tableView = document.getElementById('employeesTable');
    const gridView = document.getElementById('employeesGrid');
    
    if (view === 'table') {
        if (tableView) tableView.style.display = 'block';
        if (gridView) gridView.style.display = 'none';
    } else {
        if (tableView) tableView.style.display = 'none';
        if (gridView) gridView.style.display = 'grid';
    }
    
    updateEmployeesSection();
}

// 匯出資料為 CSV
function exportToCSV() {
    console.log('開始匯出 CSV...');
    
    if (!currentData) {
        alert('沒有資料可匯出，請先查詢數據');
        return;
    }
    
    try {
        showLoadingState();
        
        // 取得日期範圍
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        
        // 建立查詢參數
        const queryParams = new URLSearchParams();
        queryParams.append('format', 'csv');
        if (startDate) queryParams.append('startDate', startDate);
        if (endDate) queryParams.append('endDate', endDate);
        
        // 使用 GET 請求匯出
        const url = `/api/admin/export?${queryParams.toString()}`;
        console.log('匯出 URL:', url);
        
        // 創建隱藏的下載連結
        const link = document.createElement('a');
        link.href = url;
        link.download = `工時統計_${new Date().toISOString().split('T')[0]}.csv`;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        hideLoadingState();
        showMessage('CSV 檔案下載中...', 'success');
        
    } catch (error) {
        console.error('匯出 CSV 失敗:', error);
        hideLoadingState();
        alert('匯出失敗：' + error.message);
    }
}

// 匯出資料為 PDF
function exportToPDF() {
    console.log('開始匯出 PDF...');
    
    if (!currentData) {
        alert('沒有資料可匯出，請先查詢數據');
        return;
    }
    
    try {
        showLoadingState();
        
        // 使用列印功能作為 PDF 替代方案
        const printWindow = window.open('', '_blank');
        const printContent = generatePrintContent();
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>工時統計報告</title>
                <meta charset="UTF-8">
                <style>
                    body { font-family: 'Microsoft JhengHei', Arial, sans-serif; margin: 20px; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f5f5f5; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .summary { margin-bottom: 30px; }
                    .summary-item { display: inline-block; margin: 0 20px; }
                    @media print {
                        body { margin: 10px; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                ${printContent}
                <div class="no-print" style="text-align: center; margin-top: 30px;">
                    <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px;">列印 PDF</button>
                    <button onclick="window.close()" style="padding: 10px 20px; font-size: 16px; margin-left: 10px;">關閉</button>
                </div>
            </body>
            </html>
        `);
        
        printWindow.document.close();
        
        hideLoadingState();
        showMessage('PDF 預覽已開啟，請使用列印功能儲存為 PDF', 'success');
        
    } catch (error) {
        console.error('匯出 PDF 失敗:', error);
        hideLoadingState();
        alert('匯出失敗：' + error.message);
    }
}

// 重設使用者密碼
function resetUserPassword(userId, userName) {
    const newPassword = prompt(`請輸入 ${userName} 的新密碼（至少6個字元）:`);
    
    if (!newPassword) {
        return;
    }
    
    if (newPassword.length < 6) {
        alert('密碼至少需要6個字元');
        return;
    }
    
    if (!confirm(`確定要重設 ${userName} 的密碼嗎？`)) {
        return;
    }
    
    showLoadingState();
    
    fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'same-origin',
        body: JSON.stringify({
            userId: userId,
            newPassword: newPassword
        })
    })
    .then(response => response.json())
    .then(result => {
        hideLoadingState();
        
        if (result.success) {
            showMessage(result.message, 'success');
        } else {
            showMessage(result.message, 'error');
        }
    })
    .catch(error => {
        hideLoadingState();
        console.error('重設密碼錯誤:', error);
        showMessage('重設密碼失敗', 'error');
    });
}

// 生成列印內容
function generatePrintContent() {
    if (!currentData) {
        return '<p>沒有數據可列印</p>';
    }
    
    const date = new Date().toLocaleDateString('zh-TW');
    const { summary } = currentData;
    const dateRange = currentData.dateRange || {};
    
    let content = `
        <div class="header">
            <h1>工時統計報告</h1>
            <p>報告日期：${date}</p>
            <p>統計期間：${dateRange.startDate || '全部'} ~ ${dateRange.endDate || '全部'}</p>
        </div>
        
        <div class="summary">
            <h2>統計概況</h2>
            <div class="summary-item"><strong>總員工數：</strong>${summary.totalUsers || 0}</div>
            <div class="summary-item"><strong>總工時：</strong>${summary.totalHours || 0} 小時</div>
            <div class="summary-item"><strong>總任務：</strong>${summary.totalTasks || 0}</div>
            <div class="summary-item"><strong>活躍用戶：</strong>${summary.activeUsers || 0}</div>
        </div>
        
        <h2>員工詳細資料</h2>
        <table>
            <thead>
                <tr>
                    <th>員工姓名</th>
                    <th>總工時</th>
                    <th>任務數量</th>
                    <th>平均效率</th>
                    <th>狀態</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    if (currentData.userSummary) {
        currentData.userSummary.forEach(user => {
            const logsCount = user.logs ? user.logs.length : 0;
            const efficiency = user.totalHours > 0 ? Math.round((logsCount / user.totalHours) * 100) / 100 : 0;
            const status = user.totalHours > 40 ? '高效' : user.totalHours > 20 ? '中等' : '較少';
            
            content += `
                <tr>
                    <td>${user.username || user.userName || '未知'}</td>
                    <td>${Math.round((user.totalHours || 0) * 100) / 100}</td>
                    <td>${logsCount}</td>
                    <td>${efficiency}</td>
                    <td>${status}</td>
                </tr>
            `;
        });
    }
    
    content += `
            </tbody>
        </table>
    `;
    
    return content;
}