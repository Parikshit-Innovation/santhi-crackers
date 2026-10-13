import type { OrderStatus, PaymentStatus } from "@repo/db/client";

const ORDER_STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
const PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED", "REFUNDED"];

export const parseOrderId = (raw: unknown): string | null => {
  if (typeof raw !== "string") return null;
  const id = raw.trim();
  if (id.length < 1 || id.length > 100 || /[\u0000-\u001f\u007f]/.test(id)) return null;
  return id;
};

export type OrderListQuery = {
  page: number;
  limit: number;
  search?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
};

export type CheckoutRequest = {
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  items: Array<{ productId: string; quantity: number }>;
};

const parseInteger = (value: unknown, fallback: number, maximum: number): number | null => {
  if (value === undefined) return fallback;
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value.trim())) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed <= maximum ? parsed : null;
};

const parseStatus = <T extends string>(value: unknown, allowed: string[]): T | undefined | null => {
  if (value === undefined) return undefined;
  if (typeof value !== "string") return null;
  const normalized = value.trim().toUpperCase();
  return allowed.includes(normalized) ? (normalized as T) : null;
};

export const parseOrderListQuery = (query: Record<string, unknown>): OrderListQuery | null => {
  const page = parseInteger(query.page, 1, 1_000_000);
  const limit = parseInteger(query.limit, 10, 10);
  const status = parseStatus<OrderStatus>(query.status, ORDER_STATUSES);
  const paymentStatus = parseStatus<PaymentStatus>(query.paymentStatus, PAYMENT_STATUSES);

  if (page === null || limit === null || status === null || paymentStatus === null) return null;

  let search: string | undefined;
  if (query.search !== undefined) {
    if (typeof query.search !== "string") return null;
    search = query.search.trim();
    if (search.length > 100 || /[\u0000-\u001f\u007f]/.test(search)) return null;
    if (!search) search = undefined;
  }

  return { page, limit, search, status, paymentStatus };
};

export const parseCheckoutRequest = (body: unknown): CheckoutRequest | null => {
  if (typeof body !== "object" || body === null || Array.isArray(body)) return null;

  const checkout = body as Record<string, unknown>;
  if (
    typeof checkout.customerName !== "string" ||
    typeof checkout.customerPhone !== "string" ||
    typeof checkout.deliveryAddress !== "string" ||
    !Array.isArray(checkout.items)
  ) {
    return null;
  }

  const customerName = checkout.customerName.trim();
  const customerPhone = checkout.customerPhone.trim();
  const deliveryAddress = checkout.deliveryAddress.trim();
  const phoneDigits = customerPhone.replace(/\D/g, "");
  if (
    customerName.length < 1 ||
    customerName.length > 120 ||
    /[\u0000-\u001f\u007f]/.test(customerName) ||
    !/^\+?[0-9().\-\s]{7,24}$/.test(customerPhone) ||
    phoneDigits.length < 7 ||
    phoneDigits.length > 15 ||
    deliveryAddress.length < 5 ||
    deliveryAddress.length > 1000 ||
    /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(deliveryAddress) ||
    checkout.items.length < 1 ||
    checkout.items.length > 50
  ) {
    return null;
  }

  const items: CheckoutRequest["items"] = [];
  const productIds = new Set<string>();
  for (const item of checkout.items) {
    if (typeof item !== "object" || item === null || Array.isArray(item)) return null;
    const candidate = item as Record<string, unknown>;
    if (
      typeof candidate.productId !== "string" ||
      candidate.productId.trim().length < 1 ||
      candidate.productId.trim().length > 100 ||
      !Number.isSafeInteger(candidate.quantity) ||
      (candidate.quantity as number) < 1 ||
      (candidate.quantity as number) > 1000
    ) {
      return null;
    }

    const productId = candidate.productId.trim();
    if (productIds.has(productId)) return null;
    productIds.add(productId);
    items.push({ productId, quantity: candidate.quantity as number });
  }

  return { customerName, customerPhone, deliveryAddress, items };
};
