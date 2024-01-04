import { KnownBlock, ViewStateValue } from "@slack/bolt";
import { departureBlockId, departureTimeId, destinationBlockId, destinationInputId } from "./jedzenieCommandHandler";
import { Dependencies, ViewArgs, WebClient } from "./types";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { getTimeFromString, Time } from "../utils/getTimeFromString";
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

    await startJedzenieThread({
        time: getTimeFromString(selected_time),
        destination: view.state.values[destinationBlockId][destinationInputId].rich_text_value,
        channel: view.private_metadata,
        timezone,
        client,
        niechKtosBotId,
    });
}

export async function startJedzenieThread({
    channel,
    time,
    timezone,
    destination,
    client,
    niechKtosBotId,
}: {
    channel: string;
    time: Time;
    timezone: string;
    destination: KnownBlock;
    client: WebClient;
    niechKtosBotId: string;
}) {
    const response = await client.chat.postMessage({
        channel,
        blocks: [
            destination,
            {
                type: "section",
                text: { type: "mrkdwn", text: `*${time[0]}:${time[1].toString().padStart(2, "0")}*` },
            },
        ],
    });

    if (!response.ok) {
        console.error(response.error);
        return;
    }

    await client.chat.scheduleMessage({
        text: `<@${niechKtosBotId}>`,
        post_at: getDepartureTime(time, timezone),
        channel,
        thread_ts: response.ts,
    });
}

function getDepartureTime([hour, minutes]: Time, timezone: string): number {
    const now = dayjs().tz(timezone);

    let departureTime = now.clone().set("hours", hour).set("minutes", minutes).set("seconds", 0);

    if (departureTime.isBefore(now)) {
        departureTime = departureTime.add(1, "days");
    }

    return departureTime.unix();
}
