import { useState } from 'react';
import GameView from './game/GameView';
import AuthStatusBar from './components/auth/AuthStatusBar';
import RouteEditorPanel from './game/routes/RouteEditorPanel';
import RoutesPanel from './game/routes/RoutesPanel';
import { RouteMetadata } from './backend';

export type GameMode = 'drive' | 'route-creator';

function App() {
  const [gameMode, setGameMode] = useState<GameMode>('drive');
  const [showRoutesPanel, setShowRoutesPanel] = useState(false);
  const [activeRoute, setActiveRoute] = useState<RouteMetadata | null>(null);

  const handleLoadRoute = (route: RouteMetadata) => {
    setActiveRoute(route);
    setShowRoutesPanel(false);
    setGameMode('drive');
  };

  const handleClearRoute = () => {
    setActiveRoute(null);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* 3D Game View */}
      <GameView 
        gameMode={gameMode} 
        activeRoute={activeRoute}
        onClearRoute={handleClearRoute}
      />

      {/* Auth Status Bar - Top Right */}
      <div className="absolute top-4 right-4 z-20">
        <AuthStatusBar />
      </div>

      {/* Mode Toggle & Routes Button - Top Left */}
      <div className="absolute top-4 left-4 z-20 flex gap-2">
        <button
          onClick={() => setGameMode(gameMode === 'drive' ? 'route-creator' : 'drive')}
          className="px-4 py-2 rounded-lg bg-card/90 backdrop-blur-sm border border-border text-foreground font-medium hover:bg-accent/90 transition-colors shadow-lg"
        >
          {gameMode === 'drive' ? '🛠️ Route Creator' : '🚛 Drive Mode'}
        </button>
        <button
          onClick={() => setShowRoutesPanel(!showRoutesPanel)}
          className="px-4 py-2 rounded-lg bg-card/90 backdrop-blur-sm border border-border text-foreground font-medium hover:bg-accent/90 transition-colors shadow-lg"
        >
          📍 Routes
        </button>
      </div>

      {/* Route Editor Panel */}
      {gameMode === 'route-creator' && (
        <RouteEditorPanel onSwitchToDrive={() => setGameMode('drive')} />
      )}

      {/* Routes Browser Panel */}
      {showRoutesPanel && (
        <RoutesPanel 
          onClose={() => setShowRoutesPanel(false)}
          onLoadRoute={handleLoadRoute}
        />
      )}

      {/* Footer */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 text-xs text-muted-foreground/70 backdrop-blur-sm bg-card/50 px-3 py-1 rounded-full">
        © 2026. Built with ❤️ using <a href="https://caffeine.ai" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">caffeine.ai</a>
      </div>
    </div>
  );
}

export default App;

