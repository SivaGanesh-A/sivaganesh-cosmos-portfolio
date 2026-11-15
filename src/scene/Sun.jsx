import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { noise } from './noise.glsl.js';

// A living star: boiling granulated surface + noisy corona. Values > 1 feed the bloom pass.
export default function Sun({ position, radius = 9 }) {
  const surf = useRef();
  const corona = useRef();
  const uSurf = useMemo(() => ({ uTime: { value: 0 } }), []);
  const uCor = useMemo(() => ({ uTime: { value: 0 } }), []);

  useFrame((_, dt) => {
    uSurf.uTime.value += dt;
    uCor.uTime.value += dt;
    if (surf.current) surf.current.rotation.y += dt * 0.03;
  });

  return (
    <group position={position}>
      <mesh ref={surf}>
        <sphereGeometry args={[radius, 96, 96]} />
        <shaderMaterial
          uniforms={uSurf}
          vertexShader={/* glsl */ `
            varying vec3 vPos; varying vec3 vN; varying vec3 vView;
            void main(){
              vPos = position;
              vN = normalize(normalMatrix * normal);
              vec4 mv = modelViewMatrix * vec4(position,1.0);
              vView = normalize(-mv.xyz);
              gl_Position = projectionMatrix * mv;
            }`}
          fragmentShader={/* glsl */ `
            ${noise}
            uniform float uTime;
            varying vec3 vPos; varying vec3 vN; varying vec3 vView;
            void main(){
              vec3 p = normalize(vPos);
              float n1 = fbm(p * 3.0 + vec3(0.0, uTime * 0.05, uTime * 0.03));
              float n2 = fbm3(p * 12.0 + n1 * 1.5 + uTime * 0.12);
              float t = clamp(0.42 + n1 * 0.75 + n2 * 0.45, 0.0, 1.0);
              vec3 deep = vec3(0.55, 0.12, 0.02);
              vec3 mid = vec3(1.05, 0.42, 0.08);
              vec3 hot = vec3(1.6, 1.1, 0.55);
              vec3 col = mix(deep, mid, smoothstep(0.1, 0.55, t));
              col = mix(col, hot, smoothstep(0.55, 0.95, t));
              float limb = pow(max(dot(vN, vView), 0.0), 0.45);
              col *= 0.55 + 0.6 * limb;
              gl_FragColor = vec4(col, 1.0);
            }`}
        />
      </mesh>
      <Billboard>
        <mesh ref={corona}>
          <planeGeometry args={[radius * 5.5, radius * 5.5]} />
          <shaderMaterial
            uniforms={uCor}
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
                vec2 p = (vUv - 0.5) * 5.5;
                float r = length(p);
                float a = atan(p.y, p.x);
                float rays = fbm3(vec3(cos(a) * 2.0, sin(a) * 2.0, r * 0.8 - uTime * 0.25));
                float glow = exp(-(r - 1.0) * 1.9) * step(0.96, r);
                glow += exp(-(r - 1.0) * 0.9) * 0.14;
                glow *= 0.75 + rays * 0.9;
                glow *= smoothstep(2.75, 1.4, r);
                vec3 col = mix(vec3(1.0, 0.36, 0.08), vec3(1.3, 0.8, 0.4), exp(-(r - 1.0) * 2.0));
                gl_FragColor = vec4(col * max(glow, 0.0), 1.0);
              }`}
          />
        </mesh>
      </Billboard>
      <pointLight color="#ffc78a" intensity={1500} distance={220} decay={2} />
    </group>
  );
}
