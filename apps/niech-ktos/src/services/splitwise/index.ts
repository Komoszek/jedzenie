import { Configuration, GroupsApiFactory } from "@jedzenie/splitwise"

class SplitwiseService {
  private groupsApi
  private groupId

  constructor(groupId: number) {
    this.groupsApi = GroupsApiFactory(
      new Configuration({
        accessToken: process.env.SPLITWISE_API_KEY,
      }),
    )
    this.groupId = groupId
  }

  getGroup() {
    return this.groupsApi.getGroupIdGet(this.groupId)
  }

  async getUsersSplitwiseMatches(usersToMatch: MatchSlackInfo[]): Promise<SplitwiseMatch[]> {
    const {
      data: { group },
    } = await this.getGroup()

    const splitwiseIdsMap = new Map(group?.members?.map(({ email, id }) => [email, id]))

    return usersToMatch.reduce<SplitwiseMatch[]>((accumulator, { slackId, email }) => {
      const splitwiseId = splitwiseIdsMap.get(email)

      if (splitwiseId === undefined) {
        return accumulator
      }

      return [...accumulator, { slackId, splitwiseId }]
    }, [])
  }

  async inviteUserToGroup({ firstName, lastName, email }: { firstName: string; lastName: string; email: string }) {
    return this.groupsApi.addUserToGroupPost({
      group_id: this.groupId,
      first_name: firstName,
      last_name: lastName,
      email,
    })
  }
}

export type MatchSlackInfo = {
  slackId: string
  email: string
}

export type SplitwiseMatch = {
  slackId: string
  splitwiseId: number
}

export const splitwiseService = new SplitwiseService(Number(process.env.SPLITWISE_GROUP_ID))
