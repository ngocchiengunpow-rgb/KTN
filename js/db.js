import { syllabusData } from './data/syllabus.js';
import { quizzesData, caseStudiesData } from './data/quiz.js';
import { forumMockup, leaderboardMockup, newsMockup, documentsMockup, researchMockup, thesisMockup } from './data/mockup.js';

// Database State Names
const DB_PREFIX = "vimedu_";
const USERS_KEY = DB_PREFIX + "users";
const SESSION_KEY = DB_PREFIX + "session";
const PROGRESS_KEY = DB_PREFIX + "progress";
const FORUM_KEY = DB_PREFIX + "forum";
const LEADERBOARD_KEY = DB_PREFIX + "leaderboard";
const DOCUMENTS_KEY = DB_PREFIX + "documents";
const RESEARCH_KEY = DB_PREFIX + "research";
const THESIS_KEY = DB_PREFIX + "thesis";
const NEWS_KEY = DB_PREFIX + "news";
const SUBMISSIONS_KEY = DB_PREFIX + "submissions";
const CHAT_KEY = DB_PREFIX + "chat";
const AI_CONFIG_KEY = DB_PREFIX + "aiconfig";

// Default System Users
const DEFAULT_USERS = [
  {
    msv: "admin",
    fullName: "Quản trị viên Hệ thống",
    email: "admin@vimaru.edu.vn",
    password: "admin",
    role: "admin",
    cohort: "Hệ thống",
    xpPoints: 0,
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
    badges: ["Admin"],
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    msv: "15600",
    fullName: "TS. Nguyễn Thị Hồng Vân",
    email: "van.nth@vimaru.edu.vn",
    password: "teacher",
    role: "teacher",
    cohort: "Khoa Kinh Tế",
    xpPoints: 0,
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100",
    badges: ["Giảng Viên"],
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    msv: "75128",
    fullName: "Đỗ Tuấn Kiệt",
    email: "kiet.dt75128@student.vimaru.edu.vn",
    password: "123",
    role: "student",
    cohort: "K64",
    xpPoints: 980,
    avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100",
    badges: ["Nhà nghiên cứu", "Chuyên gia Giao nhận"],
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

export class VimEduDB {
  static isServerConnected = false;
  static cachedCurrentUser = null;

  static async init() {
    // 1. Initialise LocalStorage Local Mock data for Offline capability
    if (!localStorage.getItem(USERS_KEY)) {
      localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
    }
    if (!localStorage.getItem(FORUM_KEY)) {
      localStorage.setItem(FORUM_KEY, JSON.stringify(forumMockup));
    }
    if (!localStorage.getItem(LEADERBOARD_KEY)) {
      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboardMockup));
    }
    if (!localStorage.getItem(NEWS_KEY)) {
      localStorage.setItem(NEWS_KEY, JSON.stringify(newsMockup));
    }
    if (!localStorage.getItem(DOCUMENTS_KEY)) {
      localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(documentsMockup));
    }
    if (!localStorage.getItem(RESEARCH_KEY)) {
      localStorage.setItem(RESEARCH_KEY, JSON.stringify(researchMockup));
    }
    if (!localStorage.getItem(THESIS_KEY)) {
      localStorage.setItem(THESIS_KEY, JSON.stringify(thesisMockup));
    }
    if (!localStorage.getItem(PROGRESS_KEY)) {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify({}));
    }
    if (!localStorage.getItem(SUBMISSIONS_KEY)) {
      localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify([]));
    }
    if (!localStorage.getItem(CHAT_KEY)) {
      localStorage.setItem(CHAT_KEY, JSON.stringify({}));
    }
    if (!localStorage.getItem(AI_CONFIG_KEY)) {
      const defaultConfig = {
        apiKey: "",
        provider: "gemini",
        systemPrompt: "Bạn là trợ lý học tập cực kỳ thông minh của Khoa Kinh Tế, Trường Đại học Hàng Hải Việt Nam (VMU).\nMôn học hiện tại: {subjectName} (Mã môn: {subjectCode}).\nHọc kỳ: {semester}.\nSinh viên hiện tại: {studentName} (MSV: {studentMsv}).\n\nNhiệm vụ của bạn là giải đáp tất cả thắc mắc lý thuyết, thuật ngữ chuyên ngành Kinh tế Ngoại thương liên quan đến môn học này. Trả lời bằng tiếng Việt chuyên nghiệp, dễ hiểu đối với trình độ đại học. Tuyệt đối KHÔNG trực tiếp đưa đáp án bài tập cụ thể cho sinh viên, mà hãy gợi ý hướng tiếp cận và công thức cần dùng."
      };
      localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(defaultConfig));
    }

    // Load initial session cached in browser
    const session = localStorage.getItem(SESSION_KEY);
    if (session) {
      this.cachedCurrentUser = JSON.parse(session);
    }

    // 2. Test server connection
    try {
      const test = await fetch('/api/leaderboard', { method: 'GET' });
      if (test.ok) {
        this.isServerConnected = true;
        console.log("Connected to VimEdu Cloud Backend successfully! Port 3000 APIs active.");
      } else {
        this.isServerConnected = false;
        console.warn("VimEdu Backend server returned error, falling back to local database simulation.");
      }
    } catch (e) {
      this.isServerConnected = false;
      console.warn("VimEdu Backend server down. Running in robust offline mode with localStorage.");
    }
  }

  // ----------------------------------------------------
  // STATIC SYNCHRONOUS GETTERS (LOADED FROM STATIC DATA / CACHES)
  // ----------------------------------------------------

  static getSyllabus() {
    return syllabusData;
  }

  static getSubjectsFlat() {
    const list = [];
    syllabusData.forEach(sem => {
      sem.subjects.forEach(sub => {
        list.push({
          ...sub,
          semesterId: sem.semester,
          semesterName: sem.name
        });
      });
    });
    return list;
  }

  static getSubjectByCode(code) {
    return this.getSubjectsFlat().find(sub => sub.code === code) || null;
  }

  static getQuizzes(subjectCode) {
    return quizzesData[subjectCode] || [];
  }

  static getCaseStudy(subjectCode) {
    return caseStudiesData[subjectCode] || null;
  }

  static getCurrentUser() {
    // Session is cached synchronously in browser for speed
    const session = localStorage.getItem(SESSION_KEY);
    this.cachedCurrentUser = session ? JSON.parse(session) : null;
    return this.cachedCurrentUser;
  }

  // ----------------------------------------------------
  // DYNAMIC ASYNC CORE OPERATIONS (SERVER-INTEGRATED / OFFLINE FALLBACK)
  // ----------------------------------------------------

  // AUTH OPERATIONS
  static async getUsers() {
    if (this.isServerConnected) {
      try {
        const response = await fetch('/api/users');
        if (response.ok) return await response.json();
      } catch (err) {
        console.error("Get Users API failed, falling back:", err);
      }
    }
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  }

  static async login(msv, password) {
    if (this.isServerConnected) {
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ msv, password })
        });
        if (response.ok) {
          const res = await response.json();
          if (res.success) {
            localStorage.setItem(SESSION_KEY, JSON.stringify(res.user));
            this.cachedCurrentUser = res.user;
          }
          return res;
        }
      } catch (err) {
        console.error("Login API request failed, falling back to local:", err);
      }
    }

    // Offline Local Fallback
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    const user = users.find(u => u.msv.toLowerCase() === msv.toLowerCase().trim() && u.password === password);
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      this.cachedCurrentUser = user;
      return { success: true, user };
    }
    return { success: false, message: "Mã sinh viên hoặc mật khẩu không chính xác!" };
  }

  static async register(msv, fullName, email, password, cohort) {
    if (this.isServerConnected) {
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ msv, fullName, email, password, cohort })
        });
        if (response.ok) {
          const res = await response.json();
          if (res.success) {
            localStorage.setItem(SESSION_KEY, JSON.stringify(res.user));
            this.cachedCurrentUser = res.user;
          }
          return res;
        }
      } catch (err) {
        console.error("Register API request failed, falling back to local:", err);
      }
    }

    // Offline Local Fallback
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    if (users.some(u => u.msv.toLowerCase() === msv.toLowerCase().trim())) {
      return { success: false, message: "Mã sinh viên đã được đăng ký trong hệ thống!" };
    }
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase().trim())) {
      return { success: false, message: "Email đã được sử dụng!" };
    }

    const newUser = {
      msv: msv.trim(),
      fullName: fullName.trim(),
      email: email.trim(),
      password: password,
      role: "student",
      cohort: cohort,
      xpPoints: 0,
      avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${msv}`,
      badges: ["Tân sinh viên"],
      isActive: true,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    this.cachedCurrentUser = newUser;
    this.syncUserToLeaderboardOffline(newUser);

    return { success: true, user: newUser };
  }

  static logout() {
    localStorage.removeItem(SESSION_KEY);
    this.cachedCurrentUser = null;
  }

  // XP & GAMIFICATION
  static async awardXP(points, reason) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return null;

    if (this.isServerConnected) {
      try {
        const response = await fetch('/api/users/xp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ msv: currentUser.msv, points, reason })
        });
        if (response.ok) {
          const res = await response.json();
          if (res.success) {
            localStorage.setItem(SESSION_KEY, JSON.stringify(res.user));
            this.cachedCurrentUser = res.user;
            return { xpPoints: res.xpPoints, badges: res.badges };
          }
        }
      } catch (err) {
        console.error("XP Sync API request failed, falling back to local:", err);
      }
    }

    // Offline Local Fallback
    currentUser.xpPoints = (currentUser.xpPoints || 0) + points;
    const badges = [...currentUser.badges];
    if (currentUser.xpPoints >= 100 && !badges.includes("Học giả")) {
      badges.push("Học giả");
      this.addNotificationOffline("Chúc mừng!", "Bạn đã đạt cấp bậc Học giả Ngoại thương!");
    }
    if (currentUser.xpPoints >= 400 && !badges.includes("Chuyên gia")) {
      badges.push("Chuyên gia");
      this.addNotificationOffline("Chúc mừng!", "Bạn đã đạt cấp bậc Chuyên gia Ngoại thương!");
    }
    if (currentUser.xpPoints >= 800 && !badges.includes("Nhà nghiên cứu")) {
      badges.push("Nhà nghiên cứu");
      this.addNotificationOffline("Chúc mừng!", "Bạn đã đạt cấp bậc Nhà nghiên cứu khoa học!");
    }
    if (currentUser.xpPoints >= 1200 && !badges.includes("Xuất Sắc")) {
      badges.push("Xuất Sắc");
      this.addNotificationOffline("Vinh danh!", "Bạn đã ghi danh vào danh sách Xuất Sắc Toàn Diện của Khoa!");
    }
    currentUser.badges = badges;

    localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser));
    this.cachedCurrentUser = currentUser;

    const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    const userIndex = users.findIndex(u => u.msv === currentUser.msv);
    if (userIndex !== -1) {
      users[userIndex] = currentUser;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    this.syncUserToLeaderboardOffline(currentUser);
    this.logActivityOffline(`Nhận +${points} XP - ${reason}`);

    return { xpPoints: currentUser.xpPoints, badges: currentUser.badges };
  }

  static syncUserToLeaderboardOffline(user) {
    if (user.role !== 'student') return;
    const leaderboard = JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || "[]");
    const existing = leaderboard.find(item => item.msv === user.msv);

    if (existing) {
      existing.xp = user.xpPoints;
      existing.name = user.fullName;
      existing.cohort = user.cohort;
      existing.badge = user.badges[user.badges.length - 1];
    } else {
      leaderboard.push({
        rank: leaderboard.length + 1,
        msv: user.msv,
        name: user.fullName,
        cohort: user.cohort,
        xp: user.xpPoints,
        badge: user.badges[user.badges.length - 1],
        avatar: user.avatarUrl
      });
    }

    leaderboard.sort((a, b) => b.xp - a.xp);
    leaderboard.forEach((item, idx) => {
      item.rank = idx + 1;
    });

    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard));
  }

  static async getLeaderboard() {
    if (this.isServerConnected) {
      try {
        const response = await fetch('/api/leaderboard');
        if (response.ok) return await response.json();
      } catch (err) {
        console.error("Leaderboard API failed, falling back:", err);
      }
    }
    return JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || "[]");
  }

  // PROGRESS
  static async getProgress(subjectCode) {
    const user = this.getCurrentUser();
    if (!user) return { theory: 0, practice: 0 };

    if (this.isServerConnected) {
      try {
        const response = await fetch(`/api/progress/${user.msv}/${subjectCode}`);
        if (response.ok) return await response.json();
      } catch (err) {
        console.error("Progress API failed, falling back:", err);
      }
    }

    const progress = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
    const key = `${user.msv}_${subjectCode}`;
    return progress[key] || { theory: 0, practice: 0 };
  }

  static async updateProgress(subjectCode, type, percent) {
    const user = this.getCurrentUser();
    if (!user) return;

    if (this.isServerConnected) {
      try {
        const response = await fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ msv: user.msv, subjectCode, type, percent })
        });
        if (response.ok) return await response.json();
      } catch (err) {
        console.error("Update Progress API failed:", err);
      }
    }

    const progress = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
    const key = `${user.msv}_${subjectCode}`;
    if (!progress[key]) {
      progress[key] = { theory: 0, practice: 0 };
    }

    if (percent > progress[key][type]) {
      const oldPercent = progress[key][type];
      progress[key][type] = percent;
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));

      if (oldPercent < 100 && percent === 100) {
        if (type === 'theory') {
          await this.awardXP(30, `Hoàn thành ôn tập lý thuyết môn ${subjectCode}`);
        } else if (type === 'practice') {
          await this.awardXP(50, `Hoàn thành tất cả bài tập thực hành môn ${subjectCode}`);
        }
      }
    }
  }

  // ACTIVITY LOG
  static logActivityOffline(description) {
    const user = this.getCurrentUser();
    if (!user) return;
    const historyKey = `${DB_PREFIX}history_${user.msv}`;
    const logs = JSON.parse(localStorage.getItem(historyKey) || "[]");
    
    logs.unshift({
      id: "act_" + Date.now(),
      description,
      activityDescription: description,
      timestamp: new Date().toISOString()
    });

    if (logs.length > 20) logs.pop();
    localStorage.setItem(historyKey, JSON.stringify(logs));
  }

  static async getActivities() {
    const user = this.getCurrentUser();
    if (!user) return [];

    if (this.isServerConnected) {
      try {
        const response = await fetch(`/api/activities/${user.msv}`);
        if (response.ok) {
          const list = await response.json();
          // Support both properties
          return list.map(item => ({
            ...item,
            activityDescription: item.activityDescription || item.description
          }));
        }
      } catch (err) {
        console.error("Activities API failed, falling back:", err);
      }
    }

    const historyKey = `${DB_PREFIX}history_${user.msv}`;
    return JSON.parse(localStorage.getItem(historyKey) || "[]");
  }

  // FORUM OPERATIONS
  static async getForumThreads(subjectId = null) {
    if (this.isServerConnected) {
      try {
        const url = subjectId ? `/api/forum/threads?subject=${subjectId}` : '/api/forum/threads';
        const response = await fetch(url);
        if (response.ok) return await response.json();
      } catch (err) {
        console.error("Forum Threads API failed:", err);
      }
    }

    const threads = JSON.parse(localStorage.getItem(FORUM_KEY) || "[]");
    if (subjectId) {
      return threads.filter(t => t.subjectId === subjectId);
    }
    return threads;
  }

  static async getForumThreadById(id) {
    if (this.isServerConnected) {
      try {
        const response = await fetch(`/api/forum/threads/${id}`);
        if (response.ok) return await response.json();
      } catch (err) {
        console.error("Forum Thread Detail API failed:", err);
      }
    }

    const threads = JSON.parse(localStorage.getItem(FORUM_KEY) || "[]");
    return threads.find(t => t.id === id) || null;
  }

  static async createForumThread(subjectId, title, content, tags) {
    const user = this.getCurrentUser();
    if (!user) return { success: false, message: "Vui lòng đăng nhập!" };

    let subjectName = "Diễn đàn chung";
    if (subjectId) {
      const subject = this.getSubjectByCode(subjectId);
      if (subject) subjectName = subject.name;
    }

    if (this.isServerConnected) {
      try {
        const response = await fetch('/api/forum/threads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ msv: user.msv, subjectId, subjectName, title, content, tags })
        });
        if (response.ok) {
          const res = await response.json();
          if (res.success && res.user) {
            localStorage.setItem(SESSION_KEY, JSON.stringify(res.user));
            this.cachedCurrentUser = res.user;
          }
          return res;
        }
      } catch (err) {
        console.error("Create Thread API failed, falling back:", err);
      }
    }

    // Offline Local Fallback
    const threads = JSON.parse(localStorage.getItem(FORUM_KEY) || "[]");
    const newThread = {
      id: "th_" + Date.now(),
      subjectId,
      subjectName,
      authorId: user.msv,
      authorName: user.fullName,
      authorAvatar: user.avatarUrl,
      title,
      content,
      tags: tags || [],
      upvotes: 1,
      downvotes: 0,
      isPinned: false,
      createdAt: new Date().toISOString(),
      comments: []
    };

    threads.unshift(newThread);
    localStorage.setItem(FORUM_KEY, JSON.stringify(threads));

    await this.awardXP(10, `Đăng bài thảo luận mới: "${title}"`);
    return { success: true, thread: newThread };
  }

  static async addComment(threadId, content, parentCommentId = null) {
    const user = this.getCurrentUser();
    if (!user) return { success: false, message: "Vui lòng đăng nhập!" };

    if (this.isServerConnected) {
      try {
        const response = await fetch(`/api/forum/threads/${threadId}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ msv: user.msv, content, parentCommentId })
        });
        if (response.ok) {
          const res = await response.json();
          if (res.success && res.user) {
            localStorage.setItem(SESSION_KEY, JSON.stringify(res.user));
            this.cachedCurrentUser = res.user;
          }
          return res;
        }
      } catch (err) {
        console.error("Add Comment API failed:", err);
      }
    }

    // Offline Local Fallback
    const threads = JSON.parse(localStorage.getItem(FORUM_KEY) || "[]");
    const threadIndex = threads.findIndex(t => t.id === threadId);
    if (threadIndex === -1) return { success: false, message: "Không tìm thấy bài viết!" };

    const thread = threads[threadIndex];
    const newComment = {
      id: "c_" + Date.now(),
      authorId: user.msv,
      authorName: user.fullName,
      authorRole: user.role,
      authorAvatar: user.avatarUrl,
      content,
      upvotes: 1,
      isHelpful: false,
      isOfficial: user.role === 'teacher' || user.role === 'admin',
      createdAt: new Date().toISOString(),
      replies: []
    };

    if (parentCommentId) {
      const parentComment = thread.comments.find(c => c.id === parentCommentId);
      if (parentComment) {
        if (!parentComment.replies) parentComment.replies = [];
        parentComment.replies.push(newComment);
      }
    } else {
      thread.comments.push(newComment);
    }

    localStorage.setItem(FORUM_KEY, JSON.stringify(threads));
    await this.awardXP(5, `Bình luận đóng góp trên diễn đàn`);
    return { success: true, comment: newComment };
  }

  static async voteThread(threadId, voteType) {
    if (this.isServerConnected) {
      try {
        const response = await fetch(`/api/forum/threads/${threadId}/vote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: voteType })
        });
        if (response.ok) return await response.json();
      } catch (err) {
        console.error("Vote API failed:", err);
      }
    }

    // Offline Local Fallback
    const threads = JSON.parse(localStorage.getItem(FORUM_KEY) || "[]");
    const thread = threads.find(t => t.id === threadId);
    if (thread) {
      if (voteType === 'up') {
        thread.upvotes += 1;
      } else {
        thread.downvotes += 1;
      }
      localStorage.setItem(FORUM_KEY, JSON.stringify(threads));
      return { success: true, upvotes: thread.upvotes, downvotes: thread.downvotes };
    }
    return { success: false };
  }

  // DOCUMENTS
  static async getDocuments(subjectId = null) {
    if (this.isServerConnected) {
      try {
        const url = subjectId ? `/api/documents?subject=${subjectId}` : '/api/documents';
        const response = await fetch(url);
        if (response.ok) return await response.json();
      } catch (err) {
        console.error("Documents API failed:", err);
      }
    }

    const docs = JSON.parse(localStorage.getItem(DOCUMENTS_KEY) || "[]");
    if (subjectId) {
      return docs.filter(d => d.subjectId === subjectId);
    }
    return docs;
  }

  static async uploadDocument(subjectId, title, fileType, fileSize, category) {
    const user = this.getCurrentUser();
    if (!user) return { success: false };

    if (this.isServerConnected) {
      try {
        const response = await fetch('/api/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ msv: user.msv, subjectId, title, fileType, fileSize, category })
        });
        if (response.ok) {
          const res = await response.json();
          if (res.success && res.user) {
            localStorage.setItem(SESSION_KEY, JSON.stringify(res.user));
            this.cachedCurrentUser = res.user;
          }
          return res;
        }
      } catch (err) {
        console.error("Upload Document API failed:", err);
      }
    }

    // Offline Local Fallback
    const docs = JSON.parse(localStorage.getItem(DOCUMENTS_KEY) || "[]");
    const newDoc = {
      id: "d_" + Date.now(),
      subjectId,
      title,
      fileType: fileType.toUpperCase(),
      fileSize,
      downloadCount: 0,
      rating: 5.0,
      category,
      url: "#"
    };

    docs.unshift(newDoc);
    localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(docs));
    await this.awardXP(15, `Đóng góp tài liệu học tập: ${title}`);
    return { success: true, doc: newDoc };
  }

  // NEWS, NCKH & THESIS
  static async getNews() {
    if (this.isServerConnected) {
      try {
        const response = await fetch('/api/news');
        if (response.ok) return await response.json();
      } catch (err) {
        console.error("News API failed:", err);
      }
    }
    return JSON.parse(localStorage.getItem(NEWS_KEY) || "[]");
  }

  static async getResearch() {
    if (this.isServerConnected) {
      try {
        const response = await fetch('/api/research');
        if (response.ok) return await response.json();
      } catch (err) {
        console.error("Research API failed:", err);
      }
    }
    return JSON.parse(localStorage.getItem(RESEARCH_KEY) || "[]");
  }

  static async registerResearch(title, studentNames, advisorName, abstract) {
    const user = this.getCurrentUser();
    if (!user) return { success: false };

    if (this.isServerConnected) {
      try {
        const response = await fetch('/api/research/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ msv: user.msv, title, studentNames, advisorName, abstract })
        });
        if (response.ok) {
          const res = await response.json();
          if (res.success && res.user) {
            localStorage.setItem(SESSION_KEY, JSON.stringify(res.user));
            this.cachedCurrentUser = res.user;
          }
          return res;
        }
      } catch (err) {
        console.error("Register Research API failed:", err);
      }
    }

    // Offline Local Fallback
    const list = JSON.parse(localStorage.getItem(RESEARCH_KEY) || "[]");
    const newRes = {
      id: "res_" + Date.now(),
      title,
      studentName: studentNames,
      advisor: advisorName,
      status: "Under Review",
      year: new Date().getFullYear().toString(),
      abstract,
      fileUrl: "#"
    };
    list.unshift(newRes);
    localStorage.setItem(RESEARCH_KEY, JSON.stringify(list));
    await this.awardXP(10, `Gửi đăng ký đề tài Nghiên cứu khoa học: ${title}`);
    return { success: true, research: newRes };
  }

  static async getThesis() {
    if (this.isServerConnected) {
      try {
        const response = await fetch('/api/thesis');
        if (response.ok) return await response.json();
      } catch (err) {
        console.error("Thesis API failed:", err);
      }
    }
    return JSON.parse(localStorage.getItem(THESIS_KEY) || "[]");
  }

  // QUIZ SUBMISSIONS
  static async getSubmissions() {
    const user = this.getCurrentUser();
    if (!user) return [];

    if (this.isServerConnected) {
      try {
        const response = await fetch(`/api/submissions/${user.msv}`);
        if (response.ok) return await response.json();
      } catch (err) {
        console.error("Submissions API failed:", err);
      }
    }

    const list = JSON.parse(localStorage.getItem(SUBMISSIONS_KEY) || "[]");
    return list.filter(s => s.msv === user.msv);
  }

  static async saveQuizSubmission(subjectCode, score, correctCount, totalCount) {
    const user = this.getCurrentUser();
    if (!user) return;

    if (this.isServerConnected) {
      try {
        const response = await fetch('/api/submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ msv: user.msv, subjectCode, score, correctCount, totalCount })
        });
        if (response.ok) {
          const res = await response.json();
          if (res.success && res.user) {
            localStorage.setItem(SESSION_KEY, JSON.stringify(res.user));
            this.cachedCurrentUser = res.user;
          }
          return res;
        }
      } catch (err) {
        console.error("Save Quiz Submission API failed:", err);
      }
    }

    // Offline Local Fallback
    const list = JSON.parse(localStorage.getItem(SUBMISSIONS_KEY) || "[]");
    const newSub = {
      id: "sub_" + Date.now(),
      msv: user.msv,
      subjectCode,
      type: "quiz",
      score,
      correctCount,
      totalCount,
      submittedAt: new Date().toISOString()
    };
    list.unshift(newSub);
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(list));

    const ratio = score / 10;
    let xpEarned = 10;
    if (ratio >= 0.7) xpEarned = 20;
    if (ratio === 1) xpEarned = 35;
    
    await this.awardXP(xpEarned, `Hoàn thành bài luyện tập trắc nghiệm môn ${subjectCode} (${score}/10đ)`);

    const prevProgress = await this.getProgress(subjectCode);
    const currentPracticeProgress = Math.max(prevProgress.practice, Math.min(100, Math.round(100 * (correctCount / totalCount))));
    await this.updateProgress(subjectCode, 'practice', currentPracticeProgress);
  }

  // CHAT HISTORY
  static async getChatHistory(subjectCode) {
    const user = this.getCurrentUser();
    if (!user) return [];

    if (this.isServerConnected) {
      try {
        const response = await fetch(`/api/ai/chat/${user.msv}/${subjectCode}`);
        if (response.ok) return await response.json();
      } catch (err) {
        console.error("Get Chat History API failed:", err);
      }
    }

    const chatDb = JSON.parse(localStorage.getItem(CHAT_KEY) || "{}");
    const key = `${user.msv}_${subjectCode}`;
    return chatDb[key] || [];
  }

  static async saveChatMessage(subjectCode, role, content, citations = []) {
    const user = this.getCurrentUser();
    if (!user) return;

    // Chat history is automatically saved on server side when /api/ai/chat is called!
    // But we keep this method for offline mode or to save locally
    const chatDb = JSON.parse(localStorage.getItem(CHAT_KEY) || "{}");
    const key = `${user.msv}_${subjectCode}`;
    if (!chatDb[key]) chatDb[key] = [];

    chatDb[key].push({
      role,
      content,
      timestamp: new Date().toISOString(),
      citations
    });

    localStorage.setItem(CHAT_KEY, JSON.stringify(chatDb));
  }

  // AI GATEWAY CONFIG
  static async getAIConfig() {
    if (this.isServerConnected) {
      try {
        const response = await fetch('/api/admin/ai-config');
        if (response.ok) return await response.json();
      } catch (err) {
        console.error("Get AI Config API failed:", err);
      }
    }
    return JSON.parse(localStorage.getItem(AI_CONFIG_KEY));
  }

  static async saveAIConfig(apiKey, provider, systemPrompt) {
    if (this.isServerConnected) {
      try {
        const response = await fetch('/api/admin/ai-config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apiKey, provider, systemPrompt })
        });
        if (response.ok) return await response.json();
      } catch (err) {
        console.error("Save AI Config API failed:", err);
      }
    }

    const config = { apiKey, provider, systemPrompt };
    localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(config));
  }

  // NOTIFICATIONS HUB
  static addNotificationOffline(title, message, category = "system") {
    const user = this.getCurrentUser();
    if (!user) return;
    const key = `${DB_PREFIX}notif_${user.msv}`;
    const list = JSON.parse(localStorage.getItem(key) || "[]");
    list.unshift({
      id: "not_" + Date.now(),
      title,
      message,
      category,
      read: false,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem(key, JSON.stringify(list));
  }

  static async getNotifications() {
    const user = this.getCurrentUser();
    if (!user) return [];

    if (this.isServerConnected) {
      try {
        const response = await fetch(`/api/notifications/${user.msv}`);
        if (response.ok) return await response.json();
      } catch (err) {
        console.error("Get Notifications API failed:", err);
      }
    }

    const key = `${DB_PREFIX}notif_${user.msv}`;
    return JSON.parse(localStorage.getItem(key) || "[]");
  }

  static async markNotificationsRead() {
    const user = this.getCurrentUser();
    if (!user) return;

    if (this.isServerConnected) {
      try {
        const response = await fetch('/api/notifications/read', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ msv: user.msv })
        });
        if (response.ok) return;
      } catch (err) {
        console.error("Mark Notifications Read API failed:", err);
      }
    }

    const key = `${DB_PREFIX}notif_${user.msv}`;
    const list = JSON.parse(localStorage.getItem(key) || "[]");
    list.forEach(n => n.read = true);
    localStorage.setItem(key, JSON.stringify(list));
  }

  // ----------------------------------------------------
  // ALIAS METHODS TO ENSURE COMPATIBILITY
  // ----------------------------------------------------
  static async getResearchProposals() {
    return await this.getResearch();
  }

  static async getActivityLog() {
    return await this.getActivities();
  }
}

// Auto-run on load
VimEduDB.init();
