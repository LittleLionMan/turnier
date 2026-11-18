import path from "node:path";
import { eq } from "drizzle-orm";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "./index";
import { event, helperRole } from "./schema";
import { CURRENT_EVENT_SLUG } from "@/lib/constants";

export async function setupDatabase(): Promise<void> {
  await migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });

  const existing = await db.query.event.findFirst({ where: eq(event.slug, CURRENT_EVENT_SLUG) });
  if (existing) return;

  const [created] = await db
    .insert(event)
    .values({ slug: CURRENT_EVENT_SLUG, name: "Ehemaligenturnier" })
    .returning();

  await db.insert(helperRole).values({
    eventId: created.id,
    label: "Schiedsrichter",
    description: "Du pfeifst eins oder mehrere Spiele. Eine Lizenz brauchst du nicht.",
    sortOrder: 0,
  });
}
