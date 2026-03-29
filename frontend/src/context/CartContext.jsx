import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        const stored = localStorage.getItem('fds_cart');
        return stored ? JSON.parse(stored) : [];
    });

    useEffect(() => {
        localStorage.setItem('fds_cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (food, quantity = 1) => {
        setCartItems(prev => {
            const existing = prev.find(i => i._id === food._id);
            if (existing) {
                return prev.map(i => i._id === food._id ? { ...i, quantity: i.quantity + quantity } : i);
            }
            return [...prev, { ...food, quantity }];
        });
    };

    const removeFromCart = (foodId) => {
        setCartItems(prev => prev.filter(i => i._id !== foodId));
    };

    const updateQuantity = (foodId, quantity) => {
        if (quantity <= 0) { removeFromCart(foodId); return; }
        setCartItems(prev => prev.map(i => i._id === foodId ? { ...i, quantity } : i));
    };

    const clearCart = () => setCartItems([]);

    const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
    const cartTotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within CartProvider');
    return ctx;
};
