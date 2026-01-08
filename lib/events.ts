import { Event } from "@/types/event";
import { dummyEvents } from "@/data/events";

const STORAGE_KEY = "degen-events";

/**
 * Get all events from localStorage
 */
export function getEvents(): Event[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }
    return JSON.parse(stored) as Event[];
  } catch (error) {
    console.error("Error reading events from localStorage:", error);
    return [];
  }
}

/**
 * Save an event to localStorage
 */
export function saveEvent(event: Event): void {
  try {
    const events = getEvents();
    events.push(event);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch (error) {
    console.error("Error saving event to localStorage:", error);
  }
}

/**
 * Delete an event from localStorage
 */
export function deleteEvent(eventId: string): void {
  try {
    const events = getEvents();
    const filtered = events.filter((e) => e.id !== eventId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Error deleting event from localStorage:", error);
  }
}

/**
 * Get all events (dummy + user-created from localStorage)
 */
export function getAllEvents(): Event[] {
  return [...dummyEvents, ...getEvents()];
}

/**
 * Find an event by ID (checks both dummy events and localStorage)
 */
export function getEventById(eventId: string): Event | undefined {
  // First check dummy events
  const dummyEvent = dummyEvents.find((e) => e.id === eventId);
  if (dummyEvent) {
    return dummyEvent;
  }
  // Then check localStorage events
  const storedEvents = getEvents();
  return storedEvents.find((e) => e.id === eventId);
}
