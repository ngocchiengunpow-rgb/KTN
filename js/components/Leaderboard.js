import { VimEduDB } from '../db.js';

export async function renderLeaderboard(app, outlet) {
  app.updateHeader("Bảng Xếp Hạng Học Lực", "Bảng tôn vinh kết quả đóng góp và học lực sinh viên khoa Kinh tế");

  const roster = await VimEduDB.getLeaderboard();
  const currentUser = VimEduDB.getCurrentUser();

  outlet.innerHTML = `
    <div class="leaderboard-filters-bar animated-fade">
      <div style="display:flex; gap:12px; flex-wrap:wrap;">
        <button class="filter-chip active" id="lb-filter-all">Toàn hệ thống</button>
        <button class="filter-chip" id="lb-filter-k64">Khóa K64</button>
        <button class="filter-chip" id="lb-filter-k65">Khóa K65</button>
        <button class="filter-chip" id="lb-filter-k66">Khóa K66</button>
      </div>
    </div>

    <div class="glass-card leaderboard-table-card animated-fade">
      <table class="leaderboard-table">
        <thead>
          <tr>
            <th>Hạng</th>
            <th>Học viên</th>
            <th>Khóa</th>
            <th>Học lực tích lũy</th>
            <th>Huy hiệu</th>
          </tr>
        </thead>
        <tbody id="leaderboard-outlet-rows"></tbody>
      </table>
    </div>
  `;

  const tbody = document.getElementById("leaderboard-outlet-rows");

  const renderRosterTable = (list) => {
    tbody.innerHTML = list.map(item => {
      const isSelf = currentUser && item.msv === currentUser.msv;

      // Rank standing styles (Gold, Silver, Bronze badges)
      let rankHtml = `<span class="rank-badge-item standard">${item.rank}</span>`;
      if (item.rank === 1) rankHtml = `<span class="rank-badge-item gold">1</span>`;
      else if (item.rank === 2) rankHtml = `<span class="rank-badge-item silver">2</span>`;
      else if (item.rank === 3) rankHtml = `<span class="rank-badge-item bronze">3</span>`;

      let badgeClass = "rank-text-newbie";
      if (item.badge === "Học giả") badgeClass = "rank-text-scholar";
      else if (item.badge === "Chuyên gia" || item.badge === "Chuyên gia Giao nhận") badgeClass = "rank-text-expert";
      else if (item.badge === "Nhà nghiên cứu") badgeClass = "rank-text-researcher";
      else if (item.badge === "Xuất Sắc" || item.badge === "Giảng Viên" || item.badge === "Admin") badgeClass = "rank-text-outstanding";

      return `
        <tr class="${isSelf ? 'current-user-row' : ''}">
          <td>${rankHtml}</td>
          <td>
            <div class="leaderboard-user-cell">
              <img class="leaderboard-user-avatar" src="${item.avatar}" alt="Avatar">
              <div>
                <div class="leaderboard-user-name">${app.escapeHTML(item.name)} ${isSelf ? ' (Bạn)' : ''}</div>
                <div class="leaderboard-user-msv">MSV: ${item.msv}</div>
              </div>
            </div>
          </td>
          <td style="font-weight:500;">${item.cohort}</td>
          <td>
            <div class="xp-score-badge">${item.xp} <span>XP</span></div>
          </td>
          <td>
            <span class="rank-badge-text ${badgeClass}">${item.badge || 'Tân sinh viên'}</span>
          </td>
        </tr>
      `;
    }).join("");
  };

  renderRosterTable(roster);

  // Filters rosters
  document.getElementById("lb-filter-all").addEventListener("click", (e) => {
    document.querySelectorAll(".leaderboard-filters-bar .filter-chip").forEach(c => c.classList.remove("active"));
    e.target.classList.add("active");
    renderRosterTable(roster);
  });

  const bindFilter = (id, cohortValue) => {
    document.getElementById(id).addEventListener("click", (e) => {
      document.querySelectorAll(".leaderboard-filters-bar .filter-chip").forEach(c => c.classList.remove("active"));
      e.target.classList.add("active");
      
      const filtered = roster.filter(r => r.cohort === cohortValue);
      // Re-adjust relative ranks
      filtered.forEach((r, i) => r.rank = i + 1);
      renderRosterTable(filtered);
    });
  };

  bindFilter("lb-filter-k64", "K64");
  bindFilter("lb-filter-k65", "K65");
  bindFilter("lb-filter-k66", "K66");
}
