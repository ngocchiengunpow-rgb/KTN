import { VimEduDB } from '../db.js';
import { VimEduAI } from '../ai.js';

export async function renderSubjects(app, outlet) {
  app.updateHeader("Chương Trình Đào Tạo", "Môn học chuyên ngành Kinh tế Ngoại thương");

  const syllabus = VimEduDB.getSyllabus();
  
  // Flatten all subjects to fetch progress in parallel to avoid N+1 requests
  const flatSubjects = VimEduDB.getSubjectsFlat();
  const flatProgress = await Promise.all(flatSubjects.map(async s => {
    const p = await VimEduDB.getProgress(s.code);
    return { code: s.code, progress: p };
  }));
  
  outlet.innerHTML = `
    <div class="syllabus-center-container">
      <!-- Welcome progress banner -->
      <div class="glass-card syllabus-intro animated-fade">
        <div style="flex-grow:1;">
          <h2 style="font-family:var(--font-title); font-size:18px; font-weight:800; color:var(--vmu-navy); margin-bottom:6px;">Chương trình Đào tạo Ngoại thương chuẩn hóa</h2>
          <p style="font-size:12.5px; color:var(--text-secondary); max-width:680px; line-height:1.5;">
            Khung chương trình học tập 8 học kỳ được đồng bộ theo tiêu chuẩn đào tạo ngành **Kinh tế Ngoại thương - ĐH Hàng Hải Việt Nam (VMU)**. Hãy nhấp chọn học phần bên dưới để bắt đầu ôn tập lý thuyết, luyện tập trắc nghiệm và thảo luận học tập.
          </p>
        </div>
        <div class="badge badge-success" style="font-size:13px; font-weight:700; padding:10px 18px; border-radius:24px; align-self:center;">
          8 Học kỳ chủ chốt
        </div>
      </div>

      <!-- Syllabus loop by semester -->
      <div class="syllabus-semesters-list">
        ${syllabus.map(sem => {
          return `
            <div class="semester-section animated-fade">
              <h3 class="semester-title-header">${app.escapeHTML(sem.semesterName)}</h3>
              <div class="semester-subjects-grid">
                ${sem.subjects.map(sub => {
                  const progMatch = flatProgress.find(p => p.code === sub.code);
                  const prog = progMatch ? progMatch.progress : { theory: 0, practice: 0 };
                  const overall = Math.round((prog.theory + prog.practice) / 2);

                  return `
                    <div class="glass-card subject-card animated-fade">
                      <div class="subject-card-header">
                        <span class="subject-card-code">${app.escapeHTML(sub.code)}</span>
                        <span class="badge ${sub.type === 'đại cương' ? 'badge-info' : sub.type === 'cơ sở ngành' ? 'badge-warning' : 'badge-gold'}">
                          ${app.escapeHTML(sub.type.toUpperCase())}
                        </span>
                      </div>
                      <h4 class="subject-card-title">${app.escapeHTML(sub.name)}</h4>
                      <div class="subject-card-meta">
                        <span>📖 Tín chỉ: <strong>${sub.credits}</strong></span>
                        <span>📈 Tiến trình: <strong>${overall}%</strong></span>
                      </div>
                      
                      <div class="progress-bar-bg" style="height:4px; margin:10px 0 14px 0;">
                        <div class="progress-bar-fill" style="width: ${overall}%;"></div>
                      </div>

                      <a href="#/subjects/${sub.code}" class="btn btn-primary" style="font-size:12px; padding:8px; text-align:center; display:block; width:100%;">
                        Vào học phần
                      </a>
                    </div>
                  `;
                }).join("")}
              </div>
            </div>
          `;
        }).join("")}
      </div>
    </div>
  `;
}

export async function renderSubjectDetail(app, outlet, code) {
  const subject = VimEduDB.getSubjectByCode(code);
  if (!subject) {
    outlet.innerHTML = `<div class="glass-card" style="text-align:center; padding:40px;">Học phần không tồn tại!</div>`;
    return;
  }

  app.activeSubjectCode = code;
  app.activeChapterIdx = 0;
  app.activeFlashcardIdx = 0;

  app.updateHeader(subject.name, `${subject.code} - ${subject.type.toUpperCase()} | Tín chỉ: ${subject.credits}`);

  outlet.innerHTML = `
    <div class="subject-detail-container">
      <!-- Banner Actions -->
      <div class="subject-info-banner animated-fade">
        <a class="btn btn-secondary" href="#/subjects">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          Quay lại chương trình
        </a>
        <div style="display:flex; gap:12px;">
          <a class="btn btn-accent" href="#/forum?subject=${code}">Diễn đàn học phần</a>
          <a class="btn btn-primary" href="#/documents?subject=${code}">Xem tài liệu môn</a>
        </div>
      </div>

      <!-- Detail Navigation Tabs -->
      <div class="subject-tabs animated-fade">
        <button class="subject-tab-btn active" data-tab="theory">Ôn tập lý thuyết</button>
        <button class="subject-tab-btn" data-tab="practice">Luyện tập thực hành</button>
        <button class="subject-tab-btn" data-tab="ai-chat">Học cùng AI Chatbox</button>
      </div>

      <!-- Dynamic Content Section -->
      <div id="subject-tabs-content" class="animated-fade"></div>
    </div>
  `;

  // Listen to tab clicks
  document.querySelectorAll(".subject-tab-btn").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      document.querySelectorAll(".subject-tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const tab = btn.getAttribute("data-tab");
      await renderSubjectTab(app, tab);
    });
  });

  // Default tab
  await renderSubjectTab(app, "theory");
}

export async function renderSubjectTab(app, tab) {
  const container = document.getElementById("subject-tabs-content");
  if (!container) return;
  container.innerHTML = "";

  if (tab === "theory") {
    await renderTheoryTab(app, container);
  } else if (tab === "practice") {
    await renderPracticeTab(app, container);
  } else if (tab === "ai-chat") {
    await renderAIChatTab(app, container);
  }
}

export async function renderTheoryTab(app, container) {
  let chapters = [
    { title: "Chương 1: Tổng quan nhập môn", content: "<p>Nội dung đang được cập nhật bởi Giảng viên khoa Kinh tế.</p>" },
    { title: "Chương 2: Cơ sở lý thuyết nền tảng", content: "<p>Nội dung đang được cập nhật.</p>" }
  ];

  let flashcards = [
    { term: "Khái niệm", definition: "Nội dung định nghĩa thuật ngữ." }
  ];

  let youtubeEmbed = "https://www.youtube.com/embed/dQw4w9WgXcQ";

  if (app.activeSubjectCode === "21005") { // Kinh tế vi mô
    chapters = [
      {
        title: "Chương 1: Lý thuyết cung cầu cơ bản",
        content: `<h3>1. Đường Cung và Đường Cầu</h3>
          <p><strong>Cầu (Demand):</strong> Biểu thị lượng hàng hóa hoặc dịch vụ mà người mua sẵn sàng và có khả năng mua ở các mức giá khác nhau trong một khoảng thời gian nhất định.</p>
          <p><strong>Luật Cầu (Law of Demand):</strong> Khi giá bán tăng thì lượng cầu giảm, và ngược lại khi giá bán giảm thì lượng cầu tăng (ceteris paribus - các yếu tố khác không đổi).</p>
          <p><strong>Cung (Supply):</strong> Lượng hàng hóa mà người bán sẵn sàng sản xuất và bán ra thị trường ở các mức giá khác nhau.</p>
          <p><strong>Cân bằng thị trường:</strong> Điểm giao nhau của đường cung và cầu thiết lập giá cân bằng ($P^*$) và lượng cân bằng ($Q^*$).</p>`
      },
      {
        title: "Chương 2: Độ co giãn của cung và cầu",
        content: `<h3>1. Co giãn cầu theo giá</h3>
          <p>Đo lường mức độ phản ứng của lượng cầu khi giá bán thay đổi. Công thức tính co giãn điểm:</p>
          <p style="font-family:var(--font-mono); font-weight:700; color:var(--vmu-navy); background:var(--bg-primary); padding:10px; border-radius:6px; text-align:center;">EDp = (dQ/dP) * (P/Q)</p>
          <p>Độ co giãn giúp doanh nghiệp đưa ra chiến lược giá tối ưu. Nếu cầu co giãn nhiều (|ED| > 1), việc giảm giá sẽ tăng tổng doanh thu.</p>`
      }
    ];

    flashcards = [
      { term: "Cung & Cầu (Supply & Demand)", definition: "Mô hình xác định giá cả và sản lượng trên thị trường cạnh tranh hoàn hảo." },
      { term: "Co Giãn Điểm (Point Elasticity)", definition: "Độ co giãn tại một điểm cụ thể trên đường cầu: EDp = (dQ/dP) * (P/Q)." },
      { term: "Thặng dư tiêu dùng (Consumer Surplus)", definition: "Chênh lệch giữa mức giá tối đa người tiêu dùng sẵn sàng trả và mức giá thực tế họ phải trả." }
    ];
    youtubeEmbed = "https://www.youtube.com/embed/dQw4w9WgXcQ";
  } else if (app.activeSubjectCode === "21006") { // Thương mại quốc tế
    chapters = [
      {
        title: "Chương 1: Lý thuyết Lợi thế so sánh (David Ricardo)",
        content: `<h3>1. Học thuyết Lợi thế so sánh</h3>
          <p>David Ricardo chỉ ra rằng thương mại tự do mang lại lợi ích cho tất cả các quốc gia tham gia nếu mỗi quốc gia tập trung sản xuất và xuất khẩu hàng hóa mà mình có <strong>Lợi thế so sánh</strong>.</p>
          <p><strong>Định nghĩa:</strong> Một quốc gia có lợi thế so sánh trong việc sản xuất một sản phẩm nếu chi phí cơ hội để sản xuất sản phẩm đó thấp hơn so với quốc gia khác.</p>
          <p><strong>Bảng minh họa chi phí lao động để sản xuất 1 đơn vị hàng hóa:</strong></p>
          <table border="1" style="width:100%; border-collapse:collapse; margin:12px 0;">
            <thead><tr style="background:var(--bg-primary);"><th>Quốc gia</th><th>Rượu vang (giờ)</th><th>Vải (giờ)</th></tr></thead>
            <tbody>
              <tr><td>Bồ Đào Nha</td><td>80</td><td>90</td></tr>
              <tr><td>Anh Quốc</td><td>120</td><td>100</td></tr>
            </tbody>
          </table>`
      },
      {
        title: "Chương 2: Thuế quan và các biện pháp phi thuế quan",
        content: `<h3>1. Thuế quan (Tariffs)</h3>
          <p>Thuế đánh vào hàng hóa nhập khẩu khi đi qua biên giới hải quan của một quốc gia. Thuế quan làm tăng giá hàng hóa nhập khẩu, bảo hộ sản xuất trong nước và mang lại doanh thu cho ngân sách nhà nước.</p>
          <p><strong>Biện pháp phi thuế quan (NTBs):</strong> Hạn ngạch nhập khẩu (Quotas), Giấy phép, Hàng rào kỹ thuật (TBT), và các tiêu chuẩn vệ sinh dịch tễ (SPS).</p>`
      }
    ];

    flashcards = [
      { term: "Lợi thế so sánh (Comparative Advantage)", definition: "Khả năng sản xuất hàng hóa với chi phí cơ hội thấp hơn quốc gia đối tác thương mại." },
      { term: "Hạn ngạch nhập khẩu (Import Quotas)", definition: "Biện pháp phi thuế quan hạn chế số lượng hoặc trị giá hàng hóa tối đa được phép nhập khẩu trong một thời kỳ." },
      { term: "Chi phí cơ hội (Opportunity Cost)", definition: "Giá trị của cơ hội tốt nhất bị bỏ qua khi đưa ra một quyết định lựa chọn kinh tế." }
    ];
    youtubeEmbed = "https://www.youtube.com/embed/d3W47z9J4Jc";
  } else if (app.activeSubjectCode === "21008") { // Thanh toán quốc tế
    chapters = [
      {
        title: "Chương 1: Các phương thức thanh toán phổ biến",
        content: `<h3>1. Chuyển tiền (T/T - Telegraphic Transfer)</h3>
          <p>Phương thức thanh toán mà người mua yêu cầu ngân hàng của mình chuyển một số tiền nhất định cho người xuất khẩu thông qua hệ thống ngân hàng đại lý.</p>
          <p><strong>Tín dụng chứng từ (L/C - Letter of Credit):</strong> Phương thức thanh toán an toàn nhất trong thương mại quốc tế, trong đó ngân hàng phát hành cam kết trả tiền cho người xuất khẩu khi xuất trình bộ chứng từ hợp lệ.</p>`
      },
      {
        title: "Chương 2: Bộ chứng từ thương mại quốc tế",
        content: `<h3>1. Các loại chứng từ cốt lõi</h3>
          <ul>
            <li><strong>Hối phiếu thương mại (Bill of Exchange):</strong> Lệnh đòi tiền vô điều kiện do người xuất khẩu ký phát gửi người nhập khẩu hoặc ngân hàng.</li>
            <li><strong>Hóa đơn thương mại (Commercial Invoice):</strong> Yêu cầu thanh toán của người bán, ghi nhận lượng hàng và giá trị giao dịch.</li>
            <li><strong>Vận đơn đường biển (Bill of Lading):</strong> Chứng từ xác nhận nhận hàng, bằng chứng hợp đồng vận chuyển và chứng từ sở hữu hàng hóa.</li>
          </ul>`
      }
    ];

    flashcards = [
      { term: "UCP 600", definition: "Quy tắc và Thực hành thống nhất về Tín dụng chứng từ do ICC ban hành năm 2007." },
      { term: "L/C (Letter of Credit)", definition: "Thư tín dụng - cam kết trả tiền bằng văn bản của ngân hàng phát hành đối với người xuất khẩu khi xuất trình bộ chứng từ hợp lệ." },
      { term: "Vận đơn sạch (Clean B/L)", definition: "Vận đơn không chứa bất kỳ điều khoản ghi chú xấu nào tuyên bố tình trạng khuyết tật của hàng hóa hay bao bì." }
    ];
    youtubeEmbed = "https://www.youtube.com/embed/2_O6eZc5t0w";
  } else {
    youtubeEmbed = "https://www.youtube.com/embed/dQw4w9WgXcQ";
  }

  container.innerHTML = `
    <div class="theory-layout">
      <!-- Sidebar Navigation Chapters -->
      <div class="theory-sidebar" id="theory-chapters-nav"></div>

      <!-- Active Chapter Details -->
      <div class="theory-viewer">
        <div class="glass-card" id="theory-text-card">
          <h2 style="font-family:var(--font-title); margin-bottom:16px;" id="chapter-title">Tiêu đề chương</h2>
          <div class="theory-content" id="chapter-body">Nội dung chương...</div>
          
          <div style="margin-top: 24px; display:flex; justify-content:flex-end;">
            <button class="btn btn-primary" id="btn-mark-chapter-read">Đã đọc chương này (+10 XP)</button>
          </div>
        </div>

        <!-- Video Embed card -->
        <div class="glass-card">
          <h3 style="font-family:var(--font-title); margin-bottom:12px; font-weight:700;">Bài giảng Video</h3>
          <div style="position:relative; width:100%; height:0; padding-bottom:56.25%;">
            <iframe style="position:absolute; top:0; left:0; width:100%; height:100%; border-radius:var(--radius-md);" 
                    src="${youtubeEmbed}" title="Video player" frameborder="0" allowfullscreen></iframe>
          </div>
        </div>

        <!-- Term Flashcards Carousel -->
        <div class="glass-card">
          <h3 style="font-family:var(--font-title); font-weight:700;">Thuật ngữ thẻ nhớ (Flashcards)</h3>
          <p style="font-size:12px; color:var(--text-secondary);">Nhấp vào thẻ để lật mặt sau giải nghĩa. Đánh giá độ thuộc để tích lũy điểm học tập.</p>
          
          <div class="flashcards-container">
            <div class="flashcard-scene">
              <div class="flashcard" id="active-flashcard">
                <div class="flashcard-face flashcard-front">
                  <h4 id="fc-term">Thuật ngữ</h4>
                </div>
                <div class="flashcard-face flashcard-back">
                  <p id="fc-def">Định nghĩa</p>
                </div>
              </div>
            </div>
            <div class="flashcard-controls">
              <button class="btn btn-secondary" id="fc-prev">Trước</button>
              <span style="align-self:center; font-weight:600; font-size:14px;" id="fc-counter">1/3</span>
              <button class="btn btn-secondary" id="fc-next">Tiếp theo</button>
            </div>
            <div style="display:flex; gap:12px; margin-top:8px;">
              <button class="btn btn-accent" style="font-size:11px; padding:6px 12px;" id="btn-fc-easy">Thuộc lòng (+5 XP)</button>
              <button class="btn btn-secondary" style="font-size:11px; padding:6px 12px;" id="btn-fc-hard">Chưa thuộc</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Render chapters buttons in sidebar
  const nav = document.getElementById("theory-chapters-nav");
  nav.innerHTML = chapters.map((ch, idx) => `
    <button class="theory-chapter-btn ${idx === app.activeChapterIdx ? 'active' : ''}" data-idx="${idx}">
      ${app.escapeHTML(ch.title)}
    </button>
  `).join("");

  // Update active chapter text display
  const updateChapterText = () => {
    const active = chapters[app.activeChapterIdx];
    document.getElementById("chapter-title").textContent = active.title;
    document.getElementById("chapter-body").innerHTML = active.content;

    // Highlight active in sidebar
    document.querySelectorAll(".theory-chapter-btn").forEach((b, i) => {
      b.classList.toggle("active", i === app.activeChapterIdx);
    });
  };

  // Add navigation listeners
  document.querySelectorAll(".theory-chapter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      app.activeChapterIdx = parseInt(btn.getAttribute("data-idx"));
      updateChapterText();
    });
  });

  updateChapterText();

  // Mark as read listener
  document.getElementById("btn-mark-chapter-read").addEventListener("click", async () => {
    await VimEduDB.awardXP(10, `Đọc ôn lý thuyết chương ${app.activeChapterIdx + 1} môn ${app.activeSubjectCode}`);
    app.showToast("Hoàn thành bài lý thuyết!", "Bạn được nhận +10 XP đóng góp.", "success");
    
    // Update progress metrics
    const prev = await VimEduDB.getProgress(app.activeSubjectCode);
    const computedProg = Math.max(prev.theory, Math.min(100, Math.round(((app.activeChapterIdx + 1) / chapters.length) * 100)));
    await VimEduDB.updateProgress(app.activeSubjectCode, 'theory', computedProg);

    if (computedProg === 100 && prev.theory < 100) {
      app.triggerConfetti();
      app.showToast("Chúc mừng!", "Bạn đã hoàn thành toàn bộ lý thuyết môn học này!", "success");
    }
  });

  // Flashcard setup
  const card = document.getElementById("active-flashcard");
  card.addEventListener("click", () => {
    card.classList.toggle("is-flipped");
  });

  const updateFlashcardText = () => {
    const active = flashcards[app.activeFlashcardIdx];
    document.getElementById("fc-term").textContent = active.term;
    document.getElementById("fc-def").textContent = active.definition;
    document.getElementById("fc-counter").textContent = `${app.activeFlashcardIdx + 1} / ${flashcards.length}`;
    card.classList.remove("is-flipped");
  };

  document.getElementById("fc-prev").addEventListener("click", () => {
    if (app.activeFlashcardIdx > 0) {
      app.activeFlashcardIdx -= 1;
      updateFlashcardText();
    }
  });

  document.getElementById("fc-next").addEventListener("click", () => {
    if (app.activeFlashcardIdx < flashcards.length - 1) {
      app.activeFlashcardIdx += 1;
      updateFlashcardText();
    }
  });

  document.getElementById("btn-fc-easy").addEventListener("click", async () => {
    await VimEduDB.awardXP(5, `Ghi nhớ tốt thuật ngữ "${flashcards[app.activeFlashcardIdx].term}" môn ${app.activeSubjectCode}`);
    app.showToast("Ghi nhớ thành công!", "+5 XP đã được cộng vào tài khoản của bạn.", "success");
    if (app.activeFlashcardIdx < flashcards.length - 1) {
      app.activeFlashcardIdx += 1;
      updateFlashcardText();
    }
  });

  document.getElementById("btn-fc-hard").addEventListener("click", () => {
    app.showToast("Luyện tập thêm", "Đã đánh dấu để ôn lại sau.", "info");
    card.classList.toggle("is-flipped");
  });

  updateFlashcardText();
}

export function renderPracticeTab(app, container) {
  const quizzes = VimEduDB.getQuizzes(app.activeSubjectCode);
  const caseStudy = VimEduDB.getCaseStudy(app.activeSubjectCode);

  container.innerHTML = `
    <div class="practice-split-view">
      <!-- Left column: Timed Quiz Center -->
      <div class="glass-card">
        <h3 style="font-family:var(--font-title); font-weight:700; margin-bottom:6px;">Trắc nghiệm Luyện tập Tính giờ</h3>
        <p style="font-size:12.5px; color:var(--text-secondary); margin-bottom:16px;">
          Bộ câu hỏi trắc nghiệm khách quan đa dạng (MCQ, chọn nhiều đáp án, điền từ vào chỗ trống) với thời gian làm bài giới hạn.
        </p>

        ${quizzes.length === 0 ? `
          <div style="text-align:center; padding:32px 0; color:var(--text-muted); font-size:13px;">
            Môn học này hiện chưa được cập nhật ngân hàng đề trắc nghiệm!
          </div>
        ` : `
          <div class="quiz-info-dashboard">
            <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
              <span>Tổng số câu hỏi: <strong>${quizzes.length} câu</strong></span>
              <span>Thời gian làm bài: <strong>10 phút</strong></span>
            </div>
            <button class="btn btn-accent" style="width:100%; font-weight:700;" id="btn-start-quiz">
              Bắt đầu làm bài thi luyện tập
            </button>
          </div>
        `}

        <!-- Dynamic playing outlet -->
        <div id="quiz-playing-outlet" class="glass-card animated-fade" style="display:none; margin-top:20px; background:var(--bg-primary);">
          <!-- Dynamic quiz render content -->
        </div>
      </div>

      <!-- Right column: Practical Case Study uploads -->
      <div class="glass-card">
        <h3 style="font-family:var(--font-title); font-weight:700; margin-bottom:6px;">Tình huống Thực tế & Case Study</h3>
        <p style="font-size:12.5px; color:var(--text-secondary); margin-bottom:16px;">
          Đề bài mô phỏng tình huống doanh nghiệp, yêu cầu xử lý hồ sơ chứng từ, tính toán chi phí xuất nhập khẩu thực tế.
        </p>

        ${!caseStudy ? `
          <div style="text-align:center; padding:32px 0; color:var(--text-muted); font-size:13px;">
            Học phần này hiện chưa có bài tập tình huống được giao!
          </div>
        ` : `
          <div class="case-study-box" style="display:flex; flex-direction:column; gap:12px;">
            <span class="badge badge-gold" style="align-self:flex-start;">Thực hành +${caseStudy.xpReward} XP</span>
            <h3 style="font-family:var(--font-title); font-size:15px; font-weight:700;">${app.escapeHTML(caseStudy.title)}</h3>
            <p style="font-size:13px; line-height:1.5; color:var(--text-secondary);">
              ${app.escapeHTML(caseStudy.description)}
            </p>
            <div style="background:var(--bg-primary); padding:10px 14px; border-radius:6px;">
              <span style="font-size:12.5px; font-weight:700; color:var(--vmu-navy); display:block; margin-bottom:6px;">Yêu cầu bài nộp:</span>
              <ul style="font-size:12px; color:var(--text-secondary); padding-left:16px; margin:0; line-height:1.6;">
                ${caseStudy.requirements.map(req => `<li>${app.escapeHTML(req)}</li>`).join("")}
              </ul>
            </div>
            
            <!-- File Drag and Drop Box -->
            <div class="drag-drop-zone" id="cs-drag-zone">
              <span style="font-size:24px; margin-bottom:4px;">📤</span>
              <span style="font-size:12.5px; font-weight:600; color:var(--text-primary);">Kéo thả file bài làm tại đây</span>
              <span style="font-size:11.5px; color:var(--text-muted);">hoặc nhấp chuột để tải lên</span>
              <span style="font-size:11px; color:var(--text-muted); margin-top:4px;">Chấp nhận file PDF, DOCX, XLSX (Tối đa ${caseStudy.maxFileSize})</span>
              <input type="file" id="cs-file-input" style="display:none;">
            </div>

            <!-- Uploaded file info container -->
            <div id="cs-upload-info" style="display:none; margin-top:8px;"></div>
          </div>
        `}
      </div>
    </div>
  `;

  // Quiz start trigger
  if (quizzes.length > 0) {
    document.getElementById("btn-start-quiz").addEventListener("click", () => {
      startQuizSession(app, quizzes);
    });
  }

  // Case Study Drag and Drop event setups
  if (caseStudy) {
    const zone = document.getElementById("cs-drag-zone");
    const input = document.getElementById("cs-file-input");
    const info = document.getElementById("cs-upload-info");

    zone.addEventListener("click", () => input.click());
    zone.addEventListener("dragover", (e) => {
      e.preventDefault();
      zone.classList.add("dragover");
    });
    zone.addEventListener("dragleave", () => {
      zone.classList.remove("dragover");
    });
    zone.addEventListener("drop", (e) => {
      e.preventDefault();
      zone.classList.remove("dragover");
      if (e.dataTransfer.files.length > 0) {
        handleCaseStudyFile(app, e.dataTransfer.files[0], info);
      }
    });

    input.addEventListener("change", () => {
      if (input.files.length > 0) {
        handleCaseStudyFile(app, input.files[0], info);
      }
    });
  }
}

export function handleCaseStudyFile(app, file, infoContainer) {
  infoContainer.style.display = "block";
  infoContainer.innerHTML = `
    <div class="uploaded-file-info">
      <span style="font-size:20px;">📄</span>
      <div style="flex-grow:1; font-size:12.5px;">
        <div style="font-weight:600; color:var(--text-primary);">${app.escapeHTML(file.name)}</div>
        <div style="color:var(--text-muted);">${(file.size / 1024 / 1024).toFixed(2)} MB</div>
      </div>
      <button class="btn btn-primary" style="font-size:11px; padding:6px 12px;" id="btn-submit-case-study">Nộp bài (+30 XP)</button>
    </div>
  `;

  document.getElementById("btn-submit-case-study").addEventListener("click", async () => {
    await VimEduDB.awardXP(30, `Nộp thành công bài tập tình huống thực tế môn ${app.activeSubjectCode}`);
    app.triggerConfetti();
    app.showToast("Nộp bài thành công!", "Giảng viên đã nhận được bài làm của bạn. Bạn được cộng +30 XP.", "success");
    infoContainer.style.display = "none";
    
    // Update practice progress
    const prev = await VimEduDB.getProgress(app.activeSubjectCode);
    await VimEduDB.updateProgress(app.activeSubjectCode, 'practice', Math.max(prev.practice, 100));
  });
}

export function startQuizSession(app, quizzes) {
  const container = document.getElementById("quiz-playing-outlet");
  container.style.display = "block";
  container.scrollIntoView({ behavior: 'smooth' });

  let currentIdx = 0;
  const userAnswers = new Array(quizzes.length).fill(null);

  // Set time out count: 10 minutes
  app.quizTimeRemaining = 600;

  const updateClockDisplay = () => {
    const disp = document.getElementById("quiz-clock-display");
    if (!disp) return;
    const mins = Math.floor(app.quizTimeRemaining / 60);
    const secs = app.quizTimeRemaining % 60;
    disp.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderQuestion = () => {
    const q = quizzes[currentIdx];
    const selected = userAnswers[currentIdx];

    let answersBodyHtml = "";

    if (q.questionType === "mcq") {
      answersBodyHtml = `
        <div class="options-list">
          ${q.options.map((opt, idx) => `
            <div class="option-item ${selected === idx ? 'selected' : ''}" data-idx="${idx}">
              <div class="option-marker">${String.fromCharCode(65 + idx)}</div>
              <div style="font-size:14px;">${app.escapeHTML(opt)}</div>
            </div>
          `).join("")}
        </div>
      `;
    } else if (q.questionType === "multi") {
      const selectedList = selected || [];
      answersBodyHtml = `
        <div class="options-list">
          <p style="font-size:11.5px; color:var(--text-muted); margin-bottom:8px;">* Chọn tất cả các đáp án đúng</p>
          ${q.options.map((opt, idx) => `
            <div class="option-item ${selectedList.includes(idx) ? 'selected' : ''}" data-idx="${idx}">
              <div class="option-marker" style="border-radius:4px;">☑</div>
              <div style="font-size:14px;">${app.escapeHTML(opt)}</div>
            </div>
          `).join("")}
        </div>
      `;
    } else if (q.questionType === "fill") {
      answersBodyHtml = `
        <div style="margin-top:10px;">
          <input type="text" class="form-input" id="quiz-fill-input" 
                 placeholder="Nhập câu trả lời ngắn gọn..." 
                 value="${app.escapeHTML(selected || '')}" style="background:var(--bg-secondary);">
        </div>
      `;
    }

    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border-color); padding-bottom:12px; margin-bottom:16px;">
        <span style="font-weight:700; color:var(--vmu-navy); font-size:14px;">Câu hỏi ${currentIdx + 1} / ${quizzes.length}</span>
        <span class="badge badge-warning" style="font-family:var(--font-mono); font-weight:700;" id="quiz-clock-display">10:00</span>
      </div>

      <p style="font-size:14.5px; font-weight:600; color:var(--text-primary); margin-bottom:16px; line-height:1.5;">
        ${app.escapeHTML(q.content)}
      </p>

      ${answersBodyHtml}

      <div style="display:flex; justify-content:space-between; margin-top:20px; border-top:1px solid var(--border-color); padding-top:16px;">
        <button class="btn btn-secondary" id="quiz-btn-prev" ${currentIdx === 0 ? 'disabled' : ''}>Quay lại</button>
        
        ${currentIdx === quizzes.length - 1 ? `
          <button class="btn btn-accent" id="quiz-btn-submit" style="font-weight:700;">Nộp bài thi</button>
        ` : `
          <button class="btn btn-primary" id="quiz-btn-next">Câu tiếp theo</button>
        `}
      </div>
    `;

    updateClockDisplay();

    // Attach interaction listeners
    if (q.questionType === "mcq") {
      document.querySelectorAll(".option-item").forEach(item => {
        item.addEventListener("click", () => {
          const idx = parseInt(item.getAttribute("data-idx"));
          userAnswers[currentIdx] = idx;
          renderQuestion();
        });
      });
    } else if (q.questionType === "multi") {
      document.querySelectorAll(".option-item").forEach(item => {
        item.addEventListener("click", () => {
          const idx = parseInt(item.getAttribute("data-idx"));
          let selectedList = [...(userAnswers[currentIdx] || [])];
          if (selectedList.includes(idx)) {
            selectedList = selectedList.filter(i => i !== idx);
          } else {
            selectedList.push(idx);
          }
          userAnswers[currentIdx] = selectedList;
          renderQuestion();
        });
      });
    } else if (q.questionType === "fill") {
      const inputEl = document.getElementById("quiz-fill-input");
      inputEl.addEventListener("input", () => {
        userAnswers[currentIdx] = inputEl.value;
      });
    }

    document.getElementById("quiz-btn-prev").addEventListener("click", () => {
      if (currentIdx > 0) {
        currentIdx -= 1;
        renderQuestion();
      }
    });

    if (currentIdx === quizzes.length - 1) {
      document.getElementById("quiz-btn-submit").addEventListener("click", () => {
        gradeQuizSession(app, quizzes, userAnswers);
      });
    } else {
      document.getElementById("quiz-btn-next").addEventListener("click", () => {
        currentIdx += 1;
        renderQuestion();
      });
    }
  };

  // Start tick interval timer
  app.quizTimer = setInterval(() => {
    app.quizTimeRemaining -= 1;
    updateClockDisplay();

    if (app.quizTimeRemaining <= 0) {
      clearInterval(app.quizTimer);
      app.quizTimer = null;
      app.showToast("Hết giờ!", "Đã tự động nộp bài làm luyện tập của bạn.", "warning");
      gradeQuizSession(app, quizzes, userAnswers);
    }
  }, 1000);

  renderQuestion();
}

export async function gradeQuizSession(app, quizzes, answers) {
  if (app.quizTimer) {
    clearInterval(app.quizTimer);
    app.quizTimer = null;
  }

  let correctCount = 0;
  
  // Evaluate correctness
  quizzes.forEach((q, idx) => {
    const ans = answers[idx];
    if (q.questionType === "mcq") {
      if (ans === q.correctAnswer) correctCount += 1;
    } else if (q.questionType === "multi") {
      const sortedAns = [...(ans || [])].sort().toString();
      const sortedCorrect = [...q.correctAnswer].sort().toString();
      if (sortedAns === sortedCorrect) correctCount += 1;
    } else if (q.questionType === "fill") {
      if (ans && ans.toString().trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
        correctCount += 1;
      }
    }
  });

  const score = parseFloat(((correctCount / quizzes.length) * 10).toFixed(1));

  // Save submission records in DB
  await VimEduDB.saveQuizSubmission(app.activeSubjectCode, score, correctCount, quizzes.length);

  if (score >= 8.0) {
    app.triggerConfetti();
    app.showToast("Xuất sắc!", `Bạn đã đạt điểm số cao: ${score}/10! Màn thể hiện thật tuyệt vời.`, "success");
  }

  // Update practice progress
  const prev = await VimEduDB.getProgress(app.activeSubjectCode);
  const practicePct = Math.max(prev.practice, Math.round((correctCount / quizzes.length) * 100));
  await VimEduDB.updateProgress(app.activeSubjectCode, 'practice', practicePct);

  // Show Results details page
  const container = document.getElementById("quiz-playing-outlet");
  container.innerHTML = `
    <div style="text-align:center; padding:24px 0; border-bottom:1px solid var(--border-color); margin-bottom:24px;">
      <span style="font-size:48px;">🏆</span>
      <h2 style="font-family:var(--font-title); font-size:24px; font-weight:800; color:var(--vmu-navy); margin-top:12px;">Kết Quả Bài Luyện Tập</h2>
      <div style="font-family:var(--font-title); font-size:36px; font-weight:900; color:var(--vmu-gold-dark); margin:8px 0;">${score} / 10 Điểm</div>
      <p style="font-size:14px; color:var(--text-secondary);">Bạn đã trả lời đúng <strong>${correctCount}/${quizzes.length}</strong> câu hỏi.</p>
      <button class="btn btn-primary" style="margin-top:16px;" id="quiz-btn-close">Đóng bài làm & cập nhật tiến độ</button>
    </div>

    <h3 style="font-family:var(--font-title); font-weight:700; margin-bottom:16px; font-size:16px;">Giải thích đáp án chi tiết:</h3>
    <div style="display:flex; flex-direction:column; gap:20px;">
      ${quizzes.map((q, idx) => {
        const ans = answers[idx];
        let isCorrect = false;

        if (q.questionType === "mcq") {
          isCorrect = ans === q.correctAnswer;
        } else if (q.questionType === "multi") {
          isCorrect = [...(ans || [])].sort().toString() === [...q.correctAnswer].sort().toString();
        } else if (q.questionType === "fill") {
          isCorrect = ans && ans.toString().trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
        }

        let responseText = "";
        if (q.questionType === "mcq") {
          responseText = ans !== null ? q.options[ans] : "Chưa trả lời";
        } else if (q.questionType === "multi") {
          responseText = (ans && ans.length > 0) ? ans.map(i => q.options[i]).join("; ") : "Chưa trả lời";
        } else {
          responseText = ans || "Chưa trả lời";
        }

        return `
          <div class="glass-card" style="border-left: 4px solid ${isCorrect ? 'var(--color-success)' : 'var(--color-danger)'}; padding:16px;">
            <div style="font-weight:700; font-size:13.5px; margin-bottom:8px; display:flex; justify-content:space-between;">
              <span>Câu hỏi ${idx + 1}</span>
              <span class="badge ${isCorrect ? 'badge-success' : 'badge-danger'}">${isCorrect ? 'Đúng' : 'Sai'}</span>
            </div>
            <p style="font-size:13.5px; font-weight:600; color:var(--text-primary); margin-bottom:8px;">${app.escapeHTML(q.content)}</p>
            <div style="font-size:12.5px; color:var(--text-secondary); margin-bottom:8px;">
              <strong>Đáp án của bạn:</strong> <span>${app.escapeHTML(responseText)}</span>
            </div>
            <div style="font-size:12.5px; color:var(--text-secondary); margin-bottom:8px;">
              <strong>Đáp án đúng:</strong> <span>${
                q.questionType === "mcq" ? app.escapeHTML(q.options[q.correctAnswer]) :
                q.questionType === "multi" ? app.escapeHTML(q.correctAnswer.map(i => q.options[i]).join("; ")) :
                app.escapeHTML(q.correctAnswer)
              }</span>
            </div>
            <div style="background:var(--bg-primary); padding:10px 14px; border-radius:6px; font-size:12.5px; line-height:1.5; color:var(--text-secondary);">
              <strong>Giải thích chi tiết:</strong> ${app.escapeHTML(q.explanation)}
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;

  document.getElementById("quiz-btn-close").addEventListener("click", () => {
    container.style.display = "none";
    app.handleRouting();
  });
}

export async function renderAIChatTab(app, container) {
  const chatHistory = await VimEduDB.getChatHistory(app.activeSubjectCode);

  container.innerHTML = `
    <div class="ai-chat-split">
      <!-- Left Sidebar Context tips -->
      <div class="ai-chat-context-panel">
        <h4 style="font-family:var(--font-title); font-weight:700; font-size:13.5px; margin-bottom:12px; color:var(--vmu-navy);">Gợi ý hỏi đáp AI học thuật</h4>
        <p style="font-size:12px; line-height:1.5; color:var(--text-secondary); margin-bottom:16px;">
          Trợ lý AI được liên kết trực tiếp với dữ liệu học trình của khoa, sẵn sàng hỗ trợ giải đáp mọi thắc mắc chuyên ngành.
        </p>
        <div style="display:flex; flex-direction:column; gap:8px;">
          <button class="ai-prompt-suggestion-btn">EDp tính như thế nào trong bài tập?</button>
          <button class="ai-prompt-suggestion-btn">Phân biệt L/C thương mại và nhờ thu?</button>
          <button class="ai-prompt-suggestion-btn">David Ricardo giải thích gì về thương mại tự do?</button>
        </div>
      </div>

      <!-- Right Column active messenger outlet -->
      <div class="ai-chat-messenger-card">
        <!-- Message box list view -->
        <div class="ai-chat-messages-view" id="chat-messages-box">
          <!-- Welcome message -->
          <div class="chat-bubble assistant animated-fade">
            <div class="chat-bubble-title">VMU AI Assistant</div>
            <div class="chat-bubble-text">
              Chào bạn! Tôi là Trợ lý AI đồng hành học tập môn **${app.escapeHTML(VimEduDB.getSubjectByCode(app.activeSubjectCode).name)}**. Hãy đặt câu hỏi bất kỳ về bài tập, lý thuyết hoặc công thức của học phần để tôi hỗ trợ giải đáp nhé!
            </div>
          </div>

          <!-- History rendering -->
          ${chatHistory.map(msg => {
            const hasCitations = msg.citations && msg.citations.length > 0;
            return `
              <div class="chat-bubble ${msg.role === 'user' ? 'user' : 'assistant'} animated-fade">
                <div class="chat-bubble-title">${msg.role === 'user' ? 'Bạn' : 'VMU AI Assistant'}</div>
                <div class="chat-bubble-text">
                  ${app.formatMarkdown(msg.content)}
                </div>
                ${hasCitations ? `
                  <div class="chat-citations-container" style="margin-top: 10px; padding-top: 8px; border-top: 1px dashed rgba(255,255,255,0.15); display: flex; flex-direction: column; gap: 6px;">
                    ${msg.citations.map(c => `
                      <div class="citation-badge-item" style="display: inline-flex; align-items: center; gap: 6px; font-size: 11.5px; color: var(--vmu-gold-light); background: rgba(212, 175, 55, 0.08); border: 1px solid rgba(212, 175, 55, 0.25); padding: 5px 10px; border-radius: 12px; font-family: var(--font-title); backdrop-filter: blur(4px); box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <span style="font-size: 12px; filter: drop-shadow(0 0 2px var(--vmu-gold));">📖</span>
                        <span><strong>Trích nguồn:</strong> ${app.escapeHTML(c.textbook)} - ${app.escapeHTML(c.chapter)} (Trang ${app.escapeHTML(c.page)})</span>
                      </div>
                    `).join("")}
                  </div>
                ` : ""}
              </div>
            `;
          }).join("")}
        </div>

        <!-- Chat Input elements -->
        <div class="ai-chat-input-bar">
          <input type="text" class="ai-chat-input-box" id="ai-chat-input" placeholder="Hỏi AI trợ lý môn học tại đây...">
          <button class="btn btn-primary" style="padding:10px 18px; font-weight:700;" id="btn-chat-send">Gửi tin</button>
        </div>
      </div>
    </div>
  `;

  const messagesBox = document.getElementById("chat-messages-box");
  const input = document.getElementById("ai-chat-input");

  messagesBox.scrollTop = messagesBox.scrollHeight;

  // Prompt suggestion quick click
  document.querySelectorAll(".ai-prompt-suggestion-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      input.value = btn.textContent;
      input.focus();
    });
  });

  // Action send message
  const sendMessage = async () => {
    const text = input.value.trim();
    if (!text) return;

    input.value = "";

    // Append user message to view
    const userBubble = document.createElement("div");
    userBubble.className = "chat-bubble user animated-fade";
    userBubble.innerHTML = `
      <div class="chat-bubble-title">Bạn</div>
      <div class="chat-bubble-text">${app.escapeHTML(text)}</div>
    `;
    messagesBox.appendChild(userBubble);
    messagesBox.scrollTop = messagesBox.scrollHeight;

    // Save in DB history
    await VimEduDB.saveChatMessage(app.activeSubjectCode, "user", text, []);

    // Append loading assistant bubble
    const aBubble = document.createElement("div");
    aBubble.className = "chat-bubble assistant animated-fade";
    aBubble.innerHTML = `
      <div class="chat-bubble-title">VMU AI Assistant</div>
      <div class="chat-bubble-text" id="ai-typing-loader">
        <span class="ai-typing-dot"></span>
        <span class="ai-typing-dot"></span>
        <span class="ai-typing-dot"></span>
      </div>
    `;
    messagesBox.appendChild(aBubble);
    messagesBox.scrollTop = messagesBox.scrollHeight;

    try {
      const response = await VimEduAI.askAI(app.activeSubjectCode, text);
      
      const activeCitations = response.citations || [];
      // Save response with citations!
      await VimEduDB.saveChatMessage(app.activeSubjectCode, "assistant", response.text, activeCitations);

      const hasCitations = activeCitations.length > 0;
      let citationsHTML = "";
      if (hasCitations) {
        citationsHTML = `
          <div class="chat-citations-container" style="margin-top: 10px; padding-top: 8px; border-top: 1px dashed rgba(255,255,255,0.15); display: flex; flex-direction: column; gap: 6px;">
            ${activeCitations.map(c => `
              <div class="citation-badge-item" style="display: inline-flex; align-items: center; gap: 6px; font-size: 11.5px; color: var(--vmu-gold-light); background: rgba(212, 175, 55, 0.08); border: 1px solid rgba(212, 175, 55, 0.25); padding: 5px 10px; border-radius: 12px; font-family: var(--font-title); backdrop-filter: blur(4px); box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <span style="font-size: 12px; filter: drop-shadow(0 0 2px var(--vmu-gold));">📖</span>
                <span><strong>Trích nguồn:</strong> ${app.escapeHTML(c.textbook)} - ${app.escapeHTML(c.chapter)} (Trang ${app.escapeHTML(c.page)})</span>
              </div>
            `).join("")}
          </div>
        `;
      }

      // Render Markdown response
      aBubble.innerHTML = `
        <div class="chat-bubble-title">VMU AI Assistant</div>
        <div class="chat-bubble-text">
          ${app.formatMarkdown(response.text)}
        </div>
        ${citationsHTML}
      `;
      messagesBox.scrollTop = messagesBox.scrollHeight;
    } catch (err) {
      console.error(err);
      const loader = document.getElementById("ai-typing-loader");
      if (loader) {
        aBubble.querySelector(".chat-bubble-text").innerHTML = "Không kết nối được với Trợ lý AI. Hãy thử lại.";
      }
      app.showToast("Lỗi kết nối AI!", "Không thể xử lý yêu cầu. Thử lại sau.", "error");
    }
  };

  document.getElementById("btn-chat-send").addEventListener("click", sendMessage);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });
}
