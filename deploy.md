「Work System」專案啟動與設定 SOP
版本： 1.0
日期： 2025/08/22
作者： 根據使用者提供的圖片撰寫

一、 前置作業
確認已安裝並啟動 MySQL 資料庫服務。

確認已安裝 MySQL Workbench 或其他資料庫管理工具。

確認已安裝 Visual Studio Code (VS Code) 或其他程式碼編輯器。

確認已安裝 Node.js 和相關套件。

在 VS Code 中開啟「Work System」專案資料夾。

二、 資料庫設定與匯入
建立資料庫

在 MySQL Workbench 中，執行 SQL 指令建立一個新的資料庫。根據您提供的圖片，資料庫名稱為 project222 或 project1，請以專案設定為主。

範例指令：

SQL

CREATE DATABASE IF NOT EXISTS project222 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4*0900_ai_ci;
您可以參考 Demo1_DB.PNG 和 匯入 DB*資料.PNG 中的內容，確認資料庫已成功建立。

匯入資料表結構與初始資料

使用 project222 資料庫。

在 MySQL Workbench 中，執行專案提供的 SQL 檔案，匯入資料表（roles, users, worklogs, etc.）結構和初始資料。

您可以參考 3.PNG，確認 project222 資料庫下已包含 reportdrafts、roles、users 等資料表。

三、 環境變數設定
在專案根目錄下，開啟 .env 檔案。

設定 MySQL 連線資訊

根據您提供的 圖 1.PNG，請確認以下變數設定正確：

DB_TYPE=mysql

DB_HOST=localhost

DB_USER=root

DB_PASSWORD=your_password

DB_NAME=project222

DB_PORT=3306

DB_PASSWORD 請替換為您自己的 MySQL 密碼。

DB_NAME 請替換為您在第二步中建立的資料庫名稱。

四、 專案啟動
啟動開發伺服器

在 VS Code 的終端機中，切換到專案根目錄。

執行以下指令來啟動專案：

Bash

node server.js
備註： 如果您使用的是 nodemon，可以執行 nodemon server.js 以實現程式碼變動時自動重啟伺服器。

確認伺服器啟動成功

檢查終端機的輸出。

您應看到類似 圖 2.PNG 的訊息，表示伺服器已成功啟動，並正在監聽指定的 port。

範例輸出：

資料庫連線已成功

資料表連線測試成功

伺服器啟動成功

本機網址: http://localhost:3000

五、 建立管理員帳號
執行建立腳本

在 VS Code 的終端機中，執行以下指令來建立管理員帳號：

Bash

node create-admin.js
備註： 如果您希望建立其他管理員帳號，請修改 create-admin.js 檔案中的使用者名稱、密碼等參數。

確認帳號建立成功

執行指令後，檢查終端機的輸出。

您應看到類似 create_admin_account11113.PNG 中的訊息，表示管理員帳號已成功建立。

範例輸出：

建立管理員帳號

MySQL 資料庫連線成功

資料表連線測試成功

資料庫連線已成功

管理員帳號已建立

完成以上所有步驟後，您的「Work System」專案即已成功啟動並完成基本設定。 您可以透過瀏覽器訪問 http://localhost:3000 來測試您的應用程式。
