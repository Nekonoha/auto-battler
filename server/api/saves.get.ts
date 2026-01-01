import { defineEventHandler } from 'h3'
import { getSaveProfiles } from '../utils/saveManager'

export default defineEventHandler(async () => {
  const profiles = await getSaveProfiles()
  return { profiles }
})
