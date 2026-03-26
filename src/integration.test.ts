import { describe, it, expect } from "vitest";
import { parseCard } from "./card";
import { evaluatePlayers } from "./game";
import { bestHand } from "./best-hand";

function cards(strs: string[]) {
  return strs.map(parseCard);
}

describe("integration tests - PDF examples", () => {
  describe("Example A - Ace-low straight (wheel)", () => {
    it("should find a 5-high straight from 7 cards", () => {
      const board = cards(["Ac", "2d", "3h", "4s", "9d"]);
      const result = evaluatePlayers(board, [
        { name: "Alice", holeCards: [parseCard("5c"), parseCard("Kd")] },
      ]);

      expect(result.players[0].hand.category).toBe("straight");
      expect(result.players[0].hand.chosen5.map((c) => c.rank)).toEqual([
        "5",
        "4",
        "3",
        "2",
        "A",
      ]);
    });
  });

  describe("Example B - Ace-high straight", () => {
    it("should find an ace-high straight ignoring low cards", () => {
      const board = cards(["10c", "Jd", "Qh", "Ks", "2d"]);
      const result = evaluatePlayers(board, [
        { name: "Alice", holeCards: [parseCard("Ac"), parseCard("3d")] },
      ]);

      expect(result.players[0].hand.category).toBe("straight");
      expect(result.players[0].hand.chosen5.map((c) => c.rank)).toEqual([
        "A",
        "K",
        "Q",
        "J",
        "10",
      ]);
    });
  });

  describe("Example C - Flush with more than 5 suited cards", () => {
    it("should pick the best 5 hearts from 6 available", () => {
      const board = cards(["Ah", "Jh", "9h", "4h", "2c"]);
      const result = evaluatePlayers(board, [
        { name: "Alice", holeCards: [parseCard("6h"), parseCard("Kd")] },
      ]);

      expect(result.players[0].hand.category).toBe("flush");
      expect(result.players[0].hand.chosen5.map((c) => c.rank)).toEqual([
        "A",
        "J",
        "9",
        "6",
        "4",
      ]);
    });
  });

  describe("Example D - Board plays (tie)", () => {
    it("should result in a tie when both players use the board straight", () => {
      const board = cards(["5c", "6d", "7h", "8s", "9d"]);
      const result = evaluatePlayers(board, [
        { name: "Alice", holeCards: [parseCard("Ac"), parseCard("Ad")] },
        { name: "Bob", holeCards: [parseCard("Kc"), parseCard("Qd")] },
      ]);

      expect(result.winners).toEqual(["Alice", "Bob"]);
      expect(result.players[0].hand.category).toBe("straight");
      expect(result.players[1].hand.category).toBe("straight");
      expect(result.players[0].hand.chosen5.map((c) => c.rank)).toEqual([
        "9",
        "8",
        "7",
        "6",
        "5",
      ]);
    });
  });

  describe("Example E - Quads on board, kicker decides", () => {
    it("should determine winner by kicker when quads are on board", () => {
      const board = cards(["7c", "7d", "7h", "7s", "2d"]);
      const result = evaluatePlayers(board, [
        { name: "Alice", holeCards: [parseCard("Ac"), parseCard("Kc")] },
        { name: "Bob", holeCards: [parseCard("Qc"), parseCard("Jc")] },
      ]);

      expect(result.winners).toEqual(["Alice"]);
      expect(result.players[0].hand.category).toBe("four-of-a-kind");
      expect(result.players[1].hand.category).toBe("four-of-a-kind");
    });
  });

  describe("edge cases", () => {
    it("should not detect wrap-around straight (Q,K,A,2,3)", () => {
      const result = bestHand(cards(["Qc", "Kd", "Ah", "2s", "3d", "8c", "9h"]));
      expect(result.category).not.toBe("straight");
    });

    it("should prefer straight flush over regular flush", () => {
      const result = bestHand(
        cards(["5h", "6h", "7h", "8h", "9h", "Ac", "Kd"])
      );
      expect(result.category).toBe("straight-flush");
    });

    it("should prefer full house over flush when both possible", () => {
      const result = bestHand(
        cards(["Ah", "Ad", "As", "Kh", "Kd", "3h", "5h"])
      );
      expect(result.category).toBe("full-house");
    });

    it("should handle three pairs in 7 cards and pick best two pair", () => {
      const result = bestHand(
        cards(["Ah", "Ad", "Ks", "Kc", "Qh", "Qd", "2s"])
      );
      expect(result.category).toBe("two-pair");
      expect(result.chosen5.map((c) => c.rank)).toEqual(["A", "A", "K", "K", "Q"]);
    });

    it("should handle two triplets in 7 cards and pick full house", () => {
      const result = bestHand(
        cards(["Ah", "Ad", "As", "Kh", "Kd", "Ks", "2c"])
      );
      expect(result.category).toBe("full-house");
    });
  });
});
