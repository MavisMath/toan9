-- ================================================================
-- HỆ THỐNG CƠ SỞ DỮ LIỆU: WEB TOÁN 9 WITH MAVIS (GDPT 2018)
-- HỆ QUẢN TRỊ CSDL: MICROSOFT SQL SERVER
-- ================================================================

USE master;
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'Toan9_DB')
BEGIN
    CREATE DATABASE Toan9_DB
    COLLATE Vietnamese_CI_AS;
END
GO

USE Toan9_DB;
GO

-- ================================================================
-- 1. BẢNG NGƯỜI DÙNG & HỒ SƠ HỌC SINH (USERS & PLAYER PROFILES)
-- ================================================================
IF OBJECT_ID('dbo.User_Sessions', 'U') IS NOT NULL DROP TABLE dbo.User_Sessions;
IF OBJECT_ID('dbo.User_Achievements', 'U') IS NOT NULL DROP TABLE dbo.User_Achievements;
IF OBJECT_ID('dbo.User_Avatars', 'U') IS NOT NULL DROP TABLE dbo.User_Avatars;
IF OBJECT_ID('dbo.User_Question_History', 'U') IS NOT NULL DROP TABLE dbo.User_Question_History;
IF OBJECT_ID('dbo.User_Topic_Progress', 'U') IS NOT NULL DROP TABLE dbo.User_Topic_Progress;
IF OBJECT_ID('dbo.Tower_User_Progress', 'U') IS NOT NULL DROP TABLE dbo.Tower_User_Progress;
IF OBJECT_ID('dbo.Exam_Submissions', 'U') IS NOT NULL DROP TABLE dbo.Exam_Submissions;
IF OBJECT_ID('dbo.Exam_Questions', 'U') IS NOT NULL DROP TABLE dbo.Exam_Questions;
IF OBJECT_ID('dbo.Tower_Floor_Questions', 'U') IS NOT NULL DROP TABLE dbo.Tower_Floor_Questions;
IF OBJECT_ID('dbo.Chatbot_Logs', 'U') IS NOT NULL DROP TABLE dbo.Chatbot_Logs;
IF OBJECT_ID('dbo.Formulas', 'U') IS NOT NULL DROP TABLE dbo.Formulas;
IF OBJECT_ID('dbo.Tower_Floors', 'U') IS NOT NULL DROP TABLE dbo.Tower_Floors;
IF OBJECT_ID('dbo.Exams', 'U') IS NOT NULL DROP TABLE dbo.Exams;
IF OBJECT_ID('dbo.Questions', 'U') IS NOT NULL DROP TABLE dbo.Questions;
IF OBJECT_ID('dbo.Topics', 'U') IS NOT NULL DROP TABLE dbo.Topics;
IF OBJECT_ID('dbo.Achievements', 'U') IS NOT NULL DROP TABLE dbo.Achievements;
IF OBJECT_ID('dbo.Avatars', 'U') IS NOT NULL DROP TABLE dbo.Avatars;
IF OBJECT_ID('dbo.Web_Client_State', 'U') IS NOT NULL DROP TABLE dbo.Web_Client_State;
IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL DROP TABLE dbo.Users;
GO

CREATE TABLE dbo.Users (
    user_id INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(50) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NULL,
    display_name NVARCHAR(100) NOT NULL DEFAULT N'Chiến Binh Toán 9',
    avatar NVARCHAR(20) NOT NULL DEFAULT N'🐱',
    user_role NVARCHAR(20) NOT NULL DEFAULT N'student' CHECK (user_role IN (N'student', N'teacher', N'admin')),
    level INT NOT NULL DEFAULT 1,
    exp INT NOT NULL DEFAULT 0,
    exp_to_next_level INT NOT NULL DEFAULT 100,
    diamonds INT NOT NULL DEFAULT 50,
    streak INT NOT NULL DEFAULT 0,
    max_streak INT NOT NULL DEFAULT 0,
    highest_floor INT NOT NULL DEFAULT 1,
    speed_high_score INT NOT NULL DEFAULT 0,
    last_active_date DATE NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

CREATE TABLE dbo.User_Sessions (
    session_token NVARCHAR(64) NOT NULL PRIMARY KEY,
    user_id INT NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    expires_at DATETIME2 NOT NULL,
    CONSTRAINT FK_User_Sessions_Users FOREIGN KEY (user_id)
        REFERENCES dbo.Users(user_id) ON DELETE CASCADE
);
GO

-- ================================================================
-- 2. DANH MỤC CHUYÊN ĐỀ GDPT 2018 (TOPICS)
-- ================================================================
CREATE TABLE dbo.Topics (
    topic_id NVARCHAR(50) PRIMARY KEY, -- vd: 'can_thuc', 'nc_he_pt'
    topic_name NVARCHAR(150) NOT NULL,
    category NVARCHAR(50) NOT NULL,    -- 'Đại số 9', 'Hình học 9', 'Nâng cao SBT', 'Ôn thi vào 10'
    badge NVARCHAR(50) NULL,           -- 'SBT Tập 1 - C.I'
    icon NVARCHAR(20) NULL,            -- '√x', '{xy}', '📐'
    color NVARCHAR(100) NULL,
    border_color NVARCHAR(50) NULL,
    description NVARCHAR(500) NULL,
    is_advanced BIT NOT NULL DEFAULT 0, -- 0: Cơ bản, 1: Nâng cao điền số
    order_index INT NOT NULL DEFAULT 0
);
GO

-- ================================================================
-- 3. NGÂN HÀNG CÂU HỎI (QUESTIONS)
-- Hỗ trợ cả câu hỏi Trắc nghiệm 4 đáp án và Điền số nâng cao (LaTeX)
-- ================================================================
CREATE TABLE dbo.Questions (
    question_id NVARCHAR(50) PRIMARY KEY, -- vd: 'ct_01', 'nc_pt_01'
    topic_id NVARCHAR(50) NOT NULL FOREIGN KEY REFERENCES dbo.Topics(topic_id) ON DELETE CASCADE,
    question_type NVARCHAR(20) NOT NULL DEFAULT N'multiple_choice' 
        CHECK (question_type IN (N'multiple_choice', N'numeric_input')),
    content NVARCHAR(MAX) NOT NULL,       -- Chứa biểu thức Toán chuẩn LaTeX $...$ hoặc $$...$$
    option_a NVARCHAR(500) NULL,
    option_b NVARCHAR(500) NULL,
    option_c NVARCHAR(500) NULL,
    option_d NVARCHAR(500) NULL,
    correct_answer NVARCHAR(500) NOT NULL,-- 'A'/'B'/'C'/'D' hoặc giá trị số (vd: '4', '-1.5')
    explanation NVARCHAR(MAX) NULL,       -- Lời giải chi tiết
    difficulty NVARCHAR(20) NOT NULL DEFAULT N'co_ban' 
        CHECK (difficulty IN (N'nhan_biet', N'thong_hieu', N'van_dung', N'van_dung_cao', N'co_ban', N'nang_cao')),
    is_custom BIT NOT NULL DEFAULT 0,     -- Giáo viên tự tạo hay mặc định
    created_by_user_id INT NULL FOREIGN KEY REFERENCES dbo.Users(user_id),
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

-- ================================================================
-- 4. BỘ ĐỀ THI HỌC KỲ & THI VÀO 10 (EXAMS & EXAM QUESTIONS)
-- ================================================================
CREATE TABLE dbo.Exams (
    exam_id NVARCHAR(50) PRIMARY KEY, -- vd: 'de_hk1_nghian_2025'
    title NVARCHAR(200) NOT NULL,
    source NVARCHAR(200) NULL,        -- Trường THCS Nghĩa An, Đề thi Tuyển sinh Sở GD...
    duration_minutes INT NOT NULL DEFAULT 45,
    total_questions INT NOT NULL DEFAULT 20,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

CREATE TABLE dbo.Exam_Questions (
    exam_id NVARCHAR(50) NOT NULL FOREIGN KEY REFERENCES dbo.Exams(exam_id) ON DELETE CASCADE,
    question_id NVARCHAR(50) NOT NULL FOREIGN KEY REFERENCES dbo.Questions(question_id) ON DELETE CASCADE,
    question_order INT NOT NULL DEFAULT 1,
    points DECIMAL(4,2) NOT NULL DEFAULT 0.50,
    PRIMARY KEY (exam_id, question_id)
);
GO

-- ================================================================
-- 5. PHÒNG LEO THÁP TRI THỨC (TOWER GAME)
-- ================================================================
CREATE TABLE dbo.Tower_Floors (
    floor_number INT PRIMARY KEY,
    name NVARCHAR(150) NOT NULL,
    boss_name NVARCHAR(100) NOT NULL,
    boss_avatar NVARCHAR(20) NOT NULL DEFAULT N'👾',
    boss_hp INT NOT NULL DEFAULT 100,
    topic NVARCHAR(150) NULL,
    dialogue NVARCHAR(500) NULL,
    reward_exp INT NOT NULL DEFAULT 50,
    reward_diamonds INT NOT NULL DEFAULT 10
);
GO

CREATE TABLE dbo.Tower_Floor_Questions (
    floor_number INT NOT NULL FOREIGN KEY REFERENCES dbo.Tower_Floors(floor_number) ON DELETE CASCADE,
    question_id NVARCHAR(50) NOT NULL FOREIGN KEY REFERENCES dbo.Questions(question_id) ON DELETE CASCADE,
    PRIMARY KEY (floor_number, question_id)
);
GO

-- ================================================================
-- 6. THÀNH TỰU (ACHIEVEMENTS) & AVATAR SHOP
-- ================================================================
CREATE TABLE dbo.Achievements (
    achievement_id NVARCHAR(50) PRIMARY KEY,
    title NVARCHAR(100) NOT NULL,
    description NVARCHAR(250) NOT NULL,
    icon NVARCHAR(20) NOT NULL DEFAULT N'🏆',
    required_condition NVARCHAR(100) NULL,
    reward_diamonds INT NOT NULL DEFAULT 20
);
GO

CREATE TABLE dbo.Avatars (
    avatar_id NVARCHAR(50) PRIMARY KEY,
    icon NVARCHAR(20) NOT NULL,
    name NVARCHAR(100) NOT NULL,
    price_diamonds INT NOT NULL DEFAULT 0,
    unlock_level INT NOT NULL DEFAULT 1
);
GO

-- ================================================================
-- 7. SỔ TAY CÔNG THỨC (CHEATSHEET FORMULAS)
-- ================================================================
CREATE TABLE dbo.Formulas (
    formula_id INT IDENTITY(1,1) PRIMARY KEY,
    topic_id NVARCHAR(50) NOT NULL FOREIGN KEY REFERENCES dbo.Topics(topic_id) ON DELETE CASCADE,
    title NVARCHAR(150) NOT NULL,
    latex_formula NVARCHAR(MAX) NOT NULL,
    notes NVARCHAR(MAX) NULL,
    category NVARCHAR(50) NOT NULL
);
GO

-- ================================================================
-- 8. TIẾN ĐỘ & LỊCH SỬ HỌC TẬP CỦA HỌC SINH (USER PROGRESS & LOGS)
-- ================================================================
CREATE TABLE dbo.User_Question_History (
    history_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL FOREIGN KEY REFERENCES dbo.Users(user_id) ON DELETE CASCADE,
    question_id NVARCHAR(50) NOT NULL FOREIGN KEY REFERENCES dbo.Questions(question_id) ON DELETE CASCADE,
    attempt_count INT NOT NULL DEFAULT 1,
    correct_count INT NOT NULL DEFAULT 0,
    wrong_count INT NOT NULL DEFAULT 0,
    last_user_answer NVARCHAR(500) NULL,
    is_last_correct BIT NOT NULL DEFAULT 0,
    last_attempt_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_User_Question UNIQUE (user_id, question_id)
);
GO

CREATE TABLE dbo.User_Topic_Progress (
    user_id INT NOT NULL FOREIGN KEY REFERENCES dbo.Users(user_id) ON DELETE CASCADE,
    topic_id NVARCHAR(50) NOT NULL FOREIGN KEY REFERENCES dbo.Topics(topic_id) ON DELETE CASCADE,
    correct_count INT NOT NULL DEFAULT 0,
    total_answered INT NOT NULL DEFAULT 0,
    last_practiced_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    PRIMARY KEY (user_id, topic_id)
);
GO

CREATE TABLE dbo.Tower_User_Progress (
    user_id INT NOT NULL FOREIGN KEY REFERENCES dbo.Users(user_id) ON DELETE CASCADE,
    floor_number INT NOT NULL FOREIGN KEY REFERENCES dbo.Tower_Floors(floor_number) ON DELETE CASCADE,
    is_cleared BIT NOT NULL DEFAULT 0,
    stars INT NOT NULL DEFAULT 0 CHECK (stars BETWEEN 0 AND 3),
    cleared_at DATETIME2 NULL,
    PRIMARY KEY (user_id, floor_number)
);
GO

CREATE TABLE dbo.Exam_Submissions (
    submission_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL FOREIGN KEY REFERENCES dbo.Users(user_id) ON DELETE CASCADE,
    exam_id NVARCHAR(50) NOT NULL FOREIGN KEY REFERENCES dbo.Exams(exam_id) ON DELETE CASCADE,
    score DECIMAL(4,2) NOT NULL,
    total_correct INT NOT NULL,
    total_questions INT NOT NULL,
    time_spent_seconds INT NOT NULL,
    submitted_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

CREATE TABLE dbo.User_Achievements (
    user_id INT NOT NULL FOREIGN KEY REFERENCES dbo.Users(user_id) ON DELETE CASCADE,
    achievement_id NVARCHAR(50) NOT NULL FOREIGN KEY REFERENCES dbo.Achievements(achievement_id) ON DELETE CASCADE,
    unlocked_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    PRIMARY KEY (user_id, achievement_id)
);
GO

CREATE TABLE dbo.User_Avatars (
    user_id INT NOT NULL FOREIGN KEY REFERENCES dbo.Users(user_id) ON DELETE CASCADE,
    avatar_id NVARCHAR(50) NOT NULL FOREIGN KEY REFERENCES dbo.Avatars(avatar_id) ON DELETE CASCADE,
    unlocked_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    PRIMARY KEY (user_id, avatar_id)
);
GO

-- ================================================================
-- 9. NHẬT KÝ HỎI ĐÁP AI GEMINI (CHATBOT LOGS)
-- ================================================================
CREATE TABLE dbo.Chatbot_Logs (
    log_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NULL FOREIGN KEY REFERENCES dbo.Users(user_id),
    client_ip VARCHAR(45) NOT NULL,
    model_name VARCHAR(50) NOT NULL DEFAULT 'gemini-flash-latest',
    user_prompt NVARCHAR(MAX) NOT NULL,
    bot_reply NVARCHAR(MAX) NOT NULL,
    response_time_ms INT NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

-- ================================================================
-- 10. CHỈ MỤC INDEX TỐI ƯU HÓA TRUY VẤN
-- ================================================================
CREATE NONCLUSTERED INDEX IX_Questions_TopicId ON dbo.Questions(topic_id);
CREATE NONCLUSTERED INDEX IX_Questions_Difficulty ON dbo.Questions(difficulty);
CREATE NONCLUSTERED INDEX IX_History_UserQuestion ON dbo.User_Question_History(user_id, question_id);
CREATE NONCLUSTERED INDEX IX_ExamSubmissions_UserExam ON dbo.Exam_Submissions(user_id, exam_id);
CREATE NONCLUSTERED INDEX IX_Chatbot_CreatedAt ON dbo.Chatbot_Logs(created_at);
GO

-- ================================================================
-- 11. DỮ LIỆU MẪU ĐẠI DIỆN TỪ WEB TOÁN 9 (SEED DATA)
-- ================================================================
INSERT INTO dbo.Topics (topic_id, topic_name, category, badge, icon, color, description, is_advanced, order_index)
VALUES 
(N'can_thuc', N'Căn thức & Rút gọn', N'Đại số 9', N'Đại số 9', N'√x', N'from-amber-500 to-orange-600', N'Căn bậc hai, căn bậc ba, điều kiện xác định và rút gọn', 0, 1),
(N'he_phuong_trinh', N'Hệ hai phương trình', N'Đại số 9', N'Đại số 9', N'{xy}', N'from-blue-500 to-indigo-600', N'Hệ phương trình bậc nhất hai ẩn và bài toán thực tế', 0, 2),
(N'bat_phuong_trinh', N'Bất đẳng thức & BPT', N'Đại số 9', N'Đại số 9', N'≥ ≤', N'from-emerald-500 to-teal-600', N'Bất phương trình bậc nhất một ẩn và BĐT Cauchy AM-GM', 0, 3),
(N'he_thuc_luong', N'Hệ thức lượng & Lượng giác', N'Hình học 9', N'Hình học 9', N'📐', N'from-cyan-500 to-blue-600', N'Hệ thức lượng trong tam giác vuông, tỉ số lượng giác', 0, 4),
(N'duong_tron', N'Đường tròn & Tiếp tuyến', N'Hình học 9', N'Hình học 9', N'⭕', N'from-rose-500 to-pink-600', N'Đường kính và dây cung, tính chất hai tiếp tuyến cắt nhau', 0, 5),
(N'nc_he_pt', N'Hệ Phương Trình & Toán Thực Tế', N'Nâng cao SBT', N'SBT Tập 1 - C.I', N'{xy}', N'from-blue-600 via-indigo-600 to-cyan-500', N'Toán thực tế năng suất chuyển động, nghiệm nguyên', 1, 6),
(N'nc_can_thuc', N'Căn Bậc Hai Vận Dụng', N'Nâng cao SBT', N'SBT Tập 1 - C.III', N'√x', N'from-amber-600 via-orange-600 to-yellow-500', N'Rút gọn biểu thức chứa căn, tìm x nguyên, cực trị căn', 1, 7);

INSERT INTO dbo.Users (username, display_name, avatar, user_role, level, exp, diamonds, streak)
VALUES 
(N'hocsinh01', N'Mavis Hoàng Gia', N'🐱', N'student', 5, 450, 120, 7),
(N'giaovien_toan', N'Cô Giáo Thảo', N'👩‍🏫', N'teacher', 20, 5000, 999, 30);

INSERT INTO dbo.Questions (question_id, topic_id, question_type, content, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty)
VALUES
(N'ct_01', N'can_thuc', N'multiple_choice', N'Căn bậc hai số học của 81 là bao nhiêu?', N'9', N'-9', N'±9', N'81', N'A', N'Căn bậc hai số học của $a \ge 0$ là số không âm $x$ thỏa mãn $x^2 = a$. Vậy $\sqrt{81} = 9$.', N'co_ban'),
(N'ct_02', N'can_thuc', N'multiple_choice', N'Điều kiện xác định của biểu thức $\sqrt{2x - 6}$ là:', N'$x \ge 3$', N'$x > 3$', N'$x \le 3$', N'$x \ge 0$', N'A', N'Biểu thức $\sqrt{A}$ có nghĩa khi và chỉ khi $A \ge 0 \Leftrightarrow 2x - 6 \ge 0 \Leftrightarrow x \ge 3$.', N'co_ban'),
(N'nc_pt_01', N'nc_he_pt', N'numeric_input', N'Một mảnh đất hình chữ nhật có chu vi 40m. Chiều dài hơn chiều rộng 4m. Diện tích mảnh đất là bao nhiêu $m^2$?', NULL, NULL, NULL, NULL, N'96', N'Nửa chu vi: $x + y = 20$. Hiệu: $x - y = 4 \Rightarrow x = 12, y = 8$. Diện tích $S = 12 \times 8 = 96 m^2$.', N'nang_cao');

INSERT INTO dbo.Tower_Floors (floor_number, name, boss_name, boss_avatar, boss_hp, topic, dialogue, reward_exp, reward_diamonds)
VALUES 
(1, N'Tầng 1: Đồng Cỏ Khởi Nguyên', N'Slime Tính Nhẩm', N'🟢', 100, N'Tính nhẩm & Căn số học cơ bản', N'Ngươi muốn leo tháp ư? Hãy vượt qua phép thử tính nhanh của ta trước đã!', 50, 10),
(2, N'Tầng 2: Rừng Căn Thức Bí Ẩn', N'Yêu Tinh Căn Bậc Hai', N'🧌', 150, N'Hằng đẳng thức & Rút gọn căn thức', N'Căn thức của ta có hai lớp bảo vệ! Ngươi có biết giải trị tuyệt đối không?', 80, 15);

INSERT INTO dbo.Tower_Floor_Questions (floor_number, question_id)
VALUES (1, N'ct_01'), (2, N'ct_02');

INSERT INTO dbo.Achievements (achievement_id, title, description, icon, reward_diamonds)
VALUES 
(N'ach_first_win', N'Khởi Đầu Nan', N'Hoàn thành bài tập trắc nghiệm đầu tiên', N'🌱', 10),
(N'ach_streak_3', N'Chăm Chỉ Cần Cù', N'Đạt chuỗi học 3 ngày liên tiếp', N'🔥', 20),
(N'ach_tower_f1', N'Chinh Phục Tầng 1', N'Đánh bại Slime Tính Nhẩm tại Tầng 1', N'⚔️', 25);
GO

-- ================================================================
-- 12. VIEW BẢNG XẾP HẠNG (LEADERBOARD VIEW)
-- ================================================================
CREATE OR ALTER VIEW dbo.vw_Leaderboard AS
SELECT TOP 100
    u.user_id,
    u.display_name,
    u.avatar,
    u.level,
    u.exp,
    u.diamonds,
    u.streak,
    u.highest_floor,
    u.speed_high_score,
    COUNT(h.question_id) AS total_questions_solved,
    SUM(CASE WHEN h.correct_count > 0 THEN 1 ELSE 0 END) AS total_distinct_correct
FROM dbo.Users u
LEFT JOIN dbo.User_Question_History h ON u.user_id = h.user_id
GROUP BY 
    u.user_id, u.display_name, u.avatar, u.level, u.exp, 
    u.diamonds, u.streak, u.highest_floor, u.speed_high_score
ORDER BY u.level DESC, u.exp DESC;
GO

-- ================================================================
-- 13. DỮ LIỆU ĐỒNG BỘ CỦA WEBSITE (BỔ SUNG CHO LOCALSTORAGE)
-- ================================================================
IF OBJECT_ID(N'dbo.Web_Client_State', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Web_Client_State (
        client_id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
        user_id INT NOT NULL UNIQUE FOREIGN KEY REFERENCES dbo.Users(user_id) ON DELETE CASCADE,
        profile_json NVARCHAR(MAX) NOT NULL CONSTRAINT DF_Web_Client_State_Profile DEFAULT N'{}',
        custom_questions_json NVARCHAR(MAX) NOT NULL CONSTRAINT DF_Web_Client_State_Custom DEFAULT N'[]',
        leaderboard_json NVARCHAR(MAX) NOT NULL CONSTRAINT DF_Web_Client_State_Leaderboard DEFAULT N'[]',
        updated_at DATETIME2 NOT NULL CONSTRAINT DF_Web_Client_State_Updated DEFAULT SYSUTCDATETIME()
    );
END
GO
