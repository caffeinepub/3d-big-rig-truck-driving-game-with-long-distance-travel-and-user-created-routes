# Specification

## Summary
**Goal:** Expand the driving world so players can continuously drive on endless highways (including drivable bridges) with added roadside points of interest, new camera and movement modes, and a clearer semi-truck vehicle option.

**Planned changes:**
- Remove the forced truck reset/teleport behavior during driving so the vehicle is not snapped back after traveling far.
- Implement an infinite highway system by reusing/repositioning road segments to eliminate any visible “end of road” while keeping performance stable.
- Add at least one drivable bridge/overpass section with a driveable deck, collision, and height-following so the truck can drive onto and across elevated roadway.
- Add occasional randomized “construction ahead” roadside/roadway events (cones/barrels/signs/barriers and lane-closure style setups) that recycle with the infinite road system.
- Add random power station/substation landmarks placed believably off the main lane with stable placement (no flickering/popping at the same spot).
- Add city/town clusters as recognizable dense building groups that appear along the drive and integrate with the infinite world approach.
- Add at least one semi-truck-only rest stop location near the highway with clear “TRUCKS ONLY” / “TRUCK PARKING” signage and semi-suitable parking bays.
- Add a toggleable cab/seat-view camera mode in addition to the existing chase camera without breaking controls/HUD.
- Add a Walk Mode that can be entered/exited, with movement on W/A/S/D and arrow keys, and update the on-screen controls help based on the active mode.
- Add a more clearly semi-truck (tractor + trailer styling) vehicle option/variant while keeping existing driving controls and the existing truck state interface used by camera/HUD/audio.

**User-visible outcome:** The player can drive continuously on highways that feel endless (including drivable bridges), encounter occasional construction zones, pass power stations and city clusters, pull into a truck-only rest stop, toggle between chase and in-cab camera views, switch into an on-foot walk mode with updated control hints, and use a more clearly “semi-truck” vehicle.
