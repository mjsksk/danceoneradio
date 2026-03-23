import { Suspense, lazy, useEffect, useState } from 'react';
import { Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DesktopUpdateActions } from '@/components/DesktopUpdateActions';
import LiveRadioPlayer from '@/components/LiveRadioPlayer';
import { useDesktopIntegration } from '@/hooks/useDesktopIntegration';
import { useTrackHistoryUpdater } from '@/hooks/useTrackHistoryUpdater';
import { RadioStreamService } from '@/utils/RadioStreamService';
import { PRIMARY_STREAM_URLS } from '@/config/streamUrls';
import stationLogo from '@/assets/dance-one-logo.png';

const TracksSection = lazy(() => import('@/components/TracksSection'));

const DesktopPlayer = () => {
  const [streamTitle, setStreamTitle] = useState('Dance One Radio - Live Stream');
  const [activeTab, setActiveTab] = useState<'player' | 'history'>('player');
  const { isDesktop, hideWindow } = useDesktopIntegration();

  useEffect(() => {
    const fetchStreamMetadata = async () => {
      try {
        const metadata = await RadioStreamService.getStreamMetadata();
        setStreamTitle(RadioStreamService.formatTitle(metadata));
      } catch (error) {
        console.error('Error fetching stream metadata:', error);
      }
    };

    fetchStreamMetadata();
    const interval = setInterval(fetchStreamMetadata, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    document.title = 'Dance One Radio';
  }, []);

  const HistoryPanel = () => {
    useTrackHistoryUpdater();

    return <TracksSection />;
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.16),_transparent_35%),linear-gradient(180deg,_#05070d_0%,_#09111d_42%,_#05070d_100%)] text-foreground">
      <div className="shrink-0 border-b border-primary/20 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/25 bg-white/5 shadow-[0_0_35px_rgba(34,211,238,0.16)]">
              <img src={stationLogo} alt="Dance One Radio" className="h-9 w-9 object-contain" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-primary/80">Windows Desktop Player</p>
              <h1 className="font-['Orbitron'] text-2xl font-semibold text-white">Dance One Radio</h1>
            </div>
          </div>
          {isDesktop ? (
            <div className="flex items-start gap-3">
              <DesktopUpdateActions />
              <Button
                variant="outline"
                className="h-12 rounded-xl border-primary/30 bg-primary/10 px-4 text-sm font-medium text-primary hover:bg-primary/20 hover:text-primary"
                onClick={hideWindow}
                title="Hide to system tray"
              >
                <Minimize2 className="mr-2 h-4 w-4" />
                Hide To Tray
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      <main className="mx-auto flex h-full w-full max-w-6xl flex-1 flex-col overflow-hidden px-5 py-4">
        <div className="mb-4 flex shrink-0 items-center gap-3">
          <Button
            variant={activeTab === 'player' ? 'default' : 'outline'}
            className={`h-11 rounded-xl px-5 ${activeTab === 'player' ? 'bg-primary text-primary-foreground' : 'border-white/15 bg-white/5 text-white hover:bg-white/10'}`}
            onClick={() => setActiveTab('player')}
          >
            Player
          </Button>
          <Button
            variant={activeTab === 'history' ? 'default' : 'outline'}
            className={`h-11 rounded-xl px-5 ${activeTab === 'history' ? 'bg-primary text-primary-foreground' : 'border-white/15 bg-white/5 text-white hover:bg-white/10'}`}
            onClick={() => setActiveTab('history')}
          >
            Last Played Tracks
          </Button>
        </div>

        {activeTab === 'player' ? (
          <section className="flex flex-1 items-center justify-center overflow-hidden">
            <div className="w-full max-w-[420px] rounded-[28px] border border-primary/20 bg-black/25 p-4 shadow-[0_18px_80px_rgba(0,0,0,0.35)]">
              <LiveRadioPlayer streamUrls={[...PRIMARY_STREAM_URLS]} streamTitle={streamTitle} hidePopupButton={true} />
            </div>
          </section>
        ) : (
          <section className="min-h-0 flex-1 overflow-auto rounded-[28px] border border-white/10 bg-black/20 px-2 shadow-[0_18px_80px_rgba(0,0,0,0.3)]">
            <Suspense fallback={<div className="py-8 text-center text-sm text-muted-foreground">Loading recent tracks...</div>}>
              <HistoryPanel />
            </Suspense>
          </section>
        )}
      </main>
    </div>
  );
};

export default DesktopPlayer;
