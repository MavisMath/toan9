/**
 * ================================================================
 * MAVIS CUTE ICONS - BỘ ICON HỒNG PHẤN SAKURA & FLUENT EMOJI 3D
 * Tích hợp 6 file PNG đồ họa riêng trong assets/icons/
 * Các icon phụ sử dụng Microsoft Fluent Emoji 3D qua Iconify CDN
 * ================================================================
 */

(function(global) {
  'use strict';

  /**
   * NGUỒN ĐƯỜNG DẪN ICON
   * 6 file PNG thiết kế riêng trong assets/icons/ và các icon Fluent Emoji 3D
   */
  const ICON_SOURCES = {
    // 6 ảnh PNG bản quyền từ assets/icons/
    cat: 'assets/icons/cat.png',
    butterfly: 'assets/icons/butterfly.png',
    butterfly_side: 'assets/icons/butterfly_side.png',
    sakura: 'assets/icons/sakura.png',
    sakura_bloom: 'assets/icons/sakura_bloom.png',
    sakura_branch: 'assets/icons/sakura_branch.png',
    peach_branch: 'assets/icons/peach_branch.png',

    // Các icon bổ trợ từ Microsoft Fluent Emoji 3D qua Iconify CDN
    tulip: 'https://api.iconify.design/fluent-emoji/tulip.svg',
    moon: 'https://api.iconify.design/fluent-emoji/crescent-moon.svg',
    sun: 'https://api.iconify.design/fluent-emoji/sun.svg',
    ribbon: 'https://api.iconify.design/fluent-emoji/ribbon.svg',
    heart: 'https://api.iconify.design/fluent-emoji/sparkling-heart.svg',
    sparkles: 'https://api.iconify.design/fluent-emoji/sparkles.svg'
  };

  /**
   * FALLBACK EMOJI NẾU MẤT MẠNG HOẶC LỖI TẢI ẢNH
   */
  const ICON_FALLBACKS = {
    cat: '🐱',
    butterfly: '🦋',
    butterfly_side: '🦋',
    sakura: '🌸',
    sakura_bloom: '🌸',
    sakura_branch: '🌸',
    peach_branch: '🌸',
    tulip: '🌷',
    moon: '🌙',
    sun: '☀️',
    ribbon: '🎀',
    heart: '💖',
    sparkles: '✨'
  };

  /**
   * Render thẻ <img> hiển thị Icon
   * @param {string} name - Tên icon ('cat', 'butterfly', 'sakura', ...)
   * @param {number|string} [size=24] - Kích thước icon
   * @returns {string} Chuỗi thẻ HTML <img> kèm onerror fallback
   */
  function renderCuteIcon(name, size = 24) {
    let src = ICON_SOURCES[name] || '';
    const fallback = ICON_FALLBACKS[name] || '✨';
    if (!src) return fallback;

    // Chuẩn hóa định dạng nếu dùng ký tự ':' trên Iconify API thành '/' để Iconify CDN trả về 200 OK
    if (src.indexOf('api.iconify.design/') !== -1) {
      src = src.replace(/api\.iconify\.design\/([a-zA-Z0-9_-]+):/, function(match, prefix) {
        return 'api.iconify.design/' + prefix + '/';
      });
    }

    return `<img class="cute-icon cute-icon-${name}" src="${src}" width="${size}" height="${size}" alt="" loading="lazy" onerror="this.onerror=null;this.outerHTML='${fallback}';" />`;
  }

  const CuteIcons = {
    ICON_SOURCES,
    ICON_FALLBACKS,
    renderCuteIcon,
    get(name, size) {
      return renderCuteIcon(name, size || 24);
    },
    get cat() { return renderCuteIcon('cat', 24); },
    get butterfly() { return renderCuteIcon('butterfly', 24); },
    get butterfly_side() { return renderCuteIcon('butterfly_side', 24); },
    get sakura() { return renderCuteIcon('sakura', 24); },
    get sakura_bloom() { return renderCuteIcon('sakura_bloom', 24); },
    get sakura_branch() { return renderCuteIcon('sakura_branch', 24); },
    get peach_branch() { return renderCuteIcon('peach_branch', 24); },
    get tulip() { return renderCuteIcon('tulip', 24); },
    get moon() { return renderCuteIcon('moon', 24); },
    get sun() { return renderCuteIcon('sun', 24); },
    get ribbon() { return renderCuteIcon('ribbon', 24); },
    get heart() { return renderCuteIcon('heart', 24); },
    get sparkles() { return renderCuteIcon('sparkles', 24); }
  };

  global.ICON_SOURCES = ICON_SOURCES;
  global.ICON_FALLBACKS = ICON_FALLBACKS;
  global.renderCuteIcon = renderCuteIcon;
  global.CuteIcons = CuteIcons;
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
