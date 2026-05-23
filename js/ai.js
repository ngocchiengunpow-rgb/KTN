import { VimEduDB } from './db.js';

export class VimEduAI {
  /**
   * Generates a response from the AI assistant via the secure server-side Proxy.
   * @param {string} subjectCode 
   * @param {string} userMessage 
   * @returns {Promise<{text: string, isMock: boolean}>}
   */
  static async askAI(subjectCode, userMessage) {
    const currentUser = VimEduDB.getCurrentUser();
    const msv = currentUser ? currentUser.msv : "MSV";

    try {
      const response = await fetch('/api/ai/chat', {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          subjectCode,
          userMessage,
          msv
        })
      });

      if (response.ok) {
        return await response.json(); // returns { text, isMock }
      } else {
        throw new Error(`Server returned status ${response.status}`);
      }
    } catch (err) {
      console.error("AI Proxy call failed, falling back to client-side offline mock simulation:", err);
      return this.fallbackAcademicMock(subjectCode, userMessage);
    }
  }

  /**
   * Generates extremely detailed, academic, and formatted answers about VMU Foreign Trade based on keywords.
   * Provides immediate, professional assistance even without an internet API connection.
   */
  static fallbackAcademicMock(subjectCode, userMessage) {
    const msg = userMessage.toLowerCase();
    const currentUser = VimEduDB.getCurrentUser();
    const studentName = currentUser ? currentUser.fullName : "Sinh viên";
    const subject = VimEduDB.getSubjectByCode(subjectCode);
    const subjectName = subject ? subject.name : "Môn học";
    const semester = subject ? (subject.semesterName || `Học kỳ ${subject.semesterId}`) : "Học kỳ";
    let text = "";

    // 1. Kinh tế vi mô (21005)
    if (subjectCode === "21005") {
      if (msg.includes("co giãn") || msg.includes("elasticity")) {
        text = `### Trợ Lý Học Tập VMU - Kinh Tế Vi Mô: Hệ Số Co Giãn (Elasticity)

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
        text = `### Trợ Lý Học Tập VMU - Kinh Tế Vi Mô: Thị Trường Độc Quyền Hoàn Toàn

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
      } else {
        text = `### Trợ Lý Học Tập VMU - Kinh Tế Vi Mô

Chào bạn **${studentName}**! Tôi là trợ lý học tập môn **Kinh tế vi mô (Mã môn: 21005)**. 

Tôi có thể giúp bạn giải đáp các vấn đề cốt lõi của môn học bao gồm:
* Lý thuyết cung - cầu, thặng dư tiêu dùng (CS) và thặng dư sản xuất (PS).
* Cách tính Hệ số co giãn ($E_{Dp}, E_{xy}, E_I$).
* Lý thuyết hành vi người tiêu dùng (Đường ngân sách, đường đẳng ích, tối đa hóa hữu dụng $MU_X/P_X = MU_Y/P_Y$).
* Lý thuyết sản xuất và chi phí ($TC, FC, VC, ATC, MC$, luật năng suất cận biên giảm dần).
* Cấu trúc thị trường: Cạnh tranh hoàn hảo, Độc quyền hoàn toàn, Cạnh tranh độc quyền và Độc quyền nhóm.

Bạn đang gặp khó khăn ở chương nào? Hãy nhập câu hỏi cụ thể nhé!`;
      }
    }
    // 2. Giao dịch thương mại quốc tế (15635)
    else if (subjectCode === "15635") {
      if (msg.includes("incoterms") || msg.includes("fob") || msg.includes("cif") || msg.includes("exw")) {
        text = `### Trợ Lý Học Tập VMU - Giao Dịch Thương Mại Quốc Tế: Incoterms 2020

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
      } else {
        text = `### Trợ Lý Học Tập VMU - Giao Dịch Thương Mại Quốc Tế

Chào bạn **${studentName}**! Tôi là trợ lý học tập môn **Giao dịch thương mại quốc tế (15635)**.

Môn học này trang bị kiến thức thực tế cực kỳ quan trọng về quy trình xuất nhập khẩu hàng hóa. Tôi sẵn sàng hỗ trợ bạn làm rõ các nội dung:
* Chi tiết 11 điều kiện **Incoterms 2020** và cách phân chia chi phí, rủi ro.
* Cách soạn thảo các điều khoản hợp đồng ngoại thương (Commodity, Quality, Price, Delivery, Payment, Force Majeure, Claim).
* Quy trình đàm phán thương mại (Chào hàng cố định, chào hàng tự do, hoàn giá chào).
* Các phương pháp giao dịch đặc biệt (Gia công quốc tế, tái xuất, đấu giá, đấu thầu quốc tế).

Bạn có câu hỏi cụ thể nào về điều khoản giao hàng hay quy trình đàm phán hợp đồng không?`;
      }
    }
    // 3. Thanh toán quốc tế (15648)
    else if (subjectCode === "15648") {
      if (msg.includes("l/c") || msg.includes("tín dụng chứng từ") || msg.includes("ucp 600")) {
        text = `### Trợ Lý Học Tập VMU - Thanh Toán Quốc Tế: Phương Thức Tín Dụng Chứng Từ (L/C) & UCP 600

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
      } else {
        text = `### Trợ Lý Học Tập VMU - Thanh Toán Quốc Tế

Chào bạn **${studentName}**! Tôi là trợ lý học tập chuyên sâu môn **Thanh toán quốc tế (15648)**.

Tôi có thể giúp bạn giải đáp cặn kẽ các phương thức thanh toán xuất nhập khẩu thực tế:
* Phương thức chuyển tiền **T/T** (Telegraphic Transfer) trả trước và trả sau.
* Phương thức nhờ thu chứng từ **D/P** (Documents against Payment) và **D/A** (Documents against Acceptance) điều chỉnh bởi **URC 522**.
* Tín dụng chứng từ **L/C** (Letter of Credit) và cẩm nang **UCP 600**, **ISBP 745**.
* Hối phiếu (Bill of Exchange), Hóa đơn thương mại (Commercial Invoice), Vận đơn đường biển (Bill of Lading) và các chứng từ bảo hiểm, xuất xứ (C/O).

Hãy đặt câu hỏi cụ thể về quy trình hoặc tranh chấp bộ chứng từ để tôi hỗ trợ nhé!`;
      }
    }
    // 4. Giao nhận vận tải quốc tế (15625) & Logistics (15818)
    else if (subjectCode === "15625" || subjectCode === "15818") {
      if (msg.includes("vận đơn") || msg.includes("bill of lading") || msg.includes("b/l")) {
        text = `### Trợ Lý Học Tập VMU - Giao Nhận Vận Tải Quốc Tế: Vận Đơn Đường Biển (Bill of Lading - B/L)

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
      } else {
        text = `### Trợ Lý Học Tập VMU - Giao Nhận Vận Tải & Logistics

Chào bạn **${studentName}**! Tôi là trợ lý học tập môn **Giao nhận vận tải quốc tế (15625)** và **Logistics & Chuỗi cung ứng (15818)**.

Tôi có thể hỗ trợ đắc lực cho bạn trong các nội dung:
* Nghiệp vụ gom hàng lẻ **LCL** (kho CFS) và hàng nguyên container **FCL** (bãi CY).
* Cách đọc và phân loại các loại Vận đơn hàng hải (**Bill of Lading - B/L**) và Vận đơn hàng không (**AWB**).
* Quy trình làm đại lý giao nhận, thủ tục phát lệnh giao hàng **D/O** và cược vỏ container.
* Mô hình chuỗi cung ứng, quản trị tồn kho và thiết kế luồng logistics tối ưu.

Hãy gửi câu hỏi thắc mắc cụ thể về bài giảng hoặc bài tập tình huống để tôi giải đáp nhé!`;
      }
    }
    // Default fallback for other subjects
    else {
      text = `### Trợ Lý Học Tập Khoa Kinh Tế - ĐH Hàng Hải Việt Nam (VMU)

Chào bạn **${studentName}**! Tôi là Trợ lý AI được tích hợp trên nền tảng **VimEdu** hỗ trợ riêng cho ngành **Kinh tế Ngoại thương**.

Hiện tại bạn đang học môn **${subjectName} (Mã môn: ${subjectCode})** thuộc **${semester}**.

Tôi có thể hỗ trợ bạn:
1. Giải thích định nghĩa các thuật ngữ học thuật chuyên ngành.
2. Tóm tắt nhanh lý thuyết các chương, các công thức cốt lõi.
3. Gợi ý hướng tư duy giải quyết các bài tập tình huống và bài tập tính toán định lượng.
4. Hướng dẫn ôn thi cuối kỳ theo đề cương.

Hãy đặt câu hỏi liên quan đến nội dung môn học **${subjectName}** để chúng ta bắt đầu trao đổi nhé!`;
    }

    // Save Assistant response
    VimEduDB.saveChatMessage(subjectCode, 'assistant', text, []);

    return { text, isMock: true, citations: [] };
  }
}
