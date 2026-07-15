import React, { useState, useMemo } from "react";
import type { Transaction, TransactionType } from "../../types";

// ==================== Types ====================

interface TransactionListProps {
  transactions: Transaction[];
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (id: string) => void;
}

// ==================== TransactionList Component ====================

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onEdit,
  onDelete,
}) => {
  const [filter, setFilter] = useState<"all" | TransactionType>("all");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // ✅ Filter and sort transactions
  const filteredAndSortedTransactions = useMemo(() => {
    // Filter
    let filtered = transactions.filter(
      (t) => filter === "all" || t.type === filter,
    );

    // Sort
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === "date") {
        return sortOrder === "desc"
          ? new Date(b.date).getTime() - new Date(a.date).getTime()
          : new Date(a.date).getTime() - new Date(b.date).getTime();
      } else {
        return sortOrder === "desc" ? b.amount - a.amount : a.amount - b.amount;
      }
    });

    return filtered;
  }, [transactions, filter, sortBy, sortOrder]);

  // ✅ Format date
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // ✅ Handle sort change
  const handleSortChange = (field: "date" | "amount") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  // ✅ Get count by type
  const incomeCount = transactions.filter((t) => t.type === "credit").length;
  const expenseCount = transactions.filter((t) => t.type === "debit").length;

  // ✅ If no transactions
  if (transactions.length === 0) {
    return (
      <div className="empty-transaction">
        <p>No transactions yet.</p>
      </div>
    );
  }

  return (
    <div className="transaction-lists">
      {/* Filter and Sort Controls */}
      <div className="transaction-controls">
        <div className="transaction-filter-btns">
          <button
            onClick={() => setFilter("all")}
            className={`btn ${filter === "all" ? "active" : ""}`}
          >
            All ({transactions.length})
          </button>
          <button
            onClick={() => setFilter("credit")}
            className={`btn ${filter === "credit" ? "active" : ""} `}
          >
            Income ({incomeCount})
          </button>
          <button
            onClick={() => setFilter("debit")}
            className={`btn ${filter === "debit" ? "active" : ""} `}
          >
            Expense ({expenseCount})
          </button>
        </div>

        <div className="transaction-sort-controls">
          <span className="sort-label">Sort by:</span>
          <button
            onClick={() => handleSortChange("date")}
            className={`btn btn-secondary btn-sm ${sortBy === "date" ? "active" : ""}`}
          >
            Date {sortBy === "date" && (sortOrder === "desc" ? "↓" : "↑")}
          </button>
          <button
            onClick={() => handleSortChange("amount")}
            className={`btn btn-secondary btn-sm ${sortBy === "amount" ? "active" : ""}`}
          >
            Amount {sortBy === "amount" && (sortOrder === "desc" ? "↓" : "↑")}
          </button>
        </div>
      </div>

      {/* Transaction List */}
      <div className="transaction-items">
        {filteredAndSortedTransactions.map((transaction) => (
          <div key={transaction.id} className="transaction-history-card">
            <div className="transaction-details">
              {/* Category Badge */}
              <div className="category">
                <span>{transaction.category}</span>
                <span
                  className={`transaction-type ${transaction.type === "credit" ? "income" : "expense"}`}
                >
                  {transaction.type === "credit" ? "Income" : "Expense"}
                </span>
              </div>

              {/* Description */}
              <p>{transaction.description}</p>

              {/* Notes */}
              {transaction.notes && <p>{transaction.notes}</p>}

              {/* Date */}
              <p className="time">{formatDate(transaction.date)}</p>
            </div>

            <div className="transaction-amount">
              {/* Amount */}
              <p>
                {transaction.type === "credit" ? "+" : "-"}₹
                {transaction.amount.toFixed(2)}
              </p>

              {/* Action Buttons */}
              {onEdit && onDelete && (
                <div className="transaction-btns">
                  <button onClick={() => onEdit(transaction)}>Edit</button>
                  <button
                    onClick={() => {
                      onDelete(transaction.id);
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty state for filtered results */}
      {filteredAndSortedTransactions.length === 0 && (
        <div className="empty-transaction">
          <p>No {filter !== "all" ? filter : ""} transactions found.</p>
        </div>
      )}
    </div>
  );
};

export default TransactionList;
