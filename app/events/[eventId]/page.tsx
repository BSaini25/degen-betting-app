"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { Event, Outcome } from "@/types/event";
import { getEventById } from "@/lib/events";
import { getMoney, STARTING_MONEY } from "@/lib/bets";
import Link from "next/link";

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Client-only date formatting component to prevent hydration errors.
 */
function FormattedDate({ dateString }: { dateString: string }) {
  const [formatted, setFormatted] = useState<string>("");

  useEffect(() => {
    setFormatted(formatDate(dateString));
  }, [dateString]);

  return <>{formatted}</>;
}

/**
 * Checks if an event is currently live (started within the last hour)
 */
function isEventLive(event: Event): boolean {
  const eventDate = new Date(event.date);
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  return eventDate >= oneHourAgo && eventDate <= now;
}

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  // Start with STARTING_MONEY to match server render, then update from localStorage
  const [money, setMoney] = useState<number>(STARTING_MONEY);
  const [event, setEvent] = useState<Event | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [betAmount, setBetAmount] = useState<number>(BET_COST);
  const [isPlacingBet, setIsPlacingBet] = useState(false);

  useEffect(() => {
    // Load event and money from localStorage after mount
    const loadFromStorage = () => {
      setMoney(getMoney());
      setEvent(getEventById(eventId));
      setIsLoading(false);
    };

    requestAnimationFrame(loadFromStorage);

    // Update when storage changes
    const handleStorageChange = () => {
      setMoney(getMoney());
      setEvent(getEventById(eventId));
    };
    window.addEventListener("storage", handleStorageChange);

    // Also check periodically for changes (for same-tab updates)
    const interval = setInterval(() => {
      setMoney(getMoney());
    }, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [eventId]);

  const isLive = useMemo(() => {
    if (typeof window === 'undefined' || !event) return false;
    return isEventLive(event);
  }, [event]);

  async function handleBet(event: Event, outcome: Outcome) {
    if (isPlacingBet) return; // Prevent multiple simultaneous requests
    
    setIsPlacingBet(true);
    
    try {
      const response = await fetch("/api/bet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: event.id,
          eventName: event.name,
          eventCategory: event.category,
          eventDate: event.date,
          outcomeId: outcome.id,
          outcomeName: outcome.name,
          odds: outcome.odds,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to place bet. Please try again.");
        return;
      }

      // Update money display after successful bet
      setMoney(getMoney());
      console.log(`Bet placed on "${outcome.name}" for event "${event.name}" at odds ${outcome.odds}. Remaining balance: ${getMoney()}`);
    } catch (error) {
      console.error("Error placing bet:", error);
      alert("An error occurred while placing the bet. Please try again.");
    } finally {
      setIsPlacingBet(false);
    }
  }

  if (isLoading) {
    return (
      <div className="app-container">
        <div className="event-detail-error">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="app-container">
        <div className="event-detail-error">
          <h1>Event Not Found</h1>
          <p>The event you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/" className="back-link">
            ← Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="event-detail-header">
        <Link href="/" className="back-link">
          ← Back to Events
        </Link>
        <div style={{ marginTop: "0.5rem", fontSize: "1.1rem", fontWeight: "600" }}>
          Balance: {money} money
        </div>
      </div>

      <div className="event-detail-card">
        <div className="event-detail-info">
          <div className="event-detail-meta">
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
              <span className="event-category">{event.category}</span>
              {isLive && (
                <span className="live-indicator" title="Live">
                  <span className="live-dot"></span>
                  <span>LIVE</span>
                </span>
              )}
              {event.resolution && (
                <span className="resolved-indicator" title="Resolved">
                  ✓ Resolved
                </span>
              )}
            </div>
            <h1 className="event-detail-name">{event.name}</h1>
            <p className="event-detail-date">
              <FormattedDate dateString={event.date} />
            </p>
            {event.resolution && (
              <div className="event-resolution-info">
                <p className="resolution-winner">
                  Winner: <strong>{event.resolution.winningOutcomeName}</strong>
                </p>
                <p className="resolution-date">
                  Resolved: <FormattedDate dateString={event.resolution.resolvedAt} />
                </p>
              </div>
            )}
          </div>

          <div className="event-detail-outcomes">
            <h2 className="outcomes-heading">
              {event.resolution ? "Outcomes" : "Place Your Bet"}
            </h2>
            
            {!event.resolution && (
              <div className="bet-amount-section">
                <label className="bet-amount-label" htmlFor="betAmount">
                  Bet Amount
                </label>
                <div className="bet-amount-input-wrapper">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    id="betAmount"
                    className="bet-amount-input"
                    value={betAmount}
                    onChange={(e) => setBetAmount(Math.max(0, parseInt(e.target.value) || 0))}
                  />
                  <span className="bet-amount-currency">money</span>
                  <div className="quick-add-buttons">
                    <button
                      type="button"
                      className="quick-add-btn"
                      onClick={() => setBetAmount(betAmount + 10)}
                    >
                      +10
                    </button>
                    <button
                      type="button"
                      className="quick-add-btn"
                      onClick={() => setBetAmount(betAmount + 25)}
                    >
                      +25
                    </button>
                    <button
                      type="button"
                      className="quick-add-btn"
                      onClick={() => setBetAmount(betAmount + 50)}
                    >
                      +50
                    </button>
                    <button
                      type="button"
                      className="quick-add-btn"
                      onClick={() => setBetAmount(betAmount + 100)}
                    >
                      +100
                    </button>
                  </div>
                </div>
                <p className="bet-amount-hint">
                  Max: {money} money
                </p>
              </div>
            )}

            <div className="outcomes-grid">
              {event.outcomes.map((outcome) => {
                const isWinner = event.resolution?.winningOutcomeId === outcome.id;
                return (
                  <button
                    key={outcome.id}
                    className={`outcome-detail-btn ${isWinner ? "winner-outcome" : ""} ${event.resolution ? "disabled" : ""}`}
                    onClick={() => !event.resolution && handleBet(event, outcome)}
                    disabled={!!event.resolution}
                  >
                    <div className="outcome-detail-content">
                      <span className="outcome-detail-name">{outcome.name}</span>
                      <span className="outcome-detail-odds">{outcome.odds.toFixed(2)}x</span>
                      {!event.resolution && betAmount > 0 && (
                        <span className="potential-payout">
                          Win: {(outcome.odds * betAmount).toFixed(0)}
                        </span>
                      )}
                      {isWinner && <span className="winner-badge">Winner</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Placeholder for additional interactions */}
          <div className="event-detail-actions">
            <h2 className="actions-heading">Additional Information</h2>
            <div className="actions-placeholder">
              <p>More interaction options will be added here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

