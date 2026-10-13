import assert from "node:assert/strict";
import test from "node:test";
import { parseCheckoutRequest, parseOrderListQuery } from "../src/order-validation.js";

test("order list query defaults to the first page", () => {
  assert.deepEqual(parseOrderListQuery({}), {
    page: 1,
    limit: 10,
    search: undefined,
    status: undefined,
    paymentStatus: undefined,
  });
});

test("order list query validates pagination and filters", () => {
  assert.deepEqual(
    parseOrderListQuery({ page: "2", limit: "5", status: "pending", paymentStatus: "PAID" }),
    {
      page: 2,
      limit: 5,
      search: undefined,
      status: "PENDING",
      paymentStatus: "PAID",
    },
  );
  assert.equal(parseOrderListQuery({ page: "0" }), null);
  assert.equal(parseOrderListQuery({ limit: "11" }), null);
  assert.equal(parseOrderListQuery({ status: "UNKNOWN" }), null);
  assert.equal(parseOrderListQuery({ search: ["one", "two"] }), null);
});

test("checkout validates customer details and unique positive quantities", () => {
  const checkout = {
    customerName: "A Customer",
    customerPhone: "+91 98765 43210",
    deliveryAddress: "12 Example Street, Sivakasi",
    items: [{ productId: "product-a", quantity: 2 }],
  };
  assert.deepEqual(parseCheckoutRequest(checkout), checkout);
  assert.equal(
    parseCheckoutRequest({ ...checkout, items: [{ productId: "product-a", quantity: 0 }] }),
    null,
  );
  assert.equal(
    parseCheckoutRequest({ ...checkout, items: [...checkout.items, ...checkout.items] }),
    null,
  );
  assert.equal(parseCheckoutRequest({ ...checkout, customerPhone: "not a phone" }), null);
});
