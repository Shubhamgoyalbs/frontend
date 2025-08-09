"use client";

import { useState, useEffect } from "react";
import {useRouter} from "next/navigation";
import api from "@/utils/axios";
import { useAuth } from "@/context/AuthContext";
import { getUserIdFromToken } from "@/utils/jwtUtils";
import { Product } from "@/types/Product";
import {
    ArrowLeft,
    Plus,
    Minus,
    Trash2,
    Package,
    Edit,
    X,
    ShoppingCart,
    Save,
    RefreshCw,
    AlertCircle,
    Check
} from "lucide-react";
import SellerNavbar from "@/components/seller/SellerNavbar";

export default function SellerHome() {
    const router = useRouter();
    const { token, loading: authLoading } = useAuth();
    
    // Get seller ID from JWT token
    const sellerId = token ? getUserIdFromToken(token) : null;

    // State management
    const [listedProducts, setListedProducts] = useState<Product[]>([]);
    const [nonListedProducts, setNonListedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>("");
    const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [editingQuantity, setEditingQuantity] = useState<{ [key: number]: number }>({});

    // Fetch listed products on component load
    useEffect(() => {
        if (sellerId) {
            fetchListedProducts();
        } else if (token && !sellerId) {
            setLoading(false); // Token exists but no seller ID found
        }
    }, [sellerId, token]);

    const fetchListedProducts = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await api.get(`/api/seller/products/listedProducts/${sellerId}`);
            setListedProducts(response.data);
        } catch (err) {
            setError("Failed to fetch listed products");
            console.error("Error fetching listed products:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchNonListedProducts = async () => {
        try {
            console.log('Fetching non-listed products for seller ID:', sellerId);
            const response = await api.get(`/api/seller/products/nonListedProducts/${sellerId}`);
            console.log('Non-listed products response:', response.data);
            setNonListedProducts(response.data);
        } catch (err) {
            console.error("Error fetching non-listed products:", err);
        }
    };

    const handleDeleteProduct = async (productId: number) => {
        if (!window.confirm("Are you sure you want to remove this product from your listing?")) {
            return;
        }

        try {
            console.log(`Attempting to delete product ${productId} for seller ${sellerId}`);
            const response = await api.delete(`/api/seller/products/deleteProduct/${sellerId}/${productId}`);
            console.log('Delete response:', response.data);
            setListedProducts(prev => prev.filter(p => p.productId !== productId));
            setError("");
        } catch (err: any) {
            console.error("Error deleting product:", err);
            console.error("Error response:", err.response?.data);
            console.error("Error status:", err.response?.status);
            setError(`Failed to delete product: ${err.response?.data || err.message}`);
        }
    };

    const handleUpdateQuantity = async (productId: number, newQuantity: number) => {
        if (newQuantity < 0) return;

        try {
            await api.put(`/api/seller/products/updateProduct/${sellerId}/${productId}/${newQuantity}`);
            setListedProducts(prev =>
                prev.map(p => p.productId === productId ? { ...p, quantity: newQuantity } : p)
            );
            setEditingQuantity(prev => {
                const newState = { ...prev };
                delete newState[productId];
                return newState;
            });
            setError("");
        } catch (err) {
            setError("Failed to update quantity");
            console.error("Error updating quantity:", err);
        }
    };

    const handleOpenAddModal = async () => {
        setIsAddModalOpen(true);
        await fetchNonListedProducts();
    };

    const handleCloseAddModal = () => {
        setIsAddModalOpen(false);
        setSelectedProducts(new Set());
    };

    const handleProductSelect = (productId: number) => {
        setSelectedProducts(prev => {
            const newSet = new Set(prev);
            if (newSet.has(productId)) {
                newSet.delete(productId);
            } else {
                newSet.add(productId);
            }
            return newSet;
        });
    };

    const handleAddSelectedProducts = async () => {
        if (selectedProducts.size === 0) return;

        try {
            setIsAdding(true);
            const productIds = Array.from(selectedProducts);
            await api.post(`/api/seller/products/addProducts/${sellerId}`, productIds);

            // Refresh listed products
            await fetchListedProducts();

            // Close modal and reset selections
            handleCloseAddModal();
            setError("");
        } catch (err) {
            setError("Failed to add products");
            console.error("Error adding products:", err);
        } finally {
            setIsAdding(false);
        }
    };

    const startEditingQuantity = (productId: number, currentQuantity: number) => {
        setEditingQuantity(prev => ({ ...prev, [productId]: currentQuantity }));
    };

    const cancelEditingQuantity = (productId: number) => {
        setEditingQuantity(prev => {
            const newState = { ...prev };
            delete newState[productId];
            return newState;
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading your products...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-20 bg-gradient-to-br from-blue-50 via-white to-blue-50">

            {/*Navbar*/}
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

                {/* Product Grid */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Your Products ({listedProducts.length})
                        </h2>

                        <div className="flex gap-4">
                            <div className="flex items-center ">
                                <button
                                    onClick={handleOpenAddModal}
                                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-green-500/30"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Products
                                </button>
                            </div>

                            <button
                                onClick={fetchListedProducts}
                                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Refresh
                            </button>
                        </div>
                    </div>

                    {listedProducts.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                                <Package className="w-12 h-12 text-blue-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">No products listed yet</h3>
                            <p className="text-gray-600 mb-8">Start by adding some products to your store!</p>
                            <button
                                onClick={handleOpenAddModal}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                            >
                                Add Your First Product
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {listedProducts.map((product) => (
                                <div
                                    key={product.productId}
                                    className="bg-white rounded-xl p-6 shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300"
                                >
                                    {/* Product Image */}
                                    <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
                                        {product.imageUrl ? (
                                            <img
                                                src={product.imageUrl}
                                                alt={product.name}
                                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                                                <Package className="w-12 h-12 text-blue-400" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Info */}
                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
                                        <p className="text-sm text-gray-600 line-clamp-3">{product.description}</p>

                                        <div className="flex items-center justify-between">
                                            <div className="text-lg font-bold text-blue-600">
                                                ${product.price.toFixed(2)}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                ID: {product.productId}
                                            </div>
                                        </div>

                                        {/* Quantity Management */}
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <span className="text-sm font-medium text-gray-700">Quantity:</span>
                                            {editingQuantity[product.productId] !== undefined ? (
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={editingQuantity[product.productId]}
                                                        onChange={(e) => setEditingQuantity(prev => ({
                                                            ...prev,
                                                            [product.productId]: parseInt(e.target.value) || 0
                                                        }))}
                                                        className="w-16 px-2 py-1 border rounded text-sm text-center"
                                                    />
                                                    <button
                                                        onClick={() => handleUpdateQuantity(product.productId, editingQuantity[product.productId])}
                                                        className="p-1 text-green-600 hover:text-green-700"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => cancelEditingQuantity(product.productId)}
                                                        className="p-1 text-red-600 hover:text-red-700"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleUpdateQuantity(product.productId, Math.max(0, product.quantity - 1))}
                                                        className="w-6 h-6 rounded-full bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center transition-colors"
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </button>
                                                    <span className="font-semibold text-gray-900 min-w-[2rem] text-center">
                            {product.quantity}
                          </span>
                                                    <button
                                                        onClick={() => handleUpdateQuantity(product.productId, product.quantity + 1)}
                                                        className="w-6 h-6 rounded-full bg-green-100 hover:bg-green-200 text-green-600 flex items-center justify-center transition-colors"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </button>
                                                    <button
                                                        onClick={() => startEditingQuantity(product.productId, product.quantity)}
                                                        className="ml-2 p-1 text-blue-600 hover:text-blue-700 transition-colors"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <button
                                            onClick={() => handleDeleteProduct(product.productId)}
                                            className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-semibold transition-all duration-300"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Remove Product
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Add Products Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-backdrop-enter"
                        onClick={handleCloseAddModal}
                    />

                    {/* Modal */}
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-modal-enter">
                        {/* Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Add Products</h2>
                                <p className="text-gray-600">Select products to add to your listing</p>
                            </div>
                            <button
                                onClick={handleCloseAddModal}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Selected Count */}
                            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-blue-700 font-medium">
                                    {selectedProducts.size} product{selectedProducts.size !== 1 ? 's' : ''} selected
                                </p>
                            </div>

                            {/* Available Products */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                {nonListedProducts.map((product) => (
                                    <div
                                        key={product.productId}
                                        onClick={() => handleProductSelect(product.productId)}
                                        className={`cursor-pointer border-2 rounded-lg p-4 transition-all duration-200 ${
                                            selectedProducts.has(product.productId)
                                                ? "border-green-500 bg-green-50"
                                                : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                                        }`}
                                    >
                                        <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                                            {product.imageUrl ? (
                                                <img
                                                    src={product.imageUrl}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                                                    <Package className="w-8 h-8 text-blue-400" />
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{product.name}</h3>
                                        <p className="text-blue-600 font-bold text-sm">${product.price.toFixed(2)}</p>
                                        {selectedProducts.has(product.productId) && (
                                            <div className="mt-2 flex items-center gap-1 text-green-600 text-sm">
                                                <Check className="w-4 h-4" />
                                                Selected
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {nonListedProducts.length === 0 && (
                                <div className="text-center py-8">
                                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">No products available to add</p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
                                <button
                                    onClick={handleCloseAddModal}
                                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddSelectedProducts}
                                    disabled={selectedProducts.size === 0 || isAdding}
                                    className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${
                                        selectedProducts.size === 0 || isAdding
                                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                            : "bg-green-500 hover:bg-green-600 text-white hover:shadow-lg hover:shadow-green-500/30"
                                    }`}
                                >
                                    {isAdding ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin inline mr-2" />
                                            Adding...
                                        </>
                                    ) : (
                                        `Add ${selectedProducts.size} Product${selectedProducts.size !== 1 ? 's' : ''}`
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
