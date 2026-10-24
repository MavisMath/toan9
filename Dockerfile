# ================================================================
# DOCKERFILE - TOÁN 9 WITH MAVIS (GDPT 2018)
# ================================================================
FROM python:3.11-slim

# Thiết lập thư mục làm việc bên trong container
WORKDIR /app

# Cấu hình biến môi trường
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8080 \
    NO_BROWSER=1 \
    SQLITE_DB_PATH=/app/data/toan9.db

# Sao chép requirements và cài đặt (nếu có thư viện ngoài)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt || true

# Sao chép toàn bộ dự án vào container
COPY . .

# Tạo thư mục data để mount volume lưu trữ cơ sở dữ liệu bền vững
RUN mkdir -p /app/data

# Khai báo cổng lắng nghe
EXPOSE 8080

# Lệnh khởi chạy máy chủ
CMD ["python", "server.py"]
