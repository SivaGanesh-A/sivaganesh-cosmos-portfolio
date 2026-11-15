import { profile, skillGroups, projects, journey, certifications, hackathons, achievements } from '../data/profile.js';

// Turns profile.js into a compact plain-text resume the LLM reads as context.
// The whole resume fits in a few thousand tokens, so no vector database is needed.
export function buildKnowledge() {
  const lines = [];
  lines.push(`NAME: ${profile.name} (goes by ${profile.shortName})`);
  lines.push(`HEADLINE: ${profile.role}`);
  lines.push(`LOCATION: ${profile.location}`);
  lines.push(`CONTACT: email ${profile.email}; phone ${profile.phone}; LinkedIn ${profile.linkedin}; GitHub ${profile.github}; resume PDF at ${profile.resume}`);
  lines.push('', 'SUMMARY:', profile.intro, ...profile.about);
  lines.push('', 'SKILLS:');
  skillGroups.forEach((g) => lines.push(`- ${g.name}: ${g.items.join(', ')}`));
  lines.push('Self-rated levels from the resume: Pandas/NumPy basics, SQL basic queries and joins, React JS beginner.');
  lines.push('', 'EXPERIENCE AND EDUCATION:');
  journey.forEach((j) => lines.push(`- ${j.when}: ${j.title}, ${j.org}. ${j.points.join(' ')}`));
  lines.push('', 'PROJECTS:');
  projects.forEach((p) => lines.push(`- ${p.title}: ${p.summary} Stack: ${p.stack.join(', ')}.${p.live ? ` Live: ${p.live}.` : ''} Code: ${p.code}`));
  lines.push('', 'CERTIFICATIONS:');
  certifications.forEach((c) => lines.push(`- ${c.title} (${c.issuer})`));
  lines.push('', 'HACKATHONS (24-hour):');
  hackathons.forEach((h) => lines.push(`- ${h.name}: ${h.focus}`));
  lines.push('', 'ACHIEVEMENTS:');
  achievements.forEach((a) => lines.push(`- ${a}`));
  return lines.join('\n');
}

export function buildSystemPrompt() {
  return `You are the AI guide on ${profile.name}'s portfolio website. Visitors are usually recruiters, hiring managers or fellow developers.

Answer questions about ${profile.shortName} using ONLY the resume below. Rules:
- Refer to him in the third person ("Sivaganesh has…"). Be warm, confident and concise: 1–4 short sentences, or a short list when listing things.
- Never invent facts, numbers, employers, dates, links or skill levels. If the resume doesn't cover something, say you don't have that detail and suggest emailing him at ${profile.email}.
- Be honest about levels the resume states (e.g. React is listed as beginner).
- If asked something unrelated to Sivaganesh or his work, briefly steer back to what you can help with.
- Plain text only. No markdown headings or tables. Links may be written as plain URLs.

RESUME:
${buildKnowledge()}`;
}
