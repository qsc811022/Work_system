const express = require('express');
const bcrypt = require('bcryptjs');
const DatabaseConnection = require('../config/database');

const router = express.Router();

// 註冊 API
router.post('/register', async (req, res) => {
    const { userName, password, confirmPassword } = req.body;

    try {
        // 基本驗證
        if (!userName || !password || !confirmPassword) {
            return res.status(400).json({ 
                success: false, 
                message: '請填寫所有欄位' 
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ 
                success: false, 
                message: '密碼確認不符' 
            });
        }

        if (password.length < 6) {
            return res.status(400).json({ 
                success: false, 
                message: '密碼至少需要6個字元' 
            });
        }

        const db = new DatabaseConnection();
        await db.connect();

        // 檢查使用者是否已存在
        const existingUser = await db.query(
            'SELECT Id FROM Users WHERE UserName = ?', 
            [userName]
        );

        if (existingUser.length > 0) {
            await db.close();
            return res.status(400).json({ 
                success: false, 
                message: '使用者名稱已存在' 
            });
        }

        // 加密密碼
        const hashedPassword = await bcrypt.hash(password, 10);

        // 預設角色為 employee (Id = 3)
        const result = await db.query(
            'INSERT INTO Users (UserName, PasswordHash, RoleId) VALUES (?, ?, ?)',
            [userName, hashedPassword, 3]
        );

        await db.close();

        res.json({ 
            success: true, 
            message: '註冊成功！請登入' 
        });

    } catch (error) {
        console.error('註冊錯誤:', error);
        res.status(500).json({ 
            success: false, 
            message: '註冊失敗，請稍後再試' 
        });
    }
});

// 登入 API
router.post('/login', async (req, res) => {
    const { userName, password } = req.body;

    try {
        // 基本驗證
        if (!userName || !password) {
            return res.status(400).json({ 
                success: false, 
                message: '請輸入使用者名稱和密碼' 
            });
        }

        const db = new DatabaseConnection();
        await db.connect();

        // 查詢使用者及其角色
        const users = await db.query(
            `SELECT u.Id, u.UserName, u.PasswordHash, u.RoleId, r.RoleName 
             FROM Users u 
             JOIN Roles r ON u.RoleId = r.Id 
             WHERE u.UserName = ?`,
            [userName]
        );

        if (users.length === 0) {
            await db.close();
            return res.status(401).json({ 
                success: false, 
                message: '使用者名稱或密碼錯誤' 
            });
        }

        const user = users[0];

        // 驗證密碼
        const isValidPassword = await bcrypt.compare(password, user.PasswordHash);
        
        if (!isValidPassword) {
            await db.close();
            return res.status(401).json({ 
                success: false, 
                message: '使用者名稱或密碼錯誤' 
            });
        }

        // 設定 session
        req.session.user = {
            id: user.Id,
            userName: user.UserName,
            roleId: user.RoleId,
            roleName: user.RoleName
        };

        await db.close();

        res.json({ 
            success: true, 
            message: '登入成功',
            user: {
                id: user.Id,
                userName: user.UserName,
                roleName: user.RoleName
            }
        });

    } catch (error) {
        console.error('登入錯誤:', error);
        res.status(500).json({ 
            success: false, 
            message: '登入失敗，請稍後再試' 
        });
    }
});

// 檢查登入狀態 API
router.get('/status', (req, res) => {
    if (req.session.user) {
        res.json({ 
            success: true, 
            isLoggedIn: true,
            user: req.session.user 
        });
    } else {
        res.json({ 
            success: true, 
            isLoggedIn: false 
        });
    }
});

// 登出 API
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('登出錯誤:', err);
            return res.status(500).json({ 
                success: false, 
                message: '登出失敗' 
            });
        }
        res.json({ 
            success: true, 
            message: '登出成功' 
        });
    });
});

module.exports = router;