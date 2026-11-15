import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { certifications, hackathons } from '../data/profile.js';
import { useGlowTexture } from './Galaxy.jsx';

// Credentials as a constellation: one bright star per certification,
// dimmer stars for hackathons, joined like a star chart.
const CERT_PTS = [
  [-16, 8, 0], [-7, 11, -3], [2, 6, 2], [10, 9, -2], [17, 2, 1], [9, -4, -1],
];
const HACK_PTS = [
  [-12, -3, 2], [-3, -8, -2], [6, -11, 1], [15, -8, -3],
];

export default function Constellation({ position }) {
  const tex = useGlowTexture();
  const group = useRef();
  const sprites = useRef([]);
  const certPts = CERT_PTS.slice(0, certifications.length);
  const hackPts = HACK_PTS.slice(0, hackathons.length);

  const lines = useMemo(() => {
    const main = certPts.map((p) => new THREE.Vector3(...p));
    const branch = [certPts[2], ...hackPts.slice(0, 2)].map((p) => new THREE.Vector3(...p));
    const branch2 = [certPts[5], ...hackPts.slice(2)].map((p) => new THREE.Vector3(...p));
    return [main, branch, branch2].filter((l) => l.length > 1);
  }, [certPts, hackPts]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    sprites.current.forEach((s, i) => {
      if (!s) return;
      const base = s.userData.base;
      s.scale.setScalar(base * (0.88 + 0.12 * Math.sin(t * 1.3 + i * 1.7)));
    });
    if (group.current) group.current.rotation.y = Math.sin(t * 0.08) * 0.12;
  });

  const all = [
    ...certPts.map((p) => ({ p, base: 6.5, color: '#ffe2b0' })),
    ...hackPts.map((p) => ({ p, base: 3.8, color: '#bcd4ff' })),
  ];

  return (
    <group position={position} ref={group}>
      {lines.map((pts, i) => (
        <Line key={i} points={pts} color="#f5b85a" lineWidth={1} transparent opacity={0.35} dashed={i > 0} dashSize={0.6} gapSize={0.5} />
      ))}
      {all.map((s, i) => (
        <sprite key={i} position={s.p} ref={(el) => { if (el) { el.userData.base = s.base; sprites.current[i] = el; } }}>
          <spriteMaterial map={tex} color={s.color} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
        </sprite>
      ))}
      {all.map((s, i) => (
        <mesh key={`c${i}`} position={s.p}>
          <sphereGeometry args={[s.base * 0.05, 12, 12]} />
          <meshBasicMaterial color={[3, 2.6, 2.2]} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}
