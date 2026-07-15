import React, { useState, useEffect } from "react";
import { useTransactionStore } from "../../store/transactionStore";
import type { Transaction, TransactionType } from "../../types";

interface EditTransactionModalProps {
  transaction: Transaction;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// ✅ Constants for categories
const CREDIT_CATEGORIES = [
  "Salary",
  "Bonus",
  "Investment",
  "Gift",
  "Other Income",
] as const;

const DEBIT_CATEGORIES = [
  "Food",
  "Shopping",
  "Bills",
  "Travel",
  "Entertainment",
  "Medical",
  "Rent",
  "Utilities",
  "Insurance",
  "Education",
  "Other Expense",
] as const;

const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
  transaction,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { updateTransaction } = useTransactionStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    amount: "",
    type: "credit" as TransactionType,
    category: "",
    description: "",
    date: "",
    notes: "",
  });

  // ✅ Populate form when transaction changes
  useEffect(() => {
    if (transaction) {
      setFormData({
        amount: transaction.amount?.toString() || "",
        type: transaction.type || "credit",
        category: transaction.category || "",
        description: transaction.description || "",
        date: transaction.date
          ? new Date(transaction.date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        notes: transaction.notes || "",
      });
    }
  }, [transaction]);

  // ✅ Get categories based on transaction type
  const categories =
    formData.type === "credit" ? CREDIT_CATEGORIES : DEBIT_CATEGORIES;

  // ✅ Handle input change
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  // ✅ Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // ✅ Validate amount
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError("Amount must be greater than 0");
      setLoading(false);
      return;
    }

    // ✅ Validate category
    if (!formData.category) {
      setError("Please select a category");
      setLoading(false);
      return;
    }

    // ✅ Validate description
    if (!formData.description || formData.description.trim().length < 2) {
      setError("Description must be at least 2 characters");
      setLoading(false);
      return;
    }

    try {
      // ✅ Send ALL fields
      await updateTransaction(transaction.id, {
        amount: parseFloat(formData.amount),
        type: formData.type,
        category: formData.category,
        description: formData.description.trim(),
        date: new Date(formData.date).toISOString(),
        notes: formData.notes?.trim() || "",
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update transaction");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-container" onClick={onClose}>
      <div className="group-form" onClick={(e) => e.stopPropagation()}>
        <div>
          <h2>Edit Transaction</h2>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Transaction Type */}
          <div className="form-group">
            <label>
              Transaction Type <span className="label-required">*</span>
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="credit">Income (Credit)</option>
              <option value="debit">Expense (Debit)</option>
            </select>
          </div>

          {/* Amount */}
          <div className="form-group">
            <label>
              Amount <span className="label-required">*</span>
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="Enter amount"
              min="0.01"
              step="0.01"
              required
            />
          </div>

          {/* Category */}
          <div className="form-group">
            <label>
              Category <span className="label-required">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="form-group">
            <label>
              Description <span className="label-required">*</span>
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description"
              required
              minLength={2}
              maxLength={100}
            />
          </div>

          {/* Date */}
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
            />
          </div>

          {/* Notes */}
          <div className="form-group">
            <label>Notes (Optional)</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Additional notes"
              rows={3}
              maxLength={500}
            />
          </div>

          {/* Buttons */}
          <div className="form-btns">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTransactionModal;
