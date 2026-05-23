import { VimEduDB } from '../db.js';

export function createRadarSVG(gen, fnd, spec, prac) {
  // Center at (110, 110), Radius = 80
  const cx = 110, cy = 110, R = 80;
  
  // Guideline Rings coordinates
  const grid1 = R * 0.25;
  const grid2 = R * 0.50;
  const grid3 = R * 0.75;
  const grid4 = R;

  // Polygon points calculation based on progress percentages [0..1]
  const val0 = Math.max(0.1, gen) * R;
  const val1 = Math.max(0.1, fnd) * R;
  const val2 = Math.max(0.1, spec) * R;
  const val3 = Math.max(0.1, prac) * R;

  const polyPoints = `${cx},${cy - val0} ${cx + val1},${cy} ${cx},${cy + val2} ${cx - val3},${cy}`;

  return `
    <svg width="220" height="220" viewBox="0 0 220 220" style="display:block; overflow:visible;">
      <!-- Background Grid Rings -->
      <circle cx="${cx}" cy="${cy}" r="${grid1}" stroke="var(--border-color)" stroke-width="1" fill="none" stroke-dasharray="2,2"/>
      <circle cx="${cx}" cy="${cy}" r="${grid2}" stroke="var(--border-color)" stroke-width="1" fill="none" stroke-dasharray="2,2"/>
      <circle cx="${cx}" cy="${cy}" r="${grid3}" stroke="var(--border-color)" stroke-width="1" fill="none" stroke-dasharray="2,2"/>
      <circle cx="${cx}" cy="${cy}" r="${grid4}" stroke="var(--border-color)" stroke-width="1.2" fill="none"/>
      
      <!-- Axis Crosshairs -->
      <line x1="${cx}" y1="${cy - R}" x2="${cx}" y2="${cy + R}" stroke="var(--border-color)" stroke-width="1"/>
      <line x1="${cx - R}" y1="${cy}" x2="${cx + R}" y2="${cy}" stroke="var(--border-color)" stroke-width="1"/>
      
      <!-- Shaded Area Polygon -->
      <polygon points="${polyPoints}" fill="rgba(0, 48, 135, 0.25)" stroke="var(--vmu-navy)" stroke-width="2" style="transition: all 0.5s ease;"/>
      
      <!-- Points Markers Dots -->
      <circle class="radar-dot-point" data-type="general" data-name="Đại Cương" data-val="${Math.round(gen*100)}" cx="${cx}" cy="${cy - val0}" r="6" fill="#0ea5e9" stroke="#fff" stroke-width="1.5" style="transition: all 0.3s ease; cursor: pointer;"/>
      <circle class="radar-dot-point" data-type="foundation" data-name="Cơ Sở Ngành" data-val="${Math.round(fnd*100)}" cx="${cx + val1}" cy="${cy}" r="6" fill="#10b981" stroke="#fff" stroke-width="1.5" style="transition: all 0.3s ease; cursor: pointer;"/>
      <circle class="radar-dot-point" data-type="specialized" data-name="Chuyên Ngành" data-val="${Math.round(spec*100)}" cx="${cx}" cy="${cy + val2}" r="6" fill="#8b5cf6" stroke="#fff" stroke-width="1.5" style="transition: all 0.3s ease; cursor: pointer;"/>
      <circle class="radar-dot-point" data-type="practice" data-name="Thực Tế NCKH" data-val="${Math.round(prac*100)}" cx="${cx - val3}" cy="${cy}" r="6" fill="#FFB800" stroke="#fff" stroke-width="1.5" style="transition: all 0.3s ease; cursor: pointer;"/>
      
      <!-- Label Tags -->
      <text x="${cx}" y="${cy - R - 6}" font-size="9" text-anchor="middle" font-weight="700" fill="var(--text-secondary)">ĐẠI CƯƠNG</text>
      <text x="${cx + R + 6}" y="${cy + 3}" font-size="9" text-anchor="start" font-weight="700" fill="var(--text-secondary)">CƠ SỞ NGÀNH</text>
      <text x="${cx}" y="${cy + R + 13}" font-size="9" text-anchor="middle" font-weight="700" fill="var(--text-secondary)">CHUYÊN NGÀNH</text>
      <text x="${cx - R - 6}" y="${cy + 3}" font-size="9" text-anchor="end" font-weight="700" fill="var(--text-secondary)">THỰC TẾ/NCKH</text>
    </svg>
  `;
}

function createProgressChartSVG(subjects) {
  // Take first 4 subjects for neat visual balance in dashboard layout
  const list = subjects.slice(0, 4);

  const width = 500;
  const rowHeight = 60;
  const height = list.length * rowHeight + 20;
  
  let svgRows = "";
  list.forEach((s, idx) => {
    const y = idx * rowHeight + 15;
    const tWidth = Math.round((s.progress.theory / 100) * 160);
    const pWidth = Math.round((s.progress.practice / 100) * 160);
    
    svgRows += `
      <!-- Row for ${s.name} -->
      <text x="10" y="${y + 16}" font-size="12" font-weight="700" fill="var(--text-primary)" font-family="var(--font-title)">${s.name} (${s.code})</text>
      
      <!-- Theory progress bar -->
      <text x="210" y="${y + 16}" font-size="11" fill="var(--text-secondary)">Lý thuyết: ${s.progress.theory}%</text>
      <rect x="210" y="${y + 22}" width="160" height="8" rx="4" fill="rgba(255,255,255,0.06)"/>
      <rect x="210" y="${y + 22}" width="${tWidth}" height="8" rx="4" fill="url(#theoryGrad)" style="transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);"/>
      
      <!-- Practice progress bar -->
      <text x="390" y="${y + 16}" font-size="11" fill="var(--text-secondary)">Thực hành: ${s.progress.practice}%</text>
      <rect x="390" y="${y + 22}" width="160" height="8" rx="4" fill="rgba(255,255,255,0.06)"/>
      <rect x="390" y="${y + 22}" width="${pWidth}" height="8" rx="4" fill="url(#practiceGrad)" style="transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);"/>
      
      <line x1="10" y1="${y + 45}" x2="${width - 10}" y2="${y + 45}" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
    `;
  });

  return `
    <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" style="overflow:visible; display:block;">
      <defs>
        <linearGradient id="theoryGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#3b82f6" />
          <stop offset="100%" stop-color="#0ea5e9" />
        </linearGradient>
        <linearGradient id="practiceGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#10b981" />
          <stop offset="100%" stop-color="#34d399" />
        </linearGradient>
      </defs>
      ${svgRows}
    </svg>
  `;
}

export async function renderDashboard(app, outlet) {
  app.updateHeader("Bảng Tiến Độ Học Tập", "Tổng quan kết quả học trình của bạn");
  const user = VimEduDB.getCurrentUser();
  const flatSubjects = VimEduDB.getSubjectsFlat();
  
  // Fetch progress for all subjects in parallel to avoid N+1 requests
  const flatSubjectsWithProgress = await Promise.all(flatSubjects.map(async s => {
    const prog = await VimEduDB.getProgress(s.code);
    return { ...s, progress: prog };
  }));

  // Calculate total completed courses
  let compCount = 0;
  let totalTC = 0;
  flatSubjectsWithProgress.forEach(s => {
    totalTC += s.credits;
    if (s.progress.theory === 100 && s.progress.practice === 100) {
      compCount += 1;
    }
  });

  const overallPct = Math.round((compCount / flatSubjects.length) * 100);

  // Calculate Radar Capabilities
  const flatCounts = { 'đại cương': 0, 'cơ sở ngành': 0, 'chuyên ngành': 0, 'thực tập': 0, 'tốt nghiệp': 0 };
  const flatScores = { 'đại cương': 0, 'cơ sở ngành': 0, 'chuyên ngành': 0, 'thực tập': 0, 'tốt nghiệp': 0 };

  flatSubjectsWithProgress.forEach(s => {
    const avg = (s.progress.theory + s.progress.practice) / 2;
    const cat = s.type.toLowerCase();
    if (flatScores[cat] !== undefined) {
      flatScores[cat] += avg;
      flatCounts[cat] += 1;
    }
  });

  const generalVal = (flatCounts['đại cương'] > 0 ? (flatScores['đại cương'] / flatCounts['đại cương']) : 0) / 100;
  const foundationVal = (flatCounts['cơ sở ngành'] > 0 ? (flatScores['cơ sở ngành'] / flatCounts['cơ sở ngành']) : 0) / 100;
  const specVal = (flatCounts['chuyên ngành'] > 0 ? (flatScores['chuyên ngành'] / flatCounts['chuyên ngành']) : 0) / 100;
  
  // Practical / NCKH vector
  const nckhList = await VimEduDB.getResearchProposals();
  const userNckh = nckhList.filter(n => n.studentName === user.fullName && n.status === "Approved");
  const nckhBonus = userNckh.length * 0.25; // 25% progress weight per approved work
  const rawPracVal = (flatCounts['thực tập'] > 0 ? (flatScores['thực tập'] / flatCounts['thực tập']) : 0) / 100;
  const pracVal = Math.min(1.0, rawPracVal + nckhBonus);

  // Study Target recommendation algorithm
  const incompleteSubjects = flatSubjectsWithProgress.filter(s => s.progress.theory < 100 || s.progress.practice < 100);
  let recommendedSubject = null;
  if (incompleteSubjects.length > 0) {
    // Sort by progress ascending to find lowest
    incompleteSubjects.sort((a, b) => {
      const progA = (a.progress.theory + a.progress.practice) / 2;
      const progB = (b.progress.theory + b.progress.practice) / 2;
      return progA - progB;
    });
    recommendedSubject = incompleteSubjects[0];
  } else {
    // Fallback default
    recommendedSubject = flatSubjectsWithProgress[0];
  }

  // Render overall layout inside screen-outlet
  outlet.innerHTML = `
    <div class="dashboard-grid">
      <!-- Main dynamic cards -->
      <div style="display:flex; flex-direction:column; gap:24px;">
        <!-- Banner card header -->
        <div class="glass-card welcome-card animated-fade">
          <div style="flex-grow:1;">
            <h2 style="font-family:var(--font-title); font-size:22px; font-weight:800; color:var(--vmu-navy); margin-bottom:8px;">
              Chào mừng trở lại, ${app.escapeHTML(user.fullName)}!
            </h2>
            <p style="font-size:13.5px; color:var(--text-secondary); max-width:550px; line-height:1.6;">
              Hệ thống đã cập nhật đầy đủ tiến trình học tập chuyên ngành **Kinh tế Ngoại thương** của bạn. Hãy tiếp tục tích lũy điểm học tập và đóng góp các bài NCKH giá trị nhé!
            </p>
          </div>
          <div class="xp-level-badge">
            <span style="font-size:12px; text-transform:uppercase; font-weight:600; opacity:0.8;">Tích lũy</span>
            <span style="font-size:24px; font-weight:900; font-family:var(--font-mono);">${user.xpPoints || 0}</span>
            <span style="font-size:11px; font-weight:600; background:rgba(255,255,255,0.2); padding:2px 8px; border-radius:20px;">XP Điểm</span>
          </div>
        </div>

        <!-- Overall progress bar and badge boxes -->
        <div class="stats-overview-grid">
          <div class="stat-card animated-fade" style="animation-delay: 0.05s;">
            <div class="stat-icon" style="background:rgba(0, 40, 85, 0.08); color:var(--vmu-navy);">📚</div>
            <div class="stat-info">
              <span class="stat-label">Tổng học phần</span>
              <span class="stat-value">${flatSubjects.length} Môn học</span>
            </div>
          </div>
          <div class="stat-card animated-fade" style="animation-delay: 0.1s;">
            <div class="stat-icon" style="background:rgba(255, 184, 0, 0.1); color:var(--vmu-gold-dark);">🎖️</div>
            <div class="stat-info">
              <span class="stat-label">Đã hoàn tất</span>
              <span class="stat-value">${compCount} / ${flatSubjects.length} Môn</span>
            </div>
          </div>
          <div class="stat-card animated-fade" style="animation-delay: 0.15s;">
            <div class="stat-icon" style="background:rgba(16, 185, 129, 0.1); color:#10b981;">📈</div>
            <div class="stat-info">
              <span class="stat-label">Tiến trình chung</span>
              <span class="stat-value">${overallPct}% Hoàn tất</span>
            </div>
          </div>
        </div>

        <!-- Custom SVG subject progression bar chart card -->
        <div class="glass-card animated-fade" style="animation-delay: 0.18s; padding: 20px;">
          <h3 style="font-family:var(--font-title); font-size:16px; font-weight:700; margin-bottom:16px; display:flex; align-items:center; gap:8px;">
            <span>📊 Tiến độ chi tiết Lý thuyết vs Thực hành</span>
          </h3>
          <div class="progress-chart-container" style="overflow-x: auto; width: 100%;">
            ${createProgressChartSVG(flatSubjectsWithProgress)}
          </div>
        </div>

        <!-- Semester grid progression list -->
        <div class="semesters-progress-container animated-fade" style="animation-delay: 0.2s;">
          <h3 style="font-family:var(--font-title); font-size:16px; font-weight:700; margin-bottom:16px;">Tiến trình theo học kỳ (8 Kỳ chính)</h3>
          <div class="semesters-grid" id="semesters-outlet"></div>
        </div>
      </div>

      <!-- Capability & Activity side column -->
      <div style="display:flex; flex-direction:column; gap:24px;">
        <!-- Custom SVG dynamic capability radar chart card -->
        <div class="glass-card radar-chart-card animated-fade" style="animation-delay: 0.25s;">
          <h3 style="font-family:var(--font-title); font-size:16px; font-weight:700; width:100%; text-align:left;">Radar năng lực ngành</h3>
          <div class="radar-chart-container">
            ${createRadarSVG(generalVal, foundationVal, specVal, pracVal)}
          </div>
          <div class="radar-labels-grid" style="margin-bottom: 12px;">
            <div class="radar-label-item"><span class="radar-dot" style="background:#0ea5e9;"></span>Đại cương (${Math.round(generalVal*100)}%)</div>
            <div class="radar-label-item"><span class="radar-dot" style="background:#10b981;"></span>Cơ sở ngành (${Math.round(foundationVal*100)}%)</div>
            <div class="radar-label-item"><span class="radar-dot" style="background:#8b5cf6;"></span>Chuyên ngành (${Math.round(specVal*100)}%)</div>
            <div class="radar-label-item"><span class="radar-dot" style="background:#FFB800;"></span>Thực tế NCKH (${Math.round(pracVal*100)}%)</div>
          </div>
          
          <!-- Dynamic Competency Details Tooltip Box -->
          <div id="radar-tooltip-box" style="margin-top: 15px; padding: 12px; border-radius: 8px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); font-size: 13px; min-height: 52px; line-height: 1.4; transition: all 0.3s ease;">
            <div style="color: var(--text-muted); font-style: italic; font-size: 12px; text-align: center; display: flex; align-items: center; justify-content: center; gap: 6px;">
              <span>💡 Click vào các điểm đỉnh trên Radar để xem chi tiết gợi ý học liệu</span>
            </div>
          </div>
        </div>

        <!-- Recommended Study Targets frosted glass advisor card -->
        <div class="glass-card animated-fade" style="animation-delay: 0.28s; padding: 20px; background: linear-gradient(135deg, rgba(255, 184, 0, 0.05), rgba(0, 40, 85, 0.03)); border: 1px solid rgba(255, 184, 0, 0.15);">
          <div style="display: flex; align-items: flex-start; gap: 12px;">
            <div style="font-size: 28px;">🎯</div>
            <div style="flex: 1;">
              <h3 style="font-family:var(--font-title); font-size:16px; font-weight:700; color: var(--text-primary); margin-bottom: 6px;">Mục tiêu học tập đề xuất</h3>
              <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 12px;">
                Dựa trên tiến độ hiện tại, bạn nên dành thêm thời gian hoàn thành học phần này để tối ưu hóa năng lực chuyên môn:
              </p>
              
              <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 12px; margin-bottom: 14px;">
                <div style="font-weight: 700; font-size: 14px; margin-bottom: 6px; color: var(--vmu-gold-dark);">${app.escapeHTML(recommendedSubject.name)}</div>
                <div style="display: flex; justify-content: space-between; font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;">
                  <span>Mã học phần: ${recommendedSubject.code}</span>
                  <span>Tín chỉ: ${recommendedSubject.credits}</span>
                </div>
                <div style="display: flex; gap: 12px; font-size: 12px; margin-top: 6px;">
                  <span style="color: #3b82f6;">Lý thuyết: ${recommendedSubject.progress.theory}%</span>
                  <span style="color: #10b981;">Thực hành: ${recommendedSubject.progress.practice}%</span>
                </div>
              </div>

              <a href="#/subjects/${recommendedSubject.code}" class="btn btn-primary" style="display: block; text-align: center; width: 100%; padding: 10px; border-radius: 8px; font-weight: bold; background: var(--vmu-navy); color: #fff; box-shadow: 0 4px 10px rgba(0,48,135,0.2);">
                Học ngay &rarr;
              </a>
            </div>
          </div>
        </div>

        <!-- Activity History log card -->
        <div class="glass-card timeline-card animated-fade" style="animation-delay: 0.3s;">
          <h3 style="font-family:var(--font-title); font-size:16px; font-weight:700;">Nhật ký hoạt động</h3>
          <ul class="timeline-list" id="activities-outlet"></ul>
        </div>
      </div>
    </div>
  `;

  // Render individual Semester cards
  const syllabus = VimEduDB.getSyllabus();
  const semOutlet = document.getElementById("semesters-outlet");
  semOutlet.innerHTML = syllabus.map(sem => {
    // Calculate % of completion for this semester
    let semProgressSum = 0;
    sem.subjects.forEach(s => {
      const match = flatSubjectsWithProgress.find(item => item.code === s.code);
      const p = match ? match.progress : { theory: 0, practice: 0 };
      semProgressSum += (p.theory + p.practice) / 2;
    });
    const pct = Math.round(semProgressSum / sem.subjects.length);

    return `
      <div class="semester-prog-card">
        <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:13px; font-weight:600;">
          <span style="color:var(--text-primary);">${app.escapeHTML(sem.semesterName)}</span>
          <span class="semester-progress-text">${pct}%</span>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width: ${pct}%;"></div>
        </div>
        <span style="font-size:11.5px; color:var(--text-muted); margin-top:6px; display:block;">
          Sản lượng: ${sem.subjects.length} môn học phần
        </span>
      </div>
    `;
  }).join("");

  // Render activities log from Database
  const actOutlet = document.getElementById("activities-outlet");
  const activities = await VimEduDB.getActivityLog();
  if (activities.length === 0) {
    actOutlet.innerHTML = `<li style="font-size:12px; color:var(--text-secondary); text-align:center; padding:12px 0;">Chưa có hoạt động nào được lưu</li>`;
  } else {
    // Show only the 6 latest activities
    actOutlet.innerHTML = activities.slice(0, 6).map(act => `
      <li class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <div class="timeline-desc">${app.escapeHTML(act.activityDescription)}</div>
          <div class="timeline-time">${app.formatRelativeTime(act.timestamp)}</div>
        </div>
      </li>
    `).join("");
  }

  // Bind click/hover handlers for the Radar Chart points
  const radarTooltipBox = document.getElementById("radar-tooltip-box");
  const radarDots = outlet.querySelectorAll(".radar-dot-point");

  const competencyTips = {
    general: {
      name: "Đại Cương",
      desc: "Kiến thức nền tảng: Toán cao cấp, Lý thuyết xác suất, Kinh tế vi mô, Kinh tế vĩ mô.",
      action: "💡 Nên rèn luyện trắc nghiệm hoặc đọc thêm tài liệu các môn Đại cương cốt lõi để đạt 100%."
    },
    foundation: {
      name: "Cơ Sở Ngành",
      desc: "Kiến thức cốt lõi: Thương mại quốc tế, Logistics, Marketing, Kinh tế đầu tư.",
      action: "💡 Hãy đóng góp tài liệu hoặc ôn tập lý thuyết các môn này để nâng cao điểm chuyên môn cơ bản."
    },
    specialized: {
      name: "Chuyên Ngành",
      desc: "Kiến thức nghiệp vụ: Thanh toán quốc tế, Giao dịch thương mại quốc tế, Luật thương mại quốc tế.",
      action: "💡 Mở diễn đàn học thuật hoặc hỏi đáp trợ lý AI về các ca tình huống thực tế chuyên ngành."
    },
    practice: {
      name: "Thực Tế NCKH",
      desc: "Nghiên cứu khoa học & Trực quan thực hành thực tế.",
      action: "💡 Hãy đăng ký đề tài Nghiên cứu khoa học sinh viên hoặc đi kiến tập để tích lũy XP cực lớn!"
    }
  };

  radarDots.forEach(dot => {
    const showDetails = () => {
      const type = dot.getAttribute("data-type");
      const val = dot.getAttribute("data-val");
      const data = competencyTips[type];
      
      // Reset point radiuses & visual highlights
      radarDots.forEach(d => d.setAttribute("r", "6"));
      dot.setAttribute("r", "9");

      radarTooltipBox.innerHTML = `
        <div style="font-weight: 700; color: var(--vmu-navy-light); font-size: 13.5px; margin-bottom: 4px; display: flex; justify-content: space-between; align-items: center;">
          <span>🎯 Kỹ năng ${data.name}</span>
          <span style="font-family: var(--font-mono); color: var(--vmu-gold-dark);">${val}% hoàn tất</span>
        </div>
        <p style="font-size: 12.5px; color: var(--text-secondary); margin-bottom: 6px; line-height: 1.4;">${data.desc}</p>
        <div style="font-size: 12px; color: var(--text-muted); font-style: italic; background: rgba(255,184,0,0.06); padding: 6px 8px; border-radius: 4px; border-left: 3px solid var(--vmu-gold);">${data.action}</div>
      `;
    };

    dot.addEventListener("click", (e) => {
      e.stopPropagation();
      showDetails();
    });

    dot.addEventListener("mouseenter", () => {
      dot.style.filter = "drop-shadow(0 0 4px var(--vmu-navy-light))";
    });
    
    dot.addEventListener("mouseleave", () => {
      dot.style.filter = "none";
    });
  });
}

