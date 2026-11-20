interface MainMenuProps {
    onStart: () => void;
}

export function MainMenu({ onStart }: MainMenuProps) {
    return (
        <main className="relative w-full h-full flex items-center justify-center overflow-hidden bg-slate-950 text-white">

            {/* Elementos decorativos de fundo */}
            <div className="absolute inset-0 bg-linear-to-br from-slate-950 via-slate-900 to-cyan-950" />

            <div className="absolute w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -top-32 -left-32" />

            <div className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -bottom-32 -right-32" />

            {/* Conteúdo */}
            <div className="relative z-10 w-[90%] max-w-2xl text-center">

                <div className="mb-8">
                    <p className="text-cyan-400 tracking-[0.4em] text-sm font-semibold mb-4">
                        UMA AVENTURA DE SOBREVIVÊNCIA
                    </p>

                    <h1 className="text-5xl sm:text-7xl font-black tracking-wider">
                        CRYSTAL
                        <span className="block text-cyan-400">
                            ESCAPE
                        </span>
                    </h1>

                    <div className="w-24 h-1 bg-cyan-400 mx-auto mt-6 rounded-full" />
                </div>

                <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-lg mx-auto mb-10">
                    Explore a arena, encontre os cinco cristais e
                    alcance o portal. Mas cuidado: uma criatura
                    perigosa está à espreita!
                </p>

                <button
                    onClick={onStart}
                    className="pointer-events-auto px-12 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-lg rounded-xl shadow-lg shadow-cyan-500/20 transition-all hover:scale-105"
                >
                    JOGAR
                </button>

                {/* Instruções */}
                <div className="mt-16 border border-white/10 bg-white/5 backdrop-blur-sm rounded-2xl p-6">
                    <h2 className="text-cyan-300 font-bold tracking-widest text-sm mb-5">
                        CONTROLES
                    </h2>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <p className="text-white font-semibold mb-2">
                                Movimentação
                            </p>

                            <p className="text-slate-400 text-sm">
                                W A S D ou Setas
                            </p>
                        </div>

                        <div>
                            <p className="text-white font-semibold mb-2">
                                Objetivo
                            </p>

                            <p className="text-slate-400 text-sm">
                                Colete os cristais e escape!
                            </p>
                        </div>
                    </div>
                </div>

                <p className="text-slate-500 text-xs mt-8">
                    Prepare-se para sobreviver.
                </p>
            </div>
        </main>
    );
}
