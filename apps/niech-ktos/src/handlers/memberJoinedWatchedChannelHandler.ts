import { MemberJoinedChannelArgs } from "@jedzenie/utils"
import { splitwiseService } from "../services/splitwise"
import { Dependencies } from "./types"

export async function memberJoinedWatchedChannelHandler(
  { event, client }: MemberJoinedChannelArgs,
  { state, watchedChannelIds }: Dependencies,
) {
  if (!watchedChannelIds.includes(event.channel)) {
    return
  }

  const userId = event.user

  if (state.getSplitwiseUserId(userId)) {
    return
  }

  const { user, ok } = await client.users.info({ user: event.user })

  if (!ok || !user) {
    console.error("Failed to fetch user info")
    return
  }

  if (user.is_bot || user.deleted || user.is_stranger || user.is_restricted || user.is_ultra_restricted) {
    return
  }

  if (!user.profile) {
    console.error("User profile is missing")
    return
  }

  const email = user.profile.email

  if (!email) {
    console.error("User is missing an email")
    return
  }

  const { data } = await splitwiseService.inviteUserToGroup({
    firstName: user.profile.first_name ?? "",
    lastName: user.profile.last_name ?? "",
    email,
  })

  if (!data.success) {
    console.error("Failed to invite user to Splitwise", data.errors)
    return
  }

  const matches = data.user?.id
    ? [{ slackId: userId, splitwiseId: data.user.id }]
    : await splitwiseService.getUsersSplitwiseMatches([{ slackId: userId, email }])

  await state.matchSplitwiseUserIds(matches)
}
