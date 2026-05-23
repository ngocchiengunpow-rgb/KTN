import { VimEduDB } from './db.js';
import { VimEduAI } from './ai.js';
import { renderDashboard } from './components/Dashboard.js';
import { renderSubjects, renderSubjectDetail } from './components/Subjects.js';
import { renderForum, renderThreadDetail } from './components/Forum.js';
import { renderLeaderboard } from './components/Leaderboard.js';
import { renderDocuments } from './components/Documents.js';
import { renderNews, mockDownloadThesis } from './components/News.js';
import { renderAdmin, mockAdminEdit, mockAdminDelete } from './components/Admin.js';

// Application State orchestrator
class VimEduApp {
  constructor() {
    this.activePage = "dashboard";
    this.theme = "light";
    this.quizTimer = null;
    this.quizTimeRemaining = 0; // seconds
    this.activeSubjectCode = null;
    this.activeChapterIdx = 0;
    this.activeFlashcardIdx = 0;
    
    // Bind Event Listeners
    window.addEventListener("hashchange", () => this.handleRouting());
    document.addEventListener("DOMContentLoaded", () => this.initApp());
  }

  async initApp() {
    // Wait for DB initialization to complete connection test
    await VimEduDB.init();

    // Check Theme preference
    const savedTheme = localStorage.getItem("vimedu_theme") || "light";
    this.setTheme(savedTheme);
    document.getElementById("theme-toggle").addEventListener("click", () => this.toggleTheme());

    // Notification dropdown toggles
    const bell = document.getElementById("notif-bell");
    const dropdown = document.getElementById("notif-dropdown-box");
    bell.addEventListener("click", async (e) => {
      e.stopPropagation();
      dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
      if (dropdown.style.display === "block") {
        await VimEduDB.markNotificationsRead();
        await this.updateNotificationBadge();
        await this.renderNotificationList();
      }
    });

    document.addEventListener("click", () => {
      dropdown.style.display = "none";
    });

    document.getElementById("notif-mark-read").addEventListener("click", async (e) => {
      e.stopPropagation();
      await VimEduDB.markNotificationsRead();
      await this.renderNotificationList();
      await this.updateNotificationBadge();
    });

    // Auth Actions triggers
    document.getElementById("go-register").addEventListener("click", () => this.showAuthCard("register"));
    document.getElementById("go-login").addEventListener("click", () => this.showAuthCard("login"));
    document.getElementById("go-forgot").addEventListener("click", () => this.showAuthCard("forgot"));
    document.getElementById("forgot-back-login").addEventListener("click", () => this.showAuthCard("login"));

    document.getElementById("login-form").addEventListener("submit", (e) => this.handleLogin(e));
    document.getElementById("register-form").addEventListener("submit", (e) => this.handleRegister(e));
    document.getElementById("forgot-form").addEventListener("submit", (e) => this.handleForgotPassword(e));
    document.getElementById("sidebar-logout").addEventListener("click", () => this.handleLogout());

    // Boot navigation and routing
    this.handleRouting();
    await this.updateNotificationBadge();
    await this.renderNotificationList();

    // Start 15s notification polling
    this.seenNotificationIds = null;
    setInterval(() => this.checkNotificationsInterval(), 15000);

    // Connection Status initialization
    this.updateConnectionStatus(VimEduDB.isServerConnected);
    window.addEventListener('online', () => this.handleNetworkChange(true));
    window.addEventListener('offline', () => this.handleNetworkChange(false));
  }

  // Theme Management
  setTheme(theme) {
    this.theme = theme;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("vimedu_theme", theme);
    
    const themeIcon = document.getElementById("theme-icon");
    if (theme === "dark") {
      themeIcon.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>`;
    } else {
      themeIcon.innerHTML = `<path d="M12 3v1M12 20v1M4.22 4.22l.7.7M18.36 18.36l.7.7M1 12h1M20 12h1M4.22 19.78l.7-.7M18.36 5.64l.7-.7M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z"/>`;
    }
  }

  toggleTheme() {
    this.setTheme(this.theme === "light" ? "dark" : "light");
  }

  // Toast System Alerts
  showToast(title, message, type = "info") {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast-alert ${type}`;
    toast.innerHTML = `
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
      <div class="toast-close">&times;</div>
    `;
    
    // Close click
    toast.querySelector(".toast-close").addEventListener("click", () => toast.remove());
    container.appendChild(toast);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 4500);
  }

  // Notification UI
  async updateNotificationBadge() {
    const list = await VimEduDB.getNotifications();
    const unread = list.filter(n => !n.read).length;
    const badge = document.getElementById("notif-bell-badge");
    if (unread > 0) {
      badge.style.display = "block";
      badge.textContent = unread > 9 ? "9+" : unread;
    } else {
      badge.style.display = "none";
    }
  }

  async renderNotificationList() {
    const list = await VimEduDB.getNotifications();
    const listView = document.getElementById("notif-list-view");
    if (list.length === 0) {
      listView.innerHTML = `<li class="notif-item" style="text-align:center; color:var(--text-secondary); font-size:12px;">Không có thông báo mới</li>`;
      return;
    }
    
    const categoryEmojis = {
      forum: "💬",
      document: "📄",
      quiz: "🎓",
      research: "🔬",
      system: "⚙️"
    };

    listView.innerHTML = list.map(n => {
      const emoji = categoryEmojis[n.category] || "⚙️";
      return `
        <li class="notif-item ${n.read ? '' : 'unread'}" style="display: flex; align-items: flex-start; gap: 10px; padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,0.05);">
          <div class="notif-item-emoji" style="font-size: 18px; margin-top: 2px;">${emoji}</div>
          <div style="flex: 1;">
            <div class="notif-item-title" style="font-weight: 600; margin-bottom: 2px; line-height: 1.3;">${this.escapeHTML(n.title)}</div>
            <div class="notif-item-desc" style="font-size: 12.5px; color: var(--text-secondary); margin-bottom: 4px; line-height: 1.4; white-space: normal;">${this.escapeHTML(n.message)}</div>
            <div class="notif-item-time" style="font-size: 11px; color: var(--text-muted);">${this.formatRelativeTime(n.timestamp)}</div>
          </div>
        </li>
      `;
    }).join("");
  }

  async checkNotificationsInterval() {
    const currentUser = VimEduDB.getCurrentUser();
    if (!currentUser) {
      this.seenNotificationIds = null;
      return;
    }

    try {
      const currentNotifications = await VimEduDB.getNotifications();
      
      if (!this.seenNotificationIds) {
        this.seenNotificationIds = new Set(currentNotifications.map(n => n.id));
        return;
      }

      let hasNew = false;
      // Loop backwards to show toasts chronologically
      for (let i = currentNotifications.length - 1; i >= 0; i--) {
        const n = currentNotifications[i];
        if (!this.seenNotificationIds.has(n.id)) {
          this.seenNotificationIds.add(n.id);
          if (!n.read) {
            let toastType = "info";
            if (n.category === "quiz") toastType = "success";
            else if (n.category === "research") toastType = "success";
            else if (n.category === "forum") toastType = "info";
            
            this.showToast(n.title, n.message, toastType);
            hasNew = true;
          }
        }
      }

      if (hasNew) {
        await this.updateNotificationBadge();
        await this.renderNotificationList();
      }
    } catch (err) {
      console.error("Error in checkNotificationsInterval:", err);
    }
  }

  // Auth Card Toggles
  showAuthCard(cardName) {
    document.getElementById("login-card").style.display = cardName === "login" ? "block" : "none";
    document.getElementById("register-card").style.display = cardName === "register" ? "block" : "none";
    document.getElementById("forgot-card").style.display = cardName === "forgot" ? "block" : "none";
  }

  // Auth Submissions Handle
  async handleLogin(e) {
    e.preventDefault();
    const msv = document.getElementById("login-msv").value;
    const pass = document.getElementById("login-password").value;
    const res = await VimEduDB.login(msv, pass);
    if (res.success) {
      this.showToast("Đăng nhập thành công!", `Chào mừng quay trở lại, ${res.user.fullName}.`, "success");
      this.handleRouting();
    } else {
      this.showToast("Lỗi đăng nhập!", res.message, "error");
    }
  }

  async handleRegister(e) {
    e.preventDefault();
    const msv = document.getElementById("reg-msv").value;
    const name = document.getElementById("reg-name").value;
    const email = document.getElementById("reg-email").value;
    const pass = document.getElementById("reg-password").value;
    const cohort = document.getElementById("reg-cohort").value;

    if (pass.length < 8) {
      this.showToast("Lỗi đăng ký!", "Mật khẩu phải dài tối thiểu 8 ký tự!", "error");
      return;
    }

    const res = await VimEduDB.register(msv, name, email, pass, cohort);
    if (res.success) {
      this.showToast("Đăng ký thành công!", "Tài khoản của bạn đã được kích hoạt trên hệ thống.", "success");
      this.handleRouting();
    } else {
      this.showToast("Lỗi đăng ký!", res.message, "error");
    }
  }

  handleForgotPassword(e) {
    e.preventDefault();
    const msv = document.getElementById("forgot-msv").value;
    const email = document.getElementById("forgot-email").value;
    this.showToast("Yêu cầu thành công!", `Đã gửi hướng dẫn khôi phục mật khẩu vào hòm thư ${email}. Hạn 30 phút.`, "success");
    this.showAuthCard("login");
  }

  handleLogout() {
    VimEduDB.logout();
    this.showToast("Đã đăng xuất!", "Bạn đã thoát khỏi tài khoản an toàn.", "warning");
    this.handleRouting();
  }

  // Routing Handler
  async handleRouting() {
    const currentUser = VimEduDB.getCurrentUser();
    const hash = window.location.hash || "#/dashboard";

    if (!currentUser) {
      document.getElementById("app-layout").style.display = "none";
      document.getElementById("auth-layout").style.display = "flex";
      this.showAuthCard("login");
      return;
    }

    // Toggle main container views
    document.getElementById("auth-layout").style.display = "none";
    document.getElementById("app-layout").style.display = "flex";

    // Set Sidebar User Info
    document.getElementById("sidebar-fullname").textContent = currentUser.fullName;
    document.getElementById("sidebar-cohort").textContent = currentUser.cohort;
    document.getElementById("sidebar-avatar").src = currentUser.avatarUrl;
    document.getElementById("sidebar-xp-mini").textContent = `${currentUser.xpPoints || 0} XP`;

    // Dynamic Admin sidebar view link
    const adminLink = document.getElementById("sidebar-admin-link");
    if (currentUser.role === 'admin' || currentUser.role === 'teacher') {
      adminLink.style.display = "block";
    } else {
      adminLink.style.display = "none";
    }

    // Clear active timers
    if (this.quizTimer) {
      clearInterval(this.quizTimer);
      this.quizTimer = null;
    }

    // Match screens routers
    const route = hash.replace("#/", "");
    const parts = route.split("/");
    const screen = parts[0];

    // Sidebar highlight syncs
    document.querySelectorAll(".nav-item").forEach(item => {
      item.classList.toggle("active", item.getAttribute("data-page") === screen);
    });

    const outlet = document.getElementById("screen-outlet");
    if (!outlet) return;
    outlet.innerHTML = ""; // reset outlet contents

    if (screen === "dashboard") {
      await this.renderDashboard(outlet);
    } else if (screen === "subjects") {
      if (parts[1]) {
        await this.renderSubjectDetail(outlet, parts[1]);
      } else {
        await this.renderSubjects(outlet);
      }
    } else if (screen === "forum") {
      if (parts[1] === "thread" && parts[2]) {
        await this.renderThreadDetail(outlet, parts[2]);
      } else {
        await this.renderForum(outlet);
      }
    } else if (screen === "leaderboard") {
      await this.renderLeaderboard(outlet);
    } else if (screen === "documents") {
      await this.renderDocuments(outlet);
    } else if (screen === "news") {
      await this.renderNews(outlet);
    } else if (screen === "admin") {
      await this.renderAdmin(outlet);
    } else {
      await this.renderDashboard(outlet);
    }
  }

  // SCREEN RENDER DELEGATES
  async renderDashboard(outlet) {
    await renderDashboard(this, outlet);
  }

  async renderSubjects(outlet) {
    await renderSubjects(this, outlet);
  }

  async renderSubjectDetail(outlet, code) {
    await renderSubjectDetail(this, outlet, code);
  }

  async renderForum(outlet) {
    await renderForum(this, outlet);
  }

  async renderThreadDetail(outlet, id) {
    await renderThreadDetail(this, outlet, id);
  }

  async renderLeaderboard(outlet) {
    await renderLeaderboard(this, outlet);
  }

  async renderDocuments(outlet) {
    await renderDocuments(this, outlet);
  }

  async renderNews(outlet) {
    await renderNews(this, outlet);
  }

  async renderAdmin(outlet) {
    await renderAdmin(this, outlet);
  }

  static mockDownloadThesis(id) {
    mockDownloadThesis(id);
  }

  static mockAdminEdit(msv) {
    mockAdminEdit(msv);
  }

  static mockAdminDelete(msv) {
    mockAdminDelete(msv);
  }

  // UTILITIES
  updateHeader(title, subtitle) {
    document.getElementById("view-title").textContent = title;
    document.getElementById("view-subtitle").textContent = subtitle;
  }

  escapeHTML(str) {
    if (!str) return "";
    return str.toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  triggerConfetti() {
    let overlay = document.getElementById("confetti-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "confetti-overlay";
      overlay.className = "confetti-canvas-overlay";
      document.body.appendChild(overlay);
    }

    const colors = [
      "#FFB800", // vmu-gold
      "#002855", // vmu-navy
      "#10B981", // success emerald
      "#3B82F6", // info blue
      "#EF4444", // red
      "#EC4899", // pink
      "#8B5CF6"  // purple
    ];

    for (let i = 0; i < 120; i++) {
      const particle = document.createElement("div");
      particle.className = "confetti-particle";
      
      const color = colors[Math.floor(Math.random() * colors.length)];
      const left = Math.random() * 100;
      const size = Math.random() * 8 + 6;
      const delay = Math.random() * 2;
      const duration = Math.random() * 2 + 2;
      const opacity = Math.random() * 0.5 + 0.5;

      particle.style.backgroundColor = color;
      particle.style.left = `${left}%`;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.animationDelay = `${delay}s`;
      particle.style.animationDuration = `${duration}s`;
      particle.style.opacity = opacity;
      particle.style.transform = `rotate(${Math.random() * 360}deg)`;

      if (Math.random() < 0.3) {
        particle.style.borderRadius = "50%";
      } else {
        particle.style.borderRadius = `${Math.random() * 4}px`;
      }

      overlay.appendChild(particle);

      setTimeout(() => {
        particle.remove();
      }, (delay + duration) * 1000);
    }

    setTimeout(() => {
      if (overlay && overlay.children.length === 0) {
        overlay.remove();
      }
    }, 6000);
  }

  processBlockquote(lines) {
    if (lines.length === 0) return "";
    const firstLine = lines[0].trim();
    
    const alertMap = {
      '[!IMPORTANT]': {
        class: 'badge-danger',
        title: 'QUAN TRỌNG',
        bg: 'rgba(239, 68, 68, 0.05)',
        border: 'var(--color-danger)'
      },
      '[!TIP]': {
        class: 'badge-gold',
        title: 'MẸO ÔN THI',
        bg: 'rgba(255, 184, 0, 0.05)',
        border: 'var(--vmu-gold)'
      },
      '[!NOTE]': {
        class: 'badge-info',
        title: 'GHI CHÚ',
        bg: 'rgba(59, 130, 246, 0.05)',
        border: '#3b82f6'
      },
      '[!WARNING]': {
        class: 'badge-warning',
        title: 'CẢNH BÁO',
        bg: 'rgba(245, 158, 11, 0.05)',
        border: '#f59e0b'
      },
      '[!CAUTION]': {
        class: 'badge-danger',
        title: 'THẬN TRỌNG',
        bg: 'rgba(220, 38, 38, 0.05)',
        border: '#dc2626'
      }
    };

    if (alertMap[firstLine]) {
      const alert = alertMap[firstLine];
      const content = lines.slice(1).join('\n');
      return `<div class="badge ${alert.class}" style="margin-bottom:8px; display:inline-block;">${alert.title}</div>` +
             `<div style="background:${alert.bg}; border-left: 4px solid ${alert.border}; padding:12px; border-radius:0 6px 6px 0; margin-bottom:12px; font-size:13.5px; line-height:1.6;">${content}</div>`;
    }

    return `<blockquote style="border-left: 4px solid var(--border-color); padding-left: 12px; margin: 12px 0; color: var(--text-secondary); font-style: italic;">${lines.join('\n')}</blockquote>`;
  }

  formatMarkdown(text) {
    if (!text) return "";
    
    // Handle code blocks first to protect their content
    const codeBlocks = [];
    let html = text.replace(/```([a-zA-Z0-9]*)\n([\s\S]*?)\n```/g, (match, lang, code) => {
      const escapedCode = this.escapeHTML(code);
      codeBlocks.push(`<pre><code class="language-${lang || 'plaintext'}">${escapedCode}</code></pre>`);
      return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
    });

    // Now escape the rest of the text
    html = this.escapeHTML(html);

    // Restore code blocks
    codeBlocks.forEach((block, idx) => {
      html = html.replace(new RegExp(`__CODE_BLOCK_${idx}__`, 'g'), block);
    });

    // Headings
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Bold / Strong
    html = html.replace(/\*\*(.*?)\*\"/g, '<strong>$1</strong>'); // Typo fix also! Let's make it standard: /\*\*(.*?)\*\*/g
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Inline code and math formulas
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    html = html.replace(/\$\$([^\$]+)\$\$/g, '<div style="font-family:var(--font-mono); text-align:center; background:var(--bg-primary); padding:6px; border-radius:4px; margin:6px 0;">$1</div>');

    // Handle Github alerts and standard blockquotes
    const lines = html.split('\n');
    let inBlockquote = false;
    let blockquoteLines = [];
    let newLines = [];

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      const isBlockquoteLine = line.trim().startsWith('&gt;');
      
      if (isBlockquoteLine) {
        if (!inBlockquote) {
          inBlockquote = true;
          blockquoteLines = [];
        }
        let content = line.trim().substring(4);
        if (content.startsWith(' ')) content = content.substring(1);
        blockquoteLines.push(content);
      } else {
        if (inBlockquote) {
          newLines.push(this.processBlockquote(blockquoteLines));
          inBlockquote = false;
        }
        newLines.push(line);
      }
    }
    if (inBlockquote) {
      newLines.push(this.processBlockquote(blockquoteLines));
    }
    
    html = newLines.join('\n');

    // Bullet points conversion
    const parsedLines = html.split('\n');
    let inList = false;
    for (let i = 0; i < parsedLines.length; i++) {
      let line = parsedLines[i];
      const isBullet = line.trim().startsWith('* ') || line.trim().startsWith('- ');
      if (isBullet) {
        const content = line.trim().substring(2);
        if (!inList) {
          inList = true;
          parsedLines[i] = `<ul><li>${content}</li>`;
        } else {
          parsedLines[i] = `<li>${content}</li>`;
        }
      } else {
        if (inList) {
          inList = false;
          parsedLines[i - 1] += '</ul>';
        }
      }
    }
    if (inList) {
      parsedLines[parsedLines.length - 1] += '</ul>';
    }
    html = parsedLines.join('\n');

    // Tables markdown rendering
    html = html.replace(/\| (.*?) \|/g, '<td>$1</td>');
    html = html.replace(/<td>(---|\:---|\:---\:)<\/td>/g, '');
    html = html.replace(/<tr>\s*<\/tr>/g, '');

    // Line breaks
    html = html.replace(/\n/g, '<br>');

    return html;
  }

  updateConnectionStatus(isConnected) {
    const badge = document.getElementById("connection-status-badge");
    if (!badge) return;

    const text = badge.querySelector(".status-text");

    if (isConnected && navigator.onLine) {
      badge.className = "connection-badge online";
      text.textContent = "🟢 Trực tuyến";
    } else {
      badge.className = "connection-badge offline";
      text.textContent = "🟠 Chế độ offline";
    }
  }

  async handleNetworkChange(isOnline) {
    if (isOnline) {
      try {
        const test = await fetch('/api/leaderboard', { method: 'GET' });
        if (test.ok) {
          VimEduDB.isServerConnected = true;
          this.updateConnectionStatus(true);
          this.showToast("Mạng trực tuyến!", "Hệ thống đã tự động kết nối lại với Cloud Backend Server.", "success");
          this.handleRouting();
          return;
        }
      } catch (e) {
        // Server down even if online
      }
      VimEduDB.isServerConnected = false;
      this.updateConnectionStatus(false);
      this.showToast("Đang ngoại tuyến!", "Đã kết nối Internet, nhưng API Server hiện tại đang offline. Tiếp tục chạy chế độ tự trị.", "warning");
    } else {
      VimEduDB.isServerConnected = false;
      this.updateConnectionStatus(false);
      this.showToast("Mất kết nối mạng!", "Đang chạy ở chế độ tự trị (Offline Mode). Tiến trình học tập của bạn được lưu an toàn cục bộ.", "warning");
    }
  }

  formatRelativeTime(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 1000 / 60);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;

    return date.toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}

// Bootstrap window globally for reference
const app = new VimEduApp();
window.vimEduAppInstance = app;
window.VimEduApp = VimEduApp;
