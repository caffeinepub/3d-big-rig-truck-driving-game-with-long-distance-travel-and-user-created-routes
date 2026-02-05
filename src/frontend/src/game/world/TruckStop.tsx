import { Text } from '@react-three/drei';

export default function TruckStop() {
  return (
    <group position={[40, 0, 200]}>
      {/* Parking lot surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow raycast={() => null}>
        <planeGeometry args={[40, 60]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.9} />
      </mesh>

      {/* Parking bay markings */}
      {[0, 1, 2, 3].map(i => (
        <group key={i} position={[0, 0, -20 + i * 13]}>
          {/* Bay lines */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-15, 0.02, 0]} raycast={() => null}>
            <planeGeometry args={[0.2, 12]} />
            <meshStandardMaterial color="#ffeb3b" roughness={0.8} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[15, 0.02, 0]} raycast={() => null}>
            <planeGeometry args={[0.2, 12]} />
            <meshStandardMaterial color="#ffeb3b" roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Main sign structure */}
      <group position={[0, 5, -35]}>
        {/* Sign board */}
        <mesh castShadow raycast={() => null}>
          <boxGeometry args={[12, 4, 0.3]} />
          <meshStandardMaterial color="#cc3333" roughness={0.6} metalness={0.2} />
        </mesh>
        
        {/* Sign text */}
        <Text
          position={[0, 0.8, 0.16]}
          fontSize={1.2}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          font="/fonts/Inter-Bold.woff"
        >
          TRUCK STOP
        </Text>
        <Text
          position={[0, -0.8, 0.16]}
          fontSize={0.6}
          color="#ffeb3b"
          anchorX="center"
          anchorY="middle"
        >
          TRUCKS ONLY PARKING
        </Text>

        {/* Sign posts */}
        <mesh position={[-5, -3.5, 0]} castShadow raycast={() => null}>
          <cylinderGeometry args={[0.2, 0.2, 5, 12]} />
          <meshStandardMaterial color="#444" roughness={0.8} metalness={0.4} />
        </mesh>
        <mesh position={[5, -3.5, 0]} castShadow raycast={() => null}>
          <cylinderGeometry args={[0.2, 0.2, 5, 12]} />
          <meshStandardMaterial color="#444" roughness={0.8} metalness={0.4} />
        </mesh>
      </group>

      {/* Rest area building */}
      <mesh castShadow receiveShadow position={[0, 2.5, 25]} raycast={() => null}>
        <boxGeometry args={[20, 5, 10]} />
        <meshStandardMaterial color="#5a4a3a" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Building roof */}
      <mesh castShadow position={[0, 5.5, 25]} raycast={() => null}>
        <boxGeometry args={[22, 0.5, 12]} />
        <meshStandardMaterial color="#3a2a1a" roughness={0.9} />
      </mesh>

      {/* Entrance canopy */}
      <mesh castShadow position={[0, 3, 19]} raycast={() => null}>
        <boxGeometry args={[8, 0.3, 4]} />
        <meshStandardMaterial color="#4a3a2a" roughness={0.7} metalness={0.3} />
      </mesh>

      {/* Canopy support posts */}
      {[-3, 3].map(xOff => (
        <mesh key={xOff} castShadow position={[xOff, 1.5, 19]} raycast={() => null}>
          <cylinderGeometry args={[0.15, 0.15, 3, 8]} />
          <meshStandardMaterial color="#555" roughness={0.8} />
        </mesh>
      ))}

      {/* Fuel pumps for trucks */}
      {[-8, 8].map(xOff => (
        <group key={xOff} position={[xOff, 0, 5]}>
          <mesh castShadow position={[0, 1.2, 0]} raycast={() => null}>
            <boxGeometry args={[1, 2.4, 0.6]} />
            <meshStandardMaterial color="#cc3333" roughness={0.6} metalness={0.3} />
          </mesh>
          <mesh castShadow position={[0, 2.6, 0]} raycast={() => null}>
            <boxGeometry args={[0.8, 0.4, 0.4]} />
            <meshStandardMaterial color="#222" roughness={0.5} metalness={0.6} />
          </mesh>
        </group>
      ))}

      {/* Lighting poles */}
      {[-15, 0, 15].map(xOff => (
        <group key={xOff} position={[xOff, 0, 10]}>
          <mesh castShadow position={[0, 4, 0]} raycast={() => null}>
            <cylinderGeometry args={[0.1, 0.15, 8, 8]} />
            <meshStandardMaterial color="#333" roughness={0.8} />
          </mesh>
          <mesh position={[0, 8, 0]} raycast={() => null}>
            <sphereGeometry args={[0.3, 12, 12]} />
            <meshStandardMaterial
              color="#ffeb3b"
              emissive="#ffeb3b"
              emissiveIntensity={0.4}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
