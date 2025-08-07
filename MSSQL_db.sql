-- 1. Roles
CREATE TABLE Roles (
    Id INT PRIMARY KEY IDENTITY(1,1),
    RoleName NVARCHAR(20) NOT NULL UNIQUE
);

-- 2. Users
CREATE TABLE Users (
    Id INT PRIMARY KEY IDENTITY(1,1),
    UserName NVARCHAR(50) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    RoleId INT NOT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (RoleId) REFERENCES Roles(Id)
);

-- 3. WorkTypes
CREATE TABLE WorkTypes (
    Id INT PRIMARY KEY IDENTITY(1,1),
    TypeName NVARCHAR(50) NOT NULL UNIQUE
);

-- 4. WeeklyReportDrafts
CREATE TABLE WeeklyReportDrafts (
    Id INT PRIMARY KEY IDENTITY(1,1),
    UserId INT NOT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    ReportText NVARCHAR(MAX),
    CustomNotes NVARCHAR(MAX),
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NOT NULL DEFAULT GETDATE(), -- MSSQL 沒有 ON UPDATE CURRENT_TIMESTAMP，請用觸發器或程式控制
    CONSTRAINT UQ_WeeklyDraft UNIQUE (UserId, StartDate, EndDate),
    FOREIGN KEY (UserId) REFERENCES Users(Id)
);

-- 5. WeeklyReports
CREATE TABLE WeeklyReports (
    Id INT PRIMARY KEY IDENTITY(1,1),
    UserId INT NOT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    ReportText NVARCHAR(MAX) NOT NULL,
    CustomNotes NVARCHAR(MAX),
    TotalHours DECIMAL(5,2) DEFAULT 0.00,
    WorkDays INT DEFAULT 0,
    TaskCount INT DEFAULT 0,
    Status NVARCHAR(20) DEFAULT 'submitted',
    SubmittedAt DATETIME NOT NULL DEFAULT GETDATE(),
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (UserId) REFERENCES Users(Id)
);
-- 加上 enum 模擬（可加 CHECK）
ALTER TABLE WeeklyReports ADD CONSTRAINT CHK_Status 
CHECK (Status IN ('draft', 'submitted', 'approved'));

-- 6. WorkLogs
CREATE TABLE WorkLogs (
    Id INT PRIMARY KEY IDENTITY(1,1),
    UserId INT NOT NULL,
    WorkDate DATE NOT NULL,
    StartTime TIME NOT NULL,
    EndTime TIME NOT NULL,
    WorkTypeId INT NOT NULL,
    Description NVARCHAR(255),
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (UserId) REFERENCES Users(Id),
    FOREIGN KEY (WorkTypeId) REFERENCES WorkTypes(Id)
);
