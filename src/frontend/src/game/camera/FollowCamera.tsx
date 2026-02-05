import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { TruckHandle } from '../vehicle/Truck';
import { WalkerHandle } from '../vehicle/Walker';
import { GameMode } from '../../App';

interface FollowCameraProps {
  target: React.RefObject<TruckHandle | WalkerHandle>;
  gameMode: GameMode;
  cameraMode?: 'chase' | 'cab';
}

export default function FollowCamera({ target, gameMode, cameraMode = 'chase' }: FollowCameraProps) {
  const { camera } = useThree();
  const currentPos = useRef(new Vector3(0, 5, 10));
  const currentLookAt = useRef(new Vector3(0, 0, 0));

  useFrame(() => {
    if (!target.current) return;

    const targetPos = target.current.position;
    const targetRot = target.current.rotation;

    // Different camera settings based on mode
    const isDriveMode = gameMode === 'drive';
    const isWalkMode = gameMode === 'walk';

    let distance: number;
    let height: number;
    let lookAheadDistance: number;

    if (isWalkMode) {
      // Walk mode camera
      distance = 8;
      height = 4;
      lookAheadDistance = 2;
    } else if (isDriveMode && cameraMode === 'cab') {
      // Cab view camera (inside truck)
      distance = -2;
      height = 2.5;
      lookAheadDistance = 15;
    } else if (isDriveMode) {
      // Chase camera for driving
      distance = 20;
      height = 10;
      lookAheadDistance = 8;
    } else {
      // Route creator mode
      distance = 15;
      height = 8;
      lookAheadDistance = 0;
    }

    // Calculate desired camera position
    const offset = new Vector3(
      Math.sin(targetRot) * -distance,
      height,
      Math.cos(targetRot) * -distance
    );

    const desiredPos = new Vector3(
      targetPos.x + offset.x,
      targetPos.y + offset.y,
      targetPos.z + offset.z
    );

    // Smooth camera movement
    const lerpSpeed = cameraMode === 'cab' ? 0.15 : (isDriveMode ? 0.08 : 0.05);
    currentPos.current.lerp(desiredPos, lerpSpeed);
    camera.position.copy(currentPos.current);

    // Look ahead
    const lookAhead = new Vector3(
      Math.sin(targetRot) * lookAheadDistance,
      0,
      Math.cos(targetRot) * lookAheadDistance
    );

    const lookAtTarget = new Vector3(
      targetPos.x + lookAhead.x, 
      targetPos.y + (cameraMode === 'cab' ? 2 : 1), 
      targetPos.z + lookAhead.z
    );
    currentLookAt.current.lerp(lookAtTarget, 0.1);
    camera.lookAt(currentLookAt.current);
  });

  return null;
}
