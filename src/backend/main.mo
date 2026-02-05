import Map "mo:core/Map";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Coordinates and waypoint types
  type Coordinates = {
    x : Float;
    y : Float;
    z : Float;
  };

  type Waypoint = {
    coordinates : Coordinates;
    waypointType : {
      #standard;
      #start;
      #finish;
      #checkpoint;
      #obstacle;
    };
    labelText : ?Text;
    radius : ?Float;
  };

  // Route metadata and structure
  public type RouteMetadata = {
    id : Text;
    author : Principal;
    name : Text;
    description : Text;
    difficulty : ?Text;
    created : Int;
    updated : Int;
    length : Float;
    waypoints : [Waypoint];
  };

  module RouteMetadata {
    public func compare(a : RouteMetadata, b : RouteMetadata) : Order.Order {
      switch (Text.compare(a.name, b.name)) {
        case (#equal) { Text.compare(a.id, b.id) };
        case (order) { order };
      };
    };
  };

  type RouteSummary = {
    id : Text;
    author : Principal;
    name : Text;
    description : Text;
    difficulty : ?Text;
    created : Int;
    updated : Int;
    length : Float;
    waypointCount : Nat;
  };

  module RouteSummary {
    public func compare(a : RouteSummary, b : RouteSummary) : Order.Order {
      switch (Text.compare(a.name, b.name)) {
        case (#equal) { Text.compare(a.id, b.id) };
        case (order) { order };
      };
    };
  };

  // Persistent storage for routes
  let routes = Map.empty<Text, RouteMetadata>();

  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Route management functions
  public shared ({ caller }) func addOrUpdateRoute(metadata : RouteMetadata) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create or update routes");
    };

    switch (routes.get(metadata.id)) {
      case (null) {
        // Creating new route - must be the author
        if (caller != metadata.author) {
          Runtime.trap("Unauthorized: Cannot create route for another user");
        };
        if (metadata.name != "" and metadata.waypoints.size() > 0) {
          routes.add(metadata.id, metadata);
        };
      };
      case (?existing) {
        // Updating existing route - must be the original author
        if (caller != existing.author) {
          Runtime.trap("Unauthorized: Only the route author can update this route");
        };
        routes.add(metadata.id, metadata);
      };
    };
  };

  public query ({ caller }) func getRouteSummary(id : Text) : async ?RouteSummary {
    switch (routes.get(id)) {
      case (null) { null };
      case (?route) { ?routeToRouteSummary(route) };
    };
  };

  public query ({ caller }) func getRouteWithWaypoints(id : Text) : async ?RouteMetadata {
    routes.get(id);
  };

  public query ({ caller }) func getAllRoutes() : async [RouteSummary] {
    routes.values().toArray().map(routeToRouteSummary).sort();
  };

  public query ({ caller }) func getRoutesByAuthor(author : Principal) : async [RouteSummary] {
    let filteredRoutes = routes.values().toArray().map(routeToRouteSummary).filter(
      func(route) { route.author == author }
    );
    filteredRoutes.sort();
  };

  public query ({ caller }) func getRoutesByDifficulty(difficulty : Text) : async [RouteSummary] {
    let filteredRoutes = routes.values().toArray().map(routeToRouteSummary).filter(
      func(route) { route.difficulty == ?difficulty }
    );
    filteredRoutes.sort();
  };

  public shared ({ caller }) func deleteRoute(id : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can delete routes");
    };

    switch (routes.get(id)) {
      case (null) { Runtime.trap("Route does not exist") };
      case (?route) {
        if (caller != route.author) {
          Runtime.trap("Unauthorized: Only the route author can delete this route");
        };
        routes.remove(id);
      };
    };
  };

  // Helper function to convert RouteMetadata to RouteSummary
  func routeToRouteSummary(route : RouteMetadata) : RouteSummary {
    {
      route with
      waypointCount = route.waypoints.size();
    };
  };

  // Deprecated/Legacy Functions
  public type Route = {
    id : Text;
    author : Principal;
    name : Text;
    description : Text;
    difficulty : ?Text;
    created : Int;
    updated : Int;
    length : Float;
    waypoints : [Waypoint];
  };

  public query ({ caller }) func getOldAllRoutes() : async [Route] {
    routes.values().toArray().map(
      func(route) {
        route;
      }
    );
  };
};
