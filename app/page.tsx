"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { dummyEvents } from "@/data/events";
import { Event } from "@/types/event";
import { STARTING_MONEY } from "@/lib/bets";
import { getEvents } from "@/lib/events";

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

/**
 * Checks if an event is currently live (started within the last hour)
 */
function isEventLive(event: Event): boolean {
  const eventDate = new Date(event.date);
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  return eventDate >= oneHourAgo && eventDate <= now;
}

function EventCard({ event }: { event: Event }) {
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
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
            <span className="event-category">{event.category}</span>
            {isLive && (
              <span className="live-indicator" title="Live">
                <span className="live-dot"></span>
              </span>
            )}
            {event.resolution && (
              <span className="resolved-indicator" title="Resolved">
                ✓ {event.resolution.winningOutcomeName}
              </span>
            )}
          </div>
          <h2 className="event-name">{event.name}</h2>
          <p className="event-date"><FormattedDate dateString={event.date} /></p>
          {event.resolution && (
            <p className="event-resolution">
              Winner: <strong>{event.resolution.winningOutcomeName}</strong>
            </p>
          )}
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
  // Start with STARTING_MONEY to match server render, then update from API
  const [money, setMoney] = useState<number>(STARTING_MONEY);
  // Combine dummy events with user-created events from localStorage
  const [allEvents, setAllEvents] = useState<Event[]>(dummyEvents);
  // Category filter state (null = show all)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Get unique categories from all events
  const categories = Array.from(new Set(allEvents.map((e) => e.category))).sort();

  // Filter events based on selected category
  const filteredEvents = selectedCategory
    ? allEvents.filter((e) => e.category === selectedCategory)
    : allEvents;

  // Function to fetch user money from the API
  const fetchUserMoney = async () => {
    try {
      const response = await fetch("/api/user");
      if (response.ok) {
        const userData = await response.json();
        setMoney(userData.money);
      } else {
        console.error("Failed to fetch user money:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching user money:", error);
    }
  };

  useEffect(() => {
    // Load events from localStorage and money from API after mount
    const loadData = async () => {
      const createdEvents = getEvents();
      setAllEvents([...dummyEvents, ...createdEvents]);
      await fetchUserMoney();
    };

    loadData();

    // Periodically refresh money from database
    const interval = setInterval(() => {
      fetchUserMoney();
    }, 2000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">Degen Bets</h1>
        <p className="app-subtitle">Place your bets on upcoming events</p>
        <div style={{ marginTop: "0.5rem", fontSize: "1.1rem", fontWeight: "600" }}>
          Balance: {money} money
        </div>
      </header>

      <div className="category-filter">
        <button
          className={`filter-tab ${selectedCategory === null ? "active" : ""}`}
          onClick={() => setSelectedCategory(null)}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category}
            className={`filter-tab ${selectedCategory === category ? "active" : ""}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <main className="events-list">
        {filteredEvents.length === 0 ? (
          <div className="no-events">
            <p>No events found in this category</p>
          </div>
        ) : (
          filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))
        )}
      </main>
    </div>
  );
}
