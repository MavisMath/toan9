// ================================================================
// QUẢN LÝ TIẾN ĐỘ, LEVEL, HUY HIỆU VÀ DỮ LIỆU CỤC BỘ (LOCALSTORAGE)
// ================================================================

class StorageManager {
  constructor() {
    this.STORAGE_KEY = 'math9_player_data';
    this.CUSTOM_Q_KEY = 'math9_custom_questions';
    this.LEADERBOARD_KEY = 'math9_leaderboard';
    this.CLIENT_ID_KEY = 'math9_client_id';
    this.SESSION_TOKEN_KEY = 'math9_session_token';
    this.USER_KEY = 'math9_current_user';

    this.sessionToken = localStorage.getItem(this.SESSION_TOKEN_KEY) || null;
    this.currentUser = this.loadCurrentUser();
    this.clientId = this.getClientId();
    this.databaseSyncTimer = null;
    this.databaseInitialized = false;
    this.profile = this.loadProfile();
  }

  loadCurrentUser() {
    try {
      const raw = localStorage.getItem(this.USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  isLoggedIn() {
    return !!(this.sessionToken && this.currentUser);
  }

  getClientId() {
    let id = localStorage.getItem(this.CLIENT_ID_KEY);
    if (!id) {
      id = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, char => {
            const random = Math.random() * 16 | 0;
            return (char === 'x' ? random : (random & 3 | 8)).toString(16);
          });
      localStorage.setItem(this.CLIENT_ID_KEY, id);
    }
    return id;
  }

  async initializeDatabaseSync() {
    // 1. Nếu đã có phiên đăng nhập, kiểm tra và nạp dữ liệu tài khoản từ SQL Server
    if (this.sessionToken) {
      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${this.sessionToken}`
          }
        });
        if (response.ok) {
          const result = await response.json();
          this.currentUser = result.user;
          localStorage.setItem(this.USER_KEY, JSON.stringify(this.currentUser));
          if (result.profile) {
            this.profile = { ...this.getDefaultProfile(), ...result.profile };
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.profile));
          }
          if (result.customQuestions) {
            localStorage.setItem(this.CUSTOM_Q_KEY, JSON.stringify(result.customQuestions));
          }
          if (result.leaderboard) {
            localStorage.setItem(this.LEADERBOARD_KEY, JSON.stringify(result.leaderboard));
          }
          this.databaseInitialized = true;
          return;
        } else if (response.status === 401) {
          // Phiên đã hết hạn
          this.clearSession();
        }
      } catch (error) {
        console.info('Không thể xác thực với máy chủ lúc khởi động; đang dùng phiên cục bộ.', error);
      }
    }

    // 2. Nếu chưa đăng nhập, nạp trạng thái khách nếu có
    const hadLocalProfile = localStorage.getItem(this.STORAGE_KEY) !== null;
    try {
      const response = await fetch(`/api/profile?clientId=${encodeURIComponent(this.clientId)}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      if (!hadLocalProfile && result.state && result.state.profile) {
        this.profile = { ...this.getDefaultProfile(), ...result.state.profile };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.profile));
        localStorage.setItem(this.CUSTOM_Q_KEY, JSON.stringify(result.state.customQuestions || []));
        localStorage.setItem(this.LEADERBOARD_KEY, JSON.stringify(result.state.leaderboard || []));
      }
    } catch (error) {
      console.info('Chưa đồng bộ được SQL Server; website vẫn lưu dữ liệu trong trình duyệt.', error);
    }
    this.databaseInitialized = true;
  }

  scheduleDatabaseSync() {
    clearTimeout(this.databaseSyncTimer);
    this.databaseSyncTimer = setTimeout(() => this.syncToDatabase(), 800);
  }

  async syncToDatabase() {
    const payload = {
      clientId: this.clientId,
      sessionToken: this.sessionToken,
      profile: this.profile,
      customQuestions: this.getCustomQuestions(),
      leaderboard: this.getLeaderboard()
    };
    const headers = { 'Content-Type': 'application/json' };
    if (this.sessionToken) {
      headers['Authorization'] = `Bearer ${this.sessionToken}`;
    }

    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      console.info('Không đồng bộ được dữ liệu lên SQL Server; bản lưu trình duyệt vẫn được giữ.', error);
    }
  }

  async register(username, password, displayName, avatar) {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, displayName, avatar })
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Đăng ký tài khoản thất bại.');
    }

    this.applyAuthSuccess(result);
    return result;
  }

  async login(username, password) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Đăng nhập thất bại.');
    }

    this.applyAuthSuccess(result);
    return result;
  }

  applyAuthSuccess(result) {
    this.sessionToken = result.sessionToken;
    this.currentUser = result.user;
    localStorage.setItem(this.SESSION_TOKEN_KEY, this.sessionToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(this.currentUser));

    if (result.profile) {
      this.profile = { ...this.getDefaultProfile(), ...result.profile };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.profile));
    }
    if (result.customQuestions) {
      localStorage.setItem(this.CUSTOM_Q_KEY, JSON.stringify(result.customQuestions));
    }
    if (result.leaderboard) {
      localStorage.setItem(this.LEADERBOARD_KEY, JSON.stringify(result.leaderboard));
    }
    this.databaseInitialized = true;
  }

  async logout() {
    if (this.sessionToken) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.sessionToken}`
          },
          body: JSON.stringify({ sessionToken: this.sessionToken })
        });
      } catch (e) {
        console.warn('Lỗi gọi API đăng xuất:', e);
      }
    }
    this.clearSession();
  }

  clearSession() {
    this.sessionToken = null;
    this.currentUser = null;
    localStorage.removeItem(this.SESSION_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.profile = this.getDefaultProfile();
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.profile));
  }

  // Khởi tạo hồ sơ mặc định nếu chưa có
  getDefaultProfile() {
    return {
      name: 'Chiến Binh Toán 9',
      avatar: '🐱',
      level: 1,
      exp: 0,
      expToNextLevel: 100,
      diamonds: 50,
      streak: 0,
      maxStreak: 0,
      highestFloor: 1,
      unlockedAvatars: ['av_1'],
      unlockedAchievements: [],
      answeredQuestions: {}, // { [qId]: { correct: count, wrong: count } }
      topicProgress: {}, // { [topicId]: { correct: 0, total: 0 } }
      advancedHistory: {}, // { [qId]: { attempts: 0, correct: 0, wrong: 0, lastAttempt: timestamp } }
      recentAdvancedQIds: [], // rolling list of recently seen qIds
      advancedTopicProgress: {}, // { [topicId]: { correct: 0, total: 0 } }
      speedHighScore: 0,
      lastPlayedDate: null
    };
  }

  loadProfile() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        return { ...this.getDefaultProfile(), ...JSON.parse(data) };
      }
    } catch (e) {
      console.error('Lỗi đọc dữ liệu hồ sơ:', e);
    }
    return this.getDefaultProfile();
  }

  saveProfile() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.profile));
      this.scheduleDatabaseSync();
    } catch (e) {
      console.error('Lỗi lưu hồ sơ:', e);
    }
  }

  // Thêm EXP và xử lý lên cấp
  addExp(amount, onLevelUp) {
    this.profile.exp += amount;
    let leveledUp = false;

    // Công thức tính EXP cấp tiếp theo: 100 * (level ^ 1.25)
    let needed = Math.floor(100 * Math.pow(this.profile.level, 1.25));
    while (this.profile.exp >= needed) {
      this.profile.exp -= needed;
      this.profile.level++;
      leveledUp = true;
      needed = Math.floor(100 * Math.pow(this.profile.level, 1.25));

      // Mở khóa avatar theo cấp
      if (typeof AVATARS !== 'undefined') {
        AVATARS.forEach(av => {
          if (this.profile.level >= av.unlockLevel && !this.profile.unlockedAvatars.includes(av.id)) {
            this.profile.unlockedAvatars.push(av.id);
          }
        });
      }
    }

    this.profile.expToNextLevel = needed;
    this.saveProfile();

    if (leveledUp && typeof onLevelUp === 'function') {
      onLevelUp(this.profile.level);
    }
    return leveledUp;
  }

  // Ghi nhận câu trả lời
  recordAnswer(qId, topicId, isCorrect) {
    if (!this.profile.answeredQuestions[qId]) {
      this.profile.answeredQuestions[qId] = { correct: 0, wrong: 0 };
    }
    if (isCorrect) {
      this.profile.answeredQuestions[qId].correct++;
      this.profile.streak++;
      if (this.profile.streak > this.profile.maxStreak) {
        this.profile.maxStreak = this.profile.streak;
      }
    } else {
      this.profile.answeredQuestions[qId].wrong++;
      this.profile.streak = 0;
    }

    // Ghi nhận theo chuyên đề
    if (topicId) {
      if (!this.profile.topicProgress[topicId]) {
        this.profile.topicProgress[topicId] = { correct: 0, total: 0 };
      }
      this.profile.topicProgress[topicId].total++;
      if (isCorrect) {
        this.profile.topicProgress[topicId].correct++;
      }
    }

    this.saveProfile();
  }

  // Mở khóa tầng tháp tiếp theo
  unlockNextFloor(floor) {
    if (floor >= this.profile.highestFloor && floor < 10) {
      this.profile.highestFloor = floor + 1;
      this.saveProfile();
    }
  }

  // Kiểm tra và mở khóa huy hiệu
  checkAchievements(onUnlock) {
    if (typeof ACHIEVEMENTS === 'undefined') return [];
    const newlyUnlocked = [];

    ACHIEVEMENTS.forEach(ach => {
      if (this.profile.unlockedAchievements.includes(ach.id)) return;

      let unlock = false;
      if (ach.id === 'first_win') {
        const totalCorrect = Object.values(this.profile.answeredQuestions).reduce((s, q) => s + (q.correct > 0 ? 1 : 0), 0);
        if (totalCorrect >= 1) unlock = true;
      } else if (ach.id === 'combo_5' && this.profile.maxStreak >= 5) {
        unlock = true;
      } else if (ach.id === 'combo_10' && this.profile.maxStreak >= 10) {
        unlock = true;
      } else if (ach.id === 'floor_3' && this.profile.highestFloor >= 4) {
        unlock = true;
      } else if (ach.id === 'floor_7' && this.profile.highestFloor >= 8) {
        unlock = true;
      } else if (ach.id === 'tower_master' && this.profile.highestFloor >= 10) {
        unlock = true;
      } else if (ach.id === 'speed_master' && this.profile.speedHighScore >= 150) {
        unlock = true;
      }

      if (unlock) {
        this.profile.unlockedAchievements.push(ach.id);
        this.addExp(ach.exp);
        newlyUnlocked.push(ach);
        if (typeof onUnlock === 'function') onUnlock(ach);
      }
    });

    if (newlyUnlocked.length > 0) {
      this.saveProfile();
    }
    return newlyUnlocked;
  }

  // Lấy câu hỏi do giáo viên thêm vào
  getCustomQuestions() {
    try {
      const data = localStorage.getItem(this.CUSTOM_Q_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  // Thêm câu hỏi mới của giáo viên
  addCustomQuestion(question) {
    const questions = this.getCustomQuestions();
    questions.push({
      ...question,
      id: 'custom_' + Date.now(),
      isCustom: true
    });
    localStorage.setItem(this.CUSTOM_Q_KEY, JSON.stringify(questions));
    this.scheduleDatabaseSync();
    return questions;
  }

  // Xóa câu hỏi tùy chỉnh
  deleteCustomQuestion(id) {
    const questions = this.getCustomQuestions().filter(q => q.id !== id);
    localStorage.setItem(this.CUSTOM_Q_KEY, JSON.stringify(questions));
    this.scheduleDatabaseSync();
    return questions;
  }

  // Cập nhật điểm kỉ lục thử thách tốc độ
  updateSpeedScore(score) {
    if (score > (this.profile.speedHighScore || 0)) {
      this.profile.speedHighScore = score;
      this.saveProfile();
      return true;
    }
    return false;
  }

  // Lấy tất cả câu hỏi (bao gồm cả mặc định + câu hỏi của thầy/cô)
  getAllQuestions() {
    const defaultQs = typeof QUESTIONS !== 'undefined' ? QUESTIONS : [];
    const customQs = this.getCustomQuestions();
    return [...defaultQs, ...customQs];
  }

  // Bảng xếp hạng cục bộ
  getLeaderboard() {
    try {
      const data = localStorage.getItem(this.LEADERBOARD_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {}
    // Mặc định tạo một số kỷ lục mẫu giả lập lớp học
    return [
      { name: 'Nguyễn Văn Minh (Lớp 9A)', avatar: '👑', score: 980, level: 22, streak: 14 },
      { name: 'Trần Thu Hà (Lớp 9B)', avatar: '🦉', score: 860, level: 19, streak: 12 },
      { name: 'Lê Hoàng Nam (Lớp 9A)', avatar: '🐯', score: 720, level: 16, streak: 9 },
      { name: 'Phạm Ngọc Ánh (Lớp 9C)', avatar: '🦊', score: 650, level: 14, streak: 8 },
      { name: 'Đặng Tuấn Anh (Lớp 9B)', avatar: '🐱', score: 510, level: 11, streak: 6 }
    ];
  }

  addLeaderboardRecord(name, score, level) {
    const list = this.getLeaderboard();
    list.push({
      name: name || this.profile.name,
      avatar: this.profile.avatar,
      score: score,
      level: level || this.profile.level,
      date: new Date().toLocaleDateString('vi-VN')
    });
    list.sort((a, b) => b.score - a.score);
    const top10 = list.slice(0, 15);
    localStorage.setItem(this.LEADERBOARD_KEY, JSON.stringify(top10));
    this.scheduleDatabaseSync();
    return top10;
  }

  // Ghi nhận kết quả làm bài tập nâng cao điền đáp án
  recordAdvancedAnswer(qId, topicId, isCorrect) {
    if (!this.profile.advancedHistory) this.profile.advancedHistory = {};
    if (!this.profile.advancedHistory[qId]) {
      this.profile.advancedHistory[qId] = { attempts: 0, correct: 0, wrong: 0, lastAttempt: Date.now() };
    }
    const item = this.profile.advancedHistory[qId];
    item.attempts++;
    item.lastAttempt = Date.now();

    if (isCorrect) {
      item.correct++;
      this.profile.streak++;
      if (this.profile.streak > this.profile.maxStreak) {
        this.profile.maxStreak = this.profile.streak;
      }
      this.profile.diamonds = (this.profile.diamonds || 0) + 5; // Thưởng 5 kim cương cho bài nâng cao
    } else {
      item.wrong++;
      this.profile.streak = 0;
    }

    if (!this.profile.advancedTopicProgress) this.profile.advancedTopicProgress = {};
    if (topicId) {
      if (!this.profile.advancedTopicProgress[topicId]) {
        this.profile.advancedTopicProgress[topicId] = { correct: 0, total: 0 };
      }
      this.profile.advancedTopicProgress[topicId].total++;
      if (isCorrect) {
        this.profile.advancedTopicProgress[topicId].correct++;
      }
    }

    this.saveProfile();
  }

  // Thuật toán chọn câu hỏi ngẫu nhiên thông minh chống lặp lại
  getRandomAdvancedQuestion(topicId = null, excludeId = null) {
    if (typeof ADVANCED_FILL_QUESTIONS === 'undefined' || ADVANCED_FILL_QUESTIONS.length === 0) {
      return null;
    }

    // 1. Lọc theo chuyên đề
    let pool = ADVANCED_FILL_QUESTIONS;
    if (topicId && topicId !== 'all') {
      pool = pool.filter(q => q.topicId === topicId);
    }
    if (pool.length === 0) pool = ADVANCED_FILL_QUESTIONS;

    // 2. Loại trừ câu hỏi đang hiển thị nếu có nhiều hơn 1 câu
    if (excludeId && pool.length > 1) {
      pool = pool.filter(q => q.id !== excludeId);
    }

    const history = this.profile.advancedHistory || {};
    const recent = this.profile.recentAdvancedQIds || [];

    // 3. Phân nhóm ưu tiên theo thuật toán ngắt quãng chống lặp:
    // Loại trừ các câu hỏi vừa xuất hiện trong rolling history gần nhất (nếu còn câu khác)
    const notRecentPool = pool.filter(q => !recent.includes(q.id));
    const activePool = notRecentPool.length > 0 ? notRecentPool : pool;

    // Ưu tiên 1: Câu chưa từng làm bao giờ
    const unattempted = activePool.filter(q => !history[q.id] || history[q.id].attempts === 0);
    // Ưu tiên 2: Câu đã từng làm sai (để ôn tập lại khắc phục lỗi)
    const needReview = activePool.filter(q => history[q.id] && history[q.id].wrong > 0 && history[q.id].correct === 0);
    // Ưu tiên 3: Câu ít làm nhất
    const lowPractice = activePool.filter(q => history[q.id] && history[q.id].attempts <= 2);

    let candidatePool = [];
    if (unattempted.length > 0) {
      candidatePool = unattempted;
    } else if (needReview.length > 0) {
      candidatePool = needReview;
    } else if (lowPractice.length > 0) {
      candidatePool = lowPractice;
    } else {
      candidatePool = activePool;
    }

    // 4. Xáo trộn ngẫu nhiên Fisher-Yates trong nhóm ưu tiên
    const shuffled = [...candidatePool].sort(() => 0.5 - Math.random());
    const selected = shuffled[0];

    // 5. Cập nhật rolling window gần nhất (giữ tối đa 12 câu để chống lặp)
    if (selected) {
      if (!this.profile.recentAdvancedQIds) this.profile.recentAdvancedQIds = [];
      this.profile.recentAdvancedQIds.push(selected.id);
      if (this.profile.recentAdvancedQIds.length > 12) {
        this.profile.recentAdvancedQIds.shift();
      }
      this.saveProfile();
    }

    return selected;
  }

  // Thống kê tiến độ bài tập nâng cao
  getAdvancedStats() {
    const history = this.profile.advancedHistory || {};
    const allQs = typeof ADVANCED_FILL_QUESTIONS !== 'undefined' ? ADVANCED_FILL_QUESTIONS : [];
    const totalQuestions = allQs.length;
    let solvedCount = 0;
    let correctCount = 0;
    let totalAttempts = 0;

    Object.values(history).forEach(item => {
      if (item.attempts > 0) {
        solvedCount++;
        totalAttempts += item.attempts;
        if (item.correct > 0) correctCount++;
      }
    });

    const accuracy = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0;
    return {
      totalQuestions,
      solvedCount,
      correctCount,
      accuracy,
      streak: this.profile.streak || 0
    };
  }

  // Reset tiến trình
  resetAll() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.profile = this.getDefaultProfile();
    this.saveProfile();
  }
}

const storage = new StorageManager();
