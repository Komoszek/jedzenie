import { KnownBlock } from "@slack/bolt";
import { WebClient } from "../handlers/types";
import { Time } from "./getTimeFromString";
import { DestinationBlock, getJedzenieThreadBlocks, attachEditThreadButton } from "./getJedzenieThreadBlock";
import { ensureDefined } from "@leancodepl/utils";
import { tryScheduleNiechktosMessage } from "./tryScheduleNiechktosMessage";
import { RestaurantsService } from "../services/RestaurantsService";

export async function startJedzenieThread({
    creatorId,
    channel,
    time,
    timezone,
    destination,
    client,
    niechKtosBotId,
    restaurantsService,
}: {
    creatorId: string;
    channel: string;
    time: Time;
    timezone: string;
    destination: DestinationBlock;
    client: WebClient;
    niechKtosBotId: string;
    restaurantsService: RestaurantsService;
}) {
    const blocks = getJedzenieThreadBlocks({ destination, time, creatorId, restaurantsService });

    const response = await client.chat.postMessage({
        channel,
        unfurl_links: false,
        unfurl_media: false,
        blocks: blocks as unknown as KnownBlock[],
    });

    if (!response.ok) {
        console.error(response.error);
        return;
    }

    const scheduledMessageId = await tryScheduleNiechktosMessage({
        client,
        niechKtosBotId,
        channel,
        thread_ts: ensureDefined(response.ts),
        time,
        timezone,
    });

    if (!scheduledMessageId) {
        return;
    }

    await client.chat.update({
        channel,
        ts: ensureDefined(response.ts),
        blocks: attachEditThreadButton({ blocks, creatorId, scheduledMessageId }) as unknown as KnownBlock[],
    });
}
