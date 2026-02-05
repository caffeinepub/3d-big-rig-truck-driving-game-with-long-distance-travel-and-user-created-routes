import { useState } from 'react';
import { useGetAllRoutes, useDeleteRoute } from '../../hooks/useQueries';
import { RouteMetadata } from '../../backend';
import { X, Trash2, Calendar, MapPin } from 'lucide-react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';

interface RoutesPanelProps {
  onClose: () => void;
  onLoadRoute: (route: RouteMetadata) => void;
}

export default function RoutesPanel({ onClose, onLoadRoute }: RoutesPanelProps) {
  const { data: routes, isLoading } = useGetAllRoutes();
  const deleteRouteMutation = useDeleteRoute();
  const { identity } = useInternetIdentity();
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);

  const handleLoadRoute = async (routeId: string) => {
    const route = routes?.find(r => r.id === routeId);
    if (!route) return;

    // Fetch full route with waypoints
    const { useGetRouteWithWaypoints } = await import('../../hooks/useQueries');
    // For now, we'll construct it from the summary
    // In a real app, you'd fetch the full route here
    onLoadRoute(route as any);
  };

  const handleDelete = async (routeId: string, authorPrincipal: string) => {
    if (!identity) return;
    
    // Check if user is the author
    if (identity.getPrincipal().toString() !== authorPrincipal) {
      alert('You can only delete your own routes');
      return;
    }

    if (confirm('Are you sure you want to delete this route?')) {
      try {
        await deleteRouteMutation.mutateAsync(routeId);
      } catch (error: any) {
        alert(error.message || 'Failed to delete route');
      }
    }
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString();
  };

  return (
    <div className="absolute left-4 top-20 bottom-20 w-96 bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-2xl overflow-hidden flex flex-col z-20">
      <div className="p-4 border-b border-border bg-primary/10 flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Saved Routes</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-background rounded-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading routes...
          </div>
        ) : !routes || routes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No routes yet.</p>
            <p className="text-xs mt-1">Create your first route!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {routes.map((route) => {
              const isAuthor = identity?.getPrincipal().toString() === route.author.toString();
              
              return (
                <div
                  key={route.id}
                  className={`p-3 bg-accent/50 border rounded-lg hover:bg-accent/70 transition-colors cursor-pointer ${
                    selectedRouteId === route.id ? 'border-primary' : 'border-border'
                  }`}
                  onClick={() => setSelectedRouteId(route.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">
                        {route.name}
                      </h3>
                      {route.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {route.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {Number(route.waypointCount)} waypoints
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(route.updated)}
                        </span>
                      </div>
                    </div>
                    {isAuthor && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(route.id, route.author.toString());
                        }}
                        className="p-1 hover:bg-destructive/20 text-destructive rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {selectedRouteId === route.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLoadRoute(route.id);
                      }}
                      className="w-full mt-3 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      Load Route
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

