import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { noise } from './noise.glsl.js';

// Soft, slowly drifting gas clouds: an fbm shader on a camera-facing plane.
export default function Nebula({ position, scale, color, color2, seed }) {
  const mat = useRef();
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uColor2: { value: new THREE.Color(color2) },
      uSeed: { value: seed },
    }),
    [color, color2, seed]
  );
  useFrame((_, dt) => {
    if (mat.current) mat.current.uniforms.uTime.value += dt * 0.03;
  });
  return (
    <Billboard position={position}>
      <mesh scale={[scale * 1.6, scale, 1]}>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          ref={mat}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          vertexShader={/* glsl */ `
            varying vec2 vUv;
            void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`}
          fragmentShader={/* glsl */ `
            ${noise}
            uniform float uTime; uniform vec3 uColor; uniform vec3 uColor2; uniform float uSeed;
            varying vec2 vUv;
            void main(){
              vec2 p = (vUv - 0.5) * vec2(1.6, 1.0);
              float falloff = smoothstep(0.75, 0.05, length(p));
              vec3 q = vec3(p * 2.2, uSeed + uTime);
              float warp = fbm3(q + fbm3(q * 1.3 + uSeed));
              float n = fbm(vec3(p * 3.0 + warp * 0.8, uSeed * 2.0 + uTime * 0.6));
              float dens = smoothstep(-0.15, 0.7, n) * falloff;
              vec3 col = mix(uColor, uColor2, smoothstep(-0.2, 0.6, warp));
              // faint dark lanes
              dens *= 0.65 + 0.35 * smoothstep(-0.3, 0.3, fbm3(vec3(p * 6.0, uSeed)));
              gl_FragColor = vec4(col * dens * 0.55, dens);
            }`}
        />
      </mesh>
    </Billboard>
  );
}
