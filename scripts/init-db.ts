import { initDb } from "../lib/db"

async function main() {
  console.log("Initializing database...")
  await initDb()
  console.log("Database initialized successfully")
  process.exit(0)
}

main().catch((err) => {
  console.error("Error initializing database:", err)
  process.exit(1)
})
