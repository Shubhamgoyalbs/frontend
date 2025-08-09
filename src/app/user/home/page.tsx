"use client";

import {useEffect, useMemo, useState} from "react";
import {usePathname} from "next/navigation";
import {Product} from "@/types/Product";
import api from "@/utils/axios";
import {useAuth} from "@/context/AuthContext";
import {ProductCard} from "@/components/user/ProductCard";
import UserNavbar from "@/components/user/UserNavbar";
import {LoadingPage} from "@/components/LoadingPage"; // Assuming this component exists

export default function UserHome() {
    const [searchQuery, setSearchQuery] = useState("");
    const [products, setProducts] = useState<Product[]>([]);
    const [pageLoading, setPageLoading] = useState(true);
    const pathname = usePathname();
    const {token, logout, loading} = useAuth();

    // Memoize filtered products for efficient searching
    const filteredProducts = useMemo(() => {
        if (searchQuery.trim() === "") {
            return products;
        } else {
            return products.filter(product =>
                product.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
    }, [products, searchQuery]);


    useEffect(() => {
        if (loading) {
            return;
        }

        if (!token) {
            logout();
            return;
        }

        const fetchProducts = async () => {
            setPageLoading(true); // Start loading state
            try {
                const response = await api.get<Product[]>("/api/user/products/all");

                if (response.status === 200 || response.status === 201) {
                    setProducts(response.data);
                } else if (response.status === 403 || response.status === 401) {
                    logout();
                }
            } catch (error) {
                console.error("Failed to fetch products", error);
                // Error handling is now done by axios interceptor
            } finally {
                setPageLoading(false); // End loading state regardless of outcome
            }
        };

        if (token) {
            fetchProducts();
        }
    }, [token, loading, logout]);

    if (pageLoading) {
        return <LoadingPage/>;
    }

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">

            <UserNavbar/>

            <div className="absolute inset-0 overflow-hidden">
                <div
                    className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
                <div
                    className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
                <div
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl"></div>
            </div>

            <div className="pt-24 pb-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-6xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-pulse">
                            HostelBites
                        </h1>
                        <p className="text-xl text-gray-700 backdrop-blur-sm bg-white/20 rounded-2xl px-6 py-3 inline-block border border-white/30">
                            Delicious food delivered to your hostel
                        </p>
                    </div>

                    <div className="max-w-2xl mx-auto mb-12">
                        <div
                            className="relative backdrop-blur-lg bg-white/30 border border-white/20 rounded-2xl p-2 shadow-2xl shadow-black/10">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 pl-4">
                                    <svg
                                        className="h-6 w-6 text-gray-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                        />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search for delicious food..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-4 pr-4 py-4 bg-transparent text-gray-800 placeholder-gray-600 focus:outline-none text-lg"
                                />
                                <button
                                    className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg shadow-blue-500/25 font-medium">
                                    Search
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {filteredProducts.length === 0 ? (
                            <div className="text-center py-12">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                    No products found
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Try adjusting your search or filter criteria
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredProducts.map((product) => (
                                    <ProductCard key={product.productId} product={product}
                                                 productId={product.productId}/>
                                ))}
                            </div>
                        )}
                    </div>

                    {filteredProducts.length === 0 && (
                        <div className="text-center py-12">
                            <div
                                className="backdrop-blur-lg bg-white/30 border border-white/20 rounded-2xl p-8 shadow-2xl shadow-black/10 max-w-md mx-auto">
                                <div className="text-6xl mb-4">😕</div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">No products found</h3>
                                <p className="text-gray-600">Try searching with different keywords</p>
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg shadow-blue-500/25"
                                >
                                    Show All Products
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
