"use client";

import {useEffect, useMemo, useState, Suspense} from "react";
import {usePathname, useSearchParams} from "next/navigation";
import api from "@/utils/axios";
import axios from "axios";
import {useAuth} from "@/context/AuthContext";
import {SellerInfo} from "@/types/ProductSeller";
import {SellerCard} from "@/components/user/SellerCard";
import UserNavbar from "@/components/user/UserNavbar";
import {LoadingPage} from "@/components/LoadingPage"; // Assuming this component exists

function SellersContent() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const [searchQuery, setSearchQuery] = useState("");
    const [quantityFilter, setQuantityFilter] = useState(1);
    const [sellers, setSellers] = useState<SellerInfo[]>([]);
    const [pageLoading, setPageLoading] = useState(true);

    const productName: string = searchParams.get('product') || 'Product';
    const productPrice: string | 0 = searchParams.get('price') || 0;
    const productImage: string = searchParams.get('image') || '🍽️';
    const productId: string | 0 = searchParams.get('id') || 0;

    const {token, logout, loading} = useAuth();

    // Memoize filtered sellers for performance
    const filteredSellers = useMemo(() => {
        let filtered = sellers;

        if (searchQuery.trim() !== "") {
            filtered = filtered.filter(seller =>
                seller.username.toLowerCase().includes(searchQuery.toLowerCase()));
        }

        filtered = filtered.filter(seller =>
            quantityFilter <= seller.quantity
        );
        return filtered;
    }, [sellers, searchQuery, quantityFilter]);


    useEffect(() => {
        // If auth state is still loading or no productId is present, do nothing
        if (loading || !productId) {
            return;
        }

        // If not authenticated, log out
        if (!token) {
            logout();
            return;
        }

        const fetchSellers = async () => {
            setPageLoading(true); // Start loading state before fetching
            try {
                const response = await api.get<SellerInfo[]>(`/api/user/sellers/${productId}`);

                if (response.status === 200 || response.status === 201) {
                    setSellers(response.data);
                } else if (response.status === 403 || response.status === 401) {
                    logout();
                }
            } catch (error) {
                console.error("Failed to fetch sellers", error);
                if (axios.isAxiosError(error) && (error.response?.status === 403 || error.response?.status === 401)) {
                    logout();
                }
            } finally {
                setPageLoading(false); // End loading state after fetching is done
            }
        };

        if (token) {
            fetchSellers();
        }

    }, [token, logout, loading, productId]);

    // Conditional render for the loading state
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

            <div className="pt-24 pb-8 mt-3 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">

                    <div className="text-center mb-8">
                        <div
                            className="backdrop-blur-lg bg-white/30 border border-white/20 rounded-2xl p-6 shadow-2xl shadow-black/10 max-w-md mx-auto">
                            <div className="text-4xl mb-3">{productImage}</div>
                            <h1 className="text-2xl font-bold text-gray-800 line-clamp-1 mb-2">{productName}</h1>
                            <p className="text-lg text-gray-600">Base Price: <span
                                className="font-bold text-gray-800">${productPrice}</span></p>
                        </div>
                    </div>

                    <div className="max-w-4xl mx-auto mb-12">
                        <div
                            className="backdrop-blur-lg bg-white/30 border border-white/20 rounded-2xl p-6 shadow-2xl shadow-black/10">
                            <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Find Sellers
                                for {productName}</h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Search by Name or
                                        Specialty</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search sellers by name or specialty..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-gray-800 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantity
                                        Needed</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={quantityFilter}
                                        onChange={(e) => setQuantityFilter(parseInt(e.target.value) || 1)}
                                        className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Sellers</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredSellers.map((seller) => (
                                <SellerCard key={seller.userId} seller={seller}/>
                            ))}
                        </div>
                    </div>

                    {filteredSellers.length === 0 && (
                        <div className="text-center py-12">
                            <div
                                className="backdrop-blur-lg bg-white/30 border border-white/20 rounded-2xl p-8 shadow-2xl shadow-black/10 max-w-md mx-auto">
                                <div className="text-6xl mb-4">🔍</div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">No sellers found</h3>
                                <p className="text-gray-600 mb-4">Try adjusting your search criteria or quantity
                                    needed</p>
                                <button
                                    onClick={() => {
                                        setSearchQuery("");
                                        setQuantityFilter(1);
                                    }}
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg shadow-blue-500/25"
                                >
                                    Reset Filters
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function Sellers() {
    return (
        <Suspense fallback={<LoadingPage />}>
            <SellersContent />
        </Suspense>
    );
}
