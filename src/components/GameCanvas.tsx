import { useEffect, useRef, useState } from 'react';

import { Game } from '../game/Game';
import type { GameUIState } from '../game/Game';

import { GameUI } from './GameUI';

export function GameCanvas() {
    const containerRef = useRef<HTMLDivElement>(null);

    const [gameState, setGameState] = useState<GameUIState>({
        collectedCrystals: 0,
        totalCrystals: 5,
        enemyActivated: false,
        status: 'playing',
    });

    useEffect(() => {
        const container = containerRef.current;

        if (!container) return;

        const game = new Game(container, setGameState);

        game.start();

        return () => {
            game.dispose();
        };
    }, []);

    return (
        <div className="relative w-full h-full">
            <div
                ref={containerRef}
                className="absolute inset-0"
            />

            <GameUI state={gameState} />
        </div>
    );
}
