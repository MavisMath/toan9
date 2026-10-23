# tools/patch_ui.py
with open('js/app.js', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Add showTopics right after setTimeout(() => game.renderMath(), 50);\n  }
marker_tab = "setTimeout(() => game.renderMath(), 50);\n  }"
idx_tab = text.find(marker_tab)

if idx_tab != -1:
    pos = idx_tab + len(marker_tab)
    addition = '''

  // Chuyển trực tiếp đến Chuyên đề (Chuẩn / Nâng cao / Sổ tay lỗi sai)
  showTopics(subTab = 'standard') {
    this.showTab('topics');
    this.renderTopicsList(subTab);
    if (subTab === 'advanced') {
      const advBtn = document.getElementById('nav-advanced');
      if (advBtn) {
        advBtn.classList.add('bg-rose-600', 'text-white', 'shadow-lg');
        advBtn.classList.remove('text-rose-300', 'hover:bg-rose-600/30');
      }
      const topBtn = document.getElementById('nav-topics');
      if (topBtn) {
        topBtn.classList.remove('bg-blue-600', 'text-white', 'shadow-lg');
        topBtn.classList.add('text-slate-400');
      }
    }
  }'''
    text = text[:pos] + addition + text[pos:]
    print("showTopics added!")
else:
    print("marker_tab not found")

# 2. Replace Home feature cards
start_hot = "<!-- Lối vào các chế độ chơi cực hot -->"
end_hot = "renderTowerMap() {"

idx_start = text.find(start_hot)
idx_end = text.find(end_hot)

print("idx_start:", idx_start, "idx_end:", idx_end)

if idx_start != -1 and idx_end != -1:
    new_home_cards = '''<!-- Lối vào các chế độ chơi cực hot -->
      <h2 class="text-xl font-black text-white mb-4 flex items-center gap-2">
        <span>🎮 CÁC CHẾ ĐỘ ÔN LUYỆN ĐẶC SẮC</span>
      </h2>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <!-- Card 0: Luyện tập hằng ngày 10 câu -->
        <div onclick="app.startDailyPractice()" class="home-feature-card p-6 rounded-3xl glass-card border border-amber-500/30 hover:border-amber-400 cursor-pointer group">
          <div class="home-feature-icon w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition">
            📅
          </div>
          <h3 class="text-lg font-black text-white group-hover:text-amber-300 transition">Bài Luyện Tập Hằng Ngày (10 Câu)</h3>
          <p class="text-xs text-slate-400 mt-2 leading-relaxed">
            Đúng 10 câu mỗi lượt theo thuật toán lặp lại ngắt quãng: ưu tiên ôn lại kiến thức từng sai để nắm chắc bản chất, kèm câu hỏi đa dạng mới.
          </p>
          <div class="mt-4 text-xs font-bold text-amber-400 flex items-center gap-1">
            Bắt đầu 10 câu hôm nay ➔
          </div>
        </div>

        <!-- Card 1: 10 Chuyên đề GDPT 2018 -->
        <div onclick="app.showTopics('standard')" class="home-feature-card p-6 rounded-3xl glass-card border border-indigo-500/30 hover:border-indigo-400 cursor-pointer group">
          <div class="home-feature-icon w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition">
            🌸
          </div>
          <h3 class="text-lg font-black text-white group-hover:text-indigo-300 transition">10 Chuyên Đề Chuẩn GDPT 2018</h3>
          <p class="text-xs text-slate-400 mt-2 leading-relaxed">
            Học chuẩn kiến thức trọng tâm (Căn thức, Hệ PT, Lượng giác, Đường tròn, Hàm số Parabol, Vi-ét...).
          </p>
          <div class="mt-4 text-xs font-bold text-indigo-400 flex items-center gap-1">
            Bắt đầu khám phá ➔
          </div>
        </div>

        <!-- Card 2: Chuyên Đề Nâng Cao 9+ -->
        <div onclick="app.showTopics('advanced')" class="home-feature-card p-6 rounded-3xl glass-card border border-rose-500/40 hover:border-rose-400 cursor-pointer group bg-gradient-to-b from-rose-950/20 to-slate-900/60 shadow-lg shadow-rose-950/30">
          <div class="home-feature-icon w-14 h-14 rounded-2xl bg-gradient-to-r from-amber-500/20 to-rose-500/20 text-rose-400 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition border border-rose-500/30">
            🔥
          </div>
          <h3 class="text-lg font-black text-white group-hover:text-rose-300 transition">Chuyên Đề Nâng Cao (9+)</h3>
          <p class="text-xs text-slate-400 mt-2 leading-relaxed">
            6 chủ đề vận dụng cao bứt phá điểm 9-10 vào lớp 10 chuyên (BĐT Cauchy chọn điểm rơi, Hệ PT vô tỷ, Vi-ét nâng cao, Cực trị hình học).
          </p>
          <div class="mt-4 text-xs font-bold text-rose-400 flex items-center gap-1">
            Bứt phá điểm 9-10 ➔
          </div>
        </div>

        <!-- Card 3: Sổ Tay Khắc Phục Lỗi Sai (Spaced Repetition) -->
        <div onclick="app.showTopics('review')" class="home-feature-card p-6 rounded-3xl glass-card border border-emerald-500/30 hover:border-emerald-400 cursor-pointer group">
          <div class="home-feature-icon w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition">
            🔁
          </div>
          <h3 class="text-lg font-black text-white group-hover:text-emerald-300 transition">Sổ Tay Khắc Phục Lỗi Sai</h3>
          <p class="text-xs text-slate-400 mt-2 leading-relaxed">
            Hộp ghi nhớ Leitner 5 cấp độ: tự động lưu mọi câu làm sai, xếp lịch nhắc nhở ôn lại đúng lúc đến khi hiểu sâu bản chất lý thuyết.
          </p>
          <div class="mt-4 text-xs font-bold text-emerald-400 flex items-center gap-1">
            Xem sổ tay lỗi sai ➔
          </div>
        </div>

        <!-- Card 4: Song Đấu 1v1 -->
        <div onclick="app.showTab('pvp')" class="home-feature-card p-6 rounded-3xl glass-card border border-purple-500/30 hover:border-purple-400 cursor-pointer group">
          <div class="home-feature-icon w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition">
            💞
          </div>
          <h3 class="text-lg font-black text-white group-hover:text-purple-300 transition">Song Đấu 1v1 (2 Bạn)</h3>
          <p class="text-xs text-slate-400 mt-2 leading-relaxed">
            Hai bạn cùng ngồi chung 1 máy tính bấm phím nhanh hoặc so tài trên lớp học! Cực kỳ kịch tính và sôi động!
          </p>
          <div class="mt-4 text-xs font-bold text-purple-400 flex items-center gap-1">
            Thách đấu ngay ➔
          </div>
        </div>

        <!-- Card 5: Đề thi thật Học Kỳ I Nghĩa An -->
        <div onclick="app.showTab('exams')" class="home-feature-card p-6 rounded-3xl glass-card border border-cyan-500/30 hover:border-cyan-400 cursor-pointer group">
          <div class="home-feature-icon w-14 h-14 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition">
            🍓
          </div>
          <h3 class="text-lg font-black text-white group-hover:text-cyan-300 transition">Luyện Đề Thi Học Kỳ & Tuyển Sinh</h3>
          <p class="text-xs text-slate-400 mt-2 leading-relaxed">
            Đề thi học kỳ 2025-2026 chính thức (Trắc nghiệm, Đúng/Sai, Điền số và Lời giải tự luận chi tiết).
          </p>
          <div class="mt-4 text-xs font-bold text-cyan-400 flex items-center gap-1">
            Làm bài thi thử ➔
          </div>
        </div>
      </div>
    `;
  }

  // ==============================================================
  // RENDER BẢN ĐỒ THÁP TRI THỨC (TOWER MAP)
  // ==============================================================
  '''

    text = text[:idx_start] + new_home_cards + text[idx_end:]
    print("Home cards updated!")

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(text)
print("js/app.js updated successfully!")
