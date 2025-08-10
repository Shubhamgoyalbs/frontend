import {Product} from '@/types/Product';
import {useRouter} from "next/navigation";

interface ProductCardProps {
    product: Product;
    productId: number;
}

export function ProductCard({product, productId}: ProductCardProps) {

    const router = useRouter();

    function handelSellerClick() {

        const query = new URLSearchParams({
            product: product.name,
            price: product.price.toString(),
            image: product.imageUrl,
            id: productId.toString(),
        });

        router.push(`/user/sellers?${query.toString()}`);
    }

    return (
        <div
            className="group relative bg-white  rounded-2xl shadow-sm border border-gray-200  overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            {/* Product Image */}
            <div className="aspect-square overflow-hidden bg-gray-100 ">
                <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
            </div>

            {/* Product Info */}
            <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold w-[160px] text-lg text-gray-900  line-clamp-1">
                        {product.name}
                    </h3>
                    {product.quantity > 0 ? (
                        <span
                            className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-green-100 text-green-800 ">
              In Stock
            </span>
                    ) : (
                        <span
                            className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-red-100 text-red-800">
              Out of Stock
            </span>
                    )}
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {product.description}
                </p>

                {/* Price and Actions */}
                <div className="flex items-center justify-between">
                    <div>
            <span className="text-2xl font-bold text-gray-900">
              ${product.price.toFixed(2)}
            </span>
                    </div>

                    <button
                        className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 h-10 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200`}
                        onClick={handelSellerClick}
                    >
                        See Sellers
                    </button>
                </div>
            </div>
        </div>
    );
}
