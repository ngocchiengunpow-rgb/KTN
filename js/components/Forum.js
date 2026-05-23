import { VimEduDB } from '../db.js';

export async function renderForum(app, outlet) {
  app.updateHeader("Diễn Đàn Thảo Luận", "Kênh hỏi đáp học thuật trao đổi kiến thức giữa Sinh viên & Giảng viên");

  // Extract query filter by subject
  const urlParams = new URLSearchParams(window.location.hash.split("?")[1] || "");
  const subjectFilter = urlParams.get("subject");

  const threads = await VimEduDB.getForumThreads(subjectFilter);
  const flatSubjects = VimEduDB.getSubjectsFlat().filter(s => s.credits >= 3); // key subjects

  outlet.innerHTML = `
    <div class="forum-actions-bar animated-fade">
      <div style="display:flex; gap:12px; flex-wrap:wrap;">
        <select class="form-select" id="forum-filter-subject" style="width:200px;">
          <option value="">-- Tất cả diễn đàn --</option>
          ${flatSubjects.map(sub => `
            <option value="${sub.code}" ${subjectFilter === sub.code ? 'selected' : ''}>${sub.name}</option>
          `).join("")}
        </select>
        <button class="btn btn-primary" id="btn-forum-new-thread">Đăng thread thảo luận (+10 XP)</button>
      </div>
      
      <input class="form-input forum-search-input" type="text" id="forum-search-text" placeholder="Tìm kiếm bài đăng...">
    </div>

    <!-- New Post Form Area (hidden by default) -->
    <div class="glass-card animated-fade" id="forum-new-post-panel" style="display:none; margin-bottom:24px;">
      <h3 style="font-family:var(--font-title); font-weight:700; margin-bottom:16px;">Tạo Thread Thảo Luận Mới</h3>
      <form id="forum-create-form" onsubmit="return false;">
        <div class="auth-grid-2">
          <div class="form-group">
            <label class="form-label" for="new-thread-subject">Chủ đề học phần</label>
            <select class="form-select" id="new-thread-subject">
              <option value="">Diễn đàn chung (Không theo môn)</option>
              ${flatSubjects.map(s => `<option value="${s.code}">${s.name}</option>`).join("")}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="new-thread-tags">Nhãn gắn thẻ</label>
            <select class="form-select" id="new-thread-tags">
              <option value="câu-hỏi">#câu-hỏi</option>
              <option value="chia-sẻ-tài-liệu">#chia-sẻ-tài-liệu</option>
              <option value="ôn-tập">#ôn-tập</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label" for="new-thread-title">Tiêu đề bài thảo luận *</label>
          <input class="form-input" type="text" id="new-thread-title" placeholder="Ghi tóm tắt thắc mắc (e.g. Hỏi cách phân loại FCL/LCL)" required>
        </div>
        <div class="form-group">
          <label class="form-label" for="new-thread-content">Nội dung chi tiết *</label>
          <textarea class="form-textarea" id="new-thread-content" rows="5" placeholder="Viết mô tả câu hỏi chi tiết để giảng viên và các bạn hỗ trợ giải đáp..." required></textarea>
        </div>
        <div style="display:flex; justify-content:flex-end; gap:12px;">
          <button class="btn btn-secondary" type="button" id="btn-cancel-thread">Hủy</button>
          <button class="btn btn-primary" type="submit">Đăng thread thảo luận</button>
        </div>
      </form>
    </div>

    <div class="thread-list animated-fade" id="forum-threads-list"></div>
  `;

  // Filter selects binds
  const filterSelect = document.getElementById("forum-filter-subject");
  filterSelect.addEventListener("change", () => {
    const val = filterSelect.value;
    if (val) {
      window.location.hash = `#/forum?subject=${val}`;
    } else {
      window.location.hash = `#/forum`;
    }
  });

  // Toggle creation form panel
  const newPanel = document.getElementById("forum-new-post-panel");
  document.getElementById("btn-forum-new-thread").addEventListener("click", () => {
    newPanel.style.display = newPanel.style.display === "block" ? "none" : "block";
  });

  document.getElementById("btn-cancel-thread").addEventListener("click", () => {
    newPanel.style.display = "none";
  });

  // Form submit creation handle
  document.getElementById("forum-create-form").addEventListener("submit", async () => {
    const sub = document.getElementById("new-thread-subject").value;
    const tag = document.getElementById("new-thread-tags").value;
    const title = document.getElementById("new-thread-title").value;
    const content = document.getElementById("new-thread-content").value;

    const res = await VimEduDB.createForumThread(sub || null, title, content, [tag]);
    if (res.success) {
      app.showToast("Đăng thread thành công!", "Thread thảo luận mới đã được đăng tải. Bạn nhận +10 XP.", "success");
      newPanel.style.display = "none";
      document.getElementById("forum-create-form").reset();
      app.handleRouting();
    }
  });

  // Render threads list
  const threadsContainer = document.getElementById("forum-threads-list");
  if (threads.length === 0) {
    threadsContainer.innerHTML = `<div class="glass-card" style="text-align:center; padding:40px; color:var(--text-secondary);">Chưa có bài thảo luận nào trong diễn đàn môn này. Hãy đặt câu hỏi thảo luận đầu tiên!</div>`;
    return;
  }

  threadsContainer.innerHTML = threads.map(th => `
    <div class="glass-card thread-item-card animated-fade" onclick="window.location.hash = '#/forum/thread/${th.id}'">
      
      <!-- Left: Upvotes -->
      <div class="thread-vote-widget" onclick="event.stopPropagation();">
        <button class="vote-arrow-btn up" data-id="${th.id}">▲</button>
        <span class="vote-tally" id="vote-tally-${th.id}">${th.upvotes}</span>
        <button class="vote-arrow-btn down" data-id="${th.id}">▼</button>
      </div>

      <!-- Right: Thread metadata details -->
      <div class="thread-main-content">
        <div class="thread-meta-top">
          <img class="thread-author-avatar" src="${th.authorAvatar}" alt="Avatar">
          <span class="thread-author-name">${app.escapeHTML(th.authorName)}</span>
          <span>&bull;</span>
          <span>${app.formatRelativeTime(th.createdAt)}</span>
          
          ${th.isPinned ? `<span class="pinned-badge">Ghim</span>` : ''}
          <span class="badge badge-navy" style="font-size: 9px; padding: 2px 8px;">${th.subjectName}</span>
        </div>

        <h3 class="thread-title">${app.escapeHTML(th.title)}</h3>
        <p class="thread-preview-text">${app.escapeHTML(th.content)}</p>

        <div class="thread-footer-meta">
          <div class="thread-tags-row">
            ${th.tags.map(t => `<span class="badge badge-gold" style="font-size:9px; padding:2px 8px;">#${t}</span>`).join("")}
          </div>
          
          <div class="thread-comment-count">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
            <span>${th.comments ? th.comments.length : 0} bình luận</span>
          </div>
        </div>
      </div>
    </div>
  `).join("");

  // Upvote listeners triggers
  document.querySelectorAll(".vote-arrow-btn.up").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      await VimEduDB.voteThread(id, 'up');
      const tally = document.getElementById(`vote-tally-${id}`);
      tally.textContent = parseInt(tally.textContent) + 1;
      btn.classList.add("active");
    });
  });

  document.querySelectorAll(".vote-arrow-btn.down").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      await VimEduDB.voteThread(id, 'down');
      const tally = document.getElementById(`vote-tally-${id}`);
      tally.textContent = Math.max(0, parseInt(tally.textContent) - 1);
      btn.classList.add("active");
    });
  });

  // Search bar filter binds
  const search = document.getElementById("forum-search-text");
  search.addEventListener("input", () => {
    const query = search.value.toLowerCase().trim();
    document.querySelectorAll(".thread-item-card").forEach(card => {
      const title = card.querySelector(".thread-title").textContent.toLowerCase();
      const body = card.querySelector(".thread-preview-text").textContent.toLowerCase();
      if (title.includes(query) || body.includes(query)) {
        card.style.display = "flex";
      } else {
        card.style.display = "none";
      }
    });
  });
}

export async function renderThreadDetail(app, outlet, id) {
  const thread = await VimEduDB.getForumThreadById(id);
  if (!thread) {
    outlet.innerHTML = `<div class="glass-card" style="text-align:center; padding:40px;">Bài viết không tồn tại!</div>`;
    return;
  }

  app.updateHeader("Thảo Luận Học Phần", `Quay lại diễn đàn môn học`);

  outlet.innerHTML = `
    <div class="subject-info-banner animated-fade" style="margin-bottom:24px;">
      <a class="btn btn-secondary" href="#/forum">
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
        Quay lại diễn đàn
      </a>
    </div>

    <!-- Thread main body card -->
    <div class="glass-card animated-fade">
      <div class="thread-meta-top">
        <img class="thread-author-avatar" src="${thread.authorAvatar}" alt="Avatar">
        <span class="thread-author-name">${app.escapeHTML(thread.authorName)}</span>
        <span>&bull;</span>
        <span>${app.formatRelativeTime(thread.createdAt)}</span>
        <span class="badge badge-navy">${thread.subjectName}</span>
      </div>
      <h2 style="font-family:var(--font-title); font-size:22px; font-weight:800; color:var(--text-primary); margin:12px 0;">${app.escapeHTML(thread.title)}</h2>
      <div class="thread-detail-body">${app.escapeHTML(thread.content)}</div>
      
      <div class="thread-footer-meta" style="border-top:1px solid var(--border-color); padding-top:16px;">
        <div class="thread-tags-row">
          ${thread.tags.map(t => `<span class="badge badge-gold">#${t}</span>`).join("")}
        </div>
        <span style="font-weight:600; font-size:13px; color:var(--text-secondary);">${thread.comments.length} bình luận đóng góp</span>
      </div>
    </div>

    <!-- Nested Comments Section -->
    <div class="comments-section animated-fade">
      <h3 style="font-family:var(--font-title); font-weight:700; margin-bottom:16px;">Ý kiến thảo luận</h3>
      
      <!-- Post comment box -->
      <div class="comment-input-box">
        <textarea class="form-textarea" id="new-comment-textarea" rows="3" placeholder="Viết đóng góp học thuật của bạn vào đây..."></textarea>
        <div style="display:flex; justify-content:flex-end;">
          <button class="btn btn-primary" id="btn-submit-comment">Gửi bình luận đóng góp (+5 XP)</button>
        </div>
      </div>

      <ul class="comments-list" id="comments-outlet-list"></ul>
    </div>
  `;

  // Render nested comments
  const listOutlet = document.getElementById("comments-outlet-list");
  
  const renderComments = () => {
    if (thread.comments.length === 0) {
      listOutlet.innerHTML = `<li style="text-align:center; padding:20px; color:var(--text-secondary); font-size:12.5px;">Chưa có bình luận đóng góp học tập nào. Hãy đóng góp kiến thức của bạn!</li>`;
      return;
    }

    listOutlet.innerHTML = thread.comments.map(c => `
      <li class="comment-item-node">
        <div class="comment-bubble ${c.isOfficial ? 'official' : ''}">
          <div class="comment-header">
            <div class="comment-author-info">
              <img class="comment-author-avatar" src="${c.authorAvatar}" alt="Avatar">
              <span class="comment-author-name">${app.escapeHTML(c.authorName)}</span>
              ${c.isOfficial ? `<span class="badge badge-navy" style="font-size:8px; padding:1px 6px;">Official</span>` : ''}
            </div>
            <span style="font-size:11px; color:var(--text-muted);">${app.formatRelativeTime(c.createdAt)}</span>
          </div>
          <p class="comment-text">${app.escapeHTML(c.content)}</p>
          
          <div class="comment-footer-actions">
            <span class="comment-action-btn" id="btn-comment-vote-${c.id}">▲ Hữu ích (${c.upvotes || 1})</span>
            <span class="comment-action-btn reply" data-id="${c.id}">↩ Phản hồi</span>
          </div>
        </div>

        <!-- Comment Replies level-2 (max 3 levels per SRS) -->
        ${c.replies ? `
          <div class="comment-replies">
            ${c.replies.map(r => `
              <div class="comment-bubble" style="padding:10px 14px; background:var(--bg-primary);">
                <div class="comment-header">
                  <div class="comment-author-info" style="font-size:12px;">
                    <img class="comment-author-avatar" style="width:20px; height:20px;" src="${r.authorAvatar}" alt="Avatar">
                    <span class="comment-author-name">${app.escapeHTML(r.authorName)}</span>
                  </div>
                  <span style="font-size:10px; color:var(--text-muted);">${app.formatRelativeTime(r.createdAt)}</span>
                </div>
                <p class="comment-text" style="font-size:13px;">${app.escapeHTML(r.content)}</p>
              </div>
            `).join("")}
          </div>
        ` : ''}
      </li>
    `).join("");

    // Bind Upvote Comment listeners
    thread.comments.forEach(c => {
      const btn = document.getElementById(`btn-comment-vote-${c.id}`);
      btn.addEventListener("click", async () => {
        c.upvotes += 1;
        btn.textContent = `▲ Hữu ích (${c.upvotes})`;
        await VimEduDB.awardXP(2, `Nhận phiếu bình chọn hữu ích về bình luận`);
      });
    });

    // Bind Reply hooks
    document.querySelectorAll(".comment-action-btn.reply").forEach(btn => {
      btn.addEventListener("click", async () => {
        const commentId = btn.getAttribute("data-id");
        const replyText = prompt("Nhập nội dung phản hồi bình luận:");
        if (replyText && replyText.trim() !== "") {
          const res = await VimEduDB.addComment(thread.id, replyText, commentId);
          if (res.success) {
            app.showToast("Gửi phản hồi thành công!", "Phản hồi của bạn đã được xuất bản.", "success");
            app.handleRouting();
          }
        }
      });
    });
  };

  renderComments();

  // Comment submission handles
  document.getElementById("btn-submit-comment").addEventListener("click", async () => {
    const txt = document.getElementById("new-comment-textarea").value.trim();
    if (!txt) return;

    const res = await VimEduDB.addComment(thread.id, txt);
    if (res.success) {
      app.showToast("Bình luận thành công!", "Nhận +5 XP vì đóng góp ý kiến thảo luận học thuật.", "success");
      document.getElementById("new-comment-textarea").value = "";
      app.handleRouting();
    }
  });
}
