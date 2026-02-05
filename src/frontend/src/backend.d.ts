import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Coordinates {
    x: number;
    y: number;
    z: number;
}
export interface RouteMetadata {
    id: string;
    created: bigint;
    difficulty?: string;
    name: string;
    waypoints: Array<Waypoint>;
    description: string;
    author: Principal;
    updated: bigint;
    length: number;
}
export interface Waypoint {
    labelText?: string;
    waypointType: Variant_checkpoint_start_finish_obstacle_standard;
    radius?: number;
    coordinates: Coordinates;
}
export interface RouteSummary {
    id: string;
    created: bigint;
    difficulty?: string;
    name: string;
    description: string;
    waypointCount: bigint;
    author: Principal;
    updated: bigint;
    length: number;
}
export interface Route {
    id: string;
    created: bigint;
    difficulty?: string;
    name: string;
    waypoints: Array<Waypoint>;
    description: string;
    author: Principal;
    updated: bigint;
    length: number;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_checkpoint_start_finish_obstacle_standard {
    checkpoint = "checkpoint",
    start = "start",
    finish = "finish",
    obstacle = "obstacle",
    standard = "standard"
}
export interface backendInterface {
    addOrUpdateRoute(metadata: RouteMetadata): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteRoute(id: string): Promise<void>;
    getAllRoutes(): Promise<Array<RouteSummary>>;
    getCallerUserRole(): Promise<UserRole>;
    getOldAllRoutes(): Promise<Array<Route>>;
    getRouteSummary(id: string): Promise<RouteSummary | null>;
    getRouteWithWaypoints(id: string): Promise<RouteMetadata | null>;
    getRoutesByAuthor(author: Principal): Promise<Array<RouteSummary>>;
    getRoutesByDifficulty(difficulty: string): Promise<Array<RouteSummary>>;
    isCallerAdmin(): Promise<boolean>;
}
