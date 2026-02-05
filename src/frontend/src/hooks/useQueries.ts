import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { RouteMetadata, RouteSummary } from '../backend';

export function useGetAllRoutes() {
  const { actor, isFetching } = useActor();

  return useQuery<RouteSummary[]>({
    queryKey: ['routes'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllRoutes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetRouteWithWaypoints(routeId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<RouteMetadata | null>({
    queryKey: ['route', routeId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getRouteWithWaypoints(routeId);
    },
    enabled: !!actor && !isFetching && !!routeId,
  });
}

export function useSaveRoute() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (route: RouteMetadata) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addOrUpdateRoute(route);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    },
  });
}

export function useDeleteRoute() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (routeId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteRoute(routeId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    },
  });
}

