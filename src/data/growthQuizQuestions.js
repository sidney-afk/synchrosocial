// Growth Bottleneck Quiz — questions, scoring, and result copy.
// Source: "Growth Bottleneck Quiz Funnel — V2" (Google Doc). Originally Q1
// and Q5 sent people to check their real analytics — rewritten 2026-08-26 as
// self-assessment (same category/scoring intent, no reason to leave the
// page) since making someone tab away mid-quiz is a real drop-off risk.
// All 8 are self-assessment now. All options score 1-5 left to right.
//
// Scoring: two questions per category, summed (min 2, max 10). Route to the
// lowest-scoring category. Ties break in fixed priority order — reach fails
// make everything downstream invisible, so fix upstream first.
export const scorePriority = ["reach", "positioning", "profile", "consistency"];

export const quizQuestions = [
  {
    id: "q1",
    category: "reach",
    text: "Think about who actually sees your posts. Who is it mostly?",
    helper: "Go with your gut — no need to check your analytics.",
    options: [
      "Almost entirely people who already follow me",
      "Mostly my followers, with a few new people",
      "A fairly even mix of followers and new people",
      "Mostly people who don't follow me yet",
      "Almost entirely people who've never seen me before",
    ],
  },
  {
    id: "q2",
    category: "reach",
    text: "How strong are your opening hooks?",
    options: [
      "What are hooks?",
      "My hooks are generic",
      "Some posts have strong hooks",
      "Most posts capture attention quickly",
      "My hooks consistently stop the scroll",
    ],
  },
  {
    id: "q3",
    category: "positioning",
    text: "How clearly is your content made for one specific audience?",
    options: [
      "It is for everyone",
      "It is aimed at a broad group",
      "I have an audience in mind, but my content varies",
      "Most content speaks to one audience",
      "Every post is built for a clearly defined audience",
    ],
  },
  {
    id: "q4",
    category: "positioning",
    text: "How distinctive is your point of view?",
    options: [
      "I mostly repeat common advice",
      "I rarely share strong opinions",
      "I have opinions, but they are inconsistent",
      "People know what I believe",
      "My content is immediately recognizable as mine",
    ],
  },
  {
    id: "q5",
    category: "profile",
    text: "When someone new sees your content, how likely are they to check out your profile?",
    helper: "Go with your gut — no need to check your analytics.",
    options: [
      "Rarely — most people just scroll past",
      "Occasionally, if the post is really strong",
      "Sometimes, especially the better ones",
      "Often — my content usually makes people curious",
      "Very often — people frequently check out my profile after",
    ],
  },
  {
    id: "q6",
    category: "profile",
    text: "How clearly does your profile explain who you help?",
    options: [
      "It mainly talks about me",
      "It is confusing",
      "It explains what I do",
      "It clearly explains who I help",
      "The right person instantly knows why to follow me",
    ],
  },
  {
    id: "q7",
    category: "consistency",
    text: "How consistently do you publish?",
    options: [
      "Randomly",
      "Less than once a week",
      "One to two times per week",
      "Three to five times per week",
      "Daily or nearly daily",
    ],
  },
  {
    id: "q8",
    category: "consistency",
    text: "How much content do you create from each original idea?",
    options: [
      "One idea creates one post",
      "I rarely repurpose",
      "I sometimes repurpose",
      "One idea creates several posts",
      "I have a repeatable repurposing system",
    ],
  },
];

// Each result: what it is → why it caps growth → one solo action → the
// bridge. Framed as "your biggest constraint right now," never a failed
// section.
export const quizResults = {
  reach: {
    label: "Reach",
    title: "Your biggest constraint: Reach",
    body: "Your content is mostly being shown to people who already follow you. The algorithm decides whether to push your posts to new audiences based on how the first few seconds perform, and right now your content isn't earning that distribution.",
    why: "You can't gain followers from people who never see your content. Everything else about your brand can be perfect, but if non-followers aren't reached, growth stays flat no matter how often you post.",
    action:
      "Take your next 5 posts and rewrite the first line or first 3 seconds before publishing. Cut every introduction, greeting, and context-setting sentence. Start at the most interesting claim in the post. Then check your non-follower view percentage after two weeks.",
    bridge:
      "Hooks that consistently stop the scroll aren't a trick, they're a production system: testing hook patterns, tracking what your audience responds to, and iterating every week. That's the machine behind every account on the proof wall above.",
  },
  positioning: {
    label: "Positioning",
    title: "Your biggest constraint: Positioning",
    body: "Your content reaches people, but it doesn't give them a reason to remember you. Content made for everyone gets scrolled past by everyone, and without a distinctive point of view you're competing with every other creator saying the same things.",
    why: 'People follow accounts that stand for something specific. If a viewer can\'t finish the sentence "this account is for ___ and believes ___," they watch and move on. Views without identity don\'t convert into followers.',
    action:
      'Write one sentence: "I help [specific person] achieve [specific outcome], and I believe [opinion most of my industry disagrees with]." Then audit your last 10 posts against it. Cut every future content idea that doesn\'t pass.',
    bridge:
      "Sharpening positioning is a strategy problem before it's a content problem. The accounts on the proof wall grew because every post was built from a defined content architecture, not decided the morning of.",
  },
  profile: {
    label: "Profile",
    title: "Your biggest constraint: Profile conversion",
    body: "Your content is doing its job: people see it and some click through to your profile. Then the profile loses them. Views that don't turn into profile visits, and profile visits that don't turn into follows, are leaks in the exact spot where growth is decided.",
    why: "A follow happens on the profile, not on the post. If your bio talks about you instead of who you help, or your pinned content doesn't confirm what the new visitor just liked, you're paying for attention and losing it at the door.",
    action:
      "Rewrite your bio so the first line names who you help and the outcome you help them get. Then pin your 3 best-performing posts so a new visitor immediately sees your strongest work.",
    bridge:
      "Profile conversion compounds with everything upstream. When positioning, content, and profile all say the same thing, follow rates multiply instead of add. That alignment is what we engineer for the accounts above.",
  },
  consistency: {
    label: "Consistency",
    title: "Your biggest constraint: Consistency",
    body: "Your content works when you publish. The problem is how rarely that happens. Algorithms reward accounts that give them a steady supply of content to test, and audiences forget accounts that disappear.",
    why: "Growth is a volume game run over months. Publishing randomly means every post starts cold, and one idea becoming one post means you're leaving 80% of your content on the table.",
    action:
      "Take your single best-performing post from the last 90 days and turn it into 5 new pieces: a different hook on the same idea, a story version, a contrarian version, a list version, and a short clip. Publish across two weeks.",
    bridge:
      "Consistency isn't discipline, it's infrastructure: a repurposing system, a content calendar, and a production process that doesn't depend on you feeling inspired. Several accounts on the proof wall grew with zero filming from the client. That's what a system looks like.",
  },
};
