"use client";

import {useRouter} from "next/navigation";
import {useCart} from "@/context/CartContext";
import {useAuth} from "@/context/AuthContext";
import {useEffect, useState} from "react";
import {
    ArrowLeft,
    CheckCircle,
    CreditCard,
    Home,
    Mail,
    MapPin,
    Minus,
    Package,
    Phone,
    Plus,
    ShoppingCart,
    Trash2,
    User
} from "lucide-react";
import {SellerInfo} from "@/types/ProductSeller";
import {LoadingPage} from "@/components/LoadingPage";
import api from "@/utils/axios";
import axios from "axios";
import UserNavbar from "@/components/user/UserNavbar";
import { orderService } from "@/services/orderService";
import { getUserIdFromToken } from "@/utils/jwtUtils";
import { OrderRequestBody } from "@/types/Order";

export default function CartPage() {
    const router = useRouter();
    const {cartItems, currentSellerId, totalAmount: subtotal, updateQuantity, removeFromCart, clearCart} = useCart();
    const {token, logout, loading} = useAuth();

    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [currentSeller, setCurrentSeller] = useState<SellerInfo | null>(null);
    
    // Calculate delivery charges (4% if subtotal < 200, otherwise free)
    const deliveryCharges = subtotal < 200 ? subtotal * 0.04 : 0;
    const totalAmount = subtotal + deliveryCharges;

    // Fetch seller details when currentSellerId changes
    useEffect(() => {
        const fetchSellerData = async () => {
            if (!currentSellerId || loading) {
                setPageLoading(false);
                return;
            }

            if (!token) {
                logout();
                return;
            }

            try {
                setPageLoading(true);
                const response = await api.get<SellerInfo>(`/api/seller/products/seller/${currentSellerId}`);
                setCurrentSeller(response.data);
            } catch (error) {
                console.error("Failed to fetch seller details:", error);
                // Auth errors are now handled by axios interceptor
            } finally {
                setPageLoading(false);
            }
        };

        fetchSellerData();
    }, [currentSellerId, token, logout, loading]);

    const handleQuantityChange = (productId: number, newQuantity: number) => {
        updateQuantity(productId, newQuantity);
    };

    const handleRemoveItem = (productId: number) => {
        removeFromCart(productId);
    };

    const handlePlaceOrder = async () => {
        if (!token || !currentSellerId || !currentSeller) {
            alert("Please login and ensure cart has valid items.");
            return;
        }

        setIsPlacingOrder(true);

        try {
            // Try to get userId from token, but don't fail if it's not there (for old tokens)
            let userId = getUserIdFromToken(token);
            
            // If userId is not in token (old token), we'll let the backend handle it
            // The backend will extract user info from the token or reject with 401/403
            if (!userId) {
                console.warn("UserId not found in token, backend will handle user identification");
                // Use a placeholder - backend should extract real userId from token
                userId = 0; // Backend will ignore this and use token
            }

            // Prepare order data according to backend API structure
            const orderData: OrderRequestBody = {
                userId: userId,
                sellerId: currentSellerId,
                sellerResponse: currentSeller, // Use the currentSeller data we already have
                productId: cartItems.map(item => item.productId),
                quantity: cartItems.map(item => item.qtyInCart),
                price: Math.round(totalAmount * 100) / 100 // Round to 2 decimal places and convert to number
            };

            // Call the order service
            const result = await orderService.placeOrder(orderData, token);

            if (result.success) {
                // Clear cart and show success
                clearCart();
                alert("Order placed successfully! The seller will contact you soon.");
                router.push("/user/home");
            } else {
                // Check if it's an authentication error
                if (result.error?.code === 'UNAUTHORIZED' || result.error?.code === 'FORBIDDEN') {
                    alert("Your session has expired. Please login again.");
                    logout();
                    return;
                }
                
                // Show other error messages
                const errorMessage = result.error?.message || "Failed to place order. Please try again.";
                alert(`Error: ${errorMessage}`);
            }
        } catch (error) {
            console.error("Error placing order:", error);
            
            // Check if it's an axios error with 401/403 status
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 401 || error.response?.status === 403) {
                    alert("Your session has expired. Please login again.");
                    logout();
                    return;
                }
            }
            
            alert("An unexpected error occurred. Please try again.");
        } finally {
            setIsPlacingOrder(false);
        }
    };


    // Show loading page while fetching data
    if (pageLoading) {
        return <LoadingPage/>;
    }

    // Empty cart state
    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
                {/* Header */}
                <header className="bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 py-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.push("/user/home")}
                                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5"/>
                                Back to Products
                            </button>
                            <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
                        </div>
                    </div>
                </header>

                {/* Empty cart content */}
                <div className="max-w-4xl mx-auto px-4 py-16">
                    <div className="text-center">
                        <div
                            className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                            <ShoppingCart className="w-12 h-12 text-blue-500"/>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
                        <p className="text-gray-600 mb-8">Add some products from our sellers to get started!</p>
                        <button
                            onClick={() => router.push("/user/home")}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                        >
                            Browse Products
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white pt-20 to-blue-50">

            <UserNavbar/>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Seller Info Card */}
                        {currentSeller && (
                            <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <User className="w-5 h-5 text-blue-500"/>
                                    Seller Information
                                </h3>
                                <div className="flex items-start gap-4">
                                    <div
                                        className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                                        {currentSeller.profileImage ? (
                                            <img
                                                src={currentSeller.profileImage}
                                                alt={currentSeller.username}
                                                className="w-full h-full object-cover rounded-full"
                                            />
                                        ) : (
                                            <User className="w-6 h-6 text-white"/>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-gray-900">{currentSeller.username}</h4>
                                        <div
                                            className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-blue-500"/>
                                                <span className="truncate">{currentSeller.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-4 h-4 text-blue-500"/>
                                                <span>{currentSeller.phoneNo}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Home className="w-4 h-4 text-blue-500"/>
                                                <span>{currentSeller.hostelName} - {currentSeller.roomNumber}</span>
                                            </div>
                                            {currentSeller.location && (
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-blue-500"/>
                                                    <span>{currentSeller.location}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Cart Items List */}
                        <div className="bg-white rounded-xl shadow-lg border border-blue-100">
                            <div className="p-6 border-b border-blue-100">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <Package className="w-5 h-5 text-blue-500"/>
                                    Items in Cart
                                </h3>
                            </div>
                            <div className="p-6 space-y-4">
                                {cartItems.map((item) => (
                                    <div key={item.productId}
                                         className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                                        {/* Product Image */}
                                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                            {item.imageUrl ? (
                                                <img
                                                    src={item.imageUrl}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div
                                                    className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                                                    <Package className="w-6 h-6 text-blue-400"/>
                                                </div>
                                            )}
                                        </div>

                                        {/* Product Details */}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-gray-900 truncate">{item.name}</h4>
                                            <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                                            <div className="flex items-center gap-4 mt-2">
                                                <span
                                                    className="text-lg font-bold text-blue-600">${item.price.toFixed(2)}</span>
                                                <span className="text-sm text-gray-500">Max: {item.maxQuantity}</span>
                                            </div>
                                        </div>

                                        {/* Quantity Controls */}
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => handleQuantityChange(item.productId, item.qtyInCart - 1)}
                                                disabled={item.qtyInCart <= 1}
                                                className="w-8 h-8 rounded-full bg-blue-100 hover:bg-blue-300 disabled:bg-gray-200 disabled:text-gray-500 text-blue-600 disabled:text-gray-300 flex items-center justify-center transition-colors"
                                            >
                                                <Minus className="w-4 h-4"/>
                                            </button>
                                            <span
                                                className="w-8 text-center text-black/60 font-semibold">{item.qtyInCart}</span>
                                            <button
                                                onClick={() => handleQuantityChange(item.productId, item.qtyInCart + 1)}
                                                disabled={item.qtyInCart >= item.maxQuantity}
                                                className="w-8 h-8 rounded-full bg-blue-100 hover:bg-blue-300 disabled:bg-gray-200 disabled:text-gray-500 text-blue-600 disabled:text-gray-300 flex items-center justify-center transition-colors"
                                            >
                                                <Plus className="w-4 h-4"/>
                                            </button>
                                        </div>

                                        {/* Item Total */}
                                        <div className="text-right">
                                            <div
                                                className="font-bold text-gray-900">${(item.price * item.qtyInCart).toFixed(2)}</div>
                                            <button
                                                onClick={() => handleRemoveItem(item.productId)}
                                                className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1 mt-1 transition-colors"
                                            >
                                                <Trash2 className="w-3 h-3"/>
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100 sticky top-24">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-blue-500"/>
                                Order Summary
                            </h3>

                            {/* Order Details */}
                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal ({cartItems.length} items)</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Delivery Charges</span>
                                    {deliveryCharges === 0 ? (
                                        <span className="text-green-600 font-medium">Free</span>
                                    ) : (
                                        <span className="text-orange-600 font-medium">${deliveryCharges.toFixed(2)}</span>
                                    )}
                                </div>
                                {deliveryCharges > 0 && (
                                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                        <p className="text-xs text-orange-700 text-center">
                                            💰 Add ${(200 - subtotal).toFixed(2)} more to get free delivery!
                                        </p>
                                    </div>
                                )}
                                <div className="border-t border-gray-200 pt-4">
                                    <div className="flex justify-between text-lg font-bold text-gray-900">
                                        <span>Total</span>
                                        <span className="text-blue-600">${totalAmount.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Note */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <p className="text-sm text-blue-700">
                                    💡 Payment will be handled directly with the seller. They will contact you after
                                    placing the order.
                                </p>
                            </div>

                            {/* Place Order Button */}
                            <button
                                onClick={handlePlaceOrder}
                                disabled={isPlacingOrder}
                                className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 ${
                                    isPlacingOrder
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-green-500 hover:bg-green-600 hover:shadow-lg hover:shadow-green-500/30"
                                }`}
                            >
                                {isPlacingOrder ? (
                                    <>
                                        <div
                                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Placing Order...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-5 h-5"/>
                                        Place Order
                                    </>
                                )}
                            </button>

                            {/* Security Note */}
                            <div
                                className="mt-4 p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                                <p className="text-xs text-green-700 text-center font-medium">
                                    🔒 Your order details are secure and will only be shared with the seller
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
