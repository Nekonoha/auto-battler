import { defineEventHandler, getQuery, createError } from 'h3'
import { loadProfile } from '../utils/saveManager'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const profileId = (query.profileId as string) || 'default'
  const state = await loadProfile(profileId)
  if (!state) {
    throw createError({ statusCode: 404, statusMessage: 'Profile not found' })
  }
  return { ok: true, state }
})
