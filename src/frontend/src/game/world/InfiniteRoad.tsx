import { useMemo, useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { RepeatWrapping, Vector3 } from 'three';

interface InfiniteRoadProps {
  playerPosition?: Vector3;
  onGroundClick?: (event: any) => void;
}

export default function InfiniteRoad({ playerPosition, onGroundClick }: InfiniteRoadProps) {
  const segmentLength = 200;
  const numSegments = 5;
  const segmentPositions = useRef<number[]>([]);

  // Load road textures
  const [roadAlbedo, roadNormal, roadMarkings] = useLoader(THREE.TextureLoader, [
    '/assets/generated/road-albedo-v2.dim_1024x1024.png',
    '/assets/generated/road-normal-v2.dim_1024x1024.png',
    '/assets/generated/road-markings-mask.dim_1024x1024.png',
  ]);

  // Configure road textures
  useMemo(() => {
    [roadAlbedo, roadNormal].forEach(texture => {
      texture.wrapS = texture.wrapT = RepeatWrapping;
      texture.repeat.set(1, 20);
      texture.anisotropy = 16;
    });
  }, [roadAlbedo, roadNormal]);

  useMemo(() => {
    roadMarkings.wrapS = roadMarkings.wrapT = RepeatWrapping;
    roadMarkings.repeat.set(1, 20);
    roadMarkings.anisotropy = 16;
  }, [roadMarkings]);

  // Initialize segment positions
  if (segmentPositions.current.length === 0) {
    for (let i = 0; i < numSegments; i++) {
      segmentPositions.current.push((i - Math.floor(numSegments / 2)) * segmentLength);
    }
  }

  // Update segment positions based on player movement
  useFrame(() => {
    if (!playerPosition) return;

    const playerZ = playerPosition.z;

    segmentPositions.current = segmentPositions.current.map(segZ => {
      // If segment is too far behind, move it ahead
      if (segZ < playerZ - segmentLength * 2) {
        return segZ + numSegments * segmentLength;
      }
      // If segment is too far ahead, move it behind
      if (segZ > playerZ + segmentLength * 3) {
        return segZ - numSegments * segmentLength;
      }
      return segZ;
    });
  });

  return (
    <group>
      {segmentPositions.current.map((zPos, index) => (
        <group key={index} position={[0, 0, zPos]}>
          {/* Road surface */}
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.02, 0]}
            receiveShadow
            onClick={onGroundClick}
          >
            <planeGeometry args={[12, segmentLength, 10, 50]} />
            <meshStandardMaterial 
              map={roadAlbedo}
              normalMap={roadNormal}
              roughness={0.7}
              metalness={0.05}
            />
          </mesh>

          {/* Road markings overlay */}
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.03, 0]}
            onClick={onGroundClick}
          >
            <planeGeometry args={[12, segmentLength, 10, 50]} />
            <meshStandardMaterial 
              map={roadMarkings}
              transparent={true}
              opacity={0.8}
              roughness={0.8}
              metalness={0.0}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
