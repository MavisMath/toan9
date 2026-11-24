// ================================================================
// QUẢN LÝ GIAO DIỆN CHÍNH, TABS VÀ CÁC CHỨC NĂNG HỖ TRỢ
// ================================================================

const SVG_ICONS = {
  arrowRight: '<svg class="w-3.5 h-3.5 inline-block shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>',
  arrowLeft: '<svg class="w-3.5 h-3.5 inline-block shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/></svg>',
  chevronDown: '<svg class="w-3 h-3 inline-block shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/></svg>',
  chevronUp: '<svg class="w-3 h-3 inline-block shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4.5 15.75l7.5-7.5 7.5 7.5"/></svg>',
  check: '<svg class="w-4 h-4 inline-block shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M4.5 12.75l6 6 9-13.5"/></svg>',
  close: '<svg class="w-3.5 h-3.5 inline-block shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>',
  trash: '<svg class="w-3.5 h-3.5 inline-block shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>'
};
if (typeof window !== 'undefined') window.SVG_ICONS = SVG_ICONS;

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
    this.currentTheme = (typeof localStorage !== 'undefined' && localStorage.getItem('math9_theme')) || 'light';
  }

  init() {
    this.initCuteIcons();
    this.initTheme();
    this.initLanguage();
    this.initAudioToggle();
    if (typeof homework !== 'undefined' && homework.init) {
      homework.init();
    }
    this.updateHeaderStats();
    this.showTab('home');

    if (typeof window !== 'undefined' && window.i18n) {
      window.i18n.applyTranslations();
    }

    // Lắng nghe sự kiện click toàn cục để khởi động AudioContext
    document.addEventListener('click', () => {
      audio.init();
    }, { once: true });
  }

  // Khởi tạo bộ Animated Inline SVG mềm mại
  initCuteIcons() {
    if (typeof CuteIcons === 'undefined') return;

    // Logo chính (Mèo má hồng cute)
    const logoIcon = document.getElementById('brand-logo-icon');
    if (logoIcon) logoIcon.innerHTML = CuteIcons.cat;

    // Chatbot Mèo Toán (Nút nổi & Avatar header)
    const chatToggleIcon = document.getElementById('math-chat-toggle-icon');
    if (chatToggleIcon) chatToggleIcon.innerHTML = CuteIcons.cat;
    const chatAvatar = document.getElementById('math-chat-avatar');
    if (chatAvatar) chatAvatar.innerHTML = CuteIcons.cat;

    // Chỉ số thưởng Topbar: Sakura & Heart
    const streakIcon = document.getElementById('streak-flame-icon');
    if (streakIcon) streakIcon.innerHTML = CuteIcons.sakura;
    const heartIcon = document.getElementById('reward-heart-icon');
    if (heartIcon) heartIcon.innerHTML = CuteIcons.heart;

    // 4 Tab chính trên thanh điều hướng
    const navHome = document.getElementById('nav-icon-home');
    if (navHome) navHome.innerHTML = CuteIcons.moon;
    const navEx = document.getElementById('nav-icon-exercises');
    if (navEx) navEx.innerHTML = CuteIcons.butterfly;
    const navGames = document.getElementById('nav-icon-games');
    if (navGames) navGames.innerHTML = CuteIcons.tulip;
    const navMore = document.getElementById('nav-icon-more');
    if (navMore) navMore.innerHTML = CuteIcons.ribbon;

    // Nút âm thanh
    const soundIcon = document.getElementById('sound-icon');
    if (soundIcon) soundIcon.innerHTML = CuteIcons.ribbon;
  }

  // Quản lý Chế độ Giao diện Sáng / Tối (Light / Dark Theme)
  initTheme() {
    const savedTheme = (typeof localStorage !== 'undefined' && localStorage.getItem('math9_theme')) || 'light';
    this.applyTheme(savedTheme);
  }

  applyTheme(theme) {
    this.currentTheme = theme;
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      document.body.className = theme === 'dark'
        ? 'min-h-screen flex flex-col dark-theme'
        : 'min-h-screen flex flex-col light-theme';
      const icon = document.getElementById('theme-icon');
      const label = document.getElementById('theme-label');
      if (icon) {
        if (typeof CuteIcons !== 'undefined') {
          icon.innerHTML = theme === 'dark' ? CuteIcons.moon : CuteIcons.sun;
        } else {
          icon.innerText = theme === 'dark' ? '🌙' : '☀️';
        }
      }
      if (label) {
        label.innerText = theme === 'dark'
          ? (typeof i18n !== 'undefined' ? i18n.t('btn.themeDark') : 'Tối')
          : (typeof i18n !== 'undefined' ? i18n.t('btn.themeLight') : 'Sáng');
      }
    }
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('math9_theme', newTheme);
    }
    this.applyTheme(newTheme);
    if (typeof audio !== 'undefined') audio.playClick();
  }

  // Quản lý Đa ngôn ngữ (VI / EN)
  initLanguage() {
    const lang = (typeof window !== 'undefined' && window.i18n)
      ? window.i18n.getLanguage()
      : ((typeof localStorage !== 'undefined' && localStorage.getItem('math9_language')) || 'vi');
    this.updateLanguageButton(lang);
  }

  updateLanguageButton(lang) {
    const flag = document.getElementById('lang-flag');
    const label = document.getElementById('lang-label');
    if (flag) flag.innerText = lang === 'en' ? '🇬🇧' : '🇻🇳';
    if (label) label.innerText = lang.toUpperCase();
  }

  toggleLanguage() {
    if (typeof window === 'undefined' || !window.i18n) return;
    const newLang = window.i18n.toggleLanguage();
    this.updateLanguageButton(newLang);
    this.applyTheme(this.currentTheme);
    this.updateHeaderStats();
    if (this.currentTab === 'home') {
      this.renderHome();
    }
    if (typeof audio !== 'undefined') audio.playClick();
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
      nameEl.innerText = isLoggedIn ? p.name : (typeof i18n !== 'undefined' ? i18n.t('player.guest') : 'Khách (Chưa đăng nhập)');
    }
    if (avatarEl) {
      if (!isLoggedIn) {
        avatarEl.innerHTML = (typeof CuteIcons !== 'undefined') ? CuteIcons.sakura : '🌸';
      } else {
        avatarEl.innerText = p.avatar;
      }
    }
    if (levelEl) {
      levelEl.innerHTML = isLoggedIn
        ? `Lv.${p.level} <span class="inline-flex items-center gap-1 text-[9px] text-emerald-300 bg-emerald-950/60 px-1.5 py-0.5 rounded-full font-bold border border-emerald-500/30" title="Trực tuyến"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>Online</span>`
        : `Lv.${p.level}`;
    }
    if (diamondsEl) diamondsEl.innerText = p.diamonds || 50;
    const heartIcon = document.getElementById('reward-heart-icon');
    if (heartIcon && typeof CuteIcons !== 'undefined') {
      heartIcon.innerHTML = CuteIcons.heart;
    }
    if (streakEl) {
      streakEl.innerText = p.streak || 0;
      const streakIcon = document.getElementById('streak-flame-icon');
      if (streakIcon && typeof CuteIcons !== 'undefined') {
        streakIcon.innerHTML = CuteIcons.sakura;
      }
    }

    const needed = p.expToNextLevel || 100;
    const percent = Math.min(100, Math.floor((p.exp / needed) * 100));
    if (expTextEl) expTextEl.innerText = `${p.exp}/${needed} EXP (${percent}%)`;
    if (expBarEl) {
      expBarEl.style.width = `${percent}%`;
      if (!expBarEl.classList.contains('shimmer-bar')) {
        expBarEl.classList.add('shimmer-bar');
      }
    }

    if (authActionsEl) {
      if (isLoggedIn) {
        const u = storage.currentUser;
        authActionsEl.innerHTML = `
          <button onclick="app.logout()"
            class="btn-3d btn-3d-neutral px-3 py-1.5 text-xs font-bold shadow-sm flex items-center gap-1.5"
            title="${u ? `@${u.username} - ` : ''}${typeof i18n !== 'undefined' ? i18n.t('btn.logout') : 'Thoát'}">
            <span>🚪</span>
            <span>${typeof i18n !== 'undefined' ? i18n.t('btn.logout') : 'Thoát'}</span>
          </button>
        `;
      } else {
        const sparklesSvg = (typeof CuteIcons !== 'undefined') ? CuteIcons.sparkles : '✨';
        authActionsEl.innerHTML = `
          <button onclick="app.showAuthModal('login')"
            class="btn-3d btn-3d-honey px-3 py-1.5 text-xs font-black shadow-sm flex items-center gap-1.5">
            <span class="flex items-center justify-center">${sparklesSvg}</span>
            <span>${typeof i18n !== 'undefined' ? i18n.t('btn.login') : 'Đăng Nhập'}</span>
          </button>
        `;
      }
    }

    if (typeof homework !== 'undefined' && homework.updateNavBadge) {
      homework.updateNavBadge();
    }
  }

  // Hiệu ứng bắn pháo hoa giấy chúc mừng (Confetti) kiểu Duolingo
  triggerConfetti(options = {}) {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    const defaultOpts = {
      particleCount: 50,
      spread: 65,
      origin: { y: 0.65 },
      colors: ['#E07A86', '#E8A838', '#10B981', '#60A5FA', '#F472B6', '#F5C76B']
    };
    const opts = Object.assign({}, defaultOpts, options);

    if (typeof window.confetti === 'function') {
      try {
        window.confetti(opts);
      } catch (err) {
        console.warn('Canvas confetti error:', err);
      }
    }
  }

  // Thông báo động viên đáng yêu từ Mèo Toán khi làm sai
  showCatEncouragement(customMsg) {
    const existing = document.querySelector('.cat-encouragement-toast');
    if (existing) existing.remove();

    const quotes = [
      "Không sao cả bạn ơi! Vấp ngã là mẹ thành công nhé! 🐱✨",
      "Mèo tin bạn sẽ làm đúng câu sau, đừng nản lòng nha! 💪🌸",
      "Xem kỹ gợi ý lời giải rồi thử lại sức ở câu kế tiếp nhé! 🐾",
      "Sai một ly thì đi tìm lại một dặm, chiến binh toán học không bỏ cuộc! 🎯",
      "Chỉ thiếu một chút xíu nữa thôi! Hít thở sâu và tiếp tục nào! 🌟",
      "Học toán là một hành trình, mỗi lần sai là một lần nhớ sâu hơn! 💖"
    ];

    const quote = customMsg || quotes[Math.floor(Math.random() * quotes.length)];

    const toast = document.createElement('div');
    toast.className = 'cat-encouragement-toast';
    toast.setAttribute('role', 'status');
    const catAvatarSvg = (typeof CuteIcons !== 'undefined') ? CuteIcons.cat : '🐱';
    toast.innerHTML = `
      <div class="cat-encouragement-avatar">${catAvatarSvg}</div>
      <div class="cat-encouragement-text">
        <strong>Mèo Toán Nhắn Nhủ</strong>
        <span>${quote}</span>
      </div>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-hiding');
      setTimeout(() => toast.remove(), 350);
    }, 3200);
  }

  // Chuyển đổi giữa các tab
  showTab(tabName, subTab) {
    // Mapping alias
    if (tabName === 'topics') {
      tabName = 'exercises';
      subTab = 'basic';
    } else if (tabName === 'advanced') {
      tabName = 'exercises';
      subTab = 'advanced';
    } else if (tabName === 'extended') {
      tabName = 'more';
    }

    // Kiểm tra yêu cầu đăng nhập trước khi vào học hoặc thử thách
    const protectedTabs = ['speed', 'tower', 'exams', 'pvp', 'homework'];
    if (protectedTabs.includes(tabName) && !storage.isLoggedIn()) {
      const tabTitles = {
        speed: 'Thử Thách 60 Giây Tốc Độ',
        tower: 'Leo Tháp Tri Thức',
        exams: 'Luyện Đề Thi Học Kỳ & Tuyển Sinh Vào 10',
        pvp: 'Song Đấu 1v1',
        homework: 'Hệ Thống Giao & Nhận Bài Tập'
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
      btn.classList.remove('active-tab', 'bg-blue-600', 'bg-purple-600', 'text-white', 'shadow-lg');
    });

    // Kích hoạt tab được chọn
    const activeView = document.getElementById(`view-${tabName}`);
    if (activeView) activeView.classList.remove('hidden');

    const activeNavBtn = document.getElementById(`nav-${tabName}`);
    if (activeNavBtn) {
      activeNavBtn.classList.add('active-tab');
    } else {
      // Đồng bộ highlight cho các màn hình con thuộc 4 nhóm chính
      if (['exercises', 'topics', 'advanced'].includes(tabName)) {
        const exNavBtn = document.getElementById('nav-exercises');
        if (exNavBtn) exNavBtn.classList.add('active-tab');
      } else if (['games', 'tower', 'speed', 'pvp', 'leaderboard'].includes(tabName)) {
        const gamesNavBtn = document.getElementById('nav-games');
        if (gamesNavBtn) gamesNavBtn.classList.add('active-tab');
      } else if (['more', 'homework', 'teacher', 'exams', 'cheatsheet'].includes(tabName)) {
        const moreNavBtn = document.getElementById('nav-more');
        if (moreNavBtn) moreNavBtn.classList.add('active-tab');
      }
    }

    // Cuộn lên đầu trang mượt mà
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Khởi tạo nội dung tương ứng theo tab
    if (tabName === 'home') {
      this.renderHome();
    } else if (tabName === 'exercises') {
      this.renderExercisesView(subTab);
    } else if (tabName === 'games') {
      this.renderGamesView();
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
    } else if (tabName === 'homework') {
      if (typeof homework !== 'undefined') {
        homework.render();
      }
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
        <!-- Banner Nhắc Nhở Đăng Nhập & Tạo Tài Khoản (Bảng màu ấm áp, không dùng gradient tối) -->
        <div class="mb-6 p-5 rounded-3xl glass-card flex flex-col md:flex-row items-center justify-between gap-4" style="border-left: 6px solid var(--accent-rose);">
          <div class="flex items-center gap-3.5 text-left">
            <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0" style="background: var(--accent-rose-bg); color: var(--accent-rose-text); border: 1px solid rgba(242, 109, 133, 0.25);">
              🔒
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="font-black text-sm md:text-base" style="color: var(--text-main);">Chưa Đăng Nhập Tài Khoản Học Tập</span>
                <span class="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full" style="background: var(--accent-rose-bg); color: var(--accent-rose-text);">Cần đăng nhập</span>
              </div>
              <p class="text-xs mt-1 leading-relaxed font-medium" style="color: var(--text-secondary);">
                Để vào học bài tập cơ bản/nâng cao hoặc tham gia thử thách 60 giây tốc độ, bạn cần đăng nhập tài khoản. Dữ liệu học tập và điểm số sẽ được lưu trữ và bảo vệ an toàn.
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0 w-full md:w-auto">
            <button onclick="app.showAuthModal('login')" class="btn-3d btn-3d-honey w-full md:w-auto px-5 py-2.5 text-xs font-black shadow-md">
              <span>🔑</span>
              <span>Đăng Nhập Ngay</span>
            </button>
          </div>
        </div>
      ` : `
        <!-- Banner Tài Khoản Đang Hoạt Động -->
        <div class="mb-6 px-5 py-3 rounded-2xl glass-card text-xs flex flex-wrap items-center justify-between gap-3 shadow-sm" style="border-left: 6px solid #10B981;">
          <div class="flex items-center gap-2.5">
            <span class="text-base">🟢</span>
            <span style="color: var(--text-secondary);">Đang học với tài khoản: <strong style="color: var(--text-main);">@${storage.currentUser ? storage.currentUser.username : ''}</strong> (${p.name})</span>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="app.showProfileModal()" class="btn-3d btn-3d-neutral px-3 py-1 font-bold text-[11px]">Hồ sơ</button>
            <button onclick="app.logout()" class="btn-3d btn-3d-neutral px-3 py-1 font-bold text-[11px]" style="color: var(--accent-rose-text);">Đăng xuất</button>
          </div>
        </div>
      `}

      <!-- Banner Nhắc Nhở Bài Tập Đến Hạn & Hộp Thư Đến -->
      ${this.renderHomeHomeworkAlert()}

      <!-- Banner Chào Mừng & Hành Động Chính (Hero Banner Độ Tương Phản Cao, Bảng Màu Ấm Áp) -->
      <div class="hero-banner-warm relative rounded-3xl p-6 md:p-10 overflow-hidden shadow-2xl mb-8">
        <!-- Cành hoa đào trang trí góc trên phải -->
        <img src="assets/icons/peach_branch.png" alt="" class="hero-peach-branch" loading="lazy" aria-hidden="true" />
        <div class="relative z-10 max-w-2xl">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3 border"
            style="background: var(--hero-badge-bg); color: var(--hero-badge-text); border-color: var(--hero-border);">
            <span>🔥 ${typeof i18n !== 'undefined' ? i18n.t('home.streak') : 'Chuỗi ngày ôn luyện:'}</span>
            <span class="font-black">${p.streak} ${typeof i18n !== 'undefined' ? i18n.t('home.streakDays') : 'ngày'}</span>
          </div>
          <h1 class="text-3xl md:text-5xl font-black tracking-tight leading-tight" style="color: var(--hero-title);">
            ${typeof i18n !== 'undefined' ? i18n.t('home.heroTitle') : 'Chinh Phục Toán 9 Cực Đỉnh'}
          </h1>
          <p class="text-sm md:text-base mt-3 leading-relaxed font-medium" style="color: var(--hero-text);">
            ${typeof i18n !== 'undefined' ? i18n.t('home.heroDesc') : 'Học mà chơi, chơi mà học! Vượt ải boss, thi đấu tốc độ, làm chủ định lý Vi-ét, căn thức, hệ phương trình và bứt phá điểm 9-10 vào lớp 10!'}
          </p>

          <div class="flex flex-wrap gap-4 mt-6">
            <button onclick="app.showTab('tower')" class="btn-3d btn-3d-honey px-6 py-3.5 text-sm md:text-base font-black shadow-lg">
              <span>🏰 ${typeof i18n !== 'undefined' ? i18n.t('home.btnTower') : 'Leo Tháp Tri Thức'}</span>
              <span class="text-xs bg-black/15 px-2 py-0.5 rounded-full font-bold">Tầng ${p.highestFloor}/10</span>
            </button>
            <button onclick="app.showTab('speed')" class="btn-3d btn-3d-rose px-6 py-3.5 text-sm md:text-base font-black shadow-lg">
              <span>⚡ ${typeof i18n !== 'undefined' ? i18n.t('home.btnSpeed') : 'Thử Thách 60 Giây'}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Thống kê nhanh của người học: Mặt Hồ Gương Phản Chiếu Trời Xanh -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="p-5 stat-card-lake">
          <div class="text-xs font-bold uppercase tracking-wider" style="color: #4A6E8D;">${typeof i18n !== 'undefined' ? i18n.t('stats.curLevel') : 'CẤP ĐỘ HIỆN TẠI'}</div>
          <div class="text-3xl font-black mt-1" style="color: #2B6CB0;">Lv.${p.level}</div>
          <div class="text-[11px] mt-1 font-semibold" style="color: #5A7E9A;">${typeof i18n !== 'undefined' ? i18n.t('stats.rankNovice') : 'Chiến Binh Toán 9'}</div>
        </div>

        <div class="p-5 stat-card-lake">
          <div class="text-xs font-bold uppercase tracking-wider" style="color: #4A6E8D;">${typeof i18n !== 'undefined' ? i18n.t('stats.questionsDone') : 'CÂU HỎI ĐÃ LÀM'}</div>
          <div class="text-3xl font-black mt-1" style="color: var(--accent-rose);">${answeredCount}/${allQuestions.length}</div>
          <div class="text-[11px] mt-1 font-semibold" style="color: #5A7E9A;">${typeof i18n !== 'undefined' ? i18n.t('stats.richBank') : 'Ngân hàng phong phú'}</div>
        </div>

        <div class="p-5 stat-card-lake">
          <div class="text-xs font-bold uppercase tracking-wider" style="color: #4A6E8D;">${typeof i18n !== 'undefined' ? i18n.t('stats.towerFloor') : 'THÁP TRI THỨC'}</div>
          <div class="text-3xl font-black mt-1" style="color: #D9822B;">Tầng ${p.highestFloor}</div>
          <div class="text-[11px] mt-1 font-semibold" style="color: #5A7E9A;">${typeof i18n !== 'undefined' ? i18n.t('stats.targetFloor10') : 'Mục tiêu: Đỉnh Tháp 10'}</div>
        </div>

        <div class="p-5 stat-card-lake">
          <div class="text-xs font-bold uppercase tracking-wider" style="color: #4A6E8D;">${typeof i18n !== 'undefined' ? i18n.t('stats.speedRecord') : 'KỶ LỤC TỐC ĐỘ'}</div>
          <div class="text-3xl font-black mt-1" style="color: #10B981;">${p.speedHighScore || 0} pts</div>
          <div class="text-[11px] mt-1 font-semibold" style="color: #5A7E9A;">${typeof i18n !== 'undefined' ? i18n.t('stats.fastReflex') : 'Phản xạ nhẩm tính'}</div>
        </div>
      </div>

      <!-- Widget Nhắc Giờ Học Mỗi Ngày (Smart Daily Reminder) -->
      ${this.renderHomeStudyReminderWidget()}

      <!-- Banner chính lựa chọn mục học tập -->
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-black flex items-center gap-2" style="color: var(--text-main);">
          <span>🎯 ${typeof i18n !== 'undefined' ? i18n.t('curriculum.title') : 'CHƯƠNG TRÌNH HỌC TẬP & ÔN LUYỆN TOÁN 9'}</span>
        </h2>
        <span class="text-xs font-semibold hidden sm:inline" style="color: var(--text-muted);">${typeof i18n !== 'undefined' ? i18n.t('curriculum.sub') : '2 Chuyên mục trọng tâm & 1 Mục tính năng mở rộng'}</span>
      </div>

      <!-- 3 MỤC CHÍNH TRÊN TRANG CHỦ (LƯỚI 3 CỘT ĐỀU ĐẶN - 3 BỘ MÀU RỰC RỠ) -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        
        <!-- MỤC 1: KHO BÀI TẬP (BỘ HỒNG RỰC) -->
        <div onclick="app.showTab('exercises')" class="card-berry p-6 rounded-3xl cursor-pointer group flex flex-col justify-between shadow-sm">
          <div>
            <div class="flex items-center justify-between mb-4">
              <div class="card-icon-berry w-14 h-14 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition shadow-md">
                📚
              </div>
              <span class="badge-berry text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full">
                GDPT 2018 + Nâng Cao
              </span>
            </div>
            <h3 class="text-xl font-black transition" style="color: var(--text-main);">${typeof i18n !== 'undefined' ? i18n.t('card.exercisesTitle') : 'Kho Bài Tập'}</h3>
            <p class="text-xs mt-2 leading-relaxed" style="color: var(--text-secondary);">
              ${typeof i18n !== 'undefined' ? i18n.t('card.exercisesDesc') : 'Luyện tập 10 chuyên đề GDPT 2018 và 48 bài toán thực tế nâng cao điền số có lời giải chi tiết.'}
            </p>
          </div>
          <div class="mt-6 pt-4 border-t flex items-center justify-between" style="border-color: rgba(255, 77, 121, 0.25);">
            <button class="w-full btn-3d btn-card-berry py-2.5 text-xs font-black flex items-center justify-center gap-2">
              <span>${typeof i18n !== 'undefined' ? i18n.t('card.exercisesBtn') : 'Vào kho bài tập'}</span>
              ${SVG_ICONS.arrowRight}
            </button>
          </div>
        </div>

        <!-- MỤC 2: ĐẤU TRƯỜNG GAME (BỘ VÀNG NẮNG RỰC) -->
        <div onclick="app.showTab('games')" class="card-honey p-6 rounded-3xl cursor-pointer group flex flex-col justify-between shadow-sm">
          <div>
            <div class="flex items-center justify-between mb-4">
              <div class="card-icon-honey w-14 h-14 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition shadow-md">
                🎮
              </div>
              <span class="badge-honey text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full">
                4 Chế Độ Đấu Trí
              </span>
            </div>
            <h3 class="text-xl font-black transition" style="color: var(--text-main);">${typeof i18n !== 'undefined' ? i18n.t('card.gamesTitle') : 'Đấu Trường Game'}</h3>
            <p class="text-xs mt-2 leading-relaxed" style="color: var(--text-secondary);">
              ${typeof i18n !== 'undefined' ? i18n.t('card.gamesDesc') : 'Leo tháp 10 tầng diệt boss, thử thách tốc độ 60s, song đấu 1v1 đối kháng và bảng vàng vinh danh.'}
            </p>
          </div>
          <div class="mt-6 pt-4 border-t flex items-center justify-between" style="border-color: rgba(255, 159, 28, 0.25);">
            <button class="w-full btn-3d btn-card-honey py-2.5 text-xs font-black flex items-center justify-center gap-2">
              <span>${typeof i18n !== 'undefined' ? i18n.t('card.gamesBtn') : 'Vào đấu trường'}</span>
              ${SVG_ICONS.arrowRight}
            </button>
          </div>
        </div>

        <!-- MỤC 3: TIỆN ÍCH MỞ RỘNG (BỘ NÂU CARAMEL ẤM) -->
        <div onclick="app.showTab('more')" class="card-caramel p-6 rounded-3xl cursor-pointer group flex flex-col justify-between shadow-sm">
          <div>
            <div class="flex items-center justify-between mb-4">
              <div class="card-icon-caramel w-14 h-14 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition shadow-md">
                🧰
              </div>
              <span class="badge-caramel text-[10px] font-black uppercase px-2.5 py-1 rounded-full">
                4 Tiện Ích Học Tập
              </span>
            </div>
            <h3 class="text-xl font-black transition" style="color: var(--text-main);">${typeof i18n !== 'undefined' ? i18n.t('card.moreTitle') : 'Tiện Ích Mở Rộng'}</h3>
            <p class="text-xs mt-2 leading-relaxed" style="color: var(--text-secondary);">
              ${typeof i18n !== 'undefined' ? i18n.t('card.moreDesc') : 'Giao nhận bài tập theo username/email, góc giáo viên in đề A4, luyện đề thi học kỳ và cẩm nang công thức.'}
            </p>
          </div>
          <div class="mt-6 pt-4 border-t flex items-center justify-between" style="border-color: rgba(166, 93, 50, 0.25);">
            <button class="w-full btn-3d btn-card-caramel py-2.5 text-xs font-black flex items-center justify-center gap-2">
              <span>${typeof i18n !== 'undefined' ? i18n.t('card.moreBtn') : 'Khám phá tiện ích'}</span>
              ${SVG_ICONS.arrowRight}
            </button>
          </div>
        </div>
      </div>
        </div>
      </div>
    `;
  }

  // ==============================================================
  // RENDER VIEW BÀI TẬP (TAB 2: KHO BÀI TẬP)
  // ==============================================================
  renderExercisesView(subTab) {
    const targetSubtab = subTab || this.currentExerciseSubtab || 'basic';
    this.switchExercisesSubtab(targetSubtab);
  }

  switchExercisesSubtab(mode) {
    this.currentExerciseSubtab = mode;
    const btnBasic = document.getElementById('exercises-tab-btn-basic');
    const btnAdv = document.getElementById('exercises-tab-btn-advanced');
    const viewBasic = document.getElementById('exercises-subview-basic');
    const viewAdv = document.getElementById('exercises-subview-advanced');

    if (mode === 'advanced') {
      if (btnBasic) {
        btnBasic.className = 'flex-1 py-2.5 px-4 rounded-xl text-xs md:text-sm font-black transition flex items-center justify-center gap-2 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200';
      }
      if (btnAdv) {
        btnAdv.className = 'flex-1 py-2.5 px-4 rounded-xl text-xs md:text-sm font-black transition flex items-center justify-center gap-2 bg-amber-400 text-stone-900 shadow-md';
      }
      if (viewBasic) viewBasic.classList.add('hidden');
      if (viewAdv) viewAdv.classList.remove('hidden');
      this.renderAdvancedView();
    } else {
      if (btnBasic) {
        btnBasic.className = 'flex-1 py-2.5 px-4 rounded-xl text-xs md:text-sm font-black transition flex items-center justify-center gap-2 bg-amber-400 text-stone-900 shadow-md';
      }
      if (btnAdv) {
        btnAdv.className = 'flex-1 py-2.5 px-4 rounded-xl text-xs md:text-sm font-black transition flex items-center justify-center gap-2 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200';
      }
      if (viewBasic) viewBasic.classList.remove('hidden');
      if (viewAdv) viewAdv.classList.add('hidden');
      this.renderTopicsList();
    }
    setTimeout(() => game.renderMath(), 50);
  }

  // ==============================================================
  // RENDER VIEW GAME (TAB 3: ĐẤU TRƯỜNG GAME TOÁN HỌC)
  // ==============================================================
  renderGamesView() {
    const container = document.getElementById('games-content');
    if (!container) return;
    const p = storage.profile;

    container.innerHTML = `
      <div class="max-w-6xl mx-auto">
        <!-- Banner Tiêu Đề Đấu Trường Game -->
        <div class="hero-banner-warm relative rounded-3xl p-6 md:p-8 overflow-hidden shadow-xl mb-8">
          <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div class="max-w-2xl">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3 border"
                style="background: var(--accent-rose-bg); color: var(--accent-rose-text); border-color: rgba(242, 109, 133, 0.25);">
                <span>🎮</span>
                <span data-i18n="games.badge">ĐẤU TRƯỜNG TOÁN HỌC</span>
                <span class="text-[10px] px-1.5 py-0.5 rounded uppercase font-extrabold" style="background: rgba(242, 109, 133, 0.15);">4 Chế Độ</span>
              </div>
              <h2 class="text-2xl md:text-3xl font-black tracking-tight" style="color: var(--hero-title);">
                ${typeof i18n !== 'undefined' ? i18n.t('games.title') : 'Đấu Trường Game Toán Học'}
              </h2>
              <p class="text-xs md:text-sm mt-2 leading-relaxed font-medium" style="color: var(--hero-text);">
                ${typeof i18n !== 'undefined' ? i18n.t('games.subtitle') : 'Vượt ải boss tháp tri thức, rèn phản xạ nhẩm nhanh 60 giây, thi đấu đối kháng trực tiếp và vinh danh trên bảng vàng!'}
              </p>
            </div>
          </div>
        </div>

        <!-- Lưới 4 Chế Độ Game (3 Bộ Màu Nổi Bật) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- 1. Leo Tháp Tri Thức (Vàng Nắng Rực) -->
          <div onclick="app.showTab('tower')" class="card-honey p-6 rounded-3xl cursor-pointer group flex flex-col justify-between shadow-sm">
            <div>
              <div class="flex items-center justify-between mb-4">
                <div class="card-icon-honey w-14 h-14 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition shadow-md">
                  🏰
                </div>
                <span class="badge-honey text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full">
                  Tầng ${p.highestFloor}/10
                </span>
              </div>
              <h3 class="text-base font-black transition" style="color: var(--text-main);">${typeof i18n !== 'undefined' ? i18n.t('feat.tower') : 'Leo Tháp Tri Thức'}</h3>
              <p class="text-xs mt-2 leading-relaxed" style="color: var(--text-secondary);">
                ${typeof i18n !== 'undefined' ? i18n.t('feat.towerDesc') : 'Vượt 10 tầng tháp đối đầu các Boss Toán học cực đỉnh để mở khóa danh hiệu Chiến Thần.'}
              </p>
            </div>
            <div class="mt-6 pt-4 border-t" style="border-color: rgba(255, 159, 28, 0.25);">
              <button class="w-full btn-3d btn-card-honey py-2 text-xs font-black flex items-center justify-center gap-1.5">
                <span>Vào tháp đấu</span>
                ${SVG_ICONS.arrowRight}
              </button>
            </div>
          </div>

          <!-- 2. Thử Thách 60 Giây (Hồng Rực) -->
          <div onclick="app.showTab('speed')" class="card-berry p-6 rounded-3xl cursor-pointer group flex flex-col justify-between shadow-sm">
            <div>
              <div class="flex items-center justify-between mb-4">
                <div class="card-icon-berry w-14 h-14 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition shadow-md">
                  ⚡
                </div>
                <span class="badge-berry text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full">
                  ${p.speedHighScore || 0} pts
                </span>
              </div>
              <h3 class="text-base font-black transition" style="color: var(--text-main);">${typeof i18n !== 'undefined' ? i18n.t('feat.speed') : 'Thử Thách 60 Giây'}</h3>
              <p class="text-xs mt-2 leading-relaxed" style="color: var(--text-secondary);">
                ${typeof i18n !== 'undefined' ? i18n.t('feat.speedDesc') : 'Rèn luyện phản xạ tính nhẩm nhanh và đua điểm kỷ lục cá nhân trong 1 phút nghẹt thở.'}
              </p>
            </div>
            <div class="mt-6 pt-4 border-t" style="border-color: rgba(255, 77, 121, 0.25);">
              <button class="w-full btn-3d btn-card-berry py-2 text-xs font-black flex items-center justify-center gap-1.5">
                <span>Đua tốc độ</span>
                ${SVG_ICONS.arrowRight}
              </button>
            </div>
          </div>

          <!-- 3. Song Đấu 1v1 Đối Kháng (Nâu Caramel) -->
          <div onclick="app.showTab('pvp')" class="card-caramel p-6 rounded-3xl cursor-pointer group flex flex-col justify-between shadow-sm">
            <div>
              <div class="flex items-center justify-between mb-4">
                <div class="card-icon-caramel w-14 h-14 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition shadow-md">
                  ⚔️
                </div>
                <span class="badge-caramel text-[10px] font-black uppercase px-2.5 py-1 rounded-full">
                  2 Người
                </span>
              </div>
              <h3 class="text-base font-black transition" style="color: var(--text-main);">${typeof i18n !== 'undefined' ? i18n.t('feat.pvp') : 'Song Đấu 1v1'}</h3>
              <p class="text-xs mt-2 leading-relaxed" style="color: var(--text-secondary);">
                ${typeof i18n !== 'undefined' ? i18n.t('feat.pvpDesc') : 'Hai bạn cùng ngồi chung 1 máy tính so tài tốc độ trả lời câu hỏi trắc nghiệm đối kháng.'}
              </p>
            </div>
            <div class="mt-6 pt-4 border-t" style="border-color: rgba(166, 93, 50, 0.25);">
              <button class="w-full btn-3d btn-card-caramel py-2 text-xs font-black flex items-center justify-center gap-1.5">
                <span>Thách đấu</span>
                ${SVG_ICONS.arrowRight}
              </button>
            </div>
          </div>

          <!-- 4. Bảng Vàng Vinh Danh (Hồng Rực) -->
          <div onclick="app.showTab('leaderboard')" class="card-berry p-6 rounded-3xl cursor-pointer group flex flex-col justify-between shadow-sm">
            <div>
              <div class="flex items-center justify-between mb-4">
                <div class="card-icon-berry w-14 h-14 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition shadow-md">
                  👑
                </div>
                <span class="badge-berry text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full">
                  Vinh Danh
                </span>
              </div>
              <h3 class="text-base font-black transition" style="color: var(--text-main);">${typeof i18n !== 'undefined' ? i18n.t('feat.leaderboard') : 'Bảng Vàng Vinh Danh'}</h3>
              <p class="text-xs mt-2 leading-relaxed" style="color: var(--text-secondary);">
                ${typeof i18n !== 'undefined' ? i18n.t('feat.leaderboardDesc') : 'Vinh danh các bạn đạt điểm số cao, chuỗi ngày ôn luyện bền bỉ và tầng tháp cao nhất.'}
              </p>
            </div>
            <div class="mt-6 pt-4 border-t" style="border-color: rgba(255, 77, 121, 0.25);">
              <button class="w-full btn-3d btn-card-berry py-2 text-xs font-black flex items-center justify-center gap-1.5">
                <span>Xem bảng vàng</span>
                ${SVG_ICONS.arrowRight}
              </button>
            </div>
          </div>
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
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full badge-honey text-xs font-bold mb-2">
            🏆 THÁP TRI THỨC TOÁN 9 (10 TẦNG)
          </div>
          <h2 class="text-3xl font-black" style="color: var(--text-main);">CHỌN TẦNG THÁP ĐỂ KHIÊU CHIẾN</h2>
          <p class="text-xs mt-2" style="color: var(--text-secondary);">Hạ gục quái vật toán học từng tầng để mở khóa cổng tháp tiếp theo và nhận danh hiệu Chiến Thần!</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          ${TOWER_FLOORS.map(f => {
            const isUnlocked = f.floor <= highest;
            const isPassed = f.floor < highest;
            return `
              <div class="rounded-3xl p-5 transition cursor-pointer flex flex-col justify-between ${isUnlocked ? 'card-honey hover:scale-105' : 'opacity-60'}"
                style="${isUnlocked ? '' : 'background: var(--card-bg); border: 2px solid var(--border-soft);'}"
                ${isUnlocked ? `onclick="game.startTowerFloor(${f.floor})"` : ''}>
                <div>
                  <div class="flex justify-between items-center mb-3">
                    <span class="text-xs font-bold px-2 py-0.5 rounded-full ${isPassed ? 'badge-berry' : (isUnlocked ? 'badge-honey' : '')}"
                      style="${!isPassed && !isUnlocked ? 'background: var(--input-bg); color: var(--text-muted);' : ''}">
                      TẦNG ${f.floor}
                    </span>
                    <span>${isPassed ? '✅' : (isUnlocked ? '⚔️' : '🔒')}</span>
                  </div>
                  <div class="text-5xl text-center my-3">${f.bossAvatar}</div>
                  <h3 class="font-extrabold text-center text-sm" style="color: var(--text-main);">${f.boss}</h3>
                  <p class="text-[11px] text-center mt-1 line-clamp-2" style="color: var(--text-secondary);">${f.topic}</p>
                </div>

                <div class="mt-4 pt-3 border-t text-center" style="border-color: var(--border-soft);">
                  ${isUnlocked ? `
                    <button class="w-full btn-3d btn-3d-honey py-2 text-xs font-black">
                      ${isPassed ? '<span>Đấu Lại ⚔️</span>' : `<span>Vượt Ải Ngay</span> ${SVG_ICONS.arrowRight}`}
                    </button>
                  ` : `
                    <span class="text-xs font-medium" style="color: var(--text-muted);">Chưa mở khóa</span>
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

    const badgeText = typeof i18n !== 'undefined' ? i18n.t('topics.badge') : 'CHƯƠNG TRÌNH GDPT 2018';
    const titleText = typeof i18n !== 'undefined' ? i18n.t('topics.title') : 'CHINH PHỤC THEO CHUYÊN ĐỀ';
    const subtitleText = typeof i18n !== 'undefined' ? i18n.t('topics.subtitle') : 'Chọn chuyên đề bạn cần củng cố kiến thức để luyện tập từng câu kèm giải thích chi tiết!';
    const progressLabel = typeof i18n !== 'undefined' ? i18n.t('topics.progress') : 'Tiến độ chuyên đề:';
    const practiceBtnText = typeof i18n !== 'undefined' ? i18n.t('topics.practiceBtn') : 'Luyện Tập Chuyên Đề';

    container.innerHTML = `
      <div id="topic-container">
        <div class="text-center max-w-xl mx-auto mb-8">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-2 badge-berry">
            📚 ${badgeText}
          </div>
          <h2 class="text-3xl font-black" style="color: var(--text-main);">${titleText}</h2>
          <p class="text-xs mt-2" style="color: var(--text-secondary);">${subtitleText}</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          ${TOPICS.map((top, idx) => {
            const topQs = allQs.filter(q => q.topicId === top.id);
            const userProg = storage.profile.topicProgress[top.id] || { correct: 0, total: 0 };
            const percent = userProg.total > 0 ? Math.round((userProg.correct / userProg.total) * 100) : 0;
            const themeClass = idx % 3 === 0 ? 'card-berry' : (idx % 3 === 1 ? 'card-honey' : 'card-caramel');
            const iconClass = idx % 3 === 0 ? 'card-icon-berry' : (idx % 3 === 1 ? 'card-icon-honey' : 'card-icon-caramel');
            const badgeClass = idx % 3 === 0 ? 'badge-berry' : (idx % 3 === 1 ? 'badge-honey' : 'badge-caramel');
            const btnClass = idx % 3 === 0 ? 'btn-card-berry' : (idx % 3 === 1 ? 'btn-card-honey' : 'btn-card-caramel');

            const topName = typeof i18n !== 'undefined' ? (i18n.t('topic.' + top.id + '.name') || top.name) : top.name;
            const topDesc = typeof i18n !== 'undefined' ? (i18n.t('topic.' + top.id + '.desc') || top.description) : top.description;
            const topBadge = typeof i18n !== 'undefined' ? (i18n.t('topic.' + top.id + '.badge') || top.badge) : top.badge;

            return `
              <div onclick="app.startTopicPractice('${top.id}')"
                class="rounded-3xl p-6 ${themeClass} cursor-pointer transition flex flex-col justify-between">
                <div>
                  <div class="flex justify-between items-start mb-3">
                    <span class="w-12 h-12 rounded-2xl ${iconClass} flex items-center justify-center text-xl shadow-md font-bold">
                      ${top.icon}
                    </span>
                    <span class="text-[11px] font-bold px-2.5 py-1 rounded-full ${badgeClass}">
                      ${topBadge}
                    </span>
                  </div>

                  <h3 class="text-lg font-black mt-2" style="color: var(--text-main);">${topName}</h3>
                  <p class="text-xs mt-2 leading-relaxed" style="color: var(--text-secondary);">${topDesc}</p>
                </div>

                <div class="mt-6 pt-4 border-t" style="border-color: var(--card-border);">
                  <div class="flex justify-between text-xs font-bold mb-1">
                    <span style="color: var(--text-secondary);">${progressLabel}</span>
                    <span style="color: var(--accent-rose);">${userProg.correct}/${topQs.length} câu (${percent}%)</span>
                  </div>
                  <div class="w-full rounded-full h-2.5 overflow-hidden" style="background: var(--pill-bg); border: 1px solid var(--card-border);">
                    <div class="h-full rounded-full" style="width: ${percent}%; background: linear-gradient(90deg, #FF4D79, #FF9F1C);"></div>
                  </div>

                  <button class="w-full mt-4 py-2.5 rounded-xl btn-3d ${btnClass} text-xs font-bold transition flex items-center justify-center gap-2">
                    <span>${practiceBtnText}</span>
                    ${SVG_ICONS.arrowRight}
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
    const activeTopicName = typeof i18n !== 'undefined' ? (i18n.t('topic.' + this.activeTopic.id + '.name') || this.activeTopic.name) : this.activeTopic.name;
    const returnListText = typeof i18n !== 'undefined' ? i18n.t('topics.returnList') : 'Trở lại danh sách';

    container.innerHTML = `
      <div class="max-w-2xl mx-auto rounded-3xl p-6 md:p-8 glass-panel shadow-2xl">
        <!-- Header chuyên đề -->
        <div class="flex items-center justify-between pb-4 border-b mb-6" style="border-color: var(--card-border);">
          <div class="flex items-center gap-3">
            <span class="w-10 h-10 rounded-xl card-icon-berry flex items-center justify-center text-sm font-bold shadow-md">
              ${this.activeTopic.icon}
            </span>
            <div>
              <div class="text-xs font-bold uppercase" style="color: var(--text-secondary);">${activeTopicName}</div>
              <h3 class="text-base font-black" style="color: var(--text-main);">Câu ${this.topicQuestionIndex + 1} / ${total}</h3>
            </div>
          </div>
          <button onclick="app.renderTopicsList()" class="btn-3d btn-3d-neutral px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5">
            <span>${returnListText}</span> ${SVG_ICONS.close}
          </button>
        </div>

        <!-- Nội dung câu hỏi -->
        <div class="text-base md:text-lg font-bold mb-6" style="color: var(--text-main);">
          ${q.content}
        </div>

        <!-- 4 Lựa chọn -->
        <div class="space-y-3" id="topic-opts">
          ${q.options.map((opt, idx) => `
            <button onclick="app.handleTopicAnswer(${idx})" id="topic-opt-${idx}"
              class="option-btn w-full text-left p-4 rounded-2xl flex items-center gap-3">
              <span class="w-7 h-7 rounded-lg flex items-center justify-center font-black shrink-0 text-sm shadow-sm" style="background: var(--pill-bg); color: var(--cta-honey); border: 1px solid var(--card-border);">
                ${['A', 'B', 'C', 'D'][idx]}
              </span>
              <span class="flex-1 font-bold text-sm md:text-base">${opt}</span>
            </button>
          `).join('')}
        </div>

        <!-- Khung giải thích chi tiết sau khi trả lời -->
        <div id="topic-explanation" class="hidden mt-6 p-5 rounded-2xl text-sm border"></div>

        <!-- Nút câu tiếp theo -->
        <div id="topic-next-btn-box" class="hidden mt-6 flex justify-end">
          <button onclick="app.nextTopicQuestion()" class="btn-3d btn-3d-rose px-6 py-2.5 text-sm font-black shadow-lg flex items-center gap-2">
            <span>Câu Tiếp Theo</span> ${SVG_ICONS.arrowRight}
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
      if (audio.playBounce) audio.playBounce();
      if (selectedBtn) selectedBtn.classList.add('selected-correct', 'duo-bounce');
      this.triggerConfetti();
      storage.addExp(q.points || 10, (newLv) => app.showLevelUpModal(newLv));
      storage.checkAchievements((ach) => app.showAchievementNotification(ach));

      if (expBox) {
        expBox.className = 'mt-6 p-5 rounded-2xl text-sm border block duo-bounce';
        expBox.style.cssText = 'background: rgba(16, 185, 129, 0.15); border-color: rgba(16, 185, 129, 0.4); color: var(--text-main);';
        expBox.innerHTML = `
          <div class="font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 mb-2">
            <span>🎉 CHÍNH XÁC! (+${q.points || 10} EXP)</span>
          </div>
          <div class="leading-relaxed font-sans" style="color: var(--text-main);">
            <strong>Hướng dẫn giải chi tiết:</strong><br>
            ${q.explanation.replace(/\n/g, '<br>')}
          </div>
        `;
      }
    } else {
      audio.playWrong();
      if (audio.playEncourage) audio.playEncourage();
      if (selectedBtn) {
        selectedBtn.classList.add('selected-wrong', 'duo-shake');
        setTimeout(() => selectedBtn.classList.remove('duo-shake'), 600);
      }
      if (correctBtn) correctBtn.classList.add('selected-correct');
      this.showCatEncouragement();

      if (expBox) {
        expBox.className = 'mt-6 p-5 rounded-2xl text-sm border block';
        expBox.style.cssText = 'background: rgba(239, 68, 68, 0.15); border-color: rgba(239, 68, 68, 0.4); color: var(--text-main);';
        expBox.innerHTML = `
          <div class="font-extrabold text-rose-600 dark:text-rose-400 flex items-center gap-2 mb-2">
            <span>❌ RẤT TIẾC, CHƯA ĐÚNG!</span>
          </div>
          <div class="leading-relaxed font-sans" style="color: var(--text-main);">
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
            <div class="text-xs font-bold text-emerald-500 uppercase tracking-widest">Hoàn Thành Chuyên Đề</div>
            <h2 class="text-2xl font-black mt-1" style="color: var(--text-main);">XUẤT SẮC! BẠN ĐÃ RÈN LUYỆN XONG!</h2>
            <p class="text-xs mt-2" style="color: var(--text-secondary);">Toàn bộ câu hỏi trong <strong>${this.activeTopic.name}</strong> đã được bạn hoàn thành!</p>

            <div class="mt-6 flex justify-center gap-3">
              <button onclick="app.renderTopicsList()" class="btn-3d btn-3d-neutral px-5 py-2.5 text-xs font-bold">
                Chuyên đề khác
              </button>
              <button onclick="app.showTab('tower')" class="btn-3d btn-3d-honey px-6 py-2.5 text-xs font-black flex items-center gap-1.5">
                <span>Khiêu chiến Leo Tháp</span> ${SVG_ICONS.arrowRight}
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
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full badge-berry text-xs font-bold mb-2">
            📜 ĐỀ THI HỌC KỲ I & TUYỂN SINH LỚP 10
          </div>
          <h2 class="text-3xl font-black" style="color: var(--text-main);">LUYỆN THI THỰC CHIẾN CHUẨN ĐỀ BỘ</h2>
          <p class="text-xs mt-2" style="color: var(--text-secondary);">Cấu trúc đề thi mới nhất gồm Trắc nghiệm 4 lựa chọn, Trắc nghiệm Đúng/Sai và Lời giải Tự luận chuẩn barem!</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          ${REAL_EXAMS.map((ex, idx) => {
            const themeClass = idx % 2 === 0 ? 'card-berry' : 'card-honey';
            const btnClass = idx % 2 === 0 ? 'btn-card-berry' : 'btn-card-honey';
            return `
              <div class="rounded-3xl p-6 ${themeClass} flex flex-col justify-between shadow-sm">
                <div>
                  <div class="flex items-center justify-between mb-3">
                    <span class="px-2.5 py-1 rounded-full text-xs font-bold badge-honey">
                      Thời gian: ${ex.duration} phút
                    </span>
                    <span class="text-xs font-semibold" style="color: var(--text-secondary);">Năm học 2025 - 2026</span>
                  </div>

                  <h3 class="text-xl font-black mb-2" style="color: var(--text-main);">${ex.title}</h3>
                  <p class="text-xs font-semibold mb-4" style="color: var(--text-secondary);">${ex.school}</p>

                  <div class="space-y-2 text-xs p-4 rounded-2xl border" style="background: var(--surface-card); border-color: var(--card-border); color: var(--text-secondary);">
                    <div class="flex items-center gap-2">
                      <span class="text-emerald-500">${SVG_ICONS.check}</span>
                      <span>Phần I: 10 câu trắc nghiệm khách quan 4 phương án</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-emerald-500">${SVG_ICONS.check}</span>
                      <span>Phần II: Câu trắc nghiệm Đúng / Sai (4 ý con)</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-emerald-500">${SVG_ICONS.check}</span>
                      <span>Phần III: Lời giải tự luận bài toán thực tế & BĐT AM-GM</span>
                    </div>
                  </div>
                </div>

                <div class="mt-6 flex gap-3">
                  <button onclick="app.startRealExam('${ex.id}')" class="w-full py-3 rounded-xl btn-3d ${btnClass} font-black text-sm text-center flex items-center justify-center gap-2">
                    <span>Bắt Đầu Làm Đề</span> ${SVG_ICONS.arrowRight}
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
      <div class="max-w-3xl mx-auto rounded-3xl p-6 md:p-8 glass-panel shadow-2xl">
        <!-- Header đề thi -->
        <div class="pb-4 mb-6 flex flex-col md:flex-row justify-between items-center gap-4 border-b" style="border-color: var(--card-border);">
          <div>
            <div class="text-xs font-bold uppercase" style="color: var(--cta-honey);">${exam.school}</div>
            <h2 class="text-xl md:text-2xl font-black" style="color: var(--text-main);">${exam.title}</h2>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="app.renderExamsList()" class="btn-3d btn-3d-neutral px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5">
              ${SVG_ICONS.close} <span>Thoát</span>
            </button>
          </div>
        </div>

        <div class="space-y-8">
          <!-- PHẦN I: TRẮC NGHIỆM -->
          <div>
            <div class="p-3 rounded-xl border font-bold text-sm mb-4 badge-berry">
              ${sec1.name}
            </div>

            <div class="space-y-6">
              ${sec1.questions.map((q, qIdx) => `
                <div class="p-4 rounded-2xl border" style="background: var(--surface-card); border-color: var(--card-border);">
                  <div class="font-bold text-sm md:text-base mb-3" style="color: var(--text-main);">
                    <span class="font-black" style="color: var(--cta-honey);">Câu ${q.number}:</span> ${q.content}
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    ${q.options.map((opt, oIdx) => `
                      <label class="p-2.5 rounded-xl border text-xs md:text-sm font-semibold flex items-center gap-2 cursor-pointer transition option-btn" style="background: var(--surface-card-alt); border-color: var(--card-border); color: var(--text-main);">
                        <input type="radio" name="exam_q_${q.number}" value="${oIdx}" onchange="app.examAnswers['${q.number}'] = ${oIdx}" class="text-rose-500">
                        <span><strong>${['A', 'B', 'C', 'D'][oIdx]}.</strong> ${opt}</span>
                      </label>
                    `).join('')}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Nút Nộp Bài -->
          <div class="text-center pt-4 border-t" style="border-color: var(--card-border);">
            <button onclick="app.submitRealExam()" class="btn-3d btn-3d-rose px-8 py-3.5 font-black text-base shadow-xl">
              ✅ NỘP BÀI VÀ XEM ĐÁP ÁN CHI TIẾT
            </button>
          </div>

          <!-- PHẦN LỜI GIẢI TỰ LUẬN MẪU (ẨN CHO ĐẾN KHI NỘP BÀI) -->
          <div id="exam-solution-section" class="hidden mt-8 pt-8 border-t space-y-6" style="border-color: var(--card-border);">
            <div class="p-4 rounded-xl border font-bold text-sm badge-honey">
              ${sec3.name} - ĐÁP ÁN & BIỂU ĐIỂM CHÍNH THỨC
            </div>
            
            ${sec3.essayQuestions.map(eq => `
              <div class="p-5 rounded-2xl border" style="background: var(--surface-card); border-color: var(--card-border);">
                <div class="flex justify-between items-center mb-2">
                  <span class="font-black" style="color: var(--accent-rose);">${eq.number}</span>
                  <span class="text-xs px-2 py-0.5 rounded font-black badge-honey">${eq.score}</span>
                </div>
                <div class="text-xs leading-relaxed whitespace-pre-line mb-3 font-semibold" style="color: var(--text-main);">${eq.text}</div>
                <div class="p-4 rounded-xl border text-xs leading-relaxed font-sans" style="background: var(--surface-card-alt); border-color: var(--card-border); color: var(--text-main);">
                  <strong class="text-emerald-600 dark:text-emerald-400">Đáp án gợi ý:</strong><br>
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
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full badge-honey text-xs font-bold mb-2">
            📖 BÍ KÍP CÔNG THỨC TOÁN 9
          </div>
          <h2 class="text-3xl font-black" style="color: var(--text-main);">SỔ TAY CÔNG THỨC TOÀN DIỆN</h2>
          <p class="text-xs mt-2" style="color: var(--text-secondary);">Tổng hợp trọn bộ công thức Đại số, Hình học trọng tâm cho ôn thi học kỳ và tuyển sinh vào 10!</p>

          <!-- Ô tìm kiếm công thức nhanh -->
          <div class="max-w-md mx-auto mt-4">
            <input type="text" id="formula-search" oninput="app.filterCheatsheet(this.value)"
              placeholder="🔍 Tìm nhanh: Vi-et, căn bậc hai, tiếp tuyến, diện tích..."
              style="background: var(--surface-card); border: 2px solid var(--cta-honey); color: var(--text-main);"
              class="w-full px-4 py-3 rounded-2xl text-sm focus:outline-none shadow-inner font-semibold">
          </div>
        </div>

        <div id="formula-list" class="space-y-6">
          ${FORMULA_BOOK.map((cat, idx) => {
            const themeClass = idx % 2 === 0 ? 'card-honey' : 'card-caramel';
            const iconClass = idx % 2 === 0 ? 'card-icon-honey' : 'card-icon-caramel';
            return `
              <div class="rounded-3xl p-6 ${themeClass} shadow-sm formula-cat-card">
                <div class="flex items-center gap-3 pb-3 mb-4 border-b" style="border-color: var(--card-border);">
                  <span class="w-10 h-10 rounded-xl ${iconClass} font-bold flex items-center justify-center text-lg shadow-md">
                    ${cat.icon}
                  </span>
                  <h3 class="text-lg font-black" style="color: var(--text-main);">${cat.category}</h3>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  ${cat.items.map(item => `
                    <div class="p-4 rounded-2xl border formula-item" style="background: var(--surface-card); border-color: var(--card-border);">
                      <h4 class="font-black text-sm mb-2" style="color: var(--cta-honey);">${item.title}</h4>
                      <div class="text-sm py-1 font-mono font-bold" style="color: var(--text-main);">${item.formula}</div>
                      <div class="text-[11px] mt-2 italic p-2 rounded-lg border font-sans" style="background: var(--surface-card-alt); border-color: var(--card-border); color: var(--text-secondary);">
                        💡 ${item.note}
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            `;
          }).join('')}
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
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full badge-honey text-xs font-bold mb-2">
            🏆 BẢNG VÀNG DANH DỰ
          </div>
          <h2 class="text-3xl font-black" style="color: var(--text-main);">TOP CHIẾN THẦN TOÁN 9</h2>
          <p class="text-xs mt-2" style="color: var(--text-secondary);">Vinh danh những bạn có thành tích cao nhất trong các bài thi và thử thách tốc độ!</p>
        </div>

        <!-- Danh sách xếp hạng -->
        <div class="rounded-3xl glass-panel overflow-hidden shadow-2xl">
          <div class="p-4 border-b grid grid-cols-12 text-xs font-black uppercase" style="background: var(--surface-card-alt); border-color: var(--card-border); color: var(--text-secondary);">
            <div class="col-span-2 text-center">Hạng</div>
            <div class="col-span-6">Học Sinh</div>
            <div class="col-span-2 text-center">Cấp Độ</div>
            <div class="col-span-2 text-right pr-2">Điểm</div>
          </div>

          <div class="divide-y" style="border-color: var(--card-border);">
            ${list.map((item, idx) => {
              const medal = idx === 0 ? '🥇' : (idx === 1 ? '🥈' : (idx === 2 ? '🥉' : `#${idx + 1}`));
              return `
                <div class="p-4 grid grid-cols-12 items-center text-sm ${idx < 3 ? 'bg-amber-500/10' : ''}">
                  <div class="col-span-2 text-center font-black ${idx === 0 ? 'text-amber-500 text-lg' : ''}" style="color: var(--text-main);">
                    ${medal}
                  </div>
                  <div class="col-span-6 flex items-center gap-3">
                    <span class="text-2xl">${item.avatar || '🐱'}</span>
                    <div>
                      <div class="font-extrabold" style="color: var(--text-main);">${item.name}</div>
                      ${item.streak ? `<div class="text-[10px] font-bold text-amber-500">🔥 Chuỗi ${item.streak}</div>` : ''}
                    </div>
                  </div>
                  <div class="col-span-2 text-center">
                    <span class="px-2 py-0.5 rounded-full badge-berry text-xs font-bold">
                      Lv.${item.level}
                    </span>
                  </div>
                  <div class="col-span-2 text-right pr-2 font-black text-amber-500 text-base">
                    ${item.score}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        <!-- Danh sách Huy Hiệu / Thành Tựu -->
        <div>
          <h3 class="text-xl font-black mb-4 flex items-center gap-2" style="color: var(--text-main);">
            <span>🎖️ HUY HIỆU ĐÃ MỞ KHÓA</span>
            <span class="text-xs badge-honey px-2.5 py-0.5 rounded-full font-bold">
              ${myProfile.unlockedAchievements.length} / ${ACHIEVEMENTS.length}
            </span>
          </h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            ${ACHIEVEMENTS.map(ach => {
              const isUnlocked = myProfile.unlockedAchievements.includes(ach.id);
              return `
                <div class="p-4 rounded-2xl ${isUnlocked ? 'card-honey' : 'glass-panel opacity-60'} flex items-center gap-3">
                  <div class="text-3xl ${isUnlocked ? '' : 'grayscale'}">${ach.icon}</div>
                  <div>
                    <div class="font-bold text-sm" style="color: var(--text-main);">${ach.name}</div>
                    <div class="text-[11px]" style="color: var(--text-secondary);">${ach.desc}</div>
                    <div class="text-[10px] font-black text-amber-500 mt-1">+${ach.exp} EXP</div>
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
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full badge-berry text-xs font-bold mb-2">
            👨‍🏫 KHÔNG GIAN DÀNH CHO THẦY CÔ
          </div>
          <h2 class="text-3xl font-black" style="color: var(--text-main);">QUẢN LÝ ĐỀ THI & CÂU HỎI</h2>
          <p class="text-xs mt-2" style="color: var(--text-secondary);">Thầy/Cô có thể tạo thêm câu hỏi trắc nghiệm mới, xuất đề thi ra giấy in hoặc chia sẻ cho học sinh làm bài!</p>
        </div>

        <!-- Các công cụ nhanh cho Giáo viên -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button onclick="app.showAddQuestionModal()" class="card-berry p-5 rounded-2xl text-left transition group">
            <div class="text-3xl mb-2 group-hover:scale-110 transition">➕</div>
            <div class="font-bold text-sm" style="color: var(--text-main);">Thêm Câu Hỏi Mới</div>
            <div class="text-[11px] mt-1" style="color: var(--text-secondary);">Soạn câu hỏi trắc nghiệm kèm công thức toán LaTeX</div>
          </button>

          <button onclick="app.printExamPaper()" class="card-honey p-5 rounded-2xl text-left transition group">
            <div class="text-3xl mb-2 group-hover:scale-110 transition">🖨️</div>
            <div class="font-bold text-sm" style="color: var(--text-main);">In Đề Thi Ra Giấy (A4)</div>
            <div class="text-[11px] mt-1" style="color: var(--text-secondary);">Xuất đề thi chuẩn trường lớp kèm barem đáp án</div>
          </button>

          <button onclick="app.exportQuestionsJSON()" class="card-caramel p-5 rounded-2xl text-left transition group">
            <div class="text-3xl mb-2 group-hover:scale-110 transition">💾</div>
            <div class="font-bold text-sm" style="color: var(--text-main);">Sao Lưu Đề (JSON)</div>
            <div class="text-[11px] mt-1" style="color: var(--text-secondary);">Tải xuống file câu hỏi để chuyển sang máy tính khác</div>
          </button>
        </div>

        <!-- Danh sách câu hỏi thầy/cô đã thêm -->
        <div class="rounded-3xl p-6" style="background: var(--card-bg); border: 2px solid var(--border-soft); box-shadow: 0 4px 16px var(--shadow-color);">
          <div class="flex items-center justify-between pb-4 border-b mb-4" style="border-color: var(--border-soft);">
            <h3 class="font-bold text-base" style="color: var(--text-main);">Câu hỏi tùy chỉnh của Giáo viên (${customQs.length})</h3>
            <button onclick="app.showAddQuestionModal()" class="btn-3d btn-3d-berry px-4 py-2 text-xs font-bold">
              + Soạn câu hỏi
            </button>
          </div>

          ${customQs.length === 0 ? `
            <div class="text-center py-8 text-xs" style="color: var(--text-muted);">
              Thầy/Cô chưa thêm câu hỏi tùy chỉnh nào. Hãy bấm "Thêm Câu Hỏi Mới" để bắt đầu soạn đề riêng cho lớp!
            </div>
          ` : `
            <div class="space-y-4">
              ${customQs.map((q, idx) => `
                <div class="p-4 rounded-2xl flex justify-between items-start gap-4" style="background: var(--input-bg); border: 1px solid var(--border-soft);">
                  <div class="space-y-1">
                    <div class="text-xs font-bold badge-honey inline-block px-2 py-0.5 rounded">${q.title}</div>
                    <div class="text-sm font-medium" style="color: var(--text-main);">${q.content}</div>
                    <div class="text-xs font-semibold text-emerald-600">Đáp án đúng: ${['A', 'B', 'C', 'D'][q.correctAnswer]}</div>
                  </div>
                  <button onclick="app.deleteQuestion('${q.id}')" class="px-2.5 py-1 text-xs bg-rose-100 text-rose-700 border border-rose-300 rounded-lg hover:bg-rose-200 transition shrink-0 flex items-center gap-1 font-bold">
                    ${SVG_ICONS.trash} <span>Xóa</span>
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
      <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="rounded-3xl p-6 max-w-lg w-full shadow-2xl animate-pop-in max-h-[90vh] overflow-y-auto"
          style="background: var(--card-bg); border: 2px solid var(--border-soft); box-shadow: 0 16px 40px var(--shadow-color);">
          <div class="flex justify-between items-center pb-3 border-b mb-4" style="border-color: var(--border-soft);">
            <h3 class="font-black text-lg" style="color: var(--text-main);">Soạn Câu Hỏi Trắc Nghiệm Mới</h3>
            <button onclick="document.getElementById('modal-container').innerHTML=''" class="hover:opacity-80 flex items-center justify-center" style="color: var(--text-main);">${SVG_ICONS.close}</button>
          </div>

          <form id="add-q-form" onsubmit="app.saveNewQuestion(event)" class="space-y-4 text-xs">
            <div>
              <label class="block font-semibold mb-1" style="color: var(--text-secondary);">Chủ đề câu hỏi:</label>
              <select id="new-q-topic" class="w-full p-2.5 rounded-xl border" style="background: var(--input-bg); border-color: var(--border-soft); color: var(--text-main);">
                ${TOPICS.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
              </select>
            </div>

            <div>
              <label class="block font-semibold mb-1" style="color: var(--text-secondary);">Tiêu đề / Dạng bài:</label>
              <input type="text" id="new-q-title" placeholder="VD: Giải hệ phương trình bằng phương pháp thế" required
                class="w-full p-2.5 rounded-xl border" style="background: var(--input-bg); border-color: var(--border-soft); color: var(--text-main);">
            </div>

            <div>
              <label class="block font-semibold mb-1" style="color: var(--text-secondary);">Nội dung câu hỏi (hỗ trợ ký hiệu LaTeX: $x^2, \\sqrt{x}$):</label>
              <textarea id="new-q-content" rows="3" placeholder="Nhập câu hỏi tại đây..." required
                class="w-full p-2.5 rounded-xl border" style="background: var(--input-bg); border-color: var(--border-soft); color: var(--text-main);"></textarea>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold mb-1" style="color: var(--text-secondary);">Phương án A:</label>
                <input type="text" id="new-q-opt-0" required class="w-full p-2 rounded-lg border" style="background: var(--input-bg); border-color: var(--border-soft); color: var(--text-main);">
              </div>
              <div>
                <label class="block font-semibold mb-1" style="color: var(--text-secondary);">Phương án B:</label>
                <input type="text" id="new-q-opt-1" required class="w-full p-2 rounded-lg border" style="background: var(--input-bg); border-color: var(--border-soft); color: var(--text-main);">
              </div>
              <div>
                <label class="block font-semibold mb-1" style="color: var(--text-secondary);">Phương án C:</label>
                <input type="text" id="new-q-opt-2" required class="w-full p-2 rounded-lg border" style="background: var(--input-bg); border-color: var(--border-soft); color: var(--text-main);">
              </div>
              <div>
                <label class="block font-semibold mb-1" style="color: var(--text-secondary);">Phương án D:</label>
                <input type="text" id="new-q-opt-3" required class="w-full p-2 rounded-lg border" style="background: var(--input-bg); border-color: var(--border-soft); color: var(--text-main);">
              </div>
            </div>

            <div>
              <label class="block font-semibold mb-1" style="color: var(--text-secondary);">Đáp án đúng:</label>
              <select id="new-q-correct" class="w-full p-2.5 rounded-xl border" style="background: var(--input-bg); border-color: var(--border-soft); color: var(--text-main);">
                <option value="0">Phương án A</option>
                <option value="1">Phương án B</option>
                <option value="2">Phương án C</option>
                <option value="3">Phương án D</option>
              </select>
            </div>

            <div>
              <label class="block font-semibold mb-1" style="color: var(--text-secondary);">Lời giải chi tiết:</label>
              <textarea id="new-q-explain" rows="2" placeholder="Hướng dẫn giải từng bước..."
                class="w-full p-2.5 rounded-xl border" style="background: var(--input-bg); border-color: var(--border-soft); color: var(--text-main);"></textarea>
            </div>

            <div class="flex justify-end gap-3 pt-3 border-t" style="border-color: var(--border-soft);">
              <button type="button" onclick="document.getElementById('modal-container').innerHTML=''" class="btn-3d btn-3d-neutral px-4 py-2 text-xs font-bold">
                Hủy bỏ
              </button>
              <button type="submit" class="btn-3d btn-3d-honey px-5 py-2 text-xs font-black">
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

  printExamPaper() {
    const customQs = storage.getCustomQuestions();
    if (!customQs || customQs.length === 0) {
      if (typeof audio !== 'undefined') audio.playWrong();
      this.showToast(
        'CHƯA CÓ CÂU HỎI',
        'Thầy/Cô chưa có câu hỏi tùy chỉnh nào để in đề. Vui lòng bấm "+ Soạn câu hỏi" trước!',
        '⚠️'
      );
      return;
    }
    window.print();
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
        <div class="glass-panel rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-pop-in" style="border: 2px solid var(--cta-honey);">
          <div class="text-7xl mb-3 animate-float">🎉</div>
          <div class="text-xs font-black uppercase tracking-widest" style="color: var(--cta-honey);">CHÚC MỪNG THĂNG CẤP!</div>
          <h2 class="text-4xl font-black mt-1" style="color: var(--text-main);">CẤP ĐỘ ${newLevel}</h2>
          <p class="text-xs mt-3 leading-relaxed font-medium" style="color: var(--text-secondary);">
            Bạn đã mở khóa thêm nhiều thử thách mới và phần thưởng giá trị! Hãy tiếp tục rèn luyện để chạm đỉnh tháp nhé!
          </p>

          <button onclick="document.getElementById('modal-container').innerHTML=''" class="btn-3d btn-3d-honey mt-6 w-full py-3 text-sm font-black flex items-center justify-center gap-2 shadow-lg">
            <span>Tuyệt Vời! Nhận Thưởng</span> ${SVG_ICONS.arrowRight}
          </button>
        </div>
      </div>
    `;
    this.updateHeaderStats();
  }

  showAchievementNotification(ach) {
    audio.playVictory();
    const toast = document.createElement('div');
    toast.className = 'fixed top-6 right-6 z-50 p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-pop-in';
    toast.style.cssText = 'background: var(--card-bg); border: 2px solid #FFB732; box-shadow: 0 12px 32px var(--shadow-color); color: var(--text-main);';
    toast.innerHTML = `
      <div class="text-3xl">${ach.icon}</div>
      <div>
        <div class="text-[10px] uppercase font-bold" style="color: #FF9F1C;">HUY HIỆU MỚI!</div>
        <div class="font-extrabold text-sm" style="color: var(--text-main);">${ach.name}</div>
        <div class="text-xs" style="color: var(--text-muted);">+${ach.exp} EXP</div>
      </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }

  // Bật / Tắt âm thanh
  initAudioToggle() {
    const btn = document.getElementById('sound-toggle-btn');
    const icon = document.getElementById('sound-icon');
    const label = document.getElementById('sound-label');
    if (!btn) return;

    const updateSoundUI = (state) => {
      if (icon) {
        if (typeof CuteIcons !== 'undefined') {
          icon.innerHTML = CuteIcons.ribbon;
          icon.style.opacity = state ? '1' : '0.45';
        } else {
          icon.innerText = state ? '🔊' : '🔇';
        }
      }
      if (label) {
        label.innerText = state
          ? (typeof i18n !== 'undefined' ? i18n.t('btn.soundOn') : 'Âm thanh')
          : (typeof i18n !== 'undefined' ? i18n.t('btn.soundOff') : 'Tắt âm');
      }
    };

    updateSoundUI(audio.enabled);

    btn.onclick = () => {
      const state = audio.toggle();
      updateSoundUI(state);
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
      <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-pop-in"
          style="background: var(--card-bg); border: 2px solid var(--border-soft); box-shadow: 0 16px 40px var(--shadow-color);">
          <div class="flex justify-between items-center pb-3 border-b mb-4" style="border-color: var(--border-soft);">
            <div class="flex items-center gap-2">
              <h3 class="font-black text-base" style="color: var(--text-main);">Hồ Sơ Học Sinh</h3>
              ${isLoggedIn ? `<span class="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full badge-berry"><span class="w-1.5 h-1.5 rounded-full bg-pink-500"></span>Đã kết nối</span>` : `<span class="text-[10px] font-bold px-2 py-0.5 rounded-full border" style="background: var(--input-bg); border-color: var(--border-soft); color: var(--text-muted);">Chế độ Khách</span>`}
            </div>
            <button onclick="document.getElementById('modal-container').innerHTML=''" class="hover:opacity-80 flex items-center justify-center" style="color: var(--text-main);">${SVG_ICONS.close}</button>
          </div>

          <div class="space-y-4">
            ${isLoggedIn ? `
              <div class="p-3 rounded-2xl text-xs flex items-center justify-between" style="background: var(--input-bg); border: 1px solid var(--border-soft);">
                <div>
                  <div class="text-[11px]" style="color: var(--text-muted);">Tên đăng nhập:</div>
                  <div class="font-bold text-sm" style="color: #FF4D79;">@${user ? user.username : ''}</div>
                </div>
                <div class="text-right">
                  <div class="text-[11px]" style="color: var(--text-muted);">Kỷ lục 60s:</div>
                  <div class="font-extrabold text-sm text-amber-500">${p.speedHighScore || 0} câu</div>
                </div>
              </div>

              <!-- Xem và Cập nhật Email để nhận bài tập -->
              <div class="p-3 rounded-2xl text-xs space-y-2" style="background: var(--input-bg); border: 1px solid var(--border-soft);">
                <div class="flex items-center justify-between">
                  <span style="color: var(--text-muted);">Email nhận bài:</span>
                  <span class="font-bold ${user && user.email ? 'text-emerald-500' : 'text-amber-500'}">
                    ${user && user.email ? user.email : 'Chưa có email'}
                  </span>
                </div>
                <div class="flex gap-2">
                  <input type="email" id="edit-player-email" placeholder="Cập nhật email của bạn..." value="${user && user.email ? user.email : ''}"
                    class="flex-1 p-2 rounded-xl text-xs border"
                    style="background: var(--card-bg); border-color: var(--border-soft); color: var(--text-main);">
                  <button type="button" onclick="app.updateUserEmail()" class="btn-3d btn-3d-berry px-3 py-1.5 text-xs font-bold shrink-0">
                    Lưu
                  </button>
                </div>
              </div>
            ` : `
              <div class="p-3.5 rounded-2xl text-xs" style="background: rgba(255, 77, 121, 0.12); border: 1px solid #FF7AA2; color: var(--text-main);">
                ⚠️ Bạn đang ở chế độ <strong>Khách (chưa đăng nhập)</strong>. Đăng nhập để lưu tiến độ, bảng vàng và điểm số an toàn.
                <button type="button" onclick="app.showAuthModal('login')" class="w-full mt-2.5 btn-3d btn-3d-berry py-2 text-xs font-bold flex items-center justify-center gap-1.5">
                  <span>🔑</span>
                  <span>Đăng Nhập Ngay</span>
                </button>
              </div>
            `}

            <div>
              <label class="block text-xs mb-1 font-bold" style="color: var(--text-secondary);">Tên hiển thị của bạn:</label>
              <input type="text" id="edit-player-name" value="${p.name}" class="w-full p-2.5 rounded-xl border text-sm"
                style="background: var(--input-bg); border-color: var(--border-soft); color: var(--text-main);">
            </div>

            <div>
              <label class="block text-xs mb-2 font-bold" style="color: var(--text-secondary);">Chọn Linh Vật (Avatar):</label>
              <div class="grid grid-cols-4 gap-2">
                ${AVATARS.map(av => {
                  const isUnlocked = p.unlockedAvatars.includes(av.id) || p.level >= av.unlockLevel;
                  return `
                    <button onclick="${isUnlocked ? `app.selectAvatar('${av.icon}')` : ''}"
                      class="p-2.5 rounded-xl border text-center transition ${p.avatar === av.icon ? 'card-berry shadow-sm' : ''} ${isUnlocked ? 'hover:scale-105' : 'opacity-40 cursor-not-allowed'}"
                      style="${p.avatar === av.icon ? '' : 'background: var(--input-bg); border-color: var(--border-soft);'}">
                      <div class="text-2xl">${av.icon}</div>
                      <div class="text-[9px] mt-1" style="color: var(--text-muted);">${isUnlocked ? av.name.slice(0, 7) : `Lv.${av.unlockLevel}`}</div>
                    </button>
                  `;
                }).join('')}
              </div>
            </div>

            <button onclick="app.saveProfile()" class="w-full btn-3d btn-3d-honey py-2.5 text-xs font-black shadow">
              Lưu Thay Đổi
            </button>

            ${isLoggedIn ? `
              <button onclick="app.logout()" class="w-full py-2 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 border"
                style="background: rgba(255, 77, 121, 0.08); border-color: #FF7AA2; color: #FF4D79;">
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
        <div class="hero-banner-warm relative rounded-3xl p-6 md:p-8 overflow-hidden shadow-xl mb-8">
          <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div class="max-w-2xl">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3 border"
                style="background: var(--cta-honey-bg); color: var(--cta-honey-text); border-color: rgba(245, 166, 35, 0.25);">
                <span>⚡ BÀI TẬP VẬN DỤNG CAO 9-10 ĐIỂM</span>
                <span class="text-[10px] px-1.5 py-0.5 rounded uppercase font-extrabold" style="background: rgba(245, 166, 35, 0.15);">Dạng điền đáp án</span>
                <span class="text-[10px] px-2 py-0.5 rounded font-black border" style="background: var(--cta-honey-bg); color: var(--cta-honey-text); border-color: rgba(245, 166, 35, 0.3);">+25 EXP</span>
              </div>
              <h2 class="text-2xl md:text-3xl font-black tracking-tight" style="color: var(--hero-title);">
                CHUYÊN ĐỀ BÀI TẬP NÂNG CAO TOÁN 9
              </h2>
              <p class="text-xs md:text-sm mt-2 leading-relaxed font-medium" style="color: var(--hero-text);">
                Nguồn trích xuất từ <strong>Sách Bài Tập (SBT) Toán 9 Kết Nối Tri Thức Với Cuộc Sống</strong> (Tập 1 & Tập 2).
                Học sinh tự giải toán và <strong>điền kết quả ngắn</strong> vào ô đáp số.
                Hệ thống áp dụng thuật toán <strong>Random thông minh ngắt quãng</strong> giúp câu hỏi luôn đổi mới, <em>tuyệt đối không bị trùng lặp lại một câu quá nhiều lần</em>!
              </p>
            </div>

            <!-- Nút Thử Thách Random Tổng Hợp Toàn Bộ -->
            <div class="shrink-0 flex flex-col sm:flex-row md:flex-col gap-3">
              <button onclick="app.startAdvancedPractice('all')"
                class="btn-3d btn-3d-honey px-6 py-3.5 text-sm font-black flex items-center justify-center gap-2 shadow-lg">
                <span>🎲</span>
                <span>Luyện Random Toàn Bộ</span>
              </button>
              <button onclick="app.showTab('home')"
                class="btn-3d btn-3d-neutral px-4 py-2.5 text-xs font-bold text-center flex items-center justify-center gap-1.5">
                ${SVG_ICONS.arrowLeft} <span>${typeof i18n !== 'undefined' ? i18n.t('nav.home') : 'Về Trang Chủ'}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Thống Kê Tiến Độ Chinh Phục Bài Nâng Cao (3 Bộ Màu Rực Rỡ) -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div class="p-4 rounded-2xl card-honey">
            <div class="text-xs font-black uppercase" style="color: var(--text-secondary);">Đã Chinh Phục</div>
            <div class="text-2xl md:text-3xl font-black mt-1" style="color: var(--cta-honey);">${stats.solvedCount}/${stats.totalQuestions}</div>
            <div class="text-[11px] mt-1 font-semibold" style="color: var(--text-secondary);">Câu hỏi nâng cao</div>
          </div>

          <div class="p-4 rounded-2xl card-berry">
            <div class="text-xs font-black uppercase" style="color: var(--text-secondary);">Tỉ Lệ Chính Xác</div>
            <div class="text-2xl md:text-3xl font-black mt-1" style="color: var(--accent-rose);">${stats.accuracy}%</div>
            <div class="text-[11px] mt-1 font-semibold" style="color: var(--text-secondary);">${stats.correctCount} câu trả lời đúng</div>
          </div>

          <div class="p-4 rounded-2xl card-honey">
            <div class="text-xs font-black uppercase" style="color: var(--text-secondary);">Chuỗi Đúng Liên Tiếp</div>
            <div class="text-2xl md:text-3xl font-black mt-1" style="color: var(--cta-honey);">🔥 ${stats.streak}</div>
            <div class="text-[11px] mt-1 font-semibold" style="color: var(--text-secondary);">Kỉ lục: ${p.maxStreak || 0} câu</div>
          </div>

          <div class="p-4 rounded-2xl card-caramel">
            <div class="text-xs font-black uppercase" style="color: var(--text-secondary);">Kim Cương Tích Lũy</div>
            <div class="text-2xl md:text-3xl font-black mt-1" style="color: var(--accent-caramel);">💎 ${p.diamonds || 0}</div>
            <div class="text-[11px] mt-1 font-semibold" style="color: var(--text-secondary);">+5 💎 mỗi câu đúng</div>
          </div>
        </div>

        <!-- Bộ Lọc Học Kỳ: Tất cả / Tập 1 / Tập 2 -->
        <div class="flex items-center justify-between flex-wrap gap-3 mb-6 pb-3 border-b" style="border-color: var(--card-border);">
          <div class="flex items-center gap-2">
            <span class="text-xs font-black uppercase tracking-wide" style="color: var(--text-main);">📂 DANH SÁCH 10 CHUYÊN ĐỀ NÂNG CAO:</span>
          </div>

          <div class="flex items-center gap-2 text-xs font-bold">
            <button onclick="app.renderAdvancedView('all')"
              class="btn-3d ${selectedSemester === 'all' ? 'btn-3d-honey font-black' : 'btn-3d-neutral font-bold'} px-3.5 py-1.5 text-xs">
              Tất Cả (10 Chuyên đề)
            </button>
            <button onclick="app.renderAdvancedView('tap1')"
              class="btn-3d ${selectedSemester === 'tap1' ? 'btn-3d-rose font-black' : 'btn-3d-neutral font-bold'} px-3.5 py-1.5 text-xs">
              📘 SBT Tập 1 (Chương I - V)
            </button>
            <button onclick="app.renderAdvancedView('tap2')"
              class="btn-3d ${selectedSemester === 'tap2' ? 'btn-3d-caramel font-black' : 'btn-3d-neutral font-bold'} px-3.5 py-1.5 text-xs">
              📙 SBT Tập 2 (Chương VI - X)
            </button>
          </div>
        </div>

        <!-- Lưới 10 Chuyên Đề Nâng Cao -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          ${topics.map((t, idx) => {
            const topicQs = (typeof ADVANCED_FILL_QUESTIONS !== 'undefined') ? ADVANCED_FILL_QUESTIONS.filter(q => q.topicId === t.id) : [];
            const prog = (p.advancedTopicProgress && p.advancedTopicProgress[t.id]) ? p.advancedTopicProgress[t.id] : { correct: 0, total: 0 };
            const pct = topicQs.length > 0 ? Math.min(100, Math.round((prog.correct / topicQs.length) * 100)) : 0;
            const themeClass = idx % 3 === 0 ? 'card-honey' : (idx % 3 === 1 ? 'card-berry' : 'card-caramel');
            const iconClass = idx % 3 === 0 ? 'card-icon-honey' : (idx % 3 === 1 ? 'card-icon-berry' : 'card-icon-caramel');
            const badgeClass = idx % 3 === 0 ? 'badge-honey' : (idx % 3 === 1 ? 'badge-berry' : 'badge-caramel');
            const btnClass = idx % 3 === 0 ? 'btn-card-honey' : (idx % 3 === 1 ? 'btn-card-berry' : 'btn-card-caramel');

            return `
              <div onclick="app.startAdvancedPractice('${t.id}')"
                class="rounded-3xl p-6 ${themeClass} cursor-pointer transition flex flex-col justify-between group shadow-sm">
                <div>
                  <div class="flex justify-between items-start mb-3">
                    <span class="w-12 h-12 rounded-2xl ${iconClass} flex items-center justify-center text-xl shadow-md group-hover:scale-110 transition font-bold">
                      ${t.icon}
                    </span>
                    <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${badgeClass}">
                      ${t.badge}
                    </span>
                  </div>

                  <h3 class="text-base font-black mt-1 transition" style="color: var(--text-main);">${t.name}</h3>
                  <p class="text-xs mt-2 leading-relaxed" style="color: var(--text-secondary);">${t.description}</p>
                </div>

                <div class="mt-6 pt-4 border-t" style="border-color: var(--card-border);">
                  <div class="flex justify-between text-xs font-bold mb-1">
                    <span style="color: var(--text-secondary);">Tiến độ điền đúng:</span>
                    <span style="color: var(--cta-honey);">${prog.correct}/${topicQs.length} câu (${pct}%)</span>
                  </div>
                  <div class="w-full rounded-full h-2.5 overflow-hidden" style="background: var(--pill-bg); border: 1px solid var(--card-border);">
                    <div class="h-full rounded-full transition-all" style="width: ${pct}%; background: linear-gradient(90deg, #FF9F1C, #FF4D79);"></div>
                  </div>

                  <button class="w-full mt-4 py-2.5 rounded-xl btn-3d ${btnClass} font-bold text-xs transition flex items-center justify-center gap-2">
                    <span>Luyện Chuyên Đề Này</span>
                    ${SVG_ICONS.arrowRight}
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
      <div class="max-w-3xl mx-auto rounded-3xl p-6 md:p-8 glass-panel shadow-2xl relative">
        <!-- Header thanh điều hướng bài tập -->
        <div class="flex flex-wrap items-center justify-between pb-4 border-b mb-6 gap-3" style="border-color: var(--card-border);">
          <div class="flex items-center gap-3">
            <span class="w-10 h-10 rounded-xl card-icon-honey flex items-center justify-center text-lg font-bold shadow-md">
              ${topicIcon}
            </span>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-black uppercase" style="color: var(--cta-honey);">${topicName}</span>
                <span class="badge-honey text-[10px] font-bold px-2 py-0.5 rounded-full">
                  ${q.difficulty}
                </span>
              </div>
              <h3 class="text-sm font-black mt-0.5" style="color: var(--text-main);">${q.title}</h3>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button onclick="app.loadNextAdvancedQuestion('${q.id}')"
              class="btn-3d btn-3d-neutral px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5"
              title="Đổi sang câu hỏi ngẫu nhiên khác (không bị tính lượt làm)">
              <span>🔀</span><span>Đổi câu khác</span>
            </button>
            <button onclick="app.renderAdvancedView()"
              class="btn-3d btn-3d-neutral px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5">
              ${SVG_ICONS.close} <span>Thoát</span>
            </button>
          </div>
        </div>

        <!-- Huy hiệu Nguồn & Điểm thưởng -->
        <div class="flex items-center justify-between mb-4 text-xs font-medium px-4 py-2.5 rounded-xl border" style="background: var(--pill-bg); border-color: var(--card-border); color: var(--text-secondary);">
          <div class="flex items-center gap-1.5">
            <span>📖 Nguồn:</span>
            <span class="font-bold" style="color: var(--text-main);">${q.source}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="font-black" style="color: var(--cta-honey);">+25 EXP</span>
            <span class="font-black" style="color: var(--accent-rose);">+5 💎</span>
          </div>
        </div>

        <!-- Đề bài câu hỏi với KaTeX -->
        <div class="p-5 md:p-6 rounded-2xl border text-base md:text-lg font-bold leading-relaxed mb-6" style="background: var(--surface-card); border-color: var(--card-border); color: var(--text-main);" id="advanced-q-content">
          ${q.content}
        </div>

        <!-- Khung Gợi Ý Phương Pháp (Mở rộng/Thu gọn) -->
        ${q.hint ? `
          <div class="mb-6">
            <button onclick="app.toggleAdvancedHint()" type="button"
              class="btn-3d btn-3d-honey text-xs font-bold flex items-center gap-1.5 px-3.5 py-1.5">
              <span>💡</span>
              <span id="hint-toggle-text">Xem Gợi Ý Phương Pháp Giải</span>
            </button>
            <div id="advanced-hint-box" class="hidden mt-2 p-4 rounded-xl border text-xs leading-relaxed" style="background: var(--surface-card-alt); border-color: var(--card-border); color: var(--text-main);">
              <strong>Gợi ý:</strong> ${q.hint}
            </div>
          </div>
        ` : ''}

        <!-- Khu vực Điền Đáp Án -->
        <div class="p-5 md:p-6 rounded-2xl border mb-6" style="background: var(--surface-card-alt); border-color: var(--card-border);">
          <label for="advanced-input" class="block text-xs font-black uppercase tracking-wider mb-2 flex items-center gap-2" style="color: var(--text-main);">
            <span>✍️</span><span>NHẬP ĐÁP SỐ CỦA BẠN:</span>
          </label>

          <div class="relative">
            <input type="text" id="advanced-input"
              placeholder="${q.placeholder || 'Nhập đáp số (ví dụ: 5, -2, 3/4, 0.5)...'}"
              autocomplete="off"
              style="background: var(--surface-card); border: 2px solid var(--cta-honey); color: var(--text-main);"
              class="w-full p-4 pr-12 rounded-xl text-lg md:text-xl font-mono font-bold focus:outline-none focus:ring-4 focus:ring-amber-500/20 transition shadow-inner">
            <span class="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold pointer-events-none" style="color: var(--text-muted);">
              ↵ Enter
            </span>
          </div>

          <!-- Bàn phím ký hiệu toán học nhanh -->
          <div class="mt-3 flex flex-wrap items-center gap-1.5">
            <span class="text-[11px] font-bold mr-1" style="color: var(--text-muted);">Chèn nhanh:</span>
            <button type="button" onclick="app.insertAdvancedSymbol('-')" class="btn-3d btn-3d-neutral px-3 py-1 text-xs font-mono font-bold">-</button>
            <button type="button" onclick="app.insertAdvancedSymbol('/')" class="btn-3d btn-3d-neutral px-3 py-1 text-xs font-mono font-bold">/</button>
            <button type="button" onclick="app.insertAdvancedSymbol('.')" class="btn-3d btn-3d-neutral px-3 py-1 text-xs font-mono font-bold">.</button>
            <button type="button" onclick="app.insertAdvancedSymbol('√')" class="btn-3d btn-3d-neutral px-3 py-1 text-xs font-mono font-bold">√</button>
            <button type="button" onclick="app.insertAdvancedSymbol('π')" class="btn-3d btn-3d-neutral px-3 py-1 text-xs font-mono font-bold">π</button>
            <button type="button" onclick="app.insertAdvancedSymbol('backspace')" class="btn-3d btn-3d-rose px-3 py-1 text-xs font-bold">⌫ Xóa</button>
          </div>

          <!-- Nút Nộp Bài -->
          <div class="mt-5 flex gap-3">
            <button id="advanced-submit-btn" onclick="app.submitAdvancedAnswer()"
              class="w-full btn-3d btn-3d-honey py-3.5 text-sm md:text-base font-black shadow-xl flex items-center justify-center gap-2">
              ${SVG_ICONS.check}
              <span>Kiểm Tra Đáp Án</span>
            </button>
          </div>
        </div>

        <!-- Khung Lời Giải Chi Tiết & Phản Hồi (Hiển thị sau khi submit) -->
        <div id="advanced-feedback-box" class="hidden rounded-2xl p-5 md:p-6 mb-6 border transition-all"></div>

        <!-- Nút Câu Tiếp Theo (Hiển thị sau khi nộp bài) -->
        <div id="advanced-next-btn-box" class="hidden flex justify-end">
          <button onclick="app.nextAdvancedQuestion()"
            class="btn-3d btn-3d-rose px-8 py-3.5 text-sm md:text-base font-black shadow-xl flex items-center gap-2">
            <span>Luyện Câu Tiếp Theo (Random Chống Trùng)</span>
            ${SVG_ICONS.arrowRight}
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
      if (audio.playBounce) audio.playBounce();
      this.triggerConfetti({ particleCount: 85, spread: 70, origin: { y: 0.6 } });
    } else {
      audio.playWrong();
      if (audio.playEncourage) audio.playEncourage();
      input.classList.add('duo-shake');
      setTimeout(() => input.classList.remove('duo-shake'), 600);
      this.showCatEncouragement();
    }

    this.updateHeaderStats();

    // Hiển thị khung Feedback và Lời giải chi tiết
    const fbBox = document.getElementById('advanced-feedback-box');
    const nextBtnBox = document.getElementById('advanced-next-btn-box');

    if (fbBox) {
      fbBox.classList.remove('hidden');
      if (isCorrect) {
        fbBox.className = 'rounded-2xl p-6 mb-6 border-2 shadow-xl duo-bounce';
        fbBox.style.cssText = 'background: rgba(16, 185, 129, 0.15); border-color: rgba(16, 185, 129, 0.45); color: var(--text-main);';
        fbBox.innerHTML = `
          <div class="flex items-center gap-3 pb-3 border-b mb-4" style="border-color: rgba(16, 185, 129, 0.3);">
            <span class="text-3xl">🎉</span>
            <div>
              <h3 class="text-lg font-black text-emerald-600 dark:text-emerald-400">CHÍNH XÁC! XUẤT SẮC!</h3>
              <p class="text-xs font-semibold" style="color: var(--text-secondary);">Bạn đã nhận được <strong class="text-emerald-600 dark:text-emerald-400">+${q.points || 25} EXP</strong> và <strong class="text-amber-500">+5 💎 Kim cương</strong>!</p>
            </div>
          </div>
          <div class="text-sm font-bold mb-3" style="color: var(--text-main);">
            Đáp số của bạn: <span class="font-mono font-black text-base px-2.5 py-1 rounded border" style="background: var(--surface-card); border-color: rgba(16, 185, 129, 0.4); color: #059669;">${userRaw}</span>
          </div>
          <div class="rounded-xl p-4 border text-xs md:text-sm whitespace-pre-line leading-relaxed font-sans" style="background: var(--surface-card); border-color: var(--card-border); color: var(--text-main);">
            ${q.explanation}
          </div>
        `;
      } else {
        fbBox.className = 'rounded-2xl p-6 mb-6 border-2 shadow-xl';
        fbBox.style.cssText = 'background: rgba(239, 68, 68, 0.15); border-color: rgba(239, 68, 68, 0.45); color: var(--text-main);';
        fbBox.innerHTML = `
          <div class="flex items-center gap-3 pb-3 border-b mb-4" style="border-color: rgba(239, 68, 68, 0.3);">
            <span class="text-3xl">❌</span>
            <div>
              <h3 class="text-lg font-black text-rose-600 dark:text-rose-400">CHƯA CHÍNH XÁC</h3>
              <p class="text-xs font-semibold" style="color: var(--text-secondary);">Đừng nản lòng! Hãy đọc kỹ lời giải từng bước để khắc phục bẫy sai nhé!</p>
            </div>
          </div>
          <div class="flex flex-wrap gap-4 text-xs md:text-sm mb-4">
            <div class="px-3 py-1.5 rounded-lg border font-bold" style="background: var(--surface-card); border-color: rgba(239, 68, 68, 0.4); color: #DC2626;">
              Đáp số của bạn: <strong class="font-mono">${userRaw}</strong>
            </div>
            <div class="px-3 py-1.5 rounded-lg border font-bold" style="background: var(--surface-card); border-color: rgba(16, 185, 129, 0.4); color: #059669;">
              Đáp số chính xác: <strong class="font-mono">${q.correctAnswer}</strong>
            </div>
          </div>
          <div class="rounded-xl p-4 border text-xs md:text-sm whitespace-pre-line leading-relaxed font-sans" style="background: var(--surface-card); border-color: var(--card-border); color: var(--text-main);">
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
      if (label) label.innerHTML = `${typeof i18n !== 'undefined' ? i18n.t('card.moreCollapse') : 'Ẩn bớt các tính năng'} ${SVG_ICONS.chevronUp}`;
      if (icon) icon.innerHTML = SVG_ICONS.chevronUp;
      setTimeout(() => {
        box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 50);
    } else {
      box.classList.add('hidden');
      if (label) label.innerHTML = `${typeof i18n !== 'undefined' ? i18n.t('card.moreExpand') : 'Ấn vào để xem các tính năng'} ${SVG_ICONS.chevronDown}`;
      if (icon) icon.innerHTML = SVG_ICONS.chevronDown;
    }
  }

  // Render trang riêng Mở Rộng khi click trên Navigation bar
  renderMoreView() {
    const container = document.getElementById('more-content');
    if (!container) return;
    const p = storage.profile;

    container.innerHTML = `
      <div class="max-w-6xl mx-auto">
        <!-- Banner Tiêu Đề Mục Mở Rộng (Nâu Caramel Ấm Áp) -->
        <div class="hero-banner-warm relative rounded-3xl p-6 md:p-8 overflow-hidden shadow-xl mb-8">
          <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div class="max-w-2xl">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3 border"
                style="background: var(--accent-caramel-bg); color: var(--accent-caramel-text); border-color: rgba(156, 102, 68, 0.25);">
                <span>🧰 ${typeof i18n !== 'undefined' ? i18n.t('more.badge') : 'TIỆN ÍCH & CÔNG CỤ'}</span>
                <span class="text-[10px] px-1.5 py-0.5 rounded uppercase font-extrabold" style="background: rgba(156, 102, 68, 0.15);">4 Tiện Ích</span>
              </div>
              <h2 class="text-2xl md:text-3xl font-black tracking-tight" style="color: var(--hero-title);">
                ${typeof i18n !== 'undefined' ? i18n.t('more.title') : 'Tiện Ích & Công Cụ Mở Rộng'}
              </h2>
              <p class="text-xs md:text-sm mt-2 leading-relaxed font-medium" style="color: var(--hero-text);">
                ${typeof i18n !== 'undefined' ? i18n.t('more.subtitle') : 'Hệ thống giao nhận bài tập, góc giáo viên tạo đề A4, luyện đề thi học kỳ và cẩm nang công thức.'}
              </p>
            </div>

            <div class="shrink-0 flex gap-3">
              <button onclick="app.showTab('home')" class="btn-3d btn-3d-neutral px-5 py-2.5 text-xs font-bold flex items-center gap-2">
                ${SVG_ICONS.arrowLeft} <span>${typeof i18n !== 'undefined' ? i18n.t('nav.home') : 'Về Trang Chủ'}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Lưới 4 Tiện Ích Mở Rộng (3 Bộ Màu Nổi Bật) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <!-- 1. Giao & Nhận Bài Tập + Ôn Câu Sai (Vàng Nắng Rực) -->
          <div onclick="app.showTab('homework')" class="card-honey p-6 rounded-3xl cursor-pointer group flex flex-col justify-between shadow-sm">
            <div>
              <div class="flex justify-between items-start mb-3">
                <span class="w-12 h-12 rounded-2xl card-icon-honey flex items-center justify-center text-2xl group-hover:scale-110 transition shadow-md">
                  📬
                </span>
                <span class="badge-honey text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full">
                  Hộp Thư Bài Tập
                </span>
              </div>
              <h3 class="text-lg font-black transition" style="color: var(--text-main);">${typeof i18n !== 'undefined' ? i18n.t('more.homeworkTitle') : 'Giao & Nhận Bài Tập'}</h3>
              <p class="text-xs mt-2 leading-relaxed" style="color: var(--text-secondary);">${typeof i18n !== 'undefined' ? i18n.t('more.homeworkDesc') : 'Hệ thống gửi nhận bài tập theo username/email, tự động chấm điểm và sổ tay luyện lại câu sai thông minh.'}</p>
            </div>
            <div class="mt-6 pt-4 border-t" style="border-color: rgba(255, 159, 28, 0.25);">
              <button class="w-full btn-3d btn-card-honey py-2.5 text-xs font-black flex items-center justify-center gap-2">
                <span>${typeof i18n !== 'undefined' ? i18n.t('more.homeworkBtn') : 'Vào hộp thư bài tập'}</span>
                ${SVG_ICONS.arrowRight}
              </button>
            </div>
          </div>

          <!-- 2. Góc Thầy Cô (Nâu Caramel) -->
          <div onclick="app.showTab('teacher')" class="card-caramel p-6 rounded-3xl cursor-pointer group flex flex-col justify-between shadow-sm">
            <div>
              <div class="flex justify-between items-start mb-3">
                <span class="w-12 h-12 rounded-2xl card-icon-caramel flex items-center justify-center text-2xl group-hover:scale-110 transition shadow-md">
                  🌷
                </span>
                <span class="badge-caramel text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full">
                  Giáo Viên
                </span>
              </div>
              <h3 class="text-lg font-black transition" style="color: var(--text-main);">${typeof i18n !== 'undefined' ? i18n.t('feat.teacher') : 'Góc Thầy Cô'}</h3>
              <p class="text-xs mt-2 leading-relaxed" style="color: var(--text-secondary);">${typeof i18n !== 'undefined' ? i18n.t('feat.teacherDesc') : 'Công cụ thêm câu hỏi riêng của giáo viên, xuất đề kiểm tra và quản lý lớp học dễ dàng.'}</p>
            </div>
            <div class="mt-6 pt-4 border-t" style="border-color: rgba(166, 93, 50, 0.25);">
              <button class="w-full btn-3d btn-card-caramel py-2.5 text-xs font-black flex items-center justify-center gap-2">
                <span>${typeof i18n !== 'undefined' ? i18n.t('feat.teacherBtn') : 'Vào góc thầy cô'}</span>
                ${SVG_ICONS.arrowRight}
              </button>
            </div>
          </div>

          <!-- 3. Luyện Đề Thi Học Kỳ & Tuyển Sinh (Hồng Rực) -->
          <div onclick="app.showTab('exams')" class="card-berry p-6 rounded-3xl cursor-pointer group flex flex-col justify-between shadow-sm">
            <div>
              <div class="flex justify-between items-start mb-3">
                <span class="w-12 h-12 rounded-2xl card-icon-berry flex items-center justify-center text-2xl group-hover:scale-110 transition shadow-md">
                  🍓
                </span>
                <span class="badge-berry text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full">
                  Đề 2025-2026
                </span>
              </div>
              <h3 class="text-lg font-black transition" style="color: var(--text-main);">${typeof i18n !== 'undefined' ? i18n.t('feat.exams') : 'Luyện Đề Thi Học Kỳ'}</h3>
              <p class="text-xs mt-2 leading-relaxed" style="color: var(--text-secondary);">${typeof i18n !== 'undefined' ? i18n.t('feat.examsDesc') : 'Bộ đề thi thật trường THCS Nghĩa An và Sở GD&ĐT chuẩn ma trận: trắc nghiệm, đúng/sai và tự luận.'}</p>
            </div>
            <div class="mt-6 pt-4 border-t" style="border-color: rgba(255, 77, 121, 0.25);">
              <button class="w-full btn-3d btn-card-berry py-2.5 text-xs font-black flex items-center justify-center gap-2">
                <span>${typeof i18n !== 'undefined' ? i18n.t('feat.examsBtn') : 'Làm bài thi thử'}</span>
                ${SVG_ICONS.arrowRight}
              </button>
            </div>
          </div>

          <!-- 4. Sổ Tay Công Thức Toán 9 (Vàng Nắng Rực) -->
          <div onclick="app.showTab('cheatsheet')" class="card-honey p-6 rounded-3xl cursor-pointer group flex flex-col justify-between shadow-sm">
            <div>
              <div class="flex justify-between items-start mb-3">
                <span class="w-12 h-12 rounded-2xl card-icon-honey flex items-center justify-center text-2xl group-hover:scale-110 transition shadow-md">
                  📒
                </span>
                <span class="badge-honey text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full">
                  Cẩm Nang
                </span>
              </div>
              <h3 class="text-lg font-black transition" style="color: var(--text-main);">${typeof i18n !== 'undefined' ? i18n.t('feat.cheatsheet') : 'Sổ Tay Công Thức'}</h3>
              <p class="text-xs mt-2 leading-relaxed" style="color: var(--text-secondary);">${typeof i18n !== 'undefined' ? i18n.t('feat.cheatsheetDesc') : 'Tra cứu thần tốc các công thức căn thức, hệ thức lượng, đường tròn, Vi-ét và hình khối không gian.'}</p>
            </div>
            <div class="mt-6 pt-4 border-t" style="border-color: rgba(255, 159, 28, 0.25);">
              <button class="w-full btn-3d btn-card-honey py-2.5 text-xs font-black flex items-center justify-center gap-2">
                <span>${typeof i18n !== 'undefined' ? i18n.t('feat.cheatsheetBtn') : 'Mở sổ tay tra cứu'}</span>
                ${SVG_ICONS.arrowRight}
              </button>
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

  async updateUserEmail() {
    const input = document.getElementById('edit-player-email');
    if (!input) return;
    const email = input.value.trim();
    try {
      await storage.updateEmail(email);
      this.showToast('THÀNH CÔNG', 'Đã lưu email nhận bài tập thành công!', '✉️');
      this.showProfileModal();
    } catch (err) {
      this.showToast('LỖI', err.message || 'Không thể cập nhật email.', '⚠️');
    }
  }

  // Banner nhắc nhở bài tập nổi bật đầu trang chủ
  renderHomeHomeworkAlert() {
    if (!storage.isLoggedIn()) return '';
    if (typeof homework === 'undefined') return '';
    const pending = (homework.inboxList || []).filter(a => a.status === 'pending' || a.status === 'in_progress');
    if (pending.length === 0) return '';

    // Kiểm tra có bài nào sắp hết hạn trong 24 giờ không
    const now = new Date();
    const soonItem = pending.find(a => {
      if (!a.dueDate) return false;
      const diff = new Date(a.dueDate).getTime() - now.getTime();
      return diff > 0 && diff <= 24 * 3600 * 1000;
    });

    return `
      <div class="mb-6 p-4 md:p-5 rounded-3xl glass-panel border shadow-xl animate-pop-in relative overflow-hidden"
        style="border-color: ${soonItem ? 'var(--accent-rose)' : 'var(--cta-honey)'}; background: linear-gradient(135deg, rgba(224, 122, 134, 0.15), rgba(232, 168, 56, 0.12), rgba(0,0,0,0.3));">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div class="flex items-start gap-3.5 text-left">
            <span class="text-3xl p-2.5 rounded-2xl bg-rose-500/20 border border-rose-500/30 shrink-0">📬</span>
            <div>
              <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider mb-1.5"
                style="background: ${soonItem ? 'var(--accent-rose-bg)' : 'rgba(232, 168, 56, 0.2)'}; color: ${soonItem ? 'var(--accent-rose)' : 'var(--cta-honey)'};">
                ${soonItem ? '⚠️ SẮP ĐẾN HẠN NỘP BÀI' : '📬 BÀI TẬP CẦN HOÀN THÀNH'}
              </div>
              <h3 class="text-base md:text-lg font-black" style="color: var(--text-main);">
                Bạn có <span class="text-rose-400 font-black">${pending.length} bài tập</span> đang chờ trong Hộp thư đến!
              </h3>
              <p class="text-xs italic mt-0.5" style="color: var(--text-secondary);">
                🐱 Mèo Toán: "Chăm chỉ mỗi ngày là bí quyết bứt phá điểm 9-10! Hãy dành 10 phút làm bài tập để không bị dồn bài nhé! 🐾"
              </p>
            </div>
          </div>
          <button onclick="app.showTab('homework'); if (typeof homework !== 'undefined') homework.switchSubtab('inbox');"
            class="btn-3d btn-3d-honey px-5 py-3 text-xs font-black shrink-0 shadow-lg flex items-center justify-center gap-2">
            <span>Làm Bài Ngay</span>
            ${SVG_ICONS.arrowRight}
          </button>
        </div>
      </div>
    `;
  }

  // Widget Nhắc giờ học mỗi ngày trên trang chủ
  renderHomeStudyReminderWidget() {
    if (!storage.isLoggedIn()) return '';
    const rem = (typeof homework !== 'undefined' && homework.studyReminder) ? homework.studyReminder : { dailyTime: '19:30', enabled: true };

    return `
      <div class="mb-8 p-4 md:p-5 rounded-3xl glass-card border flex flex-col md:flex-row items-center justify-between gap-4"
        style="border-color: var(--border-subtle); background: var(--surface-card-alt);">
        <div class="flex items-center gap-3.5 text-left w-full md:w-auto">
          <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
            style="background: rgba(232, 168, 56, 0.2); border: 1px solid rgba(232, 168, 56, 0.4); color: var(--cta-honey);">
            ⏰
          </div>
          <div>
            <div class="text-sm font-black flex items-center gap-2" style="color: var(--text-main);">
              <span data-i18n="reminder.title">Nhắc Giờ Học Mỗi Ngày</span>
              <span id="home-reminder-badge" class="text-[10px] px-2 py-0.5 rounded-full font-black ${rem.enabled ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}">
                ${rem.enabled ? 'Đang bật' : 'Đang tắt'}
              </span>
            </div>
            <p class="text-xs mt-0.5" style="color: var(--text-muted);" data-i18n="reminder.desc">
              Tự động nhắc bạn học qua trình duyệt vào giờ cố định mỗi ngày để giữ phong độ và chuỗi Streak!
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2.5 w-full md:w-auto justify-end shrink-0">
          <div class="relative">
            <input type="time" id="home-reminder-time-input" value="${rem.dailyTime || '19:30'}"
              class="px-3 py-2 rounded-xl border text-xs font-black text-center"
              style="background: var(--surface-card-solid); border-color: var(--border-medium); color: var(--text-main);">
          </div>
          <button onclick="app.toggleAndSaveDailyReminder()" id="home-reminder-toggle-btn"
            class="btn-3d ${rem.enabled ? 'btn-3d-rose' : 'btn-3d-honey'} px-4 py-2 text-xs font-black shadow-sm shrink-0">
            <span>${rem.enabled ? 'Tắt nhắc' : 'Bật nhắc'}</span>
          </button>
        </div>
      </div>
    `;
  }

  async toggleAndSaveDailyReminder() {
    if (typeof homework === 'undefined') return;
    const timeInput = document.getElementById('home-reminder-time-input');
    const newTime = timeInput ? timeInput.value : '19:30';
    const currentEnabled = homework.studyReminder ? homework.studyReminder.enabled : true;
    const nextEnabled = !currentEnabled;

    await homework.saveStudyReminder(newTime, nextEnabled);
    if (this.currentTab === 'home') {
      this.renderHome();
    }
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
        <div class="rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl animate-pop-in relative overflow-hidden" style="background: var(--surface-card); border: 2px solid var(--card-border); color: var(--text-main);">
          
          <!-- Họa tiết trang trí nền -->
          <div class="absolute -top-12 -right-12 w-36 h-36 rounded-full blur-2xl pointer-events-none" style="background: var(--accent-rose-bg);"></div>
          <div class="absolute -bottom-12 -left-12 w-36 h-36 rounded-full blur-2xl pointer-events-none" style="background: var(--cta-honey-bg);"></div>

          <!-- Header Modal -->
          <div class="flex justify-between items-center pb-3 border-b mb-4 relative z-10" style="border-color: var(--card-border);">
            <div class="flex items-center gap-2.5">
              <span class="w-9 h-9 rounded-2xl flex items-center justify-center text-lg shadow-sm" style="background: var(--accent-rose-bg); color: var(--accent-rose-text); border: 1px solid rgba(242, 109, 133, 0.25);">
                ${isLogin ? '🔑' : '✨'}
              </span>
              <div>
                <h3 class="font-black text-base" style="color: var(--text-main);">
                  ${isLogin ? (typeof i18n !== 'undefined' ? i18n.t('auth.loginTitle') : 'Đăng Nhập Tài Khoản') : (typeof i18n !== 'undefined' ? i18n.t('auth.regTitle') : 'Tạo Tài Khoản Mới')}
                </h3>
                <p class="text-[11px] font-medium" style="color: var(--text-muted);">${typeof i18n !== 'undefined' ? i18n.t('auth.sub') : 'Hệ thống tài khoản học tập trực tuyến'}</p>
              </div>
            </div>
            <button onclick="app.closeAuthModal()" class="w-8 h-8 rounded-full flex items-center justify-center text-sm transition" style="background: var(--surface-card-alt); color: var(--text-secondary); border: 1px solid var(--card-border);">${SVG_ICONS.close}</button>
          </div>

          <!-- Thông báo hướng dẫn / Gating alert -->
          <div class="p-3 rounded-2xl text-xs mb-4 flex items-start gap-2.5 leading-relaxed relative z-10" style="background: var(--accent-rose-bg); color: var(--accent-rose-text); border: 1px solid rgba(242, 109, 133, 0.25);">
            <span class="text-base shrink-0 mt-0.5">🔒</span>
            <div class="flex-1">${String(msg).replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>')}</div>
          </div>

          <!-- Tab Switcher -->
          <div class="grid grid-cols-2 p-1 rounded-2xl mb-5 relative z-10 text-xs font-bold" style="background: var(--surface-card-alt); border: 1px solid var(--card-border);">
            <button type="button" onclick="app.switchAuthTab('login')"
              class="py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${isLogin ? 'btn-3d btn-3d-rose' : 'text-slate-400 hover:text-white'}">
              <span>🔑</span>
              <span>${typeof i18n !== 'undefined' ? i18n.t('auth.tabLogin') : 'Đăng Nhập'}</span>
            </button>
            <button type="button" onclick="app.switchAuthTab('register')"
              class="py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${!isLogin ? 'btn-3d btn-3d-rose' : 'text-slate-400 hover:text-white'}">
              <span>✨</span>
              <span>${typeof i18n !== 'undefined' ? i18n.t('auth.tabReg') : 'Tạo Tài Khoản'}</span>
            </button>
          </div>

          <!-- Error Alert Container -->
          <div id="auth-modal-error" class="hidden p-3 rounded-xl bg-rose-950/60 border border-rose-500/60 text-rose-200 text-xs font-semibold mb-4 flex items-center gap-2"></div>

          <!-- Form Đăng Nhập -->
          ${isLogin ? `
            <form onsubmit="app.handleLoginSubmit(event)" class="space-y-4 relative z-10">
              <div>
                <label class="block text-xs font-bold mb-1.5" style="color: var(--text-main);">${typeof i18n !== 'undefined' ? i18n.t('auth.loginUsernameOrEmail') : 'Tên đăng nhập hoặc Email:'}</label>
                <div class="relative">
                  <span class="absolute left-3.5 top-2.5 text-amber-500">👤</span>
                  <input type="text" id="auth-login-username" required autocomplete="username"
                    placeholder="vd: hocsinh01 hoặc email@example.com"
                    class="w-full pl-10 pr-3 py-2.5 rounded-xl border text-sm focus:outline-none"
                    style="background: var(--input-bg); border-color: var(--border-soft); color: var(--text-main);">
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold mb-1.5" style="color: var(--text-main);">${typeof i18n !== 'undefined' ? i18n.t('auth.password') : 'Mật khẩu:'}</label>
                <div class="relative">
                  <span class="absolute left-3.5 top-2.5 text-amber-500">🔒</span>
                  <input type="password" id="auth-login-password" required autocomplete="current-password"
                    placeholder="Nhập mật khẩu..."
                    class="w-full pl-10 pr-3 py-2.5 rounded-xl border text-sm focus:outline-none"
                    style="background: var(--input-bg); border-color: var(--border-soft); color: var(--text-main);">
                </div>
              </div>

              <!-- Gợi ý tài khoản mẫu -->
              <div class="p-2.5 rounded-xl text-xs flex items-center justify-between gap-2 border"
                style="background: var(--input-bg); border-color: var(--border-soft);">
                <div class="truncate">
                  <span class="font-bold text-amber-500">💡 ${typeof i18n !== 'undefined' ? i18n.t('auth.sampleAcc') : 'Mẫu có sẵn:'}</span>
                  <span class="font-mono" style="color: var(--text-secondary);">hocsinh01 / 123456</span>
                </div>
                <button type="button" onclick="app.fillDemoAccount()"
                  class="shrink-0 px-2.5 py-1 rounded-lg badge-berry font-bold text-[11px] transition">
                  Điền nhanh
                </button>
              </div>

              <button type="submit" id="auth-submit-btn"
                class="btn-3d btn-3d-rose w-full py-3 text-sm font-black shadow-lg flex items-center justify-center gap-2">
                <span>${typeof i18n !== 'undefined' ? i18n.t('auth.btnSubmitLogin') : 'Đăng Nhập Ngay'}</span>
                ${SVG_ICONS.arrowRight}
              </button>

              <div class="text-center pt-2">
                <button type="button" onclick="app.switchAuthTab('register')" class="text-xs hover:underline font-bold" style="color: #FF4D79;">
                  ${typeof i18n !== 'undefined' ? i18n.t('auth.noAccPrompt') : 'Chưa có tài khoản? Bấm để tạo tài khoản mới trong 10 giây'}
                </button>
              </div>
            </form>
          ` : `
            <!-- Form Tạo Tài Khoản -->
            <form onsubmit="app.handleRegisterSubmit(event)" class="space-y-3.5 relative z-10">
              <div>
                <label class="block text-xs font-bold mb-1" style="color: var(--text-secondary);">Tên đăng nhập (Username):</label>
                <div class="relative">
                  <span class="absolute left-3.5 top-2.5 text-amber-500">👤</span>
                  <input type="text" id="auth-reg-username" required pattern="[a-zA-Z0-9_]{3,30}"
                    placeholder="Từ 3-30 ký tự, viết liền không dấu (vd: toan9_mavis)"
                    class="w-full pl-10 pr-3 py-2 rounded-xl border text-xs sm:text-sm focus:outline-none"
                    style="background: var(--input-bg); border-color: var(--border-soft); color: var(--text-main);">
                </div>
                <p class="text-[10px] mt-0.5" style="color: var(--text-muted);">Chỉ gồm chữ cái, chữ số và gạch dưới (_).</p>
              </div>

              <div>
                <label class="block text-xs font-bold mb-1" style="color: var(--text-main);">${typeof i18n !== 'undefined' ? i18n.t('auth.emailOptional') : 'Email (tùy chọn - dùng để nhận bài tập dễ hơn):'}</label>
                <div class="relative">
                  <span class="absolute left-3.5 top-2.5 text-amber-500">✉️</span>
                  <input type="email" id="auth-reg-email"
                    placeholder="vd: hocsinh@gmail.com"
                    class="w-full pl-10 pr-3 py-2 rounded-xl border text-xs sm:text-sm focus:outline-none"
                    style="background: var(--input-bg); border-color: var(--border-soft); color: var(--text-main);">
                </div>
                <p class="text-[10px] mt-0.5" style="color: var(--text-muted);">Dùng để nhận bài tập từ bạn bè hoặc giáo viên.</p>
              </div>

              <div>
                <label class="block text-xs font-bold mb-1" style="color: var(--text-main);">${typeof i18n !== 'undefined' ? i18n.t('auth.displayName') : 'Tên hiển thị (Họ tên học sinh):'}</label>
                <div class="relative">
                  <span class="absolute left-3.5 top-2.5 text-amber-500">🎀</span>
                  <input type="text" id="auth-reg-displayname" required maxlength="50"
                    placeholder="vd: Mavis Hoàng Gia, Nguyễn Minh Đức..."
                    class="w-full pl-10 pr-3 py-2 rounded-xl border text-xs sm:text-sm focus:outline-none"
                    style="background: var(--input-bg); border-color: var(--border-soft); color: var(--text-main);">
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold mb-1" style="color: var(--text-secondary);">Mật khẩu:</label>
                <div class="relative">
                  <span class="absolute left-3.5 top-2.5 text-amber-500">🔒</span>
                  <input type="password" id="auth-reg-password" required minlength="4" maxlength="64"
                    placeholder="Tối thiểu 4 ký tự..."
                    class="w-full pl-10 pr-3 py-2 rounded-xl border text-xs sm:text-sm focus:outline-none"
                    style="background: var(--input-bg); border-color: var(--border-soft); color: var(--text-main);">
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold mb-1.5" style="color: var(--text-main);">${typeof i18n !== 'undefined' ? i18n.t('auth.avatarPrompt') : 'Chọn Linh Vật ban đầu:'}</label>
                <div class="grid grid-cols-5 gap-1.5" id="reg-avatar-grid">
                  ${['🐱', '🦊', '🐰', '🐼', '🦁', '🦉', '🦄', '🚀', '🌸', '⚡'].map(icon => `
                    <button type="button" onclick="app.selectRegisterAvatar('${icon}')"
                      class="reg-avatar-btn p-2 rounded-xl border text-xl flex items-center justify-center transition ${icon === this.selectedRegisterAvatar ? 'card-berry scale-105 shadow-sm' : ''}"
                      style="${icon === this.selectedRegisterAvatar ? '' : 'background: var(--input-bg); border-color: var(--border-soft);'}">
                      ${icon}
                    </button>
                  `).join('')}
                </div>
              </div>

              <button type="submit" id="auth-submit-btn"
                class="btn-3d btn-3d-honey w-full py-3 text-sm font-black shadow-lg flex items-center justify-center gap-2 mt-2">
                <span>${typeof i18n !== 'undefined' ? i18n.t('auth.btnSubmitReg') : 'Tạo Tài Khoản & Bắt Đầu Học'}</span>
                ${SVG_ICONS.arrowRight}
              </button>

              <div class="text-center pt-1">
                <button type="button" onclick="app.switchAuthTab('login')" class="text-xs text-pink-300 hover:text-white underline font-medium">
                  ${typeof i18n !== 'undefined' ? i18n.t('auth.hasAccPrompt') : 'Đã có tài khoản rồi? Bấm để đăng nhập ngay'}
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
        btn.classList.add('card-berry', 'scale-105', 'shadow-sm');
      } else {
        btn.classList.remove('card-berry', 'scale-105', 'shadow-sm');
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
        submitBtn.innerHTML = `<span>Đăng Nhập Ngay</span> ${SVG_ICONS.arrowRight}`;
      }
      audio.playWrong();
    }
  }

  async handleRegisterSubmit(event) {
    event.preventDefault();
    const username = document.getElementById('auth-reg-username')?.value.trim();
    const email = document.getElementById('auth-reg-email')?.value.trim() || null;
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
      await storage.register(username, password, displayName, avatar, email);
      this.onAuthSuccess('Tạo tài khoản thành công! Bắt đầu trải nghiệm học tập ngay thôi!');
    } catch (error) {
      this.showAuthError(error.message || 'Tạo tài khoản thất bại.');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>Tạo Tài Khoản & Bắt Đầu Học</span> ${SVG_ICONS.arrowRight}`;
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

    if (typeof homework !== 'undefined' && homework.updateNavBadge) {
      homework.updateNavBadge();
    }

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
    this.pendingAction = null;
    const modal = document.getElementById('modal-container');
    if (modal) modal.innerHTML = '';
    this.updateHeaderStats();
    this.closeAuthModal();
    this.showToast('ĐÃ ĐĂNG XUẤT', 'Tài khoản đã đăng xuất an toàn.', '👋');
    this.showTab('home');
    this.renderHome();
  }

  showToast(title, message, icon = '🌸') {
    const toast = document.createElement('div');
    toast.className = 'fixed top-6 right-6 z-50 p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-pop-in';
    toast.style.cssText = 'background: var(--card-bg); border: 2px solid #FF7AA2; box-shadow: 0 12px 32px var(--shadow-color); color: var(--text-main);';
    toast.innerHTML = `
      <div class="text-3xl">${icon}</div>
      <div>
        <div class="text-[10px] uppercase font-bold" style="color: #FF4D79;">${title}</div>
        <div class="font-extrabold text-xs" style="color: var(--text-main);">${message}</div>
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
