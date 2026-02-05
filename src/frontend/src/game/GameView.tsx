import { useRef, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sky, Stats } from '@react-three/drei';
import World from './world/World';
import Truck from './vehicle/Truck';
import Walker from './vehicle/Walker';
import FollowCamera from './camera/FollowCamera';
import HUD from './ui/HUD';
import RouteVisualizer from './routes/RouteVisualizer';
import NpcTraffic from './traffic/NpcTraffic';
import { GameMode, VehicleVariant } from '../App';
import { RouteMetadata, Coordinates } from '../backend';
import { useRouteCreator } from './routes/RouteCreatorState';
import { useActiveRoute } from './routes/ActiveRouteState';
import { useDrivingAudio } from './audio/useDrivingAudio';

interface GameViewProps {
  gameMode: GameMode;
  activeRoute: RouteMetadata | null;
  onClearRoute: () => void;
  vehicleVariant: VehicleVariant;
}

export default function GameView({ gameMode, activeRoute, onClearRoute, vehicleVariant }: GameViewProps) {
  const truckRef = useRef<any>(null);
  const walkerRef = useRef<any>(null);
  const { waypoints, addWaypoint } = useRouteCreator();
  const { loadRoute, currentWaypointIndex, distanceToNext } = useActiveRoute();
  const [isMuted, setIsMuted] = useState(false);
  const [cameraMode, setCameraMode] = useState<'chase' | 'cab'>('chase');

  // Get truck state for audio
  const speed = truckRef.current?.speed || 0;
  const isAccelerating = truckRef.current?.isAccelerating || false;

  // Initialize driving audio (only active in drive mode)
  useDrivingAudio({
    speed,
    isAccelerating,
    isEnabled: gameMode === 'drive',
    isMuted,
  });

  useEffect(() => {
    if (activeRoute) {
      loadRoute(activeRoute);
    }
  }, [activeRoute, loadRoute]);

  const handleGroundClick = (point: [number, number, number]) => {
    if (gameMode === 'route-creator') {
      addWaypoint(point);
    }
  };

  const handleToggleMute = () => {
    setIsMuted(prev => !prev);
  };

  const handleToggleCamera = () => {
    setCameraMode(prev => prev === 'chase' ? 'cab' : 'chase');
  };

  // Convert WaypointDraft[] to Coordinates[]
  const waypointCoordinates: Coordinates[] = waypoints.map(wp => ({
    x: wp.coordinates[0],
    y: wp.coordinates[1],
    z: wp.coordinates[2],
  }));

  // Get active target for camera
  const activeTarget = gameMode === 'walk' ? walkerRef : truckRef;
  const playerPosition = activeTarget.current?.position;

  return (
    <>
      <Canvas
        shadows
        camera={{ position: [0, 5, 10], fov: 60 }}
        gl={{ antialias: true }}
      >
        <Sky sunPosition={[100, 20, 100]} />
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[50, 50, 25]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={200}
          shadow-camera-left={-50}
          shadow-camera-right={50}
          shadow-camera-top={50}
          shadow-camera-bottom={-50}
        />
        
        <World onGroundClick={handleGroundClick} playerPosition={playerPosition} />
        
        {gameMode === 'walk' ? (
          <Walker ref={walkerRef} />
        ) : (
          <Truck ref={truckRef} gameMode={gameMode} vehicleVariant={vehicleVariant} />
        )}
        
        <FollowCamera target={activeTarget} gameMode={gameMode} cameraMode={cameraMode} />
        
        {/* NPC Traffic */}
        {gameMode === 'drive' && <NpcTraffic playerTruckRef={truckRef} />}
        
        {/* Route visualization */}
        {gameMode === 'route-creator' && waypoints.length > 0 && (
          <RouteVisualizer waypoints={waypointCoordinates} isEditing={true} />
        )}
        {gameMode === 'drive' && activeRoute && (
          <RouteVisualizer 
            waypoints={activeRoute.waypoints.map(w => w.coordinates)} 
            isEditing={false}
            currentWaypointIndex={currentWaypointIndex}
          />
        )}

        {/* Performance stats in dev */}
        {import.meta.env.DEV && <Stats />}
      </Canvas>

      <HUD 
        truckRef={truckRef}
        walkerRef={walkerRef}
        gameMode={gameMode}
        activeRoute={activeRoute}
        currentWaypointIndex={currentWaypointIndex}
        distanceToNext={distanceToNext}
        onClearRoute={onClearRoute}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        cameraMode={cameraMode}
        onToggleCamera={handleToggleCamera}
      />
    </>
  );
}
