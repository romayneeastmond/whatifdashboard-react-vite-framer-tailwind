import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const usePageTracking = () => {
    const location = useLocation();

    useEffect(() => {
        const sendPageView = async () => {
            try {
                await fetch('/api/track', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: document.title,
                        url: window.location.href,
                        referrer: document.referrer,
                    }),
                });
            } catch {
                // non-critical — silently ignore tracking failures
            }
        };

        sendPageView();
    }, [location.pathname]);
};
