import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { noise } from './noise.glsl.js';

// The final stop: an event horizon wrapped in a swirling accretion disk,
// plus a camera-facing photon ring that suggests the lensed far side of the disk.
export default function BlackHole({ position }) {
  const uDisk = useMemo(() => ({ uTime: { value: 0 } }), []);
  const uRing = useMemo(() => ({ uTime: { value: 0 } }), []);
  useFrame((_, dt) => {
    uDisk.uTime.value += dt;
    uRing.uTime.value += dt;
  });

  return (
    <group position={position}>
      {/* lensed halo behind the horizon */}
      <Billboard>
        <mesh position={[0, 0, -0.5]}>
          <planeGeometry args={[64, 64]} />
          <shaderMaterial
            uniforms={uRing}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            vertexShader={/* glsl */ `
              varying vec2 vUv;
              void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`}
            fragmentShader={/* glsl */ `
              ${noise}
              uniform float uTime; varying vec2 vUv;
              void main(){
                vec2 p = (vUv - 0.5) * 64.0;
                float r = length(p);
                float a = atan(p.y, p.x);
                float ring = exp(-pow((r - 7.4) / 0.55, 2.0)) * 2.2;
                float lensed = exp(-pow((r - 9.5) / 2.6, 2.0)) * (0.55 + 0.45 * fbm3(vec3(cos(a) * 2.0, sin(a) * 2.0, uTime * 0.2 - r * 0.15)));
                lensed *= smoothstep(-0.6, 0.9, p.y / r) * 1.4;
                float halo = exp(-(r - 7.0) * 0.18) * 0.12 * step(7.0, r);
                vec3 col = vec3(2.2, 1.45, 0.75) * ring + vec3(1.5, 0.62, 0.3) * lensed + vec3(0.8, 0.35, 0.5) * halo;
                gl_FragColor = vec4(col, 1.0);
              }`}
          />
        </mesh>
      </Billboard>

      {/* event horizon */}
      <mesh>
        <sphereGeometry args={[6.4, 64, 64]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* accretion disk */}
      <mesh rotation={[-1.42, 0, 0.1]}>
        <ringGeometry args={[7.2, 30, 256, 1]} />
        <shaderMaterial
          uniforms={uDisk}
          side={THREE.DoubleSide}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          vertexShader={/* glsl */ `
            varying vec2 vP;
            void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`}
          fragmentShader={/* glsl */ `
            ${noise}
            uniform float uTime; varying vec2 vP;
            void main(){
              float r = length(vP);
              float a = atan(vP.y, vP.x);
              float t = (r - 7.2) / 22.8;
              // Keplerian-ish swirl: inner material laps faster
              float swirl = a + uTime * (2.2 / (r * 0.35));
              float n = fbm(vec3(cos(swirl) * r * 0.22, sin(swirl) * r * 0.22, log(r) * 3.0 - uTime * 0.1));
              float streak = 0.55 + 0.45 * sin(log(r) * 26.0 + n * 6.0);
              float dens = smoothstep(0.0, 0.04, t) * pow(1.0 - t, 2.2) * (0.5 + n * 0.8) * streak;
              vec3 hot = vec3(2.6, 2.0, 1.4);
              vec3 warm = vec3(1.8, 0.75, 0.25);
              vec3 cool = vec3(0.85, 0.25, 0.45);
              vec3 col = mix(hot, warm, smoothstep(0.0, 0.25, t));
              col = mix(col, cool, smoothstep(0.3, 0.9, t));
              float doppler = 1.0 + 0.55 * sin(a + 0.6);
              gl_FragColor = vec4(col * max(dens, 0.0) * doppler * 1.2, 1.0);
            }`}
        />
      </mesh>
    </group>
  );
}
