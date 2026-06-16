import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import { useDesktopIntegration } from '@/hooks/useDesktopIntegration';
import { useLiveEqVisualizer } from '@/hooks/useLiveEqVisualizer';
import { cn } from '@/lib/utils';

interface EpisodeEqVisualizerProps {
  isActive: boolean;
  className?: string;
  heightClassName?: string;
}

export const EpisodeEqVisualizer = ({
  isActive,
  className,
  heightClassName = 'h-20',
}: EpisodeEqVisualizerProps) => {
  const { audioRef } = useAudioPlayer();
  const { isElectronDesktop } = useDesktopIntegration();

  const { frequencyData, barCount } = useLiveEqVisualizer({
    audioRef,
    isActive,
    isElectronDesktop,
  });

  return (
    <div
      aria-hidden
      data-eq-container
      className={cn(
        'flex items-end justify-center gap-[2px] sm:gap-0.5 w-full px-2 sm:px-4',
        heightClassName,
        className,
      )}
    >
      {frequencyData.map((height, i) => (
        <div
          key={i}
          data-eq-bar
          className="rounded-full transition-none shadow-lg"
          style={{
            height: `${Math.max(12, Math.min(70, height))}px`,
            flex: '1 1 0',
            maxWidth: '4px',
            minWidth: '1px',
            backgroundColor: isActive
              ? `hsl(${(i / (barCount - 1)) * 300}, 90%, 60%)`
              : 'hsl(var(--muted))',
            boxShadow: isActive
              ? `0 0 8px hsl(${(i / (barCount - 1)) * 300}, 90%, 60%)`
              : 'none',
          }}
        />
      ))}
    </div>
  );
};

export default EpisodeEqVisualizer;
