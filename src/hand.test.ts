import { describe, it, expect } from "vitest";
import { parseCard } from "./card";
import { evaluateHand } from "./hand";

function cards(strs: string[]) {
  return strs.map(parseCard);
}

describe("evaluateHand", () => {
  describe("high card", () => {
    it("should detect a high card hand", () => {
      const result = evaluateHand(cards(["Ah", "Kd", "9s", "5c", "2h"]));
      expect(result.category).toBe("high-card");
      expect(result.chosen5.map((c) => c.rank)).toEqual(["A", "K", "9", "5", "2"]);
    });

    it("should order cards by descending rank", () => {
      const result = evaluateHand(cards(["3h", "7d", "2s", "Jc", "9h"]));
      expect(result.category).toBe("high-card");
      expect(result.chosen5.map((c) => c.rank)).toEqual(["J", "9", "7", "3", "2"]);
    });
  });

  describe("one pair", () => {
    it("should detect one pair", () => {
      const result = evaluateHand(cards(["Ah", "Ad", "9s", "5c", "2h"]));
      expect(result.category).toBe("one-pair");
    });

    it("should return pair first then kickers descending", () => {
      const result = evaluateHand(cards(["7h", "7d", "Ks", "5c", "2h"]));
      expect(result.category).toBe("one-pair");
      expect(result.chosen5.map((c) => c.rank)).toEqual(["7", "7", "K", "5", "2"]);
    });

    it("should handle pair of aces", () => {
      const result = evaluateHand(cards(["Ah", "Ad", "Ks", "Qc", "Jh"]));
      expect(result.category).toBe("one-pair");
      expect(result.rankValues[0]).toBe(14);
    });
  });

  describe("two pair", () => {
    it("should detect two pair", () => {
      const result = evaluateHand(cards(["Ah", "Ad", "9s", "9c", "2h"]));
      expect(result.category).toBe("two-pair");
    });

    it("should return higher pair first then lower pair then kicker", () => {
      const result = evaluateHand(cards(["5h", "5d", "Ks", "Kc", "2h"]));
      expect(result.category).toBe("two-pair");
      expect(result.chosen5.map((c) => c.rank)).toEqual(["K", "K", "5", "5", "2"]);
    });

    it("should pick correct kicker", () => {
      const result = evaluateHand(cards(["Jh", "Jd", "3s", "3c", "Ah"]));
      expect(result.category).toBe("two-pair");
      expect(result.chosen5.map((c) => c.rank)).toEqual(["J", "J", "3", "3", "A"]);
      expect(result.rankValues).toEqual([11, 3, 14]);
    });
  });

  describe("three of a kind", () => {
    it("should detect three of a kind", () => {
      const result = evaluateHand(cards(["7h", "7d", "7s", "Kc", "2h"]));
      expect(result.category).toBe("three-of-a-kind");
    });

    it("should return triplet first then kickers descending", () => {
      const result = evaluateHand(cards(["9h", "9d", "9s", "Ac", "3h"]));
      expect(result.category).toBe("three-of-a-kind");
      expect(result.chosen5.map((c) => c.rank)).toEqual(["9", "9", "9", "A", "3"]);
    });

    it("should have correct rank values for tie-breaking", () => {
      const result = evaluateHand(cards(["Qh", "Qd", "Qs", "Jc", "5h"]));
      expect(result.rankValues).toEqual([12, 11, 5]);
    });
  });

  describe("straight", () => {
    it("should detect a straight", () => {
      const result = evaluateHand(cards(["5h", "6d", "7s", "8c", "9h"]));
      expect(result.category).toBe("straight");
    });

    it("should return cards in descending order", () => {
      const result = evaluateHand(cards(["5h", "6d", "7s", "8c", "9h"]));
      expect(result.chosen5.map((c) => c.rank)).toEqual(["9", "8", "7", "6", "5"]);
    });

    it("should detect ace-high straight", () => {
      const result = evaluateHand(cards(["10c", "Jd", "Qh", "Ks", "Ac"]));
      expect(result.category).toBe("straight");
      expect(result.chosen5.map((c) => c.rank)).toEqual(["A", "K", "Q", "J", "10"]);
    });

    it("should detect ace-low straight (wheel)", () => {
      const result = evaluateHand(cards(["Ac", "2d", "3h", "4s", "5c"]));
      expect(result.category).toBe("straight");
      expect(result.chosen5.map((c) => c.rank)).toEqual(["5", "4", "3", "2", "A"]);
    });

    it("should use highest card rank value for tie-breaking", () => {
      const result = evaluateHand(cards(["5h", "6d", "7s", "8c", "9h"]));
      expect(result.rankValues).toEqual([9]);
    });

    it("should use 5 as rank value for wheel", () => {
      const result = evaluateHand(cards(["Ac", "2d", "3h", "4s", "5c"]));
      expect(result.rankValues).toEqual([5]);
    });
  });
});
