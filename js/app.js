// ================================================================
// QUẢN LÝ GIAO DIỆN CHÍNH, TABS VÀ CÁC CHỨC NĂNG HỖ TRỢ
// ================================================================

class AppController {
  constructor() {
    this.currentTab = 'home';
    this.activeTopic = null;
    this.activeTopicQuestions = [];
    this.topicQuestionIndex = 0;
    this.pendingAction = null;
    this.activeAuthTab = 'login';
    this.selectedRegisterAvatar = '🐱';
    this.authCustomMessage = null;
  }

  init() {
    this.updateHeaderStats();
    this.showTab('home');
    this.initAudioToggle();

    // Lắng nghe sự kiện click toàn cục để khởi động AudioContext
    document.addEventListener('click', () => {
      audio.init();
    }, { once: true });
  }

  // Cập nhật thông tin người chơi trên thanh Topbar
  updateHeaderStats() {
    const p = storage.profile;
    const nameEl = document.getElementById('player-name');
    const avatarEl = document.getElementById('player-avatar');
    const levelEl = document.getElementById('player-level');
    const expTextEl = document.getElementById('player-exp-text');
    const expBarEl = document.getElementById('player-exp-bar');
    const diamondsEl = document.getElementById('player-diamonds');
    const streakEl = document.getElementById('player-streak');
    const authActionsEl = document.getElementById('auth-topbar-actions');

    const isLoggedIn = storage.isLoggedIn();

    if (nameEl) {
      nameEl.innerText = isLoggedIn ? p.name : 'Khách (Chưa đăng nhập)';
    }
    if (avatarEl) avatarEl.innerText = p.avatar;
    if (levelEl) {
      levelEl.innerHTML = isLoggedIn
        ? `Lv.${p.level} <span class="inline-flex items-center gap-1 text-[9px] text-emerald-300 bg-emerald-950/60 px-1.5 py-0.5 rounded-full font-bold border border-emerald-500/30" title="Trực tuyến"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>Online</span>`
        : `Lv.${p.level}`;
    }
    if (diamondsEl) diamondsEl.innerText = p.diamonds || 50;
    if (streakEl) streakEl.innerText = p.streak || 0;

    const needed = p.expToNextLevel || 100;
    const percent = Math.min(100, Math.floor((p.exp / needed) * 100));
    if (expTextEl) expTextEl.innerText = `${p.exp}/${needed} EXP (${percent}%)`;
    if (expBarEl) expBarEl.style.width = `${percent}%`;

    if (authActionsEl) {
      if (isLoggedIn) {
        const u = storage.currentUser;
        authActionsEl.innerHTML = `
          <button onclick="app.logout()"
            class="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-pink-100 hover:bg-pink-200 text-pink-700 border border-pink-300 transition flex items-center gap-1 shadow-sm"
            title="Đăng xuất khỏi tài khoản @${u ? u.username : ''}">
            <span>🚪</span>
            <span class="hidden sm:inline">Thoát</span>
          </button>
        `;
      } else {
        authActionsEl.innerHTML = `
          <button onclick="app.showAuthModal('login')"
            class="px-3.5 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-sm hover:scale-105 transition flex items-center gap-1.5">
            <span>🔑</span>
            <span>Đăng Nhập</span>
          </button>
        `;
      }
    }
  }

  // Chuyển đổi giữa các tab
  showTab(tabName) {
    // Kiểm tra yêu cầu đăng nhập trước khi vào học hoặc thử thách 60 giây
    const protectedTabs = ['speed', 'topics', 'advanced', 'tower', 'exams', 'pvp'];
    if (protectedTabs.includes(tabName) && !storage.isLoggedIn()) {
      const tabTitles = {
        speed: 'Thử Thách 60 Giây Tốc Độ',
        topics: 'Học Bài Tập Cơ Bản GDPT 2018',
        advanced: 'Học Bài Tập Nâng Cao (Điền Số)',
        tower: 'Leo Tháp Tri Thức',
        exams: 'Luyện Đề Thi Học Kỳ & Tuyển Sinh Vào 10',
        pvp: 'Song Đấu 1v1'
      };
      const featureTitle = tabTitles[tabName] || 'tính năng học tập này';
      this.promptLoginForAction({
        type: 'tab',
        tab: tabName,
        message: `🔒 Bạn cần đăng nhập tài khoản để vào **${featureTitle}**! Dữ liệu học tập, tiến độ và kỷ lục của bạn sẽ được lưu trữ an toàn.`
      });
      return;
    }

    this.currentTab = tabName;
    audio.playClick();

    // Ẩn tất cả các view
    const views = document.querySelectorAll('.tab-view');
    views.forEach(v => v.classList.add('hidden'));

    // Bỏ active trên thanh điều hướng
    const navBtns = document.querySelectorAll('.nav-tab-btn');
    navBtns.forEach(btn => {
      btn.classList.remove('bg-blue-600', 'text-white', 'shadow-lg');
      btn.classList.add('text-slate-400', 'hover:text-white', 'hover:bg-slate-800');
    });

    // Kích hoạt tab được chọn
    const activeView = document.getElementById(`view-${tabName}`);
    if (activeView) activeView.classList.remove('hidden');

    const activeNavBtn = document.getElementById(`nav-${tabName}`);
    if (activeNavBtn) {
      activeNavBtn.classList.add('bg-blue-600', 'text-white', 'shadow-lg');
      activeNavBtn.classList.remove('text-slate-400', 'hover:bg-slate-800');
    } else {
      // Nếu là tính năng con trong mục gom Mở Rộng
      const moreNavBtn = document.getElementById('nav-more');
      if (moreNavBtn && ['tower', 'speed', 'pvp', 'exams', 'cheatsheet', 'leaderboard', 'teacher', 'more'].includes(tabName)) {
        moreNavBtn.classList.add('bg-purple-600', 'text-white', 'shadow-lg');
        moreNavBtn.classList.remove('text-slate-400', 'hover:bg-slate-800');
      }
    }

    // Cuộn lên đầu trang mượt mà
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Khởi tạo nội dung tương ứng theo tab
    if (tabName === 'home') {
      this.renderHome();
    } else if (tabName === 'tower') {
      this.renderTowerMap();
    } else if (tabName === 'speed') {
      game.startSpeedSprint();
    } else if (tabName === 'topics') {
      this.renderTopicsList();
    } else if (tabName === 'pvp') {
      game.startPvP(5);
    } else if (tabName === 'exams') {
      this.renderExamsList();
    } else if (tabName === 'cheatsheet') {
      this.renderCheatsheet();
    } else if (tabName === 'leaderboard') {
      this.renderLeaderboard();
    } else if (tabName === 'teacher') {
      this.renderTeacherDashboard();
    } else if (tabName === 'advanced') {
      this.renderAdvancedView();
    } else if (tabName === 'more') {
      this.renderMoreView();
    }

    setTimeout(() => game.renderMath(), 50);
  }

  // ==============================================================
  // RENDER TRANG CHỦ (DASHBOARD)
  // ==============================================================
  renderHome() {
    const container = document.getElementById('home-content');
    if (!container) return;

    const p = storage.profile;
    const allQuestions = storage.getAllQuestions();
    const answeredCount = Object.keys(p.answeredQuestions).length;

    container.innerHTML = `
      ${!storage.isLoggedIn() ? `
        <!-- Banner Nhắc Nhở Đăng Nhập & Tạo Tài Khoản -->
        <div class="mb-6 p-4 rounded-3xl bg-gradient-to-r from-pink-950/70 via-purple-950/50 to-slate-900/90 border border-pink-500/40 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-3.5 text-left">
            <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center text-xl shrink-0 shadow-md">
              🔒
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="font-black text-white text-sm md:text-base">Chưa Đăng Nhập Tài Khoản Học Tập</span>
                <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">Cần đăng nhập</span>
              </div>
              <p class="text-xs text-pink-200/90 mt-0.5 leading-relaxed">
                Để vào học bài tập cơ bản/nâng cao hoặc tham gia thử thách 60 giây tốc độ, bạn cần đăng nhập tài khoản. Dữ liệu học tập và điểm số sẽ được lưu trữ và bảo vệ an toàn.
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0 w-full md:w-auto">
            <button onclick="app.showAuthModal('login')" class="w-full md:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white font-black text-xs shadow-md transition transform hover:scale-105 flex items-center justify-center gap-1.5">
              <span>🔑</span>
              <span>Đăng Nhập Ngay</span>
            </button>
          </div>
        </div>
      ` : `
        <!-- Banner Tài Khoản Đang Hoạt Động -->
        <div class="mb-6 px-4 py-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200 flex flex-wrap items-center justify-between gap-3 shadow-sm">
          <div class="flex items-center gap-2.5">
            <span class="text-base">🟢</span>
            <span>Đang học với tài khoản: <strong class="text-white">@${storage.currentUser ? storage.currentUser.username : ''}</strong> (${p.name})</span>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="app.showProfileModal()" class="px-2.5 py-1 rounded-lg bg-emerald-900/40 hover:bg-emerald-800/50 text-emerald-300 border border-emerald-500/30 font-bold text-[11px] transition">Hồ sơ</button>
            <button onclick="app.logout()" class="px-2.5 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-500/30 font-bold text-[11px] transition">Đăng xuất</button>
          </div>
        </div>
      `}

      <!-- Banner Chào Mừng & Hành Động Chính -->
      <div class="relative rounded-3xl p-6 md:p-10 glass-panel border border-blue-500/30 overflow-hidden shadow-2xl bg-gradient-to-r from-blue-950/70 via-indigo-950/50 to-slate-900/80 mb-8">
        <div class="absolute -right-10 -bottom-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -left-10 -top-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10 max-w-2xl">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold mb-3">
            <span>🔥 Chuỗi ngày ôn luyện:</span>
            <span class="text-amber-400 font-extrabold">${p.streak} ngày</span>
          </div>
          <h1 class="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Chinh Phục <span class="bg-gradient-to-r from-blue-400 via-cyan-300 to-amber-300 bg-clip-text text-transparent">Toán 9 Cực Đỉnh</span>
          </h1>
          <p class="text-slate-300 text-sm md:text-base mt-3 leading-relaxed">
            Học mà chơi, chơi mà học! Vượt ải boss, thi đấu tốc độ, làm chủ định lý Vi-ét, căn thức, hệ phương trình và bứt phá điểm 9-10 vào lớp 10!
          </p>

          <div class="flex flex-wrap gap-4 mt-6">
            <button onclick="app.showTab('tower')" class="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-extrabold text-sm md:text-base shadow-xl shadow-orange-500/25 flex items-center gap-2 transform hover:-translate-y-0.5 transition">
              <span>🏰 LEO THÁP TRI THỨC</span>
              <span class="text-xs bg-black/30 px-2 py-0.5 rounded-full">Tầng ${p.highestFloor}/10</span>
            </button>
            <button onclick="app.showTab('speed')" class="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-sm md:text-base shadow-xl shadow-cyan-500/25 flex items-center gap-2 transform hover:-translate-y-0.5 transition">
              <span>⚡ THỬ THÁCH 60 GIÂY</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Thống kê nhanh của người học -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="p-5 rounded-2xl glass-card border border-slate-700/60">
          <div class="text-slate-400 text-xs font-semibold uppercase">Cấp độ hiện tại</div>
          <div class="text-3xl font-black text-amber-400 mt-1">Cấp ${p.level}</div>
          <div class="text-[11px] text-slate-500 mt-1">Chiến Binh Toán 9</div>
        </div>

        <div class="p-5 rounded-2xl glass-card border border-slate-700/60">
          <div class="text-slate-400 text-xs font-semibold uppercase">Câu hỏi đã làm</div>
          <div class="text-3xl font-black text-cyan-400 mt-1">${answeredCount}/${allQuestions.length}</div>
          <div class="text-[11px] text-slate-500 mt-1">Ngân hàng phong phú</div>
        </div>

        <div class="p-5 rounded-2xl glass-card border border-slate-700/60">
          <div class="text-slate-400 text-xs font-semibold uppercase">Tháp Tri Thức</div>
          <div class="text-3xl font-black text-rose-400 mt-1">Tầng ${p.highestFloor}</div>
          <div class="text-[11px] text-slate-500 mt-1">Mục tiêu: Đỉnh Tháp 10</div>
        </div>

        <div class="p-5 rounded-2xl glass-card border border-slate-700/60">
          <div class="text-slate-400 text-xs font-semibold uppercase">Kỷ Lục Tốc Độ</div>
          <div class="text-3xl font-black text-emerald-400 mt-1">${p.speedHighScore || 0} pts</div>
          <div class="text-[11px] text-slate-500 mt-1">Phản xạ nhẩm tính</div>
        </div>
      </div>

      <!-- Banner chính lựa chọn mục học tập -->
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-black text-white flex items-center gap-2">
          <span>🎯 CHƯƠNG TRÌNH HỌC TẬP & ÔN LUYỆN TOÁN 9</span>
        </h2>
        <span class="text-xs text-slate-400 hidden sm:inline">2 Chuyên mục trọng tâm & 1 Mục tính năng mở rộng</span>
      </div>

      <!-- 3 MỤC CHÍNH TRÊN TRANG CHỦ -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        
        <!-- MỤC 1: CHUYÊN ĐỀ GDPT -->
        <div onclick="app.showTab('topics')" class="home-feature-card p-6 rounded-3xl glass-card border border-indigo-500/40 hover:border-indigo-400 cursor-pointer group bg-gradient-to-b from-indigo-950/20 to-slate-900/60 shadow-lg shadow-indigo-950/30 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-4">
              <div class="home-feature-icon w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-3xl group-hover:scale-110 transition border border-indigo-500/30">
                🌸
              </div>
              <span class="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                GDPT 2018
              </span>
            </div>
            <h3 class="text-lg font-black text-white group-hover:text-indigo-300 transition">Chuyên Đề GDPT</h3>
            <p class="text-xs text-slate-400 mt-2 leading-relaxed">
              10 chuyên đề chuẩn chương trình mới GDPT 2018 (Căn thức, Hệ PT, Lượng giác, Đường tròn, Parabol, Vi-ét...). Luyện tập trắc nghiệm chọn lọc theo bài học kèm lý thuyết.
            </p>
          </div>
          <div class="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-indigo-400 group-hover:text-indigo-300">
            <span>Bắt đầu ôn tập</span>
            <span>➔</span>
          </div>
        </div>

        <!-- MỤC 2: BT NÂNG CAO -->
        <div onclick="app.showTab('advanced')" class="home-feature-card p-6 rounded-3xl glass-card border border-amber-500/40 hover:border-amber-400 cursor-pointer group bg-gradient-to-b from-amber-950/20 to-slate-900/60 shadow-lg shadow-amber-950/30 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-4">
              <div class="home-feature-icon w-14 h-14 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 flex items-center justify-center text-3xl group-hover:scale-110 transition border border-amber-500/30">
                ⚡
              </div>
              <span class="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Điền Số
              </span>
            </div>
            <h3 class="text-lg font-black text-white group-hover:text-amber-300 transition">BT Nâng Cao</h3>
            <p class="text-xs text-slate-400 mt-2 leading-relaxed">
              Tuyển chọn 48 bài toán vận dụng cao từ <strong>SBT Toán 9 KNTT</strong> (Tập 1 & 2). Tự tính toán và điền đáp số ngắn, thuật toán Random thông minh chống trùng lặp!
            </p>
          </div>
          <div class="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-amber-400 group-hover:text-amber-300">
            <span>Bứt phá điểm 9-10</span>
            <span>➔</span>
          </div>
        </div>

        <!-- MỤC 3: MỤC GOM LẠI (TÍNH NĂNG MỞ RỘNG) -->
        <div onclick="app.toggleHomeExpandedFeatures()" class="home-feature-card p-6 rounded-3xl glass-card border border-purple-500/40 hover:border-purple-400 cursor-pointer group bg-gradient-to-b from-purple-950/30 to-slate-900/70 shadow-lg shadow-purple-950/40 flex flex-col justify-between relative overflow-hidden">
          <div class="absolute -right-6 -bottom-6 w-32 h-32 bg-purple-500/10 rounded-full blur-xl pointer-events-none"></div>
          <div>
            <div class="flex items-center justify-between mb-4">
              <div class="home-feature-icon w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-3xl group-hover:scale-110 transition border border-purple-500/30">
                🌷
              </div>
              <span class="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-purple-500/25 text-purple-300 border border-purple-500/40 animate-pulse">
                ✨ 7 Mục Đã Gom
              </span>
            </div>
            <h3 class="text-lg font-black text-white group-hover:text-purple-300 transition">Chế Độ Mở Rộng</h3>
            <p class="text-xs text-slate-300 mt-2 leading-relaxed">
              Gom toàn bộ các tính năng còn lại: <strong>Leo Tháp, 60s Tốc Độ, Song Đấu 1v1, Luyện Đề Thi, Sổ Tay Công Thức, Bảng Vàng & Góc Thầy Cô</strong>.
            </p>
          </div>
          <div class="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-purple-300 group-hover:text-purple-200">
            <span id="btn-toggle-label">Ấn vào để xem các tính năng ▾</span>
            <span id="btn-toggle-icon">▾</span>
          </div>
        </div>
      </div>

      <!-- KHUNG HIỂN THỊ CÁC TÍNH NĂNG ĐÃ GOM (BUNG RA KHI CLICK VÀO MỤC GOM) -->
      <div id="home-gathered-features-box" class="hidden mb-12 p-6 md:p-8 rounded-3xl glass-panel border-2 border-purple-500/40 bg-gradient-to-b from-purple-950/40 via-slate-900/90 to-slate-900/95 shadow-2xl transition-all">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-5 mb-6 border-b border-purple-500/30">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold mb-1">
              <span>🌷 DANH SÁCH TÍNH NĂNG ĐÃ GOM</span>
            </div>
            <h3 class="text-xl font-black text-white">CÁC CHẾ ĐỘ ĐẤU TRƯỜNG & CÔNG CỤ BỔ TRỢ</h3>
            <p class="text-xs text-slate-400 mt-0.5">Chọn bất kỳ tính năng nào bên dưới để bắt đầu trải nghiệm ngay lập tức!</p>
          </div>

          <div class="flex items-center gap-2">
            <button onclick="app.showTab('more')" class="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 transition flex items-center gap-1.5">
              <span>Toàn màn hình</span>
              <span>➔</span>
            </button>
            <button onclick="app.toggleHomeExpandedFeatures()" class="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition">
              ▲ Thu gọn
            </button>
          </div>
        </div>

        <!-- Lưới 7 tính năng con đã gom -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <!-- 1. Leo Tháp -->
          <div onclick="app.showTab('tower')" class="p-5 rounded-2xl glass-card border border-amber-500/30 hover:border-amber-400 hover:scale-[1.02] cursor-pointer transition flex flex-col justify-between group bg-gradient-to-b from-amber-950/20 to-slate-900/60 shadow">
            <div>
              <div class="flex justify-between items-start mb-2">
                <span class="text-2xl p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">🏰</span>
                <span class="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-300">Tầng ${p.highestFloor}/10</span>
              </div>
              <h4 class="text-sm font-black text-white group-hover:text-amber-300 transition">Leo Tháp Tri Thức</h4>
              <p class="text-[11px] text-slate-400 mt-1 line-clamp-2">Vượt 10 tầng tháp đối đầu các Boss Toán học để giành vương miện.</p>
            </div>
            <div class="mt-3 pt-2 border-t border-slate-800 flex justify-between text-[11px] font-bold text-amber-400">
              <span>Vào tháp đấu</span><span>➔</span>
            </div>
          </div>

          <!-- 2. 60s Tốc Độ -->
          <div onclick="app.showTab('speed')" class="p-5 rounded-2xl glass-card border border-cyan-500/30 hover:border-cyan-400 hover:scale-[1.02] cursor-pointer transition flex flex-col justify-between group bg-gradient-to-b from-cyan-950/20 to-slate-900/60 shadow">
            <div>
              <div class="flex justify-between items-start mb-2">
                <span class="text-2xl p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">⚡</span>
                <span class="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-300">${p.speedHighScore || 0} pts</span>
              </div>
              <h4 class="text-sm font-black text-white group-hover:text-cyan-300 transition">60s Tốc Độ</h4>
              <p class="text-[11px] text-slate-400 mt-1 line-clamp-2">Thử thách nhẩm nhanh 60 giây, rèn luyện phản xạ thần tốc.</p>
            </div>
            <div class="mt-3 pt-2 border-t border-slate-800 flex justify-between text-[11px] font-bold text-cyan-400">
              <span>Đua tốc độ</span><span>➔</span>
            </div>
          </div>

          <!-- 3. Song Đấu 1v1 -->
          <div onclick="app.showTab('pvp')" class="p-5 rounded-2xl glass-card border border-purple-500/30 hover:border-purple-400 hover:scale-[1.02] cursor-pointer transition flex flex-col justify-between group bg-gradient-to-b from-purple-950/20 to-slate-900/60 shadow">
            <div>
              <div class="flex justify-between items-start mb-2">
                <span class="text-2xl p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">🐱</span>
                <span class="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-800 text-purple-300">2 Người</span>
              </div>
              <h4 class="text-sm font-black text-white group-hover:text-purple-300 transition">Song Đấu 1v1</h4>
              <p class="text-[11px] text-slate-400 mt-1 line-clamp-2">Hai bạn cùng ngồi chung 1 máy tính so tài bấm phím trực tiếp.</p>
            </div>
            <div class="mt-3 pt-2 border-t border-slate-800 flex justify-between text-[11px] font-bold text-purple-400">
              <span>Thách đấu</span><span>➔</span>
            </div>
          </div>

          <!-- 4. Luyện Đề Thi Học Kỳ -->
          <div onclick="app.showTab('exams')" class="p-5 rounded-2xl glass-card border border-emerald-500/30 hover:border-emerald-400 hover:scale-[1.02] cursor-pointer transition flex flex-col justify-between group bg-gradient-to-b from-emerald-950/20 to-slate-900/60 shadow">
            <div>
              <div class="flex justify-between items-start mb-2">
                <span class="text-2xl p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">🍓</span>
                <span class="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-800 text-emerald-300">Nghĩa An 25-26</span>
              </div>
              <h4 class="text-sm font-black text-white group-hover:text-emerald-300 transition">Luyện Đề Thi Học Kỳ</h4>
              <p class="text-[11px] text-slate-400 mt-1 line-clamp-2">Đề thi học kỳ & tuyển sinh chuẩn ma trận có giải tự luận chi tiết.</p>
            </div>
            <div class="mt-3 pt-2 border-t border-slate-800 flex justify-between text-[11px] font-bold text-emerald-400">
              <span>Làm đề thi</span><span>➔</span>
            </div>
          </div>

          <!-- 5. Sổ Tay Công Thức -->
          <div onclick="app.showTab('cheatsheet')" class="p-5 rounded-2xl glass-card border border-yellow-500/30 hover:border-yellow-400 hover:scale-[1.02] cursor-pointer transition flex flex-col justify-between group bg-gradient-to-b from-yellow-950/20 to-slate-900/60 shadow">
            <div>
              <div class="flex justify-between items-start mb-2">
                <span class="text-2xl p-2 rounded-xl bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">📒</span>
                <span class="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-800 text-yellow-300">Tra cứu</span>
              </div>
              <h4 class="text-sm font-black text-white group-hover:text-yellow-300 transition">Sổ Tay Công Thức</h4>
              <p class="text-[11px] text-slate-400 mt-1 line-clamp-2">Cẩm nang tra cứu nhanh toàn bộ công thức Toán Đại số & Hình học 9.</p>
            </div>
            <div class="mt-3 pt-2 border-t border-slate-800 flex justify-between text-[11px] font-bold text-yellow-400">
              <span>Mở sổ tay</span><span>➔</span>
            </div>
          </div>

          <!-- 6. Bảng Vàng -->
          <div onclick="app.showTab('leaderboard')" class="p-5 rounded-2xl glass-card border border-rose-500/30 hover:border-rose-400 hover:scale-[1.02] cursor-pointer transition flex flex-col justify-between group bg-gradient-to-b from-rose-950/20 to-slate-900/60 shadow">
            <div>
              <div class="flex justify-between items-start mb-2">
                <span class="text-2xl p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">👑</span>
                <span class="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-800 text-rose-300">BXH</span>
              </div>
              <h4 class="text-sm font-black text-white group-hover:text-rose-300 transition">Bảng Vàng Vinh Danh</h4>
              <p class="text-[11px] text-slate-400 mt-1 line-clamp-2">Vinh danh các bạn đạt điểm số cao, streak khủng và thành tích xuất sắc.</p>
            </div>
            <div class="mt-3 pt-2 border-t border-slate-800 flex justify-between text-[11px] font-bold text-rose-400">
              <span>Xem bảng vàng</span><span>➔</span>
            </div>
          </div>

          <!-- 7. Góc Thầy Cô -->
          <div onclick="app.showTab('teacher')" class="p-5 rounded-2xl glass-card border border-indigo-500/30 hover:border-indigo-400 hover:scale-[1.02] cursor-pointer transition flex flex-col justify-between group bg-gradient-to-b from-indigo-950/20 to-slate-900/60 shadow">
            <div>
              <div class="flex justify-between items-start mb-2">
                <span class="text-2xl p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">🌷</span>
                <span class="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-800 text-indigo-300">Giáo viên</span>
              </div>
              <h4 class="text-sm font-black text-white group-hover:text-indigo-300 transition">Góc Thầy Cô</h4>
              <p class="text-[11px] text-slate-400 mt-1 line-clamp-2">Khu vực bổ sung câu hỏi tự tạo, quản lý lớp học và xuất đề thi.</p>
            </div>
            <div class="mt-3 pt-2 border-t border-slate-800 flex justify-between text-[11px] font-bold text-indigo-400">
              <span>Góc giáo viên</span><span>➔</span>
            </div>
          </div>
        </div>

        <div class="mt-6 text-center">
          <button onclick="app.toggleHomeExpandedFeatures()" class="text-xs font-bold text-slate-400 hover:text-white transition flex items-center justify-center gap-1 mx-auto">
            <span>▲ Thu gọn danh sách</span>
          </button>
        </div>
      </div>
    `;
  }

  // ==============================================================
  // RENDER BẢN ĐỒ THÁP TRI THỨC (TOWER MAP)
  // ==============================================================
  renderTowerMap() {
    const container = document.getElementById('tower-content');
    if (!container) return;

    const highest = storage.profile.highestFloor || 1;

    container.innerHTML = `
      <div id="tower-arena">
        <!-- Giao diện chọn tầng -->
        <div class="text-center max-w-xl mx-auto mb-8">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold mb-2">
            🏆 THÁP TRI THỨC TOÁN 9 (10 TẦNG)
          </div>
          <h2 class="text-3xl font-black text-white">CHỌN TẦNG THÁP ĐỂ KHIÊU CHIẾN</h2>
          <p class="text-slate-400 text-xs mt-2">Hạ gục quái vật toán học từng tầng để mở khóa cổng tháp tiếp theo và nhận danh hiệu Chiến Thần!</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          ${TOWER_FLOORS.map(f => {
            const isUnlocked = f.floor <= highest;
            const isPassed = f.floor < highest;
            return `
              <div class="rounded-3xl p-5 glass-card border ${isUnlocked ? 'border-amber-500/40 bg-slate-900/80 hover:scale-105' : 'border-slate-800 bg-slate-950/40 opacity-60'} transition cursor-pointer flex flex-col justify-between"
                ${isUnlocked ? `onclick="game.startTowerFloor(${f.floor})"` : ''}>
                <div>
                  <div class="flex justify-between items-center mb-3">
                    <span class="text-xs font-bold px-2 py-0.5 rounded-full ${isPassed ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : (isUnlocked ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-500')}">
                      TẦNG ${f.floor}
                    </span>
                    <span>${isPassed ? '✅' : (isUnlocked ? '⚔️' : '🔒')}</span>
                  </div>
                  <div class="text-5xl text-center my-3">${f.bossAvatar}</div>
                  <h3 class="font-extrabold text-white text-center text-sm">${f.boss}</h3>
                  <p class="text-[11px] text-slate-400 text-center mt-1 line-clamp-2">${f.topic}</p>
                </div>

                <div class="mt-4 pt-3 border-t border-slate-800 text-center">
                  ${isUnlocked ? `
                    <button class="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-black text-xs shadow-md">
                      ${isPassed ? 'Đấu Lại ⚔️' : 'Vượt Ải Ngay ➔'}
                    </button>
                  ` : `
                    <span class="text-xs text-slate-500 font-medium">Chưa mở khóa</span>
                  `}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // ==============================================================
  // RENDER DANH SÁCH CHUYÊN ĐỀ GDPT 2018 (TOPICS)
  // ==============================================================
  renderTopicsList() {
    const container = document.getElementById('topics-content');
    if (!container) return;

    const allQs = storage.getAllQuestions();

    container.innerHTML = `
      <div id="topic-container">
        <div class="text-center max-w-xl mx-auto mb-8">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold mb-2">
            📚 CHƯƠNG TRÌNH GDPT 2018
          </div>
          <h2 class="text-3xl font-black text-white">CHINH PHỤC THEO CHUYÊN ĐỀ</h2>
          <p class="text-slate-400 text-xs mt-2">Chọn chuyên đề bạn cần củng cố kiến thức để luyện tập từng câu kèm giải thích chi tiết!</p>
        </div>

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
      </div>
    `;
    game.renderMath(container);
  }

  // Bắt đầu luyện tập chuyên đề được chọn
  startTopicPractice(topicId) {
    if (!storage.isLoggedIn()) {
      this.promptLoginForAction({
        type: 'topicPractice',
        topicId,
        message: '📚 Bạn cần đăng nhập tài khoản để học tập và luyện bài tập chuyên đề này!'
      });
      return;
    }

    const topic = TOPICS.find(t => t.id === topicId);
    if (!topic) return;

    this.activeTopic = topic;
    const allQs = storage.getAllQuestions();
    this.activeTopicQuestions = allQs.filter(q => q.topicId === topicId);

    if (this.activeTopicQuestions.length === 0) {
      alert('Chuyên đề này đang được cập nhật thêm câu hỏi!');
      return;
    }

    this.topicQuestionIndex = 0;
    this.renderTopicQuestion();
    audio.playClick();
  }

  renderTopicQuestion() {
    const container = document.getElementById('topic-container');
    if (!container) return;

    // Xáo trộn thứ tự đáp án (Fisher-Yates) để tránh đáp án đúng luôn ở vị trí A
    const qOriginal = this.activeTopicQuestions[this.topicQuestionIndex];
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
    // Lưu câu hỏi đã shuffle để handleTopicAnswer dùng đúng correctAnswer
    this.activeTopicQuestion = q;

    const total = this.activeTopicQuestions.length;

    container.innerHTML = `
      <div class="max-w-2xl mx-auto rounded-3xl p-6 md:p-8 glass-panel border border-slate-700 shadow-2xl">
        <!-- Header chuyên đề -->
        <div class="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div class="flex items-center gap-3">
            <span class="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500 text-blue-300 font-bold flex items-center justify-center text-sm">
              ${this.activeTopic.icon}
            </span>
            <div>
              <div class="text-xs text-slate-400 font-semibold uppercase">${this.activeTopic.name}</div>
              <h3 class="text-base font-bold text-white">Câu ${this.topicQuestionIndex + 1} / ${total}</h3>
            </div>
          </div>
          <button onclick="app.renderTopicsList()" class="px-3 py-1.5 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700">
            Trở lại danh sách ✖
          </button>
        </div>

        <!-- Nội dung câu hỏi -->
        <div class="text-base md:text-lg font-semibold text-slate-100 mb-6">
          ${q.content}
        </div>

        <!-- 4 Lựa chọn -->
        <div class="space-y-3" id="topic-opts">
          ${q.options.map((opt, idx) => `
            <button onclick="app.handleTopicAnswer(${idx})" id="topic-opt-${idx}"
              class="option-btn w-full text-left p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm md:text-base font-medium flex items-center gap-3">
              <span class="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center font-bold text-amber-400 shrink-0 text-sm">
                ${['A', 'B', 'C', 'D'][idx]}
              </span>
              <span class="flex-1">${opt}</span>
            </button>
          `).join('')}
        </div>

        <!-- Khung giải thích chi tiết sau khi trả lời -->
        <div id="topic-explanation" class="hidden mt-6 p-5 rounded-2xl text-sm border"></div>

        <!-- Nút câu tiếp theo -->
        <div id="topic-next-btn-box" class="hidden mt-6 flex justify-end">
          <button onclick="app.nextTopicQuestion()" class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-sm shadow-lg">
            Câu Tiếp Theo ➔
          </button>
        </div>
      </div>
    `;

    game.renderMath(container);
  }

  handleTopicAnswer(chosenIdx) {
    // Dùng câu hỏi đã xáo trộn (có correctAnswer đúng với vị trí hiển thị)
    const q = this.activeTopicQuestion;
    const isCorrect = chosenIdx === q.correctAnswer;
    const expBox = document.getElementById('topic-explanation');
    const nextBtnBox = document.getElementById('topic-next-btn-box');

    // Khóa các nút lựa chọn
    for (let i = 0; i < 4; i++) {
      const b = document.getElementById(`topic-opt-${i}`);
      if (b) b.disabled = true;
    }

    const selectedBtn = document.getElementById(`topic-opt-${chosenIdx}`);
    const correctBtn = document.getElementById(`topic-opt-${q.correctAnswer}`);

    storage.recordAnswer(q.id, q.topicId, isCorrect);

    if (isCorrect) {
      audio.playCorrect();
      if (selectedBtn) selectedBtn.classList.add('selected-correct');
      storage.addExp(q.points || 10, (newLv) => app.showLevelUpModal(newLv));
      storage.checkAchievements((ach) => app.showAchievementNotification(ach));

      if (expBox) {
        expBox.className = 'mt-6 p-5 rounded-2xl text-sm border bg-emerald-950/70 border-emerald-500/40 text-emerald-200 block';
        expBox.innerHTML = `
          <div class="font-bold text-emerald-400 flex items-center gap-2 mb-2">
            <span>🎉 CHÍNH XÁC! (+${q.points || 10} EXP)</span>
          </div>
          <div class="leading-relaxed text-slate-300 font-sans">
            <strong>Hướng dẫn giải chi tiết:</strong><br>
            ${q.explanation.replace(/\n/g, '<br>')}
          </div>
        `;
      }
    } else {
      audio.playWrong();
      if (selectedBtn) selectedBtn.classList.add('selected-wrong');
      if (correctBtn) correctBtn.classList.add('selected-correct');

      if (expBox) {
        expBox.className = 'mt-6 p-5 rounded-2xl text-sm border bg-rose-950/70 border-rose-500/40 text-rose-200 block';
        expBox.innerHTML = `
          <div class="font-bold text-rose-400 flex items-center gap-2 mb-2">
            <span>❌ RẤT TIẾC, CHƯA ĐÚNG!</span>
          </div>
          <div class="leading-relaxed text-slate-300 font-sans">
            <strong>Đáp án chính xác:</strong> ${['A', 'B', 'C', 'D'][q.correctAnswer]}. ${q.options[q.correctAnswer]}<br><br>
            <strong>Lời giải từng bước:</strong><br>
            ${q.explanation.replace(/\n/g, '<br>')}
          </div>
        `;
      }
    }

    if (nextBtnBox) nextBtnBox.classList.remove('hidden');
    game.renderMath(expBox);
    this.updateHeaderStats();
  }

  nextTopicQuestion() {
    this.topicQuestionIndex++;
    if (this.topicQuestionIndex < this.activeTopicQuestions.length) {
      this.renderTopicQuestion();
    } else {
      // Hoàn thành hết câu trong chuyên đề
      audio.playVictory();
      if (window.confetti) confetti({ particleCount: 70, spread: 60 });
      const container = document.getElementById('topic-container');
      if (container) {
        container.innerHTML = `
          <div class="rounded-3xl p-8 glass-panel border border-emerald-500/40 text-center max-w-lg mx-auto shadow-2xl animate-pop-in">
            <div class="text-7xl mb-3">🎓</div>
            <div class="text-xs font-bold text-emerald-400 uppercase tracking-widest">Hoàn Thành Chuyên Đề</div>
            <h2 class="text-2xl font-black text-white mt-1">XUẤT SẮC! BẠN ĐÃ RÈN LUYỆN XONG!</h2>
            <p class="text-slate-300 text-xs mt-2">Toàn bộ câu hỏi trong <strong>${this.activeTopic.name}</strong> đã được bạn hoàn thành!</p>

            <div class="mt-6 flex justify-center gap-3">
              <button onclick="app.renderTopicsList()" class="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-600">
                Chuyên đề khác
              </button>
              <button onclick="app.showTab('tower')" class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-extrabold text-xs shadow-lg">
                Khiêu chiến Leo Tháp ➔
              </button>
            </div>
          </div>
        `;
      }
    }
  }

  // ==============================================================
  // RENDER DANH SÁCH ĐỀ THI (REAL EXAMS)
  // ==============================================================
  renderExamsList() {
    const container = document.getElementById('exams-content');
    if (!container) return;

    container.innerHTML = `
      <div id="exam-container">
        <div class="text-center max-w-xl mx-auto mb-8">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold mb-2">
            📜 ĐỀ THI HỌC KỲ I & TUYỂN SINH LỚP 10
          </div>
          <h2 class="text-3xl font-black text-white">LUYỆN THI THỰC CHIẾN CHUẨN ĐỀ BỘ</h2>
          <p class="text-slate-400 text-xs mt-2">Cấu trúc đề thi mới nhất gồm Trắc nghiệm 4 lựa chọn, Trắc nghiệm Đúng/Sai và Lời giải Tự luận chuẩn barem!</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          ${REAL_EXAMS.map(ex => `
            <div class="rounded-3xl p-6 glass-card border border-emerald-500/30 flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between mb-3">
                  <span class="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                    Thời gian: ${ex.duration} phút
                  </span>
                  <span class="text-xs text-slate-400">Năm học 2025 - 2026</span>
                </div>

                <h3 class="text-xl font-black text-white mb-2">${ex.title}</h3>
                <p class="text-xs text-slate-300 mb-4">${ex.school}</p>

                <div class="space-y-2 text-xs text-slate-400 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                  <div class="flex items-center gap-2">
                    <span class="text-emerald-400">✔</span>
                    <span>Phần I: 10 câu trắc nghiệm khách quan 4 phương án</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-emerald-400">✔</span>
                    <span>Phần II: Câu trắc nghiệm Đúng / Sai (4 ý con)</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-emerald-400">✔</span>
                    <span>Phần III: Lời giải tự luận bài toán thực tế & BĐT AM-GM</span>
                  </div>
                </div>
              </div>

              <div class="mt-6 flex gap-3">
                <button onclick="app.startRealExam('${ex.id}')" class="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/30 transition text-center">
                  Bắt Đầu Làm Đề ➔
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    game.renderMath(container);
  }

  // Bắt đầu làm đề thi thực tế
  startRealExam(examId) {
    if (!storage.isLoggedIn()) {
      this.promptLoginForAction({
        type: 'realExam',
        examId,
        message: '📜 Bạn cần đăng nhập tài khoản để làm bài thi thực chiến và lưu kết quả an toàn!'
      });
      return;
    }

    const exam = REAL_EXAMS.find(e => e.id === examId);
    if (!exam) return;

    this.activeExam = exam;
    this.examAnswers = {}; // { qNum: chosenIdx }

    const container = document.getElementById('exam-container');
    if (!container) return;

    const sec1 = exam.sections[0]; // Trắc nghiệm 10 câu
    const sec2 = exam.sections[1]; // Đúng sai
    const sec3 = exam.sections[2]; // Tự luận

    container.innerHTML = `
      <div class="max-w-3xl mx-auto rounded-3xl p-6 md:p-8 glass-panel border border-slate-700 shadow-2xl">
        <!-- Header đề thi -->
        <div class="border-b border-slate-700 pb-4 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <div class="text-xs font-bold text-amber-400 uppercase">${exam.school}</div>
            <h2 class="text-xl md:text-2xl font-black text-white">${exam.title}</h2>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="app.renderExamsList()" class="px-3 py-1.5 rounded-lg text-xs bg-slate-800 text-slate-300 border border-slate-700">
              ✖ Thoát
            </button>
          </div>
        </div>

        <div class="space-y-8">
          <!-- PHẦN I: TRẮC NGHIỆM -->
          <div>
            <div class="bg-blue-950/60 p-3 rounded-xl border border-blue-500/30 font-bold text-blue-300 text-sm mb-4">
              ${sec1.name}
            </div>

            <div class="space-y-6">
              ${sec1.questions.map((q, qIdx) => `
                <div class="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <div class="font-semibold text-slate-100 text-sm md:text-base mb-3">
                    <span class="text-amber-400 font-bold">Câu ${q.number}:</span> ${q.content}
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    ${q.options.map((opt, oIdx) => `
                      <label class="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs md:text-sm font-medium flex items-center gap-2 cursor-pointer transition">
                        <input type="radio" name="exam_q_${q.number}" value="${oIdx}" onchange="app.examAnswers['${q.number}'] = ${oIdx}" class="text-blue-500">
                        <span><strong>${['A', 'B', 'C', 'D'][oIdx]}.</strong> ${opt}</span>
                      </label>
                    `).join('')}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Nút Nộp Bài -->
          <div class="text-center pt-4 border-t border-slate-800">
            <button onclick="app.submitRealExam()" class="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-base shadow-xl shadow-emerald-500/30 transition transform hover:-translate-y-0.5">
              ✅ NỘP BÀI VÀ XEM ĐÁP ÁN CHI TIẾT
            </button>
          </div>

          <!-- PHẦN LỜI GIẢI TỰ LUẬN MẪU (ẨN CHO ĐẾN KHI NỘP BÀI) -->
          <div id="exam-solution-section" class="hidden mt-8 pt-8 border-t border-slate-700 space-y-6">
            <div class="bg-amber-950/60 p-4 rounded-xl border border-amber-500/30 font-bold text-amber-300 text-sm">
              ${sec3.name} - ĐÁP ÁN & BIỂU ĐIỂM CHÍNH THỨC
            </div>
            
            ${sec3.essayQuestions.map(eq => `
              <div class="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <div class="flex justify-between items-center mb-2">
                  <span class="font-bold text-cyan-400">${eq.number}</span>
                  <span class="text-xs bg-slate-800 px-2 py-0.5 rounded text-amber-400 font-semibold">${eq.score}</span>
                </div>
                <div class="text-slate-200 text-xs leading-relaxed whitespace-pre-line mb-3">${eq.text}</div>
                <div class="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-sans leading-relaxed">
                  <strong class="text-emerald-400">Đáp án gợi ý:</strong><br>
                  ${eq.solution.replace(/\n/g, '<br>')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    game.renderMath(container);
  }

  submitRealExam() {
    const sec1 = this.activeExam.sections[0];
    let correctCount = 0;

    sec1.questions.forEach(q => {
      const chosen = this.examAnswers[q.number];
      if (chosen === q.correctAnswer) {
        correctCount++;
      }
    });

    const score = ((correctCount / sec1.questions.length) * 10).toFixed(1);
    audio.playVictory();
    if (window.confetti) confetti({ particleCount: 80, spread: 60 });

    storage.addExp(correctCount * 15, (newLv) => app.showLevelUpModal(newLv));
    storage.checkAchievements((ach) => app.showAchievementNotification(ach));

    // Hiển thị phần tự luận
    const solSec = document.getElementById('exam-solution-section');
    if (solSec) solSec.classList.remove('hidden');

    alert(`🎉 Bạn đã nộp bài thành công!\nSố câu trắc nghiệm đúng: ${correctCount}/${sec1.questions.length}\nĐiểm trắc nghiệm quy đổi: ${score} / 10 điểm!\nHãy kéo xuống dưới để xem lời giải chi tiết và barem biểu điểm tự luận!`);
    
    game.renderMath(document.getElementById('exam-container'));
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }

  // ==============================================================
  // RENDER SỔ TAY CÔNG THỨC (CHEATSHEET)
  // ==============================================================
  renderCheatsheet() {
    const container = document.getElementById('cheatsheet-content');
    if (!container) return;

    container.innerHTML = `
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-8">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold mb-2">
            📖 BÍ KÍP CÔNG THỨC TOÁN 9
          </div>
          <h2 class="text-3xl font-black text-white">SỔ TAY CÔNG THỨC TOÀN DIỆN</h2>
          <p class="text-slate-400 text-xs mt-2">Tổng hợp trọn bộ công thức Đại số, Hình học trọng tâm cho ôn thi học kỳ và tuyển sinh vào 10!</p>

          <!-- Ô tìm kiếm công thức nhanh -->
          <div class="max-w-md mx-auto mt-4">
            <input type="text" id="formula-search" oninput="app.filterCheatsheet(this.value)"
              placeholder="🔍 Tìm nhanh: Vi-et, căn bậc hai, tiếp tuyến, diện tích..."
              class="w-full px-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-amber-500 shadow-inner">
          </div>
        </div>

        <div id="formula-list" class="space-y-6">
          ${FORMULA_BOOK.map(cat => `
            <div class="rounded-3xl p-6 glass-panel border border-slate-700/80 formula-cat-card">
              <div class="flex items-center gap-3 border-b border-slate-800 pb-3 mb-4">
                <span class="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-lg">
                  ${cat.icon}
                </span>
                <h3 class="text-lg font-black text-white">${cat.category}</h3>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${cat.items.map(item => `
                  <div class="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 formula-item">
                    <h4 class="font-bold text-amber-400 text-sm mb-2">${item.title}</h4>
                    <div class="text-slate-200 text-sm py-1 font-mono">${item.formula}</div>
                    <div class="text-[11px] text-slate-400 mt-2 italic bg-slate-950 p-2 rounded-lg border border-slate-800/80">
                      💡 ${item.note}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    game.renderMath(container);
  }

  filterCheatsheet(query) {
    const q = query.toLowerCase().trim();
    const items = document.querySelectorAll('.formula-item');
    items.forEach(it => {
      const text = it.innerText.toLowerCase();
      if (!q || text.includes(q)) {
        it.style.display = 'block';
      } else {
        it.style.display = 'none';
      }
    });
  }

  // ==============================================================
  // RENDER BẢNG VÀNG & THÀNH TỰU (LEADERBOARD)
  // ==============================================================
  renderLeaderboard() {
    const container = document.getElementById('leaderboard-content');
    if (!container) return;

    const list = storage.getLeaderboard();
    const myProfile = storage.profile;

    container.innerHTML = `
      <div class="max-w-3xl mx-auto space-y-8">
        <div class="text-center mb-6">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold mb-2">
            🏆 BẢNG VÀNG DANH DỰ
          </div>
          <h2 class="text-3xl font-black text-white">TOP CHIẾN THẦN TOÁN 9</h2>
          <p class="text-slate-400 text-xs mt-2">Vinh danh những bạn có thành tích cao nhất trong các bài thi và thử thách tốc độ!</p>
        </div>

        <!-- Danh sách xếp hạng -->
        <div class="rounded-3xl glass-panel border border-slate-700/80 overflow-hidden shadow-2xl">
          <div class="p-4 bg-slate-900/80 border-b border-slate-800 grid grid-cols-12 text-xs font-bold text-slate-400 uppercase">
            <div class="col-span-2 text-center">Hạng</div>
            <div class="col-span-6">Học Sinh</div>
            <div class="col-span-2 text-center">Cấp Độ</div>
            <div class="col-span-2 text-right pr-2">Điểm</div>
          </div>

          <div class="divide-y divide-slate-800/60">
            ${list.map((item, idx) => {
              const medal = idx === 0 ? '🥇' : (idx === 1 ? '🥈' : (idx === 2 ? '🥉' : `#${idx + 1}`));
              return `
                <div class="p-4 grid grid-cols-12 items-center text-sm ${idx < 3 ? 'bg-amber-500/5' : ''}">
                  <div class="col-span-2 text-center font-black ${idx === 0 ? 'text-amber-400 text-lg' : 'text-slate-300'}">
                    ${medal}
                  </div>
                  <div class="col-span-6 flex items-center gap-3">
                    <span class="text-2xl">${item.avatar || '🐱'}</span>
                    <div>
                      <div class="font-bold text-white">${item.name}</div>
                      ${item.streak ? `<div class="text-[10px] text-amber-400">🔥 Chuỗi ${item.streak}</div>` : ''}
                    </div>
                  </div>
                  <div class="col-span-2 text-center">
                    <span class="px-2 py-0.5 rounded-full bg-blue-900/50 text-blue-300 text-xs font-bold border border-blue-700/40">
                      Lv.${item.level}
                    </span>
                  </div>
                  <div class="col-span-2 text-right pr-2 font-black text-amber-400 text-base">
                    ${item.score}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Danh sách Huy Hiệu / Thành Tựu -->
        <div>
          <h3 class="text-xl font-black text-white mb-4 flex items-center gap-2">
            <span>🎖️ HUY HIỆU ĐÃ MỞ KHÓA</span>
            <span class="text-xs bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30">
              ${myProfile.unlockedAchievements.length} / ${ACHIEVEMENTS.length}
            </span>
          </h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            ${ACHIEVEMENTS.map(ach => {
              const isUnlocked = myProfile.unlockedAchievements.includes(ach.id);
              return `
                <div class="p-4 rounded-2xl glass-card border ${isUnlocked ? 'border-amber-500/40 bg-slate-900/80' : 'border-slate-800 bg-slate-950/40 opacity-50'} flex items-center gap-3">
                  <div class="text-3xl ${isUnlocked ? '' : 'grayscale'}">${ach.icon}</div>
                  <div>
                    <div class="font-bold text-sm text-white">${ach.name}</div>
                    <div class="text-[11px] text-slate-400">${ach.desc}</div>
                    <div class="text-[10px] text-amber-400 font-semibold mt-1">+${ach.exp} EXP</div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // ==============================================================
  // GÓC GIÁO VIÊN: THÊM CÂU HỎI & IN ĐỀ THI (TEACHER HUB)
  // ==============================================================
  renderTeacherDashboard() {
    const container = document.getElementById('teacher-content');
    if (!container) return;

    const customQs = storage.getCustomQuestions();

    container.innerHTML = `
      <div class="max-w-4xl mx-auto space-y-8">
        <div class="text-center mb-6">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold mb-2">
            👨‍🏫 KHÔNG GIAN DÀNH CHO THẦY CÔ
          </div>
          <h2 class="text-3xl font-black text-white">QUẢN LÝ ĐỀ THI & CÂU HỎI</h2>
          <p class="text-slate-400 text-xs mt-2">Thầy/Cô có thể tạo thêm câu hỏi trắc nghiệm mới, xuất đề thi ra giấy in hoặc chia sẻ cho học sinh làm bài!</p>
        </div>

        <!-- Các công cụ nhanh cho Giáo viên -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button onclick="app.showAddQuestionModal()" class="p-5 rounded-2xl glass-card border border-blue-500/30 hover:border-blue-400 text-left transition group">
            <div class="text-3xl mb-2 group-hover:scale-110 transition">➕</div>
            <div class="font-bold text-white text-sm">Thêm Câu Hỏi Mới</div>
            <div class="text-[11px] text-slate-400 mt-1">Soạn câu hỏi trắc nghiệm kèm công thức toán LaTeX</div>
          </button>

          <button onclick="window.print()" class="p-5 rounded-2xl glass-card border border-emerald-500/30 hover:border-emerald-400 text-left transition group">
            <div class="text-3xl mb-2 group-hover:scale-110 transition">🖨️</div>
            <div class="font-bold text-white text-sm">In Đề Thi Ra Giấy (A4)</div>
            <div class="text-[11px] text-slate-400 mt-1">Xuất đề thi chuẩn trường lớp kèm barem đáp án</div>
          </button>

          <button onclick="app.exportQuestionsJSON()" class="p-5 rounded-2xl glass-card border border-purple-500/30 hover:border-purple-400 text-left transition group">
            <div class="text-3xl mb-2 group-hover:scale-110 transition">💾</div>
            <div class="font-bold text-white text-sm">Sao Lưu Đề (JSON)</div>
            <div class="text-[11px] text-slate-400 mt-1">Tải xuống file câu hỏi để chuyển sang máy tính khác</div>
          </button>
        </div>

        <!-- Danh sách câu hỏi thầy/cô đã thêm -->
        <div class="rounded-3xl p-6 glass-panel border border-slate-700/80">
          <div class="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
            <h3 class="font-bold text-white text-base">Câu hỏi tùy chỉnh của Giáo viên (${customQs.length})</h3>
            <button onclick="app.showAddQuestionModal()" class="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow">
              + Soạn câu hỏi
            </button>
          </div>

          ${customQs.length === 0 ? `
            <div class="text-center py-8 text-slate-400 text-xs">
              Thầy/Cô chưa thêm câu hỏi tùy chỉnh nào. Hãy bấm "Thêm Câu Hỏi Mới" để bắt đầu soạn đề riêng cho lớp!
            </div>
          ` : `
            <div class="space-y-4">
              ${customQs.map((q, idx) => `
                <div class="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex justify-between items-start gap-4">
                  <div class="space-y-1">
                    <div class="text-xs font-bold text-cyan-400">${q.title}</div>
                    <div class="text-sm text-slate-200 font-medium">${q.content}</div>
                    <div class="text-xs text-emerald-400 font-semibold">Đáp án đúng: ${['A', 'B', 'C', 'D'][q.correctAnswer]}</div>
                  </div>
                  <button onclick="app.deleteQuestion('${q.id}')" class="px-2.5 py-1 text-xs bg-rose-950 text-rose-300 border border-rose-500/40 rounded-lg hover:bg-rose-900 transition shrink-0">
                    Xóa
                  </button>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>
    `;

    game.renderMath(container);
  }

  // Modal thêm câu hỏi mới
  showAddQuestionModal() {
    const modal = document.getElementById('modal-container');
    if (!modal) return;

    modal.innerHTML = `
      <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full shadow-2xl animate-pop-in max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center pb-3 border-b border-slate-800 mb-4">
            <h3 class="font-black text-white text-lg">Soạn Câu Hỏi Trắc Nghiệm Mới</h3>
            <button onclick="document.getElementById('modal-container').innerHTML=''" class="text-slate-400 hover:text-white">✖</button>
          </div>

          <form id="add-q-form" onsubmit="app.saveNewQuestion(event)" class="space-y-4 text-xs">
            <div>
              <label class="block text-slate-300 font-semibold mb-1">Chủ đề câu hỏi:</label>
              <select id="new-q-topic" class="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white">
                ${TOPICS.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
              </select>
            </div>

            <div>
              <label class="block text-slate-300 font-semibold mb-1">Tiêu đề / Dạng bài:</label>
              <input type="text" id="new-q-title" placeholder="VD: Giải hệ phương trình bằng phương pháp thế" required
                class="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white">
            </div>

            <div>
              <label class="block text-slate-300 font-semibold mb-1">Nội dung câu hỏi (hỗ trợ ký hiệu LaTeX: $x^2, \\sqrt{x}$):</label>
              <textarea id="new-q-content" rows="3" placeholder="Nhập câu hỏi tại đây..." required
                class="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"></textarea>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-slate-300 font-semibold mb-1">Phương án A:</label>
                <input type="text" id="new-q-opt-0" required class="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-white">
              </div>
              <div>
                <label class="block text-slate-300 font-semibold mb-1">Phương án B:</label>
                <input type="text" id="new-q-opt-1" required class="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-white">
              </div>
              <div>
                <label class="block text-slate-300 font-semibold mb-1">Phương án C:</label>
                <input type="text" id="new-q-opt-2" required class="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-white">
              </div>
              <div>
                <label class="block text-slate-300 font-semibold mb-1">Phương án D:</label>
                <input type="text" id="new-q-opt-3" required class="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-white">
              </div>
            </div>

            <div>
              <label class="block text-slate-300 font-semibold mb-1">Đáp án đúng:</label>
              <select id="new-q-correct" class="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white">
                <option value="0">Phương án A</option>
                <option value="1">Phương án B</option>
                <option value="2">Phương án C</option>
                <option value="3">Phương án D</option>
              </select>
            </div>

            <div>
              <label class="block text-slate-300 font-semibold mb-1">Lời giải chi tiết:</label>
              <textarea id="new-q-explain" rows="2" placeholder="Hướng dẫn giải từng bước..."
                class="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"></textarea>
            </div>

            <div class="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button type="button" onclick="document.getElementById('modal-container').innerHTML=''" class="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">
                Hủy bỏ
              </button>
              <button type="submit" class="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold">
                Lưu Câu Hỏi
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  saveNewQuestion(e) {
    e.preventDefault();
    const topicId = document.getElementById('new-q-topic').value;
    const title = document.getElementById('new-q-title').value;
    const content = document.getElementById('new-q-content').value;
    const opt0 = document.getElementById('new-q-opt-0').value;
    const opt1 = document.getElementById('new-q-opt-1').value;
    const opt2 = document.getElementById('new-q-opt-2').value;
    const opt3 = document.getElementById('new-q-opt-3').value;
    const correct = parseInt(document.getElementById('new-q-correct').value, 10);
    const explain = document.getElementById('new-q-explain').value || 'Không có giải thích chi tiết.';

    storage.addCustomQuestion({
      topicId: topicId,
      title: title,
      content: content,
      options: [opt0, opt1, opt2, opt3],
      correctAnswer: correct,
      explanation: explain,
      difficulty: 'medium',
      points: 15
    });

    document.getElementById('modal-container').innerHTML = '';
    alert('✅ Đã lưu câu hỏi thành công vào ngân hàng đề!');
    this.renderTeacherDashboard();
  }

  deleteQuestion(id) {
    if (confirm('Thầy/Cô có chắc chắn muốn xóa câu hỏi này?')) {
      storage.deleteCustomQuestion(id);
      this.renderTeacherDashboard();
    }
  }

  exportQuestionsJSON() {
    const all = storage.getAllQuestions();
    const blob = new Blob([JSON.stringify(all, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Ngan_Hang_Cau_Hoi_Toan_9_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  }

  // ==============================================================
  // THÔNG BÁO LEVEL UP & THÀNH TỰU
  // ==============================================================
  showLevelUpModal(newLevel) {
    audio.playLevelUp();
    if (window.confetti) {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
    }

    const modal = document.getElementById('modal-container');
    if (!modal) return;

    modal.innerHTML = `
      <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
        <div class="bg-gradient-to-b from-slate-900 to-indigo-950 border-2 border-amber-500 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-pop-in">
          <div class="text-7xl mb-3 animate-float">🎉</div>
          <div class="text-xs font-black text-amber-400 uppercase tracking-widest">CHÚC MỪNG THĂNG CẤP!</div>
          <h2 class="text-4xl font-black text-white mt-1">CẤP ĐỘ ${newLevel}</h2>
          <p class="text-slate-300 text-xs mt-3 leading-relaxed">
            Bạn đã mở khóa thêm nhiều thử thách mới và phần thưởng giá trị! Hãy tiếp tục rèn luyện để chạm đỉnh tháp nhé!
          </p>

          <button onclick="document.getElementById('modal-container').innerHTML=''" class="mt-6 w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-black text-sm shadow-xl shadow-amber-500/30">
            Tuyệt Vời! Nhận Thưởng ➔
          </button>
        </div>
      </div>
    `;
    this.updateHeaderStats();
  }

  showAchievementNotification(ach) {
    audio.playVictory();
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900/95 border-2 border-amber-500 text-white shadow-2xl flex items-center gap-3 animate-pop-in';
    toast.innerHTML = `
      <div class="text-3xl">${ach.icon}</div>
      <div>
        <div class="text-[10px] uppercase font-bold text-amber-400">HUY HIỆU MỚI!</div>
        <div class="font-extrabold text-sm">${ach.name}</div>
        <div class="text-xs text-slate-400">+${ach.exp} EXP</div>
      </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }

  // Bật / Tắt âm thanh
  initAudioToggle() {
    const btn = document.getElementById('sound-toggle-btn');
    if (!btn) return;

    btn.onclick = () => {
      const state = audio.toggle();
      btn.innerText = state ? '🔊 Bật' : '🔇 Tắt';
      btn.className = state ? 'px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600/30 text-blue-300 border border-blue-500/40 transition' : 'px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700 transition';
    };
  }

  // Đổi tên hoặc avatar người học & quản lý tài khoản
  showProfileModal() {
    const p = storage.profile;
    const modal = document.getElementById('modal-container');
    if (!modal) return;

    const isLoggedIn = storage.isLoggedIn();
    const user = storage.currentUser;

    modal.innerHTML = `
      <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-gradient-to-b from-slate-900 to-slate-950 border border-pink-500/30 rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-pop-in">
          <div class="flex justify-between items-center pb-3 border-b border-slate-800 mb-4">
            <div class="flex items-center gap-2">
              <h3 class="font-black text-white text-base">Hồ Sơ Học Sinh</h3>
              ${isLoggedIn ? `<span class="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>Đã kết nối</span>` : `<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">Chế độ Khách</span>`}
            </div>
            <button onclick="document.getElementById('modal-container').innerHTML=''" class="text-slate-400 hover:text-white">✖</button>
          </div>

          <div class="space-y-4">
            ${isLoggedIn ? `
              <div class="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-xs flex items-center justify-between">
                <div>
                  <div class="text-[11px] text-slate-400">Tên đăng nhập:</div>
                  <div class="font-bold text-pink-300 text-sm">@${user ? user.username : ''}</div>
                </div>
                <div class="text-right">
                  <div class="text-[11px] text-slate-400">Kỷ lục 60s:</div>
                  <div class="font-extrabold text-cyan-400 text-sm">${p.speedHighScore || 0} câu</div>
                </div>
              </div>
            ` : `
              <div class="p-3.5 rounded-2xl bg-pink-950/40 border border-pink-500/30 text-xs text-pink-200">
                ⚠️ Bạn đang ở chế độ <strong>Khách (chưa đăng nhập)</strong>. Đăng nhập để lưu tiến độ, bảng vàng và điểm số an toàn.
                <button type="button" onclick="app.showAuthModal('login')" class="w-full mt-2.5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition">
                  <span>🔑</span>
                  <span>Đăng Nhập Ngay</span>
                </button>
              </div>
            `}

            <div>
              <label class="block text-xs text-slate-400 mb-1">Tên hiển thị của bạn:</label>
              <input type="text" id="edit-player-name" value="${p.name}" class="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:border-pink-500 focus:outline-none">
            </div>

            <div>
              <label class="block text-xs text-slate-400 mb-2">Chọn Linh Vật (Avatar):</label>
              <div class="grid grid-cols-4 gap-2">
                ${AVATARS.map(av => {
                  const isUnlocked = p.unlockedAvatars.includes(av.id) || p.level >= av.unlockLevel;
                  return `
                    <button onclick="${isUnlocked ? `app.selectAvatar('${av.icon}')` : ''}"
                      class="p-2.5 rounded-xl border text-center ${p.avatar === av.icon ? 'border-pink-400 bg-pink-500/20' : 'border-slate-800 bg-slate-800/60'} ${isUnlocked ? 'hover:scale-105' : 'opacity-40 cursor-not-allowed'} transition">
                      <div class="text-2xl">${av.icon}</div>
                      <div class="text-[9px] text-slate-400 mt-1">${isUnlocked ? av.name.slice(0, 7) : `Lv.${av.unlockLevel}`}</div>
                    </button>
                  `;
                }).join('')}
              </div>
            </div>

            <button onclick="app.saveProfile()" class="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white font-bold text-xs shadow transition">
              Lưu Thay Đổi
            </button>

            ${isLoggedIn ? `
              <button onclick="app.logout()" class="w-full py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 font-bold text-xs transition flex items-center justify-center gap-1.5">
                <span>🚪</span>
                <span>Đăng Xuất Tài Khoản</span>
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }


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
    if (!storage.isLoggedIn()) {
      this.promptLoginForAction({
        type: 'advancedPractice',
        topicId,
        message: '⚡ Bạn cần đăng nhập tài khoản để làm bài tập nâng cao (điền số)!'
      });
      return;
    }

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


  // Toggle hiển thị danh sách các tính năng đã gom ngay tại Trang Chủ
  toggleHomeExpandedFeatures() {
    const box = document.getElementById('home-gathered-features-box');
    const label = document.getElementById('btn-toggle-label');
    const icon = document.getElementById('btn-toggle-icon');
    if (!box) return;

    if (box.classList.contains('hidden')) {
      box.classList.remove('hidden');
      if (label) label.innerText = 'Ẩn bớt các tính năng ▲';
      if (icon) icon.innerText = '▲';
      setTimeout(() => {
        box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 50);
    } else {
      box.classList.add('hidden');
      if (label) label.innerText = 'Ấn vào để xem các tính năng ▾';
      if (icon) icon.innerText = '▾';
    }
  }

  // Render trang riêng Mở Rộng khi click trên Navigation bar
  renderMoreView() {
    const container = document.getElementById('more-content');
    if (!container) return;
    const p = storage.profile;

    container.innerHTML = `
      <div class="max-w-6xl mx-auto">
        <!-- Banner Tiêu Đề Mục Mở Rộng -->
        <div class="relative rounded-3xl p-6 md:p-8 glass-panel border border-purple-500/30 overflow-hidden shadow-2xl bg-gradient-to-r from-purple-950/60 via-slate-900/80 to-blue-950/60 mb-8">
          <div class="absolute -right-8 -bottom-8 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div class="max-w-2xl">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-bold mb-3">
                <span>🌷 TÍNH NĂNG MỞ RỘNG</span>
                <span class="text-[10px] bg-purple-500/30 px-1.5 py-0.5 rounded uppercase">8 Chế độ & Kho Tài Liệu</span>
              </div>
              <h2 class="text-2xl md:text-3xl font-black text-white tracking-tight">
                ĐẤU TRƯỜNG & TIỆN ÍCH TOÁN 9 MỞ RỘNG
              </h2>
              <p class="text-xs md:text-sm text-slate-300 mt-2 leading-relaxed">
                Tập hợp đầy đủ các chế độ trò chơi đấu trí, thử thách phản xạ nhẩm nhanh 60 giây, song đấu đối kháng 1v1, luyện đề thi học kỳ chuẩn và sổ tay công thức tra cứu.
              </p>
            </div>

            <div class="shrink-0 flex gap-3">
              <button onclick="app.showTab('home')" class="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition flex items-center gap-2">
                <span>⬅ Về Trang Chủ</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Lưới 7 Tính Năng Đã Gom -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <!-- 1. Leo Tháp Tri Thức -->
          <div onclick="app.showTab('tower')" class="rounded-3xl p-6 glass-card border border-amber-500/30 hover:border-amber-400 hover:scale-[1.02] cursor-pointer transition flex flex-col justify-between group shadow-lg bg-gradient-to-b from-amber-950/20 to-slate-900/60">
            <div>
              <div class="flex justify-between items-start mb-3">
                <span class="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-2xl group-hover:scale-110 transition border border-amber-500/30">
                  🏰
                </span>
                <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-slate-700">
                  Tầng ${p.highestFloor}/10
                </span>
              </div>
              <h3 class="text-base font-black text-white group-hover:text-amber-300 transition">Leo Tháp Tri Thức</h3>
              <p class="text-xs text-slate-400 mt-2 leading-relaxed">Vượt qua 10 tầng tháp thử thách, chiến đấu đánh bại các Boss Toán học để giành vinh quang!</p>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs font-bold text-amber-400">
              <span>Bắt đầu leo tháp</span>
              <span>➔</span>
            </div>
          </div>

          <!-- 2. Thử Thách 60s Tốc Độ -->
          <div onclick="app.showTab('speed')" class="rounded-3xl p-6 glass-card border border-cyan-500/30 hover:border-cyan-400 hover:scale-[1.02] cursor-pointer transition flex flex-col justify-between group shadow-lg bg-gradient-to-b from-cyan-950/20 to-slate-900/60">
            <div>
              <div class="flex justify-between items-start mb-3">
                <span class="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-2xl group-hover:scale-110 transition border border-cyan-500/30">
                  ⚡
                </span>
                <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700">
                  Phản Xạ 60s
                </span>
              </div>
              <h3 class="text-base font-black text-white group-hover:text-cyan-300 transition">Thử Thách 60 Giây</h3>
              <p class="text-xs text-slate-400 mt-2 leading-relaxed">Rèn luyện kỹ năng nhẩm nhanh, phản xạ thần tốc giải trắc nghiệm toán dưới áp lực thời gian.</p>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs font-bold text-cyan-400">
              <span>Đua tốc độ ngay</span>
              <span>➔</span>
            </div>
          </div>

          <!-- 3. Song Đấu 1v1 -->
          <div onclick="app.showTab('pvp')" class="rounded-3xl p-6 glass-card border border-purple-500/30 hover:border-purple-400 hover:scale-[1.02] cursor-pointer transition flex flex-col justify-between group shadow-lg bg-gradient-to-b from-purple-950/20 to-slate-900/60">
            <div>
              <div class="flex justify-between items-start mb-3">
                <span class="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 font-bold flex items-center justify-center text-2xl group-hover:scale-110 transition border border-purple-500/30">
                  🐱
                </span>
                <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-800 text-purple-300 border border-slate-700">
                  2 Người Chơi
                </span>
              </div>
              <h3 class="text-base font-black text-white group-hover:text-purple-300 transition">Song Đấu 1v1 Đối Kháng</h3>
              <p class="text-xs text-slate-400 mt-2 leading-relaxed">Hai bạn cùng bấm phím trên 1 máy tính để so tài giải toán nhanh và chính xác nhất!</p>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs font-bold text-purple-400">
              <span>Thách đấu bạn bè</span>
              <span>➔</span>
            </div>
          </div>

          <!-- 4. Luyện Đề Thi Học Kỳ & Tuyển Sinh -->
          <div onclick="app.showTab('exams')" class="rounded-3xl p-6 glass-card border border-emerald-500/30 hover:border-emerald-400 hover:scale-[1.02] cursor-pointer transition flex flex-col justify-between group shadow-lg bg-gradient-to-b from-emerald-950/20 to-slate-900/60">
            <div>
              <div class="flex justify-between items-start mb-3">
                <span class="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-2xl group-hover:scale-110 transition border border-emerald-500/30">
                  🍓
                </span>
                <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-800 text-emerald-300 border border-slate-700">
                  Đề 2025-2026
                </span>
              </div>
              <h3 class="text-base font-black text-white group-hover:text-emerald-300 transition">Luyện Đề Thi Học Kỳ</h3>
              <p class="text-xs text-slate-400 mt-2 leading-relaxed">Bộ đề thi thật trường THCS Nghĩa An và Sở GD&ĐT chuẩn ma trận: trắc nghiệm, đúng/sai và tự luận.</p>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs font-bold text-emerald-400">
              <span>Làm bài thi thử</span>
              <span>➔</span>
            </div>
          </div>

          <!-- 5. Sổ Tay Công Thức Toán 9 -->
          <div onclick="app.showTab('cheatsheet')" class="rounded-3xl p-6 glass-card border border-yellow-500/30 hover:border-yellow-400 hover:scale-[1.02] cursor-pointer transition flex flex-col justify-between group shadow-lg bg-gradient-to-b from-yellow-950/20 to-slate-900/60">
            <div>
              <div class="flex justify-between items-start mb-3">
                <span class="w-12 h-12 rounded-2xl bg-yellow-500/20 text-yellow-400 font-bold flex items-center justify-center text-2xl group-hover:scale-110 transition border border-yellow-500/30">
                  📒
                </span>
                <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-800 text-yellow-300 border border-slate-700">
                  Cẩm Nang
                </span>
              </div>
              <h3 class="text-base font-black text-white group-hover:text-yellow-300 transition">Sổ Tay Công Thức</h3>
              <p class="text-xs text-slate-400 mt-2 leading-relaxed">Tra cứu thần tốc các công thức căn thức, hệ thức lượng, đường tròn, Vi-ét và hình khối không gian.</p>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs font-bold text-yellow-400">
              <span>Mở sổ tay tra cứu</span>
              <span>➔</span>
            </div>
          </div>

          <!-- 6. Bảng Vàng Vinh Danh -->
          <div onclick="app.showTab('leaderboard')" class="rounded-3xl p-6 glass-card border border-rose-500/30 hover:border-rose-400 hover:scale-[1.02] cursor-pointer transition flex flex-col justify-between group shadow-lg bg-gradient-to-b from-rose-950/20 to-slate-900/60">
            <div>
              <div class="flex justify-between items-start mb-3">
                <span class="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 font-bold flex items-center justify-center text-2xl group-hover:scale-110 transition border border-rose-500/30">
                  👑
                </span>
                <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-800 text-rose-300 border border-slate-700">
                  Top Điểm Cao
                </span>
              </div>
              <h3 class="text-base font-black text-white group-hover:text-rose-300 transition">Bảng Vàng Vinh Danh</h3>
              <p class="text-xs text-slate-400 mt-2 leading-relaxed">Xếp hạng thành tích các chiến binh chăm chỉ, chuỗi ngày streak cao và điểm số kỷ lục.</p>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs font-bold text-rose-400">
              <span>Xem bảng xếp hạng</span>
              <span>➔</span>
            </div>
          </div>

          <!-- 7. Góc Thầy Cô -->
          <div onclick="app.showTab('teacher')" class="rounded-3xl p-6 glass-card border border-indigo-500/30 hover:border-indigo-400 hover:scale-[1.02] cursor-pointer transition flex flex-col justify-between group shadow-lg bg-gradient-to-b from-indigo-950/20 to-slate-900/60">
            <div>
              <div class="flex justify-between items-start mb-3">
                <span class="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-2xl group-hover:scale-110 transition border border-indigo-500/30">
                  🌷
                </span>
                <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-slate-700">
                  Giáo Viên
                </span>
              </div>
              <h3 class="text-base font-black text-white group-hover:text-indigo-300 transition">Góc Thầy Cô</h3>
              <p class="text-xs text-slate-400 mt-2 leading-relaxed">Công cụ thêm câu hỏi riêng của giáo viên, xuất đề kiểm tra và quản lý lớp học dễ dàng.</p>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs font-bold text-indigo-400">
              <span>Vào góc thầy cô</span>
              <span>➔</span>
            </div>
          </div>
        </div>
      </div>
    `;

    setTimeout(() => game.renderMath(container), 30);
  }

  selectAvatar(icon) {
    storage.profile.avatar = icon;
    storage.saveProfile();
    this.updateHeaderStats();
    this.showProfileModal();
  }

  saveProfile() {
    const input = document.getElementById('edit-player-name');
    if (input && input.value.trim()) {
      storage.profile.name = input.value.trim();
      storage.saveProfile();
      this.updateHeaderStats();
    }
    document.getElementById('modal-container').innerHTML = '';
  }

  // ==============================================================
  // HỆ THỐNG XÁC THỰC: ĐĂNG NHẬP & TẠO TÀI KHOẢN
  // ==============================================================
  promptLoginForAction(action) {
    this.pendingAction = action;
    audio.playWrong();
    this.showAuthModal('login', action.message);
  }

  showAuthModal(initialTab = 'login', customMessage = null) {
    this.activeAuthTab = initialTab;
    this.selectedRegisterAvatar = '🐱';
    this.authCustomMessage = customMessage;
    this.renderAuthModal();
  }

  renderAuthModal() {
    const modal = document.getElementById('modal-container');
    if (!modal) return;

    const isLogin = this.activeAuthTab === 'login';
    const msg = this.authCustomMessage || 'Vui lòng đăng nhập hoặc tạo tài khoản để học tập, tham gia thử thách 60 giây và lưu trữ điểm số an toàn.';

    modal.innerHTML = `
      <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
        <div class="bg-gradient-to-b from-slate-900 to-slate-950 border border-pink-500/40 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl animate-pop-in relative overflow-hidden">
          
          <!-- Họa tiết trang trí nền -->
          <div class="absolute -top-12 -right-12 w-36 h-36 bg-pink-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div class="absolute -bottom-12 -left-12 w-36 h-36 bg-purple-500/10 rounded-full blur-2xl pointer-events-none"></div>

          <!-- Header Modal -->
          <div class="flex justify-between items-center pb-3 border-b border-slate-800/80 mb-4 relative z-10">
            <div class="flex items-center gap-2.5">
              <span class="w-9 h-9 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center text-lg shadow-md">
                ${isLogin ? '🔑' : '✨'}
              </span>
              <div>
                <h3 class="font-black text-white text-base">
                  ${isLogin ? 'Đăng Nhập Tài Khoản' : 'Tạo Tài Khoản Mới'}
                </h3>
                <p class="text-[11px] text-pink-300 font-medium">Hệ thống tài khoản học tập trực tuyến</p>
              </div>
            </div>
            <button onclick="app.closeAuthModal()" class="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm transition">✖</button>
          </div>

          <!-- Thông báo hướng dẫn / Gating alert -->
          <div class="p-3 rounded-2xl bg-pink-950/40 border border-pink-500/30 text-xs text-pink-200 mb-4 flex items-start gap-2.5 leading-relaxed relative z-10">
            <span class="text-base shrink-0 mt-0.5">🔒</span>
            <div class="flex-1">${msg}</div>
          </div>

          <!-- Tab Switcher -->
          <div class="grid grid-cols-2 p-1 rounded-2xl bg-slate-800/80 border border-slate-700/60 mb-5 relative z-10 text-xs font-bold">
            <button type="button" onclick="app.switchAuthTab('login')"
              class="py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${isLogin ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}">
              <span>🔑</span>
              <span>Đăng Nhập</span>
            </button>
            <button type="button" onclick="app.switchAuthTab('register')"
              class="py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${!isLogin ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}">
              <span>✨</span>
              <span>Tạo Tài Khoản</span>
            </button>
          </div>

          <!-- Error Alert Container -->
          <div id="auth-modal-error" class="hidden p-3 rounded-xl bg-rose-950/60 border border-rose-500/60 text-rose-200 text-xs font-semibold mb-4 flex items-center gap-2"></div>

          <!-- Form Đăng Nhập -->
          ${isLogin ? `
            <form onsubmit="app.handleLoginSubmit(event)" class="space-y-4 relative z-10">
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1.5">Tên đăng nhập (Username):</label>
                <div class="relative">
                  <span class="absolute left-3.5 top-2.5 text-slate-400">👤</span>
                  <input type="text" id="auth-login-username" required autocomplete="username"
                    placeholder="vd: hocsinh01 hoặc tên bạn đã tạo"
                    class="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white text-sm focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500">
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1.5">Mật khẩu:</label>
                <div class="relative">
                  <span class="absolute left-3.5 top-2.5 text-slate-400">🔒</span>
                  <input type="password" id="auth-login-password" required autocomplete="current-password"
                    placeholder="Nhập mật khẩu..."
                    class="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white text-sm focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500">
                </div>
              </div>

              <!-- Gợi ý tài khoản mẫu -->
              <div class="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs flex items-center justify-between gap-2">
                <div class="truncate">
                  <span class="text-amber-400 font-bold">💡 Mẫu có sẵn:</span>
                  <span class="text-slate-300 font-mono">hocsinh01 / 123456</span>
                </div>
                <button type="button" onclick="app.fillDemoAccount()"
                  class="shrink-0 px-2.5 py-1 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/40 font-bold text-[11px] transition">
                  Điền nhanh
                </button>
              </div>

              <button type="submit" id="auth-submit-btn"
                class="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-black text-sm shadow-lg shadow-pink-500/25 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2">
                <span>Đăng Nhập Ngay</span>
                <span>➔</span>
              </button>

              <div class="text-center pt-2">
                <button type="button" onclick="app.switchAuthTab('register')" class="text-xs text-pink-300 hover:text-white underline font-medium">
                  Chưa có tài khoản? Bấm để tạo tài khoản mới trong 10 giây
                </button>
              </div>
            </form>
          ` : `
            <!-- Form Tạo Tài Khoản -->
            <form onsubmit="app.handleRegisterSubmit(event)" class="space-y-3.5 relative z-10">
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">Tên đăng nhập (Username):</label>
                <div class="relative">
                  <span class="absolute left-3.5 top-2.5 text-slate-400">👤</span>
                  <input type="text" id="auth-reg-username" required pattern="[a-zA-Z0-9_]{3,30}"
                    placeholder="Từ 3-30 ký tự, viết liền không dấu (vd: toan9_mavis)"
                    class="w-full pl-10 pr-3 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-white text-xs sm:text-sm focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500">
                </div>
                <p class="text-[10px] text-slate-400 mt-0.5">Chỉ gồm chữ cái, chữ số và gạch dưới (_).</p>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">Tên hiển thị (Họ tên học sinh):</label>
                <div class="relative">
                  <span class="absolute left-3.5 top-2.5 text-slate-400">🎀</span>
                  <input type="text" id="auth-reg-displayname" required maxlength="50"
                    placeholder="vd: Mavis Hoàng Gia, Nguyễn Minh Đức..."
                    class="w-full pl-10 pr-3 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-white text-xs sm:text-sm focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500">
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">Mật khẩu:</label>
                <div class="relative">
                  <span class="absolute left-3.5 top-2.5 text-slate-400">🔒</span>
                  <input type="password" id="auth-reg-password" required minlength="4" maxlength="64"
                    placeholder="Tối thiểu 4 ký tự..."
                    class="w-full pl-10 pr-3 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-white text-xs sm:text-sm focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500">
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1.5">Chọn Linh Vật ban đầu:</label>
                <div class="grid grid-cols-5 gap-1.5" id="reg-avatar-grid">
                  ${['🐱', '🦊', '🐰', '🐼', '🦁', '🦉', '🦄', '🚀', '🌸', '⚡'].map(icon => `
                    <button type="button" onclick="app.selectRegisterAvatar('${icon}')"
                      class="reg-avatar-btn p-2 rounded-xl border text-xl flex items-center justify-center transition ${icon === this.selectedRegisterAvatar ? 'border-pink-400 bg-pink-500/20 scale-105 shadow-sm' : 'border-slate-800 bg-slate-800/60 hover:border-slate-600'}">
                      ${icon}
                    </button>
                  `).join('')}
                </div>
              </div>

              <button type="submit" id="auth-submit-btn"
                class="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-black text-sm shadow-lg shadow-pink-500/25 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2 mt-2">
                <span>Tạo Tài Khoản & Bắt Đầu Học</span>
                <span>➔</span>
              </button>

              <div class="text-center pt-1">
                <button type="button" onclick="app.switchAuthTab('login')" class="text-xs text-pink-300 hover:text-white underline font-medium">
                  Đã có tài khoản rồi? Bấm để đăng nhập ngay
                </button>
              </div>
            </form>
          `}

        </div>
      </div>
    `;
  }

  switchAuthTab(tab) {
    this.activeAuthTab = tab;
    this.renderAuthModal();
  }

  selectRegisterAvatar(icon) {
    this.selectedRegisterAvatar = icon;
    const btns = document.querySelectorAll('.reg-avatar-btn');
    btns.forEach(btn => {
      if (btn.innerText.trim() === icon) {
        btn.classList.add('border-pink-400', 'bg-pink-500/20', 'scale-105', 'shadow-sm');
        btn.classList.remove('border-slate-800', 'bg-slate-800/60');
      } else {
        btn.classList.remove('border-pink-400', 'bg-pink-500/20', 'scale-105', 'shadow-sm');
        btn.classList.add('border-slate-800', 'bg-slate-800/60');
      }
    });
  }

  fillDemoAccount() {
    const uInput = document.getElementById('auth-login-username');
    const pInput = document.getElementById('auth-login-password');
    if (uInput) uInput.value = 'hocsinh01';
    if (pInput) pInput.value = '123456';
    audio.playClick();
  }

  closeAuthModal() {
    const modal = document.getElementById('modal-container');
    if (modal) modal.innerHTML = '';
  }

  showAuthError(message) {
    const errEl = document.getElementById('auth-modal-error');
    if (errEl) {
      errEl.innerHTML = `<span>⚠️</span><span>${message}</span>`;
      errEl.classList.remove('hidden');
    }
  }

  async handleLoginSubmit(event) {
    event.preventDefault();
    const username = document.getElementById('auth-login-username')?.value.trim();
    const password = document.getElementById('auth-login-password')?.value;
    const submitBtn = document.getElementById('auth-submit-btn');

    if (!username || !password) {
      this.showAuthError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>⏳</span><span>Đang đăng nhập...</span>';
    }

    try {
      await storage.login(username, password);
      this.onAuthSuccess(`Đăng nhập thành công! Chào mừng bạn trở lại.`);
    } catch (error) {
      this.showAuthError(error.message || 'Đăng nhập không thành công.');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Đăng Nhập Ngay</span><span>➔</span>';
      }
      audio.playWrong();
    }
  }

  async handleRegisterSubmit(event) {
    event.preventDefault();
    const username = document.getElementById('auth-reg-username')?.value.trim();
    const displayName = document.getElementById('auth-reg-displayname')?.value.trim();
    const password = document.getElementById('auth-reg-password')?.value;
    const avatar = this.selectedRegisterAvatar || '🐱';
    const submitBtn = document.getElementById('auth-submit-btn');

    if (!username || !password) {
      this.showAuthError('Vui lòng nhập đầy đủ thông tin tài khoản.');
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>⏳</span><span>Đang khởi tạo tài khoản...</span>';
    }

    try {
      await storage.register(username, password, displayName, avatar);
      this.onAuthSuccess('Tạo tài khoản thành công! Bắt đầu trải nghiệm học tập ngay thôi!');
    } catch (error) {
      this.showAuthError(error.message || 'Tạo tài khoản thất bại.');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Tạo Tài Khoản & Bắt Đầu Học</span><span>➔</span>';
      }
      audio.playWrong();
    }
  }

  onAuthSuccess(message) {
    audio.playVictory();
    if (typeof confetti === 'function') {
      try {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      } catch {}
    }

    this.closeAuthModal();
    this.updateHeaderStats();
    this.showToast('THÀNH CÔNG', message, '🎉');

    // Nếu người dùng đang bấm vào một bài học hoặc thử thách trước đó, tiếp tục chuyển đến đó
    const pending = this.pendingAction;
    this.pendingAction = null;
    this.authCustomMessage = null;

    if (pending) {
      if (pending.type === 'tab') {
        this.showTab(pending.tab);
      } else if (pending.type === 'topicPractice') {
        this.showTab('topics');
        this.startTopicPractice(pending.topicId);
      } else if (pending.type === 'advancedPractice') {
        this.showTab('advanced');
        this.startAdvancedPractice(pending.topicId);
      } else if (pending.type === 'towerFloor') {
        this.showTab('tower');
        game.startTowerFloor(pending.floorNum);
      } else if (pending.type === 'realExam') {
        this.showTab('exams');
        this.startRealExam(pending.examId);
      }
    } else {
      if (this.currentTab === 'home') {
        this.renderHome();
      }
    }
  }

  async logout() {
    if (!confirm('Bạn có chắc chắn muốn đăng xuất khỏi tài khoản không?')) {
      return;
    }
    await storage.logout();
    this.updateHeaderStats();
    this.closeAuthModal();
    this.showToast('ĐÃ ĐĂNG XUẤT', 'Tài khoản đã đăng xuất an toàn.', '👋');
    this.showTab('home');
  }

  showToast(title, message, icon = '🌸') {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900/95 border-2 border-pink-500 text-white shadow-2xl flex items-center gap-3 animate-pop-in';
    toast.innerHTML = `
      <div class="text-3xl">${icon}</div>
      <div>
        <div class="text-[10px] uppercase font-bold text-pink-400">${title}</div>
        <div class="font-extrabold text-xs text-slate-100">${message}</div>
      </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }
}

const app = new AppController();
window.onload = async () => {
  await storage.initializeDatabaseSync();
  app.init();
};
