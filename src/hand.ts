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

type GroupAnalysis = {
  quad: Card[] | null;
  triplet: Card[] | null;
  pairs: Card[][];
  kickers: Card[];
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

function analyzeGroups(cards: Card[]): GroupAnalysis {
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

  pairs.sort((a, b) => rankValue(b[0].rank) - rankValue(a[0].rank));

  return { quad, triplet, pairs, kickers: sortByRankDesc(kickers) };
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

function removeDuplicateRanks(sorted: Card[]): Card[] {
  return sorted.filter(
    (c, i, arr) => i === 0 || c.rank !== arr[i - 1].rank
  );
}

function detectWheel(unique: Card[]): Card[] | null {
  if (unique[0].rank !== "A") return null;

  const low4 = unique.slice(-4);
  const isWheel =
    low4[0]?.rank === "5" &&
    low4[1]?.rank === "4" &&
    low4[2]?.rank === "3" &&
    low4[3]?.rank === "2";

  if (!isWheel) return null;

  return [...low4, unique[0]];
}

function detectStraight(cards: Card[]): Card[] | null {
  const sorted = sortByRankDesc(cards);
  const unique = removeDuplicateRanks(sorted);

  if (unique.length < 5) return null;

  for (let i = 0; i <= unique.length - 5; i++) {
    const slice = unique.slice(i, i + 5);
    const high = rankValue(slice[0].rank);
    const low = rankValue(slice[4].rank);
    if (high - low === 4) {
      return slice;
    }
  }

  return detectWheel(unique);
}

function detectStraightFlush(cards: Card[]): Card[] | null {
  const flush = detectFlush(cards);
  if (!flush) return null;

  const straight = detectStraight(cards);
  if (!straight) return null;

  const flushSuit = flush[0].suit;
  const flushCards = cards.filter((c) => c.suit === flushSuit);
  return detectStraight(flushCards);
}

function toRankValues(cards: Card[]): number[] {
  return cards.map((c) => rankValue(c.rank));
}

function makeResult(
  category: HandCategory,
  chosen5: Card[],
  rankValues: number[]
): HandResult {
  return { category, chosen5, rankValues };
}

export function evaluateHand(cards: Card[]): HandResult {
  const { quad, triplet, pairs, kickers } = analyzeGroups(cards);

  const straightFlush = detectStraightFlush(cards);
  if (straightFlush) {
    return makeResult("straight-flush", straightFlush, [
      rankValue(straightFlush[0].rank),
    ]);
  }

  if (quad) {
    const bestKicker = sortByRankDesc(
      cards.filter((c) => c.rank !== quad[0].rank)
    )[0];
    return makeResult("four-of-a-kind", [...quad, bestKicker], [
      rankValue(quad[0].rank),
      rankValue(bestKicker.rank),
    ]);
  }

  if (triplet && pairs.length >= 1) {
    return makeResult(
      "full-house",
      [...triplet, ...pairs[0]],
      [rankValue(triplet[0].rank), rankValue(pairs[0][0].rank)]
    );
  }

  const flush = detectFlush(cards);
  if (flush) {
    return makeResult("flush", flush, toRankValues(flush));
  }

  const straight = detectStraight(cards);
  if (straight) {
    return makeResult("straight", straight, [rankValue(straight[0].rank)]);
  }

  if (triplet) {
    const topKickers = kickers.slice(0, 2);
    return makeResult(
      "three-of-a-kind",
      [...triplet, ...topKickers],
      [rankValue(triplet[0].rank), ...toRankValues(topKickers)]
    );
  }

  if (pairs.length === 2) {
    return makeResult(
      "two-pair",
      [...pairs[0], ...pairs[1], kickers[0]],
      [
        rankValue(pairs[0][0].rank),
        rankValue(pairs[1][0].rank),
        rankValue(kickers[0].rank),
      ]
    );
  }

  if (pairs.length === 1) {
    const topKickers = kickers.slice(0, 3);
    return makeResult(
      "one-pair",
      [...pairs[0], ...topKickers],
      [rankValue(pairs[0][0].rank), ...toRankValues(topKickers)]
    );
  }

  const sorted = sortByRankDesc(cards).slice(0, 5);
  return makeResult("high-card", sorted, toRankValues(sorted));
}