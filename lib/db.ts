import sqlite3 from "sqlite3"
import { open, type Database } from "sqlite"
import path from "path"
import fs from "fs"
import { hash, compare } from "bcrypt"
import jwt from "jsonwebtoken"

let db: Database | null = null

export async function getDb() {
  if (db) return db

  const dbPath = process.env.SQLITE_PATH || path.join(process.cwd(), "cahier-de-veille.db")
  const dbDir = path.dirname(dbPath)

  // Ensure the directory exists
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true })
  }

  db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  })

  // Enable foreign keys
  await db.exec("PRAGMA foreign_keys = ON")

  return db
}

export async function initDb() {
  const db = await getDb()

  // Create users table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Create profiles table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      redacteur_name TEXT,
      matricule TEXT,
      service TEXT,
      signature TEXT,
      paraphe TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Create cahiers_de_veille table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS cahiers_de_veille (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      evenement TEXT,
      redacteur TEXT,
      poste TEXT,
      frequence TEXT,
      responsable TEXT,
      user_id TEXT NOT NULL,
      archived BOOLEAN DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `)

  // Create communications table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS communications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cahier_id INTEGER NOT NULL,
      appele TEXT,
      appelant TEXT,
      heure TEXT,
      communication TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cahier_id) REFERENCES cahiers_de_veille(id) ON DELETE CASCADE
    )
  `)

  // Create indicatifs table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS indicatifs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cahier_id INTEGER NOT NULL,
      indicatif TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cahier_id) REFERENCES cahiers_de_veille(id) ON DELETE CASCADE
    )
  `)

  console.log("Database initialized successfully")
  return db
}

// Auth functions
export async function createUser(email: string, password: string) {
  const db = await getDb()
  const hashedPassword = await hash(password, 10)
  const id = generateId()

  await db.run("INSERT INTO users (id, email, password) VALUES (?, ?, ?)", [id, email, hashedPassword])

  return { id, email }
}

export async function getUserByEmail(email: string) {
  const db = await getDb()
  return db.get("SELECT * FROM users WHERE email = ?", [email])
}

export async function verifyPassword(user: any, password: string) {
  return compare(password, user.password)
}

export function generateToken(user: any) {
  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not defined")
  }

  return jwt.sign({ id: user.id, email: user.email }, jwtSecret, { expiresIn: "7d" })
}

export function verifyToken(token: string) {
  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not defined")
  }

  try {
    return jwt.verify(token, jwtSecret)
  } catch (error) {
    return null
  }
}

function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
