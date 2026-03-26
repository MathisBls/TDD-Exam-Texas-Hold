import { describe, it, expect } from "vitest";
import { parseCard } from "./card";
import { evaluatePlayers } from "./game";

function cards(strs: string[]) {
  return strs.map(parseCard);
}

describe("evaluatePlayers", () => {
  it("should determine a single winner", () => {
    const board = cards(["2h", "5d", "9s", "Jc", "Kh"]);
    const result = evaluatePlayers(board, [
      { name: "Alice", holeCards: [parseCard("Ah"), parseCard("Kd")] },
      { name: "Bob", holeCards: [parseCard("3c"), parseCard("7d")] },
    ]);

    expect(result.winners).toEqual(["Alice"]);
  });

  it("should detect a tie / split pot", () => {
    const board = cards(["5c", "6d", "7h", "8s", "9d"]);
    const result = evaluatePlayers(board, [
      { name: "Alice", holeCards: [parseCard("Ac"), parseCard("Ad")] },
      { name: "Bob", holeCards: [parseCard("Kc"), parseCard("Qd")] },
    ]);

    expect(result.winners).toEqual(["Alice", "Bob"]);
    expect(result.players[0].hand.category).toBe("straight");
    expect(result.players[1].hand.category).toBe("straight");
  });

  it("should handle kicker deciding winner with quads on board", () => {
    const board = cards(["7c", "7d", "7h", "7s", "2d"]);
    const result = evaluatePlayers(board, [
      { name: "Alice", holeCards: [parseCard("Ac"), parseCard("Kc")] },
      { name: "Bob", holeCards: [parseCard("Qc"), parseCard("Jc")] },
    ]);

    expect(result.winners).toEqual(["Alice"]);
    expect(result.players[0].hand.category).toBe("four-of-a-kind");
  });

  it("should support more than 2 players", () => {
    const board = cards(["2h", "5d", "9s", "Jc", "Kh"]);
    const result = evaluatePlayers(board, [
      { name: "Alice", holeCards: [parseCard("Ah"), parseCard("Kd")] },
      { name: "Bob", holeCards: [parseCard("3c"), parseCard("7d")] },
      { name: "Charlie", holeCards: [parseCard("Ks"), parseCard("Qd")] },
    ]);

    expect(result.winners).toEqual(["Alice"]);
  });

  it("should return chosen5 for each player", () => {
    const board = cards(["Ac", "2d", "3h", "4s", "9d"]);
    const result = evaluatePlayers(board, [
      { name: "Alice", holeCards: [parseCard("5c"), parseCard("Kd")] },
    ]);

    expect(result.players[0].hand.category).toBe("straight");
    expect(result.players[0].hand.chosen5).toHaveLength(5);
    expect(result.players[0].hand.chosen5.map((c) => c.rank)).toEqual(["5", "4", "3", "2", "A"]);
  });

  it("should handle board plays where both players use the board", () => {
    const board = cards(["10c", "Jd", "Qh", "Ks", "Ad"]);
    const result = evaluatePlayers(board, [
      { name: "Alice", holeCards: [parseCard("2h"), parseCard("3c")] },
      { name: "Bob", holeCards: [parseCard("4h"), parseCard("5c")] },
    ]);

    expect(result.winners).toEqual(["Alice", "Bob"]);
    expect(result.players[0].hand.category).toBe("straight");
  });

  it("should handle three-way tie", () => {
    const board = cards(["5c", "6d", "7h", "8s", "9d"]);
    const result = evaluatePlayers(board, [
      { name: "Alice", holeCards: [parseCard("2h"), parseCard("3c")] },
      { name: "Bob", holeCards: [parseCard("2d"), parseCard("3s")] },
      { name: "Charlie", holeCards: [parseCard("2c"), parseCard("3d")] },
    ]);

    expect(result.winners).toEqual(["Alice", "Bob", "Charlie"]);
  });
});
