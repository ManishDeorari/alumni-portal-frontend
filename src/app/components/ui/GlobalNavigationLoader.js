"use client";

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import LoadingOverlay from './LoadingOverlay';

export default function GlobalNavigationLoader() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isNavigating, setIsNavigating] = useState(false);

    // Stop the loader when the pathname or search params actually change (meaning navigation completed)
    useEffect(() => {
        setIsNavigating(false);
    }, [pathname, searchParams]);

    // Intercept clicks globally to start the loader
    useEffect(() => {
        const handleClick = (e) => {
            const link = e.target.closest('a');
            if (link && link.href) {
                try {
                    const url = new URL(link.href);
                    // Only trigger for internal links that go to a different path
                    if (
                        url.origin === window.location.origin && 
                        url.pathname !== window.location.pathname &&
                        !link.hasAttribute('download') &&
                        link.target !== '_blank'
                    ) {
                        setIsNavigating(true);
                    }
                } catch (err) {
                    // Ignore invalid URLs
                }
            }
        };

        // Use capture phase so we catch it before any stopPropagation
        document.addEventListener('click', handleClick, true);
        return () => document.removeEventListener('click', handleClick, true);
    }, []);

    return <LoadingOverlay isVisible={isNavigating} type="page" message="Loading Page..." />;
}
