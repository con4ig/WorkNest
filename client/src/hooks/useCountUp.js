import { useState, useEffect } from 'react';

export const useCountUp = (endValue, duration = 1500) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const frameRate = 1000 / 60;
        const totalFrames = Math.round(duration / frameRate);
        let frame = 0;
        const counter = setInterval(() => {
            frame++;
            const progress = frame / totalFrames;
            const currentCount = Math.round(
                endValue * (1 - Math.pow(1 - progress, 3)),
            );

            if (frame === totalFrames) {
                clearInterval(counter);
                setCount(endValue);
            } else {
                setCount(currentCount);
            }
        }, frameRate);

        return () => clearInterval(counter);
    }, [endValue, duration]);

    return count;
};
