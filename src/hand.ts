import { Card, rankValue } from "./card";

export type HandCategory =
  | "straight-flush"
  | "four-of-a-kind"
  | "full-house"
  | "flush"
  | "straight"
  | "three-of-a-kind"
  | "two-pair"
  | "one-pair"
  | "high-card";

export type HandResult = {
  category: HandCategory;
  chosen5: Card[];
  rankValues: number[];
};

function groupByRank(cards: Card[]): Map<string, Card[]> {
  const groups = new Map<string, Card[]>();
  for (const card of cards) {
    const group = groups.get(card.rank) || [];
    group.push(card);
    groups.set(card.rank, group);
  }
  return groups;
}

function sortByRankDesc(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => rankValue(b.rank) - rankValue(a.rank));
}

export function evaluateHand(cards: Card[]): HandResult {
  const groups = groupByRank(cards);
  const pairs: Card[][] = [];
  let triplet: Card[] | null = null;
  let quad: Card[] | null = null;
  const kickers: Card[] = [];

  for (const [, group] of groups) {
    if (group.length === 4) {
      quad = group;
    } else if (group.length === 3) {
      triplet = group;
    } else if (group.length === 2) {
      pairs.push(group);
    } else {
      kickers.push(...group);
    }
  }

  const sortedKickers = sortByRankDesc(kickers);
  pairs.sort((a, b) => rankValue(b[0].rank) - rankValue(a[0].rank));

  if (triplet) {
    const chosen5 = [...triplet, ...sortedKickers.slice(0, 2)];
    return {
      category: "three-of-a-kind",
      chosen5,
      rankValues: [
        rankValue(triplet[0].rank),
        ...sortedKickers.slice(0, 2).map((c) => rankValue(c.rank)),
      ],
    };
  }

  if (pairs.length === 2) {
    const chosen5 = [...pairs[0], ...pairs[1], sortedKickers[0]];
    return {
      category: "two-pair",
      chosen5,
      rankValues: [
        rankValue(pairs[0][0].rank),
        rankValue(pairs[1][0].rank),
        rankValue(sortedKickers[0].rank),
      ],
    };
  }

  if (pairs.length === 1) {
    const chosen5 = [...pairs[0], ...sortedKickers.slice(0, 3)];
    return {
      category: "one-pair",
      chosen5,
      rankValues: [
        rankValue(pairs[0][0].rank),
        ...sortedKickers.slice(0, 3).map((c) => rankValue(c.rank)),
      ],
    };
  }

  const sorted = sortByRankDesc(cards);
  return {
    category: "high-card",
    chosen5: sorted,
    rankValues: sorted.map((c) => rankValue(c.rank)),
  };
}
