#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CÔNG CỤ PHÁT WEB & CHATBOT RA INTERNET (CLOUDFLARE TUNNEL)
Giúp giáo viên chia sẻ link HTTPS cho học sinh ở bất cứ đâu đều truy cập được
"""

import subprocess
import socket
import time
import re
import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

PORT = 8080

def is_port_open(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('127.0.0.1', port)) == 0

def copy_to_clipboard(text):
    try:
        subprocess.run(['powershell', '-Command', f"Set-Clipboard -Value '{text}'"], check=True)
        return True
    except Exception:
        return False

def main():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    print("=" * 65)
    print("   ĐẤU TRƯỜNG TOÁN 9 - CÔNG CỤ PHÁT WEB & CHATBOT RA INTERNET")
    print("=" * 65)

    # 1. Kiem tra xem may chu Python da chay chua
    server_process = None
    if not is_port_open(PORT):
        print("[*] May chu local chua chay. Dang khoi dong server.py tren cong 8080...")
        server_process = subprocess.Popen([sys.executable, "server.py"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        time.sleep(2)
        if not is_port_open(PORT):
            time.sleep(2)
    else:
        print("[*] May chu local (server.py) da dang chay san tren cong 8080.")

    # 2. Kiem tra file cloudflared.exe
    cloudflared_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cloudflared.exe")
    if not os.path.isfile(cloudflared_path):
        print("[!] Khong tim thay cloudflared.exe. Vui long tai ve dat vao thu muc!")
        input("\nNhan Enter de thoat...")
        return

    print("[*] Dang tao duong ham bao mat Cloudflare Tunnel ra Internet...")
    tunnel_cmd = [cloudflared_path, "tunnel", "--url", f"http://localhost:{PORT}"]
    tunnel_proc = subprocess.Popen(
        tunnel_cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        encoding="utf-8",
        errors="ignore",
        bufsize=1
    )

    tunnel_url = None
    url_pattern = re.compile(r"https://[a-zA-Z0-9-]+\.trycloudflare\.com")

    start_time = time.time()
    while time.time() - start_time < 30:
        line = tunnel_proc.stdout.readline()
        if not line:
            if tunnel_proc.poll() is not None:
                break
            time.sleep(0.1)
            continue

        match = url_pattern.search(line)
        if match:
            tunnel_url = match.group(0)
            break

    if not tunnel_url:
        print("[!] Khong lay duoc duong link public tu Cloudflare. Hay kiem tra ket noi mang!")
        tunnel_proc.terminate()
        return

    copied = copy_to_clipboard(tunnel_url)

    print("\n" + "=" * 65)
    print("  🎉 ĐÃ PHÁT TRANG WEB & CHATBOT RA TOÀN BỘ INTERNET THÀNH CÔNG!")
    print("=" * 65)
    print(f"\n  👉 LINK CHO HỌC SINH:\n     {tunnel_url}\n")
    if copied:
        print("  📋 (Đã tự động sao chép link vào bộ nhớ tạm - Clipboard!)")
        print("     Thầy/Cô chỉ cần nhấn Ctrl + V để dán vào Zalo nhóm lớp.")
    print("=" * 65)
    print("  LƯU Ý:")
    print("  - Học sinh có thể dùng điện thoại, máy tính bảng hoặc 4G để vào học.")
    print("  - Chatbot AI 'Mèo Toán Thông Thái' hoạt động 100% qua đường link này.")
    print("  - Hãy GIỮ CỬA SỔ NÀY MỞ trong suốt thời gian học sinh học tập.")
    print("  - Để dừng phát Internet: Nhấn Ctrl + C hoặc đóng cửa sổ này.")
    print("=" * 65 + "\n")

    try:
        tunnel_proc.wait()
    except KeyboardInterrupt:
        print("\n[*] Dang dong duong ham Internet...")
        tunnel_proc.terminate()
        if server_process:
            server_process.terminate()
        print("[*] Da dung.")

if __name__ == "__main__":
    main()
