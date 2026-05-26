import type { Locale } from "@/types/auth";

type LoginDictionary = {
  heroDescription: string;
  loginButton: string;
  copyright: string;
  errors: {
    oauthFailed: string;
    domainNotAllowed: string;
    sessionExpired: string;
  };
};

type CountdownDictionary = {
  subtitle: string;
  daysLabel: string;
  hoursLabel: string;
  minutesLabel: string;
  /** Single placeholder character used for every digit when EVENT_START_AT is malformed. */
  malformedDigit: string;
};

type AwardsDictionary = {
  caption: string;
  heading: string;
  /** Label shown in front of the count value, e.g. "Số lượng giải thưởng:" */
  countLabel: string;
  /** Label shown in front of the prize value, e.g. "Giá lưu giải thưởng:" */
  valueLabel: string;
  /** Per-prize suffix used for primary awards (e.g. "cho mỗi giải thưởng"). */
  perPrizeSuffix: string;
  /** Disjunction label rendered between Signature 2025's dual values. */
  orLabel: string;
};

type KudosDialogDictionary = {
  dialogTitle: string;
  recipientLabel: string;
  recipientPlaceholder: string;
  recipientRequired: string;
  recipientFreeFormError: string;
  recipientSelfError: string;
  headlineLabel: string;
  headlinePlaceholder: string;
  headlineHelper: string;
  headlineRequired: string;
  contentLabel: string;
  contentPlaceholder: string;
  contentRequired: string;
  contentMentionHint: string;
  communityStandardsLabel: string;
  hashtagLabel: string;
  hashtagButtonLabel: string;
  hashtagPlaceholder: string;
  hashtagCreateOption: string;
  hashtagRequired: string;
  hashtagDuplicateError: string;
  hashtagMaxError: string;
  imageButtonLabel: string;
  imageInvalidTypeError: string;
  imageSizeError: string;
  imageMaxError: string;
  anonymousLabel: string;
  anonymousAliasPlaceholder: string;
  anonymousDefaultName: string;
  helperText: string;
  cancelLabel: string;
  submitLabel: string;
  submittingLabel: string;
  submitSuccessToast: string;
  submitErrorMessage: string;
  networkErrorMessage: string;
  formatBoldLabel: string;
  formatItalicLabel: string;
  formatStrikeLabel: string;
  formatNumberListLabel: string;
  formatLinkLabel: string;
  formatLinkPrompt: string;
  formatQuoteLabel: string;
  mentionPlaceholder: string;
  noResultsLabel: string;
};

type KudosDictionary = {
  keyvisualTitle: string;
  sendInputPlaceholder: string;
  sendInputAria: string;
  filterHashtagLabel: string;
  filterDepartmentLabel: string;
  filterClearLabel: string;
  highlightEyebrow: string;
  highlightTitle: string;
  allKudosEyebrow: string;
  allKudosTitle: string;
  spotlightEyebrow: string;
  spotlightTitle: string;
  spotlightCountLabel: string;
  spotlightSearchPlaceholder: string;
  spotlightSearchSubmitLabel: string;
  viewDetailsLabel: string;
  copyLinkLabel: string;
  copyLinkToast: string;
  heartLabel: string;
  emptyKudosMessage: string;
  emptyLeaderboardMessage: string;
  loadingLabel: string;
  loadMoreLabel: string;
  noMoreLabel: string;
  secretBoxButtonLabel: string;
  secretBoxDisabledTooltip: string;
  panZoomLabel: string;
  panLabel: string;
  zoomLabel: string;
  sidebarReceivedLabel: string;
  sidebarSentLabel: string;
  sidebarHeartsLabel: string;
  sidebarSecretBoxesOpenedLabel: string;
  sidebarSecretBoxesPendingLabel: string;
  recentGiftsTitle: string;
  hashtagOverflowLabel: string;
  hashtagPlural: string;
  sendErrorMessage: string;
  heartErrorMessage: string;
  /** Display name fallback shown on anonymous kudos when no alias is provided. */
  anonymousDefaultName: string;
  searchMaxCharsError: string;
  searchRequiredError: string;
  carouselPagerLabel: string;
  carouselPrevLabel: string;
  carouselNextLabel: string;
};

type HomepageDictionary = {
  heroTitle: string;
  comingSoon: string;
  countdown: { days: string; hours: string; minutes: string };
  eventInfo: {
    timeLabel: string;
    locationLabel: string;
  };
  cta: { aboutAwards: string; aboutKudos: string };
  awards: {
    caption: string;
    title: string;
    detail: string;
  };
  sunKudos: {
    label: string;
    title: string;
    eyebrow: string;
    body: string;
    cta: string;
  };
  rootFurther: {
    intro: string;
    quote: string;
    quoteGloss: string;
    conclusion: string;
  };
  account: {
    profile: string;
    signOut: string;
    adminDashboard: string;
  };
  language: {
    label: string;
    options: { vi: string; en: string };
  };
  copyright: string;
  footerLinks: {
    aboutSAA: string;
    awardInformation: string;
    sunKudos: string;
    communityStandards: string;
  };
};

export const DEFAULT_LOCALE: Locale = "vi";

export const dictionary: Record<
  Locale,
  {
    login: LoginDictionary;
    homepage: HomepageDictionary;
    countdown: CountdownDictionary;
    awards: AwardsDictionary;
    kudos: KudosDictionary;
    kudosDialog: KudosDialogDictionary;
  }
> = {
  vi: {
    login: {
      heroDescription:
        "Bắt đầu hành trình của bạn cùng SAA 2025.\nĐăng nhập để khám phá!",
      loginButton: "LOGIN With Google",
      copyright: "Bản quyền thuộc về Sun* © 2025",
      errors: {
        oauthFailed: "Đăng nhập không thành công. Vui lòng thử lại.",
        domainNotAllowed:
          "Tài khoản này không thuộc tổ chức Sun*. Vui lòng dùng email Sun*.",
        sessionExpired:
          "Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.",
      },
    },
    homepage: {
      heroTitle: "ROOT FURTHER",
      comingSoon: "Comming soon",
      countdown: { days: "DAYS", hours: "HOURS", minutes: "MINUTES" },
      eventInfo: { timeLabel: "Thời gian:", locationLabel: "Địa điểm:" },
      cta: { aboutAwards: "ABOUT AWARDS", aboutKudos: "ABOUT KUDOS" },
      awards: {
        caption: "Sun* annual awards 2025",
        title: "Hệ thống giải thưởng",
        detail: "Chi tiết",
      },
      sunKudos: {
        label: "Phong trào ghi nhận",
        title: "Sun* Kudos",
        eyebrow: "ĐIỂM MỚI CỦA SAA 2025",
        body: "Hoạt động ghi nhận và cảm ơn đồng nghiệp - lần đầu tiên được diễn ra dành cho tất cả Sunner. Hoạt động sẽ được triển khai vào tháng 11/2025, khuyến khích người Sun* chia sẻ những lời ghi nhận, cảm ơn đồng nghiệp trên hệ thống do BTC công bố. Đây sẽ là chất liệu để Hội đồng Heads tham khảo trong quá trình lựa chọn người đạt giải.",
        cta: "Chi tiết",
      },
      rootFurther: {
        intro:
          "Đứng trước bối cảnh thay đổi như vũ bão của thời đại AI và yêu cầu ngày càng cao từ khách hàng, Sun* lựa chọn chiến lược đa dạng hóa năng lực để không chỉ nỗ lực trở thành tinh anh trong lĩnh vực của mình, mà còn hướng đến một cái đích cao hơn, nơi mọi Sunner đều là “problem-solver” — chuyên gia trong việc giải quyết mọi vấn đề, tìm lời giải cho mọi bài toán của dự án, khách hàng và xã hội. Lấy cảm hứng từ sự đa dạng năng lực, khả năng phát triển linh hoạt cùng tinh thần đào sâu để bứt phá trong kỷ nguyên AI, “Root Further” đã được chọn để trở thành chủ đề chính thức của Lễ trao giải Sun* Annual Awards 2025. Vượt ra khỏi nét nghĩa bề mặt, “Root Further” chính là hành trình chúng ta không ngừng vươn xa hơn, cắm rễ mạnh hơn, chạm đến những tầng “địa chất” ẩn sâu để tiếp tục tồn tại, vươn lên và nuôi dưỡng đam mê kiến tạo giá trị luôn cháy bỏng của người Sun*.",
        quote: "“A tree with deep roots fears no storm”",
        quoteGloss: "(Cây sâu bén rễ, bão giông chẳng nề — Ngạn ngữ Anh)",
        conclusion:
          "Trước giông bão, chỉ những tán cây có bộ rễ đủ mạnh mới có thể trụ vững. Một tổ chức với những cá nhân tự tin vào năng lực đa dạng, sẵn sàng kiến tạo và đón nhận thử thách, làm chủ sự thay đổi là tổ chức không chỉ vững vàng trước biến động, mà còn khai thác được mọi lợi thế, chinh phục các thách thức của thời cuộc. Không đơn thuần là tên gọi của chương mới trên hành trình phát triển tổ chức, “Root Further” còn như một lời cổ vũ, động viên mỗi chúng ta hãy dám tin vào bản thân, dám đào sâu, khai mở mọi tiềm năng, dám phá bỏ giới hạn, dám trở thành phiên bản đa nhiệm và xuất sắc nhất của mình. Khi “Root Further” đã trở thành tinh thần cội rễ, chúng ta sẽ không sợ hãi, mà càng thấy háo hức trước bất cứ vùng vô định nào trên hành trình tiến về phía trước.",
      },
      account: {
        profile: "Hồ sơ",
        signOut: "Đăng xuất",
        adminDashboard: "Trang quản trị",
      },
      language: {
        label: "Ngôn ngữ",
        options: { vi: "VN", en: "EN" },
      },
      copyright: "Bản quyền thuộc về Sun* © 2025",
      footerLinks: {
        aboutSAA: "About SAA 2025",
        awardInformation: "Award Information",
        sunKudos: "Sun* Kudos",
        communityStandards: "Tiêu chuẩn chung",
      },
    },
    countdown: {
      // Per plan decision: Vietnamese subtitle for both locales.
      subtitle: "Sự kiện sẽ bắt đầu sau",
      daysLabel: "DAYS",
      hoursLabel: "HOURS",
      minutesLabel: "MINUTES",
      malformedDigit: "-",
    },
    awards: {
      caption: "Sun* annual awards 2025",
      heading: "Hệ thống giải thưởng SAA 2025",
      countLabel: "Số lượng giải thưởng:",
      valueLabel: "Giá trị giải thưởng:",
      perPrizeSuffix: "cho mỗi giải thưởng",
      orLabel: "Hoặc",
    },
    kudos: {
      keyvisualTitle: "Hệ thống ghi nhận lời cảm ơn",
      sendInputPlaceholder:
        "Hôm nay, bạn muốn gửi lời cảm ơn và ghi nhận đến ai?",
      sendInputAria: "Mở hộp thoại gửi Kudos",
      filterHashtagLabel: "Hashtag",
      filterDepartmentLabel: "Phòng ban",
      filterClearLabel: "Bỏ chọn",
      highlightEyebrow: "Sun* Annual Awards 2025",
      highlightTitle: "HIGHLIGHT KUDOS",
      allKudosEyebrow: "Sun* Annual Awards 2025",
      allKudosTitle: "ALL KUDOS",
      spotlightEyebrow: "Sun* Annual Awards 2025",
      spotlightTitle: "SPOTLIGHT BOARD",
      spotlightCountLabel: "KUDOS",
      spotlightSearchPlaceholder: "Tìm kiếm profile Sunner",
      spotlightSearchSubmitLabel: "Tìm kiếm Sunner",
      viewDetailsLabel: "Xem chi tiết",
      copyLinkLabel: "Copy Link",
      copyLinkToast: "Link copied — ready to share!",
      heartLabel: "Yêu thích",
      emptyKudosMessage: "Hiện tại chưa có Kudos nào.",
      emptyLeaderboardMessage: "Chưa có dữ liệu",
      loadingLabel: "Đang tải...",
      loadMoreLabel: "Xem thêm",
      noMoreLabel: "Đã hết Kudos",
      secretBoxButtonLabel: "Mở Secret Box",
      secretBoxDisabledTooltip:
        "Bạn chưa có hộp quà nào để mở. Tiếp tục lan toả Kudos để nhận quà!",
      panZoomLabel: "Pan / Zoom",
      panLabel: "Pan",
      zoomLabel: "Zoom",
      sidebarReceivedLabel: "Kudos đã nhận",
      sidebarSentLabel: "Kudos đã gửi",
      sidebarHeartsLabel: "Trái tim nhận được",
      sidebarSecretBoxesOpenedLabel: "Hộp quà đã mở",
      sidebarSecretBoxesPendingLabel: "Hộp quà chờ mở",
      recentGiftsTitle: "10 SUNNER NHẬN QUÀ\nMỚI NHẤT",
      hashtagOverflowLabel: "+{count} more",
      hashtagPlural: "hashtag",
      sendErrorMessage:
        "Không thể gửi Kudos. Vui lòng thử lại sau.",
      heartErrorMessage:
        "Không thể lưu lượt yêu thích. Vui lòng thử lại.",
      searchMaxCharsError: "Tìm kiếm tối đa 100 ký tự.",
      searchRequiredError: "Nhập từ khoá để tìm kiếm.",
      carouselPagerLabel: "{current}/{total}",
      carouselPrevLabel: "Slide trước",
      carouselNextLabel: "Slide kế tiếp",
      anonymousDefaultName: "Ẩn danh",
    },
    kudosDialog: {
      dialogTitle: "Gửi lời cám ơn và ghi nhận đến đồng đội",
      recipientLabel: "Người nhận",
      recipientPlaceholder: "Tìm kiếm",
      recipientRequired: "Không được để trống",
      recipientFreeFormError: "Vui lòng chọn người nhận từ danh sách",
      recipientSelfError: "Bạn không thể gửi Kudos cho chính mình",
      headlineLabel: "Danh hiệu",
      headlinePlaceholder: "Dành tặng một danh hiệu cho đồng đội",
      headlineHelper:
        "Ví dụ: Người truyền động lực cho tôi.\nDanh hiệu sẽ hiển thị làm tiêu đề Kudos của bạn.",
      headlineRequired: "Không được để trống",
      contentLabel: "Nội dung",
      contentPlaceholder:
        "Hãy gửi gắm lời cám ơn và ghi nhận đến đồng đội tại đây nhé!",
      contentRequired: "Không được để trống",
      contentMentionHint:
        'Bạn có thể "@ + tên" để nhắc tới đồng nghiệp khác',
      communityStandardsLabel: "Tiêu chuẩn cộng đồng",
      hashtagLabel: "Hashtag",
      hashtagButtonLabel: "+ Hashtag",
      hashtagPlaceholder: "Tìm hoặc tạo hashtag",
      hashtagCreateOption: "Tạo hashtag mới: '{input}'",
      hashtagRequired: "Không được để trống",
      hashtagDuplicateError: "Hashtag đã tồn tại trong danh sách",
      hashtagMaxError: "Tối đa 5 hashtag",
      imageButtonLabel: "+ Image",
      imageInvalidTypeError: "Định dạng file không hợp lệ",
      imageSizeError: "Ảnh vượt quá 5 MB",
      imageMaxError: "Tối đa 5 ảnh",
      anonymousLabel: "Gửi lời cám ơn và ghi nhận ẩn danh",
      anonymousAliasPlaceholder: "Tên ẩn danh (tuỳ chọn)",
      anonymousDefaultName: "Ẩn danh",
      helperText:
        "Ví dụ: Người truyền động lực cho tôi. Danh hiệu sẽ hiển thị làm tiêu đề Kudos của bạn.",
      cancelLabel: "Hủy",
      submitLabel: "Gửi",
      submittingLabel: "Đang gửi...",
      submitSuccessToast: "Kudos đã được gửi!",
      submitErrorMessage: "Không thể gửi Kudos. Vui lòng thử lại.",
      networkErrorMessage: "Không có kết nối. Vui lòng thử lại.",
      formatBoldLabel: "In đậm",
      formatItalicLabel: "In nghiêng",
      formatStrikeLabel: "Gạch ngang",
      formatNumberListLabel: "Danh sách đánh số",
      formatLinkLabel: "Chèn liên kết",
      formatLinkPrompt: "Dán URL",
      formatQuoteLabel: "Trích dẫn",
      mentionPlaceholder: "Gõ @ để mention",
      noResultsLabel: "Không có kết quả",
    },
  },
  en: {
    login: {
      heroDescription:
        "Start your journey with SAA 2025.\nSign in to explore!",
      loginButton: "LOGIN With Google",
      copyright: "© 2025 Sun*. All rights reserved.",
      errors: {
        oauthFailed: "Sign-in failed. Please try again.",
        domainNotAllowed:
          "This account is not part of the Sun* organization.",
        sessionExpired: "Your session has expired. Please sign in again.",
      },
    },
    homepage: {
      heroTitle: "ROOT FURTHER",
      comingSoon: "Coming soon",
      countdown: { days: "DAYS", hours: "HOURS", minutes: "MINUTES" },
      eventInfo: { timeLabel: "Time:", locationLabel: "Location:" },
      cta: { aboutAwards: "ABOUT AWARDS", aboutKudos: "ABOUT KUDOS" },
      awards: {
        caption: "Sun* Annual Awards 2025",
        title: "Awards system",
        detail: "Details",
      },
      sunKudos: {
        label: "Recognition initiative",
        title: "Sun* Kudos",
        eyebrow: "NEW IN SAA 2025",
        body: "An initiative for Sun* people to recognise and thank each other — launching for the very first time and open to every Sunner. From November 2025, you'll be invited to share appreciation and recognition through the official platform. The Heads Committee will use these stories as one of the inputs when picking this year's award recipients.",
        cta: "Details",
      },
      rootFurther: {
        intro:
          "Facing the breakneck pace of the AI era and ever-higher expectations from our clients, Sun* has chosen a strategy of capability diversification — not just to be best in our field, but to reach for something higher: a place where every Sunner is a true \"problem-solver,\" an expert at cracking any challenge a project, a client, or society can throw at them. Inspired by that diversity of skill, by adaptive growth, and by a willingness to dig deeper to break through in the AI era, “Root Further” has been chosen as the official theme of the Sun* Annual Awards 2025. Beyond its surface meaning, “Root Further” is the journey of constantly reaching further, anchoring our roots more deeply, touching the hidden layers below — so we can keep standing, keep rising, and keep alive the burning passion to create value that defines Sun* people.",
        quote: "“A tree with deep roots fears no storm”",
        quoteGloss: "(English proverb)",
        conclusion:
          "When the storm comes, only the trees with strong enough roots can stand firm. An organisation of individuals who trust their diversified capabilities, who are ready to create and embrace challenges, who own change, isn't just resilient against turbulence — it makes the most of every advantage and rises to meet the demands of the moment. More than the name of a new chapter, “Root Further” is an encouragement: dare to believe in yourself, dare to dig deep and unlock every latent potential, dare to break your own limits, dare to become the most versatile and outstanding version of yourself. When “Root Further” has become our root spirit, we won't fear the unknown ahead — we'll be excited by every uncharted territory on the way forward.",
      },
      account: {
        profile: "Profile",
        signOut: "Sign out",
        adminDashboard: "Admin Dashboard",
      },
      language: {
        label: "Language",
        options: { vi: "VN", en: "EN" },
      },
      copyright: "© 2025 Sun*. All rights reserved.",
      footerLinks: {
        aboutSAA: "About SAA 2025",
        awardInformation: "Award Information",
        sunKudos: "Sun* Kudos",
        communityStandards: "Community Standards",
      },
    },
    countdown: {
      // Plan decision: keep the Vietnamese subtitle on EN locale too.
      subtitle: "Sự kiện sẽ bắt đầu sau",
      daysLabel: "DAYS",
      hoursLabel: "HOURS",
      minutesLabel: "MINUTES",
      malformedDigit: "-",
    },
    awards: {
      caption: "Sun* Annual Awards 2025",
      heading: "Awards system",
      countLabel: "Prize count:",
      valueLabel: "Prize value:",
      perPrizeSuffix: "per prize",
      orLabel: "Or",
    },
    kudos: {
      keyvisualTitle: "Recognition wall — say thanks",
      sendInputPlaceholder: "Who would you like to thank today?",
      sendInputAria: "Open send-Kudos dialog",
      filterHashtagLabel: "Hashtag",
      filterDepartmentLabel: "Department",
      filterClearLabel: "Clear",
      highlightEyebrow: "Sun* Annual Awards 2025",
      highlightTitle: "HIGHLIGHT KUDOS",
      allKudosEyebrow: "Sun* Annual Awards 2025",
      allKudosTitle: "ALL KUDOS",
      spotlightEyebrow: "Sun* Annual Awards 2025",
      spotlightTitle: "SPOTLIGHT BOARD",
      spotlightCountLabel: "KUDOS",
      spotlightSearchPlaceholder: "Search Sunner profile",
      spotlightSearchSubmitLabel: "Search Sunner",
      viewDetailsLabel: "View details",
      copyLinkLabel: "Copy Link",
      copyLinkToast: "Link copied — ready to share!",
      heartLabel: "Heart",
      emptyKudosMessage: "No Kudos yet.",
      emptyLeaderboardMessage: "No data yet",
      loadingLabel: "Loading...",
      loadMoreLabel: "Load more",
      noMoreLabel: "No more Kudos",
      secretBoxButtonLabel: "Open Secret Box",
      secretBoxDisabledTooltip:
        "No gift boxes yet. Keep spreading Kudos to unlock one!",
      panZoomLabel: "Pan / Zoom",
      panLabel: "Pan",
      zoomLabel: "Zoom",
      sidebarReceivedLabel: "Kudos received",
      sidebarSentLabel: "Kudos sent",
      sidebarHeartsLabel: "Hearts received",
      sidebarSecretBoxesOpenedLabel: "Boxes opened",
      sidebarSecretBoxesPendingLabel: "Boxes pending",
      recentGiftsTitle: "TOP 10 RECENT GIFTS",
      hashtagOverflowLabel: "+{count} more",
      hashtagPlural: "hashtags",
      sendErrorMessage: "Could not send Kudos. Try again.",
      heartErrorMessage: "Could not save your reaction. Try again.",
      searchMaxCharsError: "Search is limited to 100 characters.",
      searchRequiredError: "Enter a search term.",
      carouselPagerLabel: "{current}/{total}",
      carouselPrevLabel: "Previous slide",
      carouselNextLabel: "Next slide",
      anonymousDefaultName: "Anonymous",
    },
    kudosDialog: {
      dialogTitle: "Send a Kudos to a teammate",
      recipientLabel: "Recipient",
      recipientPlaceholder: "Search",
      recipientRequired: "Required",
      recipientFreeFormError: "Please pick a recipient from the list",
      recipientSelfError: "You can't send Kudos to yourself",
      headlineLabel: "Title",
      headlinePlaceholder: "Award a title to your teammate",
      headlineHelper:
        "E.g. Person who inspires me.\nThe title will appear as the heading of your Kudos.",
      headlineRequired: "Required",
      contentLabel: "Message",
      contentPlaceholder: "Share your thank-you message here!",
      contentRequired: "Required",
      contentMentionHint:
        'Type "@ + name" to mention another teammate',
      communityStandardsLabel: "Community standards",
      hashtagLabel: "Hashtag",
      hashtagButtonLabel: "+ Hashtag",
      hashtagPlaceholder: "Search or create hashtag",
      hashtagCreateOption: "Create new hashtag: '{input}'",
      hashtagRequired: "Required",
      hashtagDuplicateError: "Hashtag already added",
      hashtagMaxError: "Maximum 5 hashtags",
      imageButtonLabel: "+ Image",
      imageInvalidTypeError: "Invalid file type",
      imageSizeError: "Image exceeds 5 MB",
      imageMaxError: "Maximum 5 images",
      anonymousLabel: "Send anonymously",
      anonymousAliasPlaceholder: "Anonymous name (optional)",
      anonymousDefaultName: "Anonymous",
      helperText:
        "E.g. Person who inspires me. The title will become the Kudos heading.",
      cancelLabel: "Cancel",
      submitLabel: "Send",
      submittingLabel: "Sending...",
      submitSuccessToast: "Kudos sent!",
      submitErrorMessage: "Could not send Kudos. Try again.",
      networkErrorMessage: "Network error. Please try again.",
      formatBoldLabel: "Bold",
      formatItalicLabel: "Italic",
      formatStrikeLabel: "Strike",
      formatNumberListLabel: "Numbered list",
      formatLinkLabel: "Insert link",
      formatLinkPrompt: "Paste URL",
      formatQuoteLabel: "Quote",
      mentionPlaceholder: "Type @ to mention",
      noResultsLabel: "No results",
    },
  },
};

export function getLoginDictionary(locale: Locale): LoginDictionary {
  return (dictionary[locale] ?? dictionary[DEFAULT_LOCALE]).login;
}

export function getHomepageDictionary(locale: Locale): HomepageDictionary {
  return (dictionary[locale] ?? dictionary[DEFAULT_LOCALE]).homepage;
}

export function getCountdownDictionary(locale: Locale): CountdownDictionary {
  return (dictionary[locale] ?? dictionary[DEFAULT_LOCALE]).countdown;
}

export function getAwardsDictionary(locale: Locale): AwardsDictionary {
  return (dictionary[locale] ?? dictionary[DEFAULT_LOCALE]).awards;
}

export function getKudosDictionary(locale: Locale): KudosDictionary {
  return (dictionary[locale] ?? dictionary[DEFAULT_LOCALE]).kudos;
}

export function getKudosDialogDictionary(
  locale: Locale,
): KudosDialogDictionary {
  return (dictionary[locale] ?? dictionary[DEFAULT_LOCALE]).kudosDialog;
}
