"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { getEventById } from "@/data/events";
import { Event, Outcome } from "@/types/event";
import { placeBet, getMoney, BET_COST, STARTING_MONEY } from "@/lib/bets";
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
  const event = getEventById(eventId);
  // Start with STARTING_MONEY to match server render, then update from localStorage
  const [money, setMoney] = useState<number>(STARTING_MONEY);

  useEffect(() => {
    // Load actual money from localStorage after mount (using rAF to satisfy linter)
    requestAnimationFrame(() => setMoney(getMoney()));

    // Update money display when it changes
    const handleStorageChange = () => {
      setMoney(getMoney());
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
  }, []);

  const isLive = useMemo(() => {
    if (typeof window === 'undefined' || !event) return false;
    return isEventLive(event);
  }, [event]);

  function handleBet(event: Event, outcome: Outcome) {
    const success = placeBet(
      event.id,
      event.name,
      event.category,
      event.date,
      outcome.id,
      outcome.name,
      outcome.odds
    );

    if (!success) {
      alert(`Insufficient funds! You need ${BET_COST} money to place a bet. Current balance: ${getMoney()}`);
      return;
    }

    // Update money display after successful bet
    setMoney(getMoney());
    console.log(`Bet placed on "${outcome.name}" for event "${event.name}" at odds ${outcome.odds}. Remaining balance: ${getMoney()}`);
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
            </div>
            <h1 className="event-detail-name">{event.name}</h1>
            <p className="event-detail-date">
              <FormattedDate dateString={event.date} />
            </p>
          </div>

          <div className="event-detail-outcomes">
            <h2 className="outcomes-heading">Place Your Bet</h2>
            <div className="outcomes-grid">
              {event.outcomes.map((outcome) => (
                <button
                  key={outcome.id}
                  className="outcome-detail-btn"
                  onClick={() => handleBet(event, outcome)}
                >
                  <div className="outcome-detail-content">
                    <span className="outcome-detail-name">{outcome.name}</span>
                    <span className="outcome-detail-odds">{outcome.odds.toFixed(2)}</span>
                  </div>
                </button>
              ))}
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

