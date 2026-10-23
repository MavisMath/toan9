# -*- coding: utf-8 -*-
"""
Script to update js/app.js:
1. Update showTab to support 'more' view and highlight nav-more for gathered features.
2. Update renderHome:
   - Keep only Chuyên Đề GDPT and BT Nâng Cao outside.
   - Gather all other features into 1 item 'Chế Độ Mở Rộng'.
   - When clicking on this gathered item, toggle the display of all 7 gathered features.
3. Add renderMoreView() and toggleHomeExpandedFeatures() methods to AppController.
"""

with open('js/app.js', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update showTab method
showtab_search = """    // Kích hoạt tab được chọn
    const activeView = document.getElementById(`view-${tabName}`);
    if (activeView) activeView.classList.remove('hidden');

    const activeNavBtn = document.getElementById(`nav-${tabName}`);
    if (activeNavBtn) {
      activeNavBtn.classList.add('bg-blue-600', 'text-white', 'shadow-lg');
      activeNavBtn.classList.remove('text-slate-400', 'hover:bg-slate-800');
    }"""

showtab_replace = """    // Kích hoạt tab được chọn
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
    }"""

if showtab_search in code:
    code = code.replace(showtab_search, showtab_replace, 1)
    print("Updated showTab active tab highlighting!")
else:
    print("Warning: showtab_search not found")

# Add 'more' handler in showTab
more_search = """    } else if (tabName === 'advanced') {
      this.renderAdvancedView();
    }"""

more_replace = """    } else if (tabName === 'advanced') {
      this.renderAdvancedView();
    } else if (tabName === 'more') {
      this.renderMoreView();
    }"""

if more_search in code:
    code = code.replace(more_search, more_replace, 1)
    print("Added 'more' tab handling in showTab!")
else:
    print("Warning: more_search not found")

# 2. Update renderHome() to have only Chuyên Đề GDPT, BT Nâng Cao outside, and the gathered item
home_features_search = """      <!-- Lối vào các chế độ chơi cực hot -->
      <h2 class="text-xl font-black text-white mb-4 flex items-center gap-2">
        <span>🎮 CÁC CHẾ ĐỘ ÔN LUYỆN ĐẶC SẮC</span>
      </h2>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

        <!-- Card 1: Chuyên đề GDPT 2018 -->
        <div onclick="app.showTab('topics')" class="home-feature-card p-6 rounded-3xl glass-card border border-indigo-500/30 hover:border-indigo-400 cursor-pointer group">
          <div class="home-feature-icon w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition">
            🌸
          </div>
          <h3 class="text-lg font-black text-white group-hover:text-indigo-300 transition">Hành Trình Chuyên Đề</h3>
          <p class="text-xs text-slate-400 mt-2 leading-relaxed">
            10 chuyên đề chuẩn chương trình mới GDPT 2018 (Căn thức, Hệ PT, Lượng giác, Đường tròn, Parabol, Vi-ét...).
          </p>
          <div class="mt-4 text-xs font-bold text-indigo-400 flex items-center gap-1">
            Bắt đầu khám phá ➔
          </div>
        </div>

        <!-- Card 2: Song Đấu 1v1 -->
        <div onclick="app.showTab('pvp')" class="home-feature-card p-6 rounded-3xl glass-card border border-rose-500/30 hover:border-rose-400 cursor-pointer group">
          <div class="home-feature-icon w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition">
            💞
          </div>
          <h3 class="text-lg font-black text-white group-hover:text-rose-300 transition">Song Đấu 1v1 (2 Bạn)</h3>
          <p class="text-xs text-slate-400 mt-2 leading-relaxed">
            Hai bạn cùng ngồi chung 1 máy tính bấm phím nhanh hoặc so tài trên lớp học! Cực kỳ kịch tính và sôi động!
          </p>
          <div class="mt-4 text-xs font-bold text-rose-400 flex items-center gap-1">
            Thách đấu ngay ➔
          </div>
        </div>

        <!-- Card 3: Đề thi thật Học Kỳ I Nghĩa An -->
        <div onclick="app.showTab('exams')" class="home-feature-card p-6 rounded-3xl glass-card border border-emerald-500/30 hover:border-emerald-400 cursor-pointer group">
          <div class="home-feature-icon w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition">
            🍓
          </div>
          <h3 class="text-lg font-black text-white group-hover:text-emerald-300 transition">Luyện Đề Thi Học Kỳ & Tuyển Sinh</h3>
          <p class="text-xs text-slate-400 mt-2 leading-relaxed">
            Đề thi học kỳ 2025-2026 chính thức (Trắc nghiệm, Đúng/Sai, Điền số và Lời giải tự luận chi tiết).
          </p>
          <div class="mt-4 text-xs font-bold text-emerald-400 flex items-center gap-1">
            Làm bài thi thử ➔
          </div>
        </div>
      </div>"""

home_features_replace = """      <!-- Banner chính lựa chọn mục học tập -->
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-black text-white flex items-center gap-2">
          <span>🎯 CHƯƠNG TRÌNH HỌC TẬP & ÔN LUYỆN TOÁN 9</span>
        </h2>
        <span class="text-xs text-slate-400 hidden sm:inline">2 Chuyên đề trọng tâm & 1 Mục tính năng mở rộng</span>
      </div>

      <!-- 3 MỤC CHÍNH TRÊN TRANG CHỦ (CHỪA LẠI CHUYÊN ĐỀ GDPT VÀ BT NÂNG CAO, CÒN LẠI GOM VÀO MỤC MỞ RỘNG) -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        <!-- MỤC 1: CHUYÊN ĐỀ GDPT (BÊN NGOÀI) -->
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

        <!-- MỤC 2: BT NÂNG CAO (BÊN NGOÀI) -->
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
              Gom toàn bộ các tính năng còn lại: <strong>Leo Tháp Tri Thức, 60s Tốc Độ, Song Đấu 1v1, Luyện Đề Học Kỳ, Sổ Tay Công Thức, Bảng Vàng & Góc Thầy Cô</strong>.
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
      </div>"""

if home_features_search in code:
    code = code.replace(home_features_search, home_features_replace, 1)
    print("Replaced Home cards with 3 primary sections and expandable gathered features!")
else:
    print("Warning: home_features_search not found!")

# 3. Add toggleHomeExpandedFeatures() and renderMoreView() to AppController
more_methods = """
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
                <span class="text-[10px] bg-purple-500/30 px-1.5 py-0.5 rounded uppercase">7 Chế độ & Tiện ích</span>
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
"""

avatar_search = "  selectAvatar(icon) {"
if avatar_search in code:
    code = code.replace(avatar_search, more_methods + "\n  selectAvatar(icon) {", 1)
    print("Added toggleHomeExpandedFeatures and renderMoreView methods!")
else:
    print("Warning: avatar_search not found!")

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(code)

print("js/app.js updated successfully!")
