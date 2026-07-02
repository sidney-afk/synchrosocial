// Shared case-study data (REAL data via Sandcastles), used by /apply and
// /thank-you so the two never drift apart.
//   • Real clients + their top reels, self-hosted on Wistia.
//   • "Total Views Generated" = each client's real total content views.
//   • Per-reel view counts reflect combined Instagram + TikTok reach.
export const caseStudies = [
  {
    name: "Baya Voce",
    credit: "@bayavoce",
    period: "12 Months",
    platforms: ["Instagram", "TikTok", "YouTube"],
    stats: [
      { value: "200M+", label: "Total Views Generated" },
      { value: "+350K", label: "Total Audience Growth" },
    ],
    videos: [
      { wistia: "o1cai14og1", views: "15.4M" },
      { wistia: "ty1po06ji9", views: "7.7M" },
      { wistia: "v0b9wflgc2", views: "5.3M" },
    ],
  },
  {
    name: "Danny Morel",
    credit: "@dannymorel",
    period: "12 Months",
    platforms: ["Instagram", "TikTok", "YouTube", "Facebook"],
    stats: [
      { value: "500M+", label: "Total Views Generated" },
      { value: "+3M", label: "Total Audience Growth" },
    ],
    videos: [
      // tiktok.com/@dannymorel/video/7187396490350972202 (If I Was A Woman)
      { wistia: "aq1gl2mzjo", views: "16.8M" },
      // tiktok.com/@dannymorel/video/7258248867349663018 (Emotionally Intelligent)
      // — dark-room shot in the middle so the three don't all look the same
      { wistia: "vwma18vfm7", views: "5.9M" },
      // tiktok.com/@dannymorel/video/7215212004284402990 (Why 50/50 Relationships)
      { wistia: "ke2uv8pkx4", views: "9.2M" },
    ],
  },
  {
    name: "Morgan Burch",
    credit: "@goodmorgantherapy",
    period: "12 Months",
    platforms: ["Instagram", "TikTok", "YouTube"],
    stats: [
      { value: "126M", label: "Total Views Generated" },
      { value: "+100K", label: "Total Audience Growth" },
    ],
    videos: [
      { wistia: "hg7zrcgsmm", views: "7.8M" },
      { wistia: "jljq1r38qm", views: "5.6M" },
      { wistia: "ri9fngzrc2", views: "2.4M" },
    ],
  },
  {
    name: "Jessica Winterstern",
    credit: "@thefeminineheart",
    period: "12 Months",
    platforms: ["Instagram"],
    stats: [
      { value: "13.4M", label: "Total Views Generated" },
      { value: "+100K", label: "Total Audience Growth" },
    ],
    videos: [
      { wistia: "dnudt15o8k", views: "2.1M" },
      { wistia: "or58nersqf", views: "1.1M" },
      { wistia: "xkhn7st38n", views: "890K" },
    ],
  },
  {
    name: "Garrain Jones",
    credit: "@garrain.jones",
    period: "12 Months",
    platforms: ["Instagram", "TikTok", "YouTube"],
    stats: [
      { value: "73.2M", label: "Total Views Generated" },
      { value: "+180K", label: "Total Audience Growth" },
    ],
    videos: [
      { wistia: "9jdg8z8xh7", views: "2.7M" },
      { wistia: "oster0f52c", views: "2.2M" },
      { wistia: "uos9ko8nrw", views: "2.1M" },
    ],
  },
  {
    name: "Lucas Salame",
    credit: "@lucas__salame",
    period: "12 Months",
    platforms: ["Instagram"],
    stats: [
      { value: "46.6M", label: "Total Views Generated" },
      { value: "+140K", label: "Total Audience Growth" },
    ],
    videos: [
      // Source: instagram.com/reel/DI36o9VsVeA (love & alcohol)
      { wistia: "zasud019el", views: "2.0M" },
      { wistia: "bbwr4wuqw7", views: "1.2M" },
      // Source: instagram.com/reel/DL5aRaAubzQ (masculine energy)
      { wistia: "ebrf7uwtaw", views: "1.2M" },
    ],
  },
];

// Client name → /public/images/clients/<slug>.jpg (real IG profile pics).
export const slug = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
