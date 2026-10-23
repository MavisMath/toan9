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

    this.bindEvents();
    this.renderInitialMath();
  }

  bindEvents() {
    this.toggleButton.addEventListener('click', () => this.setOpen(this.panel.hidden));
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
    if (isOpen) this.input.focus();
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
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Máy chủ trả về lỗi ${response.status}.`);
      }
      if (typeof result.answer !== 'string' || !result.answer.trim()) {
        throw new Error('Chatbot chưa nhận được câu trả lời hợp lệ.');
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
        `Không gửi được câu hỏi: ${error.message} Nếu bạn đang mở trực tiếp file HTML, hãy chạy Chay_Trang_Web.bat để dùng chatbot.`,
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
    html = html.replace(/<\/h[34]><br>/g, '</h$1>');

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
