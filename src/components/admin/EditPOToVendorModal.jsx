import { useState } from "react";

const EditPOToVendorModal = ({ po, onClose, onSuccess }) => {
  const token = sessionStorage.getItem("token");

  const [subject, setSubject] = useState(po.subject || "");
  const [description, setDescription] = useState(po.description || "");
  const [isGstApplied, setIsGstApplied] = useState(po.isGstApplied || false);
  const [gstRate, setGstRate] = useState(po.gstRate || 18);

  const [products, setProducts] = useState(
    po.products?.map((p) => ({
      productName: p.productName,
      quantity: p.quantity,
      listPrice: p.listPrice,
    })) || []
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateProduct = (index, field, value) => {
    const updated = [...products];
    updated[index][field] = value;
    setProducts(updated);
  };

  const addProductRow = () => {
    setProducts([...products, { productName: "", quantity: 1, listPrice: 0 }]);
  };

  const removeProductRow = (index) => {
    if (products.length === 1) return;
    setProducts(products.filter((_, i) => i !== index));
  };

  /* ---------------- Update PO ---------------- */
  const handleUpdate = async () => {
    setError("");

    if (!subject.trim()) {
      setError("Subject is required");
      return;
    }

    if (!products.length) {
      setError("At least one product is required");
      return;
    }

    if (products.some((p) => !p.productName.trim())) {
      setError("Each product must have a name");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}potovendor/update/${po._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            subject,
            description,
            products,
            isGstApplied,
            gstRate,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.msg || "Failed to update PO");
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
      <div className="bg-black border border-gray-800 rounded-lg w-full max-w-2xl text-white">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-800 flex justify-between">
          <h2 className="text-red-500 font-semibold">
            Edit PO {po.poToNumber}
          </h2>
          <button onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-sm max-h-[70vh] overflow-y-auto">
          {/* Subject */}
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="PO Subject"
            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
          />

          {/* Description */}
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
          />

          {/* Products */}
          <div>
            <h3 className="text-gray-400 mb-2">Products</h3>

            {products.map((p, index) => (
              <div key={index} className="grid grid-cols-4 gap-2 mb-2">
                <input
                  value={p.productName}
                  onChange={(e) =>
                    updateProduct(index, "productName", e.target.value)
                  }
                  placeholder="Product name"
                  className="bg-gray-900 border border-gray-700 rounded px-2 py-1"
                />

                <input
                  type="number"
                  min="1"
                  value={p.quantity}
                  onChange={(e) =>
                    updateProduct(index, "quantity", e.target.value)
                  }
                  className="bg-gray-900 border border-gray-700 rounded px-2 py-1"
                />

                <input
                  type="number"
                  min="0"
                  value={p.listPrice}
                  onChange={(e) =>
                    updateProduct(index, "listPrice", e.target.value)
                  }
                  className="bg-gray-900 border border-gray-700 rounded px-2 py-1"
                />

                <button
                  onClick={() => removeProductRow(index)}
                  className="text-red-400 hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}

            <button
              onClick={addProductRow}
              className="text-blue-400 hover:underline text-sm"
            >
              + Add Product
            </button>
          </div>

          {/* GST */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isGstApplied}
                onChange={(e) => setIsGstApplied(e.target.checked)}
              />
              Apply GST
            </label>

            {isGstApplied && (
              <input
                type="number"
                min="0"
                value={gstRate}
                onChange={(e) => setGstRate(e.target.value)}
                className="w-24 bg-gray-900 border border-gray-700 rounded px-2 py-1"
              />
            )}
          </div>

          {error && <p className="text-red-400">{error}</p>}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="bg-gray-700 px-4 py-2 rounded"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
          >
            {loading ? "Updating..." : "Update PO"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPOToVendorModal;
