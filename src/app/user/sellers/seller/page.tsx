"use client"

import {Product} from "@/types/Product";
import {SellerInfo} from "@/types/ProductSeller";
import {ProductCardS} from "@/components/user/ProductCardS";
import {
    Banknote,
    Building2,
    CreditCard,
    Home,
    Mail,
    MapPin,
    Package,
    Phone,
    Search,
    Smartphone,
    User,
    Wallet
} from "lucide-react";
import {useRouter, useSearchParams} from "next/navigation";
import {useEffect, useMemo, useState, Suspense} from "react";
import UserNavbar from "@/components/user/UserNavbar";
import {useAuth} from "@/context/AuthContext";
import {useCart} from "@/context/CartContext";
import api from "@/utils/axios";
import axios from "axios";
import {LoadingPage} from "@/components/LoadingPage";

function SellerDetailContent() {
    const searchParams = useSearchParams();
    const sellerId = searchParams.get('sellerId');
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");

    const [seller, setSeller] = useState<SellerInfo | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [pageLoading, setPageLoading] = useState<boolean>(true);

    const {token, logout, loading} = useAuth();
    const {cartItems, addToCart} = useCart();

    useEffect(() => {
        if (loading || !sellerId) {
            return;
        }

        if (!token) {
            logout();
            return;
        }

        const fetchSellerData = async () => {
            try {
                // Fetch seller details
                const sellerResponse = await api.get<SellerInfo>(`/api/seller/products/seller/${sellerId}`);
                setSeller(sellerResponse.data);

                // Fetch products for the seller
                const productsResponse = await api.get<Product[]>(`/api/seller/products/all/${sellerId}`);
                setProducts(productsResponse.data);

            } catch (error) {
                console.error("Failed to fetch seller details or products:", error);
                // Handle unauthorized access
                if (axios.isAxiosError(error) && (error.response?.status === 403 || error.response?.status === 401)) {
                    logout();
                }
            } finally {
                setPageLoading(false);
            }
        };

        fetchSellerData();
    }, [token, logout, loading, router]);

    const filteredProducts = useMemo(() => {
        return products.filter(product =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [products, searchQuery]);

    // Check if product is already in cart
    const isProductInCart = (productId: number): boolean => {
        return cartItems.some(item => item.productId === productId);
    };

    const handleAddToCart = (productId: number) => {
        // Find the product to add
        const productToAdd = products.find(p => p.productId === productId);
        if (!productToAdd || !sellerId) {
            console.error('Product not found or seller ID missing');
            return;
        }

        // Use the cart context addToCart function
        // Assuming maxQuantity is the same as quantity field in Product type
        const productWithMaxQuantity = {
            ...productToAdd,
            maxQuantity: productToAdd.quantity // Using quantity as maxQuantity
        };

        addToCart(productWithMaxQuantity, parseInt(sellerId));
    };

    const handleGoToCart = () => {
        // Navigate to cart page
        router.push("/user/cart");
    };

    if (pageLoading) {
        return <LoadingPage/>;
    }

    if (!seller) {
        return (
            <div
                className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Seller not found</h1>
                    <button
                        onClick={() => router.push("/user/home")}
                        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Go Back Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br pt-20 from-blue-50 via-white to-blue-50">
            <UserNavbar/>
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Left Panel - Seller Details */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100 sticky top-24">
                            {/* Seller Profile */}
                            <div className="text-center mb-6">
                                <div
                                    className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                                    {seller.profileImage ? (
                                        <img
                                            src={seller.profileImage}
                                            alt={seller.username}
                                            className="w-full h-full object-cover rounded-full"
                                        />
                                    ) : (
                                        <User className="w-10 h-10 text-white"/>
                                    )}
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">{seller.username}</h2>
                                <p className="text-gray-600 text-sm">ID: {seller.userId}</p>
                            </div>
                            {/* Contact Details */}
                            <div className="space-y-4 mb-6">
                                <h3 className="font-semibold text-gray-900 border-b border-blue-100 pb-2">
                                    Contact Information
                                </h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <Mail className="w-4 h-4 text-blue-500 flex-shrink-0"/>
                                        <span className="break-all">{seller.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <Phone className="w-4 h-4 text-blue-500 flex-shrink-0"/>
                                        <span>{seller.phoneNo}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <Home className="w-4 h-4 text-blue-500 flex-shrink-0"/>
                                        <span>{seller.hostelName} - Room {seller.roomNumber}</span>
                                    </div>
                                    {seller.location && (
                                        <div className="flex items-center gap-3 text-gray-700">
                                            <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0"/>
                                            <span>{seller.location}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {/* Payment Methods */}
                            <div className="border-t border-blue-100 pt-6">
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Wallet className="w-5 h-5 text-blue-500"/>
                                    Payment Methods
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {/* Cash on Delivery */}
                                    <div
                                        className="group bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-3 hover:from-green-100 hover:to-green-200 transition-all duration-300 cursor-pointer">
                                        <div className="flex flex-col items-center text-center">
                                            <div
                                                className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                                                <Banknote className="w-5 h-5 text-white"/>
                                            </div>
                                            <span className="text-xs font-medium text-green-800">Cash on</span>
                                            <span className="text-xs font-medium text-green-800">Delivery</span>
                                            <span className="text-xs text-green-600 mt-1">✓ Available</span>
                                        </div>
                                    </div>
                                    {/* UPI/Digital */}
                                    <div
                                        className="group bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-3 hover:from-blue-100 hover:to-blue-200 transition-all duration-300 cursor-pointer">
                                        <div className="flex flex-col items-center text-center">
                                            <div
                                                className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                                                <Smartphone className="w-5 h-5 text-white"/>
                                            </div>
                                            <span className="text-xs font-medium text-blue-800">UPI/</span>
                                            <span className="text-xs font-medium text-blue-800">Digital</span>
                                            <span className="text-xs text-blue-600 mt-1">✓ Available</span>
                                        </div>
                                    </div>
                                    {/* Credit/Debit Card */}
                                    <div
                                        className="group bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-3 hover:from-purple-100 hover:to-purple-200 transition-all duration-300 cursor-pointer">
                                        <div className="flex flex-col items-center text-center">
                                            <div
                                                className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                                                <CreditCard className="w-5 h-5 text-white"/>
                                            </div>
                                            <span className="text-xs font-medium text-purple-800">Credit/</span>
                                            <span className="text-xs font-medium text-purple-800">Debit Card</span>
                                            <span className="text-xs text-purple-600 mt-1">✓ Available</span>
                                        </div>
                                    </div>
                                    {/* Bank Transfer */}
                                    <div
                                        className="group bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-3 hover:from-orange-100 hover:to-orange-200 transition-all duration-300 cursor-pointer">
                                        <div className="flex flex-col items-center text-center">
                                            <div
                                                className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                                                <Building2 className="w-5 h-5 text-white"/>
                                            </div>
                                            <span className="text-xs font-medium text-orange-800">Bank</span>
                                            <span className="text-xs font-medium text-orange-800">Transfer</span>
                                            <span className="text-xs text-orange-600 mt-1">✓ Available</span>
                                        </div>
                                    </div>
                                </div>
                                {/* Payment Security Note */}
                                <div
                                    className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                                    <p className="text-xs text-blue-700 text-center font-medium">
                                        🔒 All payments are secure and verified
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Right Panel - Products */}
                    <div className="lg:col-span-3">
                        {/* Search Bar */}
                        <div className="mb-6">
                            <div className="relative">
                                <Search
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"/>
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 text-black/70 pr-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        {/* Products Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredProducts.map((product) => (
                                <ProductCardS
                                    key={product.productId}
                                    product={product}
                                    isInCart={isProductInCart(product.productId)}
                                    onAddToCart={handleAddToCart}
                                    onGoToCart={handleGoToCart}
                                />
                            ))}
                        </div>
                        {/* No products found */}
                        {filteredProducts.length === 0 && (
                            <div className="text-center py-12">
                                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4"/>
                                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                                    {searchQuery ? "No products found" : "No products available"}
                                </h3>
                                <p className="text-gray-500">
                                    {searchQuery
                                        ? "Try adjusting your search query"
                                        : "This seller hasn't listed any products yet"
                                    }
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function SellerDetail() {
    return (
        <Suspense fallback={<LoadingPage />}>
            <SellerDetailContent />
        </Suspense>
    );
}
