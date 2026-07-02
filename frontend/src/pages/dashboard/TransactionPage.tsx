import React, { useEffect, useState, Activity } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGroupStore } from "../../store/groupStore";
import { useTransactionStore } from "../../store/transactionStore";
import TransactionList from "../../components/transactions/TransactionList";
import TransactionForm from "../../components/transactions/TransactionForm";
import ErrorPage from "../common/ErrorPage";

const TransactionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentGroup, fetchGroupById } = useGroupStore();
  const {
    transactions,
    fetchTransactionsByGroup,
    loading: transLoading,
  } = useTransactionStore();
  const [showAddTransaction, setShowAddTransaction] = useState(false);

  useEffect(() => {
    if (id) {
      fetchGroupById(id);
      fetchTransactionsByGroup(id);
    }
  }, [id]);

  const isNegative = (amount: any) => {
    if (Number(amount) < 0) return true;
    return false;
  };

  if (!currentGroup) {
    return <ErrorPage statusCode={404} message="Group not found" />;
  }

  return (
    <div className="transactions-container container">
      <div className="transactions-header">
        <div className="group-details">
          <button className="btn-custom" onClick={() => navigate("/dashboard")}>
            ← Back to Dashboard
          </button>
          <h1>{currentGroup.name}</h1>
          <span>{currentGroup.type?.toUpperCase() || "Group"}</span>
          {currentGroup.description && <p>{currentGroup.description}</p>}
        </div>
        <div className="amount-details">
          <h2>
            {isNegative(currentGroup.balance?.toFixed(2))
              ? `-₹${Number(currentGroup.balance?.toFixed(2)) * -1}`
              : currentGroup.balance?.toFixed(2) || "0.00"}
          </h2>
          <p>Available Balance</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="transactions-stats-cards">
        <div className="stat-card">
          <p>Total Income</p>
          <h2>
            ₹
            {transactions
              .filter((t) => t.type === "credit")
              .reduce((sum, t) => sum + t.amount, 0)
              .toFixed(2)}
          </h2>
        </div>
        <div className="stat-card">
          <p>Total Expenses</p>
          <h2>
            ₹
            {transactions
              .filter((t) => t.type === "debit")
              .reduce((sum, t) => sum + t.amount, 0)
              .toFixed(2)}
          </h2>
        </div>
        <div className="stat-card">
          <p>Total Transactions</p>
          <h2>{transactions.length}</h2>
        </div>
      </div>

      {/* Transactions */}
      <div className="transaction-history">
        <div className="transaction-history-header">
          <h3>Transaction History</h3>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowAddTransaction(true)}
          >
            + Add
          </button>
        </div>
        {transLoading ? (
          <div className="loading">
            <div className="spinner" />
            <p>Loading transactions details...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="empty-transaction">
            <p>No transactions yet.</p>
            <button
              className="btn btn-primary"
              onClick={() => setShowAddTransaction(true)}
            >
              Add Your First Transaction
            </button>
          </div>
        ) : (
          <TransactionList
            transactions={transactions}
            onEdit={() => {
              alert("Edit functionality coming soon!");
            }}
            onDelete={async (id) => {
              if (
                window.confirm(
                  "Are you sure you want to delete this transaction?",
                )
              ) {
                await useTransactionStore.getState().deleteTransaction(id);
              }
            }}
          />
        )}
      </div>

      {/* Add Transaction Modal */}
      <Activity mode={showAddTransaction ? "visible" : "hidden"}>
        <div
          className="modal-container"
          onClick={() => setShowAddTransaction(false)}
        >
          <div className="group-form" onClick={(e) => e.stopPropagation()}>
            <h2>Add Transaction</h2>
            <TransactionForm
              groupId={id!}
              onSuccess={() => {
                setShowAddTransaction(false);
                if (id) {
                  fetchGroupById(id);
                  fetchTransactionsByGroup(id);
                }
              }}
              onCancel={() => setShowAddTransaction(false)}
            />
          </div>
        </div>
      </Activity>
    </div>
  );
};

export default TransactionPage;
