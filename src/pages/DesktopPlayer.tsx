import { useEffect, useState } from 'react';
import { Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LiveRadioPlayer from '@/components/LiveRadioPlayer';
import TracksSection from '@/components/TracksSection';
import { useDesktopIntegration } from '@/hooks/useDesktopIntegration';
import { useTrackHistoryUpdater } from '@/hooks/useTrackHistoryUpdater';
import { RadioStreamService } from '@/utils/RadioStreamService';
import { LIVE_STREAM_URLS } from '@/constants/liveStream';
import stationLogo from '@/assets/dance-one-logo.png';

const DesktopPlayer = () => {
  const [streamTitle, setStreamTitle] = useState('Dance One Radio - Live Stream');
  const [updateStatus, setUpdateStatus] = useState('idle');
  const [updateMessage, setUpdateMessage] = useState('Update checks will appear here.');
  const { isDesktop, hideWindow, getUpdateStatus, checkForUpdates, downloadUpdate, installUpdate, onUpdateStatus } = useDesktopIntegration();

  useTrackHistoryUpdater();

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

  useEffect(() => {
    if (!isDesktop) return;

    getUpdateStatus().then(({ status, message }) => {
      setUpdateStatus(status);
      setUpdateMessage(message);
    });

    return onUpdateStatus(({ status, message }) => {
      setUpdateStatus(status);
      setUpdateMessage(message);
    });
  }, [getUpdateStatus, isDesktop, onUpdateStatus]);

  const handleUpdateAction = async () => {
    if (updateStatus === 'available') {
      const confirmed = window.confirm('An update is available. Do you want to download and install it?');
      if (!confirmed) return;
      await downloadUpdate();
      return;
    }

    if (updateStatus === 'downloaded') {
      const confirmed = window.confirm('The update is ready. Restart and install it now?');
      if (!confirmed) return;
      await installUpdate();
      return;
    }

    await checkForUpdates();
  };

  const updateButtonLabel = updateStatus === 'checking'
    ? 'Checking...'
    : updateStatus === 'available'
      ? 'Download Update'
      : updateStatus === 'downloading'
        ? 'Downloading...'
        : updateStatus === 'downloaded'
          ? 'Install Update'
          : updateStatus === 'up-to-date'
            ? 'Up To Date'
            : 'Check For Updates';

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.16),_transparent_35%),linear-gradient(180deg,_#05070d_0%,_#09111d_42%,_#05070d_100%)] text-foreground">
      <div className="border-b border-primary/20 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-5">
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
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="h-12 rounded-xl border-emerald-400/30 bg-emerald-500/10 px-4 text-sm font-medium text-emerald-300 hover:bg-emerald-500/20 hover:text-emerald-200"
                onClick={handleUpdateAction}
                disabled={updateStatus === 'checking' || updateStatus === 'downloading'}
                title="Check for app updates"
              >
                {updateButtonLabel}
              </Button>
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

      <main className="mx-auto grid max-w-6xl gap-6 px-5 py-6 xl:grid-cols-[390px_minmax(0,1fr)]">
        <section>
          <div className="rounded-[28px] border border-primary/20 bg-black/25 p-5 shadow-[0_18px_80px_rgba(0,0,0,0.35)]">
            <LiveRadioPlayer streamUrls={LIVE_STREAM_URLS} streamTitle={streamTitle} hidePopupButton={true} />
          </div>
          {isDesktop ? (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Updates:</span> {updateMessage}
            </div>
          ) : null}
        </section>

        <section className="rounded-[28px] border border-white/10 bg-black/20 px-2 shadow-[0_18px_80px_rgba(0,0,0,0.3)]">
          <TracksSection
            title="Last Played Tracks"
            subtitle="Pulled from station history so listeners can quickly revisit what just aired."
            compact={true}
          />
        </section>
      </main>
    </div>
  );
};

export default DesktopPlayer;
