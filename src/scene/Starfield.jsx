import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Background stars spread along the whole flight path, with gentle twinkle.
export default function Starfield({ count = 9000 }) {
  const mat = useRef();
  const geometry = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    const palette = ['#ffffff', '#dfe8ff', '#ffe9c7', '#cfd9ff', '#ffd2dc'].map((h) => new THREE.Color(h));
    for (let i = 0; i < count; i++) {
      // Hollow-ish tube around the path so stars never sit inside the camera
      const ang = Math.random() * Math.PI * 2;
      const rad = 120 + Math.random() * 700;
      pos[i * 3] = Math.cos(ang) * rad;
      pos[i * 3 + 1] = Math.sin(ang) * rad * 0.7;
      pos[i * 3 + 2] = 300 - Math.random() * 1700;
      const c = palette[(Math.random() * palette.length) | 0];
      col.set([c.r, c.g, c.b], i * 3);
      seed[i] = Math.random();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    return g;
  }, [count]);

  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uPixel: { value: Math.min(window.devicePixelRatio, 2) } }), []);
  useFrame((_, dt) => {
    if (mat.current) mat.current.uniforms.uTime.value += dt;
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        vertexColors
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexShader={/* glsl */ `
          uniform float uTime; uniform float uPixel;
          attribute float aSeed;
          varying vec3 vColor; varying float vTw;
          void main(){
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * mv;
            float big = step(0.985, aSeed);
            gl_PointSize = (1.2 + aSeed * 1.8 + big * 3.0) * uPixel * clamp(300.0 / -mv.z, 0.6, 3.0);
            vTw = 0.65 + 0.35 * sin(uTime * (0.6 + aSeed * 2.0) + aSeed * 40.0);
            vColor = color;
          }`}
        fragmentShader={/* glsl */ `
          varying vec3 vColor; varying float vTw;
          void main(){
            float d = length(gl_PointCoord - 0.5);
            float a = pow(1.0 - smoothstep(0.0, 0.5, d), 3.0);
            gl_FragColor = vec4(vColor * a * vTw * 1.2, a);
          }`}
      />
    </points>
  );
}
