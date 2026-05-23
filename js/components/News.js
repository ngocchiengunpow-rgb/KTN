import { VimEduDB } from '../db.js';

export async function mockDownloadThesis(id) {
  const appInstance = window.vimEduAppInstance;
  if (appInstance) {
    appInstance.showToast("Tải tài liệu thành công!", "Tệp PDF khóa luận tham khảo đang được tải về...", "success");
    await VimEduDB.awardXP(2, "Tải khóa luận tốt nghiệp khóa trước tham khảo");
  }
}

export async function renderNews(app, outlet) {
  app.updateHeader("Tin Tức & Cổng Nghiên Cứu", "Thông báo học vụ, đăng ký đề tài Nghiên cứu khoa học sinh viên & Khóa luận tốt nghiệp");

  let [newsList, researchList, thesisList] = await Promise.all([
    VimEduDB.getNews(),
    VimEduDB.getResearch(),
    VimEduDB.getThesis()
  ]);

  outlet.innerHTML = `
    <!-- Sub headers tabs navigation -->
    <div class="subject-tabs animated-fade" style="margin-bottom:24px;">
      <button class="subject-tab-btn active" id="news-tab-trigger">Tin tức &amp; Học bổng</button>
      <button class="subject-tab-btn" id="nckh-tab-trigger">Cổng đăng ký NCKH</button>
      <button class="subject-tab-btn" id="kltn-tab-trigger">Khóa luận tốt nghiệp (KLTN)</button>
    </div>

    <div id="news-portal-content" class="animated-fade"></div>
  `;

  const portalContent = document.getElementById("news-portal-content");

  const showNewsSubTab = () => {
    portalContent.innerHTML = `
      <div class="news-grid animated-fade">
        ${newsList.map(news => `
          <div class="glass-card news-card animated-fade">
            <div class="news-meta">
              <span class="badge ${news.category === 'Thông báo' ? 'badge-danger' : news.category === 'Học bổng' ? 'badge-gold' : 'badge-navy'}">${news.category}</span>
              <span>${news.date}</span>
            </div>
            <h3 class="news-title">${app.escapeHTML(news.title)}</h3>
            <p class="news-summary">${app.escapeHTML(news.summary)}</p>
            
            <div class="news-footer">
              <span class="news-author">${news.author}</span>
              <span class="news-readmore-btn" data-id="${news.id}">Xem chi tiết &rarr;</span>
            </div>
          </div>
        `).join("")}
      </div>

      <!-- News Details overlay modal container -->
      <div class="glass-card animated-fade" id="news-details-overlay" style="display:none; margin-top:24px;"></div>
    `;

    // Read more binds
    document.querySelectorAll(".news-readmore-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const news = newsList.find(n => n.id === id);
        if (news) {
          const overlay = document.getElementById("news-details-overlay");
          overlay.style.display = "block";
          overlay.scrollIntoView({ behavior: 'smooth' });

          overlay.innerHTML = `
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border-color); padding-bottom:12px; margin-bottom:16px;">
              <span class="badge badge-navy">${news.category}</span>
              <span style="font-size:12px; color:var(--text-muted);">${news.date}</span>
            </div>
            <h2 style="font-family:var(--font-title); font-size:22px; font-weight:800; color:var(--text-primary); margin-bottom:16px;">${app.escapeHTML(news.title)}</h2>
            <div style="font-size:14.5px; line-height:1.7; color:var(--text-primary); white-space:pre-line; margin-bottom:24px;">${app.escapeHTML(news.content)}</div>
            
            <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-color); padding-top:16px;">
              <span style="font-size:13px; font-weight:600; color:var(--text-secondary);">Người đăng: ${news.author}</span>
              <button class="btn btn-secondary" id="btn-close-news">Đóng chi tiết</button>
            </div>
          `;

          document.getElementById("btn-close-news").addEventListener("click", () => {
            overlay.style.display = "none";
          });
        }
      });
    });
  };

  const showNCKHSubTab = () => {
    portalContent.innerHTML = `
      <div class="portal-layout animated-fade">
        <!-- Left: active research works lists -->
        <div class="portal-list-container">
          <h3 style="font-family:var(--font-title); font-weight:700; font-size:16px;">Đề tài Nghiên cứu khoa học sinh viên đang thực hiện</h3>
          
          ${researchList.map(res => `
            <div class="glass-card portal-item-card ${res.status === 'Approved' ? 'approved' : 'under-review'} animated-fade">
              <div class="portal-item-header">
                <h4 class="portal-item-title">${app.escapeHTML(res.title)}</h4>
                <span class="badge ${res.status === 'Approved' ? 'badge-success' : 'badge-warning'}">
                  ${res.status === 'Approved' ? 'Đã duyệt' : 'Đang xét duyệt'}
                </span>
              </div>
              <div class="portal-item-meta">
                <span>👤 Sinh viên: <strong>${app.escapeHTML(res.studentName)}</strong></span>
                <span>🎓 Hướng dẫn: <strong>${app.escapeHTML(res.advisor)}</strong></span>
                <span>📅 Năm học: ${res.year}</span>
              </div>
              <p class="portal-item-abstract">
                <strong>Tóm tắt đề cương:</strong> ${app.escapeHTML(res.abstract)}
              </p>
            </div>
          `).join("")}
        </div>

        <!-- Right: Registration Form sticky box -->
        <div>
          <div class="glass-card portal-form-sticky">
            <h3 style="font-family:var(--font-title); font-weight:700; margin-bottom:16px; font-size:16px;">Đăng ký đề tài NCKH trực tuyến</h3>
            <form id="nckh-register-form" onsubmit="return false;">
              <div class="form-group">
                <label class="form-label" for="nckh-title">Tên đề tài nghiên cứu *</label>
                <input class="form-input" type="text" id="nckh-title" placeholder="Nhập tên đề tài nghiên cứu" required>
              </div>
              <div class="form-group">
                <label class="form-label" for="nckh-students">Nhóm sinh viên thực hiện (Phân tách bằng dấu phẩy) *</label>
                <input class="form-input" type="text" id="nckh-students" placeholder="e.g. Nguyễn Văn A, Trần Văn B" required>
              </div>
              <div class="form-group">
                <label class="form-label" for="nckh-advisor">Giảng viên hướng dẫn khoa học *</label>
                <input class="form-input" type="text" id="nckh-advisor" placeholder="e.g. TS. Nguyễn Thị Hồng Vân" required>
              </div>
              <div class="form-group">
                <label class="form-label" for="nckh-abstract">Tóm tắt đề cương sơ bộ (Tối thiểu 100 từ) *</label>
                <textarea class="form-textarea" id="nckh-abstract" rows="4" placeholder="Mô tả lý do chọn đề tài, mục tiêu, và phương pháp nghiên cứu dự kiến..." required></textarea>
              </div>
              <button type="submit" class="btn btn-primary" style="width:100%;">Gửi đăng ký & xét duyệt (+10 XP)</button>
            </form>
          </div>
        </div>
      </div>
    `;

    // NCKH Submit handle
    document.getElementById("nckh-register-form").addEventListener("submit", async () => {
      const title = document.getElementById("nckh-title").value;
      const students = document.getElementById("nckh-students").value;
      const advisor = document.getElementById("nckh-advisor").value;
      const abstract = document.getElementById("nckh-abstract").value;

      if (abstract.length < 50) {
        app.showToast("Lỗi đăng ký!", "Tóm tắt đề cương quá ngắn! Hãy viết chi tiết hơn.", "error");
        return;
      }

      const res = await VimEduDB.registerResearch(title, students, advisor, abstract);
      if (res.success) {
        app.triggerConfetti();
        app.showToast("Gửi đăng ký thành công!", "Hệ thống đã ghi nhận đề xuất đề tài của bạn. Chờ Hội đồng Khoa duyệt.", "success");
        researchList = await VimEduDB.getResearch();
        showNCKHSubTab();
      }
    });
  };

  const showKLTNSubTab = () => {
    portalContent.innerHTML = `
      <div class="portal-layout animated-fade">
        <!-- Left: archived theses lists -->
        <div class="portal-list-container">
          <h3 style="font-family:var(--font-title); font-weight:700; font-size:16px;">Kho luận văn / Khóa luận tốt nghiệp KLTN các khóa trước tham khảo</h3>
          
          ${thesisList.map(the => `
            <div class="glass-card portal-item-card approved animated-fade">
              <div class="portal-item-header">
                <h4 class="portal-item-title">${app.escapeHTML(the.title)}</h4>
                <span class="badge badge-navy" style="font-size:10px;">Điểm: ${the.grade}</span>
              </div>
              <div class="portal-item-meta">
                <span>👤 Sinh viên thực hiện: <strong>${app.escapeHTML(the.studentName)}</strong></span>
                <span>🎓 Giảng viên hướng dẫn: <strong>${app.escapeHTML(the.advisor)}</strong></span>
                <span>📅 Năm hoàn thành: ${the.year}</span>
              </div>
              <p class="portal-item-abstract">
                <strong>Tóm tắt khóa luận:</strong> ${app.escapeHTML(the.abstract)}
              </p>
              <div style="display:flex; justify-content:flex-end; margin-top:8px;">
                <button class="btn btn-secondary" style="font-size:11px; padding:6px 12px;" onclick="VimEduApp.mockDownloadThesis('${the.id}')">📥 Tải PDF tham khảo</button>
              </div>
            </div>
          `).join("")}
        </div>

        <!-- Right: Guidance and Form triggers -->
        <div>
          <div class="glass-card">
            <h3 style="font-family:var(--font-title); font-weight:700; margin-bottom:12px; font-size:16px;">Cổng đăng ký điều kiện KLTN</h3>
            <p style="font-size:13px; line-height:1.6; color:var(--text-secondary); margin-bottom:16px;">
              Theo quy chế đào tạo VMU, sinh viên chuyên ngành KTNT được đăng ký Khóa luận tốt nghiệp (6 tín chỉ) nếu thỏa mãn điều kiện:
            </p>
            <ul style="padding-left:16px; font-size:12.5px; color:var(--text-secondary); display:flex; flex-direction:column; gap:6px; margin-bottom:16px;">
              <li>✔️ GPA tích lũy sau 7 học kỳ đạt tối thiểu <strong>2.50 / 4.0</strong></li>
              <li>✔️ Không bị kỷ luật hoặc cảnh cáo học vụ</li>
              <li>✔️ Tích lũy tối thiểu 110 tín chỉ bắt buộc</li>
            </ul>
            
            <button class="btn btn-primary" style="width:100%;" id="btn-reg-thesis-check">Kiểm tra &amp; Đăng ký KLTN K63</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById("btn-reg-thesis-check").addEventListener("click", () => {
      const user = VimEduDB.getCurrentUser();
      if (user.xpPoints < 500) {
        app.showToast("Không đủ điều kiện!", "Lượng XP học trình của bạn chưa đạt chỉ tiêu thẩm định tự động (Tối thiểu 500 XP). Hãy tích lũy thêm bằng cách làm bài tập và đọc lý thuyết!", "error");
      } else {
        app.showToast("Chúc mừng!", "Bạn đủ điều kiện làm khóa luận! Hệ thống đã tự động gửi phiếu đăng ký chọn GVHD hướng dẫn cho bạn.", "success");
      }
    });
  };

  // Sub tabs events binds
  const tabs = [
    { btn: "news-tab-trigger", fn: showNewsSubTab },
    { btn: "nckh-tab-trigger", fn: showNCKHSubTab },
    { btn: "kltn-tab-trigger", fn: showKLTNSubTab }
  ];

  tabs.forEach(t => {
    const btn = document.getElementById(t.btn);
    btn.addEventListener("click", () => {
      document.querySelectorAll(".subject-tabs button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      t.fn();
    });
  });

  // Default load news
  showNewsSubTab();
}
