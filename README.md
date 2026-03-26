# Texas Hold'em Poker Hand Comparison

## Description

Evaluateur et comparateur de mains de poker Texas Hold'em en TDD.

Donne 5 cartes communes (board) et 2 cartes par joueur, le programme :
1. Determine la meilleure main de 5 cartes parmi les 7 disponibles
2. Compare les joueurs et retourne le(s) gagnant(s) (supporte les egalites)
3. Retourne les 5 cartes choisies et la categorie de main

## Tech Stack

- TypeScript
- Vitest (test framework)
- npm (package manager)

## Lancer les tests

```bash
npm install
npm test
```

## Input

Les cartes sont representees sous forme de string : `"As"` (Ace of spades), `"10h"` (10 of hearts), etc.

Rangs : 2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K, A
Couleurs : h (hearts), d (diamonds), c (clubs), s (spades)

## Ordre des chosen5

Les 5 cartes retournees sont ordonnees par importance pour la categorie :
- Straight / Straight flush : ordre decroissant (wheel = 5,4,3,2,A)
- Four of a kind : les 4 cartes du carre, puis le kicker
- Full house : les 3 du brelan, puis les 2 de la paire
- Flush / High card : rang decroissant
- Three of a kind : les 3 du brelan, puis kickers decroissants
- Two pair : paire haute, paire basse, kicker
- One pair : les 2 de la paire, puis kickers decroissants

## Validite des entrees

On suppose qu'il n'y a pas de cartes en double dans l'input.
