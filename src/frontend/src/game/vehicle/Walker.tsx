import { useRef, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';

export interface WalkerHandle {
  position: Vector3;
  rotation: number;
  speed: number;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface WalkerProps {}

const Walker = forwardRef<WalkerHandle, WalkerProps>((props, ref) => {
  const groupRef = useRef<any>(null);
  const rotation = useRef(0);
  const speed = useRef(0);

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
    get rotation() {
      return rotation.current;
    },
    get speed() {
      return speed.current;
    },
  }));

  // Keyboard controls
  useFrame(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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

    const walkSpeed = 5;
    const turnSpeed = 2;

    let moveX = 0;
    let moveZ = 0;

    // Forward/backward movement
    if (keys.current.forward) {
      moveZ = 1;
    } else if (keys.current.backward) {
      moveZ = -1;
    }

    // Left/right movement
    if (keys.current.left) {
      moveX = -1;
    } else if (keys.current.right) {
      moveX = 1;
    }

    // Calculate movement direction
    if (moveX !== 0 || moveZ !== 0) {
      const targetRotation = Math.atan2(moveX, moveZ);
      rotation.current = targetRotation;
      
      const moveVector = new Vector3(moveX, 0, moveZ).normalize().multiplyScalar(walkSpeed * delta);
      groupRef.current.position.add(moveVector);
      
      speed.current = walkSpeed;
    } else {
      speed.current = 0;
    }

    groupRef.current.rotation.y = rotation.current;
  });

  return (
    <group ref={groupRef} position={[0, 0.9, 0]}>
      {/* Body */}
      <mesh castShadow position={[0, 0.5, 0]}>
        <capsuleGeometry args={[0.3, 0.8, 8, 16]} />
        <meshStandardMaterial color="#4a7c9a" roughness={0.7} metalness={0.2} />
      </mesh>
      
      {/* Head */}
      <mesh castShadow position={[0, 1.2, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color="#d4a574" roughness={0.8} metalness={0.1} />
      </mesh>

      {/* Arms */}
      <mesh castShadow position={[-0.4, 0.6, 0]}>
        <capsuleGeometry args={[0.08, 0.5, 4, 8]} />
        <meshStandardMaterial color="#4a7c9a" roughness={0.7} metalness={0.2} />
      </mesh>
      <mesh castShadow position={[0.4, 0.6, 0]}>
        <capsuleGeometry args={[0.08, 0.5, 4, 8]} />
        <meshStandardMaterial color="#4a7c9a" roughness={0.7} metalness={0.2} />
      </mesh>

      {/* Legs */}
      <mesh castShadow position={[-0.15, -0.2, 0]}>
        <capsuleGeometry args={[0.1, 0.6, 4, 8]} />
        <meshStandardMaterial color="#2a3a4a" roughness={0.8} metalness={0.1} />
      </mesh>
      <mesh castShadow position={[0.15, -0.2, 0]}>
        <capsuleGeometry args={[0.1, 0.6, 4, 8]} />
        <meshStandardMaterial color="#2a3a4a" roughness={0.8} metalness={0.1} />
      </mesh>
    </group>
  );
});

Walker.displayName = 'Walker';

export default Walker;
