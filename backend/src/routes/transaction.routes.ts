import express from "express";
import {
  createTransaction,
  getTransactionsByGroup,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getTransactionSummary,
} from "../controllers/transaction.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = express.Router();

// ==================== All routes are protected ====================
router.use(authenticate);

// ==================== Transaction Routes ====================
// POST /api/transactions - Create a transaction
router.post("/", createTransaction);

// GET /api/transactions/summary/:groupId - Get transaction summary
router.get("/summary/:groupId", getTransactionSummary);

// GET /api/transactions/group/:groupId - Get all transactions for a group
router.get("/group/:groupId", getTransactionsByGroup);

// GET /api/transactions/:id - Get single transaction
// PUT /api/transactions/:id - Update transaction
// DELETE /api/transactions/:id - Delete transaction
router
  .route("/:id")
  .get(getTransactionById)
  .put(updateTransaction)
  .delete(deleteTransaction);

export default router;
