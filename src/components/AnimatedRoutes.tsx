import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { PageTransition } from './PageTransition';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AdminRoute } from '@/components/AdminRoute';

import { lazy, Suspense } from 'react';

import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';

// Lazy-load all non-critical pages
const Shows = lazy(() => import('@/pages/Shows'));
const Gallery = lazy(() => import('@/pages/Gallery'));
const LoveParade2005 = lazy(() => import('@/pages/LoveParade2005'));
const LoveParade2006 = lazy(() => import('@/pages/LoveParade2006'));
const Downloads = lazy(() => import('@/pages/Downloads'));
const Privacy = lazy(() => import('@/pages/Privacy'));
const Love = lazy(() => import('@/pages/Love'));
const Dmca = lazy(() => import('@/pages/Dmca'));
const Contact = lazy(() => import('@/pages/Contact'));
const PlayerPage = lazy(() => import('@/pages/PlayerPage'));
const Episode389 = lazy(() => import('@/pages/Episode389'));
const Episode390 = lazy(() => import('@/pages/Episode390'));
const Episode391 = lazy(() => import('@/pages/Episode391'));
const Episode392 = lazy(() => import('@/pages/Episode392'));
const Episode393 = lazy(() => import('@/pages/Episode393'));
const Episode394 = lazy(() => import('@/pages/Episode394'));
const Episode395 = lazy(() => import('@/pages/Episode395'));
const Episode396 = lazy(() => import('@/pages/Episode396'));
const Episode397 = lazy(() => import('@/pages/Episode397'));
const Episode398 = lazy(() => import('@/pages/Episode398'));
const Episode399 = lazy(() => import('@/pages/Episode399'));
const Episode400 = lazy(() => import('@/pages/Episode400'));
const Episode401 = lazy(() => import('@/pages/Episode401'));
const Episode402 = lazy(() => import('@/pages/Episode402'));
const Episode403 = lazy(() => import('@/pages/Episode403'));
const Episode404 = lazy(() => import('@/pages/Episode404'));
const Episode405 = lazy(() => import('@/pages/Episode405'));
const Episode406 = lazy(() => import('@/pages/Episode406'));
const Episode407 = lazy(() => import('@/pages/Episode407'));
const Episode408 = lazy(() => import('@/pages/Episode408'));
const Episode409 = lazy(() => import('@/pages/Episode409'));
const Episode410 = lazy(() => import('@/pages/Episode410'));
const Episode411 = lazy(() => import('@/pages/Episode411'));
const News = lazy(() => import('@/pages/News'));
const NewsTopStories = lazy(() => import('@/pages/NewsTopStories'));
const NewsArtistsReleases = lazy(() => import('@/pages/NewsArtistsReleases'));
const NewsFestivalsEvents = lazy(() => import('@/pages/NewsFestivalsEvents'));
const NewsIndustryCulture = lazy(() => import('@/pages/NewsIndustryCulture'));
const About = lazy(() => import('@/pages/About'));
const Advertise = lazy(() => import('@/pages/Advertise'));
const DesktopPlayer = lazy(() => import('@/pages/DesktopPlayer'));
const Auth = lazy(() => import('@/pages/Auth'));
const Account = lazy(() => import('@/pages/Account'));
const Admin = lazy(() => import('@/pages/Admin'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const Merch = lazy(() => import('@/pages/Merch'));
const Tracks = lazy(() => import('@/pages/Tracks'));
const TrackPage = lazy(() => import('@/pages/TrackPage'));
const Wh0PlaysSession222 = lazy(() => import('@/pages/Wh0PlaysSession222'));
const Wh0PlaysSession223 = lazy(() => import('@/pages/Wh0PlaysSession223'));
const Wh0PlaysSession224 = lazy(() => import('@/pages/Wh0PlaysSession224'));
const Wh0PlaysSession225 = lazy(() => import('@/pages/Wh0PlaysSession225'));
const Wh0PlaysSession226 = lazy(() => import('@/pages/Wh0PlaysSession226'));
const SongRequests = lazy(() => import('@/pages/SongRequests'));

export function AnimatedRoutes() {
  const location = useLocation();

  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
        <Route path="/shows" element={<PageTransition><Shows /></PageTransition>} />
        <Route path="/gallery" element={<PageTransition><Gallery /></PageTransition>} />
        <Route path="/gallery/love-parade-2005" element={<PageTransition><LoveParade2005 /></PageTransition>} />
        <Route path="/gallery/love-parade-2006" element={<PageTransition><LoveParade2006 /></PageTransition>} />
        <Route path="/apps" element={<PageTransition><Downloads /></PageTransition>} />
        <Route path="/downloads" element={<PageTransition><Downloads /></PageTransition>} />
        <Route path="/privacy" element={<PageTransition><Privacy /></PageTransition>} />
        <Route path="/love" element={<PageTransition><Love /></PageTransition>} />
        <Route path="/dmca" element={<PageTransition><Dmca /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        <Route path="/advertise" element={<PageTransition><Advertise /></PageTransition>} />
        <Route path="/player" element={<PageTransition><PlayerPage /></PageTransition>} />
        <Route path="/episode/389" element={<PageTransition><Episode389 /></PageTransition>} />
        <Route path="/episode/390" element={<PageTransition><Episode390 /></PageTransition>} />
        <Route path="/episode/391" element={<PageTransition><Episode391 /></PageTransition>} />
        <Route path="/episode/392" element={<PageTransition><Episode392 /></PageTransition>} />
        <Route path="/episode/393" element={<PageTransition><Episode393 /></PageTransition>} />
        <Route path="/episode/394" element={<PageTransition><Episode394 /></PageTransition>} />
        <Route path="/episode/395" element={<PageTransition><Episode395 /></PageTransition>} />
        <Route path="/episode/396" element={<PageTransition><Episode396 /></PageTransition>} />
        <Route path="/episode/397" element={<PageTransition><Episode397 /></PageTransition>} />
        <Route path="/episode/398" element={<PageTransition><Episode398 /></PageTransition>} />
        <Route path="/episode/399" element={<PageTransition><Episode399 /></PageTransition>} />
        <Route path="/episode/400" element={<PageTransition><Episode400 /></PageTransition>} />
        <Route path="/episode/401" element={<PageTransition><Episode401 /></PageTransition>} />
        <Route path="/episode/402" element={<PageTransition><Episode402 /></PageTransition>} />
        <Route path="/episode/403" element={<PageTransition><Episode403 /></PageTransition>} />
        <Route path="/episode/404" element={<PageTransition><Episode404 /></PageTransition>} />
        <Route path="/episode/405" element={<PageTransition><Episode405 /></PageTransition>} />
        <Route path="/episode/406" element={<PageTransition><Episode406 /></PageTransition>} />
        <Route path="/episode/407" element={<PageTransition><Episode407 /></PageTransition>} />
        <Route path="/episode/408" element={<PageTransition><Episode408 /></PageTransition>} />
        <Route path="/episode/409" element={<PageTransition><Episode409 /></PageTransition>} />
        <Route path="/episode/410" element={<PageTransition><Episode410 /></PageTransition>} />
        <Route path="/episode/411" element={<PageTransition><Episode411 /></PageTransition>} />
        <Route path="/news" element={<PageTransition><News /></PageTransition>} />
        <Route path="/news/top-stories" element={<PageTransition><NewsTopStories /></PageTransition>} />
        <Route path="/news/artists-releases" element={<PageTransition><NewsArtistsReleases /></PageTransition>} />
        <Route path="/news/festivals-events" element={<PageTransition><NewsFestivalsEvents /></PageTransition>} />
        <Route path="/news/industry-culture" element={<PageTransition><NewsIndustryCulture /></PageTransition>} />
        <Route path="/admin" element={<PageTransition><AdminRoute><Admin /></AdminRoute></PageTransition>} />
        <Route path="/desktop" element={<PageTransition><DesktopPlayer /></PageTransition>} />
        <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
        <Route path="/account" element={<PageTransition><ProtectedRoute><Account /></ProtectedRoute></PageTransition>} />
        <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
        <Route path="/merch" element={<PageTransition><Merch /></PageTransition>} />
        <Route path="/tracks" element={<PageTransition><Tracks /></PageTransition>} />
        <Route path="/track/:slug" element={<PageTransition><TrackPage /></PageTransition>} />
        <Route path="/show/wh0-plays-sessions/222" element={<PageTransition><Wh0PlaysSession222 /></PageTransition>} />
        <Route path="/show/wh0-plays-sessions/223" element={<PageTransition><Wh0PlaysSession223 /></PageTransition>} />
        <Route path="/show/wh0-plays-sessions/224" element={<PageTransition><Wh0PlaysSession224 /></PageTransition>} />
        <Route path="/show/wh0-plays-sessions/225" element={<PageTransition><Wh0PlaysSession225 /></PageTransition>} />
        <Route path="/show/wh0-plays-sessions/226" element={<PageTransition><Wh0PlaysSession226 /></PageTransition>} />
        <Route path="/requests" element={<PageTransition><SongRequests /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
    </Suspense>
  );
}
