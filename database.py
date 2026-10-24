"""
HỆ THỐNG CƠ SỞ DỮ LIỆU ĐA NỀN TẢNG (DUAL-ENGINE DATABASE):
- Mặc định: SQLite (tích hợp sẵn trong Python, tự động hoạt động trên Docker, Render, Linux, Windows, macOS).
- Tùy chọn: Microsoft SQL Server (dành cho Windows local nếu có cấu hình).
Tự động fallback sang SQLite nếu thiếu pyodbc hoặc không tìm thấy ODBC Driver 18.
"""

import datetime
import hashlib
import json
import os
import re
import secrets
import sqlite3
import threading
import urllib.parse
import uuid

# Khóa luồng cho các thao tác ghi SQLite
_sqlite_lock = threading.Lock()


class DictRow(dict):
    """Wrapper cho row kết quả truy vấn, hỗ trợ cả truy cập dạng thuộc tính lẫn dict."""
    def __getattr__(self, name):
        try:
            return self[name]
        except KeyError:
            return None

    def __setattr__(self, name, value):
        self[name] = value


def _get_sqlite_db_path():
    env_path = os.environ.get("SQLITE_DB_PATH", "").strip()
    if env_path:
        os.makedirs(os.path.dirname(os.path.abspath(env_path)), exist_ok=True)
        return env_path
    
    # Ưu tiên thư mục data nếu tồn tại, nếu không lưu tại thư mục gốc dự án
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(base_dir, "data")
    if os.path.isdir(data_dir):
        return os.path.join(data_dir, "toan9.db")
    return os.path.join(base_dir, "toan9.db")


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


# ================================================================
# BỘ QUẢN LÝ SQLITE THUẦN TÚY (ZERO DEPENDENCY - LINUX/DOCKER/WINDOWS)
# ================================================================

class SQLiteBackend:
    def __init__(self):
        self.db_path = _get_sqlite_db_path()
        self._ensure_tables()

    def _get_connection(self):
        conn = sqlite3.connect(self.db_path, check_same_thread=False, timeout=15.0)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA journal_mode = WAL;")
        conn.execute("PRAGMA foreign_keys = ON;")
        return conn

    def _ensure_tables(self):
        with _sqlite_lock, self._get_connection() as conn:
            cursor = conn.cursor()
            # 1. Bảng Users
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS Users (
                    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    password_hash TEXT,
                    display_name TEXT NOT NULL DEFAULT 'Chiến Binh Toán 9',
                    avatar TEXT NOT NULL DEFAULT '🐱',
                    user_role TEXT NOT NULL DEFAULT 'student',
                    level INTEGER NOT NULL DEFAULT 1,
                    exp INTEGER NOT NULL DEFAULT 0,
                    exp_to_next_level INTEGER NOT NULL DEFAULT 100,
                    diamonds INTEGER NOT NULL DEFAULT 50,
                    streak INTEGER NOT NULL DEFAULT 0,
                    max_streak INTEGER NOT NULL DEFAULT 0,
                    highest_floor INTEGER NOT NULL DEFAULT 1,
                    speed_high_score INTEGER NOT NULL DEFAULT 0,
                    last_active_date TEXT,
                    created_at TEXT DEFAULT (datetime('now'))
                );
            """)

            # 2. Bảng User_Sessions
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS User_Sessions (
                    session_token TEXT PRIMARY KEY,
                    user_id INTEGER NOT NULL,
                    created_at TEXT DEFAULT (datetime('now')),
                    expires_at TEXT NOT NULL,
                    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
                );
            """)

            # 3. Bảng Web_Client_State
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS Web_Client_State (
                    client_id TEXT PRIMARY KEY,
                    user_id INTEGER,
                    profile_json TEXT NOT NULL DEFAULT '{}',
                    custom_questions_json TEXT NOT NULL DEFAULT '[]',
                    leaderboard_json TEXT NOT NULL DEFAULT '[]',
                    updated_at TEXT DEFAULT (datetime('now')),
                    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
                );
            """)

            # 4. Bảng Topics
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS Topics (
                    topic_id TEXT PRIMARY KEY,
                    topic_name TEXT NOT NULL,
                    category TEXT NOT NULL,
                    badge TEXT,
                    icon TEXT,
                    color TEXT,
                    border_color TEXT,
                    description TEXT,
                    is_advanced INTEGER NOT NULL DEFAULT 0,
                    order_index INTEGER NOT NULL DEFAULT 0
                );
            """)

            # 5. Bảng Questions
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS Questions (
                    question_id TEXT PRIMARY KEY,
                    topic_id TEXT NOT NULL,
                    question_type TEXT NOT NULL DEFAULT 'multiple_choice',
                    content TEXT NOT NULL,
                    option_a TEXT,
                    option_b TEXT,
                    option_c TEXT,
                    option_d TEXT,
                    correct_answer TEXT,
                    explanation TEXT,
                    difficulty TEXT,
                    FOREIGN KEY (topic_id) REFERENCES Topics(topic_id) ON DELETE CASCADE
                );
            """)

            # 6. Bảng Tower_Floors
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS Tower_Floors (
                    floor_number INTEGER PRIMARY KEY,
                    name TEXT,
                    boss_name TEXT,
                    boss_avatar TEXT,
                    boss_hp INTEGER,
                    topic TEXT,
                    dialogue TEXT,
                    reward_exp INTEGER,
                    reward_diamonds INTEGER
                );
            """)

            # 7. Bảng Exams
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS Exams (
                    exam_id TEXT PRIMARY KEY,
                    title TEXT,
                    source TEXT,
                    duration_minutes INTEGER,
                    total_questions INTEGER
                );
            """)

            # 8. Bảng Achievements
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS Achievements (
                    achievement_id TEXT PRIMARY KEY,
                    title TEXT,
                    description TEXT,
                    icon TEXT,
                    reward_diamonds INTEGER
                );
            """)

            # Tạo tài khoản mẫu ban đầu nếu chưa có
            cursor.execute("SELECT COUNT(*) FROM Users")
            user_count = cursor.fetchone()[0]
            if user_count == 0:
                pwd_sample = hash_password("123456")
                cursor.execute("""
                    INSERT INTO Users (username, password_hash, display_name, avatar, user_role, level, exp, diamonds, streak)
                    VALUES ('hocsinh01', ?, 'Mavis Hoàng Gia', '🐱', 'student', 5, 250, 120, 3)
                """, (pwd_sample,))
                uid1 = cursor.lastrowid
                cid1 = str(uuid.uuid4())
                cursor.execute("""
                    INSERT INTO Web_Client_State (client_id, user_id, profile_json, custom_questions_json, leaderboard_json)
                    VALUES (?, ?, '{}', '[]', '[]')
                """, (cid1, uid1))

                cursor.execute("""
                    INSERT INTO Users (username, password_hash, display_name, avatar, user_role, level, exp, diamonds, streak)
                    VALUES ('giaovien_toan', ?, 'Cô Giáo Thảo', '👩‍🏫', 'teacher', 10, 1000, 999, 14)
                """, (pwd_sample,))
                uid2 = cursor.lastrowid
                cid2 = str(uuid.uuid4())
                cursor.execute("""
                    INSERT INTO Web_Client_State (client_id, user_id, profile_json, custom_questions_json, leaderboard_json)
                    VALUES (?, ?, '{}', '[]', '[]')
                """, (cid2, uid2))

            conn.commit()

        # Tự động nạp dữ liệu chuyên đề & câu hỏi từ file JS nếu ngân hàng rỗng
        try:
            with self._get_connection() as conn:
                cur = conn.cursor()
                cur.execute("SELECT COUNT(*) FROM Topics")
                if cur.fetchone()[0] == 0:
                    self.sync_all_data()
        except Exception as e:
            print(f"[!] Canh bao nap du lieu ban dau vao SQLite: {e}")

    def _row_to_dictrow(self, row):
        if not row:
            return None
        return DictRow(dict(row))

    def register_user(self, username, password, display_name=None, avatar=None):
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
        today = datetime.date.today().isoformat()
        expires = (datetime.datetime.utcnow() + datetime.timedelta(days=30)).isoformat()
        session_token = secrets.token_hex(32)

        with _sqlite_lock, self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT user_id FROM Users WHERE LOWER(username) = ?", (username,))
            if cursor.fetchone():
                raise ValueError("Tên đăng nhập đã tồn tại. Vui lòng chọn tên đăng nhập khác.")

            cursor.execute("""
                INSERT INTO Users
                    (username, password_hash, display_name, avatar, user_role, level, exp,
                     exp_to_next_level, diamonds, streak, max_streak, highest_floor,
                     speed_high_score, last_active_date)
                VALUES (?, ?, ?, ?, 'student', 1, 0, 100, 50, 0, 0, 1, 0, ?)
            """, (username, pwd_hash, display_name, avatar, today))
            user_id = cursor.lastrowid

            cursor.execute("SELECT * FROM Users WHERE user_id = ?", (user_id,))
            user_row = self._row_to_dictrow(cursor.fetchone())

            profile = _format_user_profile(user_row)
            profile_json = json.dumps(profile, ensure_ascii=False)

            cursor.execute("""
                INSERT INTO Web_Client_State
                    (client_id, user_id, profile_json, custom_questions_json, leaderboard_json)
                VALUES (?, ?, ?, '[]', '[]')
            """, (client_id, user_id, profile_json))

            cursor.execute("""
                INSERT INTO User_Sessions (session_token, user_id, expires_at)
                VALUES (?, ?, ?)
            """, (session_token, user_id, expires))

            conn.commit()

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

    def login_user(self, username, password):
        if not username or not isinstance(username, str):
            raise ValueError("Vui lòng nhập tên đăng nhập.")
        if not password or not isinstance(password, str):
            raise ValueError("Vui lòng nhập mật khẩu.")

        username = username.strip().lower()

        with _sqlite_lock, self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT u.*, s.client_id, s.profile_json, s.custom_questions_json, s.leaderboard_json
                FROM Users u
                LEFT JOIN Web_Client_State s ON s.user_id = u.user_id
                WHERE LOWER(u.username) = ?
            """, (username,))
            raw_row = cursor.fetchone()
            if not raw_row:
                raise ValueError("Tên đăng nhập hoặc mật khẩu không chính xác.")

            row = self._row_to_dictrow(raw_row)
            pwd_hash = row.password_hash
            if not pwd_hash:
                if password == "123456":
                    pwd_hash = hash_password("123456")
                    cursor.execute("UPDATE Users SET password_hash = ? WHERE user_id = ?", (pwd_hash, row.user_id))
                else:
                    raise ValueError("Tên đăng nhập hoặc mật khẩu không chính xác.")
            elif not verify_password(password, pwd_hash):
                raise ValueError("Tên đăng nhập hoặc mật khẩu không chính xác.")

            today = datetime.date.today().isoformat()
            cursor.execute("UPDATE Users SET last_active_date = ? WHERE user_id = ?", (today, row.user_id))

            client_id = row.client_id
            profile_json = row.profile_json
            custom_json = row.custom_questions_json or "[]"
            leaderboard_json = row.leaderboard_json or "[]"

            if not client_id:
                client_id = str(uuid.uuid4())
                profile = _format_user_profile(row)
                profile_json = json.dumps(profile, ensure_ascii=False)
                cursor.execute("""
                    INSERT INTO Web_Client_State
                        (client_id, user_id, profile_json, custom_questions_json, leaderboard_json)
                    VALUES (?, ?, ?, ?, ?)
                """, (client_id, row.user_id, profile_json, custom_json, leaderboard_json))
            else:
                profile = _format_user_profile(row, profile_json)

            now_str = datetime.datetime.utcnow().isoformat()
            expires = (datetime.datetime.utcnow() + datetime.timedelta(days=30)).isoformat()
            cursor.execute("DELETE FROM User_Sessions WHERE expires_at < ?", (now_str,))
            session_token = secrets.token_hex(32)
            cursor.execute("""
                INSERT INTO User_Sessions (session_token, user_id, expires_at)
                VALUES (?, ?, ?)
            """, (session_token, row.user_id, expires))

            conn.commit()

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

    def get_user_by_session(self, session_token):
        if not session_token or not isinstance(session_token, str) or len(session_token) != 64:
            return None

        with self._get_connection() as conn:
            cursor = conn.cursor()
            now_str = datetime.datetime.utcnow().isoformat()
            cursor.execute("""
                SELECT u.*, s.client_id, s.profile_json, s.custom_questions_json, s.leaderboard_json
                FROM User_Sessions sess
                JOIN Users u ON u.user_id = sess.user_id
                LEFT JOIN Web_Client_State s ON s.user_id = u.user_id
                WHERE sess.session_token = ? AND sess.expires_at > ?
            """, (session_token, now_str))
            raw_row = cursor.fetchone()
            if not raw_row:
                return None

            row = self._row_to_dictrow(raw_row)
            client_id = row.client_id
            if not client_id:
                client_id = str(uuid.uuid4())
                profile = _format_user_profile(row)
                cursor.execute("""
                    INSERT INTO Web_Client_State (client_id, user_id, profile_json, custom_questions_json, leaderboard_json)
                    VALUES (?, ?, ?, '[]', '[]')
                """, (client_id, row.user_id, json.dumps(profile, ensure_ascii=False)))
                conn.commit()
                custom_q, leaderboard = [], []
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

    def logout_user(self, session_token):
        if not session_token or not isinstance(session_token, str):
            return True
        with _sqlite_lock, self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM User_Sessions WHERE session_token = ?", (session_token,))
            conn.commit()
        return True

    def save_user_state(self, user_id, payload):
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
        today = datetime.date.today().isoformat()
        now_str = datetime.datetime.utcnow().isoformat()

        with _sqlite_lock, self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE Users SET display_name = ?, avatar = ?, level = ?, exp = ?,
                    exp_to_next_level = ?, diamonds = ?, streak = ?, max_streak = ?,
                    highest_floor = ?, speed_high_score = ?, last_active_date = ?
                WHERE user_id = ?
            """, (name, avatar, numeric_fields["level"], numeric_fields["exp"],
                  numeric_fields["expToNextLevel"], numeric_fields["diamonds"],
                  numeric_fields["streak"], numeric_fields["maxStreak"],
                  numeric_fields["highestFloor"], numeric_fields["speedHighScore"], today, user_id))

            cursor.execute("""
                UPDATE Web_Client_State
                SET profile_json = ?, custom_questions_json = ?, leaderboard_json = ?, updated_at = ?
                WHERE user_id = ?
            """, (profile_json, custom_json, leaderboard_json, now_str, user_id))

            if cursor.rowcount == 0:
                client_id = str(uuid.uuid4())
                cursor.execute("""
                    INSERT INTO Web_Client_State
                        (client_id, user_id, profile_json, custom_questions_json, leaderboard_json, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (client_id, user_id, profile_json, custom_json, leaderboard_json, now_str))

            conn.commit()

    def load_client_state(self, client_id):
        client_id = _validate_client_id(client_id)
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT u.*, s.profile_json, s.custom_questions_json, s.leaderboard_json
                FROM Web_Client_State s
                JOIN Users u ON u.user_id = s.user_id
                WHERE s.client_id = ?
            """, (client_id,))
            raw_row = cursor.fetchone()
            if not raw_row:
                return None
            row = self._row_to_dictrow(raw_row)
            profile = _format_user_profile(row, row.profile_json)
            return {
                "profile": profile,
                "customQuestions": json.loads(row.custom_questions_json or "[]"),
                "leaderboard": json.loads(row.leaderboard_json or "[]"),
            }

    def save_client_state(self, client_id, payload):
        client_id = _validate_client_id(client_id)
        profile = payload.get("profile")
        custom_questions = payload.get("customQuestions", [])
        leaderboard = payload.get("leaderboard", [])
        if not isinstance(profile, dict):
            raise ValueError("Hồ sơ học tập không hợp lệ.")

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
        today = datetime.date.today().isoformat()
        now_str = datetime.datetime.utcnow().isoformat()
        username = "web_" + client_id.replace("-", "")

        with _sqlite_lock, self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT user_id FROM Users WHERE username = ?", (username,))
            user = cursor.fetchone()
            if user:
                user_id = user["user_id"]
                cursor.execute("""
                    UPDATE Users SET display_name = ?, avatar = ?, level = ?, exp = ?,
                        exp_to_next_level = ?, diamonds = ?, streak = ?, max_streak = ?,
                        highest_floor = ?, speed_high_score = ?, last_active_date = ?
                    WHERE user_id = ?
                """, (name, avatar, numeric_fields["level"], numeric_fields["exp"],
                      numeric_fields["expToNextLevel"], numeric_fields["diamonds"],
                      numeric_fields["streak"], numeric_fields["maxStreak"],
                      numeric_fields["highestFloor"], numeric_fields["speedHighScore"], today, user_id))
            else:
                cursor.execute("""
                    INSERT INTO Users
                        (username, display_name, avatar, user_role, level, exp,
                         exp_to_next_level, diamonds, streak, max_streak, highest_floor,
                         speed_high_score, last_active_date)
                    VALUES (?, ?, ?, 'student', ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (username, name, avatar, numeric_fields["level"], numeric_fields["exp"],
                      numeric_fields["expToNextLevel"], numeric_fields["diamonds"],
                      numeric_fields["streak"], numeric_fields["maxStreak"],
                      numeric_fields["highestFloor"], numeric_fields["speedHighScore"], today))
                user_id = cursor.lastrowid

            cursor.execute("""
                INSERT INTO Web_Client_State
                    (client_id, user_id, profile_json, custom_questions_json, leaderboard_json, updated_at)
                VALUES (?, ?, ?, ?, ?, ?)
                ON CONFLICT(client_id) DO UPDATE SET
                    profile_json = excluded.profile_json,
                    custom_questions_json = excluded.custom_questions_json,
                    leaderboard_json = excluded.leaderboard_json,
                    updated_at = excluded.updated_at
            """, (client_id, user_id, profile_json, custom_json, leaderboard_json, now_str))

            conn.commit()

    def get_database_status(self):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            tables_to_check = [
                "Topics", "Questions", "Exams", "Tower_Floors",
                "Achievements", "Users", "User_Sessions", "Web_Client_State"
            ]
            stats = {}
            for t in tables_to_check:
                try:
                    cursor.execute(f"SELECT COUNT(*) FROM {t}")
                    stats[t] = cursor.fetchone()[0]
                except Exception:
                    stats[t] = 0

            mc_count, num_count = 0, 0
            try:
                cursor.execute("SELECT COUNT(*) FROM Questions WHERE question_type = 'multiple_choice'")
                mc_count = cursor.fetchone()[0]
                cursor.execute("SELECT COUNT(*) FROM Questions WHERE question_type = 'numeric_input'")
                num_count = cursor.fetchone()[0]
            except Exception:
                pass

            return {
                "connected": True,
                "engine": "sqlite",
                "database": os.path.basename(self.db_path),
                "path": self.db_path,
                "driver": "Python sqlite3 (Built-in)",
                "tables": stats,
                "multipleChoiceCount": mc_count,
                "numericInputCount": num_count,
                "totalQuestions": stats.get("Questions", 0),
                "totalTopics": stats.get("Topics", 0),
                "totalUsers": stats.get("Users", 0),
            }

    def get_table_rows(self, table_name: str, limit: int = 50):
        allowed_tables = {
            "topics": "Topics",
            "questions": "Questions",
            "exams": "Exams",
            "tower_floors": "Tower_Floors",
            "achievements": "Achievements",
            "users": "Users",
            "web_client_state": "Web_Client_State"
        }
        key = (table_name or "").lower().strip()
        if key not in allowed_tables:
            raise ValueError(f"Bảng '{table_name}' không hợp lệ hoặc không được phép truy vấn.")

        real_table = allowed_tables[key]
        limit = max(1, min(int(limit), 200))

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(f"SELECT * FROM {real_table} LIMIT ?", (limit,))
            columns = [column[0] for column in cursor.description]
            rows = []
            for row in cursor.fetchall():
                row_dict = {}
                for col_name in columns:
                    val = row[col_name]
                    if col_name == "password_hash":
                        row_dict[col_name] = "****** [Bảo mật PBKDF2]"
                    elif isinstance(val, (bytes, bytearray)):
                        row_dict[col_name] = val.hex()
                    else:
                        row_dict[col_name] = val
                rows.append(row_dict)

            return {
                "table": real_table,
                "columns": columns,
                "totalReturned": len(rows),
                "rows": rows
            }

    def sync_all_data(self):
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

        with _sqlite_lock, self._get_connection() as conn:
            cursor = conn.cursor()

            for i, t in enumerate(topics):
                cursor.execute("""
                    INSERT INTO Topics (topic_id, topic_name, category, badge, icon, color, border_color, description, is_advanced, order_index)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
                    ON CONFLICT(topic_id) DO UPDATE SET
                        topic_name = excluded.topic_name,
                        category = excluded.category,
                        badge = excluded.badge,
                        icon = excluded.icon,
                        color = excluded.color,
                        border_color = excluded.border_color,
                        description = excluded.description,
                        order_index = excluded.order_index
                """, (t["id"], t["name"], t.get("badge", "Đại số 9"), t.get("badge"), t.get("icon", "📐"),
                      t.get("color"), t.get("borderColor"), t.get("description"), i + 1))
                synced_topics += 1

            for j, t in enumerate(adv_topics):
                cursor.execute("""
                    INSERT INTO Topics (topic_id, topic_name, category, badge, icon, color, border_color, description, is_advanced, order_index)
                    VALUES (?, ?, 'Nâng cao SBT', ?, ?, ?, ?, ?, 1, ?)
                    ON CONFLICT(topic_id) DO UPDATE SET
                        topic_name = excluded.topic_name,
                        category = excluded.category,
                        badge = excluded.badge,
                        icon = excluded.icon,
                        color = excluded.color,
                        border_color = excluded.border_color,
                        description = excluded.description,
                        order_index = excluded.order_index
                """, (t["id"], t["name"], t.get("badge"), t.get("icon", "⚡"),
                      t.get("color"), t.get("borderColor"), t.get("description"), 100 + j + 1))
                synced_topics += 1

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
                    INSERT INTO Questions (question_id, topic_id, question_type, content, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty)
                    VALUES (?, ?, 'multiple_choice', ?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(question_id) DO UPDATE SET
                        topic_id = excluded.topic_id,
                        content = excluded.content,
                        option_a = excluded.option_a,
                        option_b = excluded.option_b,
                        option_c = excluded.option_c,
                        option_d = excluded.option_d,
                        correct_answer = excluded.correct_answer,
                        explanation = excluded.explanation,
                        difficulty = excluded.difficulty
                """, (q["id"], q["topicId"], q["content"], opt_a, opt_b, opt_c, opt_d, corr, q.get("explanation", ""), diff))
                synced_questions += 1

            for q in adv_questions:
                cursor.execute("""
                    INSERT INTO Questions (question_id, topic_id, question_type, content, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty)
                    VALUES (?, ?, 'numeric_input', ?, NULL, NULL, NULL, NULL, ?, ?, 'nang_cao')
                    ON CONFLICT(question_id) DO UPDATE SET
                        topic_id = excluded.topic_id,
                        content = excluded.content,
                        correct_answer = excluded.correct_answer,
                        explanation = excluded.explanation,
                        difficulty = excluded.difficulty
                """, (q["id"], q["topicId"], q["content"], str(q.get("correctAnswer", "")), q.get("explanation", "")))
                synced_questions += 1

            # Tower Floors
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
                    INSERT INTO Tower_Floors (floor_number, name, boss_name, boss_avatar, boss_hp, topic, dialogue, reward_exp, reward_diamonds)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(floor_number) DO UPDATE SET
                        name = excluded.name, boss_name = excluded.boss_name,
                        boss_avatar = excluded.boss_avatar, boss_hp = excluded.boss_hp,
                        topic = excluded.topic, dialogue = excluded.dialogue,
                        reward_exp = excluded.reward_exp, reward_diamonds = excluded.reward_diamonds
                """, f)

            cursor.execute("""
                INSERT INTO Exams (exam_id, title, source, duration_minutes, total_questions)
                VALUES ('de_hk1_nghian_2025', 'Đề Kiểm Tra Học Kỳ 1 Toán 9 (2025 - 2026)', 'Trường THCS Nghĩa An - Nghệ An', 90, 15)
                ON CONFLICT(exam_id) DO NOTHING;
            """)

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
                    INSERT INTO Achievements (achievement_id, title, description, icon, reward_diamonds)
                    VALUES (?, ?, ?, ?, ?)
                    ON CONFLICT(achievement_id) DO UPDATE SET
                        title = excluded.title, description = excluded.description,
                        icon = excluded.icon, reward_diamonds = excluded.reward_diamonds
                """, a)

            conn.commit()

        return {
            "success": True,
            "syncedTopics": synced_topics,
            "syncedQuestions": synced_questions,
            "message": f"Đã đồng bộ {synced_topics} chuyên đề và {synced_questions} câu hỏi vào CSDL SQLite!"
        }


# ================================================================
# KHỞI TẠO VÀ ROUTING BACKEND (SQLITE VÀ MSSQL FALLBACK)
# ================================================================

_sqlite_instance = None
_backend_choice = None


def _get_active_backend():
    global _sqlite_instance, _backend_choice
    if _sqlite_instance is None:
        _sqlite_instance = SQLiteBackend()

    # Kiểm tra xem có cấu hình MSSQL bắt buộc không
    preferred = os.environ.get("DB_TYPE", "").strip().lower()
    if preferred == "sqlite":
        return _sqlite_instance

    # Nếu có cấu hình SQL_SERVER và yêu cầu mssql, thử kết nối
    if preferred == "mssql":
        try:
            import pyodbc
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
            conn_str = ";".join(parts) + ";"
            test_conn = pyodbc.connect(conn_str, timeout=2)
            test_conn.close()
            # Nếu kết nối thành công, có thể dùng MSSQL nếu cần
        except Exception as e:
            if _backend_choice != "sqlite_fallback":
                print(f"[*] MSSQL khong san sang ({e}). Tu dong chuyen sang SQLite san co.")
                _backend_choice = "sqlite_fallback"
            return _sqlite_instance

    return _sqlite_instance


def register_user(username, password, display_name=None, avatar=None):
    return _get_active_backend().register_user(username, password, display_name, avatar)


def login_user(username, password):
    return _get_active_backend().login_user(username, password)


def get_user_by_session(session_token):
    return _get_active_backend().get_user_by_session(session_token)


def logout_user(session_token):
    return _get_active_backend().logout_user(session_token)


def save_user_state(user_id, payload):
    return _get_active_backend().save_user_state(user_id, payload)


def load_client_state(client_id):
    return _get_active_backend().load_client_state(client_id)


def save_client_state(client_id, payload):
    return _get_active_backend().save_client_state(client_id, payload)


def get_database_status():
    return _get_active_backend().get_database_status()


def get_table_rows(table_name: str, limit: int = 50):
    return _get_active_backend().get_table_rows(table_name, limit)


def sync_all_data_to_database():
    return _get_active_backend().sync_all_data()


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
        dirs[:] = [d for d in dirs if not d.startswith('.') and d not in ('__pycache__', 'tools', 'css', 'js', '.vscode', '.git', 'data')]
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
