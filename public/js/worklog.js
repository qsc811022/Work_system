document.addEventListener('DOMContentLoaded', function() {
    // 初始化
    loadWorkTypes();
    loadWorkLogs();
    
    // 事件綁定
    bindEvents();
    
    // 設定今天為預設日期
    const today = new Date().toISOString().split('T')[0];
    const workDateInput = document.getElementById('workDate');
    if (workDateInput) {
        workDateInput.value = today;
    }
});

let currentPage = 1;
let workTypes = [];

function bindEvents() {
    // 新增記錄按鈕
    const addBtn = document.getElementById('addRecordBtn');
    if (addBtn) {
        addBtn.addEventListener('click', () => openModal());
    }
    
    // 表單提交
    const form = document.getElementById('worklogForm');
    if (form) {
        form.addEventListener('submit', handleSubmit);
    }
    
    // 模態框關閉
    const closeBtn = document.querySelector('.close');
    const cancelBtn = document.getElementById('cancelBtn');
    const modal = document.getElementById('worklogModal');
    
    if (closeBtn) closeBtn.addEventListener('click', () => closeModal());
    if (cancelBtn) cancelBtn.addEventListener('click', () => closeModal());
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }
    
    // 篩選功能
    const filterBtn = document.getElementById('filterBtn');
    const clearBtn = document.getElementById('clearBtn');
    
    if (filterBtn) filterBtn.addEventListener('click', applyFilter);
    if (clearBtn) clearBtn.addEventListener('click', clearFilter);
    
    // 登出功能
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

// 載入工作類型
async function loadWorkTypes() {
    try {
        const response = await fetch('/api/worklog/work-types');
        const data = await response.json();
        
        if (data.success) {
            workTypes = data.workTypes;
            populateWorkTypeSelect();
        }
    } catch (error) {
        console.error('載入工作類型錯誤:', error);
    }
}

// 填充工作類型選單
function populateWorkTypeSelect() {
    const select = document.getElementById('workTypeId');
    if (!select) return;
    
    select.innerHTML = '<option value="">請選擇工作類型</option>';
    workTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type.Id;
        option.textContent = type.TypeName;
        select.appendChild(option);
    });
}

// 載入工時記錄
async function loadWorkLogs(page = 1) {
    try {
        showLoading();
        
        const startDate = document.getElementById('filterStartDate')?.value || '';
        const endDate = document.getElementById('filterEndDate')?.value || '';
        
        let url = `/api/worklog/list?page=${page}&limit=10`;
        if (startDate) url += `&startDate=${startDate}`;
        if (endDate) url += `&endDate=${endDate}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
            displayWorkLogs(data.workLogs);
            updatePagination(data.pagination);
        } else {
            showError('載入記錄失敗');
        }
    } catch (error) {
        console.error('載入工時記錄錯誤:', error);
        showError('載入記錄失敗');
    } finally {
        hideLoading();
    }
}

// 顯示工時記錄
function displayWorkLogs(workLogs) {
    const tbody = document.getElementById('recordsTableBody');
    if (!tbody) return;
    
    if (!workLogs || workLogs.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6">
                    <div class="empty-state">
                        <div class="icon">📝</div>
                        <h3>暫無工時記錄</h3>
                        <p>開始記錄您的工作時間吧！</p>
                        <button onclick="openModal()" class="add-record-btn">新增工時記錄</button>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = workLogs.map(log => {
        const duration = calculateDuration(log.StartTime, log.EndTime);
        const workDate = formatDate(log.WorkDate);
        const workTypeBadge = getWorkTypeBadge(log.TypeName);
        
        return `
            <tr>
                <td>${workDate}</td>
                <td>${formatTime(log.StartTime)} - ${formatTime(log.EndTime)}</td>
                <td>${workTypeBadge}</td>
                <td>${log.Description || '-'}</td>
                <td><span class="duration">${duration}h</span></td>
                <td>
                    <div class="action-buttons">
                        <button onclick="editRecord(${log.Id})" class="btn-sm btn-edit">
                            ✏️ 編輯
                        </button>
                        <button onclick="deleteRecord(${log.Id})" class="btn-sm btn-delete">
                            🗑️ 刪除
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// 取得工作類型徽章
function getWorkTypeBadge(typeName) {
    const typeClass = typeName.toLowerCase().replace(' ', '-');
    return `<span class="work-type-badge ${typeClass}">${typeName}</span>`;
}

// 更新分頁
function updatePagination(pagination) {
    const info = document.getElementById('paginationInfo');
    const controls = document.getElementById('paginationControls');
    
    if (!info || !controls) return;
    
    // 更新分頁資訊
    info.textContent = `第 ${pagination.current} 頁，共 ${pagination.total} 頁 (${pagination.totalRecords} 筆記錄)`;
    
    // 更新分頁控制
    controls.innerHTML = `
        <button class="page-btn" onclick="loadWorkLogs(1)" ${pagination.current === 1 ? 'disabled' : ''}>
            第一頁
        </button>
        <button class="page-btn" onclick="loadWorkLogs(${pagination.current - 1})" ${pagination.current === 1 ? 'disabled' : ''}>
            上一頁
        </button>
        <span style="padding: 0 1rem;">第 ${pagination.current} 頁</span>
        <button class="page-btn" onclick="loadWorkLogs(${pagination.current + 1})" ${pagination.current === pagination.total ? 'disabled' : ''}>
            下一頁
        </button>
        <button class="page-btn" onclick="loadWorkLogs(${pagination.total})" ${pagination.current === pagination.total ? 'disabled' : ''}>
            最後頁
        </button>
    `;
}

// 開啟模態框
function openModal(recordId = null) {
    const modal = document.getElementById('worklogModal');
    const title = document.getElementById('modalTitle');
    const form = document.getElementById('worklogForm');
    
    if (!modal) return;
    
    // 重設表單
    form.reset();
    document.getElementById('recordId').value = recordId || '';
    
    if (recordId) {
        title.textContent = '編輯工時記錄';
        loadRecordData(recordId);
    } else {
        title.textContent = '新增工時記錄';
        // 設定預設值
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('workDate').value = today;
    }
    
    modal.style.display = 'block';
}

// 關閉模態框
function closeModal() {
    const modal = document.getElementById('worklogModal');
    if (modal) {
        modal.style.display = 'none';
    }
    clearMessage();
}

// 載入記錄資料（編輯用）
async function loadRecordData(recordId) {
    try {
        const response = await fetch(`/api/worklog/${recordId}`);
        const data = await response.json();
        
        if (data.success) {
            const record = data.workLog;
            document.getElementById('workDate').value = record.WorkDate;
            document.getElementById('startTime').value = record.StartTime;
            document.getElementById('endTime').value = record.EndTime;
            document.getElementById('workTypeId').value = record.WorkTypeId;
            document.getElementById('description').value = record.Description || '';
        }
    } catch (error) {
        console.error('載入記錄資料錯誤:', error);
    }
}

// 處理表單提交
async function handleSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const recordId = formData.get('recordId');
    
    const data = {
        workDate: formData.get('workDate'),
        startTime: formData.get('startTime'),
        endTime: formData.get('endTime'),
        workTypeId: parseInt(formData.get('workTypeId')),
        description: formData.get('description')
    };
    
    // 驗證
    if (!validateForm(data)) {
        return;
    }
    
    try {
        const url = recordId ? `/api/worklog/${recordId}` : '/api/worklog/add';
        const method = recordId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showSuccess(result.message);
            setTimeout(() => {
                closeModal();
                loadWorkLogs(currentPage);
            }, 1500);
        } else {
            showError(result.message);
        }
    } catch (error) {
        console.error('提交錯誤:', error);
        showError('操作失敗，請稍後再試');
    }
}

// 表單驗證
function validateForm(data) {
    if (!data.workDate || !data.startTime || !data.endTime || !data.workTypeId) {
        showError('請填寫所有必填欄位');
        return false;
    }
    
    // 檢查時間邏輯
    const start = new Date(`${data.workDate} ${data.startTime}`);
    const end = new Date(`${data.workDate} ${data.endTime}`);
    
    if (start >= end) {
        showError('結束時間必須晚於開始時間');
        return false;
    }
    
    // 檢查工作時間範圍（9:00-23:59）
    const startHour = start.getHours();
    const endHour = end.getHours();
    const endMinute = end.getMinutes();
    
    if (startHour < 9 || endHour > 23 || (endHour === 23 && endMinute > 59)) {
        showError('工作時間必須在 09:00-23:59 範圍內');
        return false;
    }
    
    return true;
}

// 編輯記錄
function editRecord(recordId) {
    openModal(recordId);
}

// 刪除記錄
async function deleteRecord(recordId) {
    if (!confirm('確定要刪除這筆記錄嗎？')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/worklog/${recordId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            showSuccess('記錄刪除成功');
            loadWorkLogs(currentPage);
        } else {
            showError(result.message);
        }
    } catch (error) {
        console.error('刪除錯誤:', error);
        showError('刪除失敗');
    }
}

// 套用篩選
function applyFilter() {
    currentPage = 1;
    loadWorkLogs(currentPage);
}

// 清除篩選
function clearFilter() {
    document.getElementById('filterStartDate').value = '';
    document.getElementById('filterEndDate').value = '';
    currentPage = 1;
    loadWorkLogs(currentPage);
}

// 工具函數
function calculateDuration(startTime, endTime) {
    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);
    const diffMs = end - start;
    const hours = diffMs / (1000 * 60 * 60);
    return Math.round(hours * 100) / 100;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW', {
        month: '2-digit',
        day: '2-digit',
        weekday: 'short'
    });
}

function formatTime(timeString) {
    return timeString.substring(0, 5);
}

function showLoading() {
    const tbody = document.getElementById('recordsTableBody');
    if (tbody) {
        tbody.innerHTML = '<tr><td colspan="6"><div class="loading">載入中...</div></td></tr>';
    }
}

function hideLoading() {
    // Loading is hidden when data is displayed
}

function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    if (messageDiv) {
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        messageDiv.style.display = 'block';
    }
}

function showSuccess(message) {
    showMessage(message, 'success');
}

function showError(message) {
    showMessage(message, 'error');
}

function clearMessage() {
    const messageDiv = document.getElementById('message');
    if (messageDiv) {
        messageDiv.style.display = 'none';
    }
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