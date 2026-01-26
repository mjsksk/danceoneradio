import { useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

export function ReadingProgressBar() {
  const [isVisible, setIsVisible] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    const checkPageHeight = () => {
      // Only show progress bar on pages with significant scroll content
      const pageHeight = document.documentElement.scrollHeight;
      const viewportHeight = window.innerHeight;
      setIsVisible(pageHeight > viewportHeight * 1.5);
    };

    checkPageHeight();
    window.addEventListener('resize', checkPageHeight);
    
    // Re-check when content might have loaded
    const timer = setTimeout(checkPageHeight, 500);
    
    return () => {
      window.removeEventListener('resize', checkPageHeight);
      clearTimeout(timer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-primary/20 z-50 origin-left"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <motion.div
        className="h-full bg-gradient-to-r from-primary via-neon-purple to-primary origin-left"
        style={{ scaleX }}
      />
    </motion.div>
  );
}
