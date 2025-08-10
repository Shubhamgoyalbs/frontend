import {Product} from "@/types/Product";
import {Package, ShoppingCart} from "lucide-react";

interface ProductCardProps {
    product: Product;
    isInCart: boolean;
    onAddToCart: (productId: number) => void;
    onGoToCart: () => void;
}

export function ProductCardS({product, isInCart, onAddToCart, onGoToCart}: ProductCardProps) {
    return (
        <div
            className="bg-white rounded-xl p-4 shadow-md border border-blue-100 hover:shadow-lg transition-all duration-300 hover:border-blue-300">
            {/* Product Image */}
            <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
                {product.imageUrl ? (
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div
                        className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                        <Package className="w-12 h-12 text-blue-400"/>
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
                <p className="text-sm text-gray-600 line-clamp-3">{product.description}</p>

                <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-blue-600">
                        ${product.price.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-500">
                        {product.quantity} available
                    </div>
                </div>

                {/* Action Button */}
                <button
                    onClick={() => isInCart ? onGoToCart() : onAddToCart(product.productId)}
                    className={`group/btn w-full py-2 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                        isInCart
                            ? "bg-green-500 hover:bg-green-600 text-white"
                            : "bg-blue-500 hover:bg-blue-600 text-white hover:shadow-lg hover:shadow-blue-500/30"
                    }`}
                >
                    <ShoppingCart
                        className="w-4 h-4 transition-all duration-500 group-hover/btn:rotate-[360deg] group-hover/btn:animate-bounce"/>
                    {isInCart ? "Go to Cart" : "Add to Cart"}
                </button>
            </div>
        </div>
    );
}
