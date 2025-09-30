# 工時記錄系統

一個基於 Node.js + EJS + MySQL/MSSQL 的企業內部工時管理系統，提供員工工時記錄、週報生成和管理員統計功能。

## 🎯 專案特色

- **多角色支援**：管理員、員工、二種角色權限
- **雙資料庫支援**：同時支援 MySQL 和 MSSQL
- **響應式設計**：支援桌面和行動裝置
- **完整功能**：工時記錄、週報生成、PDF 匯出、統計分析
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
- **資料庫**：MySQL 8.0+

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

- [x] 新增工時記錄（限制 9:00-23:59）
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
<<<<<<< HEAD
- [X] 週報資料整合
- [X] 自動文字報告生成
- [X] 週報預覽
- [X] PDF 匯出功能
- [X] 草稿儲存

### 👨‍💼 管理員功能
- [X] 查看所有員工工時
- [X] 工作內容統計分析
- [X] 全員週報匯出 (CSV/PDF)
- [X] 員工績效排名
- [X] 工作類型統計
=======

- [X] 週報資料整合
- [X] 自動文字報告生成
- [ ] 週報預覽
- [ ] PDF 匯出功能
- [ ] 草稿儲存

### 👨‍💼 管理員功能

- [ ] 查看所有員工工時
- [ ] 工作內容統計分析
- [ ] 全員週報匯出 (CSV/PDF)
- [ ] 員工績效排名
- [ ] 工作類型統計
>>>>>>> 1f1eda888a20b4aee3a45662294b9f687aa19398

## 🚀 系統安裝與使用 SOP

### 📋 環境需求

- **Node.js**: v22.18.0 或更新版本
- **資料庫**: MySQL 8.0+ 或 MSSQL Server 2019+
- **瀏覽器**: Chrome, Firefox, Safari, Edge (支援 ES6+)
- **作業系統**: Windows, macOS, Linux

---

## 📦 第一次安裝 SOP

### 步驟 1：下載與安裝

```bash
# 1. 克隆專案
git clone <your-repository-url>
cd Work_system

# 2. 安裝 Node.js 依賴
npm install
```

### 步驟 2：資料庫準備

```bash
# 1. 確保 MySQL 服務已啟動
# Windows: 服務管理員 → MySQL80
# macOS: brew services start mysql
# Linux: sudo systemctl start mysql

# 2. 建立資料庫（可選，腳本會自動建立）
mysql -u root -p
CREATE DATABASE IF NOT EXISTS project1;
exit
```

### 步驟 3：環境設定

```bash
# 1. 建立環境變數檔案
cp .env.example .env

# 2. 編輯 .env 檔案
notepad .env  # Windows
nano .env     # Linux/macOS
```

**環境變數設定範例：**

```env
# 資料庫設定
DB_TYPE=mysql
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=project1
DB_PORT=3306

# 伺服器設定
PORT=3000
SESSION_SECRET=your_secret_key_here
```

### 步驟 4：初始化系統

```bash
# 1. 測試資料庫連線
node test-db.js
# ✅ 看到 "資料庫連線測試成功" 才繼續

# 2. 建立資料表和基礎資料
node init-database.js
# ✅ 看到 "資料庫初始化完成！" 才繼續

# 3. 建立管理員帳號
node create-admin.js
# ✅ 記住顯示的管理員帳號密碼
```

### 步驟 5：啟動系統

```bash
# 啟動伺服器
npm start

# 看到以下訊息表示成功：
# === 伺服器啟動成功 ===
# 伺服器運行在:
#   本機訪問: http://localhost:3000
#   網路訪問: http://192.168.x.x:3000
```

### 步驟 6：首次登入

1. 開啟瀏覽器訪問：`http://localhost:3000`
2. 使用管理員帳號登入：
   - 帳號：`admin`
   - 密碼：`admin123`（或建立時顯示的密碼）
3. 登入成功後建議立即修改密碼

---

## 👥 日常使用 SOP

### 🔐 管理員操作流程

#### 1. 建立員工帳號

```
登入管理員 → 註冊頁面 → 建立員工帳號 → 通知員工帳密
```

#### 2. 重設員工密碼

```
管理面板 → 查詢員工 → 點擊「🔑 重設密碼」→ 輸入新密碼 → 確認
```

#### 3. 查看全員工時統計

```
管理面板 → 選擇日期範圍 → 點擊「查詢」→ 查看統計數據
```

#### 4. 匯出工時報表

```
管理面板 → 查詢數據 → 點擊「📊 匯出 CSV」或「📄 匯出 PDF」
```

#### 5. 管理工作類型

```
管理面板 → 點擊「🏷️ 管理工作類型」→ 新增/刪除工作類型
```

**操作說明：**

- 新增工作類型：輸入名稱 → 點擊「新增」
- 刪除工作類型：點擊「🗑️ 刪除」→ 確認（已使用的類型無法刪除）
- 支援 Enter 鍵快速新增

### 👤 員工操作流程

#### 1. 記錄工時

```
工時記錄 → 點擊「➕ 新增工時」→ 填寫資料 → 儲存
```

**注意事項：**

- 工作時間限制：09:00-23:59
- 不可重複時段
- 必須選擇工作類型

#### 2. 編輯工時記錄

```
工時記錄 → 找到要修改的記錄 → 點擊「✏️ 編輯」→ 修改 → 儲存
```

#### 3. 生成週報

```
週報 → 選擇週期 → 點擊「生成週報」→ 添加備註 → 匯出 PDF
```

---

## 🔧 系統維護 SOP

### 日常維護

```bash
# 1. 檢查系統狀態
curl http://localhost:3000

# 2. 查看系統日誌
npm start  # 觀察 console 輸出

# 3. 重啟服務
Ctrl+C  # 停止服務
npm start  # 重新啟動
```

### 資料備份

```bash
# MySQL 備份
mysqldump -u root -p project1 > backup_$(date +%Y%m%d).sql

# 還原備份
mysql -u root -p project1 < backup_20250108.sql
```

### 問題排除

```bash
# 1. 資料庫連線問題
node test-db.js

# 2. 重建管理員帳號
node quick-fix-admin.js

# 3. 重新初始化資料庫
node init-database.js
```

---

## ⚠️ 常見問題與解決方案

### Q1: 無法連線資料庫

**解決方案：**

1. 檢查 MySQL 服務是否啟動
2. 確認 `.env` 檔案設定正確
3. 執行 `node test-db.js` 測試連線

### Q2: 忘記管理員密碼

**解決方案：**

```bash
node quick-fix-admin.js
# 會重設管理員密碼為 admin123
```

### Q3: 無法新增工時記錄

**檢查項目：**

- 時間是否在 09:00-23:59 範圍內
- 是否與現有記錄時間重疊
- 結束時間是否晚於開始時間

### Q4: 週報無法生成

**解決方案：**

1. 確認該週期有工時記錄
2. 檢查瀏覽器 console 是否有錯誤
3. 重新整理頁面後再試

---

## 📱 系統訪問方式

### 本機訪問

- **網址**: http://localhost:3000
- **適用**: 安裝系統的電腦

### 區域網路訪問

- **網址**: http://你的 IP:3000 (啟動時會顯示)
- **適用**: 同一網路下的其他設備
- **範例**: http://192.168.1.100:3000

### 行動裝置訪問

- 使用區域網路 IP 即可在手機/平板上使用
- 系統支援響應式設計，自動適配螢幕大小

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

### 1. Roles (角色表)

| 欄位     | 類型               | 說明     | 索引/約束   |
| -------- | ------------------ | -------- | ----------- |
| Id       | INT AUTO_INCREMENT | 主鍵     | PRIMARY KEY |
| RoleName | VARCHAR(20)        | 角色名稱 | UNIQUE KEY  |

**預設資料：** admin, employee

### 2. Users (使用者表)

| 欄位         | 類型               | 說明       | 索引/約束                 |
| ------------ | ------------------ | ---------- | ------------------------- |
| Id           | INT AUTO_INCREMENT | 主鍵       | PRIMARY KEY               |
| UserName     | VARCHAR(50)        | 使用者名稱 | UNIQUE KEY                |
| PasswordHash | VARCHAR(255)       | 加密密碼   | -                         |
| RoleId       | INT                | 角色 ID    | FOREIGN KEY → Roles(Id)   |
| CreatedAt    | DATETIME           | 建立時間   | DEFAULT CURRENT_TIMESTAMP |

### 3. WorkTypes (工作類型表)

| 欄位     | 類型               | 說明         | 索引/約束   |
| -------- | ------------------ | ------------ | ----------- |
| Id       | INT AUTO_INCREMENT | 主鍵         | PRIMARY KEY |
| TypeName | VARCHAR(50)        | 工作類型名稱 | UNIQUE KEY  |

**預設資料：** Meeting, Coding, Code Review, Document, Testing, Support

### 4. WorkLogs (工時記錄表)

| 欄位        | 類型               | 說明        | 索引/約束                   |
| ----------- | ------------------ | ----------- | --------------------------- |
| Id          | INT AUTO_INCREMENT | 主鍵        | PRIMARY KEY                 |
| UserId      | INT                | 使用者 ID   | FOREIGN KEY → Users(Id)     |
| WorkDate    | DATE               | 工作日期    | KEY (UserId, WorkDate)      |
| StartTime   | TIME               | 開始時間    | -                           |
| EndTime     | TIME               | 結束時間    | -                           |
| WorkTypeId  | INT                | 工作類型 ID | FOREIGN KEY → WorkTypes(Id) |
| Description | VARCHAR(255)       | 工作描述    | 可為 NULL                   |
| CreatedAt   | DATETIME           | 建立時間    | DEFAULT CURRENT_TIMESTAMP   |

### 5. ReportDrafts (週報草稿表)

| 欄位        | 類型               | 說明       | 索引/約束                           |
| ----------- | ------------------ | ---------- | ----------------------------------- |
| Id          | INT AUTO_INCREMENT | 主鍵       | PRIMARY KEY                         |
| UserId      | INT                | 使用者 ID  | FOREIGN KEY → Users(Id)             |
| StartDate   | DATE               | 開始日期   | UNIQUE (UserId, StartDate, EndDate) |
| EndDate     | DATE               | 結束日期   | -                                   |
| CustomNotes | TEXT               | 自定義備註 | 可為 NULL                           |
| CreatedAt   | DATETIME           | 建立時間   | DEFAULT CURRENT_TIMESTAMP           |
| UpdatedAt   | DATETIME           | 更新時間   | ON UPDATE CURRENT_TIMESTAMP         |

### 6. WeeklyReportDrafts (週報草稿表 - 完整版)

| 欄位        | 類型               | 說明         | 索引/約束                           |
| ----------- | ------------------ | ------------ | ----------------------------------- |
| Id          | INT AUTO_INCREMENT | 主鍵         | PRIMARY KEY                         |
| UserId      | INT                | 使用者 ID    | FOREIGN KEY → Users(Id)             |
| StartDate   | DATE               | 開始日期     | UNIQUE (UserId, StartDate, EndDate) |
| EndDate     | DATE               | 結束日期     | -                                   |
| ReportText  | TEXT               | 週報文字內容 | 可為 NULL                           |
| CustomNotes | TEXT               | 自定義備註   | 可為 NULL                           |
| CreatedAt   | DATETIME           | 建立時間     | DEFAULT CURRENT_TIMESTAMP           |
| UpdatedAt   | DATETIME           | 更新時間     | ON UPDATE CURRENT_TIMESTAMP         |

### 7. WeeklyReports (正式週報表)

| 欄位        | 類型               | 說明         | 索引/約束                        |
| ----------- | ------------------ | ------------ | -------------------------------- |
| Id          | INT AUTO_INCREMENT | 主鍵         | PRIMARY KEY                      |
| UserId      | INT                | 使用者 ID    | FOREIGN KEY → Users(Id)          |
| StartDate   | DATE               | 開始日期     | KEY (UserId, StartDate, EndDate) |
| EndDate     | DATE               | 結束日期     | -                                |
| ReportText  | TEXT               | 週報文字內容 | NOT NULL                         |
| CustomNotes | TEXT               | 自定義備註   | 可為 NULL                        |
| TotalHours  | DECIMAL(5,2)       | 總工時       | DEFAULT 0.00                     |
| WorkDays    | INT                | 工作天數     | DEFAULT 0                        |
| TaskCount   | INT                | 任務數量     | DEFAULT 0                        |
| Status      | ENUM               | 狀態         | 'draft', 'submitted', 'approved' |
| SubmittedAt | DATETIME           | 提交時間     | DEFAULT CURRENT_TIMESTAMP        |
| CreatedAt   | DATETIME           | 建立時間     | DEFAULT CURRENT_TIMESTAMP        |

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
- `POST /api/report/save-draft` - 儲存週報草稿
- `GET /api/report/load-draft` - 載入週報草稿
- `POST /api/report/export-pdf` - 匯出 PDF 週報

### 管理員

- `GET /api/admin/stats` - 取得管理員統計數據
- `GET /api/admin/users` - 取得所有使用者
- `POST /api/admin/reset-password` - 重設使用者密碼
- `GET /api/admin/work-types` - 取得工作類型列表
- `POST /api/admin/work-types` - 新增工作類型
- `DELETE /api/admin/work-types/:id` - 刪除工作類型
- `GET /api/admin/export` - 匯出統計報表 (CSV)
- `POST /api/admin/export-csv` - 匯出 CSV 報表
- `GET /api/admin/weekly-summary` - 取得全員週報統計

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

## 📞 技術支援

### 🆘 緊急問題處理順序

1. **系統無法啟動** → 檢查資料庫連線 → 執行 `node test-db.js`
2. **無法登入** → 重設管理員密碼 → 執行 `node quick-fix-admin.js`
3. **資料遺失** → 檢查資料庫 → 還原備份檔案
4. **功能異常** → 重啟系統 → `Ctrl+C` 後 `npm start`

### 📋 系統資訊收集

遇到問題時，請收集以下資訊：

- Node.js 版本：`node --version`
- MySQL 版本：`mysql --version`
- 作業系統版本
- 錯誤訊息截圖
- 操作步驟描述

### 📧 聯絡方式

- **系統管理員**: your-admin@company.com
- **技術支援**: your-support@company.com
- **使用手冊**: 本 README 檔案

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
