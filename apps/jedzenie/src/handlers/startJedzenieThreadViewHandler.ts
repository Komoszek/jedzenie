import { ViewStateValue } from "@slack/bolt";
import { Dependencies, ViewArgs } from "./types";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { getTimeFromString } from "../utils/getTimeFromString";
import { ensureDefined } from "@leancodepl/utils";
import { startJedzenieThread } from "../utils/startJedzenieThread";
import {
    departureBlockId,
    departureTimeId,
    destinationBlockId,
    destinationInputId,
} from "../utils/getJedzenieDialogBlocks";

dayjs.extend(utc);
dayjs.extend(timezone);

export async function startJedzenieThreadViewHandler(
    { ack, view, client, body }: ViewArgs,
    { niechKtosBotId, restaurantsService }: Dependencies,
) {
    const { timezone, selected_time } = view.state.values[departureBlockId][departureTimeId] as ViewStateValue & {
        timezone: string;
    };

    if (!selected_time) {
        await ack({ response_action: "errors", errors: { [departureBlockId]: "Godzina odjazdu jest wymagana" } });
        return;
    }

    await ack();

    const channel = view.private_metadata;

    await startJedzenieThread({
        creatorId: body.user.id,
        time: getTimeFromString(selected_time),
        destination: ensureDefined(view.state.values[destinationBlockId][destinationInputId].rich_text_value),
        channel,
        timezone,
        client,
        niechKtosBotId,
        restaurantsService,
    });
}
