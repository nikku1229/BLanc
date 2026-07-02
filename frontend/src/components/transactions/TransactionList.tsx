import React, { useState } from "react";
import type { Transaction } from "../../types";

interface TransactionListProps {
  transactions: Transaction[];
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (id: string) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onEdit,
  onDelete,
}) => {
  const [filter, setFilter] = useState<"all" | "credit" | "debit">("all");

  const filteredTransactions = transactions.filter(
    (t) => filter === "all" || t.type === filter,
  );

  return (
    <div className="transaction-lists">
      <div className="transaction-filter-btns">
        <button
          onClick={() => setFilter("all")}
          className={`btn ${filter === "all" ? "active" : ""}`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("credit")}
          className={`btn ${filter === "credit" ? "active" : ""}`}
        >
          Income
        </button>
        <button
          onClick={() => setFilter("debit")}
          className={`btn ${filter === "debit" ? "active" : ""}`}
        >
          Expense
        </button>
      </div>

      {filteredTransactions.map((transaction) => (
        <div key={transaction.id} className="transaction-history-card">
          <div className="transaction-details">
            <div className="category">
              <span>{transaction.category}</span>
              <span
                className={`${transaction.type === "credit" ? "income" : "expense"}`}
              >
                {transaction.type === "credit" ? "Income" : "Expense"}
              </span>
            </div>
            <p>{transaction.description}</p>
            {transaction.notes && <p>{transaction.notes}</p>}
            <p className="time">
              {new Date(transaction.date).toLocaleDateString()}
            </p>
          </div>
          <div className="transaction-amount">
            <p>
              {transaction.type === "credit" ? "+" : "-"}₹
              {transaction.amount.toFixed(2)}
            </p>
            {onEdit && onDelete && (
              <div className="transaction-btns">
                <button onClick={() => onEdit(transaction)}>Edit</button>
                <button onClick={() => onDelete(transaction.id)}>Delete</button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TransactionList;
