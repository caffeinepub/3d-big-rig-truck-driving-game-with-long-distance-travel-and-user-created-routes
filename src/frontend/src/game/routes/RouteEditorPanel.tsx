import { useState } from 'react';
import { useRouteCreator } from './RouteCreatorState';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useSaveRoute } from '../../hooks/useQueries';
import { ArrowUp, ArrowDown, Trash2, Save } from 'lucide-react';
import { Variant_checkpoint_start_finish_obstacle_standard } from '../../backend';

interface RouteEditorPanelProps {
  onSwitchToDrive: () => void;
}

export default function RouteEditorPanel({ onSwitchToDrive }: RouteEditorPanelProps) {
  const { 
    waypoints, 
    routeName, 
    routeDescription, 
    setRouteName, 
    setRouteDescription,
    removeWaypoint,
    reorderWaypoints,
    clearRoute,
    isValid 
  } = useRouteCreator();

  const { identity } = useInternetIdentity();
  const saveRouteMutation = useSaveRoute();
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!identity) {
      setSaveError('Please log in to save routes');
      return;
    }

    if (!isValid()) {
      setSaveError('Route must have a name and at least 2 waypoints');
      return;
    }

    try {
      const routeData = {
        id: `route-${Date.now()}`,
        author: identity.getPrincipal(),
        name: routeName,
        description: routeDescription,
        difficulty: undefined,
        created: BigInt(Date.now() * 1000000),
        updated: BigInt(Date.now() * 1000000),
        length: 0,
        waypoints: waypoints.map(wp => ({
          coordinates: {
            x: wp.coordinates[0],
            y: wp.coordinates[1],
            z: wp.coordinates[2],
          },
          waypointType: Variant_checkpoint_start_finish_obstacle_standard.standard,
          labelText: undefined,
          radius: undefined,
        })),
      };

      await saveRouteMutation.mutateAsync(routeData);
      setSaveError(null);
      clearRoute();
      onSwitchToDrive();
    } catch (error: any) {
      setSaveError(error.message || 'Failed to save route');
    }
  };

  const moveWaypoint = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < waypoints.length) {
      reorderWaypoints(index, newIndex);
    }
  };

  return (
    <div className="absolute right-4 top-20 bottom-20 w-80 bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-2xl overflow-hidden flex flex-col z-20">
      <div className="p-4 border-b border-border bg-primary/10">
        <h2 className="text-lg font-bold text-foreground">Route Creator</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Click on the ground to add waypoints
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Route Info */}
        <div className="space-y-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Route Name *</label>
            <input
              type="text"
              value={routeName}
              onChange={(e) => setRouteName(e.target.value)}
              placeholder="My Awesome Route"
              className="w-full mt-1 px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Description</label>
            <textarea
              value={routeDescription}
              onChange={(e) => setRouteDescription(e.target.value)}
              placeholder="Optional description..."
              rows={2}
              className="w-full mt-1 px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>
        </div>

        {/* Waypoints List */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-muted-foreground">
              Waypoints ({waypoints.length})
            </label>
            {waypoints.length > 0 && (
              <button
                onClick={clearRoute}
                className="text-xs text-destructive hover:text-destructive/80"
              >
                Clear All
              </button>
            )}
          </div>

          {waypoints.length === 0 ? (
            <div className="text-xs text-muted-foreground text-center py-8 border border-dashed border-border rounded-md">
              No waypoints yet.<br />Click on the ground to add.
            </div>
          ) : (
            <div className="space-y-2">
              {waypoints.map((wp, index) => (
                <div
                  key={wp.id}
                  className="flex items-center gap-2 p-2 bg-accent/50 rounded-md border border-border"
                >
                  <div className="flex-1 text-xs">
                    <div className="font-medium">Waypoint {index + 1}</div>
                    <div className="text-muted-foreground">
                      ({wp.coordinates[0].toFixed(1)}, {wp.coordinates[2].toFixed(1)})
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => moveWaypoint(index, 'up')}
                      disabled={index === 0}
                      className="p-1 hover:bg-background rounded disabled:opacity-30"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => moveWaypoint(index, 'down')}
                      disabled={index === waypoints.length - 1}
                      className="p-1 hover:bg-background rounded disabled:opacity-30"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => removeWaypoint(wp.id)}
                      className="p-1 hover:bg-destructive/20 text-destructive rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Validation Messages */}
        {!isValid() && waypoints.length > 0 && (
          <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-md p-2">
            {!routeName.trim() && '• Route name is required\n'}
            {waypoints.length < 2 && '• At least 2 waypoints required'}
          </div>
        )}

        {saveError && (
          <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-2">
            {saveError}
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="p-4 border-t border-border bg-card">
        <button
          onClick={handleSave}
          disabled={!isValid() || saveRouteMutation.isPending}
          className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saveRouteMutation.isPending ? 'Saving...' : 'Save Route'}
        </button>
      </div>
    </div>
  );
}

