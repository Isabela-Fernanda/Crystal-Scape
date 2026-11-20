import type { GameUIState } from '../game/Game';

interface GameUIProps {
    state: GameUIState;
}

export function GameUI({ state }: GameUIProps) {
    const progress = (state.collectedCrystals / state.totalCrystals) * 100;

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

            {/* Mensagem de estado */}
            <div className="absolute top-28 left-1/2 -translate-x-1/2">
                {state.enemyActivated && state.status === 'playing' && (
                    <div className="bg-red-950/80 border border-red-400/40 rounded-lg px-5 py-3 text-red-200 text-sm font-semibold">
                        Uma criatura despertou! Cuidado!
                    </div>
                )}

                {!state.enemyActivated && state.status === 'playing' && (
                    <div className="bg-slate-950/70 border border-white/10 rounded-lg px-5 py-3 text-white text-sm">
                        Explore a arena e encontre os cristais.
                    </div>
                )}

                {state.collectedCrystals === state.totalCrystals && state.status === 'playing' && (
                    <div className="bg-cyan-950/80 border border-cyan-400/40 rounded-lg px-5 py-3 text-cyan-200 text-sm font-semibold">
                        Todos os cristais encontrados! Alcance o portal!
                    </div>
                )}
            </div>

            {/* Instruções */}
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
