# HƯỚNG DẪN DÀNH CHO GIÁO VIÊN: ĐẤU TRƯỜNG TOÁN 9
### Hệ Thống Ôn Luyện Hiệu Quả & Vừa Học Vừa Chơi (Chương Trình GDPT 2018)

---

## 🌟 1. GIỚI THIỆU TỔNG QUAN

Website **Đấu Trường Toán 9** được thiết kế chuyên biệt cho giáo viên môn Toán THCS nhằm biến các tiết học ôn tập khô khan thành trải nghiệm tương tác thú vị, kích thích tư duy và tinh thần thi đua lành mạnh của học sinh lớp 9.

### Điểm nổi bật:
- **Chuẩn cấu trúc GDPT 2018**: Bám sát sách giáo khoa mới (*Kết nối tri thức*, *Cánh Diều*, *Chân trời sáng tạo*) và cấu trúc đề thi vào lớp 10 mới nhất.
- **Tích hợp đề thi thật**: Có sẵn đề kiểm tra Học kỳ I chính thức năm học 2025 - 2026 của trường THCS Nghĩa An (Mã đề 101, 102 kèm barem đáp án và lời giải chi tiết).
- **Gamification cuốn hút**: Hệ thống Leo Tháp 10 tầng đánh Boss, Thử thách tốc độ 60 giây (Fever Combo), Đấu trường đối kháng 1v1, thăng cấp (Level 1 -> 50), huy hiệu thành tựu và âm thanh điện tử 8-bit sống động.
- **Chạy cục bộ, không cần Node.js**: Các chế độ ôn tập cơ bản lưu dữ liệu trên máy. Chatbot Gemini cần Internet và API key riêng; xem [hướng dẫn cấu hình chatbot](./HUONG_DAN_CHATBOT.md).

---

## 🚀 2. CÁCH KHỞI ĐỘNG TRANG WEB TRÊN MÁY TÍNH

Thầy/Cô có 2 cách rất đơn giản để mở trang web:

### Cách 1: Nhấp đúp vào file `Chay_Trang_Web.bat` (Khuyên dùng)
- Trong thư mục `TOÁN 9`, nhấp đúp vào file **`Chay_Trang_Web.bat`**.
- Hệ thống sẽ tự động khởi động máy chủ cục bộ và bật trình duyệt lên địa chỉ `http://localhost:8080`.
- **Đặc biệt khi có Wi-Fi lớp học**: Cửa sổ đen sẽ hiện địa chỉ IP mạng nội bộ (ví dụ: `http://192.168.1.15:8080`). Học sinh có thể dùng điện thoại hoặc máy tính bảng kết nối vào cùng mạng Wi-Fi và truy cập địa chỉ này để cùng làm bài!

### Cách 2: Mở trực tiếp file `index.html`
- Nhấp đúp chuột vào file **`index.html`** để mở bằng Google Chrome, Microsoft Edge hoặc Cốc Cốc.
- Cách này dùng được các nội dung tĩnh và chế độ học cơ bản; chatbot AI cần mở website qua `Chay_Trang_Web.bat` và có Internet.

---

## 🎯 3. GỢI Ý KỊCH BẢN SỬ DỤNG TRONG TIẾT HỌC

### ⏱️ Kịch bản 1: Khởi động 5 phút đầu giờ (Warm-up)
- Chiếu màn hình máy tính lên máy chiếu hoặc màn hình TV của lớp.
- Chọn tab **⚡ 60s Tốc Độ** hoặc **🏰 Leo Tháp Tri Thức**.
- Mời 1 - 2 học sinh đại diện hoặc cả lớp cùng tính nhẩm nhanh để giải cứu nhân vật / hạ gục Boss tầng tháp.
- *Tác dụng*: Kích hoạt trạng thái tập trung và không khí hào hứng ngay từ những phút đầu tiên của tiết học.

### ⚔️ Kịch bản 2: Hoạt động Cặp đôi / Trò chơi đối kháng (1v1 PvP)
- Chọn tab **⚔️ Song Đấu 1v1**.
- Mời 2 bạn học sinh đại diện của 2 tổ/nhóm lên trước máy tính giáo viên:
  - **Bạn 1 (Đội Đỏ)**: Sử dụng các phím `A`, `S`, `D`, `F` tương ứng với các đáp án A, B, C, D.
  - **Bạn 2 (Đội Xanh)**: Sử dụng các phím `J`, `K`, `L`, `;` tương ứng với các đáp án A, B, C, D.
- Bên nào bấm trúng đáp án nhanh hơn sẽ ghi điểm. Đội nào đạt 5 điểm trước sẽ giành chiến thắng!

### 🗺️ Kịch bản 3: Ôn luyện củng cố theo chuyên đề (10 Chuyên đề GDPT 2018)
- Chọn tab **🗺️ Chuyên Đề GDPT**:
  1. *Căn thức & Rút gọn biểu thức*
  2. *Hệ hai phương trình bậc nhất hai ẩn*
  3. *Bất đẳng thức & Bất phương trình (AM-GM)*
  4. *Hệ thức lượng trong tam giác vuông & Lượng giác*
  5. *Đường tròn & Tiếp tuyến*
  6. *Hàm số $y = ax^2$ & Phương trình bậc hai*
  7. *Định lý Vi-ét và các bài toán đối xứng*
  8. *Góc với đường tròn & Tứ giác nội tiếp*
  9. *Hình trụ - Hình nón - Hình cầu*
  10. *Xác suất & Thống kê 9*
- Sau mỗi câu trả lời, hệ thống đều hiển thị **lời giải từng bước chi tiết** với công thức toán $\LaTeX$ sắc nét giúp học sinh nắm vững phương pháp giải.

### 📜 Kịch bản 4: Thi thử và đánh giá định kỳ
- Chọn tab **📜 Luyện Đề Học Kỳ**.
- Cho học sinh làm đề kiểm tra chuẩn 90 phút (Mã đề 101 trường THCS Nghĩa An).
- Sau khi bấm "Nộp Bài", hệ thống tự động chấm điểm phần trắc nghiệm và hiển thị đáp án, lời giải mẫu và thang điểm barem chi tiết cho các bài toán tự luận (bao gồm bài toán thực tế quyên góp sách và bài toán tối ưu chi phí sử dụng BĐT AM-GM).

### 🖨️ Kịch bản 5: In đề thi ra giấy A4 cho học sinh làm bài trên lớp
- Vào mục **👨‍🏫 Góc Thầy Cô** -> Chọn nút **🖨️ In Đề Thi Ra Giấy (A4)** (hoặc nhấn phím tắt `Ctrl + P`).
- Trang web đã được tối ưu sẵn định dạng in ấn: ẩn toàn bộ thanh menu và giao diện game, chỉ hiển thị đề thi rõ nét, chữ đen nền trắng chuẩn quy cách in ấn học đường.

---

## 🛠️ 4. QUẢN LÝ & TỰ SOẠN CÂU HỎI MỚI

Thầy/Cô có thể dễ dàng bổ sung thêm câu hỏi riêng của mình:
1. Vào tab **👨‍🏫 Góc Thầy Cô** (ở góc phải thanh menu).
2. Nhấn nút **➕ Thêm Câu Hỏi Mới**.
3. Điền thông tin câu hỏi:
   - Chọn chuyên đề.
   - Tiêu đề câu hỏi.
   - Nội dung câu hỏi (hỗ trợ gõ công thức toán dạng `$x^2$` hoặc `$\sqrt{x}$`).
   - 4 phương án A, B, C, D và chọn đáp án chính xác.
   - Nhập lời giải chi tiết.
4. Bấm **Lưu Câu Hỏi**. Câu hỏi mới sẽ tự động hòa vào ngân hàng đề thi của hệ thống!
5. Bấm **💾 Sao Lưu Đề (JSON)** để tải file dữ liệu câu hỏi về máy, lưu trữ hoặc chuyển sang máy tính khác dễ dàng.

---

## 🌐 5. CÁCH ĐƯA LÊN MẠNG ĐỂ HỌC SINH TỰ ÔN TẬP Ở NHÀ (MIỄN PHÍ)

Nếu muốn học sinh ở nhà có thể mở điện thoại hoặc máy tính để tự luyện tập mọi lúc mọi nơi, Thầy/Cô có thể đưa toàn bộ thư mục này lên dịch vụ hosting miễn phí:

### Cách đưa lên GitHub Pages hoặc Vercel (Miễn phí 100%):
1. **Qua Vercel hoặc Netlify (Chỉ 1 phút kéo thả)**:
   - Truy cập trang web `https://app.netlify.com/drop`.
   - Kéo toàn bộ thư mục `TOÁN 9` thả vào khung trình duyệt.
   - Netlify sẽ cấp ngay một đường link (ví dụ: `toan9-thcs-nghiaan.netlify.app`). Thầy/Cô chỉ cần gửi link này vào Zalo nhóm lớp cho phụ huynh và học sinh truy cập!
2. **Qua GitHub Pages**:
   - Tạo một kho lưu trữ (repository) trên GitHub.
   - Tải các file (`index.html`, thư mục `css/`, `js/`) lên nhánh `main`.
   - Vào Settings -> Pages -> Chọn source là nhánh `main` và lưu.

---
*Chúc Thầy/Cô có những tiết dạy Toán 9 thật sôi nổi, hiệu quả và truyền được niềm say mê môn Toán đến tất cả các em học sinh!*
