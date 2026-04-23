import { useState } from "react";

const EditVendorModal = ({ vendor, onClose, onSuccess }) => {
  const token = sessionStorage.getItem("token");

  const [form, setForm] = useState({
    name: vendor.name || "",
    code: vendor.code || "",
    notes: vendor.notes || "",

    contacts:
      vendor.contacts?.length > 0
        ? vendor.contacts
        : [
            {
              name: "",
              email: "",
              phone: "",
              designation: "",
              isPrimary: true,
            },
          ],

    addresses:
      vendor.addresses?.length > 0
        ? vendor.addresses
        : [
            {
              type: "Office",
              addressLine1: "",
              city: "",
              country: "",
            },
          ],

    bankDetails: {
      accountTitle: vendor.bankDetails?.accountTitle || "",
      accountNumber: vendor.bankDetails?.accountNumber || "",
      bankName: vendor.bankDetails?.bankName || "",
      iban: vendor.bankDetails?.iban || "",
      branch: vendor.bankDetails?.branch || "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ================= BASIC ================= */

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /* ================= CONTACT ================= */

  const handleContactChange = (index, field, value) => {
    const updated = [...form.contacts];
    updated[index][field] = value;

    if (field === "isPrimary" && value) {
      updated.forEach((c, i) => {
        if (i !== index) c.isPrimary = false;
      });
    }

    setForm((prev) => ({
      ...prev,
      contacts: updated,
    }));
  };

  const addContact = () => {
    setForm((prev) => ({
      ...prev,
      contacts: [
        ...prev.contacts,
        {
          name: "",
          email: "",
          phone: "",
          designation: "",
          isPrimary: false,
        },
      ],
    }));
  };

  const removeContact = (index) => {
    const updated = [...form.contacts];
    updated.splice(index, 1);

    if (updated.length === 0) {
      updated.push({
        name: "",
        email: "",
        phone: "",
        designation: "",
        isPrimary: true,
      });
    }

    setForm((prev) => ({
      ...prev,
      contacts: updated,
    }));
  };

  /* ================= ADDRESS ================= */

  const handleAddressChange = (index, field, value) => {
    const updated = [...form.addresses];
    updated[index][field] = value;

    setForm((prev) => ({
      ...prev,
      addresses: updated,
    }));
  };

  const addAddress = () => {
    setForm((prev) => ({
      ...prev,
      addresses: [
        ...prev.addresses,
        {
          type: "Office",
          addressLine1: "",
          city: "",
          country: "",
        },
      ],
    }));
  };

  const removeAddress = (index) => {
    const updated = [...form.addresses];
    updated.splice(index, 1);

    setForm((prev) => ({
      ...prev,
      addresses: updated,
    }));
  };

  /* ================= BANK ================= */

  const handleBankChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      bankDetails: {
        ...prev.bankDetails,
        [field]: value,
      },
    }));
  };

  /* ================= SUBMIT ================= */

  const handleUpdate = async () => {
    if (!form.name.trim()) {
      setError("Vendor name is required");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}vendors/update/${vendor._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.msg || "Failed to update vendor");
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
      <div className="bg-black border border-gray-800 rounded-lg w-full max-w-2xl text-white max-h-[90vh] overflow-y-auto">
        {/* Header */}

        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-red-500">Edit Vendor</h2>

          <button onClick={onClose}>✕</button>
        </div>

        {/* Body */}

        <div className="p-5 space-y-6">
          {/* BASIC */}

          <div className="space-y-3">
            <h3 className="text-red-400 font-semibold">Basic Information</h3>

            <input
              type="text"
              placeholder="Vendor Name *"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
            />

            <input
              type="text"
              placeholder="Vendor Code"
              value={form.code}
              onChange={(e) => handleChange("code", e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
            />

            <textarea
              placeholder="Notes"
              value={form.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
            />
          </div>

          {/* CONTACTS */}

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-red-400 font-semibold">Contacts</h3>

              <button
                onClick={addContact}
                className="bg-red-600 px-3 py-1 rounded text-sm"
              >
                + Add Contact
              </button>
            </div>

            {form.contacts.map((contact, index) => (
              <div
                key={index}
                className="grid grid-cols-2 gap-3 border border-gray-800 p-3 rounded"
              >
                <input
                  type="text"
                  placeholder="Contact Name"
                  value={contact.name}
                  onChange={(e) =>
                    handleContactChange(index, "name", e.target.value)
                  }
                  className="bg-gray-900 border border-gray-700 rounded px-3 py-2"
                />

                <input
                  type="email"
                  placeholder="Email"
                  value={contact.email}
                  onChange={(e) =>
                    handleContactChange(index, "email", e.target.value)
                  }
                  className="bg-gray-900 border border-gray-700 rounded px-3 py-2"
                />

                <input
                  type="text"
                  placeholder="Phone"
                  value={contact.phone}
                  onChange={(e) =>
                    handleContactChange(index, "phone", e.target.value)
                  }
                  className="bg-gray-900 border border-gray-700 rounded px-3 py-2"
                />

                <input
                  type="text"
                  placeholder="Designation"
                  value={contact.designation}
                  onChange={(e) =>
                    handleContactChange(index, "designation", e.target.value)
                  }
                  className="bg-gray-900 border border-gray-700 rounded px-3 py-2"
                />

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={contact.isPrimary}
                    onChange={(e) =>
                      handleContactChange(index, "isPrimary", e.target.checked)
                    }
                  />
                  Primary
                </label>

                <button
                  onClick={() => removeContact(index)}
                  className="text-red-500 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* ADDRESSES */}

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-red-400 font-semibold">Addresses</h3>

              <button
                onClick={addAddress}
                className="bg-red-600 px-3 py-1 rounded text-sm"
              >
                + Add Address
              </button>
            </div>

            {form.addresses.map((address, index) => (
              <div
                key={index}
                className="grid grid-cols-2 gap-3 border border-gray-800 p-3 rounded"
              >
                <select
                  value={address.type}
                  onChange={(e) =>
                    handleAddressChange(index, "type", e.target.value)
                  }
                  className="bg-gray-900 border border-gray-700 rounded px-3 py-2"
                >
                  <option>Office</option>
                  <option>Billing</option>
                  <option>Shipping</option>
                </select>

                <input
                  type="text"
                  placeholder="Address Line"
                  value={address.addressLine1}
                  onChange={(e) =>
                    handleAddressChange(index, "addressLine1", e.target.value)
                  }
                  className="bg-gray-900 border border-gray-700 rounded px-3 py-2"
                />

                <input
                  type="text"
                  placeholder="City"
                  value={address.city}
                  onChange={(e) =>
                    handleAddressChange(index, "city", e.target.value)
                  }
                  className="bg-gray-900 border border-gray-700 rounded px-3 py-2"
                />

                <input
                  type="text"
                  placeholder="Country"
                  value={address.country}
                  onChange={(e) =>
                    handleAddressChange(index, "country", e.target.value)
                  }
                  className="bg-gray-900 border border-gray-700 rounded px-3 py-2"
                />

                <button
                  onClick={() => removeAddress(index)}
                  className="text-red-500 text-sm col-span-2"
                >
                  Remove Address
                </button>
              </div>
            ))}
          </div>

          {/* BANK */}

          <div className="space-y-3">
            <h3 className="text-red-400 font-semibold">Bank Details</h3>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Account Title"
                value={form.bankDetails.accountTitle}
                onChange={(e) =>
                  handleBankChange("accountTitle", e.target.value)
                }
                className="bg-gray-900 border border-gray-700 rounded px-3 py-2"
              />

              <input
                type="text"
                placeholder="Account Number"
                value={form.bankDetails.accountNumber}
                onChange={(e) =>
                  handleBankChange("accountNumber", e.target.value)
                }
                className="bg-gray-900 border border-gray-700 rounded px-3 py-2"
              />

              <input
                type="text"
                placeholder="Bank Name"
                value={form.bankDetails.bankName}
                onChange={(e) => handleBankChange("bankName", e.target.value)}
                className="bg-gray-900 border border-gray-700 rounded px-3 py-2"
              />

              <input
                type="text"
                placeholder="IBAN"
                value={form.bankDetails.iban}
                onChange={(e) => handleBankChange("iban", e.target.value)}
                className="bg-gray-900 border border-gray-700 rounded px-3 py-2"
              />

              <input
                type="text"
                placeholder="Branch"
                value={form.bankDetails.branch}
                onChange={(e) => handleBankChange("branch", e.target.value)}
                className="bg-gray-900 border border-gray-700 rounded px-3 py-2"
              />
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>

        {/* Footer */}

        <div className="flex justify-end gap-3 px-5 py-4 border-t border-gray-800">
          <button onClick={onClose} className="bg-gray-700 px-4 py-2 rounded">
            Cancel
          </button>

          <button
            onClick={handleUpdate}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
          >
            {loading ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditVendorModal;
