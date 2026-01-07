import { Bet } from "@/types/bet";

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

