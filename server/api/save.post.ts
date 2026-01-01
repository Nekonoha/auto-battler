import { defineEventHandler, readBody, createError } from 'h3'
import { saveProfile } from '../utils/saveManager'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const profileId = body?.profileId || 'default'
  const profileName = body?.profileName || 'Save'
  const state = body?.state

  if (!state || typeof state !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid state' })
  }

  try {
    const plainState = JSON.parse(JSON.stringify(state))
    await saveProfile(profileId, profileName, plainState)
    return { ok: true, profileId }
  } catch (err: any) {
    console.error('save failed', err)
    throw createError({ statusCode: 500, statusMessage: 'Failed to save profile' })
  }
})
