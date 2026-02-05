import { useRef, useMemo } from 'react';
import { Mesh, CatmullRomCurve3, Vector3, RepeatWrapping } from 'three';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { DeterministicRandom } from '../utils/deterministicRandom';

export default function PowerLines() {
  // Load PBR textures for utility poles
  const [poleAlbedo, poleNormal] = useLoader(THREE.TextureLoader, [
    '/assets/generated/pole-wood-albedo.dim_1024x1024.png',
    '/assets/generated/pole-wood-normal.dim_1024x1024.png',
  ]);

  // Configure texture wrapping and repeat for poles
  useMemo(() => {
    [poleAlbedo, poleNormal].forEach(texture => {
      texture.wrapS = texture.wrapT = RepeatWrapping;
      texture.repeat.set(1, 3); // Vertical repeat for pole height
    });
  }, [poleAlbedo, poleNormal]);

  // Deterministic pole placement along a corridor with variation
  const poleData = useMemo(() => {
    const data: Array<{
      position: [number, number, number];
      height: number;
      hasTransformer: boolean;
      hasGuyWire: boolean;
    }> = [];
    const spacing = 40; // Distance between poles
    const offset = 25; // Distance from center line
    const count = 25; // Number of poles on each side
    const rng = new DeterministicRandom(42);

    // Left side poles
    for (let i = 0; i < count; i++) {
      const heightVariation = rng.range(-0.5, 0.5);
      data.push({
        position: [-offset, 0, i * spacing - 400],
        height: 8 + heightVariation,
        hasTransformer: rng.next() > 0.7,
        hasGuyWire: i % 5 === 0 && rng.next() > 0.5,
      });
    }

    // Right side poles
    for (let i = 0; i < count; i++) {
      const heightVariation = rng.range(-0.5, 0.5);
      data.push({
        position: [offset, 0, i * spacing - 400],
        height: 8 + heightVariation,
        hasTransformer: rng.next() > 0.7,
        hasGuyWire: i % 5 === 0 && rng.next() > 0.5,
      });
    }

    return data;
  }, []);

  return (
    <group>
      {/* Utility poles */}
      {poleData.map((pole, index) => (
        <UtilityPole
          key={index}
          position={pole.position}
          height={pole.height}
          hasTransformer={pole.hasTransformer}
          hasGuyWire={pole.hasGuyWire}
          albedoMap={poleAlbedo}
          normalMap={poleNormal}
        />
      ))}

      {/* Overhead cables connecting poles */}
      <OverheadCables poleData={poleData} />
    </group>
  );
}

interface UtilityPoleProps {
  position: [number, number, number];
  height: number;
  hasTransformer: boolean;
  hasGuyWire: boolean;
  albedoMap: THREE.Texture;
  normalMap: THREE.Texture;
}

function UtilityPole({ position, height, hasTransformer, hasGuyWire, albedoMap, normalMap }: UtilityPoleProps) {
  const poleRef = useRef<Mesh>(null);
  const poleRadius = 0.25;

  // Embed pole base slightly into ground
  const adjustedPosition: [number, number, number] = [
    position[0],
    height / 2 - 0.3,
    position[2],
  ];

  // Create guy wire line object if needed
  const guyWireLine = useMemo(() => {
    if (!hasGuyWire) return null;
    
    const points = [
      new Vector3(0, height - 2, 0),
      new Vector3(position[0] > 0 ? 3 : -3, 0, 2),
    ];
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: '#1a1a1a' });
    const line = new THREE.Line(geometry, material);
    line.raycast = () => null as any;
    
    return line;
  }, [hasGuyWire, height, position]);

  return (
    <group position={position}>
      {/* Main pole */}
      <mesh
        ref={poleRef}
        position={[0, adjustedPosition[1], 0]}
        castShadow
        receiveShadow
        raycast={() => null}
      >
        <cylinderGeometry args={[poleRadius, poleRadius * 1.15, height, 12]} />
        <meshStandardMaterial
          map={albedoMap}
          normalMap={normalMap}
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>

      {/* Cross-arm for cables */}
      <mesh
        position={[0, height - 1, 0]}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
        receiveShadow
        raycast={() => null}
      >
        <cylinderGeometry args={[0.12, 0.12, 3.5, 8]} />
        <meshStandardMaterial
          map={albedoMap}
          normalMap={normalMap}
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>

      {/* Insulators */}
      {[-1.4, 0, 1.4].map((xOffset, i) => (
        <group key={i} position={[xOffset, height - 1.3, 0]}>
          <mesh castShadow raycast={() => null}>
            <cylinderGeometry args={[0.08, 0.06, 0.3, 8]} />
            <meshStandardMaterial
              color="#2a2a2a"
              roughness={0.3}
              metalness={0.7}
            />
          </mesh>
        </group>
      ))}

      {/* Transformer box (on some poles) */}
      {hasTransformer && (
        <mesh
          position={[0, height / 2, 0]}
          castShadow
          receiveShadow
          raycast={() => null}
        >
          <boxGeometry args={[0.6, 0.8, 0.4]} />
          <meshStandardMaterial
            color="#3a4a3a"
            roughness={0.6}
            metalness={0.4}
          />
        </mesh>
      )}

      {/* Guy wire (on some poles) */}
      {hasGuyWire && guyWireLine && (
        <primitive object={guyWireLine} />
      )}
    </group>
  );
}

interface OverheadCablesProps {
  poleData: Array<{
    position: [number, number, number];
    height: number;
    hasTransformer: boolean;
    hasGuyWire: boolean;
  }>;
}

function OverheadCables({ poleData }: OverheadCablesProps) {
  // Group poles by side (left/right)
  const leftPoles = poleData.filter(p => p.position[0] < 0).sort((a, b) => a.position[2] - b.position[2]);
  const rightPoles = poleData.filter(p => p.position[0] > 0).sort((a, b) => a.position[2] - b.position[2]);

  return (
    <group>
      {/* Left side cables */}
      <CableRun poles={leftPoles} />
      
      {/* Right side cables */}
      <CableRun poles={rightPoles} />
    </group>
  );
}

interface CableRunProps {
  poles: Array<{
    position: [number, number, number];
    height: number;
    hasTransformer: boolean;
    hasGuyWire: boolean;
  }>;
}

function CableRun({ poles }: CableRunProps) {
  const sag = 1.2; // Cable sag between poles

  // Create three parallel cables
  const cableOffsets = [-1.4, 0, 1.4];

  // Memoize cable geometries
  const cableGeometries = useMemo(() => {
    return cableOffsets.map((xOffset) => {
      const points: Vector3[] = [];
      
      for (let i = 0; i < poles.length - 1; i++) {
        const start = poles[i];
        const end = poles[i + 1];
        const startHeight = start.height - 1;
        const endHeight = end.height - 1;
        
        // Start point
        points.push(new Vector3(start.position[0] + xOffset, startHeight, start.position[2]));
        
        // Mid-point with sag
        const midX = (start.position[0] + end.position[0]) / 2 + xOffset;
        const midZ = (start.position[2] + end.position[2]) / 2;
        const midHeight = (startHeight + endHeight) / 2 - sag;
        points.push(new Vector3(midX, midHeight, midZ));
        
        // End point
        if (i === poles.length - 2) {
          points.push(new Vector3(end.position[0] + xOffset, endHeight, end.position[2]));
        }
      }

      if (points.length < 2) return null;

      const curve = new CatmullRomCurve3(points);
      return new THREE.TubeGeometry(curve, 64, 0.04, 8, false);
    });
  }, [poles]);

  return (
    <>
      {cableGeometries.map((geometry, cableIndex) => {
        if (!geometry) return null;
        
        return (
          <mesh
            key={cableIndex}
            geometry={geometry}
            castShadow
            receiveShadow
            raycast={() => null}
          >
            <meshStandardMaterial
              color="#1a1a1a"
              roughness={0.6}
              metalness={0.8}
            />
          </mesh>
        );
      })}
    </>
  );
}
