# -*- coding: utf-8 -*-
"""
Script to patch js/app.js to integrate:
1. showTab('advanced') handler
2. Home screen Feature card for BT Nâng Cao
3. All BT Nâng Cao methods in AppController
"""
import sys

with open('js/app.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update showTab
showtab_target = "this.renderTeacherDashboard();\n    }"
showtab_replacement = """this.renderTeacherDashboard();
    } else if (tabName === 'advanced') {
      this.renderAdvancedView();
    }"""

if showtab_target in content:
    content = content.replace(showtab_target, showtab_replacement, 1)
    print("showTab patched successfully!")
else:
    print("Error: showtab_target not found")
    sys.exit(1)

# 2. Update Home screen Feature Cards
home_target = """      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <!-- Card 1: Chuyên đề GDPT 2018 -->"""

home_replacement = """      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Card 0: BT Nâng Cao Điền Đáp Án -->
        <div onclick="app.showTab('advanced')" class="home-feature-card p-6 rounded-3xl glass-card border border-amber-500/40 hover:border-amber-400 cursor-pointer group bg-gradient-to-b from-amber-950/20 to-slate-900/60 shadow-lg shadow-amber-950/30">
          <div class="home-feature-icon w-14 h-14 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition border border-amber-500/30">
            ⚡
          </div>
          <div class="flex items-center gap-2">
            <h3 class="text-base font-black text-white group-hover:text-amber-300 transition">Bài Tập Nâng Cao</h3>
            <span class="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">Điền Số</span>
          </div>
          <p class="text-xs text-slate-400 mt-2 leading-relaxed">
            Tuyển chọn 48 bài toán vận dụng cao từ SBT Toán 9 KNTT Tập 1 & 2. Tự tính và điền đáp số chuẩn đề thi mới!
          </p>
          <div class="mt-4 text-xs font-bold text-amber-400 flex items-center gap-1">
            Bứt phá điểm 9-10 ➔
          </div>
        </div>

        <!-- Card 1: Chuyên đề GDPT 2018 -->"""

if home_target in content:
    content = content.replace(home_target, home_replacement, 1)
    print("Home cards patched successfully!")
else:
    print("Error: home_target not found")
    sys.exit(1)

# 3. Add BT Nâng Cao methods into AppController before selectAvatar
methods_code = """
  // ==============================================================
  // TÍNH NĂNG MỚI: BÀI TẬP NÂNG CAO - TRẮC NGHIỆM ĐIỀN ĐÁP ÁN
  // Nguồn từ folder "BT Nang Cao" (SBT Toán 9 KNTT Tập 1 & Tập 2)
  // Random thông minh chống lặp lại câu hỏi
  // ==============================================================

  renderAdvancedView(selectedSemester = 'all') {
    const container = document.getElementById('advanced-content');
    if (!container) return;

    const stats = (storage.getAdvancedStats) ? storage.getAdvancedStats() : {
      totalQuestions: 48, solvedCount: 0, correctCount: 0, accuracy: 0, streak: 0
    };
    const p = storage.profile;

    let topics = (typeof ADVANCED_TOPICS !== 'undefined') ? ADVANCED_TOPICS : [];
    if (selectedSemester === 'tap1') {
      topics = topics.filter(t => t.badge && t.badge.includes('Tập 1'));
    } else if (selectedSemester === 'tap2') {
      topics = topics.filter(t => t.badge && t.badge.includes('Tập 2'));
    }

    container.innerHTML = `
      <div id="advanced-main-container">
        <!-- Banner Tiêu Đề Nổi Bật -->
        <div class="relative rounded-3xl p-6 md:p-8 glass-panel border border-amber-500/30 overflow-hidden shadow-2xl bg-gradient-to-r from-amber-950/60 via-slate-900/80 to-blue-950/60 mb-8">
          <div class="absolute -right-8 -bottom-8 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div class="max-w-2xl">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold mb-3">
                <span>⚡ BÀI TẬP VẬN DỤNG CAO 9-10 ĐIỂM</span>
                <span class="text-[10px] bg-amber-500/30 px-1.5 py-0.5 rounded uppercase">Dạng điền đáp án</span>
              </div>
              <h2 class="text-2xl md:text-3xl font-black text-white tracking-tight">
                CHUYÊN ĐỀ BÀI TẬP NÂNG CAO TOÁN 9
              </h2>
              <p class="text-xs md:text-sm text-slate-300 mt-2 leading-relaxed">
                Nguồn trích xuất từ <strong>Sách Bài Tập (SBT) Toán 9 Kết Nối Tri Thức Với Cuộc Sống</strong> (Tập 1 & Tập 2).
                Học sinh tự giải toán và <strong>điền kết quả ngắn</strong> vào ô đáp số.
                Hệ thống áp dụng thuật toán <strong>Random thông minh ngắt quãng</strong> giúp câu hỏi luôn đổi mới, <em>tuyệt đối không bị trùng lặp lại một câu quá nhiều lần</em>!
              </p>
            </div>

            <!-- Nút Thử Thách Random Tổng Hợp Toàn Bộ -->
            <div class="shrink-0 flex flex-col sm:flex-row md:flex-col gap-3">
              <button onclick="app.startAdvancedPractice('all')"
                class="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-extrabold text-sm shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 transition">
                <span>🎲</span>
                <span>Luyện Random Toàn Bộ</span>
              </button>
              <button onclick="app.showTab('home')"
                class="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition text-center">
                ⬅ Về Trang Chủ
              </button>
            </div>
          </div>
        </div>

        <!-- Thống Kê Tiến Độ Chinh Phục Bài Nâng Cao -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div class="p-4 rounded-2xl glass-card border border-amber-500/30">
            <div class="text-slate-400 text-xs font-semibold uppercase">Đã Chinh Phục</div>
            <div class="text-2xl md:text-3xl font-black text-amber-400 mt-1">${stats.solvedCount}/${stats.totalQuestions}</div>
            <div class="text-[11px] text-slate-500 mt-1">Câu hỏi nâng cao</div>
          </div>

          <div class="p-4 rounded-2xl glass-card border border-emerald-500/30">
            <div class="text-slate-400 text-xs font-semibold uppercase">Tỉ Lệ Chính Xác</div>
            <div class="text-2xl md:text-3xl font-black text-emerald-400 mt-1">${stats.accuracy}%</div>
            <div class="text-[11px] text-slate-500 mt-1">${stats.correctCount} câu trả lời đúng</div>
          </div>

          <div class="p-4 rounded-2xl glass-card border border-orange-500/30">
            <div class="text-slate-400 text-xs font-semibold uppercase">Chuỗi Đúng Liên Tiếp</div>
            <div class="text-2xl md:text-3xl font-black text-orange-400 mt-1">🔥 ${stats.streak}</div>
            <div class="text-[11px] text-slate-500 mt-1">Kỉ lục: ${p.maxStreak || 0} câu</div>
          </div>

          <div class="p-4 rounded-2xl glass-card border border-pink-500/30">
            <div class="text-slate-400 text-xs font-semibold uppercase">Kim Cương Tích Lũy</div>
            <div class="text-2xl md:text-3xl font-black text-pink-400 mt-1">💗 ${p.diamonds || 0}</div>
            <div class="text-[11px] text-slate-500 mt-1">+5 💗 mỗi câu đúng</div>
          </div>
        </div>

        <!-- Bộ Lọc Học Kỳ: Tất cả / Tập 1 / Tập 2 -->
        <div class="flex items-center justify-between flex-wrap gap-3 mb-6 pb-3 border-b border-slate-800">
          <div class="flex items-center gap-2">
            <span class="text-xs font-black text-slate-300 uppercase tracking-wide">📂 DANH SÁCH 10 CHUYÊN ĐỀ NÂNG CAO:</span>
          </div>

          <div class="flex items-center gap-2 text-xs font-bold">
            <button onclick="app.renderAdvancedView('all')"
              class="px-3 py-1.5 rounded-xl border transition ${selectedSemester === 'all' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'}">
              Tất Cả (10 Chuyên đề)
            </button>
            <button onclick="app.renderAdvancedView('tap1')"
              class="px-3 py-1.5 rounded-xl border transition ${selectedSemester === 'tap1' ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'}">
              📘 SBT Tập 1 (Chương I - V)
            </button>
            <button onclick="app.renderAdvancedView('tap2')"
              class="px-3 py-1.5 rounded-xl border transition ${selectedSemester === 'tap2' ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'}">
              📙 SBT Tập 2 (Chương VI - X)
            </button>
          </div>
        </div>

        <!-- Lưới 10 Chuyên Đề Nâng Cao -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          ${topics.map(t => {
            const topicQs = (typeof ADVANCED_FILL_QUESTIONS !== 'undefined') ? ADVANCED_FILL_QUESTIONS.filter(q => q.topicId === t.id) : [];
            const prog = (p.advancedTopicProgress && p.advancedTopicProgress[t.id]) ? p.advancedTopicProgress[t.id] : { correct: 0, total: 0 };
            const pct = topicQs.length > 0 ? Math.min(100, Math.round((prog.correct / topicQs.length) * 100)) : 0;

            return `
              <div onclick="app.startAdvancedPractice('${t.id}')"
                class="rounded-3xl p-6 glass-card border ${t.borderColor} hover:scale-[1.02] cursor-pointer transition flex flex-col justify-between group shadow-lg">
                <div>
                  <div class="flex justify-between items-start mb-3">
                    <span class="w-12 h-12 rounded-2xl bg-gradient-to-r ${t.color} text-white font-bold flex items-center justify-center text-xl shadow-lg group-hover:scale-110 transition">
                      ${t.icon}
                    </span>
                    <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-slate-700">
                      ${t.badge}
                    </span>
                  </div>

                  <h3 class="text-base font-black text-white mt-1 group-hover:text-amber-300 transition">${t.name}</h3>
                  <p class="text-xs text-slate-400 mt-2 leading-relaxed">${t.description}</p>
                </div>

                <div class="mt-6 pt-4 border-t border-slate-800">
                  <div class="flex justify-between text-xs font-bold mb-1">
                    <span class="text-slate-400">Tiến độ điền đúng:</span>
                    <span class="text-amber-400">${prog.correct}/${topicQs.length} câu (${pct}%)</span>
                  </div>
                  <div class="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div class="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all" style="width: ${pct}%"></div>
                  </div>

                  <button class="w-full mt-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-600 transition flex items-center justify-center gap-2 group-hover:bg-amber-600 group-hover:text-white group-hover:border-amber-500">
                    <span>Luyện Chuyên Đề Này</span>
                    <span>➔</span>
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    setTimeout(() => game.renderMath(container), 30);
  }

  startAdvancedPractice(topicId = null) {
    this.activeAdvancedTopicId = topicId;
    this.loadNextAdvancedQuestion();
    audio.playClick();
  }

  loadNextAdvancedQuestion(excludeId = null) {
    const q = storage.getRandomAdvancedQuestion(this.activeAdvancedTopicId, excludeId);
    if (!q) {
      alert('Không tìm thấy câu hỏi nâng cao phù hợp!');
      return;
    }
    this.activeAdvancedQuestion = q;
    this.renderAdvancedQuestionUI();
  }

  renderAdvancedQuestionUI() {
    const container = document.getElementById('advanced-content');
    if (!container) return;

    const q = this.activeAdvancedQuestion;
    const topic = (typeof ADVANCED_TOPICS !== 'undefined') ? ADVANCED_TOPICS.find(t => t.id === q.topicId) : null;
    const topicName = topic ? topic.name : 'Chuyên Đề Nâng Cao';
    const topicIcon = topic ? topic.icon : '⚡';

    container.innerHTML = `
      <div class="max-w-3xl mx-auto rounded-3xl p-6 md:p-8 glass-panel border border-amber-500/30 shadow-2xl relative">
        <!-- Header thanh điều hướng bài tập -->
        <div class="flex flex-wrap items-center justify-between pb-4 border-b border-slate-800 mb-6 gap-3">
          <div class="flex items-center gap-3">
            <span class="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold flex items-center justify-center text-lg">
              ${topicIcon}
            </span>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs text-amber-400 font-extrabold uppercase">${topicName}</span>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  ${q.difficulty}
                </span>
              </div>
              <h3 class="text-sm font-bold text-white mt-0.5">${q.title}</h3>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button onclick="app.loadNextAdvancedQuestion('${q.id}')"
              class="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition flex items-center gap-1.5"
              title="Đổi sang câu hỏi ngẫu nhiên khác (không bị tính lượt làm)">
              <span>🔀</span><span>Đổi câu khác</span>
            </button>
            <button onclick="app.renderAdvancedView()"
              class="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition">
              ✖ Thoát
            </button>
          </div>
        </div>

        <!-- Huy hiệu Nguồn & Điểm thưởng -->
        <div class="flex items-center justify-between mb-4 text-xs font-medium text-slate-400 bg-slate-900/60 px-4 py-2 rounded-xl border border-slate-800/80">
          <div class="flex items-center gap-1.5">
            <span>📖 Nguồn:</span>
            <span class="text-slate-200 font-semibold">${q.source}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-amber-400 font-bold">+25 EXP</span>
            <span class="text-pink-400 font-bold">+5 💗</span>
          </div>
        </div>

        <!-- Đề bài câu hỏi với KaTeX -->
        <div class="p-5 md:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 text-base md:text-lg font-medium text-slate-100 leading-relaxed mb-6" id="advanced-q-content">
          ${q.content}
        </div>

        <!-- Khung Gợi Ý Phương Pháp (Mở rộng/Thu gọn) -->
        ${q.hint ? `
          <div class="mb-6">
            <button onclick="app.toggleAdvancedHint()" type="button"
              class="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 transition">
              <span>💡</span>
              <span id="hint-toggle-text">Xem Gợi Ý Phương Pháp Giải</span>
            </button>
            <div id="advanced-hint-box" class="hidden mt-2 p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200 leading-relaxed">
              <strong>Gợi ý:</strong> ${q.hint}
            </div>
          </div>
        ` : ''}

        <!-- Khu vực Điền Đáp Án -->
        <div class="p-5 md:p-6 rounded-2xl bg-slate-900/90 border border-slate-700 mb-6">
          <label for="advanced-input" class="block text-xs font-black text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
            <span>✍️</span><span>NHẬP ĐÁP SỐ CỦA BẠN:</span>
          </label>

          <div class="relative">
            <input type="text" id="advanced-input"
              placeholder="${q.placeholder || 'Nhập đáp số (ví dụ: 5, -2, 3/4, 0.5)...'}"
              autocomplete="off"
              class="w-full p-4 pr-12 rounded-xl bg-slate-950 border-2 border-amber-500/50 text-white text-lg md:text-xl font-mono font-bold focus:border-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-500/20 transition shadow-inner">
            <span class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-bold pointer-events-none">
              ↵ Enter
            </span>
          </div>

          <!-- Bàn phím ký hiệu toán học nhanh -->
          <div class="mt-3 flex flex-wrap items-center gap-1.5">
            <span class="text-[11px] text-slate-500 font-bold mr-1">Chèn nhanh:</span>
            <button type="button" onclick="app.insertAdvancedSymbol('-')" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-mono font-bold border border-slate-700 transition">-</button>
            <button type="button" onclick="app.insertAdvancedSymbol('/')" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-mono font-bold border border-slate-700 transition">/</button>
            <button type="button" onclick="app.insertAdvancedSymbol('.')" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-mono font-bold border border-slate-700 transition">.</button>
            <button type="button" onclick="app.insertAdvancedSymbol('√')" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-mono font-bold border border-slate-700 transition">√</button>
            <button type="button" onclick="app.insertAdvancedSymbol('π')" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-mono font-bold border border-slate-700 transition">π</button>
            <button type="button" onclick="app.insertAdvancedSymbol('backspace')" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-rose-300 font-bold border border-slate-700 transition">⌫ Xóa</button>
          </div>

          <!-- Nút Nộp Bài -->
          <div class="mt-5 flex gap-3">
            <button id="advanced-submit-btn" onclick="app.submitAdvancedAnswer()"
              class="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-black text-sm md:text-base shadow-xl shadow-orange-500/25 transition flex items-center justify-center gap-2">
              <span>Kiểm Tra Đáp Án</span>
              <span>➔</span>
            </button>
          </div>
        </div>

        <!-- Khung Lời Giải Chi Tiết & Phản Hồi (Hiển thị sau khi submit) -->
        <div id="advanced-feedback-box" class="hidden rounded-2xl p-5 md:p-6 mb-6 border transition-all"></div>

        <!-- Nút Câu Tiếp Theo (Hiển thị sau khi nộp bài) -->
        <div id="advanced-next-btn-box" class="hidden flex justify-end">
          <button onclick="app.nextAdvancedQuestion()"
            class="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm md:text-base shadow-xl shadow-blue-600/30 flex items-center gap-2 transform hover:-translate-y-0.5 transition">
            <span>Luyện Câu Tiếp Theo (Random Chống Trùng)</span>
            <span>➔</span>
          </button>
        </div>
      </div>
    `;

    setTimeout(() => {
      game.renderMath(container);
      const input = document.getElementById('advanced-input');
      if (input) {
        input.focus();
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            this.submitAdvancedAnswer();
          }
        });
      }
    }, 50);
  }

  toggleAdvancedHint() {
    const box = document.getElementById('advanced-hint-box');
    const txt = document.getElementById('hint-toggle-text');
    if (box) {
      if (box.classList.contains('hidden')) {
        box.classList.remove('hidden');
        if (txt) txt.innerText = 'Ẩn Gợi Ý';
      } else {
        box.classList.add('hidden');
        if (txt) txt.innerText = 'Xem Gợi Ý Phương Pháp Giải';
      }
    }
  }

  insertAdvancedSymbol(sym) {
    const input = document.getElementById('advanced-input');
    if (!input) return;
    if (sym === 'backspace') {
      input.value = input.value.slice(0, -1);
    } else {
      input.value += sym;
    }
    input.focus();
  }

  normalizeAdvancedAnswer(val) {
    if (val === undefined || val === null) return '';
    let s = String(val).trim().toLowerCase();
    s = s.replace(/,/g, '.');
    s = s.replace(/^[a-z]\s*=\s*/g, '');
    s = s.replace(/\s*(cm\^?2|cm2|cm3|cm\^?3|cm|km\/h|m\^?3|m3|m|học sinh|hs|cặp|nghiệm|giá trị|giờ|h|độ|°)$/g, '');
    return s.trim();
  }

  isAnswerMatch(userVal, correctVal, acceptableList = []) {
    const normUser = this.normalizeAdvancedAnswer(userVal);
    const normCorrect = this.normalizeAdvancedAnswer(correctVal);

    if (normUser === normCorrect) return true;

    // So khớp danh sách chấp nhận
    for (const acc of acceptableList) {
      if (normUser === this.normalizeAdvancedAnswer(acc)) {
        return true;
      }
    }

    // So khớp float (cho phép ví dụ: 0.5 và 1/2)
    try {
      let numUser = NaN;
      if (normUser.includes('/')) {
        const p = normUser.split('/');
        numUser = parseFloat(p[0]) / parseFloat(p[1]);
      } else {
        numUser = parseFloat(normUser);
      }

      let numCorrect = NaN;
      if (normCorrect.includes('/')) {
        const p = normCorrect.split('/');
        numCorrect = parseFloat(p[0]) / parseFloat(p[1]);
      } else {
        numCorrect = parseFloat(normCorrect);
      }

      if (!isNaN(numUser) && !isNaN(numCorrect) && Math.abs(numUser - numCorrect) < 0.001) {
        return true;
      }

      for (const acc of acceptableList) {
        const normAcc = this.normalizeAdvancedAnswer(acc);
        let numAcc = NaN;
        if (normAcc.includes('/')) {
          const p = normAcc.split('/');
          numAcc = parseFloat(p[0]) / parseFloat(p[1]);
        } else {
          numAcc = parseFloat(normAcc);
        }
        if (!isNaN(numUser) && !isNaN(numAcc) && Math.abs(numUser - numAcc) < 0.001) {
          return true;
        }
      }
    } catch (e) {}

    return false;
  }

  submitAdvancedAnswer() {
    const input = document.getElementById('advanced-input');
    if (!input) return;

    const userRaw = input.value.trim();
    if (!userRaw) {
      input.focus();
      input.classList.add('ring-4', 'ring-rose-500');
      setTimeout(() => input.classList.remove('ring-4', 'ring-rose-500'), 1000);
      return;
    }

    const q = this.activeAdvancedQuestion;
    if (!q) return;

    // Khóa input và nút submit
    input.disabled = true;
    const submitBtn = document.getElementById('advanced-submit-btn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
    }

    const isCorrect = this.isAnswerMatch(userRaw, q.correctAnswer, q.acceptableAnswers || []);
    storage.recordAdvancedAnswer(q.id, q.topicId, isCorrect);

    if (isCorrect) {
      storage.addExp(q.points || 25, (lvl) => this.showLevelUpModal(lvl));
      audio.playCorrect();
      if (window.confetti) {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      }
    } else {
      audio.playWrong();
    }

    this.updateHeaderStats();

    // Hiển thị khung Feedback và Lời giải chi tiết
    const fbBox = document.getElementById('advanced-feedback-box');
    const nextBtnBox = document.getElementById('advanced-next-btn-box');

    if (fbBox) {
      fbBox.classList.remove('hidden');
      if (isCorrect) {
        fbBox.className = 'rounded-2xl p-6 mb-6 bg-emerald-950/40 border-2 border-emerald-500/60 shadow-xl shadow-emerald-950/30 text-white';
        fbBox.innerHTML = `
          <div class="flex items-center gap-3 pb-3 border-b border-emerald-500/30 mb-4">
            <span class="text-3xl">🎉</span>
            <div>
              <h3 class="text-lg font-black text-emerald-400">CHÍNH XÁC! XUẤT SẮC!</h3>
              <p class="text-xs text-emerald-200">Bạn đã nhận được <strong>+${q.points || 25} EXP</strong> và <strong>+5 💗 Kim cương</strong>!</p>
            </div>
          </div>
          <div class="text-sm text-slate-200 font-semibold mb-3">
            Đáp số của bạn: <span class="font-mono text-emerald-300 font-extrabold text-base px-2 py-0.5 rounded bg-emerald-900/50 border border-emerald-500/40">${userRaw}</span>
          </div>
          <div class="prose prose-invert max-w-none text-xs md:text-sm text-slate-300 whitespace-pre-line leading-relaxed bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            ${q.explanation}
          </div>
        `;
      } else {
        fbBox.className = 'rounded-2xl p-6 mb-6 bg-rose-950/40 border-2 border-rose-500/60 shadow-xl shadow-rose-950/30 text-white';
        fbBox.innerHTML = `
          <div class="flex items-center gap-3 pb-3 border-b border-rose-500/30 mb-4">
            <span class="text-3xl">❌</span>
            <div>
              <h3 class="text-lg font-black text-rose-400">CHƯA CHÍNH XÁC</h3>
              <p class="text-xs text-rose-200">Đừng nản lòng! Hãy đọc kỹ lời giải từng bước để khắc phục bẫy sai nhé!</p>
            </div>
          </div>
          <div class="flex flex-wrap gap-4 text-xs md:text-sm mb-4">
            <div class="px-3 py-1.5 rounded-lg bg-rose-900/40 border border-rose-500/40 text-rose-200">
              Đáp số của bạn: <strong class="font-mono text-white">${userRaw}</strong>
            </div>
            <div class="px-3 py-1.5 rounded-lg bg-emerald-900/40 border border-emerald-500/40 text-emerald-200">
              Đáp số chính xác: <strong class="font-mono text-white">${q.correctAnswer}</strong>
            </div>
          </div>
          <div class="prose prose-invert max-w-none text-xs md:text-sm text-slate-300 whitespace-pre-line leading-relaxed bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            ${q.explanation}
          </div>
        `;
      }
      game.renderMath(fbBox);
    }

    if (nextBtnBox) {
      nextBtnBox.classList.remove('hidden');
    }
  }

  nextAdvancedQuestion() {
    const curId = this.activeAdvancedQuestion ? this.activeAdvancedQuestion.id : null;
    this.loadNextAdvancedQuestion(curId);
  }
"""

avatar_target = "  selectAvatar(icon) {"
if avatar_target in content:
    content = content.replace(avatar_target, methods_code + "\n  selectAvatar(icon) {", 1)
    print("BT Nâng Cao methods patched successfully!")
else:
    print("Error: selectAvatar not found")
    sys.exit(1)

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("js/app.js completely patched and saved successfully!")
