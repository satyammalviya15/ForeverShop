import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import RelatedProducts from "../components/RelatedProducts";
import axios from "axios";
import { toast } from "react-toastify";

const Product = () => {
  const { productId } = useParams();
  const { products, currency, addToCart, token, backendUrl } = useContext(ShopContext);
  const navigate = useNavigate();

  const [productData, setProductData] = useState(null);
  const [image, setImage] = useState("");
  const [size, setSize] = useState("");

  const fetchProductData = async () => {
    // Try to find in context first
    let product = products.find((p) => p._id === productId);

    if (!product) {
      // Fetch from backend via POST request (as backend expects body)
      try {
        const res = await axios.post(`${backendUrl}/api/product/single`, { id: productId });
        if (res.data.success) {
          product = res.data.product;
        } else {
          toast.error(res.data.message);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch product");
      }
    }

    if (product) {
      setProductData(product);
      setImage(product.image[0]);
    }
  };

  // Fetch product whenever productId or product list changes
  useEffect(() => {
    fetchProductData();
  }, [productId, products]);

  // Scroll to top whenever productId changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [productId]);

  if (!productData) return <div className="opacity-0">Loading...</div>;

  return (
    <div className="border-t pt-10">
      <div className="flex gap-12 sm:gap-12 flex-col sm:flex-row">
        {/* Product Images */}
        <div className="flex-1 flex flex-col-reverse gap-3 sm:flex-row">
          <div className="flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full gap-2">
            {productData.image.map((img, index) => (
              <img
                key={index}
                src={img}
                className="w-[24%] sm:w-full s:mb-3 flex-shrink-0 cursor-pointer"
                onClick={() => setImage(img)}
                alt=""
              />
            ))}
          </div>
          <div className="w-full sm:w-[80%]">
            <img className="w-full h-auto" src={image} alt="" />
          </div>
        </div>

        {/* Product Info */}
        <div className="flex-1">
          <h1 className="font-medium text-2xl mt-2">{productData.name}</h1>
          <p className="mt-5 text-3xl font-medium">{currency}{productData.price}</p>

          {/* Sizes */}
          <div className="flex flex-col gap-4 my-8">
            <p>Select Size</p>
            <div className="flex gap-2">
              {productData.sizes.map((s, index) => (
                <button
                  key={index}
                  onClick={() => setSize(s)}
                  className={`border py-2 px-4 bg-gray-200 ${size === s ? "border-orange-500" : "border-white"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Add to Cart */}
          <button
            onClick={() => {
              if (!token) {
                navigate("/login");
                toast.info("Please login to add items to your cart");
                return;
              }
              if (!size) {
                toast.error("Please select a size");
                return;
              }
              addToCart(productData._id, size);
            }}
            className="bg-black text-white px-8 py-3 text-sm active:bg-gray-700"
          >
            ADD TO CART
          </button>
        </div>
      </div>

      {/* Related Products */}
      <RelatedProducts category={productData.category} subCategory={productData.subCategory} />
    </div>
  );
};

export default Product;
