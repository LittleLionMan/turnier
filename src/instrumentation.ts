export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { setupDatabase } = await import("./db/setup");
  await setupDatabase();
}
