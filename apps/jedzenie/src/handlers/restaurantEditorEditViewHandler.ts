import { ViewArgs } from "./types"

export async function restaurantEditorEditViewHandler({ ack, view, client }: ViewArgs) {
    console.log(view.state.values)
}
