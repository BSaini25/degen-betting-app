import { Bet } from "@/types/bet";
import { EventResolution } from "@/types/event";
import { updateEventResolution, getEventById } from "./events";

const STORAGE_KEY = "degen-bets";
const MONEY_STORAGE_KEY = "degen-money";

// Constants for money management
export const STARTING_MONEY = 1000;
export const BET_COST = 100;

/**
 * Get all bets from localStorage
 */
export function getBets(): Bet[] {
  // if (typeof window === "undefined") {
  //   return [];
  // }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }
    return JSON.parse(stored) as Bet[];
  } catch (error) {
    console.error("Error reading bets from localStorage:", error);
    return [];
  }
}

/**
 * Save a bet to localStorage
 */
export function saveBet(bet: Bet): void {
  // if (typeof window === "undefined") {
  //   return;
  // }

  try {
    const bets = getBets();
    bets.push(bet);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bets));
  } catch (error) {
    console.error("Error saving bet to localStorage:", error);
  }
}

/**
 * Place a bet - checks money, creates bet, saves it, and deducts cost atomically
 * Returns true if the bet was successfully placed, false otherwise
 */
export function placeBet(
  eventId: string,
  eventName: string,
  eventCategory: string,
  eventDate: string,
  outcomeId: string,
  outcomeName: string,
  odds: number
): boolean {
  // Check if user has enough money
  if (!hasEnoughMoney()) {
    return false;
  }

  // Create the bet
  const bet = createBet(
    eventId,
    eventName,
    eventCategory,
    eventDate,
    outcomeId,
    outcomeName,
    odds
  );

  // Save the bet and deduct money atomically
  try {
    saveBet(bet);
    deductBetCost();
    return true;
  } catch (error) {
    console.error("Error placing bet:", error);
    return false;
  }
}

/**
 * Get the current money balance from localStorage
 */
export function getMoney(): number {
  try {
    const stored = localStorage.getItem(MONEY_STORAGE_KEY);
    if (!stored) {
      // Initialize with starting money if not set
      setMoney(STARTING_MONEY);
      return STARTING_MONEY;
    }
    return JSON.parse(stored) as number;
  } catch (error) {
    console.error("Error reading money from localStorage:", error);
    // Initialize with starting money on error
    setMoney(STARTING_MONEY);
    return STARTING_MONEY;
  }
}

/**
 * Set the money balance in localStorage
 */
export function setMoney(amount: number): void {
  try {
    localStorage.setItem(MONEY_STORAGE_KEY, JSON.stringify(amount));
  } catch (error) {
    console.error("Error saving money to localStorage:", error);
  }
}

/**
 * Check if the user has enough money to place a bet
 */
export function hasEnoughMoney(): boolean {
  return getMoney() >= BET_COST;
}

/**
 * Deduct the bet cost from the user's money
 */
export function deductBetCost(): void {
  const currentMoney = getMoney();
  const newMoney = currentMoney - BET_COST;
  setMoney(newMoney);
}

/**
 * Create a new bet from event and outcome data
 */
export function createBet(
  eventId: string,
  eventName: string,
  eventCategory: string,
  eventDate: string,
  outcomeId: string,
  outcomeName: string,
  odds: number
): Bet {
  return {
    id: `bet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    eventId,
    eventName,
    eventCategory,
    eventDate,
    outcomeId,
    outcomeName,
    odds,
    placedAt: new Date().toISOString(),
    status: "pending",
  };
}

/**
 * Get all bets for a specific event
 */
export function getBetsByEventId(eventId: string): Bet[] {
  const allBets = getBets();
  return allBets.filter((bet) => bet.eventId === eventId);
}

/**
 * Update a bet's status
 */
export function updateBetStatus(betId: string, status: "won" | "lost"): void {
  try {
    const bets = getBets();
    const updatedBets = bets.map((bet) =>
      bet.id === betId ? { ...bet, status } : bet
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedBets));
  } catch (error) {
    console.error("Error updating bet status:", error);
  }
}

/**
 * Add money to the user's balance (for payouts)
 */
export function addMoney(amount: number): void {
  const currentMoney = getMoney();
  const newMoney = currentMoney + amount;
  setMoney(newMoney);
}

/**
 * Resolve an event by selecting a winning outcome
 * This will:
 * 1. Mark all bets on the winning outcome as "won"
 * 2. Mark all bets on other outcomes as "lost"
 * 3. Pay out winnings to winners (odds * BET_COST)
 * 4. Save resolution information to the event
 */
export function resolveEvent(eventId: string, winningOutcomeId: string): void {
  try {
    // Get the event to find the winning outcome name
    const event = getEventById(eventId);
    if (!event) {
      console.error("Event not found:", eventId);
      return;
    }

    const winningOutcome = event.outcomes.find((o) => o.id === winningOutcomeId);
    if (!winningOutcome) {
      console.error("Winning outcome not found:", winningOutcomeId);
      return;
    }

    const bets = getBets();
    const eventBets = bets.filter((bet) => bet.eventId === eventId);
    
    if (eventBets.length === 0) {
      console.log("No bets found for this event");
      // Still save resolution even if no bets
    }

    // Update all bets and calculate payouts
    const updatedBets = bets.map((bet) => {
      if (bet.eventId !== eventId) {
        return bet; // Not a bet for this event
      }

      if (bet.outcomeId === winningOutcomeId) {
        // Winning bet - mark as won and calculate payout
        const payout = bet.odds * BET_COST;
        addMoney(payout);
        return { ...bet, status: "won" as const };
      } else {
        // Losing bet - mark as lost
        return { ...bet, status: "lost" as const };
      }
    });

    // Save updated bets
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedBets));
    
    // Save resolution information to the event
    const resolution: EventResolution = {
      winningOutcomeId,
      winningOutcomeName: winningOutcome.name,
      resolvedAt: new Date().toISOString(),
    };
    updateEventResolution(eventId, resolution);
    
    console.log(`Event ${eventId} resolved. Winning outcome: ${winningOutcome.name}`);
  } catch (error) {
    console.error("Error resolving event:", error);
  }
}

