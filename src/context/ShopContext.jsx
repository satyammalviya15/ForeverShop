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
  const [cartItems, setCartItems] = useState([]); // <-- now an ARRAY
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState("");
  const navigate = useNavigate();

  // Add to cart (push full product object)
 const addToCart = async (product, size) => {
  if (!size) {
    toast.error("Select Product Size");
    return;
  }

  // Local cart update
  const updatedCart = [...cartItems];
  const index = updatedCart.findIndex(
    (item) => item.product._id === product && item.size === size
  );
  if (index !== -1) {
    updatedCart[index].quantity += 1;
  } else {
    updatedCart.push({ product, size, quantity: 1 });
  }

  setCartItems(updatedCart);

  // Backend sync
  if (token) {
    try {
      await axios.post(
        `${backendUrl}/api/cart/add`,
        { itemId: product, size ,quantity:1}, // <-- send only ID
        { headers: { token } }
      );
      getUserCart(token); // refresh cart from backend
    } catch (error) {
      // console.log(error);
      toast.error(error.response?.data?.message || "Failed to add item to cart");
    }
  }
};

  // Get total item count
  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + (item.quantity || 0), 0);
  };

  // Update quantity in cart
 const updateQuantity = async (productId, size, quantity) => {
  // Build a completely new array immutably
  let updatedCart = cartItems.map(item => {
    if (item.product._id === productId && item.size === size) {
      // Create a new object with updated quantity
      return { ...item, quantity };
    }
    return item;
  });

  // If the item wasn't in the cart yet and quantity > 0, add it
  const itemExists = cartItems.some(
    item => item.product._id === productId && item.size === size
  );

  if (!itemExists && quantity > 0) {
    updatedCart = [
      ...updatedCart,
      {
        product: { _id: productId }, // or full product if you have it
        size,
        quantity,
      }
    ];
  }

  // Remove any items with quantity 0
  updatedCart = updatedCart.filter(item => item.quantity > 0);

  // Update local state
  setCartItems(updatedCart);

  // Sync with backend if logged in
  if (token) {
    try {
      await axios.post(
        `${backendUrl}/api/cart/update`,
        { itemId: productId, size, quantity },
        { headers: { token } }
      );
      // Optional: refresh cart to stay consistent
      getUserCart(token);
    } catch (error) {
      // console.error(error);
      // toast.error(error.response?.data?.message || "Failed to update cart item");
    }
  }
};


  // Calculate cart total
  const getCartAmount = () => {
    return cartItems.reduce((total, item) => {
      const price = item.product?.price || 0;
      const qty = item.quantity || 0;
      return total + price * qty;
    }, 0);
  };

  // Fetch products list
  const getProductsData = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/product/list`);
      if (response.data.success) {
        setProducts(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      // console.log(error);
      toast.error(error.message);
    }
  };

  // Fetch user cart (already full product objects)
  const getUserCart = async (token) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/cart/get`,
        {},
        { headers: { token } }
      );

      if (response.data.success) {
        // response.data.cart is already an array with product objects
        setCartItems(response.data.cart);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
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
      getUserCart(storedToken); // load cart if token exists
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
