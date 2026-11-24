import sys
import os
import json
import time
import urllib.request
import urllib.error
import threading
import http.server

# Add workspace root to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import server and database
import server
import database

def run_test():
    server_port = 18082
    server.load_local_env()
    httpd = http.server.ThreadingHTTPServer(('127.0.0.1', server_port), server.CustomHandler)
    server_thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    server_thread.start()
    print(f"[*] Live test server running on port {server_port}")
    time.sleep(0.5)

    base_url = f"http://127.0.0.1:{server_port}"

    def request(path, method="GET", data=None, token=None):
        url = f"{base_url}{path}"
        headers = {"Content-Type": "application/json"}
        if token:
            headers["Authorization"] = f"Bearer {token}"
        body = json.dumps(data).encode("utf-8") if data is not None else None
        req = urllib.request.Request(url, data=body, headers=headers, method=method)
        try:
            with urllib.request.urlopen(req) as resp:
                resp_body = resp.read().decode("utf-8")
                return resp.status, json.loads(resp_body) if resp_body else {}
        except urllib.error.HTTPError as e:
            resp_body = e.read().decode("utf-8")
            try:
                return e.code, json.loads(resp_body)
            except Exception:
                return e.code, {"error": resp_body}

    try:
        ts = int(time.time())
        # 1. Tao tai khoan A va tai khoan B
        status, res_a = request("/api/auth/register", "POST", {
            "username": f"user_a_{ts}",
            "password": "password123",
            "displayName": "Bạn Thầy A",
            "avatar": "🦁",
            "email": f"user_a_{ts}@toan9.edu.vn"
        })
        assert status == 200, f"Register A failed: {res_a}"
        token_a = res_a["sessionToken"]
        user_a = res_a["user"]
        print(f"[✓] Tài khoản A tạo thành công: @{user_a['username']}")

        status, res_b = request("/api/auth/register", "POST", {
            "username": f"user_b_{ts}",
            "password": "password123",
            "displayName": "Học Sinh B",
            "avatar": "🐰",
            "email": f"user_b_{ts}@toan9.edu.vn"
        })
        assert status == 200, f"Register B failed: {res_b}"
        token_b = res_b["sessionToken"]
        user_b = res_b["user"]
        print(f"[✓] Tài khoản B tạo thành công: @{user_b['username']}")

        # 2. Tai khoan A tao bai tap gui cho Tai khoan B
        questions = [
            {
                "id": f"q_mc_{ts}",
                "title": "Căn thức bậc hai",
                "content": "Giá trị của $\\sqrt{25}$ là:",
                "options": ["3", "4", "5", "6"],
                "correctAnswer": 2, # C: 5
                "explanation": "Ta có $\\sqrt{25} = 5$ vì $5^2 = 25$ và $5 > 0$."
            },
            {
                "id": f"q_fill_{ts}",
                "title": "Phương trình bậc nhất",
                "content": "Tìm nghiệm x của phương trình: $3x - 12 = 0$",
                "options": [],
                "correctAnswer": "4",
                "acceptableAnswers": ["4", "x=4"],
                "explanation": "$3x = 12 \\Rightarrow x = 4$."
            }
        ]

        status, send_res = request("/api/assignments/send", "POST", {
            "recipients": [user_b["username"]],
            "title": "Thử Thách Toán 9 Đầu Tuần",
            "note": "Các bạn nhớ làm cẩn thận câu điền số nhé!",
            "dueDate": "2026-11-30T23:59:00",
            "questionSource": "mixed",
            "questions": questions
        }, token=token_a)
        assert status == 200 and send_res["created"] is True, f"Send assignment failed: {send_res}"
        assignment_id = send_res["assignmentId"]
        print(f"[✓] Tài khoản A đã gửi bài tập ID {assignment_id} tới @{user_b['username']}")

        # 3. Tai khoan B kiem tra Inbox
        status, inbox_res = request("/api/assignments/inbox", "GET", token=token_b)
        assert status == 200, f"Get inbox failed: {inbox_res}"
        assignments = inbox_res["assignments"]
        assert any(a["id"] == assignment_id for a in assignments), "Assignment not found in B inbox"
        b_assignment = next(a for a in assignments if a["id"] == assignment_id)
        assert b_assignment["status"] == "pending"
        print(f"[✓] Tài khoản B đã nhận được bài tập trong Inbox: '{b_assignment['title']}' từ {b_assignment['sender']['displayName']}")

        # 4. Tai khoan B lam bai tap (Tra loi cau 1 dung, cau 2 sai)
        b_answers = {
            f"q_mc_{ts}": 2,    # Dung (5)
            f"q_fill_{ts}": "10" # Sai (Dap an dung la 4)
        }
        status, submit_res = request(f"/api/assignments/{assignment_id}/submit", "POST", {
            "answers": b_answers
        }, token=token_b)
        assert status == 200, f"Submit failed: {submit_res}"
        assert submit_res["score"] == 5.0, f"Score expected 5.0, got {submit_res['score']}"
        assert submit_res["correctCount"] == 1
        assert submit_res["wrongQuestionsSaved"] == 1
        print(f"[✓] Tài khoản B đã nộp bài thành công! Điểm: {submit_res['score']}/10 (Đúng {submit_res['correctCount']}/{submit_res['totalQuestions']})")

        # 5. Tai khoan B vao So Tay Cau Sai (Smart Review) kiem tra
        status, wq_res = request("/api/wrong-questions", "GET", token=token_b)
        assert status == 200, f"Get wrong questions failed: {wq_res}"
        wrong_list = wq_res.get("wrongQuestions") or wq_res.get("questions") or []
        assert len(wrong_list) >= 1, "Wrong question not recorded"
        saved_wq = next(w for w in wrong_list if w["questionKey"] == f"q_fill_{ts}")
        assert saved_wq["mastered"] is False
        print(f"[✓] Sổ tay câu sai của B đã tự động ghi nhận câu sai: '{saved_wq['question']['content']}'")

        # 6. Tai khoan B luyen lai cau sai va danh dau Mastered
        status, master_res = request(f"/api/wrong-questions/{saved_wq['id']}/master", "POST", token=token_b)
        assert status == 200 and master_res["mastered"] is True
        print(f"[✓] Tài khoản B luyện lại đúng và đánh dấu Đã Nắm Vững (Mastered) thành công!")

        # 7. Tai khoan A kiem tra Báo Cáo Bài Đã Giao
        status, sent_res = request("/api/assignments/sent", "GET", token=token_a)
        assert status == 200, f"Get sent failed: {sent_res}"
        sent_assignments = sent_res["assignments"]
        sent_item = next(a for a in sent_assignments if a["id"] == assignment_id)
        assert sent_item["submittedCount"] == 1
        assert sent_item["averageScore"] == 5.0
        assert len(sent_item["mostMissedQuestions"]) >= 1
        top_missed = sent_item["mostMissedQuestions"][0]
        assert top_missed["questionId"] == f"q_fill_{ts}"
        print(f"[✓] Tài khoản A xem báo cáo: 1/1 học sinh đã nộp, Điểm TB: {sent_item['averageScore']}")
        print(f"[✓] Báo cáo thống kê câu học sinh hay sai nhất chính xác: '{top_missed['content']}' (1 bạn sai)")

        # 8. Tai khoan B cai dat Gio Nhac Hoc Moi Ngay
        status, reminder_res = request("/api/reminders", "POST", {
            "dailyTime": "19:30",
            "enabled": True
        }, token=token_b)
        assert status == 200 and reminder_res["saved"] is True
        print(f"[✓] Cài đặt giờ nhắc học mỗi ngày 19:30 cho tài khoản B thành công!")

        print("\n========================================================")
        print("   KIỂM THỬ TOÀN BỘ LUỒNG A -> B -> BÁO CÁO ĐẠT 100%!   ")
        print("========================================================")

    finally:
        httpd.shutdown()
        server_thread.join()

if __name__ == "__main__":
    run_test()
