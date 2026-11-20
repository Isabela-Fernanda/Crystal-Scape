import { useState } from 'react';

import { GameCanvas } from './components/GameCanvas';
import { MainMenu } from './components/MainMenu';

function App() {
    const [hasStarted, setHasStarted] = useState(false);

    return (
        <main className="w-screen h-screen overflow-hidden bg-slate-950">
            {hasStarted ? (
                <GameCanvas />
            ) : (
                <MainMenu onStart={() => setHasStarted(true)} />
            )}
        </main>
    );
}

export default App;
