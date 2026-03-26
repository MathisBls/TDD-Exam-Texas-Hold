import { Card } from "./card";
import { HandResult } from "./hand";
import { bestHand, compareHands } from "./best-hand";

export type Player = {
  name: string;
  holeCards: [Card, Card];
};

export type PlayerResult = {
  name: string;
  hand: HandResult;
};

export type GameResult = {
  players: PlayerResult[];
  winners: string[];
};

export function evaluatePlayers(board: Card[], players: Player[]): GameResult {
  const results: PlayerResult[] = players.map((player) => {
    const sevenCards = [...board, ...player.holeCards];
    return {
      name: player.name,
      hand: bestHand(sevenCards),
    };
  });

  let bestResult = results[0];
  for (let i = 1; i < results.length; i++) {
    if (compareHands(results[i].hand, bestResult.hand) > 0) {
      bestResult = results[i];
    }
  }

  const winners = results
    .filter((r) => compareHands(r.hand, bestResult.hand) === 0)
    .map((r) => r.name);

  return { players: results, winners };
}
