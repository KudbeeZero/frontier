import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";

actor {
  type PlayerProfile = {
    username : Text;
    totalPlayTime : Nat;
    achievements : [Text];
  };

  module PlayerProfile {
    public func compare(profile1 : PlayerProfile, profile2 : PlayerProfile) : Order.Order {
      Text.compare(profile1.username, profile2.username);
    };
  };

  type ScoreEntry = {
    playerId : Principal;
    score : Nat;
  };

  module ScoreEntry {
    public func compareByScore(entry1 : ScoreEntry, entry2 : ScoreEntry) : Order.Order {
      Nat.compare(entry2.score, entry1.score);
    };
  };

  type GameSave = {
    hull : Nat;
    fuel : Nat;
    inventory : Text;
    credits : Nat;
    position : Text;
    components : Text;
  };

  let profiles = Map.empty<Principal, PlayerProfile>();
  let highScores = Map.empty<Principal, ScoreEntry>();
  let gameSaves = Map.empty<Principal, GameSave>();

  public shared ({ caller }) func registerPlayer(username : Text) : async () {
    if (profiles.containsKey(caller)) {
      Runtime.trap("This player is already registered.");
    };
    let profile : PlayerProfile = {
      username;
      totalPlayTime = 0;
      achievements = [];
    };
    profiles.add(caller, profile);
  };

  public shared ({ caller }) func saveGameState(hull : Nat, fuel : Nat, inventory : Text, credits : Nat, position : Text, components : Text) : async () {
    let save : GameSave = {
      hull;
      fuel;
      inventory;
      credits;
      position;
      components;
    };
    gameSaves.add(caller, save);
  };

  public shared ({ caller }) func updateHighScore(score : Nat) : async () {
    let scoreEntry : ScoreEntry = {
      playerId = caller;
      score;
    };
    highScores.add(caller, scoreEntry);
  };

  public query ({ caller }) func getPlayerProfile(player : Principal) : async PlayerProfile {
    switch (profiles.get(player)) {
      case (null) { Runtime.trap("Player does not exist") };
      case (?profile) { profile };
    };
  };

  public query ({ caller }) func getTopScores() : async [ScoreEntry] {
    let entries = highScores.values().toArray().sort(ScoreEntry.compareByScore);
    entries.sliceToArray(0, Nat.min(10, entries.size()));
  };

  public query ({ caller }) func getGameState(player : Principal) : async GameSave {
    switch (gameSaves.get(player)) {
      case (null) { Runtime.trap("Game save does not exist") };
      case (?save) { save };
    };
  };
};
