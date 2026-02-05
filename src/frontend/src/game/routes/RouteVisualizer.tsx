import { useMemo } from 'react';
import { Vector3, CatmullRomCurve3 } from 'three';
import { Line } from '@react-three/drei';
import { Coordinates } from '../../backend';

interface RouteVisualizerProps {
  waypoints: Coordinates[];
  isEditing: boolean;
  currentWaypointIndex?: number;
}

export default function RouteVisualizer({ waypoints, isEditing, currentWaypointIndex = 0 }: RouteVisualizerProps) {
  const points = useMemo(() => {
    return waypoints.map(wp => new Vector3(wp.x, wp.y, wp.z));
  }, [waypoints]);

  const pathPoints = useMemo(() => {
    if (points.length < 2) return [];
    const curve = new CatmullRomCurve3(points);
    return curve.getPoints(points.length * 10);
  }, [points]);

  return (
    <group>
      {/* Waypoint markers */}
      {waypoints.map((wp, index) => {
        const isCurrent = !isEditing && index === currentWaypointIndex;
        const isPassed = !isEditing && index < currentWaypointIndex;
        
        return (
          <group key={index} position={[wp.x, wp.y, wp.z]}>
            {/* Marker pole */}
            <mesh position={[0, 2, 0]}>
              <cylinderGeometry args={[0.1, 0.1, 4, 8]} />
              <meshStandardMaterial 
                color={isCurrent ? '#ff6600' : isPassed ? '#666666' : '#ffaa00'} 
                emissive={isCurrent ? '#ff6600' : '#000000'}
                emissiveIntensity={isCurrent ? 0.5 : 0}
              />
            </mesh>
            
            {/* Marker flag */}
            <mesh position={[0.5, 3.5, 0]}>
              <boxGeometry args={[1, 0.6, 0.05]} />
              <meshStandardMaterial 
                color={isCurrent ? '#ff6600' : isPassed ? '#666666' : '#ffaa00'}
                emissive={isCurrent ? '#ff6600' : '#000000'}
                emissiveIntensity={isCurrent ? 0.5 : 0}
              />
            </mesh>

            {/* Number label */}
            <mesh position={[0, 4.5, 0]}>
              <sphereGeometry args={[0.3, 16, 16]} />
              <meshStandardMaterial 
                color={isCurrent ? '#ff3300' : '#ffcc00'}
                emissive={isCurrent ? '#ff3300' : '#ffcc00'}
                emissiveIntensity={0.8}
              />
            </mesh>
          </group>
        );
      })}

      {/* Path line */}
      {pathPoints.length > 0 && (
        <Line
          points={pathPoints}
          color={isEditing ? '#ffaa00' : '#ff8800'}
          lineWidth={3}
          dashed={false}
        />
      )}
    </group>
  );
}

