// @ts-nocheck
import { promises as fs } from 'fs'
import { resolve } from 'path'

const savesDir = resolve(process.cwd(), 'data', 'savefiles')

export interface GameState {
  selectedDungeonId: string
  currentLevel: number
  player: {
    name: string
    level: number
    exp: number
    nextLevelExp: number
    maxHp: number
    currentHp: number
    statusEffects: any[]
    stats: {
      attack: number
      magic: number
      defense: number
      magicDefense: number
      speed: number
    }
    weapons: string[]
  }
  availableWeapons: string[]
}

export interface SaveProfile {
  id: string
  name: string
  state: GameState
  updatedAt: number
}

async function ensureDir() {
  try {
    await fs.mkdir(savesDir, { recursive: true })
  } catch (e) {
    // dir may already exist
  }
}

export async function getSaveProfiles(): Promise<SaveProfile[]> {
  await ensureDir()
  try {
    const files = await fs.readdir(savesDir)
    const profiles: SaveProfile[] = []

    for (const file of files) {
      if (file.endsWith('.json')) {
        try {
          const content = await fs.readFile(resolve(savesDir, file), 'utf-8')
          const data = JSON.parse(content)
          profiles.push(data)
        } catch (e) {
          // skip invalid files
        }
      }
    }

    return profiles.sort((a, b) => b.updatedAt - a.updatedAt)
  } catch (e) {
    return []
  }
}

export async function loadProfile(id: string): Promise<GameState | null> {
  await ensureDir()
  try {
    const path = resolve(savesDir, `${id}.json`)
    const content = await fs.readFile(path, 'utf-8')
    const data: SaveProfile = JSON.parse(content)
    return data.state
  } catch (e) {
    return null
  }
}

export async function saveProfile(id: string, name: string, state: GameState): Promise<void> {
  await ensureDir()
  const profile: SaveProfile = {
    id,
    name,
    state,
    updatedAt: Date.now()
  }
  const path = resolve(savesDir, `${id}.json`)
  await fs.writeFile(path, JSON.stringify(profile, null, 2), 'utf-8')
}

export async function deleteProfile(id: string): Promise<void> {
  try {
    const path = resolve(savesDir, `${id}.json`)
    await fs.unlink(path)
  } catch (e) {
    // file not found
  }
}
