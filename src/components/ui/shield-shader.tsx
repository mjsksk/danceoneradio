import { cn } from "@/lib/utils";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useMemo, useRef } from "react";

const vertexShader = /* glsl */ `
  void main() {
    gl_Position = vec4(position, 1.0);
  }
`;

// Hexagonal portal / shield shader — blue beams radiating between dark hex cells
const fragmentShader = /* glsl */ `
  precision highp float;
  uniform float iTime;
  uniform vec3 iResolution;

  // Distance to a hex tile center, plus cell id
  // Returns vec4(dist_to_center, dist_to_edge, cellId.x, cellId.y)
  vec4 hexDist(vec2 p) {
    vec2 s = vec2(1.0, 1.7320508); // sqrt(3)
    vec4 hC = floor(vec4(p, p - vec2(0.5, 1.0)) / s.xyxy) + 0.5;
    vec4 h = vec4(p - hC.xy * s, p - (hC.zw + 0.5) * s);
    vec2 offs = dot(h.xy, h.xy) < dot(h.zw, h.zw) ? h.xy : h.zw;
    vec2 id   = dot(h.xy, h.xy) < dot(h.zw, h.zw) ? hC.xy : hC.zw + 0.5;
    // distance to nearest edge of the hex
    float edge = 0.5 - max(
      abs(offs.x) * 0.8660254 + offs.y * 0.5,
      max(abs(offs.y), -offs.y * 0.5 + abs(offs.x) * 0.8660254)
    ) * 0.0; // placeholder
    // Use a cleaner hex edge distance:
    vec2 a = abs(offs);
    edge = 0.5 - max(a.x * 0.8660254 + a.y * 0.5, a.y);
    return vec4(length(offs), edge, id);
  }

  void main() {
    vec2 fragCoord = gl_FragCoord.xy;
    vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;

    float t = iTime * 0.25;

    // Polar coordinates for ray beams
    float ang = atan(uv.y, uv.x);
    float rad = length(uv);

    // === Hex grid (tunnel: scale with radius for perspective feel) ===
    // Sample hex grid at fixed scale but modulate brightness by radius
    vec2 hp = uv * 4.2;
    vec4 H = hexDist(hp);
    float dCenter = H.x;           // 0 at center of hex
    float dEdge   = H.y;           // 0 at edge of hex

    // Dark inside hex, glowing toward edge
    // Edge glow band
    float edgeGlow = smoothstep(0.18, 0.0, dEdge);     // bright thin line at very edge
    float edgeBloom = smoothstep(0.35, 0.05, dEdge);   // softer bloom inward
    // Pure dark hex interior
    float interior = smoothstep(0.05, 0.18, dEdge);

    // === Radial light beams between hexes ===
    // Beams aligned with the 6 hex vertex directions
    float beams = 0.0;
    for (int i = 0; i < 6; i++) {
      float a = float(i) * 1.0471975512 + 0.5235987756; // 60deg steps, offset 30deg
      float d = abs(sin(ang - a));
      beams += pow(1.0 - d, 24.0);
    }
    // Add subtle animated flicker
    beams *= 0.85 + 0.15 * sin(iTime * 1.5 + rad * 8.0);

    // Falloff beams from center outward (brighter near mid, fading at extremes)
    float beamFalloff = smoothstep(0.0, 0.15, rad) * smoothstep(1.4, 0.3, rad);
    beams *= beamFalloff;

    // === Color composition ===
    // Deep blue palette
    vec3 deepBlue = vec3(0.02, 0.05, 0.18);
    vec3 midBlue  = vec3(0.10, 0.35, 0.95);
    vec3 hotBlue  = vec3(0.55, 0.80, 1.00);

    vec3 col = vec3(0.0);

    // Beam light
    col += midBlue * beams * 1.4;
    col += hotBlue * pow(beams, 2.0) * 0.8;

    // Hex edge glow (multiplied by beam presence so edges only light where rays hit)
    float rayMask = beams * 1.2 + 0.15;
    col += midBlue * edgeBloom * 0.35 * rayMask;
    col += hotBlue * edgeGlow * 0.9 * rayMask;

    // Central dark hex pit
    float centerPit = smoothstep(0.18, 0.0, rad);
    col *= mix(1.0, 0.0, centerPit);

    // Outer vignette to push edges to black
    float vig = smoothstep(1.4, 0.4, rad);
    col *= mix(0.15, 1.0, vig);

    // Subtle horizontal scan-line shimmer (suggests reflective floor)
    float scan = 0.5 + 0.5 * sin(fragCoord.y * 3.14159 + iTime * 4.0);
    col *= 0.97 + 0.03 * scan;

    // Slow color breathing
    col *= 0.9 + 0.1 * sin(iTime * 0.6);

    // Gamma
    col = pow(col, vec3(0.95));

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
