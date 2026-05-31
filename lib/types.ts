export type ProfileSummary = { id: string; name: string; color: string; initials: string; emoji?: string | null };
export type DisplayEvent = { id: string; title: string; startsAt: string; endsAt: string; allDay: boolean; location?: string | null; profileIds: string[]; color?: string | null; source: string };
export type DisplayTask = { id: string; title: string; emoji?: string | null; dueDate: string | null; dueTime?: string | null; timeOfDay: string; assignedProfileId?: string | null; claimedByProfileId?: string | null; assignmentType: string; status: string; starValue: number; isLate: boolean };
export type DisplayListSummary = { id: string; title: string; color: string; listType: string; items: { id: string; name: string; quantity?: string | null; completed: boolean }[] };
export type DisplayMeal = { id: string; mealDate: string; category: string; title: string; notes?: string | null };
export type DisplaySnapshot = {
  household: { id: string; name: string; timezone: string; weekStartsOn: string };
  device: { id: string; name: string; displayMode: string; orientation: string };
  profiles: ProfileSummary[];
  events: DisplayEvent[];
  tasks: DisplayTask[];
  lists: DisplayListSummary[];
  meals: DisplayMeal[];
  weather?: { label: string; temperature: string; highLow: string; icon: string };
  sync: { lastSyncedAt: string | null; hasErrors: boolean; errors: string[] };
  generatedAt: string;
};
