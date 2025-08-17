// ===== 共用工具函數 =====
// 功能：提供系統中常用的工具函數
// 作者：Amazon Q Developer
// 最後更新：2025-01-08

/**
 * 時間相關工具函數
 */
const timeUtils = {
    /**
     * 計算兩個時間之間的小時數
     * @param {string} startTime - 開始時間 (HH:MM)
     * @param {string} endTime - 結束時間 (HH:MM)
     * @returns {number} 小時數
     */
    calculateHours(startTime, endTime) {
        try {
            const start = new Date(`2000-01-01 ${startTime}`);
            const end = new Date(`2000-01-01 ${endTime}`);
            const diffMs = end - start;
            const hours = diffMs / (1000 * 60 * 60);
            return Math.round(hours * 100) / 100;
        } catch (error) {
            console.error('計算工時錯誤:', error);
            return 0;
        }
    },

    /**
     * 格式化時間字串
     * @param {string} timeString - 時間字串
     * @returns {string} 格式化後的時間 (HH:MM)
     */
    formatTime(timeString) {
        return timeString ? timeString.substring(0, 5) : '';
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
     * 驗證工作時間範圍
     * @param {string} startTime - 開始時間
     * @param {string} endTime - 結束時間
     * @param {string} workDate - 工作日期
     * @returns {object} 驗證結果
     */
    validateWorkTime(startTime, endTime, workDate) {
        const start = new Date(`${workDate} ${startTime}`);
        const end = new Date(`${workDate} ${endTime}`);
        
        // 檢查時間邏輯
        if (start >= end) {
            return { valid: false, message: '結束時間必須晚於開始時間' };
        }
        
        // 檢查工作時間範圍 (9:00-23:59)
        const startHour = start.getHours();
        const endHour = end.getHours();
        const endMinute = end.getMinutes();
        
        if (startHour < 9 || endHour > 23 || (endHour === 23 && endMinute > 59)) {
            return { valid: false, message: '工作時間必須在 9:00-23:59 範圍內' };
        }
        
        return { valid: true };
    }
};

/**
 * 資料驗證工具函數
 */
const validationUtils = {
    /**
     * 檢查必填欄位
     * @param {object} data - 要檢查的資料
     * @param {array} requiredFields - 必填欄位陣列
     * @returns {object} 驗證結果
     */
    validateRequired(data, requiredFields) {
        for (const field of requiredFields) {
            if (!data[field] || data[field].toString().trim() === '') {
                return { 
                    valid: false, 
                    message: `請填寫 ${field}` 
                };
            }
        }
        return { valid: true };
    },

    /**
     * 驗證密碼強度
     * @param {string} password - 密碼
     * @returns {object} 驗證結果
     */
    validatePassword(password) {
        if (!password || password.length < 6) {
            return { 
                valid: false, 
                message: '密碼至少需要6個字元' 
            };
        }
        return { valid: true };
    },

    /**
     * 驗證使用者名稱
     * @param {string} userName - 使用者名稱
     * @returns {object} 驗證結果
     */
    validateUserName(userName) {
        if (!userName || userName.length < 3) {
            return { 
                valid: false, 
                message: '使用者名稱至少需要3個字元' 
            };
        }
        return { valid: true };
    }
};

/**
 * 回應處理工具函數
 */
const responseUtils = {
    /**
     * 成功回應
     * @param {object} res - Express response 物件
     * @param {string} message - 成功訊息
     * @param {object} data - 回傳資料
     */
    success(res, message, data = null) {
        const response = { success: true, message };
        if (data) response.data = data;
        res.json(response);
    },

    /**
     * 錯誤回應
     * @param {object} res - Express response 物件
     * @param {string} message - 錯誤訊息
     * @param {number} statusCode - HTTP 狀態碼
     */
    error(res, message, statusCode = 400) {
        res.status(statusCode).json({ 
            success: false, 
            message 
        });
    },

    /**
     * 伺服器錯誤回應
     * @param {object} res - Express response 物件
     * @param {Error} error - 錯誤物件
     * @param {string} message - 自定義錯誤訊息
     */
    serverError(res, error, message = '伺服器內部錯誤') {
        console.error('伺服器錯誤:', error);
        res.status(500).json({ 
            success: false, 
            message 
        });
    }
};

/**
 * 分頁工具函數
 */
const paginationUtils = {
    /**
     * 計算分頁資訊
     * @param {number} page - 當前頁數
     * @param {number} limit - 每頁筆數
     * @param {number} total - 總筆數
     * @returns {object} 分頁資訊
     */
    calculatePagination(page, limit, total) {
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const offset = (pageNum - 1) * limitNum;
        const totalPages = Math.ceil(total / limitNum);
        
        return {
            current: pageNum,
            limit: limitNum,
            offset,
            total: totalPages,
            totalRecords: total
        };
    }
};

module.exports = {
    timeUtils,
    validationUtils,
    responseUtils,
    paginationUtils
};