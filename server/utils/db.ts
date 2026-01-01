// DEPRECATED: This file is no longer used. See saveManager.ts for current implementation.
// Keeping this file for reference only.

import initSqlJs from 'sql.js'
import { promises as fs } from 'fs'
import { resolve } from 'path'

const dbPath = resolve(process.cwd(), 'game.db')
let dbPromise: Promise<any> | null = null

async function getDb() {
  if (!dbPromise) {
    dbPromise = (async () => {
      const SQL = await initSqlJs({
        locateFile: (file) => resolve(process.cwd(), 'node_modules', 'sql.js', 'dist', file)
      })
      let db
      try {
        const file = await fs.readFile(dbPath)
        db = new SQL.Database(new Uint8Array(file))
      } catch {
        db = new SQL.Database()
      }
      db.run(`CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY,
        state TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      );`)
      return db
    })()
  }
  return dbPromise
}

async function persist(db: any) {
  const data = db.export()
  await fs.writeFile(dbPath, Buffer.from(data))
}

export async function saveProfile(id: string, state: unknown) {
  const db = await getDb()
  const stmt = db.prepare(`INSERT INTO profiles (id, state, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET state = excluded.state, updated_at = excluded.updated_at`)
  let serialized = '{}'
  try {
    const maybe = JSON.stringify(state ?? {})
    serialized = maybe || '{}'
  } catch (e) {
    serialized = '{}'
  }
  stmt.run(id, serialized ?? '{}', Date.now())
  await persist(db)
}

export async function loadProfile(id: string) {
  const db = await getDb()
  const stmt = db.prepare('SELECT state FROM profiles WHERE id = ?')
  const row = stmt.get(id)
  if (!row) return null
  try {
    return JSON.parse(row.state)
  } catch (e) {
    return null
  }
}
