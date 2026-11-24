/**
 * ================================================================
 * MODULE QUẢN LÝ BÀI TẬP (HOMEWORK & ASSIGNMENTS)
 * Thiết kế kiểu Gửi Email linh hoạt - Hộp thư đến, Soạn bài, Đã giao
 * Tích hợp Bảng màu ấm (Hồng - Nâu - Vàng) & Nút 3D Duolingo
 * ================================================================
 */

class HomeworkManager {
  constructor() {
    this.currentSubtab = 'inbox'; // 'inbox' | 'compose' | 'sent' | 'review'
    this.inboxList = [];
    this.sentList = [];
    this.wrongQuestions = [];
    this.smartReviewFilter = 'all'; // 'all' | 'need_practice' | 'mastered'
    this.studyReminder = { dailyTime: '19:30', enabled: true, lastNotifiedDate: null };
    this.reminderTimer = null;
    
    // Trạng thái soạn bài tập
    this.recipients = []; // [{ raw, user: null, status: 'checking'|'valid'|'invalid' }]
    this.selectedQuestions = []; // [q1, q2, ...]
    this.customQuestions = [];
    this.activeFilter = 'all'; // 'all' | 'basic' | 'advanced' | 'custom'
    this.activeTopicId = 'all';
    this.searchKeyword = '';

    // Trạng thái làm bài tập
    this.doingAssignment = null;
    this.userAnswers = {}; // { qKey: answer }
  }

  // Khởi tạo và nạp dữ liệu ban đầu
  async init() {
    if (typeof storage !== 'undefined' && storage.isLoggedIn()) {
      await this.refreshInbox();
      await this.refreshWrongQuestions();
      await this.loadStudyReminder();
    }
    this.startReminderTimer();
  }

  // Tính toán thông tin đếm ngược thời hạn nộp bài
  getCountdownInfo(dueDate) {
    if (!dueDate) return null;
    const now = new Date();
    const due = new Date(dueDate);
    const diffMs = due.getTime() - now.getTime();
    if (diffMs <= 0) {
      return {
        text: 'Đã quá hạn',
        isOverdue: true,
        isSoon: false,
        badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/30 font-bold'
      };
    }
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) {
      return {
        text: `⏳ Còn ${Math.max(1, diffMins)} phút!`,
        isOverdue: false,
        isSoon: true,
        badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/30 animate-pulse font-extrabold'
      };
    }
    if (diffHours < 24) {
      const remMins = diffMins % 60;
      return {
        text: `⏳ Còn ${diffHours}h ${remMins}m`,
        isOverdue: false,
        isSoon: true,
        badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30 font-bold'
      };
    }
    return {
      text: `📅 Còn ${diffDays} ngày`,
      isOverdue: false,
      isSoon: false,
      badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    };
  }

  // Cập nhật số bài tập chưa làm trên badge của thanh điều hướng và subtab
  async updateNavBadge() {
    const badge = document.getElementById('homework-nav-badge');
    const moreBadge = document.getElementById('more-nav-badge');
    const inboxCounter = document.getElementById('hw-inbox-counter');
    const reviewCounter = document.getElementById('hw-review-counter');

    if (!storage.isLoggedIn()) {
      if (badge) badge.classList.add('hidden');
      if (moreBadge) moreBadge.classList.add('hidden');
      return;
    }

    try {
      const response = await fetch('/api/assignments/inbox', {
        headers: { 'Authorization': `Bearer ${storage.sessionToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        this.inboxList = data.assignments || [];
        const pendingCount = this.inboxList.filter(a => a.status === 'pending' || a.status === 'in_progress').length;
        if (badge) {
          if (pendingCount > 0) {
            badge.innerText = pendingCount > 99 ? '99+' : pendingCount;
            badge.classList.remove('hidden');
          } else {
            badge.classList.add('hidden');
          }
        }
        if (moreBadge) {
          if (pendingCount > 0) {
            moreBadge.innerText = pendingCount > 99 ? '99+' : pendingCount;
            moreBadge.classList.remove('hidden');
          } else {
            moreBadge.classList.add('hidden');
          }
        }
        if (inboxCounter) inboxCounter.innerText = pendingCount;
      }

      // Đếm số câu sai chưa thuộc
      const unmastered = this.wrongQuestions.filter(q => !q.mastered).length;
      if (reviewCounter) {
        if (unmastered > 0) {
          reviewCounter.innerText = unmastered;
          reviewCounter.classList.remove('hidden');
        } else {
          reviewCounter.classList.add('hidden');
        }
      }
    } catch (err) {
      console.warn('Lỗi kiểm tra bài tập mới:', err);
    }
  }

  // Render view chính của mục Bài Tập
  async render() {
    const container = document.getElementById('view-homework');
    if (!container) return;

    if (!storage.isLoggedIn()) {
      container.innerHTML = `
        <div class="max-w-md mx-auto text-center py-12 p-6 glass-panel rounded-3xl border border-rose-500/30">
          <div class="text-6xl mb-4">📬</div>
          <h2 class="text-2xl font-black mb-2" style="color: var(--text-main);">Tính Năng Giao & Nhận Bài Tập</h2>
          <p class="text-xs mb-6" style="color: var(--text-secondary);">
            Hệ thống bài tập kiểu gửi email cho phép bạn nhận bài tập từ bạn bè/thầy cô và tự giao bài tập cho bất kỳ ai bằng Username hoặc Email.
          </p>
          <button onclick="app.showAuthModal('login', { message: 'Đăng nhập để vào Hộp thư bài tập của bạn!' })"
            class="btn-3d btn-3d-honey px-6 py-3 text-sm font-black shadow-lg">
            <span>🔑 Đăng Nhập Để Tiếp Tục</span>
          </button>
        </div>
      `;
      return;
    }

    const unmasteredCount = this.wrongQuestions.filter(q => !q.mastered).length;

    // Giao diện chính gồm 4 tab phụ
    container.innerHTML = `
      <!-- Header tiêu đề trang -->
      <div class="flex flex-wrap items-center justify-between gap-4 pb-2 border-b" style="border-color: var(--border-subtle);">
        <div>
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-1.5"
            style="background: var(--accent-rose-bg); color: var(--accent-rose);">
            <span>📬</span>
            <span data-i18n="homework.badge">HỆ THỐNG GIAO & NHẬN BÀI TẬP</span>
          </div>
          <h1 class="text-2xl md:text-3xl font-black" style="color: var(--text-main);">
            Bài Tập & Thử Thách Nhóm
          </h1>
          <p class="text-xs font-medium" style="color: var(--text-muted);">
            Giao bài và nhận bài linh hoạt qua Username hoặc Email. Tự động chấm điểm và tổng hợp câu sai.
          </p>
        </div>

        <!-- 4 Tab phụ điều hướng -->
        <div class="flex items-center p-1 rounded-2xl glass-card border text-xs font-bold gap-1 flex-wrap"
          style="border-color: var(--border-subtle);">
          <button onclick="homework.switchSubtab('inbox')" id="hw-tab-inbox"
            class="px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${this.currentSubtab === 'inbox' ? 'shadow' : 'hover:opacity-80'}"
            style="${this.currentSubtab === 'inbox' ? 'background: var(--accent-rose); color: #fff;' : 'color: var(--text-secondary);'}">
            <span>📥</span>
            <span data-i18n="homework.tabInbox">Hộp Thư Đến</span>
            <span id="hw-inbox-counter" class="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-white/20 ml-0.5">0</span>
          </button>

          <button onclick="homework.switchSubtab('compose')" id="hw-tab-compose"
            class="px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${this.currentSubtab === 'compose' ? 'shadow' : 'hover:opacity-80'}"
            style="${this.currentSubtab === 'compose' ? 'background: var(--cta-honey); color: var(--cta-honey-text);' : 'color: var(--text-secondary);'}">
            <span>✍️</span>
            <span data-i18n="homework.tabCompose">Giao Bài Mới</span>
          </button>

          <button onclick="homework.switchSubtab('sent')" id="hw-tab-sent"
            class="px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${this.currentSubtab === 'sent' ? 'shadow' : 'hover:opacity-80'}"
            style="${this.currentSubtab === 'sent' ? 'background: var(--accent-rose); color: #fff;' : 'color: var(--text-secondary);'}">
            <span>📤</span>
            <span data-i18n="homework.tabSent">Bài Đã Giao</span>
          </button>

          <button onclick="homework.switchSubtab('review')" id="hw-tab-review"
            class="px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${this.currentSubtab === 'review' ? 'shadow' : 'hover:opacity-80'}"
            style="${this.currentSubtab === 'review' ? 'background: var(--accent-rose); color: #fff;' : 'color: var(--text-secondary);'}">
            <span>🧠</span>
            <span data-i18n="homework.tabReview">Ôn Tập Câu Sai</span>
            <span id="hw-review-counter" class="${unmasteredCount > 0 ? '' : 'hidden'} text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-rose-500 text-white ml-0.5">
              ${unmasteredCount}
            </span>
          </button>
        </div>
      </div>

      <!-- Container hiển thị nội dung tab phụ -->
      <div id="hw-subtab-content" class="mt-4"></div>
    `;

    // Render nội dung subtab hiện tại
    await this.renderCurrentSubtab();
    this.updateNavBadge();
  }

  // Chuyển đổi giữa 4 tab phụ
  async switchSubtab(subtab) {
    this.currentSubtab = subtab;
    if (typeof audio !== 'undefined') audio.playClick();
    this.render();
  }

  async renderCurrentSubtab() {
    const content = document.getElementById('hw-subtab-content');
    if (!content) return;

    if (this.currentSubtab === 'inbox') {
      await this.renderInbox(content);
    } else if (this.currentSubtab === 'compose') {
      this.renderCompose(content);
    } else if (this.currentSubtab === 'sent') {
      await this.renderSent(content);
    } else if (this.currentSubtab === 'review') {
      await this.renderSmartReview(content);
    }
  }

  // ==============================================================
  // 1. SUBTAB: HỘP THƯ ĐẾN (INBOX)
  // ==============================================================

  async refreshInbox() {
    if (!storage.isLoggedIn()) return;
    try {
      const res = await fetch('/api/assignments/inbox', {
        headers: { 'Authorization': `Bearer ${storage.sessionToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        this.inboxList = data.assignments || [];
      }
    } catch (e) {
      console.warn('Lỗi refresh inbox:', e);
    }
  }

  async renderInbox(container) {
    container.innerHTML = `<div class="py-12 text-center text-xs" style="color: var(--text-muted);">Đang tải danh sách bài tập...</div>`;
    await this.refreshInbox();

    const needAction = this.inboxList.filter(a => (a.status === 'pending' || a.status === 'in_progress') && !a.isOverdue);
    const overdue = this.inboxList.filter(a => (a.status === 'pending' || a.status === 'in_progress') && a.isOverdue);
    const completed = this.inboxList.filter(a => a.status === 'submitted' || a.status === 'late');

    const counterEl = document.getElementById('hw-inbox-counter');
    if (counterEl) counterEl.innerText = needAction.length + overdue.length;

    if (this.inboxList.length === 0) {
      container.innerHTML = `
        <div class="text-center py-16 p-6 glass-panel rounded-3xl border" style="border-color: var(--border-subtle);">
          <div class="text-6xl mb-3">📭</div>
          <h3 class="text-lg font-bold" style="color: var(--text-main);">Hộp Thư Đến Trống</h3>
          <p class="text-xs max-w-sm mx-auto mt-1 mb-5" style="color: var(--text-muted);">
            Hiện tại bạn chưa có bài tập nào cần làm. Hãy tự giao bài tập cho nhóm bạn cùng học hoặc nhờ thầy cô gửi bài nhé!
          </p>
          <button onclick="homework.switchSubtab('compose')" class="btn-3d btn-3d-honey px-5 py-2.5 text-xs font-black">
            <span>✍️ Thử Giao Bài Tập Mới</span>
          </button>
        </div>
      `;
      return;
    }

    const renderCard = (a, group) => {
      const isDone = a.status === 'submitted' || a.status === 'late';
      const countdown = this.getCountdownInfo(a.dueDate);

      let statusBadge = '';
      if (isDone) {
        statusBadge = a.status === 'late'
          ? `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">Nộp trễ • ${a.score}đ</span>`
          : `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Đã nộp • ${a.score}/10đ</span>`;
      } else if (a.isOverdue) {
        statusBadge = `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">Quá hạn nộp</span>`;
      } else {
        statusBadge = `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-500/30">Cần làm</span>`;
      }

      const sourceBadge = a.questionSource === 'advanced'
        ? '⚡ Nâng cao (Điền số)'
        : (a.questionSource === 'basic' ? '🌸 Cơ bản' : (a.questionSource === 'custom' ? '✍️ Tự soạn' : '📚 Tổng hợp'));

      return `
        <div class="glass-card p-5 rounded-2xl border flex flex-col justify-between transition hover:-translate-y-1 shadow-sm relative overflow-hidden"
          style="border-color: ${group === 'overdue' ? 'rgba(244, 63, 94, 0.4)' : 'var(--border-subtle)'};">
          
          <div>
            <!-- Header card: Thông tin người giao bài & Trạng thái -->
            <div class="flex items-center justify-between gap-2 pb-3 border-b mb-3" style="border-color: var(--border-subtle);">
              <div class="flex items-center gap-2.5">
                <span class="w-9 h-9 rounded-xl flex items-center justify-center text-xl shrink-0"
                  style="background: var(--surface-card-alt); border: 1px solid var(--border-subtle);">
                  ${a.sender.avatar || '👤'}
                </span>
                <div>
                  <div class="text-xs font-black truncate max-w-[150px]" style="color: var(--text-main);">${a.sender.displayName}</div>
                  <div class="text-[10px]" style="color: var(--text-muted);">@${a.sender.username}</div>
                </div>
              </div>
              <div class="flex items-center gap-1.5 shrink-0">
                ${statusBadge}
              </div>
            </div>

            <!-- Tiêu đề bài tập -->
            <h3 class="text-base font-black mb-1.5 leading-snug" style="color: var(--text-main);">${a.title}</h3>

            <!-- Lời nhắn dặn dò của người giao bài -->
            ${a.note ? `
              <div class="p-2.5 rounded-xl mb-3 text-xs italic flex items-start gap-2"
                style="background: var(--surface-card-alt); border: 1px solid var(--border-subtle); color: var(--text-secondary);">
                <span class="shrink-0 mt-0.5">💬</span>
                <span class="flex-1">"${a.note}"</span>
              </div>
            ` : ''}

            <!-- Chi tiết số câu, phân loại & Hạn nộp kèm đếm ngược -->
            <div class="flex flex-wrap items-center gap-2 text-[11px] mb-4" style="color: var(--text-muted);">
              <span class="px-2 py-0.5 rounded-lg font-bold"
                style="background: var(--surface-card-alt); border: 1px solid var(--border-subtle);">
                ${sourceBadge}
              </span>
              <span>•</span>
              <span class="font-semibold">${a.totalQuestions} câu hỏi</span>
              ${countdown ? `
                <span>•</span>
                <span class="px-2 py-0.5 rounded-lg border text-[10px] ${countdown.badgeClass}">
                  ${countdown.text}
                </span>
              ` : ''}
              ${a.dueDate ? `
                <span class="text-[10px]" style="color: var(--text-muted);">
                  (Hạn: ${new Date(a.dueDate).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })})
                </span>
              ` : ''}
            </div>
          </div>

          <!-- Nút hành động kiểu Duolingo -->
          <div class="pt-2">
            ${isDone ? `
              <button onclick="homework.viewSubmittedResult(${a.id})"
                class="btn-3d btn-3d-neutral w-full py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm">
                <span>📋 Xem Lại Bài Làm & Lời Giải</span>
              </button>
            ` : (group === 'overdue' ? `
              <button onclick="homework.startAssignment(${a.id})"
                class="btn-3d btn-3d-rose w-full py-2.5 text-xs font-black shadow-md flex items-center justify-center gap-1.5">
                <span>⚠️ Làm Bù Bài Quá Hạn</span>
              </button>
            ` : `
              <button onclick="homework.startAssignment(${a.id})"
                class="btn-3d btn-3d-honey w-full py-2.5 text-xs font-black shadow-md flex items-center justify-center gap-1.5">
                <span>📝 Bắt Đầu Làm Bài Ngay</span>
              </button>
            `)}
          </div>
        </div>
      `;
    };

    container.innerHTML = `
      <div class="space-y-8">
        <!-- NHÓM 1: CẦN LÀM NGAY -->
        <div>
          <div class="flex items-center justify-between pb-2 mb-3 border-b" style="border-color: var(--border-subtle);">
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center text-xs font-bold">⚡</span>
              <h2 class="text-sm md:text-base font-black uppercase tracking-wide" style="color: var(--text-main);">
                Cần Làm Ngay
              </h2>
              <span class="px-2 py-0.5 rounded-full text-xs font-black text-white bg-rose-500 shadow-sm">${needAction.length}</span>
            </div>
            <p class="text-[11px] hidden sm:block" style="color: var(--text-muted);">Ưu tiên hoàn thành đúng hạn để nhận tối đa EXP và tích lũy Streak!</p>
          </div>

          ${needAction.length === 0 ? `
            <div class="p-6 rounded-2xl border text-center text-xs italic"
              style="background: var(--surface-card-alt); border-color: var(--border-subtle); color: var(--text-muted);">
              🎉 Tuyệt vời! Bạn không còn bài tập nào đang chờ làm.
            </div>
          ` : `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              ${needAction.map(a => renderCard(a, 'needAction')).join('')}
            </div>
          `}
        </div>

        <!-- NHÓM 2: BÀI TẬP QUÁ HẠN NỘP (NẾU CÓ) -->
        ${overdue.length > 0 ? `
          <div>
            <div class="flex items-center justify-between pb-2 mb-3 border-b" style="border-color: rgba(244, 63, 94, 0.3);">
              <div class="flex items-center gap-2">
                <span class="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">⚠️</span>
                <h2 class="text-sm md:text-base font-black uppercase tracking-wide text-rose-400">
                  Quá Hạn Nộp
                </h2>
                <span class="px-2 py-0.5 rounded-full text-xs font-black text-white bg-rose-600 shadow-sm">${overdue.length}</span>
              </div>
              <p class="text-[11px] hidden sm:block text-rose-300/80">Bạn vẫn có thể nộp bù để ôn tập kiến thức.</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              ${overdue.map(a => renderCard(a, 'overdue')).join('')}
            </div>
          </div>
        ` : ''}

        <!-- NHÓM 3: ĐÃ HOÀN THÀNH -->
        <div>
          <div class="flex items-center justify-between pb-2 mb-3 border-b" style="border-color: var(--border-subtle);">
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">✅</span>
              <h2 class="text-sm md:text-base font-black uppercase tracking-wide" style="color: var(--text-main);">
                Đã Hoàn Thành
              </h2>
              <span class="px-2 py-0.5 rounded-full text-xs font-black text-emerald-300 bg-emerald-950/60 border border-emerald-500/30">${completed.length}</span>
            </div>
            <p class="text-[11px] hidden sm:block" style="color: var(--text-muted);">Xem lại kết quả, bài làm và lời giải chi tiết từng câu.</p>
          </div>

          ${completed.length === 0 ? `
            <div class="p-6 rounded-2xl border text-center text-xs italic"
              style="background: var(--surface-card-alt); border-color: var(--border-subtle); color: var(--text-muted);">
              Chưa có bài tập nào được hoàn thành.
            </div>
          ` : `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              ${completed.map(a => renderCard(a, 'completed')).join('')}
            </div>
          `}
        </div>
      </div>
    `;
  }

  // ==============================================================
  // 2. SUBTAB: GIAO BÀI MỚI (COMPOSE ASSIGNMENT)
  // ==============================================================

  renderCompose(container) {
    // Thu thập danh sách câu hỏi để chọn
    const basicList = (typeof QUESTIONS !== 'undefined') ? QUESTIONS : [];
    const advancedList = (typeof ADVANCED_FILL_QUESTIONS !== 'undefined') ? ADVANCED_FILL_QUESTIONS : [];

    container.innerHTML = `
      <div class="glass-panel p-6 md:p-8 rounded-3xl border shadow-lg max-w-4xl mx-auto"
        style="border-color: var(--border-subtle);">
        
        <form onsubmit="homework.handleSendSubmit(event)" class="space-y-6">
          
          <!-- 1. Ô NGƯỜI NHẬN (RECIPIENTS CHIP TAGS) -->
          <div>
            <label class="block text-xs font-bold mb-1.5" style="color: var(--text-main);">
              <span class="text-rose-400">*</span> Gửi tới (Username hoặc Email):
            </label>
            <div id="hw-recipient-box" class="p-2.5 rounded-2xl border flex flex-wrap items-center gap-1.5 transition"
              style="background: var(--surface-card-solid); border-color: var(--border-medium);">
              
              <!-- Danh sách thẻ chip người nhận đã thêm -->
              <div id="hw-recipient-chips" class="flex flex-wrap items-center gap-1.5"></div>

              <!-- Input nhập người nhận tiếp theo -->
              <input type="text" id="hw-recipient-input"
                placeholder="Nhập username hoặc email rồi nhấn Enter..."
                class="flex-1 min-w-[200px] bg-transparent border-0 outline-none text-xs p-1"
                style="color: var(--text-main);"
                onkeydown="homework.handleRecipientKey(event)"
                autocomplete="off">
            </div>
            <p class="text-[10px] mt-1" style="color: var(--text-muted);">
              💡 Nhập Username (vd: <code>hocsinh01</code>) hoặc Email (vd: <code>hocsinh@toan9.edu.vn</code>) rồi nhấn <strong>Enter</strong> hoặc phím phẩy (,). Hệ thống sẽ tự tra cứu và xác thực người nhận.
            </p>
          </div>

          <!-- 2. TIÊU ĐỀ & LỜI NHẮN & HẠN NỘP -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="md:col-span-2">
              <label class="block text-xs font-bold mb-1.5" style="color: var(--text-main);">
                <span class="text-rose-400">*</span> Tiêu đề bài tập:
              </label>
              <input type="text" id="hw-title-input" required maxlength="150"
                placeholder="vd: Phiếu ôn tập tuần 12 - Phương trình bậc hai & Vi-ét"
                class="w-full p-2.5 rounded-xl border text-xs focus:outline-none"
                style="background: var(--surface-card-solid); border-color: var(--border-medium); color: var(--text-main);">
            </div>

            <div>
              <label class="block text-xs font-bold mb-1.5" style="color: var(--text-main);">
                Hạn nộp (Tùy chọn):
              </label>
              <input type="datetime-local" id="hw-due-input"
                class="w-full p-2.5 rounded-xl border text-xs focus:outline-none"
                style="background: var(--surface-card-solid); border-color: var(--border-medium); color: var(--text-main);">
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold mb-1.5" style="color: var(--text-main);">
              Lời nhắn / Dặn dò:
            </label>
            <textarea id="hw-note-input" rows="2" maxlength="300"
              placeholder="vd: Các em chú ý trình bày cẩn thận, không dùng máy tính cho câu 3 nhé!"
              class="w-full p-2.5 rounded-xl border text-xs focus:outline-none resize-none"
              style="background: var(--surface-card-solid); border-color: var(--border-medium); color: var(--text-main);"></textarea>
          </div>

          <!-- 3. KHU VỰC CHỌN CÂU HỎI ĐÍNH KÈM -->
          <div class="pt-4 border-t" style="border-color: var(--border-subtle);">
            <div class="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div class="flex items-center gap-2">
                <span class="text-base">📋</span>
                <h3 class="text-sm font-black" style="color: var(--text-main);">Danh Sách Câu Hỏi Đính Kèm</h3>
                <span id="hw-selected-counter" class="text-xs font-black px-2 py-0.5 rounded-full"
                  style="background: var(--accent-rose-bg); color: var(--accent-rose);">
                  Đã chọn: 0 câu
                </span>
              </div>

              <!-- Thanh nút tiện ích nhanh -->
              <div class="flex items-center gap-2 flex-wrap">
                <button type="button" onclick="homework.pickRandomQuestions(5)"
                  class="px-2.5 py-1.5 rounded-xl border text-[11px] font-bold hover:brightness-105 transition"
                  style="background: var(--surface-card-solid); border-color: var(--border-medium); color: var(--text-main);">
                  🎲 Ngẫu nhiên 5 câu
                </button>
                <button type="button" onclick="homework.pickRandomQuestions(10)"
                  class="px-2.5 py-1.5 rounded-xl border text-[11px] font-bold hover:brightness-105 transition"
                  style="background: var(--surface-card-solid); border-color: var(--border-medium); color: var(--text-main);">
                  🎲 Ngẫu nhiên 10 câu
                </button>
                <button type="button" onclick="homework.openCustomQuestionModal()"
                  class="px-2.5 py-1.5 rounded-xl border text-[11px] font-bold hover:brightness-105 transition"
                  style="background: var(--accent-rose-bg); border-color: var(--accent-rose); color: var(--accent-rose);">
                  ➕ Tự soạn thêm câu hỏi
                </button>
              </div>
            </div>

            <!-- Bộ lọc câu hỏi -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-3">
              <select id="hw-filter-source" onchange="homework.handleFilterChange()"
                class="p-2 rounded-xl border text-xs font-bold"
                style="background: var(--surface-card-solid); border-color: var(--border-medium); color: var(--text-main);">
                <option value="all">Tất cả nguồn câu hỏi</option>
                <option value="basic">Bài tập Cơ bản (Trắc nghiệm 4 lựa chọn)</option>
                <option value="advanced">Bài tập Nâng cao (Điền đáp số)</option>
                <option value="custom">Câu hỏi tự soạn của bạn</option>
              </select>

              <select id="hw-filter-topic" onchange="homework.handleFilterChange()"
                class="p-2 rounded-xl border text-xs"
                style="background: var(--surface-card-solid); border-color: var(--border-medium); color: var(--text-main);">
                <option value="all">Tất cả chuyên đề</option>
                ${(typeof TOPICS !== 'undefined' ? TOPICS : []).map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
              </select>

              <input type="text" id="hw-filter-search" oninput="homework.handleFilterChange()"
                placeholder="Tìm từ khóa trong câu hỏi..."
                class="p-2 rounded-xl border text-xs"
                style="background: var(--surface-card-solid); border-color: var(--border-medium); color: var(--text-main);">
            </div>

            <!-- Danh sách câu hỏi cuộn để tích chọn -->
            <div id="hw-questions-pool"
              class="max-h-[380px] overflow-y-auto space-y-2 p-2 rounded-2xl border scrollbar-thin"
              style="background: var(--surface-card-alt); border-color: var(--border-subtle);">
              <!-- Render câu hỏi bằng JS -->
            </div>
          </div>

          <!-- 4. NÚT SUBMIT GỬI BÀI TẬP -->
          <div class="pt-4 border-t flex justify-end" style="border-color: var(--border-subtle);">
            <button type="submit" id="hw-send-submit-btn"
              class="btn-3d btn-3d-honey px-8 py-3.5 text-sm font-black shadow-xl flex items-center gap-2">
              <span>📬</span>
              <span>Gửi Bài Tập Ngay</span>
            </button>
          </div>
        </form>
      </div>
    `;

    this.renderRecipientChips();
    this.renderQuestionPool();
  }

  // Quản lý thẻ Chip người nhận
  async handleRecipientKey(event) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      const input = document.getElementById('hw-recipient-input');
      if (!input) return;
      const raw = input.value.trim().replace(/,/g, '');
      if (raw) {
        await this.addRecipient(raw);
        input.value = '';
      }
    }
  }

  async addRecipient(identifier) {
    const clean = identifier.trim().toLowerCase();
    if (!clean) return;

    // Chống thêm trùng lặp
    if (this.recipients.some(r => r.raw.toLowerCase() === clean)) {
      return;
    }

    const item = { raw: identifier.trim(), user: null, status: 'checking' };
    this.recipients.push(item);
    this.renderRecipientChips();

    // Tra cứu người dùng qua API
    try {
      const res = await fetch(`/api/users/lookup?q=${encodeURIComponent(clean)}`);
      if (res.ok) {
        const data = await res.json();
        const found = (data.users || []).find(u =>
          u.username.toLowerCase() === clean || (u.email && u.email.toLowerCase() === clean)
        );
        if (found) {
          item.user = found;
          item.status = 'valid';
        } else {
          item.status = 'invalid';
        }
      } else {
        item.status = 'invalid';
      }
    } catch (e) {
      item.status = 'invalid';
    }

    this.renderRecipientChips();
  }

  removeRecipient(index) {
    this.recipients.splice(index, 1);
    this.renderRecipientChips();
  }

  renderRecipientChips() {
    const container = document.getElementById('hw-recipient-chips');
    if (!container) return;

    container.innerHTML = this.recipients.map((r, idx) => {
      let badgeStyle = '';
      let statusIcon = '';
      let displayName = r.raw;

      if (r.status === 'valid' && r.user) {
        badgeStyle = 'background: rgba(16, 185, 129, 0.15); border-color: rgba(16, 185, 129, 0.4); color: #10B981;';
        statusIcon = '✓';
        displayName = `${r.user.avatar || '👤'} ${r.user.displayName} (@${r.user.username})`;
      } else if (r.status === 'invalid') {
        badgeStyle = 'background: rgba(239, 68, 68, 0.15); border-color: rgba(239, 68, 68, 0.4); color: #EF4444;';
        statusIcon = '⚠️ Không tìm thấy';
      } else {
        badgeStyle = 'background: rgba(232, 168, 56, 0.15); border-color: rgba(232, 168, 56, 0.4); color: #E8A838;';
        statusIcon = '⏳';
      }

      return `
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-bold"
          style="${badgeStyle}">
          <span>${displayName}</span>
          <span class="text-[10px] font-black">${statusIcon}</span>
          <button type="button" onclick="homework.removeRecipient(${idx})" class="ml-0.5 opacity-60 hover:opacity-100">×</button>
        </span>
      `;
    }).join('');
  }

  // Quản lý kho câu hỏi để chọn
  getAllAvailableQuestions() {
    const list = [];

    // 1. Câu hỏi cơ bản
    if (typeof QUESTIONS !== 'undefined') {
      QUESTIONS.forEach(q => {
        list.push({
          id: q.id,
          source: 'basic',
          topicId: q.topicId,
          title: q.title || 'Bài tập cơ bản',
          content: q.content,
          options: q.options || [],
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || ''
        });
      });
    }

    // 2. Câu hỏi nâng cao điền số
    if (typeof ADVANCED_FILL_QUESTIONS !== 'undefined') {
      ADVANCED_FILL_QUESTIONS.forEach(q => {
        list.push({
          id: q.id,
          source: 'advanced',
          topicId: q.topicId,
          title: q.title || 'Bài tập nâng cao',
          content: q.content,
          options: [],
          correctAnswer: q.correctAnswer,
          acceptableAnswers: q.acceptableAnswers || [],
          explanation: q.explanation || ''
        });
      });
    }

    // 3. Câu hỏi tự soạn
    this.customQuestions.forEach(q => {
      list.push(q);
    });

    return list;
  }

  handleFilterChange() {
    this.activeFilter = document.getElementById('hw-filter-source')?.value || 'all';
    this.activeTopicId = document.getElementById('hw-filter-topic')?.value || 'all';
    this.searchKeyword = document.getElementById('hw-filter-search')?.value.trim().toLowerCase() || '';
    this.renderQuestionPool();
  }

  renderQuestionPool() {
    const container = document.getElementById('hw-questions-pool');
    if (!container) return;

    let all = this.getAllAvailableQuestions();

    // Lọc theo nguồn
    if (this.activeFilter !== 'all') {
      all = all.filter(q => q.source === this.activeFilter);
    }

    // Lọc theo chuyên đề
    if (this.activeTopicId !== 'all') {
      all = all.filter(q => q.topicId === this.activeTopicId);
    }

    // Lọc theo từ khóa tìm kiếm
    if (this.searchKeyword) {
      all = all.filter(q =>
        (q.content && q.content.toLowerCase().includes(this.searchKeyword)) ||
        (q.title && q.title.toLowerCase().includes(this.searchKeyword))
      );
    }

    if (all.length === 0) {
      container.innerHTML = `<div class="p-8 text-center text-xs" style="color: var(--text-muted);">Không tìm thấy câu hỏi phù hợp với bộ lọc.</div>`;
      return;
    }

    container.innerHTML = all.map(q => {
      const isSelected = this.selectedQuestions.some(sq => sq.id === q.id);
      const isAdv = q.source === 'advanced';

      return `
        <div class="p-3 rounded-xl border flex items-start gap-3 transition cursor-pointer hover:border-pink-400"
          style="background: var(--surface-card-solid); border-color: ${isSelected ? 'var(--accent-rose)' : 'var(--border-subtle)'};"
          onclick="homework.toggleQuestionSelection('${q.id}')">
          <input type="checkbox" ${isSelected ? 'checked' : ''} class="mt-1 pointer-events-none accent-pink-500">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-[10px] font-extrabold px-1.5 py-0.2 rounded"
                style="background: var(--accent-rose-bg); color: var(--accent-rose);">
                ${isAdv ? '⚡ Điền số' : '🌸 Trắc nghiệm'}
              </span>
              <span class="text-xs font-bold truncate" style="color: var(--text-main);">${q.title}</span>
            </div>
            <div class="text-xs line-clamp-2 leading-relaxed" style="color: var(--text-secondary);">${q.content}</div>
          </div>
        </div>
      `;
    }).join('');

    if (typeof game !== 'undefined' && game.renderMath) {
      game.renderMath(container);
    }
  }

  toggleQuestionSelection(qId) {
    const all = this.getAllAvailableQuestions();
    const target = all.find(q => q.id === qId);
    if (!target) return;

    const existingIndex = this.selectedQuestions.findIndex(sq => sq.id === qId);
    if (existingIndex !== -1) {
      this.selectedQuestions.splice(existingIndex, 1);
    } else {
      this.selectedQuestions.push(target);
    }

    this.updateSelectedCounter();
    this.renderQuestionPool();
  }

  pickRandomQuestions(count) {
    const all = this.getAllAvailableQuestions();
    const shuffled = [...all].sort(() => 0.5 - Math.random());
    this.selectedQuestions = shuffled.slice(0, Math.min(count, shuffled.length));
    this.updateSelectedCounter();
    this.renderQuestionPool();
    if (typeof audio !== 'undefined') audio.playBounce();
  }

  updateSelectedCounter() {
    const el = document.getElementById('hw-selected-counter');
    if (el) el.innerText = `Đã chọn: ${this.selectedQuestions.length} câu`;
  }

  // Modal tự soạn câu hỏi mới
  openCustomQuestionModal() {
    const modal = document.getElementById('modal-container');
    if (!modal) return;

    modal.innerHTML = `
      <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
        <div class="glass-panel border p-6 rounded-3xl max-w-lg w-full shadow-2xl animate-pop-in"
          style="border-color: var(--border-focus);">
          <div class="flex justify-between items-center pb-3 border-b mb-4" style="border-color: var(--border-subtle);">
            <h3 class="font-black text-base" style="color: var(--text-main);">➕ Tự Soạn Câu Hỏi Mới</h3>
            <button onclick="document.getElementById('modal-container').innerHTML=''" class="text-xs opacity-70 hover:opacity-100">✕</button>
          </div>

          <form onsubmit="homework.handleSaveCustomQuestion(event)" class="space-y-3.5 text-xs">
            <div>
              <label class="block font-bold mb-1" style="color: var(--text-main);">Tiêu đề câu hỏi:</label>
              <input type="text" id="cq-title" required placeholder="vd: Tính bán kính đường tròn ngoại tiếp"
                class="w-full p-2.5 rounded-xl border" style="background: var(--surface-card-solid); border-color: var(--border-medium); color: var(--text-main);">
            </div>

            <div>
              <label class="block font-bold mb-1" style="color: var(--text-main);">Nội dung câu hỏi (hỗ trợ công thức $công_thức$):</label>
              <textarea id="cq-content" required rows="3" placeholder="vd: Cho tam giác ABC vuông tại A có AB = 6, AC = 8. Tính độ dài cạnh BC."
                class="w-full p-2.5 rounded-xl border resize-none" style="background: var(--surface-card-solid); border-color: var(--border-medium); color: var(--text-main);"></textarea>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-bold mb-1">Đáp án A:</label>
                <input type="text" id="cq-opt-0" required placeholder="Phương án A" class="w-full p-2 rounded-xl border">
              </div>
              <div>
                <label class="block font-bold mb-1">Đáp án B:</label>
                <input type="text" id="cq-opt-1" required placeholder="Phương án B" class="w-full p-2 rounded-xl border">
              </div>
              <div>
                <label class="block font-bold mb-1">Đáp án C:</label>
                <input type="text" id="cq-opt-2" required placeholder="Phương án C" class="w-full p-2 rounded-xl border">
              </div>
              <div>
                <label class="block font-bold mb-1">Đáp án D:</label>
                <input type="text" id="cq-opt-3" required placeholder="Phương án D" class="w-full p-2 rounded-xl border">
              </div>
            </div>

            <div>
              <label class="block font-bold mb-1" style="color: var(--text-main);">Đáp án đúng:</label>
              <select id="cq-correct" class="w-full p-2 rounded-xl border font-bold">
                <option value="0">Phương án A</option>
                <option value="1">Phương án B</option>
                <option value="2">Phương án C</option>
                <option value="3">Phương án D</option>
              </select>
            </div>

            <div>
              <label class="block font-bold mb-1" style="color: var(--text-main);">Lời giải chi tiết:</label>
              <textarea id="cq-explanation" rows="2" placeholder="Áp dụng định lý Pythagore..."
                class="w-full p-2 rounded-xl border resize-none"></textarea>
            </div>

            <div class="pt-2 flex justify-end gap-2">
              <button type="button" onclick="document.getElementById('modal-container').innerHTML=''" class="px-4 py-2 rounded-xl border">Hủy</button>
              <button type="submit" class="btn-3d btn-3d-honey px-5 py-2 font-black">Lưu & Chọn Ngay</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  handleSaveCustomQuestion(event) {
    event.preventDefault();
    const title = document.getElementById('cq-title').value.trim();
    const content = document.getElementById('cq-content').value.trim();
    const opts = [
      document.getElementById('cq-opt-0').value.trim(),
      document.getElementById('cq-opt-1').value.trim(),
      document.getElementById('cq-opt-2').value.trim(),
      document.getElementById('cq-opt-3').value.trim(),
    ];
    const correct = parseInt(document.getElementById('cq-correct').value, 10);
    const exp = document.getElementById('cq-explanation').value.trim();

    const customQ = {
      id: `custom_${Date.now()}`,
      source: 'custom',
      topicId: 'custom',
      title,
      content,
      options: opts,
      correctAnswer: correct,
      explanation: exp
    };

    this.customQuestions.push(customQ);
    this.selectedQuestions.push(customQ);
    document.getElementById('modal-container').innerHTML = '';
    this.updateSelectedCounter();
    this.renderQuestionPool();
    if (typeof audio !== 'undefined') audio.playCorrect();
  }

  // Xử lý gửi bài tập chính thức
  async handleSendSubmit(event) {
    event.preventDefault();

    // 1. Kiểm tra người nhận
    if (this.recipients.length === 0) {
      alert('Vui lòng thêm ít nhất 1 người nhận (nhập username hoặc email rồi nhấn Enter).');
      document.getElementById('hw-recipient-input')?.focus();
      return;
    }

    const invalidRecs = this.recipients.filter(r => r.status === 'invalid');
    if (invalidRecs.length > 0) {
      alert(`Một số người nhận chưa được tìm thấy trên hệ thống:\n- ${invalidRecs.map(r => r.raw).join('\n- ')}\nVui lòng kiểm tra lại chính tả hoặc xóa bớt.`);
      return;
    }

    // 2. Kiểm tra câu hỏi
    if (this.selectedQuestions.length === 0) {
      alert('Vui lòng chọn ít nhất 1 câu hỏi đính kèm cho bài tập.');
      return;
    }

    const title = document.getElementById('hw-title-input')?.value.trim();
    const note = document.getElementById('hw-note-input')?.value.trim();
    const dueDate = document.getElementById('hw-due-input')?.value;

    const submitBtn = document.getElementById('hw-send-submit-btn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>⏳</span><span>Đang gửi bài tập...</span>';
    }

    try {
      const payload = {
        title,
        note,
        questionSource: 'mixed',
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        questions: this.selectedQuestions,
        recipients: this.recipients.map(r => r.user ? r.user.username : r.raw)
      };

      const res = await fetch('/api/assignments/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${storage.sessionToken}`
        },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Không thể tạo bài tập.');
      }

      // Ăn mừng giao bài thành công
      if (typeof audio !== 'undefined' && audio.playCheer) audio.playCheer();
      if (typeof app !== 'undefined' && app.triggerConfetti) {
        app.triggerConfetti({ particleCount: 90, spread: 70 });
      }

      alert(`🎉 Giao bài tập "${title}" thành công tới ${result.recipientCount} học sinh!`);

      // Reset form và chuyển sang tab Bài Đã Giao
      this.recipients = [];
      this.selectedQuestions = [];
      this.switchSubtab('sent');

    } catch (err) {
      alert(`Lỗi: ${err.message}`);
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>📬</span><span>Gửi Bài Tập Ngay</span>';
      }
    }
  }

  // ==============================================================
  // 3. SUBTAB: BÀI ĐÃ GIAO (SENT ASSIGNMENTS & REPORT)
  // ==============================================================

  async refreshSent() {
    if (!storage.isLoggedIn()) return;
    try {
      const res = await fetch('/api/assignments/sent', {
        headers: { 'Authorization': `Bearer ${storage.sessionToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        this.sentList = data.assignments || [];
      }
    } catch (e) {
      console.warn('Lỗi refresh sent:', e);
    }
  }

  async renderSent(container) {
    container.innerHTML = `<div class="py-12 text-center text-xs" style="color: var(--text-muted);">Đang tải danh sách bài đã giao...</div>`;
    await this.refreshSent();

    if (this.sentList.length === 0) {
      container.innerHTML = `
        <div class="text-center py-16 p-6 glass-panel rounded-3xl border" style="border-color: var(--border-subtle);">
          <div class="text-6xl mb-3">📤</div>
          <h3 class="text-lg font-bold" style="color: var(--text-main);">Chưa Giao Bài Tập Nào</h3>
          <p class="text-xs max-w-sm mx-auto mt-1 mb-5" style="color: var(--text-muted);">
            Bạn chưa giao bài tập nào cho người khác. Hãy bấm nút bên dưới để tạo phiếu bài tập đầu tiên!
          </p>
          <button onclick="homework.switchSubtab('compose')" class="btn-3d btn-3d-honey px-5 py-2.5 text-xs font-black">
            <span>✍️ Soạn Bài Tập Ngay</span>
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="space-y-4">
        ${this.sentList.map(a => {
          const submittedPercent = Math.round((a.submittedCount / (a.totalRecipients || 1)) * 100);

          return `
            <div class="glass-card p-5 rounded-2xl border transition hover:border-pink-400"
              style="border-color: var(--border-subtle);">
              
              <div class="flex flex-wrap items-start justify-between gap-4 mb-3">
                <div class="flex-1 min-w-[240px]">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-xs font-bold px-2 py-0.5 rounded-lg"
                      style="background: var(--accent-rose-bg); color: var(--accent-rose);">
                      ${a.totalQuestions} câu hỏi
                    </span>
                    <span class="text-[11px]" style="color: var(--text-muted);">
                      Giao lúc: ${new Date(a.createdAt).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                    ${a.dueDate ? `<span class="text-[11px]" style="color: var(--text-muted);">• Hạn: ${new Date(a.dueDate).toLocaleDateString('vi-VN')}</span>` : ''}
                  </div>
                  <h3 class="text-base font-black leading-snug" style="color: var(--text-main);">${a.title}</h3>
                  ${a.note ? `<p class="text-xs italic mt-1" style="color: var(--text-secondary);">"${a.note}"</p>` : ''}
                </div>

                <!-- Thống kê nhanh tiến độ -->
                <div class="text-right shrink-0">
                  <div class="text-xs font-extrabold" style="color: var(--text-main);">
                    ${a.submittedCount} / ${a.totalRecipients} đã nộp (${submittedPercent}%)
                  </div>
                  <div class="text-[11px] font-bold text-amber-500">
                    Điểm trung bình: ${a.averageScore}/10đ
                  </div>
                </div>
              </div>

              <!-- Thanh tiến độ nộp bài -->
              <div class="w-full h-2 rounded-full overflow-hidden mb-4" style="background: var(--border-subtle);">
                <div class="h-full rounded-full transition-all"
                  style="width: ${submittedPercent}%; background: linear-gradient(90deg, var(--accent-rose), var(--cta-honey));"></div>
              </div>

              <!-- Nút hành động -->
              <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t" style="border-color: var(--border-subtle);">
                <div class="flex items-center gap-1.5 text-xs">
                  <span class="text-[11px]" style="color: var(--text-muted);">Người nhận:</span>
                  <div class="flex items-center -space-x-1.5">
                    ${a.recipients.slice(0, 5).map(r => `
                      <span class="w-6 h-6 rounded-full border flex items-center justify-center text-xs shadow-sm"
                        title="${r.displayName} (@${r.username})"
                        style="background: var(--surface-card-solid); border-color: var(--border-medium);">
                        ${r.avatar || '👤'}
                      </span>
                    `).join('')}
                    ${a.recipients.length > 5 ? `<span class="text-[10px] pl-2 font-bold">+${a.recipients.length - 5}</span>` : ''}
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <button onclick="homework.viewSentReport(${a.id})"
                    class="btn-3d btn-3d-honey px-3.5 py-1.5 text-xs font-black shadow-sm flex items-center gap-1">
                    <span>📊 Xem Chi Tiết & Báo Cáo</span>
                  </button>
                  <button onclick="homework.cloneAssignment(${a.id})"
                    class="btn-3d btn-3d-neutral px-3 py-1.5 text-xs font-bold shadow-sm" title="Nhân bản / Giao lại đề này">
                    <span>📑 Giao lại</span>
                  </button>
                  <button onclick="homework.deleteSentAssignment(${a.id})"
                    class="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition" title="Xóa bài tập này">
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // Xem chi tiết & báo cáo câu làm sai nhiều nhất của bài đã giao
  viewSentReport(assignmentId) {
    const a = this.sentList.find(item => item.id === assignmentId);
    if (!a) return;

    const modal = document.getElementById('modal-container');
    if (!modal) return;

    modal.innerHTML = `
      <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
        <div class="glass-panel border p-6 md:p-7 rounded-3xl max-w-2xl w-full shadow-2xl animate-pop-in max-h-[90vh] overflow-y-auto scrollbar-thin"
          style="border-color: var(--border-focus);">
          
          <!-- Header Modal -->
          <div class="flex justify-between items-center pb-3 border-b mb-4" style="border-color: var(--border-subtle);">
            <div>
              <div class="text-[11px] font-bold uppercase" style="color: var(--accent-rose);">Báo Cáo Chi Tiết Bài Đã Giao</div>
              <h2 class="text-lg font-black" style="color: var(--text-main);">${a.title}</h2>
            </div>
            <button onclick="document.getElementById('modal-container').innerHTML=''" class="text-xs opacity-70 hover:opacity-100">✕</button>
          </div>

          <!-- Bảng trạng thái từng học sinh -->
          <div class="mb-6">
            <h3 class="text-xs font-bold mb-2 uppercase" style="color: var(--text-secondary);">Danh Sách Người Nhận (${a.recipients.length})</h3>
            <div class="rounded-2xl border overflow-hidden" style="border-color: var(--border-subtle);">
              <table class="w-full text-left text-xs border-collapse">
                <thead>
                  <tr style="background: var(--surface-card-alt); border-bottom: 1px solid var(--border-subtle);">
                    <th class="p-2.5 font-bold">Học sinh</th>
                    <th class="p-2.5 font-bold">Trạng thái</th>
                    <th class="p-2.5 font-bold text-center">Điểm số</th>
                    <th class="p-2.5 font-bold text-right">Thời gian nộp</th>
                  </tr>
                </thead>
                <tbody>
                  ${a.recipients.map(r => {
                    const isDone = r.status === 'submitted' || r.status === 'late';
                    return `
                      <tr style="border-bottom: 1px solid var(--border-subtle);">
                        <td class="p-2.5 flex items-center gap-2">
                          <span class="text-lg">${r.avatar || '👤'}</span>
                          <div>
                            <div class="font-extrabold" style="color: var(--text-main);">${r.displayName}</div>
                            <div class="text-[10px]" style="color: var(--text-muted);">@${r.username}</div>
                          </div>
                        </td>
                        <td class="p-2.5">
                          ${isDone
                            ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-black ${r.status === 'late' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-400'}">${r.status === 'late' ? 'Nộp trễ' : 'Đã nộp'}</span>`
                            : `<span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-500/20 text-slate-400">Chưa nộp</span>`}
                        </td>
                        <td class="p-2.5 text-center font-black ${isDone ? 'text-amber-400 text-sm' : 'text-slate-500'}">
                          ${isDone ? `${r.score}đ` : '-'}
                        </td>
                        <td class="p-2.5 text-right text-[11px]" style="color: var(--text-muted);">
                          ${r.submittedAt ? new Date(r.submittedAt).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : 'Chưa nộp'}
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Báo cáo câu học sinh hay làm sai nhất -->
          <div class="mb-4">
            <h3 class="text-xs font-bold mb-2 uppercase flex items-center gap-1.5" style="color: var(--accent-rose);">
              <span>⚠️</span>
              <span>Các Câu Hỏi Hay Bị Làm Sai Nhất (${a.mostMissedQuestions.length})</span>
            </h3>

            ${a.mostMissedQuestions.length === 0 ? `
              <div class="p-4 rounded-xl border text-center text-xs" style="background: var(--surface-card-alt); border-color: var(--border-subtle); color: var(--text-muted);">
                🎉 Tuyệt vời! Hiện chưa có câu hỏi nào bị làm sai nhiều trong bài tập này.
              </div>
            ` : `
              <div class="space-y-2">
                ${a.mostMissedQuestions.map((q, idx) => `
                  <div class="p-3 rounded-xl border flex items-start justify-between gap-3"
                    style="background: var(--surface-card-alt); border-color: var(--border-subtle);">
                    <div class="text-xs">
                      <div class="font-bold mb-1" style="color: var(--text-main);">#${idx + 1}. ${q.content}</div>
                    </div>
                    <span class="shrink-0 px-2.5 py-1 rounded-xl text-xs font-black bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      ${q.wrongCount} bạn sai
                    </span>
                  </div>
                `).join('')}
              </div>
            `}
          </div>

          <!-- Chân modal -->
          <div class="pt-3 border-t flex justify-end gap-2" style="border-color: var(--border-subtle);">
            <button onclick="document.getElementById('modal-container').innerHTML=''" class="btn-3d btn-3d-neutral px-4 py-2 text-xs font-bold">Đóng</button>
            <button onclick="document.getElementById('modal-container').innerHTML=''; homework.cloneAssignment(${a.id});" class="btn-3d btn-3d-honey px-5 py-2 text-xs font-black">Nhân Bản Đề Này</button>
          </div>
        </div>
      </div>
    `;
  }

  // Nhân bản đề thi sang tab Compose
  cloneAssignment(assignmentId) {
    const a = this.sentList.find(item => item.id === assignmentId);
    if (!a) return;

    this.switchSubtab('compose');
    setTimeout(() => {
      const titleInput = document.getElementById('hw-title-input');
      if (titleInput) titleInput.value = `[Bản sao] ${a.title}`;
      const noteInput = document.getElementById('hw-note-input');
      if (noteInput && a.note) noteInput.value = a.note;
    }, 150);
  }

  // Xóa bài đã giao
  async deleteSentAssignment(assignmentId) {
    if (!confirm('Bạn có chắc chắn muốn xóa bài tập này? Tất cả kết quả bài làm của người nhận cũng sẽ bị xóa.')) {
      return;
    }

    try {
      const res = await fetch(`/api/assignments/${assignmentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${storage.sessionToken}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Xóa thất bại');
      this.refreshSent().then(() => this.renderCurrentSubtab());
    } catch (e) {
      alert(`Lỗi: ${e.message}`);
    }
  }

  // ==============================================================
  // 4. LÀM BÀI TẬP VÀ NỘP BÀI (STUDENT TAKING TEST)
  // ==============================================================

  startAssignment(assignmentId) {
    const a = this.inboxList.find(item => item.id === assignmentId);
    if (!a) return;

    this.doingAssignment = a;
    this.userAnswers = {};

    const modal = document.getElementById('modal-container');
    if (!modal) return;

    const questions = a.questions || [];

    modal.innerHTML = `
      <div class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
        <div class="glass-panel border p-5 md:p-7 rounded-3xl max-w-3xl w-full shadow-2xl animate-pop-in max-h-[92vh] overflow-y-auto scrollbar-thin"
          style="border-color: var(--border-focus);">
          
          <!-- Header Làm bài: Tiêu đề & Nút đóng -->
          <div class="flex justify-between items-center pb-3 border-b mb-4" style="border-color: var(--border-subtle);">
            <div>
              <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider mb-1"
                style="background: var(--accent-rose-bg); color: var(--accent-rose);">
                <span>📬 BÀI TẬP ĐƯỢC GIAO TỪ ${a.sender.displayName}</span>
              </div>
              <h2 class="text-lg md:text-xl font-black" style="color: var(--text-main);">${a.title}</h2>
            </div>
            <button onclick="if(confirm('Bạn có chắc muốn thoát? Các câu đã chọn vẫn sẽ được giữ lại khi quay lại.')) document.getElementById('modal-container').innerHTML=''"
              class="w-8 h-8 rounded-full flex items-center justify-center text-xs opacity-70 hover:opacity-100 transition"
              style="background: var(--surface-card-alt); color: var(--text-main);">
              ✕
            </button>
          </div>

          <!-- Banner Lời nhắn dặn dò của người giao bài -->
          ${a.note ? `
            <div class="p-3.5 rounded-2xl mb-4 text-xs italic flex items-start gap-2.5"
              style="background: var(--accent-rose-bg); border: 1px solid var(--accent-rose-border); color: var(--accent-rose);">
              <span class="text-base shrink-0">💌</span>
              <div>
                <strong>Lời nhắn từ ${a.sender.displayName}:</strong>
                <div class="mt-0.5 text-slate-200">"${a.note}"</div>
              </div>
            </div>
          ` : ''}

          <!-- Thanh tiến độ hoàn thành bài tập (Shimmer Progress Bar) -->
          <div class="p-3.5 rounded-2xl border mb-6" style="background: var(--surface-card-alt); border-color: var(--border-subtle);">
            <div class="flex justify-between items-center text-xs font-bold mb-1.5">
              <span style="color: var(--text-main);">Tiến độ làm bài:</span>
              <span id="hw-take-progress-text" class="font-extrabold" style="color: var(--cta-honey);">0/${questions.length} câu (0%)</span>
            </div>
            <div class="w-full h-2.5 rounded-full overflow-hidden" style="background: var(--surface-card-solid);">
              <div id="hw-take-progress-bar" class="h-full rounded-full transition-all duration-300 shimmer-bar"
                style="width: 0%; background: var(--accent-rose);"></div>
            </div>
          </div>

          <!-- Danh sách câu hỏi -->
          <div class="space-y-6">
            ${questions.map((q, idx) => {
              const qKey = String(q.id || `q_${idx}`);
              const isFill = !q.options || q.options.length === 0;

              return `
                <div class="p-4 md:p-5 rounded-2xl border transition shadow-sm"
                  id="hw-q-box-${qKey}"
                  style="background: var(--surface-card-alt); border-color: var(--border-subtle);">
                  
                  <div class="flex items-center justify-between gap-2 mb-2.5">
                    <div class="flex items-center gap-2">
                      <span class="text-xs font-black px-2.5 py-0.5 rounded-lg"
                        style="background: var(--accent-rose-bg); color: var(--accent-rose);">
                        Câu ${idx + 1}
                      </span>
                      <span class="text-xs font-bold" style="color: var(--text-muted);">${q.title || (isFill ? 'Điền đáp số' : 'Trắc nghiệm')}</span>
                    </div>
                    <span id="hw-answered-indicator-${qKey}" class="hidden text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Đã chọn
                    </span>
                  </div>

                  <div class="text-sm font-semibold mb-4 leading-relaxed" style="color: var(--text-main);">${q.content}</div>

                  <!-- Khung trả lời: Hỗ trợ cả Điền số lẫn Trắc nghiệm -->
                  ${isFill ? `
                    <div class="space-y-1.5">
                      <label class="block text-[11px] font-bold" style="color: var(--text-secondary);">Nhập đáp số chính xác:</label>
                      <input type="text" id="ans-${qKey}" oninput="homework.recordAnswer('${qKey}', this.value)"
                        placeholder="vd: 5, -2, 3/4, 1.5..."
                        class="w-full max-w-sm p-3 rounded-xl border text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-pink-500"
                        style="background: var(--surface-card-solid); border-color: var(--border-medium); color: var(--text-main);">
                    </div>
                  ` : `
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      ${q.options.map((opt, optIdx) => `
                        <button type="button" id="opt-btn-${qKey}-${optIdx}"
                          onclick="homework.selectOptionAnswer('${qKey}', ${optIdx})"
                          class="p-3 rounded-xl border text-xs text-left font-medium transition flex items-center gap-2.5 hover:border-pink-400 group"
                          style="background: var(--surface-card-solid); border-color: var(--border-subtle); color: var(--text-main);">
                          <span class="w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs shrink-0 transition"
                            style="background: var(--surface-card-alt); color: var(--text-secondary);">
                            ${['A', 'B', 'C', 'D'][optIdx]}
                          </span>
                          <span class="flex-1 leading-normal">${opt}</span>
                        </button>
                      `).join('')}
                    </div>
                  `}
                </div>
              `;
            }).join('')}
          </div>

          <!-- Thanh chân trang: Tổng kết & Nút Nộp Bài -->
          <div class="pt-5 border-t mt-6 flex flex-wrap justify-between items-center gap-3" style="border-color: var(--border-subtle);">
            <div class="text-xs font-bold" style="color: var(--text-muted);">
              Tổng số: ${questions.length} câu hỏi • Tự động chấm điểm
            </div>
            <button onclick="homework.submitCurrentAssignment()" id="hw-submit-test-btn"
              class="btn-3d btn-3d-honey px-7 py-3 text-sm font-black shadow-lg flex items-center gap-2">
              <span>🚀 Nộp Bài Tập</span>
              ${typeof SVG_ICONS !== 'undefined' ? SVG_ICONS.arrowRight : '➔'}
            </button>
          </div>
        </div>
      </div>
    `;

    if (typeof game !== 'undefined' && game.renderMath) {
      game.renderMath(document.getElementById('modal-container'));
    }
  }

  // Cập nhật tiến độ thanh làm bài
  updateTakeProgress() {
    if (!this.doingAssignment) return;
    const questions = this.doingAssignment.questions || [];
    const total = questions.length;
    if (total === 0) return;

    let answeredCount = 0;
    questions.forEach((q, idx) => {
      const qKey = String(q.id || `q_${idx}`);
      const val = this.userAnswers[qKey];
      const ind = document.getElementById(`hw-answered-indicator-${qKey}`);
      if (val !== undefined && val !== null && String(val).trim() !== '') {
        answeredCount++;
        if (ind) ind.classList.remove('hidden');
      } else {
        if (ind) ind.classList.add('hidden');
      }
    });

    const percent = Math.min(100, Math.round((answeredCount / total) * 100));
    const textEl = document.getElementById('hw-take-progress-text');
    const barEl = document.getElementById('hw-take-progress-bar');
    if (textEl) textEl.innerText = `${answeredCount}/${total} câu (${percent}%)`;
    if (barEl) barEl.style.width = `${percent}%`;
  }

  recordAnswer(qKey, val) {
    this.userAnswers[qKey] = val;
    this.updateTakeProgress();
  }

  selectOptionAnswer(qKey, optIdx) {
    this.userAnswers[qKey] = optIdx;

    // Cập nhật giao diện nút lựa chọn
    for (let i = 0; i < 4; i++) {
      const btn = document.getElementById(`opt-btn-${qKey}-${i}`);
      if (btn) {
        if (i === optIdx) {
          btn.style.borderColor = 'var(--accent-rose)';
          btn.style.background = 'var(--accent-rose-bg)';
          btn.classList.add('duo-bounce');
        } else {
          btn.style.borderColor = 'var(--border-subtle)';
          btn.style.background = 'var(--surface-card-solid)';
          btn.classList.remove('duo-bounce');
        }
      }
    }
    if (typeof audio !== 'undefined') audio.playClick();
    this.updateTakeProgress();
  }

  async submitCurrentAssignment() {
    if (!this.doingAssignment) return;

    const questions = this.doingAssignment.questions || [];
    const total = questions.length;
    const answeredCount = Object.keys(this.userAnswers).filter(k => {
      const v = this.userAnswers[k];
      return v !== undefined && v !== null && String(v).trim() !== '';
    }).length;

    const unanswered = total - answeredCount;
    if (unanswered > 0) {
      if (!confirm(`Bạn còn ${unanswered} câu chưa trả lời. Bạn có chắc chắn muốn nộp bài tập ngay bây giờ không?`)) {
        return;
      }
    } else {
      if (!confirm('Bạn có chắc chắn muốn nộp bài tập này không?')) {
        return;
      }
    }

    const btn = document.getElementById('hw-submit-test-btn');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span>⏳ Đang chấm điểm tự động...</span>';
    }

    try {
      const res = await fetch(`/api/assignments/${this.doingAssignment.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${storage.sessionToken}`
        },
        body: JSON.stringify({ answers: this.userAnswers })
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Nộp bài thất bại.');

      // Hiệu ứng âm thanh và pháo giấy Duolingo
      if (typeof audio !== 'undefined') {
        if (result.score >= 8) audio.playVictory();
        else if (result.score >= 5) audio.playCheer();
        else audio.playEncourage();
      }
      if (typeof app !== 'undefined' && app.triggerConfetti) {
        app.triggerConfetti({ particleCount: 90, spread: 75 });
      }

      // Làm mới danh sách bài tập và câu sai
      await this.refreshInbox();
      await this.refreshWrongQuestions();
      this.updateNavBadge();

      // Hiển thị modal tổng kết điểm số chuyên nghiệp (Không dùng alert thô)
      this.renderSubmissionSummaryModal(result, this.doingAssignment);

    } catch (e) {
      alert(`Lỗi nộp bài: ${e.message}`);
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span>🚀 Nộp Bài Tập</span>';
      }
    }
  }

  // Modal Tổng kết kết quả sau khi nộp bài
  renderSubmissionSummaryModal(result, assignment) {
    const modal = document.getElementById('modal-container');
    if (!modal) return;

    let scoreColor = 'border-emerald-500 bg-emerald-500/10 text-emerald-400';
    let titleText = 'Chúc Mừng Bạn Đã Hoàn Thành!';
    let catPraise = 'Meo meo! Quá đỉnh luôn bạn ơi! Kiến thức vững vàng chuẩn bị bứt phá điểm 9-10 rồi! 🌸🐾';

    if (result.score < 5) {
      scoreColor = 'border-rose-500 bg-rose-500/10 text-rose-400';
      titleText = 'Đã Nộp Bài Thành Công!';
      catPraise = 'Đừng nản lòng nhé! Mèo Toán đã tự động lưu các câu làm sai vào Sổ Tay Ôn Tập để bạn luyện lại rồi! 💖🐾';
    } else if (result.score < 8) {
      scoreColor = 'border-amber-500 bg-amber-500/10 text-amber-400';
      titleText = 'Làm Rất Tốt!';
      catPraise = 'Làm tốt lắm bạn ơi! Cùng xem lại một vài câu sai nhỏ để hoàn thiện 100% kiến thức nhé! 🐱✨';
    }

    modal.innerHTML = `
      <div class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
        <div class="glass-panel border p-6 md:p-8 rounded-3xl max-w-lg w-full shadow-2xl animate-pop-in text-center relative overflow-hidden"
          style="border-color: var(--border-focus);">
          
          <!-- Họa tiết phát sáng nền -->
          <div class="absolute -top-12 -right-12 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div class="absolute -bottom-12 -left-12 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <!-- Huy hiệu điểm số tròn to 3D -->
          <div class="w-28 h-28 rounded-full mx-auto mb-4 flex flex-col items-center justify-center shadow-2xl border-4 ${scoreColor} animate-bounce">
            <span class="text-3xl font-black">${result.score}</span>
            <span class="text-[10px] font-black uppercase tracking-wider">/ 10 ĐIỂM</span>
          </div>

          <h2 class="text-xl md:text-2xl font-black mb-1.5" style="color: var(--text-main);">${titleText}</h2>
          <div class="text-xs font-semibold mb-3" style="color: var(--text-muted);">${assignment.title}</div>

          <!-- Đánh giá đáng yêu từ Mèo Toán -->
          <div class="p-3.5 rounded-2xl mb-5 text-xs italic"
            style="background: var(--surface-card-alt); border: 1px solid var(--border-subtle); color: var(--text-secondary);">
            "${catPraise}"
          </div>

          <!-- Thông số thống kê -->
          <div class="grid grid-cols-2 gap-3 mb-5 text-xs font-bold">
            <div class="p-3 rounded-2xl border text-center" style="background: var(--surface-card-alt); border-color: var(--border-subtle);">
              <div style="color: var(--text-muted);">Số câu đúng</div>
              <div class="text-xl font-black text-emerald-400 mt-0.5">${result.correctCount}/${result.totalQuestions}</div>
            </div>
            <div class="p-3 rounded-2xl border text-center" style="background: var(--surface-card-alt); border-color: var(--border-subtle);">
              <div style="color: var(--text-muted);">Đã lưu câu sai</div>
              <div class="text-xl font-black ${result.wrongQuestionsSaved > 0 ? 'text-rose-400' : 'text-slate-400'} mt-0.5">
                ${result.wrongQuestionsSaved || 0} câu
              </div>
            </div>
          </div>

          ${result.wrongQuestionsSaved > 0 ? `
            <div class="p-3 rounded-2xl text-xs mb-5 flex items-center gap-2.5 text-left"
              style="background: var(--accent-rose-bg); border: 1px solid var(--accent-rose-border); color: var(--accent-rose);">
              <span class="text-2xl shrink-0">💡</span>
              <div class="flex-1 leading-relaxed">
                Các câu bạn làm chưa chính xác đã được tự động đẩy vào mục <strong>Ôn Tập Câu Sai (Smart Review)</strong> để bạn luyện lại bất cứ lúc nào!
              </div>
            </div>
          ` : ''}

          <!-- Nút hành động -->
          <div class="flex flex-col sm:flex-row gap-2.5">
            <button onclick="homework.viewSubmittedResult(${assignment.id})"
              class="btn-3d btn-3d-honey flex-1 py-2.5 text-xs font-bold shadow-sm">
              <span>📋 Xem Lời Giải Chi Tiết</span>
            </button>
            ${result.wrongQuestionsSaved > 0 ? `
              <button onclick="document.getElementById('modal-container').innerHTML=''; homework.switchSubtab('review');"
                class="btn-3d btn-3d-rose flex-1 py-2.5 text-xs font-bold shadow-sm">
                <span>🧠 Luyện Lại Câu Sai Ngay</span>
              </button>
            ` : `
              <button onclick="document.getElementById('modal-container').innerHTML=''; homework.switchSubtab('inbox');"
                class="btn-3d btn-3d-neutral flex-1 py-2.5 text-xs font-bold">
                <span>Về Hộp Thư Đến</span>
              </button>
            `}
          </div>
        </div>
      </div>
    `;

    if (this.currentSubtab === 'inbox') {
      const content = document.getElementById('hw-subtab-content');
      if (content) this.renderInbox(content);
    }
  }

  // Kiểm tra đáp án chính xác
  checkAnswerCorrect(submittedAns, q) {
    if (submittedAns === null || submittedAns === undefined) return false;
    let correct = q.correctAnswer !== undefined ? q.correctAnswer : q.correct_answer;
    if (correct === undefined) return false;

    // So sánh số nguyên (vị trí lựa chọn A, B, C, D)
    if (typeof correct === 'number' || (!isNaN(correct) && !isNaN(parseFloat(correct)))) {
      const cNum = Number(correct);
      if (typeof submittedAns === 'number' || (!isNaN(submittedAns) && !isNaN(parseFloat(submittedAns)))) {
        if (Number(submittedAns) === cNum) return true;
      }
      const letterMap = { a: 0, b: 1, c: 2, d: 3 };
      if (typeof submittedAns === 'string' && submittedAns.trim().toLowerCase() in letterMap) {
        if (letterMap[submittedAns.trim().toLowerCase()] === cNum) return true;
      }
    }

    // So sánh chữ cái (A, B, C, D)
    if (typeof correct === 'string' && ['A', 'B', 'C', 'D'].includes(correct.trim().toUpperCase())) {
      const cLet = correct.trim().toUpperCase();
      if (typeof submittedAns === 'string' && submittedAns.trim().toUpperCase() === cLet) return true;
      const invMap = { 0: 'A', 1: 'B', 2: 'C', 3: 'D' };
      if (submittedAns in invMap && invMap[submittedAns] === cLet) return true;
    }

    // So sánh chuỗi/đáp số số học
    const sSub = String(submittedAns).trim().toLowerCase().replace(/\s+/g, '').replace(',', '.');
    const sCor = String(correct).trim().toLowerCase().replace(/\s+/g, '').replace(',', '.');
    if (sSub === sCor) return true;

    // Đáp án chấp nhận được mở rộng
    const acceptables = q.acceptableAnswers || q.acceptable_answers || [];
    for (const acc of acceptables) {
      if (sSub === String(acc).trim().toLowerCase().replace(/\s+/g, '').replace(',', '.')) {
        return true;
      }
    }
    return false;
  }

  // Xem lại bài tập đã nộp kèm đáp án, kết quả đúng/sai & lời giải chi tiết
  viewSubmittedResult(assignmentId) {
    const a = this.inboxList.find(item => item.id === assignmentId);
    if (!a) return;

    const modal = document.getElementById('modal-container');
    if (!modal) return;

    const questions = a.questions || [];
    const answers = a.answers || {};

    modal.innerHTML = `
      <div class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
        <div class="glass-panel border p-5 md:p-7 rounded-3xl max-w-3xl w-full shadow-2xl animate-pop-in max-h-[92vh] overflow-y-auto scrollbar-thin"
          style="border-color: var(--border-focus);">
          
          <div class="flex justify-between items-center pb-3 border-b mb-4" style="border-color: var(--border-subtle);">
            <div>
              <div class="text-[11px] font-bold uppercase" style="color: var(--accent-rose);">Kết Quả Bài Tập Của Bạn</div>
              <h2 class="text-lg md:text-xl font-black" style="color: var(--text-main);">${a.title}</h2>
              <div class="mt-1 flex items-center gap-2">
                <span class="text-sm font-black px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Điểm số: ${a.score}/10đ
                </span>
                <span class="text-xs" style="color: var(--text-muted);">${a.status === 'late' ? 'Nộp trễ hạn' : 'Nộp đúng hạn'}</span>
              </div>
            </div>
            <button onclick="document.getElementById('modal-container').innerHTML=''" class="text-xs opacity-70 hover:opacity-100">✕ Đóng</button>
          </div>

          <div class="space-y-4">
            ${questions.map((q, idx) => {
              const qKey = String(q.id || `q_${idx}`);
              let userAns = null;
              if (Array.isArray(answers) && idx < answers.length) {
                const item = answers[idx];
                userAns = (typeof item === 'object' && item !== null && 'answer' in item) ? item.answer : item;
              } else if (typeof answers === 'object' && answers !== null) {
                userAns = answers[qKey] ?? answers[String(idx)];
              }

              const isCorrect = this.checkAnswerCorrect(userAns, q);
              const isFill = !q.options || q.options.length === 0;

              let correctDisplay = q.correctAnswer !== undefined ? q.correctAnswer : q.correct_answer;
              if (!isFill && typeof correctDisplay === 'number' && q.options && q.options[correctDisplay]) {
                correctDisplay = `${['A', 'B', 'C', 'D'][correctDisplay]}. ${q.options[correctDisplay]}`;
              }

              let userDisplay = userAns;
              if (!isFill && typeof userAns === 'number' && q.options && q.options[userAns]) {
                userDisplay = `${['A', 'B', 'C', 'D'][userAns]}. ${q.options[userAns]}`;
              }

              return `
                <div class="p-4 rounded-2xl border text-xs"
                  style="background: var(--surface-card-alt); border-color: ${isCorrect ? 'rgba(16, 185, 129, 0.4)' : 'rgba(244, 63, 94, 0.4)'};">
                  
                  <div class="flex items-center justify-between gap-2 mb-2">
                    <span class="font-bold text-sm" style="color: var(--text-main);">#${idx + 1}. ${q.content}</span>
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-black ${isCorrect ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}">
                      ${isCorrect ? '✓ Đúng' : '✗ Sai'}
                    </span>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2.5">
                    <div class="p-2.5 rounded-xl border" style="background: var(--surface-card-solid); border-color: var(--border-subtle);">
                      <span class="text-slate-400">Bạn đã chọn: </span>
                      <strong class="font-mono ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}">${userDisplay !== null && userDisplay !== undefined ? userDisplay : '(Bỏ trống)'}</strong>
                    </div>
                    <div class="p-2.5 rounded-xl border" style="background: var(--surface-card-solid); border-color: var(--border-subtle);">
                      <span class="text-slate-400">Đáp án chính xác: </span>
                      <strong class="font-mono text-emerald-400">${correctDisplay}</strong>
                    </div>
                  </div>

                  ${q.explanation ? `
                    <div class="p-3 rounded-xl border bg-black/5 dark:bg-white/5 leading-relaxed text-xs" style="border-color: var(--border-subtle); color: var(--text-muted);">
                      <strong class="text-amber-400">💡 Lời giải chi tiết:</strong><br>
                      <div class="mt-1">${q.explanation.replace(/\n/g, '<br>')}</div>
                    </div>
                  ` : ''}
                </div>
              `;
            }).join('')}
          </div>

          <div class="pt-4 border-t mt-4 flex justify-between items-center" style="border-color: var(--border-subtle);">
            <div class="text-xs" style="color: var(--text-muted);">
              ${questions.length} câu hỏi • Điểm số: <strong>${a.score}/10đ</strong>
            </div>
            <button onclick="document.getElementById('modal-container').innerHTML=''" class="btn-3d btn-3d-neutral px-5 py-2 text-xs font-bold">Đóng</button>
          </div>
        </div>
      </div>
    `;

    if (typeof game !== 'undefined' && game.renderMath) {
      game.renderMath(document.getElementById('modal-container'));
    }
  }

  // ==============================================================
  // 5. MỤC: ÔN TẬP CÂU SAI (SMART REVIEW)
  // ==============================================================

  async refreshWrongQuestions() {
    if (!storage.isLoggedIn()) return;
    try {
      const res = await fetch('/api/wrong-questions', {
        headers: { 'Authorization': `Bearer ${storage.sessionToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        this.wrongQuestions = data.wrongQuestions || data.questions || [];
      }
    } catch (e) {
      console.warn('Lỗi refresh wrong questions:', e);
    }
  }

  async renderSmartReview(container) {
    container.innerHTML = `<div class="py-12 text-center text-xs" style="color: var(--text-muted);">Đang tải sổ tay câu sai...</div>`;
    await this.refreshWrongQuestions();

    const total = this.wrongQuestions.length;
    const unmastered = this.wrongQuestions.filter(q => !q.mastered).length;
    const mastered = this.wrongQuestions.filter(q => q.mastered).length;

    // Cập nhật badge
    const reviewCounter = document.getElementById('hw-review-counter');
    if (reviewCounter) {
      if (unmastered > 0) {
        reviewCounter.innerText = unmastered;
        reviewCounter.classList.remove('hidden');
      } else {
        reviewCounter.classList.add('hidden');
      }
    }

    let filteredList = this.wrongQuestions;
    if (this.smartReviewFilter === 'need_practice') {
      filteredList = this.wrongQuestions.filter(q => !q.mastered);
    } else if (this.smartReviewFilter === 'mastered') {
      filteredList = this.wrongQuestions.filter(q => q.mastered);
    }

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Banner Tiêu Đề Smart Review -->
        <div class="p-6 rounded-3xl glass-panel border relative overflow-hidden shadow-xl"
          style="border-color: var(--border-focus); background: linear-gradient(135deg, rgba(224, 122, 134, 0.12), rgba(232, 168, 56, 0.1), rgba(0,0,0,0.3));">
          <div class="flex flex-col md:flex-row items-center justify-between gap-4">
            <div class="flex items-center gap-3.5 text-left">
              <span class="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center text-2xl shrink-0">
                🧠
              </span>
              <div>
                <h2 class="text-xl md:text-2xl font-black" style="color: var(--text-main);">
                  Sổ Tay Ôn Tập Câu Sai (Smart Review)
                </h2>
                <p class="text-xs mt-0.5 leading-relaxed" style="color: var(--text-muted);">
                  Hệ thống tự động gom các câu bạn từng làm sai từ bài tập được giao lẫn đề thi. Luyện lại đúng sẽ được đánh dấu <strong>Đã nắm vững 🌟</strong> và cộng thưởng <strong>+15 EXP</strong>!
                </p>
              </div>
            </div>

            ${unmastered > 0 ? `
              <button onclick="homework.practiceRandomWrongQuestions()"
                class="btn-3d btn-3d-honey px-5 py-3 text-xs font-black shrink-0 shadow-lg flex items-center gap-2">
                <span>🚀 Luyện Ngẫu Nhiên 5 Câu Sai</span>
              </button>
            ` : ''}
          </div>
        </div>

        <!-- 3 Thẻ Thống Kê Nhanh -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="p-4 rounded-2xl glass-card border text-center" style="border-color: var(--border-subtle);">
            <div class="text-[11px] font-bold uppercase" style="color: var(--text-muted);">Tổng Câu Từng Sai</div>
            <div class="text-2xl font-black mt-1" style="color: var(--text-main);">${total} câu</div>
          </div>
          <div class="p-4 rounded-2xl glass-card border text-center" style="border-color: rgba(244, 63, 94, 0.3);">
            <div class="text-[11px] font-bold uppercase text-rose-400">Cần Luyện Lại</div>
            <div class="text-2xl font-black text-rose-400 mt-1">${unmastered} câu</div>
          </div>
          <div class="p-4 rounded-2xl glass-card border text-center" style="border-color: rgba(16, 185, 129, 0.3);">
            <div class="text-[11px] font-bold uppercase text-emerald-400">Đã Nắm Vững 🌟</div>
            <div class="text-2xl font-black text-emerald-400 mt-1">${mastered} câu</div>
          </div>
        </div>

        <!-- Bộ Lọc Trạng Thái -->
        <div class="flex items-center justify-between gap-3 flex-wrap">
          <div class="flex items-center gap-1.5 p-1 rounded-2xl glass-card border text-xs font-bold"
            style="border-color: var(--border-subtle);">
            <button onclick="homework.filterSmartReview('all')"
              class="px-3 py-1.5 rounded-xl transition ${this.smartReviewFilter === 'all' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'}"
              style="${this.smartReviewFilter === 'all' ? 'background: var(--accent-rose);' : ''}">
              Tất cả (${total})
            </button>
            <button onclick="homework.filterSmartReview('need_practice')"
              class="px-3 py-1.5 rounded-xl transition ${this.smartReviewFilter === 'need_practice' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'}"
              style="${this.smartReviewFilter === 'need_practice' ? 'background: var(--accent-rose);' : ''}">
              Cần luyện lại (${unmastered})
            </button>
            <button onclick="homework.filterSmartReview('mastered')"
              class="px-3 py-1.5 rounded-xl transition ${this.smartReviewFilter === 'mastered' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'}"
              style="${this.smartReviewFilter === 'mastered' ? 'background: var(--accent-rose);' : ''}">
              Đã nắm vững (${mastered})
            </button>
          </div>

          <div class="text-xs" style="color: var(--text-muted);">
            Hiển thị ${filteredList.length} câu hỏi
          </div>
        </div>

        <!-- Danh Sách Các Câu Hỏi Sai -->
        ${filteredList.length === 0 ? `
          <div class="text-center py-16 p-6 glass-panel rounded-3xl border" style="border-color: var(--border-subtle);">
            <div class="text-5xl mb-3">🎉</div>
            <h3 class="text-base font-bold" style="color: var(--text-main);">
              ${this.smartReviewFilter === 'need_practice' ? 'Không còn câu nào cần luyện lại! Quá xuất sắc!' : 'Chưa có câu hỏi nào trong danh sách này.'}
            </h3>
            <p class="text-xs max-w-sm mx-auto mt-1" style="color: var(--text-muted);">
              Khi bạn làm bài tập được giao hoặc đề thi, các câu làm chưa đúng sẽ tự động được lưu vào đây để bạn ôn luyện lại.
            </p>
          </div>
        ` : `
          <div class="space-y-4">
            ${filteredList.map((wq, idx) => {
              const q = wq.question || {};
              const isMastered = Boolean(wq.mastered);
              const isFill = !q.options || q.options.length === 0;

              return `
                <div class="p-5 rounded-2xl glass-card border transition hover:border-pink-400/50 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  style="border-color: ${isMastered ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'};">
                  
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                      <span class="text-xs font-black px-2 py-0.5 rounded-lg"
                        style="background: var(--accent-rose-bg); color: var(--accent-rose);">
                        #${idx + 1}
                      </span>
                      <span class="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-black/5 dark:bg-white/5" style="color: var(--text-muted);">
                        ${q.title || (isFill ? 'Điền số' : 'Trắc nghiệm')}
                      </span>
                      <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full ${isMastered ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'}">
                        ${isMastered ? '🌟 Đã nắm vững' : `⚠️ Sai ${wq.wrongCount} lần`}
                      </span>
                      ${wq.lastWrongAt ? `
                        <span class="text-[10px]" style="color: var(--text-muted);">
                          (Lần cuối: ${new Date(wq.lastWrongAt).toLocaleDateString('vi-VN')})
                        </span>
                      ` : ''}
                    </div>

                    <div class="text-sm font-semibold leading-relaxed" style="color: var(--text-main);">
                      ${q.content || 'Nội dung câu hỏi'}
                    </div>
                  </div>

                  <div class="shrink-0">
                    <button onclick="homework.practiceWrongQuestion(${wq.id})"
                      class="btn-3d ${isMastered ? 'btn-3d-neutral' : 'btn-3d-honey'} px-5 py-2.5 text-xs font-black flex items-center gap-1.5 shadow-sm">
                      <span>${isMastered ? '🔄 Luyện Lại' : '✍️ Luyện Lại Ngay'}</span>
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    `;

    if (typeof game !== 'undefined' && game.renderMath) {
      game.renderMath(container);
    }
  }

  filterSmartReview(filter) {
    this.smartReviewFilter = filter;
    const content = document.getElementById('hw-subtab-content');
    if (content) this.renderSmartReview(content);
  }

  // Mở màn hình luyện tập câu sai tương tác
  practiceWrongQuestion(wqId) {
    const wq = this.wrongQuestions.find(item => item.id === wqId);
    if (!wq) return;

    const q = wq.question || {};
    const isFill = !q.options || q.options.length === 0;

    const modal = document.getElementById('modal-container');
    if (!modal) return;

    this.currentPracticeWqId = wqId;
    this.currentPracticeAnswer = null;

    modal.innerHTML = `
      <div class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
        <div class="glass-panel border p-5 md:p-7 rounded-3xl max-w-xl w-full shadow-2xl animate-pop-in relative"
          id="practice-card-box"
          style="border-color: var(--border-focus);">
          
          <div class="flex justify-between items-center pb-3 border-b mb-4" style="border-color: var(--border-subtle);">
            <div class="flex items-center gap-2">
              <span class="text-xl">🧠</span>
              <div>
                <h3 class="text-base font-black" style="color: var(--text-main);">Ôn Luyện Câu Sai</h3>
                <div class="text-[11px]" style="color: var(--text-muted);">Đã từng sai ${wq.wrongCount} lần • Thưởng +15 EXP khi giải đúng</div>
              </div>
            </div>
            <button onclick="document.getElementById('modal-container').innerHTML=''" class="text-xs opacity-70 hover:opacity-100">✕ Đóng</button>
          </div>

          <!-- Nội dung câu hỏi -->
          <div class="text-sm font-semibold mb-5 leading-relaxed" style="color: var(--text-main);">
            ${q.content}
          </div>

          <!-- Khung câu trả lời -->
          <div class="mb-5">
            ${isFill ? `
              <div class="space-y-1.5">
                <label class="block text-xs font-bold" style="color: var(--text-secondary);">Nhập đáp số của bạn:</label>
                <input type="text" id="practice-ans-input"
                  placeholder="Nhập kết quả (vd: 5, -2, 3/4...)"
                  class="w-full p-3 rounded-xl border text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-pink-500"
                  style="background: var(--surface-card-solid); border-color: var(--border-medium); color: var(--text-main);">
              </div>
            ` : `
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                ${(q.options || []).map((opt, optIdx) => `
                  <button type="button" id="practice-opt-${optIdx}"
                    onclick="homework.selectPracticeOption(${optIdx})"
                    class="p-3 rounded-xl border text-xs text-left font-medium transition flex items-center gap-2.5 hover:border-pink-400"
                    style="background: var(--surface-card-solid); border-color: var(--border-subtle); color: var(--text-main);">
                    <span class="w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs shrink-0"
                      style="background: var(--surface-card-alt); color: var(--text-secondary);">
                      ${['A', 'B', 'C', 'D'][optIdx]}
                    </span>
                    <span class="flex-1">${opt}</span>
                  </button>
                `).join('')}
              </div>
            `}
          </div>

          <!-- Thông báo kết quả và lời giải -->
          <div id="practice-feedback-container" class="hidden mb-5"></div>

          <!-- Nút hành động -->
          <div class="pt-4 border-t flex justify-end gap-2.5" style="border-color: var(--border-subtle);">
            <button onclick="document.getElementById('modal-container').innerHTML=''" class="btn-3d btn-3d-neutral px-4 py-2.5 text-xs font-bold">Đóng</button>
            <button onclick="homework.submitPracticeAnswer(${wqId})" id="practice-check-btn"
              class="btn-3d btn-3d-honey px-6 py-2.5 text-xs font-black shadow-lg">
              <span>Kiểm Tra Đáp Án</span>
            </button>
          </div>
        </div>
      </div>
    `;

    if (typeof game !== 'undefined' && game.renderMath) {
      game.renderMath(document.getElementById('modal-container'));
    }
  }

  selectPracticeOption(optIdx) {
    this.currentPracticeAnswer = optIdx;
    for (let i = 0; i < 4; i++) {
      const btn = document.getElementById(`practice-opt-${i}`);
      if (btn) {
        if (i === optIdx) {
          btn.style.borderColor = 'var(--accent-rose)';
          btn.style.background = 'var(--accent-rose-bg)';
          btn.classList.add('duo-bounce');
        } else {
          btn.style.borderColor = 'var(--border-subtle)';
          btn.style.background = 'var(--surface-card-solid)';
          btn.classList.remove('duo-bounce');
        }
      }
    }
    if (typeof audio !== 'undefined') audio.playClick();
  }

  async submitPracticeAnswer(wqId) {
    const wq = this.wrongQuestions.find(item => item.id === wqId);
    if (!wq) return;

    const q = wq.question || {};
    const isFill = !q.options || q.options.length === 0;

    let submittedAns = this.currentPracticeAnswer;
    if (isFill) {
      const input = document.getElementById('practice-ans-input');
      submittedAns = input ? input.value.trim() : '';
    }

    if (submittedAns === null || submittedAns === undefined || String(submittedAns).trim() === '') {
      alert('Vui lòng chọn hoặc nhập đáp án trước khi kiểm tra.');
      return;
    }

    const isCorrect = this.checkAnswerCorrect(submittedAns, q);
    const feedbackEl = document.getElementById('practice-feedback-container');
    const checkBtn = document.getElementById('practice-check-btn');
    const box = document.getElementById('practice-card-box');

    let correctDisplay = q.correctAnswer !== undefined ? q.correctAnswer : q.correct_answer;
    if (!isFill && typeof correctDisplay === 'number' && q.options && q.options[correctDisplay]) {
      correctDisplay = `${['A', 'B', 'C', 'D'][correctDisplay]}. ${q.options[correctDisplay]}`;
    }

    if (isCorrect) {
      // Đánh dấu mastered trên server
      try {
        await fetch(`/api/wrong-questions/${wqId}/master`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${storage.sessionToken}` }
        });
        wq.mastered = 1;
      } catch (e) {
        console.warn('Lỗi đánh dấu mastered:', e);
      }

      // Thưởng EXP và âm thanh
      if (typeof storage !== 'undefined' && storage.addExp) {
        storage.addExp(15);
      }
      if (typeof app !== 'undefined' && app.updateHeaderStats) {
        app.updateHeaderStats();
      }
      if (typeof audio !== 'undefined') audio.playVictory();
      if (typeof app !== 'undefined' && app.triggerConfetti) {
        app.triggerConfetti({ particleCount: 80, spread: 70 });
      }

      if (feedbackEl) {
        feedbackEl.innerHTML = `
          <div class="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-xs text-emerald-200 space-y-2">
            <div class="flex items-center gap-2 text-emerald-300 font-black text-sm">
              <span>🎉 CHÍNH XÁC! BẠN ĐÃ NẮM VỮNG CÂU NÀY!</span>
              <span class="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px]">+15 EXP</span>
            </div>
            <p>Tuyệt vời! Câu hỏi này đã được chuyển thành trạng thái <strong>Đã nắm vững 🌟</strong>.</p>
            ${q.explanation ? `
              <div class="mt-2 pt-2 border-t border-emerald-500/20 leading-relaxed text-slate-300">
                <strong class="text-amber-300">💡 Lời giải chi tiết:</strong><br>${q.explanation.replace(/\n/g, '<br>')}
              </div>
            ` : ''}
          </div>
        `;
        feedbackEl.classList.remove('hidden');
      }

      if (checkBtn) {
        checkBtn.innerHTML = '<span>🌟 Hoàn Thành</span>';
        checkBtn.className = 'btn-3d btn-3d-rose px-6 py-2.5 text-xs font-black shadow-lg';
        checkBtn.onclick = () => {
          document.getElementById('modal-container').innerHTML = '';
          const content = document.getElementById('hw-subtab-content');
          if (content && this.currentSubtab === 'review') this.renderSmartReview(content);
          this.updateNavBadge();
        };
      }

    } else {
      // Rung nhẹ kiểu Duolingo & âm thanh sai
      if (box) {
        box.classList.remove('duo-shake');
        void box.offsetWidth;
        box.classList.add('duo-shake');
      }
      if (typeof audio !== 'undefined') audio.playWrong();
      if (typeof app !== 'undefined' && app.showCatEncouragement) {
        app.showCatEncouragement('Chưa đúng rồi bạn ơi! Cùng đọc kỹ lời giải bên dưới để hiểu bản chất nhé! 🐾');
      }

      if (feedbackEl) {
        feedbackEl.innerHTML = `
          <div class="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-xs text-rose-200 space-y-2">
            <div class="font-black text-rose-300 text-sm flex items-center gap-1.5">
              <span>⚠️ CHƯA CHÍNH XÁC!</span>
            </div>
            <p>Đáp án đúng là: <strong class="text-emerald-300 font-mono">${correctDisplay}</strong></p>
            ${q.explanation ? `
              <div class="mt-2 pt-2 border-t border-rose-500/20 leading-relaxed text-slate-300">
                <strong class="text-amber-300">💡 Hướng dẫn chi tiết:</strong><br>${q.explanation.replace(/\n/g, '<br>')}
              </div>
            ` : ''}
          </div>
        `;
        feedbackEl.classList.remove('hidden');
      }
    }

    if (typeof game !== 'undefined' && game.renderMath) {
      game.renderMath(feedbackEl);
    }
  }

  // Luyện ngẫu nhiên 5 câu sai
  practiceRandomWrongQuestions() {
    const unmastered = this.wrongQuestions.filter(q => !q.mastered);
    if (unmastered.length === 0) return;
    const randomItem = unmastered[Math.floor(Math.random() * unmastered.length)];
    this.practiceWrongQuestion(randomItem.id);
  }

  // ==============================================================
  // 6. HỆ THỐNG NHẮC NHỞ HỌC TẬP HÀNG NGÀY (DAILY STUDY REMINDER)
  // ==============================================================

  async loadStudyReminder() {
    if (!storage.isLoggedIn()) return;
    try {
      const res = await fetch('/api/reminders', {
        headers: { 'Authorization': `Bearer ${storage.sessionToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        this.studyReminder = {
          dailyTime: data.dailyTime || '19:30',
          enabled: Boolean(data.enabled),
          lastNotifiedDate: data.lastNotifiedDate || null
        };
      }
    } catch (e) {
      console.warn('Lỗi tải cài đặt nhắc nhở:', e);
    }
  }

  async saveStudyReminder(dailyTime, enabled) {
    if (!storage.isLoggedIn()) {
      alert('Vui lòng đăng nhập để lưu nhắc nhở học tập.');
      return;
    }

    // Nếu người dùng bật thông báo, xin cấp quyền Web Notification
    if (enabled && typeof Notification !== 'undefined') {
      try {
        if (Notification.permission === 'default') {
          await Notification.requestPermission();
        }
      } catch (e) {}
    }

    try {
      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${storage.sessionToken}`
        },
        body: JSON.stringify({ dailyTime, enabled })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lưu cài đặt thất bại');

      this.studyReminder.dailyTime = dailyTime;
      this.studyReminder.enabled = Boolean(enabled);

      if (typeof app !== 'undefined' && app.showToast) {
        app.showToast(
          'ĐÃ LƯU NHẮC NHỞ',
          enabled ? `Hệ thống sẽ nhắc bạn học mỗi ngày vào ${dailyTime}!` : 'Đã tắt nhắc nhở học tập.',
          '⏰'
        );
      }
      return data;
    } catch (e) {
      alert(`Lỗi lưu cài đặt: ${e.message}`);
    }
  }

  startReminderTimer() {
    if (this.reminderTimer) clearInterval(this.reminderTimer);
    this.reminderTimer = setInterval(() => this.checkStudyReminder(), 30000);
  }

  checkStudyReminder() {
    if (!this.studyReminder || !this.studyReminder.enabled) return;
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${hours}:${minutes}`;

    const todayStr = now.toISOString().split('T')[0];
    if (this.studyReminder.dailyTime === currentTimeStr && this.studyReminder.lastNotifiedDate !== todayStr) {
      this.studyReminder.lastNotifiedDate = todayStr;

      // Web Notification API
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        try {
          new Notification('Toán 9 with Mavis - Đến giờ học rồi bạn ơi! 🌸', {
            body: `Đã đến ${this.studyReminder.dailyTime} rồi, cùng Mèo Toán vào làm vài bài tập để giữ phong độ nhé! 🐾`,
            icon: 'favicon.ico'
          });
        } catch (e) {}
      }

      // Thông báo in-app toast & âm thanh
      if (typeof audio !== 'undefined') audio.playCheer();
      if (typeof app !== 'undefined' && app.showToast) {
        app.showToast(
          'ĐẾN GIỜ HỌC RỒI! ⏰',
          `Đã đến ${this.studyReminder.dailyTime} rồi, cùng Mèo Toán vào ôn tập vài câu toán để giữ chuỗi phong độ nhé! 🐾`,
          '🔔'
        );
      }
    }
  }
}

// Khởi tạo thực thể toàn cục
const homework = new HomeworkManager();
if (typeof window !== 'undefined') {
  window.homework = homework;
}
