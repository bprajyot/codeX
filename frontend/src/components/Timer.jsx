import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const Timer = ({ difficulty = 'easy', onTimeUp }) => {
    const timeInSeconds = {
        easy: 5 * 60,    // 5 minutes
        medium: 20 * 60, // 20 minutes
        hard: 30 * 60,   // 30 minutes
    };

    const totalSeconds = timeInSeconds[difficulty.toLowerCase()] || timeInSeconds.easy;
    const [secondsLeft, setSecondsLeft] = useState(totalSeconds);

    useEffect(() => {
        // Reset timer when difficulty changes
        setSecondsLeft(timeInSeconds[difficulty.toLowerCase()] || timeInSeconds.easy);
    }, [difficulty]);

    useEffect(() => {
        if (secondsLeft <= 0) {
            onTimeUp?.();
            return;
        }

        const timer = setInterval(() => {
            setSecondsLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [secondsLeft, onTimeUp]);

    const formatTime = (secs) => {
        const mins = Math.floor(secs / 60).toString().padStart(2, '0');
        const secsPart = (secs % 60).toString().padStart(2, '0');
        return `${mins}:${secsPart}`;
    };

    return (
        <div className="flex items-center gap-3">
            <span className="text-white font-mono text-2xl font-bold tracking-wider">
                {formatTime(secondsLeft)}
            </span>

            {secondsLeft === 0 ? (
                <span className="text-red-400 font-bold animate-pulse text-lg">
                    Time's Up!
                </span>
            ) : (
                <span className="text-yellow-500 border-l font-mono pl-3 font-semibold flex items-center gap-2 text-lg">
                    In Progress <Clock className="w-4 h-4"/>
                </span>
            )}
        </div>
    );
};

export default Timer;