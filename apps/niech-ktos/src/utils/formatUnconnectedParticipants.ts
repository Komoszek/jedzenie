import { formatUserMention } from "@jedzenie/utils"
import { IntlService } from "../services/IntlService"

export function formatUnconnectedParticipants(unconnectedParticipantIds: string[], intlService: IntlService) {
    if (unconnectedParticipantIds.length === 0) {
        return ""
    }

    return intlService.intl.formatMessage(
        {
            defaultMessage: `Następujące osoby nie znalazły się w rankingu (brak połączenia konta ze Splitwisem :pepe_police:): {users}`,
            id: "unconnectedParticipants",
        },
        { users: unconnectedParticipantIds.map(formatUserMention).join(", ") },
    )
}
