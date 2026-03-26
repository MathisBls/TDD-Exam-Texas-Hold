import { describe, it, expect } from "vitest";
import { parseCard, rankValue } from "./card";

describe("parseCard", () => {
  it("should parse a simple card", () => {
    const card = parseCard("As");
    expect(card).toEqual({ rank: "A", suit: "s" });
  });

  it("should parse a 10", () => {
    const card = parseCard("10h");
    expect(card).toEqual({ rank: "10", suit: "h" });
  });

  it("should parse a 2 of diamonds", () => {
    const card = parseCard("2d");
    expect(card).toEqual({ rank: "2", suit: "d" });
  });

  it("should throw on invalid rank", () => {
    expect(() => parseCard("Xs")).toThrow("Invalid rank");
  });

  it("should throw on invalid suit", () => {
    expect(() => parseCard("Ax")).toThrow("Invalid suit");
  });
});

describe("rankValue", () => {
  it("should return 2 for rank 2", () => {
    expect(rankValue("2")).toBe(2);
  });

  it("should return 14 for Ace", () => {
    expect(rankValue("A")).toBe(14);
  });

  it("should return 13 for King", () => {
    expect(rankValue("K")).toBe(13);
  });

  it("should return 10 for 10", () => {
    expect(rankValue("10")).toBe(10);
  });
});
