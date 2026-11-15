import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import * as THREE from 'three';

import Galaxy from './Galaxy.jsx';
import Starfield from './Starfield.jsx';
import Nebula from './Nebula.jsx';
import Sun from './Sun.jsx';
import Planet, { LIGHT_DIR } from './Planet.jsx';
import SkillSystem from './SkillSystem.jsx';
import AsteroidBelt from './AsteroidBelt.jsx';
import Constellation from './Constellation.jsx';
import BlackHole from './BlackHole.jsx';
import { WORLD, PROJECT_PLANETS, NEBULAE, buildStops } from './layout.js';
import { scrollState } from '../lib/store.js';

const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function detectTier() {
  const narrow = window.matchMedia('(max-width: 820px)').matches;
  const cores = navigator.hardwareConcurrency || 4;
  return narrow || cores <= 4 ? 'low' : 'high';
}

// Hide heavy objects when the camera is far away from them.
function Near({ position, range, children }) {
  const ref = useRef();
  const p = useMemo(() => new THREE.Vector3(...position), [position]);
  useFrame(({ camera }) => {
    if (ref.current) ref.current.visible = camera.position.distanceTo(p) < range;
  });
  return <group ref={ref}>{children}</group>;
}

const smoother = (t) => t * t * t * (t * (t * 6 - 15) + 10);

function CameraRig() {
  const { camera, pointer, size } = useThree();
  const narrow = size.width < 820;
  const stops = useMemo(() => buildStops(narrow), [narrow]);
  const curves = useMemo(
    () => ({
      cam: new THREE.CatmullRomCurve3(stops.map((s) => new THREE.Vector3(...s.cam)), false, 'centripetal'),
      look: new THREE.CatmullRomCurve3(stops.map((s) => new THREE.Vector3(...s.look)), false, 'centripetal'),
    }),
    [stops]
  );
  const anchors = useRef([]);
  const look = useRef(new THREE.Vector3(...stops[0].look));
  const tmpP = useMemo(() => new THREE.Vector3(), []);
  const tmpL = useMemo(() => new THREE.Vector3(), []);
  const intro = useRef(reducedMotion ? 1 : 0);

  // Map each stop to the scroll position where its section is centred on screen.
  useEffect(() => {
    const measure = () => {
      const vh = window.innerHeight;
      anchors.current = stops.map((s, i) => {
        if (i === 0) return 0;
        const el = document.querySelector(`[data-stop="${s.id}"]`);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return Math.max(0, r.top + window.scrollY + (r.height - vh) / 2);
      });
      // fill any missing anchors by interpolation
      for (let i = 1; i < anchors.current.length; i++) {
        if (anchors.current[i] == null) anchors.current[i] = anchors.current[i - 1] + vh;
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    window.addEventListener('load', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('load', measure);
    };
  }, [stops]);

  useFrame((_, dt) => {
    const a = anchors.current;
    const y = scrollState.y;
    const n = stops.length;
    let u = 0;
    if (a.length === n) {
      if (y >= a[n - 1]) u = 1;
      else {
        let i = 0;
        while (i < n - 2 && y >= a[i + 1]) i++;
        const span = Math.max(1, a[i + 1] - a[i]);
        let t = THREE.MathUtils.clamp((y - a[i]) / span, 0, 1);
        // dwell near each stop, travel in between
        t = smoother(THREE.MathUtils.clamp((t - 0.1) / 0.8, 0, 1));
        u = (i + t) / (n - 1);
      }
    }
    curves.cam.getPoint(u, tmpP);
    curves.look.getPoint(u, tmpL);

    // Opening shot: swoop in from deep space onto the galaxy.
    if (intro.current < 1) {
      intro.current = Math.min(1, intro.current + dt / 3.2);
      const k = 1 - smoother(intro.current);
      tmpP.add(new THREE.Vector3(40 * k, 70 * k, 180 * k));
    }

    if (!reducedMotion) {
      tmpP.x += pointer.x * 1.6;
      tmpP.y += pointer.y * 1.0;
    }
    const lambda = intro.current < 1 ? 20 : 3.2;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, tmpP.x, lambda, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, tmpP.y, lambda, dt);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, tmpP.z, lambda, dt);
    look.current.x = THREE.MathUtils.damp(look.current.x, tmpL.x, lambda, dt);
    look.current.y = THREE.MathUtils.damp(look.current.y, tmpL.y, lambda, dt);
    look.current.z = THREE.MathUtils.damp(look.current.z, tmpL.z, lambda, dt);
    camera.lookAt(look.current);
  });
  return null;
}

function Scene({ tier }) {
  const low = tier === 'low';
  return (
    <>
      <color attach="background" args={['#04050b']} />
      <ambientLight intensity={0.08} />
      <directionalLight position={LIGHT_DIR.clone().multiplyScalar(100).toArray()} intensity={2.2} color="#fff1dc" />
      <CameraRig />

      <Starfield count={low ? 5000 : 9000} />
      {NEBULAE.map((n, i) => (
        <Nebula key={i} {...n} />
      ))}

      <Near position={WORLD.galaxy} range={520}>
        <Galaxy position={WORLD.galaxy} count={low ? 26000 : 60000} />
      </Near>
      <Near position={WORLD.sun} range={420}>
        <Sun position={WORLD.sun} />
      </Near>
      <Near position={WORLD.skills} range={360}>
        <SkillSystem position={WORLD.skills} />
      </Near>
      {PROJECT_PLANETS.map((p, i) => (
        <Near key={i} position={p.position} range={300}>
          <Planet {...p} seed={i * 1.7 + 0.4} tilt={0.18 + (i % 3) * 0.12} spin={0.03 + (i % 2) * 0.02} />
        </Near>
      ))}
      <Near position={WORLD.journey} range={320}>
        <AsteroidBelt position={WORLD.journey} count={low ? 380 : 700} />
      </Near>
      <Near position={WORLD.constellation} range={360}>
        <Constellation position={WORLD.constellation} />
      </Near>
      <Near position={WORLD.blackHole} range={520}>
        <BlackHole position={WORLD.blackHole} />
      </Near>

      <EffectComposer multisampling={0}>
        <Bloom mipmapBlur intensity={low ? 0.8 : 1.05} luminanceThreshold={0.55} luminanceSmoothing={0.2} radius={0.78} />
        <Vignette offset={0.28} darkness={0.7} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer>
    </>
  );
}

export default function Universe() {
  const [tier] = useState(detectTier);
  const [dpr, setDpr] = useState(tier === 'low' ? 1.25 : Math.min(window.devicePixelRatio, 1.75));
  return (
    <div className="universe" aria-hidden="true">
      <Canvas
        flat
        dpr={dpr}
        camera={{ position: [-6, 16, 46], fov: 50, near: 0.1, far: 3000 }}
        gl={{ antialias: false, powerPreference: 'high-performance', alpha: false }}
        fallback={<div className="universe-fallback" />}
      >
        <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr((d) => Math.min(d + 0.25, tier === 'low' ? 1.5 : 1.75))} />
        <Suspense fallback={null}>
          <Scene tier={tier} />
        </Suspense>
      </Canvas>
    </div>
  );
}
