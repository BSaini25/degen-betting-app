"use client";

import { useEffect, useState } from "react";
import { Bet } from "@/types/bet";
import { getBets } from "@/lib/bets";

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
 */
function FormattedDate({ dateString }: { dateString: string }) {
  const [formatted, setFormatted] = useState<string>("");

  useEffect(() => {
    setFormatted(formatDate(dateString));
  }, [dateString]);

  return <>{formatted}</>;
}

function getStatusColor(status: Bet["status"]): string {
  switch (status) {
    case "won":
      return "status-won";
    case "lost":
      return "status-lost";
    case "pending":
      return "status-pending";
    default:
      return "";
  }
}

function BetCard({ bet }: { bet: Bet }) {
  return (
    <div className="event-card">
      <div className="event-info">
        <span className="event-category">{bet.eventCategory}</span>
        <h2 className="event-name">{bet.eventName}</h2>
        <p className="event-date">
          <FormattedDate dateString={bet.eventDate} />
        </p>
      </div>
      <div className="event-outcomes bet-outcomes">
        <div className="outcome-btn bet-display">
          <span className="outcome-name">{bet.outcomeName}</span>
          <span className="outcome-odds">{bet.odds.toFixed(2)}x</span>
        </div>
        <span className={`bet-status ${getStatusColor(bet.status)}`}>
          {bet.status}
        </span>
      </div>
    </div>
  );
}

export default function MyBets() {
  const [bets, setBets] = useState<Bet[]>(() => {
    // Initialize with bets from localStorage if available
    if (typeof window !== "undefined") {
      return getBets();
    }
    return [];
  });

  useEffect(() => {
    // Listen for storage changes (in case bets are added from another tab)
    const handleStorageChange = () => {
      setBets(getBets());
    };
    window.addEventListener("storage", handleStorageChange);

    // Also check periodically for changes (for same-tab updates)
    const interval = setInterval(() => {
      setBets(getBets());
    }, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">My Bets</h1>
        <p className="app-subtitle">Track your active and past bets</p>
      </header>

      <main className="events-list">
        {bets.length === 0 ? (
          <div className="placeholder-content">
            <div className="placeholder-card">
              <p className="placeholder-text">No bets yet</p>
              <p className="placeholder-subtext">
                Your bets will appear here once you start placing them.
              </p>
            </div>
          </div>
        ) : (
          bets.map((bet) => <BetCard key={bet.id} bet={bet} />)
        )}
      </main>
    </div>
  );
}

