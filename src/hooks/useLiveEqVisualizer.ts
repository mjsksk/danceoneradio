import { useEffect, useRef, useState } from 'react';

const EQ_BAR_COUNT = 64;
const EQ_MIN_HEIGHT = 12;
const EQ_MAX_HEIGHT = 70;
const LOW_SIGNAL_THRESHOLD = 0.035;
const LOW_SIGNAL_FRAME_LIMIT = 18;

const createIdleFrequencyData = (count = EQ_BAR_COUNT) => new Array(count).fill(EQ_MIN_HEIGHT);

let sharedAudioContext: AudioContext | null = null;
let sharedAnalyser: AnalyserNode | null = null;
let sharedSourceNode: MediaElementAudioSourceNode | null = null;
let sharedAnalyserAudio: HTMLAudioElement | null = null;
let sharedFrequencyBins: Uint8Array | null = null;

const supportsEqFallback = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
};

interface UseLiveEqVisualizerOptions {
  audioRef: React.RefObject<HTMLAudioElement>;
  isActive: boolean;
  isElectronDesktop: boolean;
}

export const useLiveEqVisualizer = ({
  audioRef,
  isActive,
  isElectronDesktop,
}: UseLiveEqVisualizerOptions) => {
  const [frequencyData, setFrequencyData] = useState<number[]>(() => createIdleFrequencyData());
  const animationRef = useRef<number | null>(null);
  const smoothedBarsRef = useRef<number[]>(createIdleFrequencyData());
  const lowSignalFramesRef = useRef(0);
  const syntheticModeRef = useRef(false);

  useEffect(() => {
    const cancelFrame = () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };

    if (!isActive) {
      syntheticModeRef.current = false;
      lowSignalFramesRef.current = 0;
      smoothedBarsRef.current = createIdleFrequencyData();
      setFrequencyData(createIdleFrequencyData());
      cancelFrame();
      return;
    }

    let isCancelled = false;
    let time = 0;

    const startSyntheticAnimation = () => {
      if (isCancelled || syntheticModeRef.current) {
        return;
      }

      syntheticModeRef.current = true;
      cancelFrame();

      const animate = () => {
        if (isCancelled) {
          return;
        }

        time += 0.05;
        const bars = Array.from({ length: EQ_BAR_COUNT }, (_, index) => {
          const base = 25 + Math.sin(time * (0.3 + index * 0.03) + index) * 18;
          return Math.max(EQ_MIN_HEIGHT, Math.min(EQ_MAX_HEIGHT, base + (Math.random() - 0.5) * 6));
        });

        smoothedBarsRef.current = bars;
        setFrequencyData(bars);
        animationRef.current = requestAnimationFrame(animate);
      };

      animate();
    };

    if (isElectronDesktop) {
      startSyntheticAnimation();
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
      startSyntheticAnimation();
      return () => {
        isCancelled = true;
        cancelFrame();
      };
    }

    const prefersSyntheticFallback = supportsEqFallback();

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

            analyser.fftSize = 256;
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
          if (isCancelled || syntheticModeRef.current || !sharedAnalyser || !sharedFrequencyBins) {
            return;
          }

          sharedAnalyser.getByteFrequencyData(sharedFrequencyBins);

          let signalLevel = 0;
          const nextBars = Array.from({ length: EQ_BAR_COUNT }, (_, index) => {
            const start = Math.floor((index / EQ_BAR_COUNT) * sharedFrequencyBins!.length);
            const end = Math.max(start + 1, Math.floor(((index + 1) / EQ_BAR_COUNT) * sharedFrequencyBins!.length));

            let total = 0;
            for (let i = start; i < end; i += 1) {
              total += sharedFrequencyBins![i];
            }

            const average = total / (end - start) / 255;
            const emphasis = 1.15 - (index / EQ_BAR_COUNT) * 0.35;
            const normalized = Math.min(1, average * emphasis * 1.4);
            const targetHeight = EQ_MIN_HEIGHT + Math.pow(normalized, 1.35) * (EQ_MAX_HEIGHT - EQ_MIN_HEIGHT);
            const previousHeight = smoothedBarsRef.current[index] ?? EQ_MIN_HEIGHT;
            const smoothing = targetHeight > previousHeight ? 0.45 : 0.18;

            signalLevel += normalized;
            return previousHeight + (targetHeight - previousHeight) * smoothing;
          });

          if (prefersSyntheticFallback) {
            const averageSignal = signalLevel / EQ_BAR_COUNT;
            lowSignalFramesRef.current = averageSignal < LOW_SIGNAL_THRESHOLD
              ? lowSignalFramesRef.current + 1
              : 0;

            if (lowSignalFramesRef.current >= LOW_SIGNAL_FRAME_LIMIT) {
              startSyntheticAnimation();
              return;
            }
          }

          smoothedBarsRef.current = nextBars;
          setFrequencyData(nextBars);
          animationRef.current = requestAnimationFrame(animate);
        };

        animate();
      } catch (error) {
        console.error('Failed to initialize live EQ analyser:', error);
        startSyntheticAnimation();
      }
    };

    syntheticModeRef.current = false;
    lowSignalFramesRef.current = 0;
    void setupAnalyser();

    return () => {
      isCancelled = true;
      cancelFrame();
    };
  }, [audioRef, isActive, isElectronDesktop]);

  return {
    frequencyData,
    barCount: EQ_BAR_COUNT,
  };
};