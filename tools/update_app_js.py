with open('js/app.js', 'r', encoding='utf-8') as f:
    code = f.read()

# Let's replace renderTopicsList, startTopicPractice, startAdvancedTopicPractice, startDailyPractice, renderTopicQuestion, getQuestionTheory
start_marker = "  // ==============================================================\n  // RENDER DANH SÁCH CHUYÊN ĐỀ GDPT 2018 (TOPICS)\n  // =============================================================="
end_marker = "  nextTopicQuestion() {"

idx_start = code.find(start_marker)
idx_end = code.find(end_marker)

print("idx_start:", idx_start, "idx_end:", idx_end)

new_block = '''  // ==============================================================
  // RENDER DANH SÁCH CHUYÊN ĐỀ GDPT 2018 & CHUYÊN ĐỀ NÂNG CAO (TOPICS)
  // ==============================================================
  renderTopicsList(activeSubTab = 'standard') {
    const container = document.getElementById('topics-content');
    if (!container) return;

    const allQs = storage.getAllQuestions();
    const reviewStats = storage.getSpacedReviewStats();
    const advTopics = typeof ADVANCED_TOPICS !== 'undefined' ? ADVANCED_TOPICS : [];

    container.innerHTML = `
      <div id="topic-container">
        <!-- Tiêu đề lớn -->
        <div class="text-center max-w-2xl mx-auto mb-6">
          <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold mb-2">
            📚 HỆ THỐNG ÔN LUYỆN TOÁN 9 CHUẨN & NÂNG CAO
          </div>
          <h2 class="text-2xl md:text-3xl font-black text-white">CHINH PHỤC TOÁN 9 THEO CHUYÊN ĐỀ</h2>
          <p class="text-slate-400 text-xs mt-2 leading-relaxed">
            Học chuẩn lý thuyết cốt lõi, khắc phục lỗi sai bằng phương pháp lặp lại ngắt quãng và bứt phá điểm 9-10 vào lớp 10!
          </p>

          <!-- Thanh chuyển đổi danh mục: Chuẩn - Nâng cao - Sổ tay lỗi sai -->
          <div class="flex flex-wrap justify-center gap-2 mt-5 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 max-w-xl mx-auto shadow-inner">
            <button onclick="app.renderTopicsList('standard')"
              class="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${activeSubTab === 'standard' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}">
              <span>📘</span><span>10 Chuyên Đề Chuẩn</span>
            </button>
            <button onclick="app.renderTopicsList('advanced')"
              class="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${activeSubTab === 'advanced' ? 'bg-gradient-to-r from-amber-600 to-rose-600 text-white shadow-lg shadow-orange-500/30' : 'text-slate-400 hover:text-white'}">
              <span>🔥</span><span>Chuyên Đề Nâng Cao (9+)</span>
            </button>
            <button onclick="app.renderTopicsList('review')"
              class="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${activeSubTab === 'review' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}">
              <span>🔁</span><span>Sổ Tay Lỗi Sai (${reviewStats.dueCount})</span>
            </button>
          </div>
        </div>

        <!-- Banner Luyện Tập Hằng Ngày (10 Câu - Lặp lại ngắt quãng) -->
        <div class="max-w-4xl mx-auto mb-8 rounded-3xl p-6 glass-card border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="text-2xl">📅</span>
              <h3 class="text-lg font-black text-white">Bài Luyện Tập Hằng Ngày (10 Câu Thông Minh)</h3>
              <span class="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-extrabold uppercase border border-amber-500/30">Lặp Lại Ngắt Quãng</span>
            </div>
            <p class="text-xs text-slate-300 leading-relaxed">
              Tự động chọn đúng 10 câu: ưu tiên các kiến thức bạn từng làm sai đến hạn ôn tập để khắc sâu bản chất lý thuyết, bổ sung câu ngẫu nhiên đa dạng.
            </p>
            <div class="flex items-center gap-3 text-xs pt-1">
              <span class="text-amber-400 font-bold flex items-center gap-1">
                <span>🔁</span> ${reviewStats.dueCount} câu sai đến hạn ôn
              </span>
              <span class="text-slate-500">•</span>
              <span class="text-emerald-400 font-bold flex items-center gap-1">
                <span>🧠</span> ${reviewStats.masteredCount} câu đã khắc sâu bản chất
              </span>
            </div>
          </div>
          <button onclick="app.startDailyPractice()" class="shrink-0 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-black text-sm shadow-xl shadow-orange-500/30 transition transform hover:-translate-y-0.5">
            Bắt Đầu 10 Câu Hôm Nay ➔
          </button>
        </div>

        ${activeSubTab === 'standard' ? `
          <!-- 1. DANH SÁCH 10 CHUYÊN ĐỀ CHUẨN GDPT 2018 -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            ${TOPICS.map(top => {
              const topQs = allQs.filter(q => q.topicId === top.id);
              const userProg = storage.profile.topicProgress[top.id] || { correct: 0, total: 0 };
              const percent = userProg.total > 0 ? Math.round((userProg.correct / userProg.total) * 100) : 0;

              return `
                <div onclick="app.startTopicPractice('${top.id}')"
                  class="rounded-3xl p-6 glass-card border ${top.borderColor} hover:scale-[1.02] cursor-pointer transition flex flex-col justify-between">
                  <div>
                    <div class="flex justify-between items-start mb-3">
                      <span class="w-12 h-12 rounded-2xl bg-gradient-to-r ${top.color} text-white font-bold flex items-center justify-center text-xl shadow-lg">
                        ${top.icon}
                      </span>
                      <span class="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        ${top.badge}
                      </span>
                    </div>

                    <h3 class="text-lg font-black text-white mt-2">${top.name}</h3>
                    <p class="text-xs text-slate-400 mt-2 leading-relaxed">${top.description}</p>
                  </div>

                  <div class="mt-6 pt-4 border-t border-slate-800">
                    <div class="flex justify-between text-xs font-bold mb-1">
                      <span class="text-slate-400">Tiến độ chuyên đề:</span>
                      <span class="text-cyan-400">${userProg.correct}/${topQs.length} câu (${percent}%)</span>
                    </div>
                    <div class="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div class="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full" style="width: ${percent}%"></div>
                    </div>

                    <button class="w-full mt-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-600 transition flex items-center justify-center gap-2">
                      <span>Luyện Tập Chuyên Đề</span>
                      <span>➔</span>
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        ` : activeSubTab === 'advanced' ? `
          <!-- 2. DANH SÁCH CÁC CHUYÊN ĐỀ NÂNG CAO (9 - 10 ĐIỂM) -->
          <div class="mb-4 flex items-center justify-between">
            <div class="text-sm font-bold text-amber-400 flex items-center gap-2">
              <span>🔥 CHUYÊN ĐỀ VẬN DỤNG CAO (DÀNH CHO ÔN THI 9-10 & THI CHUYÊN)</span>
            </div>
            <span class="text-xs text-slate-400">${advTopics.length} chủ đề nâng cao</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            ${advTopics.map(top => {
              const topQs = allQs.filter(q => q.topicId === top.id);
              return `
                <div onclick="app.startAdvancedTopicPractice('${top.id}')"
                  class="rounded-3xl p-6 glass-card border ${top.borderColor} hover:scale-[1.02] cursor-pointer transition flex flex-col justify-between bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
                  <div>
                    <div class="flex justify-between items-start mb-3">
                      <span class="w-12 h-12 rounded-2xl bg-gradient-to-r ${top.color} text-white font-black flex items-center justify-center text-xl shadow-lg">
                        ${top.icon}
                      </span>
                      <span class="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        ${top.badge}
                      </span>
                    </div>

                    <h3 class="text-lg font-black text-white mt-2">${top.name}</h3>
                    <p class="text-xs text-slate-300 mt-2 leading-relaxed">${top.description}</p>
                  </div>

                  <div class="mt-6 pt-4 border-t border-slate-800">
                    <div class="flex justify-between text-xs font-bold mb-3 text-slate-400">
                      <span>Số câu hỏi vận dụng cao:</span>
                      <span class="text-amber-400 font-extrabold">${topQs.length} câu</span>
                    </div>
                    <button class="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-black text-xs shadow-lg shadow-orange-500/25 transition flex items-center justify-center gap-2">
                      <span>Chinh Phục 9 - 10 Điểm</span>
                      <span>➔</span>
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        ` : `
          <!-- 3. SỔ TAY KHẮC PHỤC LỖI SAI (SPACED REPETITION LEITNER) -->
          <div class="max-w-4xl mx-auto space-y-6">
            <!-- 5 Hộp ghi nhớ Leitner -->
            <div class="p-6 rounded-3xl glass-card border border-slate-700/80">
              <div class="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                <div>
                  <h3 class="text-lg font-black text-white flex items-center gap-2">
                    <span>🧠</span><span>5 Cấp Độ Ghi Nhớ (Phương Pháp Lặp Lại Ngắt Quãng)</span>
                  </h3>
                  <p class="text-xs text-slate-400 mt-1">Khi bạn làm sai, câu hỏi sẽ được đưa vào Hộp 1 để ôn ngay. Mỗi lần trả lời đúng khi ôn tập, câu hỏi sẽ tiến lên hộp tiếp theo!</p>
                </div>
              </div>

              <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div class="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-center">
                  <div class="text-[10px] font-bold text-rose-400 uppercase">Hộp 1 (Cần ôn ngay)</div>
                  <div class="text-2xl font-black text-rose-300 my-1">${reviewStats.boxes[0]} câu</div>
                  <div class="text-[10px] text-slate-400">Ôn hôm nay</div>
                </div>
                <div class="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-center">
                  <div class="text-[10px] font-bold text-amber-400 uppercase">Hộp 2 (Củng cố)</div>
                  <div class="text-2xl font-black text-amber-300 my-1">${reviewStats.boxes[1]} câu</div>
                  <div class="text-[10px] text-slate-400">Cách 1 ngày</div>
                </div>
                <div class="p-3.5 rounded-2xl bg-blue-950/40 border border-blue-500/40 text-center">
                  <div class="text-[10px] font-bold text-blue-400 uppercase">Hộp 3 (Ghi nhớ)</div>
                  <div class="text-2xl font-black text-blue-300 my-1">${reviewStats.boxes[2]} câu</div>
                  <div class="text-[10px] text-slate-400">Cách 3 ngày</div>
                </div>
                <div class="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/40 text-center">
                  <div class="text-[10px] font-bold text-purple-400 uppercase">Hộp 4 (Vững chắc)</div>
                  <div class="text-2xl font-black text-purple-300 my-1">${reviewStats.boxes[3]} câu</div>
                  <div class="text-[10px] text-slate-400">Cách 7 ngày</div>
                </div>
                <div class="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center">
                  <div class="text-[10px] font-bold text-emerald-400 uppercase">Hộp 5 (Thành thạo)</div>
                  <div class="text-2xl font-black text-emerald-300 my-1">${reviewStats.boxes[4]} câu</div>
                  <div class="text-[10px] text-slate-400">Khắc sâu bản chất</div>
                </div>
              </div>
            </div>

            <!-- Danh sách câu sai đến hạn -->
            <div class="p-6 rounded-3xl glass-card border border-slate-700/80">
              <div class="flex items-center justify-between mb-4">
                <h4 class="font-bold text-white text-base">Câu hỏi đến hạn ôn tập (${reviewStats.dueCount})</h4>
                ${reviewStats.dueCount > 0 ? `
                  <button onclick="app.startDailyPractice()" class="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow">
                    Ôn ngay tất cả ➔
                  </button>
                ` : ''}
              </div>

              ${reviewStats.dueCount === 0 ? `
                <div class="text-center py-8 text-slate-400 text-xs">
                  🎉 Tuyệt vời! Hiện tại bạn không có câu hỏi nào bị tồn đọng cần ôn lại. Hãy làm bài luyện tập hàng ngày hoặc thử sức chuyên đề nâng cao!
                </div>
              ` : `
                <div class="space-y-3">
                  ${storage.getDueReviewQuestions().slice(0, 5).map((item, idx) => `
                    <div class="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex justify-between items-center gap-4">
                      <div class="space-y-1">
                        <div class="flex items-center gap-2">
                          <span class="text-xs font-bold text-rose-400">Lỗi sai lần ${item.wrongCount}</span>
                          <span class="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">Hộp ${item.box + 1}</span>
                        </div>
                        <div class="text-sm font-medium text-slate-200 line-clamp-1">${item.question.content}</div>
                      </div>
                      <button onclick="app.startDailyPractice()" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/40 text-xs font-bold shrink-0">
                        Ôn lại ➔
                      </button>
                    </div>
                  `).join('')}
                </div>
              `}
            </div>
          </div>
        `}
      </div>
    `;
    game.renderMath(container);
  }

  // Bắt đầu luyện tập chuyên đề chuẩn
  startTopicPractice(topicId) {
    const topic = TOPICS.find(t => t.id === topicId) || (typeof ADVANCED_TOPICS !== 'undefined' ? ADVANCED_TOPICS.find(t => t.id === topicId) : null);
    if (!topic) return;

    this.isDailyPractice = false;
    this.isAdvancedPractice = false;
    this.activeTopic = topic;
    const allQs = storage.getAllQuestions();
    const rawQs = allQs.filter(q => q.topicId === topicId);

    if (rawQs.length === 0) {
      alert('Chuyên đề này đang được cập nhật thêm câu hỏi!');
      return;
    }

    // Luôn xáo trộn thứ tự các lựa chọn đáp án để không bao giờ bị full A hay full B, C, D
    this.activeTopicQuestions = rawQs.map(q => typeof shuffleQuestionOptions === 'function' ? shuffleQuestionOptions(q) : q);
    this.topicQuestionIndex = 0;
    this.renderTopicQuestion();
    audio.playClick();
  }

  // Bắt đầu luyện tập chuyên đề nâng cao
  startAdvancedTopicPractice(topicId) {
    const advTopics = typeof ADVANCED_TOPICS !== 'undefined' ? ADVANCED_TOPICS : [];
    const topic = advTopics.find(item => item.id === topicId) || TOPICS.find(item => item.id === topicId);
    if (!topic) return;

    const allQs = storage.getAllQuestions();
    const advancedQuestions = allQs.filter(
      q => q.topicId === topicId || (q.topicId.startsWith('nc_') && q.topicId === topicId) || q.difficulty === 'advanced'
    );

    if (advancedQuestions.length === 0) {
      alert('Chủ đề nâng cao này đang được cập nhật thêm câu hỏi. Hãy thử các chủ đề BĐT, Vi-et, Hệ phương trình nâng cao!');
      return;
    }

    this.isDailyPractice = false;
    this.isAdvancedPractice = true;
    this.activeTopic = { ...topic, name: `${topic.name}`, icon: '🔥' };
    
    // Xáo trộn ngẫu nhiên câu hỏi và xáo trộn vị trí đáp án (không bao giờ full A)
    this.activeTopicQuestions = advancedQuestions
      .map(q => typeof shuffleQuestionOptions === 'function' ? shuffleQuestionOptions(q) : q)
      .sort(() => 0.5 - Math.random());

    this.topicQuestionIndex = 0;
    this.renderTopicQuestion();
    audio.playClick();
  }

  // Bắt đầu luyện tập hằng ngày 10 câu theo phương pháp lặp lại ngắt quãng
  startDailyPractice() {
    if (this.currentTab !== 'topics') {
      this.showTab('topics');
    }

    const allQuestions = storage.getAllQuestions();
    if (allQuestions.length < 10) {
      alert('Cần ít nhất 10 câu hỏi để tạo lượt luyện hằng ngày.');
      return;
    }

    // Lấy đúng 10 câu ưu tiên kiến thức từng sai đến hạn ôn tập (Spaced Repetition)
    const dailyQuestions = storage.getDaily10Questions();

    this.isDailyPractice = true;
    this.isAdvancedPractice = false;
    this.dailyCorrectCount = 0;
    this.activeTopic = { name: 'Luyện 10 Câu Hằng Ngày · Lặp Lại Ngắt Quãng', icon: '📅' };
    this.activeTopicQuestions = dailyQuestions;
    this.topicQuestionIndex = 0;
    this.renderTopicQuestion();
    audio.playClick();
  }

  renderTopicQuestion() {
    const container = document.getElementById('topic-container');
    if (!container) return;

    const q = this.activeTopicQuestions[this.topicQuestionIndex];
    const total = this.activeTopicQuestions.length;
    const reviewRecord = (storage.profile.questionReview || {})[q.id];

    container.innerHTML = `
      <div class="max-w-2xl mx-auto rounded-3xl p-6 md:p-8 glass-panel border border-slate-700 shadow-2xl">
        <!-- Header bài tập -->
        <div class="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div class="flex items-center gap-3">
            <span class="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500 text-blue-300 font-bold flex items-center justify-center text-sm">
              ${this.activeTopic.icon || '📝'}
            </span>
            <div>
              <div class="text-xs text-slate-400 font-semibold uppercase">${this.activeTopic.name}</div>
              <h3 class="text-base font-bold text-white">Câu ${this.topicQuestionIndex + 1} / ${total}</h3>
              ${this.isDailyPractice && reviewRecord ? `<span class="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase">🔁 CÂU HỎI CỦNG CỐ · HỘP ${reviewRecord.box + 1}/5</span>` : ''}
              ${this.isAdvancedPractice ? '<span class="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-black uppercase">🔥 THỬ THÁCH 9-10 ĐIỂM</span>' : ''}
            </div>
          </div>
          <button onclick="app.renderTopicsList(${this.isAdvancedPractice ? "'advanced'" : "'standard'"})" class="px-3 py-1.5 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700">
            Trở lại danh sách ✖
          </button>
        </div>

        <!-- Nội dung câu hỏi -->
        <div class="text-base md:text-lg font-semibold text-slate-100 mb-6 leading-relaxed">
          ${q.content}
        </div>

        <!-- 4 Lựa chọn ngẫu nhiên -->
        <div class="space-y-3" id="topic-opts">
          ${q.options.map((opt, idx) => `
            <button onclick="app.handleTopicAnswer(${idx})" id="topic-opt-${idx}"
              class="option-btn w-full text-left p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm md:text-base font-medium flex items-center gap-3 transition">
              <span class="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center font-bold text-amber-400 shrink-0 text-sm">
                ${['A', 'B', 'C', 'D'][idx]}
              </span>
              <span class="flex-1">${opt}</span>
            </button>
          `).join('')}
        </div>

        <!-- Khung giải thích chi tiết, bản chất lý thuyết sau khi trả lời -->
        <div id="topic-explanation" class="hidden mt-6 p-5 rounded-2xl text-sm border space-y-3"></div>

        <!-- Nút câu tiếp theo -->
        <div id="topic-next-btn-box" class="hidden mt-6 flex justify-end">
          <button onclick="app.nextTopicQuestion()" class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-lg">
            Câu Tiếp Theo ➔
          </button>
        </div>
      </div>
    `;

    game.renderMath(container);
  }

  handleTopicAnswer(chosenIdx) {
    const q = this.activeTopicQuestions[this.topicQuestionIndex];
    const isCorrect = chosenIdx === q.correctAnswer;
    if (this.isDailyPractice && isCorrect) this.dailyCorrectCount++;
    
    // Ghi nhận vào thuật toán Lặp lại ngắt quãng (Spaced Repetition)
    const reviewPlan = storage.recordSpacedReview(q.id, isCorrect, q);
    const expBox = document.getElementById('topic-explanation');
    const nextBtnBox = document.getElementById('topic-next-btn-box');

    // Khóa các nút lựa chọn
    for (let i = 0; i < 4; i++) {
      const b = document.getElementById(`topic-opt-${i}`);
      if (b) b.disabled = true;
    }

    const selectedBtn = document.getElementById(`topic-opt-${chosenIdx}`);
    const correctBtn = document.getElementById(`topic-opt-${q.correctAnswer}`);

    storage.recordAnswer(q.id, q.topicId, isCorrect, q);

    if (isCorrect) {
      audio.playCorrect();
      if (selectedBtn) selectedBtn.classList.add('selected-correct');
      storage.addExp(q.points || 15, (newLv) => app.showLevelUpModal(newLv));
      storage.checkAchievements((ach) => app.showAchievementNotification(ach));

      if (expBox) {
        expBox.className = 'mt-6 p-5 rounded-2xl text-sm border bg-emerald-950/70 border-emerald-500/40 text-emerald-200 block space-y-3';
        expBox.innerHTML = `
          <div class="font-bold text-emerald-400 flex items-center justify-between">
            <span class="flex items-center gap-2">🎉 CHÍNH XÁC! (+${q.points || 15} EXP)</span>
            ${reviewPlan ? `<span class="text-xs px-2.5 py-0.5 rounded-full bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 font-bold">🧠 Tiến lên Hộp ${reviewPlan.box + 1} (Ôn lại sau ${reviewPlan.intervalDays} ngày)</span>` : ''}
          </div>
          
          <div class="p-3.5 rounded-xl bg-slate-900/80 border border-cyan-500/30 text-xs">
            <strong class="text-cyan-300 flex items-center gap-1.5 mb-1 font-bold">
              <span>🧠 BẢN CHẤT LÝ THUYẾT CỐT LÕI:</span>
            </strong>
            <div class="text-slate-200 leading-relaxed">${this.getQuestionTheory(q)}</div>
          </div>

          <div class="leading-relaxed text-slate-300 text-xs bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
            <strong class="text-amber-300 block mb-1">📝 Lời giải chi tiết:</strong>
            ${q.explanation.replace(/\\n/g, '<br>')}
          </div>
        `;
      }
    } else {
      audio.playWrong();
      if (selectedBtn) selectedBtn.classList.add('selected-wrong');
      if (correctBtn) correctBtn.classList.add('selected-correct');

      if (expBox) {
        expBox.className = 'mt-6 p-5 rounded-2xl text-sm border bg-rose-950/70 border-rose-500/40 text-rose-200 block space-y-3';
        expBox.innerHTML = `
          <div class="font-bold text-rose-400 flex items-center justify-between">
            <span>❌ RẤT TIẾC, CHƯA CHÍNH XÁC!</span>
            <span class="text-xs px-2.5 py-0.5 rounded-full bg-rose-900/80 border border-rose-500/40 text-rose-300 font-bold">🔁 Đã lưu vào Hộp 1 (Ôn lại hôm nay)</span>
          </div>

          <div class="text-xs text-slate-200 font-medium">
            <strong>Đáp án chính xác:</strong> <span class="text-emerald-400 font-bold">${['A', 'B', 'C', 'D'][q.correctAnswer]}. ${q.options[q.correctAnswer]}</span>
          </div>

          <div class="p-3.5 rounded-xl bg-slate-900/80 border border-cyan-500/30 text-xs">
            <strong class="text-cyan-300 flex items-center gap-1.5 mb-1 font-bold">
              <span>🧠 BẢN CHẤT LÝ THUYẾT & NGUYÊN TẮC:</span>
            </strong>
            <div class="text-slate-200 leading-relaxed">${this.getQuestionTheory(q)}</div>
          </div>

          <div class="leading-relaxed text-slate-300 text-xs bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
            <strong class="text-amber-300 block mb-1">📝 Lời giải chi tiết từng bước & Phân tích bẫy sai:</strong>
            ${q.explanation.replace(/\\n/g, '<br>')}
          </div>
        `;
      }
    }

    if (nextBtnBox) nextBtnBox.classList.remove('hidden');
    game.renderMath(expBox);
    this.updateHeaderStats();
  }

  getQuestionTheory(question) {
    const theories = {
      // Chuyên đề cơ bản
      can_thuc: 'Căn bậc hai $\\\\sqrt{A}$ có nghĩa khi và chỉ khi $A \\\\ge 0$. Hằng đẳng thức cốt lõi: $\\\\sqrt{A^2} = |A| = A$ khi $A \\\\ge 0$, và bằng $-A$ khi $A < 0$. Khi khử mẫu/trục căn thức, luôn nhân cả tử và mẫu với lượng liên hợp $(\\\\sqrt{a} \\\\mp \\\\sqrt{b})$.',
      he_phuong_trinh: 'Nghiệm $(x; y)$ của hệ phương trình bậc nhất hai ẩn phải thỏa mãn đồng thời cả hai phương trình. Hai phương pháp cốt lõi: Thế (rút 1 ẩn theo ẩn kia) và Cộng đại số (nhân hệ số bằng nhau hoặc đối nhau rồi trừ hoặc cộng hai vế).',
      bat_phuong_trinh: 'Bất phương trình: Nhân/chia hai vế với số dương thì giữ nguyên chiều; nhân/chia với số ÂM thì BẮT BUỘC ĐỔI CHIỀU. BĐT AM-GM cho hai số không âm: $a + b \\\\ge 2\\\\sqrt{ab}$ (dấu "=" khi $a = b$).',
      he_thuc_luong: 'Tam giác vuông đường cao $h$: $b^2 = a \\\\cdot b'$, $c^2 = a \\\\cdot c'$, $h^2 = b' \\\\cdot c'$, $bc = ah$, $\\\\frac{1}{h^2} = \\\\frac{1}{b^2} + \\\\frac{1}{c^2}$. Tỉ số lượng giác: $\\\\sin = \\\\frac{\\\\text{đối}}{\\\\text{huyền}}$, $\\\\cos = \\\\frac{\\\\text{kề}}{\\\\text{huyền}}$, $\\\\tan = \\\\frac{\\\\text{đối}}{\\\\text{kề}}$.',
      duong_tron: 'Tiếp tuyến luôn vuông góc với bán kính tại tiếp điểm. Hai tiếp tuyến cắt nhau tại $A$: $AB = AC$, $AO$ là phân giác góc $BAC$ và là đường trung trực của đoạn nối hai tiếp điểm $BC$.',
      ham_so_bac_hai: 'Hàm số $y = ax^2$ ($a \\\\ne 0$): Với $a > 0$, đồng biến khi $x > 0$, nghịch biến khi $x < 0$, đáy tại gốc $O$. Phương trình $ax^2 + bx + c = 0$: $\\\\Delta = b^2 - 4ac$. Nghiệm phân biệt khi $\\\\Delta > 0$, nghiệm kép khi $\\\\Delta = 0$, vô nghiệm khi $\\\\Delta < 0$.',
      he_thuc_viet: 'Nếu phương trình có nghiệm: Tổng $S = x_1 + x_2 = -\\\\frac{b}{a}$, Tích $P = x_1 x_2 = \\\\frac{c}{a}$. Các biểu thức đối xứng quen thuộc: $x_1^2 + x_2^2 = S^2 - 2P$; $(x_1 - x_2)^2 = S^2 - 4P$; $\\\\frac{1}{x_1} + \\\\frac{1}{x_2} = \\\\frac{S}{P}$.',
      goc_duong_tron: 'Góc ở tâm = sđ cung bị chắn; Góc nội tiếp = $\\\\frac{1}{2}$ sđ cung bị chắn. Góc nội tiếp chắn nửa đường tròn luôn bằng $90^\\\\circ$. Tứ giác nội tiếp: Tổng hai góc đối diện bằng $180^\\\\circ$ hoặc hai đỉnh kề cùng nhìn một cạnh dưới hai góc bằng nhau.',
      hinh_khong_gian: 'Hình trụ: $S_{xq} = 2\\\\pi rh$, $V = \\\\pi r^2 h$. Hình nón: $S_{xq} = \\\\pi rl$, $V = \\\\frac{1}{3}\\\\pi r^2 h$ ($l^2 = r^2 + h^2$). Hình cầu: $S = 4\\\\pi R^2$, $V = \\\\frac{4}{3}\\\\pi R^3$.',
      xac_suat_thong_ke: 'Xác suất biến cố = Số kết quả thuận lợi chia cho Tổng số kết quả có thể xảy ra. Tần số tương đối $f = \\\\frac{m}{N} \\\\times 100\\\\%$.',

      // Chuyên đề nâng cao (Vận dụng cao 9+)
      nc_bdt: 'Bất đẳng thức Cauchy: $x + y \\\\ge 2\\\\sqrt{xy}$ với $x,y \\\\ge 0$. Kỹ thuật chọn điểm rơi: Dự đoán dấu "=" xảy ra khi các biến bằng bao nhiêu, sau đó tách ghép hệ số phù hợp. BĐT Cauchy-Schwarz dạng Engel: $\\\\frac{x_1^2}{a_1} + \\\\frac{x_2^2}{a_2} \\\\ge \\\\frac{(x_1+x_2)^2}{a_1+a_2}$.',
      nc_viet: 'Định lý Vi-ét nâng cao: Khi gặp biểu thức không đối xứng như $x_1^2 + 2x_2 = k$, ta sử dụng chính phương trình ban đầu $x_1^2 = (2m+1)x_1 - ...$ để hạ bậc $x_1^2$ về bậc nhất, sau đó kết hợp với hệ thức $x_1 + x_2 = S$.',
      nc_he_pt: 'Hệ đối xứng loại 1: Đặt $S = x + y, P = xy$ ($S^2 \\\\ge 4P$). Hệ đối xứng loại 2: Lấy PT(1) trừ PT(2) theo vế để xuất hiện nhân tử chung $(x - y)$. Phương trình vô tỷ: Đặt ẩn phụ $t = \\\\sqrt{A} \\\\ge 0$ hoặc nhân liên hợp trục căn thức.',
      nc_rut_gon: 'Dạng "Tìm x nguyên để P nguyên": Tách $P = \\\\text{Đa thức} + \\\\frac{k}{\\\\text{Mẫu}}$, mẫu phải thuộc tập ước số của $k$ (và $x$ phải là số chính phương). Dạng Min/Max: Chia tử cho mẫu hoặc đưa về bình phương.',
      nc_hinh_hoc: 'Điểm cố định: Gom biểu thức theo tham số $m \\\\cdot A + B = 0 \\\\Rightarrow A = 0$ và $B = 0$. Cực trị hình học: Bất đẳng thức tam giác, khoảng cách từ điểm trên đường tròn đến đường kính lớn nhất bằng bán kính $R$.',
      nc_thuc_te_so_hoc: 'Bài toán tối ưu chi phí: Lập hàm $C(x) = ax + \\\\frac{b}{x} \\\\ge 2\\\\sqrt{ab}$ (đạt min khi $ax = \\\\frac{b}{x}$). Phương trình nghiệm nguyên: Phân tích thành phương trình tích $(ax+b)(cy+d) = k$ rồi lập bảng xét các ước nguyên của $k$.'
    };
    return theories[question.topicId] || 'Đọc kỹ giả thiết, xác định đúng công thức nền tảng và kiểm tra điều kiện xác định trước khi tính toán.';
  }

'''

updated_code = code[:idx_start] + new_block + code[idx_end:]

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(updated_code)

print("Updated js/app.js successfully!")
