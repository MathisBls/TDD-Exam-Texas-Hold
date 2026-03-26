import { describe, it, expect } from "vitest";
import { parseCard } from "./card";
import { bestHand, compareHands } from "./best-hand";
import { evaluateHand } from "./hand";

function cards(strs: string[]) {
  return strs.map(parseCard);
}

describe("bestHand", () => {
  it("should pick the best 5 cards from 7", () => {
    const seven = cards(["Ac", "2d", "3h", "4s", "9d", "5c", "Kd"]);
    const result = bestHand(seven);
    expect(result.category).toBe("straight");
    expect(result.chosen5.map((c) => c.rank)).toEqual(["5", "4", "3", "2", "A"]);
  });

  it("should find a flush among 7 cards", () => {
    const seven = cards(["Ah", "Jh", "9h", "4h", "2c", "6h", "Kd"]);
    const result = bestHand(seven);
    expect(result.category).toBe("flush");
    expect(result.chosen5.map((c) => c.rank)).toEqual(["A", "J", "9", "6", "4"]);
  });

  it("should find full house over flush", () => {
    const seven = cards(["7h", "7d", "7s", "Kh", "Kd", "2h", "3h"]);
    const result = bestHand(seven);
    expect(result.category).toBe("full-house");
  });

  it("should pick board plays when hole cards dont help", () => {
    const seven = cards(["5c", "6d", "7h", "8s", "9d", "2c", "3d"]);
    const result = bestHand(seven);
    expect(result.category).toBe("straight");
    expect(result.chosen5.map((c) => c.rank)).toEqual(["9", "8", "7", "6", "5"]);
  });

  it("should find best two pair from 7 cards", () => {
    const seven = cards(["Ah", "Ad", "Ks", "Kc", "Qh", "3d", "2s"]);
    const result = bestHand(seven);
    expect(result.category).toBe("two-pair");
    expect(result.chosen5.map((c) => c.rank)).toEqual(["A", "A", "K", "K", "Q"]);
  });
});

describe("compareHands", () => {
  it("should rank flush higher than straight", () => {
    const flush = evaluateHand(cards(["2h", "5h", "8h", "Jh", "Ah"]));
    const straight = evaluateHand(cards(["5c", "6d", "7h", "8s", "9c"]));
    expect(compareHands(flush, straight)).toBeGreaterThan(0);
  });

  it("should rank higher straight over lower straight", () => {
    const high = evaluateHand(cards(["6c", "7d", "8h", "9s", "10c"]));
    const low = evaluateHand(cards(["5c", "6d", "7h", "8s", "9c"]));
    expect(compareHands(high, low)).toBeGreaterThan(0);
  });

  it("should return 0 for equal hands", () => {
    const a = evaluateHand(cards(["5h", "6d", "7s", "8c", "9h"]));
    const b = evaluateHand(cards(["5c", "6s", "7d", "8h", "9c"]));
    expect(compareHands(a, b)).toBe(0);
  });

  it("should tie-break one pair by kickers", () => {
    const a = evaluateHand(cards(["Ah", "Ad", "Ks", "Qc", "Jh"]));
    const b = evaluateHand(cards(["Ac", "As", "Kd", "Qh", "10c"]));
    expect(compareHands(a, b)).toBeGreaterThan(0);
  });

  it("should tie-break two pair by higher pair", () => {
    const a = evaluateHand(cards(["Ah", "Ad", "3s", "3c", "2h"]));
    const b = evaluateHand(cards(["Kh", "Kd", "Qs", "Qc", "Jh"]));
    expect(compareHands(a, b)).toBeGreaterThan(0);
  });

  it("should tie-break four of a kind by kicker", () => {
    const a = evaluateHand(cards(["7h", "7d", "7s", "7c", "Ah"]));
    const b = evaluateHand(cards(["7h", "7d", "7s", "7c", "Kh"]));
    expect(compareHands(a, b)).toBeGreaterThan(0);
  });

  it("should tie-break full house by triplet rank", () => {
    const a = evaluateHand(cards(["Ah", "Ad", "As", "2c", "2h"]));
    const b = evaluateHand(cards(["Kh", "Kd", "Ks", "Qc", "Qh"]));
    expect(compareHands(a, b)).toBeGreaterThan(0);
  });

  it("should tie-break flush by descending card ranks", () => {
    const a = evaluateHand(cards(["Ah", "Jh", "9h", "6h", "4h"]));
    const b = evaluateHand(cards(["Ad", "Jd", "9d", "6d", "3d"]));
    expect(compareHands(a, b)).toBeGreaterThan(0);
  });
});
