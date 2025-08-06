document.addEventListener('DOMContentLoaded', function() {
    // 載入儀表板資料
    loadDashboardData();
    
    // 載入最近的工時記錄
    loadRecentRecords();

    // 登出功能
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
});

// 載入儀表板統計資料
async function loadDashboardData() {
    try {
        // 載入本週統計
        const weeklyResponse = await fetch('/api/report/weekly');
        const weeklyData = await weeklyResponse.json();
        
        if (weeklyData.success) {
            updateStatsCards(weeklyData.data);
        }
    } catch (error) {
        console.error('載入儀表板資料錯誤:', error);
    }
}

// 更新統計卡片
function updateStatsCards(data) {
    // 更新本週工時
    const totalHoursElement = document.getElementById('totalHours');
    if (totalHoursElement) {
        totalHoursElement.textContent = data.totalHours || 0;
    }
    
    // 更新工作天數
    const workDaysElement = document.getElementById('workDays');
    if (workDaysElement) {
        const workDays = Object.keys(data.dailySummary || {}).length;
        workDaysElement.textContent = workDays;
    }
    
    // 更新任務數量
    const totalTasksElement = document.getElementById('totalTasks');
    if (totalTasksElement) {
        totalTasksElement.textContent = data.workLogs?.length || 0;
    }
    
    // 更新平均日工時
    const avgHoursElement = document.getElementById('avgHours');
    if (avgHoursElement) {
        const workDays = Object.keys(data.dailySummary || {}).length;
        const avgHours = workDays > 0 ? (data.totalHours / workDays).toFixed(1) : 0;
        avgHoursElement.textContent = avgHours;
    }
}

// 載入最近的工時記錄
async function loadRecentRecords() {
    try {
        const response = await fetch('/api/worklog/list?limit=5');
        const data = await response.json();
        
        if (data.success) {
            displayRecentRecords(data.workLogs);
        }
    } catch (error) {
        console.error('載入最近記錄錯誤:', error);
        showEmptyState('載入記錄失敗');
    }
}

// 顯示最近記錄
function displayRecentRecords(records) {
    const tbody = document.getElementById('recentRecordsBody');
    
    if (!records || records.length === 0) {
        showEmptyState('暫無工時記錄');
        return;
    }
    
    tbody.innerHTML = records.map(record => {
        const duration = calculateDuration(record.StartTime, record.EndTime);
        const workDate = new Date(record.WorkDate).toLocaleDateString('zh-TW');
        
        return `
            <tr>
                <td>${workDate}</td>
                <td>${record.StartTime} - ${record.EndTime}</td>
                <td><span class="work-type-badge">${record.TypeName}</span></td>
                <td>${record.Description || '-'}</td>
                <td><span class="duration">${duration}h</span></td>
            </tr>
        `;
    }).join('');
}

// 計算工時長度
function calculateDuration(startTime, endTime) {
    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);
    const diffMs = end - start;
    const hours = diffMs / (1000 * 60 * 60);
    return Math.round(hours * 100) / 100;
}

// 顯示空狀態
function showEmptyState(message = '暫無資料') {
    const tbody = document.getElementById('recentRecordsBody');
    tbody.innerHTML = `
        <tr>
            <td colspan="5">
                <div class="empty-state">
                    <div class="icon">📝</div>
                    <p>${message}</p>
                    <p><a href="/worklog">立即新增工時記錄</a></p>
                </div>
            </td>
        </tr>
    `;
}

// 處理登出
async function handleLogout(e) {
    e.preventDefault();
    
    if (!confirm('確定要登出嗎？')) {
        return;
    }
    
    try {
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            window.location.href = '/login';
        } else {
            alert('登出失敗，請稍後再試');
        }
    } catch (error) {
        console.error('登出錯誤:', error);
        // 即使 API 失敗也強制跳轉到登入頁面
        window.location.href = '/login';
    }
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

// 格式化時間
function formatTime(timeString) {
    return timeString.substring(0, 5); // HH:MM
}