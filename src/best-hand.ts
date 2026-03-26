import { Card } from "./card";
import { evaluateHand, HandResult } from "./hand";

function combinations(cards: Card[], k: number): Card[][] {
  if (k === 0) return [[]];
  if (cards.length < k) return [];

  const [first, ...rest] = cards;
  const withFirst = combinations(rest, k - 1).map((combo) => [first, ...combo]);
  const withoutFirst = combinations(rest, k);

  return [...withFirst, ...withoutFirst];
}

export function bestHand(sevenCards: Card[]): HandResult {
  const allCombos = combinations(sevenCards, 5);
  let best: HandResult | null = null;

  for (const combo of allCombos) {
    const result = evaluateHand(combo);
    if (!best || compareHands(result, best) > 0) {
      best = result;
    }
  }

  return best!;
}

const CATEGORY_RANK: Record<string, number> = {
  "straight-flush": 9,
  "four-of-a-kind": 8,
  "full-house": 7,
  "flush": 6,
  "straight": 5,
  "three-of-a-kind": 4,
  "two-pair": 3,
  "one-pair": 2,
  "high-card": 1,
};

export function compareHands(a: HandResult, b: HandResult): number {
  const catA = CATEGORY_RANK[a.category];
  const catB = CATEGORY_RANK[b.category];

  if (catA !== catB) return catA - catB;

  for (let i = 0; i < Math.max(a.rankValues.length, b.rankValues.length); i++) {
    const va = a.rankValues[i] ?? 0;
    const vb = b.rankValues[i] ?? 0;
    if (va !== vb) return va - vb;
  }

  return 0;
}
