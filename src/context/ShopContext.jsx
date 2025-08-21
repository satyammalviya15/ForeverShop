import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const currency = "₹";
  const delivery_fee = 20;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState([]); // array of { product, size, quantity }
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState("");
  const navigate = useNavigate();

  // Add to cart (update local + backend)
  const addToCart = async (product, size) => {
    if (!size) {
      toast.error("Select Product Size");
      return;
    }

    // Local update
    const updatedCart = [...cartItems];
    const index = updatedCart.findIndex(
      (item) => item.product._id === product._id && item.size === size
    );

    if (index !== -1) {
      updatedCart[index] = {
        ...updatedCart[index],
        quantity: updatedCart[index].quantity + 1,
      };
    } else {
      updatedCart.push({ product, size, quantity: 1 });
    }

    setCartItems(updatedCart);

    // Backend sync
    if (token) {
      try {
        await axios.post(
          `${backendUrl}/api/cart/add`,
          { itemId: product._id, size, quantity: 1 },
          { headers: { token } }
        );
        getUserCart(token); // keep backend source of truth
      } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.message || "Failed to add item to cart");
      }
    }
  };

  // Get total items in cart
  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + (item.quantity || 0), 0);
  };

  // Update quantity in cart (local + backend)
  const updateQuantity = async (productId, size, quantity) => {
    // Build a new array immutably
    let updatedCart = cartItems
      .map((item) => {
        if (item.product._id === productId && item.size === size) {
          return { ...item, quantity };
        }
        return item;
      })
      .filter((item) => item.quantity > 0); // remove zero quantity

    setCartItems(updatedCart);

    if (token) {
      try {
        await axios.post(
          `${backendUrl}/api/cart/update`,
          { itemId: productId, size, quantity },
          { headers: { token } }
        );
        getUserCart(token);
      } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.message || "Failed to update cart item");
      }
    }
  };

  // Calculate total cart amount
  const getCartAmount = () => {
    return cartItems.reduce((total, item) => {
      const price = item.product?.price || 0;
      const qty = item.quantity || 0;
      return total + price * qty;
    }, 0);
  };

  // Fetch all products for display
  const getProductsData = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/product/list`);
      if (response.data.success) {
        setProducts(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  // Fetch user cart with full product objects
  const getUserCart = async (authToken) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/cart/get`,
        {},
        { headers: { token: authToken } }
      );
      if (response.data.success) {
        setCartItems(response.data.cart); // already an array with product objects
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to fetch user cart");
    }
  };

  useEffect(() => {
    getProductsData();
  }, []);

  useEffect(() => {
    if (!token && localStorage.getItem("token")) {
      const storedToken = localStorage.getItem("token");
      setToken(storedToken);
      getUserCart(storedToken);
    }
  }, []);

  const value = {
    products,
    currency,
    delivery_fee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    addToCart,
    getCartCount,
    updateQuantity,
    getCartAmount,
    setCartItems,
    getUserCart,
    navigate,
    backendUrl,
    setToken,
    token,
  };

  return (
    <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>
  );
};

export default ShopContextProvider;
