import type { GameUIState } from '../game/Game';

interface GameUIProps {
    state: GameUIState;
    onRestart: () => void;
}

export function GameUI({ state, onRestart }: GameUIProps) {
    const progress = (state.collectedCrystals / state.totalCrystals) * 100;

    if (state.status === 'gameover') {
        return (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/65 backdrop-blur-sm">
                <div className="w-[90%] max-w-md bg-slate-950 border border-red-500/40 rounded-2xl p-8 text-center shadow-2xl">
                    <div className="text-6xl mb-5">🦖</div>

                    <h1 className="text-4xl font-bold text-red-400 mb-3">
                        GAME OVER
                    </h1>

                    <p className="text-slate-300 mb-8">
                        O dinossauro alcançou você!
                    </p>

                    <button
                        onClick={onRestart}
                        className="w-full bg-red-500 hover:bg-red-400 text-white font-bold py-3 rounded-lg transition-colors pointer-events-auto"
                    >
                        Jogar novamente
                    </button>
                </div>
            </div>
        );
    }

    if (state.status === 'victory') {
        return (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/65 backdrop-blur-sm">
                <div className="w-[90%] max-w-md bg-slate-950 border border-cyan-400/40 rounded-2xl p-8 text-center shadow-2xl">
                    <div className="text-6xl mb-5">🏆</div>

                    <h1 className="text-4xl font-bold text-cyan-300 mb-3">
                        VITÓRIA!
                    </h1>

                    <p className="text-slate-300 mb-8">
                        Você conseguiu escapar da arena!
                    </p>

                    <button
                        onClick={onRestart}
                        className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 rounded-lg transition-colors pointer-events-auto"
                    >
                        Jogar novamente
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="absolute inset-0 pointer-events-none p-6">
            {/* Cabeçalho */}
            <div className="flex justify-between items-start">
                <div className="bg-slate-950/75 backdrop-blur-sm border border-white/10 rounded-xl px-5 py-3">
                    <h1 className="text-white font-bold tracking-widest text-lg">
                        CRYSTAL ESCAPE
                    </h1>

                    <p className="text-slate-400 text-xs">
                        Encontre os cristais e escape!
                    </p>
                </div>

                {/* Contador de cristais */}
                <div className="bg-slate-950/75 backdrop-blur-sm border border-white/10 rounded-xl px-5 py-3 min-w-48">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-slate-300 text-sm font-medium">
                            Cristais
                        </span>

                        <span className="text-cyan-300 font-bold text-xl">
                            {state.collectedCrystals}/{state.totalCrystals}
                        </span>
                    </div>

                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-cyan-400 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Mensagens */}
            <div className="absolute top-28 left-1/2 -translate-x-1/2">
                {state.collectedCrystals === state.totalCrystals && (
                    <div className="bg-cyan-950/80 border border-cyan-400/40 rounded-lg px-5 py-3 text-cyan-200 text-sm font-semibold">
                        Todos os cristais encontrados! Alcance o portal!
                    </div>
                )}

                {state.enemyActivated && state.collectedCrystals < state.totalCrystals && (
                    <div className="bg-red-950/80 border border-red-400/40 rounded-lg px-5 py-3 text-red-200 text-sm font-semibold">
                        Uma criatura despertou! Cuidado!
                    </div>
                )}

                {!state.enemyActivated && (
                    <div className="bg-slate-950/70 border border-white/10 rounded-lg px-5 py-3 text-white text-sm">
                        Explore a arena e encontre os cristais.
                    </div>
                )}
            </div>

            {/* Controles */}
            <div className="absolute bottom-6 left-6 bg-slate-950/75 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3">
                <p className="text-slate-300 text-xs font-semibold mb-2">
                    CONTROLES
                </p>

                <p className="text-slate-400 text-xs">
                    W A S D — Movimentar
                </p>
            </div>
        </div>
    );
}
