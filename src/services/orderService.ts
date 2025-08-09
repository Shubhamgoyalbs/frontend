/**
 * Order Service - Handles order-related API calls
 */

import api from '@/utils/axios';
import axios, { AxiosError } from 'axios';
import { OrderRequestBody, OrderResponseBody, PlaceOrderResult } from '@/types/Order';

export class OrderService {
    private baseURL = '/api/user/order';

    /**
     * Places an order
     * @param orderData - The order data to send
     * @param token - Authentication token
     * @returns Promise with order placement result
     */
    async placeOrder(orderData: OrderRequestBody, token: string): Promise<PlaceOrderResult> {
        try {
            const response = await api.post<string>(
                `${this.baseURL}/placeOrder`,
                orderData,
                {
                    timeout: 30000, // 30 seconds timeout
                }
            );

            if (response.status === 200 || response.status === 201) {
                return {
                    success: true,
                    data: response.data,
                };
            } else {
                return {
                    success: false,
                    error: {
                        message: 'Unexpected response status',
                        code: response.status.toString(),
                    },
                };
            }
        } catch (error) {
            return this.handleOrderError(error);
        }
    }

    /**
     * Fetches all orders for a user
     * @param userId - The user ID
     * @param token - Authentication token
     * @returns Promise with user orders
     */
    async getAllOrders(userId: number, token: string): Promise<OrderResponseBody[]> {
        try {
            const response = await api.get<OrderResponseBody[]>(
                `${this.baseURL}/allOrders/${userId}`,
                {
                    timeout: 15000, // 15 seconds timeout
                }
            );

            return response.data;
        } catch (error) {
            console.error('Error fetching orders:', error);
            throw error;
        }
    }

    /**
     * Handles errors from order API calls
     * @param error - The error object
     * @returns PlaceOrderResult with error details
     */
    private handleOrderError(error: unknown): PlaceOrderResult {
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError;

            // Network or connection errors
            if (axiosError.code === 'ECONNABORTED') {
                return {
                    success: false,
                    error: {
                        message: 'Order request timed out. Please try again.',
                        code: 'TIMEOUT',
                        details: 'The server took too long to respond.',
                    },
                };
            }

            if (!axiosError.response) {
                return {
                    success: false,
                    error: {
                        message: 'Network error. Please check your connection.',
                        code: 'NETWORK_ERROR',
                        details: 'Unable to reach the server.',
                    },
                };
            }

            // Server response errors
            const status = axiosError.response.status;
            const responseData = axiosError.response.data;

            switch (status) {
                case 400:
                    return {
                        success: false,
                        error: {
                            message: typeof responseData === 'string' ? responseData : 'Invalid order data provided.',
                            code: 'BAD_REQUEST',
                            details: 'Please check your order details and try again.',
                        },
                    };

                case 401:
                    return {
                        success: false,
                        error: {
                            message: 'Authentication failed. Please login again.',
                            code: 'UNAUTHORIZED',
                            details: 'Your session may have expired.',
                        },
                    };

                case 403:
                    return {
                        success: false,
                        error: {
                            message: 'You do not have permission to place this order.',
                            code: 'FORBIDDEN',
                            details: 'Access denied for this operation.',
                        },
                    };

                case 404:
                    return {
                        success: false,
                        error: {
                            message: 'Order service not found.',
                            code: 'NOT_FOUND',
                            details: 'The order endpoint is not available.',
                        },
                    };

                case 409:
                    return {
                        success: false,
                        error: {
                            message: 'Order conflict. Some items may no longer be available.',
                            code: 'CONFLICT',
                            details: 'Please refresh your cart and try again.',
                        },
                    };

                case 422:
                    return {
                        success: false,
                        error: {
                            message: 'Invalid order data format.',
                            code: 'UNPROCESSABLE_ENTITY',
                            details: 'The order data could not be processed.',
                        },
                    };

                case 500:
                    return {
                        success: false,
                        error: {
                            message: 'Server error occurred while placing order.',
                            code: 'INTERNAL_SERVER_ERROR',
                            details: 'Please try again later or contact support.',
                        },
                    };

                case 503:
                    return {
                        success: false,
                        error: {
                            message: 'Order service is temporarily unavailable.',
                            code: 'SERVICE_UNAVAILABLE',
                            details: 'Please try again in a few moments.',
                        },
                    };

                default:
                    return {
                        success: false,
                        error: {
                            message: `Unexpected error occurred (Status: ${status}).`,
                            code: status.toString(),
                            details: 'Please try again or contact support if the problem persists.',
                        },
                    };
            }
        }

        // Non-axios errors
        return {
            success: false,
            error: {
                message: 'An unexpected error occurred while placing the order.',
                code: 'UNKNOWN_ERROR',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
        };
    }
}

// Export singleton instance
export const orderService = new OrderService();
