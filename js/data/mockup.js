export const forumMockup = [
  {
    id: "th_1",
    subjectId: "21005", // Kinh tế vi mô
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
    subjectId: "15648", // Thanh toán quốc tế
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
    subjectId: "15625", // Giao nhận vận tải quốc tế
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

export const leaderboardMockup = [
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

export const newsMockup = [
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

export const documentsMockup = [
  {
    id: "d_1",
    subjectId: "15648", // Thanh toán quốc tế
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
    subjectId: "21005", // Kinh tế vi mô
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
    subjectId: "15818", // Logistics
    title: "Đề thi tự luận giữa kỳ môn Tổng quan Logistics & Chuỗi cung ứng (Kỳ I 2025)",
    fileType: "PDF",
    fileSize: "1.1 MB",
    downloadCount: 612,
    rating: 4.5,
    category: "exam",
    url: "#"
  }
];

export const researchMockup = [
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

export const thesisMockup = [
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
