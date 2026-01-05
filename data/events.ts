import { Event } from "@/types/event";

/**
 * Dummy events for development and testing.
 * In the future, these will be fetched from a database.
 */
export const dummyEvents: Event[] = [
  {
    id: "evt-001",
    name: "Zhang Jike vs Ma Long",
    date: "2026-01-10T14:00:00Z",
    category: "Table Tennis",
    outcomes: [
      { id: "player1", name: "Zhang Jike", odds: 2.0 },
      { id: "player2", name: "Ma Long", odds: 2.0 },
    ],
  },
  {
    id: "evt-002",
    name: "Efren Reyes vs Shane Van Boening",
    date: "2026-01-12T19:00:00Z",
    category: "Pool",
    outcomes: [
      { id: "player1", name: "Efren Reyes", odds: 2.0 },
      { id: "player2", name: "Shane Van Boening", odds: 2.0 },
    ],
  },
  {
    id: "evt-003",
    name: "World Poker Championship - Final Table",
    date: "2026-01-15T20:00:00Z",
    category: "Poker",
    outcomes: [
      { id: "player1", name: "Phil Ivey", odds: 4.0 },
      { id: "player2", name: "Daniel Negreanu", odds: 4.0 },
      { id: "player3", name: "Vanessa Selbst", odds: 4.0 },
      { id: "player4", name: "Phil Hellmuth", odds: 4.0 },
    ],
  },
];

