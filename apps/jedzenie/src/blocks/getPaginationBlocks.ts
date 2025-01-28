import { z } from "zod"
import { ActionArgs } from "../handlers/types"
import { IntlService } from "../services/IntlService"
import type { ActionsBlock } from "@slack/types"

export function getPaginationBlocks({
    page,
    totalPages,
    intlService,
    getActionId,
}: {
    page: number
    totalPages: number
    intlService: IntlService
    getActionId: (action: string) => string
}): [ActionsBlock] {
    return [
        {
            type: "actions",
            elements: [
                ...(page > 0
                    ? ([
                          {
                              type: "button",
                              text: {
                                  type: "plain_text",
                                  text: intlService.intl.formatMessage({
                                      defaultMessage: "Poprzednia strona",
                                      id: "pagination.previousPage.label",
                                  }),
                              },
                              value: String(page - 1),
                              action_id: getActionId("prev"),
                          },
                      ] as const)
                    : []),
                ...(page + 1 < totalPages
                    ? ([
                          {
                              type: "button",
                              text: {
                                  type: "plain_text",
                                  text: intlService.intl.formatMessage({
                                      defaultMessage: "Następna strona",
                                      id: "pagination.nextPage.label",
                                  }),
                              },
                              value: String(page + 1),
                              action_id: getActionId("next"),
                          },
                      ] as const)
                    : []),
                {
                    type: "static_select",
                    initial_option: getPageOption(page),
                    placeholder: {
                        type: "plain_text",
                        text: intlService.intl.formatMessage({
                            defaultMessage: "Wybierz stronę",
                            id: "pagination.selectPage.placeholder",
                        }),
                    },
                    action_id: getActionId("select"),
                    options: Array.from({ length: totalPages }).map((_, i) => getPageOption(i)),
                },
            ],
        },
    ]
}

export const paginationSchema = z.coerce.number().int().nonnegative()

export type Pagination = z.infer<typeof paginationSchema>

function getPageOption(page: number) {
    return {
        text: {
            type: "plain_text",
            text: String(page + 1),
        },
        value: String(page),
    } as const
}

export function getPaginationValue(payload: ActionArgs["payload"]) {
    let value: string | undefined

    switch (payload.type) {
        case "button":
            value = payload.value
            break
        case "static_select":
            value = payload.selected_option.value
            break
        default:
            return
    }

    return paginationSchema.parse(value)
}
