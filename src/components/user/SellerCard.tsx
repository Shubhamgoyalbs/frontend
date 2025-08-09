"use client"

import {SellerInfo} from "@/types/ProductSeller";
import {Home, Mail, MapPin, Package, Phone, User} from "lucide-react";
import {useRouter} from "next/navigation";

interface SellerCardProps {
    seller: SellerInfo;
}

export function SellerCard({seller}: SellerCardProps) {

    const router = useRouter();


    function handleSeeProduct() {
        const query = new URLSearchParams({
            sellerId: seller.userId.toString(),
        });

        router.push(`/user/sellers/seller?${query.toString()}`);
    }

    return (
        <div
            className="group relative bg-white rounded-2xl p-6 shadow-lg border border-blue-100 hover:border-blue-300 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-2 transform">

            <div className="relative">

                <div className="flex items-start gap-4 mb-4">
                    <div className="relative">
                        <div
                            className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:shadow-blue-500/50 transition-all duration-300 group-hover:scale-110">
                            {seller.profileImage ? (
                                <img
                                    src={seller.profileImage}
                                    alt={seller.username}
                                    className="w-full h-full object-cover rounded-full"
                                />
                            ) : (
                                <User className="w-8 h-8 text-white"/>
                            )}
                        </div>

                        <div
                            className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                    </div>

                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                            {seller.username}
                        </h3>
                        <p className="text-gray-600 text-sm">ID: {seller.userId}</p>
                    </div>


                    <div
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold group-hover:bg-blue-200 transition-colors duration-300">
                        {seller.quantity} items
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center gap-3 text-gray-700">
                        <Mail className="w-4 h-4 text-blue-500"/>
                        <span className="text-sm">{seller.email}</span>
                    </div>

                    <div className="flex items-center gap-3 text-gray-700">
                        <Phone className="w-4 h-4 text-blue-500"/>
                        <span className="text-sm">{seller.phoneNo}</span>
                    </div>

                    <div className="flex items-center gap-3 text-gray-700">
                        <Home className="w-4 h-4 text-blue-500"/>
                        <span className="text-sm">{seller.hostelName} - Room {seller.roomNumber}</span>
                    </div>

                    {seller.location && (
                        <div className="flex items-center gap-3 text-gray-700">
                            <MapPin className="w-4 h-4 text-blue-500"/>
                            <span className="text-sm">{seller.location}</span>
                        </div>
                    )}
                </div>

                {/* Action button */}
                <div className="mt-6">
                    <button
                        className="group/btn w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-0.5"
                        onClick={handleSeeProduct}>
                        <Package
                            className="w-4 h-4 inline mr-2 transition-all duration-500 group-hover/btn:rotate-[360deg] group-hover/btn:animate-bounce"/>
                        View Products
                    </button>
                </div>
            </div>
        </div>
    );
}
