export interface RewardProgram {
  id: number;
  name: string;
  description: string;
  triggerProductId: string;
  triggerProductName: string;
  requiredQuantity: number;
  rewardProductName: string;
  rewardDescription: string;
  expiryDate: string | null;
  maxTotalRedemptions: number | null;
  currentRedemptions: number;
  isActive: boolean;
  createdAt: string;
}

export interface ProductCode {
  id: number;
  code: string;
  productId: string;
  productName: string;
  batchLabel: string;
  status: 'generated' | 'active' | 'redeemed' | 'expired' | 'cancelled';
  assignedCustomerId: number | null;
  redeemedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface RewardRedemption {
  id: number;
  redemptionUid: string;
  customerId: number;
  customerName: string;
  customerEmail: string;
  rewardProgramId: number;
  programName: string;
  rewardProductName: string;
  customerRewardCode: string;
  shopVerificationCode: string | null;
  fulfillmentType: 'delivery' | 'shop_collection' | null;
  status: 'qualified' | 'pending_choice' | 'pending_fulfillment' | 'fulfilled' | 'redeemed' | 'cancelled' | 'expired';
  shopName: string;
  verifiedAt: string | null;
  handoverAt: string | null;
  createdAt: string;
}

export interface RewardStats {
  programs: { total: number; active: number };
  codes: { total: number; active: number; redeemed: number; expired: number; cancelled: number };
  redemptions: {
    total: number; qualified: number; pendingChoice: number; pendingFulfillment: number;
    fulfilled: number; redeemed: number; cancelled: number; expired: number;
    deliveryCount: number; shopCount: number;
  };
  shop: { total: number; completed: number; pending: number };
}

export interface ShopUser {
  id: number;
  name: string;
  email: string;
  role: string;
  shopName: string;
}
