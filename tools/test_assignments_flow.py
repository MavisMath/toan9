#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
KỊCH BẢN KIỂM THỬ TÍCH HỢP END-TO-END (INTEGRATION TEST):
Kiểm tra toàn bộ luồng giao/nhận bài tập, sổ tay câu sai, nhắc học và tài khoản:
1. Đăng ký tài khoản kèm email & kiểm tra chống trùng lặp.
2. Đăng nhập bằng cả Username lẫn Email.
3. Cập nhật Email người dùng qua PUT /api/auth/email.
4. Tra cứu người nhận qua GET /api/users/lookup (bảo mật, không lộ mật khẩu/email nhạy cảm).
5. Giao bài tập qua POST /api/assignments/send cho cả username và email.
6. Báo lỗi rõ ràng khi người nhận không tồn tại (notFound).
7. Người nhận kiểm tra hộp thư qua GET /api/assignments/inbox.
8. Người nhận nộp bài qua POST /api/assignments/<id>/submit (chấm điểm tự động).
9. Tự động lưu câu sai vào bảng wrong_questions (GET /api/wrong-questions).
10. Đánh dấu đã hiểu câu hỏi sai qua POST /api/wrong-questions/<id>/master.
11. Người giao xem thống kê chi tiết qua GET /api/assignments/sent (ai đã nộp, điểm số, câu sai nhiều nhất).
12. Cấu hình giờ nhắc học qua POST /api/reminders & GET /api/reminders.
13. Xóa bài tập qua DELETE /api/assignments/<id>.
"""

import http.server
import json
import os
import sys
import threading
import time
import urllib.error
import urllib.parse
import urllib.request

# Đảm bảo đường dẫn import từ thư mục gốc
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import database
import server

# Khởi tạo máy chủ HTTP test trên cổng ngẫu nhiên
TEST_PORT = 18080
httpd = None
server_thread = None


def start_test_server():
    global httpd, server_thread
    server.load_local_env()
    httpd = http.server.ThreadingHTTPServer(("127.0.0.1", TEST_PORT), server.CustomHandler)
    server_thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    server_thread.start()
    time.sleep(0.3)
    print(f"[*] May chu HTTP test da san sang tai http://127.0.0.1:{TEST_PORT}")


def stop_test_server():
    global httpd
    if httpd:
        httpd.shutdown()
        httpd.server_close()
        print("[*] Da dong may chu HTTP test.")


def request(method, path, data=None, token=None):
    url = f"http://127.0.0.1:{TEST_PORT}{path}"
    headers = {"Content-Type": "application/json; charset=utf-8"}
    if token:
        headers["Authorization"] = f"Bearer {token}"

    body = None
    if data is not None:
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")

    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            resp_body = resp.read().decode("utf-8")
            return resp.status, json.loads(resp_body) if resp_body else {}
    except urllib.error.HTTPError as err:
        err_body = err.read().decode("utf-8")
        try:
            return err.code, json.loads(err_body)
        except Exception:
            return err.code, {"error": err_body}


def run_tests():
    start_test_server()
    try:
        prefix = f"t_{int(time.time())}"

        # -------------------------------------------------------------
        # BƯỚC 1: ĐĂNG KÝ CÓ EMAIL & KHÔNG CÓ EMAIL
        # -------------------------------------------------------------
        print("\n=== BƯỚC 1: Đăng ký tài khoản kèm Email ===")
        user_a_name = f"{prefix}_sender"
        user_a_email = f"{prefix}_sender@toan9.edu.vn"
        status, res_a = request("POST", "/api/auth/register", {
            "username": user_a_name,
            "password": "Password123",
            "displayName": "Thầy Giáo Mavis",
            "avatar": "👨‍🏫",
            "email": user_a_email
        })
        assert status == 200, f"Dang ky User A that bai: {res_a}"
        token_a = res_a["sessionToken"]
        uid_a = res_a["user"]["userId"]
        assert res_a["user"]["email"] == user_a_email, "Email User A khong dung"
        print(f"  [✓] User A đăng ký thành công (ID: {uid_a}, Email: {user_a_email})")

        # Kiểm tra chống trùng email
        status, res_dup = request("POST", "/api/auth/register", {
            "username": f"{prefix}_dup",
            "password": "Password123",
            "email": user_a_email.upper()  # kiểm tra không phân biệt hoa thường
        })
        assert status == 400, "He thong phai chan dang ky trung email"
        print("  [✓] Chặn đăng ký trùng Email thành công")

        # Đăng ký User B (học sinh 1, có email)
        user_b_name = f"{prefix}_hs1"
        user_b_email = f"{prefix}_hs1@toan9.edu.vn"
        status, res_b = request("POST", "/api/auth/register", {
            "username": user_b_name,
            "password": "Password123",
            "displayName": "Học Sinh Bông",
            "avatar": "🐰",
            "email": user_b_email
        })
        assert status == 200, f"Dang ky User B that bai: {res_b}"
        token_b = res_b["sessionToken"]
        uid_b = res_b["user"]["userId"]
        print(f"  [✓] User B đăng ký thành công (ID: {uid_b})")

        # Đăng ký User C (học sinh 2, ban đầu chưa có email)
        user_c_name = f"{prefix}_hs2"
        status, res_c = request("POST", "/api/auth/register", {
            "username": user_c_name,
            "password": "Password123",
            "displayName": "Học Sinh Cún",
            "avatar": "🐶"
        })
        assert status == 200, f"Dang ky User C that bai: {res_c}"
        token_c = res_c["sessionToken"]
        uid_c = res_c["user"]["userId"]
        print(f"  [✓] User C đăng ký thành công (không kèm email lúc đầu)")

        # -------------------------------------------------------------
        # BƯỚC 2: ĐĂNG NHẬP BẰNG CẢ USERNAME LẪN EMAIL
        # -------------------------------------------------------------
        print("\n=== BƯỚC 2: Đăng nhập bằng Email và Username ===")
        # Đăng nhập bằng Email
        status, login_res = request("POST", "/api/auth/login", {
            "username": user_a_email,
            "password": "Password123"
        })
        assert status == 200 and login_res.get("sessionToken"), "Dang nhap bang Email that bai"
        print("  [✓] Đăng nhập bằng Email thành công")

        # Đăng nhập bằng Username
        status, login_res2 = request("POST", "/api/auth/login", {
            "username": user_a_name,
            "password": "Password123"
        })
        assert status == 200 and login_res2.get("sessionToken"), "Dang nhap bang Username that bai"
        print("  [✓] Đăng nhập bằng Username thành công")

        # -------------------------------------------------------------
        # BƯỚC 3: CẬP NHẬT EMAIL QUA PUT /api/auth/email
        # -------------------------------------------------------------
        print("\n=== BƯỚC 3: Cập nhật Email cho User C ===")
        user_c_email = f"{prefix}_hs2@toan9.edu.vn"
        status, put_email_res = request("PUT", "/api/auth/email", {"email": user_c_email}, token=token_c)
        assert status == 200 and put_email_res.get("email") == user_c_email, f"PUT email that bai: {put_email_res}"
        print(f"  [✓] User C đã cập nhật email thành công thành: {user_c_email}")

        # -------------------------------------------------------------
        # BƯỚC 4: TRA CỨU NGƯỜI NHẬN QUA GET /api/users/lookup
        # -------------------------------------------------------------
        print("\n=== BƯỚC 4: Tra cứu người nhận ===")
        status, lookup_res = request("GET", f"/api/users/lookup?q={user_b_email}")
        assert status == 200, f"Lookup that bai: {lookup_res}"
        users_found = lookup_res.get("users", [])
        assert len(users_found) >= 1, "Khong tim thay user theo email"
        target_b = users_found[0]
        assert target_b["username"] == user_b_name
        assert "password" not in target_b and "password_hash" not in target_b, "Bao mat: Khong duoc tra mat khau!"
        print(f"  [✓] Tìm thấy {target_b['displayName']} qua email mà không lộ dữ liệu nhạy cảm")

        # -------------------------------------------------------------
        # BƯỚC 5: GIAO BÀI TẬP QUA POST /api/assignments/send
        # -------------------------------------------------------------
        print("\n=== BƯỚC 5: Giao bài tập linh hoạt (Username + Email) ===")
        sample_questions = [
            {
                "id": "toan9_c1",
                "content": "Căn bậc hai số học của 25 là bao nhiêu?",
                "options": ["-5", "5", "±5", "25"],
                "correctAnswer": 1,
                "explanation": "Vì 5 >= 0 và 5^2 = 25 nên căn bậc hai số học của 25 là 5."
            },
            {
                "id": "toan9_c2",
                "content": "Phương trình $2x - 6 = 0$ có nghiệm là:",
                "options": ["x = 2", "x = -3", "x = 3", "x = 6"],
                "correctAnswer": 2,
                "explanation": "2x = 6 <=> x = 3."
            }
        ]

        # Kiểm tra báo lỗi khi có người nhận không tồn tại
        status, send_err = request("POST", "/api/assignments/send", {
            "title": "Bài tập thử nghiệm",
            "questions": sample_questions,
            "recipients": [user_b_name, "nguoi_dung_ao_khong_ton_tai@toan9.edu.vn"]
        }, token=token_a)
        assert status == 400, "Phai bao loi khi co nguoi nhan khong ton tai"
        assert "notFound" in send_err, "Phai tra ve danh sach notFound"
        print(f"  [✓] Hệ thống cảnh báo rõ người nhận không tồn tại: {send_err['notFound']}")

        # Giao bài tập chính thức: 1 người nhận qua email, 1 người nhận qua username
        status, send_ok = request("POST", "/api/assignments/send", {
            "title": "Phiếu Bài Tập Căn Bậc Hai & Phương Trình",
            "note": "Các em làm cẩn thận trước 21h hôm nay nhé!",
            "questionSource": "basic",
            "dueDate": "2030-01-01T23:59:59Z",
            "questions": sample_questions,
            "recipients": [user_b_email, user_c_name]
        }, token=token_a)
        assert status == 200 and send_ok.get("created"), f"Giao bai tap that bai: {send_ok}"
        assignment_id = send_ok["assignmentId"]
        assert send_ok["recipientCount"] == 2
        print(f"  [✓] Giao bài tập ID {assignment_id} thành công cho 2 học sinh")

        # -------------------------------------------------------------
        # BƯỚC 6: HỌC SINH NHẬN BÀI QUA GET /api/assignments/inbox
        # -------------------------------------------------------------
        print("\n=== BƯỚC 6: Học sinh kiểm tra Hộp Bài Tập Nhận ===")
        status, inbox_res = request("GET", "/api/assignments/inbox", token=token_b)
        assert status == 200, f"Inbox that bai: {inbox_res}"
        assignments_b = inbox_res.get("assignments", [])
        assert len(assignments_b) >= 1
        my_assignment = next((a for a in assignments_b if a["id"] == assignment_id), None)
        assert my_assignment is not None, "Khong tim thay bai tap vua giao trong Inbox"
        assert my_assignment["sender"]["displayName"] == "Thầy Giáo Mavis"
        assert my_assignment["status"] == "pending"
        assert len(my_assignment["questions"]) == 2
        print(f"  [✓] Học sinh B thấy bài tập '{my_assignment['title']}' gửi từ {my_assignment['sender']['displayName']}")

        # -------------------------------------------------------------
        # BƯỚC 7: NỘP BÀI VÀ CHẤM ĐIỂM TỰ ĐỘNG
        # -------------------------------------------------------------
        print("\n=== BƯỚC 7: Học sinh nộp bài & Chấm điểm tự động ===")
        # Học sinh B làm câu 1 ĐÚNG (chọn 1), câu 2 SAI (chọn 0 thay vì 2)
        submit_payload = {
            "answers": [
                {"questionId": "toan9_c1", "answer": 1},  # Đúng
                {"questionId": "toan9_c2", "answer": 0}   # Sai
            ]
        }
        status, submit_res = request("POST", f"/api/assignments/{assignment_id}/submit", submit_payload, token=token_b)
        assert status == 200 and submit_res.get("submitted"), f"Nop bai that bai: {submit_res}"
        assert submit_res["score"] == 5.0, f"Diem so phai la 5.0 (1/2 cau), thuc te: {submit_res['score']}"
        assert submit_res["status"] == "submitted"
        assert submit_res["wrongQuestionsSaved"] == 1
        print(f"  [✓] Nộp bài thành công! Điểm số: {submit_res['score']}/10.0 (Đúng 1/2 câu)")

        # -------------------------------------------------------------
        # BƯỚC 8: SỔ TAY CÂU SAI (WRONG QUESTIONS NOTEBOOK)
        # -------------------------------------------------------------
        print("\n=== BƯỚC 8: Kiểm tra Sổ tay câu sai & Đánh dấu đã hiểu ===")
        status, wrong_res = request("GET", "/api/wrong-questions", token=token_b)
        assert status == 200
        wrong_list = wrong_res.get("wrongQuestions", [])
        assert len(wrong_list) >= 1
        q_wrong = next((w for w in wrong_list if w["questionKey"] == "toan9_c2"), None)
        assert q_wrong is not None, "Cau 2 lam sai phai duoc luu vao so tay"
        assert q_wrong["mastered"] is False
        print(f"  [✓] Câu làm sai 'toan9_c2' đã tự động lưu vào sổ tay (Lần sai: {q_wrong['wrongCount']})")

        # Đánh dấu đã hiểu câu hỏi sai
        wrong_id = q_wrong["id"]
        status, master_res = request("POST", f"/api/wrong-questions/{wrong_id}/master", token=token_b)
        assert status == 200 and master_res.get("mastered"), f"Master cau sai that bai: {master_res}"
        print(f"  [✓] Đã đánh dấu câu sai ID {wrong_id} thành 'Đã hiểu' thành công")

        # -------------------------------------------------------------
        # BƯỚC 9: XEM THỐNG KÊ BÀI ĐÃ GIAO (BÊN PHÍA NGƯỜI GỬI)
        # -------------------------------------------------------------
        print("\n=== BƯỚC 9: Người gửi xem thống kê bài tập đã giao ===")
        status, sent_res = request("GET", "/api/assignments/sent", token=token_a)
        assert status == 200
        sent_list = sent_res.get("assignments", [])
        my_sent = next((s for s in sent_list if s["id"] == assignment_id), None)
        assert my_sent is not None
        assert my_sent["totalRecipients"] == 2
        assert my_sent["submittedCount"] == 1
        assert my_sent["pendingCount"] == 1
        assert my_sent["averageScore"] == 5.0
        assert len(my_sent["mostMissedQuestions"]) >= 1
        most_missed = my_sent["mostMissedQuestions"][0]
        assert most_missed["questionId"] == "toan9_c2"
        print(f"  [✓] Thống kê bài tập: 1/2 học sinh đã nộp, điểm TB: {my_sent['averageScore']}")
        print(f"  [✓] Thống kê câu sai nhiều nhất: '{most_missed['content']}' (Bị sai {most_missed['wrongCount']} lần)")

        # -------------------------------------------------------------
        # BƯỚC 10: CẤU HÌNH GIỜ NHẮC HỌC MỖI NGÀY
        # -------------------------------------------------------------
        print("\n=== BƯỚC 10: Cấu hình Giờ nhắc học mỗi ngày ===")
        status, save_rem = request("POST", "/api/reminders", {"dailyTime": "20:15", "enabled": True}, token=token_b)
        assert status == 200 and save_rem.get("saved"), f"Luu reminder that bai: {save_rem}"

        status, get_rem = request("GET", "/api/reminders", token=token_b)
        assert status == 200
        assert get_rem["reminder"]["dailyTime"] == "20:15"
        assert get_rem["reminder"]["enabled"] is True
        print(f"  [✓] Cấu hình nhắc học thành công: {get_rem['reminder']['dailyTime']} (Bật: {get_rem['reminder']['enabled']})")

        # -------------------------------------------------------------
        # BƯỚC 11: XÓA BÀI TẬP QUA DELETE /api/assignments/<id>
        # -------------------------------------------------------------
        print("\n=== BƯỚC 11: Xóa bài tập ===")
        # Học sinh B cố tình xóa -> Phải bị từ chối (400)
        status, del_fail = request("DELETE", f"/api/assignments/{assignment_id}", token=token_b)
        assert status == 400, "Hoc sinh khong duoc quyen xoa bai tap cua nguoi khac"
        print("  [✓] Chặn học sinh xóa bài tập của người khác thành công")

        # Người gửi A xóa bài tập
        status, del_ok = request("DELETE", f"/api/assignments/{assignment_id}", token=token_a)
        assert status == 200 and del_ok.get("deleted"), f"Xoa bai tap that bai: {del_ok}"
        print(f"  [✓] Người gửi A xóa bài tập {assignment_id} thành công")

        # Kiểm tra lại inbox của B: không còn bài tập đó
        status, inbox_after = request("GET", "/api/assignments/inbox", token=token_b)
        assert not any(a["id"] == assignment_id for a in inbox_after.get("assignments", []))
        print("  [✓] Bài tập đã biến mất khỏi Inbox người nhận sau khi bị xóa")

        print("\n" + "=" * 60)
        print("   TẤT CẢ CÁC BƯỚC KIỂM THỬ ĐÃ VƯỢT QUA 100% HOÀN HẢO!   ")
        print("=" * 60)

    finally:
        stop_test_server()


if __name__ == "__main__":
    run_tests()
