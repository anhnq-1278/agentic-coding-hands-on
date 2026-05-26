export type AwardCategory = {
  slug: string;
  /** PNG path of the stylized name label (overlay on the card thumbnail). */
  labelSrc: string;
  /** Pixel dimensions of the label PNG, audited. */
  labelWidth: number;
  labelHeight: number;
  /** Display title rendered below the thumbnail. */
  title: string;
  /** Short description (1–2 lines) — used by the Homepage card grid (vi). */
  description: string;
  /** English short description for the Homepage card grid. */
  descriptionEn: string;
  /**
   * Long-form description shown on the Awards Information page. Multi-line
   * narrative explaining the award's purpose and criteria (vi).
   */
  longDescription: string;
  /** English long-form description for the Awards Information page. */
  longDescriptionEn: string;
  /** Number of prize slots (e.g., 10 Top Talent winners, 1 MVP). */
  count: number;
  /**
   * Recipient unit. Single string for one-line units ("Đơn vị", "Cá nhân").
   * Array of strings for stacked multi-line units ("Cá nhân hoặc tập thể" →
   * `["Cá nhân", "hoặc", "tập thể"]`).
   */
  countUnit: string | readonly string[];
  /** Primary prize value string (e.g., "7.000.000 VNĐ"). */
  valuePrimary: string;
  /**
   * Override of the per-prize suffix for the primary value. Defaults to the
   * dictionary's `perPrizeSuffix` when omitted. Used by Signature 2025 -
   * Creator (`"cho giải cá nhân"`).
   */
  valuePrimarySuffix?: string;
  /** Secondary prize value for awards with dual values (Signature 2025). */
  valueSecondary?: string;
  /** Per-prize suffix for the secondary value (e.g. `"cho giải tập thể"`). */
  valueSecondarySuffix?: string;
  /** 336×336 hero image for the awards-information page block. Reuses the
   *  shared Homepage award-bg template. */
  heroImageSrc: string;
};

const HOMEPAGE_ASSETS = "/assets/homepage-saa/images" as const;

/**
 * The six fixed award categories. Order matters — preserves the Figma layout
 * (Homepage row 1: Top Talent / Top Project / Top Project Leader;
 *  Homepage row 2: Best Manager / Signature 2025 - Creator / MVP).
 *
 * The same catalog drives both:
 *  - Homepage `<AwardCard>` (uses `slug`, `labelSrc/Width/Height`, `title`, `description`)
 *  - Awards Information `<AwardInfoBlock>` (uses `slug`, `title`, `longDescription`, `count`, `countUnit`, `valuePrimary`, `valueSecondary`, `heroImageSrc`)
 *
 * `longDescription` text is hand-written per category. The Figma file
 * (`zFYDgyj_pD`) reuses the Top Talent narrative as placeholder content for
 * all non-Signature blocks, so we cannot rely on Figma copy alone — these
 * descriptions mirror the spirit of each award per the SAA 2025 brief.
 * Signature 2025's description is taken verbatim from Figma (313:8479).
 */
export const AWARD_CATALOG: readonly AwardCategory[] = [
  {
    slug: "top-talent",
    labelSrc: `${HOMEPAGE_ASSETS}/award-label-top-talent.png`,
    labelWidth: 222,
    labelHeight: 36,
    title: "Top Talent",
    description: "Vinh danh top cá nhân xuất sắc trên mọi phương diện",
    descriptionEn:
      "Celebrating top individuals who excel across every dimension.",
    longDescription:
      "Giải thưởng Top Talent vinh danh những cá nhân xuất sắc toàn diện – những người không ngừng khẳng định năng lực chuyên môn vững vàng, hiệu suất công việc vượt trội, luôn mang lại giá trị vượt kỳ vọng, được đánh giá cao bởi khách hàng và đồng đội. Với tinh thần sẵn sàng nhận mọi nhiệm vụ tổ chức giao phó, họ luôn là nguồn cảm hứng, thúc đẩy động lực và tạo ảnh hưởng tích cực đến cả tập thể.",
    longDescriptionEn:
      "The Top Talent award honours all-round excellent individuals — people who consistently demonstrate deep professional expertise, outstanding performance, and value that exceeds expectations, while earning the trust of clients and teammates. Ready to take on whatever the organisation entrusts them with, they inspire those around them, drive momentum, and shape the energy of the whole team.",
    count: 10,
    countUnit: "Cá nhân",
    valuePrimary: "7.000.000 VNĐ",
    heroImageSrc: `${HOMEPAGE_ASSETS}/award-bg.png`,
  },
  {
    slug: "top-project",
    labelSrc: `${HOMEPAGE_ASSETS}/award-label-top-project.png`,
    labelWidth: 232,
    labelHeight: 35,
    title: "Top Project",
    description: "Vinh danh dự án có tác động và chất lượng nổi bật của năm",
    descriptionEn:
      "Honouring projects with the year's most outstanding impact and quality.",
    longDescription:
      "Giải thưởng Top Project vinh danh các dự án xuất sắc trong năm – những tập thể đã tạo ra tác động kinh doanh, kỹ thuật và quy trình nổi bật, đồng thời chuyển hoá thách thức thành giá trị bền vững cho khách hàng và Sun*. Với tinh thần phối hợp đa chức năng và cam kết về chất lượng, dự án đạt giải là minh chứng cho cách Sun* kiến tạo sản phẩm và dịch vụ đẳng cấp, lan toả uy tín thương hiệu ra cộng đồng kỹ sư và đối tác toàn cầu.",
    longDescriptionEn:
      "The Top Project award honours the year's standout projects — teams that delivered outstanding business, technical, and process impact, turning challenges into lasting value for clients and Sun*. Built on cross-functional collaboration and an uncompromising commitment to quality, the winning project showcases how Sun* crafts world-class products and services and grows our reputation across the global engineering and partner community.",
    count: 10,
    countUnit: "Đơn vị",
    valuePrimary: "7.000.000 VNĐ",
    heroImageSrc: `${HOMEPAGE_ASSETS}/award-bg.png`,
  },
  {
    slug: "top-project-leader",
    labelSrc: `${HOMEPAGE_ASSETS}/award-label-top-project-leader.png`,
    labelWidth: 232,
    labelHeight: 64,
    title: "Top Project Leader",
    description:
      "Vinh danh người dẫn dắt dự án truyền cảm hứng và đạt kết quả vượt trội",
    descriptionEn:
      "Recognising inspiring project leaders who deliver outstanding results.",
    longDescription:
      "Giải thưởng Top Project Leader vinh danh những người dẫn dắt dự án bằng tầm nhìn rõ ràng, kỹ năng tổ chức xuất sắc và khả năng truyền cảm hứng cho đội ngũ – tạo ra những thành tựu vượt trội cho khách hàng và Sun* trong năm. Họ giữ cho dự án vận hành ổn định trước áp lực thời gian và yêu cầu khắt khe, đồng thời xây dựng văn hoá hợp tác để mỗi thành viên đều có cơ hội phát huy thế mạnh và phát triển nghề nghiệp.",
    longDescriptionEn:
      "The Top Project Leader award honours those who lead with a clear vision, sharp organisational skill, and the ability to inspire — driving outstanding outcomes for clients and Sun* throughout the year. They keep projects steady under tight timelines and demanding requirements, while building a culture of collaboration where every team member can play to their strengths and grow their career.",
    count: 10,
    countUnit: "Cá nhân",
    valuePrimary: "7.000.000 VNĐ",
    heroImageSrc: `${HOMEPAGE_ASSETS}/award-bg.png`,
  },
  {
    slug: "best-manager",
    labelSrc: `${HOMEPAGE_ASSETS}/award-label-best-manager.png`,
    labelWidth: 232,
    labelHeight: 30,
    title: "Best Manager",
    description: "Vinh danh người quản lý xuất sắc, dẫn dắt đội ngũ vững mạnh",
    descriptionEn:
      "Celebrating outstanding managers who build strong, united teams.",
    longDescription:
      "Giải thưởng Best Manager vinh danh những người quản lý xuất sắc – kiến tạo môi trường để đội ngũ phát huy tối đa năng lực, đồng thời tạo ra ảnh hưởng tích cực và lâu dài lên tổ chức. Họ cân bằng giữa định hướng chiến lược và phát triển con người, kiên định với mục tiêu tổ chức nhưng linh hoạt với từng cá nhân, từ đó xây dựng đội nhóm đa dạng, gắn kết và sẵn sàng đương đầu với mọi giai đoạn phát triển của Sun*.",
    longDescriptionEn:
      "The Best Manager award honours outstanding managers who create the conditions for their teams to perform at their best, while leaving a positive, long-lasting impact on the organisation. They balance strategic direction with people growth — steady on the company's goals yet adaptive to each individual — building diverse, cohesive teams ready for every stage of Sun*'s journey.",
    count: 10,
    countUnit: "Đơn vị",
    valuePrimary: "7.000.000 VNĐ",
    heroImageSrc: `${HOMEPAGE_ASSETS}/award-bg.png`,
  },
  {
    slug: "signature-2025-creator",
    labelSrc: `${HOMEPAGE_ASSETS}/award-label-signature-creator.png`,
    labelWidth: 232,
    labelHeight: 54,
    title: "Signature 2025 - Creator",
    description: "Vinh danh dấu ấn sáng tạo đặc trưng của Sun* trong năm 2025",
    descriptionEn:
      "Honouring Sun*'s signature creative spirit in 2025.",
    longDescription:
      "Giải thưởng Signature vinh danh cá nhân hoặc tập thể thể hiện tinh thần đặc trưng mà Sun* hướng tới trong từng thời kỳ. Trong năm 2025, giải thưởng Signature vinh danh Creator – cá nhân/tập thể mang tư duy chủ động và nhạy bén, luôn nhìn thấy cơ hội trong thách thức và tiên phong trong hành động. Họ là những người nhạy bén với vấn đề, nhanh chóng nhận diện và đưa ra những giải pháp thực tiễn, mang lại giá trị rõ rệt cho dự án, khách hàng hoặc tổ chức. Với tư duy kiến tạo và tinh thần “Creator” đặc trưng của Sun*, họ không chỉ phản ứng tích cực trước sự thay đổi mà còn chủ động tạo ra cải tiến, góp phần định hình chuẩn mực mới cho cách mà người Sun* tạo giá trị.",
    longDescriptionEn:
      "The Signature award honours individuals or teams who embody the signature spirit Sun* champions in each era. In 2025, the Signature award celebrates the Creator — proactive, perceptive, and pioneering: people who see opportunity inside every challenge and act first. They spot problems quickly, propose practical solutions, and deliver clear, tangible value for projects, clients, or the organisation. With a maker's mindset and Sun*'s signature \"Creator\" spirit, they don't just respond well to change — they actively shape it, setting new standards for how Sun* people create value.",
    count: 1,
    countUnit: ["Cá nhân", "hoặc", "tập thể"],
    valuePrimary: "5.000.000 VNĐ",
    valuePrimarySuffix: "cho giải cá nhân",
    valueSecondary: "8.000.000 VNĐ",
    valueSecondarySuffix: "cho giải tập thể",
    heroImageSrc: `${HOMEPAGE_ASSETS}/award-bg.png`,
  },
  {
    slug: "mvp",
    labelSrc: `${HOMEPAGE_ASSETS}/award-label-mvp.png`,
    labelWidth: 116,
    labelHeight: 52,
    title: "MVP (Most Valuable Person)",
    description:
      "Most Valuable Person — vinh danh cá nhân có đóng góp giá trị nhất cho Sun*",
    descriptionEn:
      "Most Valuable Person — celebrating the individual whose contribution to Sun* mattered most.",
    longDescription:
      "Giải thưởng MVP – Most Valuable Person – vinh danh cá nhân có đóng góp giá trị nhất cho Sun* trong năm: bằng năng lực vượt trội, ảnh hưởng đa chiều và tinh thần lan toả văn hoá tổ chức. Người được vinh danh là chuẩn mực sống động cho giá trị Sun*: vừa đạt thành tích chuyên môn nổi bật, vừa nâng đỡ đồng đội, dẫn dắt sáng kiến và truyền cảm hứng cho cộng đồng Sunner – minh chứng cho một năm bản thân và tổ chức cùng phát triển.",
    longDescriptionEn:
      "The MVP — Most Valuable Person — award honours the individual whose contribution mattered most to Sun* this year: through outstanding ability, multi-dimensional influence, and the spirit of spreading our culture. The recipient is a living embodiment of Sun*'s values — delivering top-tier professional results, lifting teammates up, leading initiatives, and inspiring the wider Sunner community — proof of a year in which they and the organisation grew together.",
    count: 10,
    countUnit: "Đơn vị",
    valuePrimary: "7.000.000 VNĐ",
    heroImageSrc: `${HOMEPAGE_ASSETS}/award-bg.png`,
  },
] as const;
