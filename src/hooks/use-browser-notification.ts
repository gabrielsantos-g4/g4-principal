import { useEffect, useRef } from 'react';

export function useBrowserNotification(hasUnread: boolean) {
    const originalTitle = useRef<string | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Capture initial state
        if (!originalTitle.current) originalTitle.current = document.title;

        // Cleanup function
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (originalTitle.current) document.title = originalTitle.current;
        };
    }, []);

    useEffect(() => {
        if (hasUnread) {
            let isBlue = true;

            // Pulse logic
            const pulse = () => {
                const baseTitle = originalTitle.current || 'G4 AI Agents';
                // Using Blue Circle 🔵 and White Circle ⚪️ for pulsing effect
                // This simulates the "Blue Dot" at the end of the text as requested
                document.title = `${baseTitle} ${isBlue ? '🔵' : '⚪️'}`;
                isBlue = !isBlue;
            };

            pulse(); // Initial call
            intervalRef.current = setInterval(pulse, 1000);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (originalTitle.current) document.title = originalTitle.current;
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [hasUnread]);
}
