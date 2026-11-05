# Cấu hình chatbot Gemini

Chatbot gửi câu hỏi từ máy chủ Python đến Gemini API. API key chỉ được lưu trên máy chủ, không nhúng vào JavaScript phía trình duyệt. Câu hỏi và phần hội thoại gần nhất sẽ được gửi tới Google để tạo câu trả lời.

## Thiết lập

1. Tạo API key Gemini trong Google AI Studio: https://aistudio.google.com/app/apikey
2. Sao chép `.env.example` thành `.env` trong cùng thư mục với `server.py`.
3. Mở `.env`, thêm API key theo định dạng: `GEMINI_API_KEY=mã_key_của_bạn`, rồi lưu lại.
4. Chạy `Chay_Trang_Web.bat` và mở trang qua `http://localhost:8080` (Lưu ý: cổng là **8080**, không phải 88). Không mở trực tiếp `index.html` nếu muốn dùng chatbot.
5. Nếu vừa sửa `.env` khi máy chủ đã chạy, hãy đóng máy chủ bằng `Ctrl+C` rồi khởi động lại.

## Lưu ý quan trọng khi chạy Bước 4:
- Khi nhấp đúp vào file `Chay_Trang_Web.bat`, một cửa sổ màu đen (CMD) sẽ xuất hiện và trình duyệt tự động mở `http://localhost:8080`.
- **Cần giữ cửa sổ màu đen luôn chạy** (có thể thu nhỏ xuống thanh taskbar). Nếu tắt dấu X đỏ của cửa sổ đen, máy chủ sẽ dừng và chatbot sẽ không thể nhận câu hỏi.
- Địa chỉ cổng chính xác là `8080` (`http://localhost:8080`), không gõ nhầm thành 88.
- Giữ `.env` riêng tư, không gửi cho học sinh và không đăng tải lên mạng.
