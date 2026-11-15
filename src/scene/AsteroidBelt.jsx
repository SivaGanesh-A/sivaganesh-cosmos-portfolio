import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Planet from './Planet.jsx';

// The journey: a dwarf world ringed by tumbling asteroids, one instanced draw call.
export default function AsteroidBelt({ position, count = 700 }) {
  const belt = useRef();
  const inst = useRef();

  const geometry = useMemo(() => {
    const g = new THREE.IcosahedronGeometry(1, 1);
    const p = g.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      // deterministic lumpy rock
      const n = Math.sin(v.x * 5.1) * Math.cos(v.y * 4.3) * Math.sin(v.z * 3.7);
      v.multiplyScalar(1 + n * 0.28);
      p.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals();
    return g;
  }, []);

  const data = useMemo(
    () =>
      Array.from({ length: count }, () => {
        const a = Math.random() * Math.PI * 2;
        const r = 15 + Math.pow(Math.random(), 0.8) * 13 + (Math.random() - 0.5) * 2;
        return {
          a,
          r,
          y: (Math.random() - 0.5) * 1.8,
          s: Math.pow(Math.random(), 3) * 0.9 + 0.12,
          rot: new THREE.Euler(Math.random() * 6, Math.random() * 6, Math.random() * 6),
          spin: (Math.random() - 0.5) * 0.8,
        };
      }),
    [count]
  );

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const time = useRef(0);

  const update = (t) => {
    data.forEach((d, i) => {
      const a = d.a + t * (1.6 / d.r) * 0.06;
      dummy.position.set(Math.cos(a) * d.r, d.y, Math.sin(a) * d.r);
      dummy.rotation.set(d.rot.x + t * d.spin, d.rot.y + t * d.spin * 0.7, d.rot.z);
      dummy.scale.setScalar(d.s);
      dummy.updateMatrix();
      inst.current.setMatrixAt(i, dummy.matrix);
    });
    inst.current.instanceMatrix.needsUpdate = true;
  };

  useLayoutEffect(() => update(0), []); // eslint-disable-line react-hooks/exhaustive-deps
  useFrame((_, dt) => {
    time.current += dt;
    update(time.current);
  });

  return (
    <group position={position}>
      <Planet radius={5} type="rocky" colors={['#2b2f3a', '#6f6a62', '#b7ab98']} seed={5.4} tilt={0.5} />
      <group ref={belt} rotation={[0.32, 0, 0.12]}>
        <instancedMesh ref={inst} args={[geometry, undefined, count]}>
          <meshStandardMaterial color="#8d8478" roughness={0.95} metalness={0.05} />
        </instancedMesh>
      </group>
    </group>
  );
}
