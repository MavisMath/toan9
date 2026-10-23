# -*- coding: utf-8 -*-
"""
Test toàn diện tính năng "BT Nâng Cao" (Điền đáp án):
1. Tính toàn vẹn của Dữ liệu (48 câu hỏi, 10 chuyên đề, KaTeX syntax).
2. Thuật toán Random thông minh ngắt quãng chống lặp (Anti-Repetition Randomizer).
3. Thuật toán chuẩn hóa và chấm điểm đáp án tự động (Flexible Normalization & Grading).
"""
import json
import re

# Đọc file dữ liệu
with open('js/advanced_data.js', encoding='utf-8') as f:
    text = f.read()

# Trích xuất ADVANCED_TOPICS
t_start = text.find('const ADVANCED_TOPICS =') + len('const ADVANCED_TOPICS =')
t_end = text.find(';\n\nconst ADVANCED_FILL_QUESTIONS =')
topics = json.loads(text[t_start:t_end].strip())

# Trích xuất ADVANCED_FILL_QUESTIONS
q_start = text.find('const ADVANCED_FILL_QUESTIONS =') + len('const ADVANCED_FILL_QUESTIONS =')
q_end = text.rfind(';')
questions = json.loads(text[q_start:q_end].strip())

print(f"=== 1. KIỂM TRA DỮ LIỆU ===")
print(f"Tổng số chuyên đề: {len(topics)}")
print(f"Tổng số câu hỏi nâng cao điền đáp án: {len(questions)}")

topic_ids = {t['id'] for t in topics}
assert len(topics) == 10, "Phải có đúng 10 chuyên đề bao quát Tập 1 & Tập 2"
assert len(questions) >= 40, "Phải có tối thiểu 40 câu hỏi"

questions_per_topic = {}
for q in questions:
    tid = q['topicId']
    assert tid in topic_ids, f"Câu hỏi {q['id']} chứa topicId không tồn tại: {tid}"
    assert 'content' in q and len(q['content']) > 15, f"Câu {q['id']} thiếu đề bài"
    assert 'correctAnswer' in q and len(q['correctAnswer']) > 0, f"Câu {q['id']} thiếu đáp án chuẩn"
    assert 'explanation' in q and len(q['explanation']) > 30, f"Câu {q['id']} thiếu giải thích chi tiết"
    assert 'source' in q and 'SBT' in q['source'], f"Câu {q['id']} thiếu trích nguồn SBT"
    questions_per_topic[tid] = questions_per_topic.get(tid, 0) + 1

for t in topics:
    cnt = questions_per_topic.get(t['id'], 0)
    print(f"  - [{t['badge']}] {t['name']}: {cnt} câu hỏi")
    assert cnt >= 3, f"Chuyên đề {t['id']} có quá ít câu hỏi ({cnt})"

print("=> Tất cả dữ liệu hợp lệ 100%!")

print(f"\n=== 2. KIỂM TRA CHUẨN HÓA VÀ CHẤM ĐIỂM ĐÁP ÁN (NORMALIZATION & GRADING) ===")
def normalize_advanced_answer(val):
    if val is None:
        return ''
    s = str(val).strip().lower()
    s = s.replace(',', '.')
    s = re.sub(r'^[a-z]\s*=\s*', '', s)
    s = re.sub(r'\s*(cm\^?2|cm2|cm3|cm\^?3|cm|km\/h|m\^?3|m3|m|học sinh|hs|cặp|nghiệm|giá trị|giờ|h|độ|°)$', '', s)
    return s.strip()

def is_answer_match(user_val, correct_val, acceptable_list):
    norm_user = normalize_advanced_answer(user_val)
    norm_correct = normalize_advanced_answer(correct_val)
    if norm_user == norm_correct:
        return True
    for acc in acceptable_list:
        if norm_user == normalize_advanced_answer(acc):
            return True
    try:
        def to_float(val):
            if '/' in val:
                p = val.split('/')
                return float(p[0]) / float(p[1])
            return float(val)
        nu = to_float(norm_user)
        nc = to_float(norm_correct)
        if abs(nu - nc) < 0.001:
            return True
        for acc in acceptable_list:
            na = to_float(normalize_advanced_answer(acc))
            if abs(nu - na) < 0.001:
                return True
    except:
        pass
    return False

test_cases = [
    ("5", "5", ["5", "m=5"], True),
    ("m = 5", "5", ["5", "m=5"], True),
    ("50 km/h", "50", ["50", "50 km/h"], True),
    ("0.5", "0.5", ["0.5", "1/2"], True),
    ("0,5", "0.5", ["0.5", "1/2"], True),
    ("1/2", "0.5", ["0.5", "1/2"], True),
    ("3/4", "0.75", ["0.75", "3/4"], True),
    ("12h", "12", ["12", "12 giờ"], True),
    ("-1", "-1", ["-1", "m=-1"], True),
    ("m = -1", "-1", ["-1", "m=-1"], True),
    ("6 cm", "6", ["6", "6 cm"], True),
    ("150 cm2", "150", ["150"], True),
    ("6.28", "6.28", ["6.28", "6,28"], True),
    ("6,28", "6.28", ["6.28", "6,28"], True),
    ("999", "5", ["5"], False), # Sai thật sự
]

for u, c, a, expected in test_cases:
    res = is_answer_match(u, c, a)
    assert res == expected, f"Lỗi chấm điểm: nhập '{u}', đáp án '{c}', mong đợi {expected} nhưng ra {res}"

print(f"=> Kiểm tra chấm điểm {len(test_cases)} trường hợp: CHÍNH XÁC 100%!")

print(f"\n=== 3. KIỂM TRA THUẬT TOÁN RANDOM CHỐNG TRÙNG LẶP (ANTI-REPETITION) ===")
import random

class MockStorageManager:
    def __init__(self, questions):
        self.questions = questions
        self.profile = {
            'advancedHistory': {},
            'recentAdvancedQIds': []
        }

    def get_random_advanced_question(self, topic_id=None, exclude_id=None):
        pool = self.questions
        if topic_id and topic_id != 'all':
            pool = [q for q in pool if q['topicId'] == topic_id]
        if not pool:
            pool = self.questions
        if exclude_id and len(pool) > 1:
            pool = [q for q in pool if q['id'] != exclude_id]

        history = self.profile['advancedHistory']
        recent = self.profile['recentAdvancedQIds']

        not_recent = [q for q in pool if q['id'] not in recent]
        active_pool = not_recent if not_recent else pool

        unattempted = [q for q in active_pool if q['id'] not in history or history[q['id']]['attempts'] == 0]
        need_review = [q for q in active_pool if q['id'] in history and history[q['id']]['wrong'] > 0 and history[q['id']]['correct'] == 0]
        low_practice = [q for q in active_pool if q['id'] in history and history[q['id']]['attempts'] <= 2]

        if unattempted:
            cand = unattempted
        elif need_review:
            cand = need_review
        elif low_practice:
            cand = low_practice
        else:
            cand = active_pool

        selected = random.choice(cand)
        self.profile['recentAdvancedQIds'].append(selected['id'])
        if len(self.profile['recentAdvancedQIds']) > 12:
            self.profile['recentAdvancedQIds'].pop(0)

        if selected['id'] not in history:
            history[selected['id']] = {'attempts': 0, 'correct': 0, 'wrong': 0}
        history[selected['id']]['attempts'] += 1

        return selected

mock_storage = MockStorageManager(questions)

# Thử nghiệm chọn 30 câu liên tiếp trong chuyên đề nc_he_pt (có 5 câu)
consecutive_repeats = 0
prev_id = None
picked_ids = []
for i in range(30):
    q = mock_storage.get_random_advanced_question(topic_id='nc_he_pt', exclude_id=prev_id)
    picked_ids.append(q['id'])
    if q['id'] == prev_id:
        consecutive_repeats += 1
    prev_id = q['id']

print(f"Số lần trùng câu liền kề: {consecutive_repeats} (Mong muốn: 0)")
assert consecutive_repeats == 0, "Không được trùng lặp câu hỏi liên tiếp!"

# Kiểm tra phân bố câu hỏi
distribution = {}
for qid in picked_ids:
    distribution[qid] = distribution.get(qid, 0) + 1
print(f"Phân bố 30 lượt làm trên 5 câu của chuyên đề: {distribution}")
for qid, cnt in distribution.items():
    assert 4 <= cnt <= 8, f"Câu {qid} phân bố không đều ({cnt} lần)"

print("=> Thuật toán Random chống trùng lặp hoạt động hoàn hảo!")
print("\n🎉 TẤT CẢ CÁC BÀI TEST ĐÃ VƯỢT QUA 100%!")
