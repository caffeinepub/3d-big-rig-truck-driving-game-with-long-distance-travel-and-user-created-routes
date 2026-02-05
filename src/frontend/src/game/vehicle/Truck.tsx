import { useRef, forwardRef, useImperativeHandle } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Mesh, Vector3, Raycaster } from 'three';
import { GameMode, VehicleVariant } from '../../App';

interface TruckProps {
  gameMode: GameMode;
  vehicleVariant: VehicleVariant;
}

export interface TruckHandle {
  position: Vector3;
  velocity: Vector3;
  rotation: number;
  speed: number;
  isAccelerating: boolean;
}

const Truck = forwardRef<TruckHandle, TruckProps>(({ gameMode, vehicleVariant }, ref) => {
  const groupRef = useRef<any>(null);
  const velocity = useRef(new Vector3(0, 0, 0));
  const speed = useRef(0);
  const rotation = useRef(0);
  const steering = useRef(0);
  const isAccelerating = useRef(false);
  const { scene } = useThree();

  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  useImperativeHandle(ref, () => ({
    get position() {
      return groupRef.current?.position || new Vector3();
    },
    get velocity() {
      return velocity.current;
    },
    get rotation() {
      return rotation.current;
    },
    get speed() {
      return speed.current;
    },
    get isAccelerating() {
      return isAccelerating.current;
    },
  }));

  // Keyboard controls
  useFrame(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameMode !== 'drive') return;
      
      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          keys.current.forward = true;
          break;
        case 's':
        case 'arrowdown':
          keys.current.backward = true;
          break;
        case 'a':
        case 'arrowleft':
          keys.current.left = true;
          break;
        case 'd':
        case 'arrowright':
          keys.current.right = true;
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          keys.current.forward = false;
          break;
        case 's':
        case 'arrowdown':
          keys.current.backward = false;
          break;
        case 'a':
        case 'arrowleft':
          keys.current.left = false;
          break;
        case 'd':
        case 'arrowright':
          keys.current.right = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  });

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    if (gameMode !== 'drive') return;

    const maxSpeed = 30;
    const acceleration = 15;
    const braking = 20;
    const turnSpeed = 1.5;
    const friction = 5;

    // Track acceleration state
    isAccelerating.current = keys.current.forward || keys.current.backward;

    // Acceleration
    if (keys.current.forward) {
      speed.current = Math.min(speed.current + acceleration * delta, maxSpeed);
    } else if (keys.current.backward) {
      speed.current = Math.max(speed.current - braking * delta, -maxSpeed * 0.5);
    } else {
      // Apply friction
      if (speed.current > 0) {
        speed.current = Math.max(0, speed.current - friction * delta);
      } else if (speed.current < 0) {
        speed.current = Math.min(0, speed.current + friction * delta);
      }
    }

    // Steering (only when moving)
    if (Math.abs(speed.current) > 0.1) {
      if (keys.current.left) {
        steering.current = turnSpeed;
      } else if (keys.current.right) {
        steering.current = -turnSpeed;
      } else {
        steering.current = 0;
      }

      rotation.current += steering.current * delta * (speed.current / maxSpeed);
    }

    // Update velocity
    velocity.current.set(
      Math.sin(rotation.current) * speed.current,
      0,
      Math.cos(rotation.current) * speed.current
    );

    // Update position
    groupRef.current.position.add(velocity.current.clone().multiplyScalar(delta));

    // Height following for bridges/ramps
    const raycaster = new Raycaster();
    const rayOrigin = new Vector3(
      groupRef.current.position.x,
      groupRef.current.position.y + 10,
      groupRef.current.position.z
    );
    raycaster.set(rayOrigin, new Vector3(0, -1, 0));
    
    const intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length > 0) {
      const groundHeight = intersects[0].point.y;
      groupRef.current.position.y = groundHeight + 1;
    }

    groupRef.current.rotation.y = rotation.current;
  });

  return (
    <group ref={groupRef} position={[0, 1, 0]}>
      {/* Truck cab - detailed semi-truck */}
      <group position={[0, 0, 0.5]}>
        {/* Main cab body */}
        <mesh castShadow position={[0, 1.2, 0]}>
          <boxGeometry args={[2.2, 2.2, 2.5]} />
          <meshStandardMaterial color="#c44" roughness={0.6} metalness={0.3} />
        </mesh>
        
        {/* Hood/engine compartment */}
        <mesh castShadow position={[0, 0.8, 1.5]}>
          <boxGeometry args={[2.2, 1.4, 1]} />
          <meshStandardMaterial color="#b33" roughness={0.5} metalness={0.4} />
        </mesh>
        
        {/* Windshield */}
        <mesh castShadow position={[0, 1.6, 0.8]}>
          <boxGeometry args={[2, 1.2, 0.1]} />
          <meshStandardMaterial color="#222" roughness={0.1} metalness={0.9} />
        </mesh>
        
        {/* Grille */}
        <mesh castShadow position={[0, 0.8, 2.05]}>
          <boxGeometry args={[1.8, 1, 0.1]} />
          <meshStandardMaterial color="#111" roughness={0.7} metalness={0.5} />
        </mesh>
        
        {/* Headlights */}
        <mesh castShadow position={[-0.7, 0.8, 2.1]}>
          <boxGeometry args={[0.3, 0.3, 0.1]} />
          <meshStandardMaterial color="#ffeb3b" emissive="#ffeb3b" emissiveIntensity={0.5} />
        </mesh>
        <mesh castShadow position={[0.7, 0.8, 2.1]}>
          <boxGeometry args={[0.3, 0.3, 0.1]} />
          <meshStandardMaterial color="#ffeb3b" emissive="#ffeb3b" emissiveIntensity={0.5} />
        </mesh>
        
        {/* Side mirrors */}
        <mesh castShadow position={[-1.3, 1.5, 0.5]}>
          <boxGeometry args={[0.2, 0.3, 0.4]} />
          <meshStandardMaterial color="#222" roughness={0.4} metalness={0.6} />
        </mesh>
        <mesh castShadow position={[1.3, 1.5, 0.5]}>
          <boxGeometry args={[0.2, 0.3, 0.4]} />
          <meshStandardMaterial color="#222" roughness={0.4} metalness={0.6} />
        </mesh>
        
        {/* Exhaust stacks */}
        <mesh castShadow position={[-0.8, 2.5, -0.5]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 1.2, 8]} />
          <meshStandardMaterial color="#333" roughness={0.8} metalness={0.5} />
        </mesh>
        <mesh castShadow position={[0.8, 2.5, -0.5]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 1.2, 8]} />
          <meshStandardMaterial color="#333" roughness={0.8} metalness={0.5} />
        </mesh>
      </group>

      {/* Chassis rails connecting cab to trailer */}
      <mesh castShadow position={[-0.8, 0.4, -1.5]}>
        <boxGeometry args={[0.2, 0.3, 5]} />
        <meshStandardMaterial color="#222" roughness={0.7} metalness={0.4} />
      </mesh>
      <mesh castShadow position={[0.8, 0.4, -1.5]}>
        <boxGeometry args={[0.2, 0.3, 5]} />
        <meshStandardMaterial color="#222" roughness={0.7} metalness={0.4} />
      </mesh>

      {/* Truck trailer */}
      <mesh castShadow position={[0, 1.8, -4.5]}>
        <boxGeometry args={[2.4, 3.2, 6]} />
        <meshStandardMaterial color="#ddd" roughness={0.6} metalness={0.2} />
      </mesh>
      
      {/* Trailer rear doors */}
      <mesh castShadow position={[0, 1.8, -7.55]}>
        <boxGeometry args={[2.3, 3, 0.1]} />
        <meshStandardMaterial color="#ccc" roughness={0.7} metalness={0.3} />
      </mesh>

      {/* Front wheels (steerable) */}
      {[
        [-1.1, 0, 1.2],
        [1.1, 0, 1.2],
      ].map((pos, i) => (
        <group key={`front-${i}`} position={pos as [number, number, number]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.5, 0.5, 0.4, 16]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
          </mesh>
          {/* Wheel rim */}
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 0.45, 8]} />
            <meshStandardMaterial color="#444" roughness={0.5} metalness={0.6} />
          </mesh>
        </group>
      ))}

      {/* Rear cab wheels */}
      {[
        [-1.1, 0, -0.8],
        [1.1, 0, -0.8],
      ].map((pos, i) => (
        <group key={`cab-rear-${i}`} position={pos as [number, number, number]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.5, 0.5, 0.4, 16]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 0.45, 8]} />
            <meshStandardMaterial color="#444" roughness={0.5} metalness={0.6} />
          </mesh>
        </group>
      ))}

      {/* Trailer wheels (dual axles) */}
      {[
        [-1.2, 0, -4.5],
        [1.2, 0, -4.5],
        [-1.2, 0, -6],
        [1.2, 0, -6],
      ].map((pos, i) => (
        <group key={`trailer-${i}`} position={pos as [number, number, number]}>
          {/* Outer wheel */}
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow position={[pos[0] > 0 ? 0.2 : -0.2, 0, 0]}>
            <cylinderGeometry args={[0.5, 0.5, 0.3, 16]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
          </mesh>
          {/* Inner wheel */}
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow position={[pos[0] > 0 ? -0.2 : 0.2, 0, 0]}>
            <cylinderGeometry args={[0.5, 0.5, 0.3, 16]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
          </mesh>
          {/* Rim */}
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 0.5, 8]} />
            <meshStandardMaterial color="#444" roughness={0.5} metalness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
});

Truck.displayName = 'Truck';

export default Truck;
