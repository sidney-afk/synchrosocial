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
  { name: "Danny Morel", ig: "dannymorel", who: "Life coach and podcaster", result: "3.5M+ followers, 500M+ views", img: "/images/danny-morel.jpg" },
  { name: "Baya Voce", ig: "bayavoce", who: "Relationship expert", result: "7K to 350K+ followers", img: "/images/baya.jpg" },
  { name: "Garrain Jones", ig: "garrain.jones", who: "Coach and speaker", result: "73.2M views in 12 months", img: "/images/garrain.jpg" },
  { name: "Lucas Salame", ig: "lucas__salame", who: "Spiritual guide", result: "57K to 140K+ followers", img: "/images/lucas.jpg" },
  { name: "Jessica Winterstern", ig: "thefeminineheart", who: "Writer and coach", result: "4K to 100K+ followers", img: "/images/jessica.jpg" },
  { name: "Daniel Raphael", who: "Spiritual guide", result: "11.4M views on one video", img: "/images/daniel.jpg" },
  { name: "Morgan Burch", who: "Therapist", result: "15M views in 3 months", img: "/images/morgan.jpg" },
  { name: "Alexi Panos", who: "Coach and author", result: "+30K followers in 2 months", img: "/images/alexi.jpg" },
  { name: "Tu Lam", who: "Founder of Ronin Tactics", result: "640K+ followers", img: "/images/tu-lam.jpg" },
  { name: "Mastin Kipp", who: "Author and coach", result: "400K+ followers", img: "/images/mastin.jpg" },
  { name: "Kute Blackson", who: "Author and speaker", result: "300K+ followers", img: "/images/kute.jpg" },
  { name: "Stefanos Sifandos", who: "Relationship coach", result: "200K+ followers", img: "/images/stefanos.jpg" },
  { name: "Dr. Lily Baker", ig: "theopenposturedoc", who: "Chiropractic Physician", result: "+60K followers in under 90 days", img: "/images/apply4/lily-baker-avatar.webp" },
  { name: "Dr. Sonia Chopra", ig: "drsoniachopra", who: "Endodontist", result: "1,500 comments on one post", img: "/images/apply4/sonia-chopra-avatar.webp" },
  { name: "Edward Mannix", ig: "edwardmannix", who: "Spiritual coach", result: "700 to 90K+ followers", img: "/images/clients/edward-mannix.jpg" },
  { name: "Luke Cutting", ig: "lukebuildsai", who: "AI founder", result: "10M+ views in 3 months", img: "/images/clients/luke-cutting.jpg" },
  { name: "Luke MacNaughton", who: "Sales coach", result: "+10K followers in 1 month", img: "/images/people/luke-macnaughton.webp" },
  { name: "Amber Rae", who: "Author", result: "USA Today bestseller", img: "/images/clients/amber-rae.jpg" },
];

export const reels = [
  { w: "aq1gl2mzjo", views: "16.8M", handle: "@dannymorel" },
  { w: "o1cai14og1", views: "15.4M", handle: "@bayavoce", src: "/images/reels/o1cai14og1.jpg" },
  { w: "ke2uv8pkx4", views: "9.2M", handle: "@dannymorel" },
  { w: "hg7zrcgsmm", views: "7.8M", handle: "@goodmorgantherapy" },
  { w: "370zqi103h", views: "1.9M", handle: "@theopenposturedoc" },
  { w: "qfuvod4lh5", views: "850K", handle: "@drsoniachopra" },
  { w: "agctps725g", views: "3.8M", handle: "@lukebuildsai" },
  { w: "ty1po06ji9", views: "7.7M", handle: "@bayavoce", src: "/images/reels/ty1po06ji9.jpg" },
  { w: "jljq1r38qm", views: "5.6M", handle: "@goodmorgantherapy" },
  { w: "6d4n0e79y4", views: "3.4M", handle: "@edwardmannix" },
  { w: "vwma18vfm7", views: "5.9M", handle: "@dannymorel" },
  { w: "9jdg8z8xh7", views: "2.7M", handle: "@garrain.jones" },
  { w: "dnudt15o8k", views: "2.1M", handle: "@thefeminineheart" },
  { w: "zasud019el", views: "2.0M", handle: "@lucas__salame" },
  { w: "oster0f52c", views: "2.2M", handle: "@garrain.jones" },
  { w: "g5skq39lsu", views: "2.6M", handle: "@bayavoce" },
  { w: "0juxkmkz5o", views: "1.6M", handle: "@bayavoce" },
  { w: "baibou3p4f", views: "1.4M", handle: "@lukebuildsai" },
  { w: "qdhrx14fkr", views: "1.3M", handle: "@lukebuildsai" },
  { w: "4yi5pwvrik", views: "867K", handle: "@doug_cartwright" },
  { w: "mgjt4z4zbh", views: "845K", handle: "@dani__robin" },
  { w: "quopccb1sg", views: "753K", handle: "@chelseyscaffidi" },
  { w: "xmo6e2nkzq", views: "513K", handle: "@nataliemacneil" },
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

// The eight shown on the home page, in this order. Everyone else lives on /results.
export const homePeople = ["Danny Morel","Baya Voce","Dr. Lily Baker","Garrain Jones","Dr. Sonia Chopra","Edward Mannix","Jessica Winterstern","Lucas Salame"];

// One line each, word for word from their testimonial videos.
export const quotes = [
  { q: "His team is so professional, so kind, so fast.", name: "Alli Schaper", role: "CEO and co-founder of SuperMush", href: "https://www.instagram.com/allischaper/" },
  { q: "They have an incredible process end to end and they make sure to really understand you, your strengths, your business, and your message.", name: "Sabrina Guler", role: "Founder of Sinclair West", href: "https://www.instagram.com/sabrinamguler/" },
  { q: "The results have been remarkable. I witnessed significant growth across my social media platforms.", name: "Tu Lam", role: "Founder and CEO of Ronin Tactics", href: "https://www.instagram.com/ronintactics/" },
];
