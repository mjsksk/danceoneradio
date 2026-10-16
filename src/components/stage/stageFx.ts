// Written without JSX on purpose: the dev-mode component tagger adds data-* props to
// JSX elements, which drei/postprocessing forward onto three.js objects and crash.
import { createElement as h } from 'react';
import { Environment, Lightformer, MeshDistortMaterial, Sparkles, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';

export const StageEnvironment = () =>
  h(Environment, { resolution: 64 },
    h(Lightformer, { intensity: 2, position: [0, 6, 0], scale: [10, 10, 1], rotation: [Math.PI / 2, 0, 0] }),
    h(Lightformer, { intensity: 1.5, color: '#ff2e88', position: [-8, 2, 0], rotation: [0, Math.PI / 2, 0], scale: [20, 2, 1] }),
    h(Lightformer, { intensity: 1.5, color: '#22d3ee', position: [8, 2, 0], rotation: [0, -Math.PI / 2, 0], scale: [20, 2, 1] }),
  );

export const StageSky = () => [
  h(Stars, { key: 's', radius: 60, depth: 30, count: 2500, factor: 3, fade: true, speed: 0.6 }),
  h(Sparkles, { key: 'p', count: 120, scale: [24, 10, 24], position: [0, 5, 0], size: 3, speed: 0.5, color: '#e9d5ff' }),
];

export const StageDistortMaterial = () => h(MeshDistortMaterial, { speed: 3, distort: 0.3, roughness: 0.1, metalness: 0.4 });

export const StagePost = () =>
  h(EffectComposer, {
    multisampling: 0,
    children: [
      h(Bloom, { key: 'b', intensity: 1.4, luminanceThreshold: 0.25, luminanceSmoothing: 0.3, mipmapBlur: true }),
      h(Vignette, { key: 'v', offset: 0.3, darkness: 0.7 }),
    ],
  });
