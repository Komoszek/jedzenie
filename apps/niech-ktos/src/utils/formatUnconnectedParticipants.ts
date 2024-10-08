import { formatUserMention } from "./formatUserMention"

export function formatUnconnectedParticipants(unconnectedParticipantIds: string[]) {
    if (unconnectedParticipantIds.length === 0) {
        return ""
    }

    return `Następujące osoby nie znalazły się w rankingu (brak połączenia konta ze Splitwisem :pepe_police:): ${unconnectedParticipantIds
        .map(formatUserMention)
        .join(", ")}`
}
