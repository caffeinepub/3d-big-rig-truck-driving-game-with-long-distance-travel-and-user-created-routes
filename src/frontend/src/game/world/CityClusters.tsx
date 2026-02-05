import { useMemo } from 'react';
import { Vector3 } from 'three';
import { DeterministicRandom } from '../utils/deterministicRandom';

interface CityClustersProps {
  playerPosition?: Vector3;
}

export default function CityClusters({ playerPosition }: CityClustersProps) {
  const tileSize = 400;
  const viewDistance = 800;

  const cities = useMemo(() => {
    if (!playerPosition) return [];

    const items: Array<{ x: number; z: number; seed: number }> = [];
    const playerZ = playerPosition.z;
    const startTile = Math.floor((playerZ - viewDistance) / tileSize);
    const endTile = Math.floor((playerZ + viewDistance) / tileSize);

    for (let tileZ = startTile; tileZ <= endTile; tileZ++) {
      const seed = tileZ * 8191;
      const rng = new DeterministicRandom(seed);
      
      // 10% chance of city cluster in this tile
      if (rng.next() < 0.1) {
        const zOffset = rng.range(-tileSize / 2, tileSize / 2);
        const side = rng.next() < 0.5 ? -1 : 1;
        const xOffset = side * rng.range(30, 80);
        
        items.push({
          x: xOffset,
          z: tileZ * tileSize + zOffset,
          seed,
        });
      }
    }

    return items;
  }, [playerPosition, tileSize, viewDistance]);

  return (
    <group>
      {cities.map((city, index) => (
        <CityCluster key={`${city.z}-${index}`} x={city.x} z={city.z} seed={city.seed} />
      ))}
    </group>
  );
}

interface CityClusterProps {
  x: number;
  z: number;
  seed: number;
}

function CityCluster({ x, z, seed }: CityClusterProps) {
  const rng = useMemo(() => new DeterministicRandom(seed), [seed]);

  const buildings = useMemo(() => {
    const items: Array<{ x: number; z: number; height: number; width: number; depth: number; color: string }> = [];
    const numBuildings = rng.int(15, 30);
    const colors = ['#4a5a6a', '#5a6a7a', '#3a4a5a', '#6a7a8a', '#2a3a4a'];
    
    for (let i = 0; i < numBuildings; i++) {
      items.push({
        x: x + rng.range(-25, 25),
        z: z + rng.range(-25, 25),
        height: rng.range(8, 40),
        width: rng.range(3, 8),
        depth: rng.range(3, 8),
        color: colors[rng.int(0, colors.length)],
      });
    }
    
    return items;
  }, [rng, x, z]);

  return (
    <group>
      {buildings.map((building, i) => (
        <mesh
          key={i}
          position={[building.x, building.height / 2, building.z]}
          castShadow
          receiveShadow
          raycast={() => null}
        >
          <boxGeometry args={[building.width, building.height, building.depth]} />
          <meshStandardMaterial color={building.color} roughness={0.7} metalness={0.3} />
        </mesh>
      ))}

      {/* City lights effect (small glowing cubes) */}
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh
          key={`light-${i}`}
          position={[
            x + rng.range(-30, 30),
            rng.range(5, 15),
            z + rng.range(-30, 30),
          ]}
          raycast={() => null}
        >
          <boxGeometry args={[0.3, 0.3, 0.3]} />
          <meshStandardMaterial
            color="#ffeb3b"
            emissive="#ffeb3b"
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
    </group>
  );
}
