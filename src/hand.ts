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

function detectFlush(cards: Card[]): Card[] | null {
  const bySuit = new Map<string, Card[]>();
  for (const card of cards) {
    const group = bySuit.get(card.suit) || [];
    group.push(card);
    bySuit.set(card.suit, group);
  }

  for (const [, group] of bySuit) {
    if (group.length >= 5) {
      return sortByRankDesc(group).slice(0, 5);
    }
  }

  return null;
}

function detectStraight(cards: Card[]): Card[] | null {
  const sorted = sortByRankDesc(cards);
  const unique = sorted.filter(
    (c, i, arr) => i === 0 || c.rank !== arr[i - 1].rank
  );

  if (unique.length < 5) return null;

  for (let i = 0; i <= unique.length - 5; i++) {
    const slice = unique.slice(i, i + 5);
    const high = rankValue(slice[0].rank);
    const low = rankValue(slice[4].rank);
    if (high - low === 4) {
      return slice;
    }
  }

  if (
    unique[0].rank === "A" &&
    unique[unique.length - 4]?.rank === "5" &&
    unique[unique.length - 3]?.rank === "4" &&
    unique[unique.length - 2]?.rank === "3" &&
    unique[unique.length - 1]?.rank === "2"
  ) {
    return [
      unique[unique.length - 4],
      unique[unique.length - 3],
      unique[unique.length - 2],
      unique[unique.length - 1],
      unique[0],
    ];
  }

  return null;
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

  const flush = detectFlush(cards);
  const straight = detectStraight(cards);

  if (flush && straight) {
    const flushSuit = flush[0].suit;
    const flushCards = cards.filter((c) => c.suit === flushSuit);
    const straightFlush = detectStraight(flushCards);
    if (straightFlush) {
      return {
        category: "straight-flush",
        chosen5: straightFlush,
        rankValues: [rankValue(straightFlush[0].rank)],
      };
    }
  }

  if (quad) {
    const kicker = sortByRankDesc(
      cards.filter((c) => c.rank !== quad![0].rank)
    )[0];
    const chosen5 = [...quad, kicker];
    return {
      category: "four-of-a-kind",
      chosen5,
      rankValues: [rankValue(quad[0].rank), rankValue(kicker.rank)],
    };
  }

  if (triplet && pairs.length >= 1) {
    const chosen5 = [...triplet, ...pairs[0]];
    return {
      category: "full-house",
      chosen5,
      rankValues: [rankValue(triplet[0].rank), rankValue(pairs[0][0].rank)],
    };
  }

  if (flush) {
    return {
      category: "flush",
      chosen5: flush,
      rankValues: flush.map((c) => rankValue(c.rank)),
    };
  }

  if (straight) {
    return {
      category: "straight",
      chosen5: straight,
      rankValues: [rankValue(straight[0].rank)],
    };
  }

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
