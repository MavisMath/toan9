// ================================================================
// LOGIC CÁC CHẾ ĐỘ CHƠI & ĐIỀU HƯỚNG GAME
// ================================================================

class GameEngine {
  constructor() {
    this.currentMode = 'home';
    this.activeQuestion = null;
    this.activeQuestionsList = [];
    this.currentIndex = 0;
    this.score = 0;
    this.combo = 0;
    this.timer = null;
    this.timeLeft = 60;
    this.isAnswering = false;

    // Trạng thái Leo Tháp
    this.currentFloor = 1;
    this.bossMaxHp = 100;
    this.bossHp = 100;
    this.playerHp = 3;

    // Trạng thái 1v1 PvP
    this.pvp = {
      p1Score: 0,
      p2Score: 0,
      targetScore: 5,
      currentQ: null,
      locked: false
    };

    // Trạng thái Đề thi
    this.exam = {
      data: null,
      answers: {},
      timeLeft: 0,
      timer: null
    };
  }

  // Khởi động KaTeX hiển thị công thức toán
  renderMath(element = document.body) {
    if (window.renderMathInElement) {
      try {
        renderMathInElement(element, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false },
            { left: '\\(', right: '\\)', display: false },
            { left: '\\[', right: '\\]', display: true }
          ],
          throwOnError: false
        });
      } catch (e) {
        console.warn('Lỗi hiển thị KaTeX:', e);
      }
    }
  }

  // ==============================================================
  // 1. CHẾ ĐỘ: LEO THÁP TRI THỨC (BOSS BATTLE)
  // ==============================================================
  startTowerFloor(floorNum) {
    if (!storage.isLoggedIn()) {
      app.promptLoginForAction({
        type: 'towerFloor',
        floorNum,
        message: '🔒 Bạn cần đăng nhập hoặc tạo tài khoản để khiêu chiến Leo Tháp Tri Thức!'
      });
      return;
    }

    const floor = TOWER_FLOORS.find(f => f.floor === floorNum);
    if (!floor) return;

    this.currentFloor = floorNum;
    this.bossMaxHp = floor.bossHp;
    this.bossHp = floor.bossHp;
    this.playerHp = 3;
    this.combo = 0;

    // Thu thập câu hỏi cho tầng này
    const allQs = storage.getAllQuestions();
    let floorQs = allQs.filter(q => floor.questions.includes(q.id));
    if (floorQs.length < 3) {
      floorQs = allQs.sort(() => 0.5 - Math.random()).slice(0, 5);
    }
    this.activeQuestionsList = [...floorQs].sort(() => 0.5 - Math.random());
    this.currentIndex = 0;

    this.renderTowerUI();
    this.loadNextTowerQuestion();
    audio.playClick();
  }

  renderTowerUI() {
    const floor = TOWER_FLOORS.find(f => f.floor === this.currentFloor);
    const container = document.getElementById('tower-arena');
    if (!container) return;

    container.innerHTML = `
      <div class="relative rounded-3xl p-6 glass-panel border border-slate-700/60 overflow-hidden shadow-2xl bg-gradient-to-b ${floor.bgGradient}">
        <!-- Header tầng & Nút thoát -->
        <div class="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
          <div class="flex items-center gap-3">
            <span class="text-3xl">${floor.bossAvatar}</span>
            <div>
              <div class="text-xs uppercase font-bold tracking-wider text-amber-400">Tháp Tri Thức Toán 9</div>
              <h2 class="text-xl md:text-2xl font-black text-white">${floor.name}</h2>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <!-- Máu học sinh (Hearts) -->
            <div class="flex items-center gap-1 bg-black/40 px-3 py-1.5 rounded-full border border-rose-500/30">
              <span class="text-sm text-slate-300 font-semibold mr-1">Mạng:</span>
              <span id="player-hearts" class="flex gap-1 text-lg">
                ${'❤️'.repeat(this.playerHp)}${'🖤'.repeat(3 - this.playerHp)}
              </span>
            </div>
            <button onclick="game.exitToHome()" class="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 border border-slate-600 transition">
              ✖ Rút lui
            </button>
          </div>
        </div>

        <!-- Khu vực Boss & Lời thoại -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-center my-6">
          <div class="md:col-span-1 flex flex-col items-center text-center">
            <div id="boss-sprite" class="w-28 h-28 md:w-36 md:h-36 rounded-full bg-slate-900/80 border-4 border-amber-500/50 flex items-center justify-center text-6xl md:text-7xl shadow-2xl animate-float">
              ${floor.bossAvatar}
            </div>
            <h3 class="mt-3 font-bold text-lg text-amber-300">${floor.boss}</h3>
            <p class="text-xs text-slate-400 max-w-xs mt-1 italic">"${floor.dialogue}"</p>
          </div>

          <!-- Thanh máu Boss & Thông tin -->
          <div class="md:col-span-2 space-y-4">
            <div>
              <div class="flex justify-between items-center text-sm font-bold mb-1">
                <span class="text-rose-400 flex items-center gap-1">
                  <span>⚔️ Sinh Lực Trùm:</span>
                  <span id="boss-hp-text">${this.bossHp}/${this.bossMaxHp} HP</span>
                </span>
                <span class="text-xs text-amber-400">Phần thưởng: +${floor.rewardExp} EXP ⭐</span>
              </div>
              <div class="w-full bg-slate-900/90 rounded-full h-5 p-0.5 border border-slate-700 overflow-hidden shadow-inner">
                <div id="boss-hp-bar" class="bg-gradient-to-r from-rose-600 to-amber-500 h-full rounded-full transition-all duration-300 shadow-lg" style="width: 100%"></div>
              </div>
            </div>

            <!-- Vùng hiển thị câu đố chiến đấu -->
            <div id="tower-question-box" class="p-5 rounded-2xl bg-slate-900/80 border border-slate-700/80 min-h-[220px]">
              <!-- Nội dung câu hỏi sẽ load ở đây -->
            </div>
          </div>
        </div>
      </div>
    `;
    this.renderMath(container);
  }

  loadNextTowerQuestion() {
    if (this.currentIndex >= this.activeQuestionsList.length) {
      // Xáo lại câu hỏi nếu chưa hết máu boss
      this.activeQuestionsList.sort(() => 0.5 - Math.random());
      this.currentIndex = 0;
    }

    // Xáo trộn thứ tự đáp án để tránh đáp án đúng luôn ở vị trí A
    const qOriginal = this.activeQuestionsList[this.currentIndex];
    const indices = [0, 1, 2, 3];
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    const q = {
      ...qOriginal,
      options: indices.map(i => qOriginal.options[i]),
      correctAnswer: indices.indexOf(qOriginal.correctAnswer)
    };
    this.activeQuestion = q;
    this.isAnswering = false;

    const box = document.getElementById('tower-question-box');
    if (!box) return;

    box.innerHTML = `
      <div class="space-y-4">
        <div class="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
          <span class="font-bold text-cyan-400">Câu hỏi thử thách số ${this.currentIndex + 1}</span>
          <span class="bg-blue-900/50 text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-700/50">${q.title}</span>
        </div>
        
        <div class="text-base md:text-lg font-medium text-slate-100 py-1" id="q-content">
          ${q.content}
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2" id="q-options">
          ${q.options.map((opt, idx) => `
            <button onclick="game.handleTowerAnswer(${idx})" id="opt-btn-${idx}"
              class="option-btn text-left p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/90 border border-slate-700 text-slate-200 text-sm md:text-base font-medium flex items-start gap-2.5 shadow-sm">
              <span class="w-6 h-6 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-xs font-bold text-amber-400 shrink-0">
                ${['A', 'B', 'C', 'D'][idx]}
              </span>
              <span class="flex-1">${opt}</span>
            </button>
          `).join('')}
        </div>

        <div id="tower-feedback" class="hidden mt-4 p-4 rounded-xl text-sm border"></div>
      </div>
    `;

    this.renderMath(box);
  }

  handleTowerAnswer(chosenIdx) {
    if (this.isAnswering) return;
    this.isAnswering = true;

    const q = this.activeQuestion;
    const isCorrect = chosenIdx === q.correctAnswer;
    const feedbackBox = document.getElementById('tower-feedback');
    const selectedBtn = document.getElementById(`opt-btn-${chosenIdx}`);
    const correctBtn = document.getElementById(`opt-btn-${q.correctAnswer}`);

    // Ghi nhận trả lời
    storage.recordAnswer(q.id, q.topicId, isCorrect);

    if (isCorrect) {
      // ĐÚNG: Gây sát thương lên Boss
      audio.playCorrect();
      audio.playBossHit();
      this.combo++;
      if (this.combo >= 2) audio.playCombo(this.combo);

      if (selectedBtn) selectedBtn.classList.add('selected-correct');

      const damage = Math.ceil(this.bossMaxHp / 3); // 3 câu đúng là hạ gục boss
      this.bossHp = Math.max(0, this.bossHp - damage);

      // Cập nhật thanh máu boss
      const hpPercent = (this.bossHp / this.bossMaxHp) * 100;
      const hpBar = document.getElementById('boss-hp-bar');
      const hpText = document.getElementById('boss-hp-text');
      if (hpBar) hpBar.style.width = `${hpPercent}%`;
      if (hpText) hpText.innerText = `${this.bossHp}/${this.bossMaxHp} HP (-${damage} HP)`;

      // Hiệu ứng boss rung chuyển
      const bossSprite = document.getElementById('boss-sprite');
      if (bossSprite) {
        bossSprite.classList.add('boss-hit-animation');
        setTimeout(() => bossSprite.classList.remove('boss-hit-animation'), 400);
      }

      // Thưởng EXP
      storage.addExp(q.points || 15, (newLv) => {
        app.showLevelUpModal(newLv);
      });
      storage.checkAchievements((ach) => app.showAchievementNotification(ach));

      // Hiển thị phản hồi tích cực
      if (feedbackBox) {
        feedbackBox.className = 'mt-4 p-4 rounded-xl text-sm border bg-emerald-950/70 border-emerald-500/50 text-emerald-200 block';
        feedbackBox.innerHTML = `
          <div class="font-bold flex items-center gap-2 text-emerald-400">
            <span>🎉 TUYỆT VỜI! GÂY ${damage} SÁT THƯƠNG LÊN TRÙM!</span>
            ${this.combo >= 2 ? `<span class="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded text-xs border border-amber-500/30 font-extrabold">🔥 COMBO x${this.combo}</span>` : ''}
          </div>
          <div class="mt-2 text-xs text-slate-300 leading-relaxed">${q.explanation.replace(/\n/g, '<br>')}</div>
        `;
        this.renderMath(feedbackBox);
      }

      // Kiểm tra xem Boss đã bị hạ gục chưa
      if (this.bossHp <= 0) {
        setTimeout(() => this.handleBossDefeated(), 1200);
        return;
      }
    } else {
      // SAI: Trừ 1 tim người chơi
      audio.playWrong();
      this.combo = 0;
      this.playerHp--;

      if (selectedBtn) selectedBtn.classList.add('selected-wrong');
      if (correctBtn) correctBtn.classList.add('selected-correct');

      const heartsElem = document.getElementById('player-hearts');
      if (heartsElem) {
        heartsElem.innerHTML = `${'❤️'.repeat(Math.max(0, this.playerHp))}${'🖤'.repeat(3 - Math.max(0, this.playerHp))}`;
      }

      if (feedbackBox) {
        feedbackBox.className = 'mt-4 p-4 rounded-xl text-sm border bg-rose-950/70 border-rose-500/50 text-rose-200 block';
        feedbackBox.innerHTML = `
          <div class="font-bold text-rose-400 flex items-center gap-2">
            <span>💥 TRẢ LỜI CHƯA CHÍNH XÁC! (Mất 1 mạng)</span>
          </div>
          <div class="mt-2 text-xs text-slate-300 leading-relaxed font-sans">
            <strong>Đáp án đúng:</strong> ${['A', 'B', 'C', 'D'][q.correctAnswer]}. ${q.options[q.correctAnswer]}<br>
            <strong>Lời giải chi tiết:</strong><br>
            ${q.explanation.replace(/\n/g, '<br>')}
          </div>
        `;
        this.renderMath(feedbackBox);
      }

      // Nếu hết tim -> Thất bại
      if (this.playerHp <= 0) {
        setTimeout(() => this.handlePlayerDefeated(), 1400);
        return;
      }
    }

    // Chuyển sang câu tiếp theo sau 2 giây
    setTimeout(() => {
      this.currentIndex++;
      this.loadNextTowerQuestion();
    }, 2200);
  }

  // Khi hạ gục Boss thành công
  handleBossDefeated() {
    audio.playVictory();
    if (window.confetti) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }

    const floor = TOWER_FLOORS.find(f => f.floor === this.currentFloor);
    storage.unlockNextFloor(this.currentFloor);
    storage.addExp(floor.rewardExp, (newLv) => app.showLevelUpModal(newLv));
    storage.checkAchievements((ach) => app.showAchievementNotification(ach));

    const arena = document.getElementById('tower-arena');
    if (!arena) return;

    arena.innerHTML = `
      <div class="rounded-3xl p-8 glass-panel border border-amber-500/50 text-center max-w-lg mx-auto shadow-2xl animate-pop-in">
        <div class="text-7xl mb-4 animate-float">🏆</div>
        <div class="text-xs font-bold text-amber-400 uppercase tracking-widest">Chiến Thắng Vang Dội</div>
        <h2 class="text-3xl font-black text-white mt-1">ĐÃ ĐÁNH BẠI ${floor.boss.toUpperCase()}!</h2>
        <p class="text-slate-300 text-sm mt-2">Chúc mừng bạn đã chinh phục thành công <strong>${floor.name}</strong>!</p>

        <div class="my-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex justify-around items-center">
          <div>
            <div class="text-xs text-slate-400">EXP Nhận được</div>
            <div class="text-2xl font-black text-amber-400">+${floor.rewardExp} ⭐</div>
          </div>
          <div class="w-px h-8 bg-slate-700"></div>
          <div>
            <div class="text-xs text-slate-400">Kim cương thưởng</div>
            <div class="text-2xl font-black text-cyan-400">+25 💎</div>
          </div>
        </div>

        <div class="flex gap-3 justify-center">
          <button onclick="app.showTab('tower')" class="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-600 transition">
            Danh sách tầng
          </button>
          ${this.currentFloor < 10 ? `
            <button onclick="game.startTowerFloor(${this.currentFloor + 1})" class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-extrabold text-sm shadow-lg shadow-amber-500/30 transition transform hover:-translate-y-0.5">
              Tiếp tục Tầng ${this.currentFloor + 1} ➔
            </button>
          ` : `
            <button onclick="app.showTab('home')" class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-sm shadow-lg">
              Về Trang Chủ 🏠
            </button>
          `}
        </div>
      </div>
    `;
    app.updateHeaderStats();
  }

  // Khi hết mạng (Thất bại)
  handlePlayerDefeated() {
    audio.playWrong();
    const arena = document.getElementById('tower-arena');
    if (!arena) return;

    arena.innerHTML = `
      <div class="rounded-3xl p-8 glass-panel border border-rose-500/40 text-center max-w-lg mx-auto shadow-2xl animate-pop-in">
        <div class="text-7xl mb-4">💥</div>
        <div class="text-xs font-bold text-rose-400 uppercase tracking-widest">Hết sinh lực</div>
        <h2 class="text-2xl font-black text-white mt-1">BẠN ĐÃ BỊ ĐÁNH BẠI!</h2>
        <p class="text-slate-300 text-sm mt-2">Đừng nản lòng! Hãy ôn lại các công thức trong Sổ tay và thử sức lại nhé!</p>

        <div class="flex gap-3 justify-center mt-6">
          <button onclick="app.showTab('cheatsheet')" class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-600">
            📖 Đọc sổ tay công thức
          </button>
          <button onclick="game.startTowerFloor(${this.currentFloor})" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 text-white font-extrabold text-sm shadow-lg shadow-rose-600/30">
            🔄 Thử lại Tầng ${this.currentFloor}
          </button>
        </div>
      </div>
    `;
  }

  // ==============================================================
  // 2. CHẾ ĐỘ: THỬ THÁCH TỐC ĐỘ (SPEED SPRINT - 60S)
  // ==============================================================
  startSpeedSprint() {
    if (!storage.isLoggedIn()) {
      app.promptLoginForAction({
        type: 'tab',
        tab: 'speed',
        message: '⚡ Bạn cần đăng nhập tài khoản để tham gia **Thử Thách 60 Giây Tốc Độ** và lưu điểm kỷ lục an toàn!'
      });
      return;
    }

    this.score = 0;
    this.combo = 0;
    this.timeLeft = 60;
    this.activeQuestionsList = [...storage.getAllQuestions()].sort(() => 0.5 - Math.random());
    this.currentIndex = 0;

    clearInterval(this.timer);
    this.renderSpeedUI();
    this.loadNextSpeedQuestion();

    this.timer = setInterval(() => {
      this.timeLeft--;
      const timerElem = document.getElementById('speed-timer-bar');
      const textElem = document.getElementById('speed-timer-text');
      if (textElem) textElem.innerText = `${this.timeLeft}s`;
      if (timerElem) timerElem.style.width = `${(this.timeLeft / 60) * 100}%`;

      if (this.timeLeft <= 10 && this.timeLeft > 0) {
        audio.playTick();
        if (timerElem) timerElem.className = 'bg-rose-500 h-full rounded-full transition-all duration-1000';
      }

      if (this.timeLeft <= 0) {
        clearInterval(this.timer);
        this.finishSpeedSprint();
      }
    }, 1000);

    audio.playClick();
  }

  renderSpeedUI() {
    const container = document.getElementById('speed-container');
    if (!container) return;

    container.innerHTML = `
      <div class="rounded-3xl p-6 glass-panel border border-cyan-500/30 max-w-2xl mx-auto shadow-2xl">
        <!-- Top bar: Điểm, Đồng hồ, Combo -->
        <div class="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-700">
          <div>
            <div class="text-xs text-slate-400 font-bold uppercase">Điểm số</div>
            <div id="speed-score-text" class="text-2xl font-black text-amber-400">0</div>
          </div>

          <div class="flex-1 max-w-xs text-center">
            <div class="flex justify-between items-center text-xs font-bold mb-1">
              <span class="text-cyan-400">⏱️ THỜI GIAN CÒN LẠI</span>
              <span id="speed-timer-text" class="text-cyan-300 font-black text-sm">60s</span>
            </div>
            <div class="w-full bg-slate-900 rounded-full h-3 border border-slate-700 overflow-hidden">
              <div id="speed-timer-bar" class="bg-cyan-500 h-full rounded-full transition-all duration-1000" style="width: 100%"></div>
            </div>
          </div>

          <div class="text-right">
            <div class="text-xs text-slate-400 font-bold uppercase">Combo</div>
            <div id="speed-combo-text" class="text-2xl font-black text-orange-400">x0</div>
          </div>
        </div>

        <!-- Khung câu hỏi -->
        <div id="speed-question-card" class="min-h-[220px]">
          <!-- Nội dung câu hỏi tốc độ -->
        </div>

        <div class="mt-4 text-center">
          <button onclick="game.finishSpeedSprint()" class="text-xs text-slate-400 hover:text-rose-400 transition">
            Dừng thử thách sớm
          </button>
        </div>
      </div>
    `;
  }

  loadNextSpeedQuestion() {
    if (this.currentIndex >= this.activeQuestionsList.length) {
      this.activeQuestionsList.sort(() => 0.5 - Math.random());
      this.currentIndex = 0;
    }

    // Lấy câu hỏi gốc và xáo trộn thứ tự đáp án để tránh toàn bộ đáp án đúng nằm ở A
    const qOriginal = this.activeQuestionsList[this.currentIndex];
    const indices = [0, 1, 2, 3];
    // Fisher-Yates shuffle
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    const shuffledOptions = indices.map(i => qOriginal.options[i]);
    const newCorrectAnswer = indices.indexOf(qOriginal.correctAnswer);

    // Tạo bản sao câu hỏi với options và correctAnswer đã xáo trộn
    const q = {
      ...qOriginal,
      options: shuffledOptions,
      correctAnswer: newCorrectAnswer
    };
    this.activeQuestion = q;
    this.isAnswering = false;

    const card = document.getElementById('speed-question-card');
    if (!card) return;

    card.innerHTML = `
      <div class="space-y-4">
        <div class="text-xs font-semibold text-cyan-400 uppercase tracking-wider">${q.title}</div>
        <div class="text-lg md:text-xl font-bold text-white min-h-[50px]">${q.content}</div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          ${q.options.map((opt, idx) => `
            <button onclick="game.handleSpeedAnswer(${idx})" id="speed-opt-${idx}"
              class="option-btn text-left p-4 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-600 text-slate-100 font-medium text-base shadow flex items-center gap-3">
              <span class="w-7 h-7 rounded-lg bg-slate-900 border border-slate-600 flex items-center justify-center font-bold text-amber-400 shrink-0 text-sm">
                ${['A', 'B', 'C', 'D'][idx]}
              </span>
              <span>${opt}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    this.renderMath(card);
  }

  handleSpeedAnswer(idx) {
    if (this.isAnswering) return;
    this.isAnswering = true;

    const q = this.activeQuestion;
    const isCorrect = idx === q.correctAnswer;
    const btn = document.getElementById(`speed-opt-${idx}`);

    storage.recordAnswer(q.id, q.topicId, isCorrect);

    if (isCorrect) {
      audio.playCorrect();
      this.combo++;
      const multiplier = this.combo >= 5 ? 3 : (this.combo >= 3 ? 2 : 1);
      const earned = (q.points || 10) * multiplier;
      this.score += earned;

      if (btn) btn.classList.add('selected-correct');
      if (this.combo >= 2) audio.playCombo(this.combo);

      // Thưởng 5 EXP mỗi câu đúng tốc độ
      storage.addExp(5);
    } else {
      audio.playWrong();
      this.combo = 0;
      if (btn) btn.classList.add('selected-wrong');
      const correctBtn = document.getElementById(`speed-opt-${q.correctAnswer}`);
      if (correctBtn) correctBtn.classList.add('selected-correct');
    }

    const scoreElem = document.getElementById('speed-score-text');
    const comboElem = document.getElementById('speed-combo-text');
    if (scoreElem) scoreElem.innerText = this.score;
    if (comboElem) comboElem.innerText = `x${this.combo}`;

    // Qua câu tiếp cực nhanh (350ms) để giữ nhịp độ cao
    setTimeout(() => {
      this.currentIndex++;
      this.loadNextSpeedQuestion();
    }, isCorrect ? 350 : 800);
  }

  finishSpeedSprint() {
    clearInterval(this.timer);
    audio.playVictory();
    if (window.confetti) confetti({ particleCount: 70, spread: 60 });

    const isNewHigh = storage.updateSpeedScore(this.score);
    storage.addExp(Math.floor(this.score / 2), (newLv) => app.showLevelUpModal(newLv));
    storage.checkAchievements((ach) => app.showAchievementNotification(ach));
    storage.addLeaderboardRecord(storage.profile.name, this.score, storage.profile.level);

    const container = document.getElementById('speed-container');
    if (!container) return;

    container.innerHTML = `
      <div class="rounded-3xl p-8 glass-panel border border-cyan-500/40 text-center max-w-lg mx-auto shadow-2xl animate-pop-in">
        <div class="text-7xl mb-3">⚡</div>
        <div class="text-xs font-bold text-cyan-400 uppercase tracking-widest">Hết Giờ Thử Thách</div>
        <h2 class="text-3xl font-black text-white mt-1">KẾT QUẢ TIA CHỚP</h2>

        <div class="my-6 p-5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30">
          <div class="text-xs text-slate-400 uppercase font-semibold">Tổng điểm đạt được</div>
          <div class="text-5xl font-black text-amber-400 my-1">${this.score}</div>
          ${isNewHigh ? '<div class="text-xs font-bold text-emerald-400 mt-1">🔥 KỶ LỤC MỚI CỦA BẠN! 🔥</div>' : `<div class="text-xs text-slate-400">Kỷ lục cũ: ${storage.profile.speedHighScore || 0} điểm</div>`}
        </div>

        <div class="flex gap-3 justify-center">
          <button onclick="app.showTab('leaderboard')" class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-600">
            🏆 Xem Bảng Vàng
          </button>
          <button onclick="game.startSpeedSprint()" class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-extrabold text-sm shadow-lg shadow-cyan-500/30">
            ⚡ Chơi Lại Ngay
          </button>
        </div>
      </div>
    `;
    app.updateHeaderStats();
  }

  // ==============================================================
  // 3. CHẾ ĐỘ: SONG ĐẤU 1v1 (PvP HAI BẠN CÙNG MÁY)
  // ==============================================================
  startPvP(targetPoints = 5) {
    if (!storage.isLoggedIn()) {
      app.promptLoginForAction({
        type: 'tab',
        tab: 'pvp',
        message: '⚔️ Bạn cần đăng nhập tài khoản để tham gia Song Đấu 1v1!'
      });
      return;
    }

    this.pvp = {
      p1Score: 0,
      p2Score: 0,
      targetScore: targetPoints,
      currentQ: null,
      locked: false
    };

    this.activeQuestionsList = [...storage.getAllQuestions()].sort(() => 0.5 - Math.random());
    this.currentIndex = 0;

    this.renderPvPUI();
    this.loadNextPvPQuestion();
    audio.playClick();
  }

  renderPvPUI() {
    const container = document.getElementById('pvp-container');
    if (!container) return;

    container.innerHTML = `
      <div class="rounded-3xl p-6 glass-panel border border-slate-700 max-w-4xl mx-auto shadow-2xl">
        <!-- Bảng điểm 2 Đấu Thủ -->
        <div class="grid grid-cols-2 gap-4 pb-4 border-b border-slate-700 items-center">
          <!-- Đấu thủ 1 (Đỏ) -->
          <div class="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-center">
            <div class="text-xs font-bold text-rose-400 uppercase tracking-wider">ĐẤU THỦ 1 (Phím A, S, D, F)</div>
            <div id="pvp-p1-score" class="text-4xl font-black text-rose-400 mt-1">0</div>
            <div class="text-[11px] text-slate-400 mt-0.5">Mục tiêu: ${this.pvp.targetScore} điểm</div>
          </div>

          <!-- Đấu thủ 2 (Xanh) -->
          <div class="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/40 text-center">
            <div class="text-xs font-bold text-blue-400 uppercase tracking-wider">ĐẤU THỦ 2 (Phím J, K, L, ;)</div>
            <div id="pvp-p2-score" class="text-4xl font-black text-blue-400 mt-1">0</div>
            <div class="text-[11px] text-slate-400 mt-0.5">Mục tiêu: ${this.pvp.targetScore} điểm</div>
          </div>
        </div>

        <!-- Khung câu hỏi chung -->
        <div class="py-5 text-center">
          <div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">CÂU ĐỐ SONG ĐẤU</div>
          <div id="pvp-question-text" class="text-lg md:text-xl font-bold text-white max-w-2xl mx-auto">
            <!-- Đang tải câu hỏi -->
          </div>
        </div>

        <!-- Hai bảng nút bấm cho 2 người (chia 2 cột) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <!-- Bảng nút P1 -->
          <div class="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/20 space-y-2">
            <div class="text-xs font-bold text-rose-300 mb-2 flex justify-between">
              <span>ĐẤU THỦ 1 BẤM CHỌN:</span>
              <span class="text-[10px] text-slate-400">Phím tắt: A - B - C - D</span>
            </div>
            <div id="pvp-p1-buttons" class="space-y-2"></div>
          </div>

          <!-- Bảng nút P2 -->
          <div class="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/20 space-y-2">
            <div class="text-xs font-bold text-blue-300 mb-2 flex justify-between">
              <span>ĐẤU THỦ 2 BẤM CHỌN:</span>
              <span class="text-[10px] text-slate-400">Phím tắt: J - K - L - ;</span>
            </div>
            <div id="pvp-p2-buttons" class="space-y-2"></div>
          </div>
        </div>

        <div id="pvp-round-result" class="hidden mt-4 p-3 rounded-xl text-center text-sm font-bold border"></div>

        <div class="mt-4 text-center">
          <button onclick="app.showTab('home')" class="text-xs text-slate-400 hover:text-white">
            Thoát Song Đấu
          </button>
        </div>
      </div>
    `;

    // Gắn sự kiện bàn phím
    window.onkeydown = (e) => {
      if (app.currentTab !== 'pvp' || this.pvp.locked) return;
      const key = e.key.toLowerCase();
      // P1: a, s, d, f -> 0, 1, 2, 3
      if (key === 'a') this.handlePvPAnswer(1, 0);
      else if (key === 's') this.handlePvPAnswer(1, 1);
      else if (key === 'd') this.handlePvPAnswer(1, 2);
      else if (key === 'f') this.handlePvPAnswer(1, 3);
      // P2: j, k, l, ; -> 0, 1, 2, 3
      else if (key === 'j') this.handlePvPAnswer(2, 0);
      else if (key === 'k') this.handlePvPAnswer(2, 1);
      else if (key === 'l') this.handlePvPAnswer(2, 2);
      else if (key === ';' || key === ':') this.handlePvPAnswer(2, 3);
    };
  }

  loadNextPvPQuestion() {
    if (this.currentIndex >= this.activeQuestionsList.length) {
      this.activeQuestionsList.sort(() => 0.5 - Math.random());
      this.currentIndex = 0;
    }

    const q = this.activeQuestionsList[this.currentIndex];
    this.pvp.currentQ = q;
    this.pvp.locked = false;

    const qText = document.getElementById('pvp-question-text');
    const p1Box = document.getElementById('pvp-p1-buttons');
    const p2Box = document.getElementById('pvp-p2-buttons');
    const resBox = document.getElementById('pvp-round-result');

    if (resBox) resBox.className = 'hidden';
    if (qText) qText.innerHTML = q.content;

    const p1Keys = ['A', 'S', 'D', 'F'];
    const p2Keys = ['J', 'K', 'L', ';'];

    if (p1Box) {
      p1Box.innerHTML = q.options.map((opt, idx) => `
        <button onclick="game.handlePvPAnswer(1, ${idx})" id="p1-btn-${idx}"
          class="w-full text-left p-3 rounded-xl bg-slate-800 hover:bg-rose-900/60 border border-slate-700 text-slate-200 text-sm font-medium flex items-center justify-between">
          <span class="truncate pr-2">${opt}</span>
          <span class="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/40 text-xs font-bold shrink-0">[${p1Keys[idx]}]</span>
        </button>
      `).join('');
    }

    if (p2Box) {
      p2Box.innerHTML = q.options.map((opt, idx) => `
        <button onclick="game.handlePvPAnswer(2, ${idx})" id="p2-btn-${idx}"
          class="w-full text-left p-3 rounded-xl bg-slate-800 hover:bg-blue-900/60 border border-slate-700 text-slate-200 text-sm font-medium flex items-center justify-between">
          <span class="truncate pr-2">${opt}</span>
          <span class="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-500/40 text-xs font-bold shrink-0">[${p2Keys[idx]}]</span>
        </button>
      `).join('');
    }

    this.renderMath(document.getElementById('pvp-container'));
  }

  handlePvPAnswer(playerNum, chosenIdx) {
    if (this.pvp.locked) return;
    this.pvp.locked = true;

    const q = this.pvp.currentQ;
    const isCorrect = chosenIdx === q.correctAnswer;
    const resBox = document.getElementById('pvp-round-result');

    if (isCorrect) {
      audio.playCorrect();
      if (playerNum === 1) {
        this.pvp.p1Score++;
        const p1ScoreElem = document.getElementById('pvp-p1-score');
        if (p1ScoreElem) p1ScoreElem.innerText = this.pvp.p1Score;
      } else {
        this.pvp.p2Score++;
        const p2ScoreElem = document.getElementById('pvp-p2-score');
        if (p2ScoreElem) p2ScoreElem.innerText = this.pvp.p2Score;
      }

      if (resBox) {
        resBox.className = 'mt-4 p-3 rounded-xl text-center text-sm font-bold border bg-emerald-950/70 border-emerald-500/40 text-emerald-300 block';
        resBox.innerHTML = `🎉 ĐẤU THỦ ${playerNum} TRẢ LỜI ĐÚNG NHANH NHẤT! (+1 ĐIỂM)`;
      }
    } else {
      audio.playWrong();
      // Sai: đối thủ được cộng điểm
      const other = playerNum === 1 ? 2 : 1;
      if (other === 1) {
        this.pvp.p1Score++;
        const p1ScoreElem = document.getElementById('pvp-p1-score');
        if (p1ScoreElem) p1ScoreElem.innerText = this.pvp.p1Score;
      } else {
        this.pvp.p2Score++;
        const p2ScoreElem = document.getElementById('pvp-p2-score');
        if (p2ScoreElem) p2ScoreElem.innerText = this.pvp.p2Score;
      }

      if (resBox) {
        resBox.className = 'mt-4 p-3 rounded-xl text-center text-sm font-bold border bg-rose-950/70 border-rose-500/40 text-rose-300 block';
        resBox.innerHTML = `❌ ĐẤU THỦ ${playerNum} TRẢ LỜI SAI! (ĐẤU THỦ ${other} ĐƯỢC +1 ĐIỂM)`;
      }
    }

    // Kiểm tra chiến thắng
    if (this.pvp.p1Score >= this.pvp.targetScore || this.pvp.p2Score >= this.pvp.targetScore) {
      setTimeout(() => this.finishPvP(), 1200);
      return;
    }

    setTimeout(() => {
      this.currentIndex++;
      this.loadNextPvPQuestion();
    }, 1500);
  }

  finishPvP() {
    audio.playVictory();
    if (window.confetti) confetti({ particleCount: 90, spread: 70 });

    const winner = this.pvp.p1Score >= this.pvp.targetScore ? 1 : 2;
    const container = document.getElementById('pvp-container');
    if (!container) return;

    container.innerHTML = `
      <div class="rounded-3xl p-8 glass-panel border border-amber-500/50 text-center max-w-lg mx-auto shadow-2xl animate-pop-in">
        <div class="text-7xl mb-3">👑</div>
        <div class="text-xs font-bold text-amber-400 uppercase tracking-widest">Trận Đấu Kết Thúc</div>
        <h2 class="text-3xl font-black text-white mt-1">ĐẤU THỦ ${winner} CHIẾN THẮNG!</h2>
        
        <div class="my-6 p-4 rounded-2xl bg-slate-900 border border-slate-700 flex justify-around items-center">
          <div>
            <div class="text-xs text-rose-400 font-bold">Đấu thủ 1</div>
            <div class="text-3xl font-black text-white">${this.pvp.p1Score}</div>
          </div>
          <div class="text-2xl font-bold text-slate-500">-</div>
          <div>
            <div class="text-xs text-blue-400 font-bold">Đấu thủ 2</div>
            <div class="text-3xl font-black text-white">${this.pvp.p2Score}</div>
          </div>
        </div>

        <div class="flex gap-3 justify-center">
          <button onclick="app.showTab('home')" class="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-600">
            Về Trang Chủ
          </button>
          <button onclick="game.startPvP(${this.pvp.targetScore})" class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-extrabold text-sm shadow-lg shadow-amber-500/30">
            Tái Đấu Ngay ⚔️
          </button>
        </div>
      </div>
    `;
  }

  exitToHome() {
    if (confirm('Bạn có chắc muốn rút lui khỏi trận đấu? Tiến trình hiện tại sẽ dừng lại.')) {
      app.showTab('home');
    }
  }
}

const game = new GameEngine();
