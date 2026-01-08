/**
 * Represents a single betting option within an Event.
 * For example, in a table tennis game: "Player 1 Win" or "Player 2 Win"
 */
export interface Outcome {
  /** Unique identifier for this outcome */
  id: string;
  /** Display name (e.g., team name, player name) */
  name: string;
  /** Betting odds for this outcome */
  odds: number;
}

/**
 * Represents resolution information for an event
 */
export interface EventResolution {
  /** The ID of the winning outcome */
  winningOutcomeId: string;
  /** The name of the winning outcome */
  winningOutcomeName: string;
  /** When the event was resolved (ISO 8601 string) */
  resolvedAt: string;
}

/**
 * Represents a game/match/tournament that users can bet on.
 * Contains multiple possible outcomes to bet on.
 */
export interface Event {
  /** Unique identifier for the event */
  id: string;
  /** Event title (e.g., "Team 1 vs Team 2") */
  name: string;
  /** When the event takes place (ISO 8601 string) */
  date: string;
  /** Sport or event type (e.g., "Table Tennis", "Pool", "Poker") */
  category: string;
  /** Array of possible betting outcomes */
  outcomes: Outcome[];
  /** Resolution information (if the event has been resolved) */
  resolution?: EventResolution;
}

