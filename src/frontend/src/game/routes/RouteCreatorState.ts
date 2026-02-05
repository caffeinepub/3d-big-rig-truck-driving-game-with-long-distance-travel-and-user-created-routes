import { create } from 'zustand';

export interface WaypointDraft {
  coordinates: [number, number, number];
  id: string;
}

interface RouteCreatorState {
  waypoints: WaypointDraft[];
  routeName: string;
  routeDescription: string;
  selectedWaypointId: string | null;
  
  addWaypoint: (coordinates: [number, number, number]) => void;
  removeWaypoint: (id: string) => void;
  updateWaypoint: (id: string, coordinates: [number, number, number]) => void;
  reorderWaypoints: (startIndex: number, endIndex: number) => void;
  setRouteName: (name: string) => void;
  setRouteDescription: (description: string) => void;
  setSelectedWaypoint: (id: string | null) => void;
  clearRoute: () => void;
  isValid: () => boolean;
}

export const useRouteCreator = create<RouteCreatorState>((set, get) => ({
  waypoints: [],
  routeName: '',
  routeDescription: '',
  selectedWaypointId: null,

  addWaypoint: (coordinates) => {
    const id = `wp-${Date.now()}-${Math.random()}`;
    set((state) => ({
      waypoints: [...state.waypoints, { coordinates, id }],
    }));
  },

  removeWaypoint: (id) => {
    set((state) => ({
      waypoints: state.waypoints.filter((wp) => wp.id !== id),
      selectedWaypointId: state.selectedWaypointId === id ? null : state.selectedWaypointId,
    }));
  },

  updateWaypoint: (id, coordinates) => {
    set((state) => ({
      waypoints: state.waypoints.map((wp) =>
        wp.id === id ? { ...wp, coordinates } : wp
      ),
    }));
  },

  reorderWaypoints: (startIndex, endIndex) => {
    set((state) => {
      const result = Array.from(state.waypoints);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return { waypoints: result };
    });
  },

  setRouteName: (name) => set({ routeName: name }),
  setRouteDescription: (description) => set({ routeDescription: description }),
  setSelectedWaypoint: (id) => set({ selectedWaypointId: id }),
  
  clearRoute: () => set({
    waypoints: [],
    routeName: '',
    routeDescription: '',
    selectedWaypointId: null,
  }),

  isValid: () => {
    const state = get();
    return state.waypoints.length >= 2 && state.routeName.trim().length > 0;
  },
}));

