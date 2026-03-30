import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

const EQ_BAR_COUNT = 64;
const EQ_MIN_HEIGHT = 12;
const EQ_MAX_HEIGHT = 70;
const ANALYSER_FFT_SIZE = 256;
const SYNTHETIC_BIN_COUNT = ANALYSER_FFT_SIZE / 2;

const createIdleFrequencyData = (count = EQ_BAR_COUNT) => new Array(count).fill(EQ_MIN_HEIGHT);

const clampNormalized = (value: number) => Math.max(0, Math.min(1, value));

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

const populateSyntheticFrequencyBins = (time: number, frequencyBins: Uint8Array) => {
  const kick = Math.pow((Math.sin(time * 2.4) + 1) / 2, 1.6);
  const bassDrive = 0.16 + kick * 0.42;
  const lowMidDrive = 0.14 + ((Math.sin(time * 1.8 + 0.8) + 1) / 2) * 0.22;
  const upperMidDrive = 0.1 + ((Math.sin(time * 2.7 + 1.5) + 1) / 2) * 0.14;
  const airDrive = 0.04 + ((Math.sin(time * 4.1 + 0.5) + 1) / 2) * 0.07;
  const sweepCenter = 0.36 + ((Math.sin(time * 0.85) + 1) / 2) * 0.24;

  for (let index = 0; index < frequencyBins.length; index += 1) {
    const position = index / (frequencyBins.length - 1);
    const bassWeight = Math.exp(-position * 4.8);
    const lowMidWeight = Math.exp(-Math.pow((position - 0.26) / 0.18, 2));
    const upperMidWeight = Math.exp(-Math.pow((position - 0.54) / 0.16, 2));
    const airWeight = Math.exp(-Math.pow((position - 0.8) / 0.12, 2));
    const sweepWeight = Math.exp(-Math.pow((position - sweepCenter) / 0.11, 2));
    const shimmer = ((Math.sin(time * 6.2 - position * 18) + 1) / 2) * 0.03;
    const texture = ((Math.sin(time * 3.8 + index * 0.42) + 1) / 2) * 0.025;

    const energy = clampNormalized(
      0.02 +
        bassDrive * bassWeight +
        lowMidDrive * lowMidWeight * 0.72 +
        upperMidDrive * upperMidWeight * 0.54 +
        airDrive * airWeight * 0.4 +
        sweepWeight * 0.12 +
        shimmer +
        texture,
    );

    frequencyBins[index] = Math.round(energy * 255);
  }
};

const supportsEqFallback = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
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

  useEffect(() => {
    const cancelFrame = () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };

    if (!isActive) {
      syntheticTimeRef.current = 0;
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

    if (isElectronDesktop || supportsEqFallback()) {
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
        startSyntheticAnimation();
      }
    };

    void setupAnalyser();

    return () => {
      isCancelled = true;
      cancelFrame();
    };
  }, [audioRef, isActive, isElectronDesktop]);

  return {
    frequencyData,
    barCount: EQ_BAR_COUNT,
    dataSource,
  };
};