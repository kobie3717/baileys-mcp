import { z } from 'zod'
import type { ServerState } from '../types.js'

export const ListGroupsInput = z.object({})

export const ListGroupsOutput = z.object({
  groups: z.array(
    z.object({
      id: z.string(),
      subject: z.string(),
      participantCount: z.number()
    })
  )
})

export async function listGroupsHandler(args: unknown, state: ServerState) {
  if (!state.sock || !state.connected) {
    throw new Error('WhatsApp not connected')
  }

  ListGroupsInput.parse(args)

  const groups = await state.sock.groupFetchAllParticipating()

  const groupList = Object.values(groups).map((group: any) => ({
    id: group.id,
    subject: group.subject || 'Unnamed Group',
    participantCount: group.participants?.length || 0
  }))

  return {
    content: [{ type: 'text' as const, text: `Found ${groupList.length} groups` }],
    structuredContent: { groups: groupList }
  }
}
