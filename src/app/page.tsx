import { getFullContent } from "@/lib/content";
import PublicSite from "@/components/PublicSite";

// Always read the latest content straight from Postgres on every request so
// admin edits show up on the live site immediately — no stale cache, no
// separate "publish" step that can get out of sync.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const data = await getFullContent();
  return <PublicSite initialData={data} />;
}
