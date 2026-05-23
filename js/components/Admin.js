import { VimEduDB } from '../db.js';

export function mockAdminEdit(msv) {
  const appInstance = window.vimEduAppInstance;
  if (appInstance) {
    alert(`[Mock] Sửa thông tin tài khoản ${msv}`);
  }
}

export function mockAdminDelete(msv) {
  const appInstance = window.vimEduAppInstance;
  if (appInstance) {
    appInstance.showToast("Khóa tài khoản thành công!", `Đã khóa truy cập tạm thời đối với tài khoản ${msv}.`, "warning");
  }
}

export async function renderAdmin(app, outlet) {
  app.updateHeader("Quản Trị Hệ Thống", "Cấu hình cổng kết nối AI, rate-limits và kiểm duyệt diễn đàn");

  const users = await VimEduDB.getUsers();
  const aiConfig = await VimEduDB.getAIConfig();

  outlet.innerHTML = `
    <div class="admin-grid animated-fade">
      <!-- Sidebar admin tabs menu -->
      <div class="admin-sidebar-menu">
        <button class="admin-menu-item active" id="admin-ai-tab">⚙️ Cấu hình trợ lý AI</button>
        <button class="admin-menu-item" id="admin-users-tab">👥 Danh sách người dùng (${users.length})</button>
      </div>

      <!-- Details active controls pane -->
      <div id="admin-detail-pane"></div>
    </div>
  `;

  const detailPane = document.getElementById("admin-detail-pane");

  const showAIConfigSub = () => {
    detailPane.innerHTML = `
      <div class="glass-card ai-config-card animated-fade">
        <h3 style="font-family:var(--font-title); font-weight:700; font-size:18px;">Kết nối API Trí Tuệ Nhân Tạo</h3>
        <p style="font-size:12.5px; color:var(--text-secondary);">
          Hỗ trợ cấu hình tích hợp khóa gọi trực tiếp (Client-Side REST calls) đến Google Gemini 1.5 Flash hoặc OpenAI. 
          Để trống API Key để sử dụng **Bộ mô phỏng học thuật ngoại thương** chạy không cần internet.
        </p>

        <form id="admin-ai-form" onsubmit="return false;" style="display:flex; flex-direction:column; gap:16px;">
          <div class="form-group">
            <label class="form-label">Chọn nhà cung cấp AI</label>
            <div class="api-toggle-group">
              <div class="api-toggle-card ${aiConfig.provider === 'gemini' ? 'active' : ''}" id="prov-gemini">
                <div class="api-toggle-icon">♊</div>
                <div class="api-toggle-label">Google Gemini API</div>
              </div>
              <div class="api-toggle-card ${aiConfig.provider === 'openai' ? 'active' : ''}" id="prov-openai">
                <div class="api-toggle-icon">🤖</div>
                <div class="api-toggle-label">OpenAI API Gateway</div>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="ai-apikey-input">API Token Key</label>
            <input class="form-input" style="font-family:var(--font-mono);" type="password" id="ai-apikey-input" value="${aiConfig.apiKey || ''}" placeholder="Dán API Key của bạn vào đây (e.g. AIzaSy...)">
          </div>

          <div class="form-group">
            <label class="form-label" for="ai-prompt-input">System Instruction Prompt</label>
            <textarea class="form-textarea" style="font-size:12.5px; line-height:1.5;" id="ai-prompt-input" rows="7">${aiConfig.systemPrompt}</textarea>
          </div>

          <div style="display:flex; justify-content:flex-end;">
            <button class="btn btn-primary" type="submit">Lưu Cấu Hình AI</button>
          </div>
        </form>
      </div>
    `;

    let providerVal = aiConfig.provider;

    document.getElementById("prov-gemini").addEventListener("click", () => {
      document.getElementById("prov-gemini").classList.add("active");
      document.getElementById("prov-openai").classList.remove("active");
      providerVal = "gemini";
    });

    document.getElementById("prov-openai").addEventListener("click", () => {
      document.getElementById("prov-openai").classList.add("active");
      document.getElementById("prov-gemini").classList.remove("active");
      providerVal = "openai";
    });

    // Submit save handles
    document.getElementById("admin-ai-form").addEventListener("submit", async () => {
      const key = document.getElementById("ai-apikey-input").value;
      const prompt = document.getElementById("ai-prompt-input").value;
      
      await VimEduDB.saveAIConfig(key, providerVal, prompt);
      app.showToast("Cấu hình AI đã lưu!", "Các thiết lập API key và system prompt đã được đồng bộ hóa thành công.", "success");
    });
  };

  const showUsersSub = () => {
    detailPane.innerHTML = `
      <div class="glass-card admin-table-card animated-fade">
        <div style="padding:20px; border-bottom:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center;">
          <h3 style="font-family:var(--font-title); font-weight:700; font-size:16px;">Tài khoản đăng ký trên hệ thống</h3>
          <span class="badge badge-navy">${users.length} tài khoản</span>
        </div>

        <table class="admin-table">
          <thead>
            <tr>
              <th>MSV / Tài khoản</th>
              <th>Họ và Tên đầy đủ</th>
              <th>Phân quyền</th>
              <th>Tích lũy</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            ${users.map(u => `
              <tr>
                <td style="font-family:var(--font-mono); font-weight:700;">${u.msv}</td>
                <td style="font-weight:600;">${app.escapeHTML(u.fullName)}</td>
                <td>
                  <span class="badge ${u.role === 'admin' ? 'badge-danger' : u.role === 'teacher' ? 'badge-navy' : 'badge-success'}">
                    ${u.role === 'admin' ? 'Admin' : u.role === 'teacher' ? 'Giảng viên' : 'Sinh viên'}
                  </span>
                </td>
                <td><strong>${u.xpPoints || 0} XP</strong></td>
                <td>
                  <button class="admin-action-btn edit" onclick="VimEduApp.mockAdminEdit('${u.msv}')">Sửa</button>
                  <button class="admin-action-btn delete" onclick="VimEduApp.mockAdminDelete('${u.msv}')">Khóa</button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  };

  // Sub triggers binds
  document.getElementById("admin-ai-tab").addEventListener("click", (e) => {
    document.querySelectorAll(".admin-sidebar-menu button").forEach(b => b.classList.remove("active"));
    e.target.classList.add("active");
    showAIConfigSub();
  });

  document.getElementById("admin-users-tab").addEventListener("click", (e) => {
    document.querySelectorAll(".admin-sidebar-menu button").forEach(b => b.classList.remove("active"));
    e.target.classList.add("active");
    showUsersSub();
  });

  // Default AI view
  showAIConfigSub();
}
