import type {
  Department,
  Hashtag,
  HeroBadge,
  Kudos,
  KudosId,
  RecentGift,
  SecretBox,
  SunnerId,
  SunnerProfile,
} from "@/lib/kudos/types";

/**
 * Deterministic mock seed for the Sun* Kudos live board. Loaded once at
 * module init by `lib/kudos/store.ts`. Re-seeding (`resetStore`) restores
 * exactly this state for test isolation.
 *
 * Designed to exercise:
 *   - Filter scoping (Hashtag + Phòng ban).
 *   - Heart business rules (self-block, special-day +2).
 *   - Multi-image gallery (≥3 with 5 images).
 *   - Hashtag overflow (≥3 with >5 hashtags).
 *   - Carousel top-5 ranking by heart count.
 *   - Sidebar leaderboard "10 SUNNER NHẬN QUÀ MỚI NHẤT".
 */

const SAMPLE_IMAGE = "/assets/sun-kudos/images/sample-gallery.png" as const;
const SENDER_AVATAR = "/assets/sun-kudos/avatars/avatar-sender.png" as const;
const RECIPIENT_AVATAR =
  "/assets/sun-kudos/avatars/avatar-recipient.png" as const;
const SIDEBAR_AVATAR = "/assets/sun-kudos/avatars/avatar-sidebar.png" as const;

/**
 * Dates picked relative to today's date (2026-05-18) so the "recent gifts"
 * and "highlight" sections look plausible against the demo wall clock. The
 * 2026-04-30 entry is the only "special day" — used by the heart-toggle
 * special-day test cases.
 */
export const SPECIAL_DAYS: ReadonlySet<string> = new Set(["2026-04-30"]);

export const SEED_DEPARTMENTS: readonly Department[] = [
  { id: "dept-engineering", name: "Engineering", kudosCount: 0 },
  { id: "dept-design", name: "Design", kudosCount: 0 },
  { id: "dept-marketing", name: "Marketing", kudosCount: 0 },
  { id: "dept-pm", name: "Product", kudosCount: 0 },
  { id: "dept-people", name: "People & Culture", kudosCount: 0 },
  { id: "dept-ba", name: "BA & QA", kudosCount: 0 },
] as const;

export const SEED_HASHTAGS: readonly Hashtag[] = [
  { tag: "IDOL GIỚI TRẺ", kudosCount: 0 },
  { tag: "Dedicated", kudosCount: 0 },
  { tag: "Inspiring", kudosCount: 0 },
  { tag: "Team Player", kudosCount: 0 },
  { tag: "Innovator", kudosCount: 0 },
  { tag: "Mentor", kudosCount: 0 },
  { tag: "Above & Beyond", kudosCount: 0 },
  { tag: "Customer Love", kudosCount: 0 },
  { tag: "Quality First", kudosCount: 0 },
  { tag: "Quick Win", kudosCount: 0 },
  { tag: "Tinh thần Sun*", kudosCount: 0 },
  { tag: "Hỗ Trợ Đồng Đội", kudosCount: 0 },
];

function pickBadge(received: number): HeroBadge {
  if (received >= 50) return "super";
  if (received >= 20) return "legend";
  if (received >= 10) return "rising";
  return "new";
}

const sunnerSeed: ReadonlyArray<
  Omit<SunnerProfile, "badge"> & { isSelf?: boolean }
> = [
  {
    id: "sunner-anh",
    displayName: "Nguyễn Quốc Anh",
    email: "nguyen.quoc.anh@sun-asterisk.com",
    avatarUrl: SIDEBAR_AVATAR,
    departmentId: "dept-engineering",
    departmentName: "Engineering",
    title: "Senior Frontend Engineer",
    kudosReceived: 28,
    kudosSent: 14,
    heartsReceived: 56,
    secretBoxesOpened: 2,
    secretBoxesPending: 1,
    isSelf: true,
  },
  {
    id: "sunner-mai",
    displayName: "Trần Thu Mai",
    email: "tran.thu.mai@sun-asterisk.com",
    avatarUrl: SENDER_AVATAR,
    departmentId: "dept-design",
    departmentName: "Design",
    title: "Lead Product Designer",
    kudosReceived: 52,
    kudosSent: 38,
    heartsReceived: 124,
    secretBoxesOpened: 4,
    secretBoxesPending: 0,
  },
  {
    id: "sunner-bao",
    displayName: "Lê Hoàng Bảo",
    email: "le.hoang.bao@sun-asterisk.com",
    avatarUrl: RECIPIENT_AVATAR,
    departmentId: "dept-engineering",
    departmentName: "Engineering",
    title: "Tech Lead — Mobile",
    kudosReceived: 21,
    kudosSent: 9,
    heartsReceived: 47,
    secretBoxesOpened: 1,
    secretBoxesPending: 1,
  },
  {
    id: "sunner-thuy",
    displayName: "Phạm Thanh Thuỷ",
    email: "pham.thanh.thuy@sun-asterisk.com",
    avatarUrl: SENDER_AVATAR,
    departmentId: "dept-marketing",
    departmentName: "Marketing",
    title: "Brand Manager",
    kudosReceived: 16,
    kudosSent: 22,
    heartsReceived: 33,
    secretBoxesOpened: 1,
    secretBoxesPending: 0,
  },
  {
    id: "sunner-khoa",
    displayName: "Đỗ Đăng Khoa",
    email: "do.dang.khoa@sun-asterisk.com",
    avatarUrl: RECIPIENT_AVATAR,
    departmentId: "dept-pm",
    departmentName: "Product",
    title: "Product Manager",
    kudosReceived: 11,
    kudosSent: 17,
    heartsReceived: 24,
    secretBoxesOpened: 0,
    secretBoxesPending: 0,
  },
  {
    id: "sunner-trang",
    displayName: "Nguyễn Mỹ Trang",
    email: "nguyen.my.trang@sun-asterisk.com",
    avatarUrl: SIDEBAR_AVATAR,
    departmentId: "dept-people",
    departmentName: "People & Culture",
    title: "People Partner",
    kudosReceived: 9,
    kudosSent: 13,
    heartsReceived: 18,
    secretBoxesOpened: 0,
    secretBoxesPending: 0,
  },
  {
    id: "sunner-duy",
    displayName: "Bùi Tiến Duy",
    email: "bui.tien.duy@sun-asterisk.com",
    avatarUrl: RECIPIENT_AVATAR,
    departmentId: "dept-engineering",
    departmentName: "Engineering",
    title: "Backend Engineer",
    kudosReceived: 7,
    kudosSent: 6,
    heartsReceived: 14,
    secretBoxesOpened: 0,
    secretBoxesPending: 0,
  },
  {
    id: "sunner-linh",
    displayName: "Hoàng Mỹ Linh",
    email: "hoang.my.linh@sun-asterisk.com",
    avatarUrl: SENDER_AVATAR,
    departmentId: "dept-ba",
    departmentName: "BA & QA",
    title: "Senior QA",
    kudosReceived: 23,
    kudosSent: 18,
    heartsReceived: 49,
    secretBoxesOpened: 1,
    secretBoxesPending: 0,
  },
  {
    id: "sunner-hieu",
    displayName: "Vũ Trung Hiếu",
    email: "vu.trung.hieu@sun-asterisk.com",
    avatarUrl: RECIPIENT_AVATAR,
    departmentId: "dept-design",
    departmentName: "Design",
    title: "Motion Designer",
    kudosReceived: 14,
    kudosSent: 11,
    heartsReceived: 31,
    secretBoxesOpened: 0,
    secretBoxesPending: 0,
  },
  {
    id: "sunner-nga",
    displayName: "Trần Hồng Nga",
    email: "tran.hong.nga@sun-asterisk.com",
    avatarUrl: SIDEBAR_AVATAR,
    departmentId: "dept-marketing",
    departmentName: "Marketing",
    title: "Content Lead",
    kudosReceived: 19,
    kudosSent: 8,
    heartsReceived: 36,
    secretBoxesOpened: 1,
    secretBoxesPending: 0,
  },
  {
    id: "sunner-quang",
    displayName: "Lương Quang",
    email: "luong.quang@sun-asterisk.com",
    avatarUrl: SENDER_AVATAR,
    departmentId: "dept-engineering",
    departmentName: "Engineering",
    title: "DevOps Engineer",
    kudosReceived: 6,
    kudosSent: 9,
    heartsReceived: 13,
    secretBoxesOpened: 0,
    secretBoxesPending: 0,
  },
  {
    id: "sunner-quynh",
    displayName: "Nguyễn Diễm Quỳnh",
    email: "nguyen.diem.quynh@sun-asterisk.com",
    avatarUrl: RECIPIENT_AVATAR,
    departmentId: "dept-ba",
    departmentName: "BA & QA",
    title: "Business Analyst",
    kudosReceived: 12,
    kudosSent: 14,
    heartsReceived: 22,
    secretBoxesOpened: 0,
    secretBoxesPending: 0,
  },
];

/**
 * The currently authenticated demo user. The mock store treats this as the
 * "current Sunner" when scoping `isHeartedByCurrentUser` and self-heart
 * blocks. Real backend will read this from the JWT session instead.
 */
export const DEMO_CURRENT_USER_ID: SunnerId = "sunner-anh";

export const SEED_SUNNERS: readonly SunnerProfile[] = sunnerSeed.map((s) => {
  const { isSelf: _ignored, ...rest } = s;
  void _ignored;
  return {
    ...rest,
    badge: pickBadge(rest.kudosReceived),
  };
});

/**
 * Compact kudos seed. Generated programmatically so the file stays
 * tractable while still meeting the spec's diversity targets.
 */
function buildKudosSeed(): readonly Kudos[] {
  const now = new Date("2026-05-18T09:00:00Z");
  const list: Kudos[] = [];

  type SeedEntry = {
    sender: SunnerId;
    recipient: SunnerId;
    message: string;
    hashtags: readonly string[];
    images?: number;
    hearts: number;
    minutesAgo: number;
    /** When set, overrides the YYYY-MM-DD used to build `createdAt`. */
    overrideDate?: string;
  };

  const seed: readonly SeedEntry[] = [
    // --- Top of carousel: most-hearted (≥20 hearts) ---
    {
      sender: "sunner-mai",
      recipient: "sunner-anh",
      message:
        "Cảm ơn Anh đã dẫn dắt đội FE qua một tuần release đầy áp lực. Bản countdown chạy mượt và đẹp đúng spec — đội mình tự hào vì có bạn!",
      hashtags: ["IDOL GIỚI TRẺ", "Above & Beyond", "Team Player", "Quality First"],
      images: 0,
      hearts: 34,
      minutesAgo: 60,
    },
    {
      sender: "sunner-bao",
      recipient: "sunner-mai",
      message:
        "Concept Spotlight word cloud của Mai làm cả team trầm trồ — hôm demo cho khách hàng họ vỗ tay liên tục. Cảm ơn vì luôn nâng tầm thẩm mỹ sản phẩm.",
      hashtags: ["Inspiring", "Quality First", "Customer Love"],
      images: 3,
      hearts: 31,
      minutesAgo: 180,
    },
    {
      sender: "sunner-linh",
      recipient: "sunner-anh",
      message:
        "Anh xem PR của em rất kỹ và chỉ ra đúng race condition mà mình bỏ sót. Mentor như vậy quá hiếm. Many thanks!",
      hashtags: ["Mentor", "Dedicated", "Tinh thần Sun*"],
      images: 0,
      hearts: 28,
      minutesAgo: 240,
      overrideDate: "2026-04-30",
    },
    {
      sender: "sunner-khoa",
      recipient: "sunner-bao",
      message:
        "Bảo ơi, bản POC mobile vừa rồi cứu cả timeline cho khách hàng N. Tinh thần can-do của bạn truyền lửa cho cả phòng. Best leader 🔥",
      hashtags: ["Quick Win", "Above & Beyond", "Inspiring", "IDOL GIỚI TRẺ"],
      images: 2,
      hearts: 26,
      minutesAgo: 360,
    },
    {
      sender: "sunner-thuy",
      recipient: "sunner-mai",
      message:
        "Bộ template Brand 2025 của Mai giúp Marketing rút ngắn quy trình duyệt còn 1 ngày. Quá ấn tượng!",
      hashtags: ["Innovator", "Quality First", "Customer Love"],
      images: 5,
      hearts: 22,
      minutesAgo: 720,
    },
    // --- Mid tier: 10–20 hearts ---
    {
      sender: "sunner-mai",
      recipient: "sunner-linh",
      message:
        "Cảm ơn Linh đã dậy sớm test toàn bộ scenario edge case của payment flow trước demo. Bạn cứu cả release.",
      hashtags: ["Dedicated", "Quality First"],
      images: 1,
      hearts: 17,
      minutesAgo: 90,
    },
    {
      sender: "sunner-trang",
      recipient: "sunner-thuy",
      message:
        "Câu chuyện kể về dự án G của Thuỷ trong newsletter tuần này rất hay. Đọc xong em thấy mình tự hào hơn về Sun*.",
      hashtags: ["Tinh thần Sun*", "Inspiring"],
      images: 0,
      hearts: 14,
      minutesAgo: 200,
    },
    {
      sender: "sunner-nga",
      recipient: "sunner-trang",
      message:
        "Trang đã pivot kịp campaign Tết, giữ deadline cho cả phòng. Cảm ơn vì luôn calm dù mọi thứ cháy!",
      hashtags: ["Above & Beyond"],
      images: 0,
      hearts: 12,
      minutesAgo: 300,
    },
    {
      sender: "sunner-quang",
      recipient: "sunner-duy",
      message:
        "Pipeline mới Duy build giảm 40% thời gian build trên CI. Wonderful!",
      hashtags: ["Innovator", "Quick Win"],
      images: 0,
      hearts: 11,
      minutesAgo: 480,
    },
    {
      sender: "sunner-anh",
      recipient: "sunner-bao",
      message:
        "Cảm ơn anh Bảo đã pair với mình debug cái bug heart toggle ở demo hôm thứ Sáu. Giải pháp idempotent set rất tinh tế.",
      hashtags: ["Mentor", "Quality First", "Hỗ Trợ Đồng Đội"],
      images: 0,
      hearts: 10,
      minutesAgo: 540,
    },
    // --- Low tier: 1–9 hearts (recent feed) ---
    {
      sender: "sunner-hieu",
      recipient: "sunner-mai",
      message: "Motion intro của HIGHLIGHT KUDOS đẹp xuất sắc, cảm ơn Mai!",
      hashtags: ["Inspiring"],
      images: 1,
      hearts: 9,
      minutesAgo: 30,
    },
    {
      sender: "sunner-quynh",
      recipient: "sunner-khoa",
      message:
        "Khoa write user story sạch và rõ — em đọc xong là biết cần test ngay những gì. Cảm ơn nhé!",
      hashtags: ["Quality First", "Mentor"],
      images: 0,
      hearts: 8,
      minutesAgo: 45,
    },
    {
      sender: "sunner-duy",
      recipient: "sunner-quang",
      message: "Cảm ơn Quang đã hỗ trợ rollback nhanh khi env staging fail.",
      hashtags: ["Hỗ Trợ Đồng Đội", "Quick Win"],
      images: 0,
      hearts: 7,
      minutesAgo: 75,
    },
    {
      sender: "sunner-bao",
      recipient: "sunner-anh",
      message:
        "Cảm ơn Anh đã viết RFC sticky-side-menu rõ ràng, mình tham khảo cho team mobile luôn.",
      hashtags: ["Mentor"],
      images: 0,
      hearts: 7,
      minutesAgo: 120,
    },
    {
      sender: "sunner-thuy",
      recipient: "sunner-hieu",
      message: "Bộ motion cho KV Kudos quá nịnh mắt — Hiếu best!",
      hashtags: ["Inspiring"],
      images: 0,
      hearts: 6,
      minutesAgo: 150,
    },
    {
      sender: "sunner-linh",
      recipient: "sunner-quynh",
      message:
        "Cảm ơn Quỳnh đã viết test case rất tỉ mỉ — em làm theo rất nhàn.",
      hashtags: ["Quality First", "Team Player"],
      images: 0,
      hearts: 6,
      minutesAgo: 210,
    },
    {
      sender: "sunner-trang",
      recipient: "sunner-mai",
      message:
        "Mai ơi, version 2 của brand book in ra rất xịn. Em đem đi pitch khách hàng ngày mai.",
      hashtags: ["Customer Love"],
      images: 1,
      hearts: 5,
      minutesAgo: 280,
    },
    {
      sender: "sunner-khoa",
      recipient: "sunner-trang",
      message: "Cảm ơn Trang đã share data dashboard mới — cực kỳ insightful.",
      hashtags: ["Hỗ Trợ Đồng Đội"],
      images: 0,
      hearts: 5,
      minutesAgo: 360,
    },
    {
      sender: "sunner-quang",
      recipient: "sunner-anh",
      message: "Tutorial setup OAuth của Anh dễ làm theo. Many thanks!",
      hashtags: ["Mentor"],
      images: 0,
      hearts: 4,
      minutesAgo: 420,
    },
    {
      sender: "sunner-mai",
      recipient: "sunner-trang",
      message:
        "Cảm ơn Trang vì đã review brand book v3 ngay trong ngày OOO của mình.",
      hashtags: ["Above & Beyond", "Hỗ Trợ Đồng Đội"],
      images: 0,
      hearts: 4,
      minutesAgo: 600,
    },
    {
      sender: "sunner-nga",
      recipient: "sunner-bao",
      message:
        "Bảo support team marketing recording event Sun* Connect 2025 — kết quả rất pro!",
      hashtags: ["Customer Love", "Hỗ Trợ Đồng Đội"],
      images: 0,
      hearts: 3,
      minutesAgo: 800,
    },
    {
      sender: "sunner-anh",
      recipient: "sunner-thuy",
      message:
        "Anh cảm ơn Thuỷ vì đã chia sẻ insights về customer feedback mới — sẽ áp dụng cho roadmap quý 3.",
      hashtags: ["Customer Love"],
      images: 0,
      hearts: 2,
      minutesAgo: 1000,
    },
    {
      sender: "sunner-hieu",
      recipient: "sunner-quynh",
      message:
        "Bộ deck QA của Quỳnh rất professional. Em đã share cho team mới!",
      hashtags: ["Mentor"],
      images: 0,
      hearts: 1,
      minutesAgo: 1300,
    },
  ];

  for (let i = 0; i < seed.length; i += 1) {
    const entry = seed[i];
    const baseTimestamp = entry.overrideDate
      ? new Date(`${entry.overrideDate}T09:00:00Z`).getTime() -
        entry.minutesAgo * 60 * 1000
      : now.getTime() - entry.minutesAgo * 60 * 1000;
    const createdAt = new Date(baseTimestamp).toISOString();
    const dateKey = createdAt.slice(0, 10);
    const images = Array.from(
      { length: entry.images ?? 0 },
      () => SAMPLE_IMAGE,
    );
    const id: KudosId = `kudos-${String(i + 1).padStart(3, "0")}`;
    list.push({
      id,
      senderId: entry.sender,
      recipientId: entry.recipient,
      headline: entry.hashtags[0] ?? "Tinh thần Sun*",
      message: entry.message,
      hashtags: entry.hashtags,
      images,
      isAnonymous: false,
      anonymousAlias: null,
      createdAt,
      heartsCount: entry.hearts,
      isHeartedByCurrentUser: false,
      isSpecialDay: SPECIAL_DAYS.has(dateKey),
      detailUrl: `/sun-kudos/${id}`,
    });
  }

  return list;
}

export const SEED_KUDOS: readonly Kudos[] = buildKudosSeed();

/**
 * Initial heart-bookkeeping. Some kudos start "hearted by current user" so
 * the demo loads with a realistic state (e.g. the user can immediately
 * unheart something they've already reacted to).
 */
export const SEED_HEARTS_BY_USER: ReadonlyMap<
  SunnerId,
  ReadonlySet<KudosId>
> = new Map([
  [DEMO_CURRENT_USER_ID, new Set<KudosId>(["kudos-002", "kudos-005"])],
]);

export const SEED_SECRET_BOXES: readonly SecretBox[] = [
  {
    id: "box-001",
    userId: DEMO_CURRENT_USER_ID,
    status: "opened",
    rewardLabel: "Áo hoodie SAA 2025",
    openedAt: "2026-05-10T03:00:00.000Z",
  },
  {
    id: "box-002",
    userId: DEMO_CURRENT_USER_ID,
    status: "opened",
    rewardLabel: "Bộ stickers SAA 2025",
    openedAt: "2026-05-14T09:00:00.000Z",
  },
  {
    id: "box-003",
    userId: DEMO_CURRENT_USER_ID,
    status: "pending",
    rewardLabel: "—",
    openedAt: null,
  },
  {
    id: "box-004",
    userId: "sunner-bao",
    status: "pending",
    rewardLabel: "—",
    openedAt: null,
  },
];

export const SEED_RECENT_GIFTS: readonly RecentGift[] = [
  {
    id: "gift-001",
    sunner: {
      id: "sunner-mai",
      displayName: "Trần Thu Mai",
      avatarUrl: SIDEBAR_AVATAR,
      title: "Lead Product Designer",
    },
    giftDescription: "Sách 'Atomic Habits' phiên bản giới hạn",
    receivedAt: "2026-05-18T07:30:00.000Z",
  },
  {
    id: "gift-002",
    sunner: {
      id: "sunner-bao",
      displayName: "Lê Hoàng Bảo",
      avatarUrl: SIDEBAR_AVATAR,
      title: "Tech Lead — Mobile",
    },
    giftDescription: "Voucher cà phê SAA 2025",
    receivedAt: "2026-05-18T05:15:00.000Z",
  },
  {
    id: "gift-003",
    sunner: {
      id: "sunner-linh",
      displayName: "Hoàng Mỹ Linh",
      avatarUrl: SIDEBAR_AVATAR,
      title: "Senior QA",
    },
    giftDescription: "Bộ stickers SAA 2025",
    receivedAt: "2026-05-17T22:00:00.000Z",
  },
  {
    id: "gift-004",
    sunner: {
      id: "sunner-khoa",
      displayName: "Đỗ Đăng Khoa",
      avatarUrl: SIDEBAR_AVATAR,
      title: "Product Manager",
    },
    giftDescription: "Áo hoodie SAA 2025",
    receivedAt: "2026-05-17T14:45:00.000Z",
  },
  {
    id: "gift-005",
    sunner: {
      id: "sunner-thuy",
      displayName: "Phạm Thanh Thuỷ",
      avatarUrl: SIDEBAR_AVATAR,
      title: "Brand Manager",
    },
    giftDescription: "Voucher Tiki 500K",
    receivedAt: "2026-05-17T09:30:00.000Z",
  },
  {
    id: "gift-006",
    sunner: {
      id: "sunner-trang",
      displayName: "Nguyễn Mỹ Trang",
      avatarUrl: SIDEBAR_AVATAR,
      title: "People Partner",
    },
    giftDescription: "Túi tote SAA 2025",
    receivedAt: "2026-05-16T16:00:00.000Z",
  },
  {
    id: "gift-007",
    sunner: {
      id: "sunner-nga",
      displayName: "Trần Hồng Nga",
      avatarUrl: SIDEBAR_AVATAR,
      title: "Content Lead",
    },
    giftDescription: "Bộ flashcard tiếng Anh",
    receivedAt: "2026-05-16T03:15:00.000Z",
  },
  {
    id: "gift-008",
    sunner: {
      id: "sunner-hieu",
      displayName: "Vũ Trung Hiếu",
      avatarUrl: SIDEBAR_AVATAR,
      title: "Motion Designer",
    },
    giftDescription: "Combo cà phê + sách",
    receivedAt: "2026-05-15T08:00:00.000Z",
  },
  {
    id: "gift-009",
    sunner: {
      id: "sunner-anh",
      displayName: "Nguyễn Quốc Anh",
      avatarUrl: SIDEBAR_AVATAR,
      title: "Senior Frontend Engineer",
    },
    giftDescription: "Bộ stickers SAA 2025",
    receivedAt: "2026-05-14T11:30:00.000Z",
  },
  {
    id: "gift-010",
    sunner: {
      id: "sunner-duy",
      displayName: "Bùi Tiến Duy",
      avatarUrl: SIDEBAR_AVATAR,
      title: "Backend Engineer",
    },
    giftDescription: "Voucher Tiki 300K",
    receivedAt: "2026-05-13T13:45:00.000Z",
  },
];
