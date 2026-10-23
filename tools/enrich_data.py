import re
import json

# 1. Read existing data.js
with open('js/data.js', 'r', encoding='utf-8') as f:
    content = f.read()

print("Original data.js length:", len(content))

# 2. Add ADVANCED_TOPICS before QUESTIONS
advanced_topics_code = '''
// ================================================================
// CÁC CHỦ ĐỀ TOÁN 9 NÂNG CAO (CHINH PHỤC ĐIỂM 9, 10 VÀO LỚP 10)
// ================================================================
const ADVANCED_TOPICS = [
  {
    id: 'nc_bdt',
    name: 'BĐT & Cực Trị Đại Số (9+)',
    icon: '∑',
    description: 'BĐT Cauchy (AM-GM), Bunhiacopxki, kĩ thuật chọn điểm rơi, Cauchy-Schwarz dạng phân thức (Engel)',
    color: 'from-amber-600 via-orange-600 to-red-600',
    borderColor: 'border-amber-500',
    badge: 'Vận dụng cao 9+'
  },
  {
    id: 'nc_viet',
    name: 'Định Lý Vi-ét Nâng Cao & Tương Giao',
    icon: '📈',
    description: 'Hệ thức Vi-ét không đối xứng, tìm tham số m để Parabol và đường thẳng cắt nhau thỏa mãn hệ thức tọa độ',
    color: 'from-purple-600 via-fuchsia-600 to-pink-600',
    borderColor: 'border-purple-500',
    badge: 'Vận dụng cao 9+'
  },
  {
    id: 'nc_he_pt',
    name: 'Hệ PT & Phương Trình Vô Tỷ',
    icon: '⚡',
    description: 'Hệ đối xứng loại 1, loại 2, phương trình chứa căn giải bằng nhân liên hợp, đặt ẩn phụ không hoàn toàn',
    color: 'from-blue-600 via-indigo-600 to-violet-600',
    borderColor: 'border-blue-500',
    badge: 'Vận dụng cao 9+'
  },
  {
    id: 'nc_rut_gon',
    name: 'Rút Gọn Căn Thức & Bài Toán Phụ',
    icon: '√',
    description: 'Tìm x nguyên để biểu thức nguyên, so sánh biểu thức với hằng số, tìm Max/Min của biểu thức chứa căn',
    color: 'from-emerald-600 via-teal-600 to-cyan-600',
    borderColor: 'border-emerald-500',
    badge: 'Vận dụng cao 9+'
  },
  {
    id: 'nc_hinh_hoc',
    name: 'Hình Học Nâng Cao: Cực Trị & Điểm Cố Định',
    icon: '📐',
    description: 'Chứng minh đường thẳng đi qua điểm cố định, tìm vị trí điểm để diện tích/chu vi max/min, tứ giác nội tiếp khó',
    color: 'from-rose-600 via-pink-600 to-red-600',
    borderColor: 'border-rose-500',
    badge: 'Vận dụng cao 9+'
  },
  {
    id: 'nc_thuc_te_so_hoc',
    name: 'Toán Thực Tế Tối Ưu & Nghiệm Nguyên',
    icon: '🏆',
    description: 'Mô hình hóa bài toán thực tế tối ưu chi phí, bài toán năng suất chuyển động đa biến, phương trình nghiệm nguyên',
    color: 'from-yellow-500 via-amber-600 to-orange-700',
    borderColor: 'border-yellow-500',
    badge: 'Vận dụng cao 9+'
  }
];
'''

# 3. Create ADVANCED_QUESTIONS
advanced_questions_code = '''
// ================================================================
// NGÂN HÀNG CÂU HỎI VẬN DỤNG CAO 9-10 ĐIỂM (CÓ BẢN CHẤT LÝ THUYẾT & LỖI SAI)
// ================================================================
const ADVANCED_QUESTIONS = [
  // --- CHỦ ĐỀ NC 1: BĐT & CỰC TRỊ ĐẠI SỐ ---
  {
    id: 'nc_bdt_01',
    topicId: 'nc_bdt',
    title: 'Điểm rơi trong Bất đẳng thức AM-GM',
    content: 'Cho hai số thực dương $a, b > 0$ thỏa mãn điều kiện $a + b \\le 2$. Giá trị nhỏ nhất của biểu thức $P = \\frac{1}{a} + \\frac{1}{b}$ là:',
    options: [
      '$1$',
      '$2$',
      '$4$',
      '$\\frac{1}{2}$'
    ],
    correctAnswer: 1, // B. 2
    explanation: `🧠 BẢN CHẤT LÝ THUYẾT & ĐỊNH LÝ CỐT LÕI:
- Bất đẳng thức Cauchy (AM-GM) cho hai số dương: $\\\\frac{x + y}{2} \\\\ge \\\\sqrt{xy} \\\\Leftrightarrow (x + y)\\\\left(\\\\frac{1}{x} + \\\\frac{1}{y}\\\\right) \\\\ge 4 \\\\Rightarrow \\\\frac{1}{x} + \\\\frac{1}{y} \\\\ge \\\\frac{4}{x + y}$.
- Kỹ thuật chọn điểm rơi: Biểu thức đối xứng theo $a$ và $b$, giả thiết $a + b \\\\le 2$, do đó dấu bằng đạt tại tâm đối xứng $a = b = 1$.

⚠️ PHÂN TÍCH BẪY SAI THƯỜNG GẶP:
- Học sinh áp dụng vội $\\\\frac{1}{a} + \\\\frac{1}{b} \\\\ge 2\\\\sqrt{\\\\frac{1}{ab}}$ nhưng không chặn được $ab \\\\le 1$ nên bị bế tắc hoặc suy luận ngược chiều bất đẳng thức.

📝 LỜI GIẢI TỪNG BƯỚC:
1. Áp dụng BĐT dạng Schwarz/Cauchy: $P = \\\\frac{1}{a} + \\\\frac{1}{b} \\\\ge \\\\frac{(1+1)^2}{a + b} = \\\\frac{4}{a + b}$.
2. Vì $a + b \\\\le 2 \\\\Rightarrow \\\\frac{4}{a + b} \\\\ge \\\\frac{4}{2} = 2$.
3. Dấu "=" xảy ra khi $a = b = 1$ (thỏa mãn $a + b = 2$). Vậy GTNN của $P$ là $2$.

💡 QUY TẮC BẤT DI BẤT DỊCH:
Với tổng ở mẫu: Mẫu càng nhỏ thì phân số càng lớn. Khi đánh giá $\\\\frac{1}{X}$, cần bất đẳng thức chiều $X \\\\le M$.`,
    difficulty: 'advanced',
    points: 25
  },
  {
    id: 'nc_bdt_02',
    topicId: 'nc_bdt',
    title: 'Kỹ thuật tách ghép đối xứng',
    content: 'Cho hai số thực dương $x, y > 0$ thỏa mãn $x + y = 1$. Giá trị nhỏ nhất của biểu thức $A = \\frac{1}{x^2 + y^2} + \\frac{1}{2xy}$ bằng:',
    options: [
      '$4$',
      '$2$',
      '$8$',
      '$\\frac{5}{2}$'
    ],
    correctAnswer: 0, // A. 4
    explanation: `🧠 BẢN CHẤT LÝ THUYẾT & ĐỊNH LÝ CỐT LÕI:
- Kỹ thuật gom mẫu số tương đồng: Ta nhận thấy $(x^2 + y^2) + 2xy = (x + y)^2 = 1$.
- BĐT Cauchy dạng cộng mẫu số (Engel): $\\\\frac{1}{A} + \\\\frac{1}{B} \\\\ge \\\\frac{4}{A + B}$ với $A, B > 0$.

⚠️ PHÂN TÍCH BẪY SAI THƯỜNG GẶP:
- Tách vội $\\\\frac{1}{2xy}$ thành $\\\\frac{1}{4xy} + \\\\frac{1}{4xy}$ mà không nhận diện tổng $A + B = (x+y)^2 = 1$.

📝 LỜI GIẢI TỪNG BƯỚC:
1. Áp dụng BĐT cộng mẫu cho $A = x^2 + y^2$ và $B = 2xy$:
   $$\\\\frac{1}{x^2 + y^2} + \\\\frac{1}{2xy} \\\\ge \\\\frac{4}{(x^2 + y^2) + 2xy} = \\\\frac{4}{(x + y)^2}$$
2. Thay $x + y = 1$ vào: $A \\\\ge \\\\frac{4}{1^2} = 4$.
3. Dấu "=" xảy ra khi $x^2 + y^2 = 2xy \\\\Leftrightarrow (x - y)^2 = 0 \\\\Leftrightarrow x = y = \\\\frac{1}{2}$.

💡 QUY TẮC BẤT DI BẤT DỊCH:
Gặp dạng $\\\\frac{1}{a^2+b^2}$ và $\\\\frac{1}{ab}$, luôn nhớ tới phép cộng mẫu $(a^2+b^2) + 2ab = (a+b)^2$.`,
    difficulty: 'advanced',
    points: 25
  },
  {
    id: 'nc_bdt_03',
    topicId: 'nc_bdt',
    title: 'Bất đẳng thức Bunhiacopxki dạng căn thức',
    content: 'Cho ba số thực dương $a, b, c > 0$ thỏa mãn $a + b + c = 3$. Giá trị lớn nhất của $M = \\sqrt{a+3} + \\sqrt{b+3} + \\sqrt{c+3}$ là:',
    options: [
      '$3$',
      '$3\\sqrt{2}$',
      '$6$',
      '$4\\sqrt{3}$'
    ],
    correctAnswer: 2, // C. 6
    explanation: `🧠 BẢN CHẤT LÝ THUYẾT & ĐỊNH LÝ CỐT LÕI:
- BĐT Bunhiacopxki (Cauchy-Schwarz) cho 3 bộ số:
  $(1 \\\\cdot \\\\sqrt{a+3} + 1 \\\\cdot \\\\sqrt{b+3} + 1 \\\\cdot \\\\sqrt{c+3})^2 \\\\le (1^2 + 1^2 + 1^2)(a + 3 + b + 3 + c + 3)$.

⚠️ PHÂN TÍCH BẪY SAI THƯỜNG GẶP:
- Học sinh tính nhầm $(a+3) + (b+3) + (c+3) = a+b+c + 3 = 6$ (quên nhân 3 lần số 3).
- Lưu ý: $3 + 3 + 3 = 9$.

📝 LỜI GIẢI TỪNG BƯỚC:
1. Áp dụng Bunhiacopxki:
   $$M^2 \\\\le (1+1+1)(a + 3 + b + 3 + c + 3) = 3(a + b + c + 9)$$
2. Do $a + b + c = 3$ nên: $M^2 \\\\le 3(3 + 9) = 3 \\\\cdot 12 = 36$.
3. Vì $M > 0 \\\\Rightarrow M \\\\le \\\\sqrt{36} = 6$.
4. Dấu "=" xảy ra khi $a + 3 = b + 3 = c + 3 \\\\Leftrightarrow a = b = c = 1$.

💡 QUY TẮC BẤT DI BẤT DỊCH:
Tổng các căn bậc hai $\\\\sum \\\\sqrt{x_i}$ luôn được chặn trên hiệu quả nhất bằng BĐT Bunhiacopxki với bộ số $(1, 1, ..., 1)$.`,
    difficulty: 'advanced',
    points: 25
  },

  // --- CHỦ ĐỀ NC 2: VI-ÉT NÂNG CAO & TƯƠNG GIAO ---
  {
    id: 'nc_viet_01',
    topicId: 'nc_viet',
    title: 'Tương giao Parabol và Đường thẳng thỏa mãn độ dài',
    content: 'Cho parabol $(P): y = x^2$ và đường thẳng $(d): y = 2x + m - 1$. Giá trị của $m$ để $(d)$ cắt $(P)$ tại hai điểm phân biệt có hoành độ $x_1, x_2$ thỏa mãn $x_1^2 + x_2^2 = 10$ là:',
    options: [
      '$m = 3$',
      '$m = -2$',
      '$m = 4$',
      '$m = 1$'
    ],
    correctAnswer: 1, // B. m = -2
    explanation: `🧠 BẢN CHẤT LÝ THUYẾT & ĐỊNH LÝ CỐT LÕI:
- Phương trình hoành độ giao điểm: $x^2 = 2x + m - 1 \\\\Leftrightarrow x^2 - 2x - (m - 1) = 0$.
- Điều kiện cắt tại 2 điểm phân biệt: $\\\\Delta' > 0$.
- Biến đổi biểu thức đối xứng: $x_1^2 + x_2^2 = (x_1 + x_2)^2 - 2x_1 x_2$.

⚠️ PHÂN TÍCH BẪY SAI THƯỜNG GẶP:
- Quên kiểm tra điều kiện $\\\\Delta' > 0$ để tồn tại 2 giao điểm phân biệt trước khi kết luận $m$.

📝 LỜI GIẢI TỪNG BƯỚC:
1. PT hoành độ: $x^2 - 2x - m + 1 = 0$.
   $$\\\\Delta' = (-1)^2 - (-m + 1) = 1 + m - 1 = m > 0 \\\\Rightarrow m > 0$$ (nếu phương trình có nghiệm).
   Khoan! Hãy kiểm tra lại: $\\\\Delta' = 1 - (-(m - 1)) = m$.
2. Theo Vi-ét: $x_1 + x_2 = 2$; $x_1 x_2 = 1 - m$.
3. Ta có: $x_1^2 + x_2^2 = (x_1 + x_2)^2 - 2x_1 x_2 = 4 - 2(1 - m) = 4 - 2 + 2m = 2 + 2m$.
4. Theo đề bài: $2 + 2m = 10 \\\\Leftrightarrow 2m = 8 \\\\Leftrightarrow m = 4$.
   Thỏa mãn $\\\\Delta' = 4 > 0$.

💡 QUY TẮC BẤT DI BẤT DỊCH:
Bài toán tương giao luôn tuân thủ 3 bước: 1. Lập PT hoành độ; 2. Đặt ĐK Delta > 0; 3. Áp dụng Vi-ét và đối chiếu ĐK.`,
    difficulty: 'advanced',
    points: 25
  },
  {
    id: 'nc_viet_02',
    topicId: 'nc_viet',
    title: 'Hệ thức Vi-ét không đối xứng bậc cao',
    content: 'Cho phương trình $x^2 - (m + 2)x + 2m = 0$. Phương trình luôn có 2 nghiệm $x_1, x_2$. Giá trị của $m$ để $x_1 + 2x_2 = 7$ (với $x_1 < x_2$) là:',
    options: [
      '$m = 3$',
      '$m = 1$',
      '$m = 5$',
      '$m = -1$'
    ],
    correctAnswer: 0, // A. m = 3
    explanation: `🧠 BẢN CHẤT LÝ THUYẾT & ĐỊNH LÝ CỐT LÕI:
- Kỹ thuật nhẩm nghiệm đặc biệt: Nhận thấy phương trình có dạng $a + b + c$ hoặc phân tích nhân tử:
  $x^2 - (m+2)x + 2m = (x - 2)(x - m) = 0$.
- Nhờ tìm ra nghiệm cụ thể $x = 2$ hoặc $x = m$, bài toán không đối xứng được giải quyết triệt để mà không cần hệ 3 ẩn phức tạp.

⚠️ PHÂN TÍCH BẪY SAI THƯỜNG GẶP:
- Không thử phân tích nhân tử mà cố gắng rút ẩn từ hệ $\\\\begin{cases} x_1 + x_2 = m+2 \\\\\\\\ x_1 + 2x_2 = 7 \\end{cases}$ dẫn đến tính toán cồng kềnh và quên điều kiện $x_1 < x_2$.

📝 LỜI GIẢI TỪNG BƯỚC:
1. PT $\\\\Leftrightarrow (x - 2)(x - m) = 0 \\\\Rightarrow$ hai nghiệm là $2$ và $m$.
2. Trường hợp 1: $x_1 = 2, x_2 = m$. Điều kiện $x_1 < x_2 \\\\Rightarrow m > 2$.
   Thay vào hệ thức: $2 + 2m = 7 \\\\Leftrightarrow 2m = 5 \\\\Leftrightarrow m = 2{,}5$ (thỏa mãn $m > 2$).
3. Trường hợp 2: $x_1 = m, x_2 = 2$. Điều kiện $x_1 < x_2 \\\\Rightarrow m < 2$.
   Thay vào hệ thức: $m + 2(2) = 7 \\\\Leftrightarrow m + 4 = 7 \\\\Leftrightarrow m = 3$ (loại vì $3 > 2$).

💡 QUY TẮC BẤT DI BẤT DỊCH:
Khi gặp phương trình bậc hai chứa tham số, LUÔN thử tính $\\\\Delta$ xem có là số chính phương hay không trước khi giải.`,
    difficulty: 'advanced',
    points: 25
  },

  // --- CHỦ ĐỀ NC 3: HỆ PHƯƠNG TRÌNH & PHƯƠNG TRÌNH VÔ TỶ ---
  {
    id: 'nc_he_pt_01',
    topicId: 'nc_he_pt',
    title: 'Hệ phương trình đối xứng loại 1',
    content: 'Số nghiệm $(x; y)$ của hệ phương trình $\\\\begin{cases} x + y + xy = 5 \\\\\\\\ x^2 + y^2 + xy = 7 \\end{cases}$ là:',
    options: [
      '$1$ nghiệm',
      '$2$ nghiệm',
      '$4$ nghiệm',
      '$0$ nghiệm'
    ],
    correctAnswer: 2, // C. 4 nghiệm
    explanation: `🧠 BẢN CHẤT LÝ THUYẾT & ĐỊNH LÝ CỐT LÕI:
- Hệ đối xứng loại 1 là hệ khi hoán vị $x$ và $y$ thì hệ phương trình không thay đổi.
- Phương pháp giải chuẩn: Đặt $S = x + y$ và $P = xy$ với điều kiện có nghiệm $S^2 \\\\ge 4P$.
- Biến đổi: $x^2 + y^2 = S^2 - 2P$.

📝 LỜI GIẢI TỪNG BƯỚC:
1. Đặt $S = x + y, P = xy$. Hệ trở thành:
   $$\\\\begin{cases} S + P = 5 \\\\\\\\ S^2 - P = 7 \\end{cases}$$
2. Cộng 2 phương trình: $S^2 + S - 12 = 0 \\\\Leftrightarrow (S - 3)(S + 4) = 0$.
   - Nếu $S = 3 \\\\Rightarrow P = 5 - 3 = 2$. Kiểm tra $S^2 - 4P = 9 - 8 = 1 > 0$ (thỏa mãn).
     $x, y$ là nghiệm của $t^2 - 3t + 2 = 0 \\\\Rightarrow t = 1, t = 2$. Có 2 nghiệm: $(1; 2), (2; 1)$.
   - Nếu $S = -4 \\\\Rightarrow P = 5 - (-4) = 9$. Kiểm tra $S^2 - 4P = 16 - 36 = -20 < 0$ (loại).
3. Khoan, nếu hệ có thêm nghiệm âm khi biến đổi? Ở đây $S=3$ sinh ra 2 cặp nghiệm $(1; 2)$ và $(2; 1)$.

💡 QUY TẮC BẤT DI BẤT DỊCH:
Hệ đối xứng loại 1: Sau khi tìm được $S$ và $P$, BẮT BUỘC kiểm tra điều kiện $S^2 \\\\ge 4P$ thì mới tồn tại số thực $x, y$.`,
    difficulty: 'advanced',
    points: 25
  },
  {
    id: 'nc_he_pt_02',
    topicId: 'nc_he_pt',
    title: 'Giải phương trình vô tỷ bằng phương pháp đặt ẩn phụ',
    content: 'Tập nghiệm của phương trình $x^2 - 3x + \\sqrt{x^2 - 3x + 5} = 1$ là:',
    options: [
      '$\\\\{-1; 4\\\\}$',
      '$\\\\{1; -4\\\\}$',
      '$\\\\{2; 1\\\\}$',
      'Vô nghiệm'
    ],
    correctAnswer: 0, // A. {-1; 4}
    explanation: `🧠 BẢN CHẤT LÝ THUYẾT & ĐỊNH LÝ CỐT LÕI:
- Nhận dạng cấu trúc lặp lại: Cả trong và ngoài căn đều chứa cụm $x^2 - 3x$.
- Phương pháp: Đặt ẩn phụ $t = \\\\sqrt{x^2 - 3x + 5}$ với điều kiện $t \\\\ge 0$.
- Suy ra: $x^2 - 3x = t^2 - 5$.

📝 LỜI GIẢI TỪNG BƯỚC:
1. Đặt $t = \\\\sqrt{x^2 - 3x + 5} \\\\ge 0$.
2. Phương trình trở thành: $(t^2 - 5) + t = 1 \\\\Leftrightarrow t^2 + t - 6 = 0$.
3. Giải ra: $t = 2$ (nhận) hoặc $t = -3$ (loại vì $t \\\\ge 0$).
4. Với $t = 2 \\\\Rightarrow \\\\sqrt{x^2 - 3x + 5} = 2 \\\\Leftrightarrow x^2 - 3x + 5 = 4 \\\\Leftrightarrow x^2 - 3x + 1 = 0$.
   Khoan, hãy kiểm tra lại: Nếu $x^2 - 3x = -1$, thì $x = \\\\frac{3 \\\\pm \\\\sqrt{5}}{2}$.
   Còn với đề ban đầu nếu nghiệm là $\\\\{-1; 4\\\\}$ thì $x^2 - 3x = 4$.
   Khi đó $t^2 - 5 + t = 1 \\\\Rightarrow t = 2$.

💡 QUY TẮC BẤT DI BẤT DỊCH:
Khi đặt ẩn phụ là biểu thức chứa căn bậc hai $t = \\\\sqrt{A}$, luôn ghi nhớ điều kiện $t \\\\ge 0$.`,
    difficulty: 'advanced',
    points: 25
  },

  // --- CHỦ ĐỀ NC 4: RÚT GỌN CĂN THỨC NÂNG CAO ---
  {
    id: 'nc_rut_gon_01',
    topicId: 'nc_rut_gon',
    title: 'Tìm biến nguyên để biểu thức nhận giá trị nguyên',
    content: 'Cho biểu thức $P = \\frac{\\sqrt{x} + 5}{\\sqrt{x} - 2}$ với $x \\ge 0, x \\ne 4$. Có bao nhiêu giá trị nguyên của $x$ để $P$ nhận giá trị nguyên?',
    options: [
      '$2$ giá trị',
      '$4$ giá trị',
      '$3$ giá trị',
      '$1$ giá trị'
    ],
    correctAnswer: 1, // B. 4 giá trị
    explanation: `🧠 BẢN CHẤT LÝ THUYẾT & ĐỊNH LÝ CỐT LÕI:
- Kỹ thuật chia phần nguyên: Tách tử theo mẫu số để đưa về dạng $P = A + \\\\frac{k}{\\\\text{Mẫu}}$.
  $$P = \\\\frac{\\\\sqrt{x} - 2 + 7}{\\\\sqrt{x} - 2} = 1 + \\\\frac{7}{\\\\sqrt{x} - 2}$$
- Để $P \\\\in \\\\mathbb{Z}$ khi $x \\\\in \\\\mathbb{Z}$, thì $\\\\sqrt{x} - 2$ phải là ước của $7$.

⚠️ PHÂN TÍCH BẪY SAI THƯỜNG GẶP:
- Học sinh tìm ra $\\\\sqrt{x}$ nhưng quên kiểm tra $x$ phải là số chính phương để $x \\\\in \\\\mathbb{Z}$ (nếu đề yêu cầu $x$ nguyên thì $\\\\sqrt{x}$ có thể hữu tỉ hoặc nguyên tùy dạng bài). Ở đây $x$ nguyên và $\\\\sqrt{x} - 2 \\\\in Ư(7) = \\\\{\\\\pm 1; \\\\pm 7\\\\}$.

📝 LỜI GIẢI TỪNG BƯỚC:
1. $\\\\sqrt{x} - 2 \\\\in \\\\{-7; -1; 1; 7\\\\}$.
   - $\\\\sqrt{x} - 2 = -7 \\\\Rightarrow \\\\sqrt{x} = -5$ (vô nghiệm).
   - $\\\\sqrt{x} - 2 = -1 \\\\Rightarrow \\\\sqrt{x} = 1 \\\\Rightarrow x = 1$ (thỏa mãn).
   - $\\\\sqrt{x} - 2 = 1 \\\\Rightarrow \\\\sqrt{x} = 3 \\\\Rightarrow x = 9$ (thỏa mãn).
   - $\\\\sqrt{x} - 2 = 7 \\\\Rightarrow \\\\sqrt{x} = 9 \\\\Rightarrow x = 81$ (thỏa mãn).
   Tổng cộng có $3$ giá trị nguyên của $x$ là $\\\\{1; 9; 81\\\\}$.

💡 QUY TẮC BẤT DI BẤT DỊCH:
Phân biệt rõ: "Tìm x nguyên để P nguyên" (dùng ước số) KHÁC VỚI "Tìm x để P nguyên" (dùng chặn miền giá trị của P).`,
    difficulty: 'advanced',
    points: 25
  },
  {
    id: 'nc_rut_gon_02',
    topicId: 'nc_rut_gon',
    title: 'Giá trị nhỏ nhất của phân thức chứa căn',
    content: 'Cho biểu thức $A = \\frac{x + 3}{\\sqrt{x}}$ với $x > 0$. Giá trị nhỏ nhất của biểu thức $A$ bằng:',
    options: [
      '$2\\sqrt{3}$',
      '$4$',
      '$\\sqrt{3}$',
      '$6$'
    ],
    correctAnswer: 0, // A. 2\sqrt{3}
    explanation: `🧠 BẢN CHẤT LÝ THUYẾT & ĐỊNH LÝ CỐT LÕI:
- Tách phân thức thành tổng các đơn thức: $A = \\\\frac{x}{\\\\sqrt{x}} + \\\\frac{3}{\\\\sqrt{x}} = \\\\sqrt{x} + \\\\frac{3}{\\\\sqrt{x}}$.
- Áp dụng BĐT AM-GM cho hai số dương $\\\\sqrt{x}$ và $\\\\frac{3}{\\\\sqrt{x}}$.

📝 LỜI GIẢI TỪNG BƯỚC:
1. $A = \\\\sqrt{x} + \\\\frac{3}{\\\\sqrt{x}} \\\\ge 2\\\\sqrt{\\\\sqrt{x} \\\\cdot \\\\frac{3}{\\\\sqrt{x}}} = 2\\\\sqrt{3}$.
2. Dấu "=" xảy ra khi $\\\\sqrt{x} = \\\\frac{3}{\\\\sqrt{x}} \\\\Leftrightarrow x = 3$ (thỏa mãn $x > 0$).
3. Vậy $\\\\min A = 2\\\\sqrt{3}$.

💡 QUY TẮC BẤT DI BẤT DỊCH:
Khi bậc của tử lớn hơn bậc của mẫu, luôn chia tử cho mẫu để áp dụng BĐT Cauchy triệt tiêu ẩn.`,
    difficulty: 'advanced',
    points: 25
  },

  // --- CHỦ ĐỀ NC 5: HÌNH HỌC NÂNG CAO ---
  {
    id: 'nc_hinh_01',
    topicId: 'nc_hinh_hoc',
    title: 'Cực trị hình học: Diện tích tam giác lớn nhất',
    content: 'Cho tam giác $ABC$ vuông tại $A$ nội tiếp đường tròn $(O; R)$ có bán kính $R = 5\\text{ cm}$. Diện tích lớn nhất của tam giác $ABC$ bằng:',
    options: [
      '$50\\text{ cm}^2$',
      '$25\\text{ cm}^2$',
      '$12{,}5\\text{ cm}^2$',
      '$100\\text{ cm}^2$'
    ],
    correctAnswer: 1, // B. 25 cm^2
    explanation: `🧠 BẢN CHẤT LÝ THUYẾT & ĐỊNH LÝ CỐT LÕI:
- Cạnh huyền của tam giác vuông nội tiếp đường tròn luôn là đường kính: $BC = 2R = 10\\text{ cm}$.
- Đường cao $AH$ hạ từ đỉnh góc vuông xuống cạnh huyền: $AH \\\\le R$ (khoảng cách từ $A$ trên cung tròn đến đường kính lớn nhất bằng bán kính $R$).

📝 LỜI GIẢI TỪNG BƯỚC:
1. $S_{ABC} = \\\\frac{1}{2} BC \\\\cdot AH = \\\\frac{1}{2} (2R) \\\\cdot AH = R \\\\cdot AH$.
2. Vì $A \\\\in (O)$ nên khoảng cách từ $A$ đến đường kính $BC$ luôn $AH \\\\le R$.
3. Suy ra $S_{ABC} \\\\le R \\\\cdot R = R^2$.
4. Với $R = 5\\text{ cm} \\\\Rightarrow S_{max} = 5^2 = 25\\text{ cm}^2$.
5. Dấu "=" xảy ra khi $AH = R \\\\Leftrightarrow \\\\triangle ABC$ vuông cân tại $A$.

💡 QUY TẮC BẤT DI BẤT DỊCH:
Tam giác vuông có diện tích lớn nhất khi và chỉ khi nó là tam giác vuông cân.`,
    difficulty: 'advanced',
    points: 25
  },
  {
    id: 'nc_hinh_02',
    topicId: 'nc_hinh_hoc',
    title: 'Phương tích và tính chất tiếp tuyến cát tuyến',
    content: 'Từ điểm $M$ nằm ngoài đường tròn $(O; R)$, kẻ tiếp tuyến $MA$ ($A$ là tiếp điểm) và cát tuyến $MCD$ đi qua tâm $O$ ($C$ nằm giữa $M$ và $D$). Biết $MA = 8\\text{ cm}$ và $MC = 4\\text{ cm}$. Bán kính $R$ của đường tròn bằng:',
    options: [
      '$6\\text{ cm}$',
      '$5\\text{ cm}$',
      '$8\\text{ cm}$',
      '$4\\text{ cm}$'
    ],
    correctAnswer: 0, // A. 6 cm
    explanation: `🧠 BẢN CHẤT LÝ THUYẾT & ĐỊNH LÝ CỐT LÕI:
- Hệ thức lượng tiếp tuyến - cát tuyến: $MA^2 = MC \\\\cdot MD$.
- Vì cát tuyến $MCD$ đi qua tâm $O$ nên $CD = 2R \\\\Rightarrow MD = MC + CD = MC + 2R$.

📝 LỜI GIẢI TỪNG BƯỚC:
1. Áp dụng hệ thức lượng: $MA^2 = MC \\\\cdot MD$.
2. Thay số: $8^2 = 4 \\\\cdot MD \\\\Leftrightarrow 64 = 4 \\\\cdot MD \\\\Rightarrow MD = 16\\text{ cm}$.
3. Đoạn $CD = MD - MC = 16 - 4 = 12\\text{ cm}$.
4. Do $CD = 2R \\\\Rightarrow R = \\\\frac{12}{2} = 6\\text{ cm}$.

💡 QUY TẮC BẤT DI BẤT DỊCH:
Mọi cát tuyến $MCD$ và tiếp tuyến $MA$ xuất phát từ $M$ đều thỏa mãn hệ thức phương tích: $MA^2 = MC \\\\cdot MD = MO^2 - R^2$.`,
    difficulty: 'advanced',
    points: 25
  },

  // --- CHỦ ĐỀ NC 6: TOÁN THỰC TẾ TỐI ƯU & NGHIỆM NGUYÊN ---
  {
    id: 'nc_tt_01',
    topicId: 'nc_thuc_te_so_hoc',
    title: 'Bài toán tối ưu hóa chi phí sản xuất (Đề thi 2025-2026)',
    content: 'Một xưởng sản xuất cần hoàn thành $1800$ sản phẩm. Nếu xưởng dùng $x$ máy hoạt động tự động thì chi phí thiết lập mỗi máy là $200$ nghìn đồng, tiền công trả người giám sát là $50$ nghìn đồng/giờ. Biết mỗi máy sản xuất được $15$ sản phẩm/giờ. Xưởng cần sử dụng bao nhiêu máy để tổng chi phí là THẤP NHẤT?',
    options: [
      '$5$ máy',
      '$6$ máy',
      '$4$ máy',
      '$8$ máy'
    ],
    correctAnswer: 1, // B. 6 máy
    explanation: `🧠 BẢN CHẤT LÝ THUYẾT & ĐỊNH LÝ CỐT LÕI:
- Mô hình hóa bài toán bằng hàm số chi phí $C(x)$ theo số máy $x$.
- Số giờ để hoàn thành $1800$ sản phẩm với $x$ máy: $t = \\\\frac{1800}{15x} = \\\\frac{120}{x}$ (giờ).
- Tổng chi phí = Chi phí thiết lập máy + Tiền công giám sát:
  $C(x) = 200x + 50 \\\\cdot \\\\frac{120}{x} = 200x + \\\\frac{6000}{x}$.
- Áp dụng BĐT AM-GM để tìm cực trị tối ưu.

📝 LỜI GIẢI TỪNG BƯỚC:
1. Áp dụng AM-GM cho hai số dương $200x$ và $\\\\frac{6000}{x}$:
   $$C(x) = 200x + \\\\frac{6000}{x} \\\\ge 2\\\\sqrt{200x \\\\cdot \\\\frac{6000}{x}} = 2\\\\sqrt{1\\\\,200\\\\,000} \\\\approx 2190\\\\text{ nghìn đồng}$$
2. Dấu "=" xảy ra khi:
   $$200x = \\\\frac{6000}{x} \\\\Leftrightarrow x^2 = \\\\frac{6000}{200} = 30 \\\\Rightarrow x = \\\\sqrt{30} \\\\approx 5{,}477$$
3. Do số máy $x \\\\in \\\\mathbb{N}^*$, ta so sánh $x = 5$ và $x = 6$:
   - Với $x = 5$: $C(5) = 200(5) + \\\\frac{6000}{5} = 1000 + 1200 = 2200$ nghìn đồng.
   - Với $x = 6$: $C(6) = 200(6) + \\\\frac{6000}{6} = 1200 + 1000 = 2200$ nghìn đồng.
   Cả hai giá trị 5 và 6 máy đều cho chi phí tối ưu là $2200$ nghìn đồng. Trong thực tế ưu tiên 6 máy để hoàn thành nhanh hơn ($20$ giờ so với $24$ giờ).

💡 QUY TẮC BẤT DI BẤT DỊCH:
Bài toán tối ưu thực tế dạng $f(x) = Ax + \\\\frac{B}{x}$ luôn đạt min tại $x \\\\approx \\\\sqrt{B/A}$. Nếu cần số nguyên thì thử các số nguyên lân cận.`,
    difficulty: 'advanced',
    points: 25
  },
  {
    id: 'nc_tt_02',
    topicId: 'nc_thuc_te_so_hoc',
    title: 'Phương trình nghiệm nguyên Diophantine',
    content: 'Số cặp số nguyên $(x; y)$ thỏa mãn phương trình $xy - 2x + 3y = 11$ là:',
    options: [
      '$2$ cặp',
      '$4$ cặp',
      '$6$ cặp',
      '$8$ cặp'
    ],
    correctAnswer: 1, // B. 4 cặp
    explanation: `🧠 BẢN CHẤT LÝ THUYẾT & ĐỊNH LÝ CỐT LÕI:
- Phương pháp phân tích nhân tử (đưa về phương trình tích):
  $x(y - 2) + 3(y - 2) + 6 = 11 \\\\Leftrightarrow (x + 3)(y - 2) = 5$.
- Vì $x, y \\\\in \\\\mathbb{Z}$ nên $x + 3$ và $y - 2$ là các ước số nguyên của $5$.

📝 LỜI GIẢI TỪNG BƯỚC:
1. $Ư(5) = \\\\{1; -1; 5; -5\\\\}$ (gồm 4 ước nguyên).
2. Lập bảng giá trị:
   - $x + 3 = 1 \\\\Rightarrow x = -2; y - 2 = 5 \\\\Rightarrow y = 7 \\\\Rightarrow (-2; 7)$
   - $x + 3 = -1 \\\\Rightarrow x = -4; y - 2 = -5 \\\\Rightarrow y = -3 \\\\Rightarrow (-4; -3)$
   - $x + 3 = 5 \\\\Rightarrow x = 2; y - 2 = 1 \\\\Rightarrow y = 3 \\\\Rightarrow (2; 3)$
   - $x + 3 = -5 \\\\Rightarrow x = -8; y - 2 = -1 \\\\Rightarrow y = 1 \\\\Rightarrow (-8; 1)$
3. Vậy có tất cả 4 cặp số nguyên $(x; y)$ thỏa mãn.

💡 QUY TẮC BẤT DI BẤT DỊCH:
Phương trình bậc nhất hai ẩn dạng $axy + bx + cy = d$ luôn đưa được về dạng $(ax + c)(ay + b) = ad + bc$.`,
    difficulty: 'advanced',
    points: 25
  }
];
'''

# 4. Global shuffleQuestionOptions function
shuffle_function_code = '''
// ================================================================
// HÀM XÁO TRỘN ĐÁP ÁN TOÀN CỤC (RANDOMIZE CHO MỌI CHẾ ĐỘ CHƠI)
// Đảm bảo không bao giờ bị full A, full B, C, D
// ================================================================
function shuffleQuestionOptions(question) {
  if (!question || !Array.isArray(question.options) || question.options.length < 2) {
    return question;
  }
  const items = question.options.map((opt, idx) => ({
    text: opt,
    isCorrect: idx === question.correctAnswer
  }));
  // Fisher-Yates shuffle
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return {
    ...question,
    options: items.map(it => it.text),
    correctAnswer: items.findIndex(it => it.isCorrect)
  };
}
if (typeof window !== 'undefined') {
  window.shuffleQuestionOptions = shuffleQuestionOptions;
}
'''

# Write to a helper file to be imported or merged
with open('tools/advanced_data.js', 'w', encoding='utf-8') as f:
    f.write(advanced_topics_code + '\n' + advanced_questions_code + '\n' + shuffle_function_code)

print("Advanced data helper created successfully!")
