'use client';

import { useEffect, useState } from 'react';
import { getAppZoom } from './appScale';

export function useFitScale(designWidth: number, designHeight: number, margin = 40): number {
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const update = () => {
            const appZoom = getAppZoom(window.innerWidth);
            const next = Math.min(
                1,
                (window.innerWidth / appZoom - margin) / designWidth,
                (window.innerHeight / appZoom - margin) / designHeight,
            );
            setScale(Math.max(next, 0.1));
        };

        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, [designWidth, designHeight, margin]);

    return scale;
}
