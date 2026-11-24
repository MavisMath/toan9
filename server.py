#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
MÁY CHỦ CỤC BỘ DÀNH CHO GIÁO VIÊN & HỌC SINH
Chạy trên mạng Wi-Fi lớp học để tất cả học sinh có thể truy cập từ điện thoại/máy tính bảng
"""

import http.server
import socketserver
import webbrowser
import socket
import os
import sys
import json
import re

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')
import urllib.error
import urllib.parse
import urllib.request
import threading
import time
import database

DEFAULT_PORT = 8080

def get_port():
    try:
        return int(os.environ.get("PORT", DEFAULT_PORT))
    except (ValueError, TypeError):
        return DEFAULT_PORT
GEMINI_MODELS = ["gemini-flash-lite-latest", "gemini-3-flash-preview", "gemini-3.5-flash-lite"]
MAX_REQUEST_BYTES = 64 * 1024
MAX_CHAT_MESSAGES = 16
CHAT_RATE_LIMIT = 10
CHAT_RATE_WINDOW_SECONDS = 60
chat_request_times = {}
chat_request_lock = threading.Lock()
SYSTEM_INSTRUCTION = (
    "Bạn là trợ lý học Toán thân thiện dành cho học sinh lớp 9, trả lời bằng tiếng Việt. "
    "Giải thích kiến thức Toán phổ thông rõ ràng, đúng trình độ, theo từng bước khi phù hợp; "
    "ưu tiên ví dụ thực tế và đơn vị cụ thể. "
    "Mọi công thức, biểu thức, biến số, căn thức, luỹ thừa, phân số hãy luôn đặt trong cặp dấu dollar chuẩn LaTeX: "
    "dùng $công_thức$ cho công thức trong dòng (ví dụ: $\\sqrt{a}$, $x^2$, $\\frac{a}{b}$) "
    "và $$công_thức$$ cho công thức riêng một dòng. "
    "Nếu đề bài thiếu dữ kiện, hãy hỏi lại thay vì đoán. "
    "Nếu câu hỏi không liên quan Toán học hoặc ứng dụng đời sống, lịch sự hướng người dùng về chủ đề phù hợp. "
    "Không khẳng định một kết quả tính toán nếu chưa kiểm tra."
)


def fallback_math_reply(question):
    q = (question or "").strip().lower()

    # 1. Câu hỏi tương lai / nghề nghiệp / lương cao / định hướng
    if any(k in q for k in ["tương lai", "lương cao", "lương", "nghề", "làm gì", "thành công", "giàu"]):
        return (
            "Chào bạn nha! 🐱 Mèo rất vui khi nghe bạn chia sẻ về ước mơ có một tương lai thật rạng rỡ và mức lương cao!\n\n"
            "Để đạt được mục tiêu tuyệt vời đó, đây là những bệ phóng quan trọng nhất:\n"
            "1. **Tư duy logic & Phân tích**: Môn Toán chính là \"phòng tập gym\" cho não bộ. Các ngành nghề thu nhập hàng đầu hiện nay như Trí tuệ nhân tạo (AI), Kỹ sư phần mềm, Tài chính - Phân tích dữ liệu, Logistics và Công nghệ cao đều đòi hỏi tư duy Toán vững vàng.\n"
            "2. **Chinh phục kỳ thi vào lớp 10**: Làm chủ kiến thức Toán 9 (Đại số, Phương trình, Hình học) là bước đệm đưa bạn vào các trường THPT chất lượng cao.\n"
            "3. **Kiên trì mỗi ngày**: Mỗi bài toán bạn rèn luyện hôm nay chính là một viên gạch đắp xây tương lai mơ ước!\n\n"
            "Mèo luôn ở đây đồng hành cùng bạn. Hôm nay bạn muốn cùng Mèo ôn tập chủ đề nào trước: Căn bậc hai, Hàm số bậc nhất hay Hệ thức lượng tam giác vuông? ✨"
        )

    # 2. Xưng hô / kết bạn / hỏi thăm
    if any(k in q for k in ["bé yêu", "xinh gái", "xinh đẹp", "dễ thương", "đáng yêu"]):
        return "Chào bạn nè! 🐱 Nghe bạn gọi dễ thương quá đi! Mèo rất vui được học cùng bạn hôm nay. Có bài toán lớp 9 nào làm bạn băn khoăn không, đưa đề đây Mèo hướng dẫn từng bước nhé! 🌸"

    if any(k in q for k in ["chào", "hello", "hi mèo", "xin chào"]):
        return "Chào bạn học sinh chăm chỉ! 🐱 Mèo Toán Thông Thái đã sẵn sàng đồng hành cùng bạn rồi đây. Bạn cần Mèo giải đáp bài tập Đại số, Hình học hay hướng dẫn công thức nào nào? 📚"

    if any(k in q for k in ["bạn là ai", "mày là ai", "tên gì", "giới thiệu"]):
        return "Mèo là **Mèo Toán Thông Thái** 🐱 — gia sư AI môn Toán lớp 9 của bạn! Mèo có thể giúp bạn giải phương trình, tính căn bậc hai, chứng minh hình học và ôn luyện đề thi vào lớp 10 theo chương trình GDPT 2018."

    # 3. Phép tính số học cơ bản
    if re.search(r"\b1\s*\+\s*1\b", q):
        return "Dễ ợt nè bạn ơi! 🐱\n\n$$1 + 1 = 2$$\n\nBài toán khởi đầu tuy đơn giản nhưng là nền móng cho cả môn Đại số sau này đấy nhé! Bạn có bài nào khó hơn nữa không, đố Mèo đi nào!"

    # 4. Định lý Pythagore
    if "pytago" in q or "pythagore" in q:
        return (
            "**Định lý Pythagore (Pythagoras) trong tam giác vuông:**\n\n"
            "Trong một tam giác vuông, bình phương của cạnh huyền bằng tổng bình phương của hai cạnh góc vuông:\n\n"
            "$$a^2 + b^2 = c^2$$\n\n"
            "Trong đó:\n"
            "- $a, b$: Độ dài hai cạnh góc vuông.\n"
            "- $c$: Độ dài cạnh huyền (cạnh đối diện góc vuông $90^\\circ$).\n\n"
            "*Ví dụ:* Tam giác vuông có 2 cạnh góc vuông là $3\\text{ cm}$ và $4\\text{ cm}$ thì cạnh huyền là:\n"
            "$$c = \\sqrt{3^2 + 4^2} = \\sqrt{9 + 16} = \\sqrt{25} = 5\\text{ cm}$$\n\n"
            "Bạn có bài tập cụ thể nào cần tính cạnh tam giác vuông không, gửi Mèo tính giúp nhé! 🐱"
        )

    # 5. Hệ thức Vi-ét
    if "vi-ét" in q or "viet" in q:
        return (
            "**Định lý & Hệ thức Vi-ét cho phương trình bậc hai:**\n\n"
            "Cho phương trình $ax^2 + bx + c = 0$ ($a \\neq 0$) có hai nghiệm $x_1, x_2$ (khi $\\Delta \\ge 0$):\n\n"
            "$$\\begin{cases} x_1 + x_2 = -\\dfrac{b}{a} \\\\[8pt] x_1 \\cdot x_2 = \\dfrac{c}{a} \\end{cases}$$\n\n"
            "**Ứng dụng quan trọng:**\n"
            "- Nhẩm nghiệm: Nếu $a + b + c = 0$ thì phương trình có 2 nghiệm: $x_1 = 1$, $x_2 = \\dfrac{c}{a}$.\n"
            "- Nếu $a - b + c = 0$ thì phương trình có 2 nghiệm: $x_1 = -1$, $x_2 = -\\dfrac{c}{a}$.\n"
            "- Lập phương trình khi biết tổng $S = x_1 + x_2$ và tích $P = x_1 x_2$: $$X^2 - SX + P = 0$$\n\n"
            "Bạn cần giải bài toán Vi-ét đối xứng hay không đối xứng nào, cứ gửi đề cho Mèo nhé! 🐱"
        )

    # 6. Phương trình bậc hai & Delta
    if "delta" in q or "phương trình bậc hai" in q or "pt bậc 2" in q:
        return (
            "**Công thức nghiệm giải phương trình bậc hai $ax^2 + bx + c = 0$ ($a \\neq 0$):**\n\n"
            "Tính biệt thức Delta:\n"
            "$$\\Delta = b^2 - 4ac$$\n\n"
            "- Nếu $\\Delta < 0$: Phương trình vô nghiệm.\n"
            "- Nếu $\\Delta = 0$: Phương trình có nghiệm kép: $$x_1 = x_2 = -\\dfrac{b}{2a}$$\n"
            "- Nếu $\\Delta > 0$: Phương trình có 2 nghiệm phân biệt:\n"
            "$$x_{1,2} = \\dfrac{-b \\pm \\sqrt{\\Delta}}{2a}$$\n\n"
            "*(Nếu $b$ chẵn, ta có thể tính $\\Delta' = b'^2 - ac$ với $b' = \\dfrac{b}{2}$)*."
        )

    # 7. Căn bậc hai & hằng đẳng thức căn
    if "căn bậc hai" in q or "căn thức" in q:
        return (
            "**Kiến thức trọng tâm Căn bậc hai (Toán 9):**\n\n"
            "1. Điều kiện xác định của $\\sqrt{A}$: $A \\ge 0$.\n"
            "2. Hằng đẳng thức căn:\n"
            "$$\\sqrt{A^2} = |A| = \\begin{cases} A & \\text{nếu } A \\ge 0 \\\\ -A & \\text{nếu } A < 0 \\end{cases}$$\n"
            "3. Quy tắc khai phương:\n"
            "- Tích: $\\sqrt{A \\cdot B} = \\sqrt{A} \\cdot \\sqrt{B}$ ($A, B \\ge 0$).\n"
            "- Thương: $\\sqrt{\\dfrac{A}{B}} = \\dfrac{\\sqrt{A}}{\\sqrt{B}}$ ($A \\ge 0, B > 0$).\n"
            "- Đưa thừa số ra ngoài dấu căn: $\\sqrt{A^2 B} = |A|\\sqrt{B}$ ($B \\ge 0$)."
        )

    # 8. Mặc định thông minh khi Gemini nghẽn mạng
    safe_q = question.strip()[:60]
    return (
        f"Chào bạn nha! 🐱 Mèo đã nhận được câu hỏi: *\"{safe_q}\"*.\n\n"
        "Hiện đường truyền AI của máy chủ Google đang có đợt nghẽn mạng tạm thời, "
        "Mèo vẫn ở đây để giúp bạn học Toán 9! Bạn có thể:\n"
        "1. **Bấm gửi lại câu hỏi** sau vài giây để kết nối lại với AI Gemini.\n"
        "2. Hoặc hỏi Mèo về các chủ đề Toán 9 trọng tâm: **Định lý Pythagore**, **Hệ thức Vi-ét**, **Phương trình bậc 2 (Delta)**, **Căn bậc hai**, **Tỉ số lượng giác**...\n\n"
        "Cùng Mèo chinh phục điểm 9, 10 môn Toán lớp 9 nhé! 🌸✨"
    )


def load_local_env():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    candidates = [
        os.path.join(base_dir, ".env"),
        os.path.join(base_dir, "apikey.env")
    ]
    for env_path in candidates:
        if not os.path.isfile(env_path):
            continue
        try:
            with open(env_path, "r", encoding="utf-8") as env_file:
                for line in env_file:
                    line = line.strip()
                    if not line or line.startswith("#") or "=" not in line:
                        continue
                    name, value = line.split("=", 1)
                    name = name.strip()
                    value = value.strip().strip("\"'")
                    if name and name not in os.environ:
                        os.environ[name] = value
        except OSError as error:
            print(f"[!] Khong doc duoc file {os.path.basename(env_path)}: {error}")


def is_rate_limited(client_ip):
    now = time.monotonic()
    cutoff = now - CHAT_RATE_WINDOW_SECONDS
    with chat_request_lock:
        for ip in list(chat_request_times):
            recent = [stamp for stamp in chat_request_times[ip] if stamp > cutoff]
            if recent:
                chat_request_times[ip] = recent
            else:
                del chat_request_times[ip]

        recent = chat_request_times.setdefault(client_ip, [])
        if len(recent) >= CHAT_RATE_LIMIT:
            return True
        recent.append(now)
        return False


def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def send_json(self, status, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)
        self.wfile.flush()

    def get_session_token(self):
        auth_header = self.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            return auth_header[7:].strip()
        token_header = self.headers.get("X-Session-Token", "")
        if token_header:
            return token_header.strip()
        query = urllib.parse.parse_qs(urllib.parse.urlsplit(self.path).query)
        if "token" in query:
            return query["token"][0].strip()
        return None

    def _require_auth(self):
        token = self.get_session_token()
        if not token:
            self.send_json(401, {"error": "Yêu cầu đăng nhập để thực hiện thao tác này."})
            return None
        try:
            data = database.get_user_by_session(token)
            if not data or not data.get("user"):
                self.send_json(401, {"error": "Phiên đăng nhập đã hết hạn hoặc không hợp lệ."})
                return None
            return data["user"]
        except Exception as error:
            self.send_json(503, {"error": f"Lỗi xác thực người dùng: {error}"})
            return None

    def _read_json_payload(self, max_bytes=3 * 1024 * 1024):
        try:
            content_length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            self.send_json(400, {"error": "Kích thước yêu cầu không hợp lệ."})
            return None
        if content_length <= 0 or content_length > max_bytes:
            self.send_json(413, {"error": "Dữ liệu gửi lên vượt quá dung lượng cho phép."})
            return None
        try:
            return json.loads(self.rfile.read(content_length).decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            self.send_json(400, {"error": "Dữ liệu gửi lên không phải JSON hợp lệ."})
            return None

    def do_GET(self):
        path = urllib.parse.unquote(urllib.parse.urlsplit(self.path).path)
        if os.path.basename(path).lower().startswith(".env"):
            self.send_error(404)
            return

        if path == "/api/auth/me":
            token = self.get_session_token()
            if not token:
                query = urllib.parse.parse_qs(urllib.parse.urlsplit(self.path).query)
                token = query.get("token", [""])[0]
            if not token:
                self.send_json(401, {"error": "Chưa đăng nhập."})
                return
            try:
                data = database.get_user_by_session(token)
                if not data:
                    self.send_json(401, {"error": "Phiên đăng nhập đã hết hạn hoặc không hợp lệ."})
                    return
                self.send_json(200, data)
            except Exception as error:
                self.send_json(503, {"error": f"Lỗi cơ sở dữ liệu: {error}"})
            return

        if path == "/api/profile":
            token = self.get_session_token()
            query = urllib.parse.parse_qs(urllib.parse.urlsplit(self.path).query)
            if not token:
                token = query.get("token", [""])[0]
            if token:
                try:
                    data = database.get_user_by_session(token)
                    if data:
                        self.send_json(200, {"state": data})
                        return
                except Exception:
                    pass

            client_id = query.get("clientId", [""])[0]
            try:
                self.send_json(200, {"state": database.load_client_state(client_id)})
            except ValueError as error:
                self.send_json(400, {"error": str(error)})
            except Exception:
                self.send_json(503, {"error": "Chưa kết nối được cơ sở dữ liệu Toan9_DB. Hãy kiểm tra SQL Server và cấu hình ODBC."})
            return

        if path == "/api/documents":
            try:
                docs = database.get_documents_metadata()
                self.send_json(200, {"documents": docs, "total": len(docs)})
            except Exception as error:
                self.send_json(500, {"error": f"Lỗi đọc thư mục tài liệu: {error}"})
            return

        if path == "/api/database/status":
            try:
                status = database.get_database_status()
                self.send_json(200, status)
            except Exception as error:
                self.send_json(503, {"connected": False, "error": f"Không thể kết nối CSDL: {error}"})
            return

        if path == "/api/database/table":
            query = urllib.parse.parse_qs(urllib.parse.urlsplit(self.path).query)
            table_name = query.get("name", ["topics"])[0]
            limit = query.get("limit", [50])[0]

            blocked_tables = {"users", "user_sessions", "user", "sessions"}
            clean_name = (table_name or "").strip().lower()
            if clean_name in blocked_tables:
                self.send_json(403, {"error": f"Không được phép truy cập bảng '{table_name}' vì lý do bảo mật thông tin người dùng."})
                return

            try:
                data = database.get_table_rows(table_name, limit)
                self.send_json(200, data)
            except ValueError as error:
                self.send_json(400, {"error": str(error)})
            except Exception as error:
                self.send_json(500, {"error": f"Lỗi truy vấn bảng '{table_name}': {error}"})
            return

        # -------------------------------------------------------------
        # API TRA CỨU NGƯỜI NHẬN & HỆ THỐNG GIAO / NHẬN BÀI TẬP (GET)
        # -------------------------------------------------------------
        if path == "/api/users/lookup":
            query = urllib.parse.parse_qs(urllib.parse.urlsplit(self.path).query)
            q = query.get("q", [""])[0]
            try:
                users = database.lookup_user(q)
                self.send_json(200, {"users": users})
            except Exception as error:
                self.send_json(500, {"error": f"Lỗi tra cứu người dùng: {error}"})
            return

        if path == "/api/assignments/inbox":
            user = self._require_auth()
            if not user:
                return
            try:
                assignments = database.get_inbox_assignments(user["userId"])
                self.send_json(200, {"assignments": assignments})
            except Exception as error:
                self.send_json(500, {"error": f"Lỗi tải hộp bài tập nhận: {error}"})
            return

        if path == "/api/assignments/sent":
            user = self._require_auth()
            if not user:
                return
            try:
                assignments = database.get_sent_assignments(user["userId"])
                self.send_json(200, {"assignments": assignments})
            except Exception as error:
                self.send_json(500, {"error": f"Lỗi tải danh sách bài tập đã giao: {error}"})
            return

        if path == "/api/wrong-questions":
            user = self._require_auth()
            if not user:
                return
            query = urllib.parse.parse_qs(urllib.parse.urlsplit(self.path).query)
            mastered_param = query.get("mastered", [None])[0]
            try:
                wrong_q = database.get_wrong_questions(user["userId"], mastered_param)
                self.send_json(200, {"wrongQuestions": wrong_q})
            except Exception as error:
                self.send_json(500, {"error": f"Lỗi đọc sổ tay câu sai: {error}"})
            return

        if path == "/api/reminders":
            user = self._require_auth()
            if not user:
                return
            try:
                reminder = database.get_study_reminder(user["userId"])
                self.send_json(200, {"reminder": reminder})
            except Exception as error:
                self.send_json(500, {"error": f"Lỗi đọc cấu hình nhắc học: {error}"})
            return

        super().do_GET()

    def do_POST(self):
        try:
            self._handle_post()
        except Exception as error:
            import traceback
            traceback.print_exc()
            self.send_json(500, {"error": f"Lỗi máy chủ: {error}"})

    def _handle_post(self):
        path = urllib.parse.urlsplit(self.path).path

        if path == "/api/database/sync-all":
            try:
                result = database.sync_all_data_to_database()
                self.send_json(200, result)
            except Exception as error:
                self.send_json(500, {"error": f"Lỗi đồng bộ CSDL: {error}"})
            return

        if path == "/api/auth/register":
            payload = self._read_json_payload(64 * 1024)
            if payload is None:
                return
            try:
                result = database.register_user(
                    payload.get("username"),
                    payload.get("password"),
                    payload.get("displayName"),
                    payload.get("avatar"),
                    payload.get("email")
                )
                self.send_json(200, result)
            except ValueError as error:
                self.send_json(400, {"error": str(error)})
            except Exception as error:
                self.send_json(503, {"error": f"Không thể lưu tài khoản vào cơ sở dữ liệu: {error}"})
            return

        if path == "/api/auth/login":
            payload = self._read_json_payload(64 * 1024)
            if payload is None:
                return
            try:
                result = database.login_user(
                    payload.get("username"),
                    payload.get("password")
                )
                self.send_json(200, result)
            except ValueError as error:
                self.send_json(400, {"error": str(error)})
            except Exception as error:
                self.send_json(503, {"error": f"Không thể kết nối cơ sở dữ liệu: {error}"})
            return

        if path == "/api/auth/logout":
            token = self.get_session_token()
            payload = self._read_json_payload(16 * 1024)
            if not token and isinstance(payload, dict):
                token = payload.get("sessionToken") or payload.get("session_token")
            try:
                database.logout_user(token)
                self.send_json(200, {"loggedOut": True})
            except Exception as error:
                self.send_json(500, {"error": f"Lỗi đăng xuất: {error}"})
            return

        if path == "/api/profile":
            payload = self._read_json_payload(3 * 1024 * 1024)
            if payload is None:
                return
            token = self.get_session_token() or (payload.get("sessionToken") if isinstance(payload, dict) else None)
            try:
                if token:
                    user_data = database.get_user_by_session(token)
                    if user_data:
                        database.save_user_state(user_data["user"]["userId"], payload)
                        self.send_json(200, {"saved": True, "authenticated": True})
                        return

                database.save_client_state(payload.get("clientId"), payload)
                self.send_json(200, {"saved": True, "authenticated": False})
            except ValueError as error:
                self.send_json(400, {"error": str(error)})
            except Exception:
                self.send_json(503, {"error": "Chưa lưu được dữ liệu vào Toan9_DB. Dữ liệu vẫn còn trong trình duyệt."})
            return

        # -------------------------------------------------------------
        # API HỆ THỐNG GIAO / NHẬN BÀI TẬP, CÂU SAI & NHẮC HỌC (POST)
        # -------------------------------------------------------------
        if path == "/api/assignments/send":
            user = self._require_auth()
            if not user:
                return
            payload = self._read_json_payload(2 * 1024 * 1024)
            if payload is None:
                return
            try:
                result = database.create_assignment(
                    user["userId"],
                    payload.get("title"),
                    payload.get("note"),
                    payload.get("questionSource") or payload.get("source"),
                    payload.get("questions", []),
                    payload.get("dueDate") or payload.get("due_date"),
                    payload.get("recipients", [])
                )
                if not result.get("created"):
                    self.send_json(400, result)
                else:
                    self.send_json(200, result)
            except ValueError as error:
                self.send_json(400, {"error": str(error)})
            except Exception as error:
                self.send_json(500, {"error": f"Lỗi tạo bài tập: {error}"})
            return

        m_submit = re.match(r"^/api/assignments/(\d+)/submit$", path)
        if m_submit:
            user = self._require_auth()
            if not user:
                return
            assignment_id = int(m_submit.group(1))
            payload = self._read_json_payload(1024 * 1024)
            if payload is None:
                return
            answers = payload.get("answers", payload)
            try:
                result = database.submit_assignment(assignment_id, user["userId"], answers)
                self.send_json(200, result)
            except ValueError as error:
                self.send_json(400, {"error": str(error)})
            except Exception as error:
                self.send_json(500, {"error": f"Lỗi nộp bài tập: {error}"})
            return

        m_master = re.match(r"^/api/wrong-questions/(\d+)/master$", path)
        if m_master:
            user = self._require_auth()
            if not user:
                return
            wrong_id = int(m_master.group(1))
            try:
                result = database.master_wrong_question(user["userId"], wrong_id)
                self.send_json(200, result)
            except ValueError as error:
                self.send_json(400, {"error": str(error)})
            except Exception as error:
                self.send_json(500, {"error": f"Lỗi cập nhật câu đã hiểu: {error}"})
            return

        if path == "/api/reminders":
            user = self._require_auth()
            if not user:
                return
            payload = self._read_json_payload(16 * 1024)
            if payload is None:
                return
            try:
                daily_time = payload.get("dailyTime") or payload.get("daily_time")
                enabled = payload.get("enabled", True)
                result = database.save_study_reminder(user["userId"], daily_time, enabled)
                self.send_json(200, result)
            except ValueError as error:
                self.send_json(400, {"error": str(error)})
            except Exception as error:
                self.send_json(500, {"error": f"Lỗi lưu cấu hình nhắc học: {error}"})
            return

        if path != "/api/chat":
            self.send_error(404)
            return

        if is_rate_limited(self.client_address[0]):
            self.send_json(429, {"error": "Bạn đã gửi nhiều câu hỏi liên tiếp. Vui lòng đợi một phút rồi thử lại."})
            return

        api_key = os.environ.get("GEMINI_API_KEY", "").strip()
        if not api_key:
            self.send_json(503, {
                "error": "Chưa cấu hình GEMINI_API_KEY. Thêm API key vào file .env rồi khởi động lại máy chủ."
            })
            return

        try:
            content_length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            self.send_json(400, {"error": "Kích thước yêu cầu không hợp lệ."})
            return

        if content_length <= 0 or content_length > MAX_REQUEST_BYTES:
            self.send_json(413, {"error": "Tin nhắn gửi lên quá dài."})
            return

        try:
            payload = json.loads(self.rfile.read(content_length).decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            self.send_json(400, {"error": "Nội dung gửi lên không phải JSON hợp lệ."})
            return

        messages = payload.get("messages") if isinstance(payload, dict) else None
        if not isinstance(messages, list) or not messages:
            self.send_json(400, {"error": "Cuộc trò chuyện không hợp lệ. Hãy tải lại trang và thử lại."})
            return

        raw_contents = []
        for message in messages:
            if not isinstance(message, dict):
                continue
            role = message.get("role")
            text = message.get("text")
            if role not in ("user", "model") or not isinstance(text, str) or not text.strip():
                continue
            # Cắt ngắn nếu tin nhắn quá dài thay vì từ chối
            if len(text) > 4000:
                text = text[:4000]
            raw_contents.append({"role": role, "parts": [{"text": text.strip()}]})

        # Đảm bảo quy tắc Gemini: bắt đầu bằng 'user' và luân phiên các lượt nói
        contents = []
        for item in raw_contents:
            if not contents:
                if item["role"] == "user":
                    contents.append(item)
            elif contents[-1]["role"] != item["role"]:
                contents.append(item)
            else:
                contents[-1]["parts"][0]["text"] += "\n" + item["parts"][0]["text"]

        if not contents or contents[-1]["role"] != "user":
            self.send_json(400, {"error": "Câu hỏi không hợp lệ hoặc thiếu nội dung."})
            return

        # Giữ lại các lượt hội thoại gần nhất
        if len(contents) > MAX_CHAT_MESSAGES:
            contents = contents[-MAX_CHAT_MESSAGES:]
            if contents and contents[0]["role"] != "user":
                contents = contents[1:]

        request_body = json.dumps({
            "system_instruction": {"parts": [{"text": SYSTEM_INSTRUCTION}]},
            "contents": contents,
            "generationConfig": {"temperature": 0.5, "maxOutputTokens": 700}
        }).encode("utf-8")
        result = None
        last_error = None
        last_error_code = None

        # Thử lần lượt các model trong GEMINI_MODELS với timeout 4s mỗi model
        for model in GEMINI_MODELS:
            request = urllib.request.Request(
                f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={urllib.parse.quote(api_key)}",
                data=request_body,
                headers={
                    "Content-Type": "application/json",
                    "x-goog-api-key": api_key
                },
                method="POST"
            )

            try:
                with urllib.request.urlopen(request, timeout=4) as response:
                    result = json.loads(response.read().decode("utf-8"))
                    print(f"[*] Gemini thanh cong voi model {model}.")
                    break
            except urllib.error.HTTPError as error:
                last_error = error
                last_error_code = error.code
                print(f"[!] Model {model} tra ve HTTP {error.code}.")
                if error.code in (400, 401, 403):
                    break
                time.sleep(0.2)
                continue
            except Exception as error:
                last_error = error
                print(f"[!] Model {model} loi: {error}")
                continue

        answer = ""
        if result:
            candidates = result.get("candidates") if isinstance(result, dict) else None
            candidate = candidates[0] if isinstance(candidates, list) and candidates and isinstance(candidates[0], dict) else {}
            content = candidate.get("content", {})
            parts = content.get("parts", []) if isinstance(content, dict) else []
            answer = "\n".join(
                part["text"].strip()
                for part in parts
                if isinstance(part, dict) and isinstance(part.get("text"), str) and part["text"].strip()
            )

        if not answer:
            # Tự động kích hoạt bộ giải dự phòng thông minh của Mèo Toán khi Gemini bận/nghẽn
            user_last_q = ""
            for item in reversed(contents):
                if item.get("role") == "user":
                    user_last_q = item.get("parts", [{}])[0].get("text", "")
                    break
            answer = fallback_math_reply(user_last_q)

        self.send_json(200, {"answer": answer})



    def do_PUT(self):
        try:
            self._handle_put()
        except Exception as error:
            self.send_json(500, {"error": f"Lỗi máy chủ (PUT): {error}"})

    def _handle_put(self):
        path = urllib.parse.unquote(urllib.parse.urlsplit(self.path).path)
        if path == "/api/auth/email":
            user = self._require_auth()
            if not user:
                return
            payload = self._read_json_payload(16 * 1024)
            if payload is None:
                return
            try:
                new_email = database.update_user_email(user["userId"], payload.get("email"))
                self.send_json(200, {"updated": True, "email": new_email})
            except ValueError as error:
                self.send_json(400, {"error": str(error)})
            except Exception as error:
                self.send_json(500, {"error": f"Lỗi cập nhật email: {error}"})
            return

        self.send_json(404, {"error": "Endpoint PUT không tồn tại."})

    def do_DELETE(self):
        try:
            self._handle_delete()
        except Exception as error:
            self.send_json(500, {"error": f"Lỗi máy chủ (DELETE): {error}"})

    def _handle_delete(self):
        path = urllib.parse.unquote(urllib.parse.urlsplit(self.path).path)
        m_del = re.match(r"^/api/assignments/(\d+)$", path)
        if m_del:
            user = self._require_auth()
            if not user:
                return
            assignment_id = int(m_del.group(1))
            try:
                result = database.delete_assignment(assignment_id, user["userId"])
                self.send_json(200, result)
            except ValueError as error:
                self.send_json(400, {"error": str(error)})
            except Exception as error:
                self.send_json(500, {"error": f"Lỗi xóa bài tập: {error}"})
            return

        self.send_json(404, {"error": "Endpoint DELETE không tồn tại."})

def main():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    load_local_env()
    port = get_port()
    local_ip = get_local_ip()
    db_status = database.get_database_status()
    
    print("=" * 65)
    print("       ĐẤU TRƯỜNG TOÁN 9 - MÁY CHỦ ÔN TẬP VỪA HỌC VỪA CHƠI")
    print("=" * 65)
    print(f"[*] May chu dang khoi chay tai cong {port}...")
    print(f"[*] Co so du lieu: {db_status.get('engine', 'sqlite').upper()} ({db_status.get('database')})")
    print(f"[*] May tinh cua Thay/Co truy cap: http://localhost:{port}")
    print(f"[*] Hoc sinh trong lop truy cap qua Wi-Fi: http://{local_ip}:{port}")
    print(f"[*] Chatbot Gemini: {'da cau hinh API key' if os.environ.get('GEMINI_API_KEY') else 'chua cau hinh API key'}")
    print("=" * 65)
    print("[*] Nhan Ctrl + C tren ban phim de dung may chu.")
    print("=" * 65)

    # Chi tu dong mo trinh duyet neu khong o trong moi truong Docker/Cloud/Headless
    no_browser = os.environ.get("NO_BROWSER", "").strip().lower() in ("1", "true", "yes")
    is_cloud = bool(os.environ.get("RENDER"))
    if not no_browser and not is_cloud:
        try:
            webbrowser.open(f"http://localhost:{port}")
        except Exception:
            pass

    with http.server.ThreadingHTTPServer(("", port), CustomHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n[*] Da dung may chu.")

if __name__ == "__main__":
    main()
