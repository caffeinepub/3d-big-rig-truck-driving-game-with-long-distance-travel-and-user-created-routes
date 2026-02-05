import { useMemo } from 'react';
import { Vector3 } from 'three';
import { DeterministicRandom } from '../utils/deterministicRandom';
import { Text } from '@react-three/drei';

interface ConstructionEventsProps {
  playerPosition?: Vector3;
}

export default function ConstructionEvents({ playerPosition }: ConstructionEventsProps) {
  const tileSize = 200;
  const viewDistance = 400;

  const constructionZones = useMemo(() => {
    if (!playerPosition) return [];

    const zones: Array<{ x: number; z: number; seed: number }> = [];
    const playerZ = playerPosition.z;
    const startTile = Math.floor((playerZ - viewDistance) / tileSize);
    const endTile = Math.floor((playerZ + viewDistance) / tileSize);

    for (let tileZ = startTile; tileZ <= endTile; tileZ++) {
      const seed = tileZ * 7919;
      const rng = new DeterministicRandom(seed);
      
      // 20% chance of construction in this tile
      if (rng.next() < 0.2) {
        const zOffset = rng.range(-tileSize / 2, tileSize / 2);
        const xOffset = rng.range(-5, 5);
        zones.push({
          x: xOffset,
          z: tileZ * tileSize + zOffset,
          seed,
        });
      }
    }

    return zones;
  }, [playerPosition, tileSize, viewDistance]);

  return (
    <group>
      {constructionZones.map((zone, index) => (
        <ConstructionZone key={`${zone.z}-${index}`} x={zone.x} z={zone.z} seed={zone.seed} />
      ))}
    </group>
  );
}

interface ConstructionZoneProps {
  x: number;
  z: number;
  seed: number;
}

function ConstructionZone({ x, z, seed }: ConstructionZoneProps) {
  const rng = useMemo(() => new DeterministicRandom(seed), [seed]);

  const cones = useMemo(() => {
    const items: Array<{ x: number; z: number }> = [];
    const numCones = rng.int(5, 12);
    
    for (let i = 0; i < numCones; i++) {
      items.push({
        x: x + rng.range(-3, 3),
        z: z + i * rng.range(3, 6),
      });
    }
    
    return items;
  }, [rng, x, z]);

  return (
    <group>
      {/* Construction cones */}
      {cones.map((cone, i) => (
        <mesh key={i} position={[cone.x, 0.3, cone.z]} castShadow raycast={() => null}>
          <coneGeometry args={[0.2, 0.6, 8]} />
          <meshStandardMaterial color="#ff6600" roughness={0.8} />
        </mesh>
      ))}

      {/* Barrels */}
      {[0, 1, 2].map(i => (
        <mesh
          key={`barrel-${i}`}
          position={[x + rng.range(-2, 2), 0.4, z + i * 8]}
          castShadow
          raycast={() => null}
        >
          <cylinderGeometry args={[0.3, 0.3, 0.8, 12]} />
          <meshStandardMaterial color="#ff8800" roughness={0.7} />
        </mesh>
      ))}

      {/* Construction sign */}
      <group position={[x - 4, 1.5, z]}>
        <mesh castShadow raycast={() => null}>
          <boxGeometry args={[1.5, 1.5, 0.1]} />
          <meshStandardMaterial color="#ffcc00" roughness={0.6} />
        </mesh>
        <Text
          position={[0, 0, 0.06]}
          fontSize={0.3}
          color="#000000"
          anchorX="center"
          anchorY="middle"
        >
          ROAD{'\n'}WORK{'\n'}AHEAD
        </Text>
        {/* Sign post */}
        <mesh position={[0, -1.2, 0]} castShadow raycast={() => null}>
          <cylinderGeometry args={[0.05, 0.05, 1.5, 8]} />
          <meshStandardMaterial color="#666" roughness={0.8} />
        </mesh>
      </group>
    </group>
  );
}
