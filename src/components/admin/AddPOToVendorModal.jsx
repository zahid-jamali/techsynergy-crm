import { useEffect, useState } from "react";

const AddPOToVendorModal = ({ onClose, onSuccess }) => {
  const token = sessionStorage.getItem("token");

  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  
  const [vendors, setVendors] = useState([]);
  const [vendorSearch, setVendorSearch] = useState("");
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showVendorList, setShowVendorList] = useState(false);

  
  const [isGstApplied, setIsGstApplied] = useState(false);
  const [gstRate, setGstRate] = useState(18);

  
  const [products, setProducts] = useState([
    { productName: "", quantity: 1, listPrice: 0 },
  ]);

  
  const [terms, setTerms] = useState([""]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}vendors/get`,
          {
            headers: { authorization: `Bearer ${token}` },
          }
        );
        const result = await res.json();
        setVendors(result.data || []);
      } catch (err) {
        console.error("Failed to fetch vendors");
      }
    };

    fetchVendors();
  }, [token]);

  const filteredVendors = vendors.filter((v) =>
    v.name?.toLowerCase().includes(vendorSearch.toLowerCase())
  );

  /* ---------------- Product Handlers ---------------- */
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

  /* ---------------- Terms Handlers ---------------- */
  const updateTerm = (index, value) => {
    const updated = [...terms];
    updated[index] = value;
    setTerms(updated);
  };

  const addTerm = () => setTerms([...terms, ""]);
  const removeTerm = (index) => {
    if (terms.length === 1) return;
    setTerms(terms.filter((_, i) => i !== index));
  };

  /* ---------------- Create PO ---------------- */
  const handleCreate = async () => {
    setError("");

    if (!subject.trim()) return setError("Subject is required");
    if (!selectedVendor) return setError("Vendor is required");
    if (products.some((p) => !p.productName.trim()))
      return setError("Each product must have a name");

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}potovendor/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            subject,
            vendor: selectedVendor._id,
            description,
            products,
            isGstApplied,
            gstRate,
            termsAndConditions: terms.filter((t) => t.trim()),
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to create PO");

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
          <h2 className="text-red-500 font-semibold">Create PO to Vendor</h2>
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

          {/* Vendor Live Search */}
          <div className="relative">
            <input
              value={vendorSearch}
              onChange={(e) => {
                setVendorSearch(e.target.value);
                setShowVendorList(true);
              }}
              placeholder="Search vendor..."
              className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
            />

            {showVendorList && (
              <div className="absolute z-10 w-full bg-black border border-gray-800 rounded mt-1 max-h-40 overflow-y-auto">
                {filteredVendors.length === 0 ? (
                  <div className="px-3 py-2 text-gray-400">
                    No vendors found
                  </div>
                ) : (
                  filteredVendors.map((v) => (
                    <div
                      key={v._id}
                      onClick={() => {
                        setSelectedVendor(v);
                        setVendorSearch(v.name);
                        setShowVendorList(false);
                      }}
                      className="px-3 py-2 hover:bg-gray-800 cursor-pointer"
                    >
                      {v.name}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

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
                  placeholder="Product"
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
                  className="text-red-400"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={addProductRow}
              className="text-blue-400 hover:underline"
            >
              + Add Product
            </button>
          </div>

          {/* Terms */}
          <div>
            <h3 className="text-gray-400 mb-2">Terms & Conditions</h3>
            {terms.map((t, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  value={t}
                  onChange={(e) => updateTerm(i, e.target.value)}
                  className="flex-1 bg-gray-900 border border-gray-700 rounded px-2 py-1"
                />
                <button onClick={() => removeTerm(i)} className="text-red-400">
                  ✕
                </button>
              </div>
            ))}
            <button onClick={addTerm} className="text-blue-400 hover:underline">
              + Add Term
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
          <button onClick={onClose} className="bg-gray-700 px-4 py-2 rounded">
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
          >
            {loading ? "Saving..." : "Create PO"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPOToVendorModal;
