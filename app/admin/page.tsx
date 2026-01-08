"use client";

import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select, { StylesConfig } from "react-select";
import { Event } from "@/types/event";
import { getEvents, saveEvent, deleteEvent } from "@/lib/events";
import { resolveEvent, getBetsByEventId } from "@/lib/bets";

type CategoryOption = {
  value: string;
  label: string;
};

const selectStyles: StylesConfig<CategoryOption, false> = {
  control: (base, state) => ({
    ...base,
    background: "var(--bg-secondary)",
    borderColor: state.isFocused ? "var(--accent)" : "var(--border)",
    borderRadius: "10px",
    padding: "0.25rem 0.25rem",
    boxShadow: "none",
    "&:hover": {
      borderColor: "var(--accent)",
    },
  }),
  menu: (base) => ({
    ...base,
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "10px",
    overflow: "hidden",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
  }),
  menuList: (base) => ({
    ...base,
    padding: "0.25rem",
  }),
  option: (base, state) => ({
    ...base,
    background: state.isSelected
      ? "var(--accent)"
      : state.isFocused
      ? "var(--bg-secondary)"
      : "transparent",
    color: "var(--text-primary)",
    borderRadius: "6px",
    cursor: "pointer",
    "&:active": {
      background: "var(--accent)",
    },
  }),
  singleValue: (base) => ({
    ...base,
    color: "var(--text-primary)",
  }),
  placeholder: (base) => ({
    ...base,
    color: "var(--text-muted)",
  }),
  input: (base) => ({
    ...base,
    color: "var(--text-primary)",
  }),
  indicatorSeparator: () => ({
    display: "none",
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: "var(--text-secondary)",
    "&:hover": {
      color: "var(--text-primary)",
    },
  }),
};

const CATEGORY_OPTIONS: CategoryOption[] = [
  { value: "Foosball", label: "Foosball" },
  { value: "Pool", label: "Pool" },
  { value: "Poker", label: "Poker" },
  { value: "Table Tennis", label: "Table Tennis" },
  { value: "Other", label: "Other" },
];

export default function Admin() {
  const [mounted, setMounted] = useState(false);
  const [eventName, setEventName] = useState("");
  const [category, setCategory] = useState<CategoryOption>(CATEGORY_OPTIONS[0]);
  const [eventDate, setEventDate] = useState<Date | null>(null);
  const [outcomes, setOutcomes] = useState(["", ""]);

  /**
   * Prevent hydration mismatch for react-select and react-datepicker.
   * These components render differently on server vs client, so we only
   * render them after the component has mounted on the client.
   */
  useEffect(function onMount() {
    // Using requestAnimationFrame to defer setState and avoid lint warning
    requestAnimationFrame(() => setMounted(true));
  }, []);

  // Start with empty array to match server render, then load from localStorage
  const [myCreatedEvents, setMyCreatedEvents] = useState<Event[]>([]);
  const [resolvingEventId, setResolvingEventId] = useState<string | null>(null);
  const [selectedWinningOutcome, setSelectedWinningOutcome] = useState<string>("");

  useEffect(() => {
    // Load events from localStorage after mount
    const loadEvents = () => {
      setMyCreatedEvents(getEvents());
    };
    requestAnimationFrame(loadEvents);

    // Listen for storage changes (in case events are added from another tab)
    const handleStorageChange = () => {
      loadEvents();
    };
    window.addEventListener("storage", handleStorageChange);

    // Also check periodically for changes (for same-tab updates)
    const interval = setInterval(() => {
      loadEvents();
    }, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const addOutcome = () => {
    setOutcomes([...outcomes, ""]);
  };

  const removeOutcome = (index: number) => {
    if (outcomes.length > 2) {
      setOutcomes(outcomes.filter((_, i) => i !== index));
    }
  };

  const updateOutcome = (index: number, value: string) => {
    const updated = [...outcomes];
    updated[index] = value;
    setOutcomes(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    if (!eventName.trim() || !eventDate || outcomes.some((o) => !o.trim())) {
      alert("Please fill in all fields");
      return;
    }

    // Calculate balanced odds based on number of outcomes
    const balancedOdds = parseFloat((outcomes.length).toFixed(2));

    const newEvent: Event = {
      id: `evt-${Date.now()}`,
      name: eventName.trim(),
      date: eventDate.toISOString(),
      category: category.value,
      outcomes: outcomes.map((name, index) => ({
        id: `outcome-${index}`,
        name: name.trim(),
        odds: balancedOdds,
      })),
    };

    // Save event to localStorage
    saveEvent(newEvent);

    // Update local state
    setMyCreatedEvents([...myCreatedEvents, newEvent]);

    // Reset form
    setEventName("");
    setCategory(CATEGORY_OPTIONS[0]);
    setEventDate(null);
    setOutcomes(["", ""]);
  };

  const handleDelete = (eventId: string) => {
    // Delete event from localStorage
    deleteEvent(eventId);

    // Update local state
    setMyCreatedEvents(myCreatedEvents.filter((e) => e.id !== eventId));
  };

  const handleResolve = (eventId: string) => {
    setResolvingEventId(eventId);
    setSelectedWinningOutcome("");
  };

  const confirmResolve = () => {
    if (!resolvingEventId || !selectedWinningOutcome) {
      alert("Please select a winning outcome");
      return;
    }

    // Check if there are any bets on this event
    const bets = getBetsByEventId(resolvingEventId);
    if (bets.length === 0) {
      alert("No bets found for this event. Nothing to resolve.");
      setResolvingEventId(null);
      return;
    }

    // Resolve the event
    resolveEvent(resolvingEventId, selectedWinningOutcome);

    // Close the resolve dialog
    setResolvingEventId(null);
    setSelectedWinningOutcome("");

    alert(`Event resolved! Winning outcome: ${selectedWinningOutcome}. Payouts have been made to winners.`);
  };

  const cancelResolve = () => {
    setResolvingEventId(null);
    setSelectedWinningOutcome("");
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">Admin</h1>
        <p className="app-subtitle">Create and manage events</p>
      </header>

      <main className="admin-content">
        <form className="event-form" onSubmit={handleSubmit}>
          <h2 className="form-title">Create New Event</h2>

          <div className="form-group">
            <label className="form-label" htmlFor="eventName">
              Event Name
            </label>
            <input
              type="text"
              id="eventName"
              className="form-input"
              placeholder="e.g., Player 1 vs Player 2"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            {mounted && (
              <Select
                value={category}
                onChange={(option) => option && setCategory(option)}
                options={CATEGORY_OPTIONS}
                styles={selectStyles}
                isSearchable={false}
                placeholder="Select category"
              />
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Date & Time</label>
            {mounted && (
              <DatePicker
                selected={eventDate}
                onChange={(date: Date | null) => setEventDate(date)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="MMMM d, yyyy h:mm aa"
                placeholderText="Select date and time"
                className="form-input"
                wrapperClassName="datepicker-wrapper"
                minDate={new Date()}
              />
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Outcomes</label>
            <div className="outcomes-list">
              {outcomes.map((outcome, index) => (
                <div key={index} className="outcome-input-row">
                  <input
                    type="text"
                    className="form-input"
                    placeholder={`Outcome ${index + 1}`}
                    value={outcome}
                    onChange={(e) => updateOutcome(index, e.target.value)}
                  />
                  {outcomes.length > 2 && (
                    <button
                      type="button"
                      className="remove-outcome-btn"
                      onClick={() => removeOutcome(index)}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              className="add-outcome-btn"
              onClick={addOutcome}
            >
              + Add Outcome
            </button>
          </div>

          <button type="submit" className="submit-btn">
            Create Event
          </button>
        </form>

        <section className="events-management">
          <h2 className="form-title">My Created Events</h2>
          {myCreatedEvents.length === 0 ? (
            <p className="no-events">You haven&apos;t created any events yet</p>
          ) : (
            <div className="admin-events-list">
              {myCreatedEvents.map((event) => (
                <div key={event.id} className="admin-event-item">
                  <div className="admin-event-info">
                    <span className="event-category">{event.category}</span>
                    <h3 className="admin-event-name">{event.name}</h3>
                    <p className="admin-event-outcomes">
                      {event.outcomes.map((o) => o.name).join(" vs ")}
                    </p>
                    <p className="admin-event-bet-count">
                      {getBetsByEventId(event.id).length} bet(s) placed
                    </p>
                  </div>
                  <div className="admin-event-actions">
                    {!event.resolution && (
                      <button
                        className="resolve-btn"
                        onClick={() => handleResolve(event.id)}
                      >
                        Resolve
                      </button>
                    )}
                    {event.resolution && (
                      <div className="resolved-badge">
                        Resolved: {event.resolution.winningOutcomeName}
                      </div>
                    )}
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(event.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Resolve Event Modal */}
      {resolvingEventId && (
        <div className="modal-overlay" onClick={cancelResolve}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Resolve Event</h2>
            <p className="modal-subtitle">
              Select the winning outcome for this event. All bets will be marked as won or lost, and payouts will be made to winners.
            </p>
            <div className="form-group">
              <label className="form-label">Winning Outcome</label>
              <select
                className="form-input"
                value={selectedWinningOutcome}
                onChange={(e) => setSelectedWinningOutcome(e.target.value)}
              >
                <option value="">Select outcome...</option>
                {myCreatedEvents
                  .find((e) => e.id === resolvingEventId)
                  ?.outcomes.map((outcome) => (
                    <option key={outcome.id} value={outcome.id}>
                      {outcome.name} (odds: {outcome.odds.toFixed(2)}x)
                    </option>
                  ))}
              </select>
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={cancelResolve}>
                Cancel
              </button>
              <button className="confirm-btn" onClick={confirmResolve}>
                Resolve Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

