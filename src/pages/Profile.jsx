import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import Orders from "./Orders";
import Title from "../components/Title";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const { backendUrl, token, setToken } = useContext(ShopContext);
  const navigate = useNavigate();

  // Logout function
  const logout = () => {
    localStorage.removeItem("token"); // remove token from localStorage
    setToken(""); // update context token
    navigate("/login"); // redirect to login page
  };

  // Fetch user profile from backend
  const fetchUser = async () => {
    if (!token) {
      toast.error("User not logged in");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        `${backendUrl}/api/user/profile`,
        {}, // empty body; backend gets userId from token
        { headers: { token } }
      );

      if (res.data.success) {
        setUser(res.data.user);
      } else {
        toast.error(res.data.message || "Failed to fetch profile");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error while fetching profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUser();
    }
  }, [token]);

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
      <Title text1="My" text2="Profile" />
      {loading ? (
        <div className="text-gray-500">Loading profile...</div>
      ) : !user ? (
        <div className="text-red-500">Unable to load profile.</div>
      ) : (
        <div className="bg-white shadow rounded-md p-4 text-sm sm:text-base space-y-3">
          <div>
            <span className="font-medium">Name:</span>
            <p>{user.name}</p>
          </div>
          <div>
            <span className="font-medium">Email:</span>
            <p>{user.email}</p>
          </div>
          <div>
            <span className="font-medium">Cart Status:</span>
            <p>
              {user.cartData && Object.keys(user.cartData).length > 0
                ? `${Object.keys(user.cartData).length} items in cart`
                : "Cart is empty"}
            </p>
          </div>
          <div>
            <span className="font-medium">Account Created:</span>
            <p>{new Date(user.createdAt).toLocaleString()}</p>
          </div>
          <div>
            <span className="font-medium">Last Updated:</span>
            <p>{new Date(user.updatedAt).toLocaleString()}</p>
          </div>

          {/* Logout Button */}
          <div className="flex flex-col gap-2 w-36 py-3 px-5 bg-gray-600 text-white rounded cursor-pointer hover:bg-gray-500">
            <p onClick={logout}>Logout</p>
          </div>
        </div>
      )}

      {/* Orders */}
      <Orders />
    </div>
  );
};

export default Profile;
