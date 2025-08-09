"use client";

import {createContext, ReactNode, useContext, useState, useEffect} from 'react';
import {Product} from '@/types/Product';

// localStorage keys
const CART_ITEMS_KEY = 'hostel-snacker-cart-items';
const CURRENT_SELLER_KEY = 'hostel-snacker-current-seller';

// Helper functions for localStorage
const saveToLocalStorage = (key: string, value: unknown) => {
    try {
        if (typeof window !== 'undefined') {
            localStorage.setItem(key, JSON.stringify(value));
        }
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
};

const getFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
    try {
        if (typeof window !== 'undefined') {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        }
    } catch (error) {
        console.error('Error loading from localStorage:', error);
    }
    return defaultValue;
};

// Cart item extends Product with quantity in cart
interface CartItem extends Product {
    qtyInCart: number;
    maxQuantity: number;
}

interface CartContextType {
    cartItems: CartItem[];
    currentSellerId: number | null;
    totalAmount: number;
    addToCart: (product: Product & { maxQuantity: number }, sellerId: number) => void;
    removeFromCart: (productId: number) => void;
    updateQuantity: (productId: number, quantity: number) => void;
    clearCart: () => void;
}

// Cart context for managing shopping cart state
const CartContext = createContext<CartContextType | null>(null);

// Hook to access cart context
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

// Cart provider component - manages cart state and operations
export const CartProvider = ({children}: { children: ReactNode }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [currentSellerId, setCurrentSellerId] = useState<number | null>(null);
    const [isLoaded, setIsLoaded] = useState<boolean>(false);

    // Load cart data from localStorage on component mount
    useEffect(() => {
        const savedCartItems = getFromLocalStorage<CartItem[]>(CART_ITEMS_KEY, []);
        const savedSellerId = getFromLocalStorage<number | null>(CURRENT_SELLER_KEY, null);
        
        setCartItems(savedCartItems);
        setCurrentSellerId(savedSellerId);
        setIsLoaded(true);
    }, []);

    // Save cart items to localStorage whenever cartItems change
    useEffect(() => {
        if (isLoaded) {
            saveToLocalStorage(CART_ITEMS_KEY, cartItems);
        }
    }, [cartItems, isLoaded]);

    // Save current seller ID to localStorage whenever it changes
    useEffect(() => {
        if (isLoaded) {
            saveToLocalStorage(CURRENT_SELLER_KEY, currentSellerId);
        }
    }, [currentSellerId, isLoaded]);

    // Calculate total cart amount
    const totalAmount = cartItems.reduce((total, item) => total + (item.price * item.qtyInCart), 0);

    // Add product to cart (single-seller rule applies)
    const addToCart = (productToAdd: Product & { maxQuantity: number }, sellerId: number) => {
        // Clear cart if switching sellers
        if (currentSellerId === null || currentSellerId !== sellerId) {
            setCurrentSellerId(sellerId);
            setCartItems([{...productToAdd, qtyInCart: 1}]);
            return;
        }

        // Add/update product from the same seller
        setCartItems(prevItems => {
            const existingItemIndex = prevItems.findIndex(item => item.productId === productToAdd.productId);

            if (existingItemIndex !== -1) {
                // Update quantity for existing product
                return prevItems.map((item, index) => {
                    if (index === existingItemIndex) {
                        const newQty = item.qtyInCart + 1;
                        // Check max quantity limit
                        if (newQty > productToAdd.maxQuantity) {
                            return item;
                        }
                        return {...item, qtyInCart: newQty};
                    }
                    return item;
                });
            } else {
                // Add new product to cart
                return [...prevItems, {...productToAdd, qtyInCart: 1}];
            }
        });
    };

    // Remove product completely from cart
    const removeFromCart = (productId: number) => {
        setCartItems(prevItems => {
            const updatedItems = prevItems.filter(item => item.productId !== productId);
            // Reset seller ID if cart becomes empty
            if (updatedItems.length === 0) {
                setCurrentSellerId(null);
            }
            return updatedItems;
        });
    };

    // Update product quantity in cart
    const updateQuantity = (productId: number, quantity: number) => {
        setCartItems(prevItems => {
            // Remove item if quantity is less than 1
            if (quantity < 1) {
                const updatedItems = prevItems.filter(item => item.productId !== productId);
                // Reset seller ID if cart becomes empty
                if (updatedItems.length === 0) {
                    setCurrentSellerId(null);
                }
                return updatedItems;
            }
            // Update quantity within valid range
            const updatedItems = prevItems.map(item => {
                if (item.productId === productId) {
                    const newQty = Math.min(quantity, item.maxQuantity);
                    return {...item, qtyInCart: newQty};
                }
                return item;
            });
            return updatedItems;
        });
    };

    // Clear the entire cart and reset seller
    const clearCart = () => {
        setCartItems([]);
        setCurrentSellerId(null);
    };

    const value = {
        cartItems,
        currentSellerId,
        totalAmount,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};
