import { faker } from '@faker-js/faker';

import { Order } from '../libraries/types';

export function buildOrder(overrides?: Partial<Order>): Order {
  const defaultOrder: Order = {
    userId: 1,
    isPremiumUser: true,
    productId: 2,
    mode: 'approved',
    orderId: 12345,
    orderDate: '2024-12-23T10:00:00Z',
    status: 'processing',
    totalPrice: 59,
    externalIdentifier: faker.string.uuid(),
    currency: 'USD',
    quantity: 1,
    paymentMethod: 'credit_card',
    transactionId: 'txn_987654',
    deliveryAddress: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'USA',
    },
    billingAddress: {
      street: '456 Elm St',
      city: 'Boston',
      state: 'MA',
      postalCode: '02118',
      country: 'USA',
    },
    shippingMethod: 'standard',
    estimatedDeliveryDate: '2024-12-28',
    trackingNumber: 'TRACK123456789',
    items: [
      {
        productId: 2,
        productName: 'Wireless Mouse',
        productPrice: 29.99,
        quantity: 1,
      },
    ],
    discountCode: 'HOLIDAY20',
    discountAmount: 10.0,
    taxAmount: 5.0,
    shippingCost: 5.0,
    giftWrap: false,
    customerNote: 'Please leave the package at the back door.',
    isGift: true,
    refundStatus: 'none',
    loyaltyPointsUsed: 200,
    loyaltyPointsEarned: 10,
    contactEmail: 'user@example.com',
    contactPhone: '+1234567890',
  };

  return { ...defaultOrder, ...overrides };
}
