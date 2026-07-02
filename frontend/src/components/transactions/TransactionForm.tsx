import React, { useState } from "react";
import { useTransactionStore } from "../../store/transactionStore";

interface TransactionFormProps {
  groupId: string;
  onSuccess: () => void;
  onCancel: () => void;
  editData?: any;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  groupId,
  onSuccess,
  onCancel,
  editData,
}) => {
  const { createTransaction, updateTransaction } = useTransactionStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: editData?.amount || "",
    type: editData?.type || "credit",
    category: editData?.category || "",
    description: editData?.description || "",
    date: editData?.date
      ? new Date(editData.date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    notes: editData?.notes || "",
    groupId: groupId,
  });

  const creditCategories = [
    "Salary",
    "Bonus",
    "Investment",
    "Gift",
    "Other Income",
  ];

  const debitCategories = [
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
  ];

  const categories =
    formData.type === "credit" ? creditCategories : debitCategories;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        amount: parseFloat(formData.amount as any),
        date: new Date(formData.date),
      };

      if (editData) {
        await updateTransaction(editData.id, data);
      } else {
        await createTransaction(data);
      }

      onSuccess();
    } catch (error) {
      alert("Failed to save transaction. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
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
        />
      </div>

      <div className="form-group">
        <label>Date</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Notes</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Additional notes (optional)"
          rows={3}
        />
      </div>

      <div className="form-btns">
        <button type="button" className="btn btn-custom" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Saving..." : editData ? "Update" : "Add Transaction"}
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;
