"use client";

import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select, { StylesConfig } from "react-select";
import { Event } from "@/types/event";

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
      date: eventDate.toISOString(),
      category: category.value,
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
    setCategory(CATEGORY_OPTIONS[0]);
    setEventDate(null);
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

