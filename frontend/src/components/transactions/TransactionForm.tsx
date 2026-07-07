import React, { useState, useEffect } from "react";
import { useTransactionStore } from "../../store/transactionStore";
import type { TransactionType, CreateTransactionData } from "../../types";

// ==================== Types ====================

interface TransactionFormProps {
  groupId: string;
  onSuccess: () => void;
  onCancel: () => void;
  editData?: any;
}

// ==================== Constants ====================

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

// ==================== TransactionForm Component ====================

const TransactionForm: React.FC<TransactionFormProps> = ({
  groupId,
  onSuccess,
  onCancel,
  editData,
}) => {
  const { createTransaction, updateTransaction } = useTransactionStore();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ✅ Form state
  const [formData, setFormData] = useState({
    amount: "",
    type: "credit" as TransactionType,
    category: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
    groupId: groupId,
  });

  // ✅ Populate form when editing
  useEffect(() => {
    if (editData) {
      setFormData({
        amount: editData.amount?.toString() || "",
        type: editData.type || "credit",
        category: editData.category || "",
        description: editData.description || "",
        date: editData.date
          ? new Date(editData.date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        notes: editData.notes || "",
        groupId: groupId,
      });
    }
  }, [editData, groupId]);

  // ✅ Get categories based on transaction type
  const categories =
    formData.type === "credit" ? CREDIT_CATEGORIES : DEBIT_CATEGORIES;

  // ✅ Handle input change
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // ✅ Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }

    if (!formData.category) {
      newErrors.category = "Please select a category";
    }

    if (!formData.description || formData.description.trim().length < 2) {
      newErrors.description = "Description must be at least 2 characters";
    }

    if (!formData.date) {
      newErrors.date = "Please select a date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const data: CreateTransactionData = {
        amount: parseFloat(formData.amount),
        type: formData.type,
        category: formData.category,
        description: formData.description.trim(),
        date: new Date(formData.date).toISOString(),
        notes: formData.notes.trim() || "",
        groupId: groupId,
      };

      if (editData) {
        await updateTransaction(editData.id, data);
      } else {
        await createTransaction(data);
      }

      onSuccess();
    } catch (error: any) {
      console.error("❌ Transaction error:", error);
      setErrors({
        submit:
          error.message || "Failed to save transaction. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="transaction-form">
      {/* Transaction Type */}
      <div className="form-group">
        <label>
          Transaction Type <span className="required">*</span>
        </label>
        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          required
        >
          <option value="credit">💰 Income (Credit)</option>
          <option value="debit">💳 Expense (Debit)</option>
        </select>
      </div>

      {/* Amount */}
      <div className="form-group">
        <label>
          Amount <span className="required">*</span>
        </label>
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          placeholder="Enter amount (e.g., 500)"
          min="0.01"
          step="0.01"
          required
          className={errors.amount ? "error" : ""}
        />
        {errors.amount && (
          <span className="error-message">{errors.amount}</span>
        )}
      </div>

      {/* Category */}
      <div className="form-group">
        <label>
          Category <span className="required">*</span>
        </label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
          className={errors.category ? "error" : ""}
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {errors.category && (
          <span className="error-message">{errors.category}</span>
        )}
      </div>

      {/* Description */}
      <div className="form-group">
        <label>
          Description <span className="required">*</span>
        </label>
        <input
          type="text"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Brief description (e.g., Monthly salary)"
          required
          minLength={2}
          maxLength={100}
          className={errors.description ? "error" : ""}
        />
        {errors.description && (
          <span className="error-message">{errors.description}</span>
        )}
      </div>

      {/* Date */}
      <div className="form-group">
        <label>Date</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className={errors.date ? "error" : ""}
        />
        {errors.date && <span className="error-message">{errors.date}</span>}
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

      {/* Submit Error */}
      {errors.submit && (
        <div className="error-message" style={{ marginBottom: "12px" }}>
          {errors.submit}
        </div>
      )}

      {/* Buttons */}
      <div className="form-btns">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading
            ? "Saving..."
            : editData
              ? "Update Transaction"
              : "Add Transaction"}
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;
