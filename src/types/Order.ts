/**
 * Type definitions for Order API
 */

import { SellerInfo } from './ProductSeller';

// ORBProduct matches backend ORBProduct class
export interface ORBProduct {
    productName: string;
    quantity: number;
    price: number;
}

export interface OrderRequestBody {
    userId: number | null;
    sellerId: number;
    sellerResponse: SellerInfo;
    productId: number[];
    quantity: number[];
    price: number;
}

// OrderResponseBody matches backend OrderResponseBody class
export interface OrderResponseBody {
    orderId: number;
    price: number;
    seller: SellerInfo | null;
    user: SellerInfo | null;
    completed: boolean;
    accepted: boolean;
    products: ORBProduct[];
}

export interface PlaceOrderError {
    message: string;
    code?: string;
    details?: string;
}

export interface PlaceOrderResult {
    success: boolean;
    data?: string;
    error?: PlaceOrderError;
}
