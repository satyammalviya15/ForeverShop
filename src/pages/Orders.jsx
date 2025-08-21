import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import axios from "axios";
import { toast } from "react-toastify";

const Orders = () => {
  const { products, currency, backendUrl, token } = useContext(ShopContext);
  const [orders, setOrders] = useState([]);

  // Fetch user orders from backend
  const fetchOrders = async () => {
    try {
      const res = await axios.post(
        `${backendUrl}/api/order/userorders`,
        {},
        { headers: { token } }
      );
      if (res.data.success) {
        setOrders(res.data.orders);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to fetch orders");
    }
  };

  useEffect(() => {
    if (token) fetchOrders();
  }, [token]);

  return (
    <div className="border-t pt-16">
      <div className="text-2xl">
        <Title text1={"MY"} text2={"ORDERS"} />
      </div>

      <div>
        {orders.length === 0 ? (
          <p className="text-gray-500 mt-6">No orders found.</p>
        ) : (
          orders.map((order, index) => (
            <div
              key={index}
              className="py-4 border-t border-b text-gray-700 flex flex-col gap-4"
            >
              {order.items.map((item, idx) => {
                const product = products.find((p) => p._id === item.productId);

                return (
                  <div
                    key={idx}
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                  >
                    <div className="flex items-start gap-6 text-sm">
                      <img
                        className="w-16 sm:w-20"
                        src={product?.image?.[0] || "/placeholder.png"}
                        alt={product?.name || "Product"}
                      />
                      <div>
                        <p className="sm:text-base font-medium">
                          {product?.name || "Unknown product"}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-base text-gray-700">
                          <p className="text-lg">
                            {currency}
                            {product?.price || 0}
                          </p>
                          <p>Quantity: {item.quantity}</p>
                          <p>Size: {item.size || "-"}</p>
                        </div>
                        <p className="mt-2">
                          Date:{" "}
                          <span className="text-gray-400">
                            {new Date(order.date).toLocaleDateString()}
                          </span>
                        </p>
                        {/* Payment Method */}
                        <p className="mt-1 text-sm text-gray-500">
                          Payment Method:{" "}
                          <span className="font-medium">{order.paymentMethod}</span>
                        </p>
                      </div>
                    </div>
                    <div className="md:w-1/2 flex justify-between">
                      <div className="flex items-center gap-2">
                        <p className="min-w-2 h-2 rounded-full bg-green-500"></p>
                        <p className="text-sm md:text-base">
                          {order.status || "Processing"}
                        </p>
                      </div>
                      <button
                        onClick={() => fetchOrders()}
                        className="border px-4 py-2 text-sm font-medium rounded-sm cursor-pointer"
                      >
                        Track Order
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;
