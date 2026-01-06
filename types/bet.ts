import { Event, Outcome } from "./event";

/**
 * Represents a bet placed by a user on an event outcome.
 */
export interface Bet {
  /** Unique identifier for this bet */
  id: string;
  /** The event this bet was placed on */
  eventId: string;
  /** Event name (for display purposes) */
  eventName: string;
  /** Event category */
  eventCategory: string;
  /** Event date */
  eventDate: string;
  /** The outcome this bet was placed on */
  outcomeId: string;
  /** Outcome name (for display purposes) */
  outcomeName: string;
  /** The odds when the bet was placed */
  odds: number;
  /** When the bet was placed (ISO 8601 string) */
  placedAt: string;
  /** Status of the bet */
  status: "pending" | "won" | "lost";
}

