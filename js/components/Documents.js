import { VimEduDB } from '../db.js';

export async function renderDocuments(app, outlet) {
  app.updateHeader("Thư Viện Tài Liệu", "Tải tài liệu môn học nội bộ & Hướng dẫn liên kết Studocu");

  // Extract query filter by subject
  const urlParams = new URLSearchParams(window.location.hash.split("?")[1] || "");
  const subjectFilter = urlParams.get("subject");

  const documents = await VimEduDB.getDocuments(subjectFilter);
  const flatSubjects = VimEduDB.getSubjectsFlat().filter(s => s.credits >= 3);

  outlet.innerHTML = `
    <!-- Studocu Bypass Helper banner (Method A & B) -->
    <div class="studocu-helper-banner animated-fade">
      <h2>Cổng Hỗ Trợ Tải Tài Liệu Studocu</h2>
      <p>
        Do Studocu.com hiện đang bị giới hạn truy cập tại Việt Nam và không có API chính thức. 
        VimEdu cung cấp **Phương án A (Tải miễn phí hợp pháp)** và hệ thống liên kết an toàn không vi phạm bản quyền.
      </p>
      
      <div class="studocu-step-grid">
        <div class="studocu-step-card">
          <div class="studocu-step-num">1</div>
          <h4 class="studocu-step-title">Bypass Chặn Địa Lý</h4>
          <p class="studocu-step-desc">
            Sử dụng các VPN miễn phí như <code>Cloudflare 1.1.1.1</code> hoặc <code>ProtonVPN</code> để chuyển IP sang khu vực châu Âu/Mỹ để truy cập trực tiếp Studocu.com.
          </p>
        </div>

        <div class="studocu-step-card">
          <div class="studocu-step-num">2</div>
          <h4 class="studocu-step-title">Tải Premium miễn phí</h4>
          <p class="studocu-step-desc">
            Đăng nhập Studocu, chuẩn bị 1 file báo cáo môn học của riêng bạn (.pdf hoặc .docx), tải lên (Upload document) để được cấp quyền Premium tải miễn phí tài liệu của người khác trong 14 ngày.
          </p>
        </div>

        <div class="studocu-step-card">
          <div class="studocu-step-num">3</div>
          <h4 class="studocu-step-title">Kho Link Liên Kết</h4>
          <p class="studocu-step-desc">
            Danh mục tài liệu liên quan đến đề thi VMU được cán bộ lớp chọn lọc và ghim trực tiếp. An toàn tuyệt đối, không quảng cáo độc hại.
          </p>
        </div>
      </div>
    </div>

    <div class="docs-layout animated-fade">
      <!-- Folders tree left column -->
      <div class="docs-folder-tree">
        <h3 style="font-family:var(--font-title); font-weight:700; font-size:15px; margin-bottom:12px;">Môn học học kỳ</h3>
        <button class="docs-folder-item ${!subjectFilter ? 'active' : ''}" onclick="window.location.hash = '#/documents'">
          <span>📁</span> Tất cả tài liệu
        </button>
        ${flatSubjects.slice(0, 8).map(s => `
          <button class="docs-folder-item ${subjectFilter === s.code ? 'active' : ''}" onclick="window.location.hash = '#/documents?subject=${s.code}'" title="${s.name}">
            <span>📂</span> ${s.name.substring(0, 18)}...
          </button>
        `).join("")}
      </div>

      <!-- Files list grid table -->
      <div class="glass-card docs-files-card">
        <div style="padding:20px; border-bottom:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
          <h3 style="font-family:var(--font-title); font-weight:700; font-size:16px;">Danh mục tệp tài liệu nội bộ</h3>
          <button class="btn btn-primary" style="font-size:12px; padding:8px 16px;" id="btn-upload-doc">Tải lên tài liệu mới (+15 XP)</button>
        </div>

        <!-- Document Upload Modal box panel (hidden by default) -->
        <div style="display:none; padding:20px; border-bottom:1px solid var(--border-color);" id="doc-upload-panel">
          <h4 style="font-family:var(--font-title); font-weight:700; margin-bottom:12px;">Đóng góp tài liệu môn học</h4>
          <form id="doc-upload-form" onsubmit="return false;">
            <div class="auth-grid-2">
              <div class="form-group">
                <label class="form-label" for="up-doc-subject">Gắn vào môn học</label>
                <select class="form-select" id="up-doc-subject">
                  ${flatSubjects.map(s => `<option value="${s.code}">${s.name}</option>`).join("")}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="up-doc-cat">Phân loại tài liệu</label>
                <select class="form-select" id="up-doc-cat">
                  <option value="lecture">Bài giảng / Slide</option>
                  <option value="exam">Đề thi / Đáp án ôn thi</option>
                  <option value="exercise">Bài tập thực hành</option>
                  <option value="textbook">Giáo trình chính</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label" for="up-doc-title">Tiêu đề tài liệu *</label>
              <input class="form-input" type="text" id="up-doc-title" placeholder="e.g. Tổng hợp câu hỏi ôn tập Vi mô K64" required>
            </div>
            <div class="auth-grid-2">
              <div class="form-group">
                <label class="form-label" for="up-doc-type">Định dạng file</label>
                <select class="form-select" id="up-doc-type">
                  <option value="PDF">PDF</option>
                  <option value="DOCX">Word (.docx)</option>
                  <option value="XLSX">Excel (.xlsx)</option>
                  <option value="PPTX">PowerPoint (.pptx)</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="up-doc-size">Dung lượng giả định</label>
                <input class="form-input" type="text" id="up-doc-size" value="4.2 MB" required>
              </div>
            </div>
            <div style="display:flex; justify-content:flex-end; gap:12px;">
              <button class="btn btn-secondary" type="button" id="btn-cancel-doc">Hủy</button>
              <button class="btn btn-primary" type="submit">Đăng tài liệu</button>
            </div>
          </form>
        </div>

        <table class="docs-table">
          <thead>
            <tr>
              <th>Tên tài liệu</th>
              <th>Phân loại</th>
              <th>Kích thước</th>
              <th>Lượt tải</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody id="docs-outlet-tbody"></tbody>
        </table>
      </div>
    </div>
  `;

  // Toggle upload panels
  const upPanel = document.getElementById("doc-upload-panel");
  document.getElementById("btn-upload-doc").addEventListener("click", () => {
    upPanel.style.display = upPanel.style.display === "block" ? "none" : "block";
  });

  document.getElementById("btn-cancel-doc").addEventListener("click", () => {
    upPanel.style.display = "none";
  });

  // Form submission handle
  document.getElementById("doc-upload-form").addEventListener("submit", async () => {
    const sub = document.getElementById("up-doc-subject").value;
    const cat = document.getElementById("up-doc-cat").value;
    const title = document.getElementById("up-doc-title").value;
    const type = document.getElementById("up-doc-type").value;
    const size = document.getElementById("up-doc-size").value;

    const res = await VimEduDB.uploadDocument(sub, title, type, size, cat);
    if (res.success) {
      app.showToast("Tải lên thành công!", "Tài liệu đóng góp của bạn đã được duyệt xuất bản. Nhận +15 XP.", "success");
      upPanel.style.display = "none";
      document.getElementById("doc-upload-form").reset();
      app.handleRouting();
    }
  });

  // Render files lists
  const tbody = document.getElementById("docs-outlet-tbody");
  if (documents.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:40px; color:var(--text-secondary);">Chưa có tài liệu đóng góp nào cho môn học này. Hãy là người đầu tiên!</td></tr>`;
    return;
  }

  tbody.innerHTML = documents.map(doc => {
    let catLabel = "Bài giảng";
    let catClass = "badge-navy";
    if (doc.category === 'exam') { catLabel = "Đề thi"; catClass = "badge-danger"; }
    else if (doc.category === 'exercise') { catLabel = "Bài tập"; catClass = "badge-success"; }
    else if (doc.category === 'textbook') { catLabel = "Giáo trình"; catClass = "badge-warning"; }

    return `
      <tr>
        <td>
          <div class="doc-name-cell">
            <div class="doc-icon-badge ${doc.fileType.toLowerCase()}">${doc.fileType}</div>
            <div class="doc-title-text" title="${doc.title}">${app.escapeHTML(doc.title)}</div>
          </div>
        </td>
        <td>
          <span class="badge ${catClass}" style="font-size:9px;">${catLabel}</span>
        </td>
        <td style="font-weight:500; font-family:var(--font-mono); font-size:12px;">${doc.fileSize}</td>
        <td style="color:var(--text-muted); font-size:12.5px;">${doc.downloadCount} lượt tải</td>
        <td>
          <a class="doc-download-btn" href="#" data-id="${doc.id}">
            <span>💾</span> Tải về
          </a>
        </td>
      </tr>
    `;
  }).join("");

  // Download triggers listeners
  document.querySelectorAll(".doc-download-btn").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      const id = btn.getAttribute("data-id");
      app.showToast("Đang chuẩn bị file!", "Tệp tài liệu đang được giải nén và tải về thiết bị của bạn...", "success");
      await VimEduDB.awardXP(1, "Tải tài liệu tham khảo nội bộ");
    });
  });
}
