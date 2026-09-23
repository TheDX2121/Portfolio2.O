import type { CollabRow, ExperienceRow, SiteContentRow, WorkItemRow } from "@/lib/content";

export type { CollabRow, ExperienceRow, SiteContentRow, WorkItemRow };

export type FullContent = {
  content: SiteContentRow;
  work: WorkItemRow[];
  collabs: CollabRow[];
  experiences: ExperienceRow[];
};

export type NavItem = { id: string; label: string; visible: boolean; order: number };
export type SocialLink = { id: string; platform: string; url: string };

export function safeArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}
