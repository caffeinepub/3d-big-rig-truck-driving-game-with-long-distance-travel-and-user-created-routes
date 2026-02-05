import { useRef, useMemo } from 'react';
import { Mesh, Vector3, RepeatWrapping } from 'three';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { ReactElement } from 'react';
import PowerLines from './PowerLines';
import HighwayAndBridge from './HighwayAndBridge';
import GasStop from './GasStop';
import InfiniteRoad from './InfiniteRoad';
import ConstructionEvents from './ConstructionEvents';
import PowerStations from './PowerStations';
import CityClusters from './CityClusters';
import TruckStop from './TruckStop';

interface WorldProps {
  onGroundClick?: (point: [number, number, number]) => void;
  playerPosition?: Vector3;
}

export default function World({ onGroundClick, playerPosition }: WorldProps) {
  const groundRef = useRef<Mesh>(null);

  // Load PBR textures for ground
  const [groundAlbedo, groundNormal] = useLoader(THREE.TextureLoader, [
    '/assets/generated/ground-albedo.dim_1024x1024.png',
    '/assets/generated/ground-normal.dim_1024x1024.png',
  ]);

  // Configure texture wrapping and repeat for natural tiling
  useMemo(() => {
    [groundAlbedo, groundNormal].forEach(texture => {
      texture.wrapS = texture.wrapT = RepeatWrapping;
      texture.repeat.set(50, 50);
      texture.anisotropy = 16;
    });
  }, [groundAlbedo, groundNormal]);

  const handleClick = (event: any) => {
    event.stopPropagation();
    if (onGroundClick && event.point) {
      const point = event.point as Vector3;
      onGroundClick([point.x, point.y, point.z]);
    }
  };

  return (
    <group>
      {/* Infinite ground plane with realistic PBR textures */}
      <mesh
        ref={groundRef}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        onClick={handleClick}
      >
        <planeGeometry args={[2000, 2000, 100, 100]} />
        <meshStandardMaterial 
          map={groundAlbedo}
          normalMap={groundNormal}
          roughness={0.85}
          metalness={0.1}
        />
      </mesh>

      {/* Infinite road system */}
      <InfiniteRoad playerPosition={playerPosition} onGroundClick={handleClick} />

      {/* Grid helper for visual reference */}
      <gridHelper args={[2000, 200, '#4a5a4a', '#3a4a3a']} position={[0, 0.01, 0]} />

      {/* Power lines with utility poles */}
      <PowerLines />

      {/* Highway and bridge features */}
      <HighwayAndBridge />

      {/* Gas station */}
      <GasStop />

      {/* Construction events */}
      <ConstructionEvents playerPosition={playerPosition} />

      {/* Power stations */}
      <PowerStations playerPosition={playerPosition} />

      {/* City clusters */}
      <CityClusters playerPosition={playerPosition} />

      {/* Truck stop */}
      <TruckStop />

      {/* Some scattered obstacles/landmarks for visual interest */}
      <ScatteredObjects />
      
      {/* Fog for distance */}
      <fog attach="fog" args={['#87CEEB', 100, 500]} />
    </group>
  );
}

function ScatteredObjects() {
  const objects = useRef<ReactElement[]>([]);

  if (objects.current.length === 0) {
    // Generate some random obstacles (avoid the road corridor at x=0)
    for (let i = 0; i < 50; i++) {
      let x = (Math.random() - 0.5) * 1000;
      // Keep obstacles away from the road (x between -10 and 10)
      if (Math.abs(x) < 15) {
        x = x < 0 ? x - 15 : x + 15;
      }
      const z = (Math.random() - 0.5) * 1000;
      const height = Math.random() * 3 + 1;
      const size = Math.random() * 2 + 0.5;

      objects.current.push(
        <mesh
          key={i}
          position={[x, height / 2, z]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[size, height, size]} />
          <meshStandardMaterial color="#2a3a2a" />
        </mesh>
      );
    }
  }

  return <>{objects.current}</>;
}
