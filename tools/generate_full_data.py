# -*- coding: utf-8 -*-
"""
Script nâng cấp toàn diện ngân hàng câu hỏi TOÁN 9 theo toàn bộ tài liệu:
chuyen-de-co-ban-mon-toan-9-ket-noi-tri-thuc-voi-cuoc-song-tap-1
"""
import sys
import json
import re

sys.stdout.reconfigure(encoding='utf-8')

# 1. Danh sách Chủ Đề
TOPICS = [
  {
    "id": "can_thuc",
    "name": "Căn thức & Rút gọn",
    "icon": "√x",
    "description": "Căn bậc hai, căn bậc ba, điều kiện xác định, hằng đẳng thức và rút gọn biểu thức",
    "color": "from-amber-500 to-orange-600",
    "borderColor": "border-amber-500",
    "badge": "Đại số 9"
  },
  {
    "id": "he_phuong_trinh",
    "name": "Hệ hai phương trình",
    "icon": "{xy}",
    "description": "Hệ phương trình bậc nhất hai ẩn, giải hệ bằng phương pháp thế, cộng đại số và toán thực tế",
    "color": "from-blue-500 to-indigo-600",
    "borderColor": "border-blue-500",
    "badge": "Đại số 9"
  },
  {
    "id": "bat_phuong_trinh",
    "name": "Bất đẳng thức & BPT",
    "icon": "≥ ≤",
    "description": "Phương trình tích, phương trình chứa ẩn ở mẫu, bất phương trình bậc nhất một ẩn và BĐT AM-GM thực tế",
    "color": "from-emerald-500 to-teal-600",
    "borderColor": "border-emerald-500",
    "badge": "Đại số 9"
  },
  {
    "id": "he_thuc_luong",
    "name": "Hệ thức lượng & Lượng giác",
    "icon": "📐",
    "description": "Hệ thức lượng trong tam giác vuông, tỉ số lượng giác sin, cos, tan và bài toán đo đạc thực tế",
    "color": "from-cyan-500 to-blue-600",
    "borderColor": "border-cyan-500",
    "badge": "Hình học 9"
  },
  {
    "id": "duong_tron",
    "name": "Đường tròn & Tiếp tuyến",
    "icon": "⭕",
    "description": "Đường kính và dây cung, tiếp tuyến của đường tròn, tính chất hai tiếp tuyến cắt nhau",
    "color": "from-rose-500 to-pink-600",
    "borderColor": "border-rose-500",
    "badge": "Hình học 9"
  },
  {
    "id": "goc_duong_tron",
    "name": "Góc với đường tròn & Tứ giác nội tiếp",
    "icon": "🎯",
    "description": "Góc ở tâm, góc nội tiếp, tứ giác nội tiếp đường tròn và các dấu hiệu nhận biết",
    "color": "from-indigo-500 to-purple-600",
    "borderColor": "border-indigo-500",
    "badge": "Hình học 9"
  },
  {
    "id": "he_thuc_viet",
    "name": "Phương trình bậc hai & Vi-ét",
    "icon": "⚡",
    "description": "Biệt thức Delta, định lý Vi-ét, tính giá trị biểu thức nghiệm, tìm hai số biết tổng và tích",
    "color": "from-purple-500 to-fuchsia-600",
    "borderColor": "border-purple-500",
    "badge": "Ôn thi vào 10"
  },
  {
    "id": "ham_so_bac_hai",
    "name": "Hàm số & Parabol",
    "icon": "📈",
    "description": "Hàm số y = ax^2, sự tương giao giữa Parabol và đường thẳng y = mx + n",
    "color": "from-violet-500 to-purple-700",
    "borderColor": "border-violet-500",
    "badge": "Đại số 9"
  },
  {
    "id": "hinh_khong_gian",
    "name": "Hình trụ - Hình nón - Hình cầu",
    "icon": "🧊",
    "description": "Diện tích xung quanh, thể tích các hình khối không gian trong đời sống thực tế",
    "color": "from-teal-500 to-emerald-600",
    "borderColor": "border-teal-500",
    "badge": "Hình học 9"
  },
  {
    "id": "xac_suat_thong_ke",
    "name": "Xác suất & Thống kê 9",
    "icon": "📊",
    "description": "Bảng tần số, tần số tương đối, biểu đồ cột, biểu đồ quạt và xác suất biến cố",
    "color": "from-sky-500 to-cyan-600",
    "borderColor": "border-sky-500",
    "badge": "Xác suất 9"
  }
]

# 2. Xây dựng Ngân Hàng Câu Hỏi Toàn Diện
QUESTIONS = [
  # ==========================================
  # CHỦ ĐỀ 1: CĂN THỨC BẬC HAI & RÚT GỌN (CHƯƠNG 3)
  # ==========================================
  {
    "id": "ct_01",
    "topicId": "can_thuc",
    "title": "Điều kiện xác định của căn bậc hai",
    "content": "Biểu thức $\\sqrt{2x - 6}$ xác định khi và chỉ khi:",
    "options": ["$x \\ge 3$", "$x > 3$", "$x \\le 3$", "$x \\ge -3$"],
    "correctAnswer": 0,
    "explanation": "Biểu thức $\\sqrt{A}$ xác định $\\Leftrightarrow A \\ge 0$.\nTa có: $2x - 6 \\ge 0 \\Leftrightarrow 2x \\ge 6 \\Leftrightarrow x \\ge 3$.",
    "difficulty": "easy",
    "points": 10
  },
  {
    "id": "ct_02",
    "topicId": "can_thuc",
    "title": "Hằng đẳng thức căn bậc hai",
    "content": "Giá trị của biểu thức $\\sqrt{(\\sqrt{5} - 3)^2} + \\sqrt{5}$ bằng:",
    "options": ["$2\\sqrt{5} - 3$", "$3$", "$-3$", "$6 - \\sqrt{5}$"],
    "correctAnswer": 1,
    "explanation": "Ta có $\\sqrt{A^2} = |A|$.\nVì $\\sqrt{5} < \\sqrt{9} = 3 \\Rightarrow \\sqrt{5} - 3 < 0$.\nDo đó $\\sqrt{(\\sqrt{5} - 3)^2} = |\\sqrt{5} - 3| = 3 - \\sqrt{5}$.\nSuy ra: $(3 - \\sqrt{5}) + \\sqrt{5} = 3$.",
    "difficulty": "medium",
    "points": 15
  },
  {
    "id": "ct_03",
    "topicId": "can_thuc",
    "title": "Tính giá trị biểu thức căn bậc hai",
    "content": "Kết quả của phép tính $\\sqrt{20} - \\sqrt{45} + 2\\sqrt{5}$ là:",
    "options": ["$\\sqrt{5}$", "$3\\sqrt{5}$", "$-\\sqrt{5}$", "$5\\sqrt{5}$"],
    "correctAnswer": 0,
    "explanation": "Ta có:\n$\\sqrt{20} = \\sqrt{4 \\cdot 5} = 2\\sqrt{5}$\n$\\sqrt{45} = \\sqrt{9 \\cdot 5} = 3\\sqrt{5}$\nNên $\\sqrt{20} - \\sqrt{45} + 2\\sqrt{5} = 2\\sqrt{5} - 3\\sqrt{5} + 2\\sqrt{5} = \\sqrt{5}$.",
    "difficulty": "easy",
    "points": 10
  },
  {
    "id": "ct_04",
    "topicId": "can_thuc",
    "title": "Trục căn thức ở mẫu",
    "content": "Trục căn thức ở mẫu của biểu thức $\\frac{6}{\\sqrt{7} - 1}$ ta được kết quả:",
    "options": ["$\\sqrt{7} + 1$", "$\\sqrt{7} - 1$", "$6(\\sqrt{7} + 1)$", "$\\frac{\\sqrt{7} + 1}{6}$"],
    "correctAnswer": 0,
    "explanation": "Nhân cả tử và mẫu với lượng liên hợp $(\\sqrt{7} + 1)$:\n$$\\frac{6}{\\sqrt{7} - 1} = \\frac{6(\\sqrt{7} + 1)}{(\\sqrt{7} - 1)(\\sqrt{7} + 1)} = \\frac{6(\\sqrt{7} + 1)}{7 - 1} = \\frac{6(\\sqrt{7} + 1)}{6} = \\sqrt{7} + 1.$$",
    "difficulty": "medium",
    "points": 15
  },
  {
    "id": "ct_05",
    "topicId": "can_thuc",
    "title": "Rút gọn biểu thức tổng hợp",
    "content": "Rút gọn biểu thức $A = \\left(\\frac{1}{\\sqrt{x}-2} - \\frac{1}{\\sqrt{x}+2}\\right) \\cdot \\frac{x-4}{4}$ với $x \\ge 0, x \\ne 4$:",
    "options": ["$1$", "$\\sqrt{x}$", "$\\frac{1}{\\sqrt{x}}$", "$4$"],
    "correctAnswer": 0,
    "explanation": "Quy đồng trong ngoặc:\n$$\\frac{(\\sqrt{x}+2) - (\\sqrt{x}-2)}{(\\sqrt{x}-2)(\\sqrt{x}+2)} = \\frac{4}{x-4}$$\nNhân với phần còn lại: $\\frac{4}{x-4} \\cdot \\frac{x-4}{4} = 1$.",
    "difficulty": "medium",
    "points": 15
  },
  {
    "id": "ct_06",
    "topicId": "can_thuc",
    "title": "Tìm x nguyên để biểu thức nguyên",
    "content": "Cho biểu thức $P = \\frac{\\sqrt{x} + 3}{\\sqrt{x} - 1}$ ($x \\ge 0, x \\ne 1$). Có bao nhiêu giá trị $x$ nguyên để $P$ nhận giá trị nguyên?",
    "options": ["$3$", "$4$", "$2$", "$5$"],
    "correctAnswer": 1,
    "explanation": "Ta có $P = 1 + \\frac{4}{\\sqrt{x}-1}$. Để $P \\in \\mathbb{Z}$ thì $(\\sqrt{x}-1) \\in \\{-1, 1, 2, 4\\} \\Rightarrow x \\in \\{0, 4, 9, 25\\}$ (4 giá trị).",
    "difficulty": "hard",
    "points": 20
  },
  {
    "id": "ct_07",
    "topicId": "can_thuc",
    "title": "Căn bậc hai số học",
    "content": "Căn bậc hai số học của số 81 là:",
    "options": ["$9$", "$-9$", "$\\pm 9$", "$81$"],
    "correctAnswer": 0,
    "explanation": "Theo định nghĩa SGK Toán 9 (GDPT 2018): Với số dương $a$, số $\\sqrt{a}$ được gọi là căn bậc hai số học của $a$. Do đó căn bậc hai số học của 81 là $\\sqrt{81} = 9$.",
    "difficulty": "easy",
    "points": 10
  },
  {
    "id": "ct_08",
    "topicId": "can_thuc",
    "title": "Trục căn thức liên hợp bậc hai",
    "content": "Trục căn thức ở mẫu của phân số $\\frac{2}{\\sqrt{5} - \\sqrt{3}}$ ta được:",
    "options": ["$\\sqrt{5} + \\sqrt{3}$", "$2(\\sqrt{5} + \\sqrt{3})$", "$\\sqrt{5} - \\sqrt{3}$", "$\\frac{\\sqrt{5} + \\sqrt{3}}{2}$"],
    "correctAnswer": 0,
    "explanation": "Nhân cả tử và mẫu với $(\\sqrt{5} + \\sqrt{3})$:\n$$\\frac{2(\\sqrt{5}+\\sqrt{3})}{(\\sqrt{5}-\\sqrt{3})(\\sqrt{5}+\\sqrt{3})} = \\frac{2(\\sqrt{5}+\\sqrt{3})}{5 - 3} = \\frac{2(\\sqrt{5}+\\sqrt{3})}{2} = \\sqrt{5} + \\sqrt{3}.$$",
    "difficulty": "easy",
    "points": 10
  },
  {
    "id": "ct_09",
    "topicId": "can_thuc",
    "title": "Khai phương biểu thức chứa biến",
    "content": "Rút gọn biểu thức $\\sqrt{9a^2b^4}$ với điều kiện $a < 0$ ta được:",
    "options": ["$-3ab^2$", "$3ab^2$", "$3a^2b^2$", "$-3a^2b^2$"],
    "correctAnswer": 0,
    "explanation": "Ta có: $\\sqrt{9a^2b^4} = 3|a|b^2$. Vì $a < 0$ nên $|a| = -a$. Do đó kết quả là $-3ab^2$.",
    "difficulty": "medium",
    "points": 15
  },
  {
    "id": "ct_10",
    "topicId": "can_thuc",
    "title": "Căn thức lồng nhau dạng hằng đẳng thức",
    "content": "Giá trị của biểu thức $P = \\sqrt{7 - 4\\sqrt{3}} + \\sqrt{7 + 4\\sqrt{3}}$ bằng:",
    "options": ["$4$", "$2\\sqrt{3}$", "$2\\sqrt{7}$", "$14$"],
    "correctAnswer": 0,
    "explanation": "Ta có: $7 \\pm 4\\sqrt{3} = (2 \\pm \\sqrt{3})^2$. Suy ra $P = |2 - \\sqrt{3}| + |2 + \\sqrt{3}| = (2 - \\sqrt{3}) + (2 + \\sqrt{3}) = 4$.",
    "difficulty": "medium",
    "points": 15
  },
  {
    "id": "ct_11",
    "topicId": "can_thuc",
    "title": "Phương trình vô tỷ cơ bản",
    "content": "Tập nghiệm của phương trình $\\sqrt{2x + 5} = 3$ là:",
    "options": ["$\\{2\\}$", "$\\{7\\}$", "$\\{-2\\}$", "$\\{4\\}$"],
    "correctAnswer": 0,
    "explanation": "Điều kiện $2x + 5 \\ge 0 \\Leftrightarrow x \\ge -2{,}5$.\n$2x + 5 = 3^2 = 9 \\Leftrightarrow 2x = 4 \\Leftrightarrow x = 2$ (thỏa mãn).",
    "difficulty": "easy",
    "points": 10
  },
  {
    "id": "ct_12",
    "topicId": "can_thuc",
    "title": "So sánh biểu thức chứa căn",
    "content": "Tìm tất cả các giá trị của $x$ để biểu thức $P = \\frac{\\sqrt{x} - 2}{\\sqrt{x} + 1}$ nhận giá trị âm ($P < 0$):",
    "options": ["$0 \\le x < 4$", "$x < 4$", "$x > 4$", "$0 < x < 2$"],
    "correctAnswer": 0,
    "explanation": "Điều kiện $x \\ge 0$. Vì $\\sqrt{x} + 1 > 0$ nên $P < 0 \\Leftrightarrow \\sqrt{x} - 2 < 0 \\Leftrightarrow \\sqrt{x} < 2 \\Leftrightarrow 0 \\le x < 4$.",
    "difficulty": "medium",
    "points": 15
  },
  {
    "id": "ct_13",
    "topicId": "can_thuc",
    "title": "Giá trị nhỏ nhất của biểu thức căn",
    "content": "Giá trị nhỏ nhất của biểu thức $A = x - 4\\sqrt{x} + 7$ (với $x \\ge 0$) bằng:",
    "options": ["$3$", "$7$", "$4$", "$-9$"],
    "correctAnswer": 0,
    "explanation": "$A = (\\sqrt{x} - 2)^2 + 3 \\ge 3$. Dấu bằng xảy ra khi $\\sqrt{x} = 2 \\Leftrightarrow x = 4$. Vậy $\\min A = 3$.",
    "difficulty": "hard",
    "points": 20
  },
  {
    "id": "ct_14",
    "topicId": "can_thuc",
    "title": "Căn bậc ba của số thực",
    "content": "Kết quả của phép tính $\\sqrt[3]{-125} + \\sqrt[3]{64}$ là:",
    "options": ["$-1$", "$1$", "$-9$", "Không xác định"],
    "correctAnswer": 0,
    "explanation": "$\\sqrt[3]{-125} = -5$ và $\\sqrt[3]{64} = 4$. Do đó: $-5 + 4 = -1$.",
    "difficulty": "easy",
    "points": 10
  },

  # ==========================================
  # CHỦ ĐỀ 2: PHƯƠNG TRÌNH & HỆ HAI PHƯƠNG TRÌNH (CHƯƠNG 1)
  # ==========================================
  {
    "id": "hpt_01",
    "topicId": "he_phuong_trinh",
    "title": "Nhận biết nghiệm của hệ phương trình",
    "content": "Cặp số nào sau đây là nghiệm của hệ phương trình $\\begin{cases} 2x + y = 5 \\\\ x - 3y = -1 \\end{cases}$?",
    "options": ["$(2; 1)$", "$(1; 2)$", "$(3; -1)$", "$(0; 5)$"],
    "correctAnswer": 0,
    "explanation": "Thay $(2; 1)$ vào hệ: $2(2) + 1 = 5$ (đúng) và $2 - 3(1) = -1$ (đúng).",
    "difficulty": "easy",
    "points": 10
  },
  {
    "id": "hpt_02",
    "topicId": "he_phuong_trinh",
    "title": "Giải hệ bằng phương pháp thế",
    "content": "Nghiệm $(x; y)$ của hệ phương trình $\\begin{cases} x - 2y = 1 \\\\ 3x + y = 10 \\end{cases}$ là:",
    "options": ["$(3; 1)$", "$(1; 3)$", "$(5; 2)$", "$(2; 4)$"],
    "correctAnswer": 0,
    "explanation": "$x = 2y + 1$. Thay vào PT 2: $3(2y+1) + y = 10 \\Leftrightarrow 7y = 7 \\Leftrightarrow y = 1 \\Rightarrow x = 3$.",
    "difficulty": "medium",
    "points": 15
  },
  {
    "id": "hpt_03",
    "topicId": "he_phuong_trinh",
    "title": "Giải hệ bằng phương pháp cộng đại số",
    "content": "Hệ phương trình $\\begin{cases} 3x + 2y = 7 \\\\ 2x - 2y = 8 \\end{cases}$ có nghiệm là:",
    "options": ["$(3; -1)$", "$(1; 2)$", "$(2; 1)$", "$(-1; 3)$"],
    "correctAnswer": 0,
    "explanation": "Cộng hai phương trình: $5x = 15 \\Rightarrow x = 3$. Thay vào PT 1: $3(3) + 2y = 7 \\Rightarrow y = -1$.",
    "difficulty": "easy",
    "points": 10
  },
  {
    "id": "hpt_04",
    "topicId": "he_phuong_trinh",
    "title": "Bài toán thực tế canô chuyển động",
    "content": "Một canô xuôi dòng một khúc sông hết 2 giờ và ngược dòng hết 3 giờ. Biết vận tốc dòng nước là $3\\text{ km/h}$. Vận tốc thực của canô là:",
    "options": ["$15\\text{ km/h}$", "$12\\text{ km/h}$", "$18\\text{ km/h}$", "$20\\text{ km/h}$"],
    "correctAnswer": 0,
    "explanation": "$2(v + 3) = 3(v - 3) \\Leftrightarrow 2v + 6 = 3v - 9 \\Leftrightarrow v = 15\\text{ km/h}$.",
    "difficulty": "medium",
    "points": 15
  },
  {
    "id": "hpt_05",
    "topicId": "he_phuong_trinh",
    "title": "Tìm tham số m để hệ có nghiệm duy nhất",
    "content": "Cho hệ phương trình $\\begin{cases} mx + 2y = 1 \\\\ 3x + my = 2 \\end{cases}$. Hệ có nghiệm duy nhất khi và chỉ khi:",
    "options": ["$m \\ne \\pm\\sqrt{6}$", "$m \\ne 6$", "$m = \\sqrt{6}$", "$m > 0$"],
    "correctAnswer": 0,
    "explanation": "Hệ có nghiệm duy nhất khi $\\frac{m}{3} \\ne \\frac{2}{m} \\Leftrightarrow m^2 \\ne 6 \\Leftrightarrow m \\ne \\pm\\sqrt{6}$.",
    "difficulty": "hard",
    "points": 20
  },
  {
    "id": "hpt_06",
    "topicId": "he_phuong_trinh",
    "title": "Phương trình bậc nhất hai ẩn",
    "content": "Cặp số nào sau đây KHÔNG PHẢI là nghiệm của phương trình $2x - 3y = 7$?",
    "options": ["$(2; 1)$", "$(5; 1)$", "$(2; -1)$", "(-1; -3)"],
    "correctAnswer": 0,
    "explanation": "Thay $(2; 1)$ vào phương trình: $2(2) - 3(1) = 4 - 3 = 1 \\ne 7$.",
    "difficulty": "easy",
    "points": 10
  },
  {
    "id": "hpt_07",
    "topicId": "he_phuong_trinh",
    "title": "Số nghiệm của hệ phương trình",
    "content": "Hệ phương trình $\\begin{cases} 2x - y = 3 \\\\ 4x - 2y = 6 \\end{cases}$ có bao nhiêu nghiệm?",
    "options": ["Vô số nghiệm", "Vô nghiệm", "Có 1 nghiệm duy nhất", "Có 2 nghiệm"],
    "correctAnswer": 0,
    "explanation": "Do $\\frac{2}{4} = \\frac{-1}{-2} = \\frac{3}{6} = \\frac{1}{2}$ nên 2 đường thẳng trùng nhau, hệ có vô số nghiệm.",
    "difficulty": "easy",
    "points": 10
  },
  {
    "id": "hpt_08",
    "topicId": "he_phuong_trinh",
    "title": "Hệ phương trình quy về bậc nhất (ẩn phụ)",
    "content": "Nghiệm của hệ phương trình $\\begin{cases} \\frac{1}{x} + \\frac{1}{y} = \\frac{5}{6} \\\\ \\frac{1}{x} - \\frac{1}{y} = \\frac{1}{6} \\end{cases}$ là:",
    "options": ["$(2; 3)$", "$(3; 2)$", "$(1; 6)$", "$(\\frac{1}{2}; \\frac{1}{3})$"],
    "correctAnswer": 0,
    "explanation": "Đặt $u = \\frac{1}{x}, v = \\frac{1}{y} \\Rightarrow u = \\frac{1}{2}, v = \\frac{1}{3} \\Rightarrow x = 2, y = 3$.",
    "difficulty": "medium",
    "points": 15
  },
  {
    "id": "hpt_09",
    "topicId": "he_phuong_trinh",
    "title": "Bài toán thực tế làm chung làm riêng",
    "content": "Hai đội công nhân cùng sửa một đoạn đường trong 12 ngày thì xong. Nếu đội I làm một mình trong 4 ngày rồi đội II làm tiếp trong 9 ngày thì được $\\frac{7}{12}$ công việc. Hỏi đội I làm một mình mất bao nhiêu ngày?",
    "options": ["$20\\text{ ngày}$", "$30\\text{ ngày}$", "$24\\text{ ngày}$", "$18\\text{ ngày}$"],
    "correctAnswer": 0,
    "explanation": "Hệ phương trình: $\\frac{1}{x} + \\frac{1}{y} = \\frac{1}{12}$ và $\\frac{4}{x} + \\frac{9}{y} = \\frac{7}{12} \\Rightarrow x = 20, y = 30$.",
    "difficulty": "hard",
    "points": 20
  },

  # ==========================================
  # CHỦ ĐỀ 3: BẤT ĐẲNG THỨC & BẤT PHƯƠNG TRÌNH (CHƯƠNG 2)
  # ==========================================
  {
    "id": "bpt_01",
    "topicId": "bat_phuong_trinh",
    "title": "Tính chất thứ tự khi nhân với số âm",
    "content": "Cho $a < b$. Khẳng định nào sau đây là ĐÚNG?",
    "options": ["$-3a > -3b$", "$-3a < -3b$", "$a - 2 > b - 2$", "$3a > 3b$"],
    "correctAnswer": 0,
    "explanation": "Nhân hai vế với số âm $-3$ làm bất đẳng thức đổi chiều: $-3a > -3b$.",
    "difficulty": "easy",
    "points": 10
  },
  {
    "id": "bpt_02",
    "topicId": "bat_phuong_trinh",
    "title": "Giải bất phương trình bậc nhất một ẩn",
    "content": "Tập nghiệm của bất phương trình $3x - 5 > x + 1$ là:",
    "options": ["$x > 3$", "$x < 3$", "$x > 2$", "$x \\ge 3$"],
    "correctAnswer": 0,
    "explanation": "$3x - x > 1 + 5 \\Leftrightarrow 2x > 6 \\Leftrightarrow x > 3$.",
    "difficulty": "easy",
    "points": 10
  },
  {
    "id": "bpt_03",
    "topicId": "bat_phuong_trinh",
    "title": "Ứng dụng BĐT AM-GM trong thực tế",
    "content": "Một người rào một mảnh vườn hình chữ nhật diện tích $100\\text{ m}^2$. Để chu vi hàng rào nhỏ nhất (tiết kiệm chi phí nhất), chiều dài và chiều rộng mảnh vườn phải là:",
    "options": ["$10\\text{ m và } 10\\text{ m}$", "$20\\text{ m và } 5\\text{ m}$", "$25\\text{ m và } 4\\text{ m}$", "$50\\text{ m và } 2\\text{ m}$"],
    "correctAnswer": 0,
    "explanation": "Theo AM-GM: $P = 2(a + b) \\ge 4\\sqrt{ab} = 40$. Dấu bằng khi $a = b = 10\\text{ m}$.",
    "difficulty": "medium",
    "points": 15
  },
  {
    "id": "bpt_04",
    "topicId": "bat_phuong_trinh",
    "title": "Phương trình tích",
    "content": "Tập nghiệm của phương trình $(2x - 6)(x + 5) = 0$ là:",
    "options": ["$S = \\{3; -5\\}$", "$S = \\{-3; 5\\}$", "$S = \\{3; 5\\}$", "$S = \\{-3; -5\\}$"],
    "correctAnswer": 0,
    "explanation": "$2x - 6 = 0 \\Leftrightarrow x = 3$ hoặc $x + 5 = 0 \\Leftrightarrow x = -5$.",
    "difficulty": "easy",
    "points": 10
  },
  {
    "id": "bpt_05",
    "topicId": "bat_phuong_trinh",
    "title": "Phương trình chứa ẩn ở mẫu",
    "content": "Điều kiện xác định của phương trình $\\frac{x+1}{x-2} = \\frac{3}{x+2}$ là:",
    "options": ["$x \\ne 2$ và $x \\ne -2$", "$x \\ne 2$", "$x \\ne -2$", "$x \\ne 0$"],
    "correctAnswer": 0,
    "explanation": "Mẫu thức phải khác 0: $x - 2 \\ne 0$ và $x + 2 \\ne 0 \\Leftrightarrow x \\ne \\pm 2$.",
    "difficulty": "easy",
    "points": 10
  },
  {
    "id": "bpt_06",
    "topicId": "bat_phuong_trinh",
    "title": "Nghiệm nguyên lớn nhất của bất phương trình",
    "content": "Số nguyên $x$ lớn nhất thỏa mãn bất phương trình $5 - 2x > 1$ là:",
    "options": ["$1$", "$2$", "$0$", "$3$"],
    "correctAnswer": 0,
    "explanation": "$5 - 2x > 1 \\Leftrightarrow -2x > -4 \\Leftrightarrow x < 2$. Số nguyên lớn nhất là 1.",
    "difficulty": "medium",
    "points": 15
  },
  {
    "id": "bpt_07",
    "topicId": "bat_phuong_trinh",
    "title": "Bất đẳng thức Cauchy dạng phân thức (Schwarz)",
    "content": "Cho hai số dương $x, y$ thỏa mãn $x + y = 2$. Giá trị nhỏ nhất của $P = \\frac{1}{x} + \\frac{1}{y}$ bằng:",
    "options": ["$2$", "$1$", "$4$", "$\\frac{1}{2}$"],
    "correctAnswer": 0,
    "explanation": "Theo BĐT Cauchy-Schwarz dạng Engel: $\\frac{1}{x} + \\frac{1}{y} \\ge \\frac{(1+1)^2}{x+y} = \\frac{4}{2} = 2$. Dấu \"=\" xảy ra khi $x = y = 1$.",
    "difficulty": "hard",
    "points": 20
  },

  # ==========================================
  # CHỦ ĐỀ 4: HỆ THỨC LƯỢNG TRONG TAM GIÁC VUÔNG (CHƯƠNG 4)
  # ==========================================
  {
    "id": "htl_01",
    "topicId": "he_thuc_luong",
    "title": "Hệ thức về đường cao tam giác vuông",
    "content": "Cho tam giác $ABC$ vuông tại $A$, đường cao $AH$. Biết $BH = 4\\text{ cm}, CH = 9\\text{ cm}$. Độ dài đường cao $AH$ bằng:",
    "options": ["$6\\text{ cm}$", "$13\\text{ cm}$", "$36\\text{ cm}$", "$\\sqrt{13}\\text{ cm}$"],
    "correctAnswer": 0,
    "explanation": "$AH^2 = BH \\cdot CH = 4 \\cdot 9 = 36 \\Rightarrow AH = 6\\text{ cm}$.",
    "difficulty": "easy",
    "points": 10
  },
  {
    "id": "htl_02",
    "topicId": "he_thuc_luong",
    "title": "Tỉ số lượng giác góc nhọn",
    "content": "Cho tam giác $ABC$ vuông tại $A$ có $AB = 3\\text{ cm}, AC = 4\\text{ cm}$. Giá trị của $\\sin B$ bằng:",
    "options": ["$\\frac{4}{5}$", "$\\frac{3}{5}$", "$\\frac{3}{4}$", "$\\frac{4}{3}$"],
    "correctAnswer": 0,
    "explanation": "Cạnh huyền $BC = \\sqrt{3^2 + 4^2} = 5\\text{ cm}$. $\\sin B = \\frac{AC}{BC} = \\frac{4}{5}$.",
    "difficulty": "easy",
    "points": 10
  },
  {
    "id": "htl_03",
    "topicId": "he_thuc_luong",
    "title": "Bài toán thực tế đo bóng cây",
    "content": "Một cột cờ cao đổ bóng trên mặt đất dài $7\\text{ m}$. Biết góc tạo bởi tia nắng mặt trời và mặt đất là $40^\\circ$. Chiều cao của cột cờ (làm tròn đến hàng phần mười) là:",
    "options": ["$5{,}9\\text{ m}$", "$5{,}4\\text{ m}$", "$4{,}5\\text{ m}$", "$8{,}3\\text{ m}$"],
    "correctAnswer": 0,
    "explanation": "$h = 7 \\cdot \\tan 40^\\circ \\approx 7 \\cdot 0{,}8391 \\approx 5{,}9\\text{ m}$.",
    "difficulty": "medium",
    "points": 15
  },
  {
    "id": "htl_04",
    "topicId": "he_thuc_luong",
    "title": "Hệ thức liên hệ giữa cạnh và góc",
    "content": "Trong tam giác $ABC$ vuông tại $A$, khẳng định nào sau đây là ĐÚNG?",
    "options": ["$b = a \\cdot \\sin B$", "$b = c \\cdot \\sin B$", "$c = a \\cdot \\tan C$", "$b = a \\cdot \\cos B$"],
    "correctAnswer": 0,
    "explanation": "Cạnh góc vuông bằng cạnh huyền nhân sin góc đối: $b = a \\cdot \\sin B$.",
    "difficulty": "easy",
    "points": 10
  },
  {
    "id": "htl_05",
    "topicId": "he_thuc_luong",
    "title": "Tỉ số lượng giác hai góc phụ nhau",
    "content": "Giá trị của biểu thức $P = \\sin^2 35^\\circ + \\sin^2 55^\\circ - \\tan 20^\\circ \\cdot \\tan 70^\\circ$ bằng:",
    "options": ["$0$", "$1$", "$2$", "$-1$"],
    "correctAnswer": 0,
    "explanation": "$\\sin 55^\\circ = \\cos 35^\\circ \\Rightarrow \\sin^2 35^\\circ + \\cos^2 35^\\circ = 1$.\n$\\tan 70^\\circ = \\cot 20^\\circ \\Rightarrow \\tan 20^\\circ \\cdot \\cot 20^\\circ = 1$. Suy ra $1 - 1 = 0$.",
    "difficulty": "medium",
    "points": 15
  },
  {
    "id": "htl_06",
    "topicId": "he_thuc_luong",
    "title": "Tính hình chiếu cạnh góc vuông",
    "content": "Cho tam giác $ABC$ vuông tại $A$ có $AB = 6\\text{ cm}, AC = 8\\text{ cm}$, đường cao $AH$. Độ dài đoạn thẳng $BH$ bằng:",
    "options": ["$3{,}6\\text{ cm}$", "$4{,}8\\text{ cm}$", "$6{,}4\\text{ cm}$", "$5\\text{ cm}$"],
    "correctAnswer": 0,
    "explanation": "$BC = 10\\text{ cm}$. $AB^2 = BC \\cdot BH \\Rightarrow BH = \\frac{6^2}{10} = 3{,}6\\text{ cm}$.",
    "difficulty": "medium",
    "points": 15
  },

  # ==========================================
  # CHỦ ĐỀ 5: ĐƯỜNG TRÒN & TIẾP TUYẾN (CHƯƠNG 5)
  # ==========================================
  {
    "id": "dt_01",
    "topicId": "duong_tron",
    "title": "Đường kính vuông góc với dây cung",
    "content": "Cho đường tròn $(O; 10\\text{ cm})$ và dây cung $AB = 16\\text{ cm}$. Khoảng cách từ tâm $O$ đến dây $AB$ bằng:",
    "options": ["$6\\text{ cm}$", "$8\\text{ cm}$", "$12\\text{ cm}$", "$4\\text{ cm}$"],
    "correctAnswer": 0,
    "explanation": "Đường kính vuông góc với dây đi qua trung điểm dây: $AH = 8\\text{ cm}$. $OH = \\sqrt{10^2 - 8^2} = 6\\text{ cm}$.",
    "difficulty": "easy",
    "points": 10
  },
  {
    "id": "dt_02",
    "topicId": "duong_tron",
    "title": "Tính chất hai tiếp tuyến cắt nhau",
    "content": "Từ điểm $M$ ngoài đường tròn $(O; R)$ kẻ hai tiếp tuyến $MA, MB$ ($A, B$ là tiếp điểm). Khẳng định nào sau đây SAI?",
    "options": ["$MA \\perp MB$", "$MA = MB$", "$MO$ là phân giác góc $\\widehat{AMB}$", "$MO \\perp AB$"],
    "correctAnswer": 0,
    "explanation": "$MA \\perp MB$ chỉ đúng khi $\\widehat{AMB} = 90^\\circ$, không phải luôn đúng.",
    "difficulty": "medium",
    "points": 15
  },
  {
    "id": "dt_03",
    "topicId": "duong_tron",
    "title": "Vị trí tương đối của hai đường tròn",
    "content": "Cho hai đường tròn $(O; 5\\text{ cm})$ và $(O'; 3\\text{ cm})$. Biết đoạn nối tâm $OO' = 8\\text{ cm}$. Vị trí tương đối của hai đường tròn là:",
    "options": ["Tiếp xúc ngoài", "Tiếp xúc trong", "Cắt nhau", "Ở ngoài nhau"],
    "correctAnswer": 0,
    "explanation": "$OO' = R_1 + R_2 = 5 + 3 = 8\\text{ cm}$ nên tiếp xúc ngoài.",
    "difficulty": "easy",
    "points": 10
  },
  {
    "id": "dt_04",
    "topicId": "duong_tron",
    "title": "Tiếp tuyến của đường tròn",
    "content": "Đường thẳng $d$ là tiếp tuyến của đường tròn $(O; R)$ khi và chỉ khi khoảng cách $h$ từ $O$ đến $d$ thỏa mãn:",
    "options": ["$h = R$", "$h < R$", "$h > R$", "$h = 2R$"],
    "correctAnswer": 0,
    "explanation": "Tiếp tuyến khi khoảng cách từ tâm đến đường thẳng bằng bán kính: $h = R$.",
    "difficulty": "easy",
    "points": 10
  },
  {
    "id": "dt_05",
    "topicId": "duong_tron",
    "title": "Dây cung lớn nhất của đường tròn",
    "content": "Dây cung lớn nhất của đường tròn $(O; R = 7\\text{ cm})$ có độ dài bằng:",
    "options": ["$14\\text{ cm}$", "$7\\text{ cm}$", "$21\\text{ cm}$", "$7\\pi\\text{ cm}$"],
    "correctAnswer": 0,
    "explanation": "Dây lớn nhất là đường kính: $2R = 14\\text{ cm}$.",
    "difficulty": "easy",
    "points": 10
  },
  {
    "id": "dt_06",
    "topicId": "duong_tron",
    "title": "Tâm đường tròn ngoại tiếp tam giác vuông",
    "content": "Tâm đường tròn ngoại tiếp một tam giác vuông nằm tại:",
    "options": ["Trung điểm của cạnh huyền", "Trực tâm của tam giác", "Trọng tâm của tam giác", "Đỉnh góc vuông"],
    "correctAnswer": 0,
    "explanation": "Trung điểm cạnh huyền cách đều 3 đỉnh trong tam giác vuông nên là tâm đường tròn ngoại tiếp.",
    "difficulty": "easy",
    "points": 10
  },

  # ==========================================
  # CHỦ ĐỀ 6: GÓC VỚI ĐƯỜNG TRÒN & TỨ GIÁC NỘI TIẾP
  # ==========================================
  {
    "id": "gdt_01",
    "topicId": "goc_duong_tron",
    "title": "Góc nội tiếp chắn nửa đường tròn",
    "content": "Cho tam giác $ABC$ nội tiếp đường tròn $(O)$ có đường kính $BC$. Khi đó số đo của góc $\\widehat{BAC}$ bằng:",
    "options": ["$90^\\circ$", "$60^\\circ$", "$45^\\circ$", "$180^\\circ$"],
    "correctAnswer": 0,
    "explanation": "Góc nội tiếp chắn nửa đường tròn là góc vuông ($90^\\circ$).",
    "difficulty": "easy",
    "points": 10
  },
  {
    "id": "gdt_02",
    "topicId": "goc_duong_tron",
    "title": "Quan hệ giữa góc ở tâm và góc nội tiếp",
    "content": "Trong một đường tròn, nếu góc ở tâm có số đo bằng $80^\\circ$ thì góc nội tiếp cùng chắn cung đó có số đo là:",
    "options": ["$40^\\circ$", "$80^\\circ$", "$160^\\circ$", "$20^\\circ$"],
    "correctAnswer": 0,
    "explanation": "Góc nội tiếp bằng nửa góc ở tâm cùng chắn cung: $80^\\circ / 2 = 40^\\circ$.",
    "difficulty": "easy",
    "points": 10
  },
  {
    "id": "gdt_03",
    "topicId": "goc_duong_tron",
    "title": "Tổng hai góc đối của tứ giác nội tiếp",
    "content": "Cho tứ giác $ABCD$ nội tiếp đường tròn. Biết $\\widehat{A} = 75^\\circ$, số đo của góc $\\widehat{C}$ bằng:",
    "options": ["$105^\\circ$", "$75^\\circ$", "$115^\\circ$", "$85^\\circ$"],
    "correctAnswer": 0,
    "explanation": "Tổng 2 góc đối bằng $180^\\circ \\Rightarrow \\widehat{C} = 180^\\circ - 75^\\circ = 105^\\circ$.",
    "difficulty": "easy",
    "points": 10
  },
  {
    "id": "gdt_04",
    "topicId": "goc_duong_tron",
    "title": "Dấu hiệu nhận biết tứ giác nội tiếp",
    "content": "Hình nào sau đây CHƯA CHẮC là tứ giác nội tiếp đường tròn?",
    "options": ["Hình thoi", "Hình chữ nhật", "Hình vuông", "Hình thang cân"],
    "correctAnswer": 0,
    "explanation": "Hình thoi chỉ nội tiếp khi nó là hình vuông.",
    "difficulty": "medium",
    "points": 15
  },

  # ==========================================
  # CHỦ ĐỀ 7: PHƯƠNG TRÌNH BẬC HAI & HỆ THỨC VI-ÉT
  # ==========================================
  {
    "id": "viet_01",
    "topicId": "he_thuc_viet",
    "title": "Định lý Vi-ét tính tổng và tích nghiệm",
    "content": "Gọi $x_1, x_2$ là hai nghiệm của phương trình $x^2 - 5x + 6 = 0$. Giá trị của tổng $S = x_1 + x_2$ và tích $P = x_1 x_2$ lần lượt là:",
    "options": ["$S = 5; P = 6$", "$S = -5; P = 6$", "$S = 5; P = -6$", "$S = -5; P = -6$"],
    "correctAnswer": 0,
    "explanation": "$S = -\\frac{b}{a} = 5$; $P = \\frac{c}{a} = 6$.",
    "difficulty": "easy",
    "points": 10
  },
  {
    "id": "viet_02",
    "topicId": "he_thuc_viet",
    "title": "Tính tổng bình phương hai nghiệm",
    "content": "Cho phương trình $x^2 - 4x - 3 = 0$ có 2 nghiệm $x_1, x_2$. Giá trị của biểu thức $A = x_1^2 + x_2^2$ bằng:",
    "options": ["$22$", "$10$", "$16$", "$13$"],
    "correctAnswer": 0,
    "explanation": "$x_1^2 + x_2^2 = (x_1 + x_2)^2 - 2x_1 x_2 = 4^2 - 2(-3) = 16 + 6 = 22$.",
    "difficulty": "medium",
    "points": 15
  },
  {
    "id": "viet_03",
    "topicId": "he_thuc_viet",
    "title": "Tìm m để phương trình có 2 nghiệm trái dấu",
    "content": "Phương trình $x^2 - 2x + m - 3 = 0$ có hai nghiệm trái dấu khi và chỉ khi:",
    "options": ["$m < 3$", "$m > 3$", "$m \\le 3$", "$m < 4$"],
    "correctAnswer": 0,
    "explanation": "Phương trình có 2 nghiệm trái dấu $\\Leftrightarrow a \\cdot c < 0 \\Leftrightarrow 1(m - 3) < 0 \\Leftrightarrow m < 3$.",
    "difficulty": "medium",
    "points": 15
  },
  {
    "id": "viet_04",
    "topicId": "he_thuc_viet",
    "title": "Tìm hai số biết tổng và tích",
    "content": "Hai số có tổng bằng 9 và tích bằng 20 là hai nghiệm của phương trình nào?",
    "options": ["$X^2 - 9X + 20 = 0$", "$X^2 + 9X + 20 = 0$", "$X^2 - 20X + 9 = 0$", "$X^2 - 9X - 20 = 0$"],
    "correctAnswer": 0,
    "explanation": "Phương trình $X^2 - SX + P = 0 \\Rightarrow X^2 - 9X + 20 = 0$.",
    "difficulty": "easy",
    "points": 10
  },

  # ==========================================
  # CHỦ ĐỀ 8: HÀM SỐ Y = AX^2 & TƯƠNG GIAO PARABOL
  # ==========================================
  {
    "id": "hs_01",
    "topicId": "ham_so_bac_hai",
    "title": "Xác định hệ số a của Parabol",
    "content": "Điểm $M(-2; 8)$ thuộc đồ thị hàm số $y = ax^2$. Khi đó hệ số $a$ bằng:",
    "options": ["$2$", "$-2$", "$4$", "$-4$"],
    "correctAnswer": 0,
    "explanation": "$8 = a(-2)^2 = 4a \\Rightarrow a = 2$.",
    "difficulty": "easy",
    "points": 10
  },
  {
    "id": "hs_02",
    "topicId": "ham_so_bac_hai",
    "title": "Giao điểm của Parabol và đường thẳng",
    "content": "Tọa độ giao điểm của parabol $(P): y = x^2$ và đường thẳng $(d): y = 2x + 3$ là:",
    "options": ["$(-1; 1)$ và $(3; 9)$", "$(1; 1)$ và $(-3; 9)$", "$(2; 4)$ và $(-1; 1)$", "$(3; 9)$ và $(1; 1)$"],
    "correctAnswer": 0,
    "explanation": "$x^2 - 2x - 3 = 0 \\Rightarrow x_1 = -1 (y=1), x_2 = 3 (y=9)$.",
    "difficulty": "medium",
    "points": 15
  },

  # ==========================================
  # CHỦ ĐỀ 9: HÌNH HỌC KHÔNG GIAN (CHƯƠNG TRÌNH 9)
  # ==========================================
  {
    "id": "hkg_01",
    "topicId": "hinh_khong_gian",
    "title": "Thể tích hình trụ tròn xoay",
    "content": "Một lon sữa đặc có dạng hình trụ với bán kính đáy $r = 4\\text{ cm}$ và chiều cao $h = 10\\text{ cm}$. Thể tích của lon sữa là:",
    "options": ["$160\\pi\\text{ cm}^3$", "$80\\pi\\text{ cm}^3$", "$40\\pi\\text{ cm}^3$", "$320\\pi\\text{ cm}^3$"],
    "correctAnswer": 0,
    "explanation": "$V = \\pi r^2 h = \\pi \\cdot 4^2 \\cdot 10 = 160\\pi\\text{ cm}^3$.",
    "difficulty": "easy",
    "points": 10
  },
  {
    "id": "hkg_02",
    "topicId": "hinh_khong_gian",
    "title": "Diện tích mặt cầu",
    "content": "Một quả bóng đá có bán kính $R = 11\\text{ cm}$. Diện tích da bọc mặt ngoài quả bóng (diện tích mặt cầu) là:",
    "options": ["$484\\pi\\text{ cm}^2$", "$121\\pi\\text{ cm}^2$", "$\\frac{5324}{3}\\pi\\text{ cm}^3$", "$242\\pi\\text{ cm}^2$"],
    "correctAnswer": 0,
    "explanation": "$S = 4\\pi R^2 = 4\\pi \\cdot 11^2 = 484\\pi\\text{ cm}^2$.",
    "difficulty": "easy",
    "points": 10
  },

  # ==========================================
  # CHỦ ĐỀ 10: XÁC SUẤT & THỐNG KÊ 9 (GDPT 2018)
  # ==========================================
  {
    "id": "xstk_01",
    "topicId": "xac_suat_thong_ke",
    "title": "Xác suất thực nghiệm gieo xúc xắc",
    "content": "Gieo một con xúc xắc cân đối 6 mặt một lần. Xác suất để xuất hiện mặt có số chấm là số nguyên tố là:",
    "options": ["$\\frac{1}{2}$", "$\\frac{1}{3}$", "$\\frac{2}{3}$", "$\\frac{1}{6}$"],
    "correctAnswer": 0,
    "explanation": "Mặt nguyên tố gồm $2, 3, 5$ (3 khả năng trên 6) $\\Rightarrow P = \\frac{3}{6} = \\frac{1}{2}$.",
    "difficulty": "easy",
    "points": 10
  },
  {
    "id": "xstk_02",
    "topicId": "xac_suat_thong_ke",
    "title": "Xác suất lấy ngẫu nhiên vật phẩm",
    "content": "Một hộp kín chứa 4 quả bóng xanh, 6 quả bóng đỏ và 10 quả bóng vàng có kích thước như nhau. Lấy ngẫu nhiên 1 quả bóng. Xác suất lấy được quả bóng màu đỏ là:",
    "options": ["$\\frac{3}{10}$", "$\\frac{1}{5}$", "$\\frac{1}{2}$", "$\\frac{3}{20}$"],
    "correctAnswer": 0,
    "explanation": "Tổng số bóng là 20. Số bóng đỏ là 6 $\\Rightarrow P = \\frac{6}{20} = \\frac{3}{10}$.",
    "difficulty": "easy",
    "points": 10
  }
]

# 3. Danh sách Đề Thi Thực Tế (Bổ sung Đầy Đủ Mã Đề 101 và Mã Đề 102 THCS Nghĩa An)
REAL_EXAMS = [
  {
    "id": "exam_na_101",
    "title": "Đề Kiểm Tra Học Kỳ I - Mã Đề 101 (THCS Nghĩa An)",
    "school": "THCS Nghĩa An - Nghệ An (Năm học 2025 - 2026)",
    "duration": 90,
    "totalQuestions": 12,
    "sections": [
      {
        "name": "Phần I: Trắc nghiệm lựa chọn (2,5 điểm)",
        "questions": [
          {
            "id": "na101_q1",
            "number": 1,
            "content": "Điều kiện xác định của biểu thức $\\sqrt{2x - 4}$ là:",
            "options": ["$x \\ge 2$", "$x > 2$", "$x \\le 2$", "$x < 2$"],
            "correctAnswer": 0,
            "explanation": "$2x - 4 \\ge 0 \\Leftrightarrow 2x \\ge 4 \\Leftrightarrow x \\ge 2$."
          },
          {
            "id": "na101_q2",
            "number": 2,
            "content": "Trong tam giác vuông, $\\cos B$ bằng tỉ số giữa:",
            "options": [
              "Cạnh kề và cạnh huyền",
              "Cạnh đối và cạnh huyền",
              "Cạnh đối và cạnh kề",
              "Cạnh kề và cạnh đối"
            ],
            "correctAnswer": 0,
            "explanation": "Theo định nghĩa lượng giác: Cosin của góc nhọn bằng cạnh kề chia cho cạnh huyền."
          },
          {
            "id": "na101_q3",
            "number": 3,
            "content": "Trong các đẳng thức sau, hệ thức nào KHÔNG PHẢI là phương trình bậc nhất hai ẩn?",
            "options": [
              "$0x - 0y = 4$",
              "$-3x + 3y = 3$",
              "$0x - 2y = 0$",
              "$3x + 0y = 1$"
            ],
            "correctAnswer": 0,
            "explanation": "Phương trình bậc nhất hai ẩn $ax + by = c$ yêu cầu $a$ và $b$ không đồng thời bằng 0."
          },
          {
            "id": "na101_q4",
            "number": 4,
            "content": "Cho hai đường tròn $(O; 4\\text{ cm})$ và $(O'; 2\\text{ cm})$. Biết $OO' = 6\\text{ cm}$ thì hai đường tròn trên:",
            "options": [
              "Cắt nhau",
              "Tiếp xúc ngoài",
              "Tiếp xúc trong",
              "Không giao nhau"
            ],
            "correctAnswer": 1,
            "explanation": "Do $OO' = R_1 + R_2 = 4 + 2 = 6\\text{ cm}$, hai đường tròn tiếp xúc ngoài."
          },
          {
            "id": "na101_q5",
            "number": 5,
            "content": "Đường thẳng $AB$ là tiếp tuyến của đường tròn $(O)$ tại $B$, khi đó:",
            "options": [
              "$AB$ không cắt $(O)$",
              "$AB \\perp OB$",
              "$AB$ đi qua điểm $O$",
              "$AB$ cắt $(O)$ tại 2 điểm"
            ],
            "correctAnswer": 1,
            "explanation": "Tiếp tuyến của đường tròn luôn vuông góc với bán kính tại tiếp điểm: $AB \\perp OB$."
          },
          {
            "id": "na101_q6",
            "number": 6,
            "content": "Hệ phương trình $\\begin{cases} x + y = 3 \\\\ x - y = 1 \\end{cases}$ có nghiệm là:",
            "options": [
              "$(1; 2)$",
              "$(2; 1)$",
              "$(3; 0)$",
              "$(0; 3)$"
            ],
            "correctAnswer": 1,
            "explanation": "Cộng 2 phương trình: $2x = 4 \\Rightarrow x = 2$; thay vào: $y = 1$."
          },
          {
            "id": "na101_q7",
            "number": 7,
            "content": "Kết quả rút gọn của biểu thức $\\sqrt{(3 - \\sqrt{10})^2}$ là:",
            "options": [
              "$3 - \\sqrt{10}$",
              "$\\sqrt{10} + 3$",
              "$\\sqrt{10} - 3$",
              "$-3 - \\sqrt{10}$"
            ],
            "correctAnswer": 2,
            "explanation": "Vì $3 < \\sqrt{10}$ nên $\\sqrt{(3-\\sqrt{10})^2} = |3-\\sqrt{10}| = \\sqrt{10} - 3$."
          },
          {
            "id": "na101_q8",
            "number": 8,
            "content": "Kết quả của phép tính $\\sqrt{16} \\cdot \\sqrt{25} - \\sqrt{100}$ bằng:",
            "options": [
              "$10$",
              "$20$",
              "$50$",
              "$4$"
            ],
            "correctAnswer": 0,
            "explanation": "$4 \\cdot 5 - 10 = 20 - 10 = 10$."
          },
          {
            "id": "na101_q9",
            "number": 9,
            "content": "Một máy bay cất cánh bay lên quãng đường $10\\text{ km}$, góc tạo với mặt đất $20^\\circ$. Độ cao máy bay đạt được xấp xỉ là:",
            "options": [
              "$3{,}5\\text{ km}$",
              "$3{,}3\\text{ km}$",
              "$3{,}4\\text{ km}$",
              "$3{,}2\\text{ km}$"
            ],
            "correctAnswer": 2,
            "explanation": "$h = 10 \\cdot \\sin 20^\\circ \\approx 3{,}4\\text{ km}$."
          },
          {
            "id": "na101_q10",
            "number": 10,
            "content": "Lúc 2 giờ đúng, góc ở tâm tạo bởi kim giờ và kim phút của đồng hồ có số đo là:",
            "options": [
              "$60^\\circ$",
              "$120^\\circ$",
              "$150^\\circ$",
              "$30^\\circ$"
            ],
            "correctAnswer": 0,
            "explanation": "Mỗi khoảng giờ tương ứng với $360^\\circ / 12 = 30^\\circ$. Lúc 2 giờ hai kim cách nhau 2 khoảng nên góc là $2 \\times 30^\\circ = 60^\\circ$."
          }
        ]
      },
      {
        "name": "Phần II: Đúng / Sai (1,0 điểm)",
        "type": "true_false",
        "content": "Cho biểu thức $A = \\left(\\frac{1}{\\sqrt{x}-1} + \\frac{1}{\\sqrt{x}+1}\\right) : \\frac{2}{x-1}$ với $x \\ge 0, x \\ne 1$:",
        "subQuestions": [
          { "label": "a)", "text": "Điều kiện xác định của biểu thức A là $x \\ge 0, x \\ne 1$.", "isCorrect": True, "explain": "Đúng theo đề bài." },
          { "label": "b)", "text": "Kết quả rút gọn của biểu thức A là $\\sqrt{x}$.", "isCorrect": True, "explain": "Quy đồng tử số: $\\frac{2\\sqrt{x}}{x-1} \\cdot \\frac{x-1}{2} = \\sqrt{x}$." },
          { "label": "c)", "text": "Giá trị của biểu thức A khi $x = 9$ là 11.", "isCorrect": False, "explain": "Sai. Khi $x = 9$, $A = \\sqrt{9} = 3 \\ne 11$." },
          { "label": "d)", "text": "Giá trị $x$ để biểu thức A có giá trị bằng 2 là $x = 4$.", "isCorrect": True, "explain": "Đúng. $A = 2 \\Leftrightarrow \\sqrt{x} = 2 \\Leftrightarrow x = 4$." }
        ]
      },
      {
        "name": "Phần III: Tự luận & Lời giải chi tiết",
        "type": "essay",
        "essayQuestions": [
          {
            "number": "Bài 1",
            "score": "2,5 điểm",
            "text": "a) Tính $\\sqrt{50} - \\sqrt{18} + \\sqrt{8}$\nb) Rút gọn biểu thức $P = \\frac{x - 4}{\\sqrt{x} + 2}$ với $x \\ge 0$\nc) Giải bất phương trình: $2x - 3 \\le 5x + 6$",
            "solution": "a) $\\sqrt{50} - \\sqrt{18} + \\sqrt{8} = 5\\sqrt{2} - 3\\sqrt{2} + 2\\sqrt{2} = 4\\sqrt{2}$.\nb) $P = \\frac{(\\sqrt{x}-2)(\\sqrt{x}+2)}{\\sqrt{x}+2} = \\sqrt{x} - 2$.\nc) $2x - 5x \\le 6 + 3 \\Leftrightarrow -3x \\le 9 \\Leftrightarrow x \\ge -3$."
          },
          {
            "number": "Bài 2",
            "score": "1,0 điểm",
            "text": "Hai lớp 9A và 9B quyên góp sách giáo khoa cũ ủng hộ vùng lũ năm 2025 được 250 cuốn. Biết rằng lớp 9A ủng hộ nhiều hơn lớp 9B là 30 cuốn. Hỏi mỗi lớp đã ủng hộ được bao nhiêu cuốn?",
            "solution": "Gọi số sách lớp 9A và 9B lần lượt là $x, y$ ($x, y \\in \\mathbb{N}^*$).\nTheo đề bài ta có hệ phương trình:\n$$\\begin{cases} x + y = 250 \\\\ x - y = 30 \\end{cases}$$\nCộng 2 phương trình: $2x = 280 \\Rightarrow x = 140$.\nThay vào: $y = 250 - 140 = 110$.\nVậy lớp 9A ủng hộ 140 cuốn, lớp 9B ủng hộ 110 cuốn."
          },
          {
            "number": "Bài 3",
            "score": "2,0 điểm",
            "text": "Từ điểm A ngoài đường tròn (O; R) vẽ 2 tiếp tuyến AB, AC (B, C là tiếp điểm).\na) Chứng minh AO vuông góc với BC.\nb) Vẽ đường kính BD, chứng minh CD song song với AO.",
            "solution": "a) Ta có $AB = AC$ (tính chất 2 tiếp tuyến cắt nhau) và $OB = OC = R$. Do đó AO là đường trung trực của BC, suy ra $AO \\perp BC$.\nb) Tam giác BCD nội tiếp đường tròn có đường kính BD nên $\\widehat{BCD} = 90^\\circ \\Rightarrow CD \\perp BC$. Mà $AO \\perp BC$ nên $CD \\parallel AO$ (cùng vuông góc với BC)."
          },
          {
            "number": "Bài 4",
            "score": "0,5 điểm",
            "text": "Một công ty sản xuất bóng tennis cần tìm số máy móc tối ưu để chi phí sản xuất thấp nhất theo bất đẳng thức AM-GM.",
            "solution": "Chi phí sản xuất $C(x) = ax + \\frac{b}{x} \\ge 2\\sqrt{ab}$. Dấu bằng xảy ra khi $ax = \\frac{b}{x} \\Leftrightarrow x = \\sqrt{\\frac{b}{a}}$ máy."
          }
        ]
      }
    ]
  },
  {
    "id": "exam_na_102",
    "title": "Đề Kiểm Tra Học Kỳ I - Mã Đề 102 (THCS Nghĩa An)",
    "school": "THCS Nghĩa An - Nghệ An (Năm học 2025 - 2026)",
    "duration": 90,
    "totalQuestions": 12,
    "sections": [
      {
        "name": "Phần I: Trắc nghiệm lựa chọn (2,5 điểm)",
        "questions": [
          {
            "id": "na102_q1",
            "number": 1,
            "content": "Coi khung đồng hồ là một đường tròn, kim giờ và kim phút là các tia. Lúc 2 giờ đúng, số đo góc ở tâm tạo bởi hai kim là:",
            "options": ["$120^\\circ$", "$20^\\circ$", "$150^\\circ$", "$60^\\circ$"],
            "correctAnswer": 3,
            "explanation": "Đồng hồ có 12 khoảng, mỗi khoảng tương ứng $360^\\circ / 12 = 30^\\circ$. Lúc 2 giờ, khoảng cách là 2 khoảng nên góc ở tâm là $2 \\times 30^\\circ = 60^\\circ$."
          },
          {
            "id": "na102_q2",
            "number": 2,
            "content": "Kết quả của phép tính $\\sqrt{16} \\cdot \\sqrt{25} - \\sqrt{100}$ bằng:",
            "options": ["$50$", "$10$", "$20$", "$4$"],
            "correctAnswer": 1,
            "explanation": "Ta có $\\sqrt{16} \\cdot \\sqrt{25} - \\sqrt{100} = 4 \\cdot 5 - 10 = 20 - 10 = 10$."
          },
          {
            "id": "na102_q3",
            "number": 3,
            "content": "Cho hai đường tròn $(O; 4\\text{ cm})$ và $(O'; 2\\text{ cm})$ có khoảng cách nối tâm $OO' = 6\\text{ cm}$. Khi đó hai đường tròn:",
            "options": ["Tiếp xúc ngoài", "Tiếp xúc trong", "Cắt nhau", "Không giao nhau"],
            "correctAnswer": 0,
            "explanation": "Vì $OO' = R_1 + R_2 = 4 + 2 = 6\\text{ cm}$ nên hai đường tròn tiếp xúc ngoài."
          },
          {
            "id": "na102_q4",
            "number": 4,
            "content": "Một chiếc máy bay cất cánh lên quãng đường $10\\text{ km}$, đường bay tạo với mặt đất góc $20^\\circ$. Độ cao máy bay đạt được theo phương thẳng đứng là:",
            "options": ["$3{,}3\\text{ km}$", "$3{,}2\\text{ km}$", "$3{,}5\\text{ km}$", "$3{,}4\\text{ km}$"],
            "correctAnswer": 3,
            "explanation": "Độ cao $h = 10 \\cdot \\sin 20^\\circ \\approx 10 \\cdot 0{,}342 \\approx 3{,}4\\text{ km}$."
          },
          {
            "id": "na102_q5",
            "number": 5,
            "content": "Đường thẳng $AB$ là tiếp tuyến của đường tròn $(O)$ tại $B$, khi đó:",
            "options": [
              "$AB$ không cắt $(O)$",
              "$AB$ cắt $(O)$ tại 2 điểm",
              "$AB$ đi qua điểm $O$",
              "$AB \\perp OB$"
            ],
            "correctAnswer": 3,
            "explanation": "Định lý: Tiếp tuyến của đường tròn luôn vuông góc với bán kính tại tiếp điểm, tức $AB \\perp OB$."
          },
          {
            "id": "na102_q6",
            "number": 6,
            "content": "Trong tam giác vuông, $\\cos B$ bằng tỉ số giữa:",
            "options": [
              "Cạnh kề và cạnh huyền",
              "Cạnh đối và cạnh huyền",
              "Cạnh đối và cạnh kề",
              "Cạnh kề và cạnh đối"
            ],
            "correctAnswer": 0,
            "explanation": "Theo định nghĩa: $\\cos B = \\frac{\\text{cạnh kề}}{\\text{cạnh huyền}}$."
          },
          {
            "id": "na102_q7",
            "number": 7,
            "content": "Hệ phương trình $\\begin{cases} x + y = 3 \\\\ x - y = 1 \\end{cases}$ có nghiệm là:",
            "options": ["$(1; 2)$", "$(3; 0)$", "$(0; 3)$", "$(2; 1)$"],
            "correctAnswer": 3,
            "explanation": "Cộng hai vế: $2x = 4 \\Rightarrow x = 2$; thế vào ta có $y = 1$."
          },
          {
            "id": "na102_q8",
            "number": 8,
            "content": "Điều kiện xác định của biểu thức $\\sqrt{2x - 4}$ là:",
            "options": ["$x > 2$", "$x \\le 2$", "$x \\ge 2$", "$x < 2$"],
            "correctAnswer": 2,
            "explanation": "Biểu thức dưới căn không âm: $2x - 4 \\ge 0 \\Leftrightarrow x \\ge 2$."
          },
          {
            "id": "na102_q9",
            "number": 9,
            "content": "Trong các hệ thức sau, hệ thức nào KHÔNG PHẢI là phương trình bậc nhất hai ẩn?",
            "options": [
              "$-3x + 3y = 3$",
              "$3x + 0y = 1$",
              "$0x - 0y = 4$",
              "$0x - 2y = 0$"
            ],
            "correctAnswer": 2,
            "explanation": "Phương trình $0x - 0y = 4$ có $a = 0$ và $b = 0$ đồng thời nên không phải phương trình bậc nhất hai ẩn."
          },
          {
            "id": "na102_q10",
            "number": 10,
            "content": "Kết quả rút gọn của biểu thức $\\sqrt{(3 - \\sqrt{10})^2}$ là:",
            "options": [
              "$3 - \\sqrt{10}$",
              "$\\sqrt{10} - 3$",
              "$\\sqrt{10} + 3$",
              "$-3 - \\sqrt{10}$"
            ],
            "correctAnswer": 1,
            "explanation": "Do $3 < \\sqrt{10}$ nên $3 - \\sqrt{10} < 0$, vì vậy $\\sqrt{(3-\\sqrt{10})^2} = |3-\\sqrt{10}| = \\sqrt{10} - 3$."
          }
        ]
      },
      {
        "name": "Phần II: Đúng / Sai (1,0 điểm)",
        "type": "true_false",
        "content": "Cho biểu thức $A = \\left(\\frac{1}{\\sqrt{x}-1} + \\frac{1}{\\sqrt{x}+1}\\right) : \\frac{2}{x-1}$ với $x \\ge 0, x \\ne 1$:",
        "subQuestions": [
          { "label": "a)", "text": "Điều kiện xác định của biểu thức A là $x \\ge 0, x \\ne 1$.", "isCorrect": True, "explain": "Đúng theo đề bài." },
          { "label": "b)", "text": "Kết quả rút gọn của biểu thức A là $\\sqrt{x}$.", "isCorrect": True, "explain": "Đúng. Quy đồng tử ta được $\\sqrt{x}$." },
          { "label": "c)", "text": "Giá trị của biểu thức A khi $x = 9$ là 11.", "isCorrect": False, "explain": "Sai vì khi $x = 9$ thì $A = \\sqrt{9} = 3$." },
          { "label": "d)", "text": "Giá trị của $x$ để biểu thức A có giá trị bằng 2 là $x = 4$.", "isCorrect": True, "explain": "Đúng. $\\sqrt{x} = 2 \\Leftrightarrow x = 4$." }
        ]
      },
      {
        "name": "Phần III: Tự luận & Lời giải mẫu",
        "type": "essay",
        "essayQuestions": [
          {
            "number": "Bài 1",
            "score": "2,5 điểm",
            "text": "a) Tính $\\sqrt{50} - \\sqrt{18} + \\sqrt{8}$\nb) Rút gọn biểu thức $P = \\frac{x - 4}{\\sqrt{x} + 2}$ ($x \\ge 0$)\nc) Giải bất phương trình: $2x - 3 \\le 5x + 6$",
            "solution": "a) $5\\sqrt{2} - 3\\sqrt{2} + 2\\sqrt{2} = 4\\sqrt{2}$.\nb) $P = \\frac{(\\sqrt{x}-2)(\\sqrt{x}+2)}{\\sqrt{x}+2} = \\sqrt{x}-2$.\nc) $-3x \\le 9 \\Leftrightarrow x \\ge -3$."
          },
          {
            "number": "Bài 2",
            "score": "1,0 điểm",
            "text": "Hai lớp 9A và 9B quyên góp 250 cuốn sách giáo khoa. Lớp 9A ủng hộ nhiều hơn 9B là 30 cuốn. Tính số sách mỗi lớp.",
            "solution": "Hệ phương trình $\\begin{cases} x + y = 250 \\\\ x - y = 30 \\end{cases} \\Rightarrow x = 140, y = 110$ cuốn."
          }
        ]
      }
    ]
  }
]

# Đọc file data.js gốc để giữ lại TOWER_FLOORS, FORMULA_BOOK, ACHIEVEMENTS, AVATARS
with open('js/data.js', 'r', encoding='utf-8') as f:
    original_data = f.read()

tower_idx = original_data.find('const TOWER_FLOORS = [')
rest_of_file = original_data[tower_idx:]

new_content = f'''// ================================================================
// DỮ LIỆU ĐẤU TRƯỜNG TOÁN 9 - CHƯƠNG TRÌNH GDPT 2018 (KẾT NỐI TRI THỨC TẬP 1)
// Cập nhật toàn diện ngân hàng câu hỏi, chuyên đề và đề thi mới nhất
// ================================================================

const TOPICS = {json.dumps(TOPICS, ensure_ascii=False, indent=2)};

// DỮ LIỆU CÂU HỎI THEO CHUYÊN ĐỀ & ĐỀ KIỂM TRA
const QUESTIONS = {json.dumps(QUESTIONS, ensure_ascii=False, indent=2)};

// ==========================================
// DỮ LIỆU ĐỀ THI THỰC TẾ (REAL EXAMS)
// ==========================================
const REAL_EXAMS = {json.dumps(REAL_EXAMS, ensure_ascii=False, indent=2)};

{rest_of_file}
'''

with open('js/data.js', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Update data.js successfully!")
print(f"Total topics: {len(TOPICS)}")
print(f"Total questions in bank: {len(QUESTIONS)}")
print(f"Total real exams: {len(REAL_EXAMS)}")
print(f"New data.js file size: {len(new_content)} characters")
