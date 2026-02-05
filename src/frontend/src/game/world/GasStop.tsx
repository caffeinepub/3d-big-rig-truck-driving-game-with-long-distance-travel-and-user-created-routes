import { useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { RepeatWrapping } from 'three';

export default function GasStop() {
  // Load metal textures for canopy and signage
  const [metalAlbedo, metalNormal] = useLoader(THREE.TextureLoader, [
    '/assets/generated/gas-metal-albedo.dim_1024x1024.png',
    '/assets/generated/gas-metal-normal.dim_1024x1024.png',
  ]);

  // Configure metal textures
  useMemo(() => {
    [metalAlbedo, metalNormal].forEach(texture => {
      texture.wrapS = texture.wrapT = RepeatWrapping;
      texture.repeat.set(2, 2);
      texture.anisotropy = 16;
    });
  }, [metalAlbedo, metalNormal]);

  return (
    <group position={[35, 0, -50]} raycast={() => null}>
      {/* Gas station canopy */}
      <group position={[0, 4.5, 0]}>
        {/* Canopy roof */}
        <mesh castShadow receiveShadow raycast={() => null}>
          <boxGeometry args={[12, 0.3, 10]} />
          <meshStandardMaterial
            map={metalAlbedo}
            normalMap={metalNormal}
            color="#e8e8e8"
            roughness={0.4}
            metalness={0.6}
          />
        </mesh>

        {/* Canopy support pillars */}
        {[
          [-5, -2.25, -4],
          [5, -2.25, -4],
          [-5, -2.25, 4],
          [5, -2.25, 4],
        ].map((pos, i) => (
          <mesh
            key={i}
            position={pos as [number, number, number]}
            castShadow
            receiveShadow
            raycast={() => null}
          >
            <cylinderGeometry args={[0.3, 0.3, 4.5, 12]} />
            <meshStandardMaterial
              map={metalAlbedo}
              normalMap={metalNormal}
              color="#d8d8d8"
              roughness={0.5}
              metalness={0.5}
            />
          </mesh>
        ))}

        {/* Canopy edge trim */}
        <mesh position={[0, -0.3, 0]} castShadow raycast={() => null}>
          <boxGeometry args={[12.2, 0.4, 10.2]} />
          <meshStandardMaterial color="#ff6b35" roughness={0.6} metalness={0.4} />
        </mesh>
      </group>

      {/* Gas pumps */}
      {[
        [-3, 0, 0],
        [0, 0, 0],
        [3, 0, 0],
      ].map((pos, i) => (
        <group key={i} position={pos as [number, number, number]}>
          {/* Pump body */}
          <mesh castShadow receiveShadow raycast={() => null} position={[0, 1, 0]}>
            <boxGeometry args={[0.8, 2, 0.6]} />
            <meshStandardMaterial color="#2a5a8a" roughness={0.5} metalness={0.4} />
          </mesh>

          {/* Pump display screen */}
          <mesh castShadow raycast={() => null} position={[0, 1.5, 0.31]}>
            <boxGeometry args={[0.6, 0.4, 0.05]} />
            <meshStandardMaterial color="#1a1a1a" emissive="#00ff00" emissiveIntensity={0.2} />
          </mesh>

          {/* Pump nozzle holder */}
          <mesh castShadow raycast={() => null} position={[-0.5, 1, 0]}>
            <boxGeometry args={[0.2, 0.6, 0.3]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.7} metalness={0.3} />
          </mesh>

          {/* Pump base */}
          <mesh receiveShadow raycast={() => null} position={[0, 0.1, 0]}>
            <boxGeometry args={[1, 0.2, 0.8]} />
            <meshStandardMaterial color="#3a3a3a" roughness={0.8} metalness={0.2} />
          </mesh>
        </group>
      ))}

      {/* Gas station sign */}
      <group position={[0, 8, -8]}>
        {/* Sign pole */}
        <mesh castShadow receiveShadow raycast={() => null} position={[0, -3, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 6, 12]} />
          <meshStandardMaterial color="#4a4a4a" roughness={0.7} metalness={0.4} />
        </mesh>

        {/* Sign board */}
        <mesh castShadow receiveShadow raycast={() => null}>
          <boxGeometry args={[4, 2, 0.2]} />
          <meshStandardMaterial
            color="#ff6b35"
            emissive="#ff6b35"
            emissiveIntensity={0.3}
            roughness={0.4}
            metalness={0.3}
          />
        </mesh>

        {/* Sign text area */}
        <mesh castShadow raycast={() => null} position={[0, 0, 0.11]}>
          <boxGeometry args={[3.5, 1.5, 0.05]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
        </mesh>
      </group>

      {/* Small convenience store building */}
      <group position={[8, 0, 0]}>
        <mesh castShadow receiveShadow raycast={() => null} position={[0, 2, 0]}>
          <boxGeometry args={[6, 4, 8]} />
          <meshStandardMaterial color="#d8d8d8" roughness={0.7} metalness={0.2} />
        </mesh>

        {/* Store windows */}
        <mesh castShadow raycast={() => null} position={[-3.05, 2, 0]}>
          <boxGeometry args={[0.1, 2, 6]} />
          <meshStandardMaterial color="#1a3a5a" roughness={0.1} metalness={0.9} />
        </mesh>

        {/* Store door */}
        <mesh castShadow raycast={() => null} position={[-3.05, 1, 0]}>
          <boxGeometry args={[0.1, 2, 1.2]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.6} metalness={0.4} />
        </mesh>

        {/* Roof */}
        <mesh castShadow receiveShadow raycast={() => null} position={[0, 4.2, 0]}>
          <boxGeometry args={[6.5, 0.4, 8.5]} />
          <meshStandardMaterial color="#3a3a3a" roughness={0.8} metalness={0.3} />
        </mesh>
      </group>

      {/* Parking lot pavement */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, 0]}
        receiveShadow
        raycast={() => null}
      >
        <planeGeometry args={[30, 25]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.9} metalness={0.1} />
      </mesh>
    </group>
  );
}
