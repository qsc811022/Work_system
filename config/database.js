// ===== 資料庫連線管理類別 =====
// 功能：支援 MySQL 和 MSSQL 的統一資料庫連線接口
// 作者：Amazon Q Developer
// 最後更新：2025-01-08

require('dotenv').config(); // 載入環境變數

/**
 * 資料庫連線管理類別
 * 支援 MySQL 和 MSSQL 兩種資料庫
 * 提供統一的連線、查詢、關閉接口
 */
class DatabaseConnection {
    /**
     * 建構子：初始化資料庫連線設定
     */
    constructor() {
        this.dbType = process.env.DB_TYPE || 'mysql'; // 資料庫類型：mysql 或 mssql
        this.connection = null; // 資料庫連線物件
    }

    /**
     * 連線到資料庫
     * 根據環境變數 DB_TYPE 選擇 MySQL 或 MSSQL
     */
    async connect() {
        try {
            if (this.dbType === 'mysql') {
                // ===== MySQL 連線設定 =====
                const mysql = require('mysql2/promise');
                this.connection = await mysql.createConnection({
                    host: process.env.DB_HOST || 'localhost',     // 資料庫主機
                    user: process.env.DB_USER || 'root',          // 使用者名稱
                    password: process.env.DB_PASSWORD || '',      // 密碼
                    database: process.env.DB_NAME || 'worklog_db', // 資料庫名稱
                    port: process.env.DB_PORT || 3306             // 連接埠號
                });
                console.log('MySQL 資料庫連接成功');
            } else if (this.dbType === 'mssql') {
                // ===== MSSQL 連線設定 =====
                const sql = require('mssql');
                const config = {
                    user: process.env.DB_USER,                    // 使用者名稱
                    password: process.env.DB_PASSWORD,            // 密碼
                    server: process.env.DB_HOST,                  // 伺服器位址
                    database: process.env.DB_NAME,                // 資料庫名稱
                    port: parseInt(process.env.DB_PORT) || 1433,  // 連接埠號
                    options: {
                        encrypt: false,              // 關閉加密（本地開發用）
                        trustServerCertificate: true // 信任伺服器憑證
                    }
                };
                this.connection = await sql.connect(config);
                console.log('MSSQL 資料庫連接成功');
            }
        } catch (error) {
            console.error('資料庫連接失敗:', error);
            throw error; // 重新拋出錯誤供上層處理
        }
    }

    // 統一查詢介面 - 支援兩種資料庫
    async query(sql, params = []) {
        try {
            if (this.dbType === 'mysql') {
                const [rows] = await this.connection.execute(sql, params);
                return rows;
            } else if (this.dbType === 'mssql') {
                const request = this.connection.request();
                
                // 為參數設定型別
                params.forEach((param, index) => {
                    request.input(`param${index}`, param);
                });
                
                // 將 MySQL 的 ? 轉換為 MSSQL 的 @param
                let mssqlQuery = sql;
                let paramIndex = 0;
                mssqlQuery = mssqlQuery.replace(/\?/g, () => {
                    return `@param${paramIndex++}`;
                });
                
                const result = await request.query(mssqlQuery);
                return result.recordset || result;
            }
        } catch (error) {
            console.error('查詢錯誤:', error);
            console.error('SQL:', sql);
            console.error('參數:', params);
            throw error;
        }
    }

    // 取得插入的 ID
    async getInsertId(result) {
        if (this.dbType === 'mysql') {
            return result.insertId;
        } else if (this.dbType === 'mssql') {
            return result.recordset ? result.recordset[0].id : null;
        }
    }

    // 關閉連接
    async close() {
        if (this.connection) {
            try {
                if (this.dbType === 'mysql') {
                    await this.connection.end();
                } else if (this.dbType === 'mssql') {
                    await this.connection.close();
                }
                console.log('資料庫連接已關閉');
            } catch (error) {
                console.error('關閉資料庫連接時發生錯誤:', error);
            }
        }
    }

    // 測試連接
    async testConnection() {
        try {
            await this.connect();
            const testQuery = this.dbType === 'mysql' 
                ? 'SELECT 1 as test' 
                : 'SELECT 1 as test';
            
            const result = await this.query(testQuery);
            console.log('資料庫連接測試成功:', result);
            return true;
        } catch (error) {
            console.error('資料庫連接測試失敗:', error);
            return false;
        }
    }
}

module.exports = DatabaseConnection;