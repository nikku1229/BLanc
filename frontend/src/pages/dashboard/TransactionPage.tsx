import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGroupStore } from "../../store/groupStore";
import { useTransactionStore } from "../../store/transactionStore";
import TransactionList from "../../components/transactions/TransactionList";
import TransactionForm from "../../components/transactions/TransactionForm";
import ErrorPage from "../common/ErrorPage";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { isNegative, formatBalance } from "../../utils/formatAmount";
import EditTransactionModal from "../../components/transactions/EditTransactionModal";
import type { Transaction } from "../../types";

// ==================== TransactionPage Component ====================

const TransactionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // ✅ Pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [showAddTransaction, setShowAddTransaction] = useState(false);

  const {
    currentGroup,
    fetchGroupById,
    loading: groupLoading,
  } = useGroupStore();

  const {
    transactions,
    fetchTransactionsByGroup,
    deleteTransaction,
    loading: transLoading,
    clearError,
    totalPages,
    totalTransactions,
    currentPage,
    totalIncome,
    totalExpenses,
    totalCount,
  } = useTransactionStore();

  // ✅ Fetch data on mount or page change
  useEffect(() => {
    if (id) {
      fetchGroupById(id);
      fetchTransactionsByGroup(id, page, limit);
    }
  }, [id, page]);

  // ✅ Cleanup on unmount
  useEffect(() => {
    return () => clearError();
  }, []);

  // ✅ Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  // ✅ Handle delete transaction
  const handleDeleteTransaction = async (transactionId: string) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        await deleteTransaction(transactionId);
        if (id) {
          fetchGroupById(id);
          fetchTransactionsByGroup(id, page, limit);
        }
      } catch (error) {
        console.error("❌ Delete transaction error:", error);
      }
    }
  };

  // ✅ Handle edit transaction
  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowEditModal(true);
  };

  // ✅ Handle edit success
  const handleEditSuccess = () => {
    if (id) {
      fetchGroupById(id);
      fetchTransactionsByGroup(id, page, limit);
    }
  };

  // ✅ Show loading
  if (groupLoading) {
    return <LoadingSpinner message="Loading group details..." />;
  }

  // ✅ Show error if group not found
  if (!currentGroup) {
    return <ErrorPage statusCode={404} message="Group not found" />;
  }

  // ✅ Pagination controls
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    // Previous button
    pages.push(
      <button
        key="prev"
        className="btn primary-btn"
        onClick={() => handlePageChange(page - 1)}
        disabled={page === 1}
      >
        ←
      </button>,
    );

    // First page
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          className="btn btn-primary"
          onClick={() => handlePageChange(1)}
        >
          1
        </button>,
      );
      if (startPage > 2) {
        pages.push(
          <span key="dots1" className="pagination-dots">
            ...
          </span>,
        );
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`btn ${i === page ? "btn-primary" : "btn-secondary"} btn-sm`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>,
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="dots2" className="pagination-dots">
            ...
          </span>,
        );
      }
      pages.push(
        <button
          key={totalPages}
          className="btn btn-secondary btn-sm"
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </button>,
      );
    }

    // Next button
    pages.push(
      <button
        key="next"
        className="btn btn-secondary btn-sm"
        onClick={() => handlePageChange(page + 1)}
        disabled={page === totalPages}
      >
        →
      </button>,
    );

    return <div className="pagination-controls">{pages}</div>;
  };

  return (
    <div className="transactions-container container">
      {/* Header */}
      <div className="transactions-header">
        <div className="group-details">
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => navigate("/dashboard")}
          >
            ← Back to Dashboard
          </button>
          <h1>{currentGroup.name}</h1>
          <span className="group-type-badge">
            {currentGroup.type?.toUpperCase() || "GROUP"}
          </span>
          {currentGroup.description && (
            <p className="group-description">{currentGroup.description}</p>
          )}
        </div>
        <div className="amount-details">
          <h2
            className={
              isNegative(currentGroup.balance) ? "negative" : "positive"
            }
          >
            {formatBalance(currentGroup.balance || 0)}
          </h2>
          <p>Available Balance</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="transactions-stats-cards">
        <div className="stat-card">
          <p className="stat-label">Total Income</p>
          <h2 className="stat-value positive">₹{totalIncome.toFixed(2)}</h2>
        </div>
        <div className="stat-card">
          <p className="stat-label">Total Expenses</p>
          <h2 className="stat-value negative">₹{totalExpenses.toFixed(2)}</h2>
        </div>
        <div className="stat-card">
          <p className="stat-label">Total Transactions</p>
          <h2 className="stat-value">{totalCount}</h2>
        </div>
      </div>

      {/* Transactions Section */}
      <div className="transaction-history">
        <div className="transaction-history-header">
          <h3>Transaction History</h3>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowAddTransaction(true)}
          >
            + Add Transaction
          </button>
        </div>

        {/* Transactions List */}
        {transLoading ? (
          <LoadingSpinner message="Loading transactions..." />
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
          <>
            <TransactionList
              transactions={transactions}
              onEdit={handleEditTransaction}
              onDelete={handleDeleteTransaction}
            />

            {transactions.length && (
              <div className="pagination-container">
                <div className="pagination-info">
                  Showing {transactions.length} of {totalTransactions}{" "}
                  transactions (Page {currentPage} of {totalPages})
                </div>
                {renderPagination()}
              </div>
            )}
          </>
        )}
      </div>

      {/* ✅ Edit Transaction Modal */}
      {showEditModal && editingTransaction && (
        <EditTransactionModal
          transaction={editingTransaction}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingTransaction(null);
          }}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Add Transaction Modal */}
      {showAddTransaction && (
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
                  fetchTransactionsByGroup(id, page, limit);
                }
              }}
              onCancel={() => setShowAddTransaction(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionPage;
