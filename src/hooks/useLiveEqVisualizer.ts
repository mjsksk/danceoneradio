import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

const EQ_BAR_COUNT = 64;
const EQ_MIN_HEIGHT = 12;
const EQ_MAX_HEIGHT = 70;
const ANALYSER_FFT_SIZE = 256;
const SYNTHETIC_BIN_COUNT = ANALYSER_FFT_SIZE / 2;
const SILENT_ANALYSER_THRESHOLD = 4;
const SILENT_FRAME_LIMIT = 72;

const createIdleFrequencyData = (count = EQ_BAR_COUNT) => new Array(count).fill(EQ_MIN_HEIGHT);

const clampNormalized = (value: number) => Math.max(0, Math.min(1, value));

const isTouchDeviceClient = () => typeof window !== 'undefined' && (window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0);

const shouldUseDesktopEqMotion = (isElectronDesktop: boolean) => (
  isElectronDesktop || isTouchDeviceClient()
);

const getPeakFrequencyValue = (frequencyBins: Uint8Array) => {
  let peak = 0;

  for (let index = 0; index < frequencyBins.length; index += 1) {
    peak = Math.max(peak, frequencyBins[index]);
  }

  return peak;
};

let sharedAudioContext: AudioContext | null = null;
let sharedAnalyser: AnalyserNode | null = null;
let sharedSourceNode: MediaElementAudioSourceNode | null = null;
let sharedAnalyserAudio: HTMLAudioElement | null = null;
let sharedFrequencyBins: Uint8Array | null = null;

const mapFrequencyBinsToBars = (frequencyBins: Uint8Array, previousBars: number[]) => {
  let signalLevel = 0;
  let peakSignal = 0;

  const bars = Array.from({ length: EQ_BAR_COUNT }, (_, index) => {
    const start = Math.floor((index / EQ_BAR_COUNT) * frequencyBins.length);
    const end = Math.max(start + 1, Math.floor(((index + 1) / EQ_BAR_COUNT) * frequencyBins.length));

    let total = 0;
    for (let i = start; i < end; i += 1) {
      total += frequencyBins[i];
    }

    const average = total / (end - start) / 255;
    const emphasis = 1.15 - (index / EQ_BAR_COUNT) * 0.35;
    const normalized = clampNormalized(average * emphasis * 1.4);
    const targetHeight = EQ_MIN_HEIGHT + Math.pow(normalized, 1.35) * (EQ_MAX_HEIGHT - EQ_MIN_HEIGHT);
    const previousHeight = previousBars[index] ?? EQ_MIN_HEIGHT;
    const smoothing = targetHeight > previousHeight ? 0.45 : 0.18;

    signalLevel += normalized;
    peakSignal = Math.max(peakSignal, normalized);

    return previousHeight + (targetHeight - previousHeight) * smoothing;
  });

  return {
    bars,
    averageSignal: signalLevel / EQ_BAR_COUNT,
    peakSignal,
  };
};

// Pre-computed per-bin random phases for independent bar movement
const BIN_PHASES: number[] = [];
const BIN_SPEEDS: number[] = [];
const BIN_OFFSETS: number[] = [];
for (let i = 0; i < SYNTHETIC_BIN_COUNT; i++) {
  // Use a seeded-style deterministic pseudo-random via sine hashing
  BIN_PHASES.push(((Math.sin(i * 127.1 + 311.7) * 43758.5453) % 1) * Math.PI * 2);
  BIN_SPEEDS.push(1.8 + ((Math.sin(i * 269.5 + 183.3) * 43758.5453) % 1) * 3.2);
  BIN_OFFSETS.push(0.08 + ((Math.sin(i * 419.2 + 71.9) * 43758.5453) % 1) * 0.12);
}

const populateSyntheticFrequencyBins = (time: number, frequencyBins: Uint8Array) => {
  // Global energy envelope for natural breathing
  const globalPulse = 0.55 + 0.25 * Math.sin(time * 0.9);

  for (let index = 0; index < frequencyBins.length; index += 1) {
    const position = index / (frequencyBins.length - 1);

    // Bass-heavy frequency curve
    const bassWeight = Math.exp(-position * 3.5);
    const freqCurve = 0.35 + bassWeight * 0.65;

    // Each bin oscillates at its own unique speed and phase — independent motion
    const ownPhase = BIN_PHASES[index];
    const ownSpeed = BIN_SPEEDS[index];
    const ownOffset = BIN_OFFSETS[index];

    const primary = (Math.sin(time * ownSpeed + ownPhase) + 1) / 2;
    const secondary = (Math.sin(time * ownSpeed * 0.7 + ownPhase * 1.3 + 2.1) + 1) / 2;
    const jitter = (Math.sin(time * ownSpeed * 2.3 + ownPhase * 0.8) + 1) / 2 * 0.08;

    const energy = clampNormalized(
      ownOffset +
      (primary * 0.55 + secondary * 0.3 + jitter) * freqCurve * globalPulse
    );

    frequencyBins[index] = Math.round(energy * 255);
  }
};

interface UseLiveEqVisualizerOptions {
  audioRef: RefObject<HTMLAudioElement>;
  isActive: boolean;
  isElectronDesktop: boolean;
}

type EqDataSource = 'idle' | 'real' | 'fallback' | 'desktop-sim';

export const useLiveEqVisualizer = ({
  audioRef,
  isActive,
  isElectronDesktop,
}: UseLiveEqVisualizerOptions) => {
  const [frequencyData, setFrequencyData] = useState<number[]>(() => createIdleFrequencyData());
  const [dataSource, setDataSource] = useState<EqDataSource>('idle');
  const animationRef = useRef<number | null>(null);
  const smoothedBarsRef = useRef<number[]>(createIdleFrequencyData());
  const syntheticTimeRef = useRef(0);
  const syntheticFrequencyBinsRef = useRef<Uint8Array>(new Uint8Array(SYNTHETIC_BIN_COUNT));
  const silentAnalyserFramesRef = useRef(0);

  useEffect(() => {
    const cancelFrame = () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };

    if (!isActive) {
      syntheticTimeRef.current = 0;
      silentAnalyserFramesRef.current = 0;
      smoothedBarsRef.current = createIdleFrequencyData();
      setDataSource('idle');
      setFrequencyData(createIdleFrequencyData());
      cancelFrame();
      return;
    }

    let isCancelled = false;
    syntheticTimeRef.current = 0;

    const startSyntheticAnimation = (source: Extract<EqDataSource, 'fallback' | 'desktop-sim'>) => {
      if (isCancelled) {
        return;
      }

      cancelFrame();
      silentAnalyserFramesRef.current = 0;

      const animate = () => {
        if (isCancelled) {
          return;
        }

        syntheticTimeRef.current += 0.045;
        populateSyntheticFrequencyBins(syntheticTimeRef.current, syntheticFrequencyBinsRef.current);
        const { bars } = mapFrequencyBinsToBars(syntheticFrequencyBinsRef.current, smoothedBarsRef.current);

        smoothedBarsRef.current = bars;
        setDataSource(source);
        setFrequencyData(bars);
        animationRef.current = requestAnimationFrame(animate);
      };

      animate();
    };

    if (shouldUseDesktopEqMotion(isElectronDesktop)) {
      startSyntheticAnimation('desktop-sim');
      return () => {
        isCancelled = true;
        cancelFrame();
      };
    }

    const audio = audioRef.current;
    const AudioContextCtor = window.AudioContext || (window as Window & typeof globalThis & {
      webkitAudioContext?: typeof AudioContext;
    }).webkitAudioContext;

    if (!audio || !AudioContextCtor) {
      startSyntheticAnimation('fallback');
      return () => {
        isCancelled = true;
        cancelFrame();
      };
    }

    const setupAnalyser = async () => {
      try {
        let context = sharedAudioContext;
        if (!context || context.state === 'closed') {
          context = new AudioContextCtor();
          sharedAudioContext = context;
        }

        if (context.state === 'suspended') {
          await context.resume();
        }

        if (!sharedAnalyser || sharedAnalyserAudio !== audio) {
          if (sharedSourceNode && sharedAnalyserAudio !== audio) {
            sharedSourceNode.disconnect();
            sharedAnalyser?.disconnect();
            sharedSourceNode = null;
            sharedAnalyser = null;
            sharedAnalyserAudio = null;
          }

          if (!sharedSourceNode) {
            const sourceNode = context.createMediaElementSource(audio);
            const analyser = context.createAnalyser();

            analyser.fftSize = ANALYSER_FFT_SIZE;
            analyser.minDecibels = -95;
            analyser.maxDecibels = -20;
            analyser.smoothingTimeConstant = 0.82;

            sourceNode.connect(analyser);
            analyser.connect(context.destination);

            sharedSourceNode = sourceNode;
            sharedAnalyser = analyser;
            sharedAnalyserAudio = audio;
            sharedFrequencyBins = new Uint8Array(analyser.frequencyBinCount);
          }
        }

        const animate = () => {
          if (isCancelled || !sharedAnalyser || !sharedFrequencyBins) {
            return;
          }

          sharedAnalyser.getByteFrequencyData(sharedFrequencyBins as unknown as Uint8Array<ArrayBuffer>);

          const peakFrequencyValue = getPeakFrequencyValue(sharedFrequencyBins);
          if (peakFrequencyValue <= SILENT_ANALYSER_THRESHOLD) {
            silentAnalyserFramesRef.current += 1;

            if (silentAnalyserFramesRef.current >= SILENT_FRAME_LIMIT) {
              startSyntheticAnimation('fallback');
              return;
            }
          } else {
            silentAnalyserFramesRef.current = 0;
          }

          setDataSource('real');

          const {
            bars: nextBars,
          } = mapFrequencyBinsToBars(sharedFrequencyBins, smoothedBarsRef.current);

          smoothedBarsRef.current = nextBars;
          setFrequencyData(nextBars);
          animationRef.current = requestAnimationFrame(animate);
        };

        animate();
      } catch (error) {
        console.error('Failed to initialize live EQ analyser:', error);
        startSyntheticAnimation('fallback');
      }
    };

    void setupAnalyser();

    return () => {
      isCancelled = true;
      cancelFrame();
    };
  }, [audioRef, isActive, isElectronDesktop]);

  const diagnostics = {
    audioContextState: sharedAudioContext?.state ?? 'none',
    hasSourceNode: !!sharedSourceNode,
    hasAnalyser: !!sharedAnalyser,
    audioSrc: sharedAnalyserAudio?.src ?? audioRef.current?.src ?? 'none',
    audioCrossOrigin: audioRef.current?.crossOrigin ?? 'not-set',
    audioNetworkState: audioRef.current?.networkState ?? -1,
    audioReadyState: audioRef.current?.readyState ?? -1,
    isTouchDevice: isTouchDeviceClient(),
    averageSignal: frequencyData.length > 0
      ? Math.round(frequencyData.reduce((a, b) => a + b, 0) / frequencyData.length)
      : 0,
    peakBar: Math.round(Math.max(...frequencyData)),
    minBar: Math.round(Math.min(...frequencyData)),
    rawAnalyserBins: sharedFrequencyBins ? Array.from(sharedFrequencyBins.slice(0, 8)) : [],
    isElectronDesktop,
  };

  return {
    frequencyData,
    barCount: EQ_BAR_COUNT,
    dataSource,
    diagnostics,
  };
};