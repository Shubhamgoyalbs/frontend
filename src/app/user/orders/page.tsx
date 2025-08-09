'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { OrderResponseBody, ORBProduct } from "@/types/Order";
import { orderService } from "@/services/orderService";
import { getUserIdFromToken, isTokenExpired } from "@/utils/jwtUtils";
import "@/app/globals.css"


import {
    Package,
    User,
    Mail,
    Phone,
    Home,
    MapPin,
    CreditCard,
    CheckCircle,
    Clock,
    X,
    Eye,
    ShoppingBag
} from "lucide-react";
import {LoadingPage} from "@/components/LoadingPage";
import UserNavbar from "@/components/user/UserNavbar";


interface OrderDetailModalProps {
    order: OrderResponseBody;
    isOpen: boolean;
    onClose: () => void;
}

function OrderDetailModal({ order, isOpen, onClose }: OrderDetailModalProps) {
    if (!isOpen) return null;

    const formatPrice = (priceInCents: number): string => {
        return (priceInCents).toFixed(2);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-backdrop-enter"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-modal-enter">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                        <p className="text-gray-600">#{order.orderId}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6 text-black/60" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Order Status */}
                    <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-full ${
                                    order.completed ? 'bg-green-100' :
                                        order.accepted ? 'bg-blue-100' :
                                            'bg-yellow-100'
                                }`}>
                                    {order.completed ? (
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                    ) : (
                                        <Clock className="w-5 h-5 text-blue-600" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Order Status</h3>
                                    <p className="text-sm text-gray-600">
                                        Accepted: {order.accepted ? '✅ Yes' : '❌ No'} |
                                        Completed: {order.completed ? '✅ Yes' : '❌ No'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Seller Details */}
                    {order.seller && (
                        <div className="bg-white border border-gray-200 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-blue-500" />
                                Seller Information
                            </h3>
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                                    {order.seller.profileImage ? (
                                        <img
                                            src={order.seller.profileImage}
                                            alt={order.seller.username}
                                            className="w-full h-full object-cover rounded-full"
                                        />
                                    ) : (
                                        <User className="w-8 h-8 text-white" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-xl font-semibold text-gray-900">{order.seller.username}</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-blue-500" />
                                            <span>{order.seller.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-blue-500" />
                                            <span>{order.seller.phoneNo}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Home className="w-4 h-4 text-blue-500" />
                                            <span>{order.seller.hostelName} - {order.seller.roomNumber}</span>
                                        </div>
                                        {order.seller.location && (
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-blue-500" />
                                                <span>{order.seller.location}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Order Items */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Package className="w-5 h-5 text-blue-500" />
                            Order Items ({order.products.length})
                        </h3>
                        <div className="space-y-4">
                            {order.products.map((product, index) => (
                                <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                                            <Package className="w-6 h-6 text-blue-400" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900">{product.productName}</h4>
                                        <div className="flex items-center gap-4 mt-2">
                                            <span className="text-blue-600 font-semibold">${formatPrice(product.price)}</span>
                                            <span className="text-gray-500">Qty: {product.quantity}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-gray-900">
                                            ${formatPrice(product.price * product.quantity)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Total */}
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-blue-500" />
                                    Order Total
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">Final amount for this order</p>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-blue-600">
                                    ${formatPrice(order.price)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function OrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<OrderResponseBody[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<OrderResponseBody | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fetch orders on component mount
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                setError(null);

                // Get JWT token from localStorage
                const token = localStorage.getItem('token');
                
                if (!token) {
                    setError('Please login to view your orders');
                    router.push('/login');
                    return;
                }

                // Check if token is expired
                if (isTokenExpired(token)) {
                    setError('Your session has expired. Please login again.');
                    localStorage.removeItem('token'); // Clean up expired token
                    router.push('/login');
                    return;
                }

                // Extract userId from JWT token
                const userId = getUserIdFromToken(token);
                if (!userId) {
                    setError('Invalid token. Please login again.');
                    localStorage.removeItem('token'); // Clean up invalid token
                    router.push('/login');
                    return;
                }

                // Call the API
                const ordersData = await orderService.getAllOrders(userId, token);
                setOrders(ordersData);
            } catch (err) {
                console.error('Error fetching orders:', err);
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('Failed to load orders. Please try again later.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [router]);

    const handleViewOrder = (order: OrderResponseBody) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
    };

    const getStatusBadge = (order: OrderResponseBody) => {
        if (order.completed) {
            return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Completed</span>;
        } else if (order.accepted) {
            return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">Accepted</span>;
        } else {
            return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">Pending</span>;
        }
    };

    const formatPrice = (priceInCents: number): string => {
        return (priceInCents).toFixed(2);
    };

    // Loading state
    if (loading) {
        return <LoadingPage/>;
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen pt-20 bg-gradient-to-br from-blue-50 via-white to-blue-50">

                <UserNavbar/>

                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="text-center py-16">
                        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
                            <X className="w-12 h-12 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Orders</h2>
                        <p className="text-gray-600 mb-8">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-20 bg-gradient-to-br from-blue-50 via-white to-blue-50">

            <UserNavbar/>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Orders List */}
                {orders.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                            <ShoppingBag className="w-12 h-12 text-blue-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">No orders yet</h2>
                        <p className="text-gray-600 mb-8">You haven&apos;t placed any orders. Start shopping to see your orders here!</p>
                        <button
                            onClick={() => router.push("/user/home")}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                        >
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Order History ({orders.length})
                            </h2>
                        </div>

                        <div className="space-y-4">
                            {orders.map((order) => (
                                <div
                                    key={order.orderId}
                                    className="bg-white rounded-xl p-6 shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-4 mb-3">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    #{order.orderId}
                                                </h3>
                                                {getStatusBadge(order)}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <p className="text-gray-600">Seller</p>
                                                    <p className="font-semibold text-gray-900">{order.seller?.username || 'Unknown'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-600">Items</p>
                                                    <p className="font-semibold text-gray-900">
                                                        {order.products.length} item{order.products.length > 1 ? 's' : ''}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between mt-4">
                                                <div className="flex items-center gap-6 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-gray-600">Accepted:</span>
                                                        <span className={order.accepted ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                              {order.accepted ? "✅ Yes" : "❌ No"}
                            </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-gray-600">Completed:</span>
                                                        <span className={order.completed ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                              {order.completed ? "✅ Yes" : "❌ No"}
                            </span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold text-blue-600">
                                                        ${formatPrice(order.price)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="ml-6">
                                            <button
                                                onClick={() => handleViewOrder(order)}
                                                className="group flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30"
                                            >
                                                <Eye className="w-4 h-4 group-hover:animate-blink" />
                                                View Order
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Order Detail Modal */}
            {selectedOrder && (
                <OrderDetailModal
                    order={selectedOrder}
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
}
