import { Event } from "@/types/event";
import { names } from "./names";

/**
 * Seeded random number generator for deterministic randomness
 * This ensures server and client render the same names
 */
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

/**
 * Creates a name selector that randomly draws names without replacement
 * Uses a seeded random generator to ensure deterministic results
 */
function createNameSelector(): () => string {
  const availableNames = [...names];
  const rng = new SeededRandom(12345); // Fixed seed for consistency
  
  // Fisher-Yates shuffle with seeded random
  for (let i = availableNames.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1));
    [availableNames[i], availableNames[j]] = [availableNames[j], availableNames[i]];
  }
  
  let index = 0;
  return () => {
    if (index >= availableNames.length) {
      throw new Error("Not enough names available");
    }
    return availableNames[index++];
  };
}

/**
 * Dummy events for development and testing.
 * In the future, these will be fetched from a database.
 * Names are randomly drawn from names.txt without replacement.
 */
const getName = createNameSelector();

// Event 1: Table Tennis
const player1_1 = getName();
const player1_2 = getName();
// Event 2: Pool
const player2_1 = getName();
const player2_2 = getName();
// Event 3: Poker
const player3_1 = getName();
const player3_2 = getName();
const player3_3 = getName();
const player3_4 = getName();

// Set first event to be "live" (started at the top of the current hour)
const now = new Date();
const topOfHour = new Date(now);
topOfHour.setMinutes(0);
topOfHour.setSeconds(0);
topOfHour.setMilliseconds(0);
const liveEventDate = topOfHour.toISOString();

export const dummyEvents: Event[] = [
  {
    id: "evt-001",
    name: `${player1_1} vs ${player1_2}`,
    date: liveEventDate,
    category: "Table Tennis",
    outcomes: [
      { id: "player1", name: player1_1, odds: 2.0 },
      { id: "player2", name: player1_2, odds: 2.0 },
    ],
  },
  {
    id: "evt-002",
    name: `${player2_1} vs ${player2_2}`,
    date: "2026-01-12T19:00:00Z",
    category: "Pool",
    outcomes: [
      { id: "player1", name: player2_1, odds: 2.0 },
      { id: "player2", name: player2_2, odds: 2.0 },
    ],
  },
  {
    id: "evt-003",
    name: "World Poker Championship - Final Table",
    date: "2026-01-15T20:00:00Z",
    category: "Poker",
    outcomes: [
      { id: "player1", name: player3_1, odds: 4.0 },
      { id: "player2", name: player3_2, odds: 4.0 },
      { id: "player3", name: player3_3, odds: 4.0 },
      { id: "player4", name: player3_4, odds: 4.0 },
    ],
  },
];

/**
 * Finds an event by its ID
 */
export function getEventById(eventId: string): Event | undefined {
  return dummyEvents.find((event) => event.id === eventId);
}
