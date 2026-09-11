export function formatUserMention(slackId: string) {
  return `<@${slackId}>`
}

export function formatUserMentions(slackIds: string[]) {
  return slackIds.map(formatUserMention).join(", ")
}
