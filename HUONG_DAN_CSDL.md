# Cơ sở dữ liệu website Toán 9

## Trạng thái

Cơ sở dữ liệu `Toan9_DB` đã được tạo trên SQL Server instance `localhost\MSSQLSERVER01`.

- 17 bảng
- 7 chuyên đề mẫu
- 3 câu hỏi mẫu
- 2 tài khoản mẫu

SQL Server lưu tệp dữ liệu ở thư mục dữ liệu của máy chủ, không đặt trực tiếp trong thư mục dự án. File `database_toan9_sqlserver.sql` trong thư mục này là script tạo cấu trúc và dữ liệu mẫu.

## Mở cơ sở dữ liệu

1. Mở SQL Server Management Studio (SSMS).
2. Kết nối máy chủ `localhost\MSSQLSERVER01` bằng Windows Authentication.
3. Mở mục **Databases** và chọn `Toan9_DB`.
4. Mở **Tables** để xem các bảng như `Users`, `Topics`, `Questions`, `Exams` và các bảng lưu tiến độ.

## Chạy lại script

Không chạy lại toàn bộ `database_toan9_sqlserver.sql` trên cơ sở dữ liệu đang dùng: script xóa các bảng hiện có trước khi tạo lại, vì vậy dữ liệu đã lưu sẽ mất. Chỉ dùng script để dựng lại từ đầu sau khi đã sao lưu hoặc khi chủ động muốn xóa dữ liệu.

## Kết nối với website

Website đã có API kết nối SQL Server qua `server.py`. Khi mở web bằng `Chay_Trang_Web.bat`, website đồng bộ hồ sơ, câu hỏi giáo viên tự tạo và bảng xếp hạng vào `Toan9_DB`; dữ liệu vẫn được lưu trong `localStorage` để dùng dự phòng khi mất kết nối.

### Cài đặt trên máy khác

1. Cài Python, Microsoft ODBC Driver for SQL Server và SQL Server.
2. Chạy `python -m pip install -r requirements.txt`.
3. Sao chép `.env.example` thành `.env`, rồi chỉnh `SQL_SERVER`, `SQL_DATABASE` và cấu hình xác thực nếu cần.
4. Đảm bảo tài khoản Windows đang chạy `server.py` có quyền truy cập `Toan9_DB`.
5. Khởi động lại website bằng `Chay_Trang_Web.bat`.

## Tính năng Đăng Nhập & Tạo Tài Khoản (Đã hoàn thiện)

Website đã tích hợp hệ thống xác thực người dùng đầy đủ liên kết trực tiếp với cơ sở dữ liệu `Toan9_DB`:

1. **Bảng dữ liệu quản lý tài khoản**:
   - `dbo.Users`: Lưu trữ `username`, mật khẩu đã băm an toàn (`password_hash` chuẩn PBKDF2-HMAC-SHA256), `display_name`, `avatar`, `level`, `exp`, `diamonds`, `streak`, `speed_high_score`.
   - `dbo.User_Sessions`: Lưu phiên làm việc (`session_token`, thời hạn phiên, tự động dọn dẹp phiên hết hạn).
   - `dbo.Web_Client_State`: Lưu trữ tiến độ bài học, các câu hỏi tự tạo và bảng vàng xếp hạng theo từng tài khoản.

2. **Cơ chế bảo vệ tính năng (Access Gating)**:
   - Khi người dùng vào website và muốn **học** (Bài tập cơ bản, Bài tập nâng cao điền số, Leo tháp, Đề thi thực chiến, Song đấu) hoặc **thử thách 60 giây tốc độ**, hệ thống sẽ yêu cầu đăng nhập tài khoản.
   - Nếu chưa có tài khoản, người dùng có thể bấm **Tạo tài khoản mới** (chọn tên đăng nhập, tên học sinh, mật khẩu và avatar) chỉ mất vài giây.
   - Ngay sau khi đăng nhập/đăng ký thành công, hệ thống tự động đưa người dùng vào ngay phần học hoặc thử thách 60 giây đã chọn.
   - Điểm số, kỷ lục 60 giây và số kim cương tích lũy được tự động đồng bộ vào CSDL `Toan9_DB`. Khi chuyển sang máy tính hay điện thoại khác trong lớp, chỉ cần đăng nhập lại là toàn bộ tiến độ được giữ nguyên.

3. **Tài khoản mẫu có sẵn trong CSDL**:
   - Tài khoản học sinh: `hocsinh01` | Mật khẩu: `123456` (Mavis Hoàng Gia)
   - Tài khoản giáo viên: `giaovien_toan` | Mật khẩu: `123456` (Cô Giáo Thảo)
   - Có nút **"Điền nhanh"** trong bảng đăng nhập để thử nghiệm nhanh chóng.
