// ================================================================
// QUẢN LÝ ĐA NGÔN NGỮ (VIỆT - ANH) CHO TOÁN 9 WITH MAVIS
// ================================================================

class I18nManager {
  constructor() {
    this.STORAGE_KEY = 'math9_language';
    this.currentLang = localStorage.getItem(this.STORAGE_KEY) || 'vi';

    this.translations = {
      vi: {
        // Topbar & Navigation
        'brand.title': 'Toán 9 with Mavis xinh gái',
        'brand.subtitle': 'Hệ thống ôn luyện vừa học vừa chơi',
        'brand.badge': 'GDPT 2018',
        'nav.home': 'Trang Chủ',
        'nav.exercises': 'Bài Tập',
        'nav.games': 'Game',
        'nav.more': 'Mở Rộng',
        'nav.extended': 'Mở Rộng',
        'nav.topics': 'BT cơ bản',
        'nav.advanced': 'BT Nâng Cao',
        'nav.fillNumber': 'Điền số',
        'nav.homework': 'Bài Tập',
        'nav.itemsCount': '4 mục',
        'player.guest': 'Khách',
        'player.level': 'Lv.',
        'player.online': 'Online',
        'player.streakTitle': 'Chuỗi ngày chăm chỉ',
        'player.diamondsTitle': 'Kim cương tích lũy',
        'btn.themeLight': 'Sáng',
        'btn.themeDark': 'Tối',
        'btn.themeTitle': 'Chuyển đổi giao diện Sáng / Tối',
        'btn.langTitle': 'Chuyển đổi ngôn ngữ Tiếng Việt / English',
        'btn.soundOn': 'Âm thanh',
        'btn.soundOff': 'Tắt âm',
        'btn.soundTitle': 'Bật / Tắt âm thanh hiệu ứng',
        'btn.login': 'Đăng Nhập',
        'btn.logout': 'Thoát',
        'btn.logoutConfirm': 'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản không?',

        // Home View Hero Banner
        'home.streak': 'Chuỗi ngày ôn luyện:',
        'home.streakDays': 'ngày',
        'home.heroTitle': 'Chinh Phục Toán 9 Cực Đỉnh',
        'home.heroDesc': 'Học mà chơi, chơi mà học! Vượt ải boss, thi đấu tốc độ, làm chủ định lý Vi-ét, căn thức, hệ phương trình và bứt phá điểm 9-10 vào lớp 10!',
        'home.btnTower': 'Leo Tháp Tri Thức',
        'home.btnSpeed': 'Thử Thách 60 Giây',

        // Home Stats
        'stats.curLevel': 'CẤP ĐỘ HIỆN TẠI',
        'stats.rankNovice': 'Chiến Binh Toán 9',
        'stats.questionsDone': 'CÂU HỎI ĐÃ LÀM',
        'stats.richBank': 'Ngân hàng phong phú',
        'stats.towerFloor': 'THÁP TRI THỨC',
        'stats.targetFloor10': 'Mục tiêu: Đỉnh Tháp 10',
        'stats.speedRecord': 'KỶ LỤC TỐC ĐỘ',
        'stats.fastReflex': 'Phản xạ nhẩm tính',

        // Home Core Cards
        'curriculum.title': 'CHƯƠNG TRÌNH HỌC TẬP & ÔN LUYỆN TOÁN 9',
        'curriculum.sub': '3 Phân hệ chính: Bài tập, Game đấu trường & Tiện ích mở rộng',
        'card.topicsTitle': 'Chuyên Đề GDPT',
        'card.topicsDesc': '10 chuyên đề chuẩn chương trình mới GDPT 2018 (Căn thức, Hệ PT, Lượng giác, Đường tròn, Parabol, Vi-ét...). Luyện tập trắc nghiệm chọn lọc theo bài học kèm lý thuyết.',
        'card.topicsBtn': 'Bắt đầu ôn tập',
        'card.advTitle': 'BT Nâng Cao',
        'card.advDesc': 'Tuyển chọn 48 bài toán vận dụng cao từ SBT Toán 9 KNTT (Tập 1 & 2). Tự tính toán và điền đáp số ngắn, thuật toán Random thông minh chống trùng lặp!',
        'card.advBtn': 'Bứt phá điểm 9-10',
        'card.moreTitle': 'Tiện Ích Mở Rộng',
        'card.moreDesc': 'Giao nhận bài tập theo username/email, góc giáo viên in đề A4, luyện đề thi học kỳ và cẩm nang công thức.',
        'card.moreExpand': 'Mở rộng tính năng',
        'card.moreCollapse': 'Ẩn bớt các tính năng',
        'card.moreBtn': 'Khám phá tiện ích',

        // 3 Thẻ lối tắt trang chủ mới
        'card.exercisesTitle': 'Kho Bài Tập',
        'card.exercisesDesc': 'Luyện tập 10 chuyên đề GDPT 2018 và 48 bài toán thực tế nâng cao điền số có lời giải chi tiết.',
        'card.exercisesBtn': 'Vào kho bài tập',
        'card.gamesTitle': 'Đấu Trường Game',
        'card.gamesDesc': 'Leo tháp 10 tầng diệt boss, thử thách tốc độ 60s, song đấu 1v1 đối kháng và bảng vàng vinh danh.',
        'card.gamesBtn': 'Vào đấu trường',

        // Phân hệ Bài Tập
        'exercises.badge': 'HỌC TẬP & LUYỆN TẬP TOÁN 9',
        'exercises.title': 'Kho Bài Tập Toán 9',
        'exercises.subtitle': 'Tuyển chọn 10 chuyên đề bám sát chương trình GDPT 2018 và 48 bài toán thực tế nâng cao điền số từ SBT.',
        'exercises.tabBasic': 'BT Cơ bản (GDPT 2018)',
        'exercises.tabAdvanced': 'BT Nâng cao (Điền số)',

        // Phân hệ Game
        'games.badge': 'ĐẤU TRƯỜNG TOÁN HỌC',
        'games.title': 'Đấu Trường Game Toán Học',
        'games.subtitle': 'Vượt ải boss tháp tri thức, rèn phản xạ nhẩm nhanh 60 giây, thi đấu đối kháng trực tiếp và vinh danh trên bảng vàng!',

        // Phân hệ Mở Rộng
        'more.badge': 'TIỆN ÍCH & CÔNG CỤ',
        'more.title': 'Tiện Ích & Công Cụ Mở Rộng',
        'more.subtitle': 'Hệ thống giao nhận bài tập, góc giáo viên tạo đề A4, luyện đề thi học kỳ và cẩm nang công thức.',
        'more.homeworkTitle': 'Giao & Nhận Bài Tập',
        'more.homeworkDesc': 'Hệ thống gửi nhận bài tập theo username/email, tự động chấm điểm và sổ tay luyện lại câu sai thông minh.',
        'more.homeworkBtn': 'Vào hộp thư bài tập',

        // Extended 7 Features
        'feat.tower': 'Leo Tháp Tri Thức',
        'feat.towerDesc': 'Vượt qua 10 tầng tháp thử thách, chiến đấu đánh bại các Boss Toán học để giành vinh quang!',
        'feat.towerBtn': 'Bắt đầu leo tháp',
        'feat.speed': 'Thử Thách 60 Giây',
        'feat.speedDesc': 'Rèn luyện kỹ năng nhẩm nhanh, phản xạ thần tốc giải trắc nghiệm toán dưới áp lực thời gian.',
        'feat.speedBtn': 'Đua tốc độ ngay',
        'feat.pvp': 'Song Đấu 1v1 Đối Kháng',
        'feat.pvpDesc': 'Hai bạn cùng bấm phím trên 1 máy tính để so tài giải toán nhanh và chính xác nhất!',
        'feat.pvpBtn': 'Thách đấu bạn bè',
        'feat.exams': 'Luyện Đề Thi Học Kỳ',
        'feat.examsDesc': 'Bộ đề thi thật trường THCS Nghĩa An và Sở GD&ĐT chuẩn ma trận: trắc nghiệm, đúng/sai và tự luận.',
        'feat.examsBtn': 'Làm bài thi thử',
        'feat.cheatsheet': 'Sổ Tay Công Thức',
        'feat.cheatsheetDesc': 'Tra cứu thần tốc các công thức căn thức, hệ thức lượng, đường tròn, Vi-ét và hình khối không gian.',
        'feat.cheatsheetBtn': 'Mở sổ tay tra cứu',
        'feat.leaderboard': 'Bảng Vàng Vinh Danh',
        'feat.leaderboardDesc': 'Xếp hạng thành tích các chiến binh chăm chỉ, chuỗi ngày streak cao và điểm số kỷ lục.',
        'feat.leaderboardBtn': 'Xem bảng xếp hạng',
        'feat.teacher': 'Góc Thầy Cô',
        'feat.teacherDesc': 'Công cụ thêm câu hỏi riêng của giáo viên, xuất đề kiểm tra và quản lý lớp học dễ dàng.',
        'feat.teacherBtn': 'Vào góc thầy cô',

        // Auth Modal
        'auth.loginTitle': 'Đăng Nhập Tài Khoản',
        'auth.regTitle': 'Tạo Tài Khoản Mới',
        'auth.sub': 'Hệ thống tài khoản học tập trực tuyến',
        'auth.tabLogin': 'Đăng Nhập',
        'auth.tabReg': 'Tạo Tài Khoản',
        'auth.username': 'Tên đăng nhập (Username):',
        'auth.loginUsernameOrEmail': 'Tên đăng nhập hoặc Email:',
        'auth.emailOptional': 'Email (tùy chọn - dùng để nhận bài tập dễ hơn):',
        'auth.password': 'Mật khẩu:',
        'auth.displayName': 'Tên hiển thị (Họ tên học sinh):',
        'auth.avatarPrompt': 'Chọn Linh Vật ban đầu:',
        'auth.sampleAcc': 'Mẫu có sẵn:',
        'auth.quickFill': 'Điền nhanh',
        'auth.btnSubmitLogin': 'Đăng Nhập Ngay',
        'auth.btnSubmitReg': 'Tạo Tài Khoản & Bắt Đầu Học',
        'auth.noAccPrompt': 'Chưa có tài khoản? Bấm để tạo tài khoản mới trong 10 giây',
        'auth.hasAccPrompt': 'Đã có tài khoản rồi? Bấm để đăng nhập ngay',

        // Homework System
        'homework.badge': 'HỆ THỐNG GIAO & NHẬN BÀI TẬP',
        'homework.title': 'Bài Tập & Thử Thách Nhóm',
        'homework.tabInbox': 'Hộp Thư Đến',
        'homework.tabCompose': 'Giao Bài Mới',
        'homework.tabSent': 'Bài Đã Giao',
        'homework.tabReview': 'Ôn Tập Câu Sai',
        'reminder.title': 'Nhắc Giờ Học Mỗi Ngày',
        'reminder.desc': 'Tự động nhắc bạn học qua trình duyệt vào giờ cố định mỗi ngày để giữ phong độ và chuỗi Streak!',

        // Chatbot
        'chat.name': 'Mèo Toán Thông Thái',
        'chat.desc': 'Hỏi kiến thức Toán & ứng dụng đời sống',
        'chat.welcome': 'Chào bạn! Mình có thể giải thích kiến thức Toán cơ bản và gợi ý cách áp dụng vào đời sống. Bạn thử hỏi về phần trăm, phương trình, hình học hoặc thống kê nhé 🌸',
        'chat.sug1': 'Phần trăm dùng thế nào?',
        'chat.sug2': 'Định lý Pythagore là gì?',
        'chat.sug3': 'Ứng dụng phương trình?',
        'chat.placeholder': 'Nhập câu hỏi của bạn...',
        'chat.send': 'Gửi',
        'chat.disclaimer': 'Câu hỏi được gửi tới Google Gemini để trả lời. Đối chiếu lại lời giải với giáo viên khi cần.',
        'chat.toggle': 'Hỏi Mèo Toán',
        'chat.dock': 'Ghim về góc mặc định',

        // 10 Chuyên Đề GDPT 2018
        'topics.badge': 'CHƯƠNG TRÌNH GDPT 2018',
        'topics.title': 'CHINH PHỤC THEO CHUYÊN ĐỀ',
        'topics.subtitle': 'Chọn chuyên đề bạn cần củng cố kiến thức để luyện tập từng câu kèm giải thích chi tiết!',
        'topics.progress': 'Tiến độ chuyên đề:',
        'topics.practiceBtn': 'Luyện Tập Chuyên Đề',
        'topics.returnList': 'Trở lại danh sách',
        'topic.can_thuc.name': 'Căn thức & Rút gọn',
        'topic.can_thuc.desc': 'Căn bậc hai, căn bậc ba, điều kiện xác định, hằng đẳng thức và rút gọn biểu thức',
        'topic.can_thuc.badge': 'Đại số 9',
        'topic.he_phuong_trinh.name': 'Hệ hai phương trình',
        'topic.he_phuong_trinh.desc': 'Hệ phương trình bậc nhất hai ẩn, giải hệ bằng phương pháp thế, cộng đại số và toán thực tế',
        'topic.he_phuong_trinh.badge': 'Đại số 9',
        'topic.bat_phuong_trinh.name': 'Bất đẳng thức & BPT',
        'topic.bat_phuong_trinh.desc': 'Phương trình tích, phương trình chứa ẩn ở mẫu, bất phương trình bậc nhất một ẩn và BĐT AM-GM thực tế',
        'topic.bat_phuong_trinh.badge': 'Đại số 9',
        'topic.he_thuc_luong.name': 'Hệ thức lượng & Lượng giác',
        'topic.he_thuc_luong.desc': 'Hệ thức lượng trong tam giác vuông, tỉ số lượng giác sin, cos, tan và bài toán đo đạc thực tế',
        'topic.he_thuc_luong.badge': 'Hình học 9',
        'topic.duong_tron.name': 'Đường tròn & Tiếp tuyến',
        'topic.duong_tron.desc': 'Đường kính và dây cung, tiếp tuyến của đường tròn, tính chất hai tiếp tuyến cắt nhau',
        'topic.duong_tron.badge': 'Hình học 9',
        'topic.goc_duong_tron.name': 'Góc với đường tròn & Tứ giác nội tiếp',
        'topic.goc_duong_tron.desc': 'Góc ở tâm, góc nội tiếp, tứ giác nội tiếp đường tròn và các dấu hiệu nhận biết',
        'topic.goc_duong_tron.badge': 'Hình học 9',
        'topic.he_thuc_viet.name': 'Phương trình bậc hai & Vi-ét',
        'topic.he_thuc_viet.desc': 'Biệt thức Delta, định lý Vi-ét, tính giá trị biểu thức nghiệm, tìm hai số biết tổng và tích',
        'topic.he_thuc_viet.badge': 'Ôn thi vào 10',
        'topic.ham_so_bac_hai.name': 'Hàm số & Parabol',
        'topic.ham_so_bac_hai.desc': 'Hàm số y = ax^2, sự tương giao giữa Parabol và đường thẳng y = mx + n',
        'topic.ham_so_bac_hai.badge': 'Đại số 9',
        'topic.hinh_khong_gian.name': 'Hình trụ - Hình nón - Hình cầu',
        'topic.hinh_khong_gian.desc': 'Diện tích xung quanh, thể tích các hình khối không gian trong đời sống thực tế',
        'topic.hinh_khong_gian.badge': 'Hình học 9',
        'topic.xac_suat_thong_ke.name': 'Xác suất & Thống kê 9',
        'topic.xac_suat_thong_ke.desc': 'Bảng tần số, tần số tương đối, biểu đồ cột, biểu đồ quạt và xác suất biến cố',
        'topic.xac_suat_thong_ke.badge': 'Xác suất 9',

        // Footer
        'footer.curriculum': 'Toán Học 9 - Chương Trình Giáo Dục Phổ Thông 2018',
        'footer.credit': 'Thiết kế dành cho giáo viên & học sinh lớp 9 ôn thi hiệu quả'
      },

      en: {
        // Topbar & Navigation
        'brand.title': 'Math 9 with Lovely Mavis',
        'brand.subtitle': 'Playful math revision & test prep',
        'brand.badge': 'Curriculum 2018',
        'nav.home': 'Home',
        'nav.exercises': 'Exercises',
        'nav.games': 'Games',
        'nav.more': 'More',
        'nav.extended': 'More',
        'nav.topics': 'Core Topics',
        'nav.advanced': 'Advanced Math',
        'nav.fillNumber': 'Fill Number',
        'nav.homework': 'Assignments',
        'nav.itemsCount': '4 items',
        'player.guest': 'Guest (Not logged in)',
        'player.level': 'Lv.',
        'player.online': 'Online',
        'player.streakTitle': 'Daily study streak',
        'player.diamondsTitle': 'Accumulated diamonds',
        'btn.themeLight': 'Light',
        'btn.themeDark': 'Dark',
        'btn.themeTitle': 'Toggle Light / Dark mode',
        'btn.langTitle': 'Toggle Vietnamese / English language',
        'btn.soundOn': 'Sound',
        'btn.soundOff': 'Muted',
        'btn.soundTitle': 'Toggle sound effects',
        'btn.login': 'Login',
        'btn.logout': 'Logout',
        'btn.logoutConfirm': 'Are you sure you want to log out?',

        // Home View Hero Banner
        'home.streak': 'Study Streak:',
        'home.streakDays': 'days',
        'home.heroTitle': 'Conquer Grade 9 Mathematics',
        'home.heroDesc': 'Learn through play, play to master! Defeat bosses, beat the 60s sprint, master Viète formulas, radicals & quadratic systems to ace your entrance exams!',
        'home.btnTower': 'Tower of Wisdom',
        'home.btnSpeed': '60s Challenge',

        // Home Stats
        'stats.curLevel': 'CURRENT LEVEL',
        'stats.rankNovice': 'Math Warrior',
        'stats.questionsDone': 'SOLVED QUESTIONS',
        'stats.richBank': 'Rich problem bank',
        'stats.towerFloor': 'TOWER OF WISDOM',
        'stats.targetFloor10': 'Goal: Top Floor 10',
        'stats.speedRecord': 'SPEED RECORD',
        'stats.fastReflex': 'Mental arithmetic',

        // Home Core Cards
        'curriculum.title': 'GRADE 9 STUDY & REVISION PROGRAM',
        'curriculum.sub': '3 Core Sections: Exercises, Gaming Arena & Extended Utilities',
        'card.topicsTitle': 'Core Curriculum Topics',
        'card.topicsDesc': '10 standard topics under the 2018 curriculum (Radicals, Systems, Trigonometry, Circles, Parabolas, Viète...). Topic-by-topic multiple choice with full theory.',
        'card.topicsBtn': 'Start Practicing',
        'card.advTitle': 'Advanced Math',
        'card.advDesc': 'Curated 48 high-level questions from standard workbook. Calculate and fill in exact answers with smart non-repeating randomizer!',
        'card.advBtn': 'Target Scores 9-10',
        'card.moreTitle': 'Extended Utilities',
        'card.moreDesc': 'Assignment exchange system, teacher A4 exam exporter, semester test prep, and formula cheatsheet.',
        'card.moreExpand': 'Expand features',
        'card.moreCollapse': 'Collapse features list',
        'card.moreBtn': 'Explore utilities',

        // 3 New Shortcut Cards
        'card.exercisesTitle': 'Exercise Bank',
        'card.exercisesDesc': 'Practice 10 standard curriculum topics and 48 advanced fill-in problems with step-by-step solutions.',
        'card.exercisesBtn': 'Open exercises',
        'card.gamesTitle': 'Gaming Arena',
        'card.gamesDesc': 'Climb 10-floor tower, 60s speed sprint, 1v1 PvP challenge, and top rank leaderboard.',
        'card.gamesBtn': 'Enter arena',

        // Exercises Section
        'exercises.badge': 'GRADE 9 MATH PRACTICE',
        'exercises.title': 'Grade 9 Math Exercises',
        'exercises.subtitle': '10 curriculum-aligned standard topics and 48 advanced practical fill-in problems from workbook.',
        'exercises.tabBasic': 'Core Topics (GDPT 2018)',
        'exercises.tabAdvanced': 'Advanced Practice (Fill Numbers)',

        // Games Section
        'games.badge': 'MATH GAMING ARENA',
        'games.title': 'Math Gaming Arena',
        'games.subtitle': 'Conquer bosses in 10-floor tower, 60s speed sprint, real-time 1v1 PvP challenge, and top rank leaderboard!',

        // More / Extended Section
        'more.badge': 'UTILITIES & TOOLS',
        'more.title': 'Extended Utilities & Tools',
        'more.subtitle': 'Assignment exchange system, teacher exam generator, semester test prep, and cheatsheet.',
        'more.homeworkTitle': 'Send & Receive Homework',
        'more.homeworkDesc': 'Exchange assignments via username/email, instant automated grading, and smart review notebook.',
        'more.homeworkBtn': 'Open Homework Hub',

        // Extended 7 Features
        'feat.tower': 'Tower of Wisdom',
        'feat.towerDesc': 'Climb through 10 challenging floors, defeat math bosses and claim your glory!',
        'feat.towerBtn': 'Climb Tower Now',
        'feat.speed': '60-Second Challenge',
        'feat.speedDesc': 'Sharpen quick calculation and rapid reflexes under time pressure.',
        'feat.speedBtn': 'Sprint Now',
        'feat.pvp': '1v1 Duel Battle',
        'feat.pvpDesc': 'Two students sit at the same computer to compete side-by-side with keyboard keys!',
        'feat.pvpBtn': 'Challenge Friends',
        'feat.exams': 'Semester Exam Prep',
        'feat.examsDesc': 'Real mock entrance and semester exams with multiple-choice, true/false, and step-by-step solutions.',
        'feat.examsBtn': 'Take Mock Exam',
        'feat.cheatsheet': 'Formula Cheatsheet',
        'feat.cheatsheetDesc': 'Instant lookup for all Grade 9 algebra, trigonometry, coordinate geometry, and 3D solids formulas.',
        'feat.cheatsheetBtn': 'Open Cheatsheet',
        'feat.leaderboard': 'Hall of Fame',
        'feat.leaderboardDesc': 'Honoring hardworking warriors with longest streaks and record-breaking scores.',
        'feat.leaderboardBtn': 'View Leaderboard',
        'feat.teacher': 'Teacher Hub',
        'feat.teacherDesc': 'Create custom problems, generate class tests, and print A4 exams effortlessly.',
        'feat.teacherBtn': 'Enter Teacher Hub',

        // Auth Modal
        'auth.loginTitle': 'Account Login',
        'auth.regTitle': 'Create New Account',
        'auth.sub': 'Online math learning & progress system',
        'auth.tabLogin': 'Login',
        'auth.tabReg': 'Register',
        'auth.username': 'Username:',
        'auth.loginUsernameOrEmail': 'Username or Email:',
        'auth.emailOptional': 'Email (optional - for receiving assignments):',
        'auth.password': 'Password:',
        'auth.displayName': 'Student Display Name:',
        'auth.avatarPrompt': 'Choose your starting avatar:',
        'auth.sampleAcc': 'Demo Account:',
        'auth.quickFill': 'Quick Fill',
        'auth.btnSubmitLogin': 'Login Now',
        'auth.btnSubmitReg': 'Create Account & Begin',
        'auth.noAccPrompt': 'No account yet? Create one in 10 seconds',
        'auth.hasAccPrompt': 'Already have an account? Login here',

        // Homework System
        'homework.badge': 'ASSIGNMENTS SYSTEM',
        'homework.title': 'Homework & Group Challenges',
        'homework.tabInbox': 'Inbox',
        'homework.tabCompose': 'Compose Assignment',
        'homework.tabSent': 'Sent Assignments',
        'homework.tabReview': 'Smart Review',
        'reminder.title': 'Daily Study Reminder',
        'reminder.desc': 'Automatically reminds you via browser notification at a set daily time to maintain your streak!',

        // Chatbot
        'chat.name': 'Wise Math Cat',
        'chat.desc': 'Ask math concepts & daily applications',
        'chat.welcome': 'Hello! I can explain math fundamentals and show practical applications. Feel free to ask about percentages, equations, geometry, or statistics 🌸',
        'chat.sug1': 'How do percentages work?',
        'chat.sug2': 'What is Pythagorean theorem?',
        'chat.sug3': 'Equations in daily life?',
        'chat.placeholder': 'Type your math question...',
        'chat.send': 'Send',
        'chat.disclaimer': 'Answers generated with Google Gemini. Please cross-check complex proofs with your teacher.',
        'chat.toggle': 'Ask Math Cat',
        'chat.dock': 'Dock to default position',

        // 10 Curriculum Topics
        'topics.badge': '2018 CURRICULUM TOPICS',
        'topics.title': 'MASTER BY TOPICS',
        'topics.subtitle': 'Select a topic to strengthen your understanding with step-by-step explained questions!',
        'topics.progress': 'Topic progress:',
        'topics.practiceBtn': 'Practice Topic',
        'topics.returnList': 'Back to topics',
        'topic.can_thuc.name': 'Radicals & Simplification',
        'topic.can_thuc.desc': 'Square & cube roots, domain conditions, algebraic identities, and expression simplification',
        'topic.can_thuc.badge': 'Algebra 9',
        'topic.he_phuong_trinh.name': 'Systems of Linear Equations',
        'topic.he_phuong_trinh.desc': 'Linear systems in two variables, substitution and elimination methods, and applied problems',
        'topic.he_phuong_trinh.badge': 'Algebra 9',
        'topic.bat_phuong_trinh.name': 'Inequalities & Inequations',
        'topic.bat_phuong_trinh.desc': 'Product equations, fractional equations, single-variable inequalities, and applied AM-GM inequality',
        'topic.bat_phuong_trinh.badge': 'Algebra 9',
        'topic.he_thuc_luong.name': 'Right Triangle Metrics & Trig',
        'topic.he_thuc_luong.desc': 'Right triangle metric relations, trigonometric ratios sin, cos, tan, and measurement problems',
        'topic.he_thuc_luong.badge': 'Geometry 9',
        'topic.duong_tron.name': 'Circles & Tangents',
        'topic.duong_tron.desc': 'Diameters and chords, tangent lines to circles, and intersecting tangent properties',
        'topic.duong_tron.badge': 'Geometry 9',
        'topic.goc_duong_tron.name': 'Circle Angles & Inscribed Quadrilaterals',
        'topic.goc_duong_tron.desc': 'Central angles, inscribed angles, cyclic quadrilaterals, and identification criteria',
        'topic.goc_duong_tron.badge': 'Geometry 9',
        'topic.he_thuc_viet.name': 'Quadratic Equations & Viète',
        'topic.he_thuc_viet.desc': 'Discriminant Delta, Viète theorem, symmetric root expressions, and sum-product systems',
        'topic.he_thuc_viet.badge': 'Exam Prep 10',
        'topic.ham_so_bac_hai.name': 'Quadratic Functions & Parabolas',
        'topic.ham_so_bac_hai.desc': 'Function y = ax^2, intersection between parabolas and lines y = mx + n',
        'topic.ham_so_bac_hai.badge': 'Algebra 9',
        'topic.hinh_khong_gian.name': 'Cylinder - Cone - Sphere',
        'topic.hinh_khong_gian.desc': 'Lateral surface areas, total areas, and volumes of 3D spatial solids in daily life',
        'topic.hinh_khong_gian.badge': 'Geometry 9',
        'topic.xac_suat_thong_ke.name': 'Probability & Statistics 9',
        'topic.xac_suat_thong_ke.desc': 'Frequency tables, relative frequencies, bar charts, pie charts, and event probabilities',
        'topic.xac_suat_thong_ke.badge': 'Statistics 9',

        // Footer
        'footer.curriculum': 'Grade 9 Mathematics - National Standard Curriculum 2018',
        'footer.credit': 'Crafted for teachers & 9th grade students for high school test prep'
      }
    };
  }

  t(key, fallback = '') {
    const dict = this.translations[this.currentLang] || this.translations.vi;
    if (dict && dict[key] !== undefined) {
      return dict[key];
    }
    const viDict = this.translations.vi;
    if (viDict && viDict[key] !== undefined) {
      return viDict[key];
    }
    return fallback || key;
  }

  getLanguage() {
    return this.currentLang;
  }

  setLanguage(lang) {
    if (lang !== 'vi' && lang !== 'en') lang = 'vi';
    this.currentLang = lang;
    localStorage.setItem(this.STORAGE_KEY, lang);
    document.documentElement.setAttribute('lang', lang);
    this.applyTranslations();

    // Trigger update in UI if app is ready
    if (typeof app !== 'undefined') {
      if (app.updateHeaderStats) app.updateHeaderStats();
      if (app.currentTab === 'home' && app.renderHome) app.renderHome();
      if (app.currentTab === 'exercises' && app.renderExercisesView) app.renderExercisesView();
      if (app.currentTab === 'topics' && app.renderTopicsList) app.renderTopicsList();
      if (app.currentTab === 'games' && app.renderGamesView) app.renderGamesView();
      if (app.currentTab === 'more' && app.renderMoreView) app.renderMoreView();
    }
  }

  toggleLanguage() {
    const newLang = this.currentLang === 'vi' ? 'en' : 'vi';
    this.setLanguage(newLang);
    return newLang;
  }

  applyTranslations() {
    // 1. Text elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = this.t(key);
      if (val) {
        el.innerText = val;
      }
    });

    // 2. HTML elements
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      const val = this.t(key);
      if (val) {
        el.innerHTML = val;
      }
    });

    // 3. Placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const val = this.t(key);
      if (val) {
        el.setAttribute('placeholder', val);
      }
    });

    // 4. Titles / Tooltips
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      const val = this.t(key);
      if (val) {
        el.setAttribute('title', val);
      }
    });
  }
}

// Khởi tạo đối tượng toàn cục
const i18n = new I18nManager();
if (typeof window !== 'undefined') {
  window.i18n = i18n;
}
