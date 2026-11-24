/**
 * ================================================================
 * SKY CANVAS 2D - BỨC TRANH NỀN THIÊN NHIÊN SỐNG ĐỘNG
 * Khu Vườn Nắng Mai (Light Mode) & Khu Vườn Đêm Ánh Trăng (Dark Mode)
 * Đàn chim trời - Đồi cỏ xanh & Hàng rào hoa - Đom đóm đêm - Dòng chảy Toán học
 * 60FPS mượt mà - Tiết kiệm pin - Hỗ trợ prefers-reduced-motion
 * ================================================================
 */

class SkyCanvas {
  constructor(canvasId = 'sky-canvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.id = canvasId;
      this.canvas.className = 'sky-canvas';
      document.body.prepend(this.canvas);
    }
    this.ctx = this.canvas.getContext('2d', { alpha: true });
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2); // Tối ưu hiệu năng màn hình retina

    this.isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Các thành phần đồ họa thiên nhiên & vũ trụ
    this.sunRotation = 0;
    this.clouds = [];
    this.stars = [];
    this.shootingStars = [];
    this.birds = [];
    this.flowers = [];
    this.fireflies = [];
    this.mathStream = [];
    this.timeArcs = [];
    this.petals = [];

    this.lastTime = 0;
    this.animationFrameId = null;
    this.nextShootingStarTime = performance.now() + 3000 + Math.random() * 4000;

    this.init();
  }

  init() {
    this.handleResize();
    window.addEventListener('resize', () => this.handleResize(), { passive: true });

    // Lắng nghe thay đổi prefers-reduced-motion
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionQuery.addEventListener) {
      motionQuery.addEventListener('change', (e) => {
        this.prefersReducedMotion = e.matches;
      });
    }

    // Quan sát thay đổi theme sáng/tối
    const observer = new MutationObserver(() => {
      const dark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (dark !== this.isDark) {
        this.isDark = dark;
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    // Khởi tạo các đối tượng đồ họa
    this.initClouds();
    this.initStars();
    this.initBirds();
    this.initHillsAndFlora();
    this.initFireflies();
    this.initMathStream();
    this.initTimeArcs();
    this.initPetals();

    // Bắt đầu vòng lặp render 60fps
    this.start();
  }

  handleResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.scale(this.dpr, this.dpr);

    // Tái cấu trúc mây, sao, đồi hoa theo kích thước màn hình mới
    this.initClouds();
    this.initStars();
    this.initBirds();
    this.initHillsAndFlora();
    this.initFireflies();
    this.initPetals();
  }

  // -------------------------------------------------------------
  // 1. MÂY TRẮNG BỒNG BỀNH (CLOUDS)
  // -------------------------------------------------------------
  initClouds() {
    this.clouds = [];
    const cloudCount = Math.max(3, Math.min(6, Math.floor(this.width / 320)));
    for (let i = 0; i < cloudCount; i++) {
      this.clouds.push({
        x: Math.random() * this.width,
        y: 40 + Math.random() * (this.height * 0.35),
        speed: 0.12 + Math.random() * 0.22,
        scale: 0.7 + Math.random() * 0.6,
        opacity: 0.35 + Math.random() * 0.35,
        puffs: [
          { dx: 0, dy: 0, r: 28 },
          { dx: 22, dy: -8, r: 34 },
          { dx: 48, dy: -4, r: 30 },
          { dx: 70, dy: 6, r: 24 },
          { dx: 36, dy: 10, r: 26 }
        ]
      });
    }
  }

  renderClouds(dt) {
    const ctx = this.ctx;
    ctx.save();

    for (const c of this.clouds) {
      c.x += c.speed * dt;
      if (c.x - 120 > this.width) {
        c.x = -150;
        c.y = 35 + Math.random() * (this.height * 0.35);
      }

      ctx.fillStyle = `rgba(255, 255, 255, ${c.opacity})`;
      ctx.shadowColor = 'rgba(224, 180, 160, 0.16)';
      ctx.shadowBlur = 14;

      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.scale(c.scale, c.scale);
      ctx.beginPath();
      for (const puff of c.puffs) {
        ctx.arc(puff.dx, puff.dy, puff.r, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }

  // -------------------------------------------------------------
  // 2. ĐÀN CHIM TRỜI (3-5 CON DÁNG CHỮ V MỀM MẠI BAY NGANG TẦNG TRỜI CAO)
  // -------------------------------------------------------------
  initBirds() {
    this.birds = [];
    const count = 4; // 3-5 con dáng chữ V mềm mại
    for (let i = 0; i < count; i++) {
      this.birds.push({
        x: (this.width / count) * i + Math.random() * 80,
        y: 40 + Math.random() * (this.height * 0.22),
        speed: 0.55 + Math.random() * 0.45,
        wingSpan: 11 + Math.random() * 5,
        wingFreq: 0.0055 + Math.random() * 0.003,
        phase: Math.random() * Math.PI * 2,
        glidePeriod: 3200 + Math.random() * 2600
      });
    }
  }

  renderBirds(time, dt) {
    const ctx = this.ctx;
    ctx.save();

    for (const b of this.birds) {
      b.x += b.speed * dt;
      if (b.x > this.width + 60) {
        b.x = -60;
        b.y = 35 + Math.random() * (this.height * 0.22);
      }

      // Chu kỳ vỗ cánh -> lượn (glide) tự nhiên
      const cycle = (time + b.phase * 500) % b.glidePeriod;
      const isGliding = cycle > b.glidePeriod * 0.55;
      const flap = isGliding ? 0.08 : Math.sin(time * b.wingFreq + b.phase);
      const wingAmp = (flap > 0) ? flap * 0.42 : flap * 0.28;

      ctx.save();
      const bobY = Math.sin(time * 0.002 + b.phase) * 3;
      ctx.translate(b.x, b.y + bobY);

      // Thân chim chữ V mềm mại với sắc nâu mộc mạc
      ctx.strokeStyle = 'rgba(74, 52, 44, 0.45)';
      ctx.lineWidth = 1.7;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const w = b.wingSpan;
      ctx.beginPath();
      // Cánh trái
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-w * 0.45, -w * 0.35 + wingAmp * w * 0.5, -w, wingAmp * w * 0.25);
      // Cánh phải
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(w * 0.45, -w * 0.35 + wingAmp * w * 0.5, w, wingAmp * w * 0.25);
      ctx.stroke();

      ctx.restore();
    }

    ctx.restore();
  }

  // -------------------------------------------------------------
  // 3. KHỞI TẠO ĐỒI CỎ, HÀNG RÀO & CÁC KHÓM HOA XINH
  // -------------------------------------------------------------
  initHillsAndFlora() {
    this.flowers = [];
    const flowerCount = Math.max(8, Math.min(18, Math.floor(this.width / 80)));
    for (let i = 0; i < flowerCount; i++) {
      this.flowers.push({
        relX: (i + 0.3 + Math.random() * 0.5) / flowerCount, // Phân bổ tỷ lệ đều trên bề ngang
        heightOffset: Math.random() * 18,
        size: 4.5 + Math.random() * 3,
        type: Math.random() > 0.5 ? 'pink' : 'yellow',
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  // -------------------------------------------------------------
  // 4. BẦU TRỜI ĐÊM: SAO LẤP LÁNH & ĐOM ĐÓM VÀNG PHÁT SÁNG
  // -------------------------------------------------------------
  initStars() {
    this.stars = [];
    const count = Math.max(45, Math.min(90, Math.floor((this.width * this.height) / 16000)));
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * (this.height * 0.85),
        radius: 0.85 + Math.random() * 1.6,
        baseAlpha: 0.35 + Math.random() * 0.65,
        twinkleSpeed: 0.0018 + Math.random() * 0.0035,
        phase: Math.random() * Math.PI * 2,
        color: Math.random() > 0.4 ? '#FFD54F' : (Math.random() > 0.5 ? '#FFF8E7' : '#FF80AB')
      });
    }
  }

  initFireflies() {
    this.fireflies = [];
    const count = Math.max(9, Math.min(16, Math.floor(this.width / 90)));
    for (let i = 0; i < count; i++) {
      this.fireflies.push({
        x: Math.random() * this.width,
        baseY: this.height - Math.random() * (this.height * 0.32),
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.25,
        radius: 2.2 + Math.random() * 1.6,
        pulseSpeed: 0.002 + Math.random() * 0.0025,
        phase: Math.random() * Math.PI * 2,
        swayAmp: 14 + Math.random() * 20
      });
    }
  }

  spawnShootingStar() {
    if (this.prefersReducedMotion) return;
    const startX = Math.random() * (this.width * 0.85);
    const startY = Math.random() * (this.height * 0.35);
    const length = 120 + Math.random() * 140;
    const angle = (Math.PI / 4) + (Math.random() - 0.5) * 0.2;

    this.shootingStars.push({
      x: startX,
      y: startY,
      len: length,
      vx: Math.cos(angle) * (6 + Math.random() * 4),
      vy: Math.sin(angle) * (6 + Math.random() * 4),
      life: 1.0,
      decay: 0.02 + Math.random() * 0.015,
      color: Math.random() > 0.5 ? '#F5C76B' : '#FFFFFF'
    });
  }

  // -------------------------------------------------------------
  // 5. HIỆU ỨNG DÒNG CHẢY TOÁN HỌC & CÁNH HOA ĐÀO
  // -------------------------------------------------------------
  initMathStream() {
    this.mathStream = [];
    const symbols = [
      'π', '√x', 'Δ', '∞', 'x²', '∠ABC', 'sin α', 'cos θ',
      '∑', '∫', 'f(x)', 'a² + b²', 'y = ax+b', 'α', 'β', 'φ',
      '√2', 'x₁·x₂', 'Δ = b²-4ac', '2πr'
    ];
    const streamCount = Math.max(14, Math.min(26, Math.floor(this.width / 80)));

    for (let i = 0; i < streamCount; i++) {
      this.mathStream.push({
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        x: Math.random() * this.width,
        baseY: 60 + Math.random() * (this.height - 120),
        speed: 0.18 + Math.random() * 0.32,
        waveFreq: 0.003 + Math.random() * 0.005,
        waveAmp: 16 + Math.random() * 26,
        phase: Math.random() * Math.PI * 2,
        size: 13 + Math.floor(Math.random() * 9),
        alpha: 0.12 + Math.random() * 0.16,
        rotation: (Math.random() - 0.5) * 0.4
      });
    }
  }

  initTimeArcs() {
    this.timeArcs = [];
    const arcCount = Math.max(3, Math.min(6, Math.floor(this.width / 360)));
    for (let i = 0; i < arcCount; i++) {
      this.timeArcs.push({
        x: Math.random() * this.width,
        baseY: 80 + Math.random() * (this.height - 180),
        radius: 24 + Math.random() * 24,
        speed: 0.15 + Math.random() * 0.22,
        waveAmp: 12 + Math.random() * 20,
        phase: Math.random() * Math.PI * 2,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: 0.0005 + Math.random() * 0.001,
        alpha: 0.10 + Math.random() * 0.12
      });
    }
  }

  initPetals() {
    this.petals = [];
    const count = Math.max(6, Math.min(10, Math.floor(this.width / 180)));
    for (let i = 0; i < count; i++) {
      this.petals.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: 0.2 + Math.random() * 0.3,
        vy: 0.35 + Math.random() * 0.45,
        size: 6.5 + Math.random() * 4.5,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.02,
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: 0.0018 + Math.random() * 0.0015,
        alpha: 0.38 + Math.random() * 0.32
      });
    }
  }

  // -------------------------------------------------------------
  // VÒNG LẶP RENDER 60FPS
  // -------------------------------------------------------------
  start() {
    const loop = (timestamp) => {
      if (!this.lastTime) this.lastTime = timestamp;
      const dt = Math.min((timestamp - this.lastTime) / 16.666, 3);
      this.lastTime = timestamp;

      this.render(timestamp, dt);
      if (typeof window !== 'undefined' && window.requestAnimationFrame) {
        this.animationFrameId = window.requestAnimationFrame(loop);
      }
    };
    if (typeof window !== 'undefined' && window.requestAnimationFrame) {
      this.animationFrameId = window.requestAnimationFrame(loop);
    }
  }

  stop() {
    if (this.animationFrameId && typeof window !== 'undefined' && window.cancelAnimationFrame) {
      window.cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  render(time, dt) {
    const motionFactor = this.prefersReducedMotion ? 0.08 : 1.0;

    this.ctx.clearRect(0, 0, this.width, this.height);

    if (this.isDark) {
      this.renderDarkSky(time, dt * motionFactor);
      this.renderDarkMeadow(time, dt * motionFactor);
    } else {
      this.renderLightSky(time, dt * motionFactor);
      this.renderBirds(time, dt * motionFactor);
      this.renderLightMeadow(time, dt * motionFactor);
    }

    // Dòng chảy Toán học & Thời gian thanh lịch
    this.renderTimeArcs(time, dt * motionFactor);
    this.renderMathStream(time, dt * motionFactor);

    // Cánh hoa anh đào rơi xoay nhẹ
    this.renderPetals(time, dt * motionFactor);
  }

  // -------------------------------------------------------------
  // LIGHT MODE: KHU VƯỜN NẮNG MAI
  // Bầu trời trong trẻo xanh kem, mặt trời vàng dịu & mây trôi
  // -------------------------------------------------------------
  renderLightSky(time, dt) {
    const ctx = this.ctx;

    // Gradient bầu trời: xanh trong trẻo -> xanh nhạt -> kem nắng ấm chân trời
    const skyGrad = ctx.createLinearGradient(0, 0, 0, this.height);
    skyGrad.addColorStop(0, '#BFE8FF');    // Xanh trong trẻo tầng trời cao
    skyGrad.addColorStop(0.48, '#E6F6FF'); // Giữa trời xanh nhạt thanh khiết
    skyGrad.addColorStop(1.0, '#FFF7E6');  // Chân trời kem nắng ấm

    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Vị trí mặt trời mọc (góc trên phải)
    const sunX = Math.min(this.width - 90, this.width * 0.88);
    const sunY = Math.max(75, this.height * 0.15);
    const sunRadius = 44;

    // Vầng hào quang vàng dịu ấm áp
    const auraGrad = ctx.createRadialGradient(sunX, sunY, sunRadius * 0.3, sunX, sunY, sunRadius * 4.0);
    auraGrad.addColorStop(0, 'rgba(255, 224, 130, 0.55)');
    auraGrad.addColorStop(0.35, 'rgba(255, 236, 179, 0.28)');
    auraGrad.addColorStop(0.7, 'rgba(255, 248, 225, 0.12)');
    auraGrad.addColorStop(1, 'rgba(255, 247, 230, 0)');

    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunRadius * 4.0, 0, Math.PI * 2);
    ctx.fill();

    // Tia nắng xoay chậm dịu mắt
    if (!this.prefersReducedMotion) {
      this.sunRotation += 0.0018 * dt;
    }
    const rayCount = 12;
    ctx.save();
    ctx.translate(sunX, sunY);
    ctx.rotate(this.sunRotation);
    for (let i = 0; i < rayCount; i++) {
      const angle = (i * Math.PI * 2) / rayCount;
      const rayLen = sunRadius * 2.6;
      ctx.save();
      ctx.rotate(angle);
      const rayGrad = ctx.createLinearGradient(0, 0, rayLen, 0);
      rayGrad.addColorStop(0, 'rgba(255, 193, 7, 0.30)');
      rayGrad.addColorStop(0.5, 'rgba(255, 224, 130, 0.14)');
      rayGrad.addColorStop(1, 'rgba(255, 247, 230, 0)');

      ctx.fillStyle = rayGrad;
      ctx.beginPath();
      ctx.moveTo(sunRadius * 0.8, -4);
      ctx.lineTo(rayLen, -1);
      ctx.lineTo(rayLen, 1);
      ctx.lineTo(sunRadius * 0.8, 4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();

    // Quả cầu mặt trời vàng dịu
    const sunGrad = ctx.createRadialGradient(sunX - 6, sunY - 6, 3, sunX, sunY, sunRadius);
    sunGrad.addColorStop(0, '#FFFFF2');
    sunGrad.addColorStop(0.35, '#FFF176');
    sunGrad.addColorStop(0.75, '#FFD54F');
    sunGrad.addColorStop(1, '#FFB74D');

    ctx.save();
    ctx.shadowColor = 'rgba(255, 193, 7, 0.45)';
    ctx.shadowBlur = 24;
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Mây trắng bồng bềnh
    this.renderClouds(dt);
  }

  // -------------------------------------------------------------
  // LIGHT MODE: DẢI ĐỒI CỎ XANH, HÀNG RÀO GỖ & HOA XINH (ĐÁY MÀN HÌNH)
  // Chiếm khoảng 14-18% chiều cao đáy, mờ dịu làm nền mà không rối nội dung
  // -------------------------------------------------------------
  renderLightMeadow(time, dt) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const meadowH = Math.max(90, Math.min(160, h * 0.16));

    ctx.save();

    // 1. Dải đồi hậu cảnh (xa) - xanh bạc hà pastel mờ dịu
    const backY = h - meadowH * 0.95;
    const backGrad = ctx.createLinearGradient(0, backY, 0, h);
    backGrad.addColorStop(0, 'rgba(182, 230, 204, 0.55)');
    backGrad.addColorStop(1, 'rgba(160, 218, 186, 0.70)');

    ctx.fillStyle = backGrad;
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(0, backY + 18);
    ctx.bezierCurveTo(w * 0.25, backY - 14, w * 0.65, backY + 28, w, backY - 6);
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // 2. Dải đồi tiền cảnh (gần) - xanh cỏ tươi dịu mát
    const frontY = h - meadowH * 0.65;
    const frontGrad = ctx.createLinearGradient(0, frontY, 0, h);
    frontGrad.addColorStop(0, 'rgba(142, 212, 170, 0.72)');
    frontGrad.addColorStop(1, 'rgba(116, 194, 150, 0.88)');

    ctx.fillStyle = frontGrad;
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(0, frontY + 8);
    ctx.bezierCurveTo(w * 0.35, frontY + 24, w * 0.75, frontY - 18, w, frontY + 12);
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Hàm nội suy độ cao sườn đồi tiền cảnh
    const getFrontHillY = (x) => {
      const t = x / w;
      const y0 = frontY + 8;
      const cp1y = frontY + 24;
      const cp2y = frontY - 18;
      const y1 = frontY + 12;
      return (1 - t) * (1 - t) * (1 - t) * y0 + 3 * (1 - t) * (1 - t) * t * cp1y + 3 * (1 - t) * t * t * cp2y + t * t * t * y1;
    };

    // 3. Hàng rào gỗ nâu thấp mộc mạc
    const postSpacing = 44;
    const postCount = Math.floor(w / postSpacing) + 1;
    ctx.strokeStyle = 'rgba(180, 136, 110, 0.55)';
    ctx.lineWidth = 1.8;
    ctx.lineCap = 'round';

    // 2 thanh ngang hàng rào
    ctx.beginPath();
    for (let x = 0; x <= w; x += 20) {
      const hy = getFrontHillY(x);
      if (x === 0) ctx.moveTo(x, hy - 14);
      else ctx.lineTo(x, hy - 14);
    }
    ctx.stroke();

    ctx.beginPath();
    for (let x = 0; x <= w; x += 20) {
      const hy = getFrontHillY(x);
      if (x === 0) ctx.moveTo(x, hy - 7);
      else ctx.lineTo(x, hy - 7);
    }
    ctx.stroke();

    // Cọc rào đứng bo góc
    for (let i = 0; i <= postCount; i++) {
      const px = i * postSpacing;
      const py = getFrontHillY(px);
      const postH = 20;

      ctx.fillStyle = 'rgba(180, 136, 110, 0.58)';
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(px - 2, py - postH, 4, postH + 4, [2, 2, 0, 0]);
      } else {
        ctx.rect(px - 2, py - postH, 4, postH + 4);
      }
      ctx.fill();
    }

    // 4. Các khóm hoa nhỏ hồng & vàng xinh xắn
    for (const fl of this.flowers) {
      const fx = fl.relX * w;
      const fy = getFrontHillY(fx) + 4 - fl.heightOffset * 0.4;
      const sway = Math.sin(time * 0.002 + fl.phase) * 2;

      // Cành hoa xanh mảnh
      ctx.strokeStyle = 'rgba(92, 160, 110, 0.65)';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(fx, fy + 8);
      ctx.quadraticCurveTo(fx + sway * 0.5, fy + 4, fx + sway, fy);
      ctx.stroke();

      // Bông hoa 5 cánh nhỏ
      const blossomX = fx + sway;
      const blossomY = fy;
      const r = fl.size;

      ctx.fillStyle = fl.type === 'pink' ? '#FFAEC0' : '#FFE082';
      ctx.beginPath();
      for (let p = 0; p < 5; p++) {
        const angle = (p * Math.PI * 2) / 5;
        const px = blossomX + Math.cos(angle) * (r * 0.65);
        const py = blossomY + Math.sin(angle) * (r * 0.65);
        ctx.arc(px, py, r * 0.48, 0, Math.PI * 2);
      }
      ctx.fill();

      // Nhụy hoa
      ctx.fillStyle = fl.type === 'pink' ? '#FFE57F' : '#FFFDF9';
      ctx.beginPath();
      ctx.arc(blossomX, blossomY, r * 0.28, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // -------------------------------------------------------------
  // DARK MODE: KHU VƯỜN ĐÊM ÁNH TRĂNG
  // Bầu trời xanh chàm ấm, mặt trăng khuyết, sao lấp lánh & đom đóm
  // -------------------------------------------------------------
  renderDarkSky(time, dt) {
    const ctx = this.ctx;

    // Gradient bầu trời đêm xanh-chàm ấm
    const nightGrad = ctx.createLinearGradient(0, 0, 0, this.height);
    nightGrad.addColorStop(0, '#141B2D');    // Xanh chàm đêm sâu thẳm
    nightGrad.addColorStop(0.55, '#241D2E'); // Sắc chàm mận tím ấm
    nightGrad.addColorStop(1.0, '#2B1E24');  // Chân trời cacao mận ấm

    ctx.fillStyle = nightGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Ngôi sao lấp lánh ánh vàng rực
    this.renderStars(time);

    // Sao băng thỉnh thoảng lướt qua
    this.renderShootingStars(time, dt);

    // Mặt trăng khuyết góc trên phải
    this.renderCrescentMoon(time);
  }

  renderStars(time) {
    const ctx = this.ctx;
    ctx.save();

    for (const s of this.stars) {
      const twinkle = Math.sin(time * s.twinkleSpeed + s.phase);
      const alpha = Math.max(0.12, Math.min(1.0, s.baseAlpha + twinkle * 0.32));

      ctx.fillStyle = s.color;
      ctx.globalAlpha = alpha;
      ctx.shadowColor = s.color;
      ctx.shadowBlur = s.radius > 1.2 ? 8 : 4;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fill();

      if (s.radius > 1.2 && alpha > 0.55) {
        ctx.fillStyle = s.color;
        ctx.globalAlpha = (alpha - 0.55) * 0.6;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius * 2.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  renderCrescentMoon(time) {
    const ctx = this.ctx;
    const moonX = Math.min(this.width - 90, this.width * 0.88);
    const moonY = Math.max(75, this.height * 0.15);
    const moonR = 38;

    ctx.save();

    // Vầng hào quang vàng rực quanh trăng
    const moonAura = ctx.createRadialGradient(moonX, moonY, moonR * 0.5, moonX, moonY, moonR * 3.6);
    moonAura.addColorStop(0, 'rgba(255, 213, 79, 0.48)');
    moonAura.addColorStop(0.4, 'rgba(255, 179, 0, 0.18)');
    moonAura.addColorStop(1, 'rgba(36, 20, 24, 0)');

    ctx.fillStyle = moonAura;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR * 3.6, 0, Math.PI * 2);
    ctx.fill();

    // Thân trăng vàng ánh trăng ấm
    ctx.save();
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
    ctx.clip();

    const moonGrad = ctx.createRadialGradient(moonX - 8, moonY - 8, 4, moonX, moonY, moonR);
    moonGrad.addColorStop(0, '#FFFFEE');
    moonGrad.addColorStop(0.5, '#FFD54F');
    moonGrad.addColorStop(1, '#FF9800');

    ctx.fillStyle = moonGrad;
    ctx.shadowColor = 'rgba(255, 213, 79, 0.65)';
    ctx.shadowBlur = 24;
    ctx.fillRect(moonX - moonR - 4, moonY - moonR - 4, moonR * 2 + 8, moonR * 2 + 8);

    // Phần che để tạo lưỡi liềm nghệ thuật đồng điệu màu trời đêm
    ctx.fillStyle = '#241D2E';
    ctx.beginPath();
    ctx.arc(moonX + 13, moonY - 8, moonR * 0.94, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    ctx.restore();
  }

  renderShootingStars(time, dt) {
    const ctx = this.ctx;

    if (time >= this.nextShootingStarTime) {
      this.spawnShootingStar();
      this.nextShootingStarTime = time + 4500 + Math.random() * 6000;
    }

    if (this.shootingStars.length === 0) return;

    ctx.save();
    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      const star = this.shootingStars[i];
      star.x += star.vx * dt;
      star.y += star.vy * dt;
      star.life -= star.decay * dt;

      if (star.life <= 0 || star.x > this.width + 100 || star.y > this.height + 100) {
        this.shootingStars.splice(i, 1);
        continue;
      }

      const tailX = star.x - (star.vx / Math.hypot(star.vx, star.vy)) * star.len * star.life;
      const tailY = star.y - (star.vy / Math.hypot(star.vx, star.vy)) * star.len * star.life;

      const grad = ctx.createLinearGradient(star.x, star.y, tailX, tailY);
      grad.addColorStop(0, `rgba(255, 255, 255, ${star.life * 0.95})`);
      grad.addColorStop(0.2, `rgba(245, 199, 107, ${star.life * 0.7})`);
      grad.addColorStop(1, 'rgba(245, 199, 107, 0)');

      ctx.strokeStyle = grad;
      ctx.lineWidth = 2.2 * star.life;
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(star.x, star.y);
      ctx.stroke();

      ctx.fillStyle = star.color;
      ctx.shadowColor = '#F5C76B';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(star.x, star.y, 2.0 * star.life, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // -------------------------------------------------------------
  // DARK MODE: ĐỒI CỎ ĐÊM & ĐOM ĐÓM VÀNG PHÁT SÁNG BAY CHẬM
  // -------------------------------------------------------------
  renderDarkMeadow(time, dt) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const meadowH = Math.max(90, Math.min(160, h * 0.16));

    ctx.save();

    // 1. Dải đồi đêm hậu cảnh
    const backY = h - meadowH * 0.95;
    const backGrad = ctx.createLinearGradient(0, backY, 0, h);
    backGrad.addColorStop(0, 'rgba(22, 27, 42, 0.82)');
    backGrad.addColorStop(1, 'rgba(16, 20, 32, 0.94)');

    ctx.fillStyle = backGrad;
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(0, backY + 18);
    ctx.bezierCurveTo(w * 0.25, backY - 14, w * 0.65, backY + 28, w, backY - 6);
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // 2. Dải đồi đêm tiền cảnh
    const frontY = h - meadowH * 0.65;
    const frontGrad = ctx.createLinearGradient(0, frontY, 0, h);
    frontGrad.addColorStop(0, 'rgba(26, 22, 34, 0.88)');
    frontGrad.addColorStop(1, 'rgba(18, 16, 26, 0.98)');

    ctx.fillStyle = frontGrad;
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(0, frontY + 8);
    ctx.bezierCurveTo(w * 0.35, frontY + 24, w * 0.75, frontY - 18, w, frontY + 12);
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    const getFrontHillY = (x) => {
      const t = x / w;
      const y0 = frontY + 8;
      const cp1y = frontY + 24;
      const cp2y = frontY - 18;
      const y1 = frontY + 12;
      return (1 - t) * (1 - t) * (1 - t) * y0 + 3 * (1 - t) * (1 - t) * t * cp1y + 3 * (1 - t) * t * t * cp2y + t * t * t * y1;
    };

    // 3. Hàng rào gỗ đêm
    const postSpacing = 44;
    const postCount = Math.floor(w / postSpacing) + 1;
    ctx.strokeStyle = 'rgba(56, 42, 52, 0.50)';
    ctx.lineWidth = 1.8;
    ctx.lineCap = 'round';

    ctx.beginPath();
    for (let x = 0; x <= w; x += 20) {
      const hy = getFrontHillY(x);
      if (x === 0) ctx.moveTo(x, hy - 14);
      else ctx.lineTo(x, hy - 14);
    }
    ctx.stroke();

    for (let i = 0; i <= postCount; i++) {
      const px = i * postSpacing;
      const py = getFrontHillY(px);
      ctx.fillStyle = 'rgba(56, 42, 52, 0.52)';
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(px - 2, py - 20, 4, 24, [2, 2, 0, 0]);
      } else {
        ctx.rect(px - 2, py - 20, 4, 24);
      }
      ctx.fill();
    }

    ctx.restore();

    // 4. Đom đóm đêm vàng phát sáng bay chậm
    this.renderFireflies(time, dt);
  }

  renderFireflies(time, dt) {
    const ctx = this.ctx;
    ctx.save();

    for (const f of this.fireflies) {
      f.x += f.vx * dt;
      f.baseY += f.vy * dt;

      // Giới hạn trong vùng đáy màn hình (chiếm ~35% dưới)
      const minY = this.height * 0.65;
      const maxY = this.height - 15;
      if (f.baseY < minY) { f.baseY = minY; f.vy = Math.abs(f.vy); }
      if (f.baseY > maxY) { f.baseY = maxY; f.vy = -Math.abs(f.vy); }

      if (f.x > this.width + 30) f.x = -20;
      if (f.x < -30) f.x = this.width + 20;

      const y = f.baseY + Math.sin(time * 0.0018 + f.phase) * f.swayAmp;

      // Nhịp phát sáng dịu mượt qua hàm sin
      const pulse = Math.sin(time * f.pulseSpeed + f.phase);
      const alpha = Math.max(0, pulse) * 0.85 + 0.10;

      // Hào quang vàng đom đóm
      const auraR = f.radius * 3.8;
      const aura = ctx.createRadialGradient(f.x, y, f.radius * 0.4, f.x, y, auraR);
      aura.addColorStop(0, `rgba(255, 238, 88, ${alpha * 0.75})`);
      aura.addColorStop(0.45, `rgba(255, 214, 0, ${alpha * 0.35})`);
      aura.addColorStop(1, 'rgba(255, 193, 7, 0)');

      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(f.x, y, auraR, 0, Math.PI * 2);
      ctx.fill();

      // Tâm đom đóm phát sáng vàng chanh
      ctx.fillStyle = `rgba(255, 255, 210, ${alpha})`;
      ctx.shadowColor = '#FFEE58';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(f.x, y, f.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // -------------------------------------------------------------
  // DÒNG CHẢY TOÁN HỌC & THỜI GIAN
  // -------------------------------------------------------------
  renderMathStream(time, dt) {
    const ctx = this.ctx;
    ctx.save();

    const colorBase = this.isDark ? '245, 199, 107' : '109, 76, 65';
    const altColor = this.isDark ? '240, 149, 160' : '224, 122, 134';

    for (const item of this.mathStream) {
      item.x += item.speed * dt;
      if (item.x > this.width + 60) {
        item.x = -60;
        item.baseY = 60 + Math.random() * (this.height - 120);
      }

      const y = item.baseY + Math.sin(item.x * item.waveFreq + item.phase) * item.waveAmp;

      ctx.save();
      ctx.translate(item.x, y);
      ctx.rotate(item.rotation);

      const color = (item.size % 2 === 0) ? colorBase : altColor;
      ctx.fillStyle = `rgba(${color}, ${item.alpha})`;
      ctx.font = `600 ${item.size}px 'Nunito', 'Segoe UI', serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(item.symbol, 0, 0);

      ctx.restore();
    }

    ctx.restore();
  }

  renderTimeArcs(time, dt) {
    const ctx = this.ctx;
    ctx.save();

    const strokeColor = this.isDark ? 'rgba(245, 199, 107, ' : 'rgba(224, 122, 134, ';

    for (const arc of this.timeArcs) {
      arc.x += arc.speed * dt;
      if (arc.x > this.width + 80) {
        arc.x = -80;
        arc.baseY = 80 + Math.random() * (this.height - 180);
      }

      arc.rotation += arc.rotSpeed * dt;
      const y = arc.baseY + Math.sin(arc.x * 0.003 + arc.phase) * arc.waveAmp;

      ctx.save();
      ctx.translate(arc.x, y);
      ctx.rotate(arc.rotation);

      ctx.strokeStyle = `${strokeColor}${arc.alpha})`;
      ctx.lineWidth = 1.4;

      // Vòng cung đồng hồ bán nguyệt / 270 độ
      ctx.beginPath();
      ctx.arc(0, 0, arc.radius, 0, Math.PI * 1.5);
      ctx.stroke();

      // Kim thời gian mỏng
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(arc.radius * 0.65, 0);
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -arc.radius * 0.45);
      ctx.stroke();

      // Vạch giờ
      for (let i = 0; i < 4; i++) {
        const tickAngle = (i * Math.PI) / 2;
        const tx = Math.cos(tickAngle) * (arc.radius - 3);
        const ty = Math.sin(tickAngle) * (arc.radius - 3);
        const tox = Math.cos(tickAngle) * arc.radius;
        const toy = Math.sin(tickAngle) * arc.radius;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(tox, toy);
        ctx.stroke();
      }

      ctx.restore();
    }

    ctx.restore();
  }

  // -------------------------------------------------------------
  // CÁNH HOA ANH ĐÀO RƠI XOAY NHẸ
  // -------------------------------------------------------------
  renderPetals(time, dt) {
    const ctx = this.ctx;
    ctx.save();

    for (const p of this.petals) {
      p.x += (p.vx + Math.sin(time * p.swaySpeed + p.swayPhase) * 0.5) * dt;
      p.y += p.vy * dt;
      p.rot += p.rotSpeed * dt;

      if (p.y > this.height + 25) {
        p.y = -20;
        p.x = Math.random() * this.width;
      }
      if (p.x > this.width + 30) {
        p.x = -20;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);

      const color = this.isDark
        ? `rgba(255, 149, 160, ${p.alpha * 0.75})`
        : `rgba(255, 122, 162, ${p.alpha})`;

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, -p.size);
      ctx.bezierCurveTo(p.size * 0.85, -p.size * 0.4, p.size * 0.75, p.size * 0.5, 0, p.size);
      ctx.bezierCurveTo(-p.size * 0.75, p.size * 0.5, -p.size * 0.85, -p.size * 0.4, 0, -p.size);
      ctx.fill();

      ctx.restore();
    }

    ctx.restore();
  }
}

// Xuất đối tượng toàn cục
if (typeof window !== 'undefined') {
  window.SkyCanvas = SkyCanvas;
}

// Khởi tạo Canvas khi DOM đã sẵn sàng
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    if (!window.skyCanvas) {
      window.skyCanvas = new SkyCanvas('sky-canvas');
    }
  });
}
