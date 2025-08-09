"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/axios";
import { useAuth } from "@/context/AuthContext";
import { getUserIdFromToken } from "@/utils/jwtUtils";
import { OrderResponseBody } from "@/types/Order";
import {
    ArrowLeft,
    Package,
    User,
    Mail,
    Phone,
    Home,
    MapPin,
    Check,
    Clock,
    ShoppingBag,
    AlertCircle,
    RefreshCw,
    X,
    CheckCircle,
    DollarSign,
    Calendar
} from "lucide-react";
import SellerNavbar from "@/components/seller/SellerNavbar";

export default function SellerOrders() {
    const router = useRouter();
    const { token, loading: authLoading } = useAuth();
    
    // Get seller ID from JWT token
    const sellerId = token ? getUserIdFromToken(token) : null;

    // State management
    const [orders, setOrders] = useState<OrderResponseBody[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>("");
    const [processingOrders, setProcessingOrders] = useState<Set<number>>(new Set());

    // Fetch orders on component load  
    useEffect(() => {
        const loadOrders = async () => {
            if (sellerId) {
                await fetchOrders();
            } else if (token && !sellerId) {
                setLoading(false); // Token exists but no seller ID found
            }
        };
        loadOrders();
    }, [sellerId, token]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await api.get(`/api/seller/order/allOrders/${sellerId}`);
            
            // Debug logging
            console.log('📦 Orders API Response:', response.data);
            response.data.forEach((order: OrderResponseBody) => {
                console.log(`Order ${order.orderId}: isAccepted=${order.accepted} (${typeof order.accepted}), isCompleted=${order.completed} (${typeof order.completed})`);
            });
            
            setOrders(response.data);
        } catch (err) {
            setError("Failed to fetch orders");
            console.error("Error fetching orders:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptOrder = async (orderId: number) => {
        if (!window.confirm("Are you sure you want to accept this order?")) {
            return;
        }

        try {
            setProcessingOrders(prev => new Set([...prev, orderId]));
            await api.put(`/api/seller/order/accept/${orderId}`);

            // Refresh orders from server to ensure UI is synchronized
            await fetchOrders();
            setError("");
        } catch (err: unknown) {
            const errorMessage = (err as {response?: {data?: {error?: string}}})?.response?.data?.error || "Failed to accept order";
            setError(errorMessage);
            console.error("Error accepting order:", err);
        } finally {
            setProcessingOrders(prev => {
                const newSet = new Set(prev);
                newSet.delete(orderId);
                return newSet;
            });
        }
    };

    const handleCompleteOrder = async (orderId: number) => {
        if (!window.confirm("Are you sure you want to mark this order as completed?")) {
            return;
        }

        try {
            setProcessingOrders(prev => new Set([...prev, orderId]));
            await api.put(`/api/seller/order/complete/${orderId}`);

            // Update the order in state
            setOrders(prev =>
                prev.map(order =>
                    order.orderId === orderId
                        ? { ...order, completed: true }
                        : order
                )
            );
            setError("");
        } catch (err: unknown) {
            const errorMessage = (err as {response?: {data?: {error?: string}}})?.response?.data?.error || "Failed to complete order";
            setError(errorMessage);
            console.error("Error completing order:", err);
        } finally {
            setProcessingOrders(prev => {
                const newSet = new Set(prev);
                newSet.delete(orderId);
                return newSet;
            });
        }
    };

    const getOrderStatus = (order: OrderResponseBody) => {
        if (order.completed) {
            return { text: "Completed", color: "green", bgColor: "bg-green-100", textColor: "text-green-800" };
        } else if (order.accepted) {
            return { text: "Accepted", color: "blue", bgColor: "bg-blue-100", textColor: "text-blue-800" };
        } else {
            return { text: "Pending", color: "yellow", bgColor: "bg-yellow-100", textColor: "text-yellow-800" };
        }
    };

    const getOrderStats = () => {
        const total = orders.length;
        const pending = orders.filter(o => !o.accepted).length;
        const accepted = orders.filter(o => o.accepted && !o.completed).length;
        const completed = orders.filter(o => o.completed).length;
        const totalRevenue = orders
            .filter(o => o.completed)
            .reduce((sum, order) => sum + order.price, 0);

        return { total, pending, accepted, completed, totalRevenue };
    };

    const stats = getOrderStats();

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading your orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-20 bg-gradient-to-br from-blue-50 via-white to-blue-50">
            {/* Navbar */}
            <SellerNavbar/>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Error Message */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <p className="text-red-700">{error}</p>
                        <button
                            onClick={() => setError("")}
                            className="ml-auto text-red-500 hover:text-red-700"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                    <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Total Orders</p>
                                <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <ShoppingBag className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Pending</p>
                                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                            </div>
                            <div className="bg-yellow-100 p-3 rounded-lg">
                                <Clock className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Accepted</p>
                                <p className="text-3xl font-bold text-blue-600">{stats.accepted}</p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <Check className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Completed</p>
                                <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-lg">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Revenue</p>
                                <p className="text-3xl font-bold text-purple-600">${(stats.totalRevenue / 100).toFixed(2)}</p>
                            </div>
                            <div className="bg-purple-100 p-3 rounded-lg">
                                <DollarSign className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Orders List */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Your Orders ({orders.length})
                        </h2>
                        
                        <button
                            onClick={fetchOrders}
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Refresh
                        </button>
                    </div>

                    {orders.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                                <ShoppingBag className="w-12 h-12 text-blue-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">No orders yet</h3>
                            <p className="text-gray-600 mb-8">When customers place orders, they&apos;ll appear here.</p>
                            <button
                                onClick={() => router.push("/seller/home")}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                            >
                                Manage Products
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order) => {
                                const status = getOrderStatus(order);
                                const isProcessing = processingOrders.has(order.orderId);

                                return (
                                    <div
                                        key={order.orderId}
                                        className="bg-white rounded-xl p-6 shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-4">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        Order #{order.orderId}
                                                    </h3>
                                                    <div className="flex items-center gap-2 mt-1">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.bgColor} ${status.textColor}`}>
                              {status.text}
                            </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-blue-600">
                                                    ${(order.price).toFixed(2)}
                                                </div>
                                                <p className="text-sm text-gray-600">{order.products.length} item{order.products.length > 1 ? 's' : ''}</p>
                                            </div>
                                        </div>

                                        {/* Customer Information */}
                                        {order.user && (
                                            <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                    <User className="w-4 h-4 text-blue-500" />
                                                    Customer Information
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <User className="w-4 h-4 text-gray-600" />
                                                        <span className="font-medium">{order.user.username}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="w-4 h-4 text-gray-400" />
                                                        <span>{order.user.email}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="w-4 h-4 text-gray-400" />
                                                        <span>{order.user.phoneNo}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Home className="w-4 h-4 text-gray-400" />
                                                        <span>{order.user.hostelName} - {order.user.roomNumber}</span>
                                                    </div>
                                                    {order.user.location && (
                                                        <div className="flex items-center gap-2 md:col-span-2">
                                                            <MapPin className="w-4 h-4 text-gray-400" />
                                                            <span>{order.user.location}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Products */}
                                        <div className="mb-4">
                                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                <Package className="w-4 h-4 text-blue-500" />
                                                Products Ordered
                                            </h4>
                                            <div className="space-y-3">
                                                {order.products.map((product, index) => (
                                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                        <div className="flex-1">
                                                            <h5 className="font-medium text-gray-900">{product.productName}</h5>
                                                            <p className="text-sm text-gray-600">Quantity: {product.quantity}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="font-semibold text-gray-900">
                                                                ${(product.price).toFixed(2)} each
                                                            </div>
                                                            <div className="text-sm text-gray-600">
                                                                Total: ${((product.price * product.quantity)).toFixed(2)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                                            {!order.accepted && (
                                                <button
                                                    onClick={() => handleAcceptOrder(order.orderId)}
                                                    disabled={isProcessing}
                                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                                                        isProcessing
                                                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                            : "bg-green-500 hover:bg-green-600 text-white hover:shadow-lg hover:shadow-green-500/30"
                                                    }`}
                                                >
                                                    {isProcessing ? (
                                                        <>
                                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                                            Processing...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Check className="w-4 h-4" />
                                                            Accept Order
                                                        </>
                                                    )}
                                                </button>
                                            )}

                                            {order.accepted && !order.completed && (
                                                <button
                                                    onClick={() => handleCompleteOrder(order.orderId)}
                                                    disabled={isProcessing}
                                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                                                        isProcessing
                                                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                            : "bg-blue-500 hover:bg-blue-600 text-white hover:shadow-lg hover:shadow-blue-500/30"
                                                    }`}
                                                >
                                                    {isProcessing ? (
                                                        <>
                                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                                            Processing...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircle className="w-4 h-4" />
                                                            Mark Complete
                                                        </>
                                                    )}
                                                </button>
                                            )}

                                            {order.completed && (
                                                <div className="flex items-center gap-2 text-green-600 font-medium">
                                                    <CheckCircle className="w-4 h-4" />
                                                    Order Completed
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
