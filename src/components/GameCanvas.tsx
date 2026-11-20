import { useEffect, useRef, useState } from 'react';

import { Game } from '../game/Game';
import type { GameUIState } from '../game/Game';

import { GameUI } from './GameUI';

const initialState: GameUIState = {
    collectedCrystals: 0,
    totalCrystals: 5,
    enemyActivated: false,
    status: 'playing',
};

export function GameCanvas() {
    const containerRef = useRef<HTMLDivElement>(null);

    const [gameState, setGameState] = useState<GameUIState>(initialState);
    const [gameKey, setGameKey] = useState(0);

    useEffect(() => {
        const container = containerRef.current;

        if (!container) return;

        const game = new Game(container, setGameState);

        game.start();

        return () => {
            game.dispose();
        };
    }, [gameKey]);

    function handleRestart() {
        setGameState(initialState);
        setGameKey((current) => current + 1);
    }

    return (
        <div className="relative w-full h-full">
            <div
                ref={containerRef}
                className="absolute inset-0"
            />

            <GameUI
                state={gameState}
                onRestart={handleRestart}
            />
        </div>
    );
}
