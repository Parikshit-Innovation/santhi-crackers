import { Prisma, type OrderStatus, type PaymentStatus } from "@prisma/client";
import { db } from "@repo/db/client";
import type { RequestHandler } from "express";
import { parseCheckoutRequest, parseOrderId, parseOrderListQuery } from "./order-validation.js";

class CheckoutError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
  ) {
    super(message);
  }
}

export const createOrder: RequestHandler = async (request, response): Promise<void> => {
  const checkout = parseCheckoutRequest(request.body);
  if (!checkout) {
    response.status(400).json({
      error: "Provide valid customer details and between 1 and 50 unique product items.",
    });
    return;
  }

  try {
    const order = await db.$transaction(
      async (transaction) => {
        const products = await transaction.product.findMany({
          where: { id: { in: checkout.items.map((item) => item.productId) } },
          select: {
            id: true,
            code: true,
            name: true,
            nameEng: true,
            price: true,
            stock: true,
            minOrderQty: true,
            maxOrderQty: true,
            isActive: true,
          },
        });
        const productsById = new Map(products.map((product) => [product.id, product]));
        const zero = new Prisma.Decimal(0);
        let subtotal = zero;
        const orderItems: Array<{
          productId: string;
          productName: string;
          productCode: string;
          quantity: number;
          unitPrice: Prisma.Decimal;
          lineTotal: Prisma.Decimal;
        }> = [];

        for (const requestedItem of checkout.items) {
          const product = productsById.get(requestedItem.productId);
          if (!product || !product.isActive) {
            throw new CheckoutError("One or more products are unavailable.", 409);
          }
          if (
            requestedItem.quantity < product.minOrderQty ||
            (product.maxOrderQty !== null && requestedItem.quantity > product.maxOrderQty) ||
            requestedItem.quantity > product.stock
          ) {
            throw new CheckoutError(
              "One or more products have an invalid quantity or insufficient stock.",
              409,
            );
          }
          if (product.price.isNegative()) {
            throw new CheckoutError("One or more products have invalid pricing.", 409);
          }

          const unitPrice = product.price;
          const lineTotal = unitPrice.mul(requestedItem.quantity);
          subtotal = subtotal.add(lineTotal);
          orderItems.push({
            productId: product.id,
            productName: product.nameEng || product.name || product.code,
            productCode: product.code,
            quantity: requestedItem.quantity,
            unitPrice,
            lineTotal,
          });
        }

        if (subtotal.greaterThan("99999999.99")) {
          throw new CheckoutError("Order total exceeds the supported amount.", 400);
        }

        for (const item of checkout.items) {
          const inventoryUpdate = await transaction.product.updateMany({
            where: {
              id: item.productId,
              isActive: true,
              stock: { gte: item.quantity },
            },
            data: { stock: { decrement: item.quantity } },
          });
          if (inventoryUpdate.count !== 1) {
            throw new CheckoutError(
              "Product stock changed during checkout. Please try again.",
              409,
            );
          }
        }

        const createdOrder = await transaction.order.create({
          data: {
            customerName: checkout.customerName,
            customerPhone: checkout.customerPhone,
            deliveryAddress: checkout.deliveryAddress,
            status: "PENDING",
            paymentStatus: "PENDING",
            subtotal,
            shippingAmount: zero,
            discountAmount: zero,
            total: subtotal,
            items: { create: orderItems },
          },
          select: {
            id: true,
            status: true,
            paymentStatus: true,
            total: true,
            createdAt: true,
            items: { select: { quantity: true } },
          },
        });

        return {
          id: createdOrder.id,
          orderStatus: createdOrder.status,
          paymentStatus: createdOrder.paymentStatus,
          itemCount: createdOrder.items.reduce((count, item) => count + item.quantity, 0),
          total: createdOrder.total.toFixed(2),
          createdAt: createdOrder.createdAt,
        };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    response.status(201).json({ order });
  } catch (error) {
    if (error instanceof CheckoutError) {
      response.status(error.statusCode).json({ error: error.message });
      return;
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") {
      response
        .status(409)
        .json({ error: "Product stock changed during checkout. Please try again." });
      return;
    }
    console.error("Failed to create order:", error);
    response.status(500).json({ error: "Failed to create order." });
  }
};

export const getAdminOrders: RequestHandler = async (request, response): Promise<void> => {
  const query = parseOrderListQuery(request.query as Record<string, unknown>);
  if (!query) {
    response.status(400).json({ error: "Invalid search, status, paymentStatus, page, or limit." });
    return;
  }

  const where: Prisma.OrderWhereInput = {
    ...(query.status ? { status: query.status as OrderStatus } : {}),
    ...(query.paymentStatus ? { paymentStatus: query.paymentStatus as PaymentStatus } : {}),
    ...(query.search
      ? {
          OR: [
            { id: { contains: query.search, mode: "insensitive" } },
            { customerName: { contains: query.search, mode: "insensitive" } },
            { customerPhone: { contains: query.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  try {
    const [orders, totalItems] = await Promise.all([
      db.order.findMany({
        where,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        select: {
          id: true,
          customerName: true,
          customerPhone: true,
          status: true,
          paymentStatus: true,
          total: true,
          createdAt: true,
          items: { select: { quantity: true } },
        },
      }),
      db.order.count({ where }),
    ]);

    response.json({
      items: orders.map((order) => ({
        id: order.id,
        customer: { name: order.customerName, phone: order.customerPhone },
        itemCount: order.items.reduce((count, item) => count + item.quantity, 0),
        total: order.total.toFixed(2),
        paymentStatus: order.paymentStatus,
        orderStatus: order.status,
        createdAt: order.createdAt,
      })),
      pagination: {
        page: query.page,
        limit: query.limit,
        totalItems,
        totalPages: Math.ceil(totalItems / query.limit),
      },
    });
  } catch (error) {
    console.error("Failed to retrieve admin orders:", error);
    response.status(500).json({ error: "Failed to retrieve orders." });
  }
};

export const getAdminOrderById: RequestHandler = async (request, response): Promise<void> => {
  const id = parseOrderId(request.params["id"]);
  if (!id) {
    response.status(400).json({ error: "Invalid order ID." });
    return;
  }

  try {
    const order = await db.order.findUnique({
      where: { id },
      select: {
        id: true,
        customerName: true,
        customerPhone: true,
        deliveryAddress: true,
        status: true,
        paymentStatus: true,
        subtotal: true,
        shippingAmount: true,
        discountAmount: true,
        total: true,
        createdAt: true,
        updatedAt: true,
        items: {
          select: {
            id: true,
            productName: true,
            productCode: true,
            quantity: true,
            unitPrice: true,
            lineTotal: true,
          },
        },
      },
    });

    if (!order) {
      response.status(404).json({ error: "Order not found." });
      return;
    }

    response.json({
      order: {
        id: order.id,
        customer: {
          name: order.customerName,
          phone: order.customerPhone,
        },
        deliveryAddress: order.deliveryAddress,
        status: order.status,
        paymentStatus: order.paymentStatus,
        subtotal: order.subtotal.toFixed(2),
        shippingAmount: order.shippingAmount.toFixed(2),
        discountAmount: order.discountAmount.toFixed(2),
        total: order.total.toFixed(2),
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items: order.items.map((item) => ({
          id: item.id,
          productName: item.productName,
          productCode: item.productCode,
          quantity: item.quantity,
          unitPrice: item.unitPrice.toFixed(2),
          lineTotal: item.lineTotal.toFixed(2),
        })),
      },
    });
  } catch (error) {
    console.error("Failed to retrieve order:", error);
    response.status(500).json({ error: "Failed to retrieve order." });
  }
};
