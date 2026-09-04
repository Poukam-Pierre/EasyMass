type OrderWithBeliever = { anonymous: boolean; orderByBeliever: { fullName: string } };

/** Requester name shown for a MassOrder marked `anonymous` — everywhere an
 * order's believer name reaches a parish/admin view or the printed
 * intentions list. Never applied to the payer's own payment receipt, which
 * always shows their real name regardless of any order's anonymous flag. */
export const ANONYMOUS_BELIEVER_NAME = 'Unknown';

/** Masks orderByBeliever.fullName to ANONYMOUS_BELIEVER_NAME on any order
 * flagged anonymous, without touching the underlying Believer record — the
 * real payer identity stays intact for payment/ledger/receipt purposes,
 * only its display here is hidden. Shared by every query path that surfaces
 * orders to a parish/admin view or a printed/emailed intentions document. */
export function maskAnonymousOrders<T extends OrderWithBeliever>(orders: T[]): T[] {
  return orders.map((order) =>
    order.anonymous
      ? {
          ...order,
          orderByBeliever: { ...order.orderByBeliever, fullName: ANONYMOUS_BELIEVER_NAME },
        }
      : order
  );
}
