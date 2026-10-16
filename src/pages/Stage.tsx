import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Play, Pause, ArrowLeft, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SEO from '@/components/SEO';
import { useLiveRadioPlayer } from '@/hooks/useLiveRadioPlayer';
import { useLiveEqVisualizer } from '@/hooks/useLiveEqVisualizer';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import { PRIMARY_STREAM_URLS } from '@/config/streamUrls';

type Levels = { bars: number[]; bass: number; mid: number; high: number };

const BAR_COUNT = 64;

function StageScene({ levels }: { levels: React.MutableRefObject<Levels> }) {
  const barsRef = useRef<THREE.InstancedMesh>(null);
  const floorRef = useRef<THREE.Mesh>(null);
  const beamsRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);
  const smooth = useRef<number[]>(new Array(BAR_COUNT).fill(0));

  useFrame((state, raw) => {
    const dt = Math.min(raw, 0.05);
    const t = state.clock.elapsedTime;
    const { bars, bass, mid, high } = levels.current;

    if (barsRef.current) {
      for (let i = 0; i < BAR_COUNT; i++) {
        const target = bars[i] ?? 0;
        smooth.current[i] += (target - smooth.current[i]) * (1 - Math.exp(-12 * dt));
        const h = 0.2 + smooth.current[i] * 6;
        const angle = (i / BAR_COUNT) * Math.PI * 2;
        dummy.position.set(Math.cos(angle) * 7, h / 2, Math.sin(angle) * 7);
        dummy.rotation.set(0, -angle, 0);
        dummy.scale.set(1, h, 1);
        dummy.updateMatrix();
        barsRef.current.setMatrixAt(i, dummy.matrix);
        color.setHSL((i / BAR_COUNT + t * 0.03) % 1, 0.85, 0.45 + smooth.current[i] * 0.3);
        barsRef.current.setColorAt(i, color);
      }
      barsRef.current.instanceMatrix.needsUpdate = true;
      if (barsRef.current.instanceColor) barsRef.current.instanceColor.needsUpdate = true;
    }

    if (ringRef.current) {
      const s = 1 + bass * 0.6;
      ringRef.current.scale.set(s, s, s);
      ringRef.current.rotation.z += dt * (0.3 + mid);
      (ringRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.6 + bass * 3;
    }

    if (beamsRef.current) {
      beamsRef.current.children.forEach((beam, i) => {
        beam.rotation.z = Math.sin(t * (0.5 + i * 0.13) + i) * 0.6;
        beam.rotation.x = Math.cos(t * 0.4 + i) * 0.2;
        const m = (beam as THREE.Mesh).material as THREE.MeshBasicMaterial;
        m.opacity = 0.08 + high * 0.35;
      });
    }

    if (floorRef.current) {
      (floorRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.1 + bass * 0.6;
    }

    state.camera.position.x = Math.sin(t * 0.08) * 16;
    state.camera.position.z = Math.cos(t * 0.08) * 16;
    state.camera.position.y = 6 + Math.sin(t * 0.2) * 1.5;
    state.camera.lookAt(0, 2, 0);
  });

  const beamColors = ['#ff3d9a', '#3dd6ff', '#ffd23d', '#9b5cff', '#3dff9e', '#ff7a3d'];

  return (
    <>
      <color attach="background" args={['#07060d']} />
      <fog attach="fog" args={['#07060d', 18, 45]} />
      <ambientLight intensity={0.35} />
      <pointLight position={[0, 8, 0]} intensity={60} color="#c9a2ff" />

      <mesh ref={floorRef} rotation-x={-Math.PI / 2} receiveShadow>
        <circleGeometry args={[30, 64]} />
        <meshStandardMaterial color="#120f1f" emissive="#3b1d6e" emissiveIntensity={0.2} roughness={0.35} metalness={0.6} />
      </mesh>
      <gridHelper args={[60, 60, '#3a2a66', '#1d1733']} position={[0, 0.01, 0]} />

      <instancedMesh ref={barsRef} args={[undefined, undefined, BAR_COUNT]}>
        <boxGeometry args={[0.45, 1, 0.45]} />
        <meshStandardMaterial roughness={0.3} metalness={0.2} emissive="#ffffff" emissiveIntensity={0.15} />
      </instancedMesh>

      <mesh ref={ringRef} position={[0, 3.2, 0]}>
        <torusGeometry args={[2.2, 0.12, 16, 96]} />
        <meshStandardMaterial color="#ffffff" emissive="#b07cff" emissiveIntensity={1} />
      </mesh>

      <group ref={beamsRef} position={[0, 12, -6]}>
        {beamColors.map((c, i) => (
          <mesh key={c} position={[(i - 2.5) * 2.5, 0, 0]}>
            <coneGeometry args={[1.6, 18, 24, 1, true]} />
            <meshBasicMaterial color={c} transparent opacity={0.15} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
        ))}
      </group>
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
      <Canvas dpr={[1, 1.75]} camera={{ position: [0, 6, 16], fov: 55 }}>
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
