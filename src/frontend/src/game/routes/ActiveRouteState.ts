import { create } from 'zustand';
import { RouteMetadata, Waypoint } from '../../backend';
import { Vector3 } from 'three';

interface ActiveRouteState {
  route: RouteMetadata | null;
  currentWaypointIndex: number;
  distanceToNext: number;
  
  loadRoute: (route: RouteMetadata) => void;
  clearRoute: () => void;
  updateProgress: (truckPosition: Vector3) => void;
}

export const useActiveRoute = create<ActiveRouteState>((set, get) => ({
  route: null,
  currentWaypointIndex: 0,
  distanceToNext: 0,

  loadRoute: (route) => {
    set({
      route,
      currentWaypointIndex: 0,
      distanceToNext: 0,
    });
  },

  clearRoute: () => {
    set({
      route: null,
      currentWaypointIndex: 0,
      distanceToNext: 0,
    });
  },

  updateProgress: (truckPosition) => {
    const state = get();
    if (!state.route || state.route.waypoints.length === 0) return;

    const currentWaypoint = state.route.waypoints[state.currentWaypointIndex];
    if (!currentWaypoint) return;

    const waypointPos = new Vector3(
      currentWaypoint.coordinates.x,
      currentWaypoint.coordinates.y,
      currentWaypoint.coordinates.z
    );

    const distance = truckPosition.distanceTo(waypointPos);
    set({ distanceToNext: distance });

    // Check if reached waypoint (within radius or default 10m)
    const radius = currentWaypoint.radius || 10;
    if (distance < radius) {
      const nextIndex = state.currentWaypointIndex + 1;
      if (nextIndex < state.route.waypoints.length) {
        set({ currentWaypointIndex: nextIndex });
      }
    }
  },
}));

