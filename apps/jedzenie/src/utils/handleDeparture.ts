import { App } from "@slack/bolt";
import { Departure, State } from "../services/state";
import { StringIndexed } from "@slack/bolt/dist/types/helpers";

export async function handleDeparture({
    departure: { id, channel, departureTime, ts },
    client,
    state,
}: {
    departure: Departure;
    client: App<StringIndexed>["client"];
    state: State;
}) {
    setTimeout(async () => {
        await state.removeDeparture(id);

        const response = await client.chat.postMessage({
            channel: state.niechKtosBotId,
            text: `nk ${channel} ${ts}`,
        });

        if (!response.ok) {
            console.error(response.error);
        }
    }, Math.max(departureTime - new Date().getTime(), 0));
}
