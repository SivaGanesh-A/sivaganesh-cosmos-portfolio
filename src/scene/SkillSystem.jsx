import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { skillGroups } from '../data/profile.js';
import Planet from './Planet.jsx';
import { useStore } from '../lib/store.js';

// A home world with one orbit per skill group; every moon is a skill.
// Hovering a group in the page lights up its orbit.
export default function SkillSystem({ position }) {
  const active = useStore((s) => s.activeSkill);
  return (
    <group position={position}>
      <Planet radius={4.5} type="gas" colors={['#2a1f4f', '#a99cf0', '#f1e9ff']} tilt={0.2} seed={2.2} />
      <group rotation={[0.38, 0, -0.12]}>
        {skillGroups.map((g, i) => (
          <Orbit key={g.id} group={g} radius={8.5 + i * 3.6} speed={0.22 / (1 + i * 0.6)} active={active} />
        ))}
      </group>
    </group>
  );
}

function Orbit({ group, radius, speed, active }) {
  const ref = useRef();
  const dim = active && active !== group.id;
  const on = active === group.id;
  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
    }
    return pts;
  }, [radius]);
  const color = useMemo(() => new THREE.Color(group.color), [group.color]);
  const moonMat = useRef([]);

  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * speed;
    const target = on ? 3.2 : dim ? 0.25 : 1.2;
    moonMat.current.forEach((m) => {
      if (m) m.emissiveIntensity = THREE.MathUtils.damp(m.emissiveIntensity, target, 6, dt);
    });
  });

  return (
    <group>
      <Line points={points} color={group.color} lineWidth={on ? 1.6 : 0.8} transparent opacity={dim ? 0.08 : on ? 0.75 : 0.28} />
      <group ref={ref}>
        {group.items.map((item, i) => {
          const a = (i / group.items.length) * Math.PI * 2;
          const s = 0.38 + ((item.length * 7) % 5) * 0.06;
          return (
            <mesh key={item} position={[Math.cos(a) * radius, 0, Math.sin(a) * radius]}>
              <sphereGeometry args={[s, 24, 24]} />
              <meshStandardMaterial
                ref={(m) => (moonMat.current[i] = m)}
                color={color}
                emissive={color}
                emissiveIntensity={1.2}
                roughness={0.6}
              />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}
