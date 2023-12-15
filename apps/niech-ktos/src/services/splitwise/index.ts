import { Configuration, GroupsApiFactory } from "@jedzenie/splitwise";

export const splitwiseGroupId = Number(process.env.SPLITWISE_GROUP_ID);

export const splitwiseGroupsApi = GroupsApiFactory(
    new Configuration({
        accessToken: process.env.SPLITWISE_API_KEY,
    }),
);
