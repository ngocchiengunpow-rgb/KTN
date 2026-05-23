export const quizzesData = {
  // Key: Subject Code
  "21005": [
    {
      id: "q_micro_1",
      questionType: "mcq",
      content: "Khi giá của hàng hóa A tăng lên 10% làm cho lượng cầu của hàng hóa B giảm đi 15%, hệ số co giãn chéo của cầu (Exy) giữa hai hàng hóa này là bao nhiêu và hai hàng hóa này có quan hệ gì?",
      options: [
        "Exy = -1.5, hai hàng hóa là thay thế cho nhau",
        "Exy = -1.5, hai hàng hóa là bổ sung cho nhau",
        "Exy = +1.5, hai hàng hóa là độc lập",
        "Exy = +1.5, hai hàng hóa là bổ sung cho nhau"
      ],
      correctAnswer: 1, // index 1 (0-indexed)
      explanation: "Công thức co giãn chéo: Exy = % biến động lượng cầu hàng B / % biến động giá hàng A = (-15%) / (+10%) = -1.5. Vì Exy < 0 nên khi giá mặt hàng này tăng làm giảm lượng cầu mặt hàng kia, chứng tỏ hai hàng hóa này luôn đi kèm với nhau, tức quan hệ bổ sung cho nhau (ví dụ: máy in và mực in).",
      difficulty: "medium"
    },
    {
      id: "q_micro_2",
      questionType: "mcq",
      content: "Một doanh nghiệp độc quyền hoàn toàn có hàm cầu Q = 100 - P. Hàm tổng chi phí TC = Q^2 + 20Q + 100. Để tối đa hóa lợi nhuận, doanh nghiệp sẽ sản xuất ở mức sản lượng Q và mức giá P nào?",
      options: [
        "Q = 20, P = 80",
        "Q = 25, P = 75",
        "Q = 30, P = 70",
        "Q = 40, P = 60"
      ],
      correctAnswer: 0,
      explanation: "Doanh nghiệp độc quyền tối đa hóa lợi nhuận tại MR = MC.\nHàm cầu: P = 100 - Q => Doanh thu TR = P*Q = 100Q - Q^2. Do đó, doanh thu biên MR = 100 - 2Q.\nTổng chi phí TC = Q^2 + 20Q + 100 => Chi phí biên MC = dTC/dQ = 2Q + 20.\nCho MR = MC <=> 100 - 2Q = 2Q + 20 <=> 4Q = 80 <=> Q = 20.\nThay Q = 20 vào hàm cầu: P = 100 - 20 = 80.",
      difficulty: "hard"
    },
    {
      id: "q_micro_3",
      questionType: "multi",
      content: "Những yếu tố nào sau đây sẽ làm dịch chuyển đường cầu về thịt bò sang bên PHẢI (tăng cầu)? (Chọn các đáp án đúng)",
      options: [
        "Thu nhập của người tiêu dùng tăng (thịt bò là hàng hóa thông thường)",
        "Giá thịt lợn (hàng hóa thay thế của thịt bò) tăng mạnh",
        "Giá thịt bò giảm mạnh trên thị trường",
        "Khuyến nghị của Hiệp hội Y khoa về lợi ích sức khỏe của thịt bò được lan truyền"
      ],
      correctAnswer: [0, 1, 3], // multi select
      explanation: "Thu nhập tăng (0), giá hàng thay thế tăng (1), và thị hiếu tiêu dùng có lợi (3) đều là các nhân tố ngoài giá làm DỊCH CHUYỂN đường cầu sang phải. Giá thịt bò giảm (2) chỉ làm dịch chuyển dọc (di chuyển) trên đường cầu (tăng lượng cầu) chứ không làm dịch chuyển đường cầu.",
      difficulty: "medium"
    }
  ],
  "15635": [
    {
      id: "q_trade_1",
      questionType: "mcq",
      content: "Theo Incoterms 2020, điều kiện thương mại nào bắt buộc người bán phải thông quan xuất khẩu lẫn thông quan nhập khẩu và chịu mọi chi phí, rủi ro đưa hàng đến địa điểm chỉ định tại nước nhập khẩu?",
      options: [
        "FOB (Free on Board)",
        "CIF (Cost, Insurance and Freight)",
        "DDP (Delivered Duty Paid)",
        "EXW (Ex Works)"
      ],
      correctAnswer: 2,
      explanation: "DDP (Delivered Duty Paid - Giao hàng đã nộp thuế) là điều kiện mà nghĩa vụ của người bán là tối đa. Người bán phải chịu mọi chi phí và rủi ro, bao gồm cả thuế nhập khẩu, thông quan nhập khẩu tại nước người mua để giao hàng đến đích chỉ định.",
      difficulty: "easy"
    },
    {
      id: "q_trade_2",
      questionType: "mcq",
      content: "Trong điều kiện CIF (Incoterms 2020), rủi ro tổn thất hoặc hư hỏng hàng hóa được chuyển giao từ người bán sang người mua khi nào?",
      options: [
        "Khi hàng hóa đã xếp an toàn lên tàu tại cảng bốc hàng chỉ định",
        "Khi hàng hóa được giao đến cảng dỡ hàng chỉ định của nước người mua",
        "Khi người bán mua bảo hiểm hàng hóa thành công và gửi cho người mua",
        "Khi người mua hoàn tất thông quan nhập khẩu tại nước mình"
      ],
      correctAnswer: 0,
      explanation: "Mặc dù người bán chịu trách nhiệm thuê tàu và mua bảo hiểm đến cảng đích (CIF), nhưng CIF là điều kiện giao hàng tại nhóm C, nơi địa điểm chuyển giao RỦI RO là tại cảng đi (cảng bốc hàng) khi hàng hóa được đặt an toàn trên boong tàu, chứ không phải cảng đến.",
      difficulty: "medium"
    },
    {
      id: "q_trade_3",
      questionType: "fill",
      content: "Điền thuật ngữ thích hợp: 'Trong Incoterms 2020, điều kiện duy nhất bắt buộc người bán phải mua bảo hiểm ở mức bảo hiểm rộng nhất là loại A (Institute Cargo Clauses A) thay vì loại C là điều kiện ______ (viết tắt 3 chữ cái).'",
      options: [],
      correctAnswer: "CIP",
      explanation: "Trong Incoterms 2020, điều kiện CIP bắt buộc người bán phải mua bảo hiểm ở cấp độ tối đa (mức A), trong khi điều kiện CIF chỉ yêu cầu bảo hiểm ở mức tối thiểu (mức C).",
      difficulty: "hard"
    }
  ],
  "15648": [
    {
      id: "q_pay_1",
      questionType: "mcq",
      content: "Theo UCP 600, ngân hàng phát hành thư tín dụng (Issuing Bank) có thời gian tối đa là bao nhiêu ngày làm việc để kiểm tra bộ chứng từ xuất trình và quyết định từ chối hay thanh toán?",
      options: [
        "3 ngày làm việc tiếp sau ngày xuất trình",
        "5 ngày làm việc tiếp sau ngày xuất trình",
        "7 ngày làm việc tiếp sau ngày xuất trình",
        "10 ngày làm việc tiếp sau ngày xuất trình"
      ],
      correctAnswer: 1,
      explanation: "Điều 14 UCP 600 quy định: Ngân hàng phát hành, ngân hàng xác nhận hoặc ngân hàng được chỉ định có tối đa 5 ngày làm việc (five banking days) tiếp sau ngày xuất trình để quyết định chứng từ có phù hợp hay không.",
      difficulty: "medium"
    },
    {
      id: "q_pay_2",
      questionType: "mcq",
      content: "Một tín dụng thư L/C ghi: 'Bộ chứng từ yêu cầu 3 bản vận đơn đường biển sạch, đã xếp hàng lên tàu'. Người bán xuất trình vận đơn có ghi chú: 'Bao bì rách, ẩm ướt ở góc trái'. Chứng từ này có hợp lệ không?",
      options: [
        "Hợp lệ, vì UCP 600 cho phép những hư hỏng bao bì nhỏ ngoài tầm kiểm soát",
        "Hợp lệ nếu người bán cam kết bồi thường bằng văn bản cho ngân hàng",
        "Không hợp lệ, vì vận đơn không còn là vận đơn 'sạch' (Clean Bill of Lading) do có ghi chú xấu về hàng hóa/bao bì",
        "Không hợp lệ vì phải có chữ ký xác nhận của đại sứ quán nước người mua"
      ],
      correctAnswer: 2,
      explanation: "Clean Bill of Lading (vận đơn sạch) là vận đơn không có điều khoản ghi chú xấu (clauses) tuyên bố rõ ràng tình trạng khuyết tật của hàng hóa hay bao bì. Vận đơn ghi chú bao bì rách, ẩm ướt sẽ biến nó thành Dirty/Claused B/L, do đó bị ngân hàng từ chối thanh toán vì bất hợp lệ.",
      difficulty: "medium"
    }
  ],
  "15625": [
    {
      id: "q_transport_1",
      questionType: "mcq",
      content: "Thuật ngữ 'FCL/LCL' trong giao nhận vận tải container bằng đường biển có ý nghĩa gì đối với người gửi và người nhận?",
      options: [
        "Người gửi hàng đóng nguyên container, người nhận hàng nhận lẻ tại kho CFS",
        "Người gửi hàng gửi lẻ tại kho CFS, người nhận hàng nhận nguyên container tại bãi CY",
        "Hàng hóa được xếp lẻ từ nhiều người gửi chung một container nhưng giao đến một người nhận duy nhất",
        "Hàng hóa được gửi nguyên container từ một người gửi nhưng giao lẻ cho nhiều người nhận tại cảng đích"
      ],
      correctAnswer: 0,
      explanation: "FCL/LCL (Full Container Load / Less than Container Load): Người bán đóng hàng nguyên một container tại kho riêng hoặc bãi CY của mình (FCL). Tuy nhiên ở cảng đích, container được dỡ hàng lẻ tại kho hàng CFS để giao cho nhiều người mua nhỏ lẻ khác nhau (LCL).",
      difficulty: "medium"
    }
  ]
};

// Key studies / Case studies assignment proposals
export const caseStudiesData = {
  "15648": {
    title: "Tình Huống Tranh Chấp Bộ Chứng Từ Thanh Toán L/C hàng nông sản xuất khẩu đi Hàn Quốc",
    subjectCode: "15648",
    description: "Doanh nghiệp nông sản Hải Phòng (Exporter) xuất khẩu lô hàng 100 tấn sắn lát khô sang Hàn Quốc thanh toán bằng thư tín dụng L/C Irrevocable phát hành bởi Woori Bank. L/C yêu cầu xuất trình vận đơn ghi ngày xếp hàng muộn nhất là 15/05/2026. Bộ chứng từ thanh toán xuất trình ghi nhận vận đơn ghi ngày 16/05/2026. Tuy nhiên, tàu xuất phát thực tế vào ngày 15/05/2026 và thuyền trưởng xác nhận bằng văn bản đính kèm.",
    requirements: [
      "1. Hãy phân tích tính hợp lệ của bộ chứng từ trên theo UCP 600.",
      "2. Woori Bank có quyền từ chối thanh toán đối với bộ chứng từ này không? Vì sao?",
      "3. Giải pháp khắc phục tốt nhất cho doanh nghiệp Hải Phòng trong tình huống này là gì?"
    ],
    xpReward: 30,
    maxFileSize: "20MB"
  },
  "15625": {
    title: "Lập Phương Án Vận Chuyển Hàng Thiết Bị Siêu Trường Siêu Trọng Cảng Lạch Huyện - KCN Tràng Duệ",
    subjectCode: "15625",
    description: "Công ty Logistics A trúng thầu giao nhận một kiện máy tuabin phát điện nặng 120 tấn từ cảng quốc tế Lạch Huyện về nhà máy GE tại Khu công nghiệp Tràng Duệ, Hải Phòng. Kiện máy có kích thước vượt khổ đường bộ thông thường.",
    requirements: [
      "1. Đề xuất các phương thức vận tải khả thi và so sánh.",
      "2. Xác định các giấy phép cần thiết cần xin từ các cơ quan quản lý (Sở GTVT, Tổng cục Đường bộ).",
      "3. Lập sơ đồ rủi ro và các điểm cần khảo sát hành trình (chiều cao tĩnh không cầu vượt, tải trọng cầu đường bộ)."
    ],
    xpReward: 35,
    maxFileSize: "25MB"
  }
};
