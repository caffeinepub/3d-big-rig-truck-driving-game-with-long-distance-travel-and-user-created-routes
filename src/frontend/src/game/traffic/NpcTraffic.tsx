import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { DeterministicRandom } from '../utils/deterministicRandom';

interface NpcTrafficProps {
  playerTruckRef: React.RefObject<any>;
}

interface NpcCar {
  id: number;
  position: THREE.Vector3;
  speed: number;
  color: string;
  type: 'sedan' | 'suv' | 'van';
  laneOffset: number;
}

export default function NpcTraffic({ playerTruckRef }: NpcTrafficProps) {
  const carsRef = useRef<NpcCar[]>([]);
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);
  const rng = useMemo(() => new DeterministicRandom(999), []);

  // Initialize NPC cars
  useMemo(() => {
    const cars: NpcCar[] = [];
    const carColors = ['#2a5a8a', '#8a2a2a', '#2a8a2a', '#6a6a6a', '#8a6a2a', '#4a4a4a'];
    const carTypes: Array<'sedan' | 'suv' | 'van'> = ['sedan', 'suv', 'van'];
    
    for (let i = 0; i < 12; i++) {
      cars.push({
        id: i,
        position: new THREE.Vector3(
          rng.range(-4, 4), // Lane position
          0.6,
          rng.range(-200, 200) // Spread along road
        ),
        speed: rng.range(12, 20),
        color: carColors[rng.int(0, carColors.length)],
        type: carTypes[rng.int(0, carTypes.length)],
        laneOffset: rng.range(-4, 4),
      });
    }
    
    carsRef.current = cars;
  }, [rng]);

  // Update car positions
  useFrame((state, delta) => {
    if (!instancedMeshRef.current) return;

    const playerPos = playerTruckRef.current?.position;
    const matrix = new THREE.Matrix4();

    carsRef.current.forEach((car, index) => {
      // Move car forward
      car.position.z += car.speed * delta;

      // Recycle cars that go too far ahead or behind player
      if (playerPos) {
        const distanceToPlayer = car.position.z - playerPos.z;
        
        if (distanceToPlayer > 150) {
          // Respawn behind player
          car.position.z = playerPos.z - 150;
          car.laneOffset = rng.range(-4, 4);
        } else if (distanceToPlayer < -150) {
          // Respawn ahead of player
          car.position.z = playerPos.z + 150;
          car.laneOffset = rng.range(-4, 4);
        }
      }

      // Update instance matrix
      matrix.setPosition(car.laneOffset, car.position.y, car.position.z);
      instancedMeshRef.current!.setMatrixAt(index, matrix);
    });

    instancedMeshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      {/* Instanced mesh for performance */}
      <instancedMesh
        ref={instancedMeshRef}
        args={[undefined, undefined, carsRef.current.length]}
        castShadow
        receiveShadow
        raycast={() => null}
      >
        <boxGeometry args={[1.8, 1.2, 4]} />
        <meshStandardMaterial color="#4a5a6a" roughness={0.6} metalness={0.4} />
      </instancedMesh>

      {/* Individual detailed cars (non-instanced for variety) */}
      {carsRef.current.map((car) => (
        <NpcCarModel key={car.id} car={car} />
      ))}
    </group>
  );
}

interface NpcCarModelProps {
  car: NpcCar;
}

function NpcCarModel({ car }: NpcCarModelProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.copy(car.position);
      groupRef.current.position.x = car.laneOffset;
    }
  });

  const dimensions = useMemo(() => {
    switch (car.type) {
      case 'sedan':
        return { width: 1.8, height: 1.2, length: 4 };
      case 'suv':
        return { width: 2, height: 1.6, length: 4.5 };
      case 'van':
        return { width: 2, height: 2, length: 5 };
    }
  }, [car.type]);

  return (
    <group ref={groupRef} raycast={() => null}>
      {/* Car body */}
      <mesh castShadow receiveShadow position={[0, dimensions.height / 2, 0]}>
        <boxGeometry args={[dimensions.width, dimensions.height, dimensions.length]} />
        <meshStandardMaterial color={car.color} roughness={0.5} metalness={0.4} />
      </mesh>

      {/* Windshield */}
      <mesh castShadow position={[0, dimensions.height * 0.7, dimensions.length * 0.15]}>
        <boxGeometry args={[dimensions.width * 0.9, dimensions.height * 0.4, 0.1]} />
        <meshStandardMaterial color="#1a1a2a" roughness={0.1} metalness={0.9} />
      </mesh>

      {/* Wheels */}
      {[
        [-dimensions.width / 2 - 0.1, 0.3, dimensions.length * 0.3],
        [dimensions.width / 2 + 0.1, 0.3, dimensions.length * 0.3],
        [-dimensions.width / 2 - 0.1, 0.3, -dimensions.length * 0.3],
        [dimensions.width / 2 + 0.1, 0.3, -dimensions.length * 0.3],
      ].map((pos, i) => (
        <mesh
          key={i}
          position={pos as [number, number, number]}
          rotation={[0, 0, Math.PI / 2]}
          castShadow
        >
          <cylinderGeometry args={[0.3, 0.3, 0.2, 12]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
        </mesh>
      ))}

      {/* Headlights */}
      <mesh position={[-dimensions.width * 0.3, dimensions.height * 0.4, dimensions.length / 2 + 0.05]}>
        <boxGeometry args={[0.2, 0.15, 0.05]} />
        <meshStandardMaterial color="#ffeb3b" emissive="#ffeb3b" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[dimensions.width * 0.3, dimensions.height * 0.4, dimensions.length / 2 + 0.05]}>
        <boxGeometry args={[0.2, 0.15, 0.05]} />
        <meshStandardMaterial color="#ffeb3b" emissive="#ffeb3b" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}
