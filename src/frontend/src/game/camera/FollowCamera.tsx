import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { TruckHandle } from '../vehicle/Truck';
import { GameMode } from '../../App';

interface FollowCameraProps {
  target: React.RefObject<TruckHandle>;
  gameMode: GameMode;
}

export default function FollowCamera({ target, gameMode }: FollowCameraProps) {
  const { camera } = useThree();
  const currentPos = useRef(new Vector3(0, 5, 10));
  const currentLookAt = useRef(new Vector3(0, 0, 0));

  useFrame(() => {
    if (!target.current) return;

    const targetPos = target.current.position;
    const targetRot = target.current.rotation;

    // Different camera settings for drive mode vs route-creator
    const isDriveMode = gameMode === 'drive';
    const distance = isDriveMode ? 20 : 15;
    const height = isDriveMode ? 10 : 8;
    const lookAheadDistance = isDriveMode ? 8 : 0;

    // Calculate desired camera position (behind and above the truck)
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

    // Smooth camera movement (faster in drive mode for better responsiveness)
    const lerpSpeed = isDriveMode ? 0.08 : 0.05;
    currentPos.current.lerp(desiredPos, lerpSpeed);
    camera.position.copy(currentPos.current);

    // Look ahead of the truck in drive mode for better road visibility
    const lookAhead = new Vector3(
      Math.sin(targetRot) * lookAheadDistance,
      0,
      Math.cos(targetRot) * lookAheadDistance
    );

    const lookAtTarget = new Vector3(
      targetPos.x + lookAhead.x, 
      targetPos.y + 1, 
      targetPos.z + lookAhead.z
    );
    currentLookAt.current.lerp(lookAtTarget, 0.1);
    camera.lookAt(currentLookAt.current);
  });

  return null;
}
