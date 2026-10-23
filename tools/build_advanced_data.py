# -*- coding: utf-8 -*-
"""
Script khởi tạo ngân hàng bài tập nâng cao trắc nghiệm điền đáp án
Nguồn trích từ Sách Bài Tập (SBT) Toán 9 Tập 1 & Tập 2 - Kết Nối Tri Thức Với Cuộc Sống
"""
import json

topics = [
  {
    "id": "nc_he_pt",
    "name": "Hệ Phương Trình & Toán Thực Tế",
    "badge": "SBT Tập 1 - C.I",
    "icon": "{xy}",
    "color": "from-blue-600 via-indigo-600 to-cyan-500",
    "borderColor": "border-blue-500",
    "description": "Hệ phương trình bậc nhất hai ẩn, tìm tham số m, bài toán năng suất chuyển động, nghiệm nguyên"
  },
  {
    "id": "nc_bpt",
    "name": "Bất Đẳng Thức & BPT - Cực Trị AM-GM",
    "badge": "SBT Tập 1 - C.II",
    "icon": "≥ ≤",
    "color": "from-emerald-600 via-teal-600 to-green-500",
    "borderColor": "border-emerald-500",
    "description": "Phương trình tích, ẩn ở mẫu, BĐT Cauchy (AM-GM), kĩ thuật chọn điểm rơi, giá trị nhỏ nhất/lớn nhất"
  },
  {
    "id": "nc_can_thuc",
    "name": "Căn Bậc Hai & Căn Bậc Ba Vận Dụng",
    "badge": "SBT Tập 1 - C.III",
    "icon": "√x",
    "color": "from-amber-600 via-orange-600 to-yellow-500",
    "borderColor": "border-amber-500",
    "description": "Rút gọn biểu thức chứa căn, tìm x nguyên để biểu thức nguyên, so sánh phân thức, cực trị căn"
  },
  {
    "id": "nc_he_thuc_luong",
    "name": "Hệ Thức Lượng & Tỉ Số Lượng Giác",
    "badge": "SBT Tập 1 - C.IV",
    "icon": "📐",
    "color": "from-cyan-600 via-sky-600 to-blue-500",
    "borderColor": "border-cyan-500",
    "description": "Hệ thức cạnh và đường cao tam giác vuông, tỉ số lượng giác góc nhọn, đo đạc góc nâng/hạ thực tế"
  },
  {
    "id": "nc_duong_tron",
    "name": "Đường Tròn & Hai Tiếp Tuyến Cắt Nhau",
    "badge": "SBT Tập 1 - C.V",
    "icon": "⭕",
    "color": "from-rose-600 via-pink-600 to-red-500",
    "borderColor": "border-rose-500",
    "description": "Tính chất đường kính và dây cung, tính chất hai tiếp tuyến cắt nhau, vị trí tương đối hai đường tròn"
  },
  {
    "id": "nc_viet",
    "name": "Parabol & Định Lý Vi-ét Nâng Cao",
    "badge": "SBT Tập 2 - C.VI",
    "icon": "📈",
    "color": "from-purple-600 via-fuchsia-600 to-pink-500",
    "borderColor": "border-purple-500",
    "description": "Tương giao Parabol và đường thẳng, hệ thức Vi-ét đối xứng và không đối xứng, tìm tham số m"
  },
  {
    "id": "nc_thong_ke",
    "name": "Thống Kê: Tần Số & Tần Số Tương Đối",
    "badge": "SBT Tập 2 - C.VII",
    "icon": "📊",
    "color": "from-teal-600 via-emerald-600 to-cyan-500",
    "borderColor": "border-teal-500",
    "description": "Bảng tần số tương đối, biểu đồ hình quạt tròn, cỡ mẫu và tỉ lệ phần trăm số liệu thực tiễn"
  },
  {
    "id": "nc_xac_suat",
    "name": "Xác Suất Biến Cố Trong Thực Tế",
    "badge": "SBT Tập 2 - C.VIII",
    "icon": "🎲",
    "color": "from-indigo-600 via-violet-600 to-purple-500",
    "borderColor": "border-indigo-500",
    "description": "Xác suất thực nghiệm và cổ điển, bài toán rút thẻ, tung xúc xắc, đồng xu và mô hình ngẫu nhiên"
  },
  {
    "id": "nc_tu_giac",
    "name": "Tứ Giác Nội Tiếp & Cực Trị Hình Học",
    "badge": "SBT Tập 2 - C.IX",
    "icon": "🎯",
    "color": "from-red-600 via-rose-600 to-orange-500",
    "borderColor": "border-red-500",
    "description": "Tính chất góc nội tiếp, tứ giác nội tiếp đường tròn, bán kính ngoại tiếp/nội tiếp tam giác đều"
  },
  {
    "id": "nc_hinh_khoi",
    "name": "Hình Trụ, Nón, Cầu Trong Thực Tiễn",
    "badge": "SBT Tập 2 - C.X",
    "icon": "🏆",
    "color": "from-yellow-600 via-amber-600 to-orange-500",
    "borderColor": "border-yellow-500",
    "description": "Thể tích, diện tích xung quanh hình trụ, hình nón, hình cầu, bài toán tối ưu dung tích và vật liệu"
  }
]

questions = [
  # -------------------------------------------------------------
  # CHUYÊN ĐỀ 1: HỆ PHƯƠNG TRÌNH & TOÁN THỰC TẾ
  # -------------------------------------------------------------
  {
    "id": "bt_nc_hpt_01",
    "topicId": "nc_he_pt",
    "title": "Tìm tham số m để hệ phương trình thỏa mãn điều kiện tổng",
    "source": "SBT Toán 9 KNTT Tập 1 - Bài 1.15*",
    "difficulty": "Vận dụng cao 9+",
    "content": "Cho hệ phương trình $\\begin{cases} mx + y = 3 \\\\ x + my = 3 \\end{cases}$. Tìm giá trị của tham số $m$ ($m \\ne \\pm 1$) để hệ có nghiệm duy nhất $(x; y)$ thỏa mãn điều kiện $x + y = 1$.",
    "placeholder": "Nhập giá trị của m (ví dụ: 5)...",
    "correctAnswer": "5",
    "acceptableAnswers": ["5", "m=5", "m = 5"],
    "hint": "Cộng vế theo vế hai phương trình của hệ để xuất hiện cụm (m + 1)(x + y).",
    "explanation": """🧠 BẢN CHẤT LÝ THUYẾT & ĐỊNH LÝ CỐT LÕI:
- Hệ phương trình đối xứng với hai ẩn $x, y$.
- Định thức $D = m^2 - 1$. Hệ có nghiệm duy nhất khi $D \\ne 0 \\Leftrightarrow m \\ne \\pm 1$.

📝 LỜI GIẢI TỪNG BƯỚC:
1. Cộng vế với vế của hai phương trình:
   $$(mx + y) + (x + my) = 3 + 3 \\Leftrightarrow (m + 1)x + (m + 1)y = 6 \\Leftrightarrow (m + 1)(x + y) = 6$$
2. Thay điều kiện $x + y = 1$ vào:
   $$(m + 1) \\cdot 1 = 6 \\Leftrightarrow m + 1 = 6 \\Leftrightarrow m = 5$$
3. Thử lại: Với $m = 5$, hệ trở thành $\\begin{cases} 5x + y = 3 \\\\ x + 5y = 3 \\end{cases} \\Rightarrow x = y = \\frac{1}{2}$ (thỏa mãn $x + y = 1$ và $m \\ne \\pm 1$).

⚠️ CHÚ Ý BẪY SAI:
- Cần chú ý điều kiện tồn tại nghiệm duy nhất $m \\ne \\pm 1$ để tránh nhận nghiệm ngoại lai.""",
    "points": 25
  },
  {
    "id": "bt_nc_hpt_02",
    "topicId": "nc_he_pt",
    "title": "Toán thực tế chuyển động ngược chiều",
    "source": "SBT Toán 9 KNTT Tập 1 - Bài 1.22*",
    "difficulty": "Nâng cao 8.5+",
    "content": "Hai tỉnh cách nhau $120\\text{ km}$. Một ô tô và một xe máy khởi hành cùng lúc từ hai tỉnh, đi ngược chiều và gặp nhau sau $1{,}5$ giờ. Biết vận tốc của ô tô lớn hơn vận tốc của xe máy là $20\\text{ km/h}$. Tính vận tốc của ô tô lúc đầu (đơn vị: km/h).",
    "placeholder": "Nhập số (ví dụ: 50)...",
    "correctAnswer": "50",
    "acceptableAnswers": ["50", "50 km/h", "50km/h"],
    "hint": "Gọi x, y lần lượt là vận tốc ô tô và xe máy. Tổng vận tốc = Quãng đường / Thời gian gặp nhau.",
    "explanation": """🧠 BẢN CHẤT LÝ THUYẾT & ĐỊNH LÝ CỐT LÕI:
- Chuyển động ngược chiều: Quãng đường hai xe đi được trong thời gian $t$ bằng khoảng cách ban đầu: $(v_1 + v_2) \\cdot t = S$.

📝 LỜI GIẢI TỪNG BƯỚC:
1. Gọi vận tốc của ô tô là $x$ (km/h) và xe máy là $y$ (km/h) ($x > 20, y > 0$).
2. Vì sau $1{,}5$ giờ hai xe gặp nhau nên tổng quãng đường là $120\\text{ km}$:
   $$1{,}5(x + y) = 120 \\Rightarrow x + y = \\frac{120}{1{,}5} = 80$$
3. Vận tốc ô tô lớn hơn xe máy $20\\text{ km/h}$: $x - y = 20$.
4. Ta có hệ phương trình:
   $$\\begin{cases} x + y = 80 \\\\ x - y = 20 \\end{cases} \\Rightarrow 2x = 100 \\Rightarrow x = 50\\text{ (km/h)},\\; y = 30\\text{ (km/h)}$$
5. Vậy vận tốc ô tô là $50\\text{ km/h}$.""",
    "points": 20
  },
  {
    "id": "bt_nc_hpt_03",
    "topicId": "nc_he_pt",
    "title": "Phương trình nghiệm nguyên dương Diophantine",
    "source": "SBT Toán 9 KNTT Tập 1 - Ôn tập Chương I",
    "difficulty": "Vận dụng cao 9+",
    "content": "Có bao nhiêu cặp số nguyên dương $(x; y)$ thỏa mãn phương trình bậc nhất hai ẩn $2x + 3y = 31$?",
    "placeholder": "Nhập số cặp nghiệm nguyên dương...",
    "correctAnswer": "5",
    "acceptableAnswers": ["5", "5 cặp", "5 nghiệm"],
    "hint": "Rút 2x = 31 - 3y. Vì x > 0 nên 3y < 31, đồng thời 31 - 3y phải là số chẵn.",
    "explanation": """🧠 BẢN CHẤT LÝ THUYẾT & ĐỊNH LÝ CỐT LÕI:
- Bài toán tìm nghiệm nguyên dương $x, y \\in \\mathbb{N}^*$.
- Dùng tính chất chẵn lẻ và chặn miền giá trị.

📝 LỜI GIẢI TỪNG BƯỚC:
1. Từ $2x + 3y = 31 \\Rightarrow 2x = 31 - 3y$.
2. Vì $x \\ge 1$ nên $2x \\ge 2 \\Rightarrow 31 - 3y \\ge 2 \\Rightarrow 3y \\le 29 \\Rightarrow y \\le 9$.
3. Vì $2x$ là số chẵn nên $31 - 3y$ phải là số chẵn $\\Rightarrow 3y$ là số lẻ $\\Rightarrow y$ là số lẻ.
4. Do $y \\in \\mathbb{N}^*$ và $y \\le 9$, các giá trị lẻ của $y$ là: $y \\in \\{1; 3; 5; 7; 9\\}$.
   - $y = 1 \\Rightarrow 2x = 28 \\Rightarrow x = 14$ (thỏa mãn).
   - $y = 3 \\Rightarrow 2x = 22 \\Rightarrow x = 11$ (thỏa mãn).
   - $y = 5 \\Rightarrow 2x = 16 \\Rightarrow x = 8$ (thỏa mãn).
   - $y = 7 \\Rightarrow 2x = 10 \\Rightarrow x = 5$ (thỏa mãn).
   - $y = 9 \\Rightarrow 2x = 4 \\Rightarrow x = 2$ (thỏa mãn).
5. Vậy có đúng $5$ cặp nghiệm nguyên dương $(x; y)$.""",
    "points": 25
  },
  {
    "id": "bt_nc_hpt_04",
    "topicId": "nc_he_pt",
    "title": "Hệ phương trình có vô số nghiệm",
    "source": "SBT Toán 9 KNTT Tập 1 - Bài 1.8*",
    "difficulty": "Nâng cao 8.5+",
    "content": "Cho hệ phương trình $\\begin{cases} x + 2y = 3 \\\\ 2x + my = 6 \\end{cases}$. Giá trị của tham số $m$ để hệ có vô số nghiệm là bao nhiêu?",
    "placeholder": "Nhập giá trị m...",
    "correctAnswer": "4",
    "acceptableAnswers": ["4", "m=4", "m = 4"],
    "hint": "Hệ có vô số nghiệm khi tỉ số các hệ số bằng nhau: a/a' = b/b' = c/c'.",
    "explanation": """🧠 BẢN CHẤT LÝ THUYẾT & ĐỊNH LÝ CỐT LÕI:
- Xét hệ $\\begin{cases} a_1 x + b_1 y = c_1 \\\\ a_2 x + b_2 y = c_2 \\end{cases}$.
- Hệ có vô số nghiệm khi và chỉ khi $\\frac{a_1}{a_2} = \\frac{b_1}{b_2} = \\frac{c_1}{c_2}$.

📝 LỜI GIẢI TỪNG BƯỚC:
1. Xét tỉ lệ hệ số:
   $$\\frac{1}{2} = \\frac{2}{m} = \\frac{3}{6}$$
2. Vì $\\frac{3}{6} = \\frac{1}{2}$, ta chỉ cần $\\frac{2}{m} = \\frac{1}{2} \\Leftrightarrow m = 4$.
3. Với $m = 4$, phương trình thứ hai trở thành $2x + 4y = 6 \\Leftrightarrow x + 2y = 3$, trùng khớp hoàn toàn với phương trình thứ nhất nên hệ có vô số nghiệm.""",
    "points": 20
  },

  # -------------------------------------------------------------
  # CHUYÊN ĐỀ 2: BẤT ĐẲNG THỨC & BPT - CỰC TRỊ AM-GM
  # -------------------------------------------------------------
  {
    "id": "bt_nc_bpt_01",
    "topicId": "nc_bpt",
    "title": "Bất đẳng thức Cauchy (AM-GM) chọn điểm rơi",
    "source": "SBT Toán 9 KNTT Tập 1 - Bài 2.14*",
    "difficulty": "Vận dụng cao 9+",
    "content": "Cho hai số thực dương $a, b > 0$ thỏa mãn điều kiện $a + b = 4$. Giá trị nhỏ nhất của biểu thức $P = \\frac{1}{a} + \\frac{1}{b}$ bằng bao nhiêu?",
    "placeholder": "Nhập giá trị min...",
    "correctAnswer": "1",
    "acceptableAnswers": ["1", "1.0"],
    "hint": "Áp dụng BĐT Cauchy dạng cộng mẫu số: 1/a + 1/b >= 4/(a+b).",
    "explanation": """🧠 BẢN CHẤT LÝ THUYẾT & ĐỊNH LÝ CỐT LÕI:
- BĐT Cauchy cho hai số dương: $(a + b)\\left(\\frac{1}{a} + \\frac{1}{b}\\right) \\ge 4 \\Rightarrow \\frac{1}{a} + \\frac{1}{b} \\ge \\frac{4}{a + b}$.
- Dấu bằng xảy ra khi $a = b$.

📝 LỜI GIẢI TỪNG BƯỚC:
1. Áp dụng BĐT: $P = \\frac{1}{a} + \\frac{1}{b} \\ge \\frac{4}{a + b}$.
2. Thay $a + b = 4$ vào: $P \\ge \\frac{4}{4} = 1$.
3. Dấu \"=\" xảy ra khi $a = b = 2$ (thỏa mãn $a + b = 4$).
4. Vậy giá trị nhỏ nhất của $P$ là $1$.""",
    "points": 25
  },
  {
    "id": "bt_nc_bpt_02",
    "topicId": "nc_bpt",
    "title": "Bẫy nghiệm ngoại lai trong phương trình chứa ẩn ở mẫu",
    "source": "SBT Toán 9 KNTT Tập 1 - Bài 2.6*",
    "difficulty": "Nâng cao 8.5+",
    "content": "Số nghiệm của phương trình $\\frac{x + 1}{x - 1} - \\frac{x - 1}{x + 1} = \\frac{4}{x^2 - 1}$ là bao nhiêu?",
    "placeholder": "Nhập số nghiệm (ví dụ: 0, 1, 2)...",
    "correctAnswer": "0",
    "acceptableAnswers": ["0", "0 nghiệm", "vô nghiệm"],
    "hint": "Đừng quên tìm Điều kiện xác định (ĐKXĐ) của phương trình trước khi quy đồng!",
    "explanation": """🧠 BẢN CHẤT LÝ THUYẾT & ĐỊNH LÝ CỐT LÕI:
- Với phương trình chứa ẩn ở mẫu, BẮT BUỘC đặt điều kiện xác định để mẫu số khác 0.

📝 LỜI GIẢI TỪNG BƯỚC:
1. ĐKXĐ: $x \\ne 1$ và $x \\ne -1$ ($x \\ne \\pm 1$).
2. Quy đồng mẫu thức chung $(x - 1)(x + 1) = x^2 - 1$:
   $$(x + 1)^2 - (x - 1)^2 = 4 \\Leftrightarrow (x^2 + 2x + 1) - (x^2 - 2x + 1) = 4 \\Leftrightarrow 4x = 4 \\Leftrightarrow x = 1$$
3. Đối chiếu với ĐKXĐ: $x = 1$ không thỏa mãn (mẫu số bằng 0).
4. Do đó nghiệm $x = 1$ bị LOẠI. Phương trình vô nghiệm. Số nghiệm là $0$.

⚠️ CHÚ Ý BẪY SAI:
- Đây là lỗi sai phổ biến nhất khi học sinh giải ra $x = 1$ nhưng quên đối chiếu ĐKXĐ!""",
    "points": 20
  },
  {
    "id": "bt_nc_bpt_03",
    "topicId": "nc_bpt",
    "title": "Cực trị đại số triệt tiêu ẩn mẫu",
    "source": "SBT Toán 9 KNTT Tập 1 - Bài 2.18*",
    "difficulty": "Vận dụng cao 9+",
    "content": "Cho số thực $x > 0$. Giá trị nhỏ nhất của biểu thức $A = 4x + \\frac{9}{x}$ bằng bao nhiêu?",
    "placeholder": "Nhập giá trị min của A...",
    "correctAnswer": "12",
    "acceptableAnswers": ["12", "12.0"],
    "hint": "Áp dụng trực tiếp BĐT AM-GM cho hai số dương 4x và 9/x.",
    "explanation": """🧠 BẢN CHẤT LÝ THUYẾT & ĐỊNH LÝ CỐT LÕI:
- BĐT Cauchy cho hai số không âm: $u + v \\ge 2\\sqrt{uv}$.

📝 LỜI GIẢI TỪNG BƯỚC:
1. Vì $x > 0$ nên $4x > 0$ và $\\frac{9}{x} > 0$.
2. Áp dụng BĐT AM-GM:
   $$A = 4x + \\frac{9}{x} \\ge 2\\sqrt{4x \\cdot \\frac{9}{x}} = 2\\sqrt{36} = 2 \\cdot 6 = 12$$
3. Dấu \"=\" xảy ra khi:
   $$4x = \\frac{9}{x} \\Leftrightarrow 4x^2 = 9 \\Leftrightarrow x^2 = \\frac{9}{4} \\Leftrightarrow x = \\frac{3}{2} = 1{,}5\\text{ (do } x > 0)$$
4. Vậy giá trị nhỏ nhất của $A$ là $12$.""",
    "points": 25
  },
  {
    "id": "bt_nc_bpt_04",
    "topicId": "nc_bpt",
    "title": "Số nghiệm nguyên dương của bất phương trình bậc nhất",
    "source": "SBT Toán 9 KNTT Tập 1 - Bài 2.11",
    "difficulty": "Nâng cao 8.5+",
    "content": "Có bao nhiêu nghiệm nguyên dương $x$ thỏa mãn bất phương trình $\\frac{2x - 3}{4} \\le \\frac{x + 5}{3}$?",
    "placeholder": "Nhập số nghiệm nguyên dương...",
    "correctAnswer": "14",
    "acceptableAnswers": ["14", "14 nghiệm"],
    "hint": "Nhân hai vế với BCNN(4, 3) = 12 rồi giải bất phương trình.",
    "explanation": """🧠 BẢN CHẤT LÝ THUYẾT & ĐỊNH LÝ CỐT LÕI:
- Quy đồng khử mẫu với số dương không làm đổi chiều bất phương trình.

📝 LỜI GIẢI TỪNG BƯỚC:
1. Nhân cả hai vế với $12 > 0$:
   $$3(2x - 3) \\le 4(x + 5) \\Leftrightarrow 6x - 9 \\le 4x + 20$$
2. Chuyển vế:
   $$6x - 4x \\le 20 + 9 \\Leftrightarrow 2x \\le 29 \\Leftrightarrow x \\le 14{,}5$$
3. Do $x$ là số nguyên dương ($x \\in \\mathbb{N}^*$) nên $x \\in \\{1; 2; 3; \\dots; 14\\}$.
4. Vậy có tất cả $14$ nghiệm nguyên dương.""",
    "points": 20
  },

  # -------------------------------------------------------------
  # CHUYÊN ĐỀ 3: CĂN BẬC HAI & CĂN BẬC BA VẬN DỤNG
  # -------------------------------------------------------------
  {
    "id": "bt_nc_can_01",
    "topicId": "nc_can_thuc",
    "title": "Khai căn hằng đẳng thức chứa số âm",
    "source": "SBT Toán 9 KNTT Tập 1 - Bài 3.5*",
    "difficulty": "Nâng cao 8.5+",
    "content": "Tính giá trị của biểu thức $P = \\sqrt{(\\sqrt{5} - 3)^2} + \\sqrt{5}$.",
    "placeholder": "Nhập kết quả số nguyên...",
    "correctAnswer": "3",
    "acceptableAnswers": ["3"],
    "hint": "Căn bậc hai của A^2 bằng |A|. Chú ý so sánh căn 5 với 3.",
    "explanation": """🧠 BẢN CHẤT LÝ THUYẾT & ĐỊNH LÝ CỐT LÕI:
- Hằng đẳng thức: $\\sqrt{A^2} = |A| = \\begin{cases} A & \\text{nếu } A \\ge 0 \\\\ -A & \\text{nếu } A < 0 \\end{cases}$

📝 LỜI GIẢI TỪNG BƯỚC:
1. Ta có $3 = \\sqrt{9}$. Vì $5 < 9 \\Rightarrow \\sqrt{5} < 3 \\Rightarrow \\sqrt{5} - 3 < 0$.
2. Khai căn dùng dấu giá trị tuyệt đối:
   $$\\sqrt{(\\sqrt{5} - 3)^2} = |\\sqrt{5} - 3| = 3 - \\sqrt{5}$$
3. Thay vào $P$:
   $$P = (3 - \\sqrt{5}) + \\sqrt{5} = 3$$

⚠️ CHÚ Ý BẪY SAI:
- Học sinh thường vội vàng viết $\\sqrt{(\\sqrt{5} - 3)^2} = \\sqrt{5} - 3$, dẫn đến kết quả sai là $2\\sqrt{5} - 3$.""",
    "points": 20
  },
  {
    "id": "bt_nc_can_02",
    "topicId": "nc_can_thuc",
    "title": "Tìm biến x nguyên để biểu thức căn nhận giá trị nguyên",
    "source": "SBT Toán 9 KNTT Tập 1 - Ôn tập Chương III",
    "difficulty": "Vận dụng cao 9+",
    "content": "Cho biểu thức $P = \\frac{\\sqrt{x} + 3}{\\sqrt{x} - 1}$ với $x \\ge 0, x \\ne 1$. Có bao nhiêu giá trị nguyên của $x$ để biểu thức $P$ nhận giá trị nguyên?",
    "placeholder": "Nhập số lượng giá trị x nguyên...",
    "correctAnswer": "4",
    "acceptableAnswers": ["4", "4 giá trị"],
    "hint": "Tách phần nguyên: P = 1 + 4 / (căn(x) - 1).",
    "explanation": """🧠 BẢN CHẤT LÝ THUYẾT & ĐỊNH LÝ CỐT LÕI:
- Tách tử số theo mẫu số để đưa về dạng $P = A + \\frac{k}{\\text{Mẫu}}$.
- Với $x$ nguyên thì $P$ nguyên khi và chỉ khi mẫu số là ước của $k$.

📝 LỜI GIẢI TỪNG BƯỚC:
1. Tách phần nguyên:
   $$P = \\frac{(\\sqrt{x} - 1) + 4}{\\sqrt{x} - 1} = 1 + \\frac{4}{\\sqrt{x} - 1}$$
2. Để $P \\in \\mathbb{Z}$ với $x \\in \\mathbb{Z}$ thì $\\sqrt{x} - 1 \\in Ư(4) = \\{\\pm 1; \\pm 2; \\pm 4\\}$.
3. Vì $\\sqrt{x} \\ge 0 \\Rightarrow \\sqrt{x} - 1 \\ge -1$:
   - $\\sqrt{x} - 1 = -1 \\Rightarrow \\sqrt{x} = 0 \\Rightarrow x = 0$ (thỏa mãn).
   - $\\sqrt{x} - 1 = 1 \\Rightarrow \\sqrt{x} = 2 \\Rightarrow x = 4$ (thỏa mãn).
   - $\\sqrt{x} - 1 = 2 \\Rightarrow \\sqrt{x} = 3 \\Rightarrow x = 9$ (thỏa mãn).
   - $\\sqrt{x} - 1 = 4 \\Rightarrow \\sqrt{x} = 5 \\Rightarrow x = 25$ (thỏa mãn).
4. Các trường hợp $\\sqrt{x} - 1 = -2$ và $-4$ đều cho $\\sqrt{x} < 0$ (vô nghiệm).
5. Vậy có đúng $4$ giá trị nguyên của $x$ là $x \\in \\{0; 4; 9; 25\\}$.""",
    "points": 25
  },
  {
    "id": "bt_nc_can_03",
    "topicId": "nc_can_thuc",
    "title": "Rút gọn căn thức lồng nhau (Đưa về bình phương)",
    "source": "SBT Toán 9 KNTT Tập 1 - Bài 3.12*",
    "difficulty": "Nâng cao 8.5+",
    "content": "Rút gọn biểu thức $M = \\sqrt{7 - 4\\sqrt{3}} + \\sqrt{7 + 4\\sqrt{3}}$. Kết quả là một số nguyên bằng bao nhiêu?",
    "placeholder": "Nhập kết quả số nguyên...",
    "correctAnswer": "4",
    "acceptableAnswers": ["4"],
    "hint": "Biến đổi 7 +- 4 căn 3 = 4 +- 4 căn 3 + 3 = (2 +- căn 3)^2.",
    "explanation": """🧠 BẢN CHẤT LÝ THUYẾT & ĐỊNH LÝ CỐT LÕI:
- Kỹ thuật tách nhân tử đưa về dạng bình phương một tổng/hiệu: $a \\pm 2\\sqrt{ab} + b = (\\sqrt{a} \\pm \\sqrt{b})^2$.

📝 LỜI GIẢI TỪNG BƯỚC:
1. Ta có: $7 - 4\\sqrt{3} = 4 - 2 \\cdot 2 \\cdot \\sqrt{3} + 3 = (2 - \\sqrt{3})^2$.
2. Tương tự: $7 + 4\\sqrt{3} = (2 + \\sqrt{3})^2$.
3. Khai căn:
   $$M = |2 - \\sqrt{3}| + |2 + \\sqrt{3}|$$
4. Vì $2 = \\sqrt{4} > \\sqrt{3} \\Rightarrow 2 - \\sqrt{3} > 0$:
   $$M = (2 - \\sqrt{3}) + (2 + \\sqrt{3}) = 4$$""",
    "points": 20
  },
  {
    "id": "bt_nc_can_04",
    "topicId": "nc_can_thuc",
    "title": "Giá trị nhỏ nhất của tam thức bậc hai chứa căn",
    "source": "SBT Toán 9 KNTT Tập 1 - Bài 3.17*",
    "difficulty": "Vận dụng cao 9+",
    "content": "Giá trị nhỏ nhất của biểu thức $A = x - 4\\sqrt{x} + 9$ (với $x \\ge 0$) bằng bao nhiêu?",
    "placeholder": "Nhập giá trị min...",
    "correctAnswer": "5",
    "acceptableAnswers": ["5"],
    "hint": "Đặt ẩn phụ t = căn(x) >= 0 hoặc viết thành bình phương thiếu: (căn(x) - 2)^2 + ...",
    "explanation": """🧠 BẢN CHẤT LÝ THUYẾT & ĐỊNH LÝ CỐT LÕI:
- Đưa về dạng $A = (\\sqrt{x} - a)^2 + b \\ge b$.

📝 LỜI GIẢI TỪNG BƯỚC:
1. Biến đổi biểu thức:
   $$A = (\\sqrt{x})^2 - 2 \\cdot 2 \\cdot \\sqrt{x} + 4 + 5 = (\\sqrt{x} - 2)^2 + 5$$
2. Vì $(\\sqrt{x} - 2)^2 \\ge 0$ với mọi $x \\ge 0$, nên:
   $$A \\ge 0 + 5 = 5$$
3. Dấu \"=\" xảy ra khi $\\sqrt{x} - 2 = 0 \\Leftrightarrow \\sqrt{x} = 2 \\Leftrightarrow x = 4$ (thỏa mãn $x \\ge 0$).
4. Vậy giá trị nhỏ nhất của $A$ là $5$.""",
    "points": 25
  },

  # -------------------------------------------------------------
  # CHUYÊN ĐỀ 4: HỆ THỨC LƯỢNG & TỈ SỐ LƯỢNG GIÁC
  # -------------------------------------------------------------
  {
    "id": "bt_nc_htl_01",
    "topicId": "nc_he_thuc_luong",
    "title": "Tính đường cao tam giác vuông qua hai hình chiếu",
    "source": "SBT Toán 9 KNTT Tập 1 - Bài 4.2*",
    "difficulty": "Nâng cao 8.5+",
    "content": "Cho tam giác $ABC$ vuông tại $A$, đường cao $AH$. Biết hai hình chiếu trên cạnh huyền là $BH = 4\\text{ cm}$ và $CH = 9\\text{ cm}$. Độ dài đường cao $AH$ bằng bao nhiêu cm?",
    "placeholder": "Nhập độ dài (cm)...",
    "correctAnswer": "6",
    "acceptableAnswers": ["6", "6 cm", "6cm"],
    "hint": "Áp dụng hệ thức: AH^2 = BH * CH.",
    "explanation": """🧠 BẢN CHẤT LÝ THUYẾT & ĐỊNH LÝ CỐT LÕI:
- Trong tam giác vuông, bình phương độ dài đường cao ứng với cạnh huyền bằng tích hai hình chiếu của hai cạnh góc vuông trên cạnh huyền: $h^2 = b' c'$.

📝 LỜI GIẢI TỪNG BƯỚC:
1. Áp dụng hệ thức lượng cho tam giác vuông $ABC$:
   $$AH^2 = BH \\cdot CH$$
2. Thay số:
   $$AH^2 = 4 \\cdot 9 = 36 \\Rightarrow AH = \\sqrt{36} = 6\\text{ cm}$$""",
    "points": 20
  },
  {
    "id": "bt_nc_htl_02",
    "topicId": "nc_he_thuc_luong",
    "title": "Tính giá trị biểu thức lượng giác từ tan alpha",
    "source": "SBT Toán 9 KNTT Tập 1 - Bài 4.15*",
    "difficulty": "Vận dụng cao 9+",
    "content": "Cho góc nhọn $\\alpha$ thỏa mãn $\\tan \\alpha = 2$. Tính giá trị của biểu thức $M = \\frac{2\\sin \\alpha + 3\\cos \\alpha}{4\\sin \\alpha - \\cos \\alpha}$.",
    "placeholder": "Nhập giá trị số nguyên...",
    "correctAnswer": "1",
    "acceptableAnswers": ["1", "1.0"],
    "hint": "Chia cả tử và mẫu của biểu thức cho cos alpha (vì cos alpha khác 0).",
    "explanation": """🧠 BẢN CHẤT LÝ THUYẾT & ĐỊNH LÝ CỐT LÕI:
- Mối liên hệ: $\\frac{\\sin \\alpha}{\\cos \\alpha} = \\tan \\alpha$. Khi biểu thức đồng bậc theo $\\sin \\alpha$ và $\\cos \\alpha$, chia cả tử và mẫu cho $\\cos \\alpha$.

📝 LỜI GIẢI TỪNG BƯỚC:
1. Do $\\alpha$ là góc nhọn nên $\\cos \\alpha > 0$. Chia cả tử và mẫu cho $\\cos \\alpha$:
   $$M = \\frac{\\frac{2\\sin \\alpha}{\\cos \\alpha} + 3}{\\frac{4\\sin \\alpha}{\\cos \\alpha} - 1} = \\frac{2\\tan \\alpha + 3}{4\\tan \\alpha - 1}$$
2. Thay $\\tan \\alpha = 2$ vào:
   $$M = \\frac{2(2) + 3}{4(2) - 1} = \\frac{4 + 3}{8 - 1} = \\frac{7}{7} = 1$$""",
    "points": 25
  },
  {
    "id": "bt_nc_htl_03",
    "topicId": "nc_he_thuc_luong",
    "title": "Tính đường cao tam giác vuông qua hai cạnh góc vuông",
    "source": "SBT Toán 9 KNTT Tập 1 - Bài 4.6",
    "difficulty": "Nâng cao 8.5+",
    "content": "Cho tam giác $ABC$ vuông tại $A$ có hai cạnh góc vuông $AB = 6\\text{ cm}$ và $AC = 8\\text{ cm}$. Độ dài đường cao $AH$ bằng bao nhiêu cm? (Nhập kết quả số thập phân, ví dụ: 4.8).",
    "placeholder": "Nhập số thập phân (ví dụ: 4.8)...",
    "correctAnswer": "4.8",
    "acceptableAnswers": ["4.8", "4,8", "24/5"],
    "hint": "Tính cạnh huyền BC qua Pythagore, sau đó dùng hệ thức AH * BC = AB * AC.",
    "explanation": """🧠 BẢN CHẤT LÝ THUYẾT & ĐỊNH LÝ CỐT LÕI:
- Định lý Pythagore: $BC = \\sqrt{AB^2 + AC^2}$.
- Hệ thức diện tích: $AH \\cdot BC = AB \\cdot AC \\Rightarrow AH = \\frac{AB \\cdot AC}{BC}$.

📝 LỜI GIẢI TỪNG BƯỚC:
1. Tính cạnh huyền $BC$:
   $$BC = \\sqrt{6^2 + 8^2} = \\sqrt{36 + 64} = \\sqrt{100} = 10\\text{ cm}$$
2. Áp dụng hệ thức:
   $$AH = \\frac{AB \\cdot AC}{BC} = \\frac{6 \\cdot 8}{10} = \\frac{48}{10} = 4{,}8\\text{ cm}$$""",
    "points": 20
  },
  {
    "id": "bt_nc_htl_04",
    "topicId": "nc_he_thuc_luong",
    "title": "Bài toán thực tế đo bóng cột cờ",
    "source": "SBT Toán 9 KNTT Tập 1 - Bài 4.20*",
    "difficulty": "Nâng cao 8.5+",
    "content": "Một cột cờ có bóng trên mặt đất dài $12\\text{ m}$. Tại thời điểm đó, tia nắng mặt trời tạo với mặt đất một góc bằng $30^\\circ$. Chiều cao của cột cờ xấp xỉ bằng bao nhiêu mét? (Biết $\\tan 30^\\circ = \\frac{\\sqrt{3}}{3} \\approx 0{,}577$; làm tròn kết quả đến hàng đơn vị).",
    "placeholder": "Nhập số nguyên làm tròn...",
    "correctAnswer": "7",
    "acceptableAnswers": ["7", "7 m", "7m"],
    "hint": "Chiều cao h = chiều dài bóng * tan(30 độ).",
    "explanation": """🧠 BẢN CHẤT LÝ THUYẾT & ĐỊNH LÝ CỐT LÕI:
- Trong tam giác vuông: Cạnh đối = Cạnh kề $\\times \\tan(\\text{góc đối})$.

📝 LỜI GIẢI TỪNG BƯỚC:
1. Gọi $h$ là chiều cao cột cờ và $L = 12\\text{ m}$ là độ dài bóng.
2. Ta có tam giác vuông với góc nâng $\\alpha = 30^\\circ$:
   $$\\tan 30^\\circ = \\frac{h}{L} \\Rightarrow h = L \\cdot \\tan 30^\\circ = 12 \\cdot \\frac{\\sqrt{3}}{3} = 4\\sqrt{3}\\text{ m}$$
3. Tính giá trị xấp xỉ:
   $$h \\approx 4 \\cdot 1{,}732 = 6{,}928\\text{ m} \\approx 7\\text{ m}$$""",
    "points": 20
  },

  # -------------------------------------------------------------
  # CHUYÊN ĐỀ 5: ĐƯỜNG TRÒN & HAI TIẾP TUYẾN CẮT NHAU
  # -------------------------------------------------------------
  {
    "id": "bt_nc_dt_01",
    "topicId": "nc_duong_tron",
    "title": "Khoảng cách từ tâm đến dây cung của đường tròn",
    "source": "SBT Toán 9 KNTT Tập 1 - Bài 5.7*",
    "difficulty": "Nâng cao 8.5+",
    "content": "Cho đường tròn $(O; 10\\text{ cm})$ và một dây cung $AB$ có độ dài $16\\text{ cm}$. Khoảng cách từ tâm $O$ đến dây cung $AB$ bằng bao nhiêu cm?",
    "placeholder": "Nhập khoảng cách (cm)...",
    "correctAnswer": "6",
    "acceptableAnswers": ["6", "6 cm", "6cm"],
    "hint": "Đường kính vuông góc với một dây thì đi qua trung điểm của dây ấy.",
    "explanation": """🧠 BẢN CHẤT LÝ THUYẾT & ĐỊNH LÝ CỐT LÕI:
- Đường kính vuông góc với một dây thì đi qua trung điểm của dây đó.
- Định lý Pythagore cho tam giác vuông $OHA$: $OH = \\sqrt{R^2 - AH^2}$.

📝 LỜI GIẢI TỪNG BƯỚC:
1. Kẻ $OH \\perp AB$ tại $H$. Suy ra $H$ là trung điểm của dây cung $AB$.
2. Độ dài đoạn $AH = \\frac{AB}{2} = \\frac{16}{2} = 8\\text{ cm}$.
3. Xét tam giác vuông $OHA$ vuông tại $H$, bán kính $OA = R = 10\\text{ cm}$:
   $$OH = \\sqrt{OA^2 - AH^2} = \\sqrt{10^2 - 8^2} = \\sqrt{100 - 64} = \\sqrt{36} = 6\\text{ cm}$$""",
    "points": 20
  },
  {
    "id": "bt_nc_dt_02",
    "topicId": "nc_duong_tron",
    "title": "Tính độ dài tiếp tuyến từ một điểm ngoài đường tròn",
    "source": "SBT Toán 9 KNTT Tập 1 - Bài 5.14*",
    "difficulty": "Nâng cao 8.5+",
    "content": "Từ điểm $M$ nằm ngoài đường tròn $(O; 5\\text{ cm})$, kẻ tiếp tuyến $MA$ với đường tròn ($A$ là tiếp điểm). Biết khoảng cách $MO = 13\\text{ cm}$. Độ dài tiếp tuyến $MA$ bằng bao nhiêu cm?",
    "placeholder": "Nhập độ dài MA (cm)...",
    "correctAnswer": "12",
    "acceptableAnswers": ["12", "12 cm", "12cm"],
    "hint": "Tiếp tuyến vuông góc với bán kính tại tiếp điểm: tam giác MAO vuông tại A.",
    "explanation": """🧠 BẢN CHẤT LÝ THUYẾT & ĐỊNH LÝ CỐT LÕI:
- Tiếp tuyến của đường tròn vuông góc với bán kính đi qua tiếp điểm: $MA \\perp OA$.

📝 LỜI GIẢI TỪNG BƯỚC:
1. Tam giác $MAO$ vuông tại tiếp điểm $A$.
2. Áp dụng định lý Pythagore:
   $$MA = \\sqrt{MO^2 - OA^2} = \\sqrt{13^2 - 5^2} = \\sqrt{169 - 25} = \\sqrt{144} = 12\\text{ cm}$$""",
    "points": 20
  },
  {
    "id": "bt_nc_dt_03",
    "topicId": "nc_duong_tron",
    "title": "Khoảng cách nối tâm của hai đường tròn tiếp xúc ngoài",
    "source": "SBT Toán 9 KNTT Tập 1 - Bài 5.21",
    "difficulty": "Nâng cao 8.5+",
    "content": "Hai đường tròn $(O_1; 8\\text{ cm})$ và $(O_2; 3\\text{ cm})$ tiếp xúc ngoài với nhau. Độ dài đoạn thẳng nối hai tâm $O_1O_2$ bằng bao nhiêu cm?",
    "placeholder": "Nhập độ dài nối tâm...",
    "correctAnswer": "11",
    "acceptableAnswers": ["11", "11 cm", "11cm"],
    "hint": "Khi hai đường tròn tiếp xúc ngoài thì khoảng cách hai tâm bằng tổng hai bán kính.",
    "explanation": """🧠 BẢN CHẤT LÝ THUYẾT & ĐỊNH LÝ CỐT LÕI:
- Vị trí tương đối của hai đường tròn: Tiếp xúc ngoài $\\Leftrightarrow d = R_1 + R_2$.

📝 LỜI GIẢI TỪNG BƯỚC:
1. Hai đường tròn tiếp xúc ngoài nên tiếp điểm nằm trên đường nối tâm.
2. Đoạn nối tâm: $O_1O_2 = R_1 + R_2 = 8 + 3 = 11\\text{ cm}$.""",
    "points": 20
  },
  {
    "id": "bt_nc_dt_04",
    "topicId": "nc_duong_tron",
    "title": "Bán kính đường tròn ngoại tiếp tam giác vuông",
    "source": "SBT Toán 9 KNTT Tập 1 - Bài 5.3*",
    "difficulty": "Nâng cao 8.5+",
    "content": "Cho tam giác $ABC$ vuông tại $A$ có $AB = 6\\text{ cm}$, $AC = 8\\text{ cm}$. Bán kính $R$ của đường tròn ngoại tiếp tam giác $ABC$ bằng bao nhiêu cm?",
    "placeholder": "Nhập bán kính R (cm)...",
    "correctAnswer": "5",
    "acceptableAnswers": ["5", "5 cm", "5cm"],
    "hint": "Tâm đường tròn ngoại tiếp tam giác vuông là trung điểm của cạnh huyền.",
    "explanation": """🧠 BẢN CHẤT LÝ THUYẾT & ĐỊNH LÝ CỐT LÕI:
- Tam giác vuông nội tiếp đường tròn có cạnh huyền là đường kính: $R = \\frac{\\text{Cạnh huyền}}{2}$.

📝 LỜI GIẢI TỪNG BƯỚC:
1. Tính cạnh huyền $BC$ theo định lý Pythagore:
   $$BC = \\sqrt{AB^2 + AC^2} = \\sqrt{6^2 + 8^2} = \\sqrt{100} = 10\\text{ cm}$$
2. Bán kính đường tròn ngoại tiếp:
   $$R = \\frac{BC}{2} = \\frac{10}{2} = 5\\text{ cm}$$""",
    "points": 20
  },

  # -------------------------------------------------------------
  # CHUYÊN ĐỀ 6: PARABOL & ĐỊNH LÝ VI-ÉT NÂNG CAO
  # -------------------------------------------------------------
  {
    "id": "bt_nc_viet_01",
    "topicId": "nc_viet",
    "title": "Tính tổng bình phương nghiệm bằng định lý Vi-ét",
    "source": "SBT Toán 9 KNTT Tập 2 - Bài 6.12*",
    "difficulty": "Nâng cao 8.5+",
    "content": "Cho phương trình bậc hai $x^2 - 5x + 3 = 0$ có hai nghiệm phân biệt $x_1, x_2$. Giá trị của biểu thức $A = x_1^2 + x_2^2$ bằng bao nhiêu?",
    "placeholder": "Nhập giá trị của A...",
    "correctAnswer": "19",
    "acceptableAnswers": ["19"],
    "hint": "Biến đổi x1^2 + x2^2 = (x1 + x2)^2 - 2*x1*x2.",
    "explanation": """🧠 BẢN CHẤT LÝ THUYẾT & ĐỊNH LÝ CỐT LÕI:
- Định lý Vi-ét cho $ax^2 + bx + c = 0$: $S = x_1 + x_2 = -\\frac{b}{a}$, $P = x_1 x_2 = \\frac{c}{a}$.
- Hằng đẳng thức biến đổi đối xứng: $x_1^2 + x_2^2 = (x_1 + x_2)^2 - 2x_1 x_2$.

📝 LỜI GIẢI TỪNG BƯỚC:
1. Phương trình $x^2 - 5x + 3 = 0$ có $\\Delta = (-5)^2 - 4(1)(3) = 25 - 12 = 13 > 0$ nên luôn có 2 nghiệm phân biệt.
2. Theo Vi-ét: $x_1 + x_2 = 5$ và $x_1 x_2 = 3$.
3. Thay vào biểu thức $A$:
   $$A = (x_1 + x_2)^2 - 2x_1 x_2 = 5^2 - 2(3) = 25 - 6 = 19$$""",
    "points": 20
  },
  {
    "id": "bt_nc_viet_02",
    "topicId": "nc_viet",
    "title": "Tương giao Parabol và đường thẳng tiếp xúc",
    "source": "SBT Toán 9 KNTT Tập 2 - Bài 6.18*",
    "difficulty": "Vận dụng cao 9+",
    "content": "Cho parabol $(P): y = x^2$ và đường thẳng $(d): y = 2x + m$. Tìm giá trị của $m$ để $(d)$ tiếp xúc với $(P)$.",
    "placeholder": "Nhập giá trị m (ví dụ: -1)...",
    "correctAnswer": "-1",
    "acceptableAnswers": ["-1", "m=-1", "m = -1"],
    "hint": "Phương trình hoành độ giao điểm có nghiệm kép khi Delta' = 0.",
    "explanation": """🧠 BẢN CHẤT LÝ THUYẾT & ĐỊNH LÝ CỐT LÕI:
- $(d)$ tiếp xúc $(P)$ khi và chỉ khi phương trình hoành độ giao điểm có nghiệm kép (nghĩa là $\\Delta = 0$).

📝 LỜI GIẢI TỪNG BƯỚC:
1. Phương trình hoành độ giao điểm:
   $$x^2 = 2x + m \\Leftrightarrow x^2 - 2x - m = 0$$
2. Tính biệt thức thu gọn:
   $$\\Delta' = (-1)^2 - 1(-m) = 1 + m$$
3. Để $(d)$ tiếp xúc $(P)$ thì $\\Delta' = 0 \\Leftrightarrow 1 + m = 0 \\Leftrightarrow m = -1$.
4. Khi $m = -1$, phương trình có nghiệm kép $x = 1$, tiếp điểm là $(1; 1)$.""",
    "points": 25
  },
  {
    "id": "bt_nc_viet_03",
    "topicId": "nc_viet",
    "title": "Biểu thức tích và tổng nghiệm phân biệt",
    "source": "SBT Toán 9 KNTT Tập 2 - Bài 6.22*",
    "difficulty": "Vận dụng cao 9+",
    "content": "Cho phương trình $x^2 - (m + 1)x + m = 0$. Tìm giá trị DƯƠNG của tham số $m$ để phương trình có hai nghiệm phân biệt $x_1, x_2$ thỏa mãn $x_1^2 x_2 + x_1 x_2^2 = 12$.",
    "placeholder": "Nhập giá trị dương của m...",
    "correctAnswer": "3",
    "acceptableAnswers": ["3", "m=3", "m = 3"],
    "hint": "Đặt nhân tử chung x1*x2*(x1 + x2) = 12 rồi dùng Vi-ét.",
    "explanation": """🧠 BẢN CHẤT LÝ THUYẾT & ĐỊNH LÝ CỐT LÕI:
- Phân tích nhân tử $x_1^2 x_2 + x_1 x_2^2 = x_1 x_2 (x_1 + x_2)$.

📝 LỜI GIẢI TỪNG BƯỚC:
1. Nhận xét: $a + b + c = 1 - (m + 1) + m = 0 \\Rightarrow$ phương trình luôn có 2 nghiệm là $x_1 = 1, x_2 = m$.
2. Hai nghiệm phân biệt $\\Leftrightarrow m \\ne 1$.
3. Theo Vi-ét: $x_1 + x_2 = m + 1$ và $x_1 x_2 = m$.
4. Biến đổi điều kiện bài toán:
   $$x_1 x_2 (x_1 + x_2) = 12 \\Leftrightarrow m(m + 1) = 12 \\Leftrightarrow m^2 + m - 12 = 0$$
5. Giải phương trình bậc hai: $(m - 3)(m + 4) = 0 \\Rightarrow m = 3$ hoặc $m = -4$.
6. Vì đề bài yêu cầu tìm giá trị DƯƠNG của $m$, nên ta nhận $m = 3$ (thỏa mãn $m \\ne 1$).""",
    "points": 25
  },
  {
    "id": "bt_nc_viet_04",
    "topicId": "nc_viet",
    "title": "Bình phương hiệu hai nghiệm",
    "source": "SBT Toán 9 KNTT Tập 2 - Bài 6.15*",
    "difficulty": "Nâng cao 8.5+",
    "content": "Cho phương trình bậc hai $x^2 - 4x + 1 = 0$ có hai nghiệm $x_1, x_2$. Giá trị của biểu thức $P = (x_1 - x_2)^2$ bằng bao nhiêu?",
    "placeholder": "Nhập giá trị số nguyên...",
    "correctAnswer": "12",
    "acceptableAnswers": ["12"],
    "hint": "(x1 - x2)^2 = (x1 + x2)^2 - 4*x1*x2.",
    "explanation": """🧠 BẢN CHẤT LÝ THUYẾT & ĐỊNH LÝ CỐT LÕI:
- Công thức: $(x_1 - x_2)^2 = (x_1 + x_2)^2 - 4x_1 x_2 = \\frac{\\Delta}{a^2}$.

📝 LỜI GIẢI TỪNG BƯỚC:
1. Theo Vi-ét: $x_1 + x_2 = 4$ và $x_1 x_2 = 1$.
2. Khai triển hằng đẳng thức:
   $$P = (x_1 - x_2)^2 = (x_1 + x_2)^2 - 4x_1 x_2 = 4^2 - 4(1) = 16 - 4 = 12$$""",
    "points": 20
  },

  # -------------------------------------------------------------
  # CHUYÊN ĐỀ 7: THỐNG KÊ: TẦN SỐ & TẦN SỐ TƯƠNG ĐỐI
  # -------------------------------------------------------------
  {
    "id": "bt_nc_tk_01",
    "topicId": "nc_thong_ke",
    "title": "Tính tần số tương đối phần trăm từ mẫu số liệu",
    "source": "SBT Toán 9 KNTT Tập 2 - Bài 7.4*",
    "difficulty": "Nâng cao 8.5+",
    "content": "Trong một cuộc khảo sát về số giờ tự học mỗi ngày của $50$ học sinh lớp 9, có $15$ học sinh tự học từ $3$ giờ trở lên. Tần số tương đối của nhóm học sinh này bằng bao nhiêu phần trăm? (Chỉ điền số, không cần nhập ký hiệu %).",
    "placeholder": "Nhập số phần trăm (ví dụ: 30)...",
    "correctAnswer": "30",
    "acceptableAnswers": ["30", "30%", "30 %"],
    "hint": "Tần số tương đối f% = (Tần số m / Kích thước mẫu N) * 100%.",
    "explanation": """🧠 BẢN CHẤT LÝ THUYẾT & ĐỊNH LÝ CỐT LÕI:
- Công thức tính tần số tương đối: $f_i = \\frac{m_i}{N} \\times 100\\%$.

📝 LỜI GIẢI TỪNG BƯỚC:
1. Tần số của nhóm tự học từ 3 giờ trở lên là $m = 15$.
2. Kích thước mẫu (tổng số học sinh) là $N = 50$.
3. Tần số tương đối:
   $$f = \\frac{15}{50} \\times 100\\% = 0{,}3 \\times 100\\% = 30\\%$$
4. Điền số: $30$.""",
    "points": 20
  },
  {
    "id": "bt_nc_tk_02",
    "topicId": "nc_thong_ke",
    "title": "Tìm cỡ mẫu N khi biết tần số và tần số tương đối",
    "source": "SBT Toán 9 KNTT Tập 2 - Bài 7.8*",
    "difficulty": "Nâng cao 8.5+",
    "content": "Một lớp học có bảng tần số điểm kiểm tra môn Toán, trong đó số học sinh đạt điểm $9$ có tần số là $12$ và chiếm tần số tương đối là $30\\%$. Tổng số học sinh của cả lớp là bao nhiêu học sinh?",
    "placeholder": "Nhập tổng số học sinh...",
    "correctAnswer": "40",
    "acceptableAnswers": ["40", "40 học sinh", "40 hs"],
    "hint": "Cỡ mẫu N = Tần số / Tần số tương đối = 12 / 0.3.",
    "explanation": """🧠 BẢN CHẤT LÝ THUYẾT & ĐỊNH LÝ CỐT LÕI:
- Từ $f = \\frac{m}{N} \\Rightarrow N = \\frac{m}{f}$.

📝 LỜI GIẢI TỪNG BƯỚC:
1. Tần số đạt điểm 9 là $m = 12$.
2. Tần số tương đối $f = 30\\% = 0{,}3$.
3. Tổng số học sinh của cả lớp là:
   $$N = \\frac{12}{0{,}3} = 40\\text{ học sinh}$$""",
    "points": 20
  },
  {
    "id": "bt_nc_tk_03",
    "topicId": "nc_thong_ke",
    "title": "Chuyển đổi góc ở tâm biểu đồ hình quạt sang tần số tương đối",
    "source": "SBT Toán 9 KNTT Tập 2 - Bài 7.15*",
    "difficulty": "Nâng cao 8.5+",
    "content": "Biểu đồ hình quạt tròn biểu diễn tỉ lệ học sinh tham gia các câu lạc bộ thể thao. Hình quạt biểu diễn câu lạc bộ Cầu lông có số đo góc ở tâm là $72^\\circ$. Tần số tương đối của số học sinh chọn môn Cầu lông bằng bao nhiêu phần trăm? (Chỉ điền số, không nhập ký hiệu %).",
    "placeholder": "Nhập số phần trăm (ví dụ: 20)...",
    "correctAnswer": "20",
    "acceptableAnswers": ["20", "20%", "20 %"],
    "hint": "Toàn bộ hình tròn tương ứng với 360 độ và 100%. Tỉ lệ = (72 / 360) * 100%.",
    "explanation": """🧠 BẢN CHẤT LÝ THUYẾT & ĐỊNH LÝ CỐT LÕI:
- Góc ở tâm tương ứng với tần số tương đối: $\\frac{\\alpha}{360^\\circ} = \\frac{f\\%}{100\\%}$.

📝 LỜI GIẢI TỪNG BƯỚC:
1. Tỉ lệ phần trăm:
   $$f\\% = \\frac{72^\\circ}{360^\\circ} \\times 100\\% = \\frac{1}{5} \\times 100\\% = 20\\%$$
2. Điền số: $20$.""",
    "points": 20
  },

  # -------------------------------------------------------------
  # CHUYÊN ĐỀ 8: XÁC SUẤT BIẾN CỐ TRONG THỰC TẾ
  # -------------------------------------------------------------
  {
    "id": "bt_nc_xs_01",
    "topicId": "nc_xac_suat",
    "title": "Xác suất rút được thẻ ghi số nguyên tố",
    "source": "SBT Toán 9 KNTT Tập 2 - Bài 8.5*",
    "difficulty": "Nâng cao 8.5+",
    "content": "Trong một hộp có $20$ chiếc thẻ cùng loại được đánh số từ $1$ đến $20$. Rút ngẫu nhiên một chiếc thẻ. Xác suất để rút được thẻ ghi số nguyên tố bằng bao nhiêu? (Nhập kết quả dưới dạng số thập phân, ví dụ: 0.4).",
    "placeholder": "Nhập số thập phân (ví dụ: 0.4)...",
    "correctAnswer": "0.4",
    "acceptableAnswers": ["0.4", "0,4", "2/5"],
    "hint": "Liệt kê các số nguyên tố từ 1 đến 20: 2, 3, 5, 7, 11, 13, 17, 19.",
    "explanation": """🧠 BẢN CHẤT LÝ THUYẾT & ĐỊNH LÝ CỐT LÕI:
- Công thức xác suất cổ điển: $P(A) = \\frac{n(A)}{n(\\Omega)}$.

📝 LỜI GIẢI TỪNG BƯỚC:
1. Không gian mẫu $n(\\Omega) = 20$.
2. Tập hợp các số nguyên tố từ $1$ đến $20$ là:
   $$A = \\{2; 3; 5; 7; 11; 13; 17; 19\\} \\Rightarrow n(A) = 8$$
3. Xác suất của biến cố:
   $$P(A) = \\frac{8}{20} = \\frac{2}{5} = 0{,}4$$""",
    "points": 20
  },
  {
    "id": "bt_nc_xs_02",
    "topicId": "nc_xac_suat",
    "title": "Xác suất gieo xúc xắc chia hết cho 3",
    "source": "SBT Toán 9 KNTT Tập 2 - Bài 8.2",
    "difficulty": "Nâng cao 8.5+",
    "content": "Gieo một con xúc xắc cân đối và đồng chất $6$ mặt một lần. Xác suất để xuất hiện mặt có số chấm chia hết cho $3$ bằng bao nhiêu? (Nhập kết quả dưới dạng phân số tối giản a/b, ví dụ: 1/3).",
    "placeholder": "Nhập phân số a/b (ví dụ: 1/3)...",
    "correctAnswer": "1/3",
    "acceptableAnswers": ["1/3", "0.33", "2/6"],
    "hint": "Các mặt chia hết cho 3 của xúc xắc là mặt 3 và 6.",
    "explanation": """🧠 BẢN CHẤT LÝ THUYẾT & ĐỊNH LÝ CỐT LÕI:
- Không gian mẫu gồm 6 kết quả đồng khả năng: $\\{1; 2; 3; 4; 5; 6\\}$.

📝 LỜI GIẢI TỪNG BƯỚC:
1. Có $2$ mặt chia hết cho $3$ là mặt $3$ chấm và mặt $6$ chấm $\\Rightarrow n(A) = 2$.
2. Xác suất:
   $$P(A) = \\frac{2}{6} = \\frac{1}{3}$$""",
    "points": 20
  },
  {
    "id": "bt_nc_xs_03",
    "topicId": "nc_xac_suat",
    "title": "Xác suất tung hai đồng xu xuất hiện ít nhất một mặt ngửa",
    "source": "SBT Toán 9 KNTT Tập 2 - Bài 8.9*",
    "difficulty": "Nâng cao 8.5+",
    "content": "Tung đồng thời hai đồng xu cân đối và đồng chất. Xác suất để có ít nhất một đồng xu xuất hiện mặt ngửa bằng bao nhiêu? (Nhập kết quả dưới dạng số thập phân, ví dụ: 0.75).",
    "placeholder": "Nhập số thập phân (ví dụ: 0.75)...",
    "correctAnswer": "0.75",
    "acceptableAnswers": ["0.75", "0,75", "3/4"],
    "hint": "Biến cố đối là cả hai đồng xu đều sấp (SS). P(A) = 1 - P(SS).",
    "explanation": """🧠 BẢN CHẤT LÝ THUYẾT & ĐỊNH LÝ CỐT LÕI:
- Dùng biến cố đối: $P(A) = 1 - P(\\overline{A})$.

📝 LỜI GIẢI TỪNG BƯỚC:
1. Không gian mẫu khi tung 2 đồng xu: $\\Omega = \\{NN; NS; SN; SS\\} \\Rightarrow n(\\Omega) = 4$.
2. Biến cố đối $\\overline{A}$: \"Cả hai đồng xu đều xuất hiện mặt sấp\" là $\\{SS\\} \\Rightarrow n(\\overline{A}) = 1$.
3. Xác suất cần tìm:
   $$P(A) = 1 - P(\\overline{A}) = 1 - \\frac{1}{4} = \\frac{3}{4} = 0{,}75$$""",
    "points": 20
  },

  # -------------------------------------------------------------
  # CHUYÊN ĐỀ 9: TỨ GIÁC NỘI TIẾP & CỰC TRỊ HÌNH HỌC
  # -------------------------------------------------------------
  {
    "id": "bt_nc_tg_01",
    "topicId": "nc_tu_giac",
    "title": "Tính góc đối diện của tứ giác nội tiếp đường tròn",
    "source": "SBT Toán 9 KNTT Tập 2 - Bài 9.4*",
    "difficulty": "Nâng cao 8.5+",
    "content": "Cho tứ giác $ABCD$ nội tiếp đường tròn. Biết số đo góc $\\widehat{A} = 70^\\circ$. Số đo góc $\\widehat{C}$ bằng bao nhiêu độ? (Chỉ điền số, không cần nhập ký hiệu độ).",
    "placeholder": "Nhập số đo độ...",
    "correctAnswer": "110",
    "acceptableAnswers": ["110", "110°"],
    "hint": "Tổng hai góc đối diện của một tứ giác nội tiếp luôn bằng 180 độ.",
    "explanation": """🧠 BẢN CHẤT LÝ THUYẾT & ĐỊNH LÝ CỐT LÕI:
- Định lý: Trong một tứ giác nội tiếp, tổng số đo hai góc đối diện bằng $180^\\circ$: $\\widehat{A} + \\widehat{C} = 180^\\circ$.

📝 LỜI GIẢI TỪNG BƯỚC:
1. Do tứ giác $ABCD$ nội tiếp đường tròn nên:
   $$\\widehat{A} + \\widehat{C} = 180^\\circ$$
2. Suy ra:
   $$\\widehat{C} = 180^\\circ - \\widehat{A} = 180^\\circ - 70^\\circ = 110^\\circ$$""",
    "points": 20
  },
  {
    "id": "bt_nc_tg_02",
    "topicId": "nc_tu_giac",
    "title": "Góc nội tiếp 30 độ và độ dài dây cung",
    "source": "SBT Toán 9 KNTT Tập 2 - Bài 9.11*",
    "difficulty": "Nâng cao 8.5+",
    "content": "Cho đường tròn $(O)$ có bán kính $R = 6\\text{ cm}$. Góc nội tiếp $\\widehat{BAC} = 30^\\circ$ chắn cung $BC$. Độ dài dây cung $BC$ bằng bao nhiêu cm?",
    "placeholder": "Nhập độ dài dây BC (cm)...",
    "correctAnswer": "6",
    "acceptableAnswers": ["6", "6 cm", "6cm"],
    "hint": "Góc ở tâm BOC gấp đôi góc nội tiếp BAC. Suy ra tam giác BOC là tam giác gì?",
    "explanation": """🧠 BẢN CHẤT LÝ THUYẾT & ĐỊNH LÝ CỐT LÕI:
- Số đo góc ở tâm bằng hai lần số đo góc nội tiếp cùng chắn một cung: $\\widehat{BOC} = 2\\widehat{BAC}$.

📝 LỜI GIẢI TỪNG BƯỚC:
1. Ta có góc ở tâm: $\\widehat{BOC} = 2 \\cdot 30^\\circ = 60^\\circ$.
2. Xét tam giác $OBC$: Có $OB = OC = R = 6\\text{ cm}$ (tam giác cân tại $O$) và góc ở đỉnh $\\widehat{BOC} = 60^\\circ$.
3. Do đó tam giác $OBC$ là tam giác đều.
4. Suy ra $BC = OB = R = 6\\text{ cm}$.""",
    "points": 20
  },
  {
    "id": "bt_nc_tg_03",
    "topicId": "nc_tu_giac",
    "title": "Bán kính đường tròn ngoại tiếp tam giác đều",
    "source": "SBT Toán 9 KNTT Tập 2 - Bài 9.16*",
    "difficulty": "Vận dụng cao 9+",
    "content": "Cho tam giác đều $ABC$ có độ dài cạnh $a = 6\\text{ cm}$ nội tiếp đường tròn $(O; R)$. Biết bán kính $R$ có dạng $k\\sqrt{3}\\text{ cm}$. Giá trị của số nguyên $k$ bằng bao nhiêu?",
    "placeholder": "Nhập giá trị k...",
    "correctAnswer": "2",
    "acceptableAnswers": ["2", "k=2", "k = 2"],
    "hint": "Trong tam giác đều cạnh a, bán kính đường tròn ngoại tiếp là R = (a * căn 3) / 3.",
    "explanation": """🧠 BẢN CHẤT LÝ THUYẾT & ĐỊNH LÝ CỐT LÕI:
- Trọng tâm tam giác đều đồng thời là tâm đường tròn ngoại tiếp. Đường cao $h = \\frac{a\\sqrt{3}}{2}$, bán kính $R = \\frac{2}{3}h = \\frac{a\\sqrt{3}}{3}$.

📝 LỜI GIẢI TỪNG BƯỚC:
1. Với cạnh $a = 6\\text{ cm}$, bán kính đường tròn ngoại tiếp là:
   $$R = \\frac{6\\sqrt{3}}{3} = 2\\sqrt{3}\\text{ cm}$$
2. So sánh với dạng $R = k\\sqrt{3}$, ta có $k = 2$.""",
    "points": 25
  },
  {
    "id": "bt_nc_tg_04",
    "topicId": "nc_tu_giac",
    "title": "Diện tích hình vuông nội tiếp đường tròn",
    "source": "SBT Toán 9 KNTT Tập 2 - Bài 9.8*",
    "difficulty": "Nâng cao 8.5+",
    "content": "Cho hình vuông $ABCD$ nội tiếp đường tròn $(O; R)$ có bán kính $R = 4\\text{ cm}$. Diện tích của hình vuông $ABCD$ bằng bao nhiêu $\\text{cm}^2$?",
    "placeholder": "Nhập diện tích hình vuông (cm2)...",
    "correctAnswer": "32",
    "acceptableAnswers": ["32", "32 cm2", "32cm2"],
    "hint": "Đường chéo hình vuông nội tiếp chính là đường kính của đường tròn: d = 2R = 8 cm. Diện tích = d^2 / 2.",
    "explanation": """🧠 BẢN CHẤT LÝ THUYẾT & ĐỊNH LÝ CỐT LÕI:
- Hình vuông nội tiếp có đường chéo $d = 2R$.
- Diện tích hình vuông tính theo đường chéo: $S = \\frac{d^2}{2}$.

📝 LỜI GIẢI TỪNG BƯỚC:
1. Đường chéo hình vuông: $d = 2R = 2 \\times 4 = 8\\text{ cm}$.
2. Diện tích hình vuông:
   $$S = \\frac{d^2}{2} = \\frac{8^2}{2} = \\frac{64}{2} = 32\\text{ cm}^2$$""",
    "points": 20
  },

  # -------------------------------------------------------------
  # CHUYÊN ĐỀ 10: HÌNH TRỤ, NÓN, CẦU TRONG THỰC TIỄN
  # -------------------------------------------------------------
  {
    "id": "bt_nc_hk_01",
    "topicId": "nc_hinh_khoi",
    "title": "Thể tích lon sữa đặc hình trụ",
    "source": "SBT Toán 9 KNTT Tập 2 - Bài 10.3*",
    "difficulty": "Nâng cao 8.5+",
    "content": "Một lon sữa đặc hình trụ có đường kính đáy là $8\\text{ cm}$ và chiều cao là $10\\text{ cm}$. Thể tích của lon sữa bằng bao nhiêu $\\pi\\text{ cm}^3$? (Chỉ điền hệ số nguyên đứng trước $\\pi$).",
    "placeholder": "Nhập hệ số trước pi (ví dụ: 160)...",
    "correctAnswer": "160",
    "acceptableAnswers": ["160", "160pi", "160 pi"],
    "hint": "Bán kính r = đường kính / 2 = 4 cm. Thể tích hình trụ V = pi * r^2 * h.",
    "explanation": """🧠 BẢN CHẤT LÝ THUYẾT & ĐỊNH LÝ CỐT LÕI:
- Công thức thể tích hình trụ: $V = \\pi r^2 h$.

📝 LỜI GIẢI TỪNG BƯỚC:
1. Bán kính đáy hình trụ: $r = \\frac{8}{2} = 4\\text{ cm}$.
2. Thể tích lon sữa:
   $$V = \\pi r^2 h = \\pi \\cdot 4^2 \\cdot 10 = \\pi \\cdot 16 \\cdot 10 = 160\\pi\\text{ cm}^3$$
3. Hệ số đứng trước $\\pi$ là $160$.""",
    "points": 20
  },
  {
    "id": "bt_nc_hk_02",
    "topicId": "nc_hinh_khoi",
    "title": "Diện tích xung quanh của nón lá hình nón",
    "source": "SBT Toán 9 KNTT Tập 2 - Bài 10.7*",
    "difficulty": "Nâng cao 8.5+",
    "content": "Một chiếc nón lá hình nón có độ dài đường sinh $l = 30\\text{ cm}$ và bán kính đáy $r = 20\\text{ cm}$. Diện tích xung quanh của chiếc nón lá bằng bao nhiêu $\\pi\\text{ cm}^2$? (Chỉ điền hệ số nguyên đứng trước $\\pi$).",
    "placeholder": "Nhập hệ số trước pi (ví dụ: 600)...",
    "correctAnswer": "600",
    "acceptableAnswers": ["600", "600pi", "600 pi"],
    "hint": "Diện tích xung quanh hình nón: Sxq = pi * r * l.",
    "explanation": """🧠 BẢN CHẤT LÝ THUYẾT & ĐỊNH LÝ CỐT LÕI:
- Công thức diện tích xung quanh hình nón: $S_{xq} = \\pi r l$.

📝 LỜI GIẢI TỪNG BƯỚC:
1. Thay số vào công thức:
   $$S_{xq} = \\pi \\cdot 20 \\cdot 30 = 600\\pi\\text{ cm}^2$$
2. Hệ số đứng trước $\\pi$ là $600$.""",
    "points": 20
  },
  {
    "id": "bt_nc_hk_03",
    "topicId": "nc_hinh_khoi",
    "title": "Diện tích mặt cầu của quả bóng bàn",
    "source": "SBT Toán 9 KNTT Tập 2 - Bài 10.12*",
    "difficulty": "Nâng cao 8.5+",
    "content": "Một quả bóng bàn hình cầu có đường kính là $4\\text{ cm}$. Diện tích bề mặt của quả bóng bàn bằng bao nhiêu $\\pi\\text{ cm}^2$? (Chỉ điền hệ số nguyên đứng trước $\\pi$).",
    "placeholder": "Nhập hệ số trước pi...",
    "correctAnswer": "16",
    "acceptableAnswers": ["16", "16pi", "16 pi"],
    "hint": "Bán kính R = đường kính / 2 = 2 cm. Diện tích mặt cầu S = 4 * pi * R^2.",
    "explanation": """🧠 BẢN CHẤT LÝ THUYẾT & ĐỊNH LÝ CỐT LÕI:
- Công thức diện tích mặt cầu: $S = 4\\pi R^2 = \\pi d^2$.

📝 LỜI GIẢI TỪNG BƯỚC:
1. Bán kính mặt cầu: $R = \\frac{4}{2} = 2\\text{ cm}$.
2. Diện tích bề mặt hình cầu:
   $$S = 4\\pi R^2 = 4\\pi (2^2) = 4\\pi \\cdot 4 = 16\\pi\\text{ cm}^2$$
3. Hệ số đứng trước $\\pi$ là $16$.""",
    "points": 20
  },
  {
    "id": "bt_nc_hk_04",
    "topicId": "nc_hinh_khoi",
    "title": "Dung tích bể nước hình trụ trong thực tế",
    "source": "SBT Toán 9 KNTT Tập 2 - Bài 10.18*",
    "difficulty": "Nâng cao 8.5+",
    "content": "Một bể chứa nước sinh hoạt hình trụ có bán kính đáy $r = 1\\text{ m}$ và chiều cao $h = 2\\text{ m}$. Lấy $\\pi \\approx 3{,}14$. Dung tích tối đa của bể nước là bao nhiêu mét khối ($m^3$)? (Nhập kết quả số thập phân).",
    "placeholder": "Nhập số thập phân (ví dụ: 6.28)...",
    "correctAnswer": "6.28",
    "acceptableAnswers": ["6.28", "6,28", "6.28 m3"],
    "hint": "Thể tích hình trụ V = pi * r^2 * h.",
    "explanation": """🧠 BẢN CHẤT LÝ THUYẾT & ĐỊNH LÝ CỐT LÕI:
- Dung tích bể chứa tương ứng với thể tích khối trụ: $V = \\pi r^2 h$.

📝 LỜI GIẢI TỪNG BƯỚC:
1. Thay số vào công thức:
   $$V = \\pi r^2 h \\approx 3{,}14 \\cdot (1)^2 \\cdot 2 = 6{,}28\\text{ m}^3$$
2. Dung tích tối đa của bể là $6{,}28\\text{ m}^3$ (tương đương $6280$ lít nước).""",
    "points": 20
  },
  {
    "id": "bt_nc_hpt_05",
    "topicId": "nc_he_pt",
    "title": "Toán thực tế làm chung làm riêng hai vòi nước",
    "source": "SBT Toán 9 KNTT Tập 1 - Bài 1.25*",
    "difficulty": "Nâng cao 8.5+",
    "content": "Hai vòi nước cùng chảy vào một bể cạn thì sau $4$ giờ đầy bể. Nếu mở vòi thứ nhất chảy một mình trong $2$ giờ rồi mở tiếp vòi thứ hai chảy một mình trong $3$ giờ thì cả hai vòi chảy được $\\frac{7}{12}$ bể. Hỏi nếu chảy một mình thì vòi thứ hai chảy đầy bể trong bao nhiêu giờ?",
    "placeholder": "Nhập số giờ (ví dụ: 12)...",
    "correctAnswer": "12",
    "acceptableAnswers": ["12", "12 giờ", "12h"],
    "hint": "Gọi thời gian chảy một mình của vòi 1 và vòi 2 là x và y (giờ). Trong 1h mỗi vòi chảy được 1/x và 1/y bể.",
    "explanation": """🧠 BẢN CHẤT LÝ THUYẾT & ĐỊNH LÝ CỐT LÕI:
- Coi toàn bộ dung tích bể là 1 đơn vị công việc. Năng suất chảy mỗi giờ lần lượt là $\\frac{1}{x}$ và $\\frac{1}{y}$.

📝 LỜI GIẢI TỪNG BƯỚC:
1. Gọi thời gian vòi 1 và vòi 2 chảy một mình đầy bể lần lượt là $x$ và $y$ ($x, y > 4$).
2. Hai vòi cùng chảy sau 4 giờ đầy bể:
   $$\\frac{1}{x} + \\frac{1}{y} = \\frac{1}{4}$$
3. Vòi 1 chảy 2h và vòi 2 chảy 3h được $\\frac{7}{12}$ bể:
   $$\\frac{2}{x} + \\frac{3}{y} = \\frac{7}{12}$$
4. Đặt $u = \\frac{1}{x}, v = \\frac{1}{y}$. Hệ trở thành:
   $$\\begin{cases} u + v = \\frac{1}{4} \\\\ 2u + 3v = \\frac{7}{12} \\end{cases} \\Rightarrow \\begin{cases} 2u + 2v = \\frac{1}{2} \\\\ 2u + 3v = \\frac{7}{12} \\end{cases} \\Rightarrow v = \\frac{7}{12} - \\frac{6}{12} = \\frac{1}{12}$$
5. Suy ra $y = 12$ (giờ). Vòi thứ hai chảy một mình trong $12$ giờ thì đầy bể.""",
    "points": 25
  },
  {
    "id": "bt_nc_bpt_05",
    "topicId": "nc_bpt",
    "title": "Bất đẳng thức Bunhiacopxki dạng căn thức",
    "source": "SBT Toán 9 KNTT Tập 1 - Ôn tập Chương II*",
    "difficulty": "Vận dụng cao 9+",
    "content": "Cho ba số thực dương $a, b, c > 0$ thỏa mãn $a + b + c = 3$. Giá trị lớn nhất của biểu thức $M = \\sqrt{a + 3} + \\sqrt{b + 3} + \\sqrt{c + 3}$ bằng bao nhiêu?",
    "placeholder": "Nhập giá trị max của M...",
    "correctAnswer": "6",
    "acceptableAnswers": ["6", "6.0"],
    "hint": "Áp dụng BĐT Bunhiacopxki (Cauchy-Schwarz) cho 3 bộ số với (1, 1, 1).",
    "explanation": """🧠 BẢN CHẤT LÝ THUYẾT & ĐỊNH LÝ CỐT LÕI:
- BĐT Cauchy-Schwarz: $(1 \\cdot x + 1 \\cdot y + 1 \\cdot z)^2 \\le (1^2 + 1^2 + 1^2)(x^2 + y^2 + z^2) = 3(x^2 + y^2 + z^2)$.

📝 LỜI GIẢI TỪNG BƯỚC:
1. Áp dụng BĐT Bunhiacopxki cho bộ $(1, 1, 1)$ và $(\\sqrt{a+3}, \\sqrt{b+3}, \\sqrt{c+3})$:
   $$M^2 = (1\\sqrt{a+3} + 1\\sqrt{b+3} + 1\\sqrt{c+3})^2 \\le (1^2 + 1^2 + 1^2)(a + 3 + b + 3 + c + 3)$$
2. Thu gọn:
   $$M^2 \\le 3(a + b + c + 9) = 3(3 + 9) = 3 \\times 12 = 36$$
3. Do $M > 0$ nên $M \\le \\sqrt{36} = 6$.
4. Dấu \"=\" xảy ra khi $a = b = c = 1$. Giá trị lớn nhất là $6$.""",
    "points": 25
  },
  {
    "id": "bt_nc_can_05",
    "topicId": "nc_can_thuc",
    "title": "Giải phương trình chứa căn tìm giá trị biến",
    "source": "SBT Toán 9 KNTT Tập 1 - Bài 3.9*",
    "difficulty": "Nâng cao 8.5+",
    "content": "Cho biểu thức $A = \\frac{\\sqrt{x} - 2}{\\sqrt{x} + 1}$ với $x \\ge 0$. Giá trị của $x$ để biểu thức $A = -\\frac{1}{2}$ bằng bao nhiêu?",
    "placeholder": "Nhập giá trị của x...",
    "correctAnswer": "1",
    "acceptableAnswers": ["1", "x=1", "x = 1"],
    "hint": "Quy đồng nhân chéo: 2*(căn(x) - 2) = -(căn(x) + 1).",
    "explanation": """🧠 BẢN CHẤT LÝ THUYẾT & ĐỊNH LÝ CỐT LÕI:
- Với $x \\ge 0$ thì mẫu $\\sqrt{x} + 1 > 0$, nhân chéo khử mẫu an toàn.

📝 LỜI GIẢI TỪNG BƯỚC:
1. Phương trình: $\\frac{\\sqrt{x} - 2}{\\sqrt{x} + 1} = -\\frac{1}{2}$.
2. Nhân chéo:
   $$2(\\sqrt{x} - 2) = -(\\sqrt{x} + 1) \\Leftrightarrow 2\\sqrt{x} - 4 = -\\sqrt{x} - 1$$
3. Chuyển vế:
   $$3\\sqrt{x} = 3 \\Leftrightarrow \\sqrt{x} = 1 \\Leftrightarrow x = 1$$
4. Đối chiếu $x = 1$ thỏa mãn ĐKXĐ $x \\ge 0$.""",
    "points": 20
  },
  {
    "id": "bt_nc_htl_05",
    "topicId": "nc_he_thuc_luong",
    "title": "Tính diện tích tam giác vuông có cạnh góc vuông tỉ lệ 3:4",
    "source": "SBT Toán 9 KNTT Tập 1 - Bài 4.10*",
    "difficulty": "Nâng cao 8.5+",
    "content": "Một tam giác vuông có hai cạnh góc vuông tỉ lệ với $3$ và $4$, cạnh huyền có độ dài bằng $25\\text{ cm}$. Diện tích của tam giác vuông đó bằng bao nhiêu $\\text{cm}^2$?",
    "placeholder": "Nhập diện tích (cm2)...",
    "correctAnswer": "150",
    "acceptableAnswers": ["150", "150 cm2", "150cm2"],
    "hint": "Đặt hai cạnh là 3k và 4k. Cạnh huyền = căn((3k)^2 + (4k)^2) = 5k.",
    "explanation": """🧠 BẢN CHẤT LÝ THUYẾT & ĐỊNH LÝ CỐT LÕI:
- Bộ ba số Pythagore mở rộng: $3k, 4k, 5k$.

📝 LỜI GIẢI TỪNG BƯỚC:
1. Gọi độ dài hai cạnh góc vuông là $3k$ và $4k$ ($k > 0$).
2. Cạnh huyền: $\\sqrt{(3k)^2 + (4k)^2} = \\sqrt{25k^2} = 5k$.
3. Theo đề bài cạnh huyền bằng $25\\text{ cm} \\Rightarrow 5k = 25 \\Rightarrow k = 5$.
4. Độ dài hai cạnh góc vuông là: $a = 3 \\times 5 = 15\\text{ cm}$, $b = 4 \\times 5 = 20\\text{ cm}$.
5. Diện tích tam giác vuông:
   $$S = \\frac{1}{2} \\cdot 15 \\cdot 20 = 150\\text{ cm}^2$$""",
    "points": 20
  },
  {
    "id": "bt_nc_dt_05",
    "topicId": "nc_duong_tron",
    "title": "Khoảng cách giữa hai dây cung song song về hai phía tâm",
    "source": "SBT Toán 9 KNTT Tập 1 - Bài 5.11*",
    "difficulty": "Nâng cao 8.5+",
    "content": "Cho đường tròn $(O; R = 5\\text{ cm})$. Hai dây cung $AB = 6\\text{ cm}$ và $CD = 8\\text{ cm}$ song song với nhau và nằm về hai phía so với tâm $O$. Khoảng cách giữa hai dây cung $AB$ và $CD$ bằng bao nhiêu cm?",
    "placeholder": "Nhập khoảng cách giữa 2 dây (cm)...",
    "correctAnswer": "7",
    "acceptableAnswers": ["7", "7 cm", "7cm"],
    "hint": "Khoảng cách giữa 2 dây = Khoảng cách từ O đến AB + Khoảng cách từ O đến CD.",
    "explanation": """🧠 BẢN CHẤT LÝ THUYẾT & ĐỊNH LÝ CỐT LÕI:
- Khoảng cách từ tâm đến dây: $d = \\sqrt{R^2 - (\\text{Dây}/2)^2}$.
- Nằm về hai phía của tâm thì khoảng cách giữa hai dây bằng tổng hai khoảng cách.

📝 LỜI GIẢI TỪNG BƯỚC:
1. Khoảng cách từ $O$ đến dây $AB$:
   $$d_1 = \\sqrt{R^2 - \\left(\\frac{AB}{2}\\right)^2} = \\sqrt{5^2 - 3^2} = \\sqrt{16} = 4\\text{ cm}$$
2. Khoảng cách từ $O$ đến dây $CD$:
   $$d_2 = \\sqrt{R^2 - \\left(\\frac{CD}{2}\\right)^2} = \\sqrt{5^2 - 4^2} = \\sqrt{9} = 3\\text{ cm}$$
3. Vì hai dây nằm về hai phía so với tâm $O$, khoảng cách giữa hai dây là:
   $$d = d_1 + d_2 = 4 + 3 = 7\\text{ cm}$$""",
    "points": 20
  },
  {
    "id": "bt_nc_viet_05",
    "topicId": "nc_viet",
    "title": "Hệ thức Vi-ét không đối xứng x1 = 2*x2",
    "source": "SBT Toán 9 KNTT Tập 2 - Bài 6.26*",
    "difficulty": "Vận dụng cao 9+",
    "content": "Cho phương trình $x^2 - 6x + m = 0$. Tìm giá trị của tham số $m$ để phương trình có hai nghiệm $x_1, x_2$ thỏa mãn $x_1 - 2x_2 = 0$.",
    "placeholder": "Nhập giá trị của m...",
    "correctAnswer": "8",
    "acceptableAnswers": ["8", "m=8", "m = 8"],
    "hint": "Kết hợp x1 = 2*x2 với định lý Vi-ét x1 + x2 = 6 để tìm ra từng nghiệm cụ thể.",
    "explanation": """🧠 BẢN CHẤT LÝ THUYẾT & ĐỊNH LÝ CỐT LÕI:
- Hệ 3 phương trình: $\\begin{cases} x_1 + x_2 = 6 \\\\ x_1 = 2x_2 \\\\ x_1 x_2 = m \\end{cases}$.

📝 LỜI GIẢI TỪNG BƯỚC:
1. Từ $x_1 = 2x_2$ thay vào tổng $x_1 + x_2 = 6$:
   $$2x_2 + x_2 = 6 \\Leftrightarrow 3x_2 = 6 \\Rightarrow x_2 = 2$$
2. Suy ra $x_1 = 2 \\times 2 = 4$.
3. Theo Vi-ét: $m = x_1 x_2 = 4 \\times 2 = 8$.
4. Thử lại: Với $m = 8$, phương trình $x^2 - 6x + 8 = 0$ có $\\Delta' = 9 - 8 = 1 > 0$, nghiệm đúng là $4$ và $2$.""",
    "points": 25
  },
  {
    "id": "bt_nc_tk_04",
    "topicId": "nc_thong_ke",
    "title": "Tần số tương đối phần trăm học sinh khá giỏi",
    "source": "SBT Toán 9 KNTT Tập 2 - Bài 7.10*",
    "difficulty": "Nâng cao 8.5+",
    "content": "Lớp 9A có $40$ học sinh, trong đợt khảo sát giữa kỳ có $26$ bạn đạt điểm Giỏi. Tần số tương đối của số học sinh đạt điểm Giỏi của lớp 9A là bao nhiêu phần trăm? (Chỉ điền số, không cần nhập ký hiệu %).",
    "placeholder": "Nhập số phần trăm (ví dụ: 65)...",
    "correctAnswer": "65",
    "acceptableAnswers": ["65", "65%", "65 %"],
    "hint": "Tần số tương đối = (26 / 40) * 100%.",
    "explanation": """🧠 BẢN CHẤT LÝ THUYẾT & ĐỊNH LÝ CỐT LÕI:
- Công thức: $f = \\frac{m}{N} \\times 100\\%$.

📝 LỜI GIẢI TỪNG BƯỚC:
1. Tần số đạt điểm Giỏi: $m = 26$.
2. Sĩ số lớp: $N = 40$.
3. Tần số tương đối:
   $$f = \\frac{26}{40} \\times 100\\% = \\frac{13}{20} \\times 100\\% = 65\\%$$
4. Điền số: $65$.""",
    "points": 20
  },
  {
    "id": "bt_nc_xs_04",
    "topicId": "nc_xac_suat",
    "title": "Xác suất lấy bóng cùng màu trong hộp",
    "source": "SBT Toán 9 KNTT Tập 2 - Bài 8.7",
    "difficulty": "Nâng cao 8.5+",
    "content": "Một hộp kín chứa $5$ quả bóng màu đỏ, $3$ quả bóng màu xanh và $2$ quả bóng màu vàng có cùng kích thước và khối lượng. Lấy ngẫu nhiên một quả bóng từ hộp. Xác suất để lấy được quả bóng màu đỏ bằng bao nhiêu? (Nhập kết quả dưới dạng số thập phân, ví dụ: 0.5).",
    "placeholder": "Nhập số thập phân (ví dụ: 0.5)...",
    "correctAnswer": "0.5",
    "acceptableAnswers": ["0.5", "0,5", "1/2", "5/10"],
    "hint": "Tổng số quả bóng trong hộp là 5 + 3 + 2 = 10 quả.",
    "explanation": """🧠 BẢN CHẤT LÝ THUYẾT & ĐỊNH LÝ CỐT LÕI:
- Xác suất biến cố đơn giản: $P = \\frac{\\text{Số bóng đỏ}}{\\text{Tổng số bóng}}$.

📝 LỜI GIẢI TỪNG BƯỚC:
1. Tổng số bóng trong hộp: $N = 5 + 3 + 2 = 10$ quả.
2. Số bóng đỏ: $m = 5$ quả.
3. Xác suất lấy được bóng đỏ:
   $$P = \\frac{5}{10} = 0{,}5$$""",
    "points": 20
  },
  {
    "id": "bt_nc_tg_05",
    "topicId": "nc_tu_giac",
    "title": "Bán kính đường tròn nội tiếp tam giác vuông",
    "source": "SBT Toán 9 KNTT Tập 2 - Bài 9.14*",
    "difficulty": "Vận dụng cao 9+",
    "content": "Cho tam giác $ABC$ vuông tại $A$ có hai cạnh góc vuông là $AB = 3\\text{ cm}$ và $AC = 4\\text{ cm}$. Bán kính $r$ của đường tròn nội tiếp tam giác $ABC$ bằng bao nhiêu cm?",
    "placeholder": "Nhập bán kính r (cm)...",
    "correctAnswer": "1",
    "acceptableAnswers": ["1", "1 cm", "1cm", "1.0"],
    "hint": "Trong tam giác vuông, bán kính đường tròn nội tiếp là r = (a + b - c) / 2.",
    "explanation": """🧠 BẢN CHẤT LÝ THUYẾT & ĐỊNH LÝ CỐT LÕI:
- Công thức tính nhanh bán kính đường tròn nội tiếp tam giác vuông: $r = \\frac{AB + AC - BC}{2} = \\frac{S}{p}$.

📝 LỜI GIẢI TỪNG BƯỚC:
1. Tính cạnh huyền $BC$:
   $$BC = \\sqrt{AB^2 + AC^2} = \\sqrt{3^2 + 4^2} = 5\\text{ cm}$$
2. Áp dụng công thức bán kính đường tròn nội tiếp:
   $$r = \\frac{AB + AC - BC}{2} = \\frac{3 + 4 - 5}{2} = \\frac{2}{2} = 1\\text{ cm}$$""",
    "points": 25
  },
  {
    "id": "bt_nc_hk_05",
    "topicId": "nc_hinh_khoi",
    "title": "Đường sinh của khối nón",
    "source": "SBT Toán 9 KNTT Tập 2 - Bài 10.9*",
    "difficulty": "Nâng cao 8.5+",
    "content": "Một hình nón có chiều cao $h = 8\\text{ cm}$ và bán kính đáy $r = 6\\text{ cm}$. Độ dài đường sinh $l$ của hình nón bằng bao nhiêu cm?",
    "placeholder": "Nhập độ dài đường sinh (cm)...",
    "correctAnswer": "10",
    "acceptableAnswers": ["10", "10 cm", "10cm"],
    "hint": "Tam giác tạo bởi chiều cao, bán kính đáy và đường sinh là tam giác vuông: l^2 = h^2 + r^2.",
    "explanation": """🧠 BẢN CHẤT LÝ THUYẾT & ĐỊNH LÝ CỐT LÕI:
- Mối liên hệ trong hình nón: $l = \\sqrt{h^2 + r^2}$.

📝 LỜI GIẢI TỪNG BƯỚC:
1. Áp dụng định lý Pythagore:
   $$l = \\sqrt{h^2 + r^2} = \\sqrt{8^2 + 6^2} = \\sqrt{64 + 36} = \\sqrt{100} = 10\\text{ cm}$$""",
    "points": 20
  }
]

print(f"Total topics: {len(topics)}")
print(f"Total advanced fill-in questions: {len(questions)}")

# Write to js/advanced_data.js
js_content = f"""// ================================================================
// DỮ LIỆU BÀI TẬP NÂNG CAO - TRẮC NGHIỆM ĐIỀN ĐÁP ÁN (GDPT 2018)
// Nguồn: Sách Bài Tập (SBT) Toán 9 Kết Nối Tri Thức Với Cuộc Sống Tập 1 & Tập 2
// Thiết kế định dạng điền số / đáp án ngắn chuẩn quy chế mới
// ================================================================

const ADVANCED_TOPICS = {json.dumps(topics, ensure_ascii=False, indent=2)};

const ADVANCED_FILL_QUESTIONS = {json.dumps(questions, ensure_ascii=False, indent=2)};
"""

with open('js/advanced_data.js', 'w', encoding='utf-8') as f:
    f.write(js_content)

print("Generated js/advanced_data.js successfully!")
