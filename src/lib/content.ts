import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { collabs, experiences, siteContent, workItems } from "@/db/schema";

export type SiteContentRow = typeof siteContent.$inferSelect;
export type WorkItemRow = typeof workItems.$inferSelect;
export type CollabRow = typeof collabs.$inferSelect;
export type ExperienceRow = typeof experiences.$inferSelect;

/** Makes sure the singleton settings row exists, then returns it. */
export async function getSiteContent(): Promise<SiteContentRow> {
  const rows = await db.select().from(siteContent).where(eq(siteContent.id, 1)).limit(1);
  if (rows.length > 0) return rows[0];

  const inserted = await db
    .insert(siteContent)
    .values({ id: 1 })
    .onConflictDoNothing()
    .returning();

  if (inserted.length > 0) return inserted[0];

  const retry = await db.select().from(siteContent).where(eq(siteContent.id, 1)).limit(1);
  return retry[0];
}

export async function updateSiteContent(patch: Partial<typeof siteContent.$inferInsert>) {
  await getSiteContent();
  const [row] = await db
    .update(siteContent)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(siteContent.id, 1))
    .returning();
  return row;
}

export async function getWorkItems(): Promise<WorkItemRow[]> {
  return db.select().from(workItems).orderBy(asc(workItems.order), asc(workItems.id));
}

export async function getCollabs(): Promise<CollabRow[]> {
  return db.select().from(collabs).orderBy(asc(collabs.order), asc(collabs.id));
}

export async function getExperiences(): Promise<ExperienceRow[]> {
  return db.select().from(experiences).orderBy(asc(experiences.order), asc(experiences.id));
}

export async function getFullContent() {
  const [content, work, collabList, experienceList] = await Promise.all([
    getSiteContent(),
    getWorkItems(),
    getCollabs(),
    getExperiences(),
  ]);
  return { content, work, collabs: collabList, experiences: experienceList };
}
