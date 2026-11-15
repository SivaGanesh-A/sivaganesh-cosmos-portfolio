import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Procedural spiral galaxy. Points rotate differentially in the vertex shader
// (inner stars orbit faster), so it costs nothing on the CPU per frame.
export default function Galaxy({ position, count = 60000 }) {
  const mat = useRef();

  const geometry = useMemo(() => {
    const radius = 40;
    const arms = 4;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const size = new Float32Array(count);
    const inner = new THREE.Color('#ffd9a0');
    const mid = new THREE.Color('#e0679a');
    const outer = new THREE.Color('#5d7fe0');
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const r = Math.pow(Math.random(), 1.15) * radius;
      const arm = ((i % arms) / arms) * Math.PI * 2;
      const spin = r * 0.13;
      const spread = Math.pow(Math.random(), 3.2) * (Math.random() < 0.5 ? 1 : -1) * (0.4 + r * 0.16);
      const spreadY = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * Math.max(0.3, 2.4 - r * 0.06);
      const spreadZ = Math.pow(Math.random(), 3.2) * (Math.random() < 0.5 ? 1 : -1) * (0.4 + r * 0.16);
      pos[i * 3] = Math.cos(arm + spin) * r + spread;
      pos[i * 3 + 1] = spreadY;
      pos[i * 3 + 2] = Math.sin(arm + spin) * r + spreadZ;
      const t = r / radius;
      if (t < 0.35) c.copy(inner).lerp(mid, t / 0.35);
      else c.copy(mid).lerp(outer, Math.min(1, (t - 0.35) / 0.5));
      // occasional bright blue-white stars
      if (Math.random() < 0.03) c.set('#dfe8ff');
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
      size[i] = Math.random() * 1.8 + 0.6 + (t < 0.08 ? 0.8 : 0);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
    return g;
  }, [count]);

  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uPixel: { value: Math.min(window.devicePixelRatio, 2) } }),
    []
  );

  useFrame((_, dt) => {
    if (mat.current) mat.current.uniforms.uTime.value += dt;
  });

  return (
    <group position={position} rotation={[0.28, 0, 0.22]}>
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
            attribute float aSize;
            varying vec3 vColor;
            void main(){
              vec3 p = position;
              float r = length(p.xz);
              float ang = atan(p.z, p.x) + uTime * (0.9 / (r + 2.5));
              p.x = cos(ang) * r; p.z = sin(ang) * r;
              vec4 mv = modelViewMatrix * vec4(p, 1.0);
              gl_Position = projectionMatrix * mv;
              gl_PointSize = min(aSize * uPixel * (75.0 / -mv.z), 28.0 * uPixel);
              vColor = color;
            }`}
          fragmentShader={/* glsl */ `
            varying vec3 vColor;
            void main(){
              float d = length(gl_PointCoord - 0.5);
              float a = pow(1.0 - smoothstep(0.0, 0.5, d), 2.2);
              gl_FragColor = vec4(vColor * a * 1.4, a);
            }`}
        />
      </points>
      {/* Bright core */}
      <sprite scale={[12, 12, 1]}>
        <spriteMaterial
          map={useGlowTexture()}
          color="#ffcf8a"
          transparent
          opacity={0.7}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
    </group>
  );
}

let glowTex;
export function useGlowTexture() {
  return useMemo(() => {
    if (glowTex) return glowTex;
    const s = 128;
    const cv = document.createElement('canvas');
    cv.width = cv.height = s;
    const ctx = cv.getContext('2d');
    const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.15, 'rgba(255,255,255,0.55)');
    g.addColorStop(0.45, 'rgba(255,255,255,0.12)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
    glowTex = new THREE.CanvasTexture(cv);
    glowTex.colorSpace = THREE.SRGBColorSpace;
    return glowTex;
  }, []);
}
