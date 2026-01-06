"use client";

import { useState } from "react";
import { Event } from "@/types/event";

const CATEGORIES = [
    "Foosball",
    "Pool",
    "Poker",
    "Table Tennis",
    "Other",
];

export default function Admin() {
  const [eventName, setEventName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [eventDate, setEventDate] = useState("");
  const [outcomes, setOutcomes] = useState(["", ""]);

  // TODO: Load only events created by the current user from storage
  // Each user should only see and manage their own events here
  const [myCreatedEvents, setMyCreatedEvents] = useState<Event[]>([]);

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
      date: new Date(eventDate).toISOString(),
      category,
      outcomes: outcomes.map((name, index) => ({
        id: `outcome-${index}`,
        name: name.trim(),
        odds: balancedOdds,
      })),
    };

    // TODO: Save event to storage
    console.log("Event created:", newEvent);

    // For now, just add to local state (will be replaced with storage)
    setMyCreatedEvents([...myCreatedEvents, newEvent]);

    // Reset form
    setEventName("");
    setCategory(CATEGORIES[0]);
    setEventDate("");
    setOutcomes(["", ""]);
  };

  const handleDelete = (eventId: string) => {
    // TODO: Delete event from storage (only allowed for events created by current user)
    console.log("Delete event:", eventId);

    // For now, just remove from local state (will be replaced with storage)
    setMyCreatedEvents(myCreatedEvents.filter((e) => e.id !== eventId));
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
            <label className="form-label" htmlFor="category">
              Category
            </label>
            <select
              id="category"
              className="form-input form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="eventDate">
              Date & Time
            </label>
            <input
              type="datetime-local"
              id="eventDate"
              className="form-input"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
            />
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
                  </div>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(event.id)}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

