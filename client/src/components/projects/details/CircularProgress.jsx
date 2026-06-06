import React from 'react';

const CircularProgress = ({ progress }) => {
    const radius = 60,
        stroke = 10;
    const normalizedRadius = radius - stroke;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative flex h-32 w-32 items-center justify-center sm:h-40 sm:w-40">
            <svg
                height={radius * 2}
                width={radius * 2}
                className="-rotate-90 transform"
            >
                <circle
                    stroke="currentColor"
                    fill="transparent"
                    strokeWidth={stroke}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    className="text-border/40"
                />
                <circle
                    stroke="url(#progressGradient)"
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={`${circumference} ${circumference}`}
                    style={{ strokeDashoffset }}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    className="transition-all duration-1000 ease-in-out"
                />
                <defs>
                    <linearGradient
                        id="progressGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                    >
                        <stop offset="0%" stopColor="rgb(var(--primary))" />
                        <stop
                            offset="100%"
                            stopColor="rgb(var(--primary) / 0.5)"
                        />
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-black tracking-tighter text-foreground sm:text-3xl">
                    {progress}%
                </span>
                <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/60">
                    Done
                </span>
            </div>
        </div>
    );
};

export default CircularProgress;
