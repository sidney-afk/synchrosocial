// Growth Bottleneck Quiz — proof data.
//
// Canonical source is the Apply page (decision log, 2026-08-24): numbers
// come from campaignProof.js where the client appears there; the two who
// don't — Garrain Jones and Morgan Burch — fall back to caseStudies.js,
// also rendered on /apply (the "Check Out Our Case Studies" section). Kept
// as a flat literal file, same convention as campaignProof.js/caseStudies.js,
// so it's easy to hand-edit without touching component code.

export const quizProofGrid = [
  { name: "Baya Voce", results: ["7K → 350K+ Followers"] }, // campaignProof.js
  { name: "Edward Mannix", results: ["700 → 90K+ Followers", "3.4M views on one video"] }, // campaignProof.js
  { name: "Jessica Winterstern", results: ["4K → 100K+ Followers", "13M+ total views"] }, // campaignProof.js
  { name: "Lucas Salame", results: ["57K → 140K+ Followers", "20M+ total views"] }, // campaignProof.js
  { name: "Garrain Jones", results: ["+180K Followers Added", "73.2M views generated"] }, // caseStudies.js
  { name: "Morgan Burch", results: ["+48K Followers Added", "15M views in 3 months"] }, // caseStudies.js
];

// Pulled out of the strip, own visual treatment.
export const quizFeatured = {
  name: "Alexi Panos",
  headline: "Alexi Panos added +30K followers in 2 months — with zero filming required.",
}; // campaignProof.js

export const quizProofStrip =
  "Luke MacNaughton added 10K followers in one month. Daniel Raphael reached 250K followers with 30M+ total views."; // campaignProof.js
