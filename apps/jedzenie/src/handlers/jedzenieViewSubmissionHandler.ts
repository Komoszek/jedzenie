import { ViewStateValue } from "@slack/bolt";
import { departureBlockId, departureTimeId, destinationBlockId, destinationInputId } from "./jedzenieCommandHandler";
import { Dependencies, ViewArgs } from "./types";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(timezone);

export async function jedzenieViewSubmissionHandler({ ack, view, client }: ViewArgs, { niechKtosBotId }: Dependencies) {
    const { timezone, selected_time } = view.state.values[departureBlockId][departureTimeId] as ViewStateValue & {
        timezone: string;
    };

    if (!selected_time) {
        await ack({ response_action: "errors", errors: { [departureTimeId]: "Godzina odjazdu jest wymagana" } });
        return;
    }

    await ack();

    const channel = view.private_metadata;

    const destination = view.state.values[destinationBlockId][destinationInputId].rich_text_value;

    const response = await client.chat.postMessage({
        channel,
        blocks: [
            destination,
            {
                type: "section",
                text: { type: "mrkdwn", text: `*${selected_time}*` },
            },
        ],
    });

    if (!response.ok) {
        console.error(response.error);
        return;
    }

    await client.chat.scheduleMessage({
        text: `<@${niechKtosBotId}>`,
        post_at: getDepartureTime(selected_time, timezone),
        channel,
        thread_ts: response.ts,
    });
}

function getDepartureTime(time: string, timezone: string): number {
    const now = dayjs().tz(timezone);

    const [hours, minutes] = time.split(":").map(v => parseInt(v));

    let departureTime = now.clone().set("hours", hours).set("minutes", minutes).set("seconds", 0);

    if (departureTime.isBefore(now)) {
        departureTime = departureTime.add(1, "days");
    }

    return departureTime.unix();
}
