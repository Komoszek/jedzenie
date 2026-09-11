import { State } from "../services/state"
import { getBillExpense } from "./getBillExpense"
import { Bill } from "./parseBillMessage"

// Stubs out only the single-id lookup, so the real `getSplitwiseUserIds` from the prototype stays under test.
const state: State = Object.assign(Object.create(State.prototype), {
  getSplitwiseUserId: (slackId: string) => ({ U1: 11, U2: 22, U3: 33 })[slackId],
})

describe("getBillExpense", () => {
  it("should make the payer pay the whole cost", () => {
    const bill: Bill = {
      payerSlackId: "U1",
      shares: [
        { slackId: "U1", amount: 4500 },
        { slackId: "U2", amount: 3050 },
      ],
      total: 7550,
    }

    expect(getBillExpense(bill, state)).toEqual({
      cost: 7550,
      shares: [
        { splitwiseId: 11, paidShare: 7550, owedShare: 4500 },
        { splitwiseId: 22, paidShare: 0, owedShare: 3050 },
      ],
      unconnectedSlackIds: [],
    })
  })

  it("should add the payer who owes nothing to the shares", () => {
    const bill: Bill = {
      payerSlackId: "U1",
      shares: [{ slackId: "U2", amount: 3000 }],
      total: 3000,
    }

    expect(getBillExpense(bill, state)).toMatchObject({
      cost: 3000,
      shares: [
        { splitwiseId: 22, paidShare: 0, owedShare: 3000 },
        { splitwiseId: 11, paidShare: 3000, owedShare: 0 },
      ],
    })
  })

  it("should report participants without a connected Splitwise account", () => {
    const bill: Bill = {
      payerSlackId: "U1",
      shares: [
        { slackId: "U2", amount: 3000 },
        { slackId: "UNKNOWN", amount: 2000 },
      ],
      total: 5000,
    }

    expect(getBillExpense(bill, state).unconnectedSlackIds).toEqual(["UNKNOWN"])
  })
})
