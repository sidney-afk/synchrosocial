/* ===========================================================================
   Case-study cards for the VSL funnel pages (/danny_vsl, /baya_vsl) and
   /success-stories.

   Shape matches the reference funnel's card: a name line, one headline stat,
   a qualifying tag, a short story, and the testimonial video.

   Every number here is carried over from existing site data — the video and
   the three result bullets come from src/data/campaignProof.js (the "Real
   campaigns. Real growth." grid on /apply), and the longer-run totals come
   from src/data/caseStudies.js. Nothing is invented: `stat` and `tag` are the
   client's own two strongest bullets promoted to headline position, and each
   `story` only restates figures that already appear in one of those files.
   Update campaignProof.js and this file together.
=========================================================================== */

export const vslCaseStudies = [
  {
    key: "baya",
    name: "Baya Voce | Relationship Expert",
    stat: "7K → 350K+ Followers",
    tag: "Into A Fully Booked Practice",
    story:
      "Baya had the expertise and the audience trust, but almost no reach — 7K followers and a practice she still had to fill by hand. We rebuilt her content around the ideas her audience actually responded to and ran the whole engine for her. She crossed 350K followers, put up 320K views in a single 9-day stretch, generated over 200M views across platforms in twelve months, and now runs a fully booked practice.",
    wistia: "yeaiy3c3c3",
    poster: "/images/campaign-proof/10-baya-voce.webp",
  },
  {
    key: "danny",
    name: "Danny Morel | Life Coach",
    stat: "+3.5M Followers",
    tag: "And 500M+ Views Generated",
    story:
      "Danny was already a strong operator, but his reach was capped by how much content he could personally drive. We took over ideation, scripting, editing and publishing across Instagram, TikTok, YouTube and Facebook. Over two years he added more than 3.5M followers and generated over 500M views, with individual videos hitting 16.8M and 9.2M, and built the #1 spirituality podcast in the process.",
    wistia: "g89atir80n",
    poster: "/images/campaign-proof/09-danny-morel.webp",
  },
  {
    key: "sonia",
    name: "Dr. Sonia Chopra | Endodontist",
    stat: "1,000s Of Qualified Leads",
    tag: "From A Standing Start In Healthcare",
    story:
      "Dr. Sonia is a board-certified endodontist in one of the hardest markets to make content work in — clinical healthcare, where most accounts stay invisible. We built her a content system that turned her expertise into content patients actually watch. One post alone pulled 1,500 comments, her following grew roughly 50%, and the account now produces thousands of qualified leads.",
    wistia: "vr83s40k0b",
    poster: "/images/campaign-proof/11-dr-sonia-chopra.webp",
  },
  {
    key: "lucas",
    name: "Lucas Salame | Spiritual Guide",
    stat: "57K → 140K+ Followers",
    tag: "With Clients Landing Straight From Videos",
    story:
      "Lucas was stuck at 57K with content that wasn't converting attention into business. We rebuilt his positioning and content system and ran it end to end across Instagram, TikTok and YouTube. He more than doubled to 140K+ followers, generated over 20M views with his strongest reels at 2.0M and 1.2M, and started landing clients directly from the videos themselves.",
    wistia: "nry8m1uctv",
    poster: "/images/campaign-proof/17-lucas-salame.webp",
  },
  {
    key: "jessica",
    name: "Jessica Winterstern | Writer & Coach",
    stat: "4K → 100K+ Followers",
    tag: "Starting With 500K+ Views On Video One",
    story:
      "Jessica came to us with 4K followers and a message that had never been packaged for short-form. The very first video we built with her did over 500K views. Inside twelve months she passed 100K followers, added more than 125K to her total audience, and generated over 13M views — without changing what she believes or how she talks about it.",
    wistia: "ks74yr9yz4",
    poster: "/images/campaign-proof/15-jessica-winterstern.webp",
  },
  {
    key: "alexi",
    name: "Alexi Panos | Coach & Author",
    stat: "+30K Followers In 2 Months",
    tag: "With Zero Additional Filming",
    story:
      "Alexi had years of existing footage and no time to shoot more. We built her engine entirely out of content she had already filmed — no new recording days, no additional lift on her side. In two months she added over 30K followers, and one video off that same back catalogue reached 622K views.",
    wistia: "lg3lx20act",
    poster: "/images/campaign-proof/13-alexi-panos.webp",
  },
  {
    key: "daniel",
    name: "Daniel Raphael | Spiritual Guide",
    stat: "11.4M Views On One Video",
    tag: "And 30M+ Views Overall",
    story:
      "Daniel's ideas travelled well in person but had never been cut for the feed. Once the content system was installed, one video alone reached 11.4M views. That run carried him past 250K Instagram followers and more than 30M total views, turning a message that used to live in rooms into one that scales without him.",
    wistia: "auyg1fhovv",
    poster: "/images/campaign-proof/12-daniel-raphael.webp",
  },
  {
    key: "edward",
    name: "Edward Mannix | Spiritual Coach",
    stat: "700 → 90K+ Followers",
    tag: "And Thousands Of Organic Leads",
    story:
      "Edward started with 700 followers — effectively invisible. We rebuilt how his work was presented and ran the content engine end to end. He grew past 90K followers, had a single video reach 3.4M views, and now brings in thousands of organic leads from content that costs him nothing to run.",
    wistia: "0dmp30wvy3",
    poster: "/images/campaign-proof/14-edward-mannix.webp",
  },
  {
    key: "luke",
    name: "Luke MacNaughton | Sales Coach",
    stat: "10K Followers In 1 Month",
    tag: "From A Standing Start",
    story:
      "Luke had the sales expertise but no audience to put it in front of. In his first month with the system installed he added 10K followers, one video reached 1.2M views, and he moved from unknown to a recognized authority in the sales-training space.",
    wistia: "jja02a6qju",
    poster: "/images/campaign-proof/16-luke-macnaughton.webp",
  },
];

/** Cards for a VSL page, in the doc's order. The page's own client leads, and
 *  the other of the Danny/Baya pair takes the first slot. */
export function vslCardsFor(pageKey) {
  const lead = pageKey === "danny" ? "baya" : "danny";
  const order = [lead, "sonia", "lucas", "jessica", "alexi", "daniel"];
  return order.map((k) => vslCaseStudies.find((c) => c.key === k)).filter(Boolean);
}

/** Every case-study card, for /success-stories. Ordered strongest-first. */
export const allVslCaseStudies = [
  "danny", "baya", "lucas", "daniel", "jessica", "sonia", "edward", "alexi", "luke",
]
  .map((k) => vslCaseStudies.find((c) => c.key === k))
  .filter(Boolean);
