document.addEventListener('DOMContentLoaded', function() {
    // 初始化
    setDefaultDateRange();
    bindEvents();
    
    // 自動載入本週數據
    generateReport();
});

let currentReportData = null;

function bindEvents() {
    // 生成週報按鈕
    const generateBtn = document.getElementById('generateBtn');
    if (generateBtn) {
        generateBtn.addEventListener('click', generateReport);
    }
    
    // 匯出 PDF 按鈕
    const exportPdfBtn = document.getElementById('exportPdfBtn');
    if (exportPdfBtn) {
        exportPdfBtn.addEventListener('click', exportPDF);
    }
    
    // 儲存草稿按鈕
    const saveDraftBtn = document.getElementById('saveDraftBtn');
    if (saveDraftBtn) {
        saveDraftBtn.addEventListener('click', saveDraft);
    }
    
    // 登出功能
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // 自訂備註變更事件
    const notesTextarea = document.getElementById('customNotes');
    if (notesTextarea) {
        notesTextarea.addEventListener('input', debounce(updateReportText, 500));
    }
}

// 設定預設日期範圍（本週）
function setDefaultDateRange() {
    const today = new Date();
    const monday = new Date(today);
    const sunday = new Date(today);
    
    // 計算本週一
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    monday.setDate(diff);
    
    // 計算本週日
    sunday.setDate(monday.getDate() + 6);
    
    document.getElementById('startDate').value = monday.toISOString().split('T')[0];
    document.getElementById('endDate').value = sunday.toISOString().split('T')[0];
}

// 生成週報
async function generateReport() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    if (!startDate || !endDate) {
        showMessage('請選擇日期範圍', 'error');
        return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
        showMessage('開始日期不能晚於結束日期', 'error');
        return;
    }
    
    try {
        showLoading(true);
        
        // 取得週報資料
        const response = await fetch(`/api/report/weekly?startDate=${startDate}&endDate=${endDate}`);
        const data = await response.json();
        
        if (data.success) {
            currentReportData = data.data;
            updateReportDisplay();
            generateReportText();
        } else {
            showMessage(data.message || '載入週報資料失敗', 'error');
        }
    } catch (error) {
        console.error('生成週報錯誤:', error);
        showMessage('生成週報失敗，請稍後再試', 'error');
    } finally {
        showLoading(false);
    }
}

// 更新週報顯示
function updateReportDisplay() {
    if (!currentReportData) return;
    
    // 更新統計卡片
    updateStatsCards();
    
    // 更新每日摘要
    updateDailySummary();
    
    // 更新工作類型統計
    updateTypeStatistics();
}

// 更新統計卡片
function updateStatsCards() {
    const data = currentReportData;
    
    document.getElementById('totalHours').textContent = data.totalHours || 0;
    document.getElementById('workDays').textContent = Object.keys(data.dailySummary || {}).length;
    document.getElementById('totalTasks').textContent = data.workLogs?.length || 0;
    
    const workDays = Object.keys(data.dailySummary || {}).length;
    const avgHours = workDays > 0 ? (data.totalHours / workDays).toFixed(1) : 0;
    document.getElementById('avgHours').textContent = avgHours;
}

// 更新每日摘要
function updateDailySummary() {
    const tbody = document.getElementById('dailySummaryBody');
    const dailySummary = currentReportData.dailySummary || {};
    
    if (Object.keys(dailySummary).length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: #666;">此期間無工時記錄</td></tr>';
        return;
    }
    
    tbody.innerHTML = Object.keys(dailySummary)
        .sort((a, b) => new Date(a) - new Date(b)) // 按日期從小到大排序
        .map(date => {
            const summary = dailySummary[date];
            const weekDay = new Date(date).toLocaleDateString('zh-TW', { weekday: 'short' });
            const formattedDate = `${date.substring(5)} (${weekDay})`;
            
            return `
                <tr>
                    <td class="date">${formattedDate}</td>
                    <td>${summary.logs.length}</td>
                    <td class="hours">${Math.round(summary.hours * 100) / 100}h</td>
                </tr>
            `;
        }).join('');
}

// 更新工作類型統計
function updateTypeStatistics() {
    const container = document.getElementById('typeStatsContainer');
    const typeStats = currentReportData.typeSummary || {};
    
    if (Object.keys(typeStats).length === 0) {
        container.innerHTML = '<p style="color: #666; text-align: center;">無工作類型統計</p>';
        return;
    }
    
    const totalHours = currentReportData.totalHours || 0;
    
    container.innerHTML = Object.keys(typeStats)
        .sort((a, b) => typeStats[b].hours - typeStats[a].hours)
        .map(type => {
            const stat = typeStats[type];
            const percentage = totalHours > 0 ? ((stat.hours / totalHours) * 100).toFixed(1) : 0;
            
            return `
                <div class="type-stat-item">
                    <span class="type-name">${type}</span>
                    <div>
                        <span class="type-hours">${Math.round(stat.hours * 100) / 100}h</span>
                        <span class="type-percentage">(${percentage}%)</span>
                    </div>
                </div>
            `;
        }).join('');
}

// 生成文字週報
async function generateReportText() {
    try {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const customNotes = document.getElementById('customNotes').value;
        
        const response = await fetch('/api/report/generate-text', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                startDate,
                endDate,
                customNotes
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('reportPreview').textContent = data.reportText;
        } else {
            showMessage('生成文字報告失敗', 'error');
        }
    } catch (error) {
        console.error('生成文字報告錯誤:', error);
        showMessage('生成文字報告失敗', 'error');
    }
}

// 更新報告文字（當備註變更時）
function updateReportText() {
    if (currentReportData) {
        generateReportText();
    }
}

// 匯出 PDF
async function exportPDF() {
    if (!currentReportData) {
        showMessage('請先生成週報', 'error');
        return;
    }
    
    try {
        showLoading(true, '正在生成 PDF...');
        
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const reportText = document.getElementById('reportPreview').textContent;
        
        const response = await fetch('/api/report/export-pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                startDate,
                endDate,
                reportText
            })
        });
        
        if (response.ok) {
            // 下載 PDF 檔案
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `週報_${startDate}_${endDate}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            showMessage('PDF 匯出成功', 'success');
        } else {
            const errorData = await response.json();
            showMessage(errorData.message || 'PDF 匯出失敗', 'error');
        }
    } catch (error) {
        console.error('匯出 PDF 錯誤:', error);
        showMessage('PDF 匯出失敗，請稍後再試', 'error');
    } finally {
        showLoading(false);
    }
}

// 儲存草稿
async function saveDraft() {
    if (!currentReportData) {
        showMessage('請先生成週報', 'error');
        return;
    }
    
    try {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const reportText = document.getElementById('reportPreview').textContent;
        const customNotes = document.getElementById('customNotes').value;
        
        const response = await fetch('/api/report/save-draft', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                startDate,
                endDate,
                reportText,
                customNotes
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage('草稿儲存成功', 'success');
        } else {
            showMessage(data.message || '草稿儲存失敗', 'error');
        }
    } catch (error) {
        console.error('儲存草稿錯誤:', error);
        showMessage('草稿儲存失敗，請稍後再試', 'error');
    }
}

// 顯示載入狀態
function showLoading(show, message = '載入中...') {
    const overlay = document.getElementById('loadingOverlay');
    const text = document.getElementById('loadingText');
    
    if (overlay && text) {
        if (show) {
            text.textContent = message;
            overlay.style.display = 'flex';
        } else {
            overlay.style.display = 'none';
        }
    }
}

// 顯示訊息
function showMessage(message, type = 'info') {
    // 建立訊息元素
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem;
        border-radius: 5px;
        z-index: 1001;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    `;
    
    if (type === 'success') {
        messageDiv.style.background = '#d4edda';
        messageDiv.style.color = '#155724';
        messageDiv.style.border = '1px solid #c3e6cb';
    } else if (type === 'error') {
        messageDiv.style.background = '#f8d7da';
        messageDiv.style.color = '#721c24';
        messageDiv.style.border = '1px solid #f5c6cb';
    } else {
        messageDiv.style.background = '#d1ecf1';
        messageDiv.style.color = '#0c5460';
        messageDiv.style.border = '1px solid #bee5eb';
    }
    
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    
    // 3秒後自動移除
    setTimeout(() => {
        if (document.body.contains(messageDiv)) {
            document.body.removeChild(messageDiv);
        }
    }, 3000);
}

// 防抖函數
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 登出處理
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
        window.location.href = '/login';
    }
}