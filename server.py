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

PORT = 8080
GEMINI_MODELS = ["gemini-flash-lite-latest", "gemini-flash-latest", "gemini-2.5-flash", "gemini-pro-latest"]
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


def load_local_env():
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
    if not os.path.isfile(env_path):
        return

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
        print(f"[!] Khong doc duoc file .env: {error}")


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
            try:
                data = database.get_table_rows(table_name, limit)
                self.send_json(200, data)
            except ValueError as error:
                self.send_json(400, {"error": str(error)})
            except Exception as error:
                self.send_json(500, {"error": f"Lỗi truy vấn bảng '{table_name}': {error}"})
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
                    payload.get("avatar")
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
            if not token:
                payload = self._read_json_payload(16 * 1024)
                if isinstance(payload, dict):
                    token = payload.get("sessionToken")
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
                with urllib.request.urlopen(request, timeout=20) as response:
                    result = json.loads(response.read().decode("utf-8"))
                    print(f"[*] Gemini thanh cong voi model {model}.")
                    break
            except urllib.error.HTTPError as error:
                last_error = error
                print(f"[!] Model {model} tra ve HTTP {error.code}.")
                if error.code in (401, 403):
                    self.send_json(502, {"error": "Gemini từ chối API key. Hãy kiểm tra lại key và quyền truy cập."})
                    return
                time.sleep(0.3)
                continue
            except (urllib.error.URLError, TimeoutError) as error:
                last_error = error
                print(f"[!] Model {model} loi ket noi: {error}")
                time.sleep(0.3)
                continue
            except (UnicodeDecodeError, json.JSONDecodeError) as error:
                last_error = error
                print(f"[!] Model {model} phan hoi khong doc duoc: {error}")
                continue

        if result is None:
            if isinstance(last_error, urllib.error.HTTPError) and last_error.code in (429, 503):
                self.send_json(502, {"error": "Máy chủ Google Gemini đang tạm thời bận. Bạn vui lòng thử lại sau vài giây."})
            else:
                self.send_json(502, {"error": "Không thể kết nối đến Gemini. Hãy kiểm tra Internet và thử lại."})
            return

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
            self.send_json(502, {"error": "Gemini chưa tạo được câu trả lời. Hãy thử diễn đạt câu hỏi khác."})
            return

        self.send_json(200, {"answer": answer})


def main():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    load_local_env()
    local_ip = get_local_ip()
    
    print("=" * 65)
    print("       ĐẤU TRƯỜNG TOÁN 9 - MÁY CHỦ ÔN TẬP VỪA HỌC VỪA CHƠI")
    print("=" * 65)
    print(f"[*] May chu dang khoi chay tai cong {PORT}...")
    print(f"[*] May tinh cua Thay/Co truy cap: http://localhost:{PORT}")
    print(f"[*] Hoc sinh trong lop truy cap qua Wi-Fi: http://{local_ip}:{PORT}")
    print(f"[*] Chatbot Gemini: {'da cau hinh API key' if os.environ.get('GEMINI_API_KEY') else 'chua cau hinh API key'}")
    print("=" * 65)
    print("[*] Nhan Ctrl + C tren ban phim de dung may chu.")
    print("=" * 65)

    # Tu dong mo trinh duyet
    webbrowser.open(f"http://localhost:{PORT}")

    with http.server.ThreadingHTTPServer(("", PORT), CustomHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n[*] Da dung may chu.")

if __name__ == "__main__":
    main()
