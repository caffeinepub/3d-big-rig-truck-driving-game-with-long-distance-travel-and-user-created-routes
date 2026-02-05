import { useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { RepeatWrapping } from 'three';

export default function HighwayAndBridge() {
  // Load guardrail textures
  const [guardrailAlbedo, guardrailNormal] = useLoader(THREE.TextureLoader, [
    '/assets/generated/guardrail-albedo.dim_1024x1024.png',
    '/assets/generated/guardrail-normal.dim_1024x1024.png',
  ]);

  // Load road textures for highway
  const [roadAlbedo, roadNormal] = useLoader(THREE.TextureLoader, [
    '/assets/generated/road-albedo-v2.dim_1024x1024.png',
    '/assets/generated/road-normal-v2.dim_1024x1024.png',
  ]);

  // Configure guardrail textures
  useMemo(() => {
    [guardrailAlbedo, guardrailNormal].forEach(texture => {
      texture.wrapS = texture.wrapT = RepeatWrapping;
      texture.repeat.set(10, 1);
      texture.anisotropy = 16;
    });
  }, [guardrailAlbedo, guardrailNormal]);

  // Configure highway road textures
  useMemo(() => {
    [roadAlbedo, roadNormal].forEach(texture => {
      texture.wrapS = texture.wrapT = RepeatWrapping;
      texture.repeat.set(2, 50);
      texture.anisotropy = 16;
    });
  }, [roadAlbedo, roadNormal]);

  return (
    <group>
      {/* Highway segment - wider multi-lane road */}
      <group position={[60, 0, 0]}>
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.02, 0]}
          receiveShadow
          raycast={() => null}
        >
          <planeGeometry args={[24, 400, 50, 200]} />
          <meshStandardMaterial
            map={roadAlbedo}
            normalMap={roadNormal}
            roughness={0.7}
            metalness={0.05}
          />
        </mesh>

        {/* Highway lane markings */}
        {[-6, 0, 6].map((offset, i) => (
          <mesh
            key={i}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[offset, 0.03, 0]}
            raycast={() => null}
          >
            <planeGeometry args={[0.2, 400]} />
            <meshStandardMaterial color="#ffeb3b" roughness={0.8} />
          </mesh>
        ))}
      </group>

      {/* Bridge/Overpass */}
      <group position={[-80, 0, 100]}>
        {/* Bridge deck */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 8, 0]}
          receiveShadow
          castShadow
          raycast={() => null}
        >
          <planeGeometry args={[18, 80, 20, 40]} />
          <meshStandardMaterial
            map={roadAlbedo}
            normalMap={roadNormal}
            roughness={0.7}
            metalness={0.05}
          />
        </mesh>

        {/* Bridge structure/supports */}
        <mesh
          position={[0, 7.5, 0]}
          castShadow
          receiveShadow
          raycast={() => null}
        >
          <boxGeometry args={[18, 0.8, 80]} />
          <meshStandardMaterial color="#4a4a4a" roughness={0.8} metalness={0.3} />
        </mesh>

        {/* Bridge pillars */}
        {[-30, 0, 30].map((zPos, i) => (
          <group key={i}>
            <mesh
              position={[-8, 3.5, zPos]}
              castShadow
              receiveShadow
              raycast={() => null}
            >
              <boxGeometry args={[1.5, 7, 1.5]} />
              <meshStandardMaterial color="#3a3a3a" roughness={0.9} metalness={0.2} />
            </mesh>
            <mesh
              position={[8, 3.5, zPos]}
              castShadow
              receiveShadow
              raycast={() => null}
            >
              <boxGeometry args={[1.5, 7, 1.5]} />
              <meshStandardMaterial color="#3a3a3a" roughness={0.9} metalness={0.2} />
            </mesh>
          </group>
        ))}

        {/* Guardrails on bridge */}
        {[-9, 9].map((xPos, i) => (
          <mesh
            key={i}
            position={[xPos, 8.8, 0]}
            castShadow
            receiveShadow
            raycast={() => null}
          >
            <boxGeometry args={[0.2, 1, 80]} />
            <meshStandardMaterial
              map={guardrailAlbedo}
              normalMap={guardrailNormal}
              roughness={0.6}
              metalness={0.5}
            />
          </mesh>
        ))}

        {/* Guardrail posts */}
        {Array.from({ length: 10 }).map((_, i) => {
          const zPos = -35 + i * 8;
          return (
            <group key={i}>
              <mesh
                position={[-9, 8.3, zPos]}
                castShadow
                raycast={() => null}
              >
                <boxGeometry args={[0.15, 0.6, 0.15]} />
                <meshStandardMaterial color="#5a5a5a" roughness={0.7} metalness={0.4} />
              </mesh>
              <mesh
                position={[9, 8.3, zPos]}
                castShadow
                raycast={() => null}
              >
                <boxGeometry args={[0.15, 0.6, 0.15]} />
                <meshStandardMaterial color="#5a5a5a" roughness={0.7} metalness={0.4} />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* Highway on-ramp connecting to main road */}
      <group position={[30, 0, -100]} rotation={[0, Math.PI / 6, 0]}>
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.02, 0]}
          receiveShadow
          raycast={() => null}
        >
          <planeGeometry args={[12, 100, 30, 50]} />
          <meshStandardMaterial
            map={roadAlbedo}
            normalMap={roadNormal}
            roughness={0.7}
            metalness={0.05}
          />
        </mesh>
      </group>
    </group>
  );
}
