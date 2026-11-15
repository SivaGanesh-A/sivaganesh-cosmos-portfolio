// Single source of truth for the site AND the chatbot's knowledge.
// Edit this file to update your portfolio; the chatbot picks up changes automatically.

export const profile = {
  name: 'Akula Sivaganesh',
  shortName: 'Sivaganesh',
  role: 'Computer Science engineer working on AI and full-stack apps',
  location: 'Vijayawada, India',
  email: 'sivaganeshakula333@gmail.com',
  phone: '+91 78428 71609',
  phoneHref: 'tel:+917842871609',
  github: 'https://github.com/SivaGanesh-A',
  linkedin: 'https://linkedin.com/in/sivaganesh-a-033423338',
  resume: '/Sivaganesh_Akula_Resume.pdf',
  intro:
    'I build AI-powered web apps — from computer-vision pipelines in Flask to React front ends — and I currently label the data that trains computer-vision models at iMerit.',
  about: [
    'I’m a Computer Science undergraduate (B.Tech, 2023–2026) at NRI Institute of Technology, Vijayawada, with an 86% aggregate, after a Diploma in Engineering from Dhanekula Institute.',
    'Most of what I build sits where machine learning meets the web: YOLOv8 object detection, emotion-aware music, image-to-story generation with BLIP and GPT, and a Random Forest health predictor — each wrapped in a Flask API and a usable interface.',
    'Today I work as a Data Annotator apprentice at iMerit Technologies in Hyderabad, producing and validating labelled image and video data for AI and computer-vision models. It has taught me how much model quality depends on data quality.',
  ],
  facts: [
    { value: '6', label: 'AI & web projects shipped' },
    { value: '4', label: '24-hour hackathons' },
    { value: '50+', label: 'LeetCode problems solved' },
    { value: '1st', label: 'BIS Standards Writing Competition' },
  ],
};

export const skillGroups = [
  {
    id: 'lang',
    name: 'Languages & data',
    color: '#f5b85a',
    items: ['Python', 'JavaScript', 'SQL', 'Pandas', 'NumPy', 'MS Excel', 'DSA in Python'],
  },
  {
    id: 'ml',
    name: 'Machine learning & AI',
    color: '#e0679a',
    items: ['Scikit-learn', 'Random Forest', 'YOLOv8', 'OpenCV', 'DeepFace', 'BLIP + GPT', 'TensorFlow', 'Prompt engineering'],
  },
  {
    id: 'web',
    name: 'Web',
    color: '#5fd3d6',
    items: ['React', 'Flask', 'HTML5', 'CSS3', 'Tailwind CSS', 'Framer Motion'],
  },
  {
    id: 'tools',
    name: 'Tools & platforms',
    color: '#a99cf0',
    items: ['Git', 'GitHub', 'Docker', 'Vite', 'MongoDB Atlas', 'Android Studio'],
  },
];

// `planet` controls how each project's world is rendered in 3D.
// type: 'gas' | 'rocky' | 'ice' | 'lava'; colors go from base to highlight.
export const projects = [
  {
    title: 'Personal portfolio',
    summary:
      'A responsive portfolio with smooth animations, dark mode and a component-driven architecture, tuned for fast page transitions. This site is its successor.',
    stack: ['React', 'Tailwind CSS', 'Framer Motion', 'Vite'],
    code: 'https://github.com/SivaGanesh-A',
    live: 'https://siva-ganesh.vercel.app/',
    planet: { type: 'gas', colors: ['#1b2a5c', '#5fd3d6', '#d9f3ff'], radius: 8, rings: true },
  },
  {
    title: 'Image-to-story generator',
    summary:
      'Upload a picture and get a short story back. BLIP captions the scene, GPT turns the caption into a narrative, and OpenCV and Pillow clean up the image first — all behind a Flask API.',
    stack: ['BLIP', 'GPT', 'OpenCV', 'Pillow', 'Flask', 'Bootstrap'],
    code: 'https://github.com/SivaGanesh-A',
    planet: { type: 'gas', colors: ['#5a2a1c', '#e8a065', '#f7e2c0'], radius: 7.5 },
  },
  {
    title: 'Real-time object detection',
    summary:
      'Detects and labels objects in uploaded images or a live webcam feed with YOLOv8, drawing bounding boxes frame by frame with OpenCV.',
    stack: ['YOLOv8', 'OpenCV', 'TensorFlow', 'Pillow', 'Flask'],
    code: 'https://github.com/SivaGanesh-A',
    planet: { type: 'rocky', colors: ['#0d2d5e', '#3f7d4e', '#c9b98a'], radius: 6.5 },
  },
  {
    title: 'Emotion-based music player',
    summary:
      'Reads your facial expression from the webcam with DeepFace — happy, sad, angry and more — and starts music that matches the mood.',
    stack: ['DeepFace', 'OpenCV', 'NumPy', 'Flask', 'JavaScript'],
    code: 'https://github.com/SivaGanesh-A',
    planet: { type: 'ice', colors: ['#6b4d8f', '#e7a8d0', '#fbefff'], radius: 6 },
  },
  {
    title: 'Health condition predictor',
    summary:
      'A Random Forest model that predicts likely conditions from patient inputs, with label-encoded features, a pickled model and an interactive Flask UI for instant results.',
    stack: ['Scikit-learn', 'Random Forest', 'Pickle', 'Flask'],
    code: 'https://github.com/SivaGanesh-A',
    planet: { type: 'rocky', colors: ['#3a1410', '#a8472a', '#e6a274'], radius: 6.5 },
  },
  {
    title: 'Full-stack app with auth',
    summary:
      'User sign-up and login, full create/read/update/delete, and a cloud database on MongoDB Atlas via PyMongo. The front end was recently rebuilt in React.',
    stack: ['Flask', 'PyMongo', 'MongoDB Atlas', 'React'],
    code: 'https://github.com/SivaGanesh-A',
    planet: { type: 'lava', colors: ['#120708', '#3a1612', '#ffb04a'], radius: 7 },
  },
];

export const journey = [
  {
    when: 'Jan 2026 – present',
    title: 'Data Annotator (apprenticeship)',
    org: 'iMerit Technologies · Hyderabad',
    points: [
      'Annotate structured and video datasets to produce high-quality labelled data for AI and computer-vision models.',
      'Validate data for accuracy, consistency and alignment with project benchmarks.',
      'Work across teams to support AI data processes and raise dataset quality.',
    ],
  },
  {
    when: 'Aug 2023 – Aug 2026',
    title: 'B.Tech, Computer Science',
    org: 'NRI Institute of Technology · Agiripalli, Vijayawada',
    points: ['86% aggregate.'],
  },
  {
    when: 'Feb 2025',
    title: 'Android app development workshop',
    org: 'BITS Pilani · Hyderabad',
    points: ['Hands-on with Android Studio and Kotlin across the full lifecycle, from UI design to publishing on the Play Store.'],
  },
  {
    when: 'May – Aug 2024',
    title: 'Generative AI intern',
    org: 'Codegnan IT Solutions · Vijayawada',
    points: ['Built a responsive Space Explorer app in HTML, CSS and JavaScript, using AI tools to simulate space exploration with interactive features.'],
  },
  {
    when: 'Apr 2019 – Apr 2022',
    title: 'Diploma in Engineering',
    org: 'Dhanekula Institute of Engineering and Technology · Ganguru, Vijayawada',
    points: ['80% aggregate.'],
  },
];

export const certifications = [
  { title: 'Python Programming', issuer: 'Infosys Springboard' },
  { title: 'Joy of Computing Using Python', issuer: 'NPTEL' },
  { title: 'Computer Vision Essentials', issuer: 'OpenCV Bootcamp' },
  { title: 'Basics of Android Development', issuer: 'Hands-on App Fundamentals' },
  { title: 'Python (Intermediate) & CSS (Basic)', issuer: 'HackerRank' },
  { title: 'Artificial Intelligence', issuer: 'IBM SkillsBuild (verified credential)' },
];

export const hackathons = [
  { name: 'NRIIT', focus: 'Full-stack development' },
  { name: 'Teckzite’25, RGUKT Nuzvid', focus: 'AI agent development' },
  { name: 'VR Siddhartha', focus: 'Artificial intelligence challenge' },
  { name: 'BITS Pilani', focus: 'Android app development sprint' },
];

export const achievements = [
  'Secured 1st place in the Standards Writing Competition by the Bureau of Indian Standards (BIS).',
  'Solved 50+ DSA problems on LeetCode — arrays, sliding window, two pointers, recursion and hashing.',
];
