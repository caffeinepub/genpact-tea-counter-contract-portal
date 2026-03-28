import Map "mo:core/Map";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Char "mo:core/Char";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";

actor {
  // Initialize access control
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // Types
  public type UserProfile = {
    id : Text;
    name : Text;
    email : Text;
    phone : Text;
    passwordHash : Text;
    role : Text; // "bidder" or "admin"
    pan : Text;
    aadhaar : Text;
    gst : Text;
    companyName : Text;
    dob : Text;
    experience : Text;
    outlets : Text;
    contractAccepted : Bool;
    createdAt : Int;
  };

  public type Bid = {
    id : Text;
    bidderId : Text;
    amount : Nat;
    submittedAt : Int;
    isWinner : Bool;
  };

  public type Stats = {
    totalBids : Nat;
    highestBid : Nat;
    averageBid : Nat;
  };

  // Stable state - persists across upgrades
  stable var biddingLocked : Bool = false;
  stable let userProfiles = Map.empty<Text, UserProfile>();
  stable let emailRegistry = Set.empty<Text>();
  stable let phoneRegistry = Set.empty<Text>();
  stable let bids = Map.empty<Text, Bid>();
  stable let principalToUserId = Map.empty<Principal, Text>(); // caller -> userId
  stable let sessionTokens = Map.empty<Text, Text>(); // kept for upgrade compatibility

  // Initialize admin user (only on first deploy - idempotent)
  let adminProfile : UserProfile = {
    id = "admin1";
    name = "Admin User";
    email = "admin@genpact.com";
    phone = "0000000000";
    passwordHash = "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918";
    role = "admin";
    pan = "ADMIN00000";
    aadhaar = "000000000000";
    gst = "ADMIN0000000000";
    companyName = "Genpact";
    dob = "1970-01-01";
    experience = "N/A";
    outlets = "N/A";
    contractAccepted = true;
    createdAt = 0;
  };

  if (not userProfiles.containsKey("admin1")) {
    userProfiles.add("admin1", adminProfile);
    emailRegistry.add("admin@genpact.com");
    phoneRegistry.add("0000000000");
  };

  // Helper functions
  func getUserIdFromCaller(caller : Principal) : ?Text {
    principalToUserId.get(caller);
  };

  func requireUserId(caller : Principal) : Text {
    switch (getUserIdFromCaller(caller)) {
      case (?userId) { userId };
      case (null) { Runtime.trap("Unauthorized: User not logged in") };
    };
  };

  func getUserProfileInternal(userId : Text) : ?UserProfile {
    userProfiles.get(userId);
  };

  func requireUserProfile(userId : Text) : UserProfile {
    switch (getUserProfileInternal(userId)) {
      case (?profile) { profile };
      case (null) { Runtime.trap("User profile not found") };
    };
  };

  func isAdmin(userId : Text) : Bool {
    switch (getUserProfileInternal(userId)) {
      case (?profile) { profile.role == "admin" };
      case (null) { false };
    };
  };

  func requireAdmin(userId : Text) {
    if (not isAdmin(userId)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
  };

  func generateId(prefix : Text) : Text {
    prefix # Time.now().toText() # userProfiles.size().toText();
  };

  // Public functions

  // Anyone can register
  public func register(
    name : Text,
    email : Text,
    phone : Text,
    passwordHash : Text,
    pan : Text,
    aadhaar : Text,
    gst : Text,
    companyName : Text,
    dob : Text,
    experience : Text,
    outlets : Text,
  ) : async { #ok : Text; #err : Text } {
    // Check for duplicates
    if (emailRegistry.contains(email)) {
      return #err("Email already registered");
    };
    if (phoneRegistry.contains(phone)) {
      return #err("Phone already registered");
    };

    let userId = generateId("user_");
    let profile : UserProfile = {
      id = userId;
      name;
      email;
      phone;
      passwordHash;
      role = "bidder";
      pan;
      aadhaar;
      gst;
      companyName;
      dob;
      experience;
      outlets;
      contractAccepted = false;
      createdAt = Time.now();
    };

    userProfiles.add(userId, profile);
    emailRegistry.add(email);
    phoneRegistry.add(phone);

    #ok(userId);
  };

  // Anyone can login
  public shared ({ caller }) func login(email : Text, passwordHash : Text) : async { #ok : Text; #err : Text } {
    // Find user by email
    var foundUserId : ?Text = null;
    for ((userId, profile) in userProfiles.entries()) {
      if (profile.email == email and profile.passwordHash == passwordHash) {
        foundUserId := ?userId;
      };
    };

    switch (foundUserId) {
      case (?userId) {
        // Map caller principal to userId
        principalToUserId.add(caller, userId);

        // Directly assign role in AccessControl state (bypasses admin-only check,
        // which is correct here since login itself is the auth gate)
        let profile = requireUserProfile(userId);
        if (profile.role == "admin") {
          accessControlState.userRoles.add(caller, #admin);
        } else {
          accessControlState.userRoles.add(caller, #user);
        };

        #ok(userId);
      };
      case (null) {
        #err("Invalid email or password");
      };
    };
  };

  // User can only get their own profile
  public query ({ caller }) func getMyProfile(userId : Text) : async { #ok : UserProfile; #err : Text } {
    let callerUserId = switch (getUserIdFromCaller(caller)) {
      case (?id) { id };
      case (null) { return #err("Unauthorized: Not logged in") };
    };

    if (callerUserId != userId) {
      return #err("Unauthorized: Can only access your own profile");
    };

    switch (getUserProfileInternal(userId)) {
      case (?profile) { #ok(profile) };
      case (null) { #err("Profile not found") };
    };
  };

  // User can only accept their own contract
  public shared ({ caller }) func acceptContract(userId : Text) : async { #ok : Text; #err : Text } {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      return #err("Unauthorized: Only users can accept contracts");
    };

    let callerUserId = requireUserId(caller);
    if (callerUserId != userId) {
      return #err("Unauthorized: Can only accept your own contract");
    };

    let profile = requireUserProfile(userId);
    let updatedProfile = {
      profile with contractAccepted = true;
    };
    userProfiles.add(userId, updatedProfile);

    #ok("Contract accepted");
  };

  // User can only place their own bid
  public shared ({ caller }) func placeBid(userId : Text, amount : Nat) : async { #ok : Text; #err : Text } {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      return #err("Unauthorized: Only users can place bids");
    };

    let callerUserId = requireUserId(caller);
    if (callerUserId != userId) {
      return #err("Unauthorized: Can only place your own bid");
    };

    if (biddingLocked) {
      return #err("Bidding is locked");
    };

    let profile = requireUserProfile(userId);
    if (not profile.contractAccepted) {
      return #err("Must accept contract before bidding");
    };

    // Upsert bid
    let bidId = "bid_" # userId;
    let bid : Bid = {
      id = bidId;
      bidderId = userId;
      amount;
      submittedAt = Time.now();
      isWinner = false;
    };
    bids.add(bidId, bid);

    #ok(bidId);
  };

  // User can only get their own bid
  public query ({ caller }) func getMyBid(userId : Text) : async { #ok : Bid; #err : Text } {
    let callerUserId = switch (getUserIdFromCaller(caller)) {
      case (?id) { id };
      case (null) { return #err("Unauthorized: Not logged in") };
    };

    if (callerUserId != userId) {
      return #err("Unauthorized: Can only access your own bid");
    };

    let bidId = "bid_" # userId;
    switch (bids.get(bidId)) {
      case (?bid) { #ok(bid) };
      case (null) { #err("No bid found") };
    };
  };

  // Public statistics - no auth needed
  public query func getStats() : async Stats {
    var totalBids : Nat = 0;
    var highestBid : Nat = 0;
    var sumBids : Nat = 0;

    for ((_, bid) in bids.entries()) {
      totalBids += 1;
      sumBids += bid.amount;
      if (bid.amount > highestBid) {
        highestBid := bid.amount;
      };
    };

    let averageBid = if (totalBids > 0) { sumBids / totalBids } else { 0 };

    {
      totalBids;
      highestBid;
      averageBid;
    };
  };

  // Admin only - get all bidders
  public query ({ caller }) func adminGetAllBidders(adminId : Text) : async { #ok : [UserProfile]; #err : Text } {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      return #err("Unauthorized: Only admins can perform this action");
    };

    let callerUserId = switch (getUserIdFromCaller(caller)) {
      case (?id) { id };
      case (null) { return #err("Unauthorized: Not logged in") };
    };

    if (callerUserId != adminId) {
      return #err("Unauthorized: Admin ID mismatch");
    };

    requireAdmin(adminId);

    var bidders : [UserProfile] = [];
    for ((_, profile) in userProfiles.entries()) {
      if (profile.role == "bidder") {
        bidders := bidders.concat([profile]);
      };
    };

    #ok(bidders);
  };

  // Admin only - get all bids
  public query ({ caller }) func adminGetAllBids(adminId : Text) : async { #ok : [Bid]; #err : Text } {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      return #err("Unauthorized: Only admins can perform this action");
    };

    let callerUserId = switch (getUserIdFromCaller(caller)) {
      case (?id) { id };
      case (null) { return #err("Unauthorized: Not logged in") };
    };

    if (callerUserId != adminId) {
      return #err("Unauthorized: Admin ID mismatch");
    };

    requireAdmin(adminId);

    var allBids : [Bid] = [];
    for ((_, bid) in bids.entries()) {
      allBids := allBids.concat([bid]);
    };

    #ok(allBids);
  };

  // Admin only - select winner
  public shared ({ caller }) func adminSelectWinner(adminId : Text, bidId : Text) : async { #ok : Text; #err : Text } {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      return #err("Unauthorized: Only admins can perform this action");
    };

    let callerUserId = requireUserId(caller);
    if (callerUserId != adminId) {
      return #err("Unauthorized: Admin ID mismatch");
    };

    requireAdmin(adminId);

    switch (bids.get(bidId)) {
      case (?bid) {
        let updatedBid = {
          bid with isWinner = true;
        };
        bids.add(bidId, updatedBid);
        #ok("Winner selected");
      };
      case (null) {
        #err("Bid not found");
      };
    };
  };

  // Admin only - lock/unlock bidding
  public shared ({ caller }) func adminLockBidding(adminId : Text, lock : Bool) : async { #ok : Text; #err : Text } {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      return #err("Unauthorized: Only admins can perform this action");
    };

    let callerUserId = requireUserId(caller);
    if (callerUserId != adminId) {
      return #err("Unauthorized: Admin ID mismatch");
    };

    requireAdmin(adminId);

    biddingLocked := lock;
    #ok(if (lock) { "Bidding locked" } else { "Bidding unlocked" });
  };

  // Required by frontend - get caller's profile
  public query ({ caller }) func getCallerUserProfile() : async UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };

    let userId = requireUserId(caller);
    requireUserProfile(userId);
  };

  // Required by frontend - get another user's profile (admin only)
  public query ({ caller }) func getUserProfile(user : Principal) : async UserProfile {
    let callerUserId = switch (getUserIdFromCaller(caller)) {
      case (?id) { id };
      case (null) { Runtime.trap("Unauthorized: Not logged in") };
    };

    let targetUserId = switch (getUserIdFromCaller(user)) {
      case (?id) { id };
      case (null) { Runtime.trap("Target user not found") };
    };

    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };

    requireUserProfile(targetUserId);
  };

  // Required by frontend - save caller's profile
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    let userId = requireUserId(caller);
    if (userId != profile.id) {
      Runtime.trap("Unauthorized: Can only save your own profile");
    };

    userProfiles.add(userId, profile);
  };
};
