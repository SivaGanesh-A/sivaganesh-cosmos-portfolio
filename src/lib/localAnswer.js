import { profile, skillGroups, projects, journey, certifications, hackathons, achievements } from '../data/profile.js';

// Offline fallback used when the AI endpoint isn't configured or is unavailable.
// Simple keyword routing over the same profile data, so the bot never dead-ends.
// Short words must match whole words ("ai" shouldn't match "detail").
const has = (q, ...words) =>
  words.some((w) => (w.length <= 3 ? new RegExp(`\\b${w.replace('.', '\\.')}\\b`).test(q) : q.includes(w)));

export function localAnswer(question) {
  const q = question.toLowerCase();

  if (has(q, 'contact', 'email', 'reach', 'hire', 'phone', 'linkedin'))
    return `You can email Sivaganesh at ${profile.email}, call ${profile.phone}, or connect on LinkedIn: ${profile.linkedin}`;

  if (has(q, 'imerit', 'current', 'job', 'work now', 'annotat', 'doing now'))
    return `He’s a Data Annotator apprentice at iMerit Technologies in Hyderabad (since Jan 2026), annotating and validating image and video datasets used to train AI and computer-vision models.`;

  if (has(q, 'intern', 'codegnan', 'space explorer'))
    return `From May to Aug 2024 he was a Generative AI intern at Codegnan IT Solutions, where he built a responsive Space Explorer app in HTML, CSS and JavaScript with AI-driven interactive features.`;

  if (has(q, 'experience', 'worked', 'career'))
    return journey.filter((j) => !/B\.Tech|Diploma/.test(j.title)).map((j) => `${j.title} — ${j.org} (${j.when})`).join('\n');

  if (has(q, 'educat', 'degree', 'college', 'b.tech', 'btech', 'study', 'diploma', 'cgpa', 'percent'))
    return `B.Tech in Computer Science at NRI Institute of Technology, Vijayawada (2023–2026, 86%), after a Diploma in Engineering from Dhanekula Institute (2019–2022, 80%).`;

  if (has(q, 'vision', 'yolo', 'opencv', 'detect', 'image'))
    return `His computer-vision work includes ${projects
      .filter((p) => p.stack.some((s) => /YOLO|OpenCV|DeepFace|BLIP/.test(s)))
      .map((p) => p.title.toLowerCase())
      .join(', ')} — built with YOLOv8, OpenCV, DeepFace and BLIP behind Flask APIs.`;

  if (has(q, 'project', 'built', 'portfolio', 'app'))
    return `He has built: ${projects.map((p) => p.title).join('; ')}. Ask about any one for details.`;

  const proj = projects.find((p) => p.title.toLowerCase().split(' ').some((w) => w.length > 4 && q.includes(w)));
  if (proj) return `${proj.title}: ${proj.summary} Built with ${proj.stack.join(', ')}.`;

  if (has(q, 'skill', 'stack', 'tech', 'know', 'language', 'python', 'react', 'machine learning', 'ml', 'ai'))
    return skillGroups.map((g) => `${g.name}: ${g.items.join(', ')}`).join('\n');

  if (has(q, 'certif', 'course'))
    return certifications.map((c) => `${c.title} (${c.issuer})`).join('\n');

  if (has(q, 'hackathon'))
    return `He’s taken part in four 24-hour hackathons: ${hackathons.map((h) => `${h.name} (${h.focus})`).join(', ')}.`;

  if (has(q, 'award', 'achiev', 'leetcode', 'dsa', 'competit'))
    return achievements.join('\n');

  if (has(q, 'who', 'about', 'yourself', 'tell me', 'summary', 'hello', 'hi'))
    return `${profile.name} is a ${profile.role.toLowerCase()} based in ${profile.location}. ${profile.intro}`;

  return `I don’t have that detail. Try asking about his projects, skills, experience or education — or email him at ${profile.email}.`;
}
