/**
 * ================================================================
 * SPARKLE TOUCH - HIỆU ỨNG CHẠM PHÁT SÁNG NGÔI SAO TOÀN MÀN HÌNH
 * Chùm sao 4 cánh & 5 cánh + vòng sáng lan tỏa mượt mà 60fps
 * Bảng màu rực rỡ: Vàng kim, Hồng neon, Cam nắng, Trắng lấp lánh
 * Tự động dừng RAF khi hết hạt để tiết kiệm tối đa CPU/pin
 * ================================================================
 */

class SparkleTouch {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.particles = [];
    this.rings = [];
    this.rafId = null;
    this.lastTime = 0;
    this.colors = ['#FFD54F', '#FF4D79', '#FF9F1C', '#FFFFFF', '#FFE082', '#FF6B8F'];

    this.init();
  }

  init() {
    // Tạo canvas overlay toàn màn hình
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'sparkle-touch-canvas';
    this.canvas.setAttribute('aria-hidden', 'true');
    this.canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 9999;
    `;
    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d', { alpha: true });

    this.handleResize();
    window.addEventListener('resize', () => this.handleResize(), { passive: true });

    // Lắng nghe pointerdown (hỗ trợ cả chuột máy tính, bút stylus và chạm ngón tay mobile)
    document.addEventListener('pointerdown', (e) => this.handlePointerDown(e), { passive: true });
  }

  handleResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(this.dpr, this.dpr);
  }

  handlePointerDown(e) {
    const x = e.clientX;
    const y = e.clientY;
    if (x === undefined || y === undefined) return;

    this.spawnBurst(x, y);
  }

  spawnBurst(x, y) {
    const now = performance.now();

    // 1. Vòng sáng mỏng (glow ring) lan tỏa nhanh từ tâm
    this.rings.push({
      x,
      y,
      radius: 4,
      maxRadius: 38 + Math.random() * 16,
      speed: 2.4,
      color: Math.random() > 0.5 ? '#FFD54F' : '#FF4D79',
      born: now,
      duration: 380
    });

    // 2. Chùm 8-12 ngôi sao 4 cánh và 5 cánh phát sáng
    const count = 9 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i++) {
      const angle = (i * ((Math.PI * 2) / count)) + ((Math.random() - 0.5) * 0.45);
      const speed = 2.8 + Math.random() * 4.6;
      const size = 6 + Math.random() * 8;
      const points = Math.random() > 0.45 ? 4 : 5;
      const color = this.colors[Math.floor(Math.random() * this.colors.length)];

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (0.6 + Math.random() * 0.8), // Hơi bốc lên trên
        size,
        points,
        color,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.28,
        born: now,
        duration: 580 + Math.random() * 140, // ~650ms
        drag: 0.94,
        gravity: 0.12
      });
    }

    // Khởi động vòng lặp render nếu đang dừng
    if (!this.rafId) {
      this.lastTime = now;
      this.rafId = requestAnimationFrame((t) => this.render(t));
    }
  }

  drawStar(cx, cy, spikes, outerRadius, innerRadius, rotation, color, alpha) {
    const ctx = this.ctx;
    let rot = (Math.PI / 2) * 3 + rotation;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.fillStyle = color;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  render(timestamp) {
    const dt = Math.min((timestamp - this.lastTime) / 16.666, 3);
    this.lastTime = timestamp;

    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    const now = timestamp;

    // 1. Vẽ các vòng sáng lan tỏa
    for (let i = this.rings.length - 1; i >= 0; i--) {
      const ring = this.rings[i];
      const elapsed = now - ring.born;
      const progress = elapsed / ring.duration;

      if (progress >= 1) {
        this.rings.splice(i, 1);
        continue;
      }

      ring.radius += ring.speed * dt;
      const alpha = (1 - progress) * 0.75;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.shadowColor = ring.color;
      ctx.shadowBlur = 10;
      ctx.strokeStyle = ring.color;
      ctx.lineWidth = Math.max(1, 2.5 * (1 - progress));
      ctx.beginPath();
      ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 2. Vẽ các ngôi sao phát sáng
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      const elapsed = now - p.born;
      const progress = elapsed / p.duration;

      if (progress >= 1) {
        this.particles.splice(i, 1);
        continue;
      }

      // Vật lý hạt
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= Math.pow(p.drag, dt);
      p.vy = (p.vy * Math.pow(p.drag, dt)) + (p.gravity * dt);
      p.rotation += p.rotSpeed * dt;

      // Độ mờ và kích thước thu nhỏ dần
      const easeOut = 1 - Math.pow(progress, 1.4);
      const alpha = easeOut;
      const curSize = p.size * (0.3 + 0.7 * easeOut);
      const innerSize = curSize * (p.points === 4 ? 0.32 : 0.42);

      this.drawStar(p.x, p.y, p.points, curSize, innerSize, p.rotation, p.color, alpha);
    }

    // 3. Quản lý trạng thái vòng lặp để tối ưu hiệu năng
    if (this.particles.length > 0 || this.rings.length > 0) {
      this.rafId = requestAnimationFrame((t) => this.render(t));
    } else {
      ctx.clearRect(0, 0, this.width, this.height);
      this.rafId = null;
    }
  }
}

// Tự động khởi tạo khi DOM sẵn sàng
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.sparkleTouch = new SparkleTouch();
    });
  } else {
    window.sparkleTouch = new SparkleTouch();
  }
}
