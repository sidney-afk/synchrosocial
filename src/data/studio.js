// Flip to true on launch day, when these pages move from /new to the root.
// It turns on search indexing, canonical links and the sitemap entries.
export const SITE_LIVE = false;
export const SITE_PAGES = ["", "clients", "results", "about", "careers", "privacy", "terms"];

// Content for the new company site (/new while it is being built).
export const team = [
  { name: "Kasper", role: "Founder", img: "/images/kasper.jpg" },
  { name: "Sidney", role: "Operations and systems", img: "/images/sidney.jpg" },
  { name: "Juani", role: "Client success", img: "/images/team/juani.webp" },
  { name: "Analia", role: "Social media manager", img: "/images/team/analia.webp" },
  { name: "Laura", role: "Social media manager", img: "/images/team/laura.webp" },
  { name: "Ludmila", role: "Social media manager", img: "/images/team/ludmila.webp" },
  { name: "Raha", role: "Social media manager", img: "/images/team/raha.webp" },
  { name: "Sebastian", role: "Social media manager", img: "/images/team/sebastian.webp" },
  { name: "Iara", role: "Video editor", img: "/images/team/iara.webp" },
  { name: "Nahuel", role: "Video editor", img: "/images/team/nahuel.webp" },
  { name: "Santi", role: "Video editor", img: "/images/team/santi.webp" },
  { name: "Rocio", role: "Graphic designer", img: "/images/rocio.jpg" },
];

// People we've worked with: face, who they are, and the one result we can stand behind.
export const people = [
  { name: "Danny Morel", who: "Life coach and podcaster", result: "3.5M+ followers, 500M+ views", img: "/images/danny-morel.jpg" },
  { name: "Baya Voce", who: "Relationship expert", result: "7K to 350K+ followers", img: "/images/baya.jpg" },
  { name: "Garrain Jones", who: "Coach and speaker", result: "73.2M views in 12 months", img: "/images/garrain.jpg" },
  { name: "Lucas Salame", who: "Spiritual guide", result: "57K to 140K+ followers", img: "/images/lucas.jpg" },
  { name: "Jessica Winterstern", who: "Writer and coach", result: "4K to 100K+ followers", img: "/images/jessica.jpg" },
  { name: "Daniel Raphael", who: "Spiritual guide", result: "11.4M views on one video", img: "/images/daniel.jpg" },
  { name: "Morgan Burch", who: "Therapist", result: "15M views in 3 months", img: "/images/morgan.jpg" },
  { name: "Alexi Panos", who: "Coach and author", result: "+30K followers in 2 months", img: "/images/alexi.jpg" },
  { name: "Tu Lam", who: "Founder of Ronin Tactics", result: "640K+ followers", img: "/images/tu-lam.jpg" },
  { name: "Mastin Kipp", who: "Author and coach", result: "400K+ followers", img: "/images/mastin.jpg" },
  { name: "Kute Blackson", who: "Author and speaker", result: "300K+ followers", img: "/images/kute.jpg" },
  { name: "Stefanos Sifandos", who: "Relationship coach", result: "200K+ followers", img: "/images/stefanos.jpg" },
  { name: "Dr. Lily Baker", who: "Chiropractor", result: "63.9K to 151K followers", img: "/images/apply4/lily-baker-avatar.webp" },
  { name: "Dr. Sonia Chopra", who: "Endodontist", result: "1,000s of qualified leads", img: "/images/apply4/sonia-chopra-avatar.webp" },
  { name: "Edward Mannix", who: "Spiritual coach", result: "700 to 96K+ followers", img: "/images/people/edward-mannix.webp" },
  { name: "Luke MacNaughton", who: "Sales coach", result: "1.7K to 15K followers", img: "/images/people/luke-macnaughton.webp" },
  { name: "Amber Rae", who: "Author", result: "USA Today bestseller", img: "/images/clients/amber-rae.jpg" },
];

export const reels = [
  { ig: "Dde-z33h-da", views: "24.1M", handle: "@midlife.muse" },
  { ig: "Ddz2Vh5hfVY", views: "17.5M", handle: "@midlife.muse" },
  { w: "aq1gl2mzjo", views: "16.8M", handle: "@dannymorel" },
  { w: "o1cai14og1", views: "15.4M", handle: "@bayavoce", src: "/images/reels/o1cai14og1.jpg" },
  { w: "ke2uv8pkx4", views: "9.2M", handle: "@dannymorel" },
  { w: "hg7zrcgsmm", views: "7.8M", handle: "@goodmorgantherapy" },
  { w: "ty1po06ji9", views: "7.7M", handle: "@bayavoce", src: "/images/reels/ty1po06ji9.jpg" },
  { w: "vwma18vfm7", views: "5.9M", handle: "@dannymorel" },
  { w: "jljq1r38qm", views: "5.6M", handle: "@goodmorgantherapy" },
  { ig: "DLAnWbKRpre", views: "5.3M", handle: "@bayavoce" },
  { ig: "DdRp2rqpwHI", views: "3.8M", handle: "@lukebuildsai" },
  { ig: "DfDrLWyIP6k", views: "5.0M", handle: "@jennaphillipsballard" },
  { ig: "DURDgR2jp33", views: "3.4M", handle: "@edwardmannix" },
  { ig: "DXZhh1mDiuM", views: "3.0M", handle: "@nathanhirschaut" },
  { w: "9jdg8z8xh7", views: "2.7M", handle: "@garrain.jones" },
  { ig: "DIt2FR9RNPE", views: "2.7M", handle: "@bayavoce" },
  { ig: "DV8usobDh_x", views: "2.6M", handle: "@bayavoce" },
  { w: "oster0f52c", views: "2.2M", handle: "@garrain.jones" },
  { w: "dnudt15o8k", views: "2.1M", handle: "@thefeminineheart" },
  { ig: "DefDCtfJqLG", views: "2.1M", handle: "@lukebuildsai" },
  { ig: "DP5c-0EjVcI", views: "1.9M", handle: "@luke_macnaughton" },
  { ig: "DbLM2v_RLDQ", views: "1.8M", handle: "@midlife.muse" },
  { w: "zasud019el", views: "2.0M", handle: "@lucas__salame" },
  { ig: "DUs169ejlhE", views: "1.7M", handle: "@edwardmannix" },
  { ig: "DevOdqeo9WU", views: "1.3M", handle: "@jennaphillipsballard" },
  { ig: "DUjGQ3xDvN8", views: "1.2M", handle: "@edwardmannix" },
  { ig: "DQAT3fVktRE", views: "1.2M", handle: "@luke_macnaughton" },
  { w: "bbwr4wuqw7", views: "1.2M", handle: "@lucas__salame" },
  { w: "or58nersqf", views: "1.1M", handle: "@thefeminineheart" },
];

export const steps = [
  { img: "generate-traffic", title: "Find the angle", body: "We study your audience first: what they care about, what they fear, what makes them stop scrolling. Every hook comes from that." },
  { img: "nurture-traffic", title: "Make it every week", body: "Scripts, filming plans, editing and posting, by one team that learns your voice." },
  { img: "monetize-traffic", title: "Turn views into business", body: "Content and simple systems that bring in leads, so growth shows up in your calendar, not only your follower count." },
];

export const LINKEDIN = "https://www.linkedin.com/company/synchro-social/";
export const INSTAGRAM = "https://www.instagram.com/synchrosocial/";
export const APPLY = "/apply";
export const GLASSDOOR_EN =
  "https://www.glassdoor.com.ar/Evaluaciones/Synchro-Social-Evaluaciones-E10830564.htm?filter.iso3Language=eng&filter.employmentStatus=REGULAR&filter.employmentStatus=PART_TIME&filter.employmentStatus=CONTRACT&filter.employmentStatus=FREELANCE";
