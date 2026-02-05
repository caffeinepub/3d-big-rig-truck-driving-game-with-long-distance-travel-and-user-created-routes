import { useMemo } from 'react';
import { Vector3 } from 'three';
import { DeterministicRandom } from '../utils/deterministicRandom';

interface PowerStationsProps {
  playerPosition?: Vector3;
}

export default function PowerStations({ playerPosition }: PowerStationsProps) {
  const tileSize = 300;
  const viewDistance = 600;

  const stations = useMemo(() => {
    if (!playerPosition) return [];

    const items: Array<{ x: number; z: number; seed: number }> = [];
    const playerZ = playerPosition.z;
    const startTile = Math.floor((playerZ - viewDistance) / tileSize);
    const endTile = Math.floor((playerZ + viewDistance) / tileSize);

    for (let tileZ = startTile; tileZ <= endTile; tileZ++) {
      const seed = tileZ * 9973;
      const rng = new DeterministicRandom(seed);
      
      // 15% chance of power station in this tile
      if (rng.next() < 0.15) {
        const zOffset = rng.range(-tileSize / 2, tileSize / 2);
        const side = rng.next() < 0.5 ? -1 : 1;
        const xOffset = side * rng.range(20, 50);
        
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
      {stations.map((station, index) => (
        <PowerStation key={`${station.z}-${index}`} x={station.x} z={station.z} seed={station.seed} />
      ))}
    </group>
  );
}

interface PowerStationProps {
  x: number;
  z: number;
  seed: number;
}

function PowerStation({ x, z, seed }: PowerStationProps) {
  const rng = useMemo(() => new DeterministicRandom(seed), [seed]);

  return (
    <group position={[x, 0, z]}>
      {/* Main building */}
      <mesh castShadow receiveShadow position={[0, 3, 0]} raycast={() => null}>
        <boxGeometry args={[8, 6, 12]} />
        <meshStandardMaterial color="#4a5a6a" roughness={0.8} metalness={0.3} />
      </mesh>

      {/* Transformer units */}
      {[0, 1, 2].map(i => (
        <mesh
          key={i}
          castShadow
          receiveShadow
          position={[-4 + i * 4, 1.5, 8]}
          raycast={() => null}
        >
          <boxGeometry args={[2.5, 3, 2]} />
          <meshStandardMaterial color="#3a4a5a" roughness={0.7} metalness={0.4} />
        </mesh>
      ))}

      {/* Electrical towers */}
      {[-6, 6].map((xOff, i) => (
        <group key={i} position={[xOff, 0, -8]}>
          {/* Tower structure */}
          <mesh castShadow position={[0, 6, 0]} raycast={() => null}>
            <boxGeometry args={[0.4, 12, 0.4]} />
            <meshStandardMaterial color="#666" roughness={0.8} metalness={0.5} />
          </mesh>
          {/* Cross beam */}
          <mesh castShadow position={[0, 10, 0]} raycast={() => null}>
            <boxGeometry args={[3, 0.3, 0.3]} />
            <meshStandardMaterial color="#666" roughness={0.8} metalness={0.5} />
          </mesh>
          {/* Insulators */}
          {[-1, 0, 1].map(offset => (
            <mesh
              key={offset}
              castShadow
              position={[offset, 9.5, 0]}
              raycast={() => null}
            >
              <cylinderGeometry args={[0.1, 0.15, 0.4, 8]} />
              <meshStandardMaterial color="#8a7a6a" roughness={0.6} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Fence */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const radius = 10;
        return (
          <mesh
            key={i}
            position={[Math.sin(angle) * radius, 1, Math.cos(angle) * radius]}
            raycast={() => null}
          >
            <boxGeometry args={[0.1, 2, 0.1]} />
            <meshStandardMaterial color="#555" roughness={0.9} />
          </mesh>
        );
      })}
    </group>
  );
}
