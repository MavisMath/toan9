// ================================================================
// CHATBOT HỎI ĐÁP GEMINI, API KEY ĐƯỢC GIỮ TRÊN MÁY CHỦ
// ================================================================

class MathChatbot {
  constructor() {
    this.panel = document.getElementById('math-chat-panel');
    this.toggleButton = document.getElementById('math-chat-toggle');
    this.closeButton = document.getElementById('math-chat-close');
    this.messages = document.getElementById('math-chat-messages');
    this.form = document.getElementById('math-chat-form');
    this.input = document.getElementById('math-chat-input');
    this.submitButton = this.form?.querySelector('button[type="submit"]');
    this.history = [];
    this.isSending = false;

    if (!this.panel || !this.toggleButton || !this.closeButton || !this.messages || !this.form || !this.input || !this.submitButton) {
      throw new Error('Không tìm thấy đầy đủ thành phần giao diện chatbot.');
    }

    this.resetButton = document.getElementById('math-chat-reset');
    if (this.resetButton) {
      this.resetButton.addEventListener('click', () => this.resetChat());
    }

    this.dockButton = document.getElementById('math-chat-dock');
    this.header = document.getElementById('math-chat-header') || this.panel.querySelector('.math-chat-header');

    this.bindEvents();
    this.initToggleDrag();
    this.initPanelDrag();
    this.initDockButton();
    this.renderInitialMath();
  }

  bindEvents() {
    this.closeButton.addEventListener('click', () => this.setOpen(false));
    this.form.addEventListener('submit', event => {
      event.preventDefault();
      this.submitQuestion(this.input.value);
    });

    document.querySelectorAll('.chat-suggestion').forEach(button => {
      button.addEventListener('click', () => this.submitQuestion(button.textContent));
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !this.panel.hidden) {
        this.setOpen(false);
      }
    });

    window.addEventListener('resize', () => {
      this.clampToggleToViewport();
      this.clampPanelToViewport();
    });
  }

  // ==============================================================
  // KÉO THẢ NÚT NỔI "HỎI MÈO TOÁN" (TOUCH & MOUSE DRAGGING)
  // ==============================================================
  initToggleDrag() {
    this.preventClickAfterDrag = false;
    let isDown = false;
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialLeft = 0;
    let initialTop = 0;
    const DRAG_THRESHOLD = 5;
    const MARGIN = 12;

    // Phục hồi vị trí đã lưu trong localStorage
    this.restoreTogglePosition();

    const onPointerDown = (e) => {
      if (e.button !== undefined && e.button !== 0) return;

      isDown = true;
      isDragging = false;
      startX = e.clientX;
      startY = e.clientY;

      const rect = this.toggleButton.getBoundingClientRect();
      initialLeft = rect.left;
      initialTop = rect.top;

      try {
        this.toggleButton.setPointerCapture(e.pointerId);
      } catch (_) {}
    };

    const onPointerMove = (e) => {
      if (!isDown) return;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      if (!isDragging) {
        if (Math.hypot(dx, dy) >= DRAG_THRESHOLD) {
          isDragging = true;
          this.toggleButton.classList.add('is-dragging');
          document.body.style.userSelect = 'none';
        } else {
          return;
        }
      }

      const btnWidth = this.toggleButton.offsetWidth;
      const btnHeight = this.toggleButton.offsetHeight;
      const maxLeft = Math.max(MARGIN, window.innerWidth - btnWidth - MARGIN);
      const maxTop = Math.max(MARGIN, window.innerHeight - btnHeight - MARGIN);

      const rawLeft = initialLeft + dx;
      const rawTop = initialTop + dy;

      const clampedLeft = Math.max(MARGIN, Math.min(rawLeft, maxLeft));
      const clampedTop = Math.max(MARGIN, Math.min(rawTop, maxTop));

      this.setTogglePos(clampedLeft, clampedTop);
    };

    const onPointerUp = (e) => {
      if (!isDown) return;
      isDown = false;

      try {
        this.toggleButton.releasePointerCapture(e.pointerId);
      } catch (_) {}

      document.body.style.userSelect = '';
      this.toggleButton.classList.remove('is-dragging');

      if (isDragging) {
        const rect = this.toggleButton.getBoundingClientRect();
        this.saveTogglePosition(rect.left, rect.top);

        // Chặn sự kiện click để không vô tình mở/đóng khung chat sau khi kéo
        this.preventClickAfterDrag = true;
        setTimeout(() => {
          this.preventClickAfterDrag = false;
        }, 120);
      }

      isDragging = false;
    };

    this.toggleButton.addEventListener('pointerdown', onPointerDown);
    this.toggleButton.addEventListener('pointermove', onPointerMove);
    this.toggleButton.addEventListener('pointerup', onPointerUp);
    this.toggleButton.addEventListener('pointercancel', onPointerUp);

    // Mở / đóng chat khi người dùng click/tap (khoảng cách kéo < 5px)
    this.toggleButton.addEventListener('click', (e) => {
      if (this.preventClickAfterDrag) {
        e.preventDefault();
        e.stopPropagation();
        this.preventClickAfterDrag = false;
        return;
      }
      this.setOpen(this.panel.hidden);
    });
  }

  setTogglePos(left, top) {
    this.toggleButton.style.left = `${Math.round(left)}px`;
    this.toggleButton.style.top = `${Math.round(top)}px`;
    this.toggleButton.style.right = 'auto';
    this.toggleButton.style.bottom = 'auto';
  }

  saveTogglePosition(left, top) {
    try {
      localStorage.setItem('math_chat_toggle_pos', JSON.stringify({ left: Math.round(left), top: Math.round(top) }));
    } catch (_) {}
  }

  restoreTogglePosition() {
    try {
      const saved = localStorage.getItem('math_chat_toggle_pos');
      if (saved) {
        const { left, top } = JSON.parse(saved);
        if (typeof left === 'number' && typeof top === 'number') {
          const MARGIN = 12;
          const btnWidth = this.toggleButton.offsetWidth || 150;
          const btnHeight = this.toggleButton.offsetHeight || 50;
          const maxLeft = Math.max(MARGIN, window.innerWidth - btnWidth - MARGIN);
          const maxTop = Math.max(MARGIN, window.innerHeight - btnHeight - MARGIN);
          const clampedLeft = Math.max(MARGIN, Math.min(left, maxLeft));
          const clampedTop = Math.max(MARGIN, Math.min(top, maxTop));
          this.setTogglePos(clampedLeft, clampedTop);
        }
      }
    } catch (_) {}
  }

  clampToggleToViewport() {
    if (!this.toggleButton.style.left || this.toggleButton.style.left === 'auto') return;
    const MARGIN = 12;
    const btnWidth = this.toggleButton.offsetWidth || 150;
    const btnHeight = this.toggleButton.offsetHeight || 50;
    const currentLeft = parseFloat(this.toggleButton.style.left);
    const currentTop = parseFloat(this.toggleButton.style.top);
    if (!isNaN(currentLeft) && !isNaN(currentTop)) {
      const maxLeft = Math.max(MARGIN, window.innerWidth - btnWidth - MARGIN);
      const maxTop = Math.max(MARGIN, window.innerHeight - btnHeight - MARGIN);
      const clampedLeft = Math.max(MARGIN, Math.min(currentLeft, maxLeft));
      const clampedTop = Math.max(MARGIN, Math.min(currentTop, maxTop));
      this.setTogglePos(clampedLeft, clampedTop);
    }
  }

  // ==============================================================
  // KÉO THẢ CỬA SỔ KHUNG CHAT (DRAGGING VIA HEADER)
  // ==============================================================
  initPanelDrag() {
    this.header = document.getElementById('math-chat-header') || this.panel.querySelector('.math-chat-header');
    if (!this.header) return;

    let isDown = false;
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialLeft = 0;
    let initialTop = 0;
    const DRAG_THRESHOLD = 5;
    const MARGIN = 10;

    const onPointerDown = (e) => {
      // Bỏ qua nếu bấm vào các nút đóng, reset, ghim trên header
      if (e.target.closest('button')) return;
      if (e.button !== undefined && e.button !== 0) return;

      isDown = true;
      isDragging = false;
      startX = e.clientX;
      startY = e.clientY;

      const rect = this.panel.getBoundingClientRect();
      initialLeft = rect.left;
      initialTop = rect.top;

      try {
        this.header.setPointerCapture(e.pointerId);
      } catch (_) {}
    };

    const onPointerMove = (e) => {
      if (!isDown) return;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      if (!isDragging) {
        if (Math.hypot(dx, dy) >= DRAG_THRESHOLD) {
          isDragging = true;
          this.panel.classList.add('is-dragging');
          this.header.classList.add('is-dragging');
          document.body.style.userSelect = 'none';
        } else {
          return;
        }
      }

      const panelWidth = this.panel.offsetWidth;
      const panelHeight = this.panel.offsetHeight;
      const maxLeft = Math.max(MARGIN, window.innerWidth - panelWidth - MARGIN);
      const maxTop = Math.max(MARGIN, window.innerHeight - panelHeight - MARGIN);

      const rawLeft = initialLeft + dx;
      const rawTop = initialTop + dy;

      const clampedLeft = Math.max(MARGIN, Math.min(rawLeft, maxLeft));
      const clampedTop = Math.max(MARGIN, Math.min(rawTop, maxTop));

      this.setPanelPos(clampedLeft, clampedTop);
    };

    const onPointerUp = (e) => {
      if (!isDown) return;
      isDown = false;

      try {
        this.header.releasePointerCapture(e.pointerId);
      } catch (_) {}

      document.body.style.userSelect = '';
      this.panel.classList.remove('is-dragging');
      this.header.classList.remove('is-dragging');

      if (isDragging) {
        const rect = this.panel.getBoundingClientRect();
        this.savePanelPosition(rect.left, rect.top);
      }

      isDragging = false;
    };

    this.header.addEventListener('pointerdown', onPointerDown);
    this.header.addEventListener('pointermove', onPointerMove);
    this.header.addEventListener('pointerup', onPointerUp);
    this.header.addEventListener('pointercancel', onPointerUp);
  }

  setPanelPos(left, top) {
    this.panel.style.left = `${Math.round(left)}px`;
    this.panel.style.top = `${Math.round(top)}px`;
    this.panel.style.right = 'auto';
    this.panel.style.bottom = 'auto';
  }

  savePanelPosition(left, top) {
    try {
      localStorage.setItem('math_chat_panel_pos', JSON.stringify({ left: Math.round(left), top: Math.round(top) }));
    } catch (_) {}
  }

  clampPanelToViewport() {
    if (this.panel.hidden || !this.panel.style.left || this.panel.style.left === 'auto') return;
    const MARGIN = 10;
    const panelWidth = this.panel.offsetWidth || 380;
    const panelHeight = this.panel.offsetHeight || 500;
    const currentLeft = parseFloat(this.panel.style.left);
    const currentTop = parseFloat(this.panel.style.top);
    if (!isNaN(currentLeft) && !isNaN(currentTop)) {
      const maxLeft = Math.max(MARGIN, window.innerWidth - panelWidth - MARGIN);
      const maxTop = Math.max(MARGIN, window.innerHeight - panelHeight - MARGIN);
      const clampedLeft = Math.max(MARGIN, Math.min(currentLeft, maxLeft));
      const clampedTop = Math.max(MARGIN, Math.min(currentTop, maxTop));
      this.setPanelPos(clampedLeft, clampedTop);
    }
  }

  // ==============================================================
  // TỰ ĐỘNG ĐẶT VỊ TRÍ CỬA SỔ CHAT THÔNG MINH GẦN NÚT NỔI
  // ==============================================================
  positionPanelNearToggle(forceDefault = false) {
    const MARGIN = 12;
    const wasHidden = this.panel.hidden;
    if (wasHidden) {
      this.panel.style.visibility = 'hidden';
      this.panel.hidden = false;
    }
    const panelWidth = this.panel.offsetWidth || Math.min(384, window.innerWidth - 24);
    const panelHeight = this.panel.offsetHeight || Math.min(544, window.innerHeight - 80);
    if (wasHidden) {
      this.panel.hidden = true;
      this.panel.style.visibility = '';
    }

    if (forceDefault) {
      // Ghim về góc dưới phải mặc định
      const defaultLeft = Math.max(MARGIN, window.innerWidth - panelWidth - MARGIN);
      const defaultTop = Math.max(MARGIN, window.innerHeight - panelHeight - 80);
      this.setPanelPos(defaultLeft, defaultTop);
      return;
    }

    // Tự động tính toán vị trí đẹp nhất gần nút Hỏi Mèo Toán
    const btnRect = this.toggleButton.getBoundingClientRect();
    let targetLeft = btnRect.right - panelWidth;
    let targetTop = btnRect.top - panelHeight - 12;

    // Nếu phía trên không đủ khoảng trống thì đưa xuống phía dưới nút
    if (targetTop < MARGIN) {
      if (window.innerHeight - btnRect.bottom - MARGIN >= panelHeight) {
        targetTop = btnRect.bottom + 12;
      } else {
        targetTop = Math.max(MARGIN, (window.innerHeight - panelHeight) / 2);
      }
    }

    // Nếu mép trái bị tràn thì căn lề trái với nút
    if (targetLeft < MARGIN) {
      targetLeft = btnRect.left;
    }

    // Giới hạn trong viewport
    targetLeft = Math.max(MARGIN, Math.min(targetLeft, window.innerWidth - panelWidth - MARGIN));
    targetTop = Math.max(MARGIN, Math.min(targetTop, window.innerHeight - panelHeight - MARGIN));

    this.setPanelPos(targetLeft, targetTop);
  }

  // ==============================================================
  // NÚT GHIM / RESET VỊ TRÍ KHUNG CHAT VỀ MẶC ĐỊNH
  // ==============================================================
  initDockButton() {
    this.dockButton = document.getElementById('math-chat-dock');
    if (!this.dockButton) return;

    this.dockButton.addEventListener('click', (e) => {
      e.stopPropagation();
      localStorage.removeItem('math_chat_panel_pos');
      this.positionPanelNearToggle(true);

      if (typeof app !== 'undefined' && typeof app.showToast === 'function') {
        const msg = typeof i18n !== 'undefined' && i18n.currentLang === 'en'
          ? 'Chat window docked to default position'
          : 'Đã ghim khung chat về góc mặc định';
        app.showToast('VỊ TRÍ CHAT', msg, '📌');
      }
    });
  }

  renderInitialMath() {
    if (this.messages && window.renderMathInElement) {
      try {
        window.renderMathInElement(this.messages, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false },
            { left: '\\(', right: '\\)', display: false },
            { left: '\\[', right: '\\]', display: true }
          ],
          throwOnError: false
        });
      } catch (e) {
        console.warn('Lỗi hiển thị KaTeX ban đầu:', e);
      }
    }
  }

  resetChat() {
    this.history = [];
    this.messages.innerHTML = `
      <div class="chat-message chat-message-bot">
        Chào bạn! Mình có thể giải thích kiến thức Toán cơ bản và gợi ý cách áp dụng vào đời sống. Bạn thử hỏi về phần trăm, phương trình, hình học hoặc thống kê nhé 🌸
      </div>
    `;
    this.renderInitialMath();
    this.input.value = '';
    this.input.focus();
  }

  setOpen(isOpen) {
    this.panel.hidden = !isOpen;
    this.toggleButton.setAttribute('aria-expanded', String(isOpen));
    if (isOpen) {
      let hasRestored = false;
      try {
        const saved = localStorage.getItem('math_chat_panel_pos');
        if (saved) {
          const { left, top } = JSON.parse(saved);
          if (typeof left === 'number' && typeof top === 'number') {
            const MARGIN = 10;
            const panelWidth = this.panel.offsetWidth || 380;
            const panelHeight = this.panel.offsetHeight || 500;
            const maxLeft = Math.max(MARGIN, window.innerWidth - panelWidth - MARGIN);
            const maxTop = Math.max(MARGIN, window.innerHeight - panelHeight - MARGIN);
            const clampedLeft = Math.max(MARGIN, Math.min(left, maxLeft));
            const clampedTop = Math.max(MARGIN, Math.min(top, maxTop));
            this.setPanelPos(clampedLeft, clampedTop);
            hasRestored = true;
          }
        }
      } catch (_) {}

      if (!hasRestored) {
        this.positionPanelNearToggle();
      }

      this.input.focus();
    }
  }

  async submitQuestion(question) {
    const text = question.trim();
    if (!text || this.isSending) return;

    this.addMessage(text, 'user');
    this.input.value = '';
    this.setSending(true);
    const loadingMessage = this.addMessage('Mèo đang suy nghĩ...', 'bot');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...this.history, { role: 'user', text }].slice(-11)
        })
      });

      let result = null;
      const rawText = await response.text();
      try {
        result = JSON.parse(rawText);
      } catch (_) {
        throw new Error('Đường truyền mạng đang chậm, bạn bấm gửi lại giúp Mèo nhé!');
      }

      if (!response.ok || !result) {
        throw new Error((result && result.error) || `Máy chủ phản hồi mã ${response.status}.`);
      }
      if (typeof result.answer !== 'string' || !result.answer.trim()) {
        throw new Error('Mèo đang tập trung suy nghĩ, bạn gửi lại câu hỏi giúp Mèo nhé!');
      }

      this.updateMessageContent(loadingMessage, result.answer, 'bot');
      this.history.push(
        { role: 'user', text: text.slice(0, 2000) },
        { role: 'model', text: result.answer.slice(0, 3000) }
      );
      this.history = this.history.slice(-10);
    } catch (error) {
      this.updateMessageContent(
        loadingMessage,
        `Mèo Toán: ${error.message}`,
        'bot'
      );
    } finally {
      this.setSending(false);
      this.input.focus();
      this.messages.scrollTop = this.messages.scrollHeight;
    }
  }

  setSending(isSending) {
    this.isSending = isSending;
    this.input.disabled = isSending;
    this.submitButton.disabled = isSending;
    this.submitButton.textContent = isSending ? '...' : 'Gửi';
    document.querySelectorAll('.chat-suggestion').forEach(button => {
      button.disabled = isSending;
    });
  }

  addMessage(content, sender) {
    const message = document.createElement('div');
    message.className = `chat-message chat-message-${sender}`;
    this.updateMessageContent(message, content, sender);
    this.messages.appendChild(message);
    this.messages.scrollTop = this.messages.scrollHeight;
    return message;
  }

  updateMessageContent(element, content, sender) {
    if (sender === 'user') {
      element.textContent = content;
    } else {
      element.innerHTML = this.formatMathAndMarkdown(content);
      if (window.renderMathInElement) {
        try {
          window.renderMathInElement(element, {
            delimiters: [
              { left: '$$', right: '$$', display: true },
              { left: '$', right: '$', display: false },
              { left: '\\(', right: '\\)', display: false },
              { left: '\\[', right: '\\]', display: true }
            ],
            throwOnError: false
          });
        } catch (e) {
          console.warn('KaTeX render warning:', e);
        }
      } else if (window.MathJax && typeof window.MathJax.typesetPromise === 'function') {
        try {
          window.MathJax.typesetPromise([element]).catch(() => {});
        } catch (e) {}
      }
    }
    this.messages.scrollTop = this.messages.scrollHeight;
  }

  formatMathAndMarkdown(text) {
    if (!text) return '';

    // 1. Trích xuất và bảo vệ công thức toán học KaTeX trước khi định dạng Markdown
    const mathItems = [];
    let processed = text;

    // Công thức khối $$...$$ hoặc \[...\]
    processed = processed.replace(/\$\$([\s\S]*?)\$\$/g, (_, tex) => {
      const id = `@@MATH_BLOCK_${mathItems.length}@@`;
      mathItems.push({ id, tex: tex.trim(), display: true });
      return id;
    });
    processed = processed.replace(/\\\[([\s\S]*?)\\\]/g, (_, tex) => {
      const id = `@@MATH_BLOCK_${mathItems.length}@@`;
      mathItems.push({ id, tex: tex.trim(), display: true });
      return id;
    });

    // Công thức trong dòng $...$ hoặc \(...\)
    processed = processed.replace(/\$([^\$\n\r]+?)\$/g, (_, tex) => {
      const id = `@@MATH_INLINE_${mathItems.length}@@`;
      mathItems.push({ id, tex: tex.trim(), display: false });
      return id;
    });
    processed = processed.replace(/\\\(([\s\S]*?)\\\)/g, (_, tex) => {
      const id = `@@MATH_INLINE_${mathItems.length}@@`;
      mathItems.push({ id, tex: tex.trim(), display: false });
      return id;
    });

    // 2. Thoát HTML an toàn
    let html = processed
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // 3. Định dạng Markdown
    // Khối mã code block
    html = html.replace(/```([a-z]*)\n([\s\S]*?)```/g, '<pre class="chat-code-block"><code>$2</code></pre>');
    // Mã trong dòng
    html = html.replace(/`([^`\n]+?)`/g, '<code class="chat-code">$1</code>');

    // Tiêu đề
    html = html.replace(/^###\s+(.+)$/gm, '<h4 class="chat-heading">$1</h4>');
    html = html.replace(/^##\s+(.+)$/gm, '<h3 class="chat-heading text-base">$1</h3>');

    // Trích dẫn blockquote: > ...
    html = html.replace(/^>\s+(.+)$/gm, '<blockquote class="chat-blockquote">$1</blockquote>');

    // Chữ đậm: **...** hoặc __...__
    html = html.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__([^_]+?)__/g, '<strong>$1</strong>');

    // Chữ nghiêng: *...*
    html = html.replace(/(^|[^\*])\*([^\*\n]+?)\*([^\*]|$)/g, '$1<em>$2</em>$3');

    // Danh sách gạch đầu dòng: * hoặc -
    html = html.replace(/^[*-]\s+(.+)$/gm, '<div class="chat-bullet-item"><span class="chat-bullet">•</span><span class="chat-bullet-text">$1</span></div>');

    // Danh sách số: 1. 2. 3.
    html = html.replace(/^(\d+)\.\s+(.+)$/gm, '<div class="chat-bullet-item"><span class="chat-bullet font-semibold">$1.</span><span class="chat-bullet-text">$2</span></div>');

    // Chuyển dấu xuống dòng thành <br>
    html = html.replace(/\n/g, '<br>');
    // Dọn bớt khoảng trống thừa sau thẻ khối
    html = html.replace(/<\/div><br>/g, '</div>');
    html = html.replace(/<\/pre><br>/g, '</pre>');
    html = html.replace(/<\/blockquote><br>/g, '</blockquote>');
    html = html.replace(/<\/h([34])><br>/g, '</h$1>');

    // 4. Khôi phục và kết xuất công thức toán học KaTeX chuẩn đẹp
    for (const item of mathItems) {
      let rendered = '';
      if (window.katex && typeof window.katex.renderToString === 'function') {
        try {
          rendered = window.katex.renderToString(item.tex, {
            displayMode: item.display,
            throwOnError: false
          });
        } catch (e) {
          rendered = item.display ? `$$${item.tex}$$` : `$${item.tex}$`;
        }
      } else {
        rendered = item.display ? `$$${item.tex}$$` : `$${item.tex}$`;
      }

      if (item.display) {
        rendered = `<div class="chat-math-block">${rendered}</div>`;
      }
      html = html.replace(item.id, () => rendered);
    }

    return html;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.mathChatbot = new MathChatbot();
  });
} else {
  window.mathChatbot = new MathChatbot();
}
