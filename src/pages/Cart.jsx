import { useContext, useState, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import { assets } from "../assets/frontend_assets/assets";
import CartTotal from "../components/CartTotal";

// Input component for quantity with delayed backend update
const CartItemInput = ({ productId, size, quantity, updateQuantity }) => {
  const [localQty, setLocalQty] = useState(quantity);

  // Keep local input in sync if quantity changes externally
  useEffect(() => {
    setLocalQty(quantity);
  }, [quantity]);

  // Debounce backend update for 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      const finalQty = Number(localQty);
      // send only if valid number, else default to 1
      updateQuantity(productId, size, isNaN(finalQty) || finalQty < 1 ? 1 : finalQty);
    }, 5000);
    return () => clearTimeout(timer);
  }, [localQty]);

  const handleChange = (e) => {
    const val = e.target.value;

    // Allow empty string so user can type freely
    if (val === "") {
      setLocalQty("");
      return;
    }

    // If valid number, clamp between 1 and 50
    const num = Math.max(1, Math.min(50, Number(val)));
    setLocalQty(num);
  };

  const handleBlur = () => {
    // When leaving input, ensure valid quantity
    let num = Number(localQty);
    if (isNaN(num) || num < 1) num = 1;
    if (num > 50) num = 50;
    setLocalQty(num);
  };

  return (
    <input
      type="number"
      min={1}
      max={50}
      value={localQty}
      onChange={handleChange}
      onBlur={handleBlur}
      className="border w-12 sm:w-20 px-1 sm:px-2 py-1 text-center"
    />
  );
};

const Cart = () => {
  const { currency, cartItems, updateQuantity, navigate } = useContext(ShopContext);

  return (
    <div className="border-t pt-14">
      <div className="text-2xl mb-3">
        <Title text1="YOUR" text2="CART" />
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center my-20">
          <img
            className="w-32 mx-auto mb-6 opacity-70"
            src={assets.about_img}
            alt="Empty Cart"
          />
          <p className="text-lg font-medium text-gray-600">Your cart is empty</p>
          <button
            onClick={() => navigate("/")}
            className="mt-6 bg-black text-white text-sm px-6 py-3 rounded hover:bg-gray-800"
          >
            Go Shopping
          </button>
        </div>
      ) : (
        <>
          <div>
            {cartItems.map((item, index) => (
              <div
                key={index}
                className="py-4 border-t text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4"
              >
                <div className="flex items-start gap-6">
                  <img
                    className="w-16 sm:w-20"
                    src={item.product.image?.[0]}
                    alt={item.product.name}
                  />
                  <div>
                    <p className="text-xs sm:text-lg font-medium">
                      {item.product.name}
                    </p>
                    <div className="flex items-center gap-5 mt-2">
                      <p>
                        {currency}
                        {item.product.price}
                      </p>
                      <p className="px-2 sm:px-3 sm:py-1 border-white bg-slate-100">
                        {item.size}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Use CartItemInput for quantity */}
                <CartItemInput
                  productId={item.product._id}
                  size={item.size}
                  quantity={item.quantity}
                  updateQuantity={updateQuantity}
                />

                <img
                  onClick={() => updateQuantity(item.product._id, item.size, 0)}
                  className="w-4 mr-4 sm:w-5 cursor-pointer"
                  src={assets.bin_icon}
                  alt="Remove"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end my-20">
            <div className="w-full sm:w-[450px]">
              <CartTotal />
              <div className="w-full text-end">
                <button
                  onClick={() => navigate("/place-order")}
                  className="bg-black text-white text-sm my-8 px-8 py-3"
                >
                  PROCEED TO CHECKOUT
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
