@echo off
title PHAT DAU TRUONG TOAN 9 RA INTERNET
chcp 65001 >nul
set PYTHONIOENCODING=utf-8
cd /d "%~dp0"
python tunnel_launcher.py
pause
