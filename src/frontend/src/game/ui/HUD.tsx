import { useState, useEffect } from 'react';
import { Volume2, VolumeX, Camera } from 'lucide-react';
import { TruckHandle } from '../vehicle/Truck';
import { WalkerHandle } from '../vehicle/Walker';
import { GameMode } from '../../App';
import { RouteMetadata } from '../../backend';

interface HUDProps {
  truckRef: React.RefObject<TruckHandle>;
  walkerRef: React.RefObject<WalkerHandle>;
  gameMode: GameMode;
  activeRoute: RouteMetadata | null;
  currentWaypointIndex: number;
  distanceToNext: number;
  onClearRoute: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  cameraMode: 'chase' | 'cab';
  onToggleCamera: () => void;
}

export default function HUD({ 
  truckRef,
  walkerRef,
  gameMode, 
  activeRoute, 
  currentWaypointIndex, 
  distanceToNext,
  onClearRoute,
  isMuted,
  onToggleMute,
  cameraMode,
  onToggleCamera
}: HUDProps) {
  const [speed, setSpeed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (gameMode === 'drive' && truckRef.current) {
        const speedKmh = Math.abs(truckRef.current.speed * 3.6);
        setSpeed(Math.round(speedKmh));
      } else if (gameMode === 'walk' && walkerRef.current) {
        const speedKmh = Math.abs(walkerRef.current.speed * 3.6);
        setSpeed(Math.round(speedKmh));
      } else {
        setSpeed(0);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [truckRef, walkerRef, gameMode]);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Speed Display - Bottom Left */}
      {(gameMode === 'drive' || gameMode === 'walk') && (
        <div className="absolute bottom-20 left-6 pointer-events-auto">
          <div className="bg-card/90 backdrop-blur-sm border-2 border-primary/50 rounded-lg p-4 shadow-xl">
            <div className="text-5xl font-bold text-primary tabular-nums">
              {speed}
            </div>
            <div className="text-sm text-muted-foreground font-medium">km/h</div>
          </div>
        </div>
      )}

      {/* Audio Control - Bottom Left (below speed) */}
      {gameMode === 'drive' && (
        <div className="absolute bottom-6 left-6 pointer-events-auto">
          <button
            onClick={onToggleMute}
            className="bg-card/90 backdrop-blur-sm border border-border rounded-lg px-4 py-2 shadow-lg hover:bg-card transition-colors flex items-center gap-2"
            title={isMuted ? 'Unmute audio' : 'Mute audio'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-muted-foreground" />
            ) : (
              <Volume2 className="w-4 h-4 text-primary" />
            )}
            <span className="text-sm text-foreground">
              Audio: {isMuted ? 'Muted' : 'On'}
            </span>
          </button>
        </div>
      )}

      {/* Camera Toggle - Bottom Right */}
      {gameMode === 'drive' && (
        <div className="absolute bottom-6 right-6 pointer-events-auto">
          <button
            onClick={onToggleCamera}
            className="bg-card/90 backdrop-blur-sm border border-border rounded-lg px-4 py-2 shadow-lg hover:bg-card transition-colors flex items-center gap-2"
            title="Toggle camera view"
          >
            <Camera className="w-4 h-4 text-primary" />
            <span className="text-sm text-foreground">
              {cameraMode === 'chase' ? 'Chase View' : 'Cab View'}
            </span>
          </button>
        </div>
      )}

      {/* Controls Help - Bottom Center */}
      {gameMode === 'drive' && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto">
          <div className="bg-card/80 backdrop-blur-sm border border-border rounded-lg px-4 py-2 shadow-lg">
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span><kbd className="px-2 py-1 bg-muted rounded text-foreground">W/↑</kbd> Forward</span>
              <span><kbd className="px-2 py-1 bg-muted rounded text-foreground">S/↓</kbd> Reverse</span>
              <span><kbd className="px-2 py-1 bg-muted rounded text-foreground">A/←</kbd> Left</span>
              <span><kbd className="px-2 py-1 bg-muted rounded text-foreground">D/→</kbd> Right</span>
            </div>
          </div>
        </div>
      )}

      {/* Walk Mode Controls Help */}
      {gameMode === 'walk' && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto">
          <div className="bg-card/80 backdrop-blur-sm border border-border rounded-lg px-4 py-2 shadow-lg">
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span><kbd className="px-2 py-1 bg-muted rounded text-foreground">W/↑</kbd> Forward</span>
              <span><kbd className="px-2 py-1 bg-muted rounded text-foreground">S/↓</kbd> Backward</span>
              <span><kbd className="px-2 py-1 bg-muted rounded text-foreground">A/←</kbd> Left</span>
              <span><kbd className="px-2 py-1 bg-muted rounded text-foreground">D/→</kbd> Right</span>
            </div>
          </div>
        </div>
      )}

      {/* Route Creator Help */}
      {gameMode === 'route-creator' && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto">
          <div className="bg-card/80 backdrop-blur-sm border border-border rounded-lg px-4 py-2 shadow-lg">
            <div className="text-sm text-muted-foreground">
              Click on the ground to place waypoints
            </div>
          </div>
        </div>
      )}

      {/* Active Route Info - Top Center */}
      {gameMode === 'drive' && activeRoute && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 pointer-events-auto">
          <div className="bg-card/90 backdrop-blur-sm border border-primary/50 rounded-lg px-6 py-3 shadow-xl min-w-[300px]">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="text-sm font-medium text-primary">{activeRoute.name}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Waypoint {currentWaypointIndex + 1} / {activeRoute.waypoints.length}
                </div>
                {distanceToNext > 0 && (
                  <div className="text-xs text-muted-foreground">
                    Distance: {distanceToNext.toFixed(0)}m
                  </div>
                )}
              </div>
              <button
                onClick={onClearRoute}
                className="px-3 py-1 text-xs bg-destructive/20 hover:bg-destructive/30 text-destructive rounded transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
