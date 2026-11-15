import { projects } from '../data/profile.js';

// World positions of every celestial body. The camera flies between "stops";
// each stop is tied to a DOM element with a matching data-stop attribute.

const v = (x, y, z) => [x, y, z];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

export const WORLD = {
  galaxy: v(0, 0, 0),
  sun: v(70, 0, -110),
  skills: v(-42, -6, -210),
  journey: v(34, 8, -800),
  constellation: v(-34, 16, -900),
  blackHole: v(0, 0, -1020),
};

// Planets for projects alternate sides: even → planet on the right of the text.
export const PROJECT_PLANETS = projects.map((p, i) => {
  const right = i % 2 === 0;
  return {
    position: v(right ? 26 : -26, (i % 3) * 5 - 5, -310 - i * 75),
    right,
    ...p.planet,
  };
});

// side = where the object sits on screen. Shift the look target opposite to it.
function frame(target, side, { dist = 30, up = 3, lateral = 10, shift = 10 } = {}) {
  const s = side === 'right' ? 1 : side === 'left' ? -1 : 0;
  return {
    cam: add(target, v(-s * lateral, up, dist)),
    look: add(target, v(-s * shift, 0, 0)),
  };
}

export function buildStops(isNarrow) {
  // On narrow screens text sits over the object, so center everything.
  const side = (s) => (isNarrow ? 'center' : s);
  const stops = [
    { id: 'hero', cam: v(-2, 21, 33), look: v(-15, -3, 0) },
    { id: 'about', ...frame(WORLD.sun, side('right'), { dist: 36, lateral: 18, shift: 17 }) },
    { id: 'skills', ...frame(WORLD.skills, side('left'), { dist: 40, up: 9, lateral: 12, shift: 19 }) },
    ...PROJECT_PLANETS.map((p, i) => ({
      id: `project-${i}`,
      ...frame(p.position, side(p.right ? 'right' : 'left'), { dist: p.radius * 4.3, lateral: 9, shift: p.radius * 1.75 }),
    })),
    { id: 'journey', ...frame(WORLD.journey, side('right'), { dist: 58, up: 16, lateral: 16, shift: 30 }) },
    { id: 'credentials', ...frame(WORLD.constellation, side('left'), { dist: 54, up: 0, lateral: 10, shift: 28 }) },
    { id: 'contact', ...frame(WORLD.blackHole, side('right'), { dist: 64, up: 6, lateral: 10, shift: 28 }) },
  ];
  if (isNarrow) {
    // Pull back a little on phones so bodies fit the narrow frustum.
    stops.forEach((s, i) => {
      if (i === 0) return;
      const look = s.look;
      s.cam = s.cam.map((c, k) => look[k] + (c - look[k]) * 1.35);
    });
  }
  return stops;
}

export const NEBULAE = [
  { position: v(40, -20, -40), scale: 120, color: '#e0679a', color2: '#5b2a8a', seed: 1.3 },
  { position: v(-60, 20, -150), scale: 140, color: '#2c6f9e', color2: '#5fd3d6', seed: 4.1 },
  { position: v(70, -10, -300), scale: 130, color: '#7a3fb0', color2: '#e0679a', seed: 7.7 },
  { position: v(-80, 10, -460), scale: 150, color: '#1f5a8a', color2: '#a99cf0', seed: 2.9 },
  { position: v(80, 20, -620), scale: 140, color: '#b0466e', color2: '#f5b85a', seed: 9.2 },
  { position: v(-70, -20, -760), scale: 160, color: '#3b2c8f', color2: '#5fd3d6', seed: 5.5 },
  { position: v(60, 0, -950), scale: 170, color: '#8a2f5f', color2: '#3b2c8f', seed: 3.3 },
  { position: v(-50, 30, -1080), scale: 200, color: '#2a3f8f', color2: '#e0679a', seed: 6.6 },
];
