import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const ShopContext = createContext();

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const ShopContextProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const currency = "$";

  // Fetch cart from backend
  const getUserCart = async (authToken) => {
    if (!authToken) return;
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/cart/get`,
        {},
        { headers: { token: authToken } }
      );
      if (data.success) {
        setCartItems(data.cartData);
      }
    } catch (err) {
      console.error("Error fetching user cart", err);
    }
  };

  // Add item (backend only)
  const addToCart = async (product, size, quantity) => {
    try {
      await axios.post(
        `${backendUrl}/api/cart/add`,
        { productId: product._id, size, quantity },
        { headers: { token } }
      );
      // Always refresh from backend
      getUserCart(token);
    } catch (err) {
      console.error("Error adding to cart", err);
    }
  };

  // Update quantity (backend only)
  const updateQuantity = async (productId, size, quantity) => {
    try {
      await axios.post(
        `${backendUrl}/api/cart/update`,
        { productId, size, quantity },
        { headers: { token } }
      );
      // Always refresh from backend
      getUserCart(token);
    } catch (err) {
      console.error("Error updating quantity", err);
    }
  };

  // Remove item (backend only)
  const removeFromCart = async (productId, size) => {
    try {
      await axios.post(
        `${backendUrl}/api/cart/remove`,
        { productId, size },
        { headers: { token } }
      );
      // Always refresh from backend
      getUserCart(token);
    } catch (err) {
      console.error("Error removing from cart", err);
    }
  };

  // Load cart on first render or token change
  useEffect(() => {
    if (token) {
      getUserCart(token);
    }
  }, [token]);

  const navigate = (url) => {
    window.location.href = url;
  };

  const value = {
    currency,
    cartItems,
    setCartItems, // expose if needed for reset
    token,
    setToken,
    addToCart,
    updateQuantity,
    removeFromCart,
    getUserCart,
    navigate,
  };

  return (
    <ShopContext.Provider value={value}>
      {children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
