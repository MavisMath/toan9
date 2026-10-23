import sys
import re
from collections import Counter

sys.stdout.reconfigure(encoding='utf-8')

with open('js/data.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Find QUESTIONS array
q_match = re.search(r'const QUESTIONS = \[(.*?)\n\];\n\n// ==========================================\n// DỮ LIỆU ĐỀ THI', text, re.DOTALL)
if q_match:
    q_text = q_match.group(1)
    topics = re.findall(r'topicId:\s*[\'"](\w+)[\'"]', q_text)
    print("Total questions in QUESTIONS array:", len(topics))
    print("Breakdown by topicId:")
    for t, c in Counter(topics).items():
        print(f"  - {t}: {c} câu")
else:
    print("Could not isolate QUESTIONS block")

# Check REAL_EXAMS
exams = re.findall(r'id:\s*[\'"](exam_\w+)[\'"]', text)
print("\nReal exams defined:", exams)
