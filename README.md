# 工時記錄系統

一個基於 Node.js + EJS + MySQL/MSSQL 的企業內部工時管理系統，提供員工工時記錄、週報生成和管理員統計功能。

## 🎯 專案特色

- **多角色支援**：管理員、員工、學生三種角色權限
- **雙資料庫支援**：同時支援 MySQL 和 MSSQL
- **響應式設計**：支援桌面和行動裝置
- **完整功能**：工時記錄、週報生成、PDF匯出、統計分析
- **安全認證**：Session-based 身份驗證和密碼加密

## 🛠️ 技術架構

### 前端技術
- **模板引擎**：EJS
- **樣式**：CSS3 + 響應式設計
- **互動**：原生 JavaScript (ES6+)
- **圖示**：Emoji + Unicode 字符

### 後端技術
- **運行環境**：Node.js v22.18.0+
- **框架**：Express.js
- **身份驗證**：express-session + bcryptjs
- **資料庫**：MySQL 8.0+ / MSSQL Server 2019+

### 開發工具
- **版本控制**：Git
- **開發模式**：nodemon
- **測試**：Jest

## 📋 功能列表

### 👤 使用者功能
- [x] 使用者註冊/登入
- [x] 個人資料管理
- [x] 密碼安全驗證

### ⏰ 工時記錄
- [x] 新增工時記錄（限制 9:00-18:00）
- [x] 查看個人工時列表
- [x] 編輯/刪除工時記錄
- [x] 日期範圍篩選
- [x] 工作類型分類（Meeting、Coding、Code Review、Document、Testing、Support）
- [x] 時間衝突檢查
- [x] 分頁顯示

### 📊 儀表板
- [x] 本週工時統計
- [x] 工作天數統計
- [x] 任務數量統計
- [x] 平均日工時計算
- [x] 最近工時記錄預覽
- [x] 快速操作按鈕

### 📋 週報功能
- [ ] 週報資料整合
- [ ] 自動文字報告生成
- [ ] 週報預覽
- [ ] PDF 匯出功能
- [ ] 草稿儲存

### 👨‍💼 管理員功能
- [ ] 查看所有員工工時
- [ ] 工作內容統計分析
- [ ] 全員週報匯出 (CSV/PDF)
- [ ] 員工績效排名
- [ ] 工作類型統計

## 🚀 快速開始

### 環境需求
- Node.js v22.18.0 或更新版本
- MySQL 8.0+ 或 MSSQL Server 2019+
- Git

### 安裝步驟

1. **克隆專案**
```bash
git clone <your-repository-url>
cd Work_system
```

2. **安裝依賴**
```bash
npm install
```

3. **環境設定**
```bash
# 複製環境變數範本
cp .env.example .env

# 編輯 .env 檔案，設定資料庫連線資訊
```

4. **資料庫設定**

**MySQL 範例：**
```env
DB_TYPE=mysql
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=your_database_name
DB_PORT=3306
```

**MSSQL 範例：**
```env
DB_TYPE=mssql
DB_HOST=localhost
DB_USER=sa
DB_PASSWORD=your_password
DB_NAME=your_database_name
DB_PORT=1433
```

5. **初始化資料庫**
```bash
# 測試資料庫連線
node test-db.js

# 建立資料表和基礎資料
node init-database.js

# 建立管理員帳號
node create-admin.js
```

6. **啟動應用程式**
```bash
# 開發模式
npm run dev

# 生產模式
npm start
```

7. **訪問應用程式**
開啟瀏覽器訪問：http://localhost:3000

## 📁 專案結構

```
Work_system/
├── config/                 # 設定檔案
│   └── database.js         # 資料庫連線設定
├── routes/                 # 路由檔案
│   ├── index.js           # 主路由
│   ├── auth.js            # 身份驗證路由
│   ├── worklog.js         # 工時記錄路由
│   ├── report.js          # 週報路由
│   └── admin.js           # 管理員路由
├── views/                  # EJS 模板
│   ├── login.ejs          # 登入頁面
│   ├── register.ejs       # 註冊頁面
│   ├── dashboard.ejs      # 儀表板
│   └── worklog.ejs        # 工時記錄頁面
├── public/                 # 靜態資源
│   ├── css/               # 樣式檔案
│   │   ├── login.css
│   │   ├── register.css
│   │   ├── dashboard.css
│   │   └── worklog.css
│   └── js/                # JavaScript 檔案
│       ├── login.js
│       ├── register.js
│       ├── dashboard.js
│       └── worklog.js
├── server.js              # 主伺服器檔案
├── init-database.js       # 資料庫初始化腳本
├── create-admin.js        # 建立管理員腳本
├── test-db.js            # 資料庫連線測試
├── package.json          # 專案依賴設定
├── .env                  # 環境變數（需自行建立）
├── .gitignore            # Git 忽略檔案
└── README.md             # 專案說明文件
```

## 🗄️ 資料表結構

### Roles (角色表)
| 欄位 | 類型 | 說明 |
|------|------|------|
| Id | INT AUTO_INCREMENT | 主鍵 |
| RoleName | VARCHAR(20) | 角色名稱 |

### Users (使用者表)
| 欄位 | 類型 | 說明 |
|------|------|------|
| Id | INT AUTO_INCREMENT | 主鍵 |
| UserName | VARCHAR(50) | 使用者名稱 |
| PasswordHash | VARCHAR(255) | 加密密碼 |
| RoleId | INT | 角色 ID (外鍵) |
| CreatedAt | DATETIME | 建立時間 |

### WorkTypes (工作類型表)
| 欄位 | 類型 | 說明 |
|------|------|------|
| Id | INT AUTO_INCREMENT | 主鍵 |
| TypeName | VARCHAR(50) | 工作類型名稱 |

### WorkLogs (工時記錄表)
| 欄位 | 類型 | 說明 |
|------|------|------|
| Id | INT AUTO_INCREMENT | 主鍵 |
| UserId | INT | 使用者 ID (外鍵) |
| WorkDate | DATE | 工作日期 |
| StartTime | TIME | 開始時間 |
| EndTime | TIME | 結束時間 |
| WorkTypeId | INT | 工作類型 ID (外鍵) |
| Description | VARCHAR(255) | 工作描述 |
| CreatedAt | DATETIME | 建立時間 |

## 🔧 API 端點

### 身份驗證
- `POST /api/auth/register` - 使用者註冊
- `POST /api/auth/login` - 使用者登入
- `POST /api/auth/logout` - 使用者登出
- `GET /api/auth/status` - 檢查登入狀態

### 工時記錄
- `GET /api/worklog/work-types` - 取得工作類型列表
- `POST /api/worklog/add` - 新增工時記錄
- `GET /api/worklog/list` - 取得工時記錄列表
- `GET /api/worklog/:id` - 取得單一工時記錄
- `PUT /api/worklog/:id` - 更新工時記錄
- `DELETE /api/worklog/:id` - 刪除工時記錄

### 週報
- `GET /api/report/weekly` - 取得週報資料
- `POST /api/report/generate-text` - 生成文字週報
- `POST /api/report/export-pdf` - 匯出 PDF 週報

### 管理員
- `GET /api/admin/users` - 取得所有使用者
- `GET /api/admin/weekly-summary` - 取得全員週報統計
- `GET /api/admin/work-statistics` - 取得工作統計
- `POST /api/admin/export-csv` - 匯出 CSV 報表
- `POST /api/admin/export-pdf` - 匯出 PDF 報表

## 🎨 設計特色

### 使用者體驗
- **直覺式介面**：清晰的導航和操作流程
- **即時驗證**：表單即時驗證和錯誤提示
- **響應式設計**：適配各種螢幕尺寸
- **載入動畫**：提供視覺反饋

### 資料安全
- **密碼加密**：使用 bcryptjs 進行密碼雜湊
- **Session 管理**：安全的 session-based 身份驗證
- **輸入驗證**：前後端雙重資料驗證
- **SQL 注入防護**：使用參數化查詢

## 🚀 部署建議

### 生產環境設定
1. 使用 PM2 管理程序
2. 設定 Nginx 反向代理
3. 啟用 HTTPS
4. 設定資料庫連線池
5. 配置日誌管理

### 效能最佳化
- 啟用 gzip 壓縮
- 設定靜態資源快取
- 使用 CDN 加速
- 資料庫索引優化

## 🤝 貢獻指南

1. Fork 本專案
2. 建立功能分支：`git checkout -b feature/new-feature`
3. 提交變更：`git commit -am 'Add new feature'`
4. 推送分支：`git push origin feature/new-feature`
5. 提交 Pull Request

## 📄 授權條款

此專案採用 MIT 授權條款。詳見 [LICENSE](LICENSE) 檔案。

## 📞 聯絡資訊

如有問題或建議，請透過以下方式聯繫：

- **Email**: your-email@example.com
- **GitHub Issues**: [提交問題](https://github.com/your-username/work-system/issues)

## 📚 更新日誌

### v1.0.0 (2025-08-06)
- ✅ 完成基礎系統架構
- ✅ 實作使用者認證系統
- ✅ 完成工時記錄功能
- ✅ 建立響應式儀表板
- 🚧 週報功能開發中
- 🚧 管理員功能開發中

---

**開發團隊** | **最後更新**: 2025-08-06
