import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { StageEnvironment, StageSky, StageDistortMaterial, StagePost } from '@/components/stage/stageFx';
import { Play, Pause, ArrowLeft, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SEO from '@/components/SEO';
import { useLiveRadioPlayer } from '@/hooks/useLiveRadioPlayer';
import { useLiveEqVisualizer } from '@/hooks/useLiveEqVisualizer';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import { PRIMARY_STREAM_URLS } from '@/config/streamUrls';

type Levels = { bars: number[]; bass: number; mid: number; high: number };

const BAR_COUNT = 96;
const RADIUS = 8;
const hueFor = (i: number) => ((i / BAR_COUNT) * 300) / 360; // same rainbow sweep as the classic EQ

function SpectrumRing({ levels }: { levels: React.MutableRefObject<Levels> }) {
  const bodyRef = useRef<THREE.InstancedMesh>(null);
  const capRef = useRef<THREE.InstancedMesh>(null);
  const reflRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);
  const smooth = useRef<number[]>(new Array(BAR_COUNT).fill(0));
  const peaks = useRef<number[]>(new Array(BAR_COUNT).fill(0));

  useFrame((state, raw) => {
    const dt = Math.min(raw, 0.05);
    const t = state.clock.elapsedTime;
    const src = levels.current.bars;
    for (let i = 0; i < BAR_COUNT; i++) {
      // mirror the 64-band spectrum around the ring so bass sits front and back
      const half = BAR_COUNT / 2;
      const k = i < half ? i : BAR_COUNT - 1 - i;
      const target = src[Math.floor((k / half) * (src.length || 1))] ?? 0;
      smooth.current[i] += (target - smooth.current[i]) * (1 - Math.exp(-14 * dt));
      peaks.current[i] = Math.max(smooth.current[i], peaks.current[i] - dt * 0.35);
      const h = 0.3 + smooth.current[i] * 7;
      const angle = (i / BAR_COUNT) * Math.PI * 2 + t * 0.05;
      const x = Math.cos(angle) * RADIUS, z = Math.sin(angle) * RADIUS;
      color.setHSL((hueFor(i) + t * 0.02) % 1, 0.95, 0.55);

      dummy.position.set(x, h / 2, z); dummy.rotation.set(0, -angle, 0); dummy.scale.set(1, h, 1); dummy.updateMatrix();
      bodyRef.current?.setMatrixAt(i, dummy.matrix); bodyRef.current?.setColorAt(i, color);
      dummy.position.set(x, -h / 2, z); dummy.updateMatrix();
      reflRef.current?.setMatrixAt(i, dummy.matrix); reflRef.current?.setColorAt(i, color);
      dummy.position.set(x, 0.45 + peaks.current[i] * 7, z); dummy.scale.set(1, 1, 1); dummy.updateMatrix();
      capRef.current?.setMatrixAt(i, dummy.matrix);
      capRef.current?.setColorAt(i, color.clone().multiplyScalar(3));
    }
    [bodyRef, capRef, reflRef].forEach((r) => {
      if (!r.current) return;
      r.current.instanceMatrix.needsUpdate = true;
      if (r.current.instanceColor) r.current.instanceColor.needsUpdate = true;
    });
  });

  return (
    <>
      <instancedMesh ref={bodyRef} args={[undefined, undefined, BAR_COUNT]}>
        <boxGeometry args={[0.32, 1, 0.32]} />
        <meshPhysicalMaterial roughness={0.15} metalness={0.1} transmission={0.2} clearcoat={1} emissive="#222" toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={capRef} args={[undefined, undefined, BAR_COUNT]}>
        <boxGeometry args={[0.36, 0.12, 0.36]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={reflRef} args={[undefined, undefined, BAR_COUNT]}>
        <boxGeometry args={[0.32, 1, 0.32]} />
        <meshBasicMaterial transparent opacity={0.12} toneMapped={false} depthWrite={false} />
      </instancedMesh>
    </>
  );
}

function Core({ levels }: { levels: React.MutableRefObject<Levels> }) {
  const orb = useRef<THREE.Mesh>(null);
  const rings = useRef<THREE.Group>(null);
  useFrame((state, raw) => {
    const dt = Math.min(raw, 0.05);
    const t = state.clock.elapsedTime;
    const { bass, mid, high } = levels.current;
    if (orb.current) {
      const s = 1.3 + bass * 0.9;
      orb.current.scale.setScalar(s);
      orb.current.rotation.y += dt * (0.2 + mid);
      const m = orb.current.material as THREE.MeshStandardMaterial & { distort: number };
      m.distort = 0.25 + bass * 0.5;
      m.color.setHSL((t * 0.05) % 1, 0.9, 0.55);
      m.emissive.setHSL((t * 0.05 + 0.5) % 1, 0.9, 0.25 + high * 0.4);
    }
    rings.current?.children.forEach((r, i) => {
      r.rotation.x += dt * (0.3 + i * 0.2) * (1 + mid * 2);
      r.rotation.y += dt * (0.2 + i * 0.1);
      r.scale.setScalar(1 + bass * 0.25 * (i + 1) * 0.5);
    });
  });
  return (
    <group position={[0, 3.4, 0]}>
      <mesh ref={orb}>
        <icosahedronGeometry args={[1, 24]} />
        <StageDistortMaterial />
      </mesh>
      <group ref={rings}>
        {['#ff3d9a', '#3dd6ff', '#ffd23d'].map((c, i) => (
          <mesh key={c}>
            <torusGeometry args={[2.3 + i * 0.55, 0.035, 12, 128]} />
            <meshBasicMaterial color={c} toneMapped={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Lasers({ levels }: { levels: React.MutableRefObject<Levels> }) {
  const group = useRef<THREE.Group>(null);
  const colors = ['#ff2e88', '#22d3ee', '#a855f7', '#facc15', '#34d399', '#fb7185', '#60a5fa', '#f97316'];
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const { high, bass } = levels.current;
    group.current?.children.forEach((beam, i) => {
      beam.rotation.z = Math.sin(t * (0.6 + i * 0.11) + i) * 0.9;
      beam.rotation.x = -0.5 + Math.cos(t * 0.5 + i) * 0.35;
      ((beam as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = 0.05 + high * 0.5 + bass * 0.15;
    });
  });
  return (
    <group ref={group} position={[0, 14, -10]}>
      {colors.map((c, i) => (
        <mesh key={c} position={[(i - 3.5) * 3, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.6, 30, 12, 1, true]} />
          <meshBasicMaterial color={c} transparent opacity={0.2} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function CameraRig({ levels }: { levels: React.MutableRefObject<Levels> }) {
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const b = levels.current.bass;
    const r = 17 - b * 1.5;
    state.camera.position.set(Math.sin(t * 0.07) * r, 5 + Math.sin(t * 0.17) * 2, Math.cos(t * 0.07) * r);
    state.camera.lookAt(0, 2.5, 0);
  });
  return null;
}

function StageScene({ levels }: { levels: React.MutableRefObject<Levels> }) {
  return (
    <>
      <color attach="background" args={['#05040b']} />
      <fog attach="fog" args={['#05040b', 22, 55]} />
      <ambientLight intensity={0.25} />
      <pointLight position={[0, 6, 0]} intensity={80} color="#c084fc" />
      <pointLight position={[10, 4, 10]} intensity={40} color="#22d3ee" />
      <pointLight position={[-10, 4, -10]} intensity={40} color="#ff2e88" />
      <StageEnvironment />

      <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, 0]}>
        <circleGeometry args={[40, 96]} />
        <meshStandardMaterial color="#0b0814" roughness={0.25} metalness={0.8} transparent opacity={0.92} />
      </mesh>
      <gridHelper args={[80, 80, '#4c1d95', '#1e1036']} position={[0, 0, 0]} />

      <StageSky />

      <SpectrumRing levels={levels} />
      <Core levels={levels} />
      <Lasers levels={levels} />
      <CameraRig levels={levels} />

      <StagePost />
    </>
  );
}

const Stage = () => {
  const audioPlayer = useAudioPlayer();
  const { isPlaying, isLoading, handlePlayPause, streamTitle } = useLiveRadioPlayer([...PRIMARY_STREAM_URLS]);
  const { frequencyData } = useLiveEqVisualizer({ audioRef: audioPlayer.audioRef, isActive: audioPlayer.isPlaying });
  const levels = useRef<Levels>({ bars: [], bass: 0, mid: 0, high: 0 });
  const [showUi, setShowUi] = useState(true);
  const hideTimer = useRef<number | null>(null);

  useEffect(() => {
    // frequencyData heights are 12–70 px; normalize to 0–1
    const bars = frequencyData.map((h) => Math.max(0, (h - 12) / 58));
    const avg = (a: number, b: number) => bars.slice(a, b).reduce((s, v) => s + v, 0) / Math.max(1, b - a);
    levels.current = { bars, bass: avg(0, 8), mid: avg(8, 32), high: avg(32, 64) };
  }, [frequencyData]);

  const pokeUi = () => {
    setShowUi(true);
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setShowUi(false), 3500);
  };

  useEffect(() => {
    document.body.setAttribute('data-no-ads', 'stage');
    return () => { if (document.body.getAttribute('data-no-ads') === 'stage') document.body.removeAttribute('data-no-ads'); };
  }, []);

  useEffect(() => {
    pokeUi();
    return () => { if (hideTimer.current) window.clearTimeout(hideTimer.current); };
  }, []);

  const goFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {});
    else document.exitFullscreen?.();
  };

  const title = (streamTitle || 'Dance One Radio').replace(/&amp;/g, '&');

  return (
    <div className="fixed inset-0 z-[60] bg-background" onMouseMove={pokeUi} onTouchStart={pokeUi}>
      <SEO
        title="Live Stage Visualizer | Dance One Radio"
        description="Watch Dance One Radio come alive on a 3D audio-reactive stage. Lights, beams and bars move to the live electronic music stream."
        url="https://danceoneradio.com/stage"
      />
      <Canvas dpr={[1, 1.75]} camera={{ position: [0, 6, 17], fov: 55 }} gl={{ antialias: true, powerPreference: 'high-performance' }}>
        <StageScene levels={levels} />
      </Canvas>

      <div className={`pointer-events-none absolute inset-0 flex flex-col justify-between p-6 transition-opacity duration-500 ${showUi || !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
        <div className="pointer-events-auto flex items-center justify-between">
          <Button asChild variant="outline" className="border-primary/30 bg-background/40 backdrop-blur">
            <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" />Back to site</Link>
          </Button>
          <Button variant="outline" onClick={goFullscreen} className="border-primary/30 bg-background/40 backdrop-blur">
            <Maximize2 className="mr-2 h-4 w-4" />Full screen
          </Button>
        </div>
        <div className="pointer-events-auto mx-auto flex max-w-xl flex-col items-center gap-3 rounded-2xl border border-primary/20 bg-background/50 px-6 py-4 text-center backdrop-blur">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">Dance One Radio · Live Stage</p>
          <p className="max-w-md truncate text-sm text-foreground">{title}</p>
          <Button onClick={handlePlayPause} className="btn-cyber" size="lg">
            {isPlaying ? <><Pause className="mr-2 h-5 w-5" />PAUSE</> : isLoading ? 'LOADING…' : <><Play className="mr-2 h-5 w-5" />START THE SHOW</>}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Stage;
