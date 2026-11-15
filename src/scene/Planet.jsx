import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { noise } from './noise.glsl.js';

const TYPES = { gas: 0, rocky: 1, ice: 2, lava: 3 };
export const LIGHT_DIR = new THREE.Vector3(-0.55, 0.35, 0.75).normalize();

// Fully procedural planet: surface shader by type, atmosphere shell, optional rings.
export default function Planet({ position, radius = 6, type = 'rocky', colors, rings = false, tilt = 0.35, spin = 0.04, seed = 1 }) {
  const body = useRef();
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uType: { value: TYPES[type] ?? 1 },
      uC1: { value: new THREE.Color(colors[0]) },
      uC2: { value: new THREE.Color(colors[1]) },
      uC3: { value: new THREE.Color(colors[2]) },
      uLight: { value: LIGHT_DIR },
      uSeed: { value: seed },
    }),
    [type, colors, seed]
  );
  const atmo = useMemo(
    () => ({
      uColor: { value: new THREE.Color(colors[1]).lerp(new THREE.Color('#ffffff'), 0.25) },
      uLight: { value: LIGHT_DIR },
    }),
    [colors]
  );

  useFrame((_, dt) => {
    uniforms.uTime.value += dt;
    if (body.current) body.current.rotation.y += dt * spin;
  });

  return (
    <group position={position} rotation={[0, 0, tilt]}>
      <mesh ref={body}>
        <sphereGeometry args={[radius, 96, 96]} />
        <shaderMaterial
          uniforms={uniforms}
          vertexShader={/* glsl */ `
            varying vec3 vPos; varying vec3 vWN; varying vec3 vView;
            void main(){
              vPos = position;
              vWN = normalize(mat3(modelMatrix) * normal);
              vec4 wp = modelMatrix * vec4(position, 1.0);
              vView = normalize(cameraPosition - wp.xyz);
              gl_Position = projectionMatrix * viewMatrix * wp;
            }`}
          fragmentShader={/* glsl */ `
            ${noise}
            uniform float uTime; uniform int uType; uniform vec3 uC1; uniform vec3 uC2; uniform vec3 uC3;
            uniform vec3 uLight; uniform float uSeed;
            varying vec3 vPos; varying vec3 vWN; varying vec3 vView;
            void main(){
              vec3 p = normalize(vPos) + uSeed * 3.1;
              vec3 col; vec3 emissive = vec3(0.0); float spec = 0.0;
              if (uType == 0) {
                // gas giant: turbulent latitude bands
                float turb = fbm(p * vec3(1.5, 5.0, 1.5) + vec3(uTime * 0.02, 0.0, 0.0));
                float b = sin((p.y - uSeed * 3.1) * 14.0 + turb * 3.2);
                float b2 = sin((p.y - uSeed * 3.1) * 37.0 + turb * 5.0);
                col = mix(uC1, uC2, smoothstep(-0.8, 0.8, b));
                col = mix(col, uC3, smoothstep(0.55, 1.0, b2) * 0.55);
                float storm = smoothstep(0.62, 0.7, 1.0 - length((normalize(vPos) - normalize(vec3(0.6, -0.25, 0.75))) * vec3(1.0, 2.0, 1.0)));
                col = mix(col, uC3 * 1.1, storm * 0.8);
              } else if (uType == 1) {
                // rocky / terrestrial: continents, oceans, a few clouds
                float h = fbm(p * 2.4);
                float land = smoothstep(0.02, 0.08, h);
                col = mix(uC1, uC2, land);
                col = mix(col, uC3, smoothstep(0.25, 0.5, h));
                spec = (1.0 - land) * 0.6;
                float cl = smoothstep(0.2, 0.7, fbm(p * vec3(2.5, 6.0, 2.5) + vec3(uTime * 0.01, 0.0, uTime * 0.006)));
                col = mix(col, vec3(0.9), cl * 0.32);
                spec *= (1.0 - cl);
              } else if (uType == 2) {
                // ice world: pale shell with glowing fracture lines
                float h = fbm(p * 2.0);
                col = mix(uC1, uC3, smoothstep(-0.4, 0.5, h));
                float cr = 1.0 - smoothstep(0.0, 0.035, abs(fbm3(p * 4.0)));
                col = mix(col, uC2, cr * 0.8);
                spec = 0.35;
              } else {
                // lava: dark crust, molten veins that glow on the night side too
                float h = fbm(p * 2.6 + vec3(0.0, uTime * 0.01, 0.0));
                col = mix(uC1, uC2, smoothstep(-0.3, 0.4, h));
                float vein = 1.0 - smoothstep(0.0, 0.06, abs(fbm3(p * 3.2 + h)));
                float pulse = 0.8 + 0.2 * sin(uTime * 1.5 + h * 10.0);
                emissive = uC3 * vein * 2.6 * pulse;
              }
              vec3 N = normalize(vWN);
              float ndl = dot(N, uLight);
              float diff = smoothstep(-0.15, 0.6, ndl);
              vec3 H = normalize(uLight + vView);
              float sp = pow(max(dot(N, H), 0.0), 40.0) * spec * diff;
              float rim = pow(1.0 - max(dot(N, vView), 0.0), 3.0);
              vec3 lit = col * (0.025 + diff * 1.05) + sp + emissive;
              lit += uC2 * rim * smoothstep(-0.3, 0.4, ndl) * 0.55;
              gl_FragColor = vec4(lit, 1.0);
            }`}
        />
      </mesh>
      {/* atmosphere halo */}
      <mesh scale={1.14}>
        <sphereGeometry args={[radius, 64, 64]} />
        <shaderMaterial
          uniforms={atmo}
          side={THREE.BackSide}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          vertexShader={/* glsl */ `
            varying vec3 vWN; varying vec3 vView;
            void main(){
              vWN = normalize(mat3(modelMatrix) * normal);
              vec4 wp = modelMatrix * vec4(position, 1.0);
              vView = normalize(cameraPosition - wp.xyz);
              gl_Position = projectionMatrix * viewMatrix * wp;
            }`}
          fragmentShader={/* glsl */ `
            uniform vec3 uColor; uniform vec3 uLight;
            varying vec3 vWN; varying vec3 vView;
            void main(){
              float f = pow(clamp(0.78 + dot(normalize(vWN), vView), 0.0, 1.0), 4.0);
              float lit = smoothstep(-0.5, 0.5, dot(normalize(vWN), uLight));
              gl_FragColor = vec4(uColor * f * (0.25 + lit * 1.4), 1.0);
            }`}
        />
      </mesh>
      {rings && <Rings radius={radius} colors={colors} />}
    </group>
  );
}

function Rings({ radius, colors }) {
  const uniforms = useMemo(
    () => ({ uC: { value: new THREE.Color(colors[2]) }, uC2: { value: new THREE.Color(colors[1]) }, uIn: { value: radius * 1.35 }, uOut: { value: radius * 2.3 } }),
    [radius, colors]
  );
  return (
    <mesh rotation={[Math.PI / 2 - 0.25, 0, 0]}>
      <ringGeometry args={[radius * 1.35, radius * 2.3, 160, 1]} />
      <shaderMaterial
        uniforms={uniforms}
        side={THREE.DoubleSide}
        transparent
        depthWrite={false}
        vertexShader={/* glsl */ `
          varying vec2 vP;
          void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`}
        fragmentShader={/* glsl */ `
          uniform vec3 uC; uniform vec3 uC2; uniform float uIn; uniform float uOut;
          varying vec2 vP;
          float h(float x){ return fract(sin(x * 127.1) * 43758.5453); }
          void main(){
            float t = (length(vP) - uIn) / (uOut - uIn);
            float i = floor(t * 70.0);
            float band = mix(h(i), h(i + 1.0), fract(t * 70.0));
            float a = smoothstep(0.0, 0.06, t) * smoothstep(1.0, 0.85, t) * (0.25 + band * 0.75);
            a *= 1.0 - smoothstep(0.52, 0.56, t) * smoothstep(0.62, 0.58, t) * 0.9; // Cassini-style gap
            // planet shadow across the back of the ring
            float shadow = smoothstep(-0.2, 0.25, vP.x / uOut + 0.35);
            vec3 col = mix(uC2, uC, band) * (0.25 + 0.75 * shadow);
            gl_FragColor = vec4(col * 0.9, a * 0.85);
          }`}
      />
    </mesh>
  );
}
