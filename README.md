# 🎓 ĐẤU TRƯỜNG TOÁN 9 (MATH ARENA 9)

> **Hệ thống ôn luyện Toán 9 toàn diện chuẩn GDPT 2018** tích hợp Gamification, Gia sư AI Google Gemini và Cơ sở dữ liệu Dual-Engine (SQLite / MS SQL Server).

---

## 🌟 Tổng Quan Dự Án

**Đấu Trường Toán 9** là nền tảng ứng dụng web giáo dục được thiết kế chuyên biệt cho học sinh lớp 9 ôn thi vào lớp 10 THPT và giáo viên bộ môn Toán theo **Chương trình Giáo dục Phổ thông 2018** (bám sát bộ sách *Kết nối tri thức với cuộc sống*, *Cánh Diều*, *Chân trời sáng tạo*).

Dự án kết hợp phương pháp học tập qua trò chơi (**Gamification**) và ứng dụng trí tuệ nhân tạo (**AI Tutor**) để biến những tiết học ôn tập thành trải nghiệm tương tác sinh động, tạo động lực thi đua tự giác cho học sinh.

---

## ✨ Tính Năng Nổi Bật

### 1. 🗺️ Ngân Hàng 10 Chuyên Đề Chuẩn GDPT 2018
- Bao phủ 100% kiến thức trọng tâm ôn thi lớp 10:
  1. *Căn thức & Rút gọn biểu thức*
  2. *Hệ phương trình bậc nhất hai ẩn*
  3. *Bất đẳng thức & Cực trị AM-GM*
  4. *Hệ thức lượng trong tam giác vuông & Lượng giác*
  5. *Đường tròn & Tiếp tuyến*
  6. *Parabol & Phương trình bậc hai*
  7. *Định lý Vi-ét & Bài toán đối xứng*
  8. *Góc với đường tròn & Tứ giác nội tiếp*
  9. *Hình trụ, Hình nón, Hình cầu thực tế*
  10. *Thống kê & Xác suất 9*
- Tích hợp công thức Toán học chuẩn $\LaTeX$ qua KaTeX sắc nét, kèm lời giải từng bước chi tiết.

### 2. 🎮 Chế Độ Học Tập Gamification Đa Dạng
- **⚡ 60s Tốc Độ**: Thử thách tính nhẩm phản xạ cao, hiệu ứng Fever Combo kích thích tư duy.
- **🏰 Leo Tháp Tri Thức**: 10 tầng tháp thử thách với Boss canh gác mỗi tầng, tăng dần độ khó.
- **⚔️ Song Đấu 1v1**: Đối kháng trực tiếp giữa 2 bạn học sinh trên cùng một bàn phím (Phím `A-S-D-F` vs `J-K-L-;`).
- **📝 Bài Tập Điền Số / Trả Lời Ngắn**: Định dạng câu hỏi theo đúng quy chế thi mới nhất của Bộ GD&ĐT.

### 3. 📜 Luyện Đề Thi Học Kỳ & Tuyển Sinh Lớp 10
- Tích hợp đề kiểm tra chính thức (Mã đề 101, 102 THCS Nghĩa An) có barem điểm và đáp án tự luận chi tiết.
- Tự động xáo trộn phương án ngẫu nhiên bằng thuật toán Fisher-Yates, chống học vẹt.

### 4. 🤖 Trợ Lý AI "Mèo Toán Thông Thái"
- Tích hợp trực tiếp Google Gemini API.
- Hỗ trợ học sinh phân tích đề bài, gợi ý hướng giải quyết mà không giải hộ, giải thích căn kẽ lý thuyết.
- Bảo mật API key an toàn ở phía Backend, không lộ ra mã nguồn Client.

### 5. 👨‍🏫 Công Cụ Dành Cho Giáo Viên
- **Quản lý câu hỏi**: Thêm mới, chỉnh sửa, gắn thẻ chuyên đề và xuất dữ liệu JSON dự phòng.
- **In đề chuẩn A4**: Tối ưu layout in ấn (Ctrl + P) ẩn giao diện game, tạo phiếu bài tập chuẩn quy cách thi cử.

### 6. 🗄️ CSDL Dual-Engine Linh Hoạt & Đóng Gói Docker
- **SQLite (Mặc định)**: Không phụ thuộc driver hệ thống, chạy ngay lập tức trên mọi hệ điều hành (Windows, Linux, macOS).
- **Microsoft SQL Server (Tùy chọn)**: Hỗ trợ kết nối chuyên nghiệp qua ODBC Driver cho môi trường doanh nghiệp/trường học.
- Hỗ trợ đầy đủ **Docker** và **Docker Compose**, sẵn sàng deploy Render, Fly.io hoặc máy chủ VPS.

---

## 📁 Cấu Trúc Thư Mục (Project Structure)

```plaintext
TOÁN 9/
├── docs/                       # 📚 Tài liệu kỹ thuật & Hướng dẫn chi tiết
│   ├── Huong_Dan_Giao_Vien.md       # Hướng dẫn sư phạm & kịch bản giảng dạy trên lớp
│   ├── HUONG_DAN_CHATBOT.md         # Hướng dẫn cấu hình Google Gemini API Key
│   ├── HUONG_DAN_CSDL.md            # Thiết kế CSDL Dual-Engine (SQLite & SQL Server)
│   └── HUONG_DAN_PUBLIC_INTERNET.md # Hướng dẫn public qua Cloudflare & Cloud Hosting
├── data/                       # 📂 Ngân hàng tài liệu, đề thi gốc & sách bài tập
│   ├── BT Nang Cao/                 # Sách bài tập Toán 9 nâng cao (KNTT Tập 1 & 2)
│   ├── chuyen-de-co-ban-.../        # 12 chuyên đề ôn thi lớp 10, đề thi mẫu & đáp án
│   ├── cong-thuc-toan-lop-9-...pdf  # Sổ tay tóm tắt toàn bộ công thức Toán 9
│   ├── Đáp án.docx                  # Barem đáp án & biểu điểm chi tiết
│   └── Đề học kỳ 1 Toán 9...pdf     # Đề thi khảo sát học kỳ I
├── css/                        # 🎨 Giao diện & Stylesheets
│   └── style.css                    # CSS tuỳ biến giao diện & chế độ in ấn (Print A4)
├── js/                         # ⚡ Logic ứng dụng phía Client
│   ├── app.js                       # Logic điều phối giao diện chính & router
│   ├── game.js                      # Cơ chế game (Leo tháp, 60s tốc độ, 1v1 đối kháng)
│   ├── chatbot.js                   # Xử lý trò chuyện với AI Mèo Toán
│   ├── data.js                      # Ngân hàng câu hỏi trắc nghiệm chuẩn
│   ├── advanced_data.js             # Ngân hàng bài tập nâng cao dạng điền đáp án
│   ├── storage.js                   # Quản lý LocalStorage & đồng bộ với Backend
│   └── audio.js                     # Hiệu ứng âm thanh 8-bit sống động
├── tools/                      # 🛠️ Bộ công cụ bổ trợ phát triển & kiểm thử
│   ├── build_advanced_data.py       # Script trích xuất và chuẩn hóa ngân hàng câu hỏi
│   ├── extract_docx.py              # Parser tài liệu Word (.docx) sang dữ liệu JSON
│   └── test_feature_logic.py        # Bộ unit test logic chấm điểm & thuật toán xáo trộn
├── index.html                  # 🌐 Trang ứng dụng chính (Single Page Application)
├── server.py                   # 🐍 HTTP Backend Server (REST API, Auth, Chatbot proxy)
├── database.py                 # 🗄️ Database Access Layer (Dual-engine SQLite / MSSQL)
├── database_toan9_sqlserver.sql# 📜 Script khởi tạo bảng & dữ liệu mẫu cho SQL Server
├── Chay_Trang_Web.bat          # 🚀 Shortcut khởi động website cục bộ 1-click
├── Phat_Web_Ra_Internet.bat    # 🌐 Shortcut phát web ra Internet bằng Cloudflare Tunnel
├── tunnel_launcher.py          # 🚇 Trình khởi chạy & quản lý Cloudflare Tunnel an toàn
├── Dockerfile                  # 🐳 Containerfile đóng gói ứng dụng
├── docker-compose.yml          # 🐳 Cấu hình triển khai multi-container Docker
├── Procfile                    # ☁️ Cấu hình deploy đám mây (Render, Heroku)
├── requirements.txt            # 📦 Danh sách thư viện Python phụ thuộc
├── .env.example                # 🔑 File mẫu cấu hình biến môi trường
├── .dockerignore               # 🚫 Danh sách loại trừ khi đóng gói Docker
├── .gitignore                  # 🚫 Danh sách loại trừ mã nguồn Git
└── README.md                   # 📖 Tài liệu hướng dẫn tổng quan dự án
```

---

## 🚀 Hướng Dẫn Khởi Chạy Nhanh

### Cách 1: Khởi động 1-Click trên Windows (Khuyên dùng cho giáo viên)
1. Nhấp đúp chuột vào file **`Chay_Trang_Web.bat`**.
2. Trình duyệt sẽ tự động mở địa chỉ: `http://localhost:8080`.
3. Nếu máy tính kết nối Wi-Fi lớp học, cửa sổ đen sẽ hiển thị thêm IP mạng nội bộ (ví dụ: `http://192.168.1.15:8080`) để học sinh dùng điện thoại/máy tính bảng truy cập cùng lúc.

---

### Cách 2: Chạy thủ công với Python
Yêu cầu: Đã cài đặt **Python 3.10+**.

```bash
# 1. Cài đặt các thư viện cần thiết
pip install -r requirements.txt

# 2. Cấu hình biến môi trường (nếu muốn dùng Chatbot Gemini)
cp .env.example .env
# Mở file .env và điền GEMINI_API_KEY=...

# 3. Khởi chạy máy chủ
python server.py
```
Mở trình duyệt tại: `http://localhost:8080`.

---

### Cách 3: Chạy bằng Docker & Docker Compose
Triển khai nhanh gọn, độc lập với môi trường máy chủ:

```bash
# Build và khởi chạy container chạy ngầm
docker compose up -d --build

# Xem nhật ký logs
docker compose logs -f

# Dừng hệ thống
docker compose down
```
Ứng dụng sẽ hoạt động tại cổng `http://localhost:8080`. Cơ sở dữ liệu SQLite được lưu trữ bền vững tại thư mục `./data`.

---

### Cách 4: Phát Web & Chatbot Ra Internet (Cloudflare Tunnel)
Để học sinh học ở nhà mà không cần cấu hình mạng phức tạp hay mở port modem:
1. Nhấp đúp vào **`Phat_Web_Ra_Internet.bat`**.
2. Hệ thống sẽ tự động tạo một đường link bảo mật HTTPS (ví dụ: `https://toan9-arena.trycloudflare.com`).
3. Đường dẫn được **tự động sao chép vào bộ nhớ tạm**, bạn chỉ cần dán (Ctrl + V) vào nhóm Zalo lớp để học sinh truy cập.

---

## 📚 Tài Liệu Hướng Dẫn Chi Tiết

Mọi tài liệu chi tiết đã được quy hoạch vào thư mục [`docs/`](./docs/):
- 📖 [**Hướng Dẫn Dành Cho Giáo Viên**](./docs/Huong_Dan_Giao_Vien.md): Kịch bản warm-up 5 phút đầu giờ, tổ chức đấu giải 1v1, in đề thi và quản lý câu hỏi.
- 🤖 [**Cấu Hình Chatbot Gemini**](./docs/HUONG_DAN_CHATBOT.md): Các bước lấy API key miễn phí từ Google AI Studio và kết nối.
- 🗄️ [**Kiến Trúc Cơ Sở Dữ Liệu**](./docs/HUONG_DAN_CSDL.md): Thiết kế bảng dữ liệu, cơ chế xác thực băm mật khẩu PBKDF2 và chuyển đổi SQLite/MSSQL.
- 🌐 [**Đưa Website Lên Đám Mây 24/7**](./docs/HUONG_DAN_PUBLIC_INTERNET.md): Hướng dẫn deploy miễn phí vĩnh viễn trên Render.com hoặc Vercel.

---

## 🧪 Kiểm Thử (Unit Tests)

Dự án đi kèm bộ kiểm thử tự động kiểm tra tính đúng đắn của dữ liệu, thuật toán chuẩn hóa chấm điểm và cơ chế chống trùng lặp câu hỏi:

```bash
python tools/test_feature_logic.py
```

---

## 🔒 Bản Quyền & Giấy Phép (License)

Dự án được xây dựng phục vụ cộng đồng giáo dục và học sinh cả nước. Phát hành theo giấy phép **MIT License**.
