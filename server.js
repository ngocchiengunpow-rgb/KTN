import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const DB_DIR = path.join(__dirname, 'server');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Khai báo cấu hình và biến trạng thái cơ sở dữ liệu MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI;
let mongoClient = null;
let mongoDb = null;
let cachedDB = null;
let isMongoConnected = false;

const app = express();
app.use(cors());
app.use(express.json());

// Phục vụ các tệp tĩnh của ứng dụng Frontend từ thư mục 'dist' (kết quả build của Vite)
app.use(express.static(path.join(__dirname, 'dist')));

// Ensure database directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// ----------------------------------------------------
// DEFAULT SEED DATA DEFINITIONS
// ----------------------------------------------------

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

const DEFAULT_FORUM = [
  {
    id: "th_1",
    subjectId: "21005",
    subjectName: "Kinh tế vi mô",
    authorId: "std_2",
    authorName: "Phạm Minh Trang",
    authorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100",
    title: "Mẹo phân biệt nhanh Co giãn cầu theo giá (EDp) và Co giãn chéo (Exy)?",
    content: "Chào mọi người ạ, em đang ôn thi cuối kỳ môn Kinh tế vi mô nhưng cứ bị nhầm lẫn giữa hệ số co giãn cầu theo giá và hệ số co giãn chéo khi làm trắc nghiệm tính toán nhanh. Mọi người có mẹo hay công thức nào trực quan dễ nhớ không chỉ em với ạ? Em cảm ơn nhiều!",
    tags: ["ôn-tập", "câu-hỏi"],
    upvotes: 24,
    downvotes: 1,
    isPinned: true,
    createdAt: "2026-05-20T10:30:00Z",
    comments: [
      {
        id: "c_1",
        authorId: "std_4",
        authorName: "Nguyễn Hoàng Nam",
        authorRole: "student",
        authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
        content: "Cực dễ nè Trang. Cứ nhớ: \n- EDp (Co giãn theo GIÁ CỦA CHÍNH NÓ): chỉ xét 1 sản phẩm. Giá tăng -> mua ít đi (EDp âm). \n- Exy (Co giãn CHÉO): xét 2 sản phẩm khác nhau X và Y. Exy > 0 là thay thế (Trà tăng giá -> mua Cà phê nhiều hơn). Exy < 0 là bổ sung (Máy in tăng giá -> mua ít Mực hơn). Cứ bấm máy theo đúng công thức tỉ lệ % là ra thôi!",
        upvotes: 15,
        isHelpful: true,
        createdAt: "2026-05-20T11:15:00Z",
        replies: [
          {
            id: "r_1",
            authorId: "std_2",
            authorName: "Phạm Minh Trang",
            authorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100",
            content: "Oa dễ hiểu quá! Cảm ơn anh Nam nhiều nhé ạ, em thông suốt rồi!",
            upvotes: 4,
            createdAt: "2026-05-20T12:00:00Z"
          }
        ]
      },
      {
        id: "c_2",
        authorId: "tch_1",
        authorName: "TS. Nguyễn Thị Hồng Vân",
        authorRole: "teacher",
        authorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100",
        content: "Bạn Nam giải thích rất chính xác. Các em sinh viên lưu ý kỹ dấu của Exy khi làm bài thi trắc nghiệm nhé. Rất nhiều em mất điểm đáng tiếc vì nhầm dấu âm/dương ở phần này. Thân ái!",
        upvotes: 32,
        isHelpful: false,
        isOfficial: true,
        createdAt: "2026-05-20T14:30:00Z"
      }
    ]
  },
  {
    id: "th_2",
    subjectId: "15648",
    subjectName: "Thanh toán quốc tế",
    authorId: "std_3",
    authorName: "Trần Đức Anh",
    authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
    title: "Hỏi về điều khoản 'UCP 600' trong thanh toán bằng tín dụng chứng từ L/C",
    content: "Mọi người cho em hỏi, tại sao trong tất cả các thư tín dụng L/C thực tế, người ta đều phải ghi câu chữ áp dụng UCP 600? Nếu không ghi thì có sao không ạ và nguồn luật nào sẽ điều chỉnh tranh chấp nếu có?",
    tags: ["câu-hỏi"],
    upvotes: 18,
    downvotes: 0,
    isPinned: false,
    createdAt: "2026-05-21T08:20:00Z",
    comments: [
      {
        id: "c_3",
        authorId: "std_5",
        authorName: "Lê Thị Lan Anh",
        authorRole: "student",
        authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
        content: "UCP 600 là Quy tắc thực hành thống nhất về Tín dụng chứng từ do Phòng Thương mại Quốc tế (ICC) ban hành. Bản thân UCP 600 KHÔNG phải là luật quốc gia hay công ước quốc tế bắt buộc. Nó chỉ có tính chất pháp lý ràng buộc khi các bên tuyên bố áp dụng nó trực tiếp vào nội dung L/C. Nếu không dẫn chiếu UCP 600, ngân hàng sẽ gặp khó khăn lớn vì không có quy tắc chuẩn để kiểm tra chứng từ, khi đó luật quốc gia của nước phát hành L/C hoặc luật do tòa án chỉ định sẽ điều chỉnh, rất rắc rối!",
        upvotes: 14,
        isHelpful: true,
        createdAt: "2026-05-21T09:05:00Z"
      }
    ]
  },
  {
    id: "th_3",
    subjectId: "15625",
    subjectName: "Giao nhận vận tải quốc tế",
    authorId: "std_1",
    authorName: "Đỗ Tuấn Kiệt",
    authorAvatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100",
    title: "[Tổng hợp tài liệu] Đề thi thử + Slide bài giảng thầy Nam Giao nhận vận tải",
    content: "Chào các K64-K65 đang gánh tạ môn Giao nhận vận tải quốc tế. Mình vừa xin được bộ tài liệu cực chất của thầy Nam, bao gồm slide tóm tắt 6 chương học và 3 bộ đề thi trắc nghiệm thử kèm đáp án chi tiết. Mình up lên kho tài liệu nội bộ rồi nhé, hoặc mọi người có thể down trực tiếp ở link đính kèm này nhé!",
    tags: ["chia-sẻ-tài-liệu"],
    upvotes: 45,
    downvotes: 0,
    isPinned: false,
    createdAt: "2026-05-22T02:00:00Z",
    comments: []
  }
];

const DEFAULT_LEADERBOARD = [
  { rank: 1, msv: "72304", name: "Nguyễn Thị Phương Thảo", cohort: "K63", xp: 1250, badge: "Xuất Sắc", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" },
  { rank: 2, msv: "74052", name: "Lê Hoàng Long", cohort: "K64", xp: 1120, badge: "Nhà nghiên cứu", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100" },
  { rank: 3, msv: "75128", name: "Đỗ Tuấn Kiệt", cohort: "K64", xp: 980, badge: "Nhà nghiên cứu", avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100" },
  { rank: 4, msv: "76301", name: "Phạm Minh Trang", cohort: "K65", xp: 850, badge: "Chuyên gia", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100" },
  { rank: 5, msv: "74889", name: "Nguyễn Hoàng Nam", cohort: "K64", xp: 820, badge: "Chuyên gia", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" },
  { rank: 6, msv: "76991", name: "Trần Đức Anh", cohort: "K65", xp: 750, badge: "Chuyên gia", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100" },
  { rank: 7, msv: "76024", name: "Lê Thị Lan Anh", cohort: "K65", xp: 680, badge: "Học giả", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" },
  { rank: 8, msv: "77045", name: "Vũ Khánh Linh", cohort: "K66", xp: 450, badge: "Tân sinh viên", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100" },
  { rank: 9, msv: "77123", name: "Hoàng Minh Quân", cohort: "K66", xp: 390, badge: "Tân sinh viên", avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100" }
];

const DEFAULT_NEWS = [
  {
    id: "n_1",
    title: "Thông báo đăng ký đề tài Nghiên cứu khoa học sinh viên năm học 2026-2027",
    category: "Thông báo",
    summary: "Khoa Kinh tế chính thức phát động phong trào NCKH sinh viên cấp trường. Thời gian nộp form đăng ký đề tài trực tuyến kéo dài từ 25/05/2026 đến hết ngày 15/06/2026.",
    content: "Khoa Kinh tế thông báo đến toàn thể sinh viên ngành Kinh tế Ngoại thương và Kinh doanh Quốc tế về việc đăng ký đề tài Nghiên cứu khoa học sinh viên năm học mới. Các nhóm nghiên cứu (từ 3 đến 5 sinh viên) chủ động tìm kiếm giảng viên hướng dẫn khoa học, lập đề cương sơ bộ và đăng ký trực tuyến trên cổng thông tin VimEdu NCKH.\n\nCác lĩnh vực nghiên cứu khuyến khích năm nay:\n1. Tác động của các hiệp định thương mại tự do thế hệ mới (CPTPP, EVFTA) đến xuất khẩu của Việt Nam.\n2. Phát triển cảng xanh và chuỗi cung ứng logistics bền vững tại Hải Phòng.\n3. Thương mại điện tử xuyên biên giới và các rào cản thông quan hải quan.\n\nKinh phí hỗ trợ nghiên cứu cấp trường lên tới 10.000.000 VNĐ/đề tài xuất sắc.",
    author: "Ban trợ lý NCKH - Khoa Kinh tế",
    date: "2026-05-22"
  },
  {
    id: "n_2",
    title: "Gặp gỡ doanh nghiệp Logistics Hải Phòng & Cơ hội tuyển dụng K63",
    category: "Sự kiện",
    summary: "Chương trình tọa đàm định hướng nghề nghiệp và tuyển dụng trực tiếp của các tập đoàn Giao nhận - Hải quan hàng đầu dành cho sinh viên chuẩn bị tốt nghiệp.",
    content: "Nhằm tạo cầu nối vững chắc giữa sinh viên chuẩn bị tốt nghiệp và cộng đồng doanh nghiệp logistics, Khoa Kinh tế phối hợp cùng Hiệp hội Logistics Hải Phòng tổ chức ngày hội định hướng nghề nghiệp lớn nhất năm.\n\nThời gian: 08:00 ngày 28/05/2026\nĐịa điểm: Hội trường A7, Đại học Hàng Hải Việt Nam\n\nKhách mời tham gia:\n- Đại diện Tổng công ty Tân Cảng Sài Gòn\n- Công ty Cổ phần Giao nhận Kho vận Hải Phòng (VICONSHIP)\n- Các chuyên gia hải quan cấp cao của Cục Hải quan Hải Phòng.\n\nSinh viên mang theo CV bản cứng để ứng tuyển trực tiếp vào các vị trí thực tập sinh có lương, nhân viên chứng từ xuất nhập khẩu (Docs), nhân viên hiện trường (Ops) và nhân viên bán cước (Sales Logistics).",
    author: "Ban truyền thông VMU",
    date: "2026-05-18"
  },
  {
    id: "n_3",
    title: "Chương trình học bổng chuyên ngành Ngoại thương từ tập đoàn cảng biển PSA Singapore",
    category: "Học bổng",
    summary: "PSA Singapore trao tặng 5 suất học bổng toàn phần trị giá 50.000.000đ/suất dành cho sinh viên xuất sắc chuyên ngành KTNT có IELTS từ 6.5 trở lên.",
    content: "Tập đoàn cảng biển toàn cầu PSA Singapore thông báo chương trình học bổng thường niên dành cho sinh viên năm 3 và năm 4 ngành Kinh tế Ngoại thương VMU. \n\nĐiều kiện xét tuyển:\n- GPA tích lũy tính đến kỳ gần nhất đạt tối thiểu 3.2/4.0.\n- Có chứng chỉ tiếng Anh IELTS >= 6.5 hoặc tương đương.\n- Tích cực tham gia các phong trào Đoàn, hoạt động NCKH.\n\nHồ sơ ứng tuyển bao gồm bảng điểm tiếng Việt, CV tiếng Anh, thư giới thiệu từ Giảng viên chủ nhiệm gửi về văn phòng Khoa Kinh tế trước ngày 05/06/2026.",
    author: "Văn phòng Học bổng Quốc tế",
    date: "2026-05-15"
  }
];

const DEFAULT_DOCUMENTS = [
  {
    id: "d_1",
    subjectId: "15648",
    title: "Giáo trình Thanh Toán Quốc Tế - ĐH Ngoại Thương (Bản PDF Full)",
    fileType: "PDF",
    fileSize: "18.2 MB",
    downloadCount: 1420,
    rating: 4.8,
    category: "textbook",
    url: "#"
  },
  {
    id: "d_2",
    subjectId: "15648",
    title: "Bộ 150 câu hỏi trắc nghiệm ôn tập Thanh Toán Quốc Tế có đáp án",
    fileType: "DOCX",
    fileSize: "2.4 MB",
    downloadCount: 895,
    rating: 4.9,
    category: "exam",
    url: "#"
  },
  {
    id: "d_3",
    subjectId: "21005",
    title: "Slide bài giảng tóm tắt 8 chương Kinh Tế Vi Mô - TS. Hồng Vân",
    fileType: "PPTX",
    fileSize: "12.5 MB",
    downloadCount: 2150,
    rating: 4.7,
    category: "lecture",
    url: "#"
  },
  {
    id: "d_4",
    subjectId: "15818",
    title: "Đề thi tự luận giữa kỳ môn Tổng quan Logistics & Chuỗi cung ứng (Kỳ I 2025)",
    fileType: "PDF",
    fileSize: "1.1 MB",
    downloadCount: 612,
    rating: 4.5,
    category: "exam",
    url: "#"
  }
];

const DEFAULT_RESEARCH = [
  {
    id: "res_1",
    title: "Giải pháp nâng cao năng lực xếp dỡ và tối ưu hóa quy trình giao nhận container tại cảng Tân Vũ, Hải Phòng",
    studentName: "Nguyễn Hoàng Nam, Lê Hoàng Long",
    advisor: "TS. Nguyễn Thị Hồng Vân",
    status: "Approved",
    year: "2025",
    abstract: "Nghiên cứu tập trung phân tích thực trạng quá trình xếp dỡ và lưu bãi container tại cảng Tân Vũ, chỉ ra các điểm nghẽn gây lãng phí thời gian và đề xuất áp dụng giải pháp cảng thông minh số hóa thông tin.",
    fileUrl: "#"
  },
  {
    id: "res_2",
    title: "Ứng dụng Incoterms 2020 trong hoạt động xuất khẩu thủy sản của các doanh nghiệp trên địa bàn thành phố Hải Phòng",
    studentName: "Phạm Minh Trang",
    advisor: "ThS. Trần Quang Nam",
    status: "Approved",
    year: "2025",
    abstract: "Khảo sát thực tế việc lựa chọn các điều kiện Incoterms của 25 doanh nghiệp thủy sản Hải Phòng, phân tích nguyên nhân tại sao FOB vẫn chiếm thế độc tôn và đề xuất giải pháp thúc đẩy xuất khẩu CIF nâng cao chuỗi giá trị.",
    fileUrl: "#"
  },
  {
    id: "res_3",
    title: "Tác động của cuộc xung đột Biển Đỏ đến chi phí bảo hiểm và giá cước vận tải biển của hàng hóa xuất khẩu Việt Nam đi châu Âu",
    studentName: "Đỗ Tuấn Kiệt, Trần Đức Anh",
    advisor: "PGS.TS. Ngô Vĩnh Bạch Dương",
    status: "Under Review",
    year: "2026",
    abstract: "Nghiên cứu định lượng biến động giá cước giao ngay và phí bảo hiểm chiến tranh từ cuối năm 2023 đến nay, đưa ra các mô hình dự báo và giải pháp ứng phó cho doanh nghiệp ngoại thương Việt Nam.",
    fileUrl: "#"
  }
];

const DEFAULT_THESIS = [
  {
    id: "the_1",
    title: "Khóa luận: Quy trình tổ chức giao nhận hàng hóa nhập khẩu bằng đường biển của Công ty Cổ phần Viconship Hải Phòng",
    studentName: "Trần Thị Tuyết Mai",
    advisor: "TS. Nguyễn Thị Hồng Vân",
    year: "2025",
    grade: "9.2/10",
    abstract: "Mô tả chi tiết từ khâu nhận thông báo hàng đến (AN), làm thủ tục hải quan điện tử trên phần mềm ECUS, nộp thuế, đổi lệnh giao hàng (D/O) tại hãng tàu đến khâu điều xe container vận chuyển hàng ra khỏi cảng.",
    fileUrl: "#"
  },
  {
    id: "the_2",
    title: "Khóa luận: Phân tích quy trình mở thư tín dụng L/C nhập khẩu nguyên liệu sản xuất tại Ngân hàng Vietcombank chi nhánh Hải Phòng",
    studentName: "Phạm Hữu Nhân",
    advisor: "ThS. Bùi Thị Thanh Hương",
    year: "2025",
    grade: "8.9/10",
    abstract: "Phân tích các bước thẩm định hồ sơ của doanh nghiệp nhập khẩu, ký quỹ bảo đảm, soạn thảo L/C điện Swift MT700, kiểm tra bộ chứng từ thanh toán do ngân hàng nước ngoài gửi về.",
    fileUrl: "#"
  }
];

const INITIAL_DB = {
  users: DEFAULT_USERS,
  forum: DEFAULT_FORUM,
  leaderboard: DEFAULT_LEADERBOARD,
  news: DEFAULT_NEWS,
  documents: DEFAULT_DOCUMENTS,
  research: DEFAULT_RESEARCH,
  thesis: DEFAULT_THESIS,
  progress: {},
  submissions: [],
  activities: {},
  notifications: {},
  chat: {},
  aiconfig: {
    apiKey: process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || "",
    provider: process.env.GEMINI_API_KEY ? "gemini" : (process.env.OPENAI_API_KEY ? "openai" : "gemini"),
    systemPrompt: "Bạn là trợ lý học tập cực kỳ thông minh của Khoa Kinh Tế, Trường Đại học Hàng Hải Việt Nam (VMU).\nMôn học hiện tại: {subjectName} (Mã môn: {subjectCode}).\nHọc kỳ: {semester}.\nSinh viên hiện tại: {studentName} (MSV: {studentMsv}).\n\nNhiệm vụ của bạn là giải đáp tất cả thắc mắc lý thuyết, thuật ngữ chuyên ngành Kinh tế Ngoại thương liên quan đến môn học này. Trả lời bằng tiếng Việt chuyên nghiệp, dễ hiểu đối với trình độ đại học. Tuyệt đối KHÔNG trực tiếp đưa đáp án bài tập cụ thể cho sinh viên, mà hãy gợi ý hướng tiếp cận và công thức cần dùng."
  }
};

// ----------------------------------------------------
// DATABASE MANAGEMENT FUNCTIONS (MongoDB Cloud + In-Memory Cache)
// ----------------------------------------------------

// Khởi tạo Database (Tải dữ liệu từ MongoDB Atlas đám mây hoặc fallback về local db.json)
async function initDatabase() {
  if (MONGODB_URI) {
    try {
      console.log("====================================================");
      console.log("Đang kết nối tới cơ sở dữ liệu đám mây MongoDB Atlas...");
      mongoClient = new MongoClient(MONGODB_URI);
      await mongoClient.connect();
      mongoDb = mongoClient.db('vimedu');
      console.log("Kết nối thành công tới MongoDB Atlas!");
      
      const collection = mongoDb.collection('store');
      const doc = await collection.findOne({ _id: "db_json" });
      if (doc) {
        cachedDB = doc.data;
        console.log("Tải dữ liệu thành công từ đám mây MongoDB Atlas.");
      } else {
        cachedDB = { ...INITIAL_DB };
        await collection.insertOne({ _id: "db_json", data: cachedDB });
        console.log("Đã khởi tạo dữ liệu mẫu đầu tiên lên MongoDB Atlas.");
      }
      isMongoConnected = true;
      console.log("====================================================");
    } catch (err) {
      console.error("Lỗi kết nối MongoDB Atlas, sử dụng db.json cục bộ làm dự phòng:", err);
      loadLocalDB();
    }
  } else {
    console.log("Không tìm thấy biến MONGODB_URI. Sử dụng db.json cục bộ.");
    loadLocalDB();
  }
}

// Hàm tải dữ liệu từ tệp db.json cục bộ
function loadLocalDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DB, null, 2), 'utf-8');
    cachedDB = { ...INITIAL_DB };
  } else {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      cachedDB = JSON.parse(raw);
    } catch (err) {
      console.error("Lỗi đọc db.json, khôi phục lại dữ liệu mẫu cục bộ:", err);
      cachedDB = { ...INITIAL_DB };
    }
  }
}

function readDB() {
  if (!cachedDB) {
    loadLocalDB();
  }
  return cachedDB;
}

function writeDB(data) {
  cachedDB = data;
  
  // Ghi bất đồng bộ ra local db.json để backup dự phòng
  fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), 'utf-8', (err) => {
    if (err) {
      console.error("Lỗi ghi sao lưu db.json cục bộ:", err);
    }
  });
  
  // Nếu đã kết nối MongoDB Atlas thành công, đồng bộ dữ liệu ngầm lên đám mây (Background Sync)
  if (isMongoConnected && mongoDb) {
    mongoDb.collection('store')
      .updateOne({ _id: "db_json" }, { $set: { data: data } }, { upsert: true })
      .catch((err) => {
        console.error("Lỗi đồng bộ dữ liệu lên MongoDB Atlas trong background:", err);
      });
  }
}

// ----------------------------------------------------
// API ROUTES IMPLEMENTATION
// ----------------------------------------------------

// AUTHENTICATION
app.post('/api/auth/login', (req, res) => {
  const { msv, password } = req.body;
  if (!msv || !password) {
    return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ thông tin!" });
  }

  const db = readDB();
  const user = db.users.find(u => u.msv.toLowerCase() === msv.toLowerCase().trim() && u.password === password);
  if (user) {
    return res.json({ success: true, user });
  }
  return res.json({ success: false, message: "Mã sinh viên hoặc mật khẩu không chính xác!" });
});

app.post('/api/auth/register', (req, res) => {
  const { msv, fullName, email, password, cohort } = req.body;
  if (!msv || !fullName || !email || !password || !cohort) {
    return res.status(400).json({ success: false, message: "Thiếu thông tin đăng ký!" });
  }

  const db = readDB();
  if (db.users.some(u => u.msv.toLowerCase() === msv.toLowerCase().trim())) {
    return res.json({ success: false, message: "Mã sinh viên đã được đăng ký trong hệ thống!" });
  }
  if (db.users.some(u => u.email.toLowerCase() === email.toLowerCase().trim())) {
    return res.json({ success: false, message: "Email đã được sử dụng!" });
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

  db.users.push(newUser);

  // Sync to Leaderboard
  const existing = db.leaderboard.find(item => item.msv === newUser.msv);
  if (!existing) {
    db.leaderboard.push({
      rank: db.leaderboard.length + 1,
      msv: newUser.msv,
      name: newUser.fullName,
      cohort: newUser.cohort,
      xp: newUser.xpPoints,
      badge: newUser.badges[newUser.badges.length - 1],
      avatar: newUser.avatarUrl
    });
  }

  // Sort Leaderboard
  db.leaderboard.sort((a, b) => b.xp - a.xp);
  db.leaderboard.forEach((item, idx) => {
    item.rank = idx + 1;
  });

  writeDB(db);
  return res.json({ success: true, user: newUser });
});

// USERS & LEADERBOARD
app.get('/api/users', (req, res) => {
  const db = readDB();
  // Strip password for safety
  const safeUsers = db.users.map(({ password, ...u }) => u);
  res.json(safeUsers);
});

app.post('/api/users/xp', (req, res) => {
  const { msv, points, reason } = req.body;
  if (!msv || points === undefined) {
    return res.status(400).json({ success: false, message: "Thông tin không hợp lệ!" });
  }

  const db = readDB();
  const user = db.users.find(u => u.msv === msv);
  if (!user) {
    return res.status(404).json({ success: false, message: "Người dùng không tồn tại!" });
  }

  user.xpPoints = (user.xpPoints || 0) + points;

  // Evaluate badges
  const badges = [...user.badges];
  let newBadgeNotification = null;

  if (user.xpPoints >= 100 && !badges.includes("Học giả")) {
    badges.push("Học giả");
    newBadgeNotification = { title: "Chúc mừng!", message: "Bạn đã đạt cấp bậc Học giả Ngoại thương!" };
  }
  if (user.xpPoints >= 400 && !badges.includes("Chuyên gia")) {
    badges.push("Chuyên gia");
    newBadgeNotification = { title: "Chúc mừng!", message: "Bạn đã đạt cấp bậc Chuyên gia Ngoại thương!" };
  }
  if (user.xpPoints >= 800 && !badges.includes("Nhà nghiên cứu")) {
    badges.push("Nhà nghiên cứu");
    newBadgeNotification = { title: "Chúc mừng!", message: "Bạn đã đạt cấp bậc Nhà nghiên cứu khoa học!" };
  }
  if (user.xpPoints >= 1200 && !badges.includes("Xuất Sắc")) {
    badges.push("Xuất Sắc");
    newBadgeNotification = { title: "Vinh danh!", message: "Bạn đã ghi danh vào danh sách Xuất Sắc Toàn Diện của Khoa!" };
  }
  user.badges = badges;

  // Add Notification if earned badge
  if (newBadgeNotification) {
    if (!db.notifications[msv]) db.notifications[msv] = [];
    db.notifications[msv].unshift({
      id: "not_" + Date.now(),
      title: newBadgeNotification.title,
      message: newBadgeNotification.message,
      read: false,
      timestamp: new Date().toISOString()
    });
  }

  // Sync to Leaderboard
  if (user.role === 'student') {
    const existing = db.leaderboard.find(item => item.msv === user.msv);
    if (existing) {
      existing.xp = user.xpPoints;
      existing.name = user.fullName;
      existing.cohort = user.cohort;
      existing.badge = user.badges[user.badges.length - 1];
    } else {
      db.leaderboard.push({
        rank: db.leaderboard.length + 1,
        msv: user.msv,
        name: user.fullName,
        cohort: user.cohort,
        xp: user.xpPoints,
        badge: user.badges[user.badges.length - 1],
        avatar: user.avatarUrl
      });
    }
    // Re-sort
    db.leaderboard.sort((a, b) => b.xp - a.xp);
    db.leaderboard.forEach((item, idx) => {
      item.rank = idx + 1;
    });
  }

  // Log activity
  if (!db.activities[msv]) db.activities[msv] = [];
  db.activities[msv].unshift({
    id: "act_" + Date.now(),
    description: `Nhận +${points} XP - ${reason}`,
    timestamp: new Date().toISOString()
  });
  if (db.activities[msv].length > 20) db.activities[msv].pop();

  writeDB(db);
  res.json({ success: true, xpPoints: user.xpPoints, badges: user.badges, user });
});

app.get('/api/leaderboard', (req, res) => {
  const db = readDB();
  res.json(db.leaderboard);
});

// PROGRESS MANAGEMENT
app.get('/api/progress/:msv/:subjectCode', (req, res) => {
  const { msv, subjectCode } = req.params;
  const db = readDB();
  const key = `${msv}_${subjectCode}`;
  const prog = db.progress[key] || { theory: 0, practice: 0 };
  res.json(prog);
});

app.post('/api/progress', (req, res) => {
  const { msv, subjectCode, type, percent } = req.body;
  if (!msv || !subjectCode || !type || percent === undefined) {
    return res.status(400).json({ success: false, message: "Thông tin không hợp lệ!" });
  }

  const db = readDB();
  const key = `${msv}_${subjectCode}`;
  if (!db.progress[key]) {
    db.progress[key] = { theory: 0, practice: 0 };
  }

  if (percent > db.progress[key][type]) {
    db.progress[key][type] = percent;
    writeDB(db);
  }

  res.json({ success: true, progress: db.progress[key] });
});

// FORUM
app.get('/api/forum/threads', (req, res) => {
  const { subject } = req.query;
  const db = readDB();
  let threads = db.forum;
  if (subject) {
    threads = threads.filter(t => t.subjectId === subject);
  }
  res.json(threads);
});

app.get('/api/forum/threads/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const thread = db.forum.find(t => t.id === id);
  if (thread) {
    return res.json(thread);
  }
  res.status(404).json({ success: false, message: "Không tìm thấy thread!" });
});

app.post('/api/forum/threads', (req, res) => {
  const { msv, subjectId, subjectName, title, content, tags } = req.body;
  if (!msv || !title || !content) {
    return res.status(400).json({ success: false, message: "Thiếu thông tin bài đăng!" });
  }

  const db = readDB();
  const user = db.users.find(u => u.msv === msv);
  if (!user) {
    return res.status(404).json({ success: false, message: "Người dùng không tồn tại!" });
  }

  const newThread = {
    id: "th_" + Date.now(),
    subjectId: subjectId || null,
    subjectName: subjectName || "Diễn đàn chung",
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

  db.forum.unshift(newThread);

  // Award XP inside the server!
  // Send request internally to add XP
  user.xpPoints = (user.xpPoints || 0) + 10;
  // Sync to leaderboard
  const lbExisting = db.leaderboard.find(item => item.msv === user.msv);
  if (lbExisting) lbExisting.xp = user.xpPoints;
  db.leaderboard.sort((a, b) => b.xp - a.xp);
  db.leaderboard.forEach((item, idx) => { item.rank = idx + 1; });

  // Log activity
  if (!db.activities[msv]) db.activities[msv] = [];
  db.activities[msv].unshift({
    id: "act_" + Date.now(),
    description: `Đăng bài thảo luận mới: "${title}"`,
    timestamp: new Date().toISOString()
  });

  // Tự động thông báo tới các thành viên khác
  notifyAllOtherUsers(db, msv, "Thảo luận mới trên diễn đàn", `${user.fullName} vừa đăng thảo luận mới: "${title}"`, "forum");

  writeDB(db);
  res.json({ success: true, thread: newThread, user });
});

app.post('/api/forum/threads/:id/comments', (req, res) => {
  const { id } = req.params;
  const { msv, content, parentCommentId } = req.body;
  if (!msv || !content) {
    return res.status(400).json({ success: false, message: "Bình luận trống!" });
  }

  const db = readDB();
  const threadIndex = db.forum.findIndex(t => t.id === id);
  if (threadIndex === -1) {
    return res.status(404).json({ success: false, message: "Không tìm thấy bài viết!" });
  }

  const user = db.users.find(u => u.msv === msv);
  if (!user) {
    return res.status(404).json({ success: false, message: "Người dùng không tồn tại!" });
  }

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

  const thread = db.forum[threadIndex];
  if (parentCommentId) {
    const parentComment = thread.comments.find(c => c.id === parentCommentId);
    if (parentComment) {
      if (!parentComment.replies) parentComment.replies = [];
      parentComment.replies.push(newComment);
    } else {
      thread.comments.push(newComment);
    }
  } else {
    thread.comments.push(newComment);
  }

  // Award XP
  user.xpPoints = (user.xpPoints || 0) + 5;
  const lbExisting = db.leaderboard.find(item => item.msv === user.msv);
  if (lbExisting) lbExisting.xp = user.xpPoints;
  db.leaderboard.sort((a, b) => b.xp - a.xp);
  db.leaderboard.forEach((item, idx) => { item.rank = idx + 1; });

  // Tự động gửi thông báo tới tác giả bài viết
  if (thread.authorId !== msv) {
    pushServerNotification(db, thread.authorId, "Bình luận mới về bài viết của bạn", `${user.fullName} đã bình luận bài viết của bạn: "${content.substring(0, 40)}${content.length > 40 ? '...' : ''}"`, "forum");
  }
  // Gửi thông báo tới tác giả bình luận cha (nếu có phản hồi)
  if (parentCommentId) {
    const parentComment = thread.comments.find(c => c.id === parentCommentId);
    if (parentComment && parentComment.authorId !== msv && parentComment.authorId !== thread.authorId) {
      pushServerNotification(db, parentComment.authorId, "Có phản hồi bình luận của bạn", `${user.fullName} đã trả lời bình luận của bạn trong thảo luận "${thread.title}"`, "forum");
    }
  }

  writeDB(db);
  res.json({ success: true, comment: newComment, user });
});

app.post('/api/forum/threads/:id/vote', (req, res) => {
  const { id } = req.params;
  const { type } = req.body; // 'up' or 'down'
  const db = readDB();
  const thread = db.forum.find(t => t.id === id);
  if (thread) {
    if (type === 'up') {
      thread.upvotes += 1;
    } else {
      thread.downvotes += 1;
    }
    writeDB(db);
    return res.json({ success: true, upvotes: thread.upvotes, downvotes: thread.downvotes });
  }
  res.status(404).json({ success: false, message: "Không tìm thấy thread!" });
});

// DOCUMENTS
app.get('/api/documents', (req, res) => {
  const { subject } = req.query;
  const db = readDB();
  let docs = db.documents;
  if (subject) {
    docs = docs.filter(d => d.subjectId === subject);
  }
  res.json(docs);
});

app.post('/api/documents', (req, res) => {
  const { msv, subjectId, title, fileType, fileSize, category } = req.body;
  if (!msv || !subjectId || !title || !fileType) {
    return res.status(400).json({ success: false, message: "Thông tin tài liệu không hợp lệ!" });
  }

  const db = readDB();
  const user = db.users.find(u => u.msv === msv);
  if (!user) {
    return res.status(404).json({ success: false, message: "Không tìm thấy sinh viên!" });
  }

  const newDoc = {
    id: "d_" + Date.now(),
    subjectId,
    title,
    fileType: fileType.toUpperCase(),
    fileSize: fileSize || "1.0 MB",
    downloadCount: 0,
    rating: 5.0,
    category: category || "textbook",
    url: "#"
  };

  db.documents.unshift(newDoc);

  // Award XP
  user.xpPoints = (user.xpPoints || 0) + 15;
  const lbExisting = db.leaderboard.find(item => item.msv === user.msv);
  if (lbExisting) lbExisting.xp = user.xpPoints;
  db.leaderboard.sort((a, b) => b.xp - a.xp);
  db.leaderboard.forEach((item, idx) => { item.rank = idx + 1; });

  // Log activity
  if (!db.activities[msv]) db.activities[msv] = [];
  db.activities[msv].unshift({
    id: "act_" + Date.now(),
    description: `Đóng góp tài liệu học tập: ${title}`,
    timestamp: new Date().toISOString()
  });

  // Tự động thông báo tới các thành viên khác
  notifyAllOtherUsers(db, msv, "Tài liệu học tập mới được đóng góp", `Tài liệu học tập mới "${title}" vừa được đóng góp cho học phần ${getSubjectName(subjectId)}.`, "document");

  writeDB(db);
  res.json({ success: true, doc: newDoc, user });
});

// NEWS, RESEARCH & THESIS
app.get('/api/news', (req, res) => {
  const db = readDB();
  res.json(db.news);
});

app.get('/api/research', (req, res) => {
  const db = readDB();
  res.json(db.research);
});

app.get('/api/thesis', (req, res) => {
  const db = readDB();
  res.json(db.thesis);
});

app.post('/api/research/register', (req, res) => {
  const { msv, title, studentNames, advisorName, abstract } = req.body;
  if (!msv || !title || !studentNames || !advisorName) {
    return res.status(400).json({ success: false, message: "Thiếu thông tin đăng ký!" });
  }

  const db = readDB();
  const user = db.users.find(u => u.msv === msv);
  if (!user) {
    return res.status(404).json({ success: false, message: "Không tìm thấy sinh viên!" });
  }

  const newRes = {
    id: "res_" + Date.now(),
    title,
    studentName: studentNames,
    advisor: advisorName,
    status: "Under Review",
    year: new Date().getFullYear().toString(),
    abstract: abstract || "",
    fileUrl: "#"
  };

  db.research.unshift(newRes);

  // Award XP
  user.xpPoints = (user.xpPoints || 0) + 10;
  const lbExisting = db.leaderboard.find(item => item.msv === user.msv);
  if (lbExisting) lbExisting.xp = user.xpPoints;
  db.leaderboard.sort((a, b) => b.xp - a.xp);
  db.leaderboard.forEach((item, idx) => { item.rank = idx + 1; });

  // Tự động gửi thông báo cho sinh viên đăng ký đề tài thành công
  pushServerNotification(db, msv, "Đăng ký đề tài NCKH thành công", `Đề tài "${title}" của bạn đã được đăng ký thành công trên hệ thống và đang đợi Hội đồng duyệt.`, "research");

  writeDB(db);
  res.json({ success: true, research: newRes, user });
});

// QUIZ SUBMISSIONS
app.get('/api/submissions/:msv', (req, res) => {
  const { msv } = req.params;
  const db = readDB();
  const list = db.submissions.filter(s => s.msv === msv);
  res.json(list);
});

app.post('/api/submissions', (req, res) => {
  const { msv, subjectCode, score, correctCount, totalCount } = req.body;
  if (!msv || !subjectCode || score === undefined) {
    return res.status(400).json({ success: false, message: "Thông tin không hợp lệ!" });
  }

  const db = readDB();
  const user = db.users.find(u => u.msv === msv);
  if (!user) {
    return res.status(404).json({ success: false, message: "Không tìm thấy sinh viên!" });
  }

  const newSub = {
    id: "sub_" + Date.now(),
    msv,
    subjectCode,
    type: "quiz",
    score,
    correctCount,
    totalCount,
    submittedAt: new Date().toISOString()
  };

  db.submissions.unshift(newSub);

  // Award XP
  const ratio = score / 10;
  let xpEarned = 10;
  if (ratio >= 0.7) xpEarned = 20;
  if (ratio === 1.0) xpEarned = 35;

  user.xpPoints = (user.xpPoints || 0) + xpEarned;
  const lbExisting = db.leaderboard.find(item => item.msv === user.msv);
  if (lbExisting) lbExisting.xp = user.xpPoints;
  db.leaderboard.sort((a, b) => b.xp - a.xp);
  db.leaderboard.forEach((item, idx) => { item.rank = idx + 1; });

  // Update progress practice inside the database!
  const progressKey = `${msv}_${subjectCode}`;
  if (!db.progress[progressKey]) {
    db.progress[progressKey] = { theory: 0, practice: 0 };
  }
  const currentPractice = db.progress[progressKey].practice;
  const computedPractice = Math.max(currentPractice, Math.min(100, Math.round(100 * (correctCount / totalCount))));
  db.progress[progressKey].practice = computedPractice;

  // Log activity
  if (!db.activities[msv]) db.activities[msv] = [];
  db.activities[msv].unshift({
    id: "act_" + Date.now(),
    description: `Hoàn thành bài luyện tập trắc nghiệm môn ${subjectCode} (${score}/10đ)`,
    timestamp: new Date().toISOString()
  });

  // Tự động thông báo chúc mừng kết quả làm bài trắc nghiệm
  const subjectName = getSubjectName(subjectCode);
  if (score >= 9.0) {
    pushServerNotification(db, msv, "Thành tích học tập Xuất sắc!", `Chúc mừng! Bạn đã đạt điểm số xuất sắc ${score}/10 trong bài luyện tập môn ${subjectName}! (+${xpEarned} XP)`, "quiz");
  } else if (score >= 7.0) {
    pushServerNotification(db, msv, "Thành tích học tập Khá/Giỏi", `Chúc mừng! Bạn đã hoàn thành tốt bài luyện tập môn ${subjectName} với số điểm ${score}/10. (+${xpEarned} XP)`, "quiz");
  } else {
    pushServerNotification(db, msv, "Đã ghi nhận bài luyện tập", `Bạn đã hoàn thành bài luyện tập môn ${subjectName} với số điểm ${score}/10. Hãy tiếp tục cố gắng ở các lượt sau nhé! (+${xpEarned} XP)`, "quiz");
  }

  writeDB(db);
  res.json({ success: true, submission: newSub, user, progress: db.progress[progressKey] });
});

// ACTIVITIES & NOTIFICATIONS
app.get('/api/activities/:msv', (req, res) => {
  const { msv } = req.params;
  const db = readDB();
  res.json(db.activities[msv] || []);
});

app.get('/api/notifications/:msv', (req, res) => {
  const { msv } = req.params;
  const db = readDB();
  res.json(db.notifications[msv] || []);
});

app.post('/api/notifications/read', (req, res) => {
  const { msv } = req.body;
  if (!msv) return res.status(400).json({ success: false });
  const db = readDB();
  if (db.notifications[msv]) {
    db.notifications[msv].forEach(n => n.read = true);
    writeDB(db);
  }
  res.json({ success: true });
});

// ADMIN CONFIGURATION
app.get('/api/admin/ai-config', (req, res) => {
  const db = readDB();
  res.json(db.aiconfig);
});

app.post('/api/admin/ai-config', (req, res) => {
  const { apiKey, provider, systemPrompt } = req.body;
  const db = readDB();
  db.aiconfig = { apiKey, provider, systemPrompt };
  writeDB(db);
  res.json({ success: true, aiconfig: db.aiconfig });
});

// SECURE AI CHAT GATEWAY PROXY
app.post('/api/ai/chat', async (req, res) => {
  const { subjectCode, userMessage, msv } = req.body;
  if (!subjectCode || !userMessage) {
    return res.status(400).json({ error: "Thiếu subjectCode hoặc userMessage!" });
  }

  const db = readDB();
  const config = db.aiconfig;
  const user = db.users.find(u => u.msv === msv);

  const studentName = user ? user.fullName : "Sinh viên";
  const studentMsv = user ? user.msv : "MSV";

  // Run pure-JS RAG term-frequency/relevance keyword matcher
  const chunks = retrieveRelevantContext(subjectCode, userMessage, 2);
  const citations = chunks.map(c => ({
    textbook: c.textbook,
    chapter: c.chapter,
    page: c.page,
    citation: c.citation
  }));

  // Use the system configuration's API key if available, otherwise server-side environment fallback
  const finalApiKey = config.apiKey || (config.provider === 'gemini' ? process.env.GEMINI_API_KEY : process.env.OPENAI_API_KEY) || "";

  // 1. If no API Key is available, return the dynamic RAG matched textbook response instantly!
  if (!finalApiKey || finalApiKey.trim() === "") {
    const mockRes = getAcademicMockText(subjectCode, userMessage, studentName, chunks, citations);
    saveServerChatMessage(db, msv, subjectCode, "user", userMessage, []);
    saveServerChatMessage(db, msv, subjectCode, "assistant", mockRes, citations);
    writeDB(db);
    return res.json({ text: mockRes, isMock: true, citations });
  }

  // 2. Otherwise, perform secure server-side call with injected RAG context!
  let injectedContext = "";
  if (chunks.length > 0) {
    injectedContext = "\n\n=== TÀI LIỆU GIÁO TRÌNH CHÍNH THỐNG (VimEdu RAG Context) ===\n";
    injectedContext += "Bạn bắt buộc phải ưu tiên sử dụng thông tin từ các trích lục giáo trình chính thống dưới đây để trả lời câu hỏi của sinh viên. Trả lời chính xác, trung thực, mang tính học thuật cao. KHÔNG được bịa đặt hay tự suy đoán thông tin ngoài giáo trình được cung cấp ở đây.\n";
    chunks.forEach((c, idx) => {
      injectedContext += `\n[Trích đoạn ${idx + 1}] Nguồn: ${c.citation}\nNội dung: ${c.content}\n`;
    });
    injectedContext += "\nYÊU CẦU TRÍCH NGUỒN: Cuối phản hồi, hãy đính kèm rõ chỉ dẫn nguồn dạng: '📖 Trích nguồn: Giáo trình... - Trang...'\n";
    injectedContext += "==========================================================\n";
  }

  const baseSystemPrompt = config.systemPrompt || "";
  const systemPrompt = baseSystemPrompt
    .replace("{subjectName}", getSubjectName(subjectCode))
    .replace("{subjectCode}", subjectCode)
    .replace("{semester}", `Học kỳ tương ứng`)
    .replace("{studentName}", studentName)
    .replace("{studentMsv}", studentMsv)
    + injectedContext;

  saveServerChatMessage(db, msv, subjectCode, "user", userMessage, []);

  try {
    let aiText = "";
    if (config.provider === 'gemini') {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${finalApiKey}`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: userMessage }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API returned status ${response.status}`);
      }
      const data = await response.json();
      aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Không có phản hồi từ trợ lý AI.";
    } else {
      const endpoint = "https://api.openai.com/v1/chat/completions";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${finalApiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage }
          ],
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API returned status ${response.status}`);
      }
      const data = await response.json();
      aiText = data.choices?.[0]?.message?.content || "Không có phản hồi từ trợ lý AI.";
    }

    saveServerChatMessage(db, msv, subjectCode, "assistant", aiText, citations);
    writeDB(db);
    return res.json({ text: aiText, isMock: false, citations });

  } catch (err) {
    console.error("AI Proxy Error, falling back to mock:", err);
    const mockRes = getAcademicMockText(subjectCode, userMessage, studentName, chunks, citations);
    saveServerChatMessage(db, msv, subjectCode, "assistant", mockRes, citations);
    writeDB(db);
    return res.json({ text: mockRes, isMock: true, citations, error: err.message });
  }
});

// GET CHAT HISTORY
app.get('/api/ai/chat/:msv/:subjectCode', (req, res) => {
  const { msv, subjectCode } = req.params;
  const db = readDB();
  const key = `${msv}_${subjectCode}`;
  res.json(db.chat[key] || []);
});

// ----------------------------------------------------
// UTILITIES AND HELPERS ON SERVER
// ----------------------------------------------------

// Load digitalized knowledge base
let knowledgeBase = [];
const KB_FILE_PATH = path.join(__dirname, 'server', 'knowledge_base.json');
function loadKnowledgeBase() {
  try {
    if (fs.existsSync(KB_FILE_PATH)) {
      const data = fs.readFileSync(KB_FILE_PATH, 'utf-8');
      knowledgeBase = JSON.parse(data);
    } else {
      console.warn("Knowledge base file does not exist, initializing empty array.");
      knowledgeBase = [];
    }
  } catch (err) {
    console.error("Error reading knowledge_base.json:", err);
    knowledgeBase = [];
  }
}
loadKnowledgeBase();

function pushServerNotification(db, msv, title, message, category = "system") {
  if (!msv) return;
  if (!db.notifications) db.notifications = {};
  if (!db.notifications[msv]) db.notifications[msv] = [];
  
  db.notifications[msv].unshift({
    id: "not_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
    title,
    message,
    category,
    read: false,
    timestamp: new Date().toISOString()
  });
  
  if (db.notifications[msv].length > 30) {
    db.notifications[msv].pop();
  }
}

function notifyAllOtherUsers(db, excludeMsv, title, message, category = "system") {
  if (!db.users) return;
  db.users.forEach(u => {
    if (u.msv !== excludeMsv) {
      pushServerNotification(db, u.msv, title, message, category);
    }
  });
}

// Accent and diacritic stripper for robust Vietnamese matching
function removeVietnameseAccents(str) {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

function tokenize(text) {
  const clean = removeVietnameseAccents(text);
  return clean.split(/[^a-z0-9]+/i).filter(w => w.length > 0);
}

// Retrieve relevant context chunks based on pure JS Term-Frequency keyword matching
function retrieveRelevantContext(subjectCode, query, limit = 2) {
  if (knowledgeBase.length === 0) {
    loadKnowledgeBase();
  }

  const subjectChunks = knowledgeBase.filter(chunk => chunk.subjectCode === subjectCode);
  if (subjectChunks.length === 0) {
    return [];
  }

  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) {
    return subjectChunks.slice(0, limit);
  }

  const scoredChunks = subjectChunks.map(chunk => {
    let score = 0;
    const contentText = removeVietnameseAccents(chunk.content);
    const chapterText = removeVietnameseAccents(chunk.chapter);
    const tagsText = chunk.tags.map(t => removeVietnameseAccents(t)).join(" ");
    
    queryTokens.forEach(token => {
      // 1. Term Frequency in content
      const contentOccurrences = (contentText.split(token).length - 1);
      if (contentOccurrences > 0) {
        score += contentOccurrences * 1.0;
      }
      // 2. High weight for pre-curated keywords (tags)
      const tagOccurrences = (tagsText.split(token).length - 1);
      if (tagOccurrences > 0) {
        score += tagOccurrences * 3.5;
      }
      // 3. Weight for chapter titles
      const chapterOccurrences = (chapterText.split(token).length - 1);
      if (chapterOccurrences > 0) {
        score += chapterOccurrences * 2.0;
      }
    });
    
    return { chunk, score };
  });

  // Sort by score in descending order
  scoredChunks.sort((a, b) => b.score - a.score);
  
  // Filter out 0-score items if matches exist
  const matched = scoredChunks.filter(sc => sc.score > 0);
  return matched.slice(0, limit).map(sc => sc.chunk);
}

function saveServerChatMessage(db, msv, subjectCode, role, content, citations = []) {
  if (!msv) return;
  const key = `${msv}_${subjectCode}`;
  if (!db.chat[key]) db.chat[key] = [];
  db.chat[key].push({
    role,
    content,
    timestamp: new Date().toISOString(),
    citations
  });
}

function getSubjectName(code) {
  const names = {
    "21005": "Kinh tế vi mô",
    "15635": "Giao dịch thương mại quốc tế",
    "15648": "Thanh toán quốc tế",
    "15625": "Giao nhận vận tải quốc tế",
    "15818": "Logistics & Chuỗi cung ứng"
  };
  return names[code] || "Học phần Ngoại thương";
}

function getAcademicMockText(subjectCode, userMessage, studentName, chunks = [], citations = []) {
  // If we have dynamic textbook chunks retrieved by RAG, build an immersive dynamic learning experience!
  if (chunks && chunks.length > 0) {
    const subjectName = getSubjectName(subjectCode);
    let dynamicRes = `### Trợ Lý Học Tập Chuyên Sâu VimEdu (Học liệu Giáo trình chính thống)\n\n`;
    dynamicRes += `Chào bạn **${studentName}**! Đối với câu hỏi học thuật của bạn, tôi đã tra cứu kho cơ sở tri thức chính thống và trích dẫn thông tin giáo trình sau:\n\n`;
    
    chunks.forEach((c, idx) => {
      dynamicRes += `#### Phân đoạn ${idx + 1}: ${c.chapter}\n`;
      dynamicRes += `${c.content}\n\n`;
    });
    
    dynamicRes += `> [SlimTip]\n`;
    dynamicRes += `> **Chỉ dẫn tự học:** Bạn có thể tự mình đối chiếu và tham khảo kiến thức chuyên sâu này trực tiếp trong ${citations.map(c => `**${c.textbook} (${c.chapter}) tại Trang ${c.page}**`).join(" và ")}.\n\n`;
    dynamicRes += `Chúc bạn học tập và thi cử đạt kết quả xuất sắc! Bạn có muốn làm rõ thêm bất kỳ chi tiết nào trong trích lục trên không?`;
    return dynamicRes;
  }
  
  // Otherwise, fall back to the pre-curated responses
  return getAcademicMockTextFallback(subjectCode, userMessage, studentName);
}

function getAcademicMockTextFallback(subjectCode, userMessage, studentName) {
  const msg = userMessage.toLowerCase();
  
  if (subjectCode === "21005") {
    if (msg.includes("co giãn") || msg.includes("elasticity")) {
      return `### Trợ Lý Học Tập VMU - Kinh Tế Vi Mô: Hệ Số Co Giãn (Elasticity)

Chào bạn! Hệ số co giãn là một khái niệm cực kỳ quan trọng trong học phần **Kinh tế vi mô (21005)**. Dưới đây là tóm tắt lý thuyết cốt lõi để giải đáp thắc mắc của bạn:

1. **Co giãn của cầu theo giá ($E_{Dp}$):**
   * **Công thức:** $E_{Dp} = \\frac{\\% \\Delta Q_D}{\\% \\Delta P} = \\frac{dQ_D}{dP} \\times \\frac{P}{Q_D}$.
   * **Ý nghĩa:** Đo lường phản ứng của lượng cầu khi giá bán sản phẩm thay đổi 1%.
   * **Phân loại:**
     * $|E_{Dp}| > 1$: Cầu co giãn nhiều (hàng xa xỉ, nhiều hàng thay thế). Doanh nghiệp nên **giảm giá** để tăng doanh thu ($TR$).
     * $|E_{Dp}| < 1$: Cầu co giãn ít (hàng thiết yếu, thuốc men, điện nước). Doanh nghiệp nên **tăng giá** để tăng doanh thu.
     * $|E_{Dp}| = 1$: Co giãn đơn vị. Doanh thu cực đại tại điểm này.

2. **Co giãn chéo của cầu ($E_{xy}$):**
   * **Công thức:** $E_{xy} = \\frac{\\% \\Delta Q_x}{\\% \\Delta P_y}$.
   * **Định nghĩa:** Đo lường phản ứng lượng cầu hàng hóa X khi giá hàng hóa Y biến động.
   * **Nhận diện mối quan hệ:**
     * $E_{xy} > 0$: Hai sản phẩm **Thay thế** cho nhau (ví dụ: Trà và Cà phê). Giá trà tăng làm tăng lượng cầu cà phê.
     * $E_{xy} < 0$: Hai sản phẩm **Bổ sung** cho nhau (ví dụ: Máy in và Mực in). Giá máy in tăng làm giảm lượng cầu mực in.
     * $E_{xy} = 0$: Hai sản phẩm **Độc lập** (ví dụ: Sách và Bánh mì).

> [!TIP]
> **Mẹo phòng thi:** Khi giải trắc nghiệm, nếu đề bài cho hàm cầu dạng tuyến tính $Q_D = a - bP$ và yêu cầu tính hệ số co giãn tại mức giá $P_0$, hãy lấy đạo hàm $Q'_D(P) = -b$ rồi nhân với tỉ số $\\frac{P_0}{Q_0}$!

Chúc bạn ôn tập tốt! Bạn có cần tôi hướng dẫn thêm về phần tính toán tối đa hóa lợi nhuận độc quyền không?`;
    } else if (msg.includes("độc quyền") || msg.includes("monopoly")) {
      return `### Trợ Lý Học Tập VMU - Kinh Tế Vi Mô: Thị Trường Độc Quyền Hoàn Toàn

Chào bạn! Trong chương **Thị trường độc quyền hoàn toàn**, điều cốt lõi em cần nắm vững là nguyên tắc tối đa hóa lợi nhuận và cách xác định giá bán độc quyền:

1. **Nguyên tắc tối đa hóa lợi nhuận:**
   * Doanh nghiệp độc quyền đạt lợi nhuận tối đa tại mức sản lượng $Q^*$ thỏa mãn điều kiện biên:
     $$\\mathbf{MR = MC}$$
     *(Trong đó: $MR$ là doanh thu biên; $MC$ là chi phí biên)*
   
2. **Quy trình giải bài tập độc quyền:**
   * **Bước 1:** Từ hàm cầu thị trường $Q = a - bP$, biến đổi ngược để tìm hàm cầu nghịch đảo: $P = f(Q)$.
   * **Bước 2:** Lập hàm tổng doanh thu: $TR = P \\times Q = f(Q) \\times Q$.
   * **Bước 3:** Tìm doanh thu biên bằng cách lấy đạo hàm doanh thu: $MR = \\frac{dTR}{dQ}$.
     *(Mẹo nhanh: Nếu $P = A - BQ$ thì $MR = A - 2BQ$)*
   * **Bước 4:** Tính chi phí biên: $MC = \\frac{dTC}{dQ}$.
   * **Bước 5:** Giải phương trình $MR = MC$ để tìm sản lượng tối ưu $Q^*$.
   * **Bước 6:** Thế $Q^*$ vào hàm cầu nghịch đảo để tìm giá bán độc quyền $P^*$.

> [!WARNING]
> Doanh nghiệp độc quyền luôn bán ở mức giá $P^* > MC$, gây ra **Phần mất không (Deadweight Loss - DWL)** cho xã hội do sản lượng thấp hơn và giá cao hơn so với cạnh tranh hoàn hảo.

Hãy cho tôi biết nếu bạn có bài tập cụ thể cần gợi ý hướng giải quyết nhé!`;
    }
  } else if (subjectCode === "15635") {
    if (msg.includes("incoterms") || msg.includes("fob") || msg.includes("cif") || msg.includes("exw")) {
      return `### Trợ Lý Học Tập VMU - Giao Dịch Thương Mại Quốc Tế: Incoterms 2020

Chào bạn! **Incoterms 2020** (International Commercial Terms) là trái tim của môn học **Giao dịch thương mại quốc tế (15635)**. Dưới đây là phân tích hệ thống giúp bạn nắm vững 11 điều kiện chia làm 4 nhóm:

1. **Nhóm E (EXW - Giao tại xưởng):**
   * Nghĩa vụ người bán tối thiểu. Người bán chỉ cần chuẩn bị hàng hóa tại xưởng. Người mua tự thông quan xuất khẩu, thuê phương tiện vận tải và tự thông quan nhập khẩu.

2. **Nhóm F (FCA, FAS, FOB - Người bán không trả cước vận tải chính):**
   * **FOB (Free on Board - Giao lên tàu):** Chỉ áp dụng cho đường thủy. Người bán thông quan xuất khẩu, chịu chi phí và rủi ro cho đến khi hàng hóa được **đặt an toàn trên boong tàu** tại cảng bốc hàng chỉ định. Rủi ro chuyển giao sang người mua tại boong tàu cảng đi.

3. **Nhóm C (CFR, CIF, CPT, CIP - Người bán trả cước vận tải chính nhưng rủi ro chuyển giao tại cảng đi):**
   * **CIF (Cost, Insurance & Freight - Tiền hàng, bảo hiểm & cước phí):** Chỉ áp dụng cho đường thủy. Người bán trả tiền thuê tàu đến cảng đích và mua bảo hiểm hàng hải (ở mức tối thiểu loại C).
   * **Lưu ý cực kỳ quan trọng:** Đây là nhóm giao hàng tại điểm đi (Shipment contract). Điểm chuyển giao rủi ro là **trên tàu cảng bốc hàng (điểm đi)**, còn điểm chuyển giao chi phí kéo dài đến **cảng đích**.

4. **Nhóm D (DAP, DPU, DDP - Giao hàng tại đích, người bán chịu rủi ro dọc đường):**
   * **DDP (Delivered Duty Paid - Giao đã nộp thuế):** Nghĩa vụ người bán tối đa. Người bán chịu mọi rủi ro và chi phí bao gồm phí thông quan nhập khẩu và nộp thuế nhập khẩu tại nước người mua.

| Điều kiện | Vận tải đa phương thức? | Mức bảo hiểm bắt buộc |
| :--- | :---: | :---: |
| **CIF** | Không (Chỉ đường thủy) | Mức C (Tối thiểu) |
| **CIP** | Có (Đa phương thức) | Mức A (Tối đa) |

Hãy cho tôi biết bạn muốn tìm hiểu kỹ hơn về điều kiện nào hoặc cách áp dụng chúng trong soạn thảo hợp đồng xuất nhập khẩu nhé!`;
    }
  } else if (subjectCode === "15648") {
    if (msg.includes("l/c") || msg.includes("tín dụng chứng từ") || msg.includes("ucp 600")) {
      return `### Trợ Lý Học Tập VMU - Thanh Toán Quốc Tế: Phương Thức Tín Dụng Chứng Từ (L/C) & UCP 600

Chào bạn! Phương thức **Thư tín dụng L/C (Letter of Credit)** là phần kiến thức chuyên sâu và khó nhất trong học phần **Thanh toán quốc tế (15648)**.

1. **Khái niệm bản chất L/C:**
   * L/C là một cam kết thanh toán **bằng văn bản** của Ngân hàng phát hành (Issuing Bank) gửi cho Người thụ hưởng (Beneficiary - Người bán), cam kết trả tiền nếu người thụ hưởng xuất trình được một **Bộ chứng từ hoàn toàn phù hợp** với các điều khoản quy định trong L/C.
   * **Nguyên tắc độc lập:** L/C hoàn toàn độc lập với hợp đồng mua bán ngoại thương. Ngân hàng chỉ làm việc với chứng từ giấy tờ chứ không quan tâm đến tình trạng thực tế của hàng hóa (Điều 4, 5 UCP 600).

2. **Các bên tham gia cốt lõi:**
   * **Applicant:** Người yêu cầu mở L/C (Người mua / Nhập khẩu).
   * **Issuing Bank:** Ngân hàng phát hành L/C (Ngân hàng nước người mua).
   * **Beneficiary:** Người thụ hưởng (Người bán / Xuất khẩu).
   * **Advising Bank:** Ngân hàng thông báo L/C (Ngân hàng nước người bán).
   * **Confirming Bank / Negotiating Bank:** Ngân hàng xác nhận / Ngân hàng thương lượng chiết khấu.

3. **UCP 600 - Cẩm nang bắt buộc phải nhớ:**
   * Quy tắc thực hành thống nhất về Tín dụng chứng từ do ICC phát hành.
   * **Thời gian kiểm tra chứng từ (Điều 14):** Tối đa **5 ngày làm việc** tiếp sau ngày xuất trình.
   * **Vận đơn sạch (Clean Bill of Lading):** Vận đơn không có ghi chú xấu về tình trạng hàng hóa hoặc bao bì. Ngân hàng có quyền từ chối thanh toán lập tức nếu vận đơn bị ghi chú xấu (claused B/L).

> [!IMPORTANT]
> **Quy tắc vàng thanh toán L/C:** "Strict Compliance" - Sự tuân thủ nghiêm ngặt. Chỉ cần sai lệch một ký tự, một dấu chấm, dấu phẩy giữa tên doanh nghiệp trên hóa đơn thương mại với L/C, ngân hàng phát hành đều có quyền từ chối thanh toán.

Bạn có muốn tôi hướng dẫn cách xử lý các bất đồng chứng từ (discrepancy) thường gặp trong thanh toán quốc tế không?`;
    }
  } else if (subjectCode === "15625" || subjectCode === "15818") {
    if (msg.includes("vận đơn") || msg.includes("bill of lading") || msg.includes("b/l")) {
      return `### Trợ Lý Học Tập VMU - Giao Nhận Vận Tải Quốc Tế: Vận Đơn Đường Biển (Bill of Lading - B/L)

Chào bạn! **Vận đơn đường biển (B/L)** là chứng từ quan trọng bậc nhất trong chuỗi logistics hàng hải và môn học **Giao nhận vận tải quốc tế (15625)**.

1. **Ba chức năng pháp lý của B/L:**
   * **Biên nhận gửi hàng (Receipt of goods):** Minh chứng hãng tàu đã nhận hàng từ người gửi (Shipper) với số lượng, tình trạng như mô tả.
   * **Bằng chứng của hợp đồng vận chuyển (Evidence of contract of carriage):** Quy định các nghĩa vụ, cước phí giữa hãng tàu và người gửi hàng.
   * **Chứng từ sở hữu hàng hóa (Document of title):** Ai giữ vận đơn gốc hợp pháp thì có quyền nhận hàng tại cảng đích. Chức năng này cho phép B/L có tính lưu thông, có thể mua bán, chuyển nhượng bằng cách ký hậu (endorsement).

2. **Phân loại vận đơn quan trọng:**
   * **Theo tính lưu thông:**
     * *Straight B/L (Vận đơn đích danh):* Chỉ giao hàng cho đúng người có tên trên vận đơn. Không thể chuyển nhượng.
     * *To order B/L (Vận đơn theo lệnh):* Thường ghi 'To order' hoặc 'To order of...'. Có thể chuyển nhượng bằng cách ký hậu, cực kỳ phổ biến trong thanh toán L/C.
   * **Theo việc xếp hàng:**
     * *Shipped on board B/L (Vận đơn đã xếp hàng lên tàu):* Xác nhận hàng đã nằm trên tàu. Bắt buộc trong L/C.
     * *Received for shipment B/L (Vận đơn nhận hàng để xếp):* Chưa bốc lên tàu, rủi ro cao.
   * **Theo đơn vị phát hành:**
     * *Master B/L (Vận đơn chủ):* Do hãng tàu thực tế (Carrier) phát hành cho bên đại lý giao nhận (Forwarder).
     * *House B/L (Vận đơn nhà):* Do bên trung gian giao nhận (Forwarder/NVOCC) phát hành cho chủ hàng thực tế (Shipper).

Bạn có muốn tôi hướng dẫn cách phân biệt chi tiết giữa Master B/L và House B/L để phục vụ nghiệp vụ logistics thực tế không?`;
    }
  }

  // Generic fallback
  return `### Trợ Lý Học Tập Khoa Kinh Tế - ĐH Hàng Hải Việt Nam (VMU)

Chào bạn **${studentName}**! Tôi là Trợ lý AI được tích hợp trên nền tảng **VimEdu** hỗ trợ riêng cho ngành **Kinh tế Ngoại thương**.

Hiện tại bạn đang học môn **${getSubjectName(subjectCode)} (Mã môn: ${subjectCode})**.

Tôi có thể hỗ trợ bạn:
1. Giải thích định nghĩa các thuật ngữ học thuật chuyên ngành.
2. Tóm tắt nhanh lý thuyết các chương, các công thức cốt lõi.
3. Gợi ý hướng tư duy giải quyết các bài tập tình huống và bài tập tính toán định lượng.
4. Hướng dẫn ôn thi cuối kỳ theo đề cương.

Hãy đặt câu hỏi liên quan đến nội dung môn học để chúng ta bắt đầu trao đổi nhé!`;
}

// ----------------------------------------------------
// SPA FALLBACK ROUTING
// ----------------------------------------------------
// Trả về file index.html từ thư mục dist đối với bất kỳ URL nào không khớp với API routes,
// giúp xử lý điều hướng trang của Single Page Application ở phía Client.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// ----------------------------------------------------
// SERVER STARTUP
// ----------------------------------------------------
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`VimEdu Backend Server is running on port ${PORT}`);
    console.log(`Database storage file: ${DB_FILE}`);
    console.log(`====================================================`);
  });
}).catch(err => {
  console.error("Lỗi nghiêm trọng khi khởi tạo cơ sở dữ liệu:", err);
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`VimEdu Backend Server running on port ${PORT} (Dự phòng cục bộ)`);
    console.log(`====================================================`);
  });
});
