require('dotenv').config();

class DatabaseConnection {
    constructor() {
        this.dbType = process.env.DB_TYPE || 'mysql'; // mysql 或 mssql
        this.connection = null;
    }

    async connect() {
        try {
            if (this.dbType === 'mysql') {
                const mysql = require('mysql2/promise');
                this.connection = await mysql.createConnection({
                    host: process.env.DB_HOST || 'localhost',
                    user: process.env.DB_USER || 'root',
                    password: process.env.DB_PASSWORD || '',
                    database: process.env.DB_NAME || 'worklog_db',
                    port: process.env.DB_PORT || 3306
                });
                console.log('MySQL 資料庫連接成功');
            } else if (this.dbType === 'mssql') {
                const sql = require('mssql');
                const config = {
                    user: process.env.DB_USER,
                    password: process.env.DB_PASSWORD,
                    server: process.env.DB_HOST,
                    database: process.env.DB_NAME,
                    port: parseInt(process.env.DB_PORT) || 1433,
                    options: {
                        encrypt: false,
                        trustServerCertificate: true
                    }
                };
                this.connection = await sql.connect(config);
                console.log('MSSQL 資料庫連接成功');
            }
        } catch (error) {
            console.error('資料庫連接失敗:', error);
            throw error;
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