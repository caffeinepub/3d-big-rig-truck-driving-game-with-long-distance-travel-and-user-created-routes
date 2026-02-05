import { useRef, useMemo } from 'react';
import { Mesh, Vector3, RepeatWrapping } from 'three';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { ReactElement } from 'react';
import PowerLines from './PowerLines';
import HighwayAndBridge from './HighwayAndBridge';
import GasStop from './GasStop';

interface WorldProps {
  onGroundClick?: (point: [number, number, number]) => void;
}

export default function World({ onGroundClick }: WorldProps) {
  const groundRef = useRef<Mesh>(null);
  const roadRef = useRef<Mesh>(null);

  // Load PBR textures for ground
  const [groundAlbedo, groundNormal] = useLoader(THREE.TextureLoader, [
    '/assets/generated/ground-albedo.dim_1024x1024.png',
    '/assets/generated/ground-normal.dim_1024x1024.png',
  ]);

  // Load upgraded PBR textures for road
  const [roadAlbedo, roadNormal, roadMarkings] = useLoader(THREE.TextureLoader, [
    '/assets/generated/road-albedo-v2.dim_1024x1024.png',
    '/assets/generated/road-normal-v2.dim_1024x1024.png',
    '/assets/generated/road-markings-mask.dim_1024x1024.png',
  ]);

  // Configure texture wrapping and repeat for natural tiling
  useMemo(() => {
    [groundAlbedo, groundNormal].forEach(texture => {
      texture.wrapS = texture.wrapT = RepeatWrapping;
      texture.repeat.set(50, 50); // Tile across the large ground plane
      texture.anisotropy = 16; // Improve texture quality at angles
    });
  }, [groundAlbedo, groundNormal]);

  // Configure road textures for tiling along the road corridor
  useMemo(() => {
    [roadAlbedo, roadNormal].forEach(texture => {
      texture.wrapS = texture.wrapT = RepeatWrapping;
      texture.repeat.set(1, 100); // Tile lengthwise along the road
      texture.anisotropy = 16; // Critical for shallow viewing angles
    });
  }, [roadAlbedo, roadNormal]);

  // Configure road markings texture
  useMemo(() => {
    roadMarkings.wrapS = roadMarkings.wrapT = RepeatWrapping;
    roadMarkings.repeat.set(1, 100);
    roadMarkings.anisotropy = 16;
  }, [roadMarkings]);

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

      {/* Road corridor - realistic asphalt with lane markings */}
      <mesh
        ref={roadRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 0]}
        receiveShadow
        onClick={handleClick}
      >
        <planeGeometry args={[12, 2000, 50, 500]} />
        <meshStandardMaterial 
          map={roadAlbedo}
          normalMap={roadNormal}
          roughness={0.7}
          metalness={0.05}
        />
      </mesh>

      {/* Road lane markings overlay */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.03, 0]}
        onClick={handleClick}
      >
        <planeGeometry args={[12, 2000, 50, 500]} />
        <meshStandardMaterial 
          map={roadMarkings}
          transparent={true}
          opacity={0.8}
          roughness={0.8}
          metalness={0.0}
          depthWrite={false}
        />
      </mesh>

      {/* Grid helper for visual reference */}
      <gridHelper args={[2000, 200, '#4a5a4a', '#3a4a3a']} position={[0, 0.01, 0]} />

      {/* Power lines with utility poles */}
      <PowerLines />

      {/* Highway and bridge features */}
      <HighwayAndBridge />

      {/* Gas station */}
      <GasStop />

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
