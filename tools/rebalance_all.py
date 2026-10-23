import re

with open('js/data.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Match each question in QUESTIONS = [ ... ]
q_start = text.find('const QUESTIONS = [')
q_end = text.find('const REAL_EXAMS = [')

questions_part = text[q_start:q_end]

def rebalance_questions_str(s):
    # Regex to find each question block:
    # { id: '...', ..., options: [ ... ], correctAnswer: ..., ... }
    pattern = re.compile(r'(\{\s*id:\s*[\'\"][^\'\"]+[\'\"].*?options:\s*\[\s*)(.*?)(\s*\]\s*,\s*correctAnswer:\s*)(\d+)(.*?\n\s*\})', re.DOTALL)
    
    count = 0
    dist = {0: 0, 1: 0, 2: 0, 3: 0}
    
    def repl(m):
        nonlocal count
        header = m.group(1)
        opts_raw = m.group(2)
        mid = m.group(3)
        old_ca = int(m.group(4))
        footer = m.group(5)
        
        # Parse options
        # Options are comma separated, but commas might be inside strings
        # Let's extract all quoted strings in opts_raw
        opts = re.findall(r'(\'(?:[^\'\\]|\\.)*\'|\"(?:[^\"\\]|\\.)*\")', opts_raw)
        if len(opts) != 4:
            # If not 4 options, return unchanged
            return m.group(0)
            
        target_idx = (count * 7 + 2) % 4
        dist[target_idx] += 1
        count += 1
        
        correct_val = opts[old_ca]
        opts[old_ca] = opts[target_idx]
        opts[target_idx] = correct_val
        
        new_opts_str = '\n      ' + ',\n      '.join(opts) + '\n    '
        return header + new_opts_str + mid + str(target_idx) + footer

    new_s = pattern.sub(repl, s)
    return new_s, count, dist

new_q_part, cnt, distribution = rebalance_questions_str(questions_part)
print(f"Rebalanced {cnt} questions. New distribution:", distribution)

# Also rebalance in REAL_EXAMS
exam_start = text.find('const REAL_EXAMS = [')
exam_end = text.find('const TOWER_FLOORS = [')
exam_part = text[exam_start:exam_end]
new_exam_part, ecnt, edist = rebalance_questions_str(exam_part)
print(f"Rebalanced {ecnt} exam questions. New distribution:", edist)

# Read advanced topics and questions
with open('tools/advanced_data.js', 'r', encoding='utf-8') as f:
    adv_code = f.read()

# Build full updated data.js
# Insert ADVANCED_TOPICS right after TOPICS
top_end = text.find('// DỮ LIỆU CÂU HỎI THEO CHUYÊN ĐỀ')
if top_end == -1:
    top_end = text.find('const QUESTIONS = [')

part1 = text[:top_end]
part2 = new_q_part
part3 = new_exam_part
part4 = text[exam_end:]

full_updated = part1 + "\n" + adv_code + "\n" + part2 + "\n" + part3 + "\n" + part4

with open('js/data.js', 'w', encoding='utf-8') as f:
    f.write(full_updated)

print("Saved updated js/data.js! Length:", len(full_updated))
