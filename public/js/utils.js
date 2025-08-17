// ===== 前端共用工具函數 =====
// 功能：提供前端常用的工具函數
// 作者：Amazon Q Developer
// 最後更新：2025-01-08

/**
 * 時間相關工具函數
 */
const TimeUtils = {
    /**
     * 計算兩個時間之間的小時數
     * @param {string} startTime - 開始時間
     * @param {string} endTime - 結束時間
     * @returns {number} 小時數
     */
    calculateDuration(startTime, endTime) {
        const start = new Date(`2000-01-01 ${startTime}`);
        const end = new Date(`2000-01-01 ${endTime}`);
        const diffMs = end - start;
        const hours = diffMs / (1000 * 60 * 60);
        return Math.round(hours * 100) / 100;
    },

    /**
     * 格式化日期
     * @param {string} dateString - 日期字串
     * @returns {string} 格式化後的日期
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-TW', {
            month: '2-digit',
            day: '2-digit',
            weekday: 'short'
        });
    },

    /**
     * 格式化時間
     * @param {string} timeString - 時間字串
     * @returns {string} 格式化後的時間
     */
    formatTime(timeString) {
        return timeString.substring(0, 5);
    }
};

/**
 * UI 相關工具函數
 */
const UIUtils = {
    /**
     * 顯示載入狀態
     * @param {string} containerId - 容器 ID
     * @param {string} message - 載入訊息
     */
    showLoading(containerId, message = '載入中...') {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `<div class="loading">${message}</div>`;
        }
    },

    /**
     * 顯示成功訊息
     * @param {string} message - 成功訊息
     * @param {string} containerId - 訊息容器 ID
     */
    showSuccess(message, containerId = 'message') {
        this.showMessage(message, 'success', containerId);
    },

    /**
     * 顯示錯誤訊息
     * @param {string} message - 錯誤訊息
     * @param {string} containerId - 訊息容器 ID
     */
    showError(message, containerId = 'message') {
        this.showMessage(message, 'error', containerId);
    },

    /**
     * 顯示訊息
     * @param {string} message - 訊息內容
     * @param {string} type - 訊息類型
     * @param {string} containerId - 訊息容器 ID
     */
    showMessage(message, type, containerId = 'message') {
        const messageDiv = document.getElementById(containerId);
        if (messageDiv) {
            messageDiv.className = `message ${type}`;
            messageDiv.textContent = message;
            messageDiv.style.display = 'block';
        }
    },

    /**
     * 清除訊息
     * @param {string} containerId - 訊息容器 ID
     */
    clearMessage(containerId = 'message') {
        const messageDiv = document.getElementById(containerId);
        if (messageDiv) {
            messageDiv.style.display = 'none';
        }
    }
};

/**
 * API 請求工具函數
 */
const APIUtils = {
    /**
     * 發送 GET 請求
     * @param {string} url - 請求 URL
     * @returns {Promise} 請求結果
     */
    async get(url) {
        const response = await fetch(url, {
            credentials: 'same-origin'
        });
        return await response.json();
    },

    /**
     * 發送 POST 請求
     * @param {string} url - 請求 URL
     * @param {object} data - 請求資料
     * @returns {Promise} 請求結果
     */
    async post(url, data) {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'same-origin',
            body: JSON.stringify(data)
        });
        return await response.json();
    },

    /**
     * 發送 PUT 請求
     * @param {string} url - 請求 URL
     * @param {object} data - 請求資料
     * @returns {Promise} 請求結果
     */
    async put(url, data) {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'same-origin',
            body: JSON.stringify(data)
        });
        return await response.json();
    },

    /**
     * 發送 DELETE 請求
     * @param {string} url - 請求 URL
     * @returns {Promise} 請求結果
     */
    async delete(url) {
        const response = await fetch(url, {
            method: 'DELETE',
            credentials: 'same-origin'
        });
        return await response.json();
    }
};

/**
 * 表單驗證工具函數
 */
const ValidationUtils = {
    /**
     * 驗證必填欄位
     * @param {object} data - 表單資料
     * @param {array} requiredFields - 必填欄位
     * @returns {object} 驗證結果
     */
    validateRequired(data, requiredFields) {
        for (const field of requiredFields) {
            if (!data[field] || data[field].toString().trim() === '') {
                return { 
                    valid: false, 
                    message: `請填寫${field}` 
                };
            }
        }
        return { valid: true };
    },

    /**
     * 驗證工作時間
     * @param {object} data - 時間資料
     * @returns {object} 驗證結果
     */
    validateWorkTime(data) {
        const { workDate, startTime, endTime } = data;
        
        const start = new Date(`${workDate} ${startTime}`);
        const end = new Date(`${workDate} ${endTime}`);
        
        if (start >= end) {
            return { 
                valid: false, 
                message: '結束時間必須晚於開始時間' 
            };
        }
        
        const startHour = start.getHours();
        const endHour = end.getHours();
        const endMinute = end.getMinutes();
        
        if (startHour < 9 || endHour > 23 || (endHour === 23 && endMinute > 59)) {
            return { 
                valid: false, 
                message: '工作時間必須在 09:00-23:59 範圍內' 
            };
        }
        
        return { valid: true };
    }
};