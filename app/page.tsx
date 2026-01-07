"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { dummyEvents } from "@/data/events";
import { Event, Outcome } from "@/types/event";
import { placeBet, getMoney, BET_COST, STARTING_MONEY } from "@/lib/bets";

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Client-only date formatting component to prevent hydration errors.
 * toLocaleDateString() produces different results on server vs client
 * due to timezone/locale differences. By formatting only after mount,
 * we ensure server and client render the same initial content.
 */
function FormattedDate({ dateString }: { dateString: string }) {
  const [formatted, setFormatted] = useState<string>("");

  useEffect(() => {
    setFormatted(formatDate(dateString));
  }, [dateString]);

  return <>{formatted}</>;
}

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

  console.log(`Bet placed on "${outcome.name}" for event "${event.name}" at odds ${outcome.odds}. Remaining balance: ${getMoney()}`);
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

function EventCard({ event, onBet }: { event: Event; onBet: (event: Event, outcome: Outcome) => void }) {
  const [isLive, setIsLive] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsLive(isEventLive(event));
  }, [event]);

  const handleOutcomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/events/${event.id}`);
  };

  return (
    <Link href={`/events/${event.id}`} className="event-card-link">
      <div className="event-card">
        <div className="event-info">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
            <span className="event-category">{event.category}</span>
            {isLive && (
              <span className="live-indicator" title="Live">
                <span className="live-dot"></span>
              </span>
            )}
          </div>
          <h2 className="event-name">{event.name}</h2>
          <p className="event-date"><FormattedDate dateString={event.date} /></p>
        </div>
      <div className="event-outcomes">
        {event.outcomes.map((outcome) => (
          <button
            key={outcome.id}
            className="outcome-btn"
            onClick={handleOutcomeClick}
          >
            <span className="outcome-name">{outcome.name}</span>
            <span className="outcome-odds">{outcome.odds.toFixed(2)}</span>
          </button>
        ))}
      </div>
    </div>
    </Link>
  );
}

export default function Home() {
  const [money, setMoney] = useState<number>(() => {
    if (typeof window !== "undefined") {
      return getMoney();
    }
    return STARTING_MONEY;
  });

  useEffect(() => {
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

  // Update money when a bet is placed (same tab)
  const handleBetWithUpdate = (event: Event, outcome: Outcome) => {
    handleBet(event, outcome);
    setMoney(getMoney());
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">Degen Bets</h1>
        <p className="app-subtitle">Place your bets on upcoming events</p>
        <div style={{ marginTop: "0.5rem", fontSize: "1.1rem", fontWeight: "600" }}>
          Balance: {money} money
        </div>
      </header>

      <main className="events-list">
        {dummyEvents.map((event) => (
          <EventCard key={event.id} event={event} onBet={handleBetWithUpdate} />
        ))}
      </main>
    </div>
  );
}
