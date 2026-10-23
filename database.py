"""SQL Server persistence & authentication for browser-based Toán 9 player profiles."""

import hashlib
import json
import os
import re
import secrets
import urllib.parse
import uuid


def _connection_string():
    driver = os.environ.get("SQL_DRIVER", "ODBC Driver 18 for SQL Server")
    server = os.environ.get("SQL_SERVER", r"localhost\MSSQLSERVER01")
    database = os.environ.get("SQL_DATABASE", "Toan9_DB")
    trusted = os.environ.get("SQL_TRUSTED_CONNECTION", "yes").lower() in ("1", "true", "yes")
    parts = [f"DRIVER={{{driver}}}", f"SERVER={server}", f"DATABASE={database}"]
    if trusted:
        parts.append("Trusted_Connection=yes")
    else:
        parts.extend([
            f"UID={os.environ.get('SQL_USER', '')}",
            f"PWD={os.environ.get('SQL_PASSWORD', '')}",
        ])
    parts.append("Encrypt=yes")
    parts.append("TrustServerCertificate=yes")
    return ";".join(parts) + ";"


def _connect():
    try:
        import pyodbc
    except ImportError as error:
        raise RuntimeError("Thiếu pyodbc. Hãy cài các gói trong requirements.txt.") from error
    return pyodbc.connect(_connection_string(), timeout=5)


def hash_password(password: str) -> str:
    """Băm mật khẩu bằng PBKDF2-HMAC-SHA256 với salt ngẫu nhiên."""
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100_000)
    return f"{salt}${key.hex()}"


def verify_password(password: str, hashed: str) -> bool:
    """Xác thực mật khẩu đối chiếu với chuỗi băm."""
    if not hashed or "$" not in hashed:
        return False
    parts = hashed.split("$", 1)
    if len(parts) != 2:
        return False
    salt, key_hex = parts
    key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100_000)
    return secrets.compare_digest(key.hex(), key_hex)


def _ensure_table(cursor):
    """Đảm bảo bảng lưu trạng thái web, cột mật khẩu và bảng phiên đăng nhập tồn tại."""
    # 1. Bảng Web_Client_State
    cursor.execute("""
        IF OBJECT_ID(N'dbo.Web_Client_State', N'U') IS NULL
        BEGIN
            CREATE TABLE dbo.Web_Client_State (
                client_id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
                user_id INT NOT NULL UNIQUE,
                profile_json NVARCHAR(MAX) NOT NULL CONSTRAINT DF_Web_Client_State_Profile DEFAULT N'{}',
                custom_questions_json NVARCHAR(MAX) NOT NULL
                    CONSTRAINT DF_Web_Client_State_Custom DEFAULT N'[]',
                leaderboard_json NVARCHAR(MAX) NOT NULL
                    CONSTRAINT DF_Web_Client_State_Leaderboard DEFAULT N'[]',
                updated_at DATETIME2 NOT NULL
                    CONSTRAINT DF_Web_Client_State_Updated DEFAULT SYSUTCDATETIME(),
                CONSTRAINT FK_Web_Client_State_Users FOREIGN KEY (user_id)
                    REFERENCES dbo.Users(user_id) ON DELETE CASCADE
            );
        END
        IF COL_LENGTH(N'dbo.Web_Client_State', N'profile_json') IS NULL
            ALTER TABLE dbo.Web_Client_State ADD profile_json NVARCHAR(MAX) NOT NULL
                CONSTRAINT DF_Web_Client_State_Profile DEFAULT N'{}' WITH VALUES;
    """)

    # 2. Bổ sung cột password_hash vào bảng dbo.Users nếu chưa có
    cursor.execute("""
        IF COL_LENGTH(N'dbo.Users', N'password_hash') IS NULL
            ALTER TABLE dbo.Users ADD password_hash NVARCHAR(255) NULL;
    """)

    # 3. Bảng dbo.User_Sessions để lưu phiên đăng nhập
    cursor.execute("""
        IF OBJECT_ID(N'dbo.User_Sessions', N'U') IS NULL
        BEGIN
            CREATE TABLE dbo.User_Sessions (
                session_token NVARCHAR(64) NOT NULL PRIMARY KEY,
                user_id INT NOT NULL,
                created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
                expires_at DATETIME2 NOT NULL,
                CONSTRAINT FK_User_Sessions_Users FOREIGN KEY (user_id)
                    REFERENCES dbo.Users(user_id) ON DELETE CASCADE
            );
        END
    """)

    # 4. Gán mật khẩu mẫu mặc định (123456) cho các tài khoản mẫu nếu chưa có mật khẩu
    cursor.execute("SELECT user_id, username, password_hash FROM dbo.Users WHERE password_hash IS NULL")
    null_users = cursor.fetchall()
    if null_users:
        default_hash = hash_password("123456")
        for u in null_users:
            cursor.execute("UPDATE dbo.Users SET password_hash = ? WHERE user_id = ?", default_hash, u.user_id)


def _validate_client_id(value):
    try:
        return str(uuid.UUID(str(value)))
    except (ValueError, TypeError, AttributeError) as error:
        raise ValueError("Mã hồ sơ không hợp lệ.") from error


def _format_user_profile(user_row, raw_profile_json=None):
    """Định dạng dữ liệu người dùng từ bảng Users kết hợp với profile_json."""
    loaded_profile = {}
    if raw_profile_json:
        try:
            loaded_profile = json.loads(raw_profile_json) or {}
        except Exception:
            loaded_profile = {}

    default_profile = {
        "name": user_row.display_name or "Chiến Binh Toán 9",
        "avatar": user_row.avatar or "🐱",
        "level": user_row.level if user_row.level is not None else 1,
        "exp": user_row.exp if user_row.exp is not None else 0,
        "expToNextLevel": user_row.exp_to_next_level if user_row.exp_to_next_level is not None else 100,
        "diamonds": user_row.diamonds if user_row.diamonds is not None else 50,
        "streak": user_row.streak if user_row.streak is not None else 0,
        "maxStreak": user_row.max_streak if user_row.max_streak is not None else 0,
        "highestFloor": user_row.highest_floor if user_row.highest_floor is not None else 1,
        "unlockedAvatars": ["av_1"],
        "unlockedAchievements": [],
        "answeredQuestions": {},
        "topicProgress": {},
        "advancedHistory": {},
        "recentAdvancedQIds": [],
        "advancedTopicProgress": {},
        "speedHighScore": user_row.speed_high_score if user_row.speed_high_score is not None else 0,
        "lastPlayedDate": str(user_row.last_active_date) if user_row.last_active_date else None,
    }

    # Hợp nhất: ưu tiên các trường trong database Users cho các chỉ số cốt lõi
    merged = {**default_profile, **loaded_profile}
    merged["name"] = user_row.display_name or merged.get("name", "Chiến Binh Toán 9")
    merged["avatar"] = user_row.avatar or merged.get("avatar", "🐱")
    merged["level"] = user_row.level
    merged["exp"] = user_row.exp
    merged["expToNextLevel"] = user_row.exp_to_next_level
    merged["diamonds"] = user_row.diamonds
    merged["streak"] = user_row.streak
    merged["maxStreak"] = user_row.max_streak
    merged["highestFloor"] = user_row.highest_floor
    merged["speedHighScore"] = user_row.speed_high_score
    return merged


def register_user(username, password, display_name=None, avatar=None):
    """Đăng ký tài khoản người dùng mới và lưu vào cơ sở dữ liệu Toan9_DB."""
    if not username or not isinstance(username, str):
        raise ValueError("Tên đăng nhập không được để trống.")
    username = username.strip().lower()

    if not re.match(r"^[a-zA-Z0-9_]{3,30}$", username):
        raise ValueError("Tên đăng nhập từ 3 đến 30 ký tự, chỉ gồm chữ cái, số và gạch dưới (_).")

    if not password or not isinstance(password, str) or len(password) < 4:
        raise ValueError("Mật khẩu phải có độ dài từ 4 ký tự trở lên.")
    if len(password) > 64:
        raise ValueError("Mật khẩu tối đa 64 ký tự.")

    display_name = str(display_name or "").strip()[:100]
    if not display_name:
        display_name = username
    avatar = str(avatar or "🐱").strip()[:20]

    pwd_hash = hash_password(password)
    client_id = str(uuid.uuid4())

    with _connect() as connection:
        cursor = connection.cursor()
        _ensure_table(cursor)

        # Kiểm tra trùng tên đăng nhập
        cursor.execute("SELECT user_id FROM dbo.Users WHERE LOWER(username) = ?", username)
        if cursor.fetchone():
            raise ValueError("Tên đăng nhập đã tồn tại. Vui lòng chọn tên đăng nhập khác.")

        # Thêm người dùng mới
        cursor.execute("""
            INSERT INTO dbo.Users
                (username, password_hash, display_name, avatar, user_role, level, exp,
                 exp_to_next_level, diamonds, streak, max_streak, highest_floor,
                 speed_high_score, last_active_date)
            OUTPUT INSERTED.user_id, INSERTED.username, INSERTED.display_name, INSERTED.avatar,
                   INSERTED.user_role, INSERTED.level, INSERTED.exp, INSERTED.exp_to_next_level,
                   INSERTED.diamonds, INSERTED.streak, INSERTED.max_streak, INSERTED.highest_floor,
                   INSERTED.speed_high_score, INSERTED.last_active_date
            VALUES (?, ?, ?, ?, N'student', 1, 0, 100, 50, 0, 0, 1, 0, CONVERT(date, GETDATE()))
        """, username, pwd_hash, display_name, avatar)
        user_row = cursor.fetchone()
        user_id = user_row.user_id

        # Tạo hồ sơ mặc định
        profile = _format_user_profile(user_row)
        profile_json = json.dumps(profile, ensure_ascii=False)
        custom_json = "[]"
        leaderboard_json = "[]"

        cursor.execute("""
            INSERT INTO dbo.Web_Client_State
                (client_id, user_id, profile_json, custom_questions_json, leaderboard_json)
            VALUES (?, ?, ?, ?, ?)
        """, client_id, user_id, profile_json, custom_json, leaderboard_json)

        # Tạo phiên đăng nhập
        session_token = secrets.token_hex(32)
        cursor.execute("""
            INSERT INTO dbo.User_Sessions (session_token, user_id, expires_at)
            VALUES (?, ?, DATEADD(day, 30, SYSUTCDATETIME()))
        """, session_token, user_id)

        connection.commit()

        return {
            "sessionToken": session_token,
            "user": {
                "userId": user_id,
                "username": username,
                "displayName": display_name,
                "avatar": avatar,
                "role": user_row.user_role,
            },
            "clientId": client_id,
            "profile": profile,
            "customQuestions": [],
            "leaderboard": [],
        }


def login_user(username, password):
    """Xác thực đăng nhập và nạp dữ liệu hồ sơ học tập từ Toan9_DB."""
    if not username or not isinstance(username, str):
        raise ValueError("Vui lòng nhập tên đăng nhập.")
    if not password or not isinstance(password, str):
        raise ValueError("Vui lòng nhập mật khẩu.")

    username = username.strip().lower()

    with _connect() as connection:
        cursor = connection.cursor()
        _ensure_table(cursor)

        cursor.execute("""
            SELECT u.user_id, u.username, u.password_hash, u.display_name, u.avatar, u.user_role,
                   u.level, u.exp, u.exp_to_next_level, u.diamonds, u.streak, u.max_streak,
                   u.highest_floor, u.speed_high_score, u.last_active_date,
                   s.client_id, s.profile_json, s.custom_questions_json, s.leaderboard_json
            FROM dbo.Users u
            LEFT JOIN dbo.Web_Client_State s ON s.user_id = u.user_id
            WHERE LOWER(u.username) = ?
        """, username)
        row = cursor.fetchone()
        if not row:
            raise ValueError("Tên đăng nhập hoặc mật khẩu không chính xác.")

        # Kiểm tra mật khẩu
        pwd_hash = row.password_hash
        if not pwd_hash:
            if password == "123456":
                pwd_hash = hash_password("123456")
                cursor.execute("UPDATE dbo.Users SET password_hash = ? WHERE user_id = ?", pwd_hash, row.user_id)
            else:
                raise ValueError("Tên đăng nhập hoặc mật khẩu không chính xác.")
        elif not verify_password(password, pwd_hash):
            raise ValueError("Tên đăng nhập hoặc mật khẩu không chính xác.")

        # Cập nhật ngày hoạt động gần nhất
        cursor.execute("UPDATE dbo.Users SET last_active_date = CONVERT(date, GETDATE()) WHERE user_id = ?", row.user_id)

        # Đảm bảo có bản ghi Web_Client_State
        client_id = row.client_id
        profile_json = row.profile_json
        custom_json = row.custom_questions_json or "[]"
        leaderboard_json = row.leaderboard_json or "[]"

        if not client_id:
            client_id = str(uuid.uuid4())
            profile = _format_user_profile(row)
            profile_json = json.dumps(profile, ensure_ascii=False)
            cursor.execute("""
                INSERT INTO dbo.Web_Client_State
                    (client_id, user_id, profile_json, custom_questions_json, leaderboard_json)
                VALUES (?, ?, ?, ?, ?)
            """, client_id, row.user_id, profile_json, custom_json, leaderboard_json)
        else:
            profile = _format_user_profile(row, profile_json)

        # Xóa phiên hết hạn và tạo phiên mới
        cursor.execute("DELETE FROM dbo.User_Sessions WHERE expires_at < SYSUTCDATETIME()")
        session_token = secrets.token_hex(32)
        cursor.execute("""
            INSERT INTO dbo.User_Sessions (session_token, user_id, expires_at)
            VALUES (?, ?, DATEADD(day, 30, SYSUTCDATETIME()))
        """, session_token, row.user_id)

        connection.commit()

        return {
            "sessionToken": session_token,
            "user": {
                "userId": row.user_id,
                "username": row.username,
                "displayName": row.display_name,
                "avatar": row.avatar,
                "role": row.user_role,
            },
            "clientId": str(client_id),
            "profile": profile,
            "customQuestions": json.loads(custom_json) if isinstance(custom_json, str) else [],
            "leaderboard": json.loads(leaderboard_json) if isinstance(leaderboard_json, str) else [],
        }


def get_user_by_session(session_token):
    """Lấy thông tin và trạng thái người dùng hiện tại dựa trên session_token."""
    if not session_token or not isinstance(session_token, str) or len(session_token) != 64:
        return None

    with _connect() as connection:
        cursor = connection.cursor()
        _ensure_table(cursor)
        cursor.execute("""
            SELECT u.user_id, u.username, u.display_name, u.avatar, u.user_role,
                   u.level, u.exp, u.exp_to_next_level, u.diamonds, u.streak, u.max_streak,
                   u.highest_floor, u.speed_high_score, u.last_active_date,
                   s.client_id, s.profile_json, s.custom_questions_json, s.leaderboard_json
            FROM dbo.User_Sessions sess
            JOIN dbo.Users u ON u.user_id = sess.user_id
            LEFT JOIN dbo.Web_Client_State s ON s.user_id = u.user_id
            WHERE sess.session_token = ? AND sess.expires_at > SYSUTCDATETIME()
        """, session_token)
        row = cursor.fetchone()
        if not row:
            return None

        client_id = row.client_id
        if not client_id:
            client_id = str(uuid.uuid4())
            profile = _format_user_profile(row)
            cursor.execute("""
                INSERT INTO dbo.Web_Client_State
                    (client_id, user_id, profile_json, custom_questions_json, leaderboard_json)
                VALUES (?, ?, ?, ?, ?)
            """, client_id, row.user_id, json.dumps(profile, ensure_ascii=False), "[]", "[]")
            connection.commit()
            custom_q = []
            leaderboard = []
        else:
            profile = _format_user_profile(row, row.profile_json)
            try:
                custom_q = json.loads(row.custom_questions_json or "[]")
            except Exception:
                custom_q = []
            try:
                leaderboard = json.loads(row.leaderboard_json or "[]")
            except Exception:
                leaderboard = []

        return {
            "user": {
                "userId": row.user_id,
                "username": row.username,
                "displayName": row.display_name,
                "avatar": row.avatar,
                "role": row.user_role,
            },
            "clientId": str(client_id),
            "profile": profile,
            "customQuestions": custom_q,
            "leaderboard": leaderboard,
        }


def logout_user(session_token):
    """Hủy phiên đăng nhập."""
    if not session_token or not isinstance(session_token, str):
        return True
    with _connect() as connection:
        cursor = connection.cursor()
        _ensure_table(cursor)
        cursor.execute("DELETE FROM dbo.User_Sessions WHERE session_token = ?", session_token)
        connection.commit()
    return True


def save_user_state(user_id, payload):
    """Lưu tiến độ học tập cho tài khoản người dùng đã đăng nhập."""
    profile = payload.get("profile")
    custom_questions = payload.get("customQuestions", [])
    leaderboard = payload.get("leaderboard", [])
    if not isinstance(profile, dict):
        raise ValueError("Hồ sơ học tập không hợp lệ.")
    if not isinstance(custom_questions, list) or not isinstance(leaderboard, list):
        raise ValueError("Danh sách câu hỏi hoặc bảng xếp hạng không hợp lệ.")

    name = str(profile.get("name") or "Chiến Binh Toán 9")[:100]
    avatar = str(profile.get("avatar") or "🐱")[:20]
    numeric_fields = {
        "level": max(1, min(int(profile.get("level", 1)), 10000)),
        "exp": max(0, min(int(profile.get("exp", 0)), 2147483647)),
        "expToNextLevel": max(1, min(int(profile.get("expToNextLevel", 100)), 2147483647)),
        "diamonds": max(0, min(int(profile.get("diamonds", 50)), 2147483647)),
        "streak": max(0, min(int(profile.get("streak", 0)), 2147483647)),
        "maxStreak": max(0, min(int(profile.get("maxStreak", 0)), 2147483647)),
        "highestFloor": max(1, min(int(profile.get("highestFloor", 1)), 2147483647)),
        "speedHighScore": max(0, min(int(profile.get("speedHighScore", 0)), 2147483647)),
    }
    custom_json = json.dumps(custom_questions, ensure_ascii=False)
    profile_json = json.dumps(profile, ensure_ascii=False)
    leaderboard_json = json.dumps(leaderboard, ensure_ascii=False)
    if len(profile_json) > 500_000 or len(custom_json) > 2_000_000 or len(leaderboard_json) > 500_000:
        raise ValueError("Dữ liệu học tập vượt quá dung lượng cho phép.")

    with _connect() as connection:
        cursor = connection.cursor()
        _ensure_table(cursor)

        cursor.execute("""
            UPDATE dbo.Users SET display_name = ?, avatar = ?, level = ?, exp = ?,
                exp_to_next_level = ?, diamonds = ?, streak = ?, max_streak = ?,
                highest_floor = ?, speed_high_score = ?, last_active_date = CONVERT(date, GETDATE())
            WHERE user_id = ?
        """, name, avatar, numeric_fields["level"], numeric_fields["exp"],
             numeric_fields["expToNextLevel"], numeric_fields["diamonds"],
             numeric_fields["streak"], numeric_fields["maxStreak"],
             numeric_fields["highestFloor"], numeric_fields["speedHighScore"], user_id)

        cursor.execute("""
            UPDATE dbo.Web_Client_State
            SET profile_json = ?, custom_questions_json = ?, leaderboard_json = ?, updated_at = SYSUTCDATETIME()
            WHERE user_id = ?
        """, profile_json, custom_json, leaderboard_json, user_id)

        if cursor.rowcount == 0:
            client_id = str(uuid.uuid4())
            cursor.execute("""
                INSERT INTO dbo.Web_Client_State
                    (client_id, user_id, profile_json, custom_questions_json, leaderboard_json)
                VALUES (?, ?, ?, ?, ?)
            """, client_id, user_id, profile_json, custom_json, leaderboard_json)

        connection.commit()


def load_client_state(client_id):
    """Tải dữ liệu dựa trên client_id (hỗ trợ tương thích ngược)."""
    client_id = _validate_client_id(client_id)
    with _connect() as connection:
        cursor = connection.cursor()
        _ensure_table(cursor)
        cursor.execute("""
            SELECT u.user_id, u.display_name, u.avatar, u.level, u.exp,
                   u.exp_to_next_level, u.diamonds, u.streak, u.max_streak,
                   u.highest_floor, u.speed_high_score, s.profile_json, s.custom_questions_json,
                   s.leaderboard_json
            FROM dbo.Web_Client_State s
            JOIN dbo.Users u ON u.user_id = s.user_id
            WHERE s.client_id = ?
        """, client_id)
        row = cursor.fetchone()
        if not row:
            return None
        profile = _format_user_profile(row, row.profile_json)
        return {
            "profile": profile,
            "customQuestions": json.loads(row.custom_questions_json or "[]"),
            "leaderboard": json.loads(row.leaderboard_json or "[]"),
        }


def save_client_state(client_id, payload):
    """Lưu dữ liệu cho client vãng lai không có tài khoản (tương thích ngược)."""
    client_id = _validate_client_id(client_id)
    profile = payload.get("profile")
    custom_questions = payload.get("customQuestions", [])
    leaderboard = payload.get("leaderboard", [])
    if not isinstance(profile, dict):
        raise ValueError("Hồ sơ học tập không hợp lệ.")
    if not isinstance(custom_questions, list) or not isinstance(leaderboard, list):
        raise ValueError("Danh sách câu hỏi hoặc bảng xếp hạng không hợp lệ.")

    name = str(profile.get("name") or "Chiến Binh Toán 9")[:100]
    avatar = str(profile.get("avatar") or "🐱")[:20]
    numeric_fields = {
        "level": max(1, min(int(profile.get("level", 1)), 10000)),
        "exp": max(0, min(int(profile.get("exp", 0)), 2147483647)),
        "expToNextLevel": max(1, min(int(profile.get("expToNextLevel", 100)), 2147483647)),
        "diamonds": max(0, min(int(profile.get("diamonds", 50)), 2147483647)),
        "streak": max(0, min(int(profile.get("streak", 0)), 2147483647)),
        "maxStreak": max(0, min(int(profile.get("maxStreak", 0)), 2147483647)),
        "highestFloor": max(1, min(int(profile.get("highestFloor", 1)), 2147483647)),
        "speedHighScore": max(0, min(int(profile.get("speedHighScore", 0)), 2147483647)),
    }
    custom_json = json.dumps(custom_questions, ensure_ascii=False)
    profile_json = json.dumps(profile, ensure_ascii=False)
    leaderboard_json = json.dumps(leaderboard, ensure_ascii=False)
    if len(profile_json) > 500_000 or len(custom_json) > 2_000_000 or len(leaderboard_json) > 500_000:
        raise ValueError("Dữ liệu học tập vượt quá dung lượng cho phép.")

    username = "web_" + client_id.replace("-", "")
    with _connect() as connection:
        cursor = connection.cursor()
        _ensure_table(cursor)
        cursor.execute("SELECT user_id FROM dbo.Users WHERE username = ?", username)
        user = cursor.fetchone()
        if user:
            user_id = user.user_id
            cursor.execute("""
                UPDATE dbo.Users SET display_name = ?, avatar = ?, level = ?, exp = ?,
                    exp_to_next_level = ?, diamonds = ?, streak = ?, max_streak = ?,
                    highest_floor = ?, speed_high_score = ?, last_active_date = CONVERT(date, GETDATE())
                WHERE user_id = ?
            """, name, avatar, numeric_fields["level"], numeric_fields["exp"],
                 numeric_fields["expToNextLevel"], numeric_fields["diamonds"],
                 numeric_fields["streak"], numeric_fields["maxStreak"],
                 numeric_fields["highestFloor"], numeric_fields["speedHighScore"], user_id)
        else:
            cursor.execute("""
                INSERT INTO dbo.Users
                    (username, display_name, avatar, user_role, level, exp,
                     exp_to_next_level, diamonds, streak, max_streak, highest_floor,
                     speed_high_score, last_active_date)
                OUTPUT INSERTED.user_id
                VALUES (?, ?, ?, N'student', ?, ?, ?, ?, ?, ?, ?, ?, CONVERT(date, GETDATE()))
            """, username, name, avatar, numeric_fields["level"], numeric_fields["exp"],
                 numeric_fields["expToNextLevel"], numeric_fields["diamonds"],
                 numeric_fields["streak"], numeric_fields["maxStreak"],
                 numeric_fields["highestFloor"], numeric_fields["speedHighScore"])
            user_id = cursor.fetchone().user_id
        cursor.execute("""
            UPDATE dbo.Web_Client_State
            SET profile_json = ?, custom_questions_json = ?, leaderboard_json = ?, updated_at = SYSUTCDATETIME()
            WHERE client_id = ?
        """, profile_json, custom_json, leaderboard_json, client_id)
        if cursor.rowcount == 0:
            cursor.execute("""
                INSERT INTO dbo.Web_Client_State
                    (client_id, user_id, profile_json, custom_questions_json, leaderboard_json)
                VALUES (?, ?, ?, ?, ?)
            """, client_id, user_id, profile_json, custom_json, leaderboard_json)
        connection.commit()


def get_database_status():
    """Lấy trạng thái kết nối và số lượng bản ghi của tất cả các bảng trong Toan9_DB."""
    with _connect() as conn:
        cursor = conn.cursor()
        _ensure_table(cursor)
        tables_to_check = [
            "Topics", "Questions", "Exams", "Exam_Questions",
            "Tower_Floors", "Tower_Floor_Questions", "Achievements",
            "Avatars", "Formulas", "Users", "User_Sessions", "Web_Client_State"
        ]
        stats = {}
        for t in tables_to_check:
            try:
                cursor.execute(f"SELECT COUNT(*) FROM dbo.[{t}]")
                stats[t] = cursor.fetchone()[0]
            except Exception:
                stats[t] = 0

        # Thống kê câu hỏi trắc nghiệm & điền số
        mc_count = 0
        num_count = 0
        try:
            cursor.execute("SELECT COUNT(*) FROM dbo.Questions WHERE question_type = 'multiple_choice'")
            mc_count = cursor.fetchone()[0]
            cursor.execute("SELECT COUNT(*) FROM dbo.Questions WHERE question_type = 'numeric_input'")
            num_count = cursor.fetchone()[0]
        except Exception:
            pass

        return {
            "connected": True,
            "server": os.environ.get("SQL_SERVER", r"localhost\MSSQLSERVER01"),
            "database": os.environ.get("SQL_DATABASE", "Toan9_DB"),
            "driver": os.environ.get("SQL_DRIVER", "ODBC Driver 18 for SQL Server"),
            "tables": stats,
            "multipleChoiceCount": mc_count,
            "numericInputCount": num_count,
            "totalQuestions": stats.get("Questions", 0),
            "totalTopics": stats.get("Topics", 0),
            "totalUsers": stats.get("Users", 0),
        }


def get_table_rows(table_name: str, limit: int = 50):
    """Lấy dữ liệu hiển thị của bảng trong CSDL (có whitelist an toàn)."""
    allowed_tables = {
        "topics": "Topics",
        "questions": "Questions",
        "exams": "Exams",
        "tower_floors": "Tower_Floors",
        "achievements": "Achievements",
        "avatars": "Avatars",
        "formulas": "Formulas",
        "users": "Users",
        "web_client_state": "Web_Client_State"
    }
    key = (table_name or "").lower().strip()
    if key not in allowed_tables:
        raise ValueError(f"Bảng '{table_name}' không hợp lệ hoặc không được phép truy vấn.")

    real_table = allowed_tables[key]
    limit = max(1, min(int(limit), 200))

    with _connect() as conn:
        cursor = conn.cursor()
        cursor.execute(f"SELECT TOP (?) * FROM dbo.[{real_table}]", limit)
        columns = [column[0] for column in cursor.description]
        rows = []
        for row in cursor.fetchall():
            row_dict = {}
            for col_name, val in zip(columns, row):
                if col_name == "password_hash":
                    row_dict[col_name] = "****** [Bảo mật PBKDF2]"
                elif hasattr(val, "isoformat"):
                    row_dict[col_name] = val.isoformat()
                elif isinstance(val, (bytes, bytearray)):
                    row_dict[col_name] = val.hex()
                elif hasattr(val, "__str__"):
                    row_dict[col_name] = str(val)
                else:
                    row_dict[col_name] = val
            rows.append(row_dict)

        return {
            "table": real_table,
            "columns": columns,
            "totalReturned": len(rows),
            "rows": rows
        }


def sync_all_data_to_database():
    """Đồng bộ toàn bộ Chuyên đề, Ngân hàng câu hỏi, Đề thi, Tầng tháp vào SQL Server Toan9_DB."""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_js_path = os.path.join(base_dir, "js", "data.js")
    adv_js_path = os.path.join(base_dir, "js", "advanced_data.js")

    def _extract_js_var(filepath, varname):
        if not os.path.isfile(filepath):
            return []
        with open(filepath, "r", encoding="utf-8") as f:
            txt = f.read()
        m = re.search(r"const\s+" + varname + r"\s*=\s*(\[.*?\]);", txt, re.DOTALL)
        if m:
            try:
                return json.loads(m.group(1))
            except Exception:
                pass
        return []

    topics = _extract_js_var(data_js_path, "TOPICS")
    adv_topics = _extract_js_var(adv_js_path, "ADVANCED_TOPICS")
    questions = _extract_js_var(data_js_path, "QUESTIONS")
    adv_questions = _extract_js_var(adv_js_path, "ADVANCED_FILL_QUESTIONS")

    synced_topics = 0
    synced_questions = 0

    with _connect() as connection:
        cursor = connection.cursor()
        _ensure_table(cursor)

        # 1. Đồng bộ Topics cơ bản
        for i, t in enumerate(topics):
            cursor.execute("""
                MERGE dbo.Topics AS target
                USING (SELECT ? AS topic_id) AS src ON target.topic_id = src.topic_id
                WHEN MATCHED THEN
                    UPDATE SET topic_name = ?, category = ?, badge = ?, icon = ?, color = ?, border_color = ?, description = ?, is_advanced = 0, order_index = ?
                WHEN NOT MATCHED THEN
                    INSERT (topic_id, topic_name, category, badge, icon, color, border_color, description, is_advanced, order_index)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?);
            """, t["id"], t["name"], t.get("badge", "Đại số 9"), t.get("badge"), t.get("icon", "📐"), t.get("color"), t.get("borderColor"), t.get("description"), i + 1,
                 t["id"], t["name"], t.get("badge", "Đại số 9"), t.get("badge"), t.get("icon", "📐"), t.get("color"), t.get("borderColor"), t.get("description"), i + 1)
            synced_topics += 1

        # 2. Đồng bộ Topics nâng cao
        for j, t in enumerate(adv_topics):
            cursor.execute("""
                MERGE dbo.Topics AS target
                USING (SELECT ? AS topic_id) AS src ON target.topic_id = src.topic_id
                WHEN MATCHED THEN
                    UPDATE SET topic_name = ?, category = N'Nâng cao SBT', badge = ?, icon = ?, color = ?, border_color = ?, description = ?, is_advanced = 1, order_index = ?
                WHEN NOT MATCHED THEN
                    INSERT (topic_id, topic_name, category, badge, icon, color, border_color, description, is_advanced, order_index)
                    VALUES (?, ?, N'Nâng cao SBT', ?, ?, ?, ?, ?, 1, ?);
            """, t["id"], t["name"], t.get("badge"), t.get("icon", "⚡"), t.get("color"), t.get("borderColor"), t.get("description"), 100 + j + 1,
                 t["id"], t["name"], t.get("badge"), t.get("icon", "⚡"), t.get("color"), t.get("borderColor"), t.get("description"), 100 + j + 1)
            synced_topics += 1

        # 3. Đồng bộ Câu hỏi trắc nghiệm
        for q in questions:
            opts = q.get("options", [])
            opt_a = opts[0] if len(opts) > 0 else None
            opt_b = opts[1] if len(opts) > 1 else None
            opt_c = opts[2] if len(opts) > 2 else None
            opt_d = opts[3] if len(opts) > 3 else None
            corr = ["A", "B", "C", "D"][q.get("correctAnswer", 0)] if isinstance(q.get("correctAnswer"), int) else str(q.get("correctAnswer", "A"))
            diff = "co_ban"
            if q.get("difficulty") == "medium":
                diff = "thong_hieu"
            elif q.get("difficulty") == "hard":
                diff = "van_dung"

            cursor.execute("""
                MERGE dbo.Questions AS target
                USING (SELECT ? AS question_id) AS src ON target.question_id = src.question_id
                WHEN MATCHED THEN
                    UPDATE SET topic_id = ?, question_type = N'multiple_choice', content = ?, option_a = ?, option_b = ?, option_c = ?, option_d = ?, correct_answer = ?, explanation = ?, difficulty = ?
                WHEN NOT MATCHED THEN
                    INSERT (question_id, topic_id, question_type, content, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty)
                    VALUES (?, ?, N'multiple_choice', ?, ?, ?, ?, ?, ?, ?, ?);
            """, q["id"], q["topicId"], q["content"], opt_a, opt_b, opt_c, opt_d, corr, q.get("explanation", ""), diff,
                 q["id"], q["topicId"], q["content"], opt_a, opt_b, opt_c, opt_d, corr, q.get("explanation", ""), diff)
            synced_questions += 1

        # 4. Đồng bộ Câu hỏi điền số nâng cao
        for q in adv_questions:
            cursor.execute("""
                MERGE dbo.Questions AS target
                USING (SELECT ? AS question_id) AS src ON target.question_id = src.question_id
                WHEN MATCHED THEN
                    UPDATE SET topic_id = ?, question_type = N'numeric_input', content = ?, option_a = NULL, option_b = NULL, option_c = NULL, option_d = NULL, correct_answer = ?, explanation = ?, difficulty = N'nang_cao'
                WHEN NOT MATCHED THEN
                    INSERT (question_id, topic_id, question_type, content, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty)
                    VALUES (?, ?, N'numeric_input', ?, NULL, NULL, NULL, NULL, ?, ?, N'nang_cao');
            """, q["id"], q["topicId"], q["content"], str(q.get("correctAnswer", "")), q.get("explanation", ""),
                 q["id"], q["topicId"], q["content"], str(q.get("correctAnswer", "")), q.get("explanation", ""))
            synced_questions += 1

        # 5. Đồng bộ Tower Floors
        floors = [
            (1, "Tầng 1: Đồng Cỏ Khởi Nguyên", "Slime Tính Nhẩm", "🟢", 100, "Tính nhẩm & Căn số học cơ bản", "Ngươi muốn leo tháp ư? Hãy vượt qua phép thử tính nhanh của ta trước đã!", 50, 10),
            (2, "Tầng 2: Rừng Căn Thức Bí Ẩn", "Yêu Tinh Căn Bậc Hai", "🧌", 150, "Hằng đẳng thức & Rút gọn căn thức", "Căn thức của ta có hai lớp bảo vệ! Ngươi có biết giải trị tuyệt đối không?", 80, 15),
            (3, "Tầng 3: Mê Cung Ẩn Số", "Phù Thủy Hệ Phương Trình", "🧙‍♂️", 200, "Giải hệ hai phương trình bậc nhất", "Phương pháp thế hay cộng đại số? Liệu ngươi có tìm ra x và y?", 110, 20),
            (4, "Tầng 4: Hẻm Núi Bất Đẳng Thức", "Gốc Cây Cổ Thụ AM-GM", "🌲", 250, "Bất phương trình & BĐT Cauchy", "Bất đẳng thức của ta vững như bàn thạch! Điểm rơi nằm ở đâu?", 150, 25),
            (5, "Tầng 5: Kim Tự Tháp Lượng Giác", "Bọ Cạp Hệ Thức Lượng", "🦂", 300, "Hệ thức lượng trong tam giác vuông", "Ngươi có nhìn thấy góc nâng và đường cao của tam giác vuông không?", 200, 30),
            (6, "Tầng 6: Pháo Đài Tiếp Tuyến", "Hiệp Sĩ Đường Tròn", "🛡️", 350, "Đường tròn & Hai tiếp tuyến cắt nhau", "Dây cung và bán kính của ta bất khả xâm phạm!", 260, 35),
            (7, "Tầng 7: Vực Thẳm Parabol", "Quái Điểu Hàm Số Bậc Hai", "🦅", 400, "Hàm số y = ax^2 & Tương giao đồ thị", "Đồ thị uốn lượn như cánh chim! Tìm hoành độ giao điểm đi!", 330, 40),
            (8, "Tầng 8: Hang Động Vi-ét Huyền Bí", "Thạch Nhũ Đối Xứng", "💎", 450, "Định lý Vi-ét & Ứng dụng", "Tổng S và Tích P là chìa khóa mở cánh cửa này!", 420, 45),
            (9, "Tầng 9: Đảo Tứ Giác Nội Tiếp", "Hải Long Vương Cung Tròn", "🐉", 500, "Góc với đường tròn & Tứ giác nội tiếp", "Bốn đỉnh cùng nằm trên một đường tròn! Hãy tìm góc bù 180 độ!", 520, 50),
            (10, "Tầng 10: ĐỈNH THÁP HUYỀN THOẠI", "Chiến Thần Toán Học Lớp 10", "👑", 650, "Đề thi tổng hợp Tuyển Sinh Vào 10", "Ngươi đã đi đến đích! Hãy chứng minh ngươi xứng đáng đỗ Thủ Khoa!", 1000, 100)
        ]
        for f in floors:
            cursor.execute("""
                MERGE dbo.Tower_Floors AS target
                USING (SELECT ? AS floor_number) AS src ON target.floor_number = src.floor_number
                WHEN MATCHED THEN
                    UPDATE SET name = ?, boss_name = ?, boss_avatar = ?, boss_hp = ?, topic = ?, dialogue = ?, reward_exp = ?, reward_diamonds = ?
                WHEN NOT MATCHED THEN
                    INSERT (floor_number, name, boss_name, boss_avatar, boss_hp, topic, dialogue, reward_exp, reward_diamonds)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
            """, f[0], f[1], f[2], f[3], f[4], f[5], f[6], f[7], f[8],
                 f[0], f[1], f[2], f[3], f[4], f[5], f[6], f[7], f[8])

        # 6. Đồng bộ Đề thi
        cursor.execute("""
            MERGE dbo.Exams AS target
            USING (SELECT 'de_hk1_nghian_2025' AS exam_id) AS src ON target.exam_id = src.exam_id
            WHEN MATCHED THEN
                UPDATE SET title = N'Đề Kiểm Tra Học Kỳ 1 Toán 9 (2025 - 2026)', source = N'Trường THCS Nghĩa An - Nghệ An', duration_minutes = 90, total_questions = 15
            WHEN NOT MATCHED THEN
                INSERT (exam_id, title, source, duration_minutes, total_questions)
                VALUES ('de_hk1_nghian_2025', N'Đề Kiểm Tra Học Kỳ 1 Toán 9 (2025 - 2026)', N'Trường THCS Nghĩa An - Nghệ An', 90, 15);
        """)

        # 7. Đồng bộ Thành tựu & Avatars
        achievements = [
            ("first_win", "Phát Súng Đầu Tiên", "Trả lời đúng câu hỏi đầu tiên", "🎯", 20),
            ("combo_5", "Chuỗi Cao Thủ", "Đạt chuỗi 5 câu đúng liên tiếp", "⚡", 50),
            ("combo_10", "Thánh Tính Nhẩm", "Đạt chuỗi 10 câu đúng liên tiếp", "🔥", 120),
            ("floor_3", "Người Leo Tháp", "Vượt qua Tầng 3 Tháp Tri Thức", "🧗", 100),
            ("floor_7", "Chiến Binh Đại Số", "Vượt qua Tầng 7 Tháp Tri Thức", "⚔️", 200),
            ("tower_master", "Chúa Tể Tháp Toán 9", "Vượt qua toàn bộ 10 tầng tháp", "👑", 500),
            ("speed_master", "Tia Chớp 60 Giây", "Đạt trên 150 điểm trong Thử Thách Tốc Độ", "⏱️", 150),
            ("exam_passed", "Sĩ Tử Xuất Sắc", "Hoàn thành bài thi thử đạt trên 8 điểm", "📜", 200),
            ("pvp_winner", "Vua Đấu Trường 1v1", "Chiến thắng 1 trận đấu Song Đấu 1v1", "🏆", 100)
        ]
        for a in achievements:
            cursor.execute("""
                MERGE dbo.Achievements AS target
                USING (SELECT ? AS achievement_id) AS src ON target.achievement_id = src.achievement_id
                WHEN MATCHED THEN
                    UPDATE SET title = ?, description = ?, icon = ?, reward_diamonds = ?
                WHEN NOT MATCHED THEN
                    INSERT (achievement_id, title, description, icon, reward_diamonds)
                    VALUES (?, ?, ?, ?, ?);
            """, a[0], a[1], a[2], a[3], a[4], a[0], a[1], a[2], a[3], a[4])

        connection.commit()

    return {
        "success": True,
        "syncedTopics": synced_topics,
        "syncedQuestions": synced_questions,
        "message": f"Đã đồng bộ thành công {synced_topics} chuyên đề và {synced_questions} câu hỏi vào CSDL Toan9_DB!"
    }


def get_documents_metadata():
    """Quét và trả về danh mục toàn bộ tài liệu học tập trong các thư mục dự án."""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    documents = []

    def categorize_doc(rel_path, filename):
        lower = (rel_path + "/" + filename).lower()
        if "sach-bai-tap" in lower or "sach-giao-khoa" in lower or "toán cơ bản lớp 8" in lower:
            return "sgk_sbt", "Sách Giáo Khoa & SBT", "📚"
        elif "de-tuyen-sinh" in lower or "đề tuyển sinh" in lower or "đề học kỳ" in lower or "de-kiem-tra" in lower or "ma_de" in lower:
            return "de_thi", "Đề Thi & Kiểm Tra", "📜"
        elif "cong-thuc" in lower or "12 chuyên đề" in lower or "viete" in lower or "vi-ét" in lower:
            return "cong_thuc", "Sổ Tay & Nâng Cao", "📐"
        else:
            return "chuyen_de", "Chuyên Đề & Đáp Án", "📑"

    for root, dirs, files in os.walk(base_dir):
        dirs[:] = [d for d in dirs if not d.startswith('.') and d not in ('__pycache__', 'tools', 'css', 'js', '.vscode', '.git')]
        for f in sorted(files):
            if f.lower().endswith(('.pdf', '.docx', '.doc')):
                full_path = os.path.join(root, f)
                rel_path = os.path.relpath(full_path, base_dir)
                url_path = "/" + urllib.parse.quote(rel_path.replace("\\", "/"))
                size_bytes = os.path.getsize(full_path)

                if size_bytes >= 1024 * 1024:
                    size_fmt = f"{size_bytes / (1024 * 1024):.1f} MB"
                else:
                    size_fmt = f"{size_bytes / 1024:.0f} KB"

                cat_id, cat_name, cat_icon = categorize_doc(rel_path, f)
                ext = "pdf" if f.lower().endswith(".pdf") else ("docx" if f.lower().endswith(".docx") else "doc")

                clean_title = f
                for ext_str in [".pdf", ".docx", ".doc"]:
                    if clean_title.lower().endswith(ext_str):
                        clean_title = clean_title[:-len(ext_str)]
                clean_title = clean_title.replace("-", " ").strip()

                documents.append({
                    "id": f"doc_{len(documents) + 1}",
                    "title": clean_title,
                    "filename": f,
                    "relativePath": rel_path.replace("\\", "/"),
                    "url": url_path,
                    "category": cat_id,
                    "categoryName": cat_name,
                    "categoryIcon": cat_icon,
                    "extension": ext,
                    "sizeBytes": size_bytes,
                    "sizeFormatted": size_fmt,
                    "folder": os.path.basename(os.path.dirname(full_path)) or "Thư mục gốc"
                })

    return documents

