import { splitwiseGroupsApi } from "./api";

const splitwiseGroupId = Number(process.env.SPLITWISE_GROUP_ID);

export function getSplitwiseGroup() {
    return splitwiseGroupsApi.getGroupIdGet(splitwiseGroupId);
}
