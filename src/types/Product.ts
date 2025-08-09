export type Product = {
    productId: number;
    name: string;
    description: string;
    price: number; // BigDecimal is typically represented as number or string depending on precision needs
    imageUrl: string;
    quantity: number; // default value can be set when initializing
};
