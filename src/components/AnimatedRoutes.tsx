import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { PageTransition } from './PageTransition';
import { ProtectedRoute } from '@/components/ProtectedRoute';

import Index from '@/pages/Index';
import Shows from '@/pages/Shows';
import Gallery from '@/pages/Gallery';
import LoveParade2005 from '@/pages/LoveParade2005';
import LoveParade2006 from '@/pages/LoveParade2006';
import Downloads from '@/pages/Downloads';
import Privacy from '@/pages/Privacy';
import Love from '@/pages/Love';
import Dmca from '@/pages/Dmca';
import Contact from '@/pages/Contact';
import PlayerPage from '@/pages/PlayerPage';
import Episode389 from '@/pages/Episode389';
import Episode390 from '@/pages/Episode390';
import Episode391 from '@/pages/Episode391';
import Episode392 from '@/pages/Episode392';
import Episode393 from '@/pages/Episode393';
import Episode394 from '@/pages/Episode394';
import Episode395 from '@/pages/Episode395';
import Episode396 from '@/pages/Episode396';
import Episode397 from '@/pages/Episode397';
import Episode398 from '@/pages/Episode398';
import Episode399 from '@/pages/Episode399';
import Episode400 from '@/pages/Episode400';
import Episode401 from '@/pages/Episode401';
import Episode402 from '@/pages/Episode402';
import Episode403 from '@/pages/Episode403';
import Episode404 from '@/pages/Episode404';
import Episode405 from '@/pages/Episode405';
import News from '@/pages/News';
import NewsTopStories from '@/pages/NewsTopStories';
import NewsArtistsReleases from '@/pages/NewsArtistsReleases';
import NewsFestivalsEvents from '@/pages/NewsFestivalsEvents';
import NewsIndustryCulture from '@/pages/NewsIndustryCulture';
import About from '@/pages/About';

import DesktopPlayer from '@/pages/DesktopPlayer';
import Auth from '@/pages/Auth';
import Account from '@/pages/Account';
import ResetPassword from '@/pages/ResetPassword';
import Merch from '@/pages/Merch';
import NotFound from '@/pages/NotFound';

export function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
        <Route path="/shows" element={<PageTransition><Shows /></PageTransition>} />
        <Route path="/gallery" element={<PageTransition><Gallery /></PageTransition>} />
        <Route path="/gallery/love-parade-2005" element={<PageTransition><LoveParade2005 /></PageTransition>} />
        <Route path="/gallery/love-parade-2006" element={<PageTransition><LoveParade2006 /></PageTransition>} />
        <Route path="/downloads" element={<PageTransition><Downloads /></PageTransition>} />
        <Route path="/privacy" element={<PageTransition><Privacy /></PageTransition>} />
        <Route path="/love" element={<PageTransition><Love /></PageTransition>} />
        <Route path="/dmca" element={<PageTransition><Dmca /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
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
        <Route path="/news" element={<PageTransition><News /></PageTransition>} />
        <Route path="/news/top-stories" element={<PageTransition><NewsTopStories /></PageTransition>} />
        <Route path="/news/artists-releases" element={<PageTransition><NewsArtistsReleases /></PageTransition>} />
        <Route path="/news/festivals-events" element={<PageTransition><NewsFestivalsEvents /></PageTransition>} />
        <Route path="/news/industry-culture" element={<PageTransition><NewsIndustryCulture /></PageTransition>} />
        <Route path="/admin" element={<Navigate to="/account" replace />} />
        <Route path="/desktop" element={<PageTransition><DesktopPlayer /></PageTransition>} />
        <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
        <Route path="/account" element={<PageTransition><ProtectedRoute><Account /></ProtectedRoute></PageTransition>} />
        <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
        <Route path="/merch" element={<PageTransition><Merch /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}
