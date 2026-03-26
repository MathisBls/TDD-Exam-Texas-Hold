export const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"] as const;
export type Rank = (typeof RANKS)[number];

export const SUITS = ["h", "d", "c", "s"] as const;
export type Suit = (typeof SUITS)[number];

export type Card = {
  rank: Rank;
  suit: Suit;
};

export function rankValue(rank: Rank): number {
  return RANKS.indexOf(rank) + 2;
}

export function parseCard(input: string): Card {
  const suit = input.slice(-1) as Suit;
  const rank = input.slice(0, -1) as Rank;

  if (!RANKS.includes(rank)) {
    throw new Error(`Invalid rank: ${rank}`);
  }
  if (!SUITS.includes(suit)) {
    throw new Error(`Invalid suit: ${suit}`);
  }

  return { rank, suit };
}
