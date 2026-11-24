/**
 * Mavis Math 9 — Background Music (YouTube), Effects Toggle & Starry Night Sky
 * Standalone drop-in module: zero conflict with existing app.js / sky-canvas.js / butterflies.js
 */
(function () {
  'use strict';

  const YT_VIDEO_ID = '3iFjjsEgLkA';
  const LS_BGM = 'mavis_bgm_enabled';
  const LS_FX = 'mavis_effects_enabled';

  let bgmEnabled = localStorage.getItem(LS_BGM) !== 'false'; // default ON
  let fxEnabled = localStorage.getItem(LS_FX) !== 'false';   // default ON
  let ytPlayer = null;
  let ytReady = false;
  let hasUserInteracted = false;

  /* ---------------- 1. INJECT CLEAN STYLES ---------------- */
  const style = document.createElement('style');
  style.id = 'mavis-music-night-style';
  style.textContent = `
    #mavis-yt-holder {
      position: fixed;
      width: 1px;
      height: 1px;
      bottom: 0;
      left: 0;
      opacity: 0.001;
      pointer-events: none;
      z-index: -1;
      overflow: hidden;
    }
    #mavis-night-stars-canvas {
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 1;
      display: none;
    }
    body.mavis-night-active:not(.mavis-effects-off) #mavis-night-stars-canvas {
      display: block;
    }
    /* Hide butterflies completely at night OR when effects are turned off */
    body.mavis-night-active .mavis-butterfly,
    body.mavis-night-active .butterfly-sprite,
    body.mavis-night-active [class*="butterfly-el"],
    body.mavis-night-active [id*="butterfly-layer"],
    body.mavis-night-active img[src*="butterfly.png"]:not(.cute-icon):not(header img):not(nav img),
    body.mavis-night-active img[src*="butterfly_side.png"]:not(.cute-icon):not(header img):not(nav img),
    body.mavis-effects-off .mavis-butterfly,
    body.mavis-effects-off .butterfly-sprite,
    body.mavis-effects-off [class*="butterfly-el"],
    body.mavis-effects-off [id*="butterfly-layer"],
    body.mavis-effects-off img[src*="butterfly.png"]:not(.cute-icon):not(header img):not(nav img),
    body.mavis-effects-off img[src*="butterfly_side.png"]:not(.cute-icon):not(header img):not(nav img),
    body.mavis-effects-off #sparkle-touch-canvas,
    body.mavis-effects-off #mavis-sparkle-canvas,
    body.mavis-effects-off canvas[data-sparkle="true"] {
      display: none !important;
      opacity: 0 !important;
      visibility: hidden !important;
    }
    /* Pause decorative canvas animations when effects are OFF */
    body.mavis-effects-off #sky-canvas,
    body.mavis-effects-off .sky-canvas {
      opacity: 0.35 !important;
      transition: opacity 0.3s ease;
    }
    /* Compact pill button matching Mavis header */
    .mavis-ctrl-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 999px;
      border: 1.5px solid #EAD7C5;
      background: #FFFDF9;
      color: #4A251A;
      font-family: 'Nunito', sans-serif;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      white-space: nowrap;
      box-shadow: 0 2px 0 #E5CEB8;
      transition: transform 0.15s ease, opacity 0.2s ease, background 0.2s ease;
    }
    .mavis-ctrl-pill:hover {
      transform: translateY(-1px);
      background: #FFF5F8;
      border-color: #F0A3B8;
    }
    .mavis-ctrl-pill:active {
      transform: translateY(1px);
      box-shadow: none;
    }
    .mavis-ctrl-pill.is-off {
      opacity: 0.62;
      background: #F5EFEA;
      text-decoration: line-through;
    }
    body.mavis-night-active .mavis-ctrl-pill {
      background: #332320;
      color: #FFF4E8;
      border-color: #543B35;
      box-shadow: 0 2px 0 #211513;
    }
    body.mavis-night-active .mavis-ctrl-pill.is-off {
      opacity: 0.55;
      background: #261A18;
    }
  `;
  document.head.appendChild(style);

  /* ---------------- 2. THEME & LANGUAGE HELPERS ---------------- */
  function isDarkMode() {
    const html = document.documentElement;
    const body = document.body;
    return (
      html.classList.contains('dark') ||
      body.classList.contains('dark') ||
      body.classList.contains('dark-mode') ||
      html.getAttribute('data-theme') === 'dark' ||
      body.getAttribute('data-theme') === 'dark' ||
      localStorage.getItem('theme') === 'dark'
    );
  }

  function isEnglish() {
    const lang =
      localStorage.getItem('lang') ||
      localStorage.getItem('language') ||
      localStorage.getItem('toan9_lang') ||
      document.documentElement.lang ||
      'vi';
    return String(lang).toLowerCase().startsWith('en');
  }

  function syncBodyClasses() {
    const dark = isDarkMode();
    document.body.classList.toggle('mavis-night-active', dark);
    document.body.classList.toggle('mavis-effects-off', !fxEnabled);
    window.__MAVIS_EFFECTS_ENABLED__ = fxEnabled;
    window.__MAVIS_IS_NIGHT__ = dark;
  }

  /* ---------------- 3. YOUTUBE BGM ENGINE ---------------- */
  function setupYouTubeBGM() {
    const holder = document.createElement('div');
    holder.id = 'mavis-yt-holder';
    const playerDiv = document.createElement('div');
    playerDiv.id = 'mavis-yt-player';
    holder.appendChild(playerDiv);
    document.body.appendChild(holder);

    const prevReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = function () {
      if (typeof prevReady === 'function') prevReady();
      ytPlayer = new window.YT.Player('mavis-yt-player', {
        height: '1',
        width: '1',
        videoId: YT_VIDEO_ID,
        playerVars: {
          autoplay: bgmEnabled ? 1 : 0,
          loop: 1,
          playlist: YT_VIDEO_ID,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1
        },
        events: {
          onReady: function (e) {
            ytReady = true;
            e.target.setVolume(32);
            if (bgmEnabled) {
              try {
                e.target.playVideo();
              } catch (_) {}
            }
          },
          onStateChange: function (e) {
            // Ensure seamless loop if YouTube ends
            if (e.data === window.YT.PlayerState.ENDED && bgmEnabled) {
              e.target.playVideo();
            }
          }
        }
      });
    };

    if (window.YT && window.YT.Player) {
      window.onYouTubeIframeAPIReady();
    } else if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      document.head.appendChild(tag);
    }

    // Unlock audio smoothly on first user interaction if autoplay was blocked
    function unlockOnFirstGesture() {
      if (hasUserInteracted) return;
      hasUserInteracted = true;
      if (bgmEnabled && ytReady && ytPlayer && typeof ytPlayer.playVideo === 'function') {
        try {
          ytPlayer.setVolume(32);
          ytPlayer.playVideo();
        } catch (_) {}
      }
      document.removeEventListener('pointerdown', unlockOnFirstGesture, true);
      document.removeEventListener('keydown', unlockOnFirstGesture, true);
    }
    document.addEventListener('pointerdown', unlockOnFirstGesture, true);
    document.addEventListener('keydown', unlockOnFirstGesture, true);
  }

  function setBGM(enabled) {
    bgmEnabled = !!enabled;
    localStorage.setItem(LS_BGM, bgmEnabled ? 'true' : 'false');
    if (ytReady && ytPlayer) {
      try {
        if (bgmEnabled) {
          ytPlayer.setVolume(32);
          ytPlayer.playVideo();
        } else {
          ytPlayer.pauseVideo();
        }
      } catch (_) {}
    }
    updateControlLabels();
  }

  function setEffects(enabled) {
    fxEnabled = !!enabled;
    localStorage.setItem(LS_FX, fxEnabled ? 'true' : 'false');
    syncBodyClasses();
    updateControlLabels();
  }

  /* ---------------- 4. HEADER BUTTONS (MUSIC & EFFECTS) ---------------- */
  let bgmBtn = null;
  let fxBtn = null;

  function updateControlLabels() {
    const en = isEnglish();
    if (bgmBtn) {
      bgmBtn.classList.toggle('is-off', !bgmEnabled);
      bgmBtn.innerHTML = bgmEnabled
        ? `<span>🎵</span><span>${en ? 'Music' : 'Nhạc'}</span>`
        : `<span>🔇</span><span>${en ? 'Muted' : 'Tắt nhạc'}</span>`;
      bgmBtn.title = en ? 'Toggle background music' : 'Bật / tắt nhạc nền';
    }
    if (fxBtn) {
      fxBtn.classList.toggle('is-off', !fxEnabled);
      fxBtn.innerHTML = fxEnabled
        ? `<span>✨</span><span>${en ? 'Effects' : 'Hiệu ứng'}</span>`
        : `<span>✨</span><span>${en ? 'No FX' : 'Tắt FX'}</span>`;
      fxBtn.title = en ? 'Toggle butterflies & animations' : 'Bật / tắt hiệu ứng bướm, hoa & sao';
    }
  }

  function injectHeaderControls() {
    if (document.getElementById('mavis-fx-toggle-btn')) return;

    // Find existing sound/theme/login button cluster in header
    const candidates = Array.from(document.querySelectorAll('header button, .header button, .top-bar button'));
    const anchor =
      candidates.find((b) => /âm thanh|sound|audio|sáng|tối|light|dark/i.test(b.textContent || '')) ||
      candidates[candidates.length - 1];

    if (!anchor || !anchor.parentElement) return;

    // Sync existing Sound button if user clicks it
    const existingSoundBtn = candidates.find((b) => /âm thanh|sound|audio/i.test(b.textContent || ''));
    if (existingSoundBtn && !existingSoundBtn.dataset.mavisBgmBound) {
      existingSoundBtn.dataset.mavisBgmBound = '1';
      existingSoundBtn.addEventListener('click', function () {
        setBGM(!bgmEnabled);
      });
    } else {
      bgmBtn = document.createElement('button');
      bgmBtn.id = 'mavis-bgm-toggle-btn';
      bgmBtn.type = 'button';
      bgmBtn.className = 'mavis-ctrl-pill';
      bgmBtn.addEventListener('click', function () {
        setBGM(!bgmEnabled);
      });
      anchor.parentElement.insertBefore(bgmBtn, anchor.nextSibling);
    }

    // Add standalone Effects ON/OFF button right next to anchor
    fxBtn = document.createElement('button');
    fxBtn.id = 'mavis-fx-toggle-btn';
    fxBtn.type = 'button';
    fxBtn.className = 'mavis-ctrl-pill';
    fxBtn.addEventListener('click', function () {
      setEffects(!fxEnabled);
    });
    const refNode = bgmBtn || anchor;
    refNode.parentElement.insertBefore(fxBtn, refNode.nextSibling);

    updateControlLabels();
  }

  /* ---------------- 5. LARGE MOVING STARS FOR NIGHT MODE ---------------- */
  function setupNightStarsCanvas() {
    const canvas = document.createElement('canvas');
    canvas.id = 'mavis-night-stars-canvas';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    window.addEventListener('resize', function () {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    });

    const STAR_COLORS = ['#FFF6D6', '#FFE18D', '#FFFFFF', '#FFDCE8'];
    const bigStars = [];
    const STAR_COUNT = 22;

    for (let i = 0; i < STAR_COUNT; i++) {
      bigStars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: 10 + Math.random() * 16, // Large glowing 4-point stars (10px - 26px)
        vx: -0.18 - Math.random() * 0.28,
        vy: 0.05 + Math.random() * 0.14,
        phase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.015 + Math.random() * 0.025,
        rot: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 0.008,
        color: STAR_COLORS[i % STAR_COLORS.length]
      });
    }

    let shootingStar = null;
    let nextShootTime = performance.now() + 3500;

    function drawFourPointStar(x, y, outerR, rot, color, alpha) {
      const innerR = outerR * 0.28;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.globalAlpha = alpha;
      ctx.shadowColor = color;
      ctx.shadowBlur = outerR * 1.1;
      ctx.fillStyle = color;

      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const a = (i * Math.PI) / 4;
        if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
        else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fill();

      // Bright core dot
      ctx.beginPath();
      ctx.arc(0, 0, outerR * 0.18, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.restore();
    }

    function tick(now) {
      if (document.body.classList.contains('mavis-night-active') && fxEnabled) {
        ctx.clearRect(0, 0, w, h);

        // Large moving twinkling stars
        for (let i = 0; i < bigStars.length; i++) {
          const s = bigStars[i];
          s.x += s.vx;
          s.y += s.vy;
          s.phase += s.twinkleSpeed;
          s.rot += s.rotSpeed;

          if (s.x < -40) s.x = w + 40;
          if (s.y > h + 40) s.y = -40;

          const alpha = 0.45 + 0.5 * (0.5 + 0.5 * Math.sin(s.phase));
          const pulseSize = s.size * (0.88 + 0.18 * Math.sin(s.phase));
          drawFourPointStar(s.x, s.y, pulseSize, s.rot, s.color, alpha);
        }

        // Occasional graceful shooting star
        if (!shootingStar && now >= nextShootTime) {
          shootingStar = {
            x: w * (0.4 + Math.random() * 0.55),
            y: h * (0.05 + Math.random() * 0.35),
            vx: -9 - Math.random() * 4,
            vy: 3.5 + Math.random() * 2.5,
            life: 0,
            maxLife: 42
          };
          nextShootTime = now + 5000 + Math.random() * 5000;
        }

        if (shootingStar) {
          const st = shootingStar;
          st.x += st.vx;
          st.y += st.vy;
          st.life++;
          const progress = st.life / st.maxLife;
          const alpha = Math.sin(progress * Math.PI) * 0.9;

          ctx.save();
          const grad = ctx.createLinearGradient(
            st.x,
            st.y,
            st.x - st.vx * 11,
            st.y - st.vy * 11
          );
          grad.addColorStop(0, `rgba(255, 246, 209, ${alpha})`);
          grad.addColorStop(1, 'rgba(255, 246, 209, 0)');
          ctx.strokeStyle = grad;
          ctx.lineWidth = 2.6;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(st.x, st.y);
          ctx.lineTo(st.x - st.vx * 11, st.y - st.vy * 11);
          ctx.stroke();
          ctx.restore();

          drawFourPointStar(st.x, st.y, 7, progress * 2, '#FFF8DC', alpha);

          if (st.life >= st.maxLife) shootingStar = null;
        }
      }
      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  /* ---------------- 6. BOOTSTRAP & OBSERVERS ---------------- */
  function init() {
    syncBodyClasses();
    setupYouTubeBGM();
    setupNightStarsCanvas();
    injectHeaderControls();

    // Re-check theme/language changes dynamically
    const obs = new MutationObserver(function () {
      syncBodyClasses();
      injectHeaderControls();
      updateControlLabels();
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme', 'lang'] });
    obs.observe(document.body, { attributes: true, attributeFilter: ['class', 'data-theme'] });

    // Intercept sparkle pointerdown when effects are off
    window.addEventListener(
      'pointerdown',
      function () {
        syncBodyClasses();
      },
      true
    );
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();