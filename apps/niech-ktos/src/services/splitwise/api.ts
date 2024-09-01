import { Configuration, GroupsApiFactory } from "@jedzenie/splitwise"

export const splitwiseGroupsApi = GroupsApiFactory(
    new Configuration({
        accessToken: process.env.SPLITWISE_API_KEY,
    }),
)
