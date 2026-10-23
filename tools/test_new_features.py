# -*- coding: utf-8 -*-
import sys
import os
import urllib.parse
sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import database

print("=== 1. TEST TÀI LIỆU THƯ MỤC (DOCUMENTS) ===")
docs = database.get_documents_metadata()
print(f"Tổng số tài liệu quét được từ thư mục: {len(docs)}")
assert len(docs) >= 30, f"Mong đợi >= 30 tài liệu, nhận được {len(docs)}"
print("Mẫu 3 tài liệu:")
for d in docs[:3]:
    print(f"  - [{d['extension'].upper()}] {d['title']} ({d['sizeFormatted']}) trong thư mục: {d['folder']}")

print("\n=== 2. TEST TRẠNG THÁI CSDL (DATABASE STATUS) ===")
status = database.get_database_status()
print(f"Kết nối CSDL: {status['connected']}")
print(f"Máy chủ: {status['server']} | Database: {status['database']}")
print(f"Bảng Topics: {status['tables'].get('Topics', 0)}")
print(f"Bảng Questions: {status['tables'].get('Questions', 0)} ({status.get('multipleChoiceCount', 0)} TN, {status.get('numericInputCount', 0)} Điền)")
print(f"Bảng Tower_Floors: {status['tables'].get('Tower_Floors', 0)}")
print(f"Bảng Exams: {status['tables'].get('Exams', 0)}")

print("\n=== 3. TEST TRUY VẤN DỮ LIỆU BẢNG (TABLE ROWS) ===")
for tbl in ['Topics', 'Questions', 'Exams', 'Tower_Floors', 'Achievements', 'Users']:
    res = database.get_table_rows(tbl, limit=5)
    print(f"  - Bảng {res['table']}: Lấy được {len(res['rows'])} dòng, các cột: {', '.join(res['columns'][:4])}...")

print("\n=== 4. TEST ĐỒNG BỘ DỮ LIỆU CSDL (SYNC ALL) ===")
sync_res = database.sync_all_data_to_database()
print("Kết quả đồng bộ:", sync_res['message'])

print("\n=> TẤT CẢ CÁC BƯỚC TEST HOÀN TẤT THÀNH CÔNG 100%!")
