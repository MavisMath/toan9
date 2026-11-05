# HƯỚNG DẪN PUBLIC WEBSITE & CHATBOT RA INTERNET (CHO HỌC SINH HỌC Ở NHÀ)

---

## 🌟 TỔNG QUAN

Để học sinh ở nhà (dùng điện thoại, máy tính bảng, mạng 4G hoặc Wi-Fi bất kỳ) có thể truy cập được **cả trang web và Chatbot AI**, Thầy/Cô có 2 lựa chọn phù hợp nhất:

---

## 🚀 CÁCH 1: PHÁT RA INTERNET NGAY LẬP TỨC TỪ MÁY TÍNH (NHANH NHẤT - 1 CHẠM)

> **Phù hợp khi:** Thầy/Cô tổ chức buổi học trực tuyến, giao bài tập buổi tối hoặc muốn học sinh làm bài ngay mà không cần tạo tài khoản trên các nền tảng đám mây.

### Các bước thực hiện:
1. Vào thư mục `TOÁN 9` trên máy tính.
2. Nhấp đúp vào file **`Phat_Web_Ra_Internet.bat`**.
3. Cửa sổ màu đen sẽ tự động kết nối và hiển thị đường link bảo mật HTTPS của Cloudflare:
   ```
   =================================================================
     👉 LINK CHO HỌC SINH:
        https://barrier-civil-brain-pole.trycloudflare.com
   =================================================================
   ```
4. Hệ thống đã **tự động sao chép sẵn đường link** vào bộ nhớ tạm (Clipboard). Thầy/Cô chỉ cần mở Zalo/Facebook nhóm lớp và bấm **Ctrl + V** để gửi cho học sinh!
5. **Lưu ý:** Giữ cửa sổ màu đen luôn mở trong lúc học sinh làm bài. Khi nào không muốn học sinh truy cập nữa, Thầy/Cô chỉ cần đóng cửa sổ đen lại.

---

## ☁️ CÁCH 2: ĐƯA LÊN ĐÁM MÂY CHẠY 24/7 MIỄN PHÍ VĨNH VIỄN (KHÔNG CẦN BẬT MÁY TÍNH)

> **Phù hợp khi:** Thầy/Cô muốn có một đường link cố định (ví dụ: `https://toan9-thcs.onrender.com`), chạy suốt 24/24 cả năm, kể cả khi Thầy/Cô đã tắt máy tính cá nhân.

### Nền tảng khuyên dùng: **Render.com** (Miễn phí 100%, hỗ trợ Python chuẩn)

#### Bước 1: Đưa thư mục lên GitHub cá nhân
1. Đăng nhập vào [GitHub](https://github.com) (tạo tài khoản miễn phí nếu chưa có).
2. Tạo một kho lưu trữ mới (New Repository), đặt tên ví dụ: `toan9-onluyen`, chọn chế độ **Public** hoặc **Private** đều được.
3. Tải các file trong thư mục `TOÁN 9` lên (Lưu ý: Không tải file `.env` lên GitHub để bảo mật API key).

#### Bước 2: Kết nối và chạy trên Render.com
1. Truy cập [https://render.com](https://render.com) và đăng nhập bằng tài khoản GitHub vừa tạo.
2. Nhấn nút **New +** ở góc trên bên phải -> Chọn **Web Service**.
3. Chọn kho lưu trữ `toan9-onluyen` từ GitHub.
4. Điền các thông tin đơn giản:
   - **Name:** Đặt tên web (ví dụ: `toan9-thcs-nghiaan`).
   - **Language:** Chọn `Python 3`.
   - **Build Command:** (để trống hoặc gõ: `pip install -r requirements.txt`).
   - **Start Command:** Nhập: `python server.py`.
   - **Instance Type:** Chọn gói **Free** ($0/tháng).
5. Kéo xuống phần **Environment Variables** (Biến môi trường) -> Nhấn **Add Environment Variable**:
   - **Key:** `GEMINI_API_KEY`
   - **Value:** Dán mã API key Gemini của Thầy/Cô vào đây.
6. Nhấn nút **Create Web Service**.

Chờ khoảng 1-2 phút, Render sẽ cấp cho Thầy/Cô một đường link vĩnh viễn (ví dụ: `https://toan9-thcs-nghiaan.onrender.com`). Thầy/Cô gửi link này cho học sinh là có thể học và dùng chatbot 24/7 trọn đời hoàn toàn miễn phí!
