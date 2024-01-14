import { KnownBlock, ViewStateValue } from "@slack/bolt";
import { departureBlockId, departureTimeId, destinationBlockId, destinationInputId } from "./jedzenieCommandHandler";
import { Dependencies, ViewArgs, WebClient } from "./types";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { getTimeFromString, Time } from "../utils/getTimeFromString";
import { knownBlockToText } from "../utils/knownBlockToText";
import { ensureDefined } from "@leancodepl/utils";
import { isObject } from "../utils/isObject";

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

    const { creatorId, channel } = JSON.parse(view.private_metadata);

    await startJedzenieThread({
        creatorId,
        time: getTimeFromString(selected_time),
        destination: ensureDefined(view.state.values[destinationBlockId][destinationInputId].rich_text_value),
        channel,
        timezone,
        client,
        niechKtosBotId,
    });
}

export async function startJedzenieThread({
    creatorId,
    channel,
    time,
    timezone,
    destination,
    client,
    niechKtosBotId,
}: {
    creatorId: string;
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
                text: { type: "mrkdwn", text: `*${time[0]}:${time[1].toString().padStart(2, "0")}* ~ <@${creatorId}>` },
            },
            ...((isTawernaThread(destination)
                ? [
                      {
                          type: "actions",
                          elements: [
                              {
                                  type: "button",
                                  text: {
                                      type: "plain_text",
                                      text: "Pokaż menu lunchowe",
                                      emoji: true,
                                  },
                                  action_id: showTawernaLunchMenuButtonId,
                              },
                          ],
                      },
                  ]
                : []) as KnownBlock[]),
        ],
    });

    if (!response.ok) {
        console.error(response.error);
        return;
    }

    const message = {
        text: `<@${niechKtosBotId}>`,
        channel,
        thread_ts: response.ts,
    };

    try {
        await client.chat.scheduleMessage({
            ...message,
            post_at: getDepartureTime(time, timezone),
        });
    } catch (e) {
        // Probably will never happen but you never know
        if (isObject(e) && "data" in e && isObject(e.data) && "error" in e.data && e.data.error === "time_in_past") {
            await client.chat.postMessage(message);
        }
    }
}

function getDepartureTime([hour, minutes]: Time, timezone: string): number {
    const now = dayjs().tz(timezone);

    let departureTime = now.clone().set("hours", hour).set("minutes", minutes).set("seconds", 0);

    if (departureTime.isBefore(now)) {
        departureTime = departureTime.add(1, "days");
    }

    return departureTime.unix();
}

function isTawernaThread(destination: KnownBlock) {
    const rawText = knownBlockToText(destination).toLowerCase();

    return ["flag-gr", "tawerna", "twrn"].some(keyword => rawText.includes(keyword));
}

export const showTawernaLunchMenuButtonId = "show_tawerna_lunch_menu";
