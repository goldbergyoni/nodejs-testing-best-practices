export type User = {
  id: string;
  name: string;
};

export enum Roles {
  user,
  admin,
}

export type Address = {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type OrderItem = {
  productId: number;
  productName: string;
  productPrice: number;
  quantity: number;
};

export type Order = {
  userId: number;

  isPremiumUser: boolean;
  productId: number;
  mode: 'approved' | 'pending' | 'cancelled';
  orderId: number;
  orderDate: string; // ISO 8601 format
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  totalPrice: number;
  externalIdentifier: string;
  currency: string;
  quantity: number;
  paymentMethod:
    | 'credit_card'
    | 'paypal'
    | 'bank_transfer'
    | 'cash_on_delivery';
  transactionId: string;
  deliveryAddress: Address;
  billingAddress: Address;
  shippingMethod: 'standard' | 'express' | 'overnight';
  estimatedDeliveryDate: string; // ISO 8601 format
  trackingNumber?: string; // Optional, only available after shipping
  items: OrderItem[];
  discountCode?: string; // Optional
  discountAmount: number;
  taxAmount: number;
  shippingCost: number;
  giftWrap: boolean;
  customerNote?: string; // Optional
  isGift: boolean;
  refundStatus: 'none' | 'requested' | 'approved' | 'rejected';
  loyaltyPointsUsed: number;
  loyaltyPointsEarned: number;
  contactEmail: string;
  contactPhone: string;
};
