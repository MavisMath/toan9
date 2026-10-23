@echo off
title DAU TRUONG TOAN 9 - VUA HOC VUA CHOI
chcp 65001 >nul
set PYTHONIOENCODING=utf-8
cd /d "%~dp0"
echo ========================================================
echo       ĐẤU TRƯỜNG TOÁN 9 - HỆ THỐNG ÔN TẬP VỪA HỌC VỪA CHƠI
echo ========================================================
echo Đang mở trình duyệt web...
python server.py
if %ERRORLEVEL% NEQ 0 (
    echo Không khởi động được máy chủ Python, đang mở trực tiếp file index.html...
    start index.html
)
pause
