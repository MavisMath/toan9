/**
 * ================================================================
 * MAVIS BUTTERFLIES - ĐÀN BƯỚM HỒNG TO ĐẸP BIẾT ĐẬU RỒI BAY ĐI
 * Tương tác vật lý mềm mại 60FPS - Tự tìm điểm đậu trên Banner/Thẻ
 * Bay lượn (flying) -> Đậu nghỉ (perched 3-6s) -> Bay đi (takeoff khi chạm chuột)
 * Dùng trực tiếp butterfly.png & butterfly_side.png trong assets/icons/
 * ================================================================
 */

(function(global) {
  'use strict';

  // Kiểm tra prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Tọa độ chuột / chạm màn hình toàn cục
  const mousePos = { x: -9999, y: -9999, lastMove: 0 };
  window.addEventListener('mousemove', function(e) {
    mousePos.x = e.clientX;
    mousePos.y = e.clientY;
    mousePos.lastMove = performance.now();
  }, { passive: true });

  window.addEventListener('touchmove', function(e) {
    if (e.touches && e.touches[0]) {
      mousePos.x = e.touches[0].clientX;
      mousePos.y = e.touches[0].clientY;
      mousePos.lastMove = performance.now();
    }
  }, { passive: true });

  /**
   * Tạo 3-4 tia sao nhỏ lấp lánh khi bướm cất cánh
   */
  function spawnButterflySparkles(x, y) {
    if (prefersReducedMotion) return;
    const container = document.body;
    if (!container) return;

    const count = 3 + Math.floor(Math.random() * 2); // 3-4 tia sao
    const starSymbols = ['✨', '⭐', '🌸', '✨'];

    for (let i = 0; i < count; i++) {
      const sparkle = document.createElement('div');
      sparkle.className = 'mavis-butterfly-sparkle';
      sparkle.textContent = starSymbols[i % starSymbols.length];
      sparkle.style.left = `${Math.round(x)}px`;
      sparkle.style.top = `${Math.round(y)}px`;

      // Hướng bay tỏa ra của từng tia sao
      const dx = (Math.random() - 0.5) * 44;
      const dy = -18 - Math.random() * 32;
      sparkle.style.setProperty('--sparkle-dx', `${Math.round(dx)}px`);
      sparkle.style.setProperty('--sparkle-dy', `${Math.round(dy)}px`);

      container.appendChild(sparkle);
      setTimeout(() => {
        if (sparkle.parentNode) sparkle.parentNode.removeChild(sparkle);
      }, 760);
    }
  }

  /**
   * Lớp Bướm (Butterfly Object)
   */
  class Butterfly {
    constructor(config) {
      this.id = config.id;
      this.size = config.size || 52;
      this.type = config.type || 'spread'; // 'spread' (xòe cánh) hoặc 'side' (bay nghiêng)
      this.src = config.src;

      // Vị trí và vận tốc
      this.x = config.startX || (Math.random() * (window.innerWidth - 100) + 50);
      this.y = config.startY || (Math.random() * (window.innerHeight * 0.45) + 60);
      this.vx = (Math.random() - 0.5) * 1.8;
      this.vy = (Math.random() - 0.5) * 1.5;
      this.maxSpeed = 2.4;

      // Góc nghiêng thân bướm
      this.angle = 0;
      this.targetAngle = 0;

      // Mục tiêu bay
      this.targetX = this.x;
      this.targetY = this.y;
      this.perchAnchor = null;

      // Trạng thái: 'flying' -> 'landing' -> 'perched' -> 'takeoff'
      this.state = 'flying';
      this.flightTime = 0;
      this.flightDuration = 7000 + Math.random() * 9000; // Thời gian bay lượn trước khi tìm chỗ đậu (7-16s)
      this.perchTimer = 0;
      this.takeoffTime = 0;

      // Nhịp vỗ cánh
      this.wingPhase = Math.random() * Math.PI * 2;
      this.wingSpeed = 0.012 + Math.random() * 0.005;

      // Khởi tạo DOM
      this.createDOM();
    }

    createDOM() {
      this.container = document.createElement('div');
      this.container.className = `mavis-butterfly mavis-butterfly-${this.type}`;
      this.container.style.cssText = `
        position: fixed;
        left: 0;
        top: 0;
        width: ${this.size}px;
        height: ${this.size}px;
        pointer-events: none;
        z-index: 40;
        will-change: transform;
        transform-origin: center center;
        filter: drop-shadow(0 4px 10px rgba(232, 112, 140, 0.35));
      `;

      this.img = document.createElement('img');
      this.img.src = this.src;
      this.img.alt = '';
      this.img.loading = 'eager';
      this.img.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: block;
        pointer-events: none;
        transform-origin: center center;
        will-change: transform;
      `;

      this.container.appendChild(this.img);
      document.body.appendChild(this.container);

      // Điểm đến ban đầu
      this.pickNewWanderTarget();
    }

    pickNewWanderTarget() {
      const paddingX = 80;
      const paddingY = 80;
      const maxX = Math.max(300, window.innerWidth - paddingX);
      const maxY = Math.max(250, window.innerHeight - paddingY);

      this.targetX = paddingX + Math.random() * (maxX - paddingX);
      this.targetY = paddingY + Math.random() * (maxY - paddingY);
    }

    findPerchTarget() {
      // Tìm các thẻ / banner nổi bật trên giao diện đang hiển thị trong viewport
      const candidateEls = document.querySelectorAll(
        '.hero-banner-warm, .card, .topic-card, .feature-card, .stat-chip, .btn-3d-rose, .btn-3d-gold, .mode-card'
      );
      if (!candidateEls || candidateEls.length === 0) return null;

      const visibleCandidates = [];
      const viewH = window.innerHeight;
      const viewW = window.innerWidth;

      for (let i = 0; i < candidateEls.length; i++) {
        const el = candidateEls[i];
        const rect = el.getBoundingClientRect();
        // Chỉ chọn phần tử nằm trọn vẹn trong màn hình
        if (
          rect.top >= 70 &&
          rect.bottom <= viewH - 25 &&
          rect.left >= 10 &&
          rect.right <= viewW - 10 &&
          rect.width >= 50 &&
          rect.height >= 35
        ) {
          visibleCandidates.push({ el, rect });
        }
      }

      if (visibleCandidates.length === 0) return null;

      // Chọn ngẫu nhiên 1 thẻ ứng viên
      const chosen = visibleCandidates[Math.floor(Math.random() * visibleCandidates.length)];
      // Đậu ở góc trên trái, góc trên phải hoặc mép gờ trên cùng của thẻ để không đè lên chữ
      const isCorner = Math.random() > 0.35;
      const relX = isCorner
        ? (Math.random() > 0.5 ? (0.04 + Math.random() * 0.08) : (0.88 + Math.random() * 0.08))
        : (0.20 + Math.random() * 0.60);
      const perchX = chosen.rect.left + relX * chosen.rect.width - this.size * 0.5;
      // Chân bướm bám trên mép viền trên (thân và cánh bướm vươn hẳn lên phía trên thẻ, tuyệt đối không che chữ)
      const perchY = chosen.rect.top - this.size * 0.62;

      return {
        el: chosen.el,
        relX: relX,
        x: perchX,
        y: perchY
      };
    }

    perch() {
      this.state = 'perched';
      this.perchTimer = 3000 + Math.random() * 3000; // Đậu nghỉ 3-6 giây
      this.vx = 0;
      this.vy = 0;
      this.targetAngle = (Math.random() - 0.5) * 12; // Góc đứng nghỉ hơi nghiêng nhẹ
    }

    takeoff(isScared = false) {
      if (this.state === 'takeoff') return;

      this.state = 'takeoff';
      this.takeoffTime = 0;
      this.perchAnchor = null;

      // Vỗ cánh vút lên trên
      this.vy = isScared ? (-3.8 - Math.random() * 1.6) : (-2.6 - Math.random() * 1.2);
      this.vx = (Math.random() - 0.5) * 4.2;

      // Tạo 3-4 tia sao nhỏ lấp lánh khi cất cánh
      spawnButterflySparkles(this.x + this.size * 0.5, this.y + this.size * 0.5);
    }

    update(dt, timestamp) {
      const step = dt;

      // -------------------------------------------------------------
      // 1. TRẠNG THÁI: PERCHED (ĐẬU NGHỈ 3-6S)
      // -------------------------------------------------------------
      if (this.state === 'perched') {
        // Cập nhật vị trí bám theo thẻ nếu người dùng cuộn trang
        if (this.perchAnchor && this.perchAnchor.el && document.body.contains(this.perchAnchor.el)) {
          const rect = this.perchAnchor.el.getBoundingClientRect();
          // Nếu thẻ bị cuộn khuất khỏi viewport -> bay đi
          if (rect.bottom < 60 || rect.top > window.innerHeight - 20) {
            this.takeoff(false);
            return;
          }
          this.x = rect.left + this.perchAnchor.relX * rect.width - this.size * 0.5;
          this.y = rect.top - this.size * 0.62;
        }

        // Nhịp vỗ cánh rất chậm như đang thở êm dịu (chu kỳ ~2.6s, scaleX 0.88 -> 1.0)
        const breathe = Math.sin(timestamp * 0.0024 + this.wingPhase);
        const wingScale = 0.94 + 0.06 * breathe;

        this.applyTransforms(wingScale);

        // Kiểm tra chuột / ngón tay lại gần trong bán kính 90px
        const butterflyCenterX = this.x + this.size * 0.5;
        const butterflyCenterY = this.y + this.size * 0.5;
        const distToMouse = Math.hypot(mousePos.x - butterflyCenterX, mousePos.y - butterflyCenterY);

        if (distToMouse < 90) {
          this.takeoff(true); // Giật mình bay vụt lên vì chuột lại gần!
          return;
        }

        // Đếm ngược thời gian đậu nghỉ
        this.perchTimer -= step * 16.666;
        if (this.perchTimer <= 0) {
          this.takeoff(false); // Hết giờ nghỉ -> tự giác bay đi tìm chỗ mới
        }
        return;
      }

      // -------------------------------------------------------------
      // 2. TRẠNG THÁI: TAKEOFF (VỖ CÁNH BAY VÚT LÊN)
      // -------------------------------------------------------------
      if (this.state === 'takeoff') {
        this.takeoffTime += step * 16.666;

        this.x += this.vx * step;
        this.y += this.vy * step;
        this.vy += 0.04 * step; // Lực nâng dịu dần

        // Vỗ cánh nhanh khi mới cất cánh
        const flap = Math.sin(timestamp * 0.024 + this.wingPhase);
        const wingScale = 0.82 + 0.18 * Math.abs(flap);

        this.targetAngle = Math.atan2(this.vy, this.vx) * (180 / Math.PI) + 90;
        this.applyTransforms(wingScale);

        // Sau ~650ms chuyển sang chế độ bay lượn tự do
        if (this.takeoffTime >= 650) {
          this.state = 'flying';
          this.flightTime = 0;
          this.flightDuration = 7000 + Math.random() * 9000;
          this.pickNewWanderTarget();
        }
        return;
      }

      // -------------------------------------------------------------
      // 3. TRẠNG THÁI: LANDING (BAY TỚI ĐIỂM ĐẬU)
      // -------------------------------------------------------------
      if (this.state === 'landing') {
        // Cập nhật tọa độ đích theo vị trí thẻ
        if (this.perchAnchor && this.perchAnchor.el && document.body.contains(this.perchAnchor.el)) {
          const rect = this.perchAnchor.el.getBoundingClientRect();
          this.targetX = rect.left + this.perchAnchor.relX * rect.width - this.size * 0.5;
          this.targetY = rect.top - this.size * 0.62;
        }

        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const dist = Math.hypot(dx, dy);

        // Giảm dần tốc độ khi bay sát điểm đậu
        const approachSpeed = Math.min(1.8, Math.max(0.4, dist * 0.025));
        this.vx += (dx / Math.max(dist, 1)) * 0.08 * step;
        this.vy += (dy / Math.max(dist, 1)) * 0.08 * step;

        this.vx *= 0.90;
        this.vy *= 0.90;
        this.x += this.vx * step;
        this.y += this.vy * step;

        const flap = Math.sin(timestamp * 0.010 + this.wingPhase);
        const wingScale = 0.88 + 0.12 * Math.abs(flap);

        this.targetAngle = (Math.random() - 0.5) * 8;
        this.applyTransforms(wingScale);

        // Đã tới sát điểm đậu (< 9px)
        if (dist < 9) {
          this.x = this.targetX;
          this.y = this.targetY;
          this.perch();
        }
        return;
      }

      // -------------------------------------------------------------
      // 4. TRẠNG THÁI: FLYING (BAY LƯỢN MỀM MẠI)
      // -------------------------------------------------------------
      this.flightTime += step * 16.666;

      const dx = this.targetX - this.x;
      const dy = this.targetY - this.y;
      const dist = Math.hypot(dx, dy);

      // Nếu đã tới gần điểm lang thang hoặc bướm bay ra ngoài rìa màn hình -> chọn điểm mới
      if (dist < 50 || this.x < 20 || this.x > window.innerWidth - 70 || this.y < 30 || this.y > window.innerHeight - 80) {
        this.pickNewWanderTarget();
      }

      // Lực lái mềm hướng về đích
      const steerFactor = 0.035;
      this.vx += (dx / Math.max(dist, 1)) * steerFactor * step;
      this.vy += (dy / Math.max(dist, 1)) * steerFactor * step;

      // Giới hạn vận tốc bay
      const currentSpeed = Math.hypot(this.vx, this.vy);
      if (currentSpeed > this.maxSpeed) {
        this.vx = (this.vx / currentSpeed) * this.maxSpeed;
        this.vy = (this.vy / currentSpeed) * this.maxSpeed;
      }

      // Hiệu ứng bay uốn lượn hình sin mềm mại
      const flutter = Math.sin(timestamp * 0.0035 + this.wingPhase) * 0.75;
      this.x += (this.vx + flutter * 0.4) * step;
      this.y += (this.vy + flutter * 0.25) * step;

      // Cánh vỗ mềm mượt: dao động 0.76 -> 1.0 (tuyệt đối không ép dẹt)
      const flap = Math.sin(timestamp * this.wingSpeed + this.wingPhase);
      const wingScale = 0.88 + 0.12 * Math.abs(flap);

      // Nghiêng thân bướm theo hướng bay
      if (this.type === 'spread') {
        this.targetAngle = Math.atan2(this.vy, this.vx) * (180 / Math.PI) + 90;
      } else {
        // Bướm nghiêng: nghiêng nhẹ theo độ cao và lật ngang theo hướng bay
        this.targetAngle = this.vy * 5;
      }

      this.applyTransforms(wingScale);

      // Khi đã bay lượn đủ thời gian -> tìm thẻ để đậu xuống nghỉ
      if (this.flightTime >= this.flightDuration) {
        const perchSpot = this.findPerchTarget();
        if (perchSpot) {
          this.state = 'landing';
          this.perchAnchor = perchSpot;
          this.targetX = perchSpot.x;
          this.targetY = perchSpot.y;
        } else {
          // Nếu chưa tìm thấy thẻ phù hợp -> bay thêm 4s nữa rồi tìm lại
          this.flightDuration += 4000;
        }
      }
    }

    applyTransforms(wingScale) {
      // Nội suy góc mượt mà tránh giật
      let diff = this.targetAngle - this.angle;
      while (diff < -180) diff += 360;
      while (diff > 180) diff -= 360;
      this.angle += diff * 0.08;

      // Áp dụng vị trí và xoay thân bướm trên container
      this.container.style.transform = `translate3d(${Math.round(this.x)}px, ${Math.round(this.y)}px, 0) rotate(${this.angle.toFixed(1)}deg)`;

      // Vỗ cánh mềm trên ảnh bướm
      if (this.type === 'side') {
        const flipX = this.vx < -0.1 ? -1 : 1;
        this.img.style.transform = `scaleX(${(wingScale * flipX).toFixed(3)})`;
      } else {
        this.img.style.transform = `scaleX(${wingScale.toFixed(3)})`;
      }
    }
  }

  /**
   * Quản lý đàn bướm (ButterfliesManager)
   */
  class ButterfliesManager {
    constructor() {
      this.butterflies = [];
      this.lastTime = 0;
      this.animationFrameId = null;
      this.isStarted = false;

      this.init();
    }

    init() {
      // Cấu hình 4 chú bướm đẹp, to rõ (44px - 60px) từ 2 file ảnh PNG sẵn có
      const configs = [
        { id: 1, size: 54, type: 'spread', src: 'assets/icons/butterfly.png', startX: 120, startY: 100 },
        { id: 2, size: 48, type: 'side', src: 'assets/icons/butterfly_side.png', startX: window.innerWidth - 180, startY: 140 },
        { id: 3, size: 60, type: 'spread', src: 'assets/icons/butterfly.png', startX: window.innerWidth * 0.5, startY: 80 },
        { id: 4, size: 46, type: 'side', src: 'assets/icons/butterfly_side.png', startX: 200, startY: 220 }
      ];

      for (let i = 0; i < configs.length; i++) {
        this.butterflies.push(new Butterfly(configs[i]));
      }

      this.start();
    }

    start() {
      if (this.isStarted) return;
      this.isStarted = true;

      const loop = (timestamp) => {
        if (!this.lastTime) this.lastTime = timestamp;
        const dt = Math.min((timestamp - this.lastTime) / 16.666, 2.5);
        this.lastTime = timestamp;

        for (let i = 0; i < this.butterflies.length; i++) {
          this.butterflies[i].update(dt, timestamp);
        }

        this.animationFrameId = window.requestAnimationFrame(loop);
      };

      this.animationFrameId = window.requestAnimationFrame(loop);
    }

    stop() {
      if (this.animationFrameId) {
        window.cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
      this.isStarted = false;
    }
  }

  // Khởi tạo khi DOM sẵn sàng
  if (typeof window !== 'undefined') {
    window.ButterfliesManager = ButterfliesManager;

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        if (!window.mavisButterflies) {
          window.mavisButterflies = new ButterfliesManager();
        }
      });
    } else {
      if (!window.mavisButterflies) {
        window.mavisButterflies = new ButterfliesManager();
      }
    }
  }
})(typeof window !== 'undefined' ? window : this);
