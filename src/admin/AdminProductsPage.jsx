import { useEffect, useState } from "react";

const AdminProductsPage = () => {
  const token = sessionStorage.getItem("token");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [previousQuotePrice, setPreviousQuotePrice] = useState("");
  const [previousVenderPrice, setPreviousVenderPrice] = useState("");
  const [error, setError] = useState("");

  // 🔄 Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}products/get`,
        {
          headers: { authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setProducts(data.data || []);
    } catch (err) {
      console.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ➕ Create product
  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");

    if (!title) {
      setError("Product title is required");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}products/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            previousQuotePrice,
            previousVenderPrice,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.msg || "Failed to create product");
      }

      // reset form
      setTitle("");
      setPreviousQuotePrice("");
      setPreviousVenderPrice("");

      fetchProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  // ❌ Delete product
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      await fetch(`${process.env.REACT_APP_BACKEND_URL}products/delete/${id}`, {
        method: "DELETE",
        headers: { authorization: `Bearer ${token}` },
      });

      fetchProducts();
    } catch (err) {
      console.error("Failed to delete product");
    }
  };

  return (
    <div className="p-6 text-white">
      {/* Header */}
      <h1 className="text-xl font-semibold text-red-500 mb-6">
        Product Management
      </h1>

      {/* Create Product */}
      <div className="bg-black border border-gray-800 rounded-lg p-5 mb-6">
        <h2 className="text-sm font-semibold mb-4 text-gray-300">
          Add New Product
        </h2>

        <form
          onSubmit={handleCreate}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <input
            type="text"
            placeholder="Product title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm"
          />

          <input
            type="number"
            placeholder="Previous Quote Price"
            value={previousQuotePrice}
            onChange={(e) => setPreviousQuotePrice(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm"
          />

          <input
            type="number"
            placeholder="Previous Vendor Price"
            value={previousVenderPrice}
            onChange={(e) => setPreviousVenderPrice(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm"
          />

          <button
            type="submit"
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm"
          >
            Add
          </button>
        </form>

        {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
      </div>

      {/* Products Table */}
      <div className="bg-black border border-gray-800 rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-900 text-gray-400">
            <tr>
              <th className="p-3 text-left">Title</th>
              <th className="p-3">Prev Quote Price</th>
              <th className="p-3">Prev Vendor Price</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="p-6 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-6 text-center text-gray-400">
                  No products found
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr
                  key={p._id}
                  className="border-t border-gray-800 hover:bg-gray-900"
                >
                  <td className="p-3">{p.title}</td>
                  <td className="p-3">{p.previousQuotePrice ?? "-"}</td>
                  <td className="p-3">{p.previousVendorPrice ?? "-"}</td>
                  <td className="p-3">
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="text-red-400 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProductsPage;
