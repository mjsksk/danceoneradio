import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SUPABASE_URL = "https://upbwlnpycrbhxahjztrf.supabase.co";

export const useVisitorTracking = () => {
  const location = useLocation();

  useEffect(() => {
    const key = `visited_${location.pathname}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");

    fetch(`${SUPABASE_URL}/functions/v1/track-visit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page_path: location.pathname }),
    }).catch(() => {
      // silently fail - visitor tracking is non-critical
    });
  }, [location.pathname]);
};
