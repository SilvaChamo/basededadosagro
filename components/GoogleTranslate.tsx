"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function GoogleTranslate() {
    const pathname = usePathname();

    useEffect(() => {
        let attempts = 0;
        const maxAttempts = 10;
        let timeoutId: NodeJS.Timeout;

        const initTranslate = () => {
            // Check if google translate is fully loaded
            const isLoaded = typeof window !== 'undefined' && 
                (window as any).googleTranslateElementInit && 
                (window as any).google && 
                (window as any).google.translate && 
                typeof (window as any).google.translate.TranslateElement === 'function';

            if (isLoaded) {
                const el = document.getElementById('google_translate_element');
                if (el) {
                    // Clear previous translation widget instance to force re-render
                    el.innerHTML = '';
                    try {
                        (window as any).googleTranslateElementInit();
                    } catch (e) {
                        console.error('Error re-initializing Google Translate', e);
                    }
                }
            } else if (attempts < maxAttempts) {
                attempts++;
                timeoutId = setTimeout(initTranslate, 500);
            }
        };

        // Delay to allow dynamic content to render first
        timeoutId = setTimeout(initTranslate, 1200);

        return () => clearTimeout(timeoutId);
    }, [pathname]);

    return null;
}

