"use client";

import { dummyEvents } from "@/data/events";
import { Event, Outcome } from "@/types/event";

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

function handleBet(event: Event, outcome: Outcome) {
  console.log(`Bet placed on "${outcome.name}" for event "${event.name}" at odds ${outcome.odds}`);
}

function EventCard({ event }: { event: Event }) {
  return (
    <div className="event-card">
      <div className="event-info">
        <span className="event-category">{event.category}</span>
        <h2 className="event-name">{event.name}</h2>
        <p className="event-date">{formatDate(event.date)}</p>
      </div>
      <div className="event-outcomes">
        {event.outcomes.map((outcome) => (
          <button
            key={outcome.id}
            className="outcome-btn"
            onClick={() => handleBet(event, outcome)}
          >
            <span className="outcome-name">{outcome.name}</span>
            <span className="outcome-odds">{outcome.odds.toFixed(2)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">Degen Bets</h1>
        <p className="app-subtitle">Place your bets on upcoming events</p>
      </header>

      <main className="events-list">
        {dummyEvents.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </main>
    </div>
  );
}
