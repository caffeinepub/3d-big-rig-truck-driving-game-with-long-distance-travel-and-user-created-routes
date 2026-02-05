# Specification

## Summary
**Goal:** Improve realism and variety in the 3D driving world by enhancing road/power line/truck visuals, adding ambient NPC traffic, and introducing highway/bridge and gas stop set dressing.

**Planned changes:**
- Upgrade the main road corridor visuals with more realistic asphalt detail and clear lane/edge definition while preserving the existing road layout and texture tiling/repeat performance.
- Enhance roadside power lines with more detailed/varied poles and more believable cable runs, keeping deterministic placement and ensuring they don’t block ground clicks in route-creation mode.
- Improve the drivable truck’s visual model to be more truck-like (cab/chassis/wheels) without changing driving controls or the existing TruckHandle state contract used by camera/HUD/audio.
- Add continuous ambient NPC traffic cars that spawn/loop along the road, pass the player, and do not interfere with route editing clicks.
- Add additional road features: at least one highway-style (wider/multi-lane) segment and at least one bridge/overpass element, placed so they can be encountered while driving and do not break route creation interactions.
- Add at least one recognizable gas stop structure near the road/highway (visual set dressing only) using lightweight primitives/materials and generated textures, ensuring it doesn’t block route-creator ground clicks.
- Add newly generated textures under `frontend/public/assets/generated` and update world/vehicle components to load them via the existing frontend texture-loading approach.

**User-visible outcome:** Roads, power lines, and the truck look more realistic; NPC cars continuously drive by; and the world includes visible highway/bridge features and a gas stop point of interest while route creation remains usable.
