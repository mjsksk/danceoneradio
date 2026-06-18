import { cn } from "@/lib/utils";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useMemo, useRef } from "react";

const vertexShader = /* glsl */ `
  void main() {
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  uniform float iTime;
  uniform vec3 iResolution;

  // Hash & noise helpers
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p *= 2.02;
      a *= 0.5;
    }
    return v;
  }

  // Hex pattern (shield grid)
  vec2 hexCoord(vec2 p) {
    vec2 q = vec2(p.x * 1.1547005, p.y + p.x * 0.5);
    vec2 pi = floor(q);
    vec2 pf = fract(q);
    float v = mod(pi.x + pi.y, 3.0);
    float ca = step(1.0, v);
    float cb = step(2.0, v);
    vec2 ma = step(pf.xy, pf.yx);
    return vec2(length(pf - 0.5 - vec2(ca, cb) + ma * (cb - ca)));
  }

  void main() {
    vec2 fragCoord = gl_FragCoord.xy;
    vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;

    float t = iTime * 0.15;

    // Animated plasma background
    vec2 p = uv * 2.5;
    float n = fbm(p + vec2(t, -t * 0.7));
    float n2 = fbm(p * 1.6 - vec2(t * 0.6, t));

    // Radial shield falloff
    float r = length(uv);
    float shield = smoothstep(1.2, 0.0, r);

    // Hex grid pattern
    vec2 hp = uv * 8.0 + vec2(t * 0.4, t * 0.2);
    float hex = hexCoord(hp).x;
    float hexLine = smoothstep(0.42, 0.48, hex) * (1.0 - smoothstep(0.48, 0.52, hex));

    // Concentric scan rings
    float rings = 0.5 + 0.5 * sin(r * 18.0 - iTime * 1.2);
    rings = pow(rings, 6.0);

    // Color palette (electric purple -> cyan)
    vec3 colA = vec3(0.05, 0.0, 0.18);
    vec3 colB = vec3(0.49, 0.18, 0.92); // violet
    vec3 colC = vec3(0.13, 0.83, 0.92); // cyan
    vec3 colD = vec3(0.96, 0.27, 0.58); // pink edge

    vec3 col = mix(colA, colB, smoothstep(0.1, 0.9, n));
    col = mix(col, colC, smoothstep(0.4, 0.95, n2) * 0.6);

    // Add hex grid glow
    col += colC * hexLine * 0.35 * shield;

    // Add scan rings
    col += colD * rings * 0.18 * shield;

    // Vignette dark edges
    col *= mix(0.25, 1.0, shield);

    // Subtle grain
    col += (hash(fragCoord + iTime) - 0.5) * 0.025;

    gl_FragColor = vec4(col, 1.0);
  }
`;

function FullscreenShader() {
  const materialRef = useRef<THREE.ShaderMaterial>(null!);
  const { size } = useThree();

  const uniforms = useMemo(
    () => ({
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector3(size.width, size.height, 1) },
    }),
    []
  );

  useFrame(({ clock }) => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.iTime.value = clock.getElapsedTime();
    materialRef.current.uniforms.iResolution.value.set(size.width, size.height, 1);
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </mesh>
  );
}

interface ShieldShaderProps {
  className?: string;
  children?: React.ReactNode;
  containerClassName?: string;
}

export const ShieldShader = ({ className, children, containerClassName }: ShieldShaderProps) => {
  return (
    <div className={cn("relative w-full", containerClassName)}>
      <div className="absolute inset-0 bg-black">
        <Canvas
          dpr={[1, 1.5]}
          gl={{ antialias: false, powerPreference: "high-performance" }}
          camera={{ position: [0, 0, 1] }}
        >
          <FullscreenShader />
        </Canvas>
      </div>
      <div className={cn("relative z-10", className)}>{children}</div>
    </div>
  );
};

export const Component = ShieldShader;
export default ShieldShader;
