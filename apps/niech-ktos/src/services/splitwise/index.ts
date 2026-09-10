import { Configuration, ExpensesApiFactory, GroupsApiFactory } from "@jedzenie/splitwise"
import { getExpenseFields } from "./getExpenseFields"
import { getErrorMessages, getRequestFailureDetails } from "./getFailureDetails"
import { ExpenseFailure, ExpenseInfo, MatchSlackInfo, SplitwiseMatch } from "./types"

class SplitwiseService {
  private groupsApi
  private expensesApi
  private groupId

  constructor(groupId: number) {
    const configuration = new Configuration({
      accessToken: process.env.SPLITWISE_API_KEY,
    })

    this.groupsApi = GroupsApiFactory(configuration)
    this.expensesApi = ExpensesApiFactory(configuration)
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

  async createExpense({ description, cost, details, shares }: ExpenseInfo): Promise<ExpenseFailure | undefined> {
    try {
      const { data } = await this.expensesApi.createExpensePost({
        group_id: this.groupId,
        description,
        details,
        ...getExpenseFields(cost, shares),
      })

      // Splitwise answers with `200 OK` and a non-empty `errors` object even when it rejected the expense
      const error = getErrorMessages(data.errors)

      return error || !data.expenses?.length ? { details: error, cause: data.errors } : undefined
    } catch (e) {
      return { details: getRequestFailureDetails(e), cause: e }
    }
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

export * from "./types"

export const splitwiseService = new SplitwiseService(Number(process.env.SPLITWISE_GROUP_ID))
